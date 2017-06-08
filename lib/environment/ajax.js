/* @flow */

import _ from 'lodash';
import { sendMessage } from '../../browser';
import { loggedInUserHash } from '../utils';
import { XhrCache } from './';

type ResponseType = 'text' | 'json' | 'raw';
type MethodType = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type AjaxOptions<Ty: ResponseType | void> = {|
	method?: MethodType,
	url: string,
	query?: { [key: string]: string | number | boolean },
	headers?: { [key: string]: string },
	data?: string | { [key: string]: string },
	type?: Ty,
	cacheFor?: number,
|};

class FetchError extends Error {
	status: number;

	constructor(url, status) {
		super(`${url} failed with status ${status}`);
		this.status = status;
	}
}

/* eslint-disable no-redeclare */
declare function ajax(opt: AjaxOptions<void>): Promise<string>;
declare function ajax(opt: AjaxOptions<'text'>): Promise<string>;
declare function ajax(opt: AjaxOptions<'json'>): Promise<{ [key: string | number]: any }>;
declare function ajax(opt: AjaxOptions<'raw'>): Promise<{
	ok: boolean,
	status: number,
	headers: { [key: string]: string },
	text: string,
}>;

/**
 * Send a fetch request.
 *
 * `method`, `url`, and `headers` behave in the obvious way.
 * `query` adds query params to `url`.
 * `data` objects will be sent as application/x-www-form-urlencoded.
 * `data` strings will be sent as-is.
 * `type` affects the return type, either 'text' or 'json'.
 * `cacheFor` is a TTL, in milliseconds.
 */
export async function ajax(options: AjaxOptions<*>) {
	const { method, url, headers, data, type, cacheFor, sameOrigin } = buildRequestParams(options);

	if (cacheFor) {
		const cached = await XhrCache.check(url, cacheFor);
		if (cached) {
			return processResponse(cached, type);
		}
	}

	const response = await (sameOrigin ?
			fetch(url, {
				method,
				headers,
				credentials: 'include', // include cookies for same-origin requests (to load correct posts, etc.)
				body: data,
			}).then(async r => ({
				ok: r.ok,
				status: r.status,
				headers: _.fromPairs(Array.from(r.headers.entries())),
				text: await r.text(),
			})) :
			sendMessage('ajax', { method, url, headers, data })
	);

	if (!response.ok) {
		throw new FetchError(url, response.status);
	}

	if (cacheFor) {
		XhrCache.set(url, response);
	}

	return processResponse(response, type);
}
/* eslint-enable no-redeclare */

ajax.invalidate = (options: AjaxOptions<*>) =>
	XhrCache.delete(buildRequestParams(options).url);

function buildRequestParams({ method = 'GET', url, query = {}, headers: { ...headers } = {}, data, type = 'text', cacheFor = 0 }): {|
	method: MethodType,
	url: string,
	headers: { [key: string]: string },
	data: string | void,
	type: ResponseType,
	cacheFor: number,
	sameOrigin: boolean,
|} {
	// Expand relative URLs
	const urlObj = new URL(url, location.href);
	// Append query string to URL
	for (const [key, val] of Object.entries(query)) {
		urlObj.searchParams.set(key, String(val));
	}

	const sameOrigin = urlObj.hostname.includes(location.hostname.split('.').slice(-2).join('.'));
	if (sameOrigin) {
		// Add `app=res` to same-origin request URLs
		urlObj.searchParams.set('app', 'res');

		if (method !== 'GET' && method !== 'HEAD') {
			// Send modhash for same-origin non-GET requests
			const hash = loggedInUserHash();
			if (hash) headers['X-Modhash'] = hash;
		}
	}

	// Convert plain data objects to application/x-www-form-urlencoded
	if (typeof data === 'object') {
		headers['Content-Type'] = 'application/x-www-form-urlencoded';
		// this needs to be a string because Edge doesn't support sending URlSearchParams
		// (the fetch polyfill passes it through to XHR, which is correct behaviour)
		data = new URLSearchParams(data).toString();
	}

	return {
		method,
		url: urlObj.href,
		headers,
		data,
		type,
		cacheFor,
		sameOrigin,
	};
}

function processResponse(response, type: ResponseType) {
	switch (type) {
		case 'text':
			return response.text;
		case 'json':
			return JSON.parse(response.text);
		case 'raw':
			return response;
		default:
			throw new Error(`Invalid type: ${type}`);
	}
}
