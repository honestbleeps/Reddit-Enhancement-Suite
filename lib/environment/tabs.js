import { _sendMessage } from './_sendMessage';

/**
 * @param {string} url
 * @param {boolean} [focus=true]
 * @returns {Promise<void, *>} Resolves when the tab is opened.
 */
export function openNewTab(url, focus = true) {
	return openNewTabs(focus, url);
}

/**
 * @param {string|boolean} focus One of 'first', 'last' (or true), 'none' (or false)
 * @param {...string} urls May be relative.
 * @returns {Promise<void, *>} Resolves when the tabs are opened.
 */
export function openNewTabs(focus, ...urls) {
	let focusIndex;

	if (typeof focus !== 'string') focus = !!focus;

	switch (focus) {
		case 'first':
			focusIndex = 0;
			break;
		case true:
		case 'last':
			focusIndex = urls.length - 1;
			break;
		case false:
		case 'none':
			focusIndex = -1;
			break;
		default:
			throw new Error(`Invalid focus specified: ${focus}`);
	}

	// Expand relative URLs
	urls = urls.map(url => new URL(url, location.href).href);

	return _sendMessage('openNewTabs', { urls, focusIndex });
}
