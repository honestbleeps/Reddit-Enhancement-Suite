export default {
	moduleID: 'clyp',
	name: 'clyp',
	domains: ['clyp.it'],
	logo: '//d2cjvbryygm0lr.cloudfront.net/favicon.ico',
	keepNative: true,
	detect: ({ href }) => (/^https?:\/\/clyp\.it\/(playlist\/)?([A-Za-z0-9]+)/i).exec(href),
	handleLink(href, [, playlist, id]) {
		const urlBase = playlist ? '//clyp.it/playlist/' : '//clyp.it/';

		return {
			type: 'IFRAME',
			embed: `${urlBase}${id}/widget`,
			height: '160px',
			width: '100%',
		};
	},
};
