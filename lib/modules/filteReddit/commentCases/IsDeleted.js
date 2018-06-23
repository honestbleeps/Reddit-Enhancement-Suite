/* @flow */

import { Case } from '../Case';

export class IsDeleted extends Case {
	static text = 'Deleted';

	static fields = ['comment is deleted'];

	static unique = true;

	trueText = 'deleted';

	evaluate(thing: *) {
		return thing.isDeleted();
	}
}
