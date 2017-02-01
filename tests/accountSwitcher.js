module.exports = {
	'displays accounts in dropdown': browser => {
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
};
