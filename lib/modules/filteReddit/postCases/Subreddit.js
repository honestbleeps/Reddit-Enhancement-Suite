/* @flow */

import { Case } from '../Case';

export class Subreddit extends Case {
	static text = 'Subreddit';

	static thingToCriterion(thing: *) { return thing.getSubreddit(); }
	static parseCriterion(input: string) { return { patt: input }; }

	static defaultConditions = { patt: '' };
	static fields = ['posted in /r/', { type: 'text', id: 'patt' }];
	static reconcilable = true;

	static pattern = 'RegEx';

	constructor(conditions: *) {
		super(Case.buildRegex(conditions.patt));
		this.trueText = `in ${conditions.patt}`;
		this.falseText = `¬ in ${conditions.patt}`;
	}

	evaluate(thing: *, values: * = [this.value]) {
		const subreddit = thing.getSubreddit();
		return !!subreddit && values.some(v => v.test(subreddit));
	}
}
