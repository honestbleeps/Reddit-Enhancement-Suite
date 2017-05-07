module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages/#res:settings/spamButton')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5ui5yr/spam_button/')
			.waitForElementVisible('#siteTable')
			.assert.attributeContains('.thing.link .buttons a.option', 'href', '/r/spam/submit?url=https://www.reddit.com/user/erikdesjardins')
			.end();
	},
};
