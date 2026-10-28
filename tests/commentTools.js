module.exports = {
	'ignores source textareas': browser => {
		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5uicy8/comment_tools/')
			.waitForElementVisible('#siteTable')
			.click('.thing.link .viewSource a')
			.waitForElementVisible('.thing.link .viewSource textarea')
			.click('.thing.link .viewSource textarea')
			.assert.not.elementPresent('.markdownEditor-wrapper')
			.assert.not.elementPresent('.livePreview')
			.end();
	},
};
