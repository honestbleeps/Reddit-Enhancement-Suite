addModule('selectedEntry', function(module, moduleID) {
	module.moduleName = 'Selected Entry';
	module.category = [ 'Appearance', 'Browsing'];
	module.include = [ 'comments', 'linklist', 'profile', 'inbox', 'search' ];
	module.description = 'Style the currently selected submission or comment. For use with Keyboard Navigation.';

	module.options = {
		autoSelectOnScroll: {
			type: 'boolean',
			value: false,
			description: 'Automatically select the topmost item while scrolling'
		},
		selectOnClick: {
			type: 'boolean',
			value: true,
			description: 'Allows you to click on an item to select it',
			advanced: true
		},
		addFocusBGColor: {
			type: 'boolean',
			value: true,
			description: 'Use a background color'
		},
		focusBGColor: {
			type: 'color',
			value: '#F0F3FC',
			description: 'The background color',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		focusBGColorNight: {
			type: 'color',
			value: '#373737',
			description: 'The background color while using Night Mode',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		focusFGColorNight: {
			type: 'color',
			value: '#DDDDDD',
			description: 'The text color while using Night Mode',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		addFocusBorder: {
			type: 'boolean',
			value: true,
			description: 'Use a border'
		},
		focusBorder: {
			type: 'text',
			value: '',
			description: 'Border appearance. E.g. <code>1px dashed gray</code> (CSS)',
			advanced: true,
			dependsOn: 'addFocusBorder'
		},
		focusBorderNight: {
			type: 'text',
			value: '',
			description: 'Border appearance using Night Mode (as above)',
			advanced: true,
			dependsOn: 'addFocusBorder'
		}
	};

	addSelectListeners();
	module.beforeLoad = function() {
		if (!(module.isMatchURL() && module.isEnabled())) return;

		addNewElementListeners();
	};

	module.go = function() {
		if (!(module.isMatchURL() && module.isEnabled())) return;

		if (module.options.autoSelectOnScroll.value) {
			window.addEventListener('scroll', RESUtils.debounce(onScroll, 300), false);
		}
		if (module.options.selectOnClick.value) {
			var throttled;
			$(document.body).on('click', thingSelector, function(e) {
				if (!throttled) {
					throttled = true;
					setTimeout(function() { throttled = false; }, 100);
					onClick.call(this, e);
				}
			});
		}

		if (module.options.addFocusBGColor.value) {
			addFocusBGColor();
		}
		if (module.options.addFocusBorder.value) {
			addFocusBorder();
		}

		setTimeout(selectInitial, 100);
	};

	var selectedThing, selectedContainer;
	module.select = function(thing, options) {
		if (!thing || ('length' in thing && thing.length === 0)) return;
		select(thing, options);
	};

	module.unselect = function() {
		var prevSelected = module.selected();
		select(undefined);
		return prevSelected;
	};

	module.selected = function() {
		return selectedThing;
	};

	var thingSelector = '.linklisting .thing, .nestedlisting .thing, .search-result-link';
	module.selectableThings = function selectableThings(selector) {
		return $(thingSelector).filter(':visible');
	};

	var listeners;
	module.addListener = addListener;
	function addListener(callback) {
		if (!listeners) listeners = new $.Callbacks();
		listeners.add(callback);
	}

	function select(thingOrEntry, options) {
		var newThing = new RESUtils.thing(thingOrEntry);
		if (!newThing.thing || newThing.is(selectedThing)) return;

		var newSelected = newThing;
		var oldSelected = selectedThing;

		options = options || {};
		if (listeners) {
			listeners.fire(newSelected, oldSelected, options);
		}

		selectedThing = newSelected;
		selectedContainer = newSelected && $(newSelected.thing).parent().closest('.thing');
	}

	var onNewCommentsCooldown;
	function onNewComments(entry) {
		if (onNewCommentsCooldown) {
			// Recently selected something, ignore remainder of batch
			return;
		}
		if (selectedThing && !selectedThing.parentNode) {
			// Selected thing was replaced, so select the replacement
			var newContainer = $(entry).closest('.thing').parent().closest('.thing');
			if (newContainer.filter(selectedContainer).length) {
				select(entry, {
					replacement: true
				});
				// only select the first applicable thing in a batch
				onNewCommentsCooldown = setTimeout(function() {
					onNewCommentsCooldown = undefined;
				}, 100);
			}
		}
	}

	function scrollTo(selected, last, options) {
		if (!selected) return;
		options = $.extend(true,
			{ makeVisible: selected.entry },
			options
		);
		RESUtils.scrollToElement(selected.thing, options);
	}

	function addSelectListeners() {
		addListener(function(selected, unselected) { if (unselected) modules['hover'].infocard('showParent').close(false); });
		addListener(updateActiveElement);
		addListener(scrollTo);
		addListener(updateLastSelectedCache);
	}

	function addNewElementListeners() {
		RESUtils.watchForElement('newComments', onNewComments);
	}

	function updateActiveElement(selected, last) {
		if (selected) {
			selected.entry.classList.add('RES-keyNav-activeElement');
			// Add a class to thing to provide extra styling options.
			selected.thing.classList.add('RES-keyNav-activeThing');
		}
		if (last) {
			last.entry.classList.remove('RES-keyNav-activeElement');
			last.thing.classList.remove('RES-keyNav-activeThing');
		}
	}

	function onScroll() {
		if (modules['keyboardNav'].recentKeyPress) return;

		var selected = module.selected();
		if (selected && RESUtils.elementInViewport(selected.entry)) return;


		var things = $('.thing');
		for (var i = 0, len = things.length; i < len; i++) {
			if (RESUtils.elementInViewport(things[i])) {
				select(things[i]);
			}
		}
	}

	function onClick(e) {
		select(e.target, { scrollStyle: 'none' });
	}

	var lastSelectedCache,
		lastSelectedKey = 'RESmodules.selectedThing.lastSelectedCache';
	async function setupLastSelectedCache() {
		if (lastSelectedCache) return;
		lastSelectedCache = await RESEnvironment.session.get(lastSelectedKey) || {};

		// clean cache every so often and delete any urls that haven't been visited recently
		var clearCachePeriod = 21600000; // 6 hours
		var itemExpiration = 3600000; // 1 hour
		var now = Date.now();
		if (!lastSelectedCache.lastScan || (now - lastSelectedCache.lastScan > clearCachePeriod)) {
			for (var idx in lastSelectedCache) {
				if (lastSelectedCache[idx] && (now - lastSelectedCache[idx].updated > itemExpiration)) {
					delete lastSelectedCache[idx];
				}
			}
			lastSelectedCache.lastScan = now;
			RESEnvironment.session.set(lastSelectedKey, lastSelectedCache);
		}
	}

	function urlForSelectedCache() {
		var url = document.location.pathname;
		// remove any trailing slash from the URL
		if (url.substr(-1) === '/') {
			url = url.substr(0, url.length - 1);
		}

		return url;
	}


	function updateLastSelectedCache(selected) {
		if (!lastSelectedCache || !RESUtils.isPageType('linklist', 'profile')) return;

		var url = urlForSelectedCache();
		var now = Date.now();
		var fullname = $(selected.thing).data('fullname');
		lastSelectedCache[url] = {
			fullname: fullname,
			updated: now
		};
		RESEnvironment.session.set('RESmodules.selectedThing.lastSelectedCache', lastSelectedCache);
	}

	async function selectInitial() {
		let target = await findLastSelectedThing();
		if (!(target && target.length)) {
			target = module.selectableThings().first();
		}
		select(target);
	}

	async function findLastSelectedThing() {
		await setupLastSelectedCache();

		var url = urlForSelectedCache();
		var lastSelected = (lastSelected = lastSelectedCache[url]) && lastSelected.fullname;
		if (lastSelected) {
			var target = module.selectableThings().filter(function() {
				return this.getAttribute('data-fullname') === lastSelected;
			});
			return target;
		}
	}


	// old style: .RES-keyNav-activeElement { '+borderType+': '+focusBorder+'; background-color: '+focusBGColor+'; } \
	// this new pure CSS arrow will not work because to position it we must have .RES-keyNav-activeElement position relative, but that screws up image viewer's absolute positioning to
	// overlay over the sidebar... yikes.
	// .RES-keyNav-activeElement:after { content: ""; float: right; margin-right: -5px; border-color: transparent '+focusBorderColor+' transparent transparent; border-style: solid; border-width: 3px 4px 3px 0; } \

	// why !important on .RES-keyNav-activeElement?  Because some subreddits are unfortunately using !important for no good reason on .entry divs...

	function addFocusBGColor() {
		var focusFGColorNight, focusBGColor, focusBGColorNight;

		if (typeof module.options.focusBGColor === 'undefined') {
			focusBGColor = '#F0F3FC';
		} else {
			focusBGColor = module.options.focusBGColor.value;
		}

		if (!(module.options.focusBGColorNight.value)) {
			focusBGColorNight = '#666';
		} else {
			focusBGColorNight = module.options.focusBGColorNight.value;
		}
		if (!(module.options.focusFGColorNight.value)) {
			focusFGColorNight = '#DDD';
		} else {
			focusFGColorNight = module.options.focusFGColorNight.value;
		}

		RESUtils.addCSS('	\
			.RES-keyNav-activeElement,\
			.RES-keyNav-activeElement .md-container { background-color: ' + focusBGColor + ' !important; }\
			\
			.res-nightmode .RES-keyNav-activeElement > .tagline,\
			.res-nightmode .RES-keyNav-activeElement .md-container > .md,\
			.res-nightmode .RES-keyNav-activeElement .md-container > .md p { color: ' + focusFGColorNight + ' !important; }\
			\
			.res-nightmode .RES-keyNav-activeElement,\
			.res-nightmode .RES-keyNav-activeElement .md-container { background-color: ' + focusBGColorNight + ' !important; }\
			');
	}

	function addFocusBorder() {
		var focusBorder, focusBorderNight;
		var borderType = 'outline';

		if (typeof module.options.focusBorder === 'undefined') {
			focusBorder = '';
		} else {
			focusBorder = borderType + ': ' + module.options.focusBorder.value + ';';
		}
		if (typeof module.options.focusBorderNight === 'undefined') {
			focusBorderNight = '';
		} else {
			focusBorderNight = borderType + ': ' + module.options.focusBorderNight.value + ';';
		}

		RESUtils.addCSS('	\
			.RES-keyNav-activeElement { ' + focusBorder + ' } \
			.res-nightmode .RES-keyNav-activeElement { ' + focusBorderNight + ' } \
			');
	}
});
