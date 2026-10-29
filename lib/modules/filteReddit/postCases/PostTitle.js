/* @flow */

import { PatternCase } from '../Case';
import type { CaseFields } from '../Case';

export class PostTitle extends PatternCase {
	static text = 'Post title';

	static fields: CaseFields = ['post\'s title contains ', { type: 'text', id: 'patt' }];

	trueText: string = `title contains ${this.conditions.patt}`;

	value: Array<RegExp> = this.build(false);

	evaluate(thing: any): null | boolean {
		const title = thing.getTitle();
		return this.value.some(v => v.test(title));
	}
}
