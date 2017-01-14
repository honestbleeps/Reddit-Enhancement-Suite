/* @flow */

import jQuery from 'jquery'; // eslint-disable-line no-restricted-imports

export const $ = jQuery;

// set up globals expected by legacy jQuery plugins
const GLOBAL = (
	typeof global !== 'undefined' ? global :
	typeof window !== 'undefined' ? window :
	typeof self !== 'undefined' ? self :
	{}
);

if (!GLOBAL.window) GLOBAL.window = { __resWindow__: true }; // for debugging

// $FlowIgnore
GLOBAL.window.$ = GLOBAL.window.jQuery = GLOBAL.$ = GLOBAL.jQuery = $;
