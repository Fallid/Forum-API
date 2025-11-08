class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, owner, threadId } = payload;
    this.content = content;
    this.owner = owner;
    this.threadId = threadId;
  }

  _verifyPayload(payload) {
    if (this._isPayloadContainNeededProperty(payload)) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadMeetDataTypeSpecification(payload)) {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadContainNeededProperty({ content, owner, threadId }) {
    return (!content || !owner || !threadId);
  }

  _isPayloadMeetDataTypeSpecification({ content, owner, threadId }) {
    return (typeof content !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string');
  }
}

module.exports = AddComment;
