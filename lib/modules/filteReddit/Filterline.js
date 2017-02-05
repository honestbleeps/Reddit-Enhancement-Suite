/* @flow */

import _ from 'lodash';
import { $ } from '../../vendor';
import * as Options from '../../core/options';
import type { Thing } from '../../utils';
import {
	asyncFind,
	fastAsync,
	waitForEvent,
	downcast,
	hide,
	unhide,
	keyedMutex,
} from '../../utils';
import { i18n } from '../../environment';
import filterlineTemplate from '../../templates/filterline.mustache';
import * as CommandLine from '../commandLine';
import * as Notifications from '../notifications';
import * as SelectedEntry from '../selectedEntry';
import * as SettingsNavigation from '../settingsNavigation';
import * as ShowImages from '../showImages';
import * as FilteReddit from '../filteReddit';
import ExternalFilter from './ExternalFilter';
import Filter from './Filter';
import browseContexts from './browseContexts';

export default class Filterline {
	things: Set<Thing> = new Set();

	filters: Filter<any>[] = [];
	filterChoices: { [key: string]: { options: *, activeFilters: Filter<*>[] } } = {};
	hiddenThings: Thing[] = [];
	showFilterReason: boolean = false;

	dropdown: HTMLElement;
	filterContainer: HTMLElement;
	otherContainer: HTMLElement;
	externalContainer: HTMLElement;

	createElement() {
		const $element = $(filterlineTemplate());
		const element = $element[0];
		this.filterContainer = element.querySelector('.res-filterline-filters');
		this.externalContainer = element.querySelector('.res-filterline-external');
		this.otherContainer = element.querySelector('.res-filterline-other');

		this.addFilterElements(this.filters);

		this.dropdown = element.querySelector('.res-filterline-dropdown');
		waitForEvent(this.dropdown, 'mouseenter').then(() => this.createDropdown());

		$element.insertBefore(document.querySelector('#siteTable, .search-result-listing'));
	}

	addFilterElements(filters: Filter<*>[]) {
		for (const filter of filters) {
			const container = (filter instanceof ExternalFilter) ? this.externalContainer : this.filterContainer;
			container.appendChild(filter.element);
		}
	}

	createDropdown() {
		for (const { options } of Object.values(this.filterChoices)) {
			if (options.alwaysShow && options.unique) continue; // Filter already available

			this.createChoiceElement(options);
		}

		this.dropdown.querySelector('.res-filterline-export-customfilters')
			.addEventListener('click', () => this.exportToCustomFilters());

		const showFilterReasonCheckbox = downcast(this.dropdown.querySelector('.res-filterline-show-reason input'), HTMLInputElement);
		showFilterReasonCheckbox.addEventListener('change', () => {
			this.toggleShowFilterReason(showFilterReasonCheckbox.checked);
		});

		const hideCheckbox = downcast(this.dropdown.querySelector('.res-filterline-hide-filtered input'), HTMLInputElement);
		hideCheckbox.addEventListener('change', async () => {
			hideCheckbox.disabled = true;
			await (hideCheckbox.checked ? this.hide() : this.unhide());
			hideCheckbox.disabled = false;
		});
	}

	getFiltered() {
		return Array.from(this.things).filter(thing => thing.filter);
	}

	async hide() {
		const things = this.getFiltered();

		await things.map(thing => hide(thing));

		this.hiddenThings.push(...things);

		Notifications.showNotification({
			moduleID: FilteReddit.module.moduleID,
			notificationID: 'hideThings',
			message: `Reddit has now hidden ${things.length} things. Undo by unchecking the checkbox. If you want to hide additional things, you need to reload this page.`,
		});
	}

	async unhide() {
		const things = [...this.hiddenThings];
		await things.map(thing => unhide(thing));

		_.pull(this.hiddenThings, ...things);

		Notifications.showNotification({
			moduleID: FilteReddit.module.moduleID,
			notificationID: 'unhideThings',
			message: `${things.length} things are no longer hidden.`,
		});
	}

	exportToCustomFilters() {
		const encapsulate = (op, ...conditions) => ({
			of: conditions,
			op,
			type: 'group',
		});

		const conditions = this.filters
			.filter(v => FilteReddit.module.options.customFilters.cases.hasOwnProperty(v.key))
			.filter(v => v.state !== null && v.parsed);

		if (!conditions.length) {
			Notifications.showNotification({
				moduleID: FilteReddit.module.moduleID,
				notificationID: 'exportToCustomFilters no conditions',
				header: 'Could not find any conditions to export',
				message: 'Note that customFilters does not support "isVisited", "hasExpando", and "commentsOpened" since those are asynchronous.',
			});
			return;
		}

		const customFilter = {
			body: encapsulate(
				'all',
				browseContexts.currentLocation.defaultTemplate(),
				encapsulate('any', ...conditions.map(v => v.state ? encapsulate('none', v.parsed) : v.parsed))
			),
			note: '',
			ver: 1,
		};

		Options.set(FilteReddit, 'customFilters', [customFilter]);
		SettingsNavigation.loadSettingsPage(FilteReddit.module.moduleID, 'customFilters');

		// No need to show the filters anymore in the filterline
		for (const filter of conditions) filter.update(null, null);
	}

	restoreState({ filters = {} }: *) {
		for (const [id, { key, state, criterion }] of Object.entries(filters)) {
			let filter;
			try {
				filter = this.filters.find(v => v.id === id) ||
					this.createFilterFromKey(key, { add: true, id });
				filter.update(state, criterion, { save: false });
			} catch (e) {
				console.error(e);
				console.error(`Could not restore filter ${key}; deleting`);
				if (filter) filter.delete();
			}
		}
	}

	buildInputExplanation(filter: ?Filter<*>, deconstructed: *) {
		if (!filter) return 'No filter selected.';

		if (deconstructed.asNewFilter) {
			if (filter.unique && this.filterChoices[filter.key].activeFilters.length) {
				return 'Unique filters may only be applied once.';
			}
		}

		const filterActionDescription = filter.updateByInputConstruction(deconstructed, true);

		return `${filter.parent ? `Modify "${filter.getStateName()}"` : 'New filter'}: ${filterActionDescription}`;
	}

	enableCommandLineInterface(beforeTip: () => void) {
		const deconstruct = val => {
			// Example: "!expando image" → { reverseActive: true, key: "expando", criterion: "image" }
			const [, modifiers, key, criterion]: string[] = (val.match(/^([^\w]*)(\w*)(.*)/): any); // guaranteed match
			return {
				key,
				criterion: criterion.trim(),
				clearCriterion: !!modifiers.match('/'),
				reverseActive: !!modifiers.match('!'),
				asNewFilter: !!modifiers.match('\\+'),
				fromSelected: !!modifiers.match('='),
			};
		};

		const findMatchingKeys = val => Object.keys(this.filterChoices)
			.filter(v => v.toLowerCase().match(val.toLowerCase()))
			.sort();

		let filter;

		CommandLine.registerCommand(/(fl|filterline)/, 'fl - modify filterline',
			(cmd, val) => {
				beforeTip();

				const deconstructed = deconstruct(val);
				const { key, asNewFilter } = deconstructed;
				const matchingKeys = findMatchingKeys(key);

				if (key.length && matchingKeys.length) {
					const key = matchingKeys[0];

					if (!filter || filter.key !== key) {
						const choice = this.filterChoices[key];
						const lastFilter = _.last(choice.activeFilters);

						if (lastFilter && !asNewFilter) filter = lastFilter;
						else filter = this.createFilterFromKey(key);
					}
				} else {
					filter = null;
				}

				return [
					'<pre>',
					'Syntax: [modifiers] filterName [criterion]',
					'',
					this.buildInputExplanation(filter, deconstructed),
					'',
					'Filters:',
					...findMatchingKeys('').map(key => ` ${(filter && key === filter.key) ? `<b>${key}</b>` : key} ${this.filterChoices[key].options.pattern || ''}`),
					'',
					'Modifiers:',
					' / — clear the filter current criterion',
					' ! — reverse the active state',
					' + — create as new filter',
					' = — use the currently selected post\'s data as criterion',
					'',
					'Examples:',
					' =postAfter   → filter posts older than selected',
					' +=!postAfter → new filter, filter posts younger than selected',
					'</pre>',
				].join('\n');
			},
			(cmd, val) => {
				if (!filter) return;
				if (!filter.parent) this.addFilter(filter);
				filter.updateByInputConstruction(deconstruct(val));
				filter = null;
			}
		);
	}

	addChoice(options: *) {
		this.filterChoices[options.key] = {
			options,
			activeFilters: [],
		};
	}

	createChoiceElement(options: *) {
		const choice = $(`<div class='res-filterline-filter-new res-filterline-filter'>${options.name}</div>`)
			.appendTo(this.otherContainer)
			.click(() => {
				function getCriterionInput() {
					let value = null;

					do {
						const question = `Enter criterion(s) for ${filter.key}:`;
						const pattern = (options.pattern && filter.pattern) ? `\npattern: ${filter.pattern}` : '';
						const previous = value !== null ? '\n(previous input was invalid)' : '';
						value = window.prompt(`${question}${pattern}${previous}`, value || '');

						if (filter.parse(value) !== null) return value;
					} while (value !== null);
				}

				const filter = this.createFilterFromKey(options.key);
				let criterion = null;

				if (filter.parse.length) {
					criterion = getCriterionInput();
					if (criterion === null) return;
				}

				this.addFilter(filter);
				filter.updateByInputConstruction({ criterion });
			});

		if (options.fromSelected) {
			$('<div class=\'res-filterline-filter-new-from-selected\' title=\'From selected entry\'></div>')
				.click(e => {
					e.stopPropagation();

					const filter = this.createFilterFromKey(options.key, { add: true });
					filter.updateByInputConstruction({ fromSelected: true });
				})
				.appendTo(choice);
		}
	}

	createFilterFromKey(key: string, { add, id }: { add?: boolean, id?: string } = {}) {
		const choice = this.filterChoices[key];

		if (choice.options.unique && choice.activeFilters.length) throw new Error('Cannot create new instances of unique filter');

		const filter = new Filter(choice.options, id);

		if (add) this.addFilter(filter);

		return filter;
	}

	addFilter(filter: Filter<*>) {
		filter.parent = this;

		this.filters.push(filter);

		if (this.filterContainer) this.addFilterElements([filter]);

		const choice = this.filterChoices[filter.key];
		if (choice) choice.activeFilters.push(filter);
	}

	shouldFilterBeRemoved(filter: Filter<*>, choice: *): boolean {
		return choice && (!choice.options.alwaysShow || choice.activeFilters.length > 1) &&
			filter.state === null && filter.criterion === null;
	}

	updateFilter(filter: Filter<any>) {
		this.refreshAll(filter);

		const choice = this.filterChoices[filter.key];
		if (this.shouldFilterBeRemoved(filter, choice)) {
			_.pull(this.filters, filter);
			_.pull(choice.activeFilters, filter);
		}
	}

	getActiveFilters() {
		return this.filters.filter(v => v.state !== null);
	}

	getFilterPosition(filter: Filter<*>) {
		return this.filters.indexOf(filter);
	}

	getFiltersToTest(currentFilter?: Filter<*>, invokedByFilter?: Filter<*>): Filter<*>[] {
		let fromIndex = 0;
		let toIndex; // Undefined → the natural limit of the array

		if (invokedByFilter) {
			const invokedByFilterIndex = this.getFilterPosition(invokedByFilter);
			const currentFilterIndex = this.getFilterPosition(currentFilter);

			if (currentFilterIndex === -1) {
				// No other filters did match last time; only retest this
				return [invokedByFilter];
			} else if (currentFilterIndex === invokedByFilterIndex) {
				// The invokedBy filter matched last time; start testing from that one
				fromIndex = invokedByFilterIndex;
			} else if (currentFilterIndex > invokedByFilterIndex) {
				// thing.filter should always refers to the first matched filter
				return [invokedByFilter, currentFilter];
			} else {
				// Some earlier filter matched last time; ignore
				return [];
			}
		}

		return this.filters.slice(fromIndex, toIndex);
	}

	refreshThing = keyedMutex(fastAsync(function*(thing: Thing, invokedByFilter?: Filter<*>) {
		const filtersToTest = this.getFiltersToTest(thing.filter, invokedByFilter);
		if (!filtersToTest.length) return;

		const matchedFilter = yield asyncFind(
			filtersToTest,
			v => v.state !== null && v.matchesFilter(thing, true)
		);

		if (thing.filter !== matchedFilter) {
			if (matchedFilter) matchedFilter.updateMatchesCount(1);
			if (thing.filter) thing.filter.updateMatchesCount(-1);

			this.updateThingFilterReason(thing, thing.filter, matchedFilter);
			thing.element.classList.toggle('RESFiltered', !!matchedFilter);

			if (matchedFilter && SelectedEntry.selectedThing() === thing) {
				SelectedEntry.selectClosestVisible({ scrollStyle: 'none' });
			}

			ShowImages.refresh();
			this.checkEmptyState();

			thing.filter = matchedFilter;
		}
	}));

	refreshAll(invokedByFilter: Filter<*>) {
		for (const thing of this.things) this.refreshThing(thing, invokedByFilter);
	}

	addThing(thing: Thing) {
		this.things.add(thing);
		this.refreshThing(thing);
	}

	checkEmptyState = (() => {
		const showNotification = _.debounce(_.once(() => {
			const info = $('<p>').text(i18n('filteRedditEmptyNotificationInfo'));
			const toggle = $('<button>').text(i18n('filteRedditEmptyNotificationToggleShowReason'))
				.click(() => { this.toggleShowFilterReason(); });

			Notifications.showNotification({
				moduleID: FilteReddit.module.moduleID,
				notificationID: 'everyThingHidden',
				header: i18n('filteRedditEmptyNotificationHeader'),
				message: $('<div>').append(info).append(toggle).get(0),
				closeDelay: Infinity,
			});
		}), 4000);

		return _.throttle(() => {
			if (this.getFiltered().length !== this.things.size) {
				showNotification.cancel();
			} else if (!this.showFilterReason) {
				showNotification();
			}
		}, 100, { leading: false });
	})();

	// $FlowIssue
	toggleShowFilterReason(newState?: boolean = !this.showFilterReason) {
		this.showFilterReason = newState;
		this.refreshAllFilterReasons();
		document.body.classList.toggle('res-show-filter-reason', this.showFilterReason);
	}

	updateThingFilterReason(thing: Thing, previousMatch?: Filter<*>, currentMatch?: Filter<*>) {
		if (previousMatch) previousMatch.removeThingFilterReason(thing);

		if (currentMatch) {
			if (this.showFilterReason) currentMatch.setThingFilterReason(thing);
			else currentMatch.removeThingFilterReason(thing);
		}
	}

	refreshAllFilterReasons() {
		for (const thing of this.things) this.updateThingFilterReason(thing, undefined, thing.filter);
	}
}
