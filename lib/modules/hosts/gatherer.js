/* @flow */

import { Host } from '../../core/host';

export default new Host('gatherer', {
	name: 'Gatherer MTG Card Images',
	domains: ['gatherer.wizards.com'],
	logo: 'http://gatherer.wizards.com/Images/favicon.ico',
	options: {
		gathererPrivacyPolicy: {
			title: 'Gatherer Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'http://gatherer.wizards.com/Pages/PrivacyPolicy.aspx',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (
		(/^\/Handlers\/Image\.ashx/i).exec(pathname)
	),
	handleLink(href) {
		return {
			type: 'IMAGE',
			src: href,
		};
	},
});
