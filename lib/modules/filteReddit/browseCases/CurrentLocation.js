/* @flow */

import { fullLocation } from '../../../utils';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class CurrentLocation extends Case {
	static text = 'When browsing in location';

	static defaultConditions: CaseConditions = { patt: fullLocation() };
	static fields: CaseFields = ['when browsing ', { type: 'text', id: 'patt' }];

	evaluate(): null | boolean {
		return fullLocation() === this.value.patt;
	}
}
