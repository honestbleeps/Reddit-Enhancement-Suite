module.exports = {
	'basic functionality': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

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
