/* @flow */

import packageInfo from 'exec-loader?cache!./packageInfo';

export const {
	announcementsSubreddit,
	name,
	version,
	isBeta,
	isPatch,
	isMinor,
	isMajor,
	updatedURL,
	homepageURL,
	gitDescription,
} = packageInfo;
