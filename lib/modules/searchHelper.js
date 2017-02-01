/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	BodyClasses,
	currentSubreddit,
	isPageType,
	regexes,
	string,
} from '../utils';

export const module: Module<*> = new Module('searchHelper');

module.moduleName = 'searchHelperName';
module.category = 'browsingCategory';
module.description = 'searchHelperDesc';
module.options = {
	addSearchOptions: {
		title: 'searchHelperAddSearchOptionsTitle',
		type: 'boolean',
		value: true,
		description: 'searchHelperAddSearchOptionsDesc',
	},
	legacySearch: {
		title: 'searchHelperLegacySearchTitle',
		type: 'boolean',
		value: false,
		description: 'searchHelperLegacySearchDesc',
	},
	toggleSearchOptions: {
		title: 'searchHelperToggleSearchOptionsTitle',
		type: 'boolean',
		value: true,
		description: 'searchHelperToggleSearchOptionsDesc',
		advanced: true,
		dependsOn: options => options.legacySearch.value,
	},
	hideSearchOptions: {
		title: 'searchHelperHideSearchOptionsTitle',
		type: 'boolean',
		value: false,
		description: 'searchHelperHideSearchOptionsDesc',
		advanced: true,
		dependsOn: options => options.legacySearch.value,
	},
	userFilterBySubreddit: {
		title: 'searchHelperUserFilterBySubredditTitle',
		type: 'boolean',
		value: false,
		description: 'searchHelperUserFilterBySubredditDesc',
	},
	searchByFlair: {
		title: 'searchHelperSearchByFlairTitle',
		type: 'boolean',
		value: true,
		description: 'searchHelperSearchByFlairDesc',
	},
	searchPageTabs: {
		title: 'searchHelperSearchPageTabsTitle',
		type: 'boolean',
		value: true,
		description: 'searchHelperSearchPageTabsDesc',
		bodyClass: true,
	},
	defaultSearchTab: {
		title: 'searchHelperDefaultSearchTabTitle',
		type: 'enum',
		value: 'subreddits',

		values: [{
			name: 'none',
			value: 'none',
		}, {
			name: 'subreddits',
			value: 'subreddits',
		}, {
			name: 'limit to subreddit',
			value: 'facets',
		}, {
			name: 'refine',
			value: 'options',
		}],

		description: 'searchHelperDefaultSearchTabDesc',
		dependsOn: options => options.searchPageTabs.value,
		advanced: true,
	},
	transitionSearchTabs: {
		title: 'searchHelperTransitionSearchTabsTitle',
		type: 'boolean',
		value: true,
		description: 'searchHelperTransitionSearchTabsDesc',
		dependsOn: options => options.searchPageTabs.value,
		advanced: true,
	},
};

module.go = () => {
	if (module.options.addSearchOptions.value) {
		const searchExpando = document.getElementById('searchexpando');
		if (searchExpando) {
			let searchOptionsHtml = '<label>Sort:<select name="sort"><option value="relevance">relevance</option><option value="new">new</option><option value="hot">hot</option><option value="top">top</option><option value="comments">comments</option></select></label> <label>Time:<select name="t"><option value="all">all time</option><option value="hour">this hour</option><option value="day">today</option><option value="week">this week</option><option value="month">this month</option><option value="year">this year</option></select></label>';
			if ($(searchExpando).find('input[name=restrict_sr]').length) { // we don't want to add the new line if we are on the front page
				searchOptionsHtml = `<br />${searchOptionsHtml}`;
			}
			$(searchExpando).find('#moresearchinfo').before(searchOptionsHtml);
		}
	}
	if (module.options.legacySearch.value) {
		$('form#search').append('<input type="hidden" name="feature" value="legacy_search" />');
	}
	if (module.options.userFilterBySubreddit.value) {
		const [, userProfile] = location.pathname.match(regexes.profile) || [];
		if (userProfile && document.referrer) {
			const referrer = new URL(document.referrer);
			let match, previousPage;
			if ((match = referrer.pathname.match(regexes.subreddit))) {
				previousPage = `r/${match[1]}`;
			} else if ((match = referrer.pathname.match(regexes.multireddit))) {
				previousPage = match[1];
			}
			if (previousPage) {
				$('.content[role=main]').prepend(`<div class="infobar"><a href="/${previousPage}/search?q=author:${userProfile} nsfw:no&restrict_sr=on">Search post of ${userProfile} on /${previousPage}</a></div>`);
			}
		}
	}
	const isLegacySearch = document.querySelector('#siteTable');
	if (module.options.toggleSearchOptions.value && isPageType('search') && isLegacySearch) {
		if (module.options.hideSearchOptions.value || location.hash === '#res-hide-options') {
			BodyClasses.add('res-hide-options');
		}
		$('.content .searchpane').append('<a href="#res-hide-options" class="searchpane-toggle-hide">hide search options</a>');
		$('.content .searchpane ~ .menuarea').prepend('<a href="#res-show-options" class="searchpane-toggle-show">show search options</a>');
		$('.searchpane-toggle-hide').on('click', () => BodyClasses.add('res-hide-options'));
		$('.searchpane-toggle-show').on('click', () => BodyClasses.remove('res-hide-options'));
	}
	if (module.options.searchByFlair.value) {
		$('#siteTable').on('mouseenter', '.title > .linkflairlabel:not(.res-flairSearch)', (e: Event) => {
			const parent = $(e.target).closest('.thing')[0];
			const parentSubredditEle: ?HTMLAnchorElement = (parent.querySelector('.entry a.subreddit'): any);
			const srMatch = parentSubredditEle && parentSubredditEle.pathname.match(regexes.subreddit);
			const subreddit = (srMatch) ? srMatch[1] : currentSubreddit();
			const flair = e.target.title.replace(/\s/g, '+');
			if (flair && subreddit) {
				const link = document.createElement('a');
				link.href = string.encode`/r/${subreddit}/search?sort=new&restrict_sr=on&q=flair%3A${flair}`;
				e.target.classList.add('res-flairSearch');
				e.target.appendChild(link);
			}
		});
	}

	// Group search options into tabs.
	if (module.options.searchPageTabs.value && !isLegacySearch) {
		// Variables.
		const $searchTabsEle = $('<ul>', { class: 'res-search-tabs' });
		const searchHeader = document.querySelector('#previoussearch');
		const searchForm = document.querySelector('.content form#search');
		const moreSearchInfo = document.querySelector('#moresearchinfo');
		const searchFacets = document.querySelector('body.search-page .searchfacets');
		const $searchOptions = $('<div>', { class: 'res-search-options' });

		// Don't continue if search form isn't present. e.g. on /search/404.
		if (!searchForm) { return; }

		searchForm.removeChild(searchForm.querySelector('#moresearchinfo + p'));
		const $moreSearchInfo = $(moreSearchInfo.innerHTML);

		$searchTabsEle.appendTo(searchHeader);

		// Create a class for the subreddit results container.
		const subredditResultListing = document.querySelectorAll('.search-result-listing');
		if (subredditResultListing.length > 1) {
			subredditResultListing[0].classList.add('res-search-subreddits');
		}

		// Set up search panes.
		if ($moreSearchInfo.length) {
			$searchOptions.appendTo(searchHeader);
			$moreSearchInfo.appendTo($searchOptions);
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
				exists: $('.res-search-subreddits').length,
			},
			facets: {
				label: 'limit to subreddit',
				id: 'facets',
				target: '.searchfacets',
				exists: searchFacets,
			},
			options: {
				label: 'refine',
				id: 'options',
				target: '.res-search-options',
				exists: $searchOptions.get(0),
			},
		};

		for (const searchTab of Object.values(searchTabs)) {
			if (searchTab.exists) {
				// Add common class to each tab pane.
				$(searchTab.target)
					.addClass('res-search-pane')
					.slideUp(0);

				// Build tabs in DOM.
				const $searchTabLi = $('<li>')
					.attr({ class: `res-search-tab-${searchTab.id}` })
					.appendTo($searchTabsEle);

				$('<a>')
					.attr({ href: '#' })
					.text(searchTab.label)
					.appendTo($searchTabLi)
					.click({ id: searchTab.id, target: searchTab.target }, searchTabToggle);
			}
		}

		// Set default tab if specified and if it exists on the page.
		if (module.options.defaultSearchTab.value !== 'none' && searchTabs[module.options.defaultSearchTab.value].exists) {
			// Send the data as an object the same way jquery's click() does.
			searchTabToggle({
				data: {
					id: searchTabs[module.options.defaultSearchTab.value].id,
					target: searchTabs[module.options.defaultSearchTab.value].target,
				},
			});
		}
	}
};

function searchTabToggle(e) {
	const transitionSpd = (module.options.transitionSearchTabs.value) ? 200 : 0;
	const tabID = e.data.id;
	const target = e.data.target;
	// Check whether the tab was selected through code or with a click.
	const tab: HTMLElement = (this && this.parentNode) ? (this.parentNode: any) : document.querySelector(`.res-search-tabs .res-search-tab-${tabID}`);
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
