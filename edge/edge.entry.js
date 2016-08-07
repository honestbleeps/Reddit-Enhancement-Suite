/* Microsoft Edge Support */

window.chrome = window.browser; // eslint-disable-line no-native-reassign

// DOM Collection iteration
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
