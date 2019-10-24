/* @flow */

import $ from 'jquery';
import { Module } from '../core/module';
import { Storage } from '../environment';
import { execRegexes, maybePruneOldEntries, watchForThings, Thing } from '../utils';

export const module: Module<*> = new Module('commentHidePersistor');

module.moduleName = 'commentHidePerName';
module.category = 'commentsCategory';
module.description = 'commentHidePerDesc';

module.include = [
	'comments',
	'inbox',
];

const COLLAPSE_REASON = 'commentHidePersistor';
const currentId: string = (execRegexes.comments(location.pathname) || [])[2];
const entryStorage = Storage.wrapPrefix('commentHidePersistor.', (): {
	updateTime: number,
	collapsedThings?: { [fullName: string]: boolean },
} => ({
	updateTime: Date.now(),
}));
const initial = currentId && entryStorage.get(currentId);

module.beforeLoad = async () => {
	const { collapsedThings } = await initial || {};
	if (!collapsedThings) return;

	watchForThings(['comment'], thing => {
		if (collapsedThings.hasOwnProperty(thing.getFullname())) thing.setCommentCollapse(true, COLLAPSE_REASON);
	}, { immediate: true });
};

module.contentStart = () => {
	listenToCommentCollapse();

	maybePruneOldEntries('commentHidePersistor', entryStorage);
};

function listenToCommentCollapse() {
	$(document.body).on('click', 'a.expand', (e: MouseEvent) => {
		const thing = Thing.checkedFrom(e.currentTarget);
		const collapsed = thing.isCollapsed();

		if (collapsed) {
			// Ignore if some automatic function (e.g. filters) caused this to collapse
			const currentCollapseReason = e.currentTarget.getAttribute('collapse-reason');
			if (currentCollapseReason && currentCollapseReason !== COLLAPSE_REASON) return;

			entryStorage.patch(currentId, { collapsedThings: { [thing.getFullname()]: true }, updateTime: Date.now() });
		} else {
			e.currentTarget.removeAttribute('collapse-reason');
			entryStorage.deletePath(currentId, 'collapsedThings', thing.getFullname());
		}
	});
}
