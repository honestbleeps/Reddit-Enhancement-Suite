module.exports = {
	'back to top button': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support moveto https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/6341yq/page_navigator/')
			.waitForElementVisible('#RESSettingsButton')
			.waitForElementNotVisible('.pageNavigator[href="#header"]')
			.execute('document.querySelector(".footer").scrollIntoView()') // scroll to bottom
			.waitForElementVisible('.pageNavigator[href="#header"]')
			.end();
	},
};
