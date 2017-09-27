/* @flow */

import _ from 'lodash';
import * as Init from '../core/init'; // eslint-disable-line import/no-restricted-paths
import * as Modules from '../core/modules'; // eslint-disable-line import/no-restricted-paths
import { $ } from '../vendor';
import type { Iteratee } from './array';

export function waitForEvent(ele: EventTarget, ...events: string[]): Promise<void> {
	return Promise.race(events.map(event =>
		new Promise(resolve => ele.addEventListener(event, function fire() {
			ele.removeEventListener(event, fire);
			resolve();
		}))
	));
}

/**
 * Shorthand for attaching a MutationObserver to `ele`
 * @param {!Node} ele
 * @param {!MutationObserverInit} options
 * @param {function(MutationRecord, number, MutationRecord[]): ?boolean} callback Invoked for each `MutationRecord` in a batch.
 * Return true to stop handling mutations from the current batch.
 * @returns {MutationObserver}
 */
export function observe(ele: Node, options: *, callback: Iteratee<MutationRecord, ?boolean>) {
	const observer = new MutationObserver(mutations => mutations.some(callback));
	observer.observe(ele, options);
	return observer;
}

export function waitForChild(ele: Element, selector: string): Promise<void> {
	return new Promise(resolve => {
		if (Array.from(ele.children).some(child => child.matches(selector))) {
			resolve();
			return;
		}

		const observer = observe(ele, { childList: true }, mutation => {
			if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE && (node: any).matches(selector))) {
				observer.disconnect();
				resolve();
				return true;
			}
		});
	});
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

	const viewportSizedElement = document.createElement('div');
	viewportSizedElement.style.width = viewportSizedElement.style.height = '100%';
	viewportSizedElement.style.position = 'fixed';
	document.body.appendChild(viewportSizedElement);
	const size = _.pick(viewportSizedElement.getBoundingClientRect(), ['height', 'width']);
	viewportSizedElement.remove();
	return size;
});

export function elementInViewport(ele: Element): boolean {
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

export function scrollToElement(element: Element, { scrollStyle, direction: selectedDirection, from }: {| scrollStyle: ScrollStyle, direction?: Direction, from?: ?Element |}): void {
	if (scrollStyle === 'none') return;

	const viewport = getViewportDimensions();
	const target = _.assignIn({}, element.getBoundingClientRect()); // top, right, bottom, left are relative to viewport
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
		const { top: fromTop } = from.getBoundingClientRect();
		let diff = element.getBoundingClientRect().top - fromTop;

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

		if (elementInViewport(element)) {
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

export const getHeaderOffset = _.memoize((includePartialWidthHeaders?: boolean = false): number => {
	const headers = [];

	// ideally we would import betteReddit directly,
	// but we can't depend on any modules without causing a bird's nest of circular dependencies
	if (Modules.isRunning('betteReddit')) {
		switch (Modules.get('betteReddit').options.pinHeader.value) {
			case 'userbar':
				if (includePartialWidthHeaders) headers.push(document.getElementById('header-bottom-right'));
				break;
			case 'sub':
				headers.push(document.getElementById('sr-header-area'));
				break;
			case 'subanduser':
				headers.push(document.getElementById('sr-header-area'));
				if (includePartialWidthHeaders) headers.push(document.getElementById('header-bottom-right'));
				break;
			case 'header':
				headers.push(document.getElementById('header'));
				break;
			case 'none':
			default:
				break;
		}
	}

	return headers.reduce((a, b) => a + b.getBoundingClientRect().height, 0);
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

	Init.headReady.then(() => document.head.appendChild(style));

	return style;
}
