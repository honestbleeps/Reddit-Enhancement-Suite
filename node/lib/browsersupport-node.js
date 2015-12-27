/* eslint-env node */
/* exported RESEnvironment */

import fs from 'fs';

RESEnvironment.loadResourceAsText = filename =>
	Promise.resolve(fs.readFileSync(`lib/${filename}`, 'utf8'));

exports.RESEnvironment = RESEnvironment;
