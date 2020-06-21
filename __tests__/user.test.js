import faker from 'faker';

import app from '../server';
import User from '../server/entity/User';

describe('User', () => {
  let server;
  let sessisonCookie;

  const buildUser = () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(8),
  });

  const mainUser = buildUser();

  beforeAll(() => {
    server = app();
  });

  beforeEach(async () => {
    await server.inject({
      method: 'POST',
      url: '/users',
      body: { user: mainUser },
    });

    const { cookies } = await server.inject({
      method: 'POST',
      url: '/session',
      body: {
        object: {
          email: mainUser.email,
          password: mainUser.password,
        },
      },
    });

    sessisonCookie = cookies[0].value;
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
    expect(users).toHaveLength(2);
  });

  it('POST /users 400. Create user with existing email', async () => {
    const user = buildUser();

    await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user,
      },
    });

    const res = await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user,
      },
    });

    const users = await User.find();

    expect(res.statusCode).toBe(400);
    expect(users).toHaveLength(2);
  });

  it('PATCH /users/settings', async () => {
    const { email } = mainUser;
    const { id } = await User.findOne({ email });

    const res = await server.inject({
      method: 'PATCH',
      url: '/users/settings',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        user: {
          firstName: faker.name.firstName(),
        },
      },
    });

    const updatedUser = await User.findOne({ id });

    expect(res.statusCode).toBe(302);
    expect(updatedUser.firstName).not.toBe(mainUser.firstName);
  });

  it('PATCH /users/settings 422', async () => {
    const res = await server.inject({
      method: 'PATCH',
      url: '/users/settings',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        user: {
          firstName: '',
        },
      },
    });

    expect(res.statusCode).toBe(422);
  });

  it('PATCH /users/settings 400. Update user with existing email. ', async () => {
    const user = buildUser();

    await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user,
      },
    });

    const res = await server.inject({
      method: 'PATCH',
      url: '/users/settings',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        user: {
          email: user.email,
        },
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('DELETE /users/:id', async () => {
    const user2 = buildUser();

    await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user: user2,
      },
    });

    const { email } = mainUser;
    const { id } = await User.findOne({ email });

    const res = await server.inject({
      method: 'DELETE',
      url: `/users/${id}`,
      cookies: {
        session: sessisonCookie,
      },
    });

    const users = await User.find();

    expect(res.statusCode).toBe(302);
    expect(users).toHaveLength(1);
  });

  afterEach(async () => {
    await User.clear();
  });

  afterAll(() => {
    server.close();
  });
});
