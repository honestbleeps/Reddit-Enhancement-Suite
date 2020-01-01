module.exports = {
	'daily tips shows on first load, featureTip when feature used first time': browser => {
		browser
			.url('https://en.reddit.com/?limit=1')
			.waitForElementVisible('.guider.res-ordinaryTip')
			.assert.containsText('.guider', 'Welcome to RES')
			.pause(5000)
			.refresh()
			.waitForElementVisible('.res-toggle-filterline-visibility')
			.click('.res-toggle-filterline-visibility')
			.waitForElementVisible('.guider.res-featureTip')
			.click('.guiders_x_button')
			.refresh()
			.waitForElementVisible('.res-toggle-filterline-visibility')
			.click('.res-toggle-filterline-visibility')
			.pause(2000)
			.assert.not.elementPresent('.guider.res-featureTip')
			.end();
	},
	'click through all tips': browser => {
		const seenTips = new Set();

		browser
			.url('https://en.reddit.com/?limit=1')
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
