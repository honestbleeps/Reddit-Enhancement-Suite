/* @flow */

import { ajax } from '../environment';
import type Thing from './Thing';
import { batch } from './async';

const hideEndpoint = '/api/hide';
const unhideEndpoint = '/api/unhide';
const [HIDE, UNHIDE] = [false, true];

const send = (state, things: Thing[]) => {
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

	return ajax({
		method: 'POST',
		url: state === HIDE ? hideEndpoint : unhideEndpoint,
		data: { id: fullnames.join(',') },
	}).then(() => { setState(HIDE); }, () => { setState(UNHIDE); });
};

export const hide = batch(things => send(HIDE, things), { size: 50 });
export const unhide = batch(things => send(UNHIDE, things), { size: 50 });
