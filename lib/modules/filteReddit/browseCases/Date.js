/* @flow */

import { dayjs } from '../../../utils/localization';
import { Case } from '../Case';

const options = [
	['before', '<'],
	['on or after', '>='],
];

export class Date extends Case {
	static text = 'Date';

	static defaultConditions = { op: '<', date: '2020-12-30' };
	static fields = ['today is ', { type: 'select', options, id: 'op' }, ' ', { type: 'text', id: 'date' }];

	value = { op: this.conditions.op, date: dayjs(this.conditions.date) };

	isValid() { return this.value.date.isValid(); }

	evaluate() {
		return (this.value.op === '<') === dayjs().isBefore(this.value.date);
	}
}
