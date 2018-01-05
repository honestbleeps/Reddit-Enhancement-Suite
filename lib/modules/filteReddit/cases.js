/* @flow */

import _ from 'lodash';
import { fastAsync } from '../../utils';
import { Case } from './Case';
import * as postCases from './postCases';
import * as browseCases from './browseCases';

export class Inert extends Case {
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
		{ type: 'hidden', id: 'name' },
	];

	static +defaultConditions = { op: 'all', of: [], name: '' };
	static slow = 1;

	_cases = [];

	validator() { return this._cases.every(v => v.validate()); }

	constructor({ op, of, name }: *) {
		const [NONE, ANY, ONE, ALL] = [op === 'none', op === 'any', op === 'one', op === 'all'];

		const evaluators = [];
		let seenTrue = false;

		super(fastAsync(function*(thing) {
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
			else if (ONE && seenTrue) return true;
			else if (ALL) return true;
		}));

		const cases = of
			.map(Case.fromConditions.bind(Case))
			.sort(({ constructor: a }, { constructor: b }) => Number(a !== b));

		const l = cases.length;
		for (let i = 0; i < l; i++) { // eslint-disable-line no-restricted-syntax
			const caseA = cases[i];
			if (caseA instanceof Inert) return new Inert();
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

		if (name) {
			this.trueText = name.toLowerCase();
			this.falseText = `¬ ${name.toLowerCase()}`;
		}
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

export function resolveGroup({ op, of, name = '' }: any, precompute: boolean = true, keepGroup: boolean = false) {
	const parts = [];
	const groupOpMap = {};
	let seenTrue = false;

	for (let v of of) {
		if (!has(v.type)) return inertConditions;

		if (v.type === 'group') v = resolveGroup(v, precompute);

		// Some groups can be merged
		if (v.type === 'group' && ['any', 'all', 'none'].includes(v.op)) {
			if (v.op === op) {
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

		if (!precompute) {
			parts.push(v);
			continue;
		}

		// All Thing-context dependent cases must be evaluated
		if (available[v.type].prototype.evaluate.length) {
			parts.push(v);
			continue;
		}

		if (keepGroup) continue;

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

	// Set `op` to `none` since a case has matched already
	if (op === 'one' && seenTrue) op = 'none';

	// Single cases can be released
	if (!keepGroup && parts.length === 1 && op !== 'none' && !name) return parts[0];

	const sortedParts = _.sortBy(parts, ({ type }) => available[type].slow);

	return { type: 'group', op, of: sortedParts, name };
}

export function getConditions(type: string, conditions?: ?{}) {
	return { type, ...available[type].defaultConditions, ...conditions };
}

export function getGroup(op: string, of: Array<*>, name: ?string = '') {
	return getConditions('group', { op, of, name });
}

export function createAdHoc(type: string, getConditions: () => *, variant: *, context: *) {
	class AdHoc extends Case {
		static text = type;
		// Generate new conditions each time in order to avoid caching, as
		// `getConditions` can return different values, e.g. if a external filter has been removed
		static get defaultConditions(): * { return getConditions(); }
		static unique = true;
		static variant = variant;
	}

	add(type, AdHoc, context);

	return AdHoc;
}

const available: { [type: string]: Class<Case> } = {};

export function add(type: *, c: Class<Case>, ...contexts: Array<'post' | 'browse'>) {
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

export function populatePrimitives(types: Array<*> = ['post', 'browse']) {
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

	fill({ group: Group }, 'post', 'browse');

	if (types.includes('post')) fill(postCases, 'post');
	if (types.includes('browse')) fill(browseCases, 'browse');
}

export const remove = (type: string) => { delete available[type]; };
export const has = (type: string) => available.hasOwnProperty(type);
export const get = (type: string) => has(type) ? available[type] : Inert;
export const getByContext = (context: *, primitivesOnly: boolean = true) =>
	_.pickBy(available, v => v.contexts.includes(context) && (!primitivesOnly || primitives.has(v)));
export const isUseful = (type: ?string) => typeof type === 'string' && has(type) && ![Inert.type, False.type, True.type].includes(type);
