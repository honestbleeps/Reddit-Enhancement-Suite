export default {
	moduleID: 'vimeo',
	name: 'vimeo',
	domains: ['vimeo.com'],
	attribution: false,
	keepNative: true,
	detect: ({ href }) => (/^https?:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/i).exec(href),
	handleLink(href, [, id]) {
		const	embed = `https://player.vimeo.com/video/${id}`;
		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoplay=true`,
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
};
