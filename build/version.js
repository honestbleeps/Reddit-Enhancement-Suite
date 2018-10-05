/* @flow */

/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const { execSync } = require('child_process');
const fs = require('fs');
const { version, repository } = require('../package.json');
const { changelogPath, changelogPathFromVersion } = require('./utils/changelog');

const unreleasedChangelog = changelogPath('UNRELEASED.md');
const templateChangelog = changelogPath('_EXAMPLE.md');
const newChangelog = changelogPathFromVersion(version);

const changelogContents = fs.readFileSync(unreleasedChangelog, { encoding: 'utf8' });
fs.writeFileSync(newChangelog, `## [v${version}](https://github.com/${repository.username}/${repository.repository}/releases/v${version})\n\n${changelogContents}`);

fs.writeFileSync(unreleasedChangelog, fs.readFileSync(templateChangelog));

gitAdd(unreleasedChangelog);
gitAdd(newChangelog);

function gitAdd(file) {
				console.log('git add', file);
				return execSync(`git add ${file}`);
}
