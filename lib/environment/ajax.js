/* @flow */

import _ from 'lodash';
import { loggedInUserHash, string } from '../utils';
import { XhrCache } from './';
import { sendMessage } from 'browserEnvironment';

type ResponseType = 'text' | 'json' | 'raw';

type AjaxOptions<Ty: ResponseType | void> = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	url: string,
	headers?: { [key: string]: string },
	data?: { [key: string]: string | number | boolean },
	type?: Ty,
	credentials?: boolean,
	cacheFor?: number,
};

type XhrResponse = { // eslint-disable-line no-unused-vars
	status: number,
	responseText: string,
	responseURL: string,
};

class AjaxError extends Error {
	status: number;
	responseText: string;
	responseURL: string;

	constructor(message, { status, responseText, responseURL }) {
		super(message);
		this.status = status;
		this.responseText = responseText;
		this.responseURL = responseURL;
	}
}

/* eslint-disable no-redeclare */
declare function ajax(opt: AjaxOptions<void>): Promise<string>;
declare function ajax(opt: AjaxOptions<'text'>): Promise<string>;
declare function ajax(opt: AjaxOptions<'json'>): Promise<{ [key: string | number]: any }>;
declare function ajax(opt: AjaxOptions<'raw'>): Promise<XhrResponse>;

/**
 * Sends a same-origin or cross-origin XHR.
 *
 * @param {string} [method='GET']
 * @param {string} url May be a relative URL, appending any part of the current location is unnecessary.
 * @param {object} [headers] A collection of name-value pairs.
 * The Content-Type header defaults to application/x-www-form-urlencoded for POST requests.
 * The X-Modhash header defaults to the current user's modhash for same-origin POST requests.
 * @param {object|string} [data] If passed an object, will be encoded and converted to a query string. Appended to the url for GET requests.
 * @param {string} [type='text'] Affects the return value. One of 'text' (for responseText), 'json' (responseText parsed as JSON), or 'raw' (the entire XHR object).
 * Only the responseText and status fields are guaranteed to be present for cross-origin requests.
 * @param {boolean} [credentials=false]
 * @param {boolean} [cacheFor=0] Time in milliseconds.
 * @returns {Promise<string|!Object|XMLHttpRequest, Error>} Resolves if a response with status 200 is recieved (and parsing succeeds, for 'json' requests).
 * Rejects otherwise.
 */
export async function ajax({ method = 'GET', url: rawUrl, headers = {}, data: rawData = {}, type = 'text', credentials = false, cacheFor = 0 }: AjaxOptions<*>) {
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
		response = await sendMessage('ajax', { method, url, headers, data, credentials });
	} else {
		const request = new XMLHttpRequest();

		const load = Promise.race([
			new Promise(resolve => (request.onload = resolve)),
			new Promise(resolve => (request.onerror = resolve))
				.then(() => {
					throw new AjaxError(`XHR error - url: ${url}`, request);
				}),
		]);

		request.open(method, url, true);

		for (const name in headers) {
			request.setRequestHeader(name, headers[name]);
		}

		if (credentials) {
			request.withCredentials = true;
		}

		request.send(data);
		await load;
		response = request;
	}

	// some browsers (Edge, Safari) set status to 0 for local resources
	if (response.status !== 200 && response.status !== 0) {
		throw new AjaxError(`XHR status ${response.status} - url: ${url}`, response);
	}

	if (useCache) {
		XhrCache.set(url, {
			status: response.status,
			responseText: response.responseText,
			responseURL: response.responseURL,
		});
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
		data = _.map(data, (value: string | number, key: string): string => string.encode`${key}=${value}`).join('&');
	}
	// Append data query string to URL for GET requests
	if (method === 'GET' && typeof data === 'string' && data) {
		urlObj.search += `${urlObj.search.includes('?') ? '&' : '?'}${data}`;
	}
	// Add `app=res` to same-origin request URLs
	if (sameOrigin) {
		urlObj.search += `${urlObj.search.includes('?') ? '&' : '?'}app=res`;
	}
	return { url: urlObj.href, data, sameOrigin };
}

function processResponse(response, type: ResponseType) {
	switch (type) {
		case 'text':
			return response.responseText;
		case 'json':
			return JSON.parse(response.responseText);
		case 'raw':
			return response;
		default:
			throw new Error(`Invalid type: ${type}`);
	}
}
