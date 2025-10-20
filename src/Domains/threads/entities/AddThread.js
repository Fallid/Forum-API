class AddThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body, owner } = payload;

    this.title = title;
    this.body = body;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (this._isPayloadContainNeededProperty(payload)) {
      throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadMeetDataTypeSpecification(payload)) {
      throw new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadContainNeededProperty({ title, body, owner }) {
    return (!title || !body || !owner);
  }

  _isPayloadMeetDataTypeSpecification({ title, body, owner }) {
    return (typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string');
  }
}

module.exports = AddThread;
