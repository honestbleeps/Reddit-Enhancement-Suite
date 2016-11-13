module.exports = {
	'settings button exists': browser => {
		browser
			// lightweight page that still has the userbar
			.url('https://www.reddit.com/wiki/pages')
			.waitForElementVisible('#header', 1000)
			.waitForElementVisible('#RESSettingsButton', 1000)
			.end();
	},
	'open settings console via menu': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages')
			.waitForElementVisible('#header', 1000)
			.waitForElementVisible('#RESSettingsButton', 1000)
			// geckodriver doesn't support moveto https://github.com/mozilla/geckodriver/issues/159
			.execute(`
				document.querySelector('#RESSettingsButton')
					.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
			`)
			.pause(1000)
			.click('#SettingsConsole')
			.waitForElementVisible('#RESConsoleContainer', 1000)
			.end();
	},
};
