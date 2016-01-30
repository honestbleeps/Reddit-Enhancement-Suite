/* eslint-env node */
/* exported location, document, sessionStorage, alert */

import jsdom from 'jsdom';
import jQuery from 'jquery';

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
