module.exports = {
	'basic functionality': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/oldRedditRedirect')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')
			.url('https://www.reddit.com/r/Enhancement/?sort=new#comments')
			.pause(1000)
			.assert.urlEquals('https://old.reddit.com/r/Enhancement/?sort=new#comments')
			.end();
	},
};
