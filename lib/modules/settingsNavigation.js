modules['settingsNavigation'] = {
	moduleID: 'settingsNavigation',
	moduleName: 'RES Settings Navigation',
	category: 'UI',
	description: 'Helping you get around the RES Settings Console with greater ease',
	hidden: true,
	options: {},
	isEnabled: function() {
		// return RESConsole.getModulePrefs(this.moduleID);
		return true;
	},
	include: [
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		RESUtils.addCSS('#RESSearchMenuItem { \
			display: block;	\
			float: right;	\
			margin: 7px;	\
			width: 21px;height: 21px;	\
			border: 1px #c9def2 solid;	\
			border-radius: 3px;	\
			background: transparent center center no-repeat; \
			background-image: ' + this.searchButtonIcon + '; \
			} ');
		RESUtils.addCSS('li:hover > #RESSearchMenuItem { \
			border-color: #369;	\
			background-image: ' + this.searchButtonIconHover + '; \
			}');
	},
	go: function() {
		RESUtils.addCSS(modules['settingsNavigation'].css);
		this.menuItem = RESUtils.createElementWithID('i', 'RESSearchMenuItem');
		this.menuItem.setAttribute('title', 'search settings');
		this.menuItem.addEventListener('click', function(e) {
			modules['settingsNavigation'].showSearch()
		}, false);
		RESConsole.settingsButton.appendChild(this.menuItem);

		if (!(this.isEnabled() && this.isMatchURL())) return;

		window.addEventListener('hashchange', modules['settingsNavigation'].onHashChange);
		window.addEventListener('popstate', modules['settingsNavigation'].onPopState);
		setTimeout(modules['settingsNavigation'].onHashChange, 300); // for initial pageload; wait until after RES has completed loading

		this.consoleTip();
	},
	searchButtonIcon: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVuG7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohbyS1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL42K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8OokmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAONJREFUOBGlkz0KwkAQRo2ICt5IsBE9gI1dwAOk8AqCgufQPo2CYGlhIVh4Aj2ClYVg4hvdCclmI8gOPHbn78vsLgnSNK35WN2nWXq9BRoVEwyIj6ANO4ghgbLJHVjM8BM4wwGesIYm2LU1O9ClSCwCzfXZi8gkF9NcSWBB0dVRGBPbOOLOSww4qJA38d3vbanqEabEA5Mbsj4gNH42vvgFxxTIJYpd4AgvcbAVdKDQ8/lKflaz12ds4e+hBxFsIYQ7fM1W/OHPyYktIZuiagLVt9cxgRucNPGvgPZlq/e/4C3wBoAXSrzY2Qd2AAAAAElFTkSuQmCC')",
	searchButtonIconHover: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVuG7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohbyS1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL42K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8OokmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAPBJREFUOBGlkTEKAjEQRTciIth4HkvRA9jYCR7AwisICvZiZ6X9NlvYW1gIFp5AT2Eh6PpGMjLuBkUy8JmZ5P+fZOLyPE9iohIjFm20QTV0A+dch/UeqIMtSHnqg1wOmYEFjAkQ8hHswA1sQM3ytC6KWxBlqqM3IUna9GIy1DWbiwYziGdLkJpIQVZclz40REbgnKhMSB/+b+sKSZ8wpnb+9C71FQwsV+uPJ3iBDFFOO4E9uPt+TW6oUHPJwJvINy7BCvTBAohpBpoqfnFt861GOPUmc8vTd7L3O5it3OaCwUHZfxmoyObQN9r9n3W0wRPmWv0jZnGemgAAAABJRU5ErkJggg==')",
	consoleTip: function() {
		// first, ensure that we've at least run dailyTip once (so RES first-run has happened)...
		var lastToolTip = RESStorage.getItem('RESLastToolTip');
		if (lastToolTip) {
			// if yes, see if the user has ever opened the settings console.
			var hasOpenedConsole = RESStorage.getItem('RESConsole.hasOpenedConsole');
			if (!hasOpenedConsole) {
				// if no, nag them once daily that the console exists until they use it.  Once it's been opened, this check will never run again.
				var lastCheckDailyTip = parseInt(RESStorage.getItem('RESLastToolTip'), 10) || 0;
				var now = Date.now();
				// 86400000 = 1 day - remind users once a day if they've never opened the settings that they should check out the console sometime...
				var lastCheck = parseInt(RESStorage.getItem('RESConsole.hasOpenedCheck'), 10) || 0;
				if (((now - lastCheckDailyTip) > 1000) && ((now - lastCheck) > 86400000)) {
					RESStorage.setItem('RESConsole.hasOpenedCheck', now);
					modules['RESTips'].showTip(0, 'console');
				}
			}
		}
	},
	makeUrlHashLink: function(moduleID, optionKey, displayText, cssClass) {
		if (!displayText) {
			if (optionKey) {
				displayText = optionKey;
			} else if (modules[moduleID]) {
				displayText = modules[moduleID].moduleName;
			} else if (moduleID) {
				displayText = moduleID;
			} else {
				displayText = 'Settings';
			}
		}

		var hash = modules['settingsNavigation'].makeUrlHash(moduleID, optionKey);
		var link = ['<a ', 'class="', cssClass || '', '" ', 'href="', hash, '"', '>', displayText, '</a>'].join('');
		return link;
	},
	makeUrlHash: function(moduleID, optionKey) {
		var hashComponents = ['#!settings']

		if (moduleID) {
			hashComponents.push(moduleID);
		}

		if (moduleID && optionKey) {
			hashComponents.push(optionKey);
		}

		var hash = hashComponents.join('/');
		return hash;
	},
	setUrlHash: function(moduleID, optionKey) {
		var titleComponents = ['RES Settings'];

		if (moduleID) {
			var module = modules[moduleID];
			var moduleName = module && module.moduleName || moduleID;
			titleComponents.push(moduleName);

			if (optionKey) {
				titleComponents.push(optionKey);
			}
		}

		var hash = this.makeUrlHash(moduleID, optionKey);
		var title = titleComponents.join(' - ');

		if (window.location.hash != hash) {
			window.history.pushState(hash, title, hash);
		}
	},
	resetUrlHash: function() {
		window.location.hash = "";
	},
	onHashChange: function(event) {
		var hash = window.location.hash;
		if (hash.substring(0, 10) !== '#!settings') return;

		var params = hash.match(/\/[\w\s]+/g);
		if (params && params[0]) {
			var moduleID = params[0].substring(1);
		}
		if (params && params[1]) {
			var optionKey = params[1].substring(1);
		}

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	},
	onPopState: function(event) {
		var state = typeof event.state === "string" && event.state.split('/');
		if (!state || state[0] !== '#!settings') {
			if (RESConsole.isOpen) {
				RESConsole.close();
			}
			return;
		}

		var moduleID = state[1];
		var optionKey = state[2];

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	},
	loadSettingsPage: function(moduleID, optionKey, optionValue) {
		if (moduleID && modules.hasOwnProperty(moduleID)) {
			var module = modules[moduleID];
		}
		if (module) {
			var category = module.category;
		}


		RESConsole.open(module && module.moduleID);
		if (module) {
			if (optionKey && module.options.hasOwnProperty(optionKey)) {
				var optionsPanel = $(RESConsole.RESConsoleContent);
				var optionElement = optionsPanel.find('label[for="' + optionKey + '"]');
				var optionParent = optionElement.parent();
				optionParent.addClass('highlight');
				if (optionElement.length) {
					var configPanel = $(RESConsole.RESConsoleConfigPanel);
					var offset = optionElement.offset().top - configPanel.offset().top;
					optionsPanel.scrollTop(offset);
				}
			}
		} else {
			switch (moduleID) {
				case 'search':
					this.search(optionKey);
					break;
				default:
					break;
			}
		}
	},
	search: function(query) {
		RESConsole.openCategoryPanel('About RES');
		modules['settingsNavigation'].drawSearchResults(query);
		modules['settingsNavigation'].getSearchResults(query);
		modules['settingsNavigation'].setUrlHash('search', query);
	},
	showSearch: function() {
		RESConsole.hidePrefsDropdown();
		modules['settingsNavigation'].drawSearchResults();
		$('#SearchRES-input').focus();
	},
	doneSearch: function(query, results) {
		modules['settingsNavigation'].drawSearchResults(query, results);
	},
	getSearchResults: function(query) {
		if (!(query && query.toString().length)) {
			modules['settingsNavigation'].doneSearch(query, []);
		}

		var queryTerms = modules['settingsNavigation'].prepareSearchText(query, true).split(' ');
		var results = [];

		// Search options
		for (var moduleKey in modules) {
			if (!modules.hasOwnProperty(moduleKey)) continue;
			var module = modules[moduleKey];


			var searchString = module.moduleID + module.moduleName + module.category + module.description;
			searchString = modules['settingsNavigation'].prepareSearchText(searchString, false);
			var matches = modules['settingsNavigation'].searchMatches(queryTerms, searchString);
			if (matches) {
				var result = modules['settingsNavigation'].makeModuleSearchResult(moduleKey);
				result.rank = matches;
				results.push(result);
			}


			var options = module.options;

			for (var optionKey in options) {
				if (!options.hasOwnProperty(optionKey)) continue;
				var option = options[optionKey];

				var searchString = module.moduleID + module.moduleName + module.category + optionKey + option.description;
				searchString = modules['settingsNavigation'].prepareSearchText(searchString, false);
				var matches = modules['settingsNavigation'].searchMatches(queryTerms, searchString);
				if (matches) {
					var result = modules['settingsNavigation'].makeOptionSearchResult(moduleKey, optionKey);
					result.rank = matches;
					results.push(result);
				}
			}
		}

		results.sort(function(a, b) {
			var comparison = b.rank - a.rank;

			/*
			if (comparison === 0) {
				comparison = 
					a.title < b.title ? -1
				 	: a.title > b.title ? 1
				 	: 0;

			}

			if (comparison === 0) {
				comparison = 
					a.description < b.description ? -1
				 	: a.description > b.description ? 1
				 	: 0;
			}
			*/

			return comparison;
		});

		modules['settingsNavigation'].doneSearch(query, results);

	},
	searchMatches: function(needles, haystack) {
		if (!(haystack && haystack.length))
			return false;

		var numMatches = 0;
		for (var i = 0; i < needles.length; i++) {
			if (haystack.indexOf(needles[i]) !== -1)
				numMatches++;
		}

		return numMatches;
	},
	prepareSearchText: function(text, preserveSpaces) {
		if (typeof text === "undefined" || text === null) {
			return '';
		}

		var replaceSpacesWith = !! preserveSpaces ? ' ' : ''
		return text.toString().toLowerCase()
			.replace(/[,\/]/g, replaceSpacesWith).replace(/\s+/g, replaceSpacesWith);
	},
	makeOptionSearchResult: function(moduleKey, optionKey) {
		var module = modules[moduleKey];
		var option = module.options[optionKey];

		var result = {};
		result.type = 'option';
		result.breadcrumb = ['Settings',
			module.category,
			module.moduleName + ' (' + module.moduleID + ')'
		].join(' > ');
		result.title = optionKey;
		result.description = option.description;
		result.moduleID = moduleKey;
		result.optionKey = optionKey;

		return result;
	},
	makeModuleSearchResult: function(moduleKey) {
		var module = modules[moduleKey];

		var result = {};
		result.type = 'module';
		result.breadcrumb = ['Settings',
			module.category,
			'(' + module.moduleID + ')'
		].join(' > ');
		result.title = module.moduleName;
		result.description = module.description;
		result.moduleID = moduleKey;

		return result;
	},

	onSearchResultSelected: function(result) {
		if (!result) return;

		switch (result.type) {
			case 'module':
				modules['settingsNavigation'].loadSettingsPage(result.moduleID);
				break;
			case 'option':
				modules['settingsNavigation'].loadSettingsPage(result.moduleID, result.optionKey);
				break;
			default:
				alert('Could not load search result');
				break;
		}
	},
	// ---------- View ------
	css: '\
		#SearchRES #SearchRES-results-container { \
			display: none; \
		} \
		#SearchRES #SearchRES-results-container + #SearchRES-boilerplate { margin-top: 1em; border-top: 1px black solid; padding-top: 1em; }	\
		#SearchRES h4 { \
			margin-top: 1.5em; \
		} \
		#SearchRES-results { \
		} \
		#SearchRES-results li { \
			list-style-type: none; \
			border-bottom: 1px dashed #ccc; \
			cursor: pointer; \
			margin-left: 0px; \
			padding-left: 10px; \
			padding-top: 24px; \
			padding-bottom: 24px; \
		} \
		#SearchRES-results li:hover { \
			background-color: #FAFAFF; \
		} \
		.SearchRES-result-title { \
			margin-bottom: 12px; \
			font-weight: bold; \
			color: #666; \
		} \
		.SearchRES-breadcrumb { \
			font-weight: normal; \
			color: #888; \
		} \
		.SearchRES-result-copybutton {\
			float: right; \
			opacity: 0.4; \
			padding: 10px; \
			width: 26px; \
			height: 22px; \
			background: no-repeat center center; \
			background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAWCAYAAADeiIy1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjY1RTYzOTA2ODZDRjExREJBNkUyRDg4N0NFQUNCNDA3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUwRjM3M0QxMDY5NTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUwRjM3M0QwMDY5NTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTgwMTE3NDA3MjA2ODExODA4M0ZFMkJBM0M1RUU2NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNjgwMTE3NDA3MjA2ODExODA4M0U3NkRBMDNEMDVDMSIvPiA8ZGM6dGl0bGU+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPmdseXBoaWNvbnM8L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOnRpdGxlPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pn00ay4AAAEISURBVHjavJWBDYQgDEXhcgMwwm2gIzgCIzjCjeAIjsAIN8KN4Ai6wW3AtTm4EChYkdjkm2javLa2IKy1olZgL9CD5XsShI8PSF8B8pqvAqEWUJ8FYemglQhEmfg/gA0uhvLHVo5EUtmAf3ZgCoNB74xvLkEVgnwlJtOep8vSVihM9veRAKiDFdhCK/VdECal9JBONLSkIhzVBpWUW4cT1giSDEMMmqP+GjdxA2OPiuMdgxb3bQozOr2wBMhSGTFAppQYBZoqDtWR4ZuA1MFromf60gt7AKZyp0oo6UD4ImuWEJYbB6Dbi28BYsXfQJsLMBUQH7Nx/HWDU4B3le9cfCWtHAjqK8AAypyhqqqagq4AAAAASUVORK5CYII="); \
			display: none; \
		} \
		#SearchRES-results li:hover .SearchRES-result-copybutton { display: block; } \
		#SearchRES-input-submit { \
			margin-left: 8px; \
		} \
		#SearchRES-input { \
			width: 200px; \
			height: 22px; \
			font-size: 14px; \
		} \
		#SearchRES-input-container { \
			float: left; \
			margin-left: 3em; \
			margin-top: 7px; \
		} \
 	',
	searchPanelHtml: '\
		<h3>Search RES Settings Console</h3> \
		<div id="SearchRES-results-container"> \
			<h4>Results for: <span id="SearchRES-query"></span></h4> \
			<ul id="SearchRES-results"></ul> \
			<p id="SearchRES-results-none">No results found</p> \
		</div> \
		<div id="SearchRES-boilerplate"> \
			<p>You can search for RES options by module name, option name, and description. For example, try searching for "daily trick" in one of the following ways:</p> \
			<ul> \
				<li>type <code>daily trick</code> in the search box above and click the button</li> \
				<li>press <code>.</code> to open the RES console, type in <code>search <em>daily trick</em></code>, and press Enter</li> \
			</ul> \
		</div> \
	',
	searchPanel: null,
	renderSearchPanel: function() {
		var searchPanel = $('<div />').html(modules['settingsNavigation'].searchPanelHtml);
		searchPanel.on('click', '#SearchRES-results-container .SearchRES-result-item', modules['settingsNavigation'].handleSearchResultClick);

		modules['settingsNavigation'].searchPanel = searchPanel;
		return searchPanel;
	},
	searchForm: null,
	renderSearchForm: function() {
		var RESSearchContainer = RESUtils.createElementWithID('form', 'SearchRES-input-container');

		var RESSearchBox = RESUtils.createElementWithID('input', 'SearchRES-input');
		RESSearchBox.setAttribute('type', 'text');
		RESSearchBox.setAttribute('placeholder', 'search RES settings');

		var RESSearchButton = RESUtils.createElementWithID('input', 'SearchRES-input-submit');
		RESSearchButton.classList.add('blueButton');
		RESSearchButton.setAttribute('type', 'submit');
		RESSearchButton.setAttribute('value', 'search');

		RESSearchContainer.appendChild(RESSearchBox);
		RESSearchContainer.appendChild(RESSearchButton);

		RESSearchContainer.addEventListener('submit', function(e) {
			e.preventDefault();
			modules['settingsNavigation'].search(RESSearchBox.value);

			return false;
		});

		searchForm = RESSearchContainer;
		return RESSearchContainer;
	},
	drawSearchResultsPage: function() {
		if (!RESConsole.isOpen) {
			RESConsole.open();
		}

		if (!$('#SearchRES').is(':visible')) {
			RESConsole.openCategoryPanel('About RES');

			// Open "Search RES" page
			$('#Button-SearchRES', this.RESConsoleContent).trigger('click', {
				duration: 0
			});
		}
	},
	drawSearchResults: function(query, results) {
		modules['settingsNavigation'].drawSearchResultsPage();

		var resultsContainer = $('#SearchRES-results-container', modules['settingsNavigation'].searchPanel);

		if (!(query && query.length)) {
			resultsContainer.hide();
			return;
		}

		resultsContainer.show();
		resultsContainer.find('#SearchRES-query').text(query);
		$("#SearchRES-input", modules['settingsNavigation'].searchForm).val(query);

		if (!(results && results.length)) {
			resultsContainer.find('#SearchRES-results-none').show();
			resultsContainer.find('#SearchRES-results').hide();
		} else {
			resultsContainer.find('#SearchRES-results-none').hide();
			var resultsList = $('#SearchRES-results', resultsContainer).show();

			resultsList.empty();
			for (var i = 0; i < results.length; i++) {
				var result = results[i];

				var element = modules['settingsNavigation'].drawSearchResultItem(result);
				resultsList.append(element);
			}
		}
	},
	drawSearchResultItem: function(result) {
		var element = $('<li>');
		element.addClass('SearchRES-result-item')
			.data('SearchRES-result', result);

		$('<span>', {
			class: 'SearchRES-result-copybutton'
		})
			.appendTo(element)
			.attr('title', 'copy this for a comment');

		var breadcrumb = $('<span>', {
			class: 'SearchRES-breadcrumb'
		})
			.text(result.breadcrumb + ' > ');

		$('<div>', {
			class: 'SearchRES-result-title'
		})
			.append(breadcrumb)
			.append(result.title)
			.appendTo(element);

		$('<div>', {
			class: 'SearchRES-result-description'
		})
			.appendTo(element)
			.html(result.description);

		return element;
	},
	handleSearchResultClick: function(e) {
		var element = $(this);
		var result = element.data('SearchRES-result');
		if ($(e.target).is('.SearchRES-result-copybutton')) {
			modules['settingsNavigation'].onSearchResultCopy(result, element);
		} else {
			modules['settingsNavigation'].onSearchResultSelected(result);
		}
		e.preventDefault();
	},
	onSearchResultCopy: function(result, element) {
		var markdown = modules['settingsNavigation'].makeOptionSearchResultLink(result);
		alert('<textarea rows="5" cols="50">' + markdown + '</textarea>');
	},
	makeOptionSearchResultLink: function(result) {
		var url = document.location.pathname +
			modules['settingsNavigation'].makeUrlHash(result.moduleID, result.optionKey);

		var text = [
			result.breadcrumb,
			'[' + result.title + '](' + url + ')',
			'  \n',
			result.description,
			'  \n',
			'  \n'
		].join(' ');
		return text;
	}
};
