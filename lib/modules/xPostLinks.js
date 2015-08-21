addModule('xPostLinks', function(module, moduleID) {
	module.moduleName = 'X-post Links';
	module.category = 'Posts';
	module.description = 'Create links to x-posted subreddits in the taglines.';
	module.include = [ 'linklist', 'comments', 'profile' ];

	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {

			createLinks();
			RESUtils.watchForElement('siteTable', createLinks);
		}
	};

	function createLinks( container ) {
		var
		titles        = (container || document.body).querySelectorAll('a.title'),
		xpost_re      = /x-?post/i,
		xpost_from_re = /(x-?post\w*\b)(\s+\w+)?\s+([\/r]*)?([a-zA-Z0-9_]+)/i, // get stuff like x-post from games, x-post games, xPost /games ... this is the fallback
		subreddit_re  = /r\/([a-zA-Z0-9_]+)/i; // get stuff like x-post from a neat subreddit called r/games

		for (var i = 0, title, tagline, entry, userattrs, textNode, subreddit, add_after, xpost_from, xpost_from_a, sub; i < titles.length; i++) {

			title = titles.item(i);

			if ( xpost_re.test(title.textContent) ){

				sub        = title.textContent.match(subreddit_re);
				xpost_from = title.textContent.match(xpost_from_re);

				sub        = sub && sub.length >= 1 && sub[1];
				xpost_from = xpost_from && xpost_from.length >= 5 && xpost_from[4];

				if ( sub || xpost_from ){

					sub = sub || xpost_from;
					entry = title.parentNode.parentNode;

					if ( entry && entry.classList.contains('entry') ){

						textNode = document.createTextNode(' x-posted from ');

						xpost_from_a           = document.createElement('a');
						xpost_from_a.href      = 'https://www.reddit.com/r/'+sub;
						xpost_from_a.className = 'subreddit hover';
						xpost_from_a.textContent = '/r/'+sub;

						userattrs = entry.querySelector('.userattrs');
						subreddit = entry.querySelector('.subreddit');
						tagline   = entry.querySelector('.tagline');

						add_after = subreddit || userattrs || tagline && tagline.lastChild;

						RESUtils.insertAfter(add_after, textNode);
						RESUtils.insertAfter(textNode, xpost_from_a);
					}
				}
			}
		}
	}
});