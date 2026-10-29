/* @flow */

import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';
import * as Modules from '../../../core/modules';
import * as N from '../../newCommentCount';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class NewCommentCount extends Case {
	static text = 'New comment count';

	static parseCriterion(input: any): CaseConditions { return { op: '>=', val: parseInt(input, 10) }; }
	static async thingToCriterion(thing: any): Promise<string> { return String((await N.hasEntry(thing) ? await N.getNewCount(thing) : thing.getCommentCount()) || 0); }

	static defaultConditions: CaseConditions = { op: '>', val: 0 };
	static fields: CaseFields = ['has ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' new comments'];

	static slow = 1;
	static get disabled(): boolean {
		return !Modules.isEnabled(N);
	}

	static pattern = 'integer';

	trueText: string = `new comments ${prettyOperator(this.conditions.op)} ${this.conditions.val}`;
	falseText: string = `new comments ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val}`;

	isValid(): boolean { return parseInt(this.value.val, 10) >= 0; }

	async evaluate(thing: any): Promise<null | boolean> {
		const newCount = await N.getNewCount(thing);
		const count = typeof newCount === 'number' ? newCount : thing.getCommentCount();
		return numericalCompare(this.value.op, count, this.value.val);
	}
}
