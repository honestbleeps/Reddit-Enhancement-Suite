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
			case 'has':
				return session.has(key);
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

	const waiting = new Map();

	addListener('authFlow', ({ operation, id, token }) => {
		switch (operation) {
			case 'start':
				if (waiting.has(id)) {
					throw new Error(`Auth handler for id: ${id} already exists.`);
				}
				return new Promise((resolve, reject) => waiting.set(id, { resolve, reject }));
			case 'complete':
				if (!waiting.has(id)) {
					console.error(`No auth handler for id: ${id} (sent token: ${token}).`);
					return false;
				}
				waiting.get(id).resolve(token);
				waiting.delete(id);
				return true;
			case 'cancel':
				if (!waiting.has(id)) {
					console.error(`No auth handler for id: ${id} (attempted cancellation).`);
					return false;
				}
				waiting.get(id).reject(new Error('Auth flow cancelled.'));
				waiting.delete(id);
				return true;
			default:
				throw new Error(`Invalid authFlow operation: ${operation}`);
		}
	});
}
