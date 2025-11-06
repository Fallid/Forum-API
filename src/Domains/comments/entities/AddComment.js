class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, owner } = payload;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (this._isPayloadContainNeededProperty(payload)) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadMeetDataTypeSpecification(payload)) {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadContainNeededProperty({ content, owner }) {
    return (!content || !owner);
  }

  _isPayloadMeetDataTypeSpecification({ content, owner }) {
    return (typeof content !== 'string' || typeof owner !== 'string');
  }
}

module.exports = AddComment;
