addModule('xPostLinks', function(module, moduleID) {
	module.moduleName = 'X-post Links';
	module.category = 'Posts';
	module.description = 'Create links to x-posted subreddits in the taglines.';
	module.include = [
		/^https?:\/\/([a-z]+)\.reddit\.com/i
	];

	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {

			createLinks();
			window.addEventListener('neverEndingLoad', onNeverEndingLoad);
		}
	};

	function onNeverEndingLoad ( evt ) {
		var
		siteTables = document.body.querySelectorAll('.sitetable'),
		lastItem = siteTables.item(siteTables.length - 1);

		createLinks( lastItem );
	}

	function createLinks( container ) {
		var
		titles        = (container || document.body).querySelectorAll('a.title'),
		xpost_re      = /x-?post/i,
		xpost_from_re = /(x-?post\w*\b)(\s+\S+)?\s+(\/?r\/)?([a-zA-Z0-9]+)/i;

		for (var i = 0, title, tagline, entry, userattrs, textNode, subreddit, add_after, xpost_from, xpost_from_a, sub; i < titles.length; i++) {

			title = titles.item(i);

			if ( xpost_re.test(title.innerHTML) ){

				xpost_from = title.innerHTML.match(xpost_from_re);

				if ( xpost_from && xpost_from.length >= 5 ){

					sub = xpost_from[4];
					entry = title.parentNode.parentNode;

					if ( entry && entry.classList.contains('entry') ){

						textNode = document.createTextNode(' x-posted from ');

						xpost_from_a           = document.createElement('a');
						xpost_from_a.href      = 'https://www.reddit.com/r/'+sub;
						xpost_from_a.className = 'subreddit hover';
						xpost_from_a.innerHTML = '/r/'+sub;

						userattrs = entry.querySelector('.userattrs');
						subreddit = entry.querySelector('.subreddit');
						tagline   = entry.querySelector('.tagline');

						add_after = subreddit || userattrs || tagline && tagline.lastChild;

						if ( add_after ){
							if ( add_after.nextSibling ){
								add_after.parentNode.insertBefore(textNode, add_after.nextSibling);
								add_after.parentNode.insertBefore(xpost_from_a, textNode.nextSibling);
							} else {
								add_after.parentNode.appendChild(textNode);
								add_after.parentNode.appendChild(xpost_from_a);
							}
						}
					}
				}
			}
		}
	};
});