const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const LikeRepository = require('../../Domains/comment-likes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(addLike) {
    const { commentId, owner } = addLike;
    const id = `comment_like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyExistingCommentLike(addLike) {
    const { commentId, owner } = addLike;
    const query = {
      text: 'SELECT 1 FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (result.rows.length) {
      return true;
    }

    return false;
  }

  async deleteLike(commentId, owner) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2 RETURNING id',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Tidak bisa menghapus, like tidak ada');
    }
  }

  async getLikeCountsByThreadId(threadId) {
    const query = {
      text: `SELECT cl.comment_id, COUNT(*)::int as like_count
      FROM comment_likes cl
      INNER JOIN comments c ON cl.comment_id = c.id
      WHERE c.thread_id = $1
      GROUP BY cl.comment_id`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    // Convert to object map for easy lookup: { commentId: likeCount }
    return result.rows.reduce((acc, row) => {
      acc[row.comment_id] = row.like_count;
      return acc;
    }, {});
  }
}

module.exports = CommentLikeRepositoryPostgres;
