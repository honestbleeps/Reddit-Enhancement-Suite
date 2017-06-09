/* @flow */

/* eslint-disable import/no-commonjs */

const semver = require('semver');

module.exports = function isBetaVersion(version /*: string */) /*: boolean */ {
	return (semver.minor(version) % 2) === 1;
};
