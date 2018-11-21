/* @flow */

import { sendMessage } from './messaging';

type RedirectState = {
	enabled: boolean,
	options: any,
};

export function updateRedirectState(state: RedirectState): void {
	sendMessage('redirection', {
		type: 'updateState',
		data: state,
	});
}
