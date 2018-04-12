/* @noflow */

/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { version } = require('../package.json');
const { changelogPathFromVersion } = require('./utils/changelog');
const isBetaVersion = require('./isBetaVersion');

const tempDir = path.join(__dirname, '..', 'dist', 'temp');

rimraf.sync(tempDir);
execSync(`git clone --depth=1 https://github.com/Reddit-Enhancement-Suite/Reddit-Enhancement-Suite.github.io.git ${tempDir}`);

const releaseTimestamp = (/^tagger.+?\s(\d+)\s/m).exec(execSync(`git cat-file tag v${version}`, { encoding: 'utf8' }))[1];
const releaseDate = new Date(releaseTimestamp * 1000);

const newChangelogFile = path.join(tempDir, '_posts', `${releaseDate.toISOString().slice(0, 10)}-${version.replace(/\./g, '')}.md`);

const changelog = fs.readFileSync(changelogPathFromVersion(version), 'utf8');
const changelogLines = changelog.split('\n');

const isBeta = isBetaVersion(version);

const newChangelog = [
	'---',
	'layout: releases',
	`title:  v${version}`,
	`permalink: ${isBeta ? 'releases/beta' : 'releases'}/${version}/`,
	'tags:',
	`- ${isBeta ? 'Pre-release' : 'Release'}`,
	'---',
	...changelogLines.slice(1),
].join('\n');

fs.writeFileSync(newChangelogFile, newChangelog);

execSync(`git add ${newChangelogFile}`, { cwd: tempDir });
execSync(`git commit --author="${process.env.BOT_USER} <${process.env.BOT_USER}@users.noreply.github.com>" -m "changelog v${version}"`, { cwd: tempDir });
execSync(`git push https://${process.env.BOT_USER}:${process.env.BOT_PASSWORD}@github.com/Reddit-Enhancement-Suite/Reddit-Enhancement-Suite.github.io.git`, { cwd: tempDir });

console.log('Deployed changelog post:', newChangelogFile);
