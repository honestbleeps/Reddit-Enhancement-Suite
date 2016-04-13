import _ from 'lodash';
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
			takeRecords() { return []; }
		};
	}

	const observer = new MutationObserver(mutations => mutations.some(callback));
	observer.observe(ele, options);
	return observer;
}

export function waitForChild(ele, selector, { initialCheck = true } = {}) {
	return new Promise(resolve => {
		if (initialCheck && Array.from(ele.children).some(child => $(child).is(selector))) {
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

click.isProgrammaticEvent = function(e) {
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
		width: window.innerWidth,
		height: window.innerHeight - headerOffset
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

export function scrollToElement(element, options) {
	options = $.extend(true, {
		topOffset: 5,
		makeVisible: undefined
	}, options);

	let target = (options.makeVisible || element).getBoundingClientRect(); // top, right, bottom, left are relative to viewport
	const viewport = getViewportDimensions();

	target = $.extend({}, target);
	target.top -= viewport.yOffset;
	target.bottom -= viewport.yOffset;

	const top = viewport.y + target.top - options.topOffset; // for DRY

	if (options.scrollStyle === 'none') {
		return;
	} else if (options.scrollStyle === 'top') {
		// Always scroll element to top of page
		scrollTo(0, top);
	} else if (target.top >= 0 && target.bottom <= viewport.height) {
		// Element is already completely inside viewport
		// (remember, top and bottom are relative to viewport)
		return;
	} else if (options.scrollStyle === 'legacy') {
		// Element not completely in viewport, so scroll to top
		scrollTo(0, top);
	} else if (target.top < viewport.yOffset) {
		// Element starts above viewport
		// So, align top of element to top of viewport
		scrollTo(0, top);
	} else if (viewport.height < target.bottom &&
		target.height < viewport.height) {
		// Visible part of element starts or extends below viewport

		if (options.scrollStyle === 'page') {
			scrollTo(0, viewport.y + target.top - options.topOffset);
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
	let headerOffset = 0;
	if (modules['betteReddit'].isEnabled()) {
		switch (modules['betteReddit'].options.pinHeader.value) {
			case 'sub':
			case 'subanduser':
				header = document.getElementById('sr-header-area');
				break;
			case 'header':
				header = document.getElementById('header');
				break;
			// case 'none':
			default:
				break;
		}
	}
	if (header) {
		headerOffset = header.offsetHeight + 6;
	}

	return headerOffset;
});

function fadeElementTo(el, speedInSeconds, finalOpacity) {
	return new Promise(resolve => {
		start();

		function start() {
			if (el._resIsFading) {
				return;
			} else if (finalOpacity === 0 && el.style.display === 'none') {
				// already faded out, don't need to fade out again.
				done();
				return;
			} else {
				setup();
				go();
			}
		}

		function setup() {
			el._resIsFading = true;

			if (el.style.display === 'none' || el.style.display === '') {
				el.style.display = 'block';
			}

			if (typeof finalOpacity === 'undefined') {
				finalOpacity = 1;
			}
		}

		function go() {
			$(el).fadeTo(speedInSeconds * 1000, finalOpacity, done);
		}

		function done() {
			el.style.opacity = finalOpacity;
			if (finalOpacity <= 0) {
				el.style.display = 'none';
			}
			delete el._resIsFading;
			resolve();
		}
	});
}

export function fadeElementOut(el, speed) {
	return fadeElementTo(el, speed, 0);
}

export function fadeElementIn(el, speed, finalOpacity) {
	return fadeElementTo(el, speed, finalOpacity);
}
