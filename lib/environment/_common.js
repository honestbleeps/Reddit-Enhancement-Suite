import Cache from '../utils/Cache';

export function addCommonBackgroundListeners(addListener) {
	const session = new Map();

	addListener('session', ([operation, key, value]) => {
		switch (operation) {
			case 'get':
				return session.get(key);
			case 'set':
				session.set(key, value);
				break;
			case 'delete':
				return session.delete(key);
			case 'clear':
				return session.clear();
			default:
				throw new Error(`Invalid session operation: ${operation}`);
		}
	});

	const cache = new Cache();

	addListener('XHRCache', ([operation, key, value]) => {
		switch (operation) {
			case 'set':
				return cache.set(key, value);
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
}
