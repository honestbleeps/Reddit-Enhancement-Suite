/* @flow */

import { range } from './';

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export function randomHash(len: number = 5): string {
	const arr = new Array(len);
	for (const i of range(0, len)) {
		arr[i] = chars.charAt(Math.random() * chars.length | 0);
	}
	return arr.join('');
}

export function hashCode(str: string): number {
	let hash = 0;
	for (const char of str) {
		hash = (((hash << 5) - hash) + char.charCodeAt(0)) | 0;
	}
	return hash;
}
