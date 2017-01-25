/* eslint-disable import/no-commonjs */

const { version } = require('../package.json');
const isBetaVersion = require('./isBetaVersion');

if (isBetaVersion(version)) {
	console.log(`Deploying ${version} beta release...`);

	console.log('Skipping Edge beta deployment...');
} else {
	console.log(`Deploying ${version} stable release...`);

	deployEdge();
}

function deployEdge() {
	console.log('Deploying Edge stable...');
}
