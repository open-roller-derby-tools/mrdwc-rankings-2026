export default {
  id: 'rankings',
  handler: (router, { services, database, getSchema, env }) => {
    router.get('/', async (_req, res) => {
      res.json({ message: 'MRDWC Rankings 2026 endpoint is running' });
    });
  },
};
