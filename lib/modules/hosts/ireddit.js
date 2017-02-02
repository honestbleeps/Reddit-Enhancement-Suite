/* @flow */

import { Host } from '../../core/host';
import { getPostMetadata } from '../../utils';

export default new Host('ireddit', {
	name: 'i.redd.it',
	domains: ['i.redd.it'],
	detect: (url, thing) => thing && thing.isPost() && thing.id(),
	async handleLink(href, id) {
		const postMetadata = await getPostMetadata({ id: id.replace('t3_', '') });
		const preview = postMetadata.preview.images[0];
		if (preview.variants.mp4) {
			return {
				type: 'VIDEO',
				controls: false,
				loop: true,
				muted: true,
				fallback: preview.variants.gif && preview.variants.gif.source.url,
				sources: [{
					source: preview.variants.mp4.source.url,
					type: 'video/mp4',
				}],
			};
		} else {
			return {
				type: 'IMAGE',
				src: preview.source.url,
			};
		}
	},
});
