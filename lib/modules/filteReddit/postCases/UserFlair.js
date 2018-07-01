/* @flow */

import { Case } from '../Case';

export class UserFlair extends Case {
	static text = 'User flair';

	static parseCriterion(input: *) { return { patt: input }; }
	static thingToCriterion(thing: *) { return thing.getUserFlairText(); }

	static defaultConditions = { patt: '' };
	static fields = ['author of this post has flair matching ', { type: 'text', id: 'patt' }];
	static reconcilable = true;

	static pattern = '[RegEx]';

	trueText = `user flair ${this.conditions.patt}`.trim();

	getValue(conditions: *) {
		return Case.buildRegex(conditions.patt || '/./');
	}

	evaluate(thing: *, values: * = [this.value]) {
		const text = thing.getUserFlairText();
		return values.some(v => v.test(text));
	}
}
