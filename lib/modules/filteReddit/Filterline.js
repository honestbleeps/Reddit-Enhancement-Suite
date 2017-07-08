/* @flow */

import _ from 'lodash';
import { $ } from '../../vendor';
import type { Thing } from '../../utils';
import {
	asyncFind,
	fastAsync,
	waitForEvent,
	downcast,
	hide,
	unhide,
	idleThrottle,
	loggedInUser,
	keyedMutex,
	filterMap,
	string,
} from '../../utils';
import { i18n } from '../../environment';
import * as Hover from '../hover';
import * as Notifications from '../notifications';
import * as SelectedEntry from '../selectedEntry';
import * as ShowImages from '../showImages';
import * as FilteReddit from '../filteReddit';
import * as RESTips from '../RESTips';
import * as Cases from './cases';
import { ExternalFilter } from './ExternalFilter';
import { LineFilter } from './LineFilter';
import type { Filter } from './Filter';
import type { Case } from './Case';

type NewFilterOpts = {|
	add?: boolean,
	criterion?: string,
	conditions?: *,
	id?: string,
	save?: boolean,
	state?: *,
	undeletable?: boolean,
|};

export class Filterline {
	things: Set<Thing> = new Set();
	thingType: string;

	storage: *;
	filters: Filter[] = []; // Non-inert filters
	sortedFilters: Filter[] = []; // Filters sorted by slowness
	inertFilters: Filter[] = [];

	hiddenThings: Thing[] = [];
	showFilterReason: boolean = false;

	element: HTMLElement;
	dropdown: HTMLElement;
	preamble: HTMLElement;
	filterContainer: HTMLElement;
	poweredElement: HTMLInputElement;
	hideCheckbox: HTMLInputElement;

	constructor(storage: *, thingType: *) {
		this.storage = storage;
		this.thingType = thingType;
	}

	isInitialized() {
		// Auto-initialize when things are added
		return !!this.things.size;
	}

	createElement() {
		const element = this.element = string.html`
			<div class="res-filterline">
				<div class="res-filterline-preamble"></div>
				<div class="res-filterline-filters">
					<input type="checkbox" checked class="res-filterline-toggle-powered" title="Stop filtering"></input>
				</div>
			</div>
		`;
		this.preamble = element.querySelector('.res-filterline-preamble');
		this.filterContainer = element.querySelector('.res-filterline-filters');

		this.addFilterElements(this.filters);

		waitForEvent(this.preamble, 'mouseenter', 'click').then(() => this.createDropdown());

		this.poweredElement = downcast(element.querySelector('.res-filterline-toggle-powered'), HTMLInputElement);
		this.poweredElement.addEventListener('change', () => {
			document.body.classList.toggle('res-filters-disabled', !this.poweredElement.checked);
		});
	}

	addFilterElements(filters: Filter[]) {
		for (const filter of filters) {
			if (filter instanceof ExternalFilter) continue;
			filter.createElement();
			this.filterContainer.appendChild(filter.element);
		}
	}

	getFiltersOfCase(caseClass: *) {
		return this.filters.filter(v => v.baseCase === caseClass);
	}

	getPickable(): Class<Case>[] {
		return Object.values(Cases.getByContext(this.thingType, false))
			.filter(v => !v.disabled && v.variant !== 'external');
	}

	createDropdown() {
		const element = string.html`
			<div class="res-filterline-dropdown">
				<div class="res-filterline-dropdown-other"></div>
				<div class="res-filterline-dropdown-toggles">
					<div class="res-filterline-show-reason">
						<label>
							<input type="checkbox">
							<span>Show filter-reason</span>
						</label>
					</div>
				</div>
				<div class="res-filterline-show-help">
					Usage information
				</div>
			</div>
		`;

		this.preamble.append(element);

		// Hover cards may be in front of the dropdown
		this.preamble.addEventListener('mouseenter', () => {
			Hover.infocard('filterline-filter').close();
		});

		function addDetails(summary, className: string, ...elements) {
			const e = string.html`<details class="${className}"><summary>${summary}</summary></details>`;
			e.append(...elements);
			element.querySelector('.res-filterline-dropdown-other').append(e);
		}

		addDetails('Modify external filters', 'res-filterline-external',
			...this.filters
				.filter(filter => filter instanceof ExternalFilter)
				.map(filter => { filter.createElement(); return filter.element; })
		);

		// `Cases.Group` is separated
		const dp = _.groupBy(_.without(this.getPickable(), Cases.Group), v => v.variant);
		for (const [name, caseClasses] of Object.entries(dp)) {
			addDetails(`New ${name} filter`, `res-filterline-new-${name}`,
				...caseClasses
					.sort((a, b) => a.type.localeCompare(b.type))
					.map(caseClass => this.createNewFilterElement(caseClass))
			);
		}

		const _getAsConditions = this.getAsConditions.bind(this);
		addDetails('New complex filter', 'res-filterline-new-group',
			this.createNewFilterElement(Cases.Group, 'Copy active filters', { get conditions() { return _getAsConditions(); } }),
			...Cases.Group.fields[0].options
				.map(op => this.createNewFilterElement(Cases.Group, `Matches ${op}`, { conditions: { op, of: [] } }))
		);

		addDetails('Use as default', 'res-filterline-set-default',
			...FilteReddit.defaultFilters.map(({ type, text }) => {
				const e = string.html`<div class="res-filterline-dropdown-action">${text}</div>`;
				e.addEventListener('click', () => FilteReddit.saveFilterlineStateAsDefault(type));
				return e;
			})
		);

		const showFilterReasonCheckbox = downcast(element.querySelector('.res-filterline-show-reason input'), HTMLInputElement);
		showFilterReasonCheckbox.addEventListener('change', () => {
			this.toggleShowFilterReason(showFilterReasonCheckbox.checked);
		});

		if (this.thingType === 'post' && loggedInUser()) {
			const hideFiltered = string.html`
				<div class="res-filterline-hide-filtered">
					<label>
						<input type="checkbox" ${this.hiddenThings.length && 'checked'}>
						<span>Hide currently filtered</span>
					</label>
				</div>
			`;
			const checkbox = this.hideCheckbox = downcast(hideFiltered.querySelector('input'), HTMLInputElement);
			checkbox.addEventListener('change', async () => {
				checkbox.disabled = true;
				await (checkbox.checked ? this.hide() : this.unhide());
				checkbox.disabled = false;
			});
			element.querySelector('.res-filterline-dropdown-toggles').append(hideFiltered);
		}

		downcast(element.querySelector('.res-filterline-show-help'), HTMLElement).addEventListener('click', () => {
			RESTips.showFeatureTip('filterlineVisible');
		});
	}

	createNewFilterElement(caseClass: Class<Case>, text: string = caseClass.text, newOpts?: NewFilterOpts) {
		let fromSelected = false;

		const element = string.html`<div class="res-filterline-dropdown-action res-filterline-filter-new" type="${caseClass.type}">${text}</div>`;
		element.addEventListener('click', () => {
			const existing = caseClass.unique && this.getFiltersOfCase(caseClass)[0];
			let filter;
			if (existing) {
				if (!(existing instanceof LineFilter)) throw new Error();
				filter = existing;
			} else {
				// $FlowIssue
				filter = downcast(this.createFilterFromType(caseClass.type, { add: true, ...newOpts }), LineFilter);
			}

			filter.updateByInputConstruction({ fromSelected });
			filter.showInfocard(true);
		});

		if (caseClass.thingToCriterion || !caseClass.defaultConditions) {
			const c = string.html`<div class="res-filterline-filter-new-from-selected" title="From selected entry"></div>`;
			c.addEventListener('click', () => {
				fromSelected = true;
				setTimeout(() => { fromSelected = false; });
			});
			element.append(c);
		}

		return element;
	}

	getFiltered(byFilter?: Filter) {
		return Array.from(this.things).filter(thing => byFilter ? thing.filter === byFilter : thing.filter);
	}

	async hide(things: Array<Thing> = this.getFiltered()) {
		await things.map(thing => hide(thing));

		this.hiddenThings.push(...things);

		if (this.hideCheckbox) this.hideCheckbox.checked = !!this.hiddenThings.length;

		Notifications.showNotification({
			moduleID: FilteReddit.module.moduleID,
			notificationID: 'hideThings',
			message: `Reddit has now hidden ${things.length} things. Undo by unchecking the checkbox. If you want to hide additional things, you need to reload this page.`,
		});
	}

	async unhide(things: Array<Thing> = [...this.hiddenThings]) {
		await things.map(thing => unhide(thing));

		_.pull(this.hiddenThings, ...things);

		if (this.hideCheckbox) this.hideCheckbox.checked = !!this.hiddenThings.length;

		Notifications.showNotification({
			moduleID: FilteReddit.module.moduleID,
			notificationID: 'unhideThings',
			message: `${things.length} things are no longer hidden.`,
		});
	}

	getAsConditions(): * {
		const extracted = filterMap(this.filters, v => typeof v.state === 'boolean' && v instanceof LineFilter && [v] || undefined);
		return Cases.resolveGroup(
			Cases.getGroup(
				'all',
				extracted.map(v => v.state ? v.case.conditions : Cases.getGroup('none', [v.case.conditions])),
			),
			false,
			true
		);
	}

	restoreState(filters: *) {
		for (const [id, { type, state, criterion, conditions, undeletable }] of Object.entries(filters)) {
			try {
				this.createFilterFromType(type, { add: true, id, state, criterion, conditions, undeletable, save: false });
			} catch (e) {
				console.error('Could not create filter', type, 'deleting', e);
				this.storage.deletePath('filters', id);
			}
		}
	}

	save = idleThrottle(async () => {
		const filters = [...this.filters, ...this.inertFilters].reduce((acc, v) => {
			acc[v.id] = v.getSaveValues();
			return acc;
		}, {});
		await this.storage.deletePath('filters');
		await this.storage.patch({ filters });
	});

	getCLI(): * {
		const deconstruct = val => {
			// Example: "!expando image" → { reverseActive: true, key: "expando", criterion: "image" }
			const [, modifiers, key, criterion]: string[] = (val.match(/^([^\w]*)(\w*)(.*)/): any); // guaranteed match
			return {
				key,
				criterion: criterion.trim(),
				clearFilter: !!modifiers.match('/'),
				reverseActive: !!modifiers.match('!'),
				asNewFilter: !!modifiers.match('\\+'),
				fromSelected: !!modifiers.match('='),
			};
		};

		const findMatchingCases = val =>
			this.getPickable()
				.filter(({ type }) => type.toLowerCase().match(val.toLowerCase()))
				.sort((a, b) => a.variant.localeCompare(b.variant) || a.type.localeCompare(b.type));

		let filter;

		async function getTip(val) {
			const deconstructed = deconstruct(val);
			const { key, asNewFilter } = deconstructed;
			const bestMatch = key && _.sortBy(findMatchingCases(key), ({ type }) => type.toLowerCase().indexOf(key.toLowerCase()))[0];

			let message;

			if (bestMatch) {
				try {
					const lastFilter = _.last(this.getFiltersOfCase(bestMatch));
					filter = lastFilter && !asNewFilter ?
						lastFilter :
						this.createFilterFromType(bestMatch.type);

					const actionDescription = await filter.updateByInputConstruction(deconstructed, true);
					/*:: if (!actionDescription ) throw new Error(); */
					message = `${filter.parent ? `Modify "${filter.getStateText()}"` : 'New filter'}: ${actionDescription}`;
				} catch (e) {
					message = `Error: ${e.message}`;
				}
			} else {
				filter = null;
				message = 'No filter selected.';
			}

			return [
				'<pre>',
				'Syntax: [modifiers] filterName [criterion]',
				'',
				message,
				'',
				'Filters:',
				...findMatchingCases('').map(v => ` ${(bestMatch === v) ? `<b>${v.type}</b>` : v.type} ${v.pattern}`),
				'',
				'Modifiers:',
				' / — clear the filter',
				' ! — reverse the active state',
				' + — create as new filter',
				' = — use the currently selected post\'s data as criterion',
				'',
				'Examples:',
				' =postAfter   → filter posts older than selected',
				' +=!postAfter → new filter, filter posts younger than selected',
				'</pre>',
			].join('\n');
		}

		function executeCommand(val) {
			if (!filter) return;
			if (!filter.parent) this.addFilter(filter);
			filter.updateByInputConstruction(deconstruct(val));
			filter = null;
		}

		return { getTip: getTip.bind(this), executeCommand: executeCommand.bind(this) };
	}

	createFilterFromType(
		type: *,
		{
			add,
			criterion,
			conditions,
			id = `~${performance.timing.navigationStart + performance.now()}`, // timestamp, so that filters will restored in the same order as they initially were created
			save = true,
			state = null,
			undeletable,
		}: NewFilterOpts = {}) {
		const caseClass = Cases.get(type);
		if (caseClass.unique && this.getFiltersOfCase(caseClass).length) throw new Error('Cannot create new instances of unique filters');

		if (!conditions && typeof criterion !== 'undefined') {
			conditions = caseClass.criterionToConditions(criterion);
		}

		const filter = new (caseClass.variant === 'external' ? ExternalFilter : LineFilter)(id, caseClass, conditions, state, undeletable);

		if (add) {
			this.addFilter(filter);
			if (save) this.save();
		}

		return filter;
	}

	addFilter(filter: Filter) {
		if (filter.baseCase === Cases.Inert) {
			this.inertFilters.push(filter);
			return;
		}

		filter.setParent(this);

		this.filters.push(filter);

		// It is possible to optimize the order of filters as long as no filter has yet matched
		// if order is changed after first match, `getFiltersToTest` may return wrong results
		if (this.isInitialized()) this.sortedFilters.push(filter);
		else this.sortedFilters = _.sortBy(this.filters, ({ case: { constructor: { slow = false } } }) => slow);

		if (this.isInitialized()) this.refreshAll(filter);

		if (this.filterContainer) this.addFilterElements([filter]);
	}

	async removeFilter(filter: Filter) {
		if (filter.element) filter.element.remove();
		if (this.isInitialized()) await Promise.all(this.refreshAll(filter));
		_.pull(this.filters, filter);
		_.pull(this.sortedFilters, filter);
		this.save();
	}

	getActiveFilters() {
		return this.filters.filter(v => v.state !== null);
	}

	hasActiveLineFilters() {
		return !!this.getActiveFilters().find(v => !(v instanceof ExternalFilter));
	}

	getFilterPosition(filter: ?Filter) {
		if (!filter) return -1;
		return this.sortedFilters.indexOf(filter);
	}

	getFiltersToTest(currentFilter?: Filter, invokedByFilter?: Filter): Filter[] {
		if (!invokedByFilter) return this.sortedFilters;

		const invokedByFilterIndex = this.getFilterPosition(invokedByFilter);
		const currentFilterIndex = this.getFilterPosition(currentFilter);

		if (currentFilterIndex === -1) {
			// No other filters did match last time; only retest this
			return [invokedByFilter];
		} else if (currentFilterIndex === invokedByFilterIndex) {
			// The invokedBy filter matched last time; start testing from that one
			return this.sortedFilters.slice(invokedByFilterIndex);
		} else if (currentFilterIndex > invokedByFilterIndex) {
			// thing.filter should always refers to the first matched filter
			return _.compact([invokedByFilter, currentFilter]);
		} else {
			// Some earlier filter matched last time; ignore
			return [];
		}
	}

	refreshThing = keyedMutex(fastAsync(function*(thing: Thing, invokedByFilter?: Filter) {
		const filtersToTest = this.getFiltersToTest(thing.filter, invokedByFilter);
		if (!filtersToTest.length) return;

		const matchedFilter = yield asyncFind(
			filtersToTest,
			v => v.state !== null && v.matches(thing)
		);

		if (thing.filter !== matchedFilter) {
			if (this.showFilterReason) this.refreshThingFilterReason(thing, thing.filter, matchedFilter);
			thing.setFilter(matchedFilter);

			if (matchedFilter && SelectedEntry.selectedThing === thing) {
				SelectedEntry.frameThrottledMove('closestVisible', { scrollStyle: 'none' }, () => {});
			}

			ShowImages.refresh();
			this.checkEmptyState();
		}
	}));

	refreshAll(invokedByFilter: Filter) {
		return Array.from(this.things).map(thing => this.refreshThing(thing, invokedByFilter));
	}

	addThing(thing: Thing) {
		this.things.add(thing);
		return this.refreshThing(thing);
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

	toggleShowFilterReason(newState?: boolean = !this.showFilterReason) {
		this.showFilterReason = newState;
		this.refreshAllFilterReasons();
		document.body.classList.toggle('res-show-filter-reason', this.showFilterReason);
	}

	refreshThingFilterReason(thing: Thing, previousMatch?: Filter, currentMatch?: Filter) {
		if (previousMatch) previousMatch.clearThingFilterReason(thing);
		if (currentMatch) currentMatch.clearThingFilterReason(thing);
		if (currentMatch && this.showFilterReason) currentMatch.showThingFilterReason(thing);
	}

	refreshAllFilterReasons() {
		for (const thing of this.things) this.refreshThingFilterReason(thing, undefined, thing.filter);
	}
}
