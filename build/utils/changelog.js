/* @noflow */
/* eslint import/no-nodejs-modules: 0 */

import path from 'node:path';

const dir = 'changelog';

export function changelogPath(filename) {
	return path.join(import.meta.dirname, '..', '..', dir, filename);
}

export function changelogPathFromVersion(version) {
	return changelogPath(`v${version}.md`);
}
