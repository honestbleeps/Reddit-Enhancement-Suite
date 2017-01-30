/* @flow */

import _ from 'lodash';
import { $ } from '../../vendor';
import type { Thing } from '../../utils';
import {
	fastAsync,
	downcast,
	randomHash,
} from '../../utils';
import filterlineFilterTemplate from '../../templates/filterlineFilter.mustache';
import * as SelectedEntry from '../selectedEntry';
import type Filterline from './Filterline';

export default class Filter<Parsed: { [key: any]: any }> {
	disabled: boolean = false;
	matchesCount: number = 0;
	state: boolean | null = null;
	criterion: ?string = null;

	id: string;
	key: string;
	filterlineStorage: ?*;

	parse: (input: ?string) => ?Parsed = () => {};
	parsed: ?Parsed;
	evaluate: (thing: Thing, data: ?Parsed) => mixed;

	parent: Filterline;

	clearCache: ?() => void;
	fromSelected: ?(thing: Thing) => string;
	onChange: ?(opts: { remove: boolean }) => void;

	alwaysShow: ?boolean;
	pattern: ?string;

	trueText: ?string;
	falseText: ?string;

	element: HTMLElement;
	inner: HTMLElement;

	constructor(options: {
		key: string,
		evaluate: (thing: Thing, data: ?Parsed) => mixed,
		parent: Filterline,
	} & $Shape<this>, id?: string) {
		// An id is necessary when saving / removing
		this.id = id || randomHash();
		// XXX these should be assigned individually so Flow can propagate types correctly
		Object.assign(this, (options: any));

		this.createElement();
		this.updateMatchesCount();
	}

	createElement() {
		this.element = $(filterlineFilterTemplate(this))[0];
		this.inner = this.element.querySelector('.res-filterline-filter-name');
		this.refreshElement();

		this.element.addEventListener('click', () => {
			this.update(this.getNextState());
		});

		this.element.addEventListener('contextmenu', (e: Event) => { // Right click
			// Destroy / reset filter
			this.update(null, null);
			e.preventDefault(); // Do not show context menu
		});
	}

	refreshElement() {
		this.inner.setAttribute('name', this.getStateName());

		if (this.criterion) this.inner.setAttribute('criterion', this.criterion);
		else this.inner.removeAttribute('criterion');

		this.element.classList.toggle('res-filterline-filter-active', this.state !== null);
	}

	getNextState() {
		if (this.state === null) return true; // Active inverse -- hide those that match
		if (this.state === true) return false; // Active -- hide those that  don't match
		if (this.state === false) return null; // Inactive -- disregard filter
	}

	// $FlowIssue
	getStateName(state = this.state) {
		return downcast(state === false ? this.falseText : this.trueText, 'string');
	}

	// $FlowIssue
	getInvertedStateName(state = this.state) {
		return downcast(state === false ? this.trueText : this.falseText, 'string');
	}

	save() {
		if (!this.filterlineStorage) return;
		this.filterlineStorage.patch({ filters: { [this.id]: _.pick(this, ['state', 'criterion', 'key']) } });
	}

	delete() {
		if (!this.filterlineStorage) return;
		this.filterlineStorage.deletePath('filters', this.id);
	}

	update(state: *, criterion: ?string, { save = true }: { save?: boolean } = {}, describeOnly?: boolean = false) {
		if (criterion !== undefined && criterion !== this.criterion) {
			if (this.parse.length) this.criterion = criterion;
			else if (criterion) console.log('Filter does not support criterion. Ignoring criterion', criterion);
			this.parsed = this.parse(criterion);
		} else if (!this.parsed) {
			this.parsed = this.parse(criterion);
		}

		if (describeOnly) {
			if (this.state !== null && state === null) return 'Make inactive';
			if (!this.parsed) return `${this.key} (requires criterion)`;
			return `Show only posts which matches "${this.getStateName(state)}${criterion ? ` ${criterion}` : ''}"`;
		}

		if (!this.parsed) state = null;
		this.state = state;

		this.parent.updateFilter(this);
		const parentless = !this.parent.filters.includes(this);
		if (parentless) this.element.remove();

		const remove = (this.state === null && this.criterion === null) || parentless;
		if (remove) this.delete();
		else if (save) this.save();

		this.refreshElement();

		if (this.onChange) this.onChange({ remove });
	}

	updateFromSelectedEntryValue(reverseActive?: boolean = false, describeOnly?: boolean = false) {
		try {
			if (!this.fromSelected) throw new Error('Filter does not support selected entry data extraction.');

			const selected = SelectedEntry.selectedThing();
			if (!selected) throw new Error('No entry is currently selected.');

			if (!this.fromSelected) throw new Error('Cannot update without `fromSelected()` method');
			const criterion = this.fromSelected(selected);
			if (criterion === null) throw new Error('Could not retrieve selected entry\'s value');

			const state = this.evaluate(selected, this.parse(criterion));
			if (state === null) throw new Error('Could not evaluate selected entry\'s value');

			return this.update(reverseActive ? !state : state, criterion, undefined, describeOnly);
		} catch (e) {
			if (describeOnly) return `Input error: ${e.message}`;

			console.error(e);

			this.update(null, null);
		}
	}

	updateByInputConstruction({
		criterion,
		clearCriterion,
		reverseActive,
		fromSelected,
	}: {
		criterion?: ?string,
		clearCriterion?: boolean,
		reverseActive?: boolean,
		fromSelected?: boolean,
	}, describeOnly?: boolean = false) {
		if (clearCriterion) {
			if (describeOnly) return 'Clear criterion';
			return this.update(this.state, null);
		} else if (fromSelected && this.fromSelected) {
			return this.updateFromSelectedEntryValue(reverseActive, describeOnly);
		}

		const state = reverseActive ? new Map([[false, true], [null, false], [true, false]]).get(this.state) :
			new Map([[false, false], [null, true], [true, false]]).get(this.state) ||
			criterion ? true : null;

		return this.update(state, criterion ? criterion : undefined, undefined, describeOnly);
	}

	updateMatchesCount(delta?: number = 0) {
		this.matchesCount += delta;
		this.element.title = `${this.state === null ? 'Inactive' : 'Active'} — filters ${this.matchesCount} posts`;

		if (this.element) {
			if (this.matchesCount) this.element.setAttribute('matches-count', String(this.matchesCount));
			else this.element.removeAttribute('matches-count');
		}
	}

	matchesFilter = fastAsync(function*(thing: Thing, mutateThingWithResult: boolean) {
		const result = yield this.evaluate(thing, this.parsed);
		if (mutateThingWithResult) thing.filterResult = result;
		return this.state === !result;
	});

	setThingFilterReason(thing: Thing) {
		this.removeThingFilterReason(thing);

		thing.element.setAttribute(
			'filter-reason',
			`${this.getInvertedStateName()} ${this.criterion ? ` ${this.criterion}` : ''}`
		);

		thing.filterEntryRemover = $('<span>', {
			class: 'res-filter-remove-entry',
			click: () => this.update(null),
		}).prependTo(thing.element);
	}

	removeThingFilterReason(thing: Thing) {
		thing.element.removeAttribute('filter-reason');
		if (thing.filterEntryRemover) thing.filterEntryRemover.remove();
	}
}
