/* @flow */

import { PatternCase } from '../Case';

export class Subreddit extends PatternCase {
	static text = 'Subreddit';

	static thingToCriterion(thing: *) { return thing.getSubreddit(); }

	static fields = ['posted in /r/', { type: 'text', id: 'patt' }];

	trueText = `in ${this.conditions.patt}`;

	evaluate(thing: *) {
		const subreddit = thing.getSubreddit();
		if (!subreddit) return null;
		return this.value.some(v => v.test(subreddit));
	}
}
