/* @flow */

import { PatternCase } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class CommentContent extends PatternCase {
	static text = 'Comment content';

	static parseCriterion(input: any): CaseConditions { return { patt: input }; }

	static fields: CaseFields = ['comment contains ', { type: 'text', id: 'patt' }];

	trueText: string = `comment contains ${this.conditions.patt}`;

	value: Array<RegExp> = this.build(false);

	evaluate(thing: any): null | boolean {
		const body = thing.getTextBody();
		if (!body) return null;
		return this.value.some(v => v.test(body.textContent));
	}
}
