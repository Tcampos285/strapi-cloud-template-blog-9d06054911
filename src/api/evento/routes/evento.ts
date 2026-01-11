/**
 * evento router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::evento.evento');


/*


import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::evento.evento", ({ strapi }) => ({
  async flat(ctx) {
    // opcional: podes aceitar query params (ex: limit, futureOnly, etc.)
    // mas para já vamos devolver tudo ordenado por data desc
    const entities = await strapi.entityService.findMany("api::evento.evento", {
      sort: { data: "desc" },
      fields: ["titulo", "subtitulo", "data", "localizacao"],
      populate: {
        imagem: {
          fields: ["url"],
        },
      },
      // ⚠️ por defeito o entityService não aplica a paginação REST (100)
      // mas se tiveres muitos, podes definir limit/offset (ver nota em baixo)
    });

    const baseUrl =
      strapi.config.get("server.url") ||
      `${ctx.request.protocol}://${ctx.request.host}`;

    const data = (entities || []).map((e: any) => {
      const imageUrl = e.imagem?.url ? `${baseUrl}${e.imagem.url}` : null;

      return {
        id: e.id,
        titulo: e.titulo,
        subtitulo: e.subtitulo,
        data: e.data,
        localizacao: e.localizacao,
        imagemUrl: imageUrl,
      };
    });

    ctx.body = { data };
  },
}));


*/