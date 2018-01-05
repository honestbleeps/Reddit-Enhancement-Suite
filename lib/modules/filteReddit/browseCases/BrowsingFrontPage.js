/* @flow */

import {
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	isPageType,
} from '../../../utils';
import { Case } from '../Case';

export class BrowsingFrontPage extends Case {
	static text = 'Browsing the front page';
	static fields = ['when browsing the front page'];

	evaluate() {
		return isPageType('linklist') &&
			!currentSubreddit() &&
			!currentMultireddit() &&
			!currentUserProfile();
	}
}
