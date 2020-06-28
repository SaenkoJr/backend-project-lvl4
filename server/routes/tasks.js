import i18next from 'i18next';
import { validate } from 'class-validator';
import _ from 'lodash';
import { Not } from 'typeorm';

import requiredAuth from '../middlewares/requiredAuth';
import Task from '../entity/Task';
import TaskStatus from '../entity/TaskStatus';
import User from '../entity/User';
import Tag from '../entity/Tag';

const parseTagsStr = (str = '') => str
  .split(',')
  .map((tag) => tag.trim())
  .filter((tag) => !_.isEmpty(tag));

const createTags = async (str) => {
  const tags = parseTagsStr(str);

  const promises = tags.map(async (tagName) => {
    const tag = await Tag.findOne({ name: tagName });
    return tag || Tag.create({ name: tagName });
  });

  return Promise.all(promises);
};

const buildFilterQuery = (query) => {
  const filters = {
    assignedToId: {
      validate: (id) => !_.isNull(id) && id !== 'all',
      clause: 'assignedTo.id = :assignedToId',
    },
    statusId: {
      validate: (id) => !_.isNull(id) && id !== 'all',
      clause: 'status.id = :statusId',
    },
    tagsIds: {
      validate: (ids) => !_.isNull(ids) && ids.length > 0,
      clause: 'tag.id IN (:...tagsIds)',
    },
  };

  return Object.entries(query)
    .filter(([name, value]) => filters[name].validate(value))
    .map(([name]) => filters[name].clause)
    .join(' AND ');
};

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', preHandler: requiredAuth(app) }, async (req, reply) => {
      const userId = req.session.get('userId');

      const { query } = req;
      const clauseStr = buildFilterQuery(query);

      const statuses = await TaskStatus.find();
      const tags = await Tag.find();
      const users = await User.find({ id: Not(userId) });
      const tasks = await Task
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.creator', 'creator')
        .leftJoinAndSelect('task.assignedTo', 'assignedTo')
        .leftJoinAndSelect('task.status', 'status')
        .leftJoinAndSelect('task.tags', 'tag')
        .where(clauseStr, query)
        .getMany();

      reply.render('tasks/index', {
        tasks,
        tags,
        statuses,
        users,
      });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preHandler: requiredAuth(app) }, async (_req, reply) => {
      const task = Task.create();
      const statuses = await TaskStatus.find();
      const users = await User.find();

      reply.render('tasks/new', { task, statuses, users });
      return reply;
    })
    .get('/tasks/:id/edit', { preHandler: requiredAuth(app) }, async (req, reply) => {
      const { id } = req.params;
      const task = await Task.findOne(id);
      const statuses = await TaskStatus.find();
      const users = await User.find();

      reply.render('tasks/edit', { task, statuses, users });
      return reply;
    })
    .post('/tasks', { prehandler: requiredAuth(app) }, async (req, reply) => {
      const userId = req.session.get('userId');

      const {
        name,
        description,
        statusId,
        assignedToId,
        tags: tagsStr,
      } = req.body.task;

      const task = Task.create({ name, description });

      const users = await User.find();
      const creator = await User.findOne(userId);
      const status = statusId ? await TaskStatus.findOne(statusId) : null;
      const assignedTo = assignedToId ? await User.findOne(assignedToId) : null;
      const tags = await createTags(tagsStr);

      task.status = status;
      task.assignedTo = assignedTo;
      task.creator = creator;
      task.tags = tags;

      const errors = await validate(task);
      if (!_.isEmpty(errors)) {
        const statuses = await TaskStatus.find();

        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.code(422).render('tasks/new', {
          task, statuses, users, errors,
        });
        return reply;
      }

      await task.save();
      req.flash('info', i18next.t('flash.tasks.create.success'));
      return reply.redirect(app.reverse('tasks'));
    })
    .patch('/tasks/:id', { prehandler: requiredAuth(app) }, async (req, reply) => {
      const { id } = req.params;
      const {
        name, description, assignedToId, statusId, tags: tagsStr,
      } = req.body.task;

      const task = await Task.findOne(id);
      const assignedTo = assignedToId ? await User.findOne(assignedToId) : null;
      const status = statusId ? await TaskStatus.findOne(statusId) : null;
      const tags = await createTags(tagsStr);

      task.name = name;
      task.description = description;
      task.assignedTo = assignedTo;
      task.status = status;
      task.tags = tags;

      const errors = await validate(task);
      if (!_.isEmpty(errors)) {
        const statuses = await TaskStatus.find();
        const users = await User.find();

        req.flash('error', i18next.t('flash.tasks.update.error'));
        reply.render('tasks/edit', {
          task, statuses, users, errors,
        });
        return reply;
      }

      await task.save();
      req.flash('info', i18next.t('flash.tasks.update.success'));
      return reply.redirect(app.reverse('tasks'));
    })
    .delete('/tasks/:id', { prehandler: requiredAuth(app) }, async (req, reply) => {
      const { id } = req.params;
      const task = await Task.findOne(id);

      await Task.remove(task);

      req.flash('info', i18next.t('flash.tasks.delete.success'));
      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
