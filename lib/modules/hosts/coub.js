export default {
	moduleID: 'coub',

	name: 'Coub',

	domains: ['coub.com'],

	detect: ({ href }) => (/^https?:\/\/coub\.com\/(?:view|embed)\/([\w]+)(\.gifv)?/i).exec(href),

	handleLink(href, [, hash, isGifv]) {
		const src = isGifv ?
			`//coub.com/view/${hash}.gifv?res=true` :
			`//coub.com/embed/${hash}?autoplay=true&res=true`;

		return {
			type: 'IFRAME',
			muted: !!isGifv,
			embed: src,
			pause: 'stop',
			play: 'play',
		};
	},
};
