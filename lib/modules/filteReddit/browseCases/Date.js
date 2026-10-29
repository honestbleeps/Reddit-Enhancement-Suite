/* @flow */

import { dayjs } from '../../../utils/localization';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

const options = [
	['before', '<'],
	['on or after', '>='],
];

export class Date extends Case {
	static text = 'Date';

	static defaultConditions: CaseConditions = { op: '<', date: '2020-12-30' };
	static fields: CaseFields = ['today is ', { type: 'select', options, id: 'op' }, ' ', { type: 'text', id: 'date' }];

	value: { op: string, date: any } = { op: this.conditions.op, date: dayjs(this.conditions.date) };

	isValid(): boolean { return this.value.date.isValid(); }

	evaluate(): null | boolean {
		return (this.value.op === '<') === dayjs().isBefore(this.value.date);
	}
}
