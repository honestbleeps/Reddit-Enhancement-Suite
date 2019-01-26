/* @flow */

import _ from 'lodash';

const classes = new Set();

const addMissing = element => {
	element.classList.add(..._.difference(Array.from(classes), Array.from(element.classList)));
};

export function add(...change: string[]) {
	for (const cls of change) classes.add(cls);
	// The elements may not exist when this is invoked
	// If they are not, the classes are added on the next invokation
	if (document.documentElement) addMissing(document.documentElement);
	if (document.body) addMissing(document.body);
}

export function remove(...change: string[]) {
	for (const cls of change) classes.delete(cls);
	// The elements must exist for the classes to have been added earlier
	if (document.documentElement) document.documentElement.classList.remove(...change);
	if (document.body) document.body.classList.remove(...change);
}

export function toggle(state: boolean, ...change: string[]) {
	if (state) add(...change);
	else remove(...change);
}
