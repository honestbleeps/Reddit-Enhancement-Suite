import { Pasteurizer } from './global';

const escapeLookups = {
	'&': '&amp;',
	'"': '&quot;',
	'<': '&lt;',
	'>': '&gt;'
};

export function escapeHTML(str) {
	return str ?
		str.toString().replace(/[&"<>]/g, m => escapeLookups[m]) :
		null;
}

export function sanitizeHTML(htmlStr) {
	return Pasteurizer.safeParseHTML(htmlStr).wrapAll('<div></div>').parent().html();
}
