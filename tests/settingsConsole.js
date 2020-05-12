/* eslint-disable no-unused-expressions */

module.exports = {
	'opens on links to #res:settings': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages#res:settings')
			.waitForElementVisible('#console-container')
			.end();
	},
	'opens on old-style links to #!settings and redirects to new style': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages#!settings')
			.waitForElementVisible('#console-container')
			.assert.urlContains('https://en.reddit.com/wiki/pages#res:settings')
			.end();
	},
	'change boolean option': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')

			// initial state, no options changed
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// enable keepLoggedIn
			.click('#keepLoggedInContainer')
			.assert.not.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options staged')

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
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')

			// initial state, no options changed
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')
			.perform(() => {
				browser.expect.element('#dropDownStyle-0').selected;
			})

			// select "simple arrow" dropdown style
			.click('#dropDownStyle-1')
			.assert.not.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options staged')

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
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// marionette crashes on setValue
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/quickMessage')
			.waitForElementVisible('#RESConsoleContainer')

			// initial state, no options changed
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// set a value for defaultSubject
			.setValue('#defaultSubject', ['test subject'])
			.pause(1000)
			.assert.not.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options staged')

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
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// marionette crashes on setValue
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')

			// initial state, no options changed
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// add row
			.click('#optionContainer-accountSwitcher-accounts .addRowButton')
			.setValue('#accounts_accountSwitcherUsername_1', ['test'])
			.pause(1000)
			.assert.not.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options staged')

			// click save
			.click('#moduleOptionsSave')
			.assert.cssClassPresent('#moduleOptionsSave', 'optionsSaved', 'options not staged')

			// refresh and ensure that the option was saved
			.refresh()
			.waitForElementVisible('#RESConsoleContainer')
			.assert.value('#accounts_accountSwitcherUsername_0', 'test')
			.end();
	},
	'disabling a module': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/wheelBrowse')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.cssClassPresent('.moduleToggle', 'enabled')
			.click('.moduleToggle')
			.assert.not.cssClassPresent('.moduleToggle', 'enabled')
			.refresh()
			.waitForElementVisible('#RESConsoleContainer')
			.assert.not.cssClassPresent('.moduleToggle', 'enabled')
			.end();
	},
	'adding a row to table option doesn\'t duplicate value': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// geckodriver treats `value` of empty inputs incorrectly
			browser.end();
			return;
		}

		browser
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')
			.click('#optionContainer-accountSwitcher-accounts .addRowButton')
			.setValue('#accounts_accountSwitcherUsername_1', ['test'])
			.click('#moduleOptionsSave')
			.refresh()
			.waitForElementVisible('#RESConsoleContainer')
			.click('#optionContainer-accountSwitcher-accounts .addRowButton')
			.assert.value('#accounts_accountSwitcherUsername_0', 'test')
			.assert.value('#accounts_accountSwitcherUsername_2', '')
			.end();
	},
	'color options are revealed when changing the option they depend on': browser => {
		browser
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/commentQuickCollapse')
			.waitForElementVisible('#RESConsoleContainer')
			.waitForElementNotVisible('#optionContainer-commentQuickCollapse-leftEdgeColor')
			.click('#toggleCommentsOnClickLeftEdgeContainer')
			.assert.visible('#optionContainer-commentQuickCollapse-leftEdgeColor')
			.end();
	},
};
