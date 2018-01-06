/* @flow */

import { Case } from '../Case';

export class CommentContent extends Case {
	static text = 'Comment content';

	static parseCriterion(input: *) { return { patt: input }; }

	static defaultConditions = { patt: '' };
	static fields = ['comment contains ', { type: 'text', id: 'patt' }];
	static reconcilable = true;

	static pattern = 'RegEx';

	constructor(conditions: *) {
		super(Case.buildRegex(conditions.patt, { fullMatch: false }));
		this.trueText = `comment contains ${conditions.patt}`;
		this.falseText = `¬ comment contains ${conditions.patt}`;
	}

	evaluate(thing: *, values: * = [this.value]) {
		const md = thing.entry.querySelector('.md');
		return !!md && values.some(v => v.test(md.textContent));
	}
}
