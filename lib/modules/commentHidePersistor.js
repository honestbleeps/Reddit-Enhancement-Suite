/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { Storage } from '../environment';
import { DAY, click, execRegexes, watchForThings, Thing } from '../utils';

export const module: Module<*> = new Module('commentHidePersistor');

module.moduleName = 'commentHidePerName';
module.category = 'commentsCategory';
module.description = 'commentHidePerDesc';

module.include = [
	'comments',
	'inbox',
];

const currentId: string = (execRegexes.comments(location.pathname) || [])[2];
const lastCleanStorage = Storage.wrap('RESmodules.commentHidePersistor.lastClean', 0);
const entryStorage = Storage.wrapPrefix('commentHidePersistor.', (): {
	updateTime: number,
	collapsedThings?: { [fullName: string]: boolean },
} => ({
	updateTime: Date.now(),
}));

module.beforeLoad = async () => {
	if (!currentId) throw new Error('Could not find comment page id');

	await restoreCommentCollapse();
};

module.go = () => {
	listenToCommentCollapse();
};

module.afterLoad = () => {
	maybePruneOldEntries();
};

async function maybePruneOldEntries() {
	// Clean counts every six hours
	const now = Date.now();
	if ((now - await lastCleanStorage.get()) < 0.25 * DAY) return;
	lastCleanStorage.set(now);

	for (const [id, data] of Object.entries(await entryStorage.getAll())) {
		if ((now - data.updateTime) > 7 * DAY) {
			entryStorage.delete(id);
		}
	}
}

async function restoreCommentCollapse() {
	const { collapsedThings } = await entryStorage.get(currentId);
	if (collapsedThings) {
		watchForThings(['comment'], thing => {
			if (thing.getFullname() in collapsedThings) {
				const toggle = thing.getCommentToggleElement();
				if (toggle) click(toggle);
			}
		}, { immediate: true });
	}
}

function listenToCommentCollapse() {
	$(document.body).on('click', 'a.expand', function() {
		const thing = Thing.from(this);
		if (!thing) return;

		const collapsed = thing.isCollapsed();
		const thingId = thing.getFullname();

		if (collapsed) entryStorage.patch(currentId, { collapsedThings: { [thingId]: true }, updateTime: Date.now() });
		else entryStorage.deletePath(currentId, 'collapsedThings', thingId);
	});
}
