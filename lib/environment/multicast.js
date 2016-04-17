import { _addListener, _sendMessage } from 'environment';

_addListener('multicast', ({ moduleID, method, args }) => {
	if (args && args[args.length - 1] === 'rpc') {
		console.warn('rpc warning: loop.', moduleID, method, args);
		return 'rpc loop suspected';
	}
	const module = modules[moduleID];
	if (!module || typeof module[method] !== 'function') {
		console.warn('rpc error: could not find method.', moduleID, method, args);
		return 'could not find method';
	}

	const sanitized = args ?
		[].concat(JSON.parse(JSON.stringify(args))) :
		[];

	return module[method](...sanitized, 'rpc');
});

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
