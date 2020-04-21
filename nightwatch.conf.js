/* @noflow */

/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const fs = require('fs');
const chromeManifest = require('./chrome/manifest.json');
const firefoxManifest = require('./firefox/manifest.json');
const JSZip = require('jszip');

module.exports = {
	src_folders: ['tests'],
	test_workers: {
		enabled: true,
		workers: 5,
	},
	detailed_output: false,
	live_output: true,
	test_settings: {
		default: {
			selenium_host: process.env.SELENIUM_HOST,
			selenium_port: process.env.SELENIUM_PORT,
			username: process.env.SAUCE_USERNAME,
			access_key: process.env.SAUCE_ACCESS_KEY,
			globals: {
				waitForConditionTimeout: 10000,
				afterEach(browser, done) {
					console.log('View results:', `https://saucelabs.com/tests/${browser.capabilities['webdriver.remote.sessionid']}/`);
					done();
				},
			},
		},
		chrome: {
			desiredCapabilities: {
				browserName: 'chrome',
				version: chromeManifest.minimum_chrome_version,
				chromeOptions: {
					args: ['--no-sandbox'],
					extensions: [getChromePackage()],
				},
			},
		},
		firefox: {
			desiredCapabilities: {
				browserName: 'firefox',
				version: 'dev',
				firefox_profile: getFirefoxProfile(),
			},
		},
	},
};

function getChromePackage() {
	return fs.readFileSync('dist/zip/chrome.zip').toString('base64');
}

function getFirefoxProfile() {
	const zip = new JSZip();
	zip.file(`extensions/${firefoxManifest.applications.gecko.id}.xpi`, fs.readFileSync('dist/zip/firefox.zip'));
	zip.file('prefs.js', 'user_pref("xpinstall.signatures.required", false);');
	return zip.generate({ type: 'base64' });
}
