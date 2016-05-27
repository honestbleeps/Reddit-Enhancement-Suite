export default {
	moduleID: 'imgflip',
	name: 'imgflip',
	domains: ['imgflip.com'],
	logo: '//imgflip.com/favicon02.png',
	detect: ({ href }) => (/^https?:\/\/imgflip\.com\/(i|gif)\/([a-z0-9]+)/).exec(href),
	handleLink(href, [, type, id]) {
		return {
			type: 'IMAGE',
			src: `https://i.imgflip.com/${id}.${type === 'gif' ? 'gif' : 'jpg'}`,
		};
	},
};
