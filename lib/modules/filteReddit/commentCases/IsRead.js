/* @flow */

import { Case } from '../Case';
import type { CaseFields } from '../Case';
import * as ReadComments from '../../readComments';
import * as Modules from '../../../core/modules';

export class IsRead extends Case {
	static text = 'Read';

	static fields: CaseFields = ['comment is read'];
	static get disabled(): boolean {
		return !Modules.isEnabled(ReadComments);
	}

	static unique = true;

	trueText: string = 'read';

	evaluate(thing: any): null | boolean {
		return ReadComments.isRead(thing);
	}
}
