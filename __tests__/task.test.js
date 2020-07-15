import faker from 'faker';

import app from '../server';
import Task from '../server/entity/Task';
import Tag from '../server/entity/Tag';
import TaskStatus from '../server/entity/TaskStatus';
import User from '../server/entity/User';
import secure from '../server/lib/secure';

describe('Tasks', () => {
  let server;
  let sessisonCookie;
  let user;
  let taskStatus1;
  let taskStatus2;

  beforeAll(async () => {
    server = app();
    await server.ready();
  });

  beforeEach(async () => {
    const authEmail = faker.internet.email();
    const authPass = faker.internet.password();
    const passwordDigest = secure(authPass);

    user = await User.create({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: authEmail,
      passwordDigest,
    }).save();
    taskStatus1 = await TaskStatus.create({ name: 'new' }).save();
    taskStatus2 = await TaskStatus.create({ name: 'in progress' }).save();

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
    const name = faker.name.title();
    const description = faker.lorem.sentence(10);

    const res = await server.inject({
      method: 'POST',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name,
          statusId: taskStatus1.id,
          description,
          assignedToId: user.id,
          tags: '',
        },
      },
    });

    const task = await Task.findOne({ name });

    expect(res.statusCode).toBe(302);
    expect(task).toMatchObject({
      name,
      description,
      status: { id: taskStatus1.id },
      creator: { id: user.id },
      assignedTo: { id: user.id },
    });
  });

  it('POST /tasks with tags 302', async () => {
    const name = faker.name.title();

    const res = await server.inject({
      method: 'POST',
      url: '/tasks',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name,
          statusId: taskStatus2.id,
          description: '',
          assignedToId: '',
          tags: 'tag1, tag2',
        },
      },
    });

    const task = await Task.findOne({ name });
    const tags = await Tag.find();

    expect(res.statusCode).toBe(302);
    expect(task.tags).toHaveLength(2);
    expect(task).toMatchObject({
      name,
      status: { id: taskStatus2.id },
      creator: { id: user.id },
      tags,
    });
  });

  it('PATCH /tasks/:id 302', async () => {
    const name = faker.name.title();
    const description = faker.lorem.sentence(10);

    const updatedName = faker.name.title();
    const updatedDescription = faker.lorem.sentence(10);

    const task = await Task.create({
      name,
      status: taskStatus1,
      description,
      assignedTo: user,
      tags: '',
    }).save();

    const res = await server.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name: updatedName,
          description: updatedDescription,
          assignedToId: '',
          statusId: taskStatus2.id,
          tags: '',
        },
      },
    });

    const updatedTask = await Task.findOne(task.id);

    expect(res.statusCode).toBe(302);
    expect(updatedTask).toMatchObject({
      name: updatedName,
      description: updatedDescription,
      status: {
        id: taskStatus2.id,
      },
      assignedTo: null,
    });
  });

  it('PATCH /tasks/:id 302. Update tags', async () => {
    const tag1 = await Tag.create({ name: 'tag1' }).save();
    const tag2 = await Tag.create({ name: 'tag2' }).save();
    const name = faker.name.title();

    const task = await Task.create({
      name,
      description: '',
      creator: user,
      status: null,
      assignedTo: null,
      tags: [tag1, tag2],
    }).save();

    const res = await server.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      cookies: {
        session: sessisonCookie,
      },
      body: {
        task: {
          name,
          description: '',
          assignedToId: '',
          statusId: taskStatus1.id,
          tags: 'tag1, tag2, tag3',
        },
      },
    });

    const updatedTask = await Task.findOne(task.id);
    const tags = await Tag.find();

    expect(res.statusCode).toBe(302);
    expect(updatedTask.tags).toHaveLength(3);
    expect(updatedTask).toMatchObject({
      name,
      status: { id: taskStatus1.id },
      tags,
    });
  });

  it('DELETE /tasks/:id 302', async () => {
    const task1 = await Task.create({
      name: faker.name.title(),
      description: '',
      creator: user,
      status: null,
      assignedTo: null,
      tags: [],
    }).save();

    const task2 = await Task.create({
      name: faker.name.title(),
      description: '',
      creator: user,
      status: null,
      assignedTo: null,
      tags: [],
    }).save();

    const res = await server.inject({
      method: 'DELETE',
      url: `/tasks/${task1.id}`,
      cookies: {
        session: sessisonCookie,
      },
    });

    const [tasks, count] = await Task.findAndCount();

    expect(res.statusCode).toBe(302);
    expect(count).toBe(1);
    expect(tasks).not.toContainEqual(task1);
    expect(tasks).toContainEqual(task2);
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
