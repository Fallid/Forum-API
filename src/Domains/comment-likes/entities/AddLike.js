class AddLike {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, owner } = payload;

    this.commentId = commentId;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (this._isPayloadContainNeededProperty(payload)) {
      throw new Error('ADD_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadMeetDataTypeSpecification(payload)) {
      throw new Error('ADD_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadContainNeededProperty({ commentId, owner }) {
    return (!commentId || !owner);
  }

  _isPayloadMeetDataTypeSpecification({ commentId, owner }) {
    return (typeof commentId !== 'string' || typeof owner !== 'string');
  }
}

module.exports = AddLike;
