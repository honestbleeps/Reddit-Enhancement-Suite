/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { frameThrottle } from './async';
import { downcast } from './flow';

export function waitForEvent(ele: EventTarget, ...events: string[]): Promise<void> {
	return Promise.race(events.map(event =>
		new Promise(resolve => ele.addEventListener(event, function fire() {
			ele.removeEventListener(event, fire);
			resolve();
		}))
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

export function watchForChildren(ele: Element, selector: string, callback: (ele: HTMLElement) => void | Promise<void>): void {
	for (const child of Array.from(ele.children).filter(child => child.matches(selector))) {
		callback(child);
	}

	watchForFutureChildren(ele, selector, callback);
}

export function watchForFutureChildren(ele: Element, selector: string, callback: (ele: HTMLElement) => void | Promise<void>): void {
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

export function watchForDescendants(ele: Element, selector: string, callback: (ele: HTMLElement) => void | Promise<void>): void {
	for (const child of ele.querySelectorAll(selector)) {
		callback(child);
	}

	watchForFutureDescendants(ele, selector, callback);
}

export function watchForFutureDescendants(ele: Element, selector: string, callback: (ele: HTMLElement) => void | Promise<void>): void {
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

export const getViewportSize = _.memoize((): { width: number, height: number } => {
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
		viewportSizedElement.remove();
	}

	return _.pick(visualViewport, ['height', 'width']);
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

let $bottomPaddingElement;

function padBottom(scrollTop, viewportHeight) {
	const currentPadding = $bottomPaddingElement ? $bottomPaddingElement.height() : 0;
	const extraPadding = 50; // In case the body's height reduces
	const paddingRequired = extraPadding +
		-(document.documentElement.scrollHeight - scrollTop - viewportHeight - currentPadding);
	if (paddingRequired > 0) {
		if (!$bottomPaddingElement) {
			$bottomPaddingElement = $('<div style="clear: both">').appendTo(document.body);
		}

		$bottomPaddingElement.height(paddingRequired).show();
	} else if ($bottomPaddingElement) {
		$bottomPaddingElement.hide();
	}
}

export type ScrollStyle = 'none' | 'top' | 'adopt' | 'middle' | 'page' | 'legacy' | 'directional';
type Direction = 'up' | 'down';
type Anchor = {| to: number, from: ?number |};

export function scrollToElement(to: HTMLElement, from: ?HTMLElement, { scrollStyle, direction: selectedDirection, anchor }: {| scrollStyle: ScrollStyle, direction?: Direction, anchor?: Anchor |}): void {
	if (scrollStyle === 'none') {
		if (anchor && typeof anchor.to === 'number') {
			const diff = to.getBoundingClientRect().top - anchor.to;
			if (diff) window.scrollBy(0, diff);
		}
		return;
	}

	const viewport = getViewportDimensions();

	const target = _.assignIn({}, to.getBoundingClientRect()); // top, right, bottom, left are relative to viewport
	target.top -= viewport.yOffset;
	target.bottom -= viewport.yOffset;

	const top = viewport.top + target.top - 5; /* offset */

	if (scrollStyle === 'middle' && target.height >= viewport.height) {
		scrollStyle = 'top';
	}

	if (scrollStyle === 'top') {
		// Always scroll element to top of page; pad bottom if necessary
		padBottom(top, viewport.height);
		scrollTo(0, top);
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

		scrollTo(0, window.scrollY + diff, false);
	} else if (scrollStyle === 'middle') {
		const buffer = (viewport.height - target.height) / 2;
		const newScrollY = top - buffer;

		if (elementInViewport(to)) {
			const viewportDirection = newScrollY >= window.scrollY ? 'down' : 'up';
			// Having these go in opposite directions is jarring
			if (viewportDirection !== selectedDirection) return;
		}

		scrollTo(0, newScrollY);
	} else if (target.top >= 0 && target.bottom <= viewport.height) {
		// Element is already completely inside viewport
		// (remember, top and bottom are relative to viewport)
		// do nothing
	} else if (scrollStyle === 'legacy') {
		// Element not completely in viewport, so scroll to top
		scrollTo(0, top);
	} else if (target.top < viewport.yOffset) {
		// Element starts above viewport
		// So, align top of element to top of viewport
		scrollTo(0, top);
	} else if (viewport.height < target.bottom &&
		target.height < viewport.height) {
		// Visible part of element starts or extends below viewport
		if (scrollStyle === 'page') {
			scrollTo(0, top);
		} else {
			// So, align bottom of target to bottom of viewport
			scrollTo(0, viewport.top + target.bottom - viewport.height);
		}
	} else {
		// Visible part of element below the viewport but it'll fill the viewport, or fallback
		// So, align top of element to top of viewport
		scrollTo(0, top);
	}
}

let recentScroll = false;

export function scrollTo(x: number, y: number, compensateHeader: boolean = true): void {
	recentScroll = true;
	waitForEvent(window, 'scroll').then(() => { recentScroll = false; });

	const headerOffset = compensateHeader ? getHeaderOffset() : 0;
	window.scrollTo(x, y - headerOffset);
}

scrollTo.isProgrammaticEvent = (): boolean => recentScroll;

// Automatically scroll elements vertically when the cursor is close to its edge
export class EdgeScroll {
	distanceStartScrolling: number = 40; // scroll when within this distance (px) from a edge
	element: HTMLElement; // layer which should be kept visible

	constructor(element: HTMLElement) {
		this.element = element;
	}

	// Find the element which prevents `b` from being fully displayed
	findBlocker(b: HTMLElement) {
		const _e = b.getBoundingClientRect();

		let p = b;
		while ((p = p.parentElement)) {
			const _p = p.getBoundingClientRect();
			if (
				p.scrollHeight - 1 > _p.height && // The element is scrollable
				(_p.top > _e.top || _e.bottom > _p.bottom) // The element covers the child
			) return p;
		}
	}

	update = frameThrottle((e: MouseEvent) => {
		let scrollElement = this.element;
		while ((scrollElement = this.findBlocker(scrollElement))) {
			const distances = {
				top: Math.ceil(e.clientY - Math.max(0, scrollElement.getBoundingClientRect().top)),
				bottom: Math.ceil(Math.min(
					getViewportSize().height,
					// 'document.documentElement''s scrollbar ends at the bottom of the viewport even if its rect height is less
					scrollElement === document.documentElement ? getViewportSize().height : scrollElement.getBoundingClientRect().bottom
				) - e.clientY),
			};

			if (distances.top < this.distanceStartScrolling) {
				scrollElement.scrollTop -= this.distanceStartScrolling - distances.top;
			} else if (distances.bottom < this.distanceStartScrolling) {
				scrollElement.scrollTop += this.distanceStartScrolling - distances.bottom;
			} else {
				continue;
			}

			// keep scrolling as long as the cursor is close to the edge
			this.update(e); // e will only be updated on mousemove
		}
	});

	start() { window.addEventListener('mousemove', this.update); }
	stop() { window.removeEventListener('mousemove', this.update); }
}

const headerIds = { fullWidth: [], partialWidth: [] };

export function _addHeaderId(elementId: string, partialWidth: boolean = false) {
	headerIds[partialWidth ? 'partialWidth' : 'fullWidth'].push(elementId);
}

export const getHeaderOffset = _.memoize((includePartialWidthHeaders?: boolean = false): number => {
	const headers = [
		...headerIds.fullWidth,
		...(includePartialWidthHeaders ? headerIds.partialWidth : []),
	];

	return headers
		.map(id => document.getElementById(id))
		.reduce((a, b) => a + b.getBoundingClientRect().height, 0);
});

export const getD2xBodyOffset = _.memoize(() => {
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
