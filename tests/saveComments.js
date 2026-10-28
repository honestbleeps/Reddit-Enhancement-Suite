module.exports = {
	'save two comments': browser => {
		const first = '.thing.id-t1_datqb30';
		const second = '.thing.id-t1_datqbao';

		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5go51r/ressaving_comments/')
			.waitForElementVisible('.commentarea')

			// save first comment
			.click(`${first} .saveComments`)
			.refresh()

			// save second comment
			.click(`${second} .saveComments`)

			// go to saved comments page
			.pause(100)
			.click(`${second} .saveComments`)
			.pause(1000)
			.waitForElementVisible('.res-savedComment [href^="https://en.reddit.com/r/RESIntegrationTests/comments/5go51r/ressaving_comments/datqb30"]')
			.waitForElementVisible('.res-savedComment [href^="https://en.reddit.com/r/RESIntegrationTests/comments/5go51r/ressaving_comments/datqbao"]')
			.end();
	},
};
