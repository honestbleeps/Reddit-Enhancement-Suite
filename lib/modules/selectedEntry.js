addModule('selectedEntry', function(module, moduleID) {
	module.moduleName = 'Selected Entry';
	module.category = [ 'Style', 'Comments', 'Posts' ];
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

		setTimeout(selectInitial, 100);
	}

	var selectedEntry, selectedThing, selectedContainer;
	module.select = function(thing, options) {
		if (!thing || ('length' in thing && thing.length === 0)) return;
		select(thing, options);
	};

	module.unselect = function() {
		var prevSelected = selected;
		select(undefined);
		return prevSelected;
	};

	module.selected = function() {
		return selectedThing && {
			entry: selectedEntry,	// DOMElement
			thing: selectedThing	// DOMElement
		};
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

		var newSelected = newThing && {
			thing: newThing,
			entry: newThing && newThing.querySelector('.entry')
		};
		var oldSelected = selectedThing && {
			thing: selectedThing,
			entry: selectedEntry
		};

		options = options || {};
		listeners && listeners.fire(newSelected, oldSelected, options);

		selectedEntry = newSelected.entry;
		selectedThing = newSelected.thing;
		selectedContainer = $(newSelected.thing).parent().closest('.thing');
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

	function scrollTo(selected, last, options) {
		if (!selected) return;
		options = $.extend(true, {}, {
				makeVisible: selected.entry,
			},
			options);
		RESUtils.scrollToElement(selected.thing, options);
	}

	function updateActiveElement(selected, last) {
		selected && selected.entry.classList.add('RES-keyNav-activeElement');
		last && last.entry.classList.remove('RES-keyNav-activeElement');
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
		var thing = $(this).closest('.thing')[0];
		select(thing, { scrollStyle: 'none' });
	}

	var lastSelectedCache,
		lastSelectedKey = 'RESmodules.selectedThing.lastSelectedCache';
	function setupLastSelectedCache() {
		if (lastSelectedCache) return;
		lastSelectedCache = RESStorage.getItem(lastSelectedKey) || '{}'
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
		if (!RESUtils.isPageType('linklist', 'profile')) return;

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
		var target = findLastSelectedThing();
		if (!(target && target.length)) {
			target = module.selectableThings().first();
		}
		select(target);
	}

	function findLastSelectedThing() {
		setupLastSelectedCache();

		var url = urlForSelectedCache();
		var lastSelected = (lastSelected = lastSelectedCache[url]) && lastSelected.fullname;
		if (lastSelected) {
			target = module.selectableThings().filter(function() {
				return this.getAttribute('data-fullname') === lastSelected;
			});
			return target;
		}
	}


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
		var borderType = RESUtils.runtime.getOutlineProperty() || 'outline';

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
