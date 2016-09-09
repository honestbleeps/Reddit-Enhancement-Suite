export default {
	moduleID: 'ppy.sh',
	name: 'ppy.sh',
	domains: ['ppy.sh'],
	logo: 'https://s.ppy.sh/favicon.ico',
	detect: ({ href }) => (/^https?:\/\/osu.ppy.sh\/ss\/(\d+)/i).exec(href),
	async handleLink(href, [, code]) {
		return {
			type: 'IMAGE',
			src: `http://osu.ppy.sh/ss/${code}`,
		};
	},
};
