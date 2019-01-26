/* @flow */

import { Case } from '../Case';

export class CommentContent extends Case {
	static text = 'Comment content';

	static parseCriterion(input: *) { return { patt: input }; }

	static defaultConditions = { patt: '' };
	static fields = ['comment contains ', { type: 'text', id: 'patt' }];
	static reconcile = Case.reconcileRegEx;

	static pattern = 'RegEx';

	trueText = `comment contains ${this.conditions.patt}`;

	value = Case.buildRegex(this.conditions.patt, { fullMatch: false });

	evaluate(thing: *, values: * = [this.value]) {
		const body = thing.getTextBody();
		if (!body) return null;
		return values.some(v => v.test(body.textContent));
	}
}
