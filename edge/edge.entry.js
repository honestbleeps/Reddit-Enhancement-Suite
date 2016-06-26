/* Microsoft Edge Support */

if (typeof window.msBrowser !== 'undefined') {
	window.chrome = window.msBrowser; // eslint-disable-line no-native-reassign
} else if (typeof window.browser !== 'undefined') {
	window.chrome = window.browser; // eslint-disable-line no-native-reassign
}

// DOM Collection iteration
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
