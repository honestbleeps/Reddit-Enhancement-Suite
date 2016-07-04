import { ajax } from '../environment';
import { batch } from './async';

export const getPostMetadata = batch(async requests => {
	const by_id = requests.map(r => r.id)
		.map(id => `t3_${id}`).join(',');

	const { data: { children } } = await ajax({
		url: `/by_id/${by_id}.json`,
		type: 'json'
	});

	const posts = children.reduce((map, { data } ) => map.set(data.id, data), new Map());
	return posts;
}, { size: 50 });


