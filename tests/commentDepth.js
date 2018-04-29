module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages/#res:settings/commentDepth')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')
			// link with insufficient comments
			.url('https://en.reddit.com/by_id/t3_64tk5y')
			.waitForElementVisible('.thing.link')
			.click('.thing.link .comments')
			.waitForElementVisible('.thing.link')
			.pause(1000)
			.assert.urlEquals('https://en.reddit.com/r/RESIntegrationTests/comments/64tk5y/comment_depth_insufficient_comments/')
			// link with sufficient comments
			.url('https://en.reddit.com/by_id/t3_64thjt')
			.waitForElementVisible('.thing.link')
			.click('.thing.link .comments')
			.waitForElementVisible('.thing.link')
			.pause(1000)
			.assert.urlEquals('https://en.reddit.com/r/RESIntegrationTests/comments/64thjt/comment_depth/?depth=4')
			// link with its own depth specified
			.waitForElementVisible('.thing.link')
			.click('.thing.link .md a')
			.waitForElementVisible('.thing.link')
			.pause(1000)
			.assert.urlEquals('https://en.reddit.com/r/RESIntegrationTests/comments/64thjt/comment_depth/?depth=10000')
			.end();
	},
};
