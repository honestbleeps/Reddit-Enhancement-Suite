/**
 * This file re-exports global libraries, which technically could be accessed via the global object,
 * to ease the future pain of migrating them to proper libraries (imported from npm).
 */

import jQuery from 'jquery';
import { sanitizeHTML } from '../utils';

const GLOBAL = (
	typeof window !== 'undefined' ? window :
	typeof global !== 'undefined' ? global :
	typeof self !== 'undefined' ? self :
	{}
);

/**
 * jQuery
 * vendor/jquery.edgescroll-0.1.js
 * vendor/jquery.tokeninput.js
 * vendor/tokenize.css
 */

export const $ = jQuery(GLOBAL);

GLOBAL.$ = GLOBAL.jQuery = $;

// this assumes that jQuery is a global, but at least it's on npm
import 'jquery-sortable'; // eslint-disable-line

$.fn.safeHtml = function(string) {
	if (!string) return '';
	else return $(this).html(sanitizeHTML(string));
};

/**
 * Guiders
 * vendor/guiders.js
 * vendor/guiders.css
 */

export const guiders = GLOBAL.guiders;

/**
 * HTMLPasteurizer
 * vendor/HTMLPasteurizer.js
 */

export const Pasteurizer = GLOBAL.Pasteurizer;
