const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const config = require('../../Commons/config');
const AuthenticationError = require('../../Commons/exceptions/AuthenticationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt) {
    super();
    this._jwt = jwt;
  }

  async createAccessToken(payload) {
    return this._jwt.generate(payload, config.auth.accessTokenKey, {
      ttlSec: Number(config.auth.accessTokenAge),
    });
  }

  async createRefreshToken(payload) {
    return this._jwt.generate(payload, config.auth.refreshTokenKey);
  }

  async verifyAccessToken(token) {
    try {
      const artifacts = this._jwt.decode(token);
      this._jwt.verify(artifacts, config.auth.accessTokenKey);
    } catch (error) {
      if (error.message.includes('Token expired') || error.message.includes('exp')) {
        throw new AuthenticationError('access token telah kadaluarsa');
      }
      throw new InvariantError('access token tidak valid');
    }
  }

  async verifyRefreshToken(token) {
    try {
      const artifacts = this._jwt.decode(token);
      this._jwt.verify(artifacts, config.auth.refreshTokenKey);
    } catch {
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    const artifacts = this._jwt.decode(token);
    return artifacts.decoded.payload;
  }

  async extractAccessToken(headerAuthorization) {
    if (!headerAuthorization) {
      throw new AuthenticationError('Missing authentication');
    }
    return headerAuthorization.replace(/^Bearer\s+/, '');
  }
}

module.exports = JwtTokenManager;
