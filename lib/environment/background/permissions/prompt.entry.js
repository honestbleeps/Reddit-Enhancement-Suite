/* @flow */

import { request } from '../permissions';

const url = new URL(location.href);
const requested = {
	permissions: JSON.parse(url.searchParams.get('permissions') || '[]'),
	origins: JSON.parse(url.searchParams.get('origins') || '[]'),
};

const button = document.body.querySelector('#request');
button.addEventListener('click', async () => {
	const result = await request(requested);
	url.searchParams.set('result', JSON.stringify(result));
	location.href = url.href;
});

// Focus, so pressing space / enter can be used as an alternative to clicking the button
button.focus();
