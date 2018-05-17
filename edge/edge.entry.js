/* @noflow */

/* Microsoft Edge Support */

// polyfill fetch()
import './remove-fetch';
import 'whatwg-fetch';

window.chrome = window.browser; // eslint-disable-line no-native-reassign

// DOM Collection iteration
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// https://developer.microsoft.com/en-us/microsoft-edge/platform/status/requestidlecallback/
if (typeof requestIdleCallback === 'undefined') {
	window.requestIdleCallback = fn => requestAnimationFrame(() => { requestAnimationFrame(fn); });
}
