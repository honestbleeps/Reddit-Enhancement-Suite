/* @flow */

import { Case } from '../Case';
import type { CaseFields } from '../Case';

export class IsDeleted extends Case {
	static text = 'Deleted';

	static fields: CaseFields = ['comment is deleted'];

	static unique = true;

	trueText: string = 'deleted';

	evaluate(thing: any): null | boolean {
		return thing.isDeleted();
	}
}
