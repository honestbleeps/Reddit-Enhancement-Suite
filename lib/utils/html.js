/* @flow */

const escapeLookups = {
	'&': '&amp;',
	'"': '&quot;',
	'<': '&lt;',
	'>': '&gt;',
};

export function escapeHTML(str: ?string): string {
	return str ?
		str.toString().replace(/[&"<>]/g, m => escapeLookups[m]) :
		'';
}
