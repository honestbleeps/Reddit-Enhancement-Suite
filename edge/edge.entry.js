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
