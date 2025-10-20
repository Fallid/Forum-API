const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepostiory');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // arrange
    const useCasePayload = {
      title: 'lorem ipsum',
      body: 'dolor sit amet',
    };

    const headerAuthorization = 'Bearer accessToken';

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'lorem ipsum',
      owner: 'user-123',
    });

    const accessToken = 'accessToken';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /**  mocking needed function */
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.extractAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'JohnDoe', id: expectedAddedThread.owner }));

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // action
    const addedThread = await addThreadUseCase.execute(useCasePayload, headerAuthorization);

    // assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: expectedAddedThread.id,
      title: expectedAddedThread.title,
      owner: expectedAddedThread.owner,
    }));
    expect(mockAuthenticationTokenManager.extractAccessToken).toBeCalledWith(headerAuthorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken()).resolves.toBeUndefined();
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: expectedAddedThread.owner,
    }));
  });
});
