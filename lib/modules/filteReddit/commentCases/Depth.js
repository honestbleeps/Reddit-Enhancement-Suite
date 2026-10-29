/* @flow */

import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

export class Depth extends Case {
	static text = 'Comment depth';

	static parseCriterion(input: any): CaseConditions { return { op: '==', val: parseInt(input, 10) }; }
	static thingToCriterion(thing: any): string { return String(thing.getParents().length); }

	static defaultConditions: CaseConditions = { op: '>', val: 0 };
	static fields: CaseFields = ['comment\'s depth ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }];

	static pattern = 'integer';

	trueText: string = `depth ${prettyOperator(this.conditions.op)} ${this.conditions.val}`;
	falseText: string = `depth ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val}`;

	isValid(): boolean { return this.value.val >= 0; }

	evaluate(thing: any): null | boolean {
		const depth = thing.getParents().length;
		return numericalCompare(this.value.op, depth, this.value.val);
	}
}
