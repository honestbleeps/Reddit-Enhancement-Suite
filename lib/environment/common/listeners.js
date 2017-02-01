/* @flow */

import Cache from '../../utils/Cache';
import type { AddListener } from './messaging';

export function addCommonBackgroundListeners(addListener: AddListener<void>) {
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
			case 'complete': {
				const handler = waiting.get(id);
				if (!handler) {
					console.error(`No auth handler for id: ${id} (sent token: ${token}).`);
					return false;
				}
				waiting.delete(id);
				handler.resolve(token);
				return true;
			}
			case 'cancel': {
				const handler = waiting.get(id);
				if (!handler) {
					console.error(`No auth handler for id: ${id} (attempted cancellation).`);
					return false;
				}
				waiting.delete(id);
				handler.reject(new Error('Auth flow cancelled.'));
				return true;
			}
			default:
				throw new Error(`Invalid authFlow operation: ${operation}`);
		}
	});
}
