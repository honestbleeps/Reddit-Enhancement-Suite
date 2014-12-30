modules['settingsNavigation'] = {
	moduleID: 'settingsNavigation',
	moduleName: 'RES Settings Navigation',
	category: 'UI',
	description: 'Helping you get around the RES Settings Console with greater ease',
	hidden: true,
	options: {
		showAllOptions: {
			type: 'boolean',
			value: true,
			description: 'All options are displayed by default. Uncheck this box if you would like to hide advanced options.',
			noconfig: true
		},
		showAllOptionsAlert: {
			type: 'boolean',
			value: true,
			description: 'If a user clicks on a link to an advanced option while advanced options are hidden, should an alert be shown?',
			noconfig: true
		}
	},
	alwaysEnabled: true,
	isEnabled: function() {
		// return RESConsole.getModulePrefs(this.moduleID);
		return true;
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
	},
	go: function() {
		if (!(this.isEnabled() && this.isMatchURL())) return;

		window.addEventListener('hashchange', modules['settingsNavigation'].onHashChange);
		window.addEventListener('popstate', modules['settingsNavigation'].onPopState);
		setTimeout(modules['settingsNavigation'].onHashChange, 300); // for initial pageload; wait until after RES has completed loading

		// this.consoleTip();
	},
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
		var hashComponents = ['#!settings'];

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
		window.history.pushState('', document.title, window.location.pathname + window.location.search);
	},
	onHashChange: function(event) {
		var hash = window.location.hash, moduleID, optionKey;
		if (hash.substring(0, 10) !== '#!settings') return;

		var params = hash.match(/\/(?:\w|\s|%20)+/g);
		if (params && params[0]) {
			moduleID = params[0].substring(1).replace('%20', ' ');
		}
		if (params && params[1]) {
			optionKey = params[1].substring(1).replace('%20', ' ');
		}

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	},
	onPopState: function(event) {
		var state = typeof event.state === 'string' && event.state.split('/');
		if (!state || state[0] !== '#!settings') {
			if (RESConsole.isOpen) {
				// Avoid adding a duplicate page to the browser history
				var resetUrl = false;
				RESConsole.close(resetUrl);
			}
			return;
		}

		var moduleID = state[1];
		var optionKey = state[2];

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	},
	loadSettingsPage: function(moduleID, optionKey, optionValue) {
		var module, category;
		if (moduleID && modules.hasOwnProperty(moduleID)) {
			module = modules[moduleID];
		}
		if (module) {
			category = module.category;
		}

		RESConsole.open(module && module.moduleID);
		if (moduleID == 'search') {
			modules['search'].search(optionKey);
		} else if (module) {
			if (optionKey && module.options.hasOwnProperty(optionKey)) {
				var optionsPanel = $(RESConsole.RESConsoleContent);
				var optionElement = optionsPanel.find('label[for="' + optionKey + '"]');
				var optionParent = optionElement.parent();
				optionParent.addClass('highlight');
				optionParent.show();
				if (optionElement.length) {
					if (optionParent.hasClass('advanced') && !modules['settingsNavigation'].options.showAllOptions.value)
					{
						document.getElementById('RESConsoleContent').classList.remove('advanced-options-disabled');
						if (modules['settingsNavigation'].options.showAllOptionsAlert.value) {
							alert('You opened a link to an advanced option, but not all options are shown. These options will be shown until you leave or refresh the page. If you want to see all options in the future, check the <i>Show all options</i> checkbox in the settings console title bar above.<br /><br /><label><input type="checkbox" class="disableAlert" checked="" style="margin:1px 5px 0px 0px;"> Always show this type of notification</label>');
							$('#alert_message .disableAlert').click(function(){
								RESUtils.setOption('settingsNavigation', 'showAllOptionsAlert', this.checked);
							});
						}
					}
					var configPanel = $(RESConsole.RESConfigPanelOptions);
					var offset = optionElement.offset().top - configPanel.offset().top - 10;
					configPanel.scrollTop(offset);
				}
			}
		}
	}
};



addModule('search', function(module, moduleID) {
	var self = module;

	module.moduleName = 'Search RES Settings';
	module.category = 'About RES';
	module.alwaysEnabled = true;

	RESTemplates.load('searchRESPanel', function(template) {
		module.description = template.html();
	});

	module.sort = +1;

	$.extend(module, {
		go: function() {
			this.menuItem = RESUtils.createElementWithID('i', 'RESSearchMenuItem');
			this.menuItem.setAttribute('title', 'search settings');
			this.menuItem.addEventListener('click', function(e) {
				modules['search'].showSearch();
			}, false);
			RESConsole.settingsButton.appendChild(this.menuItem);

			modules['commandLine'].registerCommand('search', 'search [words to search for]- search RES settings console',
				function (command, val) {
					var str = 'Search RES settings';
					if (val && val.length) {
						str += ' for: ' + val;
					}
					return str;
				},
				function (command, val, match, e) {
					modules['search'].search(val);
				}
			);
		},
		search: function(query) {
			RESConsole.openCategoryPanel('About RES');
			module.drawSearchResults(query);
			module.getSearchResults(query);
			modules['settingsNavigation'].setUrlHash('search', query);
		},
		showSearch: function() {
			RESConsole.hidePrefsDropdown();
			module.drawSearchResults();
			$('#SearchRES-input').focus();
		},
		doneSearch: function(query, results, advancedResults, count) {
			modules['search'].drawSearchResults(query, results, advancedResults, count);
		},
		getSearchResults: function(query) {
			if (!query || !query.toString().length) {
				modules['search'].doneSearch(query, []);
			}

			var queryTerms = modules['search'].prepareSearchText(query, true).split(' ');
			var results = [];
			var advancedResults = false;
			var count = 0;

			// Search options
			for (var moduleKey in modules) {
				if (!modules.hasOwnProperty(moduleKey)) continue;
				if (moduleKey == self.moduleID) continue;
				var module = modules[moduleKey];

				var moduleSearchString = module.moduleID + module.moduleName + module.category + module.description;
				moduleSearchString = modules['search'].prepareSearchText(moduleSearchString, false);
				var moduleMatches = modules['search'].searchMatches(queryTerms, moduleSearchString);
				if (moduleMatches) {
					var moduleResult = modules['search'].makeModuleSearchResult(moduleKey);
					moduleResult.rank = moduleMatches;
					count++;
					results.push(moduleResult);
				}

				var options = module.options;

				for (var optionKey in options) {
					if (!options.hasOwnProperty(optionKey)) continue;
					var option = options[optionKey];

					var optionSearchString = module.moduleID + module.moduleName + module.category + optionKey + option.description;
					optionSearchString = modules['search'].prepareSearchText(optionSearchString, false);
					var optionMatches = modules['search'].searchMatches(queryTerms, optionSearchString);
					if (optionMatches) {
						var optionResult = modules['search'].makeOptionSearchResult(moduleKey, optionKey);
						optionResult.rank = optionMatches;
						count++;
						results.push(optionResult);
						if (option.advanced) {
							advancedResults = true;
							if (!modules['settingsNavigation'].options.showAllOptions.value) {
								count--;
							}
						}
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

			modules['search'].doneSearch(query, results, advancedResults, count);

		},
		searchMatches: function(needles, haystack) {
			if (!haystack || !haystack.length)
				return false;

			var numMatches = 0;
			for (var i = 0; i < needles.length; i++) {
				if (haystack.indexOf(needles[i]) !== -1)
					numMatches++;
			}

			return numMatches;
		},
		prepareSearchText: function(text, preserveSpaces) {
			if (typeof text === 'undefined' || text === null) {
				return '';
			}

			var replaceSpacesWith = !! preserveSpaces ? ' ' : '';
			return text.toString().toLowerCase()
				.replace(/[,\/]/g, replaceSpacesWith).replace(/\s+/g, replaceSpacesWith);
		},
		makeOptionSearchResult: function(moduleKey, optionKey) {
			var module = modules[moduleKey];
			var option = module.options[optionKey];

			var result = {};
			result.type = 'option';
			result.breadcrumb = ['RES settings console',
				module.category,
				module.moduleName + ' (' + module.moduleID + ')'
			].join(' > ');
			result.title = optionKey;
			result.description = (option.description || '').replace(/<(?:br|p|div|span)>/g,'\n').split('\n')[0];
			result.advanced = option.advanced;
			result.category = module.category;
			result.moduleName = module.moduleName;
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
			result.moduleName = module.moduleName;
			result.description = module.description;
			result.category = module.category;
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
		searchForm: null,
		renderSearchForm: function() {
			var RESSearchContainer = RESUtils.createElementWithID('form', 'SearchRES-input-container');

			modules['settingsNavigation'].RESSearchBox = RESUtils.createElementWithID('input', 'SearchRES-input');
			modules['settingsNavigation'].RESSearchBox.setAttribute('type', 'text');
			modules['settingsNavigation'].RESSearchBox.setAttribute('placeholder', 'search RES settings');

			var RESSearchButton = RESUtils.createElementWithID('input', 'SearchRES-input-submit');
			RESSearchButton.classList.add('blueButton');
			RESSearchButton.setAttribute('type', 'submit');
			RESSearchButton.setAttribute('value', 'search');

			RESSearchContainer.appendChild(modules['settingsNavigation'].RESSearchBox);
			RESSearchContainer.appendChild(RESSearchButton);

			RESSearchContainer.addEventListener('submit', function(e) {
				e.preventDefault();
				modules['search'].search(modules['settingsNavigation'].RESSearchBox.value);

				return false;
			});

			module.searchForm = RESSearchContainer;
			return RESSearchContainer;
		},
		drawSearchResultsPage: function() {
			if (!RESConsole.isOpen) {
				RESConsole.open();
			}

			if (!$('#SearchRES-results-container').is(':visible')) {
				RESConsole.openCategoryPanel('About RES');

				// Open "Search RES" page
				$('#module-search', this.RESConsoleContent).trigger('click', {
					duration: 0
				});
			}
		},
		drawSearchResults: function(query, results, advancedResults, count) {
			module.drawSearchResultsPage();

			var resultsContainer = $('#SearchRES-results-container');
			resultsContainer.off('click', module.handleSearchResultClick)
				.on('click', '.SearchRES-result-item', module.handleSearchResultClick);

			if (!(query && query.length)) {
				resultsContainer.hide();
				return;
			}

			// display number of results.
			var plural = (count !== 1 ? 's' : '');
			var resultsMessage = count + ' result' + plural + ' for ' + query;
			$('#SearchRES-count').text(resultsMessage);

			resultsContainer.show();
			resultsContainer.find('#SearchRES-query').text(query);
			$('#SearchRES-input', module.searchForm).val(query);

			if (advancedResults) {
				resultsContainer.find('#SearchRES-results-hidden').addClass('advancedResults');
				$('#SearchRES-results-hidden a').off('click').on('click',function(e){
					$(document.getElementById('RESAllOptions')).click();
					modules['search'].getSearchResults(query);
					return false;
				});
			} else {
				resultsContainer.find('#SearchRES-results-hidden').removeClass('advancedResults');
			}
			if (!results || !results.length) {
				resultsContainer.find('#SearchRES-results').hide();
			} else {
				var resultsList = $('#SearchRES-results', resultsContainer).show();

				resultsList.empty();
				for (var i = 0; i < results.length; i++) {
					var result = results[i];

					var element = module.drawSearchResultItem(result);
					resultsList.append(element);
				}
			}
		},
		drawSearchResultItem: function(result) {
			var element = $('<li>');
			element.addClass('SearchRES-result-item')
				.toggleClass('advanced', !!result.advanced)
				.data('SearchRES-result', result);


			$('<span>', {
				class: 'SearchRES-result-copybutton'
			})
				.appendTo(element)
				.attr('title', 'copy this for a comment');

			var details = RESTemplates.getSync('searchResultOptionHtml').html(result);
			element.append(details);

			return element;
		},
		handleSearchResultClick: function(e) {
			var element = $(this);
			var result = element.data('SearchRES-result');
			if ($(e.target).is('.SearchRES-result-copybutton')) {
				modules['search'].onSearchResultCopy(result, element);
			} else {
				modules['search'].onSearchResultSelected(result);
			}
			e.preventDefault();
		},
		onSearchResultCopy: function(result, element) {
			var markdown = modules['search'].makeOptionSearchResultLink(result);
			alert('<textarea rows="5" cols="50">' + markdown + '</textarea>'+'<p>Copy and paste this into your comment</p>');
		},
		makeOptionSearchResultLink: function(result) {
			var baseUrl = document.location.protocol + '//' + document.location.host + document.location.pathname,
				context;

			context = $.extend(true, {}, result);
			$.extend(context, {
				url: baseUrl + modules['settingsNavigation'].makeUrlHash(result.moduleID, result.optionKey),
				settingsUrl: baseUrl + modules['settingsNavigation'].makeUrlHash(),
				moduleUrl: baseUrl + modules['settingsNavigation'].makeUrlHash(result.moduleID),
				optionUrl: baseUrl + modules['settingsNavigation'].makeUrlHash(result.moduleID, result.optionKey)
			});

			result = RESTemplates.getSync('optionLinkSnudown').text(context);
			result = $.trim(result) + '\n\n\n';
			return result;
		}
	});
});
