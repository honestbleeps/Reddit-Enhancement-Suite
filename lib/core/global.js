/**
 * This file re-exports global libraries, which technically could be accessed via the global object,
 * to ease the future pain of migrating them to proper libraries (imported from npm).
 */

/* eslint-disable import/imports-first, sort-imports-es6/sort-imports-es6 */

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

// these all assume that jQuery or $ is a global
import 'jquery-sortable';
import '../vendor/jquery.edgescroll-0.1';
import '../vendor/jquery.tokeninput';

$.fn.safeHtml = function(string) {
	if (!string) return '';
	else return $(this).html(sanitizeHTML(string));
};

/**
 * Guiders
 * vendor/guiders.js
 * vendor/guiders.css
 */

import '../vendor/guiders';

export const guiders = GLOBAL.guiders;

/**
 * HTMLPasteurizer
 * vendor/HTMLPasteurizer.js
 */

import '../vendor/HTMLPasteurizer';

export const Pasteurizer = GLOBAL.Pasteurizer;
