class DetailedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, isDeleted,
    } = payload;
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.isDeleted = isDeleted;
  }

  _verifyPayload(payload) {
    if (this._isPayloadContainNeededProperty(payload)) {
      throw new Error('DETAILED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadMeetDataTypeSpecification(payload)) {
      throw new Error('DETAILED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadContainNeededProperty({
    id, username, date, content, isDeleted,
  }) {
    return (!id || !username || !date || !content || isDeleted === undefined);
  }

  _isPayloadMeetDataTypeSpecification({
    id, username, date, content, isDeleted,
  }) {
    return (
      typeof id !== 'string'
      || typeof username !== 'string'
      || !(date instanceof Date)
      || typeof content !== 'string'
      || typeof isDeleted !== 'boolean');
  }
}

module.exports = DetailedComment;
