/* eslint-env webextensions */

import '!babel-loader!../chrome/background.entry';

import { apiToPromise } from '../chrome/_helpers';

const setMultiple = apiToPromise((items, callback) => chrome.storage.local.set(items, callback));

console.log('opening port for migration');
const port = browser.runtime.connect({ name: 'migrate-start' });

port.onMessage.addListener(async items => {
	console.log('received items for migration', items);
	await setMultiple(items);

	console.log('saved migration items successfully');
	port.postMessage('migrate-success');
});
