/* @flow */

import { Host } from '../../core/host';

export default new Host('clyp', {
	name: 'clyp',
	domains: ['clyp.it'],
	logo: 'https://d2cjvbryygm0lr.cloudfront.net/favicon.ico',
	detect: ({ pathname }) => (/^\/(playlist\/)?([A-Za-z0-9]+)/i).exec(pathname),
	handleLink(href, [, playlist, id]) {
		return {
			type: 'IFRAME',
			embed: `https://clyp.it/${playlist ? 'playlist/' : ''}${id}/widget`,
			height: '160px',
			width: '100%',
		};
	},
});
