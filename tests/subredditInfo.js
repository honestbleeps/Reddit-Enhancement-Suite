module.exports = {
	'basic functionality': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support moveto https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/by_id/t3_633w4z')
			.refresh() // get rid of update notification
			.pause(1000)
			.click('.guiders_x_button') // get rid of filterline guider
			.waitForElementVisible('.thing.link .subreddit')
			.moveToElement('.thing.link .subreddit', 0, 0)
			.pause(1000)
			.waitForElementVisible('.RESHover')
			.assert.containsText('.RESHover', '/r/RESIntegrationTests')
			.assert.visible('.RESHover a[href$="/r/RESIntegrationTests"]')
			.assert.containsText('.RESHover', 'Subreddit created:')
			.click('.RESHover .RESCloseButton')
			.waitForElementNotVisible('.RESHover')
			.end();
	},
};
