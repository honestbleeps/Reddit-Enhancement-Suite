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
		const seenTips = new Set();

		browser
			.url('https://www.reddit.com/?limit=1')
			.perform(function checkNext(browser, done) {
				browser
					.waitForElementPresent('.guider')
					.execute(`
						return Array.from(document.querySelectorAll('.guiders_description')).slice(-1)[0].textContent;
					`, [], ({ value: textContent }) => {
							if (!textContent) {
								browser.assert.fail('tip is empty');
								return;
							}

							if (seenTips.has(textContent)) {
								browser.assert.equal(seenTips.size, 21, 'saw all tips');
								browser.end();
								return;
							}

							seenTips.add(textContent);

							browser
								.execute('document.querySelector(".guiders_button").click()') // button may not be in viewport
								.execute('document.querySelector(".guider").remove()')
								.perform(checkNext);
						});

				done();
			})
			.end();
	},
};
