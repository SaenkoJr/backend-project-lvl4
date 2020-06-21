import i18next from 'i18next';
import { validate } from 'class-validator';
import _ from 'lodash';
import encrypt from '../lib/secure';
import User from '../entity/User';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (_req, reply) => {
      const users = await User.find();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, async (_req, reply) => {
      const user = new User();
      reply.render('users/new', { user });
      return reply;
    })
    .post('/users', async (req, reply) => {
      const user = User.create(req.body.user);
      user.password = req.body.user.password;
      user.passwordDigest = encrypt(user.password);

      const errors = await validate(user);
      if (!_.isEmpty(errors)) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors });
        return reply;
      }

      try {
        await user.save();
        req.flash('info', i18next.t('flash.users.create.success'));
        return reply.redirect(app.reverse('root'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.create.emailIsTaken'));
        reply.code(400);
        reply.render('users/new', { user });
        return reply;
      }
    })
    .get('/users/settings', { name: 'settings' }, async (req, reply) => {
      if (req.currentUser.isGuest) {
        req.flash('error', i18next.t('flash.users.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const user = await User.findOne(req.currentUser.id);
      reply.render('users/settings', { user });
      return reply;
    })
    .patch('/users/settings', { name: 'updateUser' }, async (req, reply) => {
      const id = req.session.get('userId');

      if (!id) {
        req.flash('error', i18next.t('flash.users.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const user = await User.findOne(id);
      const updatedUser = User.merge(user, req.body.user);

      const errors = await validate(updatedUser);
      if (!_.isEmpty(errors)) {
        req.flash('error', i18next.t('flash.users.update.error'));
        reply.code(422).render('users/settings', { user: updatedUser, errors });
        return reply;
      }

      try {
        await updatedUser.save();
        req.flash('info', i18next.t('flash.users.update.success'));
        reply.redirect(app.reverse('settings'));
        return reply;
      } catch (e) {
        req.flash('error', i18next.t('flash.users.create.emailIsTaken'));
        reply.code(400);
        reply.render('users/settings', { user: updatedUser });
        return reply;
      }
    })
    .delete('/users/:id', async (req, reply) => {
      const { id } = req.params;
      const user = await User.findOne(id);

      if (req.session.get('userId') !== Number(id)) {
        req.flash('error', i18next.t('flash.users.access.denied'));
        return reply.redirect(302, app.reverse('root'));
      }

      await User.remove(user);

      req.session.set('userId', null);
      req.flash('info', i18next.t('flash.users.delete.success'));
      reply.redirect(app.reverse('root'));
      return reply;
    });
};
