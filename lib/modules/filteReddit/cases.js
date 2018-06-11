/* @flow */

import _ from 'lodash';
import { asyncFilter, fastAsync } from '../../utils';
import type { BuilderValue } from '../../core/module';
import { Case } from './Case';
import * as postCases from './postCases';
import * as commentCases from './commentCases';
import * as browseCases from './browseCases';

export class Inert extends Case {
	isValid(): boolean { return false; }

	evaluate() { console.error('Evaluating inert case'); return false; }
}

class True extends Case {
	static text = 'True';

	static fields = ['always true'];

	evaluate() { return true; }
}

class False extends Case {
	static text = 'False';

	static fields = ['always false'];

	evaluate() { return false; }
}

export class Group extends Case {
	static text = 'Group of conditions';

	static fields = [
		{ type: 'select', options: ['none', 'any', 'one', 'all'], id: 'op' },
		' of these are true:',
		{ type: 'multi', include: 'all', id: 'of' },
	];

	static +defaultConditions = { op: 'all', of: [] };
	static slow = 1;

	get trueText() {
		return this._cases.length && this.toCriterion(this.conditions.op, this._cases) ||
			'empty group';
	}

	toCriterion(op: *, cases: *) {
		const symbol = (op === 'any' || op === 'none') && '∨' || op === 'one' && '⊕' || '∧';
		let str = cases.map(v => v.trueText).join(` ${symbol} `);
		if (cases.length > 1) str = `(${str})`;
		return op === 'none' ? `¬ ${str}` : str;
	}

	_cases = [];

	isValid() { return this._cases.every(v => v.isValid()); }

	getValue({ op, of }: GroupConditions) {
		const [NONE, ANY, ONE, ALL] = [op === 'none', op === 'any', op === 'one', op === 'all'];

		const evaluators = [];
		let seenTrue = false;

		const cases = of
			.map(v => Case.fromConditions(v))
			.sort(({ constructor: a }, { constructor: b }) => Number(a !== b));

		const l = cases.length;
		for (let i = 0; i < l; i++) { // eslint-disable-line no-restricted-syntax
			const caseA = cases[i];
			if (caseA instanceof Inert) return caseA;
			this._cases.push(caseA);

			if ((ANY || NONE) && caseA.constructor.reconcilable) {
				const values = [caseA.value];
				let caseB;
				// Look for more cases of same type
				while ((caseB = cases[i + 1]) && caseA.constructor === caseB.constructor) {
					i++;
					values.push(caseB.value);
				}

				evaluators.push(thing => caseA.evaluate(thing, values));
			} else {
				evaluators.push(caseA.evaluate.bind(caseA));
			}
		}

		return fastAsync(function*(thing) {
			seenTrue = false;

			for (const evaluator of evaluators) {
				if (yield evaluator(thing)) {
					if (NONE) return false;
					else if (ANY) return true;
					else if (ONE && seenTrue) return false;
					seenTrue = true;
				} else {
					if (ALL) return false;
				}
			}

			if (NONE) return true;
			else if (ANY) return false;
			else if (ONE) return seenTrue;
			else if (ALL) return true;
		});
	}

	hasType(type: *) { return super.hasType(type) || this._cases.some(v => v.hasType(type)); }
	evaluate(thing: *) { return this.value(thing); }

	onObserve() {
		return this._cases.map(v => v.observe(this)).some(v => v);
	}
}

const falseConditions = { type: 'false' };
const trueConditions = { type: 'true' };
const inertConditions = { type: 'inert' };

type GroupConditions = { type: string, op: 'none' | 'any' | 'one' | 'all', of: Array<BuilderValue> };

/* eslint-disable no-redeclare, no-unused-vars */
declare function resolveGroup(GroupConditions, boolean, true): GroupConditions;
declare function resolveGroup(GroupConditions, ?boolean, ?boolean): BuilderValue;

export function resolveGroup({ op, of }: GroupConditions, precompute: boolean = true, keepGroup: boolean = false) {
	const parts = [];
	const groupOpMap = {};
	let seenTrue = false;

	for (let v of of) {
		if (!has(v.type)) return inertConditions;

		if (v.type === 'group') v = resolveGroup(v, precompute);

		// Some groups can be merged
		if (v.type === 'group' && ['any', 'all', 'none'].includes(v.op)) {
			if (['any', 'all'].includes(v.op) && (v.op === op || v.of.length <= 1)) {
				parts.push(...v.of);
				continue;
			}

			const opCollection = groupOpMap[v.op];
			if (opCollection) {
				opCollection.of.push(...v.of);
				continue;
			} else {
				groupOpMap[v.op] = v;
			}
		}

		if (!keepGroup && precompute && !available[v.type].prototype.evaluate.length) {
			// Otherwise they only needs to be evaluated once in order to determine their impact
			if (Case.fromConditions(v).evaluate()) {
				if (op === 'none') return falseConditions;
				if (op === 'any') return trueConditions;
				if (op === 'one' && seenTrue) return falseConditions;
				seenTrue = true;
			} else {
				if (op === 'all') return falseConditions;
			}
		}

		parts.push(v);
	}

	// Set `op` to `none` since a case has matched already
	if (op === 'one' && seenTrue) op = 'none';

	if (!keepGroup) {
		// Single cases can be released
		if (parts.length === 1) {
			const p = parts[0];

			if (op === 'none' && p.type === 'group') {
				if (p.op === 'none') {
					p.op = 'any';
					return p;
				} else if (p.op === 'any') {
					p.op = 'none';
					return p;
				}
			}

			if (op !== 'none') {
				return p;
			}
		}

		// Empty groups can be resolved
		if (!parts.length) {
			if (op === 'none') return trueConditions;
			if (op === 'any') return falseConditions;
			if (op === 'one') return falseConditions;
			if (op === 'all') return trueConditions;
		}
	}

	const sortedParts = _.sortBy(parts, ({ type }) => available[type].slow);

	return { type: 'group', op, of: sortedParts };
}
/* eslint-enable no-redeclare, no-unused-vars */

export function getConditions(type: string, conditions?: ?{}): BuilderValue {
	return { type, ...available[type].defaultConditions, ...conditions };
}

export function getGroup(op: *, of: *): GroupConditions {
	return getConditions('group', { op, of });
}

export function createAdHoc(type: string, getConditions: () => *, variant: *, context: *) {
	class AdHoc extends Case {
		static text = type;

		// Generate new conditions each time in order to avoid caching, as
		// `getConditions` can return updated values, e.g. if a external filter has been removed
		static get defaultConditions(): * { return getConditions(); }

		static unique = true;

		static variant = variant;
	}

	add(type, AdHoc, context);

	return AdHoc;
}

const available: { [type: string]: Class<Case> } = {};

export function add(type: string, c: Class<Case>, ...contexts: Array<'post' | 'comment' | 'browse'>) {
	if (available.hasOwnProperty(type) && c !== available[type]) {
		console.error(`A case named ${type} already exists. Existing:`, available[type].defaultConditions, 'Ignoring:', c.defaultConditions);
		return;
	}

	c.type = type;
	if (!c.contexts) c.contexts = [];
	c.contexts.push(...contexts);
	available[type] = c;
}

const primitives = new Set();

export function populatePrimitives(types: Array<*> = ['post', 'comment', 'browse']) {
	function fill(cases, ...contexts) {
		for (const [k, v] of Object.entries(cases)) {
			add(k, v, ...contexts);
			primitives.add(v);
		}
	}

	fill({
		inert: Inert,
		false: False,
		true: True,
	});

	fill({ group: Group }, 'post', 'comment', 'browse');

	if (types.includes('post')) fill(postCases, 'post');
	if (types.includes('comment')) fill(commentCases, 'comment');
	if (types.includes('browse')) fill(browseCases, 'browse');
}

export function filterThings(things: *, conditions: *) {
	if (!conditions) return things;
	const cased = Case.fromConditions(conditions);
	return asyncFilter(things, /*:: async */ thing => cased.evaluate(thing));
}

export const remove = (type: string) => { delete available[type]; };
export const has = (type: string) => available.hasOwnProperty(type);
export const get = (type: string) => has(type) ? available[type] : Inert;
export const getByContext = (context: *, primitivesOnly: boolean = true) =>
	_.pickBy(available, v => v.contexts.includes(context) && (!primitivesOnly || primitives.has(v)));
export const isUseful = (type: ?string) => typeof type === 'string' && has(type) && ![Inert.type, False.type, True.type].includes(type);
