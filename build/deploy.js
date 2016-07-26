/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const fs = require('fs');
const path = require('path');
const deploy = require('chrome-extension-deploy');
const { version } = require('../package.json');
const isBetaVersion = require('./isBetaVersion');

if (isBetaVersion(version)) {
	console.log(`Deploying ${version} beta release...`);

	deployChromeBeta();
} else {
	console.log(`Deploying ${version} stable release...`);

	deployChromeBeta();
	deployChromeStable();
}

function deployChromeBeta() {
	console.log('Deploying Chrome beta...');

	deploy({
		clientId: process.env.CHROME_CLIENT_ID,
		clientSecret: process.env.CHROME_CLIENT_SECRET,
		refreshToken: process.env.CHROME_REFRESH_TOKEN,
		id: 'flhpapomijliefifkkeepedibpmibbpo',
		zip: fs.readFileSync(path.join(__dirname, '../dist/zip/chrome.zip')),
		to: deploy.TRUSTED_TESTERS,
	}).then(() => {
		console.log('Chrome beta deployment complete!');
	}, err => {
		console.error('Chrome beta failed:', err);
		process.exitCode = 1;
	});
}

function deployChromeStable() {
	console.log('Deploying Chrome stable...');

	deploy({
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
