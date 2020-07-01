import _ from 'lodash';
import i18next from 'i18next';

import encrypt from '../lib/secure';
import User from '../entity/User';

export default (app) => {
  app
    .get('/session/new', { name: 'newSession' }, (_req, reply) => {
      const signInForm = {};
      reply.render('session/new', { signInForm });
      return reply;
    })
    .post('/session', { name: 'session' }, async (req, reply) => {
      const { email, password } = req.body.object;

      const errors = [];
      const user = await User.findOne({ email });
      const passwordDigest = _.get(user, 'passwordDigest', '');

      if (!user) {
        const error = {
          property: 'email',
          constraints: {
            isExist: i18next.t('flash.users.validate.emailNotFound'),
          },
        };

        errors.push(error);
      }

      if (passwordDigest !== encrypt(password)) {
        const error = {
          property: 'password',
          constraints: {
            wrongPassword: i18next.t('flash.users.validate.wrongPassword'),
          },
        };

        errors.push(error);
      }

      if (!_.isEmpty(errors)) {
        app.log.warn(errors);
        req.flash('error', i18next.t('flash.session.create.error'));
        reply.render('session/new', { signInForm: { email, password: '' }, errors });
        return reply;
      }

      req.session.set('userId', user.id);
      req.flash('info', i18next.t('flash.session.create.success'));
      return reply.redirect(app.reverse('root'));
    })
    .delete('/session', (req, reply) => {
      req.session.set('userId', null);
      req.flash('info', i18next.t('flash.session.delete.success'));
      return reply.redirect(app.reverse('root'));
    });
};
