export default async (app) => {
  app.get('/', { name: 'root' }, (_req, reply) => {
    reply.render('welcome/index');
    return reply;
  });
};
