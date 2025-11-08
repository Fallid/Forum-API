class DetailedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, title, body, date, username, comments,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = comments;
  }

  _verifyPayload(payload) {
    if (this._isPayloadContainNeededProperty(payload)) {
      throw new Error('DETAILED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (this._isPayloadMeetDataTypeSpecification(payload)) {
      throw new Error('DETAILED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadContainNeededProperty({
    id, title, body, date, username, comments,
  }) {
    return (!id || !title || !body || !date || !username || !comments);
  }

  _isPayloadMeetDataTypeSpecification({
    id, title, body, date, username, comments,
  }) {
    return (
      typeof id !== 'string'
      || typeof title !== 'string'
      || typeof body !== 'string'
      || !(date instanceof Date)
      || typeof username !== 'string'
      || !Array.isArray(comments)
    );
  }
}

module.exports = DetailedThread;
