module.exports = {
	'reddit language detection': browser => {
		browser
			// default (en)
			.url('https://www.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'About RES')

			// Greek (el)
			.url('https://el.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'Σχετικά με το RES')

			// Polish (pl)
			.url('https://pl.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'O RES')

			.end();
	},
};
