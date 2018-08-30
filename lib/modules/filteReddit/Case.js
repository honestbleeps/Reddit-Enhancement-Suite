/* @flow */

import _ from 'lodash';
import { Thing } from '../../utils';
import type { BuilderValue, BuilderRootValue } from '../../core/module';
import * as SelectedEntry from '../selectedEntry';
import * as Cases from './cases';

const regexRegex = /^\/(.*)\/([gim]+)?$/;

export class Case {
	static type: string;
	static text: string;

	static +thingToCriterion: ?(thing: Thing) => string | Promise<string>;
	static +parseCriterion: ?(input: string) => *;

	static async getSelectedEntryValue() {
		const selected = SelectedEntry.selectedThing;
		if (!selected) throw new Error('No entry is currently selected.');

		let conditions;
		if (this.defaultConditions) {
			if (!this.thingToCriterion) throw Error('Case does not have method `thingToCriterion`');
			if (!this.criterionToConditions) throw Error('Case does not have method `criterionToConditions`');
			conditions = this.criterionToConditions(await this.thingToCriterion(selected));
		}

		const cased = this.fromConditions(conditions);

		const state = await cased.evaluate(selected);

		return { conditions, state };
	}

	static criterionToConditions(criterion: string): $Shape<BuilderValue> {
		const parse = this.parseCriterion && this.parseCriterion.bind(this);
		if (!parse) {
			throw new Error('Does not accept criterion');
		}

		if (!criterion && this.pattern && !this.pattern.startsWith('[')) {
			throw new Error('Requires criterion');
		}

		const parts = criterion.split(' & ');

		if (this.criterionOperators && criterion && parts.length > 1) {
			return Cases.getGroup('all', parts.map(v => Cases.getConditions(this.type, parse(v))));
		} else {
			return parse(criterion);
		}
	}

	static fromConditions(from: ?$Shape<BuilderValue>, propagateError: boolean = false): Case {
		let cased;

		const conditions = Cases.getConditions(from && from.type || this.type, from);
		const type = conditions.type;

		try {
			const CaseClass = Cases.get(type);
			if (CaseClass.disabled) throw new Error(`${CaseClass.type} is disabled`);
			cased = new CaseClass(conditions);
		} catch (e) {
			if (propagateError) throw e;
			console.error(`Could not build case: ${e.message}. Ignoring.`, e);
			cased = new Cases.Inert(conditions);
		}

		return cased;
	}

	static buildRegex(string: string, { allowEmptyString = false, fullMatch = true }: {| allowEmptyString?: boolean, fullMatch?: boolean |} = {}) {
		if (regexRegex.test(string)) {
			const [, str, flags] = (regexRegex.exec(string): any); // guaranteed to match due to `.test()` above
			return new RegExp(str, flags);
		} else {
			if (!allowEmptyString && !string) throw new Error('String cannot be empty');
			const patt = _.escapeRegExp(string);
			return new RegExp(fullMatch ? `^${patt}$` : patt, 'i');
		}
	}

	static +defaultConditions: ?$Shape<BuilderValue>;
	static fields: *;
	static slow: number = 0; // Estimated slowness of case; higher value → slower
	static reconcilable: boolean = false; // `evaluate` supports 2nd argument `values` which is an array of same-class `value`
	static get disabled(): boolean {
		return false;
	}

	// Determines where cases are available; usually set by Cases.populate
	static contexts: Array<'browse' | 'post' | 'comment'>;

	static validate(conditions: BuilderValue) {
		const cased = Case.fromConditions(conditions, true);
		if (!cased.isValid()) throw new Error('Invalid conditions');
		return true;
	}

	// For Filterline
	static unique: boolean = false;
	static variant: 'basic' | 'ondemand' | 'external' = 'basic';
	static pattern: string = '';
	static criterionOperators = false; // Create groups on encountering operators: ' & ' → 'and'

	static _customFilter: ?BuilderRootValue;
	static getCustomFilter() { if (this._customFilter) return this._customFilter; throw new Error('Source not found'); }

	+trueText: ?string;
	+falseText: ?string;

	constructor(conditions: *) {
		this.conditions = this.value = conditions;
	}

	isValid(): boolean { return true; }

	hasType(type: string): boolean { return this.constructor.type === type; }
	conditions: BuilderValue;
	value: *;
	evaluate(thing: ?Thing, values: ?*[]): boolean | Promise<boolean> { // eslint-disable-line no-unused-vars
		throw new Error('evaluate() must be implemented for all Case subclasses');
	}

	observers: Set<{ refresh: (save: boolean, thing?: Thing) => void }> = new Set();
	onObserve(): ?boolean {} // `true` → `refresh` callback registered
	observe(observer: *): ?boolean { // `true` → observer added
		if (!this.observers.has(observer) && this.onObserve()) {
			this.observers.add(observer);
			return true;
		}
	}

	refresh(thing?: Thing) {
		for (const o of this.observers) {
			o.refresh(false, thing);
		}
	}
}
