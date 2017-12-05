/* @flow */

import { LRUCache } from '../../utils';
import { addListener } from './messaging';

const cache = new LRUCache(512);
addListener('XHRCache', ([operation, key, value]) => {
	switch (operation) {
		case 'set':
			cache.set(key, value);
			break;
		case 'check':
			return cache.get(key, value);
		case 'delete':
			return cache.delete(key);
		case 'clear':
			return cache.clear();
		default:
			throw new Error(`Invalid XHRCache operation: ${operation}`);
	}
});
