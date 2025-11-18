const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const DetailedComment = require('../../Domains/comments/entities/DetailedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content, owner, threadId } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO comments (id, content, date, owner, thread_id) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, date, owner, threadId],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT cmt.id, timezone('UTC', cmt.date) as date, usr.username, cmt.content, cmt.is_deleted 
      FROM comments cmt
      INNER JOIN users usr ON cmt.owner = usr.id
      WHERE cmt.thread_id = $1
      ORDER BY cmt.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((data) => new DetailedComment({
      id: data.id,
      username: data.username,
      date: data.date,
      content: data.content,
      isDeleted: data.is_deleted,
    }));
  }
}

module.exports = CommentRepositoryPostgres;
