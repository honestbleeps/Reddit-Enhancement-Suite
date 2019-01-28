/* @flow */

import _ from 'lodash';

const classes = new Set();

export const addMissing = () => {
	document.body.classList.add(..._.difference(Array.from(classes), Array.from(document.body.classList)));
};

export function add(...change: string[]) {
	for (const cls of change) classes.add(cls);
	if (document.documentElement) document.documentElement.classList.add(...change);
	if (document.body) document.body.classList.add(...change);
}

export function remove(...change: string[]) {
	for (const cls of change) classes.delete(cls);
	if (document.documentElement) document.documentElement.classList.remove(...change);
	if (document.body) document.body.classList.remove(...change);
}

export function toggle(state: boolean, ...change: string[]) {
	if (state) add(...change);
	else remove(...change);
}
