/* @flow */

import _ from 'lodash';
import { addListener } from './messaging';

addListener('ajax', async ({ method, url, headers, data, sendCredentials }) => {
	const rawResponse = await fetch(url, {
		method,
		headers,
		credentials: sendCredentials ? 'include' : 'omit',
		body: data,
	});

	return {
		ok: rawResponse.ok,
		status: rawResponse.status,
		headers: _.fromPairs(Array.from(rawResponse.headers.entries())),
		text: await rawResponse.text(),
	};
});
