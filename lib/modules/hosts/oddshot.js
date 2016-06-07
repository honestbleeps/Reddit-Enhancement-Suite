export default {
	moduleID: 'oddshot',
	domains: ['oddshot.tv'],
	logo: '//oddshot.tv/favicon.ico',
	name: 'Oddshot',
	detect: ({ href }) => (/^https?:\/\/(?:www\.)?oddshot.tv\/shot\/([a-z0-9_-]+(?:\/[a-z0-9_-]+)?)/i).exec(href),
	handleLink(href, [, hash]) {
		const	embed = `//oddshot.tv/shot/${hash}/embed`;

		return {
			type: 'IFRAME',
			embed,
			embedAutoplay: `${embed}?autoplay=true`,
		};
	},
};
