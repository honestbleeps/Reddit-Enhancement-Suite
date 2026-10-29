/* @flow */

import { PatternCase } from '../Case';
import type { CaseFields } from '../Case';
import { Tag } from '../../userTagger';

export class UserTag extends PatternCase {
	static text = 'User tag';

	static async thingToCriterion(thing: any): Promise<string> {
		const author = thing.getAuthor();
		return author && (await Tag.get(author)).text || '';
	}

	static fields: CaseFields = ['author of this post has tag matching ', { type: 'text', id: 'patt' }];

	static pattern = '[RegEx]';

	trueText: string = `user tag ${this.conditions.patt}`.trim();

	value: Array<RegExp> = this.build(true, '/./');

	async evaluate(thing: any): Promise<null | boolean> {
		const author = thing.getAuthor();
		if (!author) return null;
		const tag = (await Tag.get(author)).text;
		return tag ? this.value.some(v => v.test(tag)) : false;
	}
}
