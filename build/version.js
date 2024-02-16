/* @noflow */
/* eslint import/no-nodejs-modules: 0, import/extensions: 0 */

import { execSync } from 'child_process';
import fs from 'fs';
import packageData from '../package.json' with { type: 'json' };
import { changelogPath, changelogPathFromVersion } from './utils/changelog.js';

const { version, repository } = packageData;
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
