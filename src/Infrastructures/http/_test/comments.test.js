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
    console.log(responseCommentJson.data.addedComment);
    expect(responseComment.statusCode).toEqual(201);
    expect(responseCommentJson.status).toEqual('success');
    expect(responseCommentJson.data.addedComment).toBeDefined();
    expect(responseCommentJson.data.addedComment.id).toBeDefined();
    expect(responseCommentJson.data.addedComment.content).toEqual(requestCommentPayload.content);
    expect(responseCommentJson.data.addedComment.owner).toBeDefined();
  });
});
