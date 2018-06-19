/* @flow */

import { Host } from '../../core/host';
import { getPostMetadata } from '../../utils';

export default new Host('ireddit', {
	name: 'i.redd.it',
	domains: ['i.redd.it'],
	options: {
		preferRedditMedia: {
			title: 'iredditPreferRedditMediaTitle',
			description: 'iredditPreferRedditMediaDesc',
			type: 'boolean',
			value: false,
		},
	},
	attribution: false,
	detect({ pathname }, thing) {
		return (
			(pathname.endsWith('.gif') || this.options.preferRedditMedia.value) &&
			thing && thing.isLinkPost() && thing.getFullname()
		);
	},
	async handleLink(href, fullname) {
		const postMetadata = await getPostMetadata({ id: fullname.replace('t3_', '') });
		if (!postMetadata.preview) throw new Error('Post has no preview.');
		const preview = postMetadata.preview.images[0];
		if (preview.variants.mp4) {
			return {
				type: 'VIDEO',
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
