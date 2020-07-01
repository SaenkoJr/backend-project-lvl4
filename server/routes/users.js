import i18next from 'i18next';
import { validate } from 'class-validator';
import _ from 'lodash';

import encrypt from '../lib/secure';
import requiredAuth from '../middlewares/requiredAuth';
import User from '../entity/User';

export default (app) => {
  app
    .get('/users', { name: 'users', preHandler: requiredAuth(app) }, async (_req, reply) => {
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
      user.repeatedPassword = req.body.user.repeatedPassword;
      user.passwordDigest = encrypt(user.password);

      const errors = await validate(user, { groups: ['registration'] });
      if (!_.isEmpty(errors)) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.code(422).render('users/new', { user, errors });
        return reply;
      }

      await user.save();
      req.flash('info', i18next.t('flash.users.create.success'));
      return reply.redirect(app.reverse('root'));
    })
    .get('/account/settings', { name: 'settings', preHandler: requiredAuth(app) }, async (req, reply) => {
      const user = await User.findOne(req.currentUser.id);
      reply.render('users/settings', { user });
      return reply;
    })
    .get('/account/security', { name: 'security', preHandler: requiredAuth(app) }, async (req, reply) => {
      const user = await User.findOne(req.currentUser.id);
      reply.render('users/security', { user });
      return reply;
    })
    .patch('/account/settings', { name: 'updateUser', preHandler: requiredAuth(app) }, async (req, reply) => {
      const { id } = req.currentUser;
      const user = await User.findOne(id);
      const updatedUser = User.merge(user, req.body.user);

      const errors = await validate(updatedUser, { groups: ['update'] });
      if (!_.isEmpty(errors)) {
        req.flash('error', i18next.t('flash.users.update.error'));
        reply.code(422).render('users/settings', { user: updatedUser, errors });
        return reply;
      }

      await updatedUser.save();
      req.flash('info', i18next.t('flash.users.update.success'));
      reply.redirect(app.reverse('settings'));
      return reply;
    })
    .patch('/account/security', { name: 'updatePassword', preHandler: requiredAuth(app) }, async (req, reply) => {
      const { id } = req.currentUser;
      const user = await User.findOne(id);

      user.oldPassword = encrypt(req.body.user.oldPassword);
      user.password = req.body.user.password;
      user.repeatedPassword = req.body.user.repeatedPassword;

      const errors = await validate(user, { groups: ['security'] });
      if (!_.isEmpty(errors)) {
        user.oldPassword = '';
        user.password = '';
        user.repeatedPassword = '';

        req.flash('error', i18next.t('flash.users.update.error'));
        reply.code(422).render('users/security', { user, errors });
        return reply;
      }

      user.passwordDigest = encrypt(user.password);
      await user.save();

      req.flash('info', i18next.t('flash.users.update.success'));
      reply.redirect(app.reverse('security'));
      return reply;
    })
    .delete('/users/:id', { preHandler: requiredAuth(app) }, async (req, reply) => {
      const { id } = req.params;

      if (req.currentUser.id !== Number(id)) {
        reply.code(403);
        return 'Wrong user id';
      }

      const user = await User.findOne(id, { relations: ['createdTasks', 'assignedTasks'] });

      if (!_.isEmpty(user.assignedTasks)) {
        req.flash('error', i18next.t('flash.users.delete.hasAssignedTasks'));
        reply.redirect(app.reverse('settings'));
        return reply;
      }

      if (!_.isEmpty(user.createdTasks)) {
        req.flash('error', i18next.t('flash.users.delete.hasCreatedTasks'));
        reply.redirect(app.reverse('settings'));
        return reply;
      }

      await User.remove(user);

      req.session.set('userId', null);
      req.flash('info', i18next.t('flash.users.delete.success'));
      reply.redirect(app.reverse('root'));
      return reply;
    });
};
