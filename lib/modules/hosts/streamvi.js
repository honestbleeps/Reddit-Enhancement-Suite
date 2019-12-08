/* @flow */

import { Host } from '../../core/host';

export default new Host('streamvi', {
	name: 'streamvi',
	domains: ['streamvi.com'],
	logo: 'https://streamvi.com/assets/logo.png',
	detect: ({ searchParams }) => {
		const code = searchParams.get('video') || '';
		return [code.toString()];
	},
	handleLink(href, [code]) {
		return {
			type: 'VIDEO',
			loop: true,
			sources: [{
				source: `https://cdn.streamvi.com/uploads/${code}.mp4`,
				type: 'video/mp4',
			}],
			poster: `https://cdn.streamvi.com/uploads/${code}.jpg`,
		};
	},
});
