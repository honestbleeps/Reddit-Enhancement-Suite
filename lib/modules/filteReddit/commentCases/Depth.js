/* @flow */

import { Case } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

export class Depth extends Case {
	static text = 'Comment depth';

	static parseCriterion(input: *) { return { op: '==', val: parseInt(input, 10) }; }
	static thingToCriterion(thing: *) { return String(thing.getParents().length); }

	static defaultConditions = { op: '>', val: 0 };
	static fields = ['comment\'s depth ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }];

	static pattern = 'integer';

	trueText = `depth ${prettyOperator(this.conditions.op)} ${this.conditions.val}`;
	falseText = `depth ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val}`;

	isValid() { return this.value.val >= 0; }

	evaluate(thing: *) {
		const depth = thing.getParents().length;
		return isNaN(depth) ? false : numericalCompare(this.value.op, depth, this.value.val);
	}
}
