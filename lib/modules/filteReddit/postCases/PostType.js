/* @flow */

import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

const options = [
	['link post', 'link'],
	['self post', 'self'],
];

export class PostType extends Case {
	static text = 'Post type';

	static parseCriterion(input: any): CaseConditions { return { kind: input }; }

	static defaultConditions: CaseConditions = { kind: 'link' };
	static fields: CaseFields = ['post is a ', { type: 'select', id: 'kind', options }];

	static pattern: string = `(${options.map(([, cls]) => cls).join('|')})`;

	trueText: string = `type ${this.conditions.kind}`;

	isValid(): boolean { return options.map(([, cls]) => cls).includes(this.value.kind); }

	evaluate(thing: any): null | boolean {
		switch (this.value.kind) {
			case 'link': return thing.isLinkPost();
			case 'self': return thing.isSelfPost();
			default: return null;
		}
	}
}
