const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should response 201 and presisted comment', async () => {
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
    const requestCommentPayload = {
      content: 'comment content',
    };
    const threadId = 'threaed-123';
    const server = await createServer(container);
    const userId = await ServerTestHelper.getUserId({ server, requestRegisterPayload });
    const accessToken = await ServerTestHelper.getAccessToken({ server, requestLoginPayload });
    await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });

    // Action
    const responseComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestCommentPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseCommentJson = JSON.parse(responseComment.payload);
    expect(responseComment.statusCode).toEqual(201);
    expect(responseCommentJson.status).toEqual('success');
    expect(responseCommentJson.data.addedComment).toBeDefined();
    expect(responseCommentJson.data.addedComment.id).toBeDefined();
    expect(responseCommentJson.data.addedComment.content).toEqual(requestCommentPayload.content);
    expect(responseCommentJson.data.addedComment.owner).toBeDefined();
  });

  it('should response 404 when thread not found', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    const requestCommentPayload = {
      content: 'comment content',
    };
    const threadId = 'thread-xxx';
    const server = await createServer(container);
    await ServerTestHelper.getUserId({
      server,
      username: requestPayload.username,
      password: requestPayload.password,
      fullname: requestPayload.fullname,
    });
    const accessToken = await ServerTestHelper.getAccessToken({
      server,
      username: requestPayload.username,
      password: requestPayload.password,
    });

    // Action
    const responseComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestCommentPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseCommentJson = JSON.parse(responseComment.payload);
    expect(responseComment.statusCode).toEqual(404);
    expect(responseCommentJson.status).toEqual('fail');
    expect(responseCommentJson.message).toBeDefined();
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment successfully', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const threadId = 'thread-123';
      const server = await createServer(container);
      const userId = await ServerTestHelper.getUserId({
        server,
        username: requestPayload.username,
        password: requestPayload.password,
        fullname: requestPayload.fullname,
      });
      const accessToken = await ServerTestHelper.getAccessToken({
        server,
        username: requestPayload.username,
        password: requestPayload.password,
      });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when user is not comment owner', async () => {
      // Arrange
      const threadId = 'thread-123';
      const server = await createServer(container);

      const ownerId = await ServerTestHelper.getUserId({
        server,
        username: 'owner',
        password: 'secret',
        fullname: 'Comment Owner',
      });

      const notOwnerId = await ServerTestHelper.getUserId({
        server,
        username: 'notowner',
        password: 'secret',
        fullname: 'Not Owner',
      });
      const accessToken = await ServerTestHelper.getAccessToken({
        server,
        username: 'notowner',
        password: 'secret',
      });

      await ThreadTableTestHelper.addThread({ id: threadId, owner: ownerId });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: ownerId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const threadId = 'thread-123';
      const server = await createServer(container);
      const userId = await ServerTestHelper.getUserId({
        server,
        username: requestPayload.username,
        password: requestPayload.password,
        fullname: requestPayload.fullname,
      });
      const accessToken = await ServerTestHelper.getAccessToken({
        server,
        username: requestPayload.username,
        password: requestPayload.password,
      });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-xxx`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);
      await ServerTestHelper.getUserId({
        server,
        username: requestPayload.username,
        password: requestPayload.password,
        fullname: requestPayload.fullname,
      });
      const accessToken = await ServerTestHelper.getAccessToken({
        server,
        username: requestPayload.username,
        password: requestPayload.password,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-xxx/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
