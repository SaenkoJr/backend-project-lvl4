export default async (app) => {
  app.get('/', { name: 'root' }, (req, reply) => {
    if (req.currentUser.isGuest) {
      reply.render('welcome/index');
      return reply;
    }

    return reply.redirect(app.reverse('tasks'));
  });
};
