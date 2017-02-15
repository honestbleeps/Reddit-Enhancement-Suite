module.exports = {
	'selecting on comments page': browser => {
		const selectedClass = 'RES-keyNav-activeThing';
		const parentPost = '#thing_t3_5lfy0v';
		const stickiedComment = '#thing_t1_dbvc8xr';
		const childComment1 = '#thing_t1_dbvc9il';
		const childComment2 = '#thing_t1_dbvc9kg';
		const childOfStickiedComment1 = '#thing_t1_dbvc99w';
		const childOfStickiedComment2 = '#thing_t1_dbvc9gt';
		const loadMoreComments = `${childComment2} .morecomments a`;
		const loadMoreChildrenOfSticky = `${childOfStickiedComment1} .morecomments a`;

		browser
			// Geckodriver has this wonderful issue where it doesn't support manually moving the mouse
			// (the moveTo command), but after the click command it continues to hover on the same spot
			// that was clicked.
			// In this test, that behaviour causes the user hover info to appear after loading more comments,
			// which breaks everything by covering up the comments we need to click on.
			// It's too difficult to work around, so just disable user info entirely.
			.url('https://www.reddit.com/wiki/pages#res:settings/userInfo')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')

			// Run the actual test...
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5lfy0v/selected_entry_selecting_comments/?limit=1')

			.waitForElementVisible(parentPost)
			.assert.cssClassPresent(parentPost, selectedClass)

			.click(`${stickiedComment} .usertext`) // avoid clicking "hide child comments"
			.assert.cssClassPresent(stickiedComment, selectedClass)

			.pause(1000)
			.click(loadMoreComments)
			.waitForElementVisible(childComment1)
			.assert.cssClassPresent(childComment1, selectedClass)

			.click(childComment2)
			.assert.cssClassPresent(childComment2, selectedClass)

			.pause(1000)
			.click(loadMoreChildrenOfSticky)
			.waitForElementVisible(childOfStickiedComment2)
			.assert.cssClassPresent(childOfStickiedComment1, selectedClass)

			.click(childOfStickiedComment2)
			.assert.cssClassPresent(childOfStickiedComment2, selectedClass)

			.end();
	},
};
