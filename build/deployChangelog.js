/* @noflow */
/* eslint import/no-nodejs-modules: 0, import/extensions: 0  */

import { execSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';
import { rimrafSync } from 'rimraf';
import packageInfo from '../package.json' with { type: 'json' };
import { changelogPathFromVersion } from './utils/changelog.js';
import isBetaVersion from './isBetaVersion.js';

const version = packageInfo.version;

const tempDir = path.join(import.meta.dirname, '..', 'dist', 'temp');

rimrafSync(tempDir);
execSync(`git clone --depth=1 https://github.com/Reddit-Enhancement-Suite/Reddit-Enhancement-Suite.github.io.git ${tempDir}`);

const releaseDate = new Date(execSync(`git log -1 --format=%ai v${version}`, { encoding: 'utf8' }));

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
