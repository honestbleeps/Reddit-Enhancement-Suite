/* eslint-disable camelcase */

module.exports = {
	'highlight OP and first commenter': browser => {
		const a = '#thing_t1_dcsum4i .author';
		const a_b = '#thing_t1_dcsuno9 .author';
		const a_b_a = '#thing_t1_dcsuo1b .author';
		const a_b_a_b = '#thing_t1_dcsuore .author';
		const b = '#thing_t1_dcsum2x .author';
		const b_a = '#thing_t1_dcsumjp .author';
		const b_a_b = '#thing_t1_dcsunhx .author';
		const b_a_b_a = '#thing_t1_dcsuob0 .author';

		const isFirefox = browser.options.desiredCapabilities.browserName === 'firefox';
		function c(r, g, b) {
			return isFirefox ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, 1)`;
		}
		const opColor = c(0, 85, 223);
		const firstCommenterColor = c(70, 182, 204);
		const transparent = 'rgba(0, 0, 0, 0)';

		browser
			.url('https://www.reddit.com/wiki/pages/#res:settings/userHighlight')
			.waitForElementVisible('#RESConsoleContainer')
			.click('#highlightFirstCommenterContainer')
			.click('#moduleOptionsSave')

			.url('https://www.reddit.com/r/RESIntegrationTests/comments/5pp8jz/highlight_first_commenter/')
			.waitForElementVisible('.commentarea')
			.assert.cssProperty(a, 'background-color', opColor)
			.assert.cssProperty(a_b, 'background-color', transparent)
			.assert.cssProperty(a_b_a, 'background-color', firstCommenterColor)
			.assert.cssProperty(a_b_a_b, 'background-color', transparent)
			.assert.cssProperty(b, 'background-color', transparent)
			.assert.cssProperty(b_a, 'background-color', opColor)
			.assert.cssProperty(b_a_b, 'background-color', firstCommenterColor)
			.assert.cssProperty(b_a_b_a, 'background-color', opColor)
			.end();
	},
};
