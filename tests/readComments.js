module.exports = {
	'basic usage': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		const a = '#thing_t1_dcuk08v';
		const b = '#thing_t1_dcuk1bk';

		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/')
			.waitForElementVisible('.res-toggle-filterline-visibility')
			.click(`${a} > .entry`)

			// See that the comment is remember read by filtering out read comments
			.refresh()
			.waitForElementVisible('.res-toggle-filterline-visibility')
			.keys(['f'])
			.waitForElementVisible('#keyCommandLineWidget')
			.keys(['isRead', browser.Keys.ENTER])
			.waitForElementPresent(`${b}.RESFiltered`)
			.assert.elementNotPresent(`${a}.RESFiltered`)
			.end();
	},
};
