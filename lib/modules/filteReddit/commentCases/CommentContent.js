/* @flow */

import { PatternCase } from '../Case';

export class CommentContent extends PatternCase {
	static text = 'Comment content';

	static parseCriterion(input: *) { return { patt: input }; }

	static fields = ['comment contains ', { type: 'text', id: 'patt' }, ', ', { type: 'select', id: 'quotes', options: ['including', 'excluding'] }, ' quotes'];

	trueText = `comment contains ${this.conditions.patt}`;

	value = this.build(false);

	evaluate(thing: *) {
		const text = thing.getCommentText(this.conditions.quotes === 'including');
		return this.value.some(v => v.test(text));
	}
}
