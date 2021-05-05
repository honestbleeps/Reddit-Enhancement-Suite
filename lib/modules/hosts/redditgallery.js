/* @flow */

import { Host } from '../../core/host';
import { filterMap, getPostMetadata } from '../../utils';

/* eslint-disable camelcase */

export default new Host('redditgallery', {
	name: 'redditgallery',
	domains: ['reddit.com'],
	attribution: false,
	detect({ pathname }) { return pathname.match(/^\/gallery\/(\w+)/); },
	async handleLink(href, [, id]) {
		const {
			media_metadata = {},
			gallery_data: {
				items = [],
			} = {},
		} = await getPostMetadata({ id });
		const pieces = filterMap(items, ({ media_id, caption }) => {
			// `m` is something like `image/png`
			const { m } = media_metadata[media_id] || {};
			const type = m.startsWith('image') ? 'IMAGE' : 'Unknown';
			return type === 'IMAGE' ? [{ type, caption, src: `https://i.redd.it/${media_id}.${m.substr(6)}` }] : undefined;
		});
		if (!pieces.length) throw new Error('Gallery has no valid pieces.');
		return { type: 'GALLERY', src: pieces };
	},
});
