/* @noflow */

/* Microsoft Edge Support */

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
		return textNodeIfString(nodes);
	}
	const fragment = document.createDocumentFragment();
	for (const node of nodes) {
		fragment.appendChild(textNodeIfString(node));
	}
	return fragment;
}

Element.prototype.prepend = function prepend(...nodes) {
	const firstChild = this.firstChild;
	const node = contentToNode(nodes);
	if (firstChild) {
		this.insertBefore(node, firstChild);
	} else {
		this.appendChild(node);
	}
};

Element.prototype.append = function append(...nodes) {
	this.appendChild(contentToNode(nodes));
};

Element.prototype.before = function before(...nodes) {
	const parentNode = this.parentNode;
	if (parentNode) {
		parentNode.insertBefore(contentToNode(nodes), this);
	}
};

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

Element.prototype.replaceWith = function replaceWith(...nodes) {
	const parentNode = this.parentNode;
	if (parentNode) {
		parentNode.replaceChild(contentToNode(nodes), this);
	}
};

// polyfill IntersectionObserverEntry.prototype.isIntersecting
// Snippet from https://github.com/WICG/IntersectionObserver/pull/224
if (!('isIntersecting' in IntersectionObserverEntry.prototype)) {
	Object.defineProperty(IntersectionObserverEntry.prototype,
		'isIntersecting', {
			get() {
				return this.intersectionRatio > 0;
			},
		});
}
