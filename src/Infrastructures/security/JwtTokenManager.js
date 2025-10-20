const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const AuthenticationError = require('../../Commons/exceptions/AuthenticationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt) {
    super();
    this._jwt = jwt;
  }

  async createAccessToken(payload) {
    return this._jwt.generate(payload, process.env.ACCESS_TOKEN_KEY, {
      ttlSec: Number(process.env.ACCESS_TOKEN_AGE),
    });
  }

  async createRefreshToken(payload) {
    return this._jwt.generate(payload, process.env.REFRESH_TOKEN_KEY);
  }

  async verifyAccessToken(token) {
    try {
      const artifacts = this._jwt.decode(token);
      this._jwt.verify(artifacts, process.env.ACCESS_TOKEN_KEY);
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
      this._jwt.verify(artifacts, process.env.REFRESH_TOKEN_KEY);
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
