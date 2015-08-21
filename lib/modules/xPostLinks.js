addModule('xPostLinks', function(module, moduleID) {
	module.moduleName = 'X-post Links';
	module.category = 'Posts';
	module.description = 'Create links to x-posted subreddits in the taglines.';
	module.include = [ 'linklisting', 'comments' ];

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
		xpost_from_re = /(x-?post\w*\b)(\s+\S+)?\s+([\/r]*)?([a-zA-Z0-9]+)/i;

		for (var i = 0, title, tagline, entry, userattrs, textNode, subreddit, add_after, xpost_from, xpost_from_a, sub; i < titles.length; i++) {

			title = titles.item(i);

			if ( xpost_re.test(title.textContent) ){

				xpost_from = title.textContent.match(xpost_from_re);

				if ( xpost_from && xpost_from.length >= 5 ){

					sub = xpost_from[4];
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
	};
});