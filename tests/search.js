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
	'exporting links': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support moveto https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			// to modules
			.url('https://en.reddit.com/wiki/pages/#res:settings/search/showImages')
			.refresh() // get the update notification out of the way of the search result button
			.waitForElementVisible('#SearchRES-results')
			.moveToElement('.SearchRES-result-item', 0, 0)
			.click('.SearchRES-result-copybutton')
			.assert.valueContains(
				'#alert_message textarea',
				'**[Inline Image Viewer](#res:settings/showImages)** -- [](#gear) [RES settings console](#res:settings) > Productivity > [Inline Image Viewer](#res:settings/showImages "showImages")',
				'links to modules'
			)
			// to options
			.url('https://en.reddit.com/wiki/pages/#res:settings/search/testEnvironment')
			.refresh()
			.waitForElementVisible('#SearchRES-results')
			.moveToElement('.SearchRES-result-item', 0, 0)
			.click('.SearchRES-result-copybutton')
			.assert.valueContains(
				'#alert_message textarea',
				'**[testEnvironment](#res:settings/troubleshooter/testEnvironment)** -- [](#gear) [RES settings console](#res:settings) > About RES > [Troubleshooter](#res:settings/troubleshooter "troubleshooter") > [testEnvironment](#res:settings/troubleshooter/testEnvironment)',
				'links to options'
			)
			.end();
	},
};
