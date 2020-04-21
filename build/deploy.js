/* @noflow */

/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const fs = require('fs'); // eslint-disable-line import/no-extraneous-dependencies
const { version } = require('../package.json');
const isBetaVersion = require('./isBetaVersion');
const path = require('path'); // eslint-disable-line import/no-extraneous-dependencies
const chromeDeploy = require('chrome-extension-deploy');
const firefoxDeploy = require('firefox-extension-deploy');

if (isBetaVersion(version)) {
	console.log(`Deploying ${version} beta release...`);

	deployChromeBeta();
} else {
	console.log(`Deploying ${version} stable release...`);

	deployChromeBeta();
	deployChromeStable();
	deployFirefoxStable();
}

function deployChromeBeta() {
	console.log('Deploying Chrome beta...');

	chromeDeploy({
		clientId: process.env.CHROME_CLIENT_ID,
		clientSecret: process.env.CHROME_CLIENT_SECRET,
		refreshToken: process.env.CHROME_REFRESH_TOKEN,
		id: 'flhpapomijliefifkkeepedibpmibbpo',
		zip: fs.readFileSync(path.join(__dirname, '../dist/zip/chrome-beta.zip')),
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

function deployFirefoxStable() {
	console.log('Deploying Firefox stable...');

	firefoxDeploy({
		issuer: process.env.FIREFOX_ISSUER,
		secret: process.env.FIREFOX_SECRET,
		id: 'jid1-xUfzOsOFlzSOXg@jetpack',
		version: require('../dist/firefox/manifest.json').version, // eslint-disable-line global-require
		src: fs.createReadStream(path.join(__dirname, '../dist/zip/firefox.zip')),
	}).then(() => {
		console.log('Firefox stable deployment complete!');
	}, err => {
		console.error('Firefox stable failed:', err);
		process.exitCode = 1;
	});
}
