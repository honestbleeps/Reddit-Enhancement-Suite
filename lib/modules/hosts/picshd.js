export default {
	moduleID: 'picshd',
	name: 'picshd',
	domains: ['picshd.com'],
	logo: 'http://picshd.com/assets/ico/favicon.ico',
	detect: ({ href }) => (/^https?:\/\/(?:i\.|edge\.|www\.)*picshd\.com\/([\w]{5,})(\..+)?$/i).exec(href),
	handleLink(href, [, hash]) {
		return {
			type: 'IMAGE',
			src: `http://i.picshd.com/${hash}.jpg`,
		};
	},
};
