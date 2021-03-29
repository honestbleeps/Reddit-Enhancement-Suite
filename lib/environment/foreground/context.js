/* @flow */

import {
	loggedInUser,
	loggedInUserHash,
} from '../../utils/user';
import { contentStart } from '../../utils/pagePhases';
import { waitForEvent } from '../../utils/dom';

export const data: {|
	userHash: ?string,
	username: ?string,
	origin: string,
	pathname: string,
|} = {
	userHash: null,
	username: null,
	origin: 'https://www.reddit.com',
	pathname: location.pathname,
};

if (location.protocol.startsWith('http')) {
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
