/* @flow */

import { Case } from '../Case';
import type { CaseFields } from '../Case';

export class IsNSFW extends Case {
	static text = 'NSFW';

	static fields: CaseFields = ['post is marked NSFW'];

	static unique = true;

	trueText: string = 'nsfw';

	evaluate(thing: any): null | boolean {
		return thing.isNSFW();
	}
}
