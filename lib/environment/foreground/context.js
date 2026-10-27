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

export function retrieveFromParent() {
	if (window === window.parent) return Promise.resolve();

	const parentOrigin = getParentOrigin();

	return new Promise<void>(resolve => {
		window.addEventListener('message', function receiveContext(event: MessageEvent) {
			if (!isMessageFromParent(event)) return;

			const message: any = event.data;
			const context = message && message.context;
			if (!context ||
				context.origin !== parentOrigin ||
				typeof context.pathname !== 'string' ||
				(context.username !== null && typeof context.username !== 'string') ||
				(context.userHash !== null && typeof context.userHash !== 'string')) return;

			window.removeEventListener('message', receiveContext);
			data.origin = context.origin;
			data.pathname = context.pathname;
			data.username = context.username;
			data.userHash = context.userHash;
			resolve();
		});
	});
}

export function getParentOrigin(): string {
	if (window === window.parent) return location.origin;
	if (!document.referrer) throw new Error('Could not determine parent origin.');
	return new URL(document.referrer).origin;
}

export function isMessageFromParent(event: MessageEvent): boolean {
	return event.source === window.parent && event.origin === getParentOrigin();
}

export function postMessageToParent(message: *): void {
	window.parent.postMessage(message, getParentOrigin());
}
