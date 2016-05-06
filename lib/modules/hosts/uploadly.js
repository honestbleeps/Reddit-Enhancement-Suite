export default {
	moduleID: 'uploadly',
	name: 'uploadly',
	domains: ['uploadly.com'],
	attribution: false,
	detect: href => (/^https?:\/\/(?:www\.)?uploadly\.com\/([a-z0-9]{8}(#[a-z0-9]{8})?)/i).exec(href),
	handleLink(elem, [, hash]) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `//uploadly.com/embed/${hash}`);
		elem.setAttribute('data-width', '550');
		elem.setAttribute('data-height', '550');
	},
};
