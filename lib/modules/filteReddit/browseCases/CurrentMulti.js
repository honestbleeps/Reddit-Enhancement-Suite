/* @flow */

import { currentMultireddit } from '../../../utils';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class CurrentMulti extends Case {
	static text = 'When browsing a multireddit';

	static defaultConditions: CaseConditions = { user: '', name: '' };
	static fields: CaseFields = ['when browsing /u/', { type: 'text', id: 'user' }, '/m/', { type: 'text', id: 'name' }];

	value: { name: RegExp, user: RegExp } = {
		name: Case.buildRegex(this.conditions.name),
		user: Case.buildRegex(this.conditions.user),
	};

	evaluate(): null | boolean {
		const rawMulti = currentMultireddit();
		if (!rawMulti) return false;
		const parts = (/^(?:user\/)?([a-z0-9_-]+)\/m\/([a-z0-9_-]+)$/i).exec(rawMulti);
		if (!parts) return false;
		const [, user, multi] = parts;
		if (user === 'me' && this.conditions.name === 'me') {
			return this.value.name.test(multi);
		} else {
			return this.value.user.test(user) && this.value.name.test(multi);
		}
	}
}
