import Cache from '../lib/utils/Cache';

import cssDisabled from './images/css-disabled.png';
import cssDisabledSmall from './images/css-disabled-small.png';
import cssOff from './images/css-off.png';
import cssOffSmall from './images/css-off-small.png';
import cssOn from './images/css-on.png';
import cssOnSmall from './images/css-on-small.png';
import mainEntry from '../lib/main.entry'; // eslint-disable-line import/default
import resCss from '../lib/css/res.scss';

import { createMessageHandler } from '../lib/environment/_helpers';
import { extendDeep } from '../lib/utils/object';

import { nativeRequire } from '../lib/environment/_nativeRequire';

const priv = nativeRequire('sdk/private-browsing');
const ss = nativeRequire('sdk/simple-storage');
const tabs = nativeRequire('sdk/tabs');
const { ActionButton } = nativeRequire('sdk/ui/button/action');
const { Cc, Ci, components } = nativeRequire('chrome');
const { PageMod } = nativeRequire('sdk/page-mod');
const { Request } = nativeRequire('sdk/request');
const { indexedDB } = nativeRequire('sdk/indexed-db');
const { viewFor } = nativeRequire('sdk/view/core');

const historyService = Cc['@mozilla.org/browser/history;1'].getService(Ci.mozIAsyncHistory);

// Cookie manager for new API login
const cookieManager = Cc['@mozilla.org/cookiemanager;1'].getService().QueryInterface(Ci.nsICookieManager2);
components.utils.import('resource://gre/modules/NetUtil.jsm');

// this function takes in a string (and optional charset, paseURI) and creates an nsURI object, which is required by historyService.addURI...
function makeURI(aURL, aOriginCharset, aBaseURI) {
	const ioService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
	return ioService.newURI(aURL, aOriginCharset, aBaseURI);
}

const workers = [];

function onAttach() {
	// prepend to array so the correct worker will be used when navigating forwards
	// but all bets are off for going back (see workerFor() comments)
	workers.unshift(this);
}

function onDetach() {
	const index = workers.indexOf(this);
	if (index !== -1) {
		workers.splice(index, 1);
	}
}

function workerFor(tab) {
	// important: one tab may have many workers associated with it
	// that is, all workers in the tab's history are kept, and only detached when the tab is closed
	// this means that if you visit the same url twice (independently) in one tab, there is no way to tell which worker should be used :(
	const worker = workers.find(({ url, tab: { id } }) => id === tab.id && url === tab.url);
	if (!worker) {
		throw new Error(`Worker not found for tab with id: ${tab.id}, url: ${tab.url}`);
	}
	return worker;
}

const {
	_handleMessage,
	sendMessage,
	addListener
} = createMessageHandler((type, obj, worker) => worker.postMessage({ ...obj, type }));

// Listeners

addListener('deleteCookies', cookies =>
	cookies.forEach(({ name }) => cookieManager.remove('.reddit.com', name, '/', false, false))
);

addListener('ajax', ({ method, url, headers, data }) =>
	// not using async/await here since the polyfill doesn't work with Firefox's backend
	new Promise(resolve => {
		const request = Request({
			url,
			onComplete: resolve,
			headers,
			content: data
		});
		if (method === 'POST') {
			request.post();
		} else {
			request.get();
		}
	}).then(request => ({
		status: request.status,
		responseText: request.text
	}))
);

let db;

{
	const request = indexedDB.open('storage', 1);
	request.onupgradeneeded = () => {
		const db = request.result;
		if (db.objectStoreNames.contains('storage')) {
			db.deleteObjectStore('storage');
		}
		db.createObjectStore('storage', { keyPath: 'key' });
	};
	request.onsuccess = () => {
		db = request.result;
		runMigration();
	};
	request.onerror = ::console.error;

	const MIGRATED_TO_INDEXEDDB = 'MIGRATED_TO_INDEXEDDB';

	function runMigration() {
		if (ss.storage[MIGRATED_TO_INDEXEDDB] !== MIGRATED_TO_INDEXEDDB) {
			const transaction = db.transaction('storage', 'readwrite');

			transaction.oncomplete = () => (ss.storage[MIGRATED_TO_INDEXEDDB] = MIGRATED_TO_INDEXEDDB);
			transaction.onerror = ::console.error;

			const store = transaction.objectStore('storage');

			Object.keys(ss.storage).forEach(key => {
				let value;
				try {
					// existing storage values are _usually_ stringified JSON, so try to parse it...
					value = JSON.parse(ss.storage[key]);
					console.log(key);
				} catch (e) {
					// ...but if not, fall back to the raw string
					value = ss.storage[key];
					console.warn(key);
				}
				store.put({ key, value });
			});
		}
	}
}

addListener('storage', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			return new Promise((resolve, reject) => {
				const request = db.transaction('storage', 'readonly').objectStore('storage').get(key);
				request.onsuccess = () => resolve(request.result ? request.result.value : null);
				request.onerror = reject;
			});
		case 'set':
			return new Promise((resolve, reject) => {
				const request = db.transaction('storage', 'readwrite').objectStore('storage').put({ key, value });
				request.onsuccess = () => resolve();
				request.onerror = reject;
			});
		case 'patch':
			return new Promise((resolve, reject) => {
				const transaction = db.transaction('storage', 'readwrite');
				transaction.oncomplete = () => resolve();
				transaction.onerror = reject;
				const store = transaction.objectStore('storage');
				const request = store.get(key);
				request.onsuccess = () => {
					const extended = extendDeep(request.result && request.result.value || {}, value);
					store.put({ key, value: extended });
				};
			});
		case 'deletePath':
			return new Promise((resolve, reject) => {
				const transaction = db.transaction('storage', 'readwrite');
				transaction.oncomplete = () => resolve();
				transaction.onerror = reject;
				const store = transaction.objectStore('storage');
				const request = store.get(key);
				request.onsuccess = () => {
					const stored = request.result.value;
					value.split(',').reduce((obj, key, i, { length }) => {
						if (i < length - 1) return obj[key];
						delete obj[key];
					}, stored);
					store.put({ key, value: stored });
				};
			});
		case 'delete':
			return new Promise((resolve, reject) => {
				const request = db.transaction('storage', 'readwrite').objectStore('storage').delete(key);
				request.onsuccess = () => resolve();
				request.onerror = reject;
			});
		case 'has':
			return new Promise((resolve, reject) => {
				const request = db.transaction('storage', 'readonly').objectStore('storage').openCursor(key);
				request.onsuccess = () => resolve(!!request.result);
				request.onerror = reject;
			});
		case 'keys':
			return new Promise((resolve, reject) => {
				const request = db.transaction('storage', 'readonly').objectStore('storage').openKeyCursor();
				const keys = [];
				request.onsuccess = () => {
					const cursor = request.result;
					if (cursor) {
						keys.push(cursor.key);
						cursor.continue();
					} else {
						resolve(keys);
					}
				};
				request.onerror = reject;
			});
		case 'clear':
			return new Promise((resolve, reject) => {
				const request = db.transaction('storage', 'readwrite').objectStore('storage').clear();
				request.onsuccess = () => resolve();
				request.onerror = reject;
			});
		default:
			throw new Error(`Invalid storage operation: ${operation}`);
	}
});

const session = new Map();

addListener('session', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			return session.get(key);
		case 'set':
			session.set(key, value);
			break;
		case 'delete':
			return session.delete(key);
		case 'clear':
			return session.clear();
		default:
			throw new Error(`Invalid session operation: ${operation}`);
	}
});

const cache = new Cache();

addListener('XHRCache', ({ operation, key, value, maxAge }) => {
	switch (operation) {
		case 'set':
			return cache.set(key, value);
		case 'check':
			return cache.check(key, maxAge);
		case 'delete':
			return cache.delete(key);
		case 'clear':
			return cache.clear();
		default:
			throw new Error(`Invalid XHRCache operation: ${operation}`);
	}
});

const pageAction = ActionButton({
	id: 'res-styletoggle',
	label: 'toggle subreddit CSS',
	icon: {
		16: `./../${cssDisabledSmall}`,
		32: `./../${cssDisabled}`
	},
	disabled: true,
	onClick() {
		sendMessage('pageActionClick', undefined, workerFor(tabs.activeTab));
	}
});
let destroyed = false;

// since worker state is persisted, the page action state must be refreshed when navigating backwards or forwards
tabs.on('pageshow', tab => tab.url.includes('reddit.com') && sendMessage('pageActionRefresh', undefined, workerFor(tab)));

addListener('pageAction', ({ operation, state }, { tab }) => {
	if (destroyed) return;

	switch (operation) {
		case 'show':
			pageAction.state(tab, {
				disabled: false,
				icon: {
					16: state ? `./../${cssOnSmall}` : `./../${cssOffSmall}`,
					32: state ? `./../${cssOn}` : `./../${cssOff}`
				}
			});
			break;
		case 'hide':
			pageAction.state(tab, {
				disabled: true,
				icon: {
					16: `./../${cssDisabledSmall}`,
					32: `./../${cssDisabled}`
				}
			});
			break;
		case 'destroy':
			pageAction.destroy();
			destroyed = true;
			break;
		default:
			throw new Error(`Invalid pageAction operation: ${operation}`);
	}
});

addListener('openNewTabs', ({ urls, focusIndex }, { tab }) => {
	const isPrivate = priv.isPrivate(tab);
	const nsWindow = viewFor(tab.window);
	const nsTab = viewFor(tab);
	urls.forEach((url, i) => {
		if ('TreeStyleTabService' in nsWindow) {
			nsWindow.TreeStyleTabService.readyToOpenChildTab(nsTab);
		}
		tabs.open({
			url,
			isPrivate,
			inBackground: i !== focusIndex
		});
	});
});

addListener('isPrivateBrowsing', (request, worker) => priv.isPrivate(worker));

addListener('addURLToHistory', url => {
	historyService.updatePlaces({
		uri: makeURI(url),
		visits: [{
			transitionType: Ci.nsINavHistoryService.TRANSITION_LINK,
			visitDate: Date.now() * 1000
		}]
	});
});

addListener('multicast', (request, worker) => {
	const isPrivate = priv.isPrivate(worker);
	return Promise.all(
		workers
			.filter(w => w !== worker && priv.isPrivate(w) === isPrivate)
			.map(w => sendMessage('multicast', request, w))
	);
});

PageMod({
	include: ['*.reddit.com'],
	contentScriptWhen: 'start',
	contentScriptFile: [`./../${mainEntry}`],
	contentStyleFile: [`./../${resCss}`],
	onAttach(worker) {
		worker::onAttach();
		worker.on('detach', onDetach);
		worker.on('message', ({ type, ...obj }) => _handleMessage(type, obj, worker));
	}
});
