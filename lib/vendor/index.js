/* @flow */

/**
 * This file re-exports global libraries, which technically could be accessed via the global object,
 * to ease the future pain of migrating them to proper libraries (imported from npm).
 *
 * `require` is used to ensure ordering (ES6 imports are hoisted - or at least Babel does it)
 */

/* eslint-disable import/imports-first, import/no-commonjs */

import jQuery from 'jquery'; // eslint-disable-line no-restricted-imports

const GLOBAL = (
	typeof global !== 'undefined' ? global :
	typeof window !== 'undefined' ? window :
	typeof self !== 'undefined' ? self :
	{}
);

if (!GLOBAL.window) GLOBAL.window = { __resWindow__: true }; // for debugging

require('intersection-observer');

/**
 * jQuery
 * vendor/jquery.edgescroll-0.1.js
 * vendor/jquery.tokeninput.js
 * vendor/tokenize.css
 */

export const $ = jQuery;

// $FlowIgnore
GLOBAL.window.$ = GLOBAL.window.jQuery = GLOBAL.$ = GLOBAL.jQuery = $;

// these all assume that jQuery or $ is a global
require('jquery-sortable');
require('./jquery.edgescroll-0.1');
require('./jquery.tokeninput');

/**
 * Guiders
 * vendor/guiders.js
 * vendor/guiders.css
 */

require('./guiders');

// $FlowIgnore
export const guiders = $.guiders;

/**
 * HTMLPasteurizer
 * vendor/HTMLPasteurizer.js
 */

require('./HTMLPasteurizer');

const Pasteurizer = GLOBAL.Pasteurizer;

$.fn.safeHtml = function(string) {
	return $(this).html(
		Pasteurizer.safeParseHTML(string || '').wrapAll('<div></div>').parent().html() || ''
	);
};
