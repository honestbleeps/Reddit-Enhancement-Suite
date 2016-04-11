import { $ } from '../core/global';

addModule('searchHelper', (module, moduleID) => {
	module.moduleName = 'Search Helper';
	module.category = 'Browsing';
	module.description = 'Provide help with the use of search.';
	module.options = {
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
		toggleSearchOptions: {
			type: 'boolean',
			value: true,
			description: 'Add a button to hide search options while searching.',
			advanced: true,
			dependsOn: 'legacySearch'
		},
		hideSearchOptions: {
			type: 'boolean',
			value: false,
			description: 'Automatically hide search options and suggestions on the search page.',
			advanced: true,
			dependsOn: 'legacySearch'
		},
		userFilterBySubreddit: {
			type: 'boolean',
			value: false,
			description: 'When on a user profile, offer to search user\'s post from the subreddit or multireddit we come from.'
		},
		searchByFlair: {
			type: 'boolean',
			value: true,
			description: 'When clicking on a post\'s flair, search its subreddit for that flair. <p>May not work in some subreddits that hide the actual flair and add pseudo-flair with CSS (only workaround is to disable subreddit style).</p>'
		},
		searchPageTabs: {
			type: 'boolean',
			value: true,
			description: 'Add tabs to the search page.',
			bodyClass: true
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
			description: 'The tab that will be expanded each time you search.',
			dependsOn: 'searchPageTabs',
			advanced: true
		},
		transitionSearchTabs: {
			type: 'boolean',
			value: true,
			description: 'Play a transition when you open and close tabs.',
			dependsOn: 'searchPageTabs',
			advanced: true
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.addSearchOptions.value) {
				const searchExpando = document.getElementById('searchexpando');
				if (searchExpando) {
					let searchOptionsHtml = '<label>Sort:<select name="sort"><option value="relevance">relevance</option><option value="new">new</option><option value="hot">hot</option><option value="top">top</option><option value="comments">comments</option></select></label> <label>Time:<select name="t"><option value="all">all time</option><option value="hour">this hour</option><option value="day">today</option><option value="week">this week</option><option value="month">this month</option><option value="year">this year</option></select></label>';
					if ($(searchExpando).find('input[name=restrict_sr]').length) { // we don't want to add the new line if we are on the front page
						searchOptionsHtml = `<br />${searchOptionsHtml}`;
					}
					$(searchExpando).find('#moresearchinfo').before(searchOptionsHtml);
				}
			}
			if (this.options.legacySearch.value) {
				$('form#search').append('<input type="hidden" name="feature" value="legacy_search" />');
			}
			if (this.options.userFilterBySubreddit.value) {
				let match = location.href.match(RESUtils.regexes.profile);
				if (match !== null) {
					const userProfile = match[1];
					let previousPage;
					if ((match = document.referrer.match(RESUtils.regexes.subreddit)) !== null) {
						previousPage = `r/${match[1]}`;
					} else if ((match = document.referrer.match(RESUtils.regexes.multireddit)) !== null) {
						previousPage = match[1];
					}
					if (typeof previousPage !== 'undefined') {
						$('.content[role=main]').prepend(`<div class="infobar"><a href="/${previousPage}/search?q=author:${userProfile} nsfw:no&restrict_sr=on">Search post of ${userProfile} on /${previousPage}</a></div>`);
					}
				}
			}
			const isLegacySearch = document.querySelector('#siteTable');
			if (this.options.toggleSearchOptions.value && RESUtils.regexes.search.test(location.href) && isLegacySearch) {
				if (this.options.hideSearchOptions.value || location.hash === '#res-hide-options') {
					RESUtils.bodyClasses.add('res-hide-options');
				}
				$('.content .searchpane').append('<a href="#res-hide-options" class="searchpane-toggle-hide">hide search options</a>');
				$('.content .searchpane ~ .menuarea').prepend('<a href="#res-show-options" class="searchpane-toggle-show">show search options</a>');
				$('.searchpane-toggle-hide').on('click', () => RESUtils.bodyClasses.add('res-hide-options'));
				$('.searchpane-toggle-show').on('click', () => RESUtils.bodyClasses.remove('res-hide-options'));
			}
			if (this.options.searchByFlair.value) {
				$('#siteTable').on('mouseenter', '.title > .linkflairlabel:not(.res-flairSearch)', e => {
					const parent = $(e.target).closest('.thing')[0];
					const srMatch = RESUtils.regexes.subreddit.exec(parent.querySelector('.entry a.subreddit'));
					const subreddit = (srMatch) ? srMatch[1] : RESUtils.currentSubreddit();
					const flair = e.target.title.replace(/\s/g, '+');
					if (flair && subreddit) {
						const link = document.createElement('a');
						link.href = RESUtils.string.encode`/r/${subreddit}/search?sort=new&restrict_sr=on&q=flair%3A${flair}`;
						e.target.classList.add('res-flairSearch');
						e.target.appendChild(link);
					}
				});
			}

			// Group search options into tabs.
			if (this.options.searchPageTabs.value && !isLegacySearch) {
				// Variables.
				const searchTabsEle = RESUtils.createElementWithID('ul', '', 'res-search-tabs');
				const searchHeader = document.querySelector('#previoussearch');
				const searchForm = document.querySelector('.content form#search');
				const moreSearchInfo = document.querySelector('#moresearchinfo');
				const searchFacets = document.querySelector('body.search-page .searchfacets');
				const searchOptions = RESUtils.createElementWithID('div', '', 'res-search-options');

				// Don't continue if search form isn't present. e.g. on /search/404.
				if (!searchForm) { return; }

				searchForm.removeChild(searchForm.querySelector('#moresearchinfo + p'));
				const $moreSearchInfo = $(moreSearchInfo.innerHTML);

				$(searchTabsEle).appendTo(searchHeader);

				// Create a class for the subreddit results container.
				const subredditResultListing = document.querySelectorAll('.search-result-listing');
				if (subredditResultListing.length > 1) {
					subredditResultListing[0].classList.add('res-search-subreddits');
				}

				// Set up search panes.
				if ($moreSearchInfo.length) {
					$(searchOptions).appendTo(searchHeader);
					$moreSearchInfo.appendTo(searchOptions);
				}
				if (searchFacets) {
					$(searchFacets).appendTo(searchHeader);
				}
				if ($('.res-search-subreddits').length) {
					$('.res-search-subreddits').appendTo(searchHeader);
				}

				// Create tabs object.
				const searchTabs = {
					subreddits: {
						label: 'subreddits',
						id: 'subs',
						target: '.res-search-subreddits',
						exists: $('.res-search-subreddits').length
					},
					facets: {
						label: 'limit to subreddit',
						id: 'facets',
						target: '.searchfacets',
						exists: searchFacets
					},
					options: {
						label: 'refine',
						id: 'options',
						target: '.res-search-options',
						exists: searchOptions
					}
				};

				for (const tab in searchTabs) {
					if (searchTabs.hasOwnProperty(tab)) {
						if (searchTabs[tab]['exists']) {
							// Add common class to each tab pane.
							document.querySelector(searchTabs[tab]['target']).classList.add('res-search-pane');
							$(searchTabs[tab]['target']).slideUp(0);

							// Build tabs in DOM.
							$('<li>').attr({ class: `res-search-tab-${searchTabs[tab]['id']}` }).appendTo(searchTabsEle);
							$('<a>').attr({ href: '#' })
								.text(searchTabs[tab]['label'])
								.appendTo(searchTabsEle.querySelector(`li.res-search-tab-${searchTabs[tab]['id']}`))
								.click({ id: searchTabs[tab]['id'], target: searchTabs[tab]['target'] }, searchTabToggle);
						}
					}
				}

				// Set default tab if specified and if it exists on the page.
				if (this.options.defaultSearchTab.value !== 'none' && searchTabs[this.options.defaultSearchTab.value]['exists']) {
					// Send the data as an object the same way jquery's click() does.
					searchTabToggle({
						data: {
							id: searchTabs[this.options.defaultSearchTab.value]['id'],
							target: searchTabs[this.options.defaultSearchTab.value]['target']
						}
					});
				}
			}
		}
	};

	function searchTabToggle(e) {
		const transitionSpd = (module.options.transitionSearchTabs.value) ? 200 : 0;
		const tabID = e.data.id;
		const target = e.data.target;
		// Check whether the tab was selected through code or with a click.
		const tab = (this && this.parentNode) ? this.parentNode : document.querySelector(`.res-search-tabs .res-search-tab-${tabID}`);
		const activeClass = 'res-search-tab-active';
		const openClass = 'res-search-pane-open';

		// Close the pane if its tab was already active, else open it.
		if (tab.classList.contains(activeClass)) {
			$(target).removeClass(openClass).slideUp(transitionSpd);
			tab.classList.remove(activeClass);
		} else {
			$('.res-search-pane').addClass(openClass).slideUp(transitionSpd);
			$('.res-search-tabs li').removeClass(activeClass);
			$('.res-search-pane').removeClass(openClass);
			tab.classList.add(activeClass);
			const speed = (this && this.parentNode) ? transitionSpd : 0;
			$(target).addClass(openClass).slideDown(speed);
		}

		return false;
	}
});
