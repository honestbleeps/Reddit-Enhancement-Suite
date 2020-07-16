/* @flow */

import { Host } from '../../core/host';
import { filterMap, getPostMetadata } from '../../utils';

export default new Host('redditgallery', {
	name: 'redditgallery',
	domains: ['reddit.com'],
	attribution: false,
	detect({ pathname }) { return pathname.match(/^\/gallery\/(\w+)/); },
	async handleLink(href, [, id]) {
		const postMetadata = await getPostMetadata({ id });
		const pieces = filterMap(Object.entries(postMetadata.media_metadata || {}), ([id, { m }]) => {
			// `m` is something like `image/png`
			const type = m.startsWith('image') ? 'IMAGE' : 'Unknown';
			return type === 'IMAGE' ? [{ type, src: `https://i.redd.it/${id}.${m.substr(6)}` }] : undefined;
		});
		if (!pieces.length) throw new Error('Gallery has no valid pieces.');
		return { type: 'GALLERY', src: pieces };
	},
});
