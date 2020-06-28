import i18next from 'i18next';

export default (app) => async (req, reply) => {
  if (req.currentUser.isGuest) {
    req.flash('error', i18next.t('flash.users.access.denied'));
    reply.redirect(app.reverse('root'));
  }
};
