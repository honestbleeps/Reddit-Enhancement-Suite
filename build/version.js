/* eslint-disable import/no-nodejs-modules */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import prependFile from 'prepend-file';
import { version, repository } from '../package.json';

const dir = 'changelog';
const unreleasedChangelog = changelogPath('UNRELEASED.md');
const templateChangelog = changelogPath('_EXAMPLE.md');
const newChangelog = changelogPath(`v${version}.md`);

fs.copySync(unreleasedChangelog, newChangelog);
prependFile.sync(newChangelog, `## [v${version}](https://github.com/${repository.username}/${repository.repository}/releases/v${version})\n\n`);

fs.copySync(templateChangelog, unreleasedChangelog);

gitAdd(unreleasedChangelog);
gitAdd(newChangelog);

function changelogPath(filename) {
	return path.resolve(__dirname, path.join('..', dir, filename));
}

function gitAdd(file) {
	console.log('git add', file);
	return execSync(`git add ${file}`);
}

