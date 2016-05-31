import { range } from './';

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export function randomHash(len = 5) {
	const arr = new Array(len);
	for (const i of range(0, len)) {
		arr[i] = chars.charAt(Math.random() * chars.length | 0);
	}
	return arr.join('');
}

export function hashCode(str) {
	if (typeof str.text === 'function') {
		str = str.text();
	} else if (str.textContent) {
		str = str.textContent;
	}
	let hash = 0;
	for (const char of str) {
		hash = (((hash << 5) - hash) + char.charCodeAt(0)) | 0;
	}
	return hash;
}
