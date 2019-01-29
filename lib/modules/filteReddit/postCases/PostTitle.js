/* @flow */

import { PatternCase } from '../Case';

export class PostTitle extends PatternCase {
	static text = 'Post title';

	static fields = ['post\'s title contains ', { type: 'text', id: 'patt' }];

	trueText = `title contains ${this.conditions.patt}`;

	value = this.build(false);

	evaluate(thing: *) {
		const title = thing.getTitle();
		return this.value.some(v => v.test(title));
	}
}
