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
