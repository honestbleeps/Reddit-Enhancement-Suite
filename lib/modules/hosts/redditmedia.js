/* @flow */

import { Host } from '../../core/host';

export default new Host('redditmedia', {
	name: 'redditmedia',
	domains: ['redditmedia.com'],
	attribution: false,
	detect: ({ hostname, searchParams }) => hostname !== 'pixel.redditmedia.com' && searchParams,
	handleLink(href, searchParams) {
		if (searchParams.get('fm') === 'mp4') {
			return {
				type: 'VIDEO',
				loop: true,
				muted: true,
				sources: [{
					source: href,
					type: 'video/mp4',
				}],
			};
		}

		return {
			type: 'IMAGE',
			src: href,
		};
	},
});
