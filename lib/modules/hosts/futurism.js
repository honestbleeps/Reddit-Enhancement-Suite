/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('futurism', {
	name: 'futurism',
	attribution: false,
	domains: ['futurism.com', 'futurism.co'],
	options: {
		futurismPrivacyPolicy: {
			title: 'futurism Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'https://futurism.com/policies/privacy',
			type: 'button',
		},
	},
	detect: () => true,
	async handleLink(href) {
		const { data, success, status } = await ajax({
			url: 'https://www.futurism.com/wp-content/themes/futurism/res.php',
			query: { url: href, reverse: href.includes('wp-content/uploads') },
			type: 'json',
		});

		if (!success) {
			throw new Error(`Request failure: status ${status}`);
		}

		return {
			type: 'IMAGE',
			src: data.image_link,
		};
	},
});
