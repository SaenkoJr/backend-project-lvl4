import _ from 'lodash';
import i18next from 'i18next';
import { validate } from 'class-validator';

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
      const signInForm = req.body.object;

      const user = User.create(signInForm);
      user.password = signInForm.password;
      user.passwordDigest = encrypt(signInForm.password);

      const errors = await validate(user, { groups: ['signIn'] });

      if (!_.isEmpty(errors)) {
        req.flash('error', i18next.t('flash.session.create.error'));
        reply.render('session/new', { signInForm, errors });
        return reply;
      }

      const userFromDb = await User.findOne({ email: signInForm.email });
      req.session.set('userId', userFromDb.id);
      req.flash('info', i18next.t('flash.session.create.success'));
      return reply.redirect(app.reverse('root'));
    })
    .delete('/session', (req, reply) => {
      req.session.set('userId', null);
      req.flash('info', i18next.t('flash.session.delete.success'));
      return reply.redirect(app.reverse('root'));
    });
};
