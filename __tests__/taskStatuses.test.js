import faker from 'faker';

import app from '../server';

import TaskStatus from '../server/entity/TaskStatus';
import User from '../server/entity/User';

describe('Statuses', () => {
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

  it('GET /statuses 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
    });

    expect(res.statusCode).toBe(200);
  });

  it('GET /statuses/new 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/statuses/new',
      cookies: {
        session: sessisonCookie,
      },
    });

    expect(res.statusCode).toBe(200);
  });

  it('POST /statuses 302', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: {
          name: faker.name.title(),
        },
      },
    });

    expect(res.statusCode).toBe(302);
  });

  it('POST /statuses 422', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: {
          name: '',
        },
      },
    });

    expect(res.statusCode).toBe(422);
  });

  it('POST /statuses 400. Create status with existing name', async () => {
    const name = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name },
      },
    });

    const res = await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name },
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('PATCH /statuses/:id', async () => {
    const name = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name },
      },
    });

    const { id } = await TaskStatus.findOne({ name });
    const res = await server.inject({
      method: 'PATCH',
      url: `/statuses/${id}`,
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: {
          name: faker.name.title(),
        },
      },
    });

    const updatedStatus = await TaskStatus.findOne({ id });

    expect(res.statusCode).toBe(302);
    expect(updatedStatus.name).not.toBe(name);
  });

  it('PATCH /statuses/:id 422', async () => {
    const name = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name },
      },
    });

    const { id } = await TaskStatus.findOne({ name });
    const res = await server.inject({
      method: 'PATCH',
      url: `/statuses/${id}`,
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: {
          name: '',
        },
      },
    });

    expect(res.statusCode).toBe(422);
  });

  it('PATCH /statuses/:id 400. Update status with existing name', async () => {
    const name1 = faker.name.title();
    const name2 = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: name1 },
      },
    });

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: name2 },
      },
    });

    const { id } = await TaskStatus.findOne({ name: name2 });
    const res = await server.inject({
      method: 'PATCH',
      url: `/statuses/${id}`,
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: {
          name: name1,
        },
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('DELETE /statuses/:id', async () => {
    const name1 = faker.name.title();
    const name2 = faker.name.title();

    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: name1 },
      },
    });
    await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: { name: name2 },
      },
    });

    const { id } = await TaskStatus.findOne({ name: name1 });

    const res = await server.inject({
      method: 'DELETE',
      cookies: {
        session: sessisonCookie,
      },
      url: `/statuses/${id}`,
    });

    const statuses = await TaskStatus.find();

    expect(res.statusCode).toBe(302);
    expect(statuses).toHaveLength(1);
  });

  afterEach(async () => {
    await User.clear();
    await TaskStatus.clear();
  });

  afterAll(() => {
    server.close();
  });
});
