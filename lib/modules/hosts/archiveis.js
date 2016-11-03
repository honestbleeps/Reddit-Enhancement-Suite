export default {
	moduleID: 'archive.is',
	name: 'archive.is',
	domains: ['archive.is'],
	logo: 'https://archive.is/favicon.ico',
	detect: ({ href }) => (/^https?:\/\/archive.is\/([^///.#]+)/i).exec(href),
	handleLink(href, [, code]) {
		return {
			type: 'IMAGE',
			src: `https://archive.fo/${code}/scr.png`,
		};
	},
};
