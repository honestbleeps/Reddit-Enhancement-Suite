export default {
	moduleID: 'getyarn',
	name: 'getyarn.io',
	logo: 'https://getyarn.io/favicon.ico',
	domains: ['getyarn.io'],
	detect: ({ pathname }) => (/\/yarn-clip\/(?:embed\/)?(.*)/i).exec(pathname),
	handleLink(href, [, code]) {
		return {
			type: 'IFRAME',
			embed: `https://getyarn.io/yarn-clip/embed/${code}?autoplay=false`,
			height: '600px', // size as per docs in https://getyarn.io/yarn-clip/embed-test/
			width: '768px',
		};
	},
};
