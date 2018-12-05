/* @flow */

import type { RedirectRule } from '../utils/redirection';
import { requiredPermissions } from '../utils/redirection';
import { sendMessage } from './messaging';
import { request } from './permissions';

export async function updateRedirectBackgroundState(rules: Array<RedirectRule>) {
	await request(requiredPermissions);
	sendMessage('redirection', rules);
}
