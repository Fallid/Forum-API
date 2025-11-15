const DetailedComment = require('../entities/DetailedComment');

describe('a DetailedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
    };
    // Action and Assert
    expect(() => new DetailedComment(payload)).toThrowError('DETAILED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 123456,
      date: 123456,
      content: 'sebuah comment',
      isDeleted: false,
    };

    // Action and Assert
    expect(() => new DetailedComment(payload)).toThrowError('DETAILED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailed comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      isDeleted: false,
    };

    // Action
    const {
      id, username, date, content, isDeleted,
    } = new DetailedComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(isDeleted).toEqual(payload.isDeleted);
  });
});
