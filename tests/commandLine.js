module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages/')
			.waitForElementVisible('#RESSettingsButton')
			.keys(['.'])
			.assert.visible('#keyCommandLineWidget')
			.keys(['?'])
			.assert.containsText('#keyCommandForm', 'navigates to subreddit')
			.end();
	},
};
