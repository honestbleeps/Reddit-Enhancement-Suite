// generate webextension
import 'spawn-loader?inert&path=webextension!extricate-loader!interpolate-loader!./manifest.json';

import { nativeRequire } from './nativeRequire';

const { startup } = nativeRequire('sdk/webextension');
const { indexedDB } = nativeRequire('sdk/indexed-db');

function initDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('storage', 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (db.objectStoreNames.contains('storage')) {
				db.deleteObjectStore('storage');
			}
			db.createObjectStore('storage', { keyPath: 'key' });
		};
		request.onsuccess = () => {
			resolve(request.result);
		};
		request.onerror = reject;
	});
}

function get(db, key) {
	return new Promise((resolve, reject) => {
		const request = db.transaction('storage', 'readonly').objectStore('storage').get(key);
		request.onsuccess = () => resolve(request.result ? request.result.value : null);
		request.onerror = reject;
	});
}

function set(db, key, value) {
	return new Promise((resolve, reject) => {
		const request = db.transaction('storage', 'readwrite').objectStore('storage').put({ key, value });
		request.onsuccess = () => resolve();
		request.onerror = reject;
	});
}

function getAll(db) {
	return new Promise((resolve, reject) => {
		const request = db.transaction('storage', 'readonly').objectStore('storage').openCursor();
		const values = {};
		request.onsuccess = () => {
			const cursor = request.result;
			if (cursor) {
				values[cursor.value.key] = cursor.value.value;
				cursor.continue();
			} else {
				resolve(values);
			}
		};
		request.onerror = reject;
	});
}

(async () => {
	const db = await initDb();

	const { browser } = await startup();

	browser.runtime.onConnect.addListener(async port => {
		if (port.name !== 'migrate-start') {
			console.error(`invalid port name: ${port.name}`);
			return;
		}

		const MIGRATED_TO_CHROME_STORAGE = 'MIGRATED_TO_CHROME_STORAGE';

		if ((await get(db, MIGRATED_TO_CHROME_STORAGE)) === MIGRATED_TO_CHROME_STORAGE) {
			console.error('already migrated, skipping');
			return;
		}

		console.error('getting data for migration');
		port.postMessage(await getAll(db));

		port.onMessage.addListener(msg => {
			if (msg !== 'migrate-success') {
				console.error(`invalid msg: ${msg}`);
				return;
			}

			console.error('setting migration success');
			set(db, MIGRATED_TO_CHROME_STORAGE, MIGRATED_TO_CHROME_STORAGE);
		});
	});
})();
