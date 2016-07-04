import { getUrlParams } from '../../utils';

export default {
	moduleID: 'redditmedia',
	name: 'redditmedia',
	domains: ['redditmedia.com'],
	attribution: false,
	detect: (mediaLink) => { mediaLink.hostname !== 'pixel.redditmedia.com' },
	handleLink(href) {
		if (getUrlParams(href).fm === 'mp4') {
			return {
				type: 'VIDEO',
				controls: false,
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
};
