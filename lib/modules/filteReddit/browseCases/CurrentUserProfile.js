/* @flow */

import { currentUserProfile } from '../../../utils';
import { Case } from '../Case';

export class CurrentUserProfile extends Case {
	static text = 'When browsing a user profile';

	static defaultConditions = { patt: '' };
	static fields = ['when browsing /u/', { type: 'text', id: 'patt' }, '\'s posts'];

	getValue(conditions: *) {
		return Case.buildRegex(conditions.patt);
	}

	evaluate() {
		const user = currentUserProfile();
		return !!user && this.value.test(user);
	}
}
