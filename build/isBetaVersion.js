/* @flow */

/* eslint-disable import/no-commonjs */

const semver = require('semver');

module.exports = (version: string) => (semver.minor(version) % 2 === 1);
