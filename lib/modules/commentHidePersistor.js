/**
 * CommentHidePersistor - stores hidden comments in localStorage and re-hides
 * them on reload of the page.
 **/
m_chp = modules['commentHidePersistor'] = {
	moduleID: 'commentHidePersistor',
	moduleName: 'Comment Hide Persistor',
	category: 'Comments',
	description: 'Saves the state of hidden comments across page views.',
	allHiddenThings: {},
	hiddenKeys: [],
	hiddenThings: [],
	hiddenThingsKey: window.location.href,
	maxKeys: 100,
	pruneKeysTo: 50,

	options: {},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			m_chp.bindToHideLinks();
			m_chp.hideHiddenThings();
		}
	},
	bindToHideLinks: function() {
		/**
		 * For every expand/collapse link, add a click listener that will
		 * store or remove the comment ID from our list of hidden comments.
		 **/
		$('body').on('click', 'a.expand', function() {
			var thing = $(this).parents('.thing'),
				thingId = thing.data('fullname'),
				collapsing = !$(this).parent().is('.collapsed');

			/* Add our key to pages interacted with, for potential pruning
			   later */
			if (m_chp.hiddenKeys.indexOf(m_chp.hiddenThingsKey) === -1) {
				m_chp.hiddenKeys.push(m_chp.hiddenThingsKey);
			}

			if (collapsing) {
				m_chp.addHiddenThing(thingId);
			} else {
				m_chp.removeHiddenThing(thingId);
			}
		});
	},
	loadHiddenThings: function() {
		var hidePersistorJson = RESStorage.getItem('RESmodules.commentHidePersistor.hidePersistor')

		if (hidePersistorJson) {
			try {
				m_chp.hidePersistorData = safeJSON.parse(hidePersistorJson)
				m_chp.allHiddenThings = m_chp.hidePersistorData['hiddenThings']
				m_chp.hiddenKeys = m_chp.hidePersistorData['hiddenKeys']

				/**
				 * Prune allHiddenThings of old content so it doesn't get
				 * huge.
				 **/
				if (m_chp.hiddenKeys.length > m_chp.maxKeys) {
					var pruneStart = m_chp.maxKeys - m_chp.pruneKeysTo,
						newHiddenThings = {},
						newHiddenKeys = [];

					/* Recreate our object as a subset of the original */
					for (var i = pruneStart; i < m_chp.hiddenKeys.length; i++) {
						var hiddenKey = m_chp.hiddenKeys[i];
						newHiddenKeys.push(hiddenKey);
						newHiddenThings[hiddenKey] = m_chp.allHiddenThings[hiddenKey];
					}
					m_chp.allHiddenThings = newHiddenThings;
					m_chp.hiddenKeys = newHiddenKeys;
					m_chp.syncHiddenThings();
				}

				if (typeof m_chp.allHiddenThings[m_chp.hiddenThingsKey] !== 'undefined') {
					m_chp.hiddenThings = m_chp.allHiddenThings[m_chp.hiddenThingsKey];
					return;
				}
			} catch (e) {}
		}
	},
	addHiddenThing: function(thingId) {
		var i = m_chp.hiddenThings.indexOf(thingId);
		if (i === -1) {
			m_chp.hiddenThings.push(thingId);
		}
		m_chp.syncHiddenThings();
	},
	removeHiddenThing: function(thingId) {
		var i = m_chp.hiddenThings.indexOf(thingId);
		if (i !== -1) {
			m_chp.hiddenThings.splice(i, 1);
		}
		m_chp.syncHiddenThings();
	},
	syncHiddenThings: function() {
		var hidePersistorData;
		m_chp.allHiddenThings[m_chp.hiddenThingsKey] = m_chp.hiddenThings;
		hidePersistorData = {
			'hiddenThings': m_chp.allHiddenThings,
			'hiddenKeys': m_chp.hiddenKeys
		}
		RESStorage.setItem('RESmodules.commentHidePersistor.hidePersistor', JSON.stringify(hidePersistorData));
	},
	hideHiddenThings: function() {
		m_chp.loadHiddenThings();

		for (var i = 0, il = m_chp.hiddenThings.length; i < il; i++) {
			var thingId = m_chp.hiddenThings[i],
				// $hideLink = $('div.id-' + thingId + ':first > div.entry div.noncollapsed a.expand');
				// changed how this is grabbed and clicked due to firefox not working properly with it.
				$hideLink = document.querySelector('div.id-' + thingId + ' > div.entry div.noncollapsed a.expand');
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
						RESUtils.click($hideLink);
					}, 0);
				})($hideLink);
			}
		}
	}
};
