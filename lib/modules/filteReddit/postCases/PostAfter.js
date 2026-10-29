/* @flow */

import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class PostAfter extends Case {
	static text = 'Post after';

	static parseCriterion(input: any): CaseConditions { return { patt: input }; }
	static thingToCriterion(thing: any): string { return thing.getTimestamp().toISOString(); }

	static defaultConditions: CaseConditions = { patt: (new Date()).toISOString() };
	static fields: CaseFields = ['posted after date ', { type: 'text', id: 'patt' }];

	static pattern = 'Date — string representing a RFC2822 or ISO 8601 date';

	trueText: string = `after ${this.conditions.patt}`;

	value: Date = new Date(this.conditions.patt);

	isValid(): boolean { return !isNaN(this.value); }

	evaluate(thing: any): null | boolean {
		const postTime = thing.getTimestamp();
		if (!postTime) return null;
		return postTime >= this.value;
	}
}
