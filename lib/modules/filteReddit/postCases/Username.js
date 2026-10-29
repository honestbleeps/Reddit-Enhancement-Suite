/* @flow */

import { PatternCase } from '../Case';
import type { CaseFields } from '../Case';

export class Username extends PatternCase {
	static text = 'Username';

	static thingToCriterion(thing: any): string { return thing.getAuthor(); }

	static fields: CaseFields = ['posted by /u/', { type: 'text', id: 'patt' }];

	trueText: string = `by ${this.conditions.patt}`;

	value: Array<RegExp> = this.build(true);

	evaluate(thing: any): null | boolean {
		const user = thing.getAuthor();
		if (!user) return null;
		return this.value.some(v => v.test(user));
	}
}
