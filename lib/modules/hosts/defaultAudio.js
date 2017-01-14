/* @flow */

import { Host } from '../../core/host';

export default new Host('defaultAudio', {
	name: 'defaultAudio',
	domains: [],
	detect: ({ pathname }) => (/\.(opus|weba|ogg|wav|mp3|flac)$/i).exec(pathname),
	handleLink(href, [, extension]) {
		// Change weba and opus to their correct containers.
		if (extension === 'weba') extension = 'webm';
		if (extension === 'opus') extension = 'ogg';

		const format = `audio/${extension}`;

		return {
			type: 'AUDIO',
			autoplay: true,
			loop: false,
			sources: [{
				file: href,
				type: format,
			}],
		};
	},
});
