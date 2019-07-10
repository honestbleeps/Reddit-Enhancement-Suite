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
			// disable auto hide
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/autoHide')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')

			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5pxfg2/keyboard_nav/')
			.waitForElementVisible('.res-toggle-filterline-visibility')
			.click(`${a} > .entry`)

			.refresh()
			.waitForElementVisible('.readComments-hidePrevious')
			.click('.readComments-hidePrevious button')
			.waitForElementPresent(`${a}.res-thing-filter-hide`)
			.assert.elementNotPresent(`${b}.res-thing-filter-hide`)
			.end();
	},
};
