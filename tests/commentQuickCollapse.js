module.exports = {
	'double click tagline': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support moveto https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		const comment = '#thing_t1_dc7kvtv';

		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5mzxff/comment_quick_collapse/')
			.waitForElementVisible(comment)
			.moveToElement(`${comment} .author`, 0, 0)
			.doubleClick()
			.assert.cssClassPresent(comment, 'collapsed')
			.end();
	},
};
