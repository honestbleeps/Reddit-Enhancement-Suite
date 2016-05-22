export default {
	moduleID: 'snag',
	name: 'snag.gy',
	logo: 'http://snag.gy/assets/images/favicon.ico',
	domains: ['snag.gy'],
	detect: href => (/https?:\/\/snag\.gy\/(\w{5})(?:\.(\w+))?/i).exec(href),
	handleLink(elem, [, id, extension]) {
		return {
			type: 'IMAGE',
			src: `http://i.snag.gy/${id}.${extension || 'jpg'}`,
		};
	},
};
