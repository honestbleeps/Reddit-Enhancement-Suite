module.exports = {
	'opens on links to #res:settings': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages#res:settings')
			.waitForElementVisible('#RESConsoleContainer')
			.end();
	},
	'opens on old-style links to #!settings and redirects to new style': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages#!settings')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.urlEquals('https://www.reddit.com/wiki/pages#res:settings/about')
			.end();
	},
	'press escape to close': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://www.reddit.com/wiki/pages#res:settings')
			.waitForElementVisible('#RESConsoleContainer')
			.keys([browser.Keys.ESCAPE])
			.waitForElementNotVisible('#RESConsoleContainer', 1000)
			.end();
	},
};
