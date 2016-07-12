export default {
	moduleID: 'streamable',
	name: 'streamable',
	domains: ['streamable.com'],
	logo: '//cdn.streamable.com/static/img/favicon.ico',
	detect: ({ pathname }) => (/^\/(\w+)$/i).exec(pathname),
	handleLink(href, [, hash]) {
		return {
			type: 'IFRAME',
			embed: `https://streamable.com/res/${hash}`,
			pause: '{"method":"pause"}',
			play: '{"method":"play"}',
		};
	},
};
