/* eslint-env node */
/* eslint-disable import/no-unresolved */
/* exported location, document, sessionStorage, alert */

import jQuery from 'jquery';
import jsdom from 'jsdom';

export const document = jsdom.jsdom(undefined, { url: 'https://www.reddit.com/' });
export const window = document.defaultView;
export const location = window.location;
export const DOMParser = window.DOMParser;

export const $ = jQuery(window);

export const sessionStorage = {
	getItem() {
		return undefined;
	}
};

export function alert(msg) {
	console.error('[ALERT]', msg);
}
