module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages#res:settings/search/testEnvironment')
			.waitForElementVisible('#RESConsoleContainer')
			.waitForElementVisible('#SearchRES-results')
			.assert.containsText('#SearchRES-results', 'Test Environment')
			.end();
	},
	'opening from command line': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/wiki/pages/')
			.waitForElementVisible('#RESSettingsButton')
			.keys(['.'])
			.setValue('#keyCommandInput', ['settings testEnvironment', browser.Keys.ENTER])
			.assert.visible('#RESConsoleContainer')
			.assert.visible('#SearchRES-results')
			.assert.containsText('#SearchRES-results', 'Test Environment')
			.end();
	},
};
