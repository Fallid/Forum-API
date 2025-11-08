const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
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
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking needed function
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.extractAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'JohnDoe', id: expectedAddedComment.owner }));
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    // creating use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload, headerAuthorization);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: expectedAddedComment.id,
      content: expectedAddedComment.content,
      owner: expectedAddedComment.owner,
    }));
  });
});
