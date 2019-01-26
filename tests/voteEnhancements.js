module.exports = {
	'color comment score': browser => {
		const rootComment = '#thing_t1_dbkkubr';
		const childComment = '#thing_t1_dbhdj53';
		const color = browser.options.desiredCapabilities.browserName === 'firefox' ? 'rgb(110, 155, 192)' : 'rgba(110, 155, 192, 1)';

		browser
			.url('https://en.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/voteEnhancements')
			.waitForElementVisible('#RESConsoleContainer')
			// enable colorCommentScore user-defined coloration
			.click('#colorCommentScore input[value=user]')
			.click('#moduleOptionsSave')

			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5jmvjf/vote_enhancements/')
			// root level comment, visible at start
			.waitForElementVisible(`${rootComment} > .entry > .tagline`)
			.assert.cssProperty(`${rootComment} > .entry > .tagline .score.unvoted`, 'color', color)
			// reveal child of stickied comment
			.click('#more_t1_dbhdj53')
			.waitForElementVisible(`${childComment} > .entry > .tagline`)
			.assert.cssProperty(`${childComment} > .entry > .tagline .score.unvoted`, 'color', color)

			.end();
	},
};
