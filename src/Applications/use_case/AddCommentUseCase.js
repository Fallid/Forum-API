const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseParams, headerAuthorization) {
    const token = await this._authenticationTokenManager.extractAccessToken(headerAuthorization);

    await this._authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(token);
    await this._threadRepository.getThreadById(useCaseParams.threadId);
    const addComment = new AddComment({
      ...useCasePayload, owner, threadId: useCaseParams.threadId,
    });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
