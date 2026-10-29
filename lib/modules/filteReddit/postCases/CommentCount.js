/* @flow */

import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

export class CommentCount extends Case {
	static text = 'Comment count';

	static parseCriterion(input: any): CaseConditions { return { op: '>=', val: parseInt(input, 10) }; }
	static thingToCriterion(thing: any): string { return String(thing.getCommentCount() || 0); }

	static defaultConditions: CaseConditions = { op: '>', val: 0 };
	static fields: CaseFields = ['post has ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' comments'];

	static pattern = 'integer';

	trueText: string = `comment count ${prettyOperator(this.conditions.op)} ${this.conditions.val}`;
	falseText: string = `comment count ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val}`;

	isValid(): boolean { return Number.isInteger(this.value.val); }

	evaluate(thing: any): null | boolean {
		const commentCount = thing.getCommentCount();
		if (isNaN(commentCount)) return null;
		return numericalCompare(this.value.op, commentCount, this.value.val);
	}
}
