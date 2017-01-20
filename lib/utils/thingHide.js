/* @flow */

import { ajax } from '../environment';
import type Thing from './Thing';
import { batch } from './async';

const hideEndpoint = '/api/hide';
const unhideEndpoint = '/api/unhide';

const send = (endpoint: string, things: Thing[]) => {
	const fullnames = things.map(thing => thing.getFullname());

	return ajax({
		method: 'POST',
		url: endpoint,
		data: { id: fullnames.join(',') },
	});
};

export const hide = batch(things => send(hideEndpoint, things), { size: 50 });
export const unhide = batch(things => send(unhideEndpoint, things), { size: 50 });
