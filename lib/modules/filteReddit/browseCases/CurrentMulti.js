/* @flow */

import { currentMultireddit } from '../../../utils';
import { Case } from '../Case';

export class CurrentMulti extends Case {
	static text = 'When browsing a multireddit';

	static defaultConditions = { user: '', name: '' };
	static fields = ['when browsing /u/', { type: 'text', id: 'user' }, '/m/', { type: 'text', id: 'name' }];

	getValue(conditions: *) {
		return {
			name: Case.buildRegex(conditions.name),
			user: Case.buildRegex(conditions.user),
		};
	}

	evaluate() {
		const rawMulti = currentMultireddit();
		if (!rawMulti) return false;
		const parts = (/^(?:user\/)?([a-z0-9_-]+)\/m\/([a-z0-9_-]+)$/i).exec(rawMulti);
		if (!parts) return false;
		const [, user, multi] = parts;
		if (user === 'me' && this.value.name === 'me') {
			return this.value.name.test(multi);
		} else {
			return this.value.user.test(user) && this.value.name.test(multi);
		}
	}
}
