/* @flow */

import { PatternCase } from '../Case';
import type { CaseFields } from '../Case';

export class Subreddit extends PatternCase {
	static text = 'Subreddit';

	static thingToCriterion(thing: any): string { return thing.getSubreddit(); }

	static fields: CaseFields = ['posted in /r/', { type: 'text', id: 'patt' }];

	trueText: string = `in ${this.conditions.patt}`;

	value: Array<RegExp> = this.build(true);

	evaluate(thing: any): null | boolean {
		const subreddit = thing.getSubreddit();
		if (!subreddit) return null;
		return this.value.some(v => v.test(subreddit));
	}
}
