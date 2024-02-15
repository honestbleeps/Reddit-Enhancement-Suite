/* @noflow */

/* eslint import/no-nodejs-modules: 0, import/extensions: 0 */

import fs from 'node:fs';
import path from 'node:path';
import chromeDeploy from 'chrome-extension-deploy';
import firefoxDeploy from 'firefox-extension-deploy';
import packageInfo from '../package.json' with { type: 'json' };
import isBetaVersion from './isBetaVersion.js';

const version = packageInfo.version;

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
		zip: fs.readFileSync(path.join(import.meta.dirname, '../dist/zip/chromebeta.zip')),
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
		zip: fs.readFileSync(path.join(import.meta.dirname, '../dist/zip/chrome.zip')),
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
		version,
		src: fs.createReadStream(path.join(import.meta.dirname, '../dist/zip/firefox.zip')),
	}).then(() => {
		console.log('Firefox stable deployment complete!');
	}, err => {
		console.error('Firefox stable failed:', err);
		process.exitCode = 1;
	});
}
