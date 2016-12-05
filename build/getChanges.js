/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const { execSync } = require('child_process');
const semver = require('semver');
const { repository } = require('../package.json');
const isBetaVersion = require('./isBetaVersion');

const currentTag = execSync('git describe', { encoding: 'utf8' }).trim();

const lastStableTag = execSync('git tag -l', { encoding: 'utf8' })
	.trim()
	.split(/[\r\n]+/)
	.map(s => s.trim())
	.filter(s => semver.valid(s) && s !== currentTag)
	.reverse()
	.find(v => !isBetaVersion(v));

module.exports = `https://github.com/${repository.username}/${repository.repository}/compare/${lastStableTag}...${currentTag}`;
