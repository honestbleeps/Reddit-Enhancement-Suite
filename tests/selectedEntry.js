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
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5lfy0v/selected_entry_selecting_comments/?limit=1')

			.waitForElementVisible(parentPost)
			.assert.cssClassPresent(parentPost, selectedClass)

			.click(`${stickiedComment} .usertext`) // avoid clicking "hide child comments"
			.assert.cssClassPresent(stickiedComment, selectedClass)

			.click(loadMoreComments)
			.waitForElementVisible(childComment1)
			.assert.cssClassPresent(childComment1, selectedClass)

			.click(childComment2)
			.assert.cssClassPresent(childComment2, selectedClass)

			.click(loadMoreChildrenOfSticky)
			.waitForElementVisible(childOfStickiedComment2)
			.assert.cssClassPresent(childOfStickiedComment1, selectedClass)

			.click(childOfStickiedComment2)
			.assert.cssClassPresent(childOfStickiedComment2, selectedClass)

			.end();
	},
};
