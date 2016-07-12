export default {
	moduleID: 'ctrlv',
	name: 'CtrlV.in',
	logo: '//ctrlv.in/favicon.ico',
	domains: ['ctrlv.in'],
	detect: ({ pathname }) => (/^\/([0-9]+)/i).exec(pathname),
	handleLink(href, [, id]) {
		return {
			type: 'IMAGE',
			src: `https://img.ctrlv.in/id/${id}`,
		};
	},
};
