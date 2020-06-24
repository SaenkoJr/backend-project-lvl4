import i18next from 'i18next';
import { validate } from 'class-validator';
import _ from 'lodash';
import { Not } from 'typeorm';
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
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const id = req.session.get('userId');

      if (!id) {
        req.flash('error', i18next.t('flash.tasks.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const { query } = req;
      const clauseStr = buildFilterQuery(query);

      const statuses = await TaskStatus.find();
      const tags = await Tag.find();
      const users = await User.find({ id: Not(id) });
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
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        req.flash('error', i18next.t('flash.tasks.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const task = Task.create();
      const statuses = await TaskStatus.find();
      const users = await User.find();

      reply.render('tasks/new', { task, statuses, users });
      return reply;
    })
    .get('/tasks/:id/edit', async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        req.flash('error', i18next.t('flash.tasks.access.denied'));
        return reply.redirect(app.reverse('root'));
      }

      const { id } = req.params;
      const task = await Task.findOne(id);
      const statuses = await TaskStatus.find();
      const users = await User.find();

      reply.render('tasks/edit', { task, statuses, users });
      return reply;
    })
    .post('/tasks', async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        return reply.code(403);
      }

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
      const status = await TaskStatus.findOne(statusId);
      const tags = await createTags(tagsStr);
      const assignedTo = await User.findOne(assignedToId);

      task.status = status;
      task.tags = tags;
      task.assignedTo = assignedTo;
      task.creator = creator;

      const errors = await validate(task);
      if (!_.isEmpty(errors)) {
        const statuses = await TaskStatus.find();

        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task, statuses, users, errors,
        });
        return reply;
      }

      await task.save();
      req.flash('info', i18next.t('flash.tasks.create.success'));
      return reply.redirect(app.reverse('tasks'));
    })
    .patch('/tasks/:id', async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        return reply.code(403);
      }

      const { id } = req.params;
      const { assignedToId, statusId } = req.body.task;

      const task = await Task.findOne(id);
      const assignedTo = await User.findOne(assignedToId);
      const status = await TaskStatus.findOne(statusId);

      const updatedTask = Task.merge(
        task,
        req.body.task,
        { assignedTo },
        { status },
      );

      const errors = await validate(updatedTask);
      if (!_.isEmpty(errors)) {
        const statuses = await TaskStatus.find();
        const users = await User.find();

        req.flash('error', i18next.t('flash.tasks.update.error'));
        reply.render('tasks/edit', {
          updatedTask, statuses, users, errors,
        });
        return reply;
      }

      await updatedTask.save();
      req.flash('info', i18next.t('flash.tasks.update.success'));
      return reply.redirect(app.reverse('tasks'));
    })
    .delete('/tasks/:id', async (req, reply) => {
      const userId = req.session.get('userId');

      if (!userId) {
        return reply.code(403);
      }

      const { id } = req.params;
      const task = await Task.findOne(id);

      await Task.remove(task);

      req.flash('info', i18next.t('flash.tasks.delete.success'));
      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
