const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailedComment = require('../../../Domains/comments/entities/DetailedComment');
const DetailedThread = require('../../../Domains/threads/entities/DetailedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepostiory');
const LikeRepository = require('../../../Domains/comment-likes/CommentLikeRepository');
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('GetThreadByIdUseCase', () => {
  it('should orchestrating the get thread by id action correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const expectedComments = [
      new DetailedComment({
        id: 'comment-1',
        username: 'dico',
        date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'comment content 1',
        isDeleted: false,
      }),
      new DetailedComment({
        id: 'comment-2',
        username: 'ding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'comment content 2',
        isDeleted: false,
      }),
    ];

    const expectedDetailedThread = new DetailedThread({
      id: 'thread-123',
      title: 'title thread',
      body: 'body thread',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'dicoding',
      comments: [],
    });

    const expectedProcessedComments = [
      {
        id: 'comment-1',
        username: 'dico',
        date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'comment content 1',
        likeCount: 2,
      },
      {
        id: 'comment-2',
        username: 'ding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'comment content 2',
        likeCount: 1,
      },
    ];

    const expectedLikeCounts = {
      'comment-1': 2,
      'comment-2': 1,
    };

    // mock
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailedThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockLikeRepository.getLikeCountsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedLikeCounts));

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailedThread = await getThreadByIdUseCase.execute(useCaseParam);

    // Assert
    expect(detailedThread).toEqual({
      ...expectedDetailedThread,
      comments: expectedProcessedComments,
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockLikeRepository.getLikeCountsByThreadId).toBeCalledWith(useCaseParam.threadId);
  });

  it('should handle deleted comments correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const expectedComments = [
      new DetailedComment({
        id: 'comment-123',
        username: 'johndoe',
        date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'sebuah comment',
        isDeleted: false,
      }),
      new DetailedComment({
        id: 'comment-456',
        username: 'dicoding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'comment yang akan dihapus',
        isDeleted: true,
      }),
    ];

    const expectedDetailedThread = new DetailedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'dicoding',
      comments: [],
    });

    const expectedLikeCounts = {
      'comment-123': 3,
      'comment-456': 0,
    };

    // mock
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailedThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockLikeRepository.getLikeCountsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedLikeCounts));

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailedThread = await getThreadByIdUseCase.execute(useCaseParam);

    // Assert
    expect(detailedThread.comments).toHaveLength(2);
    expect(detailedThread.comments[0].content).toEqual('sebuah comment');
    expect(detailedThread.comments[0].likeCount).toEqual(3);
    expect(detailedThread.comments[0].isDeleted).toBeUndefined();
    expect(detailedThread.comments[1].content).toEqual('**komentar telah dihapus**');
    expect(detailedThread.comments[1].likeCount).toEqual(0);
    expect(detailedThread.comments[1].isDeleted).toBeUndefined();
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith('thread-123');
    expect(mockLikeRepository.getLikeCountsByThreadId).toBeCalledWith('thread-123');
  });

  it('should throw NotFoundError when thread not found', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-xxx',
    };

    // mock
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('thread tidak ditemukan')));

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action & Assert
    await expect(getThreadByIdUseCase.execute(useCaseParam))
      .rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-xxx');
  });
});
