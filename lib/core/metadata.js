/* exported RESMetadata */

const RESMetadata = {
	defaultModuleID: 'about',  // Show this module by default when opening settings
	categories: ['About RES', 'My account', 'Users', 'Comments', 'Submissions', 'Subreddits', 'Appearance', '*', 'Core'],
	announcementsSubreddit: 'RESAnnouncements',
	async setup() {
		const metadata = await RESEnvironment.loadResourceAsText('package.json');
		$.extend(true, RESMetadata, JSON.parse(metadata));
		RESMetadata.updatedURL = `http://redditenhancementsuite.com/whatsnew.html?v=${RESMetadata.version}`;
		return RESMetadata;
	}
};

if (typeof exports === 'object') {
	exports.RESMetadata = RESMetadata;
}
