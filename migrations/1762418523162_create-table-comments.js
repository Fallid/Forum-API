/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
* */

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.createConstraint('comments', 'fk_comments.thread_id_thread.id', 'FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.createConstraint('comments', 'fk_comments.owner_user.id', 'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
* */
exports.down = (pgm) => {
  pgm.dropConstraint('comments', 'fk_comments.owner_user.id');
  pgm.dropTable('comments');
};
