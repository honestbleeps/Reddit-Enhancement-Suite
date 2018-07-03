/* @flow */

import moment from 'moment';
import { Case } from '../Case';

const options = [
	['before', '<'],
	['on or after', '>='],
];

export class Date extends Case {
	static text = 'Date';

	static defaultConditions = { op: '<', date: moment().add(1, 'M').format('Y-M-D') };
	static fields = ['today is ', { type: 'select', options, id: 'op' }, ' ', { type: 'text', id: 'date' }];

	value = { op: this.conditions.op, date: moment(this.conditions.date) };

	isValid() { return this.value.date.isValid(); }

	evaluate() {
		const now = moment();
		if (this.value.op === '<') {
			return now.isBefore(this.value.date);
		} else if (this.value.op === '>=') {
			return now.isSameOrAfter(this.value.date);
		} else {
			return false;
		}
	}
}
