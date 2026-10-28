module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/spamButton')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5ui5yr/spam_button/')
			.waitForElementVisible('#siteTable')
			.assert.attributeContains('.thing.link .buttons a.option', 'href', '/message/compose?to=/r/reddit.com&subject=spam&message=https://en.reddit.com/user/erikdesjardins')
			.end();
	},
};
