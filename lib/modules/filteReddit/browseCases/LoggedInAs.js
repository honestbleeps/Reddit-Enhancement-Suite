/* @flow */

import { PagePhases, loggedInUser } from '../../../utils';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class LoggedInAs extends Case {
	static text = 'Logged in user';

	static defaultConditions: CaseConditions = { loggedInAs: '' }; // Don't try to fetch current username as the default value, as that may trigger `loggedInUser` prematurely
	static fields: CaseFields = ['logged in as /u/', { type: 'text', id: 'loggedInAs' }];

	value: RegExp = Case.buildRegex(this.conditions.loggedInAs);

	async evaluate(): Promise<null | boolean> {
		await PagePhases.contentStart; // loggedInUser requires the header to be loaded
		const myName = loggedInUser();
		return !!myName && this.value.test(myName);
	}
}
