import _ from 'lodash';
import { XhrCache, _sendMessage } from './';
import { loggedInUserHash, string } from '../utils';

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
export async function ajax({ method = 'GET', url: rawUrl, headers = {}, data: rawData = {}, type = 'text', credentials = false, cacheFor = 0 }) {
	const { url, data, sameOrigin } = buildRequestParams(method, rawUrl, rawData);
	const useCache = method === 'GET' && cacheFor;

	// Default POST content type
	if (method === 'POST' && !('Content-Type' in headers)) {
		headers['Content-Type'] = 'application/x-www-form-urlencoded';
	}
	// Send modhash for same-origin POST requests
	if (method === 'POST' && !('X-Modhash' in headers) && sameOrigin) {
		headers['X-Modhash'] = loggedInUserHash();
	}

	if (useCache) {
		const cached = await XhrCache.check(url, cacheFor);
		if (cached) {
			return processResponse(cached, type);
		}
	}

	let response;

	if (!sameOrigin) {
		response = await _sendMessage('ajax', { method, url, headers, data, credentials });
	} else {
		const request = new XMLHttpRequest();

		const load = Promise.race([
			new Promise(resolve => (request.onload = resolve)),
			new Promise(resolve => (request.onerror = resolve))
				.then(() => { throw new Error(`XHR error - url: ${url}`); })
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
		throw new Error(`XHR status ${response.status} - url: ${url}`);
	}

	if (useCache) {
		XhrCache.set(url, {
			status: response.status,
			responseText: response.responseText,
			responseURL: response.responseURL
		});
	}

	return processResponse(response, type);
}

ajax.invalidate = ({ url, data = {} }) =>
	XhrCache.delete(buildRequestParams('GET', url, data).url);

function buildRequestParams(method, url, data) {
	// Expand relative URLs
	const urlObj = new URL(url, location.href);
	const sameOrigin = urlObj.hostname.includes(location.hostname.split('.').slice(-2).join('.'));
	// Convert data object to query string
	if (_.isPlainObject(data)) {
		data = _.map(data, (value, key) => string.encode`${key}=${value}`).join('&');
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

function processResponse(response, type) {
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
