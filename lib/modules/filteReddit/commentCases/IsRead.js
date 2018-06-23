/* @flow */

import { Case } from '../Case';
import * as ReadComments from '../../readComments';
import * as Modules from '../../../core/modules';

export class IsRead extends Case {
	static text = 'Read';

	static fields = ['comment is read'];
	static get disabled(): boolean {
		return !Modules.isRunning(ReadComments);
	}

	static unique = true;

	trueText = 'read';

	evaluate(thing: *) {
		return ReadComments.isRead(thing);
	}
}
