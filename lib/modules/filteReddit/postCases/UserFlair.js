/* @flow */

import { Case } from '../Case';

export class UserFlair extends Case {
	static text = 'User flair';

	static parseCriterion(input: *) { return { patt: input }; }
	static thingToCriterion(thing: *) { return thing.getUserFlairText(); }

	static defaultConditions = { patt: '' };
	static fields = ['author of this post has flair matching ', { type: 'text', id: 'patt' }];
	static reconcile = Case.reconcileRegEx;

	static pattern = '[RegEx]';

	trueText = `user flair ${this.conditions.patt}`.trim();

	value = Case.buildRegex(this.conditions.patt || '/./');

	evaluate(thing: *, values: * = [this.value]) {
		const text = thing.getUserFlairText();
		return values.some(v => v.test(text));
	}
}
