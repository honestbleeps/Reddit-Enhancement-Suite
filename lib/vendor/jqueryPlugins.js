/**
 * These dependencies all assume that jQuery or $ is a global.
 */

/* @flow */
/* eslint-disable import/imports-first */

import { $ } from './jquery';

/**
 * jQuery plugins
 */

import 'jquery.tokeninput';

/**
 * Guiders
 * vendor/guiders.js
 * vendor/guiders.css
 */

import './guiders';

// $FlowIgnore
export const guiders = $.guiders;

/**
 * SafeHTML: DOMPurify + HTMLPasteurizer
 * vendor/safeHtml.js
 */

import safeHtml from './safeHtml';

$.fn.safeHtml = function(string) {
	return $(this).empty().append(safeHtml(string));
};
