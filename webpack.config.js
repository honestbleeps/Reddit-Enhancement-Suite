/* eslint-disable import/no-commonjs */

// This is a workaround for https://github.com/benmosher/eslint-plugin-import/issues/194
require('babel-core/register');
module.exports = require('./webpack.config.babel').default;
