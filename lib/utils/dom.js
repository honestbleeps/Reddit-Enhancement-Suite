/* @flow */

import { memoize, assignIn, once, pick } from 'lodash-es';
import { downcast } from './flow';

export function waitForEvent(ele: EventTarget, ...events: string[]): Promise<Event> {
	return Promise.race(events.map(event =>
		new Promise(resolve => {
			ele.addEventListener(event, function fire(e) {
				ele.removeEventListener(event, fire);
				resolve(e);
			});
		}),
	));
}

export function waitForChild(ele: Element, selector: string): Promise<HTMLElement> {
	return new Promise(resolve => {
		const child = Array.from(ele.children).find(child => child.matches(selector));
		if (child) {
			resolve(child);
			return;
		}

		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node.nodeType === Node.ELEMENT_NODE && (node: any).matches(selector)) {
						observer.disconnect();
						resolve(downcast(node, HTMLElement));
						return;
					}
				}
			}
		});
		observer.observe(ele, { childList: true });
	});
}

export function watchForChildren(ele: Element, selector: string, callback: (ele: HTMLElement) => any): void {
	for (const child of Array.from(ele.children).filter(child => child.matches(selector))) {
		callback(child);
	}

	watchForFutureChildren(ele, selector, callback);
}

export function watchForFutureChildren(ele: Element, selector: string, callback: (ele: HTMLElement) => any): void {
	new MutationObserver(mutations => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE && (node: any).matches(selector)) {
					callback(downcast(node, HTMLElement));
				}
			}
		}
	}).observe(ele, { childList: true });
}

export function waitForDescendant(ele: Element, selector: string): Promise<HTMLElement> {
	return new Promise(resolve => {
		const child = ele.querySelector(selector);
		if (child) {
			resolve(child);
			return;
		}

		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						// the desired node may a descendant of an added node,
						// so scanning through addedNodes is not sufficient
						const child = ele.querySelector(selector);
						if (child) {
							observer.disconnect();
							resolve(child);
						}
						// stop iteration now, since we've already run querySelector over all children
						return;
					}
				}
			}
		});
		observer.observe(ele, { childList: true, subtree: true });
	});
}

export function waitForDescendantChange(ele: Element, selector: string): Promise<void> {
	return new Promise(resolve => {
		const found = () => {
			observer.disconnect();
			resolve();
		};

		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				if ((mutation.target: any).matches(selector)) return found();
				for (const node of mutation.addedNodes) {
					if (node.nodeType === Node.ELEMENT_NODE && (node: any).querySelector(selector)) return found();
				}
				for (const node of mutation.removedNodes) {
					if (node.nodeType === Node.ELEMENT_NODE && (node: any).querySelector(selector)) return found();
				}
			}
		});

		observer.observe(ele, { childList: true, subtree: true });
	});
}

export function waitForAttach(parent: HTMLElement, el: HTMLElement, cancel?: Promise<*>): Promise<void> {
	if (parent.contains(el)) return Promise.resolve();

	return new Promise((resolve, reject) => {
		const observer = new MutationObserver(() => {
			if (parent.contains(el)) {
				resolve();
				observer.disconnect();
			}
		});

		observer.observe(parent, { subtree: true, childList: true });
		if (cancel) cancel.then(() => { observer.disconnect(); reject(new Error('Canceled')); });
	});
}

export function waitForDetach(el: HTMLElement, cancel?: Promise<*>): Promise<void> {
	// Use `document.documentElement` as parent since using other closer element may not detect removal
	const parent = document.documentElement;

	if (!parent.contains(el)) return Promise.resolve();

	return new Promise((resolve, reject) => {
		const observer = new MutationObserver(() => {
			if (!parent.contains(el)) {
				resolve();
				observer.disconnect();
			}
		});

		observer.observe(parent, { subtree: true, childList: true });
		if (cancel) cancel.then(() => { observer.disconnect(); reject(new Error('Canceled')); });
	});
}

export function watchForDescendants(ele: Element, selector: string, callback: (ele: HTMLElement) => any, ignoreChildrenIfAddedNodeMatches: boolean = false): void {
	for (const child of ele.querySelectorAll(selector)) {
		callback(child);
	}

	watchForFutureDescendants(ele, selector, callback, ignoreChildrenIfAddedNodeMatches);
}

export function watchForFutureDescendants(ele: Element, selector: string, callback: (ele: HTMLElement) => any, ignoreChildrenIfAddedNodeMatches: boolean = false): void {
	new MutationObserver(mutations => {
		// avoid calling the callback twice if streamed-in children match the same selectors as their parents
		// i.e. nested comments that are rendered at pageload
		const children = new Set();
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// the node itself may match...
					if ((node: any).matches(selector)) {
						children.add(node);
						if (ignoreChildrenIfAddedNodeMatches) continue;
					}
					// ...or some of its children may match
					for (const child of (node: any).querySelectorAll(selector)) {
						children.add(child);
					}
				}
			}
		}
		for (const child of children) {
			callback(downcast(child, HTMLElement));
		}
	}).observe(ele, { childList: true, subtree: true });
}

// Limitation: Only runs check when `ele`''s attributes are changed
export function waitForSelectorMatch(ele: HTMLElement, selector: string): Promise<void> {
	if (ele.matches(selector)) return Promise.resolve();

	return new Promise(resolve => {
		const observer = new MutationObserver(() => {
			if (ele.matches(selector)) {
				resolve();
				observer.disconnect();
			}
		});

		observer.observe(ele, { attributes: true });
	});
}

export function empty<T: Element>(parent: T): T {
	while (parent.lastChild) parent.removeChild(parent.lastChild);
	return parent;
}

export function click(obj: EventTarget, button: number = 0): void {
	obj.dispatchEvent(new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		detail: 0,
		screenX: 1,
		screenY: 1,
		clientX: 1,
		clientY: 1,
		button,
	}));
}

click.isProgrammaticEvent = (e: MouseEvent): boolean => e.clientX === 1 && e.clientY === 1;

export const getViewportSize = memoize((): { width: number, height: number } => {
	waitForEvent(window, 'resize').then(() => { getViewportSize.cache.clear(); });

	let visualViewport;

	if (window.visualViewport) {
		visualViewport = window.visualViewport;
	} else {
		const viewportSizedElement = document.createElement('div');
		viewportSizedElement.style.width = viewportSizedElement.style.height = '100%';
		viewportSizedElement.style.position = 'fixed';
		document.body.appendChild(viewportSizedElement);
		visualViewport = viewportSizedElement.getBoundingClientRect();

		// Try less accurate method in case this didn't work (workaround for potensial Firefox issue)
		if (!visualViewport.height || !visualViewport.width) {
			visualViewport = document.documentElement.getBoundingClientRect();
		}

		viewportSizedElement.remove();
	}

	return pick(visualViewport, ['height', 'width']);
});

export function elementInViewport(ele: HTMLElement): boolean {
	if (!ele || !ele.offsetParent) return false;

	const { top, left, bottom, right } = ele.getBoundingClientRect();

	return (
		top >= 0 &&
		left >= 0 &&
		bottom <= getViewportSize().height &&
		right <= getViewportSize().width
	);
}

function getViewportDimensions() {
	const headerOffset = getHeaderOffset();
	const left = window.pageXOffset;
	const top = window.pageYOffset + headerOffset;
	const width = getViewportSize().width;
	const height = getViewportSize().height - headerOffset;

	return {
		yOffset: headerOffset,
		left,
		top,
		bottom: top + height,
		right: left + width,
		width,
		height,
	};
}

// Returns percentage of the element that is within the viewport along the y-axis
// Note that it doesn't matter where the element is on the x-axis, it can be totally invisible to the user
// and this function might still return 1!
export function getPercentageVisibleYAxis(obj: Element): number {
	const rect = obj.getBoundingClientRect();
	const top = Math.max(0, rect.bottom - rect.height);
	const bottom = Math.min(getViewportSize().height, rect.bottom);
	if (rect.height === 0) {
		return 0;
	}
	return Math.max(0, (bottom - top) / rect.height);
}

const padBottom = once(() => {
	const element = document.createElement('div');
	element.style.clear = 'both';
	const extraPadding = 50; // In case the body's height reduces
	return (scrollTop, viewportHeight) => {
		const currentPadding = element.clientHeight;
		const paddingRequired = extraPadding +
			-(document.documentElement.scrollHeight - scrollTop - viewportHeight - currentPadding);
		if (paddingRequired > 0) document.body.append(element);
		else element.remove();
		element.style.height = `${paddingRequired}px`;
	};
});

let recentScroll = false;
let scrollInvokationToken;

export type ScrollStyle = 'none' | 'top' | 'adopt' | 'middle' | 'page' | 'legacy' | 'directional';
type Direction = 'up' | 'down';
type Anchor = {| to: number, from?: number |};

export function scrollToElement(to: HTMLElement, from: ?HTMLElement, {
	scrollStyle,
	restrictDirectionTo,
	direction: selectedDirection,
	anchor,
	waitTillVisible,
}: {|
	scrollStyle: ScrollStyle,
	restrictDirectionTo?: Direction,
	direction?: Direction,
	anchor?: Anchor,
	waitTillVisible?: boolean,
|}) {
	const _scrollInvokationToken = scrollInvokationToken = {}; // Unique object used to check this whether invokation has been superseded

	if (scrollStyle === 'none' && !anchor) {
		return;
	}

	if (waitTillVisible && !to.offsetParent) {
		// Try again next frame
		requestAnimationFrame(() => {
			if (scrollInvokationToken === _scrollInvokationToken) scrollToElement(...arguments); // eslint-disable-line prefer-rest-params
		});
		return;
	}

	if (!to.offsetParent) {
		console.error('Element is not visible.');
		return;
	}

	if (scrollStyle === 'none' && anchor) {
		const diff = to.getBoundingClientRect().top - anchor.to;
		if (diff) window.scrollBy(0, diff);
	}

	const viewport = getViewportDimensions();

	const target = assignIn({}, to.getBoundingClientRect()); // top, right, bottom, left are relative to viewport
	target.top -= viewport.yOffset;
	target.bottom -= viewport.yOffset;

	const top = viewport.top + target.top - 5; /* offset */

	if (scrollStyle === 'middle' && target.height >= viewport.height) {
		scrollStyle = 'top';
	}

	let compensateHeader = true;
	let scrollY;

	if (scrollStyle === 'top') {
		// Always scroll element to top of page; pad bottom if necessary
		padBottom()(top, viewport.height);
		scrollY = top;
	} else if (from && scrollStyle === 'adopt') {
		// Replace the viewport position of `from` with `element`
		const fromTop = anchor && typeof anchor.from === 'number' ?
			anchor.from :
			from.getBoundingClientRect().top;
		let diff = to.getBoundingClientRect().top - fromTop;

		if (fromTop < 0) {
			// Compensate to show top when it is above viewport
			diff += fromTop;
		} else if (fromTop > viewport.height - 60) {
			// Always show at minimum the top 60px of the element
			diff += fromTop - viewport.height + 60;
		}

		scrollY = window.scrollY + diff;
		compensateHeader = false;
	} else if (scrollStyle === 'middle') {
		const buffer = (viewport.height - target.height) / 2;
		const newScrollY = top - buffer;

		if (elementInViewport(to)) {
			const viewportDirection = newScrollY >= window.scrollY ? 'down' : 'up';
			// Having these go in opposite directions is jarring
			if (viewportDirection !== selectedDirection) return;
		}

		scrollY = newScrollY;
	} else if (target.top >= 0 && target.bottom <= viewport.height) {
		// Element is already completely inside viewport
		// (remember, top and bottom are relative to viewport)
		// do nothing
	} else if (scrollStyle === 'legacy') {
		// Element not completely in viewport, so scroll to top
		scrollY = top;
	} else if (target.top < viewport.yOffset) {
		// Element starts above viewport
		// So, align top of element to top of viewport
		scrollY = top;
	} else if (viewport.height < target.bottom &&
		target.height < viewport.height) {
		// Visible part of element starts or extends below viewport
		if (scrollStyle === 'page') {
			scrollY = top;
		} else {
			// So, align bottom of target to bottom of viewport
			scrollY = viewport.top + target.bottom - viewport.height;
		}
	} else {
		// Visible part of element below the viewport but it'll fill the viewport, or fallback
		// So, align top of element to top of viewport
		scrollY = top;
	}

	if (scrollY !== undefined) {
		if (compensateHeader) scrollY -= getHeaderOffset();
		const scollDirection = scrollY > viewport.top ? 'down' : 'up';
		if (viewport.top === scrollY || (restrictDirectionTo && restrictDirectionTo !== scollDirection)) return;
		window.scrollTo(0, scrollY);
		recentScroll = true;
		waitForEvent(window, 'scroll').then(() => { recentScroll = false; });
	}
}

scrollToElement.isProgrammaticEvent = (): boolean => recentScroll;

const headerIds = { fullWidth: [], partialWidth: [] };

export function _addHeaderId(elementId: string, partialWidth: boolean = false) {
	headerIds[partialWidth ? 'partialWidth' : 'fullWidth'].push(elementId);
}

export const getHeaderOffset = memoize((includePartialWidthHeaders?: boolean = false): number => {
	const headers = [
		...headerIds.fullWidth,
		...(includePartialWidthHeaders ? headerIds.partialWidth : []),
	];

	return headers
		.map(id => document.getElementById(id))
		.reduce((a, b) => a + b.getBoundingClientRect().height, 0);
});

export const getD2xBodyOffset = memoize(() => {
	try {
		return document.getElementById('2x-container').offsetTop;
	} catch (e) {
		return 65;
	}
});

export function addCSS(css: string) {
	let style = addStyle(css);
	return {
		remove() {
			if (!style) return;
			style.remove();
			style.textContent = '';
			style = undefined;
		},
	};
}

function addStyle(css) {
	const style = document.createElement('style');
	style.textContent = css;

	(document.head || document.documentElement).appendChild(style);

	return style;
}

export const isLastNodeInDOM = (node: Node) => {
	let _last = node;
	do {
		if (_last.nextSibling) break;
	} while ((_last = _last.parentNode));
	return !_last;
};

// r2 Reddit clone certain elements, e.g. when replying or editing a post
// This will remove elements that have a specific attribute, but have not been registered
export const preventCloning = (() => {
	// Prevent breaking ava test
	if (typeof window === 'undefined') return (e: *) => e;

	const attribute = `res-prevent-cloning-${Date.now()}`; // Include date to prevent the attribute being misused in a selector
	const elements = new WeakSet();

	// Delay adding the observer a little, to not slow down init
	// Things are practially never cloned _before_ the page is fully loaded, so this is a OK solutoin
	waitForEvent(window, 'DOMContentLoaded', 'load').then(() => {
		const { watchForThings } = require('./watchers'); // avoid test issue
		watchForThings(null, thing => {
			for (const ele of [...thing.entry.querySelectorAll(`[${attribute}]`)]) { if (!elements.has(ele)) ele.remove(); }
		}, { immediate: true });
	});

	return (element: HTMLElement) => {
		element.setAttribute(attribute, '');
		elements.add(element);
		return element;
	};
})();
