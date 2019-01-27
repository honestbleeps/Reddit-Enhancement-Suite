/* @flow */

import { PatternCase } from '../Case';

export class CommentContent extends PatternCase {
	static text = 'Comment content';

	static parseCriterion(input: *) { return { patt: input }; }

	static fields = ['comment contains ', { type: 'text', id: 'patt' }];

	trueText = `comment contains ${this.conditions.patt}`;

	value = PatternCase.build(this.conditions.patt, { fullMatch: false });

	evaluate(thing: *) {
		const body = thing.getTextBody();
		if (!body) return null;
		return this.value.some(v => v.test(body.textContent));
	}
}
