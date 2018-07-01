/* @flow */

import { Case } from '../Case';

export class IsLocked extends Case {
	static text = 'Locked';

	static fields = ['post is locked'];
	static unique = true;

	trueText = 'locked';

	evaluate(thing: *) {
		return thing.isLocked();
	}
}
