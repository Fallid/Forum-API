const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadTableTestHelper = {
  async addThread({
    id = 'thread-123', title = 'thread title', body = 'thread body', date = new Date('2025-11-08T08:09:53.758Z'), owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, date, owner],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
};

module.exports = ThreadTableTestHelper;
