/* eslint-disable no-unused-expressions */

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
	'press escape to close': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver doesn't support elementSendKeys https://github.com/mozilla/geckodriver/issues/159
			browser.end();
			return;
		}

		browser
			.url('https://www.reddit.com/wiki/pages#res:settings')
			.waitForElementVisible('#RESConsoleContainer')
			.keys([browser.Keys.ESCAPE])
			.waitForElementNotVisible('#RESConsoleContainer', 1000)
			.end();
	},
	'change boolean option': browser => {
		browser
			.url('https://www.reddit.com/#res:settings/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')

			// initial state, no options changed
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// enable keepLoggedIn
			.click('#keepLoggedInContainer')
			.assert.cssClassNotPresent('#moduleOptionsSave', 'optionsSaved', 'options staged')

			// click save
			.click('#moduleOptionsSave')
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// refresh and ensure that the option was saved
			.refresh()
			.waitForElementVisible('#RESConsoleContainer')
			.perform(() => {
				browser.expect.element('#keepLoggedIn').selected;
			})
			.end();
	},
	'change enum option': browser => {
		browser
			.url('https://www.reddit.com/#res:settings/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')

			// initial state, no options changed
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')
			.perform(() => {
				browser.expect.element('#dropDownStyle-0').selected;
			})

			// select "simple arrow" dropdown style
			.click('#dropDownStyle-1')
			.assert.cssClassNotPresent('#moduleOptionsSave', 'optionsSaved', 'options staged')

			// click save
			.click('#moduleOptionsSave')
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// refresh and ensure that the option was saved
			.refresh()
			.waitForElementVisible('#RESConsoleContainer')
			.perform(() => {
				browser.expect.element('#dropDownStyle-1').selected;
			})
			.end();
	},
	'change text option': browser => {
		browser
			.url('https://www.reddit.com/#res:settings/quickMessage')
			.waitForElementVisible('#RESConsoleContainer')

			// initial state, no options changed
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// set a value for defaultSubject
			.setValue('#defaultSubject', ['test subject'])
			.assert.cssClassNotPresent('#moduleOptionsSave', 'optionsSaved', 'options staged')

			// click save
			.click('#moduleOptionsSave')
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// refresh and ensure that the option was saved
			.refresh()
			.waitForElementVisible('#RESConsoleContainer')
			.assert.value('#defaultSubject', 'test subject')
			.end();
	},
	'change table option': browser => {
		browser
			.url('https://www.reddit.com/#res:settings/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')

			// initial state, no options changed
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// add row
			.click('#optionContainer-accountSwitcher-accounts .addRowButton')
			.setValue('#accounts_accountSwitcherUsername_1', ['test'])
			.assert.cssClassNotPresent('#moduleOptionsSave', 'optionsSaved', 'options staged')

			// click save
			.click('#moduleOptionsSave')
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// refresh and ensure that the option was saved
			.refresh()
			.waitForElementVisible('#RESConsoleContainer')
			.assert.value('#accounts_accountSwitcherUsername_0', 'test')
			.end();
	},
};
