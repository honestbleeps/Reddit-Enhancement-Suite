/* @flow */

import { PatternCase } from '../Case';
import type { CaseFields } from '../Case';

export class LinkFlair extends PatternCase {
	static text = 'Link flair';

	static thingToCriterion(thing: any): string { return thing.getPostFlairText(); }

	static fields: CaseFields = ['post has link flair matching ', { type: 'text', id: 'patt' }];

	static pattern = '[RegEx]';

	trueText: string = `link flair ${this.conditions.patt}`.trim();

	value: Array<RegExp> = this.build(false, '/./');

	evaluate(thing: any): null | boolean {
		const text = thing.getPostFlairText();
		return this.value.some(v => v.test(text));
	}
}
