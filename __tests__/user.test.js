import faker from 'faker';

import app from '../server';
import secure from '../server/lib/secure';
import User from '../server/entity/User';

describe('User', () => {
  let server;
  let sessisonCookie;

  const buildUser = () => {
    const password = faker.internet.password(8);

    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password,
      repeatedPassword: password,
    };
  };

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
      cookies: {
        session: sessisonCookie,
      },
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

  it('POST /users 422. Create user with existing email', async () => {
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

    expect(res.statusCode).toBe(422);
    expect(users).toHaveLength(2);
  });

  it('PATCH /account/settings', async () => {
    const { email } = mainUser;
    const { id } = await User.findOne({ email });

    const res = await server.inject({
      method: 'PATCH',
      url: '/account/settings',
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

  it('PATCH /account/security 302', async () => {
    const user = buildUser();

    await server.inject({
      method: 'DELETE',
      url: '/session',
    });

    await server.inject({
      method: 'POST',
      url: '/users',
      body: { user },
    });

    const { cookies } = await server.inject({
      method: 'POST',
      url: '/session',
      body: {
        object: {
          email: user.email,
          password: user.password,
        },
      },
    });

    const newPassword = faker.internet.password();
    const passwordDigest = secure(newPassword);

    const { id } = await User.findOne({ email: user.email });

    const res = await server.inject({
      method: 'PATCH',
      url: '/account/security',
      cookies: {
        session: cookies[0].value,
      },
      body: {
        user: {
          oldPassword: user.password,
          password: newPassword,
          repeatedPassword: newPassword,
        },
      },
    });

    const updatedUser = await User.findOne({ id });

    expect(res.statusCode).toBe(302);
    expect(updatedUser.passwordDigest).toBe(passwordDigest);
  });

  it('PATCH /account/security 422. Wrong old password', async () => {
    const user = buildUser();

    await server.inject({
      method: 'DELETE',
      url: '/session',
    });

    await server.inject({
      method: 'POST',
      url: '/users',
      body: { user },
    });

    const { cookies } = await server.inject({
      method: 'POST',
      url: '/session',
      body: {
        object: {
          email: user.email,
          password: user.password,
        },
      },
    });

    const newPassword = faker.internet.password();

    const res = await server.inject({
      method: 'PATCH',
      url: '/account/security',
      cookies: {
        session: cookies[0].value,
      },
      body: {
        user: {
          oldPassword: 'wrong old pasword',
          password: newPassword,
          repeatedPassword: newPassword,
        },
      },
    });

    expect(res.statusCode).toBe(422);
  });

  it('PATCH /account/settings 422', async () => {
    const res = await server.inject({
      method: 'PATCH',
      url: '/account/settings',
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

  it('PATCH /account/settings 422. Update user with existing email. ', async () => {
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
      url: '/account/settings',
      cookies: {
        session: sessisonCookie,
      },
      body: { user },
    });

    expect(res.statusCode).toBe(422);
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

  it('DELETE /users/:id 403. Remove user if current id is not equal to target id ', async () => {
    const user2 = buildUser();

    await server.inject({
      method: 'POST',
      url: '/users',
      body: {
        user: user2,
      },
    });

    const { id } = await User.findOne({ email: user2.email });

    const res = await server.inject({
      method: 'DELETE',
      url: `/users/${id}`,
      cookies: {
        session: sessisonCookie,
      },
    });

    const users = await User.find();

    expect(res.statusCode).toBe(403);
    expect(users).toHaveLength(2);
  });

  afterEach(async () => {
    await User.clear();
  });

  afterAll(() => {
    server.close();
  });
});
