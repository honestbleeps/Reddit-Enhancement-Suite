/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { Storage } from '../environment';
import { DAY, execRegexes, watchForThings, Thing } from '../utils';

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

const COLLAPSE_REASON = 'commentHidePersistor';

async function restoreCommentCollapse() {
	const { collapsedThings } = await entryStorage.get(currentId);
	if (collapsedThings) {
		watchForThings(['comment'], thing => {
			if (collapsedThings.hasOwnProperty(thing.getFullname())) thing.setCommentCollapse(true, COLLAPSE_REASON);
		}, { immediate: true });
	}
}

function listenToCommentCollapse() {
	$(document.body).on('click', 'a.expand', (e: MouseEvent) => {
		const thing = Thing.checkedFrom(e.target);
		const collapsed = thing.isCollapsed();

		if (collapsed) {
			// Ignore if some automatic function (e.g. filters) caused this to collapse
			const currentCollapseReason = e.target.getAttribute('collapse-reason');
			if (currentCollapseReason && currentCollapseReason !== COLLAPSE_REASON) return;

			entryStorage.patch(currentId, { collapsedThings: { [thing.getFullname()]: true }, updateTime: Date.now() });
		} else {
			e.target.removeAttribute('collapse-reason');
			entryStorage.deletePath(currentId, 'collapsedThings', thing.getFullname());
		}
	});
}
