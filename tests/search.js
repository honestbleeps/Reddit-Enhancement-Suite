module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages#res:settings/search/testEnvironment')
			.waitForElementVisible('#RESConsoleContainer', 1000)
			.waitForElementVisible('#SearchRES-results', 1000)
			.assert.containsText('#SearchRES-results', 'Test Environment')
			.end();
	},
};
