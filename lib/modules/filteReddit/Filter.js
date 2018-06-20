/* @flow */

import { $ } from '../../vendor';
import type { Thing } from '../../utils';
import {
	fastAsync,
} from '../../utils';
import type { FilterStorageValues } from '../filteReddit';
import { Case } from './Case';
import type { Filterline } from './Filterline';

export class Filter {
	id: string;
	name: string;
	parent: ?Filterline;
	undeletable: boolean;

	updatePromise: ?Promise<*>;

	BaseCase: Class<Case>;
	case: Case;
	state: boolean | null;

	element: HTMLElement;

	sideEffects: { [key: string]: boolean };

	constructor(id: *, BaseCase: *, name: *, conditions: * = null, state: * = null, undeletable: * = false, sideEffects: * = {}) {
		this.id = id;
		this.BaseCase = BaseCase;
		this.name = name;
		this.state = state;
		this.setCase(BaseCase.fromConditions(conditions));
		this.undeletable = undeletable;
		this.sideEffects = sideEffects;
	}

	createElement() {}

	setParent(parent: *) {
		this.parent = parent;
	}

	getStateText(state: ?boolean, cased: Case = this.case): string {
		return state !== false ?
			this.name || cased.trueText || (this.BaseCase.text || this.BaseCase.type).toLowerCase() :
			this.name && `¬ ${this.name}` || cased.falseText || `¬ ${this.getStateText(null, cased)}`;
	}

	getSaveValues() {
		const values: FilterStorageValues = { type: this.BaseCase.type, state: this.state, sideEffects: this.sideEffects };

		if (this.BaseCase.variant === 'basic') {
			values.conditions = this.case.conditions;

			if (this.name && this.name !== this.case.trueText) {
				values.name = this.name;
			}
		}

		return values;
	}

	clear() {
		if (this.undeletable) {
			this.update(null, null);
		} else {
			this.state = null;
			if (this.parent) this.parent.removeFilter(this);
		}
	}

	setCase(newCase: Case) {
		this.case = newCase;
		this.case.observe(this);
	}

	update(state: *, conditions?: *, describeOnly: boolean = false) {
		const cased = conditions === undefined ? this.case : this.BaseCase.fromConditions(conditions, true);
		if (!cased.isValid()) throw new Error('Invalid conditions');

		if (describeOnly) {
			return `Show only posts which matches "${this.getStateText(state, cased)}"`;
		}

		this.state = state;
		this.setCase(cased);
		this.refresh();
	}

	refresh = (save: boolean = true, thing?: Thing) => {
		if (this.parent) {
			this.updatePromise = thing ?
				this.parent.refreshThing(thing, this) :
				Promise.all(this.parent.refreshAll(this));
			if (save) this.parent.save();
		}
	};

	async updateByInputConstruction({
		criterion,
		clearFilter,
		reverseActive,
		fromSelected,
	}: {
		criterion?: string,
		clearFilter?: boolean,
		reverseActive?: boolean,
		fromSelected?: boolean,
	}, describeOnly?: boolean = false): Promise<?string> {
		if (clearFilter) {
			if (describeOnly) return 'Clear filter';
			return this.clear();
		}

		let state, conditions;

		if (fromSelected) {
			({ state, conditions } = await this.BaseCase.getSelectedEntryValue());
		} else {
			if (criterion) conditions = this.BaseCase.criterionToConditions(criterion);
			state = this.state;
		}

		state = reverseActive ? new Map([[false, true], [null, false], [true, false]]).get(state) :
			new Map([[false, false], [null, true], [true, true]]).get(state);

		return this.update(state, conditions, describeOnly);
	}

	matches = fastAsync(function*(thing: Thing) {
		try {
			const result = yield this.case.evaluate(thing);
			return this.state === !result;
		} catch (e) {
			// evaluate may fail due to `downcast` etc
			return false;
		}
	});

	getMatchingEntry(thing: Thing) { // eslint-disable-line no-unused-vars
		return this.case.conditions;
	}

	removeEntry(entry: *) { // eslint-disable-line no-unused-vars
		this.update(null);
	}

	async showThingFilterReason(thing: Thing) {
		thing.element.setAttribute('filter-reason', this.getStateText(!this.state));

		const entry = await this.getMatchingEntry(thing);

		$('<span>', {
			class: 'res-filter-remove-entry',
			title: JSON.stringify(entry, null, '  '),
			click: () => { this.removeEntry(entry); },
		}).prependTo(thing.element);
	}

	clearThingFilterReason(thing: Thing) {
		thing.element.removeAttribute('filter-reason');
		$(thing.element).find('> .res-filter-remove-entry').remove();
	}
}
