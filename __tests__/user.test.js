import faker from 'faker';

import app from '../server';
import secure from '../server/lib/secure';
import User from '../server/entity/User';

describe('User', () => {
  let server;
  let sessisonCookie;

  const buildUser = () => {
    const password = faker.internet.password(8);
    const passwordDigest = secure(password);

    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password,
      repeatedPassword: password,
      passwordDigest,
    };
  };

  const mainUser = buildUser();

  beforeAll(async () => {
    server = app();
    await server.ready();
  });

  beforeEach(async () => {
    await User.create(mainUser).save();

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
    const user = buildUser();

    const res = await server.inject({
      method: 'POST',
      url: '/users',
      body: { user },
    });

    const createdUser = await User.findOne({ email: user.email });

    expect(res.statusCode).toBe(302);
    expect(createdUser.firstName).toBe(user.firstName);
    expect(createdUser.lastName).toBe(user.lastName);
  });

  it('PATCH /account/settings', async () => {
    const updatedFirstName = faker.name.firstName();
    const updatedLastName = faker.name.lastName();
    const updatedEmail = faker.internet.email();

    const res = await server.inject({
      method: 'PATCH',
      url: '/account/settings',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        user: {
          firstName: updatedFirstName,
          lastName: updatedLastName,
          email: updatedEmail,
        },
      },
    });

    const updatedUser = await User.findOne({ email: updatedEmail });

    expect(res.statusCode).toBe(302);
    expect(updatedUser.firstName).toBe(updatedFirstName);
    expect(updatedUser.lastName).toBe(updatedLastName);
  });

  it('PATCH /account/security 302', async () => {
    const { email, password } = mainUser;
    const newPassword = faker.internet.password();
    const newPasswordDigest = secure(newPassword);

    const res = await server.inject({
      method: 'PATCH',
      url: '/account/security',
      cookies: {
        session: sessisonCookie,
      },
      body: {
        user: {
          oldPassword: password,
          password: newPassword,
          repeatedPassword: newPassword,
        },
      },
    });

    const updatedUser = await User.findOne({ email });

    expect(res.statusCode).toBe(302);
    expect(updatedUser.passwordDigest).toBe(newPasswordDigest);
  });

  it('DELETE /users/:id', async () => {
    await User.create(buildUser()).save();

    const user = await User.findOne({ email: mainUser.email });

    const res = await server.inject({
      method: 'DELETE',
      url: `/users/${user.id}`,
      cookies: {
        session: sessisonCookie,
      },
    });

    const users = await User.find();

    expect(res.statusCode).toBe(302);
    expect(users).toHaveLength(1);
    expect(users).not.toContainEqual(user);
  });

  it('DELETE /users/:id 403. Remove user if current id is not equal to target id ', async () => {
    const user = await User.create(buildUser()).save();

    const res = await server.inject({
      method: 'DELETE',
      url: `/users/${user.id}`,
      cookies: {
        session: sessisonCookie,
      },
    });

    const users = await User.find();

    expect(res.statusCode).toBe(403);
    expect(users).toHaveLength(2);
    expect(users).toContainEqual(user);
  });

  afterEach(async () => {
    await User.clear();
  });

  afterAll(() => {
    server.close();
  });
});
