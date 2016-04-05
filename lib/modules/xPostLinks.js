addModule('xPostLinks', (module, moduleID) => {
	module.moduleName = 'X-post Links';
	module.category = ['Submissions'];
	module.description = 'Create links to x-posted subreddits in post taglines.';

	module.include = [
		'linklist',
		'comments',
		'profile',
		'search'
	];

	module.go = function() {
		if (module.isEnabled() && module.isMatchURL()) {
			createLinks();
			RESUtils.watchForElement('siteTable', createLinks);
		}
	};

	const xpostRe = /(?:x|cross)-?post\S*(.+)/i;
	const xpostFromRe = /^(?:\s+\S+)?\s+\/?(\w+)(?:[\)\]}]|\S*$)/i;
	const subredditRe = /r\/(\w+)/i;

	function parseSubreddit(title) {
		const [, xpostString] = xpostRe.exec(title) || [];

		if (!xpostString) return false;

		const [, sub] = (
			subredditRe.exec(xpostString) || // found something like r/games
			xpostFromRe.exec(xpostString) || // use the last of one or two words before end of string of closing bracket
			[]
		);

		return sub;
	}

	function appendToTagline(sub, thing) {
		$(
			thing.getSubredditLink() ||
			thing.getUserattrsElement() ||
			thing.getTaglineElement()
		).after(
			' x-posted from ',
			$('<a>', {
				class: 'subreddit hover',
				href: `/r/${sub}`,
				text: `/r/${sub}`
			})
		);
	}

	function createLinks(container) {
		const things = RESUtils.things(container);

		RESUtils.forEachChunked(things, thing => {
			if (thing.isPost()) {
				const sub = parseSubreddit(thing.getTitle());
				if (sub) appendToTagline(sub, thing);
			}
		});
	}
});
