module.exports = {
	'default (en) locale': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'About RES')
			.end();
	},
	'greek (el) locale': browser => {
		browser
			.url('https://el.reddit.com/wiki/pages')
			.waitForElementVisible('#RESSettingsButton')
			.url('https://np.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'Σχετικά με το RES')
			.end();
	},
	'polish (pl) locale': browser => {
		browser
			.url('https://pl.reddit.com/wiki/pages/')
			.waitForElementVisible('#RESSettingsButton')
			.url('https://np.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/about')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.containsText('#RESConfigPanelOptions .moduleName', 'O RES')
			.end();
	},
};
