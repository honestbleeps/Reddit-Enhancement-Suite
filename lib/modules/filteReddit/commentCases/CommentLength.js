/* @flow */

import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

const options = ['characters', 'words'];

export class CommentLength extends Case {
	static text = 'Comment length';

	static parseCriterion(input: any): CaseConditions { return { op: '>=', kind: 'words', val: parseInt(input, 10) }; }

	static fields: CaseFields = ['comment length is ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' ', { type: 'select', id: 'kind', options }];
	static defaultConditions: CaseConditions = { op: '>', kind: 'words', val: 0 };

	static pattern = 'integer';

	trueText: string = `length ${prettyOperator(this.conditions.op)} ${this.conditions.val} ${this.conditions.kind}`;
	falseText: string = `length ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val} ${this.conditions.kind}`;

	isValid(): boolean { return Number.isInteger(this.value.val); }

	evaluate(thing: any): null | boolean {
		const md = thing.entry.querySelector('.md');
		if (!md) return null;
		switch (this.value.kind) {
			case 'characters': return numericalCompare(this.value.op, md.textContent.length, this.value.val);
			case 'words': return numericalCompare(this.value.op, md.textContent.split(' ').length, this.value.val);
			default: throw new Error('Invalid option');
		}
	}
}
