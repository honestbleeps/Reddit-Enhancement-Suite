/* @flow */

import { Module } from '../core/module';
import { Storage, isPrivateBrowsing } from '../environment';
import {
	Thing,
	batch,
	execRegexes,
	maybePruneOldEntries,
} from '../utils';
import * as FilteReddit from './filteReddit';
import * as SelectedEntry from './selectedEntry';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('readComments');

module.moduleName = 'readCommentsName';
module.category = 'commentsCategory';
module.description = 'readCommentsDesc';
module.options = {
	cleanComments: {
		type: 'text',
		value: '30',
		description: 'readCommentsCleanCommentsDesc',
		title: 'readCommentsCleanCommentsTitle',
		advanced: true,
	},
	monitorWhenIncognito: {
		type: 'boolean',
		value: false,
		description: 'readCommentsMonitorWhenIncognitoDesc',
		title: 'readCommentsMonitorWhenIncognitoTitle',
		advanced: true,
	},
};

module.include = ['comments', 'commentsLinklist'];

const currentId = (execRegexes.comments(location.pathname) || [])[2] || location.pathname;
const entryStorage = Storage.wrapPrefix('readComments.', (): {|
	updateTime: number,
	ids: { [string]: true },
|} => ({
	updateTime: Date.now(),
	ids: {},
}));

const initial = entryStorage.get(currentId);
let ids;

module.beforeLoad = async () => {
	ids = await (initial.then(({ ids }) => new Set(Object.keys(ids))));

	maybeHidePrevious();

	if (!module.options.monitorWhenIncognito.value && isPrivateBrowsing()) return;

	SelectedEntry.addListener(selected => {
		if (selected.isComment() && selected.isContentVisible()) add(selected);
	}, 'beforePaint');

	maybePruneOldEntries('readComments', entryStorage, parseInt(module.options.cleanComments.value, 10));
};

async function maybeHidePrevious() {
	if (!ids.size) return;

	const filterline = await FilteReddit.filterlinePromise;
	const filter = filterline.createFilter({ type: 'isRead', id: 'isRead' });
	// Don't display notification if the filter is already active
	if (filter.state === false && filter.effects.hide) return;

	const hideButton = document.createElement('button');
	hideButton.textContent = 'Hide now';
	hideButton.addEventListener('click', () => {
		filter.update(false, undefined, { hide: true /* `, propagate: true` may be desirable */ });
		if (!filter.parent) filterline.addFilter(filter);
		if (FilteReddit.ensureFilterlineVisible) FilteReddit.ensureFilterlineVisible();
		notification.close();
	});

	const notification = Notifications.showNotification({
		moduleID: module.moduleID,
		notificationID: 'hidePrevious',
		header: 'Previosuly viewed comments',
		message: hideButton,
		closeDelay: 5000,
	});
}

const _add = batch(ids => (
	entryStorage.patch(
		currentId,
		{ ids: ids.reduce((acc, id) => { acc[id] = true; return acc; }, {}), updateTime: Date.now() }
	)
), { size: Infinity, delay: 5000, flushBeforeUnload: true });

export const add = (thing: Thing) => {
	if (!ids) return;
	const id = thing.getFullname();
	_add(id);
};

export const isRead = (thing: *) => {
	if (!ids) throw new Error();
	return ids.has(thing.getFullname());
};
