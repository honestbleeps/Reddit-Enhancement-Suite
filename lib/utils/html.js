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
