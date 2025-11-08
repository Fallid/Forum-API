const ServerTestHelper = {
  async getAccessToken({ server, username = 'dicoding', password = 'secret' }) {
    const login = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password,
      },
    });
    const { accessToken } = JSON.parse(login.payload).data;
    return accessToken;
  },

  async getUserId({
    server, username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia',
  }) {
    const register = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password,
        fullname,
      },
    });
    const { id: userId } = JSON.parse(register.payload).data.addedUser;

    return userId;
  },
};

module.exports = ServerTestHelper;
