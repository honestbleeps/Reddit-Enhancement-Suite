/* @flow */

import {
	loggedInUser,
	loggedInUserHash,
} from '../../utils/user';
import { contentStart } from '../../utils/pagePhases';

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

export function retrieveFromParent(timeoutMs?: number = 0): Promise<boolean> {
	if (window === window.parent) return Promise.resolve(false);

	return new Promise(resolve => {
		let timeoutId;

		const handleMessage = ({ data: message }: MessageEvent) => {
			if (!message || typeof message !== 'object' || !message.context) return;

			window.removeEventListener('message', handleMessage);
			if (timeoutId) clearTimeout(timeoutId);

			Object.assign(data, message.context);
			resolve(true);
		};

		window.addEventListener('message', handleMessage);

		if (timeoutMs > 0) {
			timeoutId = setTimeout(() => {
				window.removeEventListener('message', handleMessage);
				resolve(false);
			}, timeoutMs);
		}
	});
}
