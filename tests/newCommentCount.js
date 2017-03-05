module.exports = {
	'subscribing to threads': browser => {
		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5xkz4j/subscribing_to_threads/')
			.waitForElementVisible('#REScommentSubToggle')
			.assert.containsText('#REScommentSubToggle', 'subscribe')
			.click('#REScommentSubToggle')
			.assert.containsText('#REScommentSubToggle', 'unsubscribe')
			.refresh()
			.assert.containsText('#REScommentSubToggle', 'unsubscribe')
			.end();
	},
};
