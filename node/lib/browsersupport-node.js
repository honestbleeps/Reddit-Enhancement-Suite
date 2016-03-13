/* eslint-env node */

import fs from 'fs';

RESEnvironment.loadResourceAsText = filename =>
	Promise.resolve(fs.readFileSync(`lib/${filename}`, 'utf8'));

RESEnvironment._sendMessage = () => Promise.resolve();

function extend(target, source) {
	for (const key in source) {
		if (target[key] && source[key] && typeof target[key] === 'object' && typeof source[key] === 'object') {
			extend(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
	return target;
}

RESEnvironment._storage = {};

RESEnvironment.storage = {
	get(key) {
		return Promise.resolve(key in RESEnvironment._storage ? RESEnvironment._storage[key] : null);
	},
	set(key, value) {
		RESEnvironment._storage[key] = value;
		return Promise.resolve();
	},
	patch(key, value) {
		RESEnvironment._storage[key] = extend(RESEnvironment._storage[key] || {}, value);
		return Promise.resolve();
	},
	deletePath(key, value) {
		return new Promise(resolve => {
			try {
				const stored = RESEnvironment._storage[key] || {};
				value.split(',').reduce((obj, key, i, { length }) => {
					if (i < length - 1) return obj[key];
					delete obj[key];
				}, stored);
				RESEnvironment._storage[key] = stored;
			} catch (e) {
				throw new Error(`Failed to delete path: ${value} on key: ${key} - error: ${e}`);
			}
			resolve();
		});
	},
	delete(key) {
		delete RESEnvironment._storage[key];
		return Promise.resolve();
	},
	has(key) {
		return Promise.resolve(key in RESEnvironment._storage);
	},
	keys() {
		return Promise.resolve(Object.keys(RESEnvironment._storage));
	}
};
