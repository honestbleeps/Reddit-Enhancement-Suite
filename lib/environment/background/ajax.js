/* @flow */

import { addListener } from './messaging';
import _ from 'lodash';

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
		headers: _.fromPairs(Array.from(rawResponse.headers.entries())),
		text: await rawResponse.text(),
	};
});
