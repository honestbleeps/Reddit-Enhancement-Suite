module.exports = {
	'settings button exists': browser => {
		browser
			// lightweight page that still has the userbar
			.url('https://www.reddit.com/wiki/pages')
			.waitForElementVisible('#header')
			.waitForElementVisible('#RESSettingsButton')
			.end();
	},
	'open settings console via menu': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support moveto https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://www.reddit.com/wiki/pages')
			.waitForElementVisible('#header')
			.waitForElementVisible('#RESSettingsButton')
			.moveToElement('#RESSettingsButton', 0, 0)
			.pause(1000)
			.click('#SettingsConsole')
			.waitForElementVisible('#RESConsoleContainer')
			.end();
	},
};
