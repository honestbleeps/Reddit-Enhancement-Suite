/* @flow */

import { Case } from '../Case';

export class Username extends Case {
	static text = 'Username';

	static parseCriterion(input: *) { return { patt: input }; }
	static thingToCriterion(thing: *) { return thing.getAuthor(); }

	static defaultConditions = { patt: '' };
	static fields = ['posted by /u/', { type: 'text', id: 'patt' }];
	static reconcile = Case.reconcileRegEx;

	static pattern = 'RegEx';

	trueText = `by ${this.conditions.patt}`;

	value = Case.buildRegex(this.conditions.patt);

	evaluate(thing: *, values: * = [this.value]) {
		const user = thing.getAuthor();
		if (!user) return null;
		return values.some(v => v.test(user));
	}
}
