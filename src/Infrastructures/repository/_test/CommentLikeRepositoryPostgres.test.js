const CommentLikeTableTestHelper = require('../../../../tests/CommentLikeTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddLike = require('../../../Domains/comment-likes/entities/AddLike');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikeTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist add like comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      const addLike = new AddLike({ commentId: 'comment-123', owner: 'user-123' });

      const fakeIdGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // Action
      const addedLike = await commentLikeRepositoryPostgres.addLike(addLike);

      // Assert
      const like = await CommentLikeTableTestHelper.findCommentLikeById('comment_like-123');
      expect(like).toHaveLength(1);
      expect(addedLike).toStrictEqual((
        {
          id: 'comment_like-123',
        }
      ));
      expect(like[0]).toStrictEqual(({
        comment_id: 'comment-123',
        id: 'comment_like-123',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyExistingCommentLike function', () => {
    it('should return true when comment already been liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await CommentLikeTableTestHelper.addLike({ id: 'comment_like-123' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const addLike = new AddLike({ commentId: 'comment-123', owner: 'user-123' });

      // Action
      const result = await commentLikeRepositoryPostgres.verifyExistingCommentLike(addLike);
      // Action
      expect(result).toStrictEqual(true);
    });

    it('should not throw InvariantError when comment has not liked yet', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const addLike = new AddLike({ commentId: 'comment-123', owner: 'user-123' });

      // Action
      const result = await commentLikeRepositoryPostgres.verifyExistingCommentLike(addLike);

      // Assert
      expect(result).toStrictEqual(false);
    });
  });

  describe('deleteLike function', () => {
    it('should throw NotFoundError when like was not found', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentLikeRepositoryPostgres.deleteLike('comment-xxx', 'user-xxx'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when user has been liked the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await CommentLikeTableTestHelper.addLike({ id: 'comment_like-123' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentLikeRepositoryPostgres.deleteLike('comment-123', 'user-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getLikeCountsByThreadId function', () => {
    it('should return like counts for all comments in a thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'user456' });
      await UsersTableTestHelper.addUser({ id: 'user-789', username: 'user789' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-456', owner: 'user-456' });

      await CommentLikeTableTestHelper.addLike({ id: 'comment_like-1', commentId: 'comment-123', owner: 'user-123' });
      await CommentLikeTableTestHelper.addLike({ id: 'comment_like-2', commentId: 'comment-123', owner: 'user-456' });

      await CommentLikeTableTestHelper.addLike({ id: 'comment_like-3', commentId: 'comment-456', owner: 'user-789' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toEqual({
        'comment-123': 2,
        'comment-456': 1,
      });
    });

    it('should return empty object when thread has no likes', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toEqual({});
    });

    it('should return like counts only for comments that have likes', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'user456' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-456', owner: 'user-456' });

      await CommentLikeTableTestHelper.addLike({ id: 'comment_like-1', commentId: 'comment-123', owner: 'user-123' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toEqual({
        'comment-123': 1,
      });
      expect(likeCounts['comment-456']).toBeUndefined();
    });
  });
});
