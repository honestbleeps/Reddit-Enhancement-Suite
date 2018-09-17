module.exports = {
	'clean slate preset': browser => {
		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/?limit=1')
			.waitForElementVisible('#RESSettingsButton')
			.assert.elementPresent('.res-toggle-filterline-visibility', 'filterline appears by default')

			.url('https://en.reddit.com/wiki/pages/#res:settings-redirect-standalone-options-page/presets')
			.waitForElementVisible('#RESConsoleContainer')
			.click('#cleanSlate button')
			.setAlertText('yes')
			.acceptAlert() // "do you want to apply preset"
			.dismissAlert() // "do you want to reload"

			.url('https://en.reddit.com/r/RESIntegrationTests/?limit=1')
			.waitForElementVisible('#RESSettingsButton')
			.pause(1000)
			.assert.elementNotPresent('.res-toggle-filterline-visibility', 'cleanslate disables filterline')

			.end();
	},
};
