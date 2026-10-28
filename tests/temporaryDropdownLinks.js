module.exports = {
	'basic functionality': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support moveto https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		const dropdown = '.menuarea .dropdown .selected';
		const firstChoice = '.menuarea .drop-choices .choice';

		// can't properly test without logging in,
		// so just make sure it doesn't break anything existing
		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/top/')
			.waitForElementVisible(dropdown)
			.click(dropdown)
			.moveToElement(firstChoice, 0, 0)
			.assert.containsText(`${firstChoice} a`, '(temporarily?)')
			.click(`${firstChoice} a`)
			.assert.urlContains('/r/RESIntegrationTests/top/?t=hour')

			.url('https://en.reddit.com/r/RESIntegrationTests/top/')
			.waitForElementVisible(dropdown)
			.click(dropdown)
			.waitForElementVisible(firstChoice)
			.click(firstChoice)
			.assert.urlContains('/r/RESIntegrationTests/top/?t=hour')

			.end();
	},
};
