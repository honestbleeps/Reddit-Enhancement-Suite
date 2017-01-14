/* @flow */

import _ from 'lodash';
import { range } from './';

export type KeyArray = [number, boolean, boolean, boolean, boolean];

type KeyEvent = {
	keyCode: number,
	altKey: boolean,
	ctrlKey: boolean,
	shiftKey: boolean,
	metaKey: boolean,
};

/* eslint-disable quote-props */
// https://github.com/facebook/flow/issues/380
const keyCodes = {
	'-1': 'none',
	'8': 'backspace',
	'9': 'tab',
	'13': 'enter',
	'16': 'shift',
	'17': 'ctrl',
	'18': 'alt',
	'19': 'pause/break',
	'20': 'caps lock',
	'27': 'escape',
	'33': 'page up',
	'34': 'page down',
	'35': 'end',
	'36': 'home',
	'37': 'left arrow',
	'38': 'up arrow',
	'39': 'right arrow',
	'40': 'down arrow',
	'45': 'insert',
	'46': 'delete',
	'91': 'left window',
	'92': 'right window',
	'93': 'select key',
	'96': 'numpad 0',
	'97': 'numpad 1',
	'98': 'numpad 2',
	'99': 'numpad 3',
	'100': 'numpad 4',
	'101': 'numpad 5',
	'102': 'numpad 6',
	'103': 'numpad 7',
	'104': 'numpad 8',
	'105': 'numpad 9',
	'106': 'multiply',
	'107': 'add',
	'109': 'subtract',
	'110': 'decimal point',
	'111': 'divide',
	'112': 'F1',
	'113': 'F2',
	'114': 'F3',
	'115': 'F4',
	'116': 'F5',
	'117': 'F6',
	'118': 'F7',
	'119': 'F8',
	'120': 'F9',
	'121': 'F10',
	'122': 'F11',
	'123': 'F12',
	'144': 'num lock',
	'145': 'scroll lock',
	'186': ';',
	'187': '=',
	'188': ',',
	'189': '-',
	'190': '.',
	'191': '/',
	'192': '`',
	'219': '[',
	'220': '\\',
	'221': ']',
	'222': '\'',
};
/* eslint-enable quote-props */

export function niceKeyCode(keyArray: number | string | KeyArray): string {
	if (!keyArray && isNaN(keyArray)) {
		return '';
	}

	if (typeof keyArray === 'number') {
		keyArray = [keyArray, false, false, false, false];
	} else if (typeof keyArray === 'string') {
		const split = keyArray.split(',');
		const code = parseInt(split[0], 10);
		const [alt, ctrl, shift, meta] = [...split.slice(1).map(s => s === 'true'), false, false, false, false];
		keyArray = [code, alt, ctrl, shift, meta];
	}

	const [keyCode, ...modifiers] = keyArray;

	const keyCombo = _.zipWith(modifiers, ['alt-', 'ctrl-', 'shift-', 'command-'], (predicate, name) => predicate && name)
		.filter(x => x)
		.join('');

	const keyName = keyCodes[keyCode] || String.fromCharCode(keyCode);

	return `${keyCombo}${keyName}`;
}

export function checkKeysForEvent(event: KeyEvent, keyArray: number | KeyArray): boolean {
	// [keycode, alt, ctrl, shift, meta]
	// if we've passed in a number, fix that and make it an array with alt, shift and ctrl set to false.
	if (typeof keyArray === 'number') {
		keyArray = [keyArray, false, false, false, false];
	} else if (keyArray.length === 4) {
		keyArray.push(false);
	}

	const eventHash = hashKeyEvent(event);
	const arrayHash = hashKeyArray(keyArray);
	return eventHash === arrayHash;
}

export function hashKeyEvent(event: KeyEvent): number {
	const keyArray = [event.keyCode, event.altKey, event.ctrlKey, event.shiftKey, event.metaKey];

	// this hack is because Firefox differs from other browsers with keycodes for - and =
	if (process.env.BUILD_TARGET === 'firefox') {
		if (keyArray[0] === 173) {
			keyArray[0] = 189;
		}
		if (keyArray[0] === 61) {
			keyArray[0] = 187;
		}
	}

	return hashKeyArray(keyArray);
}

export function hashKeyArray(keyArray: KeyArray): number {
	const length = 5;
	let hash = keyArray[0] * Math.pow(2, length);
	for (const i of range(1, length)) {
		if (keyArray[i]) {
			hash += 2 ** i;
		}
	}
	return hash;
}
