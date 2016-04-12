/**
 * CommentHidePersistor - stores hidden comments in localStorage and re-hides
 * them on reload of the page.
 **/

import { $ } from '../vendor';
import { storage } from '../environment';

addModule('commentHidePersistor', (module, moduleID) => {
	module.moduleName = 'Comment Hide Persistor';
	module.category = 'Comments';
	module.description = 'Saves the state of hidden comments across page views.';

	module.include = [
		'comments',
		'inbox'
	];

	module.go = async function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			bindToHideLinks();
			await hideHiddenThings();
		}
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
			if (hiddenKeys.indexOf(hiddenThingsKey) === -1) {
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
		const hidePersistorData = await storage.get('RESmodules.commentHidePersistor.hidePersistor');

		if (hidePersistorData) {
			allHiddenThings = hidePersistorData['hiddenThings'];
			hiddenKeys = hidePersistorData['hiddenKeys'];

			/**
			 * Prune allHiddenThings of old content so it doesn't get
			 * huge.
			 **/
			if (hiddenKeys.length > maxKeys) {
				const pruneStart = maxKeys - pruneKeysTo;
				const newHiddenThings = {};
				/* Recreate our object as a subset of the original */
				const newHiddenKeys = hiddenKeys.slice(pruneStart);

				newHiddenKeys.forEach(hiddenKey => (newHiddenThings[hiddenKey] = allHiddenThings[hiddenKey]));

				allHiddenThings = newHiddenThings;
				hiddenKeys = newHiddenKeys;
				syncHiddenThings();
			}

			if (typeof allHiddenThings[hiddenThingsKey] !== 'undefined') {
				hiddenThings = allHiddenThings[hiddenThingsKey];
				return;
			}
		}
	}

	function addHiddenThing(thingId) {
		const i = hiddenThings.indexOf(thingId);
		if (i === -1) {
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
			hiddenKeys
		};
		storage.set('RESmodules.commentHidePersistor.hidePersistor', hidePersistorData);
	}

	async function hideHiddenThings() {
		await loadHiddenThings();

		for (const thingId of hiddenThings) {
			const $thing = $(`div.id-${thingId}`);
			const $entry = $thing.children('div.entry');


			if ($thing.is('.collapsed')) {
				continue;
			}

			const $hideLink = $entry.find(':not(.collapsed) a.expand');

			if ($hideLink) {
				/**
				 * Zero-length timeout to defer this action until after the
				 * other modules have finished. For some reason without
				 * deferring the hide was conflicting with the
				 * commentNavToggle width.
				 **/
				(function($hideLink) {
					setTimeout(() => RESUtils.click($hideLink.get(0)), 0);
				})($hideLink);
			}
		}
	}
});
