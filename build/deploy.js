/* eslint-disable import/no-commonjs, import/no-nodejs-modules */

const fs = require('fs');
const path = require('path');
const chromeDeploy = require('chrome-extension-deploy');
const edgeDeploy = require('edge-extension-deploy');
const firefoxDeploy = require('firefox-extension-deploy');
const { version } = require('../package.json');
const isBetaVersion = require('./isBetaVersion');

if (isBetaVersion(version)) {
	console.log(`Deploying ${version} beta release...`);

	deployChromeBeta();
	deployEdgeInternalBeta();
	deployFirefoxBeta();
} else {
	console.log(`Deploying ${version} stable release...`);

	deployChromeBeta();
	deployChromeStable();
	deployEdgeInternalBeta();
	deployEdgePublicBeta();
	deployEdgeStable();
	deployFirefoxBeta();
	deployFirefoxStable();
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

function deployEdgeInternalBeta() {
	console.log('Deploying Edge internal beta...');

	edgeDeploy({
		tenantId: process.env.EDGE_TENANT_ID,
		clientId: process.env.EDGE_CLIENT_ID,
		clientSecret: process.env.EDGE_CLIENT_SECRET,
		appId: '9NBLGGH4NC12',
		flightId: '013e109b-ff0c-42d5-ba6a-8797ecc5368a',
		appx: fs.createReadStream(path.join(__dirname, '../dist/edgeextension/package/edgeExtension.appx')),
	}).then(() => {
		console.log('Edge internal beta deployment complete!');
	}, err => {
		console.log('Edge internal beta failed:', err);
		process.exitCode = 1;
	});
}

function deployEdgePublicBeta() {
	console.log('Deploying Edge public beta...');

	edgeDeploy({
		tenantId: process.env.EDGE_TENANT_ID,
		clientId: process.env.EDGE_CLIENT_ID,
		clientSecret: process.env.EDGE_CLIENT_SECRET,
		appId: '9NBLGGH4NC12',
		flightId: '9be3ca4c-a87f-49d2-9191-3aa40c2c9d19',
		appx: fs.createReadStream(path.join(__dirname, '../dist/edgeextension/package/edgeExtension.appx')),
	}).then(() => {
		console.log('Edge public beta deployment complete!');
	}, err => {
		console.log('Edge public beta failed:', err);
		process.exitCode = 1;
	});
}

function deployEdgeStable() {
	console.log('Deploying Edge stable...');

	edgeDeploy({
		tenantId: process.env.EDGE_TENANT_ID,
		clientId: process.env.EDGE_CLIENT_ID,
		clientSecret: process.env.EDGE_CLIENT_SECRET,
		appId: '9NBLGGH4NC12',
		appx: fs.createReadStream(path.join(__dirname, '../dist/edgeextension/package/edgeExtension.appx')),
	}).then(() => {
		console.log('Edge stable deployment complete!');
	}, err => {
		console.log('Edge stable failed:', err);
		process.exitCode = 1;
	});
}

function deployFirefoxBeta() {
	console.log('Deploying Firefox beta...');

	firefoxDeploy({
		issuer: process.env.FIREFOX_ISSUER,
		secret: process.env.FIREFOX_SECRET,
		id: 'jid1-xUfzOsOFlzSOXg@jetpack',
		version: require('../dist/firefox-beta/package.json').version, // eslint-disable-line global-require,
		src: fs.createReadStream(path.join(__dirname, '../dist/firefox-beta/reddit-enhancement-suite.xpi')),
	}).then(() => {
		console.log('Firefox beta deployment complete!');
	}, err => {
		console.error('Firefox beta failed:', err);
		process.exitCode = 1;
	});
}

function deployFirefoxStable() {
	console.log('Deploying Firefox stable...');

	firefoxDeploy({
		issuer: process.env.FIREFOX_ISSUER,
		secret: process.env.FIREFOX_SECRET,
		id: 'jid1-xUfzOsOFlzSOXg@jetpack',
		version: require('../dist/firefox/package.json').version, // eslint-disable-line global-require,
		src: fs.createReadStream(path.join(__dirname, '../dist/firefox/reddit-enhancement-suite.xpi')),
	}).then(() => {
		console.log('Firefox stable deployment complete!');
	}, err => {
		console.error('Firefox stable failed:', err);
		process.exitCode = 1;
	});
}
