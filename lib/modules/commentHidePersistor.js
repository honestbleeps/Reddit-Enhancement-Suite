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

const expireAfterDays = 7;
const currentId: string = (execRegexes.comments(location.pathname) || [])[2];
const lastCleanStorage = Storage.wrap('RESmodules.commentHidePersistor.lastClean', (null: null | number));
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

module.afterLoad = async () => {
	// Clean counts every six hours
	const lastClean = await lastCleanStorage.get() || 0;
	if ((Date.now() - lastClean) > 0.25 * DAY) {
		pruneOldEntries();
	}
};

async function pruneOldEntries() {
	const now = Date.now();
	lastCleanStorage.set(now);
	const keepTrackPeriod = DAY * parseInt(expireAfterDays, 10);
	for (const [id, data] of Object.entries(await entryStorage.getAll())) {
		if ((now - data.updateTime) > keepTrackPeriod) {
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
