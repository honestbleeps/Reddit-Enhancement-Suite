/* @flow */

import { Case } from '../Case';

const options = [
	['link post', 'link'],
	['self post', 'self'],
];

export class PostType extends Case {
	static text = 'Post type';

	static parseCriterion(input: *) { return { kind: input }; }

	static defaultConditions = { kind: 'link' };
	static fields = ['post is a ', { type: 'select', id: 'kind', options }];

	static pattern = `(${options.map(([, cls]) => cls).join('|')})`;

	trueText = `type ${this.value.kind}`;
	falseText = `¬ type ${this.value.kind}`;

	validator() { return options.map(([, cls]) => cls).includes(this.value.kind); }

	evaluate(thing: *) {
		switch (this.value.kind) {
			case 'link': return thing.isLinkPost();
			case 'self': return thing.isSelfPost();
			default: return false;
		}
	}
}
