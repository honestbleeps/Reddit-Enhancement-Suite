/* @flow */

import { Case } from '../Case';

const options = [
	['upvoted', 'upvote'],
	['downvoted', 'downvote'],
	['not voted', 'unvoted'],
];

export class VoteType extends Case {
	static text = 'Vote type';

	static parseCriterion(input: *) { return { kind: input }; }

	static defaultConditions = { kind: 'unvoted' };
	static fields = ['post is ', { type: 'select', id: 'kind', options }, ' by me'];

	static pattern = `(${options.map(([, cls]) => cls).join('|')})`;

	trueText = (options.find(([, cls]) => cls === this.conditions.kind) || [])[0];

	validator() { return options.map(([, cls]) => cls).includes(this.value.kind); }

	evaluate(thing: *) {
		switch (this.value.kind) {
			case 'upvote': return thing.isUpvoted();
			case 'downvote': return thing.isDownvoted();
			case 'unvoted': return thing.isUnvoted();
			default: return false;
		}
	}
}
