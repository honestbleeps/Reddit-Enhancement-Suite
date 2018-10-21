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

	trueText = `score ${prettyOperator(this.conditions.op)} ${this.conditions.val}`;
	falseText = `score ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val}`;

	isValid() { return Number.isInteger(this.value.val); }

	evaluate(thing: *) {
		const score = thing.getScore();
		if (isNaN(score)) return null;
		return numericalCompare(this.value.op, score, this.value.val);
	}
}
