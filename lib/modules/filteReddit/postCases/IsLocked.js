/* @flow */

import { Case } from '../Case';
import type { CaseFields } from '../Case';

export class IsLocked extends Case {
	static text = 'Locked';

	static fields: CaseFields = ['post is locked'];
	static unique = true;

	trueText: string = 'locked';

	evaluate(thing: any): null | boolean {
		return thing.isLocked();
	}
}
