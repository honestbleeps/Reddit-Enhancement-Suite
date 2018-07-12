/* @flow */

import { currentSubreddit } from '../../../utils';
import { Case } from '../Case';

export class CurrentSub extends Case {
	static text = 'When browsing a subreddit';

	static defaultConditions = { patt: '' };
	static fields = ['when browsing /r/', { type: 'text', id: 'patt' }];

	value = Case.buildRegex(this.conditions.patt);

	evaluate() {
		const sub = currentSubreddit();
		return !!sub && this.value.test(sub);
	}
}
