/* @flow */

import semver from 'semver';

export default function isBetaVersion(version /*: string */) /*: boolean */ {
	return (semver.minor(version) % 2) === 1;
};
