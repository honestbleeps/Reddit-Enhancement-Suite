/* @flow */

const escapeLookups = {
	'&': '&amp;',
	'"': '&quot;',
	"'": '&apos;', // eslint-disable-line quotes
	'<': '&lt;',
	'>': '&gt;',
	'/': '&#47;',
};

export function escapeHTML(str: ?string): string {
	return str ?
		str.toString().replace(/[&"'<>\/]/g, m => escapeLookups[m]) :
		'';
}
