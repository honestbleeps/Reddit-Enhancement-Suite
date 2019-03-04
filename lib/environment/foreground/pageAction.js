/* @flow */

import { frameThrottle } from '../../utils/async';
import { addListener, sendMessage } from './messaging';

const clickListeners = [];

export function onClick(callback: () => void) {
	clickListeners.push(callback);
}

addListener('pageActionClick', () => { for (const fn of clickListeners) fn(); });

// Don't update before page is visible, as Firefox (buggily?) ignores pageAction updates to hidden pages
const update = frameThrottle(value => sendMessage('pageAction', value));

export function show(state?: boolean = false) {
	return update({ operation: 'show', state });
}

export function hide() {
	return update({ operation: 'hide' });
}
