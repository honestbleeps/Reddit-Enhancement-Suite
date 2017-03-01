/* @flow */

import { Host } from '../../core/host';

export default new Host('beam', {
	name: 'Beam',
	domains: ['beam.pro'],
	logo: 'https://beam.pro/_latest/assets/favicons/favicon-32x32.png',
	detect: ({ pathname }) => (/^\/(\w+)$/).exec(pathname),
	handleLink(href, [, clipId]) {
		const embed = `https://beam.pro/embed/player/${clipId}`;

		return {
			type: 'IFRAME',
			embed,
			fixedRatio: true,
		};
	},
});
