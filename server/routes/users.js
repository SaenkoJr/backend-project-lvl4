import i18next from 'i18next';
import { validate } from 'class-validator';
import _ from 'lodash';
import encrypt from '../lib/secure';
import User from '../entity/User';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        req.flash('error', i18next.t('flash.statuses.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

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
    .get('/account/settings', { name: 'settings' }, async (req, reply) => {
      if (req.currentUser.isGuest) {
        req.flash('error', i18next.t('flash.users.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const user = await User.findOne(req.currentUser.id);
      reply.render('users/settings', { user });
      return reply;
    })
    .get('/account/security', { name: 'security' }, async (req, reply) => {
      if (req.currentUser.isGuest) {
        req.flash('error', i18next.t('flash.users.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const user = await User.findOne(req.currentUser.id);
      reply.render('users/security', { user });
      return reply;
    })
    .patch('/account/settings', { name: 'updateUser' }, async (req, reply) => {
      const id = req.session.get('userId');

      if (!id) {
        req.flash('error', i18next.t('flash.users.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

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
    .patch('/account/security', { name: 'updatePassword' }, async (req, reply) => {
      const id = req.session.get('userId');

      if (!id) {
        req.flash('error', i18next.t('flash.users.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const user = await User.findOne(id);

      user.oldPassword = encrypt(req.body.user.oldPassword);
      user.password = req.body.user.password;
      user.repeatedPassword = req.body.user.repeatedPassword;

      const errors = await validate(user, { groups: ['security'] });
      if (!_.isEmpty(errors)) {
        user.oldPassword = req.body.user.oldPassword;

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
    .delete('/users/:id', async (req, reply) => {
      const { id } = req.params;
      const user = await User.findOne(id, { relations: ['createdTasks', 'assignedTasks'] });

      if (req.session.get('userId') !== Number(id)) {
        req.flash('error', i18next.t('flash.users.access.denied'));
        return reply.redirect(302, app.reverse('root'));
      }

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
