import app from '../server';

describe('requests', () => {
  let server;

  beforeAll(() => {
    server = app();
  });

  it('GET 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/',
    });
    expect(res.statusCode).toBe(200);
  });

  afterAll(() => {
    server.close();
  });
});
