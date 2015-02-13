addModule('selectedEntry', function(module, moduleID) {
	module.moduleName = 'Selected Entry';
	module.category = [ 'Style', 'Comment', 'Post' ];
	module.include = [ 'comments', 'linklist', 'profile', 'inbox' ];
	module.description = 'When a post or comment is selected, show extra styling and tools';

	module.options = {
		autoSelectOnScroll: {
			type: 'boolean',
			value: false,
			description: 'Automatically select the topmost element for keyboard navigation on window scroll'
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
	}

	module.go = function() {
		if (!(module.isMatchURL() && module.isEnabled())) return;

		if (module.options.autoSelectOnScroll.value) {
			window.addEventListener('scroll', function(e) { RESUtils.debounce(moduleID + '.autoSelectOnScroll', 300, onScroll); });
		}
		if (module.options.selectOnClick.value) {
			var throttled;
			$(document.body).on('click', '.thing', function(e) {
				if (!throttled) {
					throttled = true;
					setTimeout(function() { throttled = false; }, 100);
					onClick.call(this, e);
				}
			});
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

		setTimeout(selectLastSelected, 100);
	}

	var selectedEntry, selectedThing, selectedContainer;
	module.select = function(thing, scrollToTop) {
		if (!thing || ('length' in thing && thing.length === 0)) return;
		select(thing, scrollToTop);
	};

	module.unselect = function() {
		var prevSelected = selected;
		select(undefined);
		return prevSelected;
	};

	module.selected = function() {
		return selectedEntry;
	};
	module.selectedThing = function() {
		return selectedThing;
	};

	module.selectableThings = function selectableThings() {
		return $('.linklisting .thing, .nestedlisting .thing');
	};

	var listeners;
	module.addListener = addListener;
	function addListener(callback) {
		if (!listeners) listeners = new $.Callbacks();
		listeners.add(callback);
	}



	function select(thingOrEntry, options) {
		var newThing = $(thingOrEntry).closest('.thing')[0];
		if (newThing === selectedThing) return;

		var oldSelected = selectedEntry;
		var newEntry = newThing && newThing.querySelector('.entry');

		options = options || {};
		listeners && listeners.fire(newEntry, oldSelected, options);

		selectedEntry = newEntry;
		selectedThing = newThing;
		selectedContainer = newThing && $(newThing).parent().closest('.thing');

	}

	function onNewComments(entries) {
		if (selectedThing && !selectedThing.parentNode) {
			// Selected thing was replaced, so select the replacement
			var newContainer = $(entries).closest('.thing').parent().closest('.thing')
			if (newContainer.filter(selectedContainer).length) {
				select(entries, {
					replacement: true
				});
			}
		}
	}

	function addSelectListeners() {
		addListener(function(selected, unselected) { if (unselected) modules['hover'].close(false); });
		addListener(updateActiveElement);
		addListener(scrollTo);
		addListener(updateLastSelectedCache);

	}

	function addNewElementListeners() {
		RESUtils.watchForElement('newComments', onNewComments);
	}

	function scrollTo(thing, last, options) {
		if (!thing) return;
		var entry = thing.querySelector('.entry');
		RESUtils.scrollToElement(thing, {
			makeVisible: entry,
			scrollToTop: options.scrollToTop
		});

	}

	function updateActiveElement(newEntry, oldEntry) {
		newEntry && newEntry.classList.add('RES-keyNav-activeElement');
		oldEntry && oldEntry.classList.remove('RES-keyNav-activeElement');
	}

	function onScroll() {
		if (modules['keyboardNav'].recentKeyPress) return;

		var selected = module.selected();
		if (selected && RESUtils.elementInViewport(selected)) return;


		var things = $('.thing');
		for (var i = 0, len = things.length; i < len; i++) {
			if (RESUtils.elementInViewport(things[i])) {
				select(things[i]);
			}
		}
	}

	function onClick(e) {
		var thing = $(this).closest('.thing')[0];
		select(thing);
	}

	var lastSelectedCache,
		lastSelectedKey = 'RESmodules.selectedThing.lastSelectedCache';
	function setupLastSelectedCache() {
		if (lastSelectedCache) return;
		lastSelectedCache = safeJSON.parse(RESStorage.getItem(lastSelectedKey), lastSelectedKey) || {};

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


	function updateLastSelectedCache(thing) {
		if (!RESUtils.isPageType('linklist', 'profile')) return;

		var url = urlForSelectedCache();
		var now = Date.now();
		lastSelectedCache[url] = {
			fullname: thing && thing.getAttribute('data-fullname'),
			updated: now
		};
		RESStorage.setItem('RESmodules.selectedThing.lastSelectedCache', JSON.stringify(lastSelectedCache));
	}

	function selectLastSelected() {
		var url = urlForSelectedCache();
		var lastSelected = (lastSelected = lastSelectedCache[url]) && lastSelected.fullname;
		if (lastSelected) {
			var target = selectableThings().filter(function() {
				return this.getAttribute('data-fullname') === lastSelected;
			});
			select(target);
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
			.RES-keyNav-activeElement, .commentarea .RES-keyNav-activeElement .md, .commentarea .RES-keyNav-activeElement.entry .noncollapsed { background-color: ' + focusBGColor + ' !important; } \
			.res-nightmode .RES-keyNav-activeElement, .res-nightmode .RES-keyNav-activeElement .usertext-body, .res-nightmode .RES-keyNav-activeElement .usertext-body .md, .res-nightmode .RES-keyNav-activeElement .usertext-body .md p, .res-nightmode .commentarea .RES-keyNav-activeElement .noncollapsed, .res-nightmode .RES-keyNav-activeElement .noncollapsed .md, .res-nightmode .RES-keyNav-activeElement .noncollapsed .md p { background-color: ' + focusBGColorNight + ' !important; color: ' + focusFGColorNight + ' !important;} \
			.res-nightmode .RES-keyNav-activeElement a.title:first-of-type {color: ' + focusFGColorNight + ' !important; } \
			');
	}

	function addFocusBorder() {
		var focusBorder, focusBorderNight;
		var borderType = BrowserStrategy.getOutlineProperty() || 'outline';

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
