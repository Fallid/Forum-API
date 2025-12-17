const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const CommentLikeTableTestHelper = require('../../../../tests/CommentLikeTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikeTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and add like successfully', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const threadId = 'thread-123';
      const commentId = 'comment-123';
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
      await CommentTableTestHelper.addComment({ id: commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 and delete like when already liked', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const threadId = 'thread-123';
      const commentId = 'comment-123';
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
      await CommentTableTestHelper.addComment({ id: commentId, owner: userId });
      await CommentLikeTableTestHelper.addLike({ id: 'comment_like-123', commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Verify like was deleted
      const likes = await CommentLikeTableTestHelper
        .findCommentLikeByCommentIdAndOwner(commentId, userId);
      expect(likes).toHaveLength(0);
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const threadId = 'thread-123';
      const commentId = 'comment-xxx';
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
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
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

    it('should response 404 when comment not in thread', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const threadId = 'thread-123';
      const threadId2 = 'thread-456';
      const commentId = 'comment-123';
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
      await ThreadTableTestHelper.addThread({ id: threadId2, owner: userId });
      await CommentTableTestHelper.addComment({
        id: commentId, threadId: threadId2, owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
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

    it('should response 401 when missing authentication', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});
