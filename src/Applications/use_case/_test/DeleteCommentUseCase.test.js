const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepostiory');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const headerAuthorization = 'Bearer token';
    const mockToken = 'token';
    const mockOwner = 'user-123';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    mockAuthenticationTokenManager.extractAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve(mockToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: mockOwner }));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseParams, headerAuthorization);

    // Assert
    expect(mockAuthenticationTokenManager.extractAccessToken).toBeCalledWith(headerAuthorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(mockToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(mockToken);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCaseParams.commentId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toBeCalledWith(useCaseParams.commentId, mockOwner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(useCaseParams.commentId);
  });
});
