/* @flow */

import { PatternCase } from '../Case';
import type { CaseFields } from '../Case';

export class UserFlair extends PatternCase {
	static text = 'User flair';

	static thingToCriterion(thing: any): string { return thing.getUserFlairText(); }

	static fields: CaseFields = ['author of this post has flair matching ', { type: 'text', id: 'patt' }];

	static pattern = '[RegEx]';

	trueText: string = `user flair ${this.conditions.patt}`.trim();

	value: Array<RegExp> = this.build(false, '/./');

	evaluate(thing: any): null | boolean {
		const text = thing.getUserFlairText();
		return this.value.some(v => v.test(text));
	}
}
