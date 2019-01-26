/* @flow */

import { handleMessage } from '../permissions';

const url = new URL(location.href);

const button = document.body.querySelector('#request');
button.addEventListener('click', async () => {
	try {
		const result = await handleMessage({
			operation: 'request',
			permissions: JSON.parse(url.searchParams.get('permissions') || '[]'),
			origins: JSON.parse(url.searchParams.get('origins') || '[]'),
		});
		url.searchParams.set('result', JSON.stringify(result));
		location.href = url.href;
	} catch (e) {
		alert(`An error occured: ${e.message}`); // eslint-disable-line no-restricted-globals
	}
});

// Focus, so pressing space / enter can be used as an alternative to clicking the button
button.focus();
