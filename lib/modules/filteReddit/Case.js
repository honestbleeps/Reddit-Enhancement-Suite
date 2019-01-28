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

		if (typeof state !== 'boolean') throw new Error('Could not evaluate case against selected thing');

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

	static buildRegex(string: string, { fullMatch = true }: {| fullMatch?: boolean |} = {}) {
		if (!string) throw new Error('String cannot be empty');
		if (regexRegex.test(string)) {
			const [, str, flags] = (regexRegex.exec(string): any); // guaranteed to match due to `.test()` above
			return new RegExp(str, flags);
		} else {
			const patt = _.escapeRegExp(string);
			return new RegExp(fullMatch ? `^${patt}$` : patt, 'i');
		}
	}

	static +defaultConditions: ?$Shape<BuilderValue>;
	static fields: *;
	static slow: number = 0; // Estimated slowness of case; higher value → slower
	static +reconcile: ?Array<*> => *;
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
	isEvaluatable() { return !(this instanceof Cases.Inert || this.constructor.disabled); }

	hasType(type: string): boolean { return this.constructor.type === type; }
	conditions: BuilderValue;
	value: *;
	evaluate(thing: ?Thing, values: ?*[]): null | boolean | Promise<null | boolean> { // eslint-disable-line no-unused-vars
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

export class PatternCase extends Case {
	static build(_raw: string | Array<string>, { fullMatch = true }: {| fullMatch?: boolean |} = {}): Array<*> {
		const raws = Array.isArray(_raw) ? _raw : [_raw];

		const strings = new Set();
		const variants = {};

		for (const raw of raws) {
			if (regexRegex.test(raw)) {
				const [, str, flags = ''] = (regexRegex.exec(raw): any); // guaranteed to match due to `.test()` above
				if (!variants[flags]) variants[flags] = [];
				variants[flags].push(str);
			} else {
				const patt = _.escapeRegExp(raw);
				strings.add(patt);
			}
		}

		if (strings.size) {
			const str = Array.from(strings).join('|');
			if (!variants.i) variants.i = [];
			variants.i.push(fullMatch ? `^(${str})$` : str);
		}

		return Object.entries(variants).map<*>(([flags, sources]) => new RegExp(sources.join('|'), flags));
	}

	static parseCriterion(input: *) { return { patt: input }; }
	static defaultConditions = { patt: '' }; // Patt may also be an array of strings, and have `fullMatch` specified
	static pattern = 'RegEx';

	static reconcile(values: *) {
		const a = values[0];
		if (!a) throw new Error('No values');
		const patt = values.map(v => v.patt);
		return { type: a.type, patt };
	}

	value: Array<RegExp> = PatternCase.build(this.conditions.patt, { fullMatch: this.conditions.fullMatch });
}
