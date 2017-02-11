/*
 * DO NOT IMPORT THIS FILE DIRECTLY, import from `../core/metadata`
 * This file should be executed at compile time, not build time,
 * so that the semver package is not included in the bundle.
 */

/* @flow */
/* eslint-disable import/no-commonjs */

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
};
