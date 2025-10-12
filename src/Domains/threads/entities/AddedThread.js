class AddedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, owner } = payload;

    this.id = id;
    this.title = title;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (this._isPayloadContainNeededProperty(payload)) {
      throw new Error('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadMeetDataTypeSpecification(payload)) {
      throw new Error('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadContainNeededProperty({ id, title, owner }) {
    return (!id || !title || !owner);
  }

  _isPayloadMeetDataTypeSpecification({ id, title, owner }) {
    return (typeof id !== 'string' || typeof title !== 'string' || typeof owner !== 'string');
  }
}

module.exports = AddedThread;
