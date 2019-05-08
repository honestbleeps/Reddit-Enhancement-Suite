/* @flow */

import {
	loggedInUser,
	loggedInUserHash,
} from '../../utils/user';

export const data: {|
	userHash: ?string,
	username: ?string,
	origin: string,
|} = {
	userHash: null,
	username: null,
	origin: 'https://www.reddit.com',
};

export function establish(contentLoaded: Promise<*>) {
	data.origin = location.origin;

	contentLoaded.then(() => {
		data.username = loggedInUser();
		loggedInUserHash().then(hash => { data.userHash = hash; });
	});
}
