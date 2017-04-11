module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages/#res:settings/commentDepth')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')
			// link with insufficient comments
			.url('https://www.reddit.com/by_id/t3_64tk5y')
			.waitForElementVisible('.thing.link')
			.click('.thing.link .comments')
			.waitForElementVisible('.thing.link')
			.assert.urlEquals('https://www.reddit.com/r/RESIntegrationTests/comments/64tk5y/comment_depth_insufficient_comments/')
			// link with sufficient comments
			.url('https://www.reddit.com/by_id/t3_64thjt')
			.waitForElementVisible('.thing.link')
			.click('.thing.link .comments')
			.waitForElementVisible('.thing.link')
			.assert.urlEquals('https://www.reddit.com/r/RESIntegrationTests/comments/64thjt/comment_depth/?depth=4')
			// link with its own depth specified
			.waitForElementVisible('.thing.link')
			.click('.thing.link .md a')
			.waitForElementVisible('.thing.link')
			.assert.urlEquals('https://www.reddit.com/r/RESIntegrationTests/comments/64thjt/comment_depth/?depth=10000')
			.end();
	},
};
