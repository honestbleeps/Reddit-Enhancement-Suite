// allow the reexports to be overridden
/* eslint-disable import/export */

import _ from 'lodash';
import * as Notifications from '../lib/modules/notifications';
import { apiToPromise, createMessageHandler } from './_helpers';
import { extendDeep, waitForEvent } from '../lib/utils';

const {
	_handleMessage,
	sendMessage,
	addListener
} = createMessageHandler(_.unary(apiToPromise(chrome.runtime.sendMessage)));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => _handleMessage(request, sendResponse));

export {
	sendMessage as _sendMessage,
	addListener as _addListener
};

export * from '../lib/environment';

addListener('userGesture', () => waitForEvent(document.body, 'mousedown', 'keydown'));

const inProgress = new Map();

function filterPerms(perms) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

export const Permissions = {
	async request(...perms) {
		const key = perms.join(',');

		if (!inProgress.has(key)) {
			inProgress.set(key, (async () => {
				const { permissions, origins } = filterPerms(perms);

				const granted = await sendMessage('permissions', { operation: 'request', permissions, origins });

				inProgress.delete(key);

				if (!granted) {
					const re = /((?:\w+\.)+\w+)(?=\/|$)/i;
					Notifications.showNotification(
						`<p>You clicked "Deny". RES needs permission to access the API(s) at:</p>
							<p>${origins.map(u => `<code>${re.exec(u)[0]}</code>`).join(', ')}</p>
							<p>Be assured RES does not access any of your information on these domains - it only accesses the API.</p>`,
						20000
					);
					throw new Error(`Permission not granted for: ${perms.join(', ')}`);
				}
			})());
		}

		return inProgress.get(key);
	},

	async remove(...perms) {
		const removed = await sendMessage('permissions', { operation: 'remove', ...filterPerms(perms) });
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
