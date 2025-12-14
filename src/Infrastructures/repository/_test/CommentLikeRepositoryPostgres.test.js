const CommentLikeTableTestHelper = require('../../../../tests/CommentLikeTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
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
    it('should throw InvarinatError when comment already been liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      await CommentLikeTableTestHelper.addLike({ id: 'comment_like-123' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      const addLike = new AddLike({ commentId: 'comment-123', owner: 'user-123' });

      // Action & Assert
      await expect(commentLikeRepositoryPostgres.verifyExistingCommentLike(addLike))
        .rejects.toThrowError(InvariantError);
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
});
