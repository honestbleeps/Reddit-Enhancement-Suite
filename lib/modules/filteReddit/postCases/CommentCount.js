/* @flow */

import { Case } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

export class CommentCount extends Case {
	static text = 'Comment count';

	static parseCriterion(input: *) { return { op: '>=', val: parseInt(input, 10) }; }
	static thingToCriterion(thing: *) { return String(thing.getCommentCount()); }

	static defaultConditions = { op: '>', val: 0 };
	static fields = ['post has ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' comments'];

	static pattern = 'integer';

	trueText = `comment count ${prettyOperator(this.value.op)} ${this.value.val}`;
	falseText = `comment count ${prettyOperator(inverseOperator(this.value.op))} ${this.value.val}`;

	validator() { return Number.isInteger(this.value.val); }

	evaluate(thing: *) {
		const commentCount = thing.getCommentCount();
		return isNaN(commentCount) ? false : numericalCompare(this.value.op, commentCount, this.value.val);
	}
}
