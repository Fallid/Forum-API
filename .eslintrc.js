module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  plugins: [
    'security',
  ],
  extends: [
    'airbnb-base',
    'plugin:security/recommended-legacy',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'linebreak-style': ['off'],
  },
};
