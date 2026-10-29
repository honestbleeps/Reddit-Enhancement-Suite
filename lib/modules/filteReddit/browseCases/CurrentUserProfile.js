/* @flow */

import { currentUserProfile } from '../../../utils';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class CurrentUserProfile extends Case {
	static text = 'When browsing a user profile';

	static defaultConditions: CaseConditions = { patt: '' };
	static fields: CaseFields = ['when browsing /u/', { type: 'text', id: 'patt' }, '\'s posts'];

	value: RegExp = Case.buildRegex(this.conditions.patt);

	evaluate(): null | boolean {
		const user = currentUserProfile();
		return !!user && this.value.test(user);
	}
}
