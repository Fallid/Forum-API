class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, owner } = payload;

    this.id = id;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (this._isPayloadContainNeededPropery(payload)) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadMeetDataTypeSpecification(payload)) {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadContainNeededPropery({ id, content, owner }) {
    return (!id || !content || !owner);
  }

  _isPayloadMeetDataTypeSpecification({ id, content, owner }) {
    return (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string');
  }
}

module.exports = AddedComment;
