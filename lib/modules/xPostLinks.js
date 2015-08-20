addModule('xPostLinks', function(module, moduleID) {
	module.moduleName = 'X-post Links';
	module.category = 'Posts';
	module.description = 'Create links to x-posted subreddits in the taglines.';
	module.include = [ 'linklist', 'comments', 'profile', /\/search\?q/ ];

	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {

			createLinks();
			RESUtils.watchForElement('siteTable', createLinks);
		}
	};

	function getSubFromString ( string ) {

		var 
		sub,
		xpost_string,
		result1, result2, 
		xpost_re      = /(x|cross)-?post\S*(.+)/i,
		xpost_from_re = /^(\s+\S+)?\s+\/?([a-zA-Z0-9_]+)(([\)\]}])|(\S*$))/i,
		subreddit_re  = /r\/([a-zA-Z0-9_]+)/i;

		xpost_string = string.match(xpost_re);

		if ( xpost_string ){

			xpost_string = xpost_string[2]; // anything after "x-post" (and variations)

			result1 = xpost_string.match(subreddit_re); // found something like r/games
			result2 = xpost_string.match(xpost_from_re); // use the last of one or two words before end of string of closing bracket

			sub = result1 && result1[1] || result2 && result2[2];
		}
		return sub;
	}

	function createDom ( sub, titleElement ) {

		var tagline, someParent, userattrs, textNode, subreddit, searchSubreddit, addAfter, xpost_from_a;

		someParent = titleElement.parentNode.parentNode; // can be .entry or a .search-result>div or what ever
		textNode = document.createTextNode(' x-posted from ');

		xpost_from_a             = document.createElement('a');
		xpost_from_a.className   = 'subreddit hover';
		xpost_from_a.href        = '/r/'+sub;
		xpost_from_a.textContent = '/r/'+sub;

		userattrs = someParent.querySelector('.userattrs');
		subreddit = someParent.querySelector('.subreddit');
		tagline   = someParent.querySelector('.tagline');
		searchSubreddit = someParent.querySelector('.search-subreddit-link');

		addAfter = subreddit || searchSubreddit || userattrs || tagline && tagline.lastChild;

		RESUtils.insertAfter(addAfter, textNode);
		RESUtils.insertAfter(textNode, xpost_from_a);
	}

	function createLinks( container ) {

		var titleElements = (container || document.body).querySelectorAll('a.title, a.search-title'); 

		for (var i = 0, titleElement, sub; i < titleElements.length; i++) {

			titleElement = titleElements.item(i);

			sub = getSubFromString( titleElement.textContent );

			if ( sub ) createDom( sub, titleElement );
		}
	}

});