/* @flow */

import { PatternCase } from '../Case';
import { Tag } from '../../userTagger';

export class UserTag extends PatternCase {
	static text = 'User tag';

	static async thingToCriterion(thing: *) {
		const author = thing.getAuthor();
		return author && (await Tag.get(author)).text || '';
	}

	static fields = ['author of this post has tag matching ', { type: 'text', id: 'patt' }];

	static pattern = '[RegEx]';

	trueText = `user tag ${this.conditions.patt}`.trim();

	value = this.build(true, '/./');

	async evaluate(thing: *) {
		const author = thing.getAuthor();
		if (!author) return null;
		const tag = (await Tag.get(author)).text;
		return tag ? this.value.some(v => v.test(tag)) : false;
	}
}
