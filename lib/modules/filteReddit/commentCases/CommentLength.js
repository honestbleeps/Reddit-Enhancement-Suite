/* @flow */

import { Case } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

const options = ['characters', 'words'];

export class CommentLength extends Case {
	static text = 'Comment length';

	static parseCriterion(input: *) { return { op: '>=', kind: 'words', val: parseInt(input, 10) }; }

	static fields = ['comment length is ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' ', { type: 'select', id: 'kind', options }];
	static defaultConditions = { op: '>', kind: 'words', val: 0 };

	static pattern = 'integer';

	trueText = `length ${prettyOperator(this.conditions.op)} ${this.conditions.val} ${this.conditions.kind}`;
	falseText = `length ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val} ${this.conditions.kind}`;

	isValid() { return Number.isInteger(this.value.val); }

	evaluate(thing: *) {
		const md = thing.entry.querySelector('.md');
		if (!md) return null;
		switch (this.value.kind) {
			case 'characters': return numericalCompare(this.value.op, md.textContent.length, this.value.val);
			case 'words': return numericalCompare(this.value.op, md.textContent.split(' ').length, this.value.val);
			default: throw new Error('Invalid option');
		}
	}
}
