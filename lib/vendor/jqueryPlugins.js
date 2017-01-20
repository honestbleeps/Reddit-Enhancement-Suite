/**
 * These dependencies all assume that jQuery or $ is a global.
 */

/* @flow */
/* eslint-disable import/imports-first */

import { $ } from './jquery';

/**
 * jQuery plugins
 * vendor/jquery.edgescroll-0.1.js
 * vendor/jquery.tokeninput.js
 * vendor/tokenize.css
 */

import 'jquery-sortable';
import './jquery.edgescroll-0.1';
import './jquery.tokeninput';

/**
 * Guiders
 * vendor/guiders.js
 * vendor/guiders.css
 */

import './guiders';

// $FlowIgnore
export const guiders = $.guiders;

/**
 * HTMLPasteurizer
 * vendor/HTMLPasteurizer.js
 */

import { Pasteurizer } from './HTMLPasteurizer';

$.fn.safeHtml = function(string) {
	return $(this).html(
		Pasteurizer.safeParseHTML(string || '').wrapAll('<div></div>').parent().html() || ''
	);
};
