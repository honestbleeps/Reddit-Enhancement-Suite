module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5lc3yw/test_xpost_links_xpost_renhancement/')
			.waitForElementVisible('#thing_t3_5lc3yw')
			.assert.containsText('#thing_t3_5lc3yw .tagline', 'x-posted from /r/Enhancement')
			.end();
	},
};
