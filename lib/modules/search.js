/* @flow */

import _ from 'lodash';
import optionLinkTemplate from '../templates/optionLinkSnudown.mustache';
import searchFormTemplate from '../templates/settingsConsoleSearch.mustache';
import searchPanelTemplate from '../templates/searchPanel.mustache';
import searchResultTemplate from '../templates/searchResultOption.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import { Alert } from '../utils';
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

function showSearch() {
	Menu.hidePrefsDropdown();
	drawSearchResults();
	$('#SearchRES-input').focus();
}

const PRESERVE_SPACES = true;

const searchDomain = _.once(() => {
	const results = [];
	for (const mod of Modules.all()) {
		if (mod === module) continue;

		if (mod.hidden) continue;

		results.push({ context: [mod.moduleID], getRank: rankModule, format: makeModuleSearchResult });

		if (_.isEmpty(mod.options)) continue;

		for (const [optionKey, option] of Object.entries(mod.options)) {
			if (option.noconfig) continue;

			results.push({ context: [mod.moduleID, optionKey], getRank: rankOption, format: makeOptionSearchResult });
		}
	}

	return results;
});

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
				rank: item.getRank(queryTerms, ...item.context),
				format: item.format,
				context: item.context,
			}))
			.filter(item => item && item.rank !== false && item.rank !== Infinity)
			.sort((a, b) => b.rank - a.rank)
			.map(item => item.format(...item.context));
	}

	drawSearchResults(query, results);
}

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
 * Gets list of module properties to be used for rankString via rankModule and rankOption.
 *
 * @param {String} moduleID Module ID.
 * @returns {Array} An array of searchable properties (strings).
 */
function getRankModuleItems(moduleID) {
	const mod = Modules.get(moduleID);
	return [
		moduleID,
		i18n(mod.moduleName),
		i18n(mod.category || ''),
		i18n(mod.description || ''),
		...mod.keywords,
	];
}

/**
 * Gets list of option properties to be used for rankString via rankOption.
 *
 * @param {String} moduleID Module ID.
 * @param {String} optionKey Option key.
 * @returns {Array} An array of searchable properties (strings).
 */
function getRankOptionItems(moduleID, optionKey) {
	const mod = Modules.get(moduleID);
	const option = mod.options[optionKey];
	return [
		optionKey,
		i18n(option.title || ''),
		...(option.keywords || []),
	];
}

/**
 * Builds a string with searchable properties of a module for rankString function.
 */
function rankModule(queryTerms, moduleID) {
	const string = getRankModuleItems(moduleID).join('~');
	return rankString(queryTerms, string) * 0.9;
}

/**
 * Builds a string with searchable properties of an option for rankString function.
 */
function rankOption(queryTerms, moduleID, optionKey) {
	const string = [
		...getRankOptionItems(moduleID, optionKey),
		...getRankModuleItems(moduleID),
	].join('~');
	return rankString(queryTerms, string);
}

function indexesOfSearchTermsInString(needles, haystack) {
	if (!haystack || !haystack.length) return [];

	return needles
		.filter(needle => haystack.includes(needle))
		.map((needle, i) => ({
			matchedIndex: i,
			value: haystack.indexOf(needle),
		}));
}

function sanitizeString(text, preserveSpaces) {
	if (text === undefined || text === null) {
		return '';
	}

	const replaceSpacesWith = preserveSpaces ? ' ' : '';
	return text.toString().toLowerCase()
		.replace(/[,\/\s]+/g, replaceSpacesWith);
}

function makeOptionSearchResult(moduleKey, optionKey) {
	const mod = Modules.get(moduleKey);
	const option = mod.options[optionKey];

	const optionName = i18n(option.title) || _.startCase(option.title || optionKey);

	const result = {};
	result.type = 'option';
	result.title = optionName;
	result.description = (i18n(option.description || '')).replace(/<(?:br|p|div|span)>/g, '\n').split('\n')[0];
	result.advanced = option.advanced;
	result.category = i18n(mod.category);
	result.moduleName = i18n(mod.moduleName);
	result.moduleID = moduleKey;
	result.optionKey = optionKey;
	result.optionName = optionName;

	return result;
}

function makeModuleSearchResult(moduleKey) {
	const mod = Modules.get(moduleKey);

	const result = {};
	result.type = 'module';
	result.title = result.moduleName = i18n(mod.moduleName);
	result.description = i18n(mod.description);
	result.category = i18n(mod.category);
	result.moduleID = moduleKey;

	return result;
}

function onSearchResultSelected(result) {
	if (!result) return;

	switch (result.type) {
		case 'module':
			SettingsNavigation.loadSettingsPage(result.moduleID);
			break;
		case 'option':
			SettingsNavigation.loadSettingsPage(result.moduleID, result.optionKey);
			break;
		default:
			Alert.open('Could not load search result');
			break;
	}
}

// ---------- View ------
export function renderSearchForm(container: HTMLElement) {
	$(container).find('#SearchRES-input-container').replaceWith(searchFormTemplate());

	$(container).on('keyup submit', '#SearchRES-input-container', e => {
		e.preventDefault();
		const RESSearchBox: HTMLInputElement = (container.querySelector('#SearchRES-input'): any);
		search(RESSearchBox.value);

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
	$('#SearchRES-input').val(query);

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
		const resultsList = $('#SearchRES-results', $resultsContainer).show();

		resultsList.empty();
		for (const result of results) {
			const element = drawSearchResultItem(result);
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

	const details = searchResultTemplate(result);
	element.append(details);

	return element;
}

function handleSearchResultClick(e: Event) {
	const $element = $(this);
	const result = $element.data('SearchRES-result');
	if ($(e.target).is('.SearchRES-result-copybutton')) {
		onSearchResultCopy(result, $element);
	} else {
		onSearchResultSelected(result);
	}
	e.preventDefault();
}

function onSearchResultCopy(result) {
	const markdown = makeOptionSearchResultLink(result);
	Alert.open(`<textarea rows="5" cols="50">${markdown}</textarea><p>Copy and paste this into your comment</p>`);
}

function makeOptionSearchResultLink(result) {
	const context = {
		...result,
		url: SettingsNavigation.makeUrlHash(result.moduleID, result.optionKey),
		settingsUrl: SettingsNavigation.makeUrlHash(),
		moduleUrl: SettingsNavigation.makeUrlHash(result.moduleID),
		optionUrl: SettingsNavigation.makeUrlHash(result.moduleID, result.optionKey),
	};

	return `${optionLinkTemplate(context).trim()}\n\n\n`;
}
