const InvariantError = require('../../Commons/exceptions/InvariantError');
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
      throw new InvariantError('Comment sudah dilike');
    }

    return false;
  }
}

module.exports = CommentLikeRepositoryPostgres;
