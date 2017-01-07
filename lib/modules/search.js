/* @flow */

import _ from 'lodash';
import optionLinkTemplate from '../templates/optionLinkSnudown.mustache';
import searchFormTemplate from '../templates/settingsConsoleSearch.mustache';
import searchPanelTemplate from '../templates/searchPanel.mustache';
import searchResultTemplate from '../templates/searchResultOption.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import { Alert, CreateElement, frameThrottle } from '../utils';
import { i18n } from '../environment';
import * as CommandLine from './commandLine';
import * as Menu from './menu';
import * as SettingsConsole from './settingsConsole';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('search');

module.moduleName = 'searchName';
module.category = 'aboutCategory';
module.alwaysEnabled = true;
module.sort = -9;
module.description = searchPanelTemplate();

module.go = () => {
	const $menuItem = $('<span>', {
		id: 'RESSearchMenuItem',
		class: 'RESMenuItemButton res-icon',
		text: '\uF094',
		title: 'search settings',
		click: e => {
			e.preventDefault();
			e.stopPropagation();
			showSearch();
		},
	});
	$menuItem.appendTo(SettingsConsole.$menuItem());

	CommandLine.registerCommand(/^set(?:t?ings?)?$/, 'settings [words to search for]- search RES settings console',
		(command, val) => {
			let str = 'Search RES settings';
			if (val && val.length) {
				str += ` for: ${val}`;
			}
			return str;
		},
		(command, val) => search(val)
	);
};

export function search(query?: string) {
	getSearchResults(query);
	SettingsNavigation.setUrlHash(module.moduleID, query);
}

const throttledSearch = _.throttle(frameThrottle(search), 250);

function showSearch() {
	Menu.hidePrefsDropdown();
	drawSearchResults();
	$('#SearchRES-input').focus();
}

const PRESERVE_SPACES = true;

function getSearchResults(query) {
	if (!query || !query.toString().length) {
		drawSearchResults(query, []);
		return;
	}

	const sanitizedQuery = sanitizeString(query, PRESERVE_SPACES);
	const queryTerms = sanitizedQuery && sanitizedQuery.length ? sanitizedQuery.split(' ') : [];
	let results = [];

	// Search options
	if (queryTerms && queryTerms.length) {
		results = searchDomain()
			.map(item => ({
				rank: item.getRank(queryTerms, item.context),
				context: item.context,
			}))
			.filter(item => item.rank !== Infinity)
			.sort((a, b) => b.rank - a.rank)
			.map(item => item.context);
	}

	drawSearchResults(query, results);
}

type SearchItemContext = {|
	title: string,
	description: string,
	category: string,
	moduleID: string,
	moduleName: string,
	keywords: string[],
	advanced?: boolean,
	optionKey?: string,
	optionName?: string,
|};

const searchDomain = _.once(() => {
	const results = [];
	for (const mod of Modules.all()) {
		if (mod === module) continue;

		if (mod.hidden) continue;

		const moduleName = i18n(mod.moduleName);
		const category = i18n(mod.category);

		results.push({
			getRank: rankModule,
			context: ({
				title: moduleName,
				description: i18n(mod.description),
				category,
				moduleID: mod.moduleID,
				moduleName,
				keywords: module.keywords,
			}: SearchItemContext),
		});

		if (_.isEmpty(mod.options)) continue;

		for (const [optionKey, option] of Object.entries(mod.options)) {
			if (option.noconfig) continue;

			const optionName = i18n(option.title) || _.startCase(option.title || optionKey);

			results.push({
				getRank: rankOption,
				context: ({
					title: optionName,
					description: (i18n(option.description || '')).replace(/<(?:br|p|div|span)>/g, '\n').split('\n')[0],
					advanced: option.advanced,
					category,
					moduleID: mod.moduleID,
					moduleName,
					optionKey,
					optionName,
					keywords: option.keywords || [],
				}: SearchItemContext),
			});
		}
	}

	return results;
});

function rankString(queryTerms, string) {
	if (!queryTerms || !queryTerms.length || !string) {
		return Infinity;
	}
	const indexes = indexesOfSearchTermsInString(queryTerms, sanitizeString(string, false));
	// Better score: lower value and lower matchedIndex
	const weighted = indexes.map(item => 100 - (item.value * ((Math.log(item.matchedIndex + 1) / Math.log(5)) + 1)));
	return weighted.length ?
		weighted.reduce((a, b) => a + b, 0) :
		Infinity;
}

/**
 * Builds a string with searchable properties of a module for rankString function.
 */
function rankModule(queryTerms, context) {
	const string = [
		context.moduleID,
		context.moduleName,
		context.category,
		context.description,
		...context.keywords,
	].join('~');
	return rankString(queryTerms, string) * 0.9;
}

/**
 * Builds a string with searchable properties of an option for rankString function.
 */
function rankOption(queryTerms, context) {
	const string = [
		// option-related strings
		context.optionKey,
		context.title,
		context.description,
		...context.keywords,
		// module-related strings
		context.moduleID,
		context.moduleName,
		context.category,
	].join('~');
	return rankString(queryTerms, string);
}

function indexesOfSearchTermsInString(needles, haystack) {
	if (!haystack || !haystack.length) return [];

	return needles
		.map((needle, i) => ({
			matchedIndex: i,
			value: haystack.indexOf(needle),
		}))
		.filter(item => item.value !== -1);
}

function sanitizeString(text, preserveSpaces) {
	if (text === undefined || text === null) {
		return '';
	}

	const replaceSpacesWith = preserveSpaces ? ' ' : '';
	return text.toString().toLowerCase()
		.replace(/[,\/\s]+/g, replaceSpacesWith);
}

function onSearchResultSelected(moduleID, optionKey) {
	SettingsNavigation.loadSettingsPage(moduleID, optionKey);
}

// ---------- View ------
export function renderSearchForm(container: HTMLElement) {
	$(container).find('#SearchRES-input-container').replaceWith(searchFormTemplate());

	$(container).on('keyup submit', '#SearchRES-input-container', event => {
		// Prevent from submitting the form
		if (event.type === 'submit') {
			event.preventDefault();
		}
		const RESSearchBox: HTMLInputElement = (container.querySelector('#SearchRES-input'): any);
		throttledSearch(RESSearchBox.value);

		return false;
	});
}

function drawSearchResults(query, results) {
	SettingsConsole.open(module.moduleID);

	const $resultsContainer = $('#SearchRES-results-container');
	$resultsContainer.off('click', handleSearchResultClick)
		.on('click', '.SearchRES-result-item', handleSearchResultClick);

	if (!query || !query.length) {
		$resultsContainer.hide();
		return;
	}

	let count = 0;
	let advancedResults = 0;
	if (results) {
		for (const result of results) {
			if (result.advanced) {
				advancedResults++;
			} else {
				count++;
			}
		}
	}

	// display number of results.
	const plural = (count !== 1 ? 's' : '');
	const resultsMessage = `${count} result${plural} for ${query}`;
	$('#SearchRES-count').text(resultsMessage);

	$resultsContainer.show();
	$resultsContainer.find('#SearchRES-query').text(query);

	if (advancedResults) {
		$resultsContainer.find('#SearchRES-results-hidden').addClass('advancedResults');
		$('#SearchRES-results-hidden a').off('click').on('click', () => {
			$(document.getElementById('RESAllOptions')).click();
			getSearchResults(query);
			return false;
		});
	} else {
		$resultsContainer.find('#SearchRES-results-hidden').removeClass('advancedResults');
	}

	if (!results || !results.length) {
		$resultsContainer.find('#SearchRES-results').hide();
	} else {
		$resultsContainer.find('#SearchRES-results').show();

		const resultsList = document.getElementById('SearchRES-results');

		resultsList.innerHTML = '';
		for (const result of results) {
			const element = drawSearchResultItem(result);
			resultsList.appendChild(element);
		}
	}
}

function drawSearchResultItem(result) {
	const element = document.createElement('li');
	element.classList.add('SearchRES-result-item');
	if (result.advanced) {
		element.classList.add('advanced');
	}
	element.setAttribute('data-module-id', result.moduleID);
	if (result.optionKey) {
		element.setAttribute('data-option-key', result.optionKey);
	}

	const details = searchResultTemplate(result);
	element.innerHTML = details;

	const copybutton =
		CreateElement.icon(
			'F159',
			'span',
			'SearchRES-result-copybutton res-icon',
			i18n('searchCopyResultForComment')
		);
	element.insertBefore(copybutton, element.firstChild);

	return element;
}

function handleSearchResultClick(event: Event) {
	const moduleID = this.getAttribute('data-module-id');
	const optionKey = this.getAttribute('data-option-key');

	if (event.target.classList.contains('SearchRES-result-copybutton')) {
		onSearchResultCopy(moduleID, optionKey);
	} else {
		onSearchResultSelected(moduleID, optionKey);
	}
	event.preventDefault();
}

function onSearchResultCopy(moduleID, optionKey) {
	const markdown = makeOptionSearchResultLink(moduleID, optionKey);
	Alert.open(`<textarea rows="5" cols="50">${markdown}</textarea><p>Copy and paste this into your comment</p>`);
}

function makeOptionSearchResultLink(moduleID, optionKey) {
	const module = Modules.get(moduleID);
	const option = module.options[optionKey];

	const context = {
		category: i18n(module.category),
		description: i18n(option.description),
		moduleID,
		moduleName: i18n(module.moduleName),
		moduleUrl: SettingsNavigation.makeUrlHash(moduleID),
		optionKey,
		optionUrl: SettingsNavigation.makeUrlHash(moduleID, optionKey),
		settingsUrl: SettingsNavigation.makeUrlHash(),
		title: i18n(option.title),
		url: SettingsNavigation.makeUrlHash(moduleID, optionKey),
	};

	return `${optionLinkTemplate(context).trim()}\n\n\n`;
}
