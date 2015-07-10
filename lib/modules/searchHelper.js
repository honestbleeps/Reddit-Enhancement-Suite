modules['searchHelper'] = {
	moduleID: 'searchHelper',
	moduleName: 'Search Helper',
	category: 'Posts',
	options: {
		searchSubredditByDefault: {
			type: 'boolean',
			value: true,
			description: 'Search the current subreddit by default when using the search box, instead of all of reddit.'
		},
		addSearchOptions: {
			type: 'boolean',
			value: true,
			description: 'Allow you to choose sorting and time range on the search form of the side panel.'
		},
		legacySearch: {
			type: 'boolean',
			value: false,
			description: 'Request the "legacy layout" feature for reddit search.\n\n<br>This will only be available for a limited time.'
		},
		userFilterBySubreddit: {
			type: 'boolean',
			value: false,
			description: 'When on a user profile, offer to search user\'s post from the subreddit or multireddit we come from.'
		},
		addSubmitButton: {
			type: 'boolean',
			value: false,
			description: 'Add a submit button to the search field.'
		},
		toggleSearchOptions: {
			type: 'boolean',
			value: true,
			description: 'Add a button to hide search options while searching.',
			advanced: true
		},
		hideSearchOptions: {
			type: 'boolean',
			value: false,
			description: 'Automatically hide search options and suggestions on the search page.',
			advanced: true,
			dependsOn: 'toggleSearchOptions'
		},
		searchByFlair: {
			type: 'boolean',
			value: true,
			description: 'When clicking on a post\'s flair, search its subreddit for that flair. <p>May not work in some subreddits that hide the actual flair and add pseudo-flair with CSS (only workaround is to disable subreddit style).</p>'
		},
		searchPageTabs: {
			type: 'boolean',
			value: true,
			description: 'Add tabs to the search page for a more compact layout.'
		},
		defaultSearchTab: {
			type: 'enum',
			value: 'subreddits',
			values: [{
				name: 'none',
				value: 'none'
			}, {
				name: 'subreddits',
				value: 'subreddits'
			}, {
				name: 'limit to subreddit',
				value: 'facets'
			}, {
				name: 'refine',
				value: 'options'
			}],
			description: 'The tab that will be expanded every time you search.',
			dependsOn: 'searchPageTabs'
		}
	},
	description: 'Provide help with the use of search.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	// include: [
	// ],
	isMatchURL: function() {
		// return RESUtils.isMatchURL(this.moduleID);
		return true;
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var searchExpando;
			if (this.options.searchSubredditByDefault.value) {
				this.searchSubredditByDefault();
			}
			if (this.options.addSearchOptions.value) {
				searchExpando = document.getElementById('searchexpando');
				if (searchExpando) {
					var searchOptionsHtml = '<label>Sort:<select name="sort"><option value="relevance">relevance</option><option value="new">new</option><option value="hot">hot</option><option value="top">top</option><option value="comments">comments</option></select></label> <label>Time:<select name="t"><option value="all">all time</option><option value="hour">this hour</option><option value="day">today</option><option value="week">this week</option><option value="month">this month</option><option value="year">this year</option></select></label>';
					if ($(searchExpando).find('input[name=restrict_sr]').length) { // we don't want to add the new line if we are on the front page
						searchOptionsHtml = '<br />' + searchOptionsHtml;
					}
					$(searchExpando).find('#moresearchinfo').before(searchOptionsHtml);
				}
			}
			if (this.options.legacySearch.value) {
				$('form#search').append('<input type="hidden" name="feature" value="legacy_search" />');
			}
			if (this.options.userFilterBySubreddit.value) {
				var match = location.href.match(RESUtils.regexes.profile);
				if (match !== null) {
					var userProfile = match[1];
					var previousPage;
					if ((match = document.referrer.match(RESUtils.regexes.subreddit)) !== null) {
						previousPage = 'r/' + match[1];
					} else if ((match = document.referrer.match(RESUtils.regexes.multireddit)) !== null) {
						previousPage = match[1];
					}
					if (typeof previousPage !== 'undefined') {
						$('.content[role=main]').prepend('<div class="infobar"><a href="/' + previousPage + '/search?q=author:' + userProfile + ' nsfw:no&restrict_sr=on">Search post of ' + userProfile + ' on /' + previousPage + '</a></div>');
					}
				}
			}
			if (this.options.addSubmitButton.value) {
				searchExpando = document.getElementById('searchexpando');
				if (searchExpando) {
					RESUtils.addCSS('#searchexpando .searchexpando-submit { text-align:center; }');
					var submitDiv = '<div class="searchexpando-submit"><button type="submit">search</button></div>';
					$(searchExpando).append(submitDiv);
				}
			}
			var isLegacySearch = document.querySelector('#siteTable');
			if (this.options.toggleSearchOptions.value && RESUtils.regexes.search.test(location.href) && isLegacySearch) {
				RESUtils.addCSS('.searchpane-toggle-hide { float: right; margin-top: -1em } .searchpane-toggle-show { float: right; } .searchpane-toggle-show:after { content:"\u25BC"; margin-left:2px; }.searchpane-toggle-hide:after { content: "\u25B2"; margin-left: 2px; }');
				if (this.options.hideSearchOptions.value || location.hash === '#res-hide-options') {
					$('body').addClass('res-hide-options');
				}
				RESUtils.addCSS('.res-hide-options .search-summary, .res-hide-options .searchpane, .res-hide-options .searchfacets { display: none; } .res-hide-options .searchpane-toggle-show { display: block; } .searchpane-toggle-show { display: none; }');
				$('.content .searchpane').append('<a href="#res-hide-options" class="searchpane-toggle-hide">hide search options</a>');
				$('.content .searchpane ~ .menuarea').prepend('<a href="#res-show-options" class="searchpane-toggle-show">show search options</a>');
				$('.searchpane-toggle-hide').on('click', function() {
					$('body').addClass('res-hide-options');
				});
				$('.searchpane-toggle-show').on('click', function() {
					$('body').removeClass('res-hide-options');
				});
			}
			if (this.options.searchByFlair) {
				RESUtils.addCSS('.res-flairSearch { cursor: pointer; position: relative; } .linkflairlabel.res-flairSearch a { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }');
				$('#siteTable').on('mouseenter', '.title > .linkflairlabel:not(.res-flairSearch)', function(e) {
					var parent = $(e.target).closest('.thing')[0],
						srMatch = RESUtils.regexes.subreddit.exec(parent.querySelector('.entry a.subreddit')),
						subreddit = (srMatch) ? srMatch[1] : RESUtils.currentSubreddit(),
						flair = e.target.title.replace(/\s/g, '+');
					if (flair && subreddit) {
						var link = document.createElement('a');
						link.href = '/r/' + encodeURIComponent(subreddit) + '/search?sort=new&restrict_sr=on&q=flair%3A' + encodeURIComponent(flair);
						e.target.classList.add('res-flairSearch');
						e.target.appendChild(link);
					}
				});
			}
		}
		// Compact search options into tabs.
		if (this.options.searchPageTabs.value && !isLegacySearch) {
			RESUtils.addCSS('.search-page .searchpane { height: auto; }');
			RESUtils.addCSS('.search-page #search { margin: 0; height: auto; }');
			RESUtils.addCSS('.combined-search-page #previoussearch .searchfacets { max-width: none; border: none; padding: 0 0 0; margin: 0; overflow: visible; }');
			RESUtils.addCSS('.combined-search-page #previoussearch .searchfacets h4.title { display: none; }');
			RESUtils.addCSS('.combined-search-page #previoussearch .searchfacets ol { padding: 10px 0 0 0; }');
			RESUtils.addCSS('.combined-search-page #previoussearch .search-result-group-header { display: none; }');
			RESUtils.addCSS('ul.res-search-tabs { margin: 10px 0 0 0; padding: 0; list-style: none; clear: left; }');
			RESUtils.addCSS('ul.res-search-tabs li { font-weight: bold; display: inline-block; margin: 0 2px 0 0; padding: 0; background: linear-gradient(to top, rgb(240,240,240), rgb(225,225,225)) }');
			RESUtils.addCSS('ul.res-search-tabs li:last-child { margin-right: none; }');
			RESUtils.addCSS('ul.res-search-tabs li.res-search-tab-active { background: rgb(255,255,255); }');
			RESUtils.addCSS('ul.res-search-tabs a { border-top: 1px solid transparent; padding: 5px 5px 5px 10px; display: inline-block;  }');
			RESUtils.addCSS('ul.res-search-tabs li a:after { content: "+"; text-align: center; display: inline-block; padding: 0 3px; width: 1em; visibility: hidden; }');
			RESUtils.addCSS('ul.res-search-tabs li.res-search-tab-active a:after { content: "-"; }');
			RESUtils.addCSS('ul.res-search-tabs li:hover a:after { visibility: visible; }');
			RESUtils.addCSS('ul.res-search-tabs li.res-search-tab-active a { border-color: rgb(51,102,153) }');
			RESUtils.addCSS('.res-search-options, .res-search-subreddits {  }');
			RESUtils.addCSS('.res-search-options { margin: 0; padding: 0; line-height: 1.5; }');
			RESUtils.addCSS('.res-search-options p { margin: 10px 0; }');
			RESUtils.addCSS('.res-search-options dl { padding: 15px; -webkit-column-count: 2; -moz-column-count: 2; }');
			RESUtils.addCSS('.res-search-options dt { font-weight: normal; margin-left: 0; }');
			RESUtils.addCSS('.res-search-options dd { margin: 0 0 5px; color: rgb(150,150,150); }');
			RESUtils.addCSS('.combined-search-page #previoussearch .search-result-group { margin: 0; padding: 0; }');
			RESUtils.addCSS('.combined-search-page #previoussearch .search-result { margin: 0 0 15px; padding: 0; }');
			RESUtils.addCSS('.combined-search-page #previoussearch .search-result-listing { margin: 0; }');
			RESUtils.addCSS('.combined-search-page #previoussearch .res-search-pane { padding: 10px; background-color: rgb(255,255,255); }');
			RESUtils.addCSS('.combined-search-page .search-result-group footer .nav-buttons { margin-bottom: 0; }');
			RESUtils.addCSS('ul.res-search-tabs li.res-search-tab-facets a:before, ul.res-search-tabs li.res-search-tab-subs a:before, ul.res-search-tabs li.res-search-tab-options a:before { font: 100%/1 "Batch"; display: inline-block; margin-right: 10px; }');

			// Variables.
			var searchTabsEle = RESUtils.createElementWithID('ul', '', 'res-search-tabs');
			var searchHeader = document.querySelector('#previoussearch');
			var searchForm = document.querySelector('form#search');
			var moreSearchInfo = document.querySelector('#moresearchinfo');
			var searchFacets = document.querySelector('body.search-page .searchfacets');
			var searchOptions = RESUtils.createElementWithID('div', '', 'res-search-options');
			if (searchForm) {
				searchForm.removeChild(searchForm.querySelector('#moresearchinfo + p'));
				moreSearchInfo = moreSearchInfo.innerHTML;
				
				$(searchTabsEle).appendTo(searchHeader);
				
				// Create a class for the subreddit results container.
				var subredditResultListing = document.querySelectorAll('.search-result-listing');
				for (var i = 0; i < subredditResultListing.length; i++) {
					if (subredditResultListing.length > 1) {
						subredditResultListing[0].classList.add('res-search-subreddits');
					}
				}
				
				// Set up search panes.
				if ($(moreSearchInfo).length) {
					$(searchOptions).appendTo(searchHeader);
					$(moreSearchInfo).appendTo(searchOptions);
				}
				if (searchFacets) {
					$(searchFacets).appendTo(searchHeader);
				}
				if ($('.res-search-subreddits').length) {
					$('.res-search-subreddits').appendTo(searchHeader);
				}

				// Set up tabs.
				var searchTabs = {
					'subreddits' : {
						'label' : 'subreddits',
						'id' : 'subs',
						'target' : '.res-search-subreddits',
						'exists' : $('.res-search-subreddits').length
					},
					'facets' : {
						'label' : 'limit to subreddit',
						'id' : 'facets',
						'target' : '.searchfacets',
						'exists' : searchFacets
					},
					'options' : {
						'label' : 'refine',
						'id' : 'options',
						'target' : '.res-search-options',
						'exists' : searchOptions
					}
				};
				
				for (var tab in searchTabs) {
					if (searchTabs.hasOwnProperty(tab)) {
						if (searchTabs[tab]['exists']) {
							// Add common class to all tab panes.
							document.querySelector(searchTabs[tab]['target']).classList.add('res-search-pane');
							$(searchTabs[tab]['target']).slideUp(0);

							// Build tabs in DOM.
							$('<li>').attr({ class: 'res-search-tab-' + searchTabs[tab]['id'] }).appendTo(searchTabsEle);
							$('<a>').attr({ href: '#'})
								.text(searchTabs[tab]['label'])
								.appendTo(searchTabsEle.querySelector('li.res-search-tab-' + searchTabs[tab]['id']))
								.click({id: searchTabs[tab]['id'], target: searchTabs[tab]['target']}, modules['searchHelper'].searchTabToggle);
						}
					}
				}
				
				// Default tab.
				console.log(this.options.searchPageTabs.value);
				if (this.options.searchPageTabs.value !== 'none') {
					modules['searchHelper'].searchTabToggle(searchTabs[this.options.defaultSearchTab.value]);
				}
			}
		}
	},
	searchTabToggle: function(e) {
		// e.data means this was executed by a mouse click.
		var tabID = (e.data) ? e.data.id : e.id;
		var target = (e.data) ? e.data.target : e.target;
		var tab = (e.data) ? this.parentNode : document.querySelector('.res-search-tabs .res-search-tab-' + tabID);
		var activeClass = 'res-search-tab-active';
		var openClass = 'res-search-pane-open';
		
		if (tab.classList.contains(activeClass)) {
			// Close pane if tab is clicked a 2nd time.
			$(target).removeClass(openClass).slideUp(200);
			tab.classList.remove(activeClass);
		} else {
			// Open target pane.
			$('.res-search-pane').addClass(openClass).slideUp(200);
			$('.res-search-tabs li').removeClass(activeClass);
			$('.res-search-pane').removeClass(openClass);
			tab.classList.add(activeClass);
			var speed = (e.data) ? 200 : 0;
			$(target).addClass(openClass).slideDown(speed);
		}
		
		return false;
	},
	searchSubredditByDefault: function() {
		// Reddit now has this feature... but for some reason the box isn't checked by default, so we'll still do that...
		var restrictSearch = document.body.querySelector('INPUT[name=restrict_sr]');
		if (restrictSearch && !document.body.classList.contains('search-page')) { // prevent autochecking after searching with it unchecked
			restrictSearch.checked = true;
		}
	}
};
