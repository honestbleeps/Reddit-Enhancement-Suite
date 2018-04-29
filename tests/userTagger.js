module.exports = {
	'basic functionality': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// marionette crashes on setValue
			browser.end();
			return;
		}

		const post = '#thing_t3_5sgqzh';
		const parentComment = '#thing_t1_ddewo4n';
		const childComment = '#thing_t1_ddewo8t';
		const loadChildComment = '#more_t1_ddewo8t';

		function tag(thingSelector) {
			return `${thingSelector} > .entry .tagline .userTagLink`;
		}

		browser
			// tag icon appears correctly
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5sgqzh/user_tagger/?limit=1')
			.waitForElementVisible(tag(post), 'post icon tag visible')
			.waitForElementVisible(tag(parentComment), 'parent comment tag icon visible')
			.click(loadChildComment)
			.waitForElementVisible(tag(childComment), 'child comment tag icon visible')

			// tags work for newly loaded comments
			.refresh()
			.waitForElementVisible(tag(post))
			.click(tag(post))
			.assert.visible('#userTaggerToolTip')
			.setValue('#userTaggerToolTip #userTaggerText', ['test tag'])
			.click('#userTaggerSave')
			.click(loadChildComment)
			.waitForElementVisible(tag(childComment))
			.assert.containsText(tag(childComment), 'test tag')

			// works in post listings
			.url('https://en.reddit.com/by_id/t3_5sgqzh')
			.waitForElementVisible(tag(post))
			.assert.containsText(tag(post), 'test tag')

			// cli
			.keys(['.'])
			.assert.visible('#keyCommandLineWidget')
			.keys(['tag tag via cli'])
			.waitForElementVisible('#keyCommandInputTip:not(:empty)')
			.keys([browser.Keys.ENTER])
			.assert.containsText(tag(post), 'tag via cli')
			.end();
	},
};
