import _ from 'lodash';
import { escapeHTML } from './';

function stringTagFunction(valueTransform) {
	return (strings, ...values) =>
		_.zipWith(
			strings,
			values.map(valueTransform),
			(s, v) => `${s}${v || ''}`
		).join('');
}

export const encode = stringTagFunction(encodeURIComponent);

const _escapeHTML = stringTagFunction(escapeHTML);
export { _escapeHTML as escapeHTML };
