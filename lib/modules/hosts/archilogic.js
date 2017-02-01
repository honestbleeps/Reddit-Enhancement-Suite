/* @flow */

import { Host } from '../../core/host';

export default new Host('archilogic', {
	name: 'archilogic',
	domains: ['spaces.archilogic.com'],
	logo: 'https://about.archilogic.com/wp-content/uploads/2017/01/favicon-96x96.png',
	detect: ({ pathname }) => (/^\/(3d|model)/).exec(pathname),
	handleLink(href) {
		const formattedUrl = href
			.replace(/\/model\//i, '/3d/')  // force /3d/
			.replace(/^http:\/\//i, 'https://'); // force https

		return {
			type: 'IFRAME',
			embed: formattedUrl,
		};
	},
});
