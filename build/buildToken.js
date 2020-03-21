/* @flow */

/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const { version } = require('../package.json');

// used for invalidating caches on each build (executed at build time)
// production builds uses version number to keep the build reproducible
module.exports = process.env.NODE_ENV === 'production' ? version : String(Math.random()).slice(2);
