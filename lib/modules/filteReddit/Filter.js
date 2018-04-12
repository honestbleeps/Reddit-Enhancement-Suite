/* @flow */

import { $ } from '../../vendor';
import type { Thing } from '../../utils';
import {
	fastAsync,
} from '../../utils';
import { Case } from './Case';
import type { Filterline } from './Filterline';

export class Filter {
	id: string;
	parent: ?Filterline;
	undeletable: boolean;

	updatePromise: ?Promise<*>;

	baseCase: Class<Case>;
	case: Case;
	state: boolean | null;

	element: HTMLElement;

	constructor(id: *, baseCase: *, conditions: *, state: *, undeletable: * = false) {
		this.id = id;
		this.baseCase = baseCase;
		this.state = state;
		this.setCase(baseCase.fromConditions(conditions));
		this.undeletable = undeletable;
	}

	createElement() {}

	setParent(parent: *) {
		this.parent = parent;
	}

	getStateText(state: ?boolean = this.state, cased: Case = this.case) {
		return state === false ?
			cased.falseText || `¬ ${this.baseCase.text.toLowerCase()}` :
			cased.trueText || this.baseCase.text.toLowerCase();
	}

	getSaveValues() {
		if (this.baseCase.variant === 'basic') {
			return { type: this.baseCase.type, state: this.state, conditions: this.case.conditions };
		} else {
			// The conditions are found in the type's defaultConditions
			return { type: this.baseCase.type, state: this.state };
		}
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
		if (this.state !== null) this.case.observe(this);
	}

	update(state: *, conditions?: *, describeOnly: boolean = false) {
		const cased = typeof conditions === 'undefined' ? this.case : this.baseCase.fromConditions(conditions);

		if (describeOnly) {
			cased.validate();
			return `Show only posts which matches "${this.getStateText(state, cased)}"`;
		}

		if (state !== this.state || this.case !== cased) {
			this.state = state;
			this.setCase(cased);
			if (this.parent) this.updatePromise = Promise.all(this.parent.refreshAll(this));
			if (this.parent) this.parent.save();
		}
	}

	refreshThing = (thing: Thing) => {
		if (this.parent) this.parent.refreshThing(thing, this);
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
			({ state, conditions } = await this.baseCase.getSelectedEntryValue());
		} else {
			conditions = this.baseCase.criterionToConditions(criterion);
			state = this.state;
		}

		state = reverseActive ? new Map([[false, true], [null, false], [true, false]]).get(state) :
			new Map([[false, false], [null, true], [true, true]]).get(state);

		return this.update(state, conditions, describeOnly);
	}

	matches = fastAsync(function*(thing: Thing) {
		const result = yield this.case.evaluate(thing);
		return this.state === !result;
	});

	showThingFilterReason(thing: Thing) {
		thing.element.setAttribute('filter-reason', this.getStateText(!this.state));

		$('<span>', {
			class: 'res-filter-remove-entry',
			title: JSON.stringify(this.case.conditions, null, '  '),
			click: () => { this.update(null); this.refreshThing(thing); },
		}).prependTo(thing.element);
	}

	clearThingFilterReason(thing: Thing) {
		thing.element.removeAttribute('filter-reason');
		$(thing.element).find('> .res-filter-remove-entry').remove();
	}
}
