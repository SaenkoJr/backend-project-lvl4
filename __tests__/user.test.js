import faker from 'faker';

import app from '../server';
import User from '../server/entity/User';

describe('User', () => {
  let server;

  const buildUser = () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(8),
  });

  beforeAll(() => {
    server = app();
  });

  it('GET /users 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/users',
    });

    expect(res.statusCode).toBe(200);
  });

  it('POST /users 302', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user: buildUser(),
      },
    });

    const users = await User.find();

    expect(res.statusCode).toBe(302);
    expect(users).toHaveLength(1);
  });

  it('DELETE /users/:id', async () => {
    const user1 = buildUser();
    const user2 = buildUser();

    await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user: user1,
      },
    });
    await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user: user2,
      },
    });

    const { email, password } = user1;
    const { id } = await User.findOne({ email });

    const sessionRes = await server.inject({
      method: 'POST',
      url: '/session',
      body: { object: { email, password } },
    });

    const res = await server.inject({
      method: 'DELETE',
      url: `/users/${id}`,
      cookies: {
        session: sessionRes.cookies[0].value,
      },
    });

    const users = await User.find();

    expect(res.statusCode).toBe(302);
    expect(users).toHaveLength(1);
  });

  it('PATCH /users/:id', async () => {
    const user = buildUser();

    await server.inject({
      method: 'POST',
      url: '/users',
      body: { user },
    });

    const { email, password } = user;
    const { id } = await User.findOne({ email });

    const sessionRes = await server.inject({
      method: 'POST',
      url: '/session',
      body: { object: { email, password } },
    });

    const res = await server.inject({
      method: 'PATCH',
      url: `/users/${id}`,
      cookies: {
        session: sessionRes.cookies[0].value,
      },
      body: {
        user: {
          firstName: faker.name.firstName(),
        },
      },
    });

    const updatedUser = await User.findOne({ email });

    expect(res.statusCode).toBe(302);
    expect(updatedUser.firstName).not.toBe(user.firstName);
  });

  afterEach(async () => {
    await User.clear();
  });

  afterAll(() => {
    server.close();
  });
});
