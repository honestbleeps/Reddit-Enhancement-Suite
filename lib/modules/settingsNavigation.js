addModule('settingsNavigation', function(module, moduleId) {
	module.moduleName = 'RES Settings Navigation';
	module.category = 'Core';
	module.description = 'Helping you get around the RES Settings Console with greater ease';
	module.hidden = true;
	module.alwaysEnabled = true;
	module.options = {
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
	};
	module.go = function() {
		if (!(this.isEnabled() && this.isMatchURL())) return;

		window.addEventListener('hashchange', onHashChange);
		window.addEventListener('popstate', onPopState);
		setTimeout(onHashChange, 300); // for initial pageload; wait until after RES has completed loading

		// consoleTip();
	};

	/*function consoleTip() {
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
	}*/

	module.makeUrlHashLink = function(moduleID, optionKey, displayText, cssClass) {
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
	};

	module.makeUrlHash = function(moduleID, optionKey) {
		var hashComponents = ['#!settings'];

		if (moduleID) {
			hashComponents.push(moduleID);
		}

		if (moduleID && optionKey) {
			hashComponents.push(optionKey);
		}

		var hash = hashComponents.join('/');
		return hash;
	};

	module.setUrlHash = function(moduleID, optionKey) {
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

		if (location.hash != hash) {
			history.pushState(hash, title, hash);
		}
	};

	module.resetUrlHash = function() {
		history.pushState('', document.title, location.pathname + location.search);
	};

	function onHashChange(event) {
		var hash = location.hash, moduleID, optionKey;
		if (hash.substring(0, 10) !== '#!settings') return;

		var params = hash.match(/\/(?:\w|\s|%20)+/g);
		if (params && params[0]) {
			moduleID = params[0].substring(1).replace('%20', ' ');
		}
		if (params && params[1]) {
			optionKey = params[1].substring(1).replace('%20', ' ');
		}

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	}

	function onPopState(event) {
		var state = typeof event.state === 'string' && event.state.split('/');
		if (!state || state[0] !== '#!settings') {
			if (modules['settingsConsole'].isOpen) {
				// Avoid adding a duplicate page to the browser history
				var resetUrl = false;
				modules['settingsConsole'].close({
					resetUrl: resetUrl
				});
			}
			return;
		}

		var moduleID = state[1];
		var optionKey = state[2];

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	}

	module.loadSettingsPage = function(moduleID, optionKey, optionValue) {
		var module, category;
		if (moduleID && modules.hasOwnProperty(moduleID)) {
			module = modules[moduleID];
		}
		if (module) {
			category = [].concat(module.category)[0];
		}

		modules['settingsConsole'].open(module && module.moduleID);
		if (moduleID == 'search') {
			modules['search'].search(optionKey);
		} else if (module) {
			if (optionKey && module.options.hasOwnProperty(optionKey)) {
				var optionsPanel = $(modules['settingsConsole'].RESConsoleContent);
				var optionElement = optionsPanel.find('label[for="' + optionKey + '"]');
				var optionParent = optionElement.parent();
				optionParent.addClass('highlight');
				optionParent.show();
				if (optionElement.length) {
					if (optionParent.hasClass('advanced') && !modules['settingsNavigation'].options.showAllOptions.value) {
						document.getElementById('RESConsoleContent').classList.remove('advanced-options-disabled');
						if (modules['settingsNavigation'].options.showAllOptionsAlert.value) {
							alert('You opened a link to an advanced option, but not all options are shown. These options will be shown until you leave or refresh the page. If you want to see all options in the future, check the <i>Show all options</i> checkbox in the settings console title bar above.<br /><br /><label><input type="checkbox" class="disableAlert" checked="" style="margin:1px 5px 0px 0px;"> Always show this type of notification</label>');
							$('#alert_message .disableAlert').click(function(){
								RESUtils.options.setOption('settingsNavigation', 'showAllOptionsAlert', this.checked);
							});
						}
					}
					var configPanel = $(modules['settingsConsole'].RESConfigPanelOptions);
					var offset = optionElement.offset().top - configPanel.offset().top - 10;
					configPanel.scrollTop(offset);
				}
			}
		}
	};
});



addModule('search', function(module, moduleID) {
	module.moduleName = 'Search RES Settings';
	module.category = 'About RES';
	module.alwaysEnabled = true;
	module.sort = -9;

	module.loadDynamicOptions = async function() {
		module.description = (await RESTemplates.load('searchRESPanel')).html();
	};

	let searchFormTemplate, searchResultTemplate, optionLinkTemplate;

	module.beforeLoad = async function() {
		searchFormTemplate = await RESTemplates.load('settingsConsoleSearch');
		searchResultTemplate = await RESTemplates.load('searchResultOptionHtml');
		optionLinkTemplate = await RESTemplates.load('optionLinkSnudown');
	};

	let menuItem;

	module.go = function() {
		menuItem = RESUtils.createElement('span', 'RESSearchMenuItem', 'RESMenuItemButton res-icon', '\uF094');
		menuItem.setAttribute('title', 'search settings');
		menuItem.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			showSearch();
		}, false);
		modules['settingsConsole'].menuItem.appendChild(menuItem);

		modules['commandLine'].registerCommand(/^set(?:t?ings?)?$/, 'settings [words to search for]- search RES settings console',
			function(command, val) {
				var str = 'Search RES settings';
				if (val && val.length) {
					str += ' for: ' + val;
				}
				return str;
			},
			function(command, val, match, e) {
				module.search(val);
			}
		);
	};

	module.search = function(query) {
		drawSearchResults(query);
		getSearchResults(query);
		modules['settingsNavigation'].setUrlHash('search', query);
	};

	module.PRESERVE_SPACES = true;

	function showSearch() {
		modules['RESMenu'].hidePrefsDropdown();
		drawSearchResults();
		$('#SearchRES-input').focus();
	}

	function doneSearch(query, results) {
		drawSearchResults(query, results);
	}

	function getSearchResults(query) {
		if (!query || !query.toString().length) {
			doneSearch(query, []);
		}

		var sanitizedQuery = sanitizeString(query, module.PRESERVE_SPACES);
		var queryTerms = sanitizedQuery && sanitizedQuery.length ? sanitizedQuery.split(' ') : [];
		var results = [];

		// Search options
		if (queryTerms && queryTerms.length) {
			results = searchDomain();

			results = results.map(function(item) {
				item.rank = item.getRank.apply(item, [queryTerms].concat(item.context));
				return item;
			}).filter(function(item) {
				return item && item.rank !== false && item.rank !== Infinity;
			}).sort(function(a, b) {
				return b.rank - a.rank;
			}).map(function(item) {
				return item.format.apply(item, item.context);
			});
		}

		doneSearch(query, results);

	}

	function searchDomain() {
		var results = [];
		for (var moduleID in modules) {
			if (!modules.hasOwnProperty(moduleID)) continue;
			if (moduleID == module.moduleID) continue;
			var mod = modules[moduleID];
			if (mod.hidden) continue;

			results.push({ context: [moduleID], getRank: rankModule, format: makeModuleSearchResult });

			var options = mod.options;

			for (var optionKey in options) {
				if (!options.hasOwnProperty(optionKey)) continue;
				var option = options[optionKey];
				if (option.noconfig) continue;

				results.push({ context: [moduleID, optionKey], getRank: rankOption, format: makeOptionSearchResult });
			}
		}

		return results;
	}

	function rankString(queryTerms, string) {
		if (!queryTerms || !queryTerms.length || !string) {
			return false;
		}
		var indexes = indexesOfSearchTermsInString(queryTerms, sanitizeString(string, false));
		var weighted = indexes.map(function(item) {
			// Better score: lower value and lower matchedIndex
			return 100 - (item.value * ( ( Math.log(item.matchedIndex + 1) / Math.log(5) ) + 1 ) );
		});
		var reduced = weighted.length ?
			weighted.reduce(function(a, b) {
				return a + b;
			}, 0) :
			Infinity;
		return reduced;
	}

	function rankModule(queryTerms, moduleID) {
		var mod = modules[moduleID],
			string = mod.moduleID + mod.moduleName + [].concat(mod.category).join('') + mod.description;
		return rankString(queryTerms, string) * 0.9;
	}

	function rankOption(queryTerms, moduleID, optionKey) {
		var mod = modules[moduleID],
			option = mod.options[optionKey],
			string = optionKey + mod.moduleID + mod.moduleName + [].concat(mod.category).join('') + option.description;
		return rankString(queryTerms, string);
	}

	function indexesOfSearchTermsInString(needles, haystack) {
		var matches;
		if (!haystack || !haystack.length)
			return false;

		matches = needles.filter(function(needle) {
			return haystack.indexOf(needle) !== -1;
		}).map(function(needle, i) {
			return {
				matchedIndex: i,
				value: haystack.indexOf(needle)
			};
		});

		return matches;
	}

	function sanitizeString(text, preserveSpaces) {
		if (text === undefined || text === null) {
			return '';
		}

		var replaceSpacesWith = preserveSpaces ? ' ' : '';
		return text.toString().toLowerCase()
			.replace(/[,\/\s]+/g, replaceSpacesWith);
	}

	function makeOptionSearchResult(moduleKey, optionKey) {
		var mod = modules[moduleKey];
		var option = mod.options[optionKey];

		var result = {};
		result.type = 'option';
		result.breadcrumb = ['RES settings console',
			[].concat(mod.category)[0],
			mod.moduleName + ' (' + mod.moduleID + ')'
		].join(' > ');
		result.title = optionKey;
		result.description = (option.description || '').replace(/<(?:br|p|div|span)>/g, '\n').split('\n')[0];
		result.advanced = option.advanced;
		result.category = [].concat(mod.category)[0];
		result.moduleName = mod.moduleName;
		result.moduleID = moduleKey;
		result.optionKey = optionKey;

		return result;
	}

	function makeModuleSearchResult(moduleKey) {
		var mod = modules[moduleKey];

		var result = {};
		result.type = 'module';
		result.breadcrumb = ['RES settings console',
			[].concat(mod.category)[0],
			'(' + mod.moduleID + ')'
		].join(' > ');
		result.title = mod.moduleName;
		result.moduleName = mod.moduleName;
		result.description = mod.description;
		result.category = [].concat(mod.category)[0];
		result.moduleID = moduleKey;

		return result;
	}

	function onSearchResultSelected(result) {
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
	}

	// ---------- View ------
	module.renderSearchForm = async container => {
		$(container).find('#SearchRES-input-container').replaceWith(searchFormTemplate.html());

		$(container).on('submit', '#SearchRES-input-container', function(e) {
			e.preventDefault();
			var RESSearchBox = container.querySelector('#SearchRES-input');
			module.search(RESSearchBox.value);

			return false;
		});
	};

	function drawSearchResultsPage() {
		modules['settingsConsole'].open('search');
	}

	function drawSearchResults(query, results) {
		drawSearchResultsPage();

		var resultsContainer = $('#SearchRES-results-container');
		resultsContainer.off('click', handleSearchResultClick)
			.on('click', '.SearchRES-result-item', handleSearchResultClick);

		if (!query || !query.length) {
			resultsContainer.hide();
			return;
		}

		var count = 0, advancedResults = 0;
		if (results) {
			results.forEach(function(result) {
				if (result.advanced) {
					advancedResults++;
				} else {
					count++;
				}
			});
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
			$('#SearchRES-results-hidden a').off('click').on('click', function(e) {
				$(document.getElementById('RESAllOptions')).click();
				getSearchResults(query);
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

				var element = drawSearchResultItem(result);
				resultsList.append(element);
			}
		}
	}

	function drawSearchResultItem(result) {
		const element = $('<li>')
			.addClass('SearchRES-result-item')
			.toggleClass('advanced', !!result.advanced)
			.data('SearchRES-result', result);

		$('<span>', { class: 'SearchRES-result-copybutton res-icon' })
			.html('&#xF159')
			.appendTo(element)
			.attr('title', 'copy this for a comment');

		const details = searchResultTemplate.html(result);
		element.append(details);

		return element;
	}

	function handleSearchResultClick(e) {
		var element = $(this);
		var result = element.data('SearchRES-result');
		if ($(e.target).is('.SearchRES-result-copybutton')) {
			onSearchResultCopy(result, element);
		} else {
			onSearchResultSelected(result);
		}
		e.preventDefault();
	}

	function onSearchResultCopy(result, element) {
		const markdown = makeOptionSearchResultLink(result);
		alert(`<textarea rows="5" cols="50">${markdown}</textarea><p>Copy and paste this into your comment</p>`);
	}

	function makeOptionSearchResultLink(result) {
		const baseUrl = location.protocol + '//' + location.host + location.pathname;

		const context = $.extend(true, {}, result);
		$.extend(context, {
			url: baseUrl + modules['settingsNavigation'].makeUrlHash(result.moduleID, result.optionKey),
			settingsUrl: baseUrl + modules['settingsNavigation'].makeUrlHash(),
			moduleUrl: baseUrl + modules['settingsNavigation'].makeUrlHash(result.moduleID),
			optionUrl: baseUrl + modules['settingsNavigation'].makeUrlHash(result.moduleID, result.optionKey)
		});

		result = optionLinkTemplate.text(context);
		result = $.trim(result) + '\n\n\n';
		return result;
	}
});
