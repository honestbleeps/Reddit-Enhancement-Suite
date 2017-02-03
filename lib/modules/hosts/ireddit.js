/* @flow */

import { Host } from '../../core/host';
import { getPostMetadata } from '../../utils';

export default new Host('ireddit', {
	name: 'i.redd.it gifs',
	domains: ['i.redd.it'],
	attribution: false,
	detect: ({ pathname }, thing) => pathname.endsWith('.gif') && thing && thing.isPost() && thing.id(),
	async handleLink(href, id) {
		const postMetadata = await getPostMetadata({ id: id.replace('t3_', '') });
		const preview = postMetadata.preview && postMetadata.preview.images[0];
		if (!preview || !preview.variants.mp4) throw new Error('Post has no preview.');
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
	},
});
