export default {
	moduleID: 'pastebin',
	name: 'pastebin',
	domains: ['pastebin.com'],
	attribution: false,
	detect: href => (/^https?:\/\/(?:www\.)?pastebin\.com\/(?:raw\.php\?i=|index\/)?([a-z0-9]{8})/i).exec(href),
	handleLink(elem, [, id]) {
		elem.type = 'IFRAME';
		elem.expandoClass = 'selftext';
		elem.setAttribute('data-embed', `https://pastebin.com/embed_iframe.php?i=${id}`);
		elem.setAttribute('data-height', '500px');
		elem.setAttribute('data-width', '100%');
	},
};
