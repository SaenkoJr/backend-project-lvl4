import faker from 'faker';

import app from '../server';
import Task from '../server/entity/Task';
import Tag from '../server/entity/Tag';
import TaskStatus from '../server/entity/TaskStatus';
import User from '../server/entity/User';

describe('Tasks', () => {
  let server;
  let sessisonCookie;

  beforeAll(() => {
    server = app();
  });

  beforeEach(async () => {
    const authEmail = faker.internet.email();
    const authPass = faker.internet.password();

    await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: authEmail,
          password: authPass,
          repeatedPassword: authPass,
        },
      },
    });

    const { cookies } = await server.inject({
      method: 'POST',
      url: '/session',
      body: {
        object: {
          email: authEmail,
          password: authPass,
        },
      },
    });

    sessisonCookie = cookies[0].value;
  });

  it('GET /tasks 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
    });

    expect(res.statusCode).toBe(200);
  });

  it('GET /tasks/new 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/tasks/new',
      cookies: {
        session: sessisonCookie,
      },
    });

    expect(res.statusCode).toBe(200);
  });

  it('POST /tasks 302', async () => {
    const title = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: 'new' },
      },
    });

    const status = await TaskStatus.findOne({ name: 'new' });
    const statusId = TaskStatus.getId(status);

    const res = await server.inject({
      method: 'POST',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: title,
          statusId,
          description: '',
          assignedToId: '',
          tags: '',
        },
      },
    });

    const tasksCount = await Task.count();

    expect(res.statusCode).toBe(302);
    expect(tasksCount).toBe(1);
  });

  it('POST /tasks with tags 302', async () => {
    const title = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: 'new' },
      },
    });

    const status = await TaskStatus.findOne({ name: 'new' });
    const statusId = TaskStatus.getId(status);

    const res = await server.inject({
      method: 'POST',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: title,
          description: '',
          assignedToId: '',
          statusId,
          tags: 'tag1, tag2',
        },
      },
    });

    const task = await Task.findOne();
    const tasksCount = await Task.count();

    expect(res.statusCode).toBe(302);
    expect(tasksCount).toBe(1);
    expect(task.tags).toHaveLength(2);
  });

  it('POST /tasks with tags 422. Create task with empty fields', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: '',
          description: '',
          assignedToId: null,
          statusId: null,
          tags: '',
        },
      },
    });

    const tasksCount = await Task.count();

    expect(res.statusCode).toBe(422);
    expect(tasksCount).toBe(0);
  });

  it('PATCH /tasks/:id 302', async () => {
    const title = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: 'new' },
      },
    });

    const status = await TaskStatus.findOne({ name: 'new' });
    const statusId = TaskStatus.getId(status);

    await server.inject({
      method: 'POST',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: title,
          description: '',
          assignedToId: '',
          statusId,
          tags: 'tag1, tag2',
        },
      },
    });

    const task = await Task.findOne();
    const taskId = Task.getId(task);

    const res = await server.inject({
      method: 'PATCH',
      url: `/tasks/${taskId}`,
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: faker.name.title(),
          description: '',
          assignedToId: '',
          statusId,
          tags: 'tag1, tag2',
        },
      },
    });

    const updatedTask = await Task.findOne(taskId);

    expect(res.statusCode).toBe(302);
    expect(updatedTask.name).not.toBe(title);
  });

  it('PATCH /tasks/:id 302. Update tags', async () => {
    const title = faker.name.title();
    const tags = 'tag1, tag2';

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: 'new' },
      },
    });

    const status = await TaskStatus.findOne({ name: 'new' });
    const statusId = TaskStatus.getId(status);

    await server.inject({
      method: 'POST',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: title,
          description: '',
          assignedToId: '',
          statusId,
          tags,
        },
      },
    });

    const task = await Task.findOne();
    const taskId = Task.getId(task);

    const res = await server.inject({
      method: 'PATCH',
      url: `/tasks/${taskId}`,
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: faker.name.title(),
          description: '',
          assignedToId: '',
          statusId,
          tags: 'tag1, tag2, tag3',
        },
      },
    });

    const updatedTask = await Task.findOne(taskId);

    expect(res.statusCode).toBe(302);
    expect(updatedTask.tags).not.toEqual(tags);
  });

  it('DELETE /tasks/:id 302', async () => {
    const title = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: 'new' },
      },
    });

    const status = await TaskStatus.findOne({ name: 'new' });
    const statusId = TaskStatus.getId(status);

    await server.inject({
      method: 'POST',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: title,
          description: '',
          assignedToId: '',
          statusId,
          tags: 'tag1, tag2',
        },
      },
    });

    const task = await Task.findOne();
    const taskId = Task.getId(task);

    const res = await server.inject({
      method: 'DELETE',
      url: `/tasks/${taskId}`,
      cookies: {
        session: sessisonCookie,
      },
    });

    const tasksCount = await Task.count();

    expect(res.statusCode).toBe(302);
    expect(tasksCount).toBe(0);
  });

  afterEach(async () => {
    await Task.clear();
    await Tag.clear();
    await User.clear();
    await TaskStatus.clear();
  });

  afterAll(() => {
    server.close();
  });
});
