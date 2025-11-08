const DetailedThread = require('../DetailedThread');

describe('a DetailedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: new Date('2025-11-08T08:09:53.758Z'),
      username: 'dicoding',
      comments: null,
    };

    // Action and Assert
    expect(() => new DetailedThread(payload)).toThrowError('DETAILED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2025-11-08T08:09:53.758Z',
      username: 'dicoding',
      comments: [],
    };

    // Action and Assert
    expect(() => new DetailedThread(payload)).toThrowError('DETAILED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailed thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: new Date('2025-11-08T08:09:53.758Z'),
      username: 'dicoding',
      comments: [],
    };

    // Action
    const {
      id, title, body, date, username, comments,
    } = new DetailedThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
