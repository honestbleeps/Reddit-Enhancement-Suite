/* @flow */

import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';
import * as Modules from '../../../core/modules';
import * as N from '../../newCommentCount';
import { Case } from '../Case';

export class NewCommentCount extends Case {
	static text = 'New comment count';

	static parseCriterion(input: *) { return { op: '>=', val: parseInt(input, 10) }; }
	static async thingToCriterion(thing: *) { return String((await N.hasEntry(thing) ? await N.getNewCount(thing) : thing.getCommentCount()) || 0); }

	static defaultConditions = { op: '>', val: 0 };
	static fields = ['has ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' new comments since last opened'];

	static slow = 1;
	static get disabled(): boolean {
		return !Modules.isRunning(N);
	}

	static unique = true;
	static pattern = 'integer';

	trueText = `new comments ${prettyOperator(this.value.op)} ${this.value.val}`;
	falseText = `new comments ${prettyOperator(inverseOperator(this.value.op))} ${this.value.val}`;

	validator() { return parseInt(this.value.val, 10) >= 0; }

	async evaluate(thing: *) {
		const count = (await N.hasEntry(thing) ? await N.getNewCount(thing) : thing.getCommentCount()) || 0;
		return numericalCompare(this.value.op, count, this.value.val);
	}
}
