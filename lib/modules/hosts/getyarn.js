export default {
	moduleID: 'getyarn',
	name: 'getyarn.io',
	logo: 'https://getyarn.io/favicon.ico',
	domains: ['getyarn.io'],
	detect: ({ pathname }) => (/\/yarn-clip\/(?:embed\/)?([\w\-]+)/i).exec(pathname),
	handleLink(href, [, code]) {
		const embed = `https://getyarn.io/yarn-clip/embed/${code}`;

		return {
			type: 'IFRAME',
			embed: `${embed}?autoplay=false`,
			embedAutoplay: `${embed}?autoplay=true`,
			height: '600px', // size as per docs in https://getyarn.io/yarn-clip/embed-test/
			width: '768px',
		};
	},
};
