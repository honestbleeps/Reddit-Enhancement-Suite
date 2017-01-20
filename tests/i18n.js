module.exports = {
	'reddit language detection': browser => {
		browser
			// default (en)
			.url('https://www.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'About RES')

			// Chinese (zh)
			.url('https://zh.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', '关于RES')

			// Polish (pl)
			.url('https://pl.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'O RES')

			.end();
	},
};
