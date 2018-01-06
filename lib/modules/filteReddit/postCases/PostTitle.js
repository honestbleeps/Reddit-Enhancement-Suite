/* @flow */

import { Case } from '../Case';

export class PostTitle extends Case {
	static text = 'Post title';

	static parseCriterion(input: *) { return { patt: input }; }

	static defaultConditions = { patt: '' };
	static fields = ['post\'s title contains ', { type: 'text', id: 'patt' }];
	static reconcilable = true;

	static pattern = 'RegEx';

	constructor(conditions: *) {
		super(Case.buildRegex(conditions.patt, { fullMatch: false }));
		this.trueText = `title contains ${conditions.patt}`;
		this.falseText = `¬ title contains ${conditions.patt}`;
	}

	evaluate(thing: *, values: * = [this.value]) {
		const title = thing.getTitle();
		return values.some(v => v.test(title));
	}
}
