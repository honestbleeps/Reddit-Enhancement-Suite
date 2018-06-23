/* @flow */

import { Case } from '../Case';

export class PostAfter extends Case {
	static text = 'Post after';

	static parseCriterion(input: *) { return { patt: input }; }
	static thingToCriterion(thing: *) { return thing.getTimestamp().toISOString(); }

	static defaultConditions = { patt: (new Date()).toISOString() };
	static fields = ['posted after date ', { type: 'text', id: 'patt' }];

	static pattern = 'Date — string representing a RFC2822 or ISO 8601 date';

	trueText = `after ${this.conditions.patt}`;

	getValue(conditions: *) {
		return new Date(conditions.patt);
	}

	validator() { return !isNaN(this.value); }

	evaluate(thing: *) {
		const postTime = thing.getTimestamp();
		return !!postTime && postTime >= this.value;
	}
}
