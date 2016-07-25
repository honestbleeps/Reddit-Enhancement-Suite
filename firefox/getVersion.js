/* eslint-disable import/no-commonjs */

const isBetaVersion = require('../build/isBetaVersion');
const { version } = require('../package.json');

module.exports = (isBetaVersion(version) ? `${version}beta` : version);
