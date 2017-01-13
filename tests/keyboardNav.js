module.exports = {
	'go mode': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			// go to subreddit frontpage
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5n61yd/go_mode/')
			.waitForElementVisible('#RESSettingsButton')
			.keys(['g', 'F'])
			.assert.urlEquals('https://www.reddit.com/r/RESIntegrationTests/')
			// go to frontpage
			.waitForElementVisible('#RESSettingsButton')
			.keys(['g', 'f'])
			.assert.urlEquals('https://www.reddit.com/')
			.end();
	},
};
