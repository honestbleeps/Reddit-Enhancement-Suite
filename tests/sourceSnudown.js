module.exports = {
	'source of self posts': browser => {
		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5cmspt/')
			.waitForElementVisible('#siteTable')
			.click('.thing.link .viewSource a')
			.waitForElementVisible('.thing.link .viewSource textarea')
			.assert.containsText('.thing.link .viewSource textarea', 'Self post text')
			.end();
	},
	'can use source button more than once on a page': browser => {
		const first = '.thing.id-t1_d9xbmol';
		const second = '.thing.id-t1_d9xbmrf';

		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5claa9/')
			.waitForElementVisible('.commentarea')

			.click(`${first} .viewSource a`)
			.waitForElementVisible(`${first} .viewSource textarea`)
			.assert.containsText(`${first} .viewSource textarea`, 'Comment 1')

			.click(`${second} .viewSource a`)
			.waitForElementVisible(`${second} .viewSource textarea`)
			.assert.containsText(`${second} .viewSource textarea`, 'Comment 2')

			.end();
	},
	'unicode permalinks': browser => {
		const comment = '.thing.id-t1_dbdw7vk';

		browser
			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5j7fmf/handling_of_unicode_characters_%E0%B8%94%E0%B8%94%E0%B8%94/')
			.waitForElementVisible('.commentarea')
			.click(`${comment} .viewSource a`)
			.waitForElementVisible(`${comment} .viewSource textarea`)
			.assert.containsText(`${comment} .viewSource textarea`, 'Source of first comment');
	},
	'ignores link posts': browser => {
		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/comments/5t9uo9/source_snudown_link_post/')
			.waitForElementVisible('#RESSettingsButton')
			.pause(1000)
			.assert.visible('.thing.link')
			.assert.elementNotPresent('.thing.link .viewSource')
			.end();
	},
};
