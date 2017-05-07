module.exports = {
	'displays accounts in dropdown': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// marionette crashes on setValue
			browser.end();
			return;
		}

		const username = 'this_username_is_too_long';

		browser
			.url('https://www.reddit.com/wiki/pages#res:settings/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')
			.click('#optionContainer-accountSwitcher-accounts .addRowButton')
			.setValue('#optionContainer-accountSwitcher-accounts input', [username])
			.click('#moduleOptionsSave')

			.url('https://en.reddit.com/r/RESIntegrationTests/wiki/pages')
			.waitForElementVisible('#RESAccountSwitcherIcon')
			.click('#RESAccountSwitcherIcon')
			.assert.visible('#RESAccountSwitcherDropdown')
			.assert.containsText('#RESAccountSwitcherDropdown', username)
			.assert.containsText('#RESAccountSwitcherDropdown', 'add account')
			.end();
	},
	'errors on invalid username/password': browser => {
		if (browser.options.desiredCapabilities.browserName === 'firefox') {
			// marionette crashes on setValue
			browser.end();
			return;
		}

		const username = 'this_username_is_too_long';

		browser
			.url('https://www.reddit.com/wiki/pages#res:settings/accountSwitcher')
			.waitForElementVisible('#RESConsoleContainer')
			.click('#optionContainer-accountSwitcher-accounts .addRowButton')
			.setValue('#optionContainer-accountSwitcher-accounts input', [username])
			.click('#moduleOptionsSave')

			.url('https://en.reddit.com/r/RESIntegrationTests/wiki/pages')
			.waitForElementVisible('#RESAccountSwitcherIcon')
			.click('#RESAccountSwitcherIcon')
			.click('#RESAccountSwitcherDropdown .accountName')
			.waitForElementVisible('#alert_message')
			.assert.containsText('#alert_message', `Could not log in as ${username}`)
			.end();
	},
};
