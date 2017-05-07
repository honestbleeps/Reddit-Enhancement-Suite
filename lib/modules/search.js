/* @flow */

import _ from 'lodash';
import { markdown } from 'snudown-js';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import { Alert, CreateElement, frameThrottle, string } from '../utils';
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
module.description = `
	<p>Search for settings within RES.</p>
	<div id="SearchRES-results-container">
		<div id="SearchRES-count"></div>
		<ul id="SearchRES-results"></ul>
		<p id="SearchRES-results-hidden">Some results have been hidden because advanced options are currently hidden. <a href="#">Show advanced options.</a></p>
	</div>
	<div id="SearchRES-boilerplate">
		<p>You can search for RES options by module name, option name, and description. For example, try searching for "daily trick" in one of the following ways:</p>
		<ul>
			<li>type <code>daily trick</code> in the search box to the left and click the magnifying glass button</li>
			<li>press <code>.</code> to open the RES console, type in <code>search <em>daily trick</em></code>, and press Enter</li>
		</ul>
	</div>	
`;

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

			const optionName = i18n(option.title);

			results.push({
				getRank: rankOption,
				context: ({
					title: optionName,
					description: markdown(i18n(option.description).split('\n')[0]),
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
	$(container).find('#SearchRES-input-container').replaceWith(`
		<form id="SearchRES-input-container">
			<input id="SearchRES-input" type="text" placeholder="search RES settings" />
			<button id="SearchRES-input-submit" type="submit">
				<span class="res-icon">&#xF094;</span>
			</button>
		</form>
	`);

	$(container).on('input submit', '#SearchRES-input-container', event => {
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

const searchResultTemplate = ({ title, category, description, moduleName, moduleID, optionName, optionKey }) => string.html`
	<div>
		<div class="SearchRES-result-header">
			<span class="SearchRES-result-title">${title}</span>
			<span class="SearchRES-breadcrumb">RES settings console
				→ ${category}
				→ ${moduleName} (${moduleID})
				${
					(optionName && optionKey) && ` → ${optionName} (${optionKey})` ||
					optionKey && ` → ${optionKey}`
				}
			</span>
		</div>
		<div class="SearchRES-result-description">
			${string.safe(description)}
		</div>
	</div>
`;

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

	element.appendChild(searchResultTemplate(result));

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

const optionLinkTemplate = ({ title, url, description, settingsUrl, category, moduleName, moduleUrl, moduleID, optionKey, optionUrl }) => `
**[${title}](${url})** -- [](#gear) [RES settings console](${settingsUrl}) > ${category} > [${moduleName}](${moduleUrl} "${moduleID}")${optionKey ? ` > [${optionKey}](${optionUrl})` : ''}

${description}
`.trim();

function makeOptionSearchResultLink(moduleID, optionKey) {
	const module = Modules.get(moduleID);

	const context = {
		moduleID,
		moduleName: i18n(module.moduleName),
		category: i18n(module.category),
		optionKey,
		title: optionKey ? optionKey : i18n(module.moduleName),
		description: optionKey ? i18n(module.options[optionKey].description) : i18n(module.description),
		url: SettingsNavigation.makeUrlHash(moduleID, optionKey),
		settingsUrl: SettingsNavigation.makeUrlHash(),
		moduleUrl: SettingsNavigation.makeUrlHash(moduleID),
		optionUrl: SettingsNavigation.makeUrlHash(moduleID, optionKey),
	};

	return `${optionLinkTemplate(context)}\n\n\n`;
}
