import i18next from 'i18next';
import { validate } from 'class-validator';
import _ from 'lodash';
import TaskStatus from '../entity/TaskStatus';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        req.flash('error', i18next.t('flash.statuses.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const statuses = await TaskStatus.find();
      reply.render('taskStatuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus' }, async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        req.flash('error', i18next.t('flash.statuses.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const status = TaskStatus.create();
      reply.render('taskStatuses/new', { status });
      return reply;
    })
    .get('/statuses/:id/edit', async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        req.flash('error', i18next.t('flash.statuses.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const { id } = req.params;
      const status = await TaskStatus.findOne(id);

      reply.render('taskStatuses/edit', { status });
      return reply;
    })
    .post('/statuses', async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        return reply.code(403).send();
      }

      const status = TaskStatus.create(req.body.taskstatus);

      const errors = await validate(status);
      if (!_.isEmpty(errors)) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.code(422).render('taskStatuses/new', { status, errors });
        return reply;
      }

      await status.save();
      req.flash('info', i18next.t('flash.statuses.create.success'));
      return reply.redirect(app.reverse('statuses'));
    })
    .patch('/statuses/:id', async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        return reply.code(403).send();
      }

      const { id } = req.params;

      const status = await TaskStatus.findOne(id);
      const updatedStatus = TaskStatus.merge(status, req.body.taskstatus);

      const errors = await validate(updatedStatus);
      if (!_.isEmpty(errors)) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.code(422).render('taskStatuses/edit', { status: updatedStatus, errors });
        return reply;
      }

      await updatedStatus.save();
      req.flash('info', i18next.t('flash.statuses.update.success'));
      return reply.redirect(app.reverse('statuses'));
    })
    .delete('/statuses/:id', async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        return reply.code(403).send();
      }

      const { id } = req.params;
      const status = await TaskStatus.findOne(id);

      await TaskStatus.remove(status);

      req.flash('info', i18next.t('flash.statuses.delete.success'));
      reply.redirect(app.reverse('statuses'));
      return reply;
    });
};
