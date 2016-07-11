export default {
	moduleID: 'livememe',
	name: 'livememe',
	domains: ['livememe.com'],
	logo: '//livememe.com/favicon.ico',
	detect: ({ pathname }) => (/^\/(?!edit)(\w{7})(?:\/|$)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `https://e.lvme.me/${id}.jpg`,
		};
	},
};
