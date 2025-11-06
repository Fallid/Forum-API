const AddComment = require('../AddComment');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'content comment',
      owner: null,
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specificaation', () => {
    // Arrange
    const payload = {
      content: 12344567,
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create add comment object correctly', () => {
    // Arrange
    const payload = {
      content: 'comment content',
      owner: 'user-123',
    };

    // Action
    const { content, owner } = new AddComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
