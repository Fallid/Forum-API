const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
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
    await CommentTableTestHelper.cleanTable();
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

  describe('GET /threads/{threadId}', () => {
    it('should response 200 and return thread with comments', async () => {
      // Arrange
      const server = await createServer(container);
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId1 = 'comment-123';
      const commentId2 = 'comment-456';

      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: new Date('2021-08-08T07:19:09.775Z'),
        owner: userId,
      });
      await CommentTableTestHelper.addComment({
        id: commentId1,
        content: 'sebuah comment',
        date: new Date('2021-08-08T07:22:33.555Z'),
        owner: userId,
        threadId,
      });
      await CommentTableTestHelper.addComment({
        id: commentId2,
        content: 'comment lainnya',
        date: new Date('2021-08-08T07:26:21.338Z'),
        owner: userId,
        threadId,
        isDeleted: true,
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual('sebuah thread');
      expect(responseJson.data.thread.body).toEqual('sebuah body thread');
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toHaveLength(2);

      // Check first comment (not deleted)
      expect(responseJson.data.thread.comments[0].id).toEqual(commentId1);
      expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].content).toEqual('sebuah comment');
      expect(responseJson.data.thread.comments[0].isDeleted).toBeUndefined();

      // Check second comment (deleted)
      expect(responseJson.data.thread.comments[1].id).toEqual(commentId2);
      expect(responseJson.data.thread.comments[1].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(responseJson.data.thread.comments[1].isDeleted).toBeUndefined();
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 200 and return thread with empty comments array', async () => {
      // Arrange
      const server = await createServer(container);
      const userId = 'user-123';
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: 'thread tanpa comment',
        body: 'body thread tanpa comment',
        date: new Date('2021-08-08T07:19:09.775Z'),
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.comments).toEqual([]);
    });
  });
});
