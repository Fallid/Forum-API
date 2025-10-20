const Jwt = require('@hapi/jwt');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const JwtTokenManager = require('../JwtTokenManager');
const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');

describe('JwtTokenManager', () => {
  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(
        payload,
        process.env.ACCESS_TOKEN_KEY,
        { ttlSec: Number(process.env.ACCESS_TOKEN_AGE) },
      );
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('verifyAccessToken function', () => {
    it('should throw InvariantError when verification failed', async () => {
    // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const refreshToken = await jwtTokenManager.createRefreshToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyAccessToken(refreshToken))
        .rejects
        .toThrow(InvariantError);
    });

    it('should throw AuthenticationError when access token is expired', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const expiredToken = Jwt.token.generate(
        { username: 'dicoding' },
        process.env.ACCESS_TOKEN_KEY,
        { ttlSec: 1 },
      );
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Action and Assert
      await expect(jwtTokenManager.verifyAccessToken(expiredToken))
        .rejects.toThrow(AuthenticationError);
    });

    it('should not throw InvariantError when access token verified', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyAccessToken(accessToken))
        .resolves
        .not.toThrow(InvariantError);
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(payload, process.env.REFRESH_TOKEN_KEY);
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(accessToken))
        .rejects
        .toThrow(InvariantError);
    });

    it('should not throw InvariantError when refresh token verified', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const refreshToken = await jwtTokenManager.createRefreshToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(refreshToken))
        .resolves
        .not.toThrow(InvariantError);
    });
  });

  describe('decodePayload function', () => {
    it('should decode payload correctly', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action
      const { username: expectedUsername } = await jwtTokenManager.decodePayload(accessToken);

      // Action & Assert
      expect(expectedUsername).toEqual('dicoding');
    });
  });

  describe('extractAccessToken function', () => {
    it('should extract token correctly even if token contains "Bearer "', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });
      const bearerToken = `Bearer ${accessToken}`;

      // Action & Assert
      await expect(jwtTokenManager.extractAccessToken(bearerToken))
        .resolves
        .not.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when token null', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action and Assert
      await expect(jwtTokenManager.extractAccessToken()).rejects.toThrow(AuthenticationError);
    });
  });
});
