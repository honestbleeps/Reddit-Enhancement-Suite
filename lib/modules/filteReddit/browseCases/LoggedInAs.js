/* @flow */

import { loggedInUser } from '../../../utils';
import { Case } from '../Case';

export class LoggedInAs extends Case {
	static text = 'Logged in user';

	static get defaultConditions(): * { return { loggedInAs: loggedInUser() }; } // loggedInUser requires documentReady
	static fields = ['logged in as /u/', { type: 'text', id: 'loggedInAs' }];

	value = Case.buildRegex(this.conditions.loggedInAs);

	evaluate() {
		const myName = loggedInUser();
		return !!myName && this.value.test(myName);
	}
}
