module.exports = {
	'opens new tab': browser => {
		browser
			// default (en)
			.url('https://www.reddit.com/wiki/pages/#res:settings/about')
			// wait for full load
			.waitForElementVisible('#RESConsoleContainer')
			// switch to newly opened background tab
			.window_handles(result => {
				browser.switchWindow(result.value.slice(-1)[0]);
			})
			// may also be https://redditenhancementsuite.com/latestbeta
			.assert.urlContains('https://redditenhancementsuite.com/latest')
			.end();
	},
};
