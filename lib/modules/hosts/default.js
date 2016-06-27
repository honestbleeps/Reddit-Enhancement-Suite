export default {
	moduleID: 'default',
	name: 'default',
	domains: [],
	detect: ({ href }) => (/^[^#]+?\.(gif|jpe?g|png)(?:[?&#_].*|$)/i).test(href),
	handleLink(href) {
		return {
			type: 'IMAGE',
			src: href,
		};
	},
};
