#!/usr/bin/env node

/**
 * Script para exportar dados do Strapi
 * Este script utiliza o comando 'strapi export' para exportar todos os dados da aplicação
 * para um arquivo tar.gz que pode ser usado para importar em outro deployment.
 */

const { execSync } = require('child_process');
const path = require('path');

const exportFile = 'strapi-export.tar.gz';

try {
  console.log('Iniciando exportação dos dados...');

  // Executa o comando strapi export
  execSync(`strapi export --file ${exportFile}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..') // Assume que o script está em scripts/ e o projeto está no diretório pai
  });

  console.log(`✅ Exportação concluída com sucesso! Arquivo criado: ${exportFile}`);
  console.log('Para importar em outro deployment, use: strapi import --file strapi-export.tar.gz');

} catch (error) {
  console.error('❌ Erro durante a exportação:', error.message);
  process.exit(1);
}