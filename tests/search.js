module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages#res:settings/search/testEnvironment')
			.waitForElementVisible('#RESConsoleContainer')
			.waitForElementVisible('#SearchRES-results')
			.assert.containsText('#SearchRES-results', 'Test Environment')
			.end();
	},
};
