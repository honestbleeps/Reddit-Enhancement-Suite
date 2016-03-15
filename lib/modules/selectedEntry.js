addModule('selectedEntry', function(module, moduleID) {
	module.moduleName = 'Selected Entry';
	module.category = [ 'Appearance', 'Browsing'];
	module.include = [ 'comments', 'linklist', 'profile', 'inbox', 'search' ];
	module.description = 'When a post or comment is selected, show extra styling and tools';

	module.options = {
		autoSelectOnScroll: {
			type: 'boolean',
			value: false,
			description: 'Automatically select the topmost element for keyboard navigation on window scroll'
		},
		selectThingOnLoad: {
			type: 'boolean',
			value: true,
			description: 'Automatically select a post/comment when the page loads',
		},
		selectLastThingOnLoad: {
			dependsOn: 'selectThingOnLoad',
			type: 'boolean',
			value: true,
			description: 'Automatically select the last thing you had selected'
		},
		scrollToSelectedThingOnLoad: {
			dependsOn: 'selectThingOnLoad',
			type: 'boolean',
			value: false,
			description: 'Automatically scroll to the post/comment that is selected when the page loads',
		},
		selectOnClick: {
			type: 'boolean',
			value: true,
			description: 'Select a link or comment when clicked with the mouse',
			advanced: true
		},
		addFocusBGColor: {
			type: 'boolean',
			value: true,
			description: 'Set a background color to highlight the currently focused element'
		},
		focusBGColor: {
			type: 'color',
			value: '#F0F3FC',
			description: 'Background color of focused element',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		focusBGColorNight: {
			type: 'color',
			value: '#373737',
			description: 'Background color of focused element in Night Mode',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		focusFGColorNight: {
			type: 'color',
			value: '#DDDDDD',
			description: 'Foreground color of focused element in Night Mode',
			advanced: true,
			dependsOn: 'addFocusBGColor'
		},
		addFocusBorder: {
			type: 'boolean',
			value: true,
			description: 'Set a border to highlight the currently focused element'
		},
		focusBorder: {
			type: 'text',
			value: '',
			description: 'border style (e.g. 1px dashed gray) for focused element',
			advanced: true,
			dependsOn: 'addFocusBorder'
		},
		focusBorderNight: {
			type: 'text',
			value: '',
			description: 'border style (e.g. 1px dashed gray) for focused element in Night Mode',
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
			window.addEventListener('scroll', function(e) { RESUtils.debounce(moduleID + '.autoSelectOnScroll', 300, onScroll); });
		}
		if (module.options.selectOnClick.value) {
			$(document.body).on('click', thingSelector, module.handleClick);
		}

		RESUtils.addCSS(' \
			.entry { padding-right: 5px; } \
			');

		if (module.options.addFocusBGColor.value) {
			addFocusBGColor();
		}
		if (module.options.addFocusBorder.value) {
			addFocusBorder();
		}

		setTimeout(selectInitial, 100);
	};

	var handleClickThrottled;
	module.handleClick = function(e) {
		// Exposed so modules which stop propagation on click events inside things can explicitly pass the event to this module
		if (!module.options.selectOnClick.value) {
			return;
		}
		if (RESUtils.click.isProgrammaticEvent(e)) {
			// Use modules['select'].select(thing), don't rely on click handling
			return;
		}
		if (!handleClickThrottled) {
			handleClickThrottled = true;
			setTimeout(function() { handleClickThrottled = false; }, 100);
			onClick.call(this, e);
		}
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

	var thingSelector = '.listing .thing, .linklisting .thing, .nestedlisting .thing, .search-result-link';
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
		var newThing = RESUtils.thing(thingOrEntry);
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

	module.scrollTo = function(thingOrEntry, options) {
		var thing = RESUtils.thing(thingOrEntry);
		if (!thing.thing) {
			return;
		}

		scrollTo(thing, null, options);
	};

	function scrollTo(selected, last, options) {
		if (!selected) return;
		options = $.extend(true, {
				makeVisible: selected.entry
			},
			options);
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
				break;
			}
		}
	}

	function onClick(e) {
		select(e.target, { scrollStyle: 'none' });
	}

	var lastSelectedCache,
		lastSelectedKey = 'RESmodules.selectedThing.lastSelectedCache';
	function setupLastSelectedCache() {
		if (lastSelectedCache) return;
		lastSelectedCache = RESStorage.getItem(lastSelectedKey) || '{}';
		lastSelectedCache = safeJSON.parse(lastSelectedCache, lastSelectedKey) || {};

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
			RESStorage.setItem(lastSelectedKey, JSON.stringify(lastSelectedCache));
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
		RESStorage.setItem('RESmodules.selectedThing.lastSelectedCache', JSON.stringify(lastSelectedCache));
	}

	function selectInitial() {
		if (!module.options.selectThingOnLoad.value) {
			return;
		}
		var target = findLastSelectedThing();
		if (!(target && target.length)) {
			target = module.selectableThings().first();
		}

		select(target, {
			scrollStyle: module.options.scrollToSelectedThingOnLoad.value ? 'legacy' : 'none'
		});
	}

	function findLastSelectedThing() {
		if (!module.options.selectLastThingOnLoad.value) {
			return;
		}
		setupLastSelectedCache();

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
		var borderType = RESEnvironment.getOutlineProperty() || 'outline';

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
