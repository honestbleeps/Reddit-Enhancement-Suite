/* @flow */

import { sendMessage } from '../../browser';
import { loggedInUserHash } from '../utils';
import { XhrCache } from './';

type ResponseType = 'text' | 'json';
type MethodType = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type AjaxOptions<Ty: ResponseType | void> = {
	method?: MethodType,
	url: string,
	headers?: { [key: string]: string },
	data?: string | { [key: string]: string | number | boolean },
	type?: Ty,
	cacheFor?: number,
};

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

/**
 * Send a fetch request.
 *
 * `method`, `url`, and `headers` behave in the obvious way.
 * `data` objects will be appended as query parameters for GET-like requests.
 * `data` objects will be sent as application/x-www-form-urlencoded for non-GET-like requests.
 * `data` strings will be sent as-is for non-GET-like requests.
 * `type` affects the return type, either 'text' or 'json'.
 * `cacheFor` is a TTL, in milliseconds, only for GET-like requests.
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
				status: r.status,
				text: await r.text(),
			})) :
			sendMessage('ajax', { method, url, headers, data })
	);

	if (response.status !== 200) {
		throw new FetchError(url, response.status);
	}

	if (cacheFor) {
		XhrCache.set(url, response.text);
	}

	return processResponse(response.text, type);
}
/* eslint-enable no-redeclare */

ajax.invalidate = (options: AjaxOptions<*>) =>
	XhrCache.delete(buildRequestParams(options).url);

function buildRequestParams({ method = 'GET', url, headers: { ...headers } = {}, data, type = 'text', cacheFor = 0 }): {|
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

	const sameOrigin = urlObj.hostname.includes(location.hostname.split('.').slice(-2).join('.'));

	if (method === 'GET' || method === 'HEAD') {
		// Append query string to URL for GET requests
		if (typeof data === 'object') {
			for (const [key, val] of Object.entries(data)) {
				urlObj.searchParams.set(key, (val: any));
			}
			data = undefined;
		}
	} else {
		// Convert plain data objects to application/x-www-form-urlencoded
		if (typeof data === 'object') {
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
			// this needs to be a string because Edge doesn't support sending URlSearchParams
			// (the fetch polyfill passes it through to XHR, which is correct behaviour)
			data = new URLSearchParams((data: any)).toString();
		}

		// Send modhash for same-origin non-GET requests
		if (sameOrigin) {
			const hash = loggedInUserHash();
			if (hash) headers['X-Modhash'] = hash;
		}

		// Never cache non-GET-like requests
		cacheFor = 0;
	}

	// Add `app=res` to same-origin request URLs
	if (sameOrigin) {
		urlObj.searchParams.set('app', 'res');
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

function processResponse(text: string, type: ResponseType) {
	switch (type) {
		case 'text':
			return text;
		case 'json':
			return JSON.parse(text);
		default:
			throw new Error(`Invalid type: ${type}`);
	}
}
