/* @flow */

import { loggedInUser } from '../../../utils';
import * as Init from '../../../core/init';
import { Case } from '../Case';

export class LoggedInAs extends Case {
	static text = 'Logged in user';

	static defaultConditions = { loggedInAs: '' }; // Don't try to fetch current username as the default value, as that may trigger `loggedInUser` prematurely
	static fields = ['logged in as /u/', { type: 'text', id: 'loggedInAs' }];

	value = Case.buildRegex(this.conditions.loggedInAs);

	async evaluate() {
		await Init.sitetableStarted; // loggedInUser requires the header to be loaded
		const myName = loggedInUser();
		return !!myName && this.value.test(myName);
	}
}
