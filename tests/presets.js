module.exports = {
	'clean slate preset': browser => {
		browser
			.url('https://en.reddit.com/r/RESIntegrationTests/?limit=1#res:settings/presets')
			.waitForElementVisible('#RESConsoleContainer')
			.assert.elementPresent('.res-toggle-filterline-visibility', 'filterline appears by default')

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
