/* @flow */

import { addListener } from './messaging';

let activeMigration: ?number = null;

// Reserves the ability to migrate for a minute
// Returns `true` if able to retain lock
addListener('requestMigrateLock', (_, { tab, frameId }) => {
	if (frameId) return; // For simplicity, only allow root frames to migrate

	let timeoutId = null;

	if (typeof activeMigration === 'number') {
		if (activeMigration === tab.id) {
			addTimeout();
			return true;
		}

		return;
	}

	function onTabChange(tabId, updates) {
		// Page change prevents the migration from running
		if (tabId === activeMigration && (updates.status === 'loading' || updates.url || updates.discarded)) release();
	}

	function onTabRemove(tabId) {
		if (tabId === activeMigration) release();
	}

	function release() {
		if (timeoutId) clearTimeout(timeoutId);
		chrome.tabs.onUpdated.removeListener(onTabChange);
		chrome.tabs.onRemoved.removeListener(onTabRemove);
		if (activeMigration === tab.id) activeMigration = null;
	}

	function addTimeout() {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(release, 1 * 60 * 1000);
	}

	chrome.tabs.onUpdated.addListener(onTabChange);
	chrome.tabs.onRemoved.addListener(onTabRemove);
	addTimeout();

	activeMigration = tab.id;
	return true;
});
