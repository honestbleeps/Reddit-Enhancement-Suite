/* @flow */

import _ from 'lodash';
import { addListener } from './messaging';

addListener('ajax', ({ method, url, headers, body, credentials }) => (
	fetch(url, {
		method,
		headers,
		credentials,
		body,
	}).then(async r => ({
		ok: r.ok,
		status: r.status,
		headers: _.fromPairs(Array.from(r.headers.entries())),
		text: await r.text(),
	}))
));
