/* @flow */

import { Host } from '../../core/host';

export default new Host('xboxdvr', {
	name: 'XboxDVR',
	domains: ['xboxdvr.com'],
	detect: () => true,
	handleLink(href) {
		const embed = `${href}/embed`;

		return {
			type: 'IFRAME',
			embed,
		};
	},
});
