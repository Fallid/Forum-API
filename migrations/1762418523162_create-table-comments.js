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
  });

  pgm.createConstraint('comments', 'fk_comments.owner_user.id', 'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
* */
exports.down = (pgm) => {
  pgm.dropConstraint('comments', 'fk_comments.owner_user.id');
  pgm.dropTable('comments');
};
