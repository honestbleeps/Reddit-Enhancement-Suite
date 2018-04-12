let hideInfocard = true;

function initialize(browser, done) {
	browser
		.waitForElementVisible('.res-toggle-filterline-visibility')
		// Guiders and infocards have an unfortunate tendancy to hide the interface
		.execute(`
			document.head.innerHTML += '<style>.guider${hideInfocard ? ', .RESHover' : ''} { display: none !important; }</style>';
		`);

	done();
}

const cardButton = '.res-filterline-filter-hover-button';
const filter = '.res-filterline-filters .res-filterline-filter';
let tempAdditionalFilterSelector;

function switchActiveState(browser, done) {
	browser
		.execute(`
			const element = document.querySelector('${filter}${tempAdditionalFilterSelector}');
			element.click();
			if (!element.classList.contains('res-filterline-filter-active')) element.click();
		`);

	done();
}

module.exports = {
	'basic usage': browser => {
		const normalPost = '#thing_t3_6331zg';
		const nsfwPost = '#thing_t3_63320d';

		browser
			.url('https://www.reddit.com/by_id/t3_6331zg,t3_63320d')
			.perform(initialize)
			.assert.elementNotPresent('.res-filterline')
			.assert.visible(normalPost)
			.assert.visible(nsfwPost)
			.click('.res-toggle-filterline-visibility')
			.assert.visible('.res-filterline')
			.assert.visible(normalPost)
			.assert.visible(nsfwPost)
			.click(`${filter}[type="isNSFW"]`)
			.waitForElementNotVisible(normalPost)
			.assert.visible(nsfwPost)
			.click(`${filter}[type="isNSFW"]`)
			.waitForElementNotVisible(nsfwPost)
			.assert.visible(normalPost)
			.click(`${filter}[type="isNSFW"]`)
			.assert.visible(normalPost)
			.assert.visible(nsfwPost)
			.end();
	},
	'externalFilter toggling & deletion': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// hovering is apparently too hard
			browser.end();
			return;
		}

		const thing = '#thing_t3_5nacp4';

		browser
			// add a domain filter
			.url('https://www.reddit.com/wiki/pages/#res:settings/filteReddit')
			.refresh() // get rid of update notification
			.waitForElementVisible('#RESConsoleContainer')
			.click('#optionContainer-filteReddit-domains .addRowButton')
			.setValue('#optionContainer-filteReddit-domains input', ['youtube.com'])
			.click('#moduleOptionsSave')

			// navigate to site matching filter
			.url('https://www.reddit.com/by_id/t3_5nacp4')
			.perform(initialize)
			.assert.hidden(thing)

			// disable domains filter
			.click('.res-toggle-filterline-visibility')
			.waitForElementVisible('.res-filterline-preamble')
			.click('.res-filterline-preamble')
			.waitForElementVisible('.res-filterline-external')
			.click('.res-filterline-external')
			.click('.res-filterline-external-filter[type="domains"] .toggleButton')
			.waitForElementVisible(thing)

			// disable survives reload
			.refresh()
			.perform(initialize)
			.assert.visible(thing)

			// reenable it
			.click('.res-filterline-preamble')
			.waitForElementVisible('.res-filterline-external')
			.click('.res-filterline-external')
			.click('.res-filterline-external-filter[type="domains"] .toggleButton')
			.waitForElementNotVisible(thing)

			// show filter reason
			.click('.res-filterline-show-reason')
			.waitForElementVisible(`${thing} .res-filter-remove-entry`)
			.assert.visible(thing)
			.click('.res-filterline-show-reason')
			.waitForElementNotPresent(`${thing} .res-filter-remove-entry`)
			.assert.hidden(thing)
			.click('.res-filterline-show-reason')
			.waitForElementVisible(`${thing} .res-filter-remove-entry`)

			// delete filter
			.click('.res-toggle-filterline-visibility') // Hide the dropbox — Firefox evidently can't click when it partially obscures the element
			.waitForElementNotVisible('.res-filterline-show-reason')
			.click('.res-filter-remove-entry')
			.waitForElementNotPresent(`${thing} .res-filter-remove-entry`)
			.refresh()
			.perform(initialize)
			.waitForElementVisible(thing)
			.end();
	},
	ondemand: browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		const thing = '#thing_t3_5nacp4';

		tempAdditionalFilterSelector = '[type="group"]';
		hideInfocard = false;

		browser
			.url('https://www.reddit.com/by_id/t3_5nacp4')
			.perform(initialize)
			.click('.res-toggle-filterline-visibility')
			.waitForElementVisible('.res-filterline-preamble')
			.click('.res-filterline-preamble')
			.waitForElementVisible('.res-filterline-new-basic')
			.click('.res-filterline-new-basic')
			.click('.res-filterline-filter-new[type="postAfter"] .res-filterline-filter-new-from-selected')
			.click('.res-filterline-filter-new[type="username"] .res-filterline-filter-new-from-selected')
			.assert.visible(thing)
			.click('.res-filterline-preamble')
			.click('.res-filterline-new-group')
			.click('.res-filterline-new-group .res-filterline-filter-new')
			.waitForElementVisible(`${filter}${tempAdditionalFilterSelector}`)
			.perform(switchActiveState)
			.waitForElementNotVisible(thing)
			.perform(switchActiveState)
			.waitForElementVisible(thing)
			.moveToElement(`${filter}[type="group"]`, 0, 0)
			.waitForElementVisible(`${cardButton}[action="to-ondemand"]`)
			.click(`${cardButton}[action="to-ondemand"]`)
			.perform(switchActiveState)
			.waitForElementNotVisible(thing)

			// ensure that the filters persists on reload
			.refresh()
			.waitForElementNotVisible(thing)
			.end();
	},
	cli: browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		const thing = '#thing_t3_5nacp4';

		browser
			.url('https://www.reddit.com/by_id/t3_5nacp4')
			.perform(initialize)
			.keys(['f'])
			.waitForElementVisible('#keyCommandLineWidget')
			.keys(['+=exp', browser.Keys.ENTER])
			.waitForElementVisible(`${filter}[type="hasExpando"].res-filterline-filter-active:last-of-type`)
			.assert.elementNotPresent(`${filter}[type="hasExpando"]:not(.res-filterline-filter-active):first-of-type`)
			.assert.visible(thing)

			// invert state
			.keys(['f'])
			.waitForElementVisible('#keyCommandLineWidget')
			.keys(['!exp', browser.Keys.ENTER])
			.waitForElementNotVisible(thing)

			// clear criterion
			.keys(['f'])
			.waitForElementVisible('#keyCommandLineWidget')
			.keys(['/exp', browser.Keys.ENTER])
			.assert.elementNotPresent(`${filter}[type="hasExpando"].res-filterline-filter-active`)

			.end();
	},
	'from selected entry': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// hovering is apparently too hard
			browser.end();
			return;
		}

		hideInfocard = true;
		const thing = '#thing_t3_5nacp4';
		let types;

		function testNextType(browser, done) {
			const type = types.pop();
			if (type) {
				tempAdditionalFilterSelector = `.res-filterline-filter-active[type="${type}"]`;

				browser
					.click('.res-filterline-preamble')
					.click(`.res-filterline-filter-new[type="${type}"] .res-filterline-filter-new-from-selected`)
					.waitForElementPresent(`${filter}[type="${type}"]`)
					.assert.visible(thing)
					.perform(switchActiveState)
					.waitForElementNotVisible(thing)
					.perform(switchActiveState)
					.waitForElementVisible(thing)
					.perform(testNextType);
			}

			done();
		}

		browser
			.url('https://www.reddit.com/by_id/t3_5nacp4')
			.perform(initialize)
			.click('.res-toggle-filterline-visibility')
			.waitForElementVisible('.res-filterline-preamble')
			.click('.res-filterline-preamble')
			.waitForElementVisible('.res-filterline-new-basic')
			.click('.res-filterline-new-basic')
			.execute(
				'return Array.from(document.querySelectorAll(\'.res-filterline-filter-new-from-selected\')).map(v => v.closest(\'.res-filterline-filter-new\').getAttribute(\'type\'))',
				[],
				({ value }) => { types = value; }
			).perform(testNextType)
			.end();
	},
	'infocard actions': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		hideInfocard = false;

		const normalPost = '#thing_t3_6331zg';
		const nsfwPost = '#thing_t3_63320d';

		browser
			.url('https://www.reddit.com/by_id/t3_6331zg,t3_63320d')
			.perform(initialize)
			.click('.res-toggle-filterline-visibility')
			.waitForElementVisible('.res-filterline-preamble')
			.click('.res-filterline-preamble')
			.waitForElementVisible('.res-filterline-new-group')
			.click('.res-filterline-new-group')

			// Create a new group
			.click('.res-filterline-filter-new[type="group"]')

			// It appears in Filterline
			.waitForElementVisible(`${filter}[type="group"]`)

			// Add a case
			.click('.addBuilderBlock [value="isNSFW"]')
			.waitForElementVisible('.builderBlock[data-type="isNSFW"]')

			// Hide matches
			.waitForElementVisible(`${cardButton}[action="state-false"]`)
			.click(`${cardButton}[action="state-false"]`)
			.waitForElementVisible(normalPost)
			.waitForElementNotVisible(nsfwPost)

			// Show matches
			.waitForElementVisible(`${cardButton}[action="state-true"]`)
			.click(`${cardButton}[action="state-true"]`)
			.waitForElementNotVisible(normalPost)
			.waitForElementVisible(nsfwPost)

			// Hide matches
			.waitForElementVisible(`${cardButton}[action="state-false"]`)
			.click(`${cardButton}[action="state-false"]`)
			.waitForElementVisible(normalPost)
			.waitForElementNotVisible(nsfwPost)

			// State persists on refresh
			.refresh()
			.perform(initialize)
			.waitForElementNotVisible(nsfwPost)
			.waitForElementVisible(normalPost)

			// Remove
			.waitForElementVisible(`${filter}[type="group"]`)
			.moveToElement(`${filter}[type="group"]`, 0, 0)
			.pause(1000)
			.waitForElementVisible(`${cardButton}[action="clear"]`)
			.click(`${cardButton}[action="clear"]`)
			.waitForElementNotVisible(`${cardButton}[action="clear"]`)
			.waitForElementVisible(nsfwPost)
			.end();
	},
	'toggle all filters': browser => {
		const normalPost = '#thing_t3_6331zg';
		const nsfwPost = '#thing_t3_63320d';

		browser
			.url('https://www.reddit.com/by_id/t3_6331zg,t3_63320d')
			.perform(initialize)
			.click('.res-toggle-filterline-visibility')
			.click(`${filter}[type="isNSFW"]`)
			.waitForElementNotVisible(normalPost)
			.assert.visible(nsfwPost)
			.click('.res-filterline-toggle-powered')
			.assert.visible(normalPost)
			.assert.visible(nsfwPost)
			.click('.res-filterline-toggle-powered')
			.assert.hidden(normalPost)
			.assert.visible(nsfwPost)
			.end();
	},
};
