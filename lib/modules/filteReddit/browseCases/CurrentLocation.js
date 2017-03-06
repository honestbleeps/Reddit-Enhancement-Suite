/* @flow */

import { fullLocation } from '../../../utils';
import { Case } from '../Case';

export class CurrentLocation extends Case {
	static text = 'When browsing in location';

	static defaultConditions = { patt: fullLocation() };
	static fields = ['when browsing ', { type: 'text', id: 'patt' }];

	evaluate() {
		return fullLocation() === this.value.patt;
	}
}
