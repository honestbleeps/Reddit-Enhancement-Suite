/* eslint-disable import/no-commonjs */

const semver = require('semver');

module.exports = version => (semver.minor(version) % 2 === 1);
