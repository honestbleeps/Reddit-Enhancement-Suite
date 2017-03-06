/* @flow */

import { Case } from '../Case';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export class Dow extends Case {
	static text = 'Day of week';

	static defaultConditions = { days: [] };
	static fields = ['current day of the week is ', { type: 'checkset', items: days, id: 'days' }];

	evaluate() {
		const currentDOW = days[new Date().getDay()];
		return this.value.days.includes(currentDOW);
	}
}
