module.exports = {
	'default (en) locale': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'About RES')
			.end();
	},
	'greek (el) locale': browser => {
		browser
			.url('https://el.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'Σχετικά με το RES')
			.end();
	},
	'polish (pl) locale': browser => {
		browser
			.url('https://pl.reddit.com/wiki/pages/#res:settings/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'O RES')
			.end();
	},
};
