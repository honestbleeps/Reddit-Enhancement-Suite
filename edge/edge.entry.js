/* @noflow */

/* Microsoft Edge Support */

// polyfill fetch()
import './remove-fetch';
import 'whatwg-fetch';

window.chrome = window.browser; // eslint-disable-line no-native-reassign

// DOM Collection iteration
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// https://github.com/WebReflection/dom4
// Copyright (C) 2013-2015 by Andrea Giammarchi - @WebReflection
// MIT license

function textNodeIfString(node) {
	return typeof node === 'string' ? document.createTextNode(node) : node;
}

function contentToNode(nodes) {
	if (nodes.length === 1) {
		return textNodeIfString(nodes[0]);
	}
	const fragment = document.createDocumentFragment();
	for (const node of nodes) {
		fragment.appendChild(textNodeIfString(node));
	}
	return fragment;
}

DocumentFragment.prototype.prepend =
Element.prototype.prepend = function prepend(...nodes) {
	const firstChild = this.firstChild;
	const node = contentToNode(nodes);
	if (firstChild) {
		this.insertBefore(node, firstChild);
	} else {
		this.appendChild(node);
	}
};

DocumentFragment.prototype.append =
Element.prototype.append = function append(...nodes) {
	this.appendChild(contentToNode(nodes));
};

CharacterData.prototype.before =
DocumentType.prototype.before =
Element.prototype.before = function before(...nodes) {
	const parentNode = this.parentNode;
	if (parentNode) {
		parentNode.insertBefore(contentToNode(nodes), this);
	}
};

CharacterData.prototype.after =
DocumentType.prototype.after =
Element.prototype.after = function after(...nodes) {
	const parentNode = this.parentNode;
	const nextSibling = this.nextSibling;
	const node = contentToNode(nodes);
	if (parentNode) {
		if (nextSibling) {
			parentNode.insertBefore(node, nextSibling);
		} else {
			parentNode.appendChild(node);
		}
	}
};

CharacterData.prototype.replaceWith =
DocumentType.prototype.replaceWith =
Element.prototype.replaceWith = function replaceWith(...nodes) {
	const parentNode = this.parentNode;
	if (parentNode) {
		parentNode.replaceChild(contentToNode(nodes), this);
	}
};


// polyfill KeyboardEvent.key
// Edge names from https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
const SPEC_KEY_NAMES = {
	Win: 'Meta',
	Scroll: 'ScrollLock',

	Spacebar: ' ',

	Left: 'ArrowLeft',
	Right: 'ArrowRight',
	Up: 'ArrowUp',
	Down: 'ArrowDown',

	Del: 'Delete',
	Crsel: 'CrSel',
	Exsel: 'ExSel',

	Esc: 'Escape',
	Apps: 'ContextMenu',

	Nonconvert: 'NonConvert',

	MediaNextTrack: 'MediaTrackNext',
	MediaPreviousTrack: 'MediaTrackPrevious',

	VolumeUp: 'AudioVolumeUp',
	VolumeDown: 'AudioVolumeDown',
	VolumeMute: 'AudioVolumeMute',

	Zoom: 'ZoomToggle',

	SelectMedia: 'LaunchMediaPlayer',

	Decimal: '.',
	Multiply: '*',
	Add: '+',
	Divide: '/',
	Subtract: '-',
	Separator: ',',
};

const keyboardEventKeyDescriptor = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key');

Object.defineProperty(KeyboardEvent.prototype, 'key', {
	get() {
		const key = Reflect.apply(keyboardEventKeyDescriptor.get, this, []);
		return SPEC_KEY_NAMES.hasOwnProperty(key) ? SPEC_KEY_NAMES[key] : key;
	},
});
