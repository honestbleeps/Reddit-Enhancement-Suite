export default {
	moduleID: 'eroshare',
	name: 'eroshare',
	domains: ['eroshare.com'],
	logo: '//eroshare.com/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.)?eroshare\.com\/((i\/)?[a-z0-9]{8})/i).exec(href),
	handleLink(elem, [, hash]) {
		elem.type = 'IFRAME';
		elem.setAttribute('data-embed', `//eroshare.com/embed/${hash}`);
		elem.setAttribute('data-width', '550');
		elem.setAttribute('data-height', '550');
	}
};
