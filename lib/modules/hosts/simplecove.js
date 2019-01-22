/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';

export default new Host('simplecove', {
	name: 'SimpleCove',
	domains: ['simplecove.com'],
	logo: 'https://simplecove.com/static/images/reslogo.jpg',
	options: {
		simplecovePrivacyPolicy: {
			title: 'SimpleCove Privacy Policy',
			description: 'privacyPolicyTelemetryWarning',
			text: 'Read Privacy Policy',
			callback: 'privacy_link_placeholder',
			type: 'button',
		},
	},
	detect: ({ pathname }) => (/^\/(\d+)/i).exec(pathname),
	async handleLink(elem, [, id]) {
		const data = await ajax({
			url: `https://www.simplecove.com/resapi/${id}`,
			type: 'json',
		});

		const images = data.map(x => ({
			src: x.photo_src.replace('http:', 'https:'),
			caption: x.photo_caption,
			type: 'IMAGE',
		}));

		return {
			type: 'GALLERY',
			src: images,
		};
	},
});
