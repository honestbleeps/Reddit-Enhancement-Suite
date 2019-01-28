/* @flow */

import { loggedInUser } from '../../../utils';
import * as Init from '../../../core/init';
import { Case } from '../Case';

export class LoggedInAs extends Case {
	static text = 'Logged in user';

	static get defaultConditions(): * { return { loggedInAs: loggedInUser() }; } // loggedInUser requires documentReady
	static fields = ['logged in as /u/', { type: 'text', id: 'loggedInAs' }];

	value = Case.buildRegex(this.conditions.loggedInAs);

	async evaluate() {
		await Init.bodyReady; // loggedInUser requires documentReady
		const myName = loggedInUser();
		return !!myName && this.value.test(myName);
	}
}
