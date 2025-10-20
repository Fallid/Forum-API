const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, headerAuthorization) {
    const token = await this._authenticationTokenManager.extractAccessToken(headerAuthorization);
    await this._authenticationTokenManager.verifyAccessToken(token);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(token);
    const addThread = new AddThread({ ...useCasePayload, owner });
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
