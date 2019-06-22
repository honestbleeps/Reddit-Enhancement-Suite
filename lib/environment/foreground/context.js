/* @flow */

import {
	loggedInUser,
	loggedInUserHash,
} from '../../utils/user';
import { waitForEvent } from '../../utils/dom';

export const data: {|
	userHash: ?string,
	username: ?string,
	origin: string,
|} = {
	userHash: null,
	username: null,
	origin: 'https://www.reddit.com',
};

export function establish(contentStart: *) {
	if (!location.protocol.startsWith('http')) return;

	data.origin = location.origin;

	contentStart.then(() => {
		data.username = loggedInUser();
		loggedInUserHash().then(hash => { data.userHash = hash; });
	});
}

export function retrieveFromParent() {
	if (window === window.parent) return Promise.resolve();

	return waitForEvent(window, 'message').then(({ data: { context } }: any) => {
		Object.assign(data, context);
	});
}
