module.exports = {
	'opens on links to #res:settings': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages#res:settings')
			.waitForElementVisible('#RESConsoleContainer')
			.end();
	},
	'opens on old-style links to #!settings and redirects to new style': browser => {
		browser
			.url('https://www.reddit.com/wiki/pages#!settings')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.urlEquals('https://www.reddit.com/wiki/pages#res:settings/about')
			.end();
	},
};
