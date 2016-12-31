module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5lc3yw/test_xpost_links_xpost_renhancement/')
			.waitForElementVisible('#thing_t3_5lc3yw')
			.assert.containsText('#thing_t3_5lc3yw .tagline', 'x-posted from /r/Enhancement')
			.end();
	},
	'subreddit too long': browser => {
		browser
			// /r/ style
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5lc6gz/subreddit_name_too_long_xpost_rthis_subreddit/')
			.waitForElementVisible('#thing_t3_5lc6gz', () => {
				browser.expect.element('#thing_t3_5lc6gz .tagline').text.not.contain('x-posted from');
			})
			// implicit `(xposted from enhancement)` style
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5lc74s/xpost_this_subreddit_name_is_too_long/')
			.waitForElementVisible('#thing_t3_5lc74s', () => {
				browser.expect.element('#thing_t3_5lc74s .tagline').text.not.contain('x-posted from');
			})
			.end();
	},
};
