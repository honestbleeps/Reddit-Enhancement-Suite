/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

// used for invalidating caches on each build (executed at build time)
module.exports = String(Math.random()).slice(2);
