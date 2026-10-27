module.exports = {
	'basic functionality': browser => {
		const mediaUrls = [
			['https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fypujqousa1yh1.jpeg', 'i.redd.it'],
			['https://www.reddit.com/media/?url=https%3A%2F%2Fi.redd.it%2Fexample.jpg', 'i.redd.it'],
			['https://reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fexample.jpg', 'i.redd.it'],
			['https://www.reddit.com/media?url=https%3A%2F%2Fpreview.redd.it%2Fexample.jpg', 'preview.redd.it'],
			['https://www.reddit.com/media?url=https%3A%2F%2Fexternal-preview.redd.it%2Fexample.jpg', 'external-preview.redd.it'],
			['https://www.reddit.com/media?url=https%3A%2F%2Fv.redd.it%2Fexample', 'v.redd.it'],
		];

		browser
			.url('https://en.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/oldRedditRedirect')
			.waitForElementVisible('#RESConsoleContainer')
			.click('.moduleToggle')
			.url('https://www.reddit.com/r/Enhancement/?sort=new#comments')
			.pause(1000)
			.assert.urlEquals('https://old.reddit.com/r/Enhancement/?sort=new#comments');

		for (const [mediaUrl, targetHostname] of mediaUrls) {
			browser
				.url(mediaUrl)
				.pause(1000)
				.url(result => {
					const finalHostname = new URL(result.value).hostname;

					browser.assert.ok(
						['reddit.com', 'www.reddit.com', targetHostname].includes(finalHostname),
						`${mediaUrl} is not redirected to old Reddit`,
					);
				});
		}

		browser
			.url('https://www.reddit.com/media?url=not-a-url')
			.pause(1000)
			.url(result => {
				browser.assert.ok(
					new URL(result.value).hostname === 'www.reddit.com',
					'malformed media targets are not redirected to old Reddit',
				);
			})
			.end();
	},
};
