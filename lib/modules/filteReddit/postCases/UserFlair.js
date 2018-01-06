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

	constructor(conditions: *) {
		super(Case.buildRegex(conditions.patt || '/./'));
		this.trueText = `user flair ${conditions.patt}`.trim();
		this.falseText = `¬ user flair ${conditions.patt}`.trim();
	}

	evaluate(thing: *, values: * = [this.value]) {
		const text = thing.getUserFlairText();
		return values.some(v => v.test(text));
	}
}
