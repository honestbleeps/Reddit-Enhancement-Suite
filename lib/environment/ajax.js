/* @flow */

import _ from 'lodash';
import { sendMessage } from '../../browser';
import { loggedInUserHash, string } from '../utils';
import { XhrCache } from './';

type ResponseType = 'text' | 'json' | 'redirect';

type AjaxOptions<Ty: ResponseType | void> = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	url: string,
	headers?: { [key: string]: string },
	data?: { [key: string]: string | number | boolean },
	type?: Ty,
	cacheFor?: number,
};

type RawResponse = {|
	status: number,
	url: string,
	text: string,
|};

class AjaxError extends Error {
	status: number;
	text: string;
	url: string;

	constructor(message, { status, text, url }) {
		super(message);
		this.status = status;
		this.text = text;
		this.url = url;
	}
}

/* eslint-disable no-redeclare */
declare function ajax(opt: AjaxOptions<void>): Promise<string>;
declare function ajax(opt: AjaxOptions<'text'>): Promise<string>;
declare function ajax(opt: AjaxOptions<'json'>): Promise<{ [key: string | number]: any }>;
declare function ajax(opt: AjaxOptions<'redirect'>): Promise<string>;

/**
 * Sends a same-origin or cross-origin XHR.
 *
 * @param {string} [method='GET']
 * @param {string} url May be a relative URL, appending any part of the current location is unnecessary.
 * @param {object} [headers] A collection of name-value pairs.
 * The Content-Type header defaults to application/x-www-form-urlencoded for POST requests.
 * The X-Modhash header defaults to the current user's modhash for same-origin POST requests.
 * @param {object|string} [data] If passed an object, will be encoded and converted to a query string. Appended to the url for GET requests.
 * @param {string} [type='text'] Affects the return value. One of 'text', 'json', or 'redirect'.
 * Only the responseText and status fields are guaranteed to be present for cross-origin requests.
 * @param {boolean} [cacheFor=0] Time in milliseconds.
 * @returns {Promise} Resolves if a response with status 200 is recieved (and parsing succeeds, for 'json' requests).
 * Rejects otherwise.
 */
export async function ajax({ method = 'GET', url: rawUrl, headers = {}, data: rawData, type = 'text', cacheFor = 0 }: AjaxOptions<*>) {
	const { url, data, sameOrigin } = buildRequestParams(method, rawUrl, rawData);
	const useCache = method === 'GET' && cacheFor;

	// Default non-GET content type
	if (method !== 'GET' && !('Content-Type' in headers)) {
		headers['Content-Type'] = 'application/x-www-form-urlencoded';
	}
	// Send modhash for same-origin non-GET requests
	if (method !== 'GET' && !('X-Modhash' in headers) && sameOrigin) {
		const hash = loggedInUserHash();
		if (hash) headers['X-Modhash'] = hash;
	}

	if (useCache) {
		const cached = await XhrCache.check(url, cacheFor);
		if (cached) {
			return processResponse(cached, type);
		}
	}

	let response;

	if (!sameOrigin) {
		response = await sendMessage('ajax', { method, url, headers, data });
	} else {
		const rawResponse = await fetch(url, {
			method,
			headers,
			credentials: 'include', // include cookies for same-origin requests (to load correct posts, etc.)
			body: (data: any),
		});

		response = {
			status: rawResponse.status,
			url: rawResponse.url,
			text: await rawResponse.text(),
		};
	}

	// Edge sets status to 0 for local resources
	if (response.status !== 200 && response.status !== 0) {
		throw new AjaxError(`XHR status ${response.status} - url: ${url}`, response);
	}

	if (useCache) {
		XhrCache.set(url, response);
	}

	return processResponse(response, type);
}
/* eslint-enable no-redeclare */

ajax.invalidate = ({ url, data = {} }: AjaxOptions<*>) =>
	XhrCache.delete(buildRequestParams('GET', url, data).url);

function buildRequestParams(method, url, data) {
	// Expand relative URLs
	const urlObj = new URL(url, location.href);
	const sameOrigin = urlObj.hostname.includes(location.hostname.split('.').slice(-2).join('.'));
	// Convert data object to query string
	if (_.isPlainObject(data) /*:: && typeof data === 'object' */) {
		data = Object.entries(data).map(([key, value]) => string.encode`${key}=${value}`).join('&');
	}
	// Append data query string to URL for GET requests
	if ((method === 'GET' || method === 'HEAD') && typeof data === 'string') {
		urlObj.search += `${urlObj.search.includes('?') ? '&' : '?'}${data}`;
		data = undefined;
	}
	// Add `app=res` to same-origin request URLs
	if (sameOrigin) {
		urlObj.search += `${urlObj.search.includes('?') ? '&' : '?'}app=res`;
	}
	return { url: urlObj.href, data, sameOrigin };
}

function processResponse(response: RawResponse, type: ResponseType) {
	switch (type) {
		case 'text':
			return response.text;
		case 'json':
			return JSON.parse(response.text);
		case 'redirect':
			return response.url;
		default:
			throw new Error(`Invalid type: ${type}`);
	}
}
