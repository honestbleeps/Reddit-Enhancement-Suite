/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const fs = require('fs');

const chromeManifest = require('./chrome/manifest.json');

const chromePackage = fs.readFileSync('dist/zip/chrome.zip').toString('base64');

module.exports = {
	src_folders: ['tests'],
	test_settings: {
		default: {
			selenium_host: 'ondemand.saucelabs.com',
			selenium_port: 80,
			username: process.env.SAUCE_USERNAME,
			access_key: process.env.SAUCE_ACCESS_KEY,
			desiredCapabilities: {
				browserName: 'chrome',
				version: chromeManifest.minimum_chrome_version,
				chromeOptions: {
					args: ['--no-sandbox'],
					extensions: [chromePackage],
				},
			},
		},
	},
};
