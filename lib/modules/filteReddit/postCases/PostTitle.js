/* @flow */

import { Case } from '../Case';

export class PostTitle extends Case {
	static text = 'Post title';

	static parseCriterion(input: *) { return { patt: input }; }

	static defaultConditions = { patt: '' };
	static fields = ['post\'s title contains ', { type: 'text', id: 'patt' }];
	static reconcilable = true;

	static pattern = 'RegEx';

	trueText = `title contains ${this.conditions.patt}`;

	getValue(conditions: *) {
		return Case.buildRegex(conditions.patt, { fullMatch: false });
	}

	evaluate(thing: *, values: * = [this.value]) {
		const title = thing.getTitle();
		return values.some(v => v.test(title));
	}
}
