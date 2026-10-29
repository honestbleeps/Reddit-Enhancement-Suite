/* @flow */

import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

const options = [
	['upvoted', 'upvote'],
	['downvoted', 'downvote'],
	['not voted', 'unvoted'],
];

export class VoteType extends Case {
	static text = 'Vote type';

	static parseCriterion(input: any): CaseConditions { return { kind: input }; }

	static defaultConditions: CaseConditions = { kind: 'unvoted' };
	static fields: CaseFields = ['post is ', { type: 'select', id: 'kind', options }, ' by me'];

	static pattern: string = `(${options.map(([, cls]) => cls).join('|')})`;

	trueText: ?string = (options.find(([, cls]) => cls === this.conditions.kind) || [])[0];

	isValid(): boolean { return options.map(([, cls]) => cls).includes(this.value.kind); }

	evaluate(thing: any): null | boolean {
		switch (this.value.kind) {
			case 'upvote': return thing.isUpvoted();
			case 'downvote': return thing.isDownvoted();
			case 'unvoted': return thing.isUnvoted();
			default: throw new Error('Invalid option');
		}
	}
}
