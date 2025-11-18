class GetThreadByIdUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParam) {
    const { threadId } = useCaseParam;
    const detailedThread = await this._threadRepository.getThreadById(threadId);
    detailedThread.comments = await this._commentRepository.getCommentByThreadId(threadId);

    detailedThread.comments = this._isDeletedComment(detailedThread.comments);
    return detailedThread;
  }

  _isDeletedComment(comments) {
    return comments.map(({ isDeleted, ...comment }) => ({
      ...comment,
      content: isDeleted ? '**komentar telah dihapus**' : comment.content,
    }));
  }
}

module.exports = GetThreadByIdUseCase;
