const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, headerAuthorization) {
    const token = await this._authenticationTokenManager.extractAccessToken(headerAuthorization);
    await this._authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(token);
    const addComment = new AddComment({ ...useCasePayload, owner });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
