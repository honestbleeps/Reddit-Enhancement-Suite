/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { version, repository } = require('../package.json');

const dir = 'changelog';
const unreleasedChangelog = changelogPath('UNRELEASED.md');
const templateChangelog = changelogPath('_EXAMPLE.md');
const newChangelog = changelogPath(`v${version}.md`);

const changelogContents = fs.readFileSync(unreleasedChangelog, { encoding: 'utf8' });
fs.writeFileSync(newChangelog, `## [v${version}](https://github.com/${repository.username}/${repository.repository}/releases/v${version})\n\n${changelogContents}`);

fs.writeFileSync(unreleasedChangelog, fs.readFileSync(templateChangelog));

gitAdd(unreleasedChangelog);
gitAdd(newChangelog);

function changelogPath(filename) {
	return path.resolve(__dirname, path.join('..', dir, filename));
}

function gitAdd(file) {
	console.log('git add', file);
	return execSync(`git add ${file}`);
}
