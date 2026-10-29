/* @flow */

import {
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	isPageType,
} from '../../../utils';
import { Case } from '../Case';
import type { CaseFields } from '../Case';

export class BrowsingFrontPage extends Case {
	static text = 'Browsing the front page';
	static fields: CaseFields = ['when browsing the front page'];

	evaluate(): null | boolean {
		return isPageType('linklist') &&
			!currentSubreddit() &&
			!currentMultireddit() &&
			!currentUserProfile();
	}
}
