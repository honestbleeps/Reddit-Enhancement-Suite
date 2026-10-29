/* @flow */

import { currentSubreddit } from '../../../utils';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class CurrentSub extends Case {
	static text = 'When browsing a subreddit';

	static defaultConditions: CaseConditions = { patt: '' };
	static fields: CaseFields = ['when browsing /r/', { type: 'text', id: 'patt' }];

	value: RegExp = Case.buildRegex(this.conditions.patt);

	evaluate(): null | boolean {
		const sub = currentSubreddit();
		return !!sub && this.value.test(sub);
	}
}
