/* @flow */

import { Module } from '../core/module';
import { Storage, isPrivateBrowsing } from '../environment';
import {
	DAY,
	WEEK,
	execRegexes,
	reifyPromise,
	fastAsync,
} from '../utils';
import * as SelectedEntry from './selectedEntry';

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
const lastCleanStorage = Storage.wrap('RESmodules.readComments.lastClean', 0);
const entryStorage = Storage.wrapPrefix('readComments.', (): {|
	updateTime: number,
	ids: { [string]: true },
|} => ({
	updateTime: Date.now(),
	ids: {},
}));
const initialStorage = reifyPromise(
	entryStorage.get(currentId).then(({ ids }) => new Set(Object.keys(ids)))
);

module.beforeLoad = async () => {
	if (!module.options.monitorWhenIncognito.value && isPrivateBrowsing()) return;

	const ids = await initialStorage.get();

	SelectedEntry.addListener(selected => {
		if (selected.isComment() && selected.isContentVisible()) {
			const id = selected.getFullname();
			ids.add(id);
			entryStorage.patch(currentId, { ids: { [id]: true }, updateTime: Date.now() });
		}
	}, 'beforePaint');
};

module.afterLoad = () => {
	maybePruneOldEntries();
};

async function maybePruneOldEntries() {
	const now = Date.now();
	if ((now - await lastCleanStorage.get()) < WEEK) return;
	lastCleanStorage.set(now);

	const keepTrackPeriod = DAY * parseInt(module.options.cleanComments.value, 10);
	for (const [id, { updateTime }] of Object.entries(await entryStorage.getAll())) {
		if ((now - updateTime) > keepTrackPeriod) {
			entryStorage.delete(id);
		}
	}
}

export const isRead = fastAsync(function*(thing: *): * {
	if (!initialStorage) return false;
	const ids = yield initialStorage.get();
	return ids.has(thing.getFullname());
});
