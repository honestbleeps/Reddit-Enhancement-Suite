export default {
	moduleID: 'qwipit',
	name: 'qwipit',
	domains: ['qwip.it'],
	attribution: false,
	keepNative: true,
	detect: ({ href }) => (/^https?:\/\/?qwip\.it\/[\w]+\/([\w]+)/i).exec(href),
	handleLink(href, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `//qwip.it/reddit/${hash}`,
			height: '375px',
			width: '485px',
		};
	},
};
