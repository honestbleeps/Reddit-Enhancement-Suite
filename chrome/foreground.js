import _ from 'lodash';
import { apiToPromise } from './_helpers';
import { createMessageHandler } from '../lib/environment/_helpers';
import { extendDeep, waitForEvent } from '../lib/utils';

const _sendMessage = apiToPromise(chrome.runtime.sendMessage);

const {
	_handleMessage,
	sendMessage,
	addListener
} = createMessageHandler((type, { transaction, isResponse, ...obj }, sendResponse) => {
	if (isResponse) {
		sendResponse(obj);
	} else {
		_sendMessage({ ...obj, type }).then(({ type, ...obj }) => {
			_handleMessage(type, { ...obj, transaction, isResponse: true });
		});
	}
});

chrome.runtime.onMessage.addListener(({ type, ...obj }, sender, sendResponse) => _handleMessage(type, obj, sendResponse));

export {
	sendMessage as _sendMessage,
	addListener as _addListener
};

addListener('userGesture', () => waitForEvent(document.body, 'mousedown', 'keydown'));

function filterPerms(perms) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

export const Permissions = {
	request: _.memoize(async (...perms) => {
		const { permissions, origins } = filterPerms(perms);
		const granted = await sendMessage('permissions', { operation: 'request', permissions, origins });
		if (!granted) {
			throw new Error(`Permission not granted for: ${perms.join(', ')}`);
		}
	}, (...perms) => perms.join(',')),

	async remove(...perms) {
		const { permissions, origins } = filterPerms(perms);
		const removed = await sendMessage('permissions', { operation: 'remove', permissions, origins });
		if (!removed) {
			throw new Error(`Permissions not removed: ${perms.join(', ')} - are you trying to remove required permissions?`);
		}
	}
};

export const isPrivateBrowsing = _.once(() => Promise.resolve(chrome.extension.inIncognitoContext));

const queues = new Map();

function mutex(callback) {
	return (...args) => {
		const key = args[0];
		let tail;
		if (queues.has(key)) {
			tail = queues.get(key).then(() => callback(...args));
		} else {
			tail = callback(...args);
		}
		queues.set(key, tail);
		tail.then(() => {
			if (queues.get(key) === tail) queues.delete(key);
		});
		return tail;
	};
}

const _set = apiToPromise(::chrome.storage.local.set);
const set = (key, value) => _set({ [key]: value });

const _get = apiToPromise(::chrome.storage.local.get);
const get = async (key, defaultValue = null) => (await _get({ [key]: defaultValue }))[key];

export const Storage = {
	get: mutex(key => get(key, null)),

	set: mutex((key, value) => set(key, value)),

	patch: mutex(async (key, value) => {
		const extended = extendDeep(await get(key) || {}, value);
		return set(key, extended);
	}),

	deletePath: mutex(async (key, ...path) => {
		try {
			const stored = await get(key) || {};
			path.reduce((obj, key, i, { length }) => {
				if (i < length - 1) return obj[key];
				delete obj[key];
			}, stored);
			return set(key, stored);
		} catch (e) {
			throw new Error(`Failed to delete path: ${path} on key: ${key} - error: ${e}`);
		}
	}),

	delete: mutex(apiToPromise(::chrome.storage.local.remove)),

	has: mutex(async key => {
		const sentinel = Math.random();
		return (await get(key, sentinel)) !== sentinel;
	}),

	keys: async () => Object.keys(await _get(null)),

	clear: apiToPromise(::chrome.storage.local.clear)
};
