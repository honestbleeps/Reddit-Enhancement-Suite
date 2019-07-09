/* @noflow */

/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const path = require('path'); // eslint-disable-line import/no-extraneous-dependencies

const dir = 'changelog';

function changelogPath(filename) {
	return path.resolve(__dirname, path.join('..', '..', dir, filename));
}

function changelogPathFromVersion(version) {
	return changelogPath(`v${version}.md`);
}

module.exports.changelogPath = changelogPath;
module.exports.changelogPathFromVersion = changelogPathFromVersion;
