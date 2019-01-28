/* @flow */

import { PatternCase } from '../Case';

export class LinkFlair extends PatternCase {
	static text = 'Link flair';

	static thingToCriterion(thing: *) { return thing.getPostFlairText(); }

	static fields = ['post has link flair matching ', { type: 'text', id: 'patt' }];

	static pattern = '[RegEx]';

	trueText = `link flair ${this.conditions.patt}`.trim();

	evaluate(thing: *) {
		const text = thing.getPostFlairText();
		return this.value.some(v => v.test(text));
	}
}
