/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { Storage } from '../environment';
import { click } from '../utils';

export const module: Module<*> = new Module('commentHidePersistor');

module.moduleName = 'commentHidePerName';
module.category = 'commentsCategory';
module.description = 'commentHidePerDesc';

module.include = [
	'comments',
	'inbox',
];

const hidePersistorStorage = Storage.wrap('RESmodules.commentHidePersistor.hidePersistor', {
	hiddenThings: ({}: { [key: string]: string[] }),
	hiddenKeys: ([]: string[]),
});

module.go = async () => {
	bindToHideLinks();
	await hideHiddenThings();
};

let allHiddenThings = {};
let hiddenKeys = [];
let hiddenThings = [];
const hiddenThingsKey = location.pathname;
const maxKeys = 100;
const pruneKeysTo = 50;

function bindToHideLinks() {
	/**
	 * For every expand/collapse link, add a click listener that will
	 * store or remove the comment ID from our list of hidden comments.
	 **/
	$('body').on('click', 'a.expand', function() {
		const $thing = $(this).parents('.thing:eq(0)');
		const thingId = $thing.attr('data-fullname');
		const collapsing = $thing.is('.collapsed') || $(this).parent().parent().hasClass('noncollapsed');

		/* Add our key to pages interacted with, for potential pruning later */
		if (!hiddenKeys.includes(hiddenThingsKey)) {
			hiddenKeys.push(hiddenThingsKey);
		}

		if (collapsing) {
			addHiddenThing(thingId);
		} else {
			removeHiddenThing(thingId);
		}
	});
}

async function loadHiddenThings() {
	const hidePersistorData = await hidePersistorStorage.get();

	if (hidePersistorData) {
		allHiddenThings = hidePersistorData.hiddenThings;
		hiddenKeys = hidePersistorData.hiddenKeys;

		/**
		 * Prune allHiddenThings of old content so it doesn't get
		 * huge.
		 **/
		if (hiddenKeys.length > maxKeys) {
			const pruneStart = maxKeys - pruneKeysTo;
			const newHiddenThings = {};
			/* Recreate our object as a subset of the original */
			const newHiddenKeys = hiddenKeys.slice(pruneStart);

			for (const hiddenKey of newHiddenKeys) {
				newHiddenThings[hiddenKey] = allHiddenThings[hiddenKey];
			}

			allHiddenThings = newHiddenThings;
			hiddenKeys = newHiddenKeys;
			syncHiddenThings();
		}

		if (allHiddenThings[hiddenThingsKey]) {
			hiddenThings = allHiddenThings[hiddenThingsKey];
		}
	}
}

function addHiddenThing(thingId) {
	if (!hiddenThings.includes(thingId)) {
		hiddenThings.push(thingId);
	}
	syncHiddenThings();
}

function removeHiddenThing(thingId) {
	const i = hiddenThings.indexOf(thingId);
	if (i !== -1) {
		hiddenThings.splice(i, 1);
	}
	syncHiddenThings();
}

function syncHiddenThings() {
	allHiddenThings[hiddenThingsKey] = hiddenThings;
	const hidePersistorData = {
		hiddenThings: allHiddenThings,
		hiddenKeys,
	};
	hidePersistorStorage.set(hidePersistorData);
}

async function hideHiddenThings() {
	await loadHiddenThings();

	const query = hiddenThings
		.filter(v => v)
		.map(id => `[data-fullname=${id}].noncollapsed > div.entry a.expand`)
		.join(', ');

	if (query) {
		for (const collapseButton of document.querySelectorAll(query)) {
			if (collapseButton.offsetParent) {
				click(collapseButton);
			}
		}
	}
}
