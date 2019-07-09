/* @flow */

import { ajax } from '../environment';
import type { Thing } from './Thing';
import { batch } from './async';
import { isLoggedIn } from './user';

const hideEndpoint = '/api/hide';
const unhideEndpoint = '/api/unhide';
export const [HIDE, UNHIDE] = [false, true];

export const send = async (state: boolean, things: Thing[]) => {
	if (!isLoggedIn()) return Promise.reject(new Error('Not logged in'));

	function setState(newState) {
		for (const thing of things) {
			const hideElement = thing.getHideElement();
			if (hideElement) {
				hideElement.textContent = newState === HIDE ? 'unhide' : 'hide';
				hideElement.setAttribute('action', newState === HIDE ? 'unhide' : 'hide');
			}
		}
	}

	for (const thing of things) {
		const hideElement = thing.getHideElement();
		if (hideElement) hideElement.textContent = state === HIDE ? 'hiding…' : 'unhiding…';
	}

	const fullnames = things.map(thing => thing.getFullname());

	const r = await ajax({
		method: 'POST',
		url: state === HIDE ? hideEndpoint : unhideEndpoint,
		data: { id: fullnames.join(',') },
		type: 'json',
	});
	if (r.success) throw new Error('Failed to set hide state');
	setState(state);
};

export const hide = batch(things => send(HIDE, things), { size: 50 });
export const unhide = batch(things => send(UNHIDE, things), { size: 50 });
