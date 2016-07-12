export default {
	moduleID: 'livecap',
	name: 'LiveCap',
	domains: ['livecap.tv'],
	logo: '//www.livecap.tv/public/images/16x16.png',

	detect: ({ pathname }) => (/^\/[st]\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9]+)/i).exec(pathname),

	handleLink(href, [, path]) {
		const embed = `//www.livecap.tv/s/embed/${path}`;

		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoplay=true`,
		};
	},
};
