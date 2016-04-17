import { _addListener, _sendMessage } from 'environment';

_addListener('multicast', ({ moduleID, method, args }) => RESUtils.rpc(moduleID, method, args));

/**
 * Calls `modules[moduleID][method](...args)` in all other tabs.
 * @template T
 * @param {string} moduleID
 * @param {string} method
 * @param {...*} args
 * @returns {Promise<T[], *>} An array of results from all other tabs, in no specified order.
 */
export function multicast(moduleID, method, ...args) {
	return _sendMessage('multicast', { moduleID, method, args });
}
