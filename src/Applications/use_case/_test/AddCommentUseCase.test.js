const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepostiory');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
    };

    const useCaseParams = {
      threadId: 'thread-123',
    };

    const headerAuthorization = 'Bearer accessToken';

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'content comment',
      owner: 'user-123',
    });

    const accessToken = 'accessToken';

    // creating depedencies of use case
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking needed function
    mockAuthenticationTokenManager.extractAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'JohnDoe', id: expectedAddedComment.owner }));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    // creating use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      useCasePayload, useCaseParams, headerAuthorization,
    );

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: expectedAddedComment.id,
      content: expectedAddedComment.content,
      owner: expectedAddedComment.owner,
    }));
  });
});
