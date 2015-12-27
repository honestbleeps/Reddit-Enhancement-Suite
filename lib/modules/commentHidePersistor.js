/**
 * CommentHidePersistor - stores hidden comments in localStorage and re-hides
 * them on reload of the page.
 **/
addModule('commentHidePersistor', function(module, moduleID) {
	module.moduleName = 'Comment Hide Persistor';
	module.category = 'Comments';
	module.description = 'Saves the state of hidden comments across page views.';

	module.include = [
		'comments'
	];

	module.beforeLoad = function() {
		return RESStorage.loadItem('RESmodules.commentHidePersistor.hidePersistor');
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			bindToHideLinks();
			hideHiddenThings();
		}
	};

	var allHiddenThings = {};
	var hiddenKeys = [];
	var hiddenThings = [];
	var hiddenThingsKey = location.href;
	var maxKeys = 100;
	var pruneKeysTo = 50;

	function bindToHideLinks() {
		/**
		 * For every expand/collapse link, add a click listener that will
		 * store or remove the comment ID from our list of hidden comments.
		 **/
		$('body').on('click', 'a.expand', function() {
			var $thing = $(this).parents('.thing:eq(0)'),
				thingId = $thing.data('fullname'),
				collapsing = $thing.is('.collapsed') || $(this).parent().parent().hasClass('noncollapsed');

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

	function loadHiddenThings() {
		var hidePersistorJson = RESStorage.getItem('RESmodules.commentHidePersistor.hidePersistor');

		if (hidePersistorJson) {
			try {
				var hidePersistorData = safeJSON.parse(hidePersistorJson);
				allHiddenThings = hidePersistorData['hiddenThings'];
				hiddenKeys = hidePersistorData['hiddenKeys'];

				/**
				 * Prune allHiddenThings of old content so it doesn't get
				 * huge.
				 **/
				if (hiddenKeys.length > maxKeys) {
					var pruneStart = maxKeys - pruneKeysTo,
						newHiddenThings = {},
						newHiddenKeys = [];

					/* Recreate our object as a subset of the original */
					for (var i = pruneStart; i < hiddenKeys.length; i++) {
						var hiddenKey = hiddenKeys[i];
						newHiddenKeys.push(hiddenKey);
						newHiddenThings[hiddenKey] = allHiddenThings[hiddenKey];
					}
					allHiddenThings = newHiddenThings;
					hiddenKeys = newHiddenKeys;
					syncHiddenThings();
				}

				if (typeof allHiddenThings[hiddenThingsKey] !== 'undefined') {
					hiddenThings = allHiddenThings[hiddenThingsKey];
					return;
				}
			} catch (e) {
				// ignore
			}
		}
	}

	function addHiddenThing(thingId) {
		var i = hiddenThings.indexOf(thingId);
		if (i === -1) {
			hiddenThings.push(thingId);
		}
		syncHiddenThings();
	}

	function removeHiddenThing(thingId) {
		var i = hiddenThings.indexOf(thingId);
		if (i !== -1) {
			hiddenThings.splice(i, 1);
		}
		syncHiddenThings();
	}

	function syncHiddenThings() {
		var hidePersistorData;
		allHiddenThings[hiddenThingsKey] = hiddenThings;
		hidePersistorData = {
			'hiddenThings': allHiddenThings,
			'hiddenKeys': hiddenKeys
		};
		RESStorage.setItem('RESmodules.commentHidePersistor.hidePersistor', JSON.stringify(hidePersistorData));
	}

	function hideHiddenThings() {
		loadHiddenThings();

		for (var i = 0, il = hiddenThings.length; i < il; i++) {
			var thingId = hiddenThings[i],
				$thing = $('div.id-' + thingId),
				$entry = $thing.children('div.entry');


			if ($thing.is('.collapsed')) {
				continue;
			}

			var $hideLink = $entry.find(':not(.collapsed) a.expand');

			if ($hideLink) {
				/**
				 * Zero-length timeout to defer this action until after the
				 * other modules have finished. For some reason without
				 * deferring the hide was conflicting with the
				 * commentNavToggle width.
				 **/
				(function($hideLink) {
					window.setTimeout(function() {
						// $hideLink.click();
						RESUtils.click($hideLink.get(0));
					}, 0);
				})($hideLink);
			}
		}
	}
});
