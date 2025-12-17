const AddLike = require('../../Domains/comment-likes/entities/AddLike');

class AddLikeUseCase {
  constructor({ commentRepository, likeRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseParams, headerAuthorization) {
    const token = await this._authenticationTokenManager.extractAccessToken(headerAuthorization);

    await this._authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(token);
    await this._commentRepository.verifyCommentInThread(
      useCaseParams.commentId, useCaseParams.threadId,
    );
    const addLike = new AddLike({ commentId: useCaseParams.commentId, owner });

    if (await this._likeRepository.verifyExistingCommentLike(addLike)) {
      await this._likeRepository.deleteLike(useCaseParams.commentId, owner);
    } else {
      await this._likeRepository.addLike(addLike);
    }
  }
}

module.exports = AddLikeUseCase;
