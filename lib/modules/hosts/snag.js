export default {
	moduleID: 'snag',
	name: 'snag.gy',
	logo: 'http://snag.gy/assets/images/favicon.ico',
	domains: ['snag.gy'],
	detect: ({ pathname }) => (/^\/(\w{5})(?:\.(\w+))?/i).exec(pathname),
	handleLink(href, [, id, extension]) {
		return {
			type: 'IMAGE',
			src: `http://i.snag.gy/${id}.${extension || 'jpg'}`,
		};
	},
};
