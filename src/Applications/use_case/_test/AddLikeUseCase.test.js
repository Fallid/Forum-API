const AddLike = require('../../../Domains/comment-likes/entities/AddLike');
const LikeRepository = require('../../../Domains/comment-likes/CommentLikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddLikeUseCase = require('../AddLikeUseCase');

describe('AddLikeUseCase', () => {
  it('should orchestrating the add like comment correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const headerAuthorization = 'Bearer accessToken';

    // mocking depedency of use case
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking needed function
    mockAuthenticationTokenManager.extractAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve('accessToken'));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'JohnDoe', id: 'user-123' }));
    mockCommentRepository.verifyCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyExistingCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' }));

    // creating use case instance
    const addLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await addLikeUseCase.execute(useCaseParams, headerAuthorization);

    // Assert
    expect(mockAuthenticationTokenManager.extractAccessToken).toBeCalledWith(headerAuthorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith('accessToken');
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('accessToken');
    expect(mockCommentRepository.verifyCommentInThread).toBeCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );
    expect(mockLikeRepository.verifyExistingCommentLike).toBeCalledWith(
      new AddLike({ commentId: useCaseParams.commentId, owner: 'user-123' }),
    );
    expect(mockLikeRepository.addLike).toBeCalledWith(
      new AddLike({ commentId: useCaseParams.commentId, owner: 'user-123' }),
    );
  });

  it('should delete like when comment already liked', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const headerAuthorization = 'Bearer accessToken';

    // mocking depedency of use case
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking needed function
    mockAuthenticationTokenManager.extractAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve('accessToken'));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'JohnDoe', id: 'user-123' }));
    mockCommentRepository.verifyCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyExistingCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.addLike = jest.fn().mockImplementation(() => Promise.resolve({ status: 'success' }));

    // creating use case instance
    const addLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await addLikeUseCase.execute(useCaseParams, headerAuthorization);

    // Assert
    expect(mockLikeRepository.verifyExistingCommentLike).toBeCalledWith(
      new AddLike({ commentId: useCaseParams.commentId, owner: 'user-123' }),
    );
    expect(mockLikeRepository.deleteLike).toBeCalledWith(useCaseParams.commentId, 'user-123');
    expect(mockLikeRepository.addLike).not.toBeCalled();
  });
});
