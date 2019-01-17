module.exports = {
	'displays accounts in dropdown': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// marionette crashes on setValue
			browser.end();
			return;
		}

		const username = 'this_username_is_too_long';

		browser
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')
			.refresh() // get rid of update notification
			.click('#optionContainer-accountSwitcher-accounts .addRowButton')
			.setValue('#optionContainer-accountSwitcher-accounts input', [username])
			.click('#moduleOptionsSave')

			.url('https://en.reddit.com/r/RESIntegrationTests/wiki/pages')
			.waitForElementVisible('#RESAccountSwitcherIcon')
			.click('#RESAccountSwitcherIcon')
			.waitForElementVisible('.RESAccountSwitcherDropdown')
			.assert.containsText('.RESAccountSwitcherDropdown', username)
			.assert.containsText('.RESAccountSwitcherDropdown', 'add account')
			.end();
	},
	'errors on invalid username/password': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// marionette crashes on setValue
			browser.end();
			return;
		}

		const password = 'this_is_the_wrong_password';
		const username = 'this_username_is_too_long_anyway';

		browser
			.url('https://en.reddit.com/wiki/pages#res:settings-redirect-standalone-options-page/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')
			.refresh() // get rid of update notification
			.click('#optionContainer-accountSwitcher-accounts .addRowButton')
			.setValue('#optionContainer-accountSwitcher-accounts input[type=text]', [username])
			.setValue('#optionContainer-accountSwitcher-accounts input[type=password]', [password])
			.click('#moduleOptionsSave')

			.url('https://en.reddit.com/r/RESIntegrationTests/wiki/pages')
			.waitForElementVisible('#RESAccountSwitcherIcon')
			.click('#RESAccountSwitcherIcon')
			.waitForElementVisible('.RESAccountSwitcherDropdown')
			.click('.RESAccountSwitcherDropdown .accountName')
			.waitForElementVisible('#alert_message')
			.assert.containsText('#alert_message', `Could not log in as ${username}`)
			.end();
	},
};
