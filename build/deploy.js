/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const fs = require('fs');
const path = require('path');
const chromeDeploy = require('chrome-extension-deploy');
const firefoxDeploy = require('firefox-extension-deploy');
const { version } = require('../package.json');
const isBetaVersion = require('./isBetaVersion');

if (isBetaVersion(version)) {
	console.log(`Deploying ${version} beta release...`);

	deployChromeBeta();
	deployFirefox();
} else {
	console.log(`Deploying ${version} stable release...`);

	deployChromeBeta();
	deployChromeStable();
	deployFirefox();
}

function deployChromeBeta() {
	console.log('Deploying Chrome beta...');

	chromeDeploy({
		clientId: process.env.CHROME_CLIENT_ID,
		clientSecret: process.env.CHROME_CLIENT_SECRET,
		refreshToken: process.env.CHROME_REFRESH_TOKEN,
		id: 'flhpapomijliefifkkeepedibpmibbpo',
		zip: fs.readFileSync(path.join(__dirname, '../dist/zip/chrome.zip')),
		to: chromeDeploy.TRUSTED_TESTERS,
	}).then(() => {
		console.log('Chrome beta deployment complete!');
	}, err => {
		console.error('Chrome beta failed:', err);
		process.exitCode = 1;
	});
}

function deployChromeStable() {
	console.log('Deploying Chrome stable...');

	chromeDeploy({
		clientId: process.env.CHROME_CLIENT_ID,
		clientSecret: process.env.CHROME_CLIENT_SECRET,
		refreshToken: process.env.CHROME_REFRESH_TOKEN,
		id: 'kbmfpngjjgdllneeigpgjifpgocmfgmb',
		zip: fs.readFileSync(path.join(__dirname, '../dist/zip/chrome.zip')),
	}).then(() => {
		console.log('Chrome stable deployment complete!');
	}, err => {
		console.error('Chrome stable failed:', err);
		process.exitCode = 1;
	});
}

function deployFirefox() {
	console.log('Deploying Firefox...');

	firefoxDeploy({
		issuer: process.env.FIREFOX_ISSUER,
		secret: process.env.FIREFOX_SECRET,
		id: 'jid1-xUfzOsOFlzSOXg@jetpack',
		version: require('../dist/firefox/package.json').version, // eslint-disable-line global-require,
		src: fs.createReadStream(path.join(__dirname, '../dist/firefox/reddit-enhancement-suite.xpi')),
	}).then(() => {
		console.log('Firefox deployment complete!');
	}, err => {
		console.error('Firefox failed:', err);
		process.exitCode = 1;
	});
}
