/* @flow */

import _ from 'lodash';
import { asyncFilter, fastAsync, randomHash } from '../../utils';
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
	static slow = 1; // May be considerably slower depending on children

	_cases = this.conditions.of.map(v => Case.fromConditions(v));

	// TODO This is unnecessary for some external filters
	trueText = this._cases.length && this.toCriterion(this.conditions.op, this._cases) || 'empty group';

	toCriterion(op: *, cases: *) {
		const symbol = (op === 'any' || op === 'none') && '∨' || op === 'one' && '⊕' || '∧';
		let str = cases.map(v => v.trueText).join(` ${symbol} `);
		if (cases.length > 1) str = `(${str})`;
		return op === 'none' ? `¬ ${str}` : str;
	}

	isValid() { return this._cases.every(v => v.isValid()); }

	value = (() => {
		const op = this.conditions.op;
		const [NONE, ANY, ONE, ALL] = [op === 'none', op === 'any', op === 'one', op === 'all'];

		const evaluators = this._cases
			.sort((a, b) => a.constructor.slow - b.constructor.slow)
			.map(cased => cased.evaluate.bind(cased));

		return fastAsync(function*(thing) {
			let seenTrue = false;

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
			else /* if (ALL) */ return true;
		});
	})();

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

export function resolveGroup(initial: GroupConditions, precompute: boolean = true, keepGroup: boolean = false) {
	let seenTrue = false;

	let of = [];
	let op = initial.op;

	for (let v of initial.of) {
		if (!has(v.type)) {
			console.error(`Type ${v.type} is not available`);
			return inertConditions;
		}

		if (v.type === 'group') v = resolveGroup(v, precompute);

		if (
			!keepGroup &&
			precompute &&
			!available[v.type].prototype.evaluate.length
		) {
			// browseCases only needs to be evaluated once in order to determine their impact
			const match = Case.fromConditions(v).evaluate();
			if (typeof match === 'boolean') {
				if (match) {
					if (op === 'none') return falseConditions;
					if (op === 'any') return trueConditions;
					if (op === 'one' && seenTrue) return falseConditions;
					seenTrue = true;
				} else {
					if (op === 'all') return falseConditions;
				}

				continue;
			}
		}

		of.push(v);
	}

	if (op === 'one' && seenTrue) {
		// Set `op` to `none` since a case has matched already
		op = 'none';
	}

	if (!keepGroup) {
		// Single cases can be released
		if (of.length === 1) {
			const p = of[0];

			if (op !== 'none') {
				return p;
			} else if (p.type === 'group') {
				if (p.op === 'none') {
					p.op = 'any';
					return p;
				} else if (p.op === 'any' || p.op === 'all') {
					p.op = 'none';
					return p;
				}
			}
		}

		// Empty groups can be resolved
		if (!of.length) {
			if (op === 'none') return trueConditions;
			if (op === 'any') return falseConditions;
			if (op === 'one') return falseConditions;
			if (op === 'all') return trueConditions;
		}
	}

	if (precompute && (op === 'any' || op === 'none')) {
		const l = of.length;
		const typeSorted = of.sort((a, b) => a.type === b.type ? 0 : a.type > b.type ? 1 : -1);
		of = [];
		for (let i = 0; i < l; i++) { // eslint-disable-line no-restricted-syntax
			const a = typeSorted[i];
			const cls = available[a.type];
			const reconcile = cls.reconcile;
			if (reconcile) {
				const values = [a];
				let b;
				// Look for more cases of same type
				while ((b = typeSorted[i + 1]) && a.type === b.type) {
					i++;
					values.push(b);
				}

				of.push(...reconcile(values));
			} else {
				of.push(a);
			}
		}
	}

	return { type: 'group', op, of };
}
/* eslint-enable no-redeclare, no-unused-vars */

export function getConditions(type: string, conditions?: ?{}): BuilderValue {
	return { type, ...(available[type] && available[type].defaultConditions), ...conditions };
}

export function getGroup(op: *, of: *): GroupConditions {
	return getConditions('group', { op, of });
}

export function createAdHoc(type: string, getConditions: *, variant: *, context: *, customFilter: *) {
	const { opts: { name = type } = {} } = customFilter || {};

	class AdHoc extends Case {
		static text = name;

		// Generate new conditions each time in order to avoid caching, as
		// `getConditions` can return updated values, e.g. if a external filter has been removed
		static get defaultConditions(): * { return getConditions(); }

		static unique = true;

		static variant = variant;

		static _customFilter = customFilter;
	}

	add(type, AdHoc, context);

	// `add`'s auto-rename functionality might cause breakage
	if (type !== AdHoc.type) console.warn('Type name was changed from', name, 'to', AdHoc.type);

	return AdHoc;
}

const available: { [type: string]: Class<Case> } = {};

function getUniqueTypeName(name: any): string {
	if (typeof name !== 'string') name = '';
	while (!name || has(name)) {
		// Make sure filter has an unique name
		name += randomHash();
	}

	return name;
}

export function add(type: ?string, c: Class<Case>, ...contexts: Array<'post' | 'comment' | 'browse'>) {
	if (!type || (available.hasOwnProperty(type) && c !== available[type])) {
		type = getUniqueTypeName(type);
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
