/* @flow */

import { Host } from '../../core/host';

export default new Host('archilogic', {
	name: 'archilogic',
	domains: ['spaces.archilogic.com'],
	logo: 'https://about.archilogic.com/wp-content/uploads/2017/01/favicon-96x96.png',
	options: {
		archilogicPrivacyPolicy: {
			title: 'archilogic Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(3d|model)/).exec(pathname),
	handleLink(href) {
		const formattedUrl = href
			.replace('/model/', '/3d/') // force /3d/
			.replace('http:', 'https:'); // force https

		return {
			type: 'IFRAME',
			embed: formattedUrl,
		};
	},
});
