/* @flow */

import { fromPairs } from 'lodash-es';
import { addListener } from './messaging';

addListener('ajax', async ({ method, url, headers, data, credentials }) => {
	const rawResponse = await fetch(url, {
		method,
		headers,
		credentials,
		body: data,
	});

	return {
		ok: rawResponse.ok,
		status: rawResponse.status,
		headers: fromPairs(Array.from(rawResponse.headers.entries())),
		text: await rawResponse.text(),
	};
});
