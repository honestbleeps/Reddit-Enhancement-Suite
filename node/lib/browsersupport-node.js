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
		try {
			return Promise.resolve(key in RESEnvironment._storage ? JSON.parse(RESEnvironment._storage[key]) : null);
		} catch (e) {
			console.warn('Failed to parse:', key, 'falling back to raw string.');
		}
		return Promise.resolve(RESEnvironment._storage[key]);
	},
	set(key, value) {
		return new Promise(resolve => {
			RESEnvironment._storage[key] = JSON.stringify(value);
			resolve();
		});
	},
	patch(key, value) {
		return new Promise(resolve => {
			try {
				const stored = JSON.parse(RESEnvironment._storage[key] || '{}') || {};
				RESEnvironment._storage[key] = JSON.stringify(extend(stored, value));
			} catch (e) {
				throw new Error(`Failed to patch: ${key} - error: ${e}`);
			}
			resolve();
		});
	},
	deletePath(key, ...path) {
		return new Promise(resolve => {
			try {
				const stored = JSON.parse(RESEnvironment._storage[key] || '{}') || {};
				path.reduce((obj, key, i, { length }) => {
					if (i < length - 1) return obj[key];
					delete obj[key];
				}, stored);
				RESEnvironment._storage[key] = JSON.stringify(stored);
			} catch (e) {
				throw new Error(`Failed to delete path: ${path} on key: ${key} - error: ${e}`);
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
	},
	clear() {
		RESEnvironment._storage = {};
		return Promise.resolve();
	}
};
