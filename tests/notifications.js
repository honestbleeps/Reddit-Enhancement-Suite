module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages/#res:settings/troubleshooter')
			.refresh() // get the update notification out of the way
			.waitForElementVisible('#RESConsoleContainer')
			.click('#testTemplates')
			.assert.containsText('.RESNotification .RESNotificationHeader', 'Template test')
			.end();
	},
};
