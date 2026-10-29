/* @flow */

import { ajax } from '../environment';
import type { RedditLink, RedditListing } from '../types/reddit'; // eslint-disable-line no-unused-vars
import { batch } from './async';

export const getPostMetadata: (x: { id: string, ... }) => Promise<RedditLink['data']> = batch(async (requests: { id: string, ... }[]): Promise<RedditLink['data'][]> => {
	const byId = requests
		.map(r => r.id)
		.map(id => `t3_${id}`)
		.join(',');

	const { data: { children } } = (await ajax({
		url: `/by_id/${byId}.json`,
		query: { limit: 100, raw_json: 1 },
		type: 'json',
	}) as RedditListing<RedditLink>);

	return children.map(c => c.data);
}, { size: 100 });
