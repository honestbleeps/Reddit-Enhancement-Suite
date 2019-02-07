/* @flow */

import { Module } from '../core/module';
import { Storage, isPrivateBrowsing } from '../environment';
import {
	execRegexes,
	reifyPromise,
	fastAsync,
	maybePruneOldEntries,
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

	maybePruneOldEntries('readComments', entryStorage, parseInt(module.options.cleanComments.value, 10));
};

export const isRead = fastAsync(function*(thing: *): * {
	if (!initialStorage) return false;
	const ids = yield initialStorage.get();
	return ids.has(thing.getFullname());
});
