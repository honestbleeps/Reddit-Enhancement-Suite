import _ from 'lodash';
import { $ } from '../../vendor';
import * as Options from '../../core/options';
import {
	asyncFind,
	waitForEvent,
	hide,
	unhide,
	keyedMutex,
} from '../../utils';
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
	things = new Set();

	filters = [];
	filterChoices = {};
	hiddenThings = [];
	showFilterReason = false;

	refreshThing // Function

	drowdown // ?HTMLElement
	filterContainer // ?HTMLElement
	otherContainer // ?HTMLElement
	externalContainer // ?HTMLElement

	constructor() {
		this.refreshThing = keyedMutex(::this.refreshThingUnsafe);
	}

	createElement() {
		const $element = $(filterlineTemplate());
		const element = $element[0];
		this.filterContainer = element.querySelector('.res-filterline-filters');
		this.externalContainer = element.querySelector('.res-filterline-external');
		this.otherContainer = element.querySelector('.res-filterline-other');

		this.addFilterElements(this.filters);

		this.dropdown = element.querySelector('.res-filterline-dropdown');
		waitForEvent(this.dropdown, 'mouseenter').then(::this.createDropdown);

		$element.insertBefore(document.querySelector('#siteTable, .search-result-listing'));
	}

	addFilterElements(filters) {
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
			.addEventListener('click', ::this.exportToCustomFilters);

		const showFilterReasonCheckbox = this.dropdown.querySelector('.res-filterline-show-reason input');
		showFilterReasonCheckbox.addEventListener('change', () => {
			this.showFilterReason = showFilterReasonCheckbox.checked;
			this.refreshAllFilterReasons();
			document.body.classList.toggle('res-show-filter-reason', this.showFilterReason);
		});

		const hideCheckbox = this.dropdown.querySelector('.res-filterline-hide-filtered input');
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
		this.hiddenThings.push(...things);

		await things.map(thing => hide(thing));

		Notifications.showNotification({
			moduleID: FilteReddit.module.moduleID,
			notificationID: 'hideThings',
			message: `Reddit has now hidden ${things.length} things. Undo by unchecking the checkbox. If you want to hide additional things, you need to reload this page.`,
		});
	}

	async unhide() {
		const things = this.hiddenThings.splice(0);
		await things.map(thing => unhide(thing));

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

	async restoreState({ filters = {} }) {
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

	findFilterInputError(filter, { criterion, asNewFilter, fromSelected }) {
		if (asNewFilter) {
			if (filter.unique && this.filterChoices[filter.key].activeFilters.length) {
				return 'Unique filters may only be applied once.';
			}
		}

		if (fromSelected) {
			if (!filter.fromSelected) {
				return 'Filter does not support selected entry data extraction.';
			}

			if (!SelectedEntry.selectedThing()) {
				return 'No entry is currently selected.';
			}
		}

		if (criterion) {
			if (filter.parse(criterion) === null) {
				return 'Criterion could not be parsed.';
			}
		}
	}

	enableCommandLineInterface(beforeTip) {
		const modifiersInfo =
			`Modifiers:
				/	 — clear the filter current criterion
				!	 — reverse the active state
				+	 — create as new filter
				=	 — use the currently selected entry's data as criterion`
			.split('\n');

		const deconstruct = val => {
			// Example: "!expando image" → { reverseActive: true, key: "expando", criterion: "image" }
			const [, modifiers, key, criterion] = val.match(/^([^\w]*)(\w*)(.*)/);
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

				const message = [];

				if (matchingKeys.length === 1) {
					const key = matchingKeys[0];

					if (!filter || filter.key !== key) {
						const choice = this.filterChoices[key];
						const lastFilter = _.last(choice.activeFilters);

						if (lastFilter && !asNewFilter) filter = lastFilter;
						else filter = this.createFilterFromKey(key);
					}

					const errorMessage = this.findFilterInputError(filter, deconstructed);

					if (errorMessage) message.push(`Error: ${errorMessage}`);
					message.push(`- ${key} ${filter.pattern || ''}`);
				} else {
					const keys = matchingKeys.length ? matchingKeys : findMatchingKeys('');
					filter = null;

					message.push(...keys.map(key => `- ${key} ${this.filterChoices[key].options.pattern || ''}`));
				}

				message.push('', ...modifiersInfo);
				return message.join('<br>');
			},
			(cmd, val) => {
				if (!filter) return;
				this.addFilter(filter);
				filter.updateByInputConstruction(deconstruct(val));
			}
		);
	}

	addChoice(options) {
		this.filterChoices[options.key] = {
			options,
			activeFilters: [],
		};
	}

	createChoiceElement(options) {
		const choice = $(`<div class='res-filterline-filter-new res-filterline-filter'>${options.name}</div>`)
			.appendTo(this.otherContainer)
			.click(() => {
				function getCriterionInput() {
					let value = null;

					do {
						const question = `Enter criterion(s) for ${filter.key}:`;
						const pattern = options.pattern ? `\npattern: ${filter.pattern}` : '';
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

	createFilterFromKey(key, { add, id } = {}) {
		const choice = this.filterChoices[key];

		if (choice.options.unique && choice.activeFilters.length) throw new Error('Cannot create new instances of unique filter');

		const filter = new Filter(choice.options, id);

		if (add) this.addFilter(filter);

		return filter;
	}

	addFilter(filter) {
		filter.parent = this;

		this.filters.push(filter);

		if (this.filterContainer) this.addFilterElements([filter]);

		const choice = this.filterChoices[filter.key];
		if (choice) choice.activeFilters.push(filter);
	}

	updateFilter(filter) {
		this.refreshAll(filter);

		// Check if filter can be removed
		const choice = this.filterChoices[filter.key];
		if (
			choice && (!choice.options.alwaysShow || choice.activeFilters.length > 1) &&
			filter.state === null && filter.criterion === null
		) {
			_.pull(this.filters, filter);
			_.pull(choice.activeFilters, filter);
		}
	}

	getActiveFilters() {
		return this.filters.filter(v => v.state !== null);
	}

	getFilterPosition(filter) {
		return this.filters.indexOf(filter);
	}

	getUpdateRange(currentFilter, invokedByFilter) {
		let fromIndex = 0;
		let toIndex; // Undefined → the natural limit of the array

		if (invokedByFilter) {
			const invokedByFilterIndex = this.getFilterPosition(invokedByFilter);
			const currentFilterIndex = this.getFilterPosition(currentFilter);

			if (currentFilterIndex === -1) {
				// No other filters did match last time; only retest this
				fromIndex = invokedByFilterIndex;
				toIndex = fromIndex + 1;
			} else if (currentFilterIndex === invokedByFilterIndex) {
				// The invokedBy filter matched last time; start testing from that one
				fromIndex = invokedByFilterIndex;
			} else if (currentFilterIndex > invokedByFilterIndex) {
				// Only retest the invoked one, so that thing.filter always refers to the first matched filter
				fromIndex = currentFilterIndex;
				toIndex = fromIndex + 1;
			} else {
				// Some other filters matched; ignore
				return null;
			}
		}

		return { fromIndex, toIndex };
	}

	async refreshThingUnsafe(thing, invokedByFilter) {
		const updateRange = this.getUpdateRange(thing.filter, invokedByFilter);
		if (!updateRange) return;

		const matchedFilter = await this.filters.slice(updateRange.fromIndex, updateRange.toIndex)
			::asyncFind(v => v.state !== null && v.matchesFilter(thing, true));

		if (thing.filter !== matchedFilter) {
			if (matchedFilter) matchedFilter.updateMatchesCount(1);
			if (thing.filter) thing.filter.updateMatchesCount(-1);

			this.updateThingFilterReason(thing, thing.filter, matchedFilter);
			thing.element.classList.toggle('RESFiltered', !!matchedFilter);

			if (matchedFilter && SelectedEntry.selectedThing() === thing) {
				SelectedEntry.selectClosestVisible({ scrollStyle: 'none' });
			}

			ShowImages.refresh();

			thing.filter = matchedFilter;
		}
	}

	refreshAll(invokedByFilter) {
		for (const thing of this.things) this.refreshThing(thing, invokedByFilter);
	}

	addThing(thing) {
		this.things.add(thing);
		this.refreshThing(thing);
	}

	updateThingFilterReason(thing, previousMatch, currentMatch) {
		if (previousMatch) previousMatch.removeThingFilterReason(thing);

		if (currentMatch) {
			if (this.showFilterReason) currentMatch.setThingFilterReason(thing);
			else currentMatch.removeThingFilterReason(thing);
		}
	}

	refreshAllFilterReasons() {
		for (const thing of this.things) this.updateThingFilterReason(thing, null, thing.filter);
	}
}
