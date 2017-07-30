/* @noflow */

/* Microsoft Edge Support */

// polyfill DOM4 methods
import 'dom4';

// polyfill fetch()
import './remove-fetch';
import 'whatwg-fetch';

window.chrome = window.browser; // eslint-disable-line no-native-reassign

// DOM Collection iteration
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

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
