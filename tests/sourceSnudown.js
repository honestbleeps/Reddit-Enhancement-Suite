module.exports = {
	'source of self posts': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5cmspt/')
			.waitForElementVisible('#siteTable', 1000)
			.click('.thing.link .viewSource a')
			.waitForElementVisible('.thing.link .viewSource textarea', 5000)
			.assert.containsText('.thing.link .viewSource textarea', 'Self post text')
			.end();
	},
	'can use source button more than once on a page': browser => {
		const first = '.thing.id-t1_d9xbmol';
		const second = '.thing.id-t1_d9xbmrf';

		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5claa9/')
			.waitForElementVisible('.commentarea', 1000)

			.click(`${first} .viewSource a`)
			.waitForElementVisible(`${first} .viewSource textarea`, 5000)
			.assert.containsText(`${first} .viewSource textarea`, 'Comment 1')

			.click(`${second} .viewSource a`)
			.waitForElementVisible(`${second} .viewSource textarea`, 5000)
			.assert.containsText(`${second} .viewSource textarea`, 'Comment 2')

			.end();
	},
};
