/* @flow */

import { Case } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

export class Score extends Case {
	static text = 'Score';

	static defaultConditions = { op: '>', val: 0 };
	static fields = ['post has ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' points'];

	static parseCriterion(input: *) { return { op: '>=', val: parseInt(input, 10) }; }
	static thingToCriterion(thing: *) { return String(thing.getScore()); }

	static pattern = 'integer';

	trueText = `score ${prettyOperator(this.value.op)} ${this.value.val}`;
	falseText = `score ${prettyOperator(inverseOperator(this.value.op))} ${this.value.val}`;

	validator() { return Number.isInteger(this.value.val); }

	evaluate(thing: *) {
		const score = thing.getScore();
		return isNaN(score) ? false : numericalCompare(this.value.op, score, this.value.val);
	}
}
