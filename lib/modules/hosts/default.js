export default {
	moduleID: 'default',
	name: 'default',
	domains: [],
	detect: ({ pathname }) => (/\.(gif|jpe?g|png)$/i).test(pathname),
	handleLink(href) {
		return {
			type: 'IMAGE',
			src: href,
		};
	},
};
