import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint({
  id: 'mrdwc-rankings-2026',

  handler: (router, { services, exceptions, env, database, getSchema }) => {
    const { ItemsService } = services;
    const { ServiceUnavailableException } = exceptions;

    router.get('/', async (_req, res) => {
      res.json({ message: 'MRDWC Rankings 2026 endpoint is running' });
    });
  },
});
