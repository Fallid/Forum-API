class GetThreadByIdUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParam) {
    const { threadId } = useCaseParam;
    const detailedThread = await this._threadRepository.getThreadById(threadId);
    detailedThread.comments = await this._commentRepository.getCommentByThreadId(threadId);

    // Get like counts for all comments
    const likeCounts = await this._likeRepository.getLikeCountsByThreadId(threadId);

    detailedThread.comments = this._isDeletedComment(detailedThread.comments);
    detailedThread.comments = this._addLikeCount(detailedThread.comments, likeCounts);
    return detailedThread;
  }

  _isDeletedComment(comments) {
    return comments.map(({ isDeleted, ...comment }) => ({
      ...comment,
      content: isDeleted ? '**komentar telah dihapus**' : comment.content,
    }));
  }

  _addLikeCount(comments, likeCounts) {
    return comments.map((comment) => ({
      ...comment,
      likeCount: likeCounts[comment.id] || 0,
    }));
  }
}

module.exports = GetThreadByIdUseCase;
