/**
 * CommentHidePersistor - stores hidden comments in localStorage and re-hides
 * them on reload of the page.
 **/

import { $ } from '../vendor';
import { Storage } from '../environment';
import { click } from '../utils';

export const module = {};

module.moduleID = 'commentHidePersistor';
module.moduleName = 'Comment Hide Persistor';
module.category = 'Comments';
module.description = 'Saves the state of hidden comments across page views.';

module.include = [
	'comments',
	'inbox',
];

module.go = async function() {
	bindToHideLinks();
	await hideHiddenThings();
};

let allHiddenThings = {};
let hiddenKeys = [];
let hiddenThings = [];
const hiddenThingsKey = location.href;
const maxKeys = 100;
const pruneKeysTo = 50;

function bindToHideLinks() {
	/**
	 * For every expand/collapse link, add a click listener that will
	 * store or remove the comment ID from our list of hidden comments.
	 **/
	$('body').on('click', 'a.expand', function() {
		const $thing = $(this).parents('.thing:eq(0)');
		const thingId = $thing.data('fullname');
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
	const hidePersistorData = await Storage.get('RESmodules.commentHidePersistor.hidePersistor');

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
	Storage.set('RESmodules.commentHidePersistor.hidePersistor', hidePersistorData);
}

async function hideHiddenThings() {
	await loadHiddenThings();

	const query = hiddenThings
		.filter(v => v)
		.map(id => `[data-fullname=${id}].noncollapsed > div.entry a.expand`)
		.join(', ');

	if (query) {
		for (const collapseButton of document.querySelectorAll(query)) click(collapseButton);
	}
}
