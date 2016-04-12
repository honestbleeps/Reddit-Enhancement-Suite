import _ from 'lodash';

function stringTagFunction(valueTransform) {
	return (strings, ...values) => {
		return _.zipWith(
			strings,
			values.map(valueTransform),
			(s, v) => `${s}${v || ''}`
		).join('');
	};
}

export const encode = stringTagFunction(encodeURIComponent);

const _escapeHTML = stringTagFunction(escapeHTML);
export { _escapeHTML as escapeHTML };
