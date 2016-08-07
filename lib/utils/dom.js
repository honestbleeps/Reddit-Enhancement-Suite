import _ from 'lodash';
import * as Init from '../core/init'; // eslint-disable-line import/no-restricted-paths
import * as Modules from '../core/modules'; // eslint-disable-line import/no-restricted-paths
import { $ } from '../vendor';

export function waitForEvent(ele, ...events) {
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
export function observe(ele, options, callback) {
	if (typeof MutationObserver !== 'function') {
		return {
			observe() {},
			disconnect() {},
			takeRecords() { return []; },
		};
	}

	const observer = new MutationObserver(mutations => mutations.some(callback));
	observer.observe(ele, options);
	return observer;
}

export function waitForChild(ele, selector) {
	return new Promise(resolve => {
		if (Array.from(ele.children).some(child => $(child).is(selector))) {
			resolve();
			return;
		}

		const observer = observe(ele, { childList: true }, mutation => {
			if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE && $(node).is(selector))) {
				observer.disconnect();
				resolve();
				return true;
			}
		});
	});
}

export function click(obj, button = 0) {
	const evt = document.createEvent('MouseEvents');
	evt.initMouseEvent('click', true, true, window.wrappedJSObject, 0, 1, 1, 1, 1, false, false, false, false, button, null);
	obj.dispatchEvent(evt);
}

click.isProgrammaticEvent = e => {
	e = e.originalEvent || e;
	return e.clientX === 1 && e.clientY === 1;
};

export function mousedown(obj, button = 0) {
	const evt = document.createEvent('MouseEvents');
	evt.initMouseEvent('mousedown', true, true, window.wrappedJSObject, 0, 1, 1, 1, 1, false, false, false, false, button, null);
	obj.dispatchEvent(evt);
}

export function elementInViewport(ele) {
	if (!ele) return false;

	const { top, left, bottom, right } = ele.getBoundingClientRect();
	const $window = $(window);

	return (
		top >= 0 &&
		left >= 0 &&
		bottom <= $window.height() &&
		right <= $window.width()
	);
}

function getViewportDimensions() {
	const headerOffset = getHeaderOffset();

	const dimensions = {
		yOffset: headerOffset,
		x: window.pageXOffset,
		y: window.pageYOffset + headerOffset,
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight - headerOffset,
	};
	dimensions.top = dimensions.y;
	dimensions.left = dimensions.x;
	dimensions.bottom = dimensions.top + dimensions.height;
	dimensions.right = dimensions.left + dimensions.width;

	return dimensions;
}

// Returns percentage of the element that is within the viewport along the y-axis
// Note that it doesn't matter where the element is on the x-axis, it can be totally invisible to the user
// and this function might still return 1!
export function getPercentageVisibleYAxis(obj) {
	const rect = obj.getBoundingClientRect();
	const top = Math.max(0, rect.bottom - rect.height);
	const bottom = Math.min(document.documentElement.clientHeight, rect.bottom);
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

export function scrollToElement(element, { scrollStyle, direction: selectedDirection }) {
	const viewport = getViewportDimensions();
	const target = _.assignIn({}, element.getBoundingClientRect()); // top, right, bottom, left are relative to viewport
	target.top -= viewport.yOffset;
	target.bottom -= viewport.yOffset;

	let top = viewport.y + target.top - 5; /* offset */

	if (scrollStyle === 'middle' && target.height >= viewport.height) {
		scrollStyle = 'top';
	}

	if (scrollStyle === 'none') {
		return;
	} else if (scrollStyle === 'top') {
		// Always scroll element to top of page; pad bottom if necessary
		padBottom(top, viewport.height);
		scrollTo(0, top);
	} else if (scrollStyle === 'middle') {
		const buffer = (viewport.height - target.height) / 2;
		top -= buffer;

		if (elementInViewport(element)) {
			const viewportDirection = top >= scrollY ? 'down' : 'up';
			// Having these go in opposite directions is jarring
			if (viewportDirection !== selectedDirection) return;
		}

		scrollTo(0, top);
	} else if (target.top >= 0 && target.bottom <= viewport.height) {
		// Element is already completely inside viewport
		// (remember, top and bottom are relative to viewport)
		return;
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
			scrollTo(0, viewport.y + target.bottom - viewport.height);
		}
		return;
	} else {
		// Visible part of element below the viewport but it'll fill the viewport, or fallback
		// So, align top of element to top of viewport
		scrollTo(0, top);
	}
}

export function scrollTo(x, y) {
	const headerOffset = getHeaderOffset();
	window.scrollTo(x, y - headerOffset);
}

export const getHeaderOffset = _.once(() => {
	let header;

	// ideally we would import betteReddit directly,
	// but we can't depend on any modules without causing a bird's nest of circular dependencies
	if (Modules.isRunning('betteReddit')) {
		switch (Modules.get('betteReddit').options.pinHeader.value) {
			case 'sub':
			case 'subanduser':
				header = document.getElementById('sr-header-area');
				break;
			case 'header':
				header = document.getElementById('header');
				break;
			case 'none':
			default:
				break;
		}
	}

	if (header) {
		return header.offsetHeight + 6;
	}

	return 0;
});

export function addCSS(css) {
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
