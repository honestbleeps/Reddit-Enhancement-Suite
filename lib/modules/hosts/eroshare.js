export default {
	moduleID: 'eroshare',
	name: 'eroshare',
	domains: ['eroshare.com'],
	logo: '//eroshare.com/favicon.ico',
	detect: href => (/^https?:\/\/(?:www\.)?eroshare\.com\/((i\/)?[a-z0-9]{8})/i).exec(href),
	handleLink(href, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `//eroshare.com/embed/${hash}`,
			width: '550',
			height: '550',
		};
	},
};
