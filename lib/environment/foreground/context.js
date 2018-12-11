/* @flow */

import {
	loggedInUser,
	loggedInUserHash,
} from '../../utils';

export const data: {|
	userHash: ?string,
	username: ?string,
	origin: string,
|} = {
	userHash: null,
	username: null,
	origin: 'https://www.reddit.com',
};

export function establish(bodyReady: Promise<*>) {
	data.origin = location.origin;

	bodyReady.then(() => {
		data.username = loggedInUser();
		loggedInUserHash().then(hash => { data.userHash = hash; });
	});
}
