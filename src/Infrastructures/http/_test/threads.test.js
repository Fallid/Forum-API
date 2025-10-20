const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should response 201 and persisted thread', async () => {
    // Arrange
    const requestRegisterPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    const requestLoginPayload = {
      username: 'dicoding',
      password: 'secret',
    };
    const requestThreadPayload = {
      title: 'title thread',
      body: 'body thread',
    };
    const server = await createServer(container);

    // Action
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestRegisterPayload,
    });
    const responseLogin = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestLoginPayload,
    });
    const responseLoginJson = JSON.parse(responseLogin.payload);
    const { accessToken } = responseLoginJson.data;
    const responseThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestThreadPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseThreadJson = JSON.parse(responseThread.payload);
    expect(responseThread.statusCode).toEqual(201);
    expect(responseThreadJson.status).toEqual('success');
    expect(responseThreadJson.data.addedThread).toBeDefined();
    expect(responseThreadJson.data.addedThread.id).toBeDefined();
    expect(responseThreadJson.data.addedThread.title).toEqual(requestThreadPayload.title);
    expect(responseThreadJson.data.addedThread.owner).toBeDefined();
  });
});
