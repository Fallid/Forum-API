class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseParams, headerAuthorization) {
    const { threadId, commentId } = useCaseParams;
    const token = await this._authenticationTokenManager.extractAccessToken(headerAuthorization);
    await this._authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(token);

    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
