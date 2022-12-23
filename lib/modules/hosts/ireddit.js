/* @flow */

import { Host } from '../../core/host';
import { getPostMetadata } from '../../utils';

export default new Host('ireddit', {
	name: 'i.redd.it',
	domains: ['i.redd.it'],
	attribution: false,
	detect({ pathname }, thing) { return (/\.(webp|gif|jpe?g|png|svg)$/i).test(pathname) && thing && thing.isLinkPost() && thing.getFullname(); },
	async handleLink(href, fullname) {
		const postMetadata = await getPostMetadata({ id: fullname.replace('t3_', '') });
		if (!postMetadata.preview) throw new Error('Post has no preview.');
		const preview = postMetadata.preview.images[0];
		if (preview.variants.mp4) {
			return {
				type: 'VIDEO',
				caption: postMetadata.selftext_html && postMetadata.selftext_html.replace(/<\/?p>/g, ''),
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
				caption: postMetadata.selftext_html && postMetadata.selftext_html.replace(/<\/?p>/g, ''),
				src: preview.source.url,
			};
		}
	},
});
