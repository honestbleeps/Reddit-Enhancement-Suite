module.exports = {
	'settings button exists': browser => {
		browser
			// lightweight page that still has the userbar
			.url('https://www.reddit.com/wiki/pages')
			.waitForElementVisible('#header', 1000)
			.waitForElementVisible('#RESSettingsButton', 1000)
			.end();
	},
};
