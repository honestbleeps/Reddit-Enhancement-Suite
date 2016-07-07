import { ajax } from '../environment';
import { batch } from './async';

export const getPostMetadata = batch(async requests => {
	const byId = requests.map(r => r.id)
		.map(id => `t3_${id}`).join(',');

	const { data: { children } } = await ajax({
		url: `/by_id/${byId}.json`,
		type: 'json',
	});

	return children.reduce((map, { data }) => map.set(data.id, data), new Map());
}, { size: 50 });


