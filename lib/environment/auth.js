/* @flow */

import { sendMessage } from '../../browser';

export function launchAuthFlow({ domain, clientId, scope }: {| domain: string, clientId: string, scope: string |}, { interactive = true }: {| interactive?: boolean |} = {}): Promise<string> {
	return sendMessage('authFlow', { domain, clientId, scope, interactive });
}
