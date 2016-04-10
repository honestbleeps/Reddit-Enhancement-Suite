/* exported RESMetadata */

import packageInfo from '../../package.json';

const RESMetadata = {
	defaultModuleID: 'about',  // Show this module by default when opening settings
	categories: ['About RES', 'My account', 'Users', 'Comments', 'Submissions', 'Subreddits', 'Appearance', '*', 'Core'],
	announcementsSubreddit: 'RESAnnouncements',
	setup() {
		$.extend(true, RESMetadata, packageInfo);
		RESMetadata.updatedURL = `http://redditenhancementsuite.com/whatsnew.html?v=${RESMetadata.version}`;
		return RESMetadata;
	}
};

if (typeof exports === 'object') {
	exports.RESMetadata = RESMetadata;
}
