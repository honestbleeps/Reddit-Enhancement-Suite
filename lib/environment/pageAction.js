import { _addListener, _sendMessage } from './_sendMessage';

_addListener('pageActionClick', () => {
	const toggle = !modules['styleTweaks'].isSubredditStyleEnabled();
	modules['styleTweaks'].toggleSubredditStyle(toggle, RESUtils.currentSubreddit());
});

_addListener('pageActionRefresh', () => modules['styleTweaks'].updatePageAction());

/**
 * @param {boolean} [state=false]
 * @returns {Promise<void, *>}
 */
export function show(state = false) {
	if (process.env.BUILD_TARGET === 'safari') {
		return Promise.resolve();
	} else {
		return _sendMessage('pageAction', { operation: 'show', state });
	}
}

/**
 * @returns {Promise<void, *>}
 */
export function hide() {
	if (process.env.BUILD_TARGET === 'safari') {
		return Promise.resolve();
	} else {
		return _sendMessage('pageAction', { operation: 'hide' });
	}
}

/**
 * @returns {Promise<void, *>}
 */
export function destroy() {
	if (process.env.BUILD_TARGET === 'safari') {
		return Promise.resolve();
	} else {
		return _sendMessage('pageAction', { operation: 'destroy' });
	}
}
