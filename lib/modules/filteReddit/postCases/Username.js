/* @flow */

import { Case } from '../Case';

export class Username extends Case {
	static text = 'Username';

	static parseCriterion(input: *) { return { patt: input }; }
	static thingToCriterion(thing: *) { return thing.getAuthor(); }

	static defaultConditions = { patt: '' };
	static fields = ['posted by /u/', { type: 'text', id: 'patt' }];
	static reconcilable = true;

	static pattern = 'RegEx';

	trueText = `by ${this.value}`;
	falseText = `¬ by ${this.value}`;

	constructor(conditions: *) {
		super(Case.buildRegex(conditions.patt));
	}

	evaluate(thing: *, values: * = [this.value]) {
		const user = thing.getAuthor();
		return !!user && values.some(v => v.test(user));
	}
}
