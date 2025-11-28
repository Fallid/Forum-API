const dontenv = require('dotenv');
const path = require('path');

if (!process.env.CI) {
  if (process.env.NODE_ENV === 'development') {
    dontenv.config({
      path: path.resolve(process.cwd(), '.development.env'),
    });
  } else {
    dontenv.config({
      override: false,
    });
  }
}

const config = {
  app: {
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    port: process.env.PORT,
  },
  database: {
    host: process.env.NODE_ENV === 'test' ? process.env.PGHOST_TEST : process.env.PGHOST,
    port: process.env.NODE_ENV === 'test' ? process.env.PGPORT_TEST : process.env.PGPORT,
    user: process.env.NODE_ENV === 'test' ? process.env.PGUSER_TEST : process.env.PGUSER,
    password: process.env.NODE_ENV === 'test' ? process.env.PGPASSWORD_TEST : process.env.PGPASSWORD,
    database: process.env.NODE_ENV === 'test' ? process.env.PGDATABASE_TEST : process.env.PGDATABASE,
  },
  auth: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
};

module.exports = config;
