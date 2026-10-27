module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/oldRedditRedirect')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')
			.url('https://www.reddit.com/r/Enhancement/?sort=new#comments')
			.pause(1000)
			.assert.urlEquals('https://old.reddit.com/r/Enhancement/?sort=new#comments')
			.url('https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fexample.jpg')
			.pause(1000)
			.url(result => {
				browser.assert.ok(
					!result.value.startsWith('https://old.reddit.com/media'),
					'i.redd.it media links are not redirected to old Reddit',
				);
			})
			.end();
	},
};
