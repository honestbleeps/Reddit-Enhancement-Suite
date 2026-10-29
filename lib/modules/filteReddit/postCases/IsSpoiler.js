/* @flow */

import { Case } from '../Case';
import type { CaseFields } from '../Case';

export class IsSpoiler extends Case {
	static text = 'Spoiler';

	static fields: CaseFields = ['post is marked spoiler'];

	static unique = true;

	trueText: string = 'spoiler';

	evaluate(thing: any): null | boolean {
		return thing.isSpoiler();
	}
}
