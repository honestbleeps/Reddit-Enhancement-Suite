module.exports = {
	'daily tips shows on first load, feature tips on second': browser => {
		browser
			.url('https://www.reddit.com/?limit=1')
			.waitForElementVisible('.guider.res-ordinaryTip')
			.assert.containsText('.guider', 'Welcome to RES')
			.refresh()
			.waitForElementVisible('.guider.res-featureTip')
			.end();
	},
	'click through all tips': browser => {
		let initialTextContent;

		browser
			.url('https://www.reddit.com/?limit=1')
			.waitForElementVisible('.guider')
			.perform(function checkNext(browser, done) {
				browser
					.execute(`
						const last = Array.from(document.querySelectorAll('.guider')).slice(-1)[0];
						return [last.id, last.textContent];
					`, [], ({ value: [id, textContent] }) => {
						if (!initialTextContent) {
							initialTextContent = textContent;
						} else if (initialTextContent === textContent) {
							browser.end();
							return;
						}

						browser
							.click(`[id="${id}"] .guiders_button`)
							.perform(checkNext);
					});

				done();
			})
		.end();
	},
};
