module.exports = {
	'basic functionality': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support moveto https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/633t8w/user_info/')
			.refresh() // get rid of update notification
			.waitForElementVisible('.thing.link .author')
			.moveToElement('.thing.link .author', 0, 0)
			.pause(1000)
			.waitForElementVisible('.author-tooltip')
			.assert.containsText('.author-tooltip', 'erikdesjardins')
			.waitForElementVisible('#highlightUser')
			.assert.containsText('.author-tooltip', 'Highlight')
			.end();
	},
};
