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
	// link to the release listing page instead of a specific release page
	// so if someone goes from the previous version to a hotfix (e.g. 5.10.3 -> 5.12.1)
	// they see the big release notes for the minor release in addition to the changes in the hotfix
	`https://redditenhancementsuite.com/releases/beta/#v${version}` :
	`https://redditenhancementsuite.com/releases/#v${version}`;
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
