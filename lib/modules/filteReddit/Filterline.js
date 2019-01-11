/* @flow */

import _ from 'lodash';
import { $ } from '../../vendor';
import type { Thing } from '../../utils';
import {
	BodyClasses,
	fastAsync,
	waitForEvent,
	downcast,
	hide as redditHide,
	unhide as redditUnhide,
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
	Filter?: Class<Filter>,
	id?: string,
	add?: boolean,
	save?: boolean,
	...FilteReddit.FilterStorageValues,
|};

export class Filterline {
	things: Set<Thing> = new Set();
	thingType: string;

	storage: *;
	filters: Filter[] = [];
	sortedFilters: Filter[] = []; // Filters sorted by slowness

	currentMatches: Map<Thing, { [string]: Filter | null }> = new Map();

	permanentlyHiddenThings: Set<Thing> = new Set();
	displayReasons: boolean = false;

	element: HTMLElement;
	dropdown: HTMLElement;
	preamble: HTMLElement;
	filterContainer: HTMLElement;
	poweredElement: HTMLInputElement;
	permanentlyHideCheckbox: HTMLInputElement;

	initialized: boolean = false;

	constructor(storage: *, thingType: *) {
		this.storage = storage;
		this.thingType = thingType;
	}

	// Initialize once things are being processed
	isInitialized(): boolean {
		if (this.initialized) return true;

		if (!this.getActiveFilters().length) return false;

		this.initialized = true;
		// It is possible to optimize the order of filters until things are filtered
		// if order is changed thereafter, `getFiltersToTest` may return invalid results
		this.sortedFilters = _.sortBy(this.filters, ({ case: { constructor: { slow } } }) => slow);

		return true;
	}

	isPowered() { return !document.documentElement.classList.contains('res-filters-disabled'); }

	togglePowered = (powered: boolean = !this.isPowered()) => {
		BodyClasses.toggle(!powered, 'res-filters-disabled');
		this.poweredElement.checked = powered;
	}

	createElement() {
		const element = this.element = string.html`
			<div class="res-filterline">
				<div class="res-filterline-preamble"></div>
				<div class="res-filterline-filters">
					<input type="checkbox" ${this.isPowered() && 'checked'} class="res-filterline-toggle-powered" title="Stop filtering temporarily"></input>
				</div>
			</div>
		`;
		this.preamble = element.querySelector('.res-filterline-preamble');
		this.filterContainer = element.querySelector('.res-filterline-filters');

		this.addFilterElements(this.filters);

		waitForEvent(this.preamble, 'mouseenter', 'click').then(() => this.createDropdown());

		this.poweredElement = downcast(element.querySelector('.res-filterline-toggle-powered'), HTMLInputElement);
		this.poweredElement.addEventListener('change', () => { this.togglePowered(); });
	}

	addFilterElements(filters: Filter[]) {
		for (const filter of filters) {
			if (filter instanceof ExternalFilter) continue; // ExternalFilter elements are created when dropdown is bulit
			filter.createElement();
			this.filterContainer.appendChild(filter.element);
		}
	}

	getFiltersOfCase(CaseClass: *) {
		return this.filters.filter(v => v.BaseCase === CaseClass);
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
					<div class="res-filterline-display-match-reason">
						<label>
							<input type="checkbox" ${this.displayReasons && 'checked'}">
							<span>Show matching filters</span>
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
		for (const [name, CaseClasses] of Object.entries(dp)) {
			addDetails(`New ${name} filter`, `res-filterline-new-${name}`,
				...CaseClasses
					.sort((a, b) => a.type.localeCompare(b.type))
					.map(CaseClass => this.createNewFilterElement(CaseClass))
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
			}),
			(() => {
				const e = string.html`<div class="res-filterline-dropdown-action">Reset this Filterline</div>`;
				e.addEventListener('click', () => {
					this.storage.delete();
					if (confirm('Reload page to restore default')) location.reload();
				});
				return e;
			})()
		);

		const displayReasonsCheckbox = downcast(element.querySelector('.res-filterline-display-match-reason input'), HTMLInputElement);
		displayReasonsCheckbox.addEventListener('change', () => {
			this.toggleDisplayReasons(displayReasonsCheckbox.checked);
		});

		if (this.thingType === 'post' && loggedInUser()) {
			const permanentlyHide = string.html`
				<div class="res-filterline-permanently-hide">
					<label>
						<input type="checkbox">
						<span>Permanently hide</span>
					</label>
				</div>
			`;
			const checkbox = this.permanentlyHideCheckbox = downcast(permanentlyHide.querySelector('input'), HTMLInputElement);
			this.updatePermanentlyHideCheckbox();
			permanentlyHide.addEventListener('click', async () => {
				checkbox.disabled = true;
				await (this.permanentlyHiddenThings.size ? this.unhidePermanently() : this.hidePermanently());
				checkbox.disabled = false;
			});
			element.querySelector('.res-filterline-dropdown-toggles').append(permanentlyHide);
		}

		downcast(element.querySelector('.res-filterline-show-help'), HTMLElement).addEventListener('click', () => {
			RESTips.showFeatureTip('filterlineVisible');
		});
	}

	updatePermanentlyHideCheckbox() {
		if (!this.permanentlyHideCheckbox) return;
		this.permanentlyHideCheckbox.checked = this.permanentlyHideCheckbox.indeterminate = false;
		if (!this.permanentlyHiddenThings.size) return;
		if (this.getThings('hide').length === this.permanentlyHiddenThings.size) this.permanentlyHideCheckbox.checked = true;
		else this.permanentlyHideCheckbox.indeterminate = true;
	}

	createNewFilterElement(CaseClass: Class<Case>, text: string = CaseClass.text, newOpts?: $Shape<NewFilterOpts>) {
		let fromSelected = false;

		const element = string.html`<div class="res-filterline-dropdown-action res-filterline-filter-new" type="${CaseClass.type}">${text}</div>`;
		element.addEventListener('click', () => {
			const existing = CaseClass.unique && this.getFiltersOfCase(CaseClass)[0];
			let filter;
			if (existing) {
				if (!(existing instanceof LineFilter)) throw new Error();
				filter = existing;
			} else {
				filter = downcast(this.createFilter({ type: CaseClass.type, add: true, ...newOpts }), LineFilter);
			}

			if (fromSelected) filter.updateByInputConstruction({ fromSelected });
			filter.showInfocard(true);
		});

		if (CaseClass.thingToCriterion || !CaseClass.defaultConditions) {
			const c = string.html`<div class="res-filterline-filter-new-from-selected" title="From selected entry"></div>`;
			c.addEventListener('click', () => {
				fromSelected = true;
				setTimeout(() => { fromSelected = false; });
			});
			element.append(c);
		}

		return element;
	}

	async hidePermanently(things: Array<Thing> = this.getThings('hide')) {
		await Promise.all(_.difference(things, Array.from(this.permanentlyHiddenThings)).map(thing => redditHide(thing)));
		for (const v of things) this.permanentlyHiddenThings.add(v);
		this.updatePermanentlyHideCheckbox();

		Notifications.showNotification({
			moduleID: FilteReddit.module.moduleID,
			notificationID: 'hideThings',
			message: string.html`<div><p>Reddit has now hidden ${things.length} things. Undo by unchecking the checkbox in the menu.</p><p><a href="/user/me/hidden/">See all hidden posts</a></p>`,
		});
	}

	async unhidePermanently(things: Array<Thing> = [...this.permanentlyHiddenThings]) {
		await Promise.all(_.intersection(things, Array.from(this.permanentlyHiddenThings)).map(thing => redditUnhide(thing)));
		for (const v of things) this.permanentlyHiddenThings.delete(v);
		this.updatePermanentlyHideCheckbox();

		Notifications.showNotification({
			moduleID: FilteReddit.module.moduleID,
			notificationID: 'unhideThings',
			message: `${things.length} things are no longer hidden.`,
		});
	}

	getAsConditions(hasEffect: string = 'hide'): * {
		const extracted = filterMap(this.filters, v => v.effects[hasEffect] && v instanceof LineFilter && [v] || undefined);
		return Cases.resolveGroup(
			Cases.getGroup(
				'all',
				extracted.map(v => v.state ? v.case.conditions : Cases.getGroup('none', [v.case.conditions])),
			),
			false,
			true
		);
	}

	deferredFilters: { [id: string]: * } = {};

	resumeDeferredTypes(types: Array<string>) {
		Object.entries(this.deferredFilters)
			.filter(([, { type }]) => types.includes(type))
			.forEach(([id]) => this.createFilterFromStateValues(id));
	}

	restoreState(filters: *) {
		for (const [id, opts] of Object.entries(filters)) {
			try {
				if (opts.type === 'inert') throw new Error('Requested inert filter. This state is likely due to a bug. Ignoring.');

				const filter = this.getFilter(id);
				if (filter) throw new Error(`Filter with id ${id} already exists`);

				if (
					Cases.has(opts.type) &&
					// External filter needs a specific variant of `Filter`
					!(Cases.get(opts.type).variant === 'external')
				) {
					this.createFilterFromStateValues(id, opts);
				} else {
					this.deferredFilters[id] = opts;
				}
			} catch (e) {
				console.error('Could not create filter', id, opts);
				this.storage.deletePath('filters', id);
			}
		}
	}

	createFilterFromStateValues(id: *, opts: *) {
		const deferredOpts = this.deferredFilters[id];
		delete this.deferredFilters[id];
		return this.createFilter({ id, ...opts, ...deferredOpts, add: true, save: false });
	}

	save = idleThrottle(async () => {
		const filters = this.filters.reduce((acc, v) => {
			acc[v.id] = v.getSaveValues();
			return acc;
		}, { ...this.deferredFilters });
		await this.storage.deletePath('filters');
		await this.storage.patch({ filters, lastUsed: Date.now() });
	});

	getCLI(): * {
		const deconstruct = val => {
			// Example: "!expando image" → { reverseActive: true, key: "expando", criterion: "image" }
			const [, modifiers, key, criterion]: string[] = (val.match(/^([^\w]*)(\w*)(.*)/): any); // guaranteed match
			return {
				key,
				criterion: criterion.trim(),
				disableFilter: !!modifiers.match('/'),
				reverseActive: !!modifiers.match('!'),
				asNewFilter: !!modifiers.match('\\+'),
				fromSelected: !!modifiers.match('='),
			};
		};

		const findMatchingCases = val =>
			this.getPickable()
				.sort((a, b) => a.variant.localeCompare(b.variant) || a.type.localeCompare(b.type))
				.map(CaseClass => ({
					// on-demand cases' type name are hard to discern
					name: CaseClass.variant === 'ondemand' ? CaseClass.text : CaseClass.type,
					cls: CaseClass,
				}))
				.filter(({ name }) => name.toLowerCase().match(val.toLowerCase()));

		let filter;

		async function getTip(val) {
			const deconstructed = deconstruct(val);
			const { key, asNewFilter } = deconstructed;
			const bestMatch = key && _.sortBy(findMatchingCases(key), ({ name }) => name.toLowerCase().indexOf(key.toLowerCase()))[0];
			const { cls: MatchedCase } = bestMatch || {};

			let message;

			if (bestMatch) {
				try {
					const lastFilter = _.last(this.getFiltersOfCase(MatchedCase));
					filter = lastFilter && !asNewFilter ?
						lastFilter :
						this.createFilter({ type: MatchedCase.type });

					const actionDescription = await filter.updateByInputConstruction(deconstructed, true);
					/*:: if (!actionDescription ) throw new Error(); */
					message = `${filter.parent ? `Modify "${filter.getStateText(filter.state)}"` : 'New filter'}: ${actionDescription}`;
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
				...findMatchingCases('').map(v =>
					` ${(MatchedCase === v.cls) ? `<b>${v.name}</b>` : v.name} ${v.cls.pattern}`
				),
				'',
				'Modifiers:',
				' / — disable the filter',
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

	createFilter(opts: $Shape<NewFilterOpts>) {
		const {
			Filter = LineFilter,
			id = `~${performance.timing.navigationStart + performance.now()}`, // timestamp, so that filters will restored in the same order as they initially were created
			add = false,
			save = true,
			type,
			criterion,
			effects,
			name,
			state,
		} = opts;
		let { conditions } = opts;

		if (this.deferredFilters.hasOwnProperty(id)) return this.createFilterFromStateValues(id, opts);

		const CaseClass = Cases.get(type);
		if (CaseClass.unique && this.getFiltersOfCase(CaseClass).length) throw new Error('Cannot create new instances of unique filters');

		if (!conditions && criterion) {
			// Legacy; `criterion` is no longer saved to storage
			conditions = CaseClass.criterionToConditions(criterion);
		}

		const filter = new Filter(id, CaseClass, name, conditions, state, effects);

		if (add) {
			this.addFilter(filter);
			if (save) this.save();
		}

		return filter;
	}

	addFilter(filter: Filter) {
		filter.setParent(this);

		this.filters.push(filter);

		if (this.isInitialized()) {
			this.sortedFilters.push(filter);
			this.refreshAll(filter);
		}

		if (this.filterContainer) this.addFilterElements([filter]);
	}

	async removeFilter(filter: Filter) {
		if (filter.element) filter.element.remove();
		if (this.isInitialized()) await Promise.all(this.refreshAll(filter));
		_.pull(this.filters, filter);
		_.pull(this.sortedFilters, filter);
		this.save();
	}

	getFilter(id: string): ?Filter {
		return this.filters.find(filter => filter.id === id);
	}

	getActiveFilters() {
		return this.filters.filter(v => v.active);
	}

	availableEffects: {
		[key: string]: (Thing, Filter) => void,
	} = {
		propagate: (thing, match) => {
			thing.element.classList.toggle('res-thing-hide-children', !!match);
			this._refreshAfterChange(thing);
		},
		highlight: (thing, match) => {
			thing.entry.style.backgroundColor = match ? 'rgba(255, 155, 155, .16)' : '';
		},
		hide: (thing, match) => {
			thing.setHideFilter(match);
			this._refreshAfterChange(thing);
		},
	};

	_refreshAfterChange(thing: Thing) {
		if (
			SelectedEntry.selectedThing &&
			[SelectedEntry.selectedThing, ...SelectedEntry.selectedThing.getParents()].includes(thing) &&
			!SelectedEntry.selectedThing.isVisible()
		) {
			SelectedEntry.frameThrottledMove('closestVisible', { scrollStyle: 'none' }, () => {});
		}

		ShowImages.refresh();
		this.checkEmptyState();
	}

	getFiltersToTest(currentFilter?: Filter, invokedByFilter?: Filter): Filter[] {
		if (!invokedByFilter) return this.sortedFilters;

		const invokedByFilterIndex = this.sortedFilters.indexOf(invokedByFilter);
		const currentFilterIndex = this.sortedFilters.indexOf(currentFilter);

		if (!currentFilter) {
			// No other filters did match last time; only retest this
			return [invokedByFilter];
		} else if (currentFilter === invokedByFilter) {
			// The invokedBy filter matched last time; start testing from that one
			return this.sortedFilters.slice(invokedByFilterIndex);
		} else if (currentFilterIndex > invokedByFilterIndex) {
			// Always store a reference to the first matched filter
			return [invokedByFilter, currentFilter];
		} else {
			// Some earlier filter matched last time; ignore
			return [];
		}
	}

	refreshThing = fastAsync(keyedMutex(function*(thing: Thing, invokedByFilter?: Filter) {
		if (!this.currentMatches.has(thing)) this.currentMatches.set(thing, {});
		const currentMatches = this.currentMatches.get(thing);

		const effectsToRefresh = Object.keys(this.availableEffects);

		const filtersToTest = _.union(...effectsToRefresh.map(effect => this.getFiltersToTest(currentMatches[effect], invokedByFilter)))
			// Keep order
			.sort((a, b) => this.sortedFilters.indexOf(a) - this.sortedFilters.indexOf(b));

		_.remove(effectsToRefresh, effect =>
			// Only update effects that the current filter has touched
			invokedByFilter && !invokedByFilter.effects.hasOwnProperty(effect) ||
			// Don't update effects whose current matched filter will not be tested
			currentMatches[effect] && !filtersToTest.includes(currentMatches[effect])
		);

		const updateEffect = (effect, filter) => {
			const old = currentMatches[effect];
			if (filter == old) return; // eslint-disable-line eqeqeq
			currentMatches[effect] = filter;
			this.availableEffects[effect](thing, filter);

			if (this.displayReasons) this.refreshDisplayReasons(thing, old, filter);
		};

		for (const filter of this.getActiveFilters().filter(v => filtersToTest.includes(v))) {
			const effects = filter.getEffects().filter(v => effectsToRefresh.includes(v));
			if (effects.length && (yield filter.matches(thing))) {
				for (const effect of effects) updateEffect(effect, filter);
				_.pull(effectsToRefresh, ...effects);
			}
		}

		for (const effect of effectsToRefresh) {
			updateEffect(effect, null);
		}
	}));

	refreshAll(invokedByFilter: Filter) {
		return Array.from(this.things).map(thing => this.refreshThing(thing, invokedByFilter));
	}

	addThing(thing: Thing) {
		this.things.add(thing);
		if (this.isInitialized()) return this.refreshThing(thing);
	}

	getThings(withEffect: string) {
		return Array.from(this.currentMatches.entries())
			.filter(([, effects]) => effects[withEffect])
			.map(([thing]) => thing);
	}

	checkEmptyState = (() => {
		const showNotification = _.debounce(_.once(() => {
			const info = $('<p>').text(i18n('filteRedditEmptyNotificationInfo'));
			const toggle = $('<button>').text(i18n('filteRedditEmptyNotificationToggleShowReason'))
				.click(() => { this.toggleDisplayReasons(); });

			Notifications.showNotification({
				moduleID: FilteReddit.module.moduleID,
				notificationID: 'everyThingHidden',
				header: i18n('filteRedditEmptyNotificationHeader'),
				message: $('<div>').append(info).append(toggle).get(0),
				closeDelay: Infinity,
			});
		}), 4000);

		return _.throttle(() => {
			if (Array.from(this.things).filter(v => v.isVisible()).length) {
				showNotification.cancel();
			} else if (!this.displayReasons) {
				showNotification();
			}
		}, 100, { leading: false });
	})();

	toggleDisplayReasons(newState?: boolean = !this.displayReasons) {
		this.displayReasons = newState;
		for (const thing of this.things) this.refreshDisplayReasons(thing);
		BodyClasses.toggle(this.displayReasons, 'res-display-match-reason');
	}

	async refreshDisplayReasons(thing: Thing) {
		const reasons = this.displayReasons ? await Promise.all(
			Object.entries(this.currentMatches.get(thing) || {})
				.map(([effect, filter]) => filter && filter.buildReasonElement(thing, effect))
				.filter(Boolean)
		) : [];

		thing.setFilterReasons(reasons);
	}
}
