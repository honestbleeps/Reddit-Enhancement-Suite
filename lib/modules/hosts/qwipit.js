export default {
	moduleID: 'qwipit',
	name: 'qwipit',
	domains: ['qwip.it'],
	attribution: false,
	detect: ({ pathname }) => (/^\/\w+\/(\w+)/i).exec(pathname),
	handleLink(href, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `//qwip.it/reddit/${hash}`,
			height: '375px',
			width: '485px',
		};
	},
};
