module.exports = {
	'ignores source textareas': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5uicy8/comment_tools/')
			.waitForElementVisible('#siteTable')
			.click('.thing.link .viewSource a')
			.waitForElementVisible('.thing.link .viewSource textarea')
			.click('.thing.link .viewSource textarea')
			.assert.elementNotPresent('.markdownEditor-wrapper')
			.assert.elementNotPresent('.livePreview')
			.end();
	},
};
