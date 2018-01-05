/* @flow */

import { Case } from '../Case';

export class IsNSFW extends Case {
	static text = 'NSFW';

	static fields = ['post is marked NSFW'];

	static unique = true;

	evaluate(thing: *) {
		return thing.isNSFW();
	}
}
