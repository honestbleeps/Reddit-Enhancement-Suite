import { ajax } from '../environment';
import { batch } from './async';

export const getPostMetadata = batch(async requests => {
	const byId = requests
		.map(r => r.id)
		.map(id => `t3_${id}`)
		.join(',');

	const { data: { children } } = await ajax({
		url: `/by_id/${byId}.json`,
		data: { limit: 100 },
		type: 'json',
	});

	return children.map(c => c.data);
}, { size: 100 });
