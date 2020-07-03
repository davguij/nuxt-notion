import fetch from 'node-fetch';

export default async function(context, inject) {
  const baseUrl = process.server
    ? `${
        context.req.connection && context.req.connection.encrypted
          ? 'https'
          : 'http'
      }://${context.req.headers.host}`
    : `${location.protocol}://${location.hostname}:${location.port}`;
  const notion = {
    index: async () => {
      const response = await fetch(`${baseUrl}/_notion/pages`);
      return response.json();
    },
    page: async pageId => {
      const response = await fetch(`${baseUrl}/_notion/page/${pageId}`);
      return response.json();
    },
  };

  inject('notion', notion);
  // For Nuxt <= 2.12, also add 👇
  context.$notion = notion;
}
