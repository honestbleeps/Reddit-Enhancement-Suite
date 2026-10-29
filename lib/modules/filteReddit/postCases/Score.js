/* @flow */

import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

export class Score extends Case {
	static text = 'Score';

	static defaultConditions: CaseConditions = { op: '>', val: 0 };
	static fields: CaseFields = ['post has ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' points'];

	static parseCriterion(input: any): CaseConditions { return { op: '>=', val: parseInt(input, 10) }; }
	static thingToCriterion(thing: any): string { return String(thing.getScore()); }

	static pattern = 'integer';

	trueText: string = `score ${prettyOperator(this.conditions.op)} ${this.conditions.val}`;
	falseText: string = `score ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val}`;

	isValid(): boolean { return Number.isInteger(this.value.val); }

	evaluate(thing: any): null | boolean {
		const score = thing.getScore();
		if (isNaN(score)) return null;
		return numericalCompare(this.value.op, score, this.value.val);
	}
}
