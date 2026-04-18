#!/usr/bin/env node

/**
 * Script para migrar conteúdo entre deployments do Strapi
 * Migra dados da instância antiga para a nova usando APIs REST
 *
 * Uso: node scripts/migrate.js <old_url> <old_token> <new_url> <new_token>
 *
 * Exemplo:
 * node scripts/migrate.js https://old-strapi.com token_old https://new-strapi.com token_new
 */

const https = require('https');

// Desabilita verificação de certificado SSL para desenvolvimento (remova em produção)
const agent = new https.Agent({
  rejectUnauthorized: false
});

async function fetchAPI(url, token, endpoint, method = 'GET', data = null) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const options = {
    method,
    headers,
    agent
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${url}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`Erro na API ${method} ${endpoint}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getContentTypes(url, token) {
  try {
    const data = await fetchAPI(url, token, '/api/content-manager/content-types');
    // Filtra apenas content types do usuário (não do sistema)
    return data.data.filter(ct => !ct.uid.startsWith('admin.') && !ct.uid.startsWith('plugin::'));
  } catch (error) {
    console.error('Erro ao obter content types:', error.message);
    return [];
  }
}

async function migrateContentType(oldUrl, oldToken, newUrl, newToken, contentType) {
  const { uid, kind } = contentType;
  const apiName = uid.replace('api::', '').replace('.', '/');

  console.log(`\n🔄 Migrando ${kind} type: ${apiName}`);

  try {
    // Busca todos os dados da instância antiga
    const endpoint = kind === 'collectionType' ? `/api/${apiName}?populate=*&pagination[limit]=-1` : `/api/${apiName}?populate=*`;
    const oldData = await fetchAPI(oldUrl, oldToken, endpoint);

    const entries = kind === 'collectionType' ? oldData.data : [oldData.data];

    if (entries.length === 0) {
      console.log(`⚠️  Nenhum dado encontrado para ${apiName}`);
      return;
    }

    console.log(`📊 Encontrados ${entries.length} registros`);

    // Cria na nova instância
    for (const entry of entries) {
      try {
        // Remove campos do sistema que não devem ser criados
        const { id, createdAt, updatedAt, publishedAt, ...cleanEntry } = entry;

        const createEndpoint = kind === 'collectionType' ? `/api/${apiName}` : `/api/${apiName}`;
        await fetchAPI(newUrl, newToken, createEndpoint, 'POST', cleanEntry);

        console.log(`✅ Criado: ${entry.id || 'single'}`);
      } catch (error) {
        console.error(`❌ Erro ao criar registro ${entry.id || 'single'}:`, error.message);
      }
    }

  } catch (error) {
    console.error(`❌ Erro ao migrar ${apiName}:`, error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 4) {
    console.log('Uso: node scripts/migrate.js <old_url> <old_token> <new_url> <new_token>');
    console.log('Exemplo: node scripts/migrate.js https://old-strapi.com token_old https://new-strapi.com token_new');
    process.exit(1);
  }

  const [oldUrl, oldToken, newUrl, newToken] = args;

  console.log('🚀 Iniciando migração de conteúdo...');
  console.log(`📤 Origem: ${oldUrl}`);
  console.log(`📥 Destino: ${newUrl}`);

  try {
    // Obtém lista de content types da instância antiga
    const contentTypes = await getContentTypes(oldUrl, oldToken);

    if (contentTypes.length === 0) {
      console.log('❌ Nenhum content type encontrado para migrar');
      return;
    }

    console.log(`📋 Content types encontrados: ${contentTypes.length}`);

    // Migra cada content type
    for (const contentType of contentTypes) {
      await migrateContentType(oldUrl, oldToken, newUrl, newToken, contentType);
    }

    console.log('\n🎉 Migração concluída!');

  } catch (error) {
    console.error('❌ Erro geral na migração:', error.message);
    process.exit(1);
  }
}

main();