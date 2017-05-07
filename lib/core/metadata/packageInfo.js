/* @flow */
/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const { execSync } = require('child_process');
const semver = require('semver');
const isBetaVersion = require('../../../build/isBetaVersion');
const packageInfo = require('../../../package.json');

const announcementsSubreddit /*: string */ = 'RESAnnouncements';
const name /*: string */ = packageInfo.title;
const version /*: string */ = packageInfo.version;
const isBeta /*: boolean */ = isBetaVersion(version);
const isPatch /*: boolean */ = semver.patch(version) !== 0;
const isMinor /*: boolean */ = !isPatch && semver.minor(version) !== 0;
const isMajor /*: boolean */ = !isPatch && !isMinor && semver.major(version) !== 0;
const updatedURL /*: string */ = isBeta ?
	'https://redditenhancementsuite.com/latestbeta/' :
	'https://redditenhancementsuite.com/latest/';
const homepageURL /*: string */ = packageInfo.homepage;
const gitDescription /*: string */ = execSync('git describe', { encoding: 'utf8' }).trim();

module.exports = {
	announcementsSubreddit,
	name,
	version,
	isBeta,
	isPatch,
	isMinor,
	isMajor,
	updatedURL,
	homepageURL,
	gitDescription,
};
