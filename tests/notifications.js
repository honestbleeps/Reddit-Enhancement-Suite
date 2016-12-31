module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages/#res:settings/troubleshooter')
			.waitForElementVisible('#RESConsoleContainer')
			.click('#testTemplates')
			.assert.containsText('.RESNotification .RESNotificationHeader', 'Template test')
			.end();
	},
};
