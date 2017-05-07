module.exports = {
	'basic functionality': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/632wur/comment_navigator/')
			.refresh() // get rid of update notification
			.waitForElementVisible('#RESSettingsButton')
			.moveToElement('.debuginfo', 0, 0) // scroll to bottom
			.keys(['n'])
			.assert.visible('#REScommentNavBox')
			.setValue('#commentNavBy', 'submitter')
			.assert.containsText('#REScommentNavBox', '1/2')
			.assert.visible('#thing_t1_dfqvawk')
			.click('#commentNavDown')
			.assert.containsText('#REScommentNavBox', '2/2')
			.assert.visible('#thing_t1_dfqvaz1')
			.end();
	},
};
