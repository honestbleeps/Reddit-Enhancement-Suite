export default {
	subreddits: {
		source: '/api/search_reddit_names.json?app=res',
		hintText: 'type a subreddit name',
		onResult(response) {
			const names = response.names;
			return names.map(name => ({
				id: name,
				name
			}));
		},
		onCachedResult(response) {
			const names = response.names;
			return names.map(name => ({
				id: name,
				name
			}));
		},
		sanitizeValues(...values) {
			return values
				.reduce((a, b) => a.concat(b), [])
				.map(value => {
					if (value.split) {
						return value.split(/[\s,]/);
					}
					return value;
				})
				.reduce((a, b) => a.concat(b), []);
		}
	}
};
