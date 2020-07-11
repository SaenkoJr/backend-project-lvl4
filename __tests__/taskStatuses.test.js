import faker from 'faker';

import app from '../server';

import TaskStatus from '../server/entity/TaskStatus';
import User from '../server/entity/User';
import secure from '../server/lib/secure';

describe('Statuses', () => {
  let server;
  let sessisonCookie;

  beforeAll(async () => {
    server = app();
    await server.ready();
  });

  beforeEach(async () => {
    const authEmail = faker.internet.email();
    const authPass = faker.internet.password();
    const passwordDigest = secure(authPass);

    await User.create({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: authEmail,
      passwordDigest,
    }).save();

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
    const name = faker.name.title();

    const res = await server.inject({
      method: 'POST',
      url: '/statuses',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: {
          name,
        },
      },
    });

    const status = await TaskStatus.findOne({ name });

    expect(res.statusCode).toBe(302);
    expect(status).toHaveProperty('name', name);
  });

  it('PATCH /statuses/:id', async () => {
    const status = await TaskStatus.create({
      name: faker.name.title(),
    }).save();
    const updatedName = faker.name.title();

    const res = await server.inject({
      method: 'PATCH',
      url: `/statuses/${status.id}`,
      cookies: {
        session: sessisonCookie,
      },
      body: {
        taskstatus: {
          name: updatedName,
        },
      },
    });

    const updatedStatus = await TaskStatus.findOne({ id: status.id });

    expect(res.statusCode).toBe(302);
    expect(updatedStatus).toHaveProperty('name', updatedName);
  });

  it('DELETE /statuses/:id', async () => {
    const name1 = faker.name.title();
    const name2 = faker.name.title();

    const status1 = await TaskStatus.create({ name: name1 }).save();
    const status2 = await TaskStatus.create({ name: name2 }).save();

    const res = await server.inject({
      method: 'DELETE',
      cookies: {
        session: sessisonCookie,
      },
      url: `/statuses/${status1.id}`,
    });

    const statuses = await TaskStatus.find();

    expect(res.statusCode).toBe(302);
    expect(statuses).toHaveLength(1);
    expect(statuses).not.toContainEqual(status1);
    expect(statuses).toContainEqual(status2);
  });

  afterEach(async () => {
    await User.clear();
    await TaskStatus.clear();
  });

  afterAll(() => {
    server.close();
  });
});
