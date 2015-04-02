addModule('stylesheet', function(module, moduleID) {
	module.title = 'Stylesheet Loader';
	module.description = 'Load stylesheets from other subreddits in certain contexts';
	module.category = 'UI';

/*
	module.options.snippets = {
		type: 'table',
		value: [],
		fields: [{
			name: 'snippet',
			type: 'textarea'
		}, {
			name: 'context',
			type: 'text'
		}]
	};
*/

	module.options.loadSubredditStylesheets = {
		type: 'table',
		value: [],
		fields: [{
			name: 'subreddit',
			type: 'list',
			listType: 'subreddits'
		}, {
			name: 'toggleName',
			type: 'text'
		}]
	};

	module.options.documentClasses = {
		type: 'table',
		value: [],
		fields: [{
			name: 'classes',
			type: 'text'
		}, {
			name: 'toggleName',
			type: 'text'
		}]
	};


	module.beforeLoad = function() {
		if (!(module.isEnabled() && module.isMatchURL())) return;

		applyDocumentClasses();
		loadSubredditStylesheets();

		$(modules['customToggles']).on('activated deactivated', function() {
			applyDocumentClasses();
			loadSubredditStylesheets();
		});
	};

	function applyDocumentClasses() {
		var addClasses = module.options.documentClasses.value
			.filter(function(documentClasses) {
				var toggleName = documentClasses[1];
				return modules['customToggles'].toggleActive(toggleName);
			})
			.map(function(documentClasses) {
				return documentClasses[0];
			});

		var removeClasses = module.options.documentClasses.value
			.filter(function(documentClasses) {
				var toggleName = documentClasses[1];
				return !modules['customToggles'].toggleActive(toggleName);
			})
			.map(function(documentClasses) {
				return documentClasses[0];
			});


		RESUtils.addBodyClasses.apply(RESUtils.documentClasses, addClasses);
		RESUtils.removeBodyClasses.apply(RESUtils.documentClasses, removeClasses);
	}


	function sanitizeSubredditList(uncleanRows) {
		var uncleanValues = uncleanRows.map(function(row) {
				return row[0];
			});

		var subreddits = RESUtils.options.listTypes['subreddits'].sanitizeValues(uncleanValues);
		return subreddits;
	}

	var _loadSubredditStylesheets;
	function loadSubredditStylesheets() {
		if (!document.head) {
			clearTimeout(_loadSubredditStylesheets);
			_loadSubredditStylesheets = setTimeout(loadSubredditStylesheets, 1)
			return;
		}

		var remove = module.options.loadSubredditStylesheets.value
			.filter(function(row) {
				var context = row[1];
				return !modules['customToggles'].toggleActive(context);
			});
		remove = sanitizeSubredditList(remove);

		var add = module.options.loadSubredditStylesheets.value
			.filter(function(row) {
				var context = row[1];
				return modules['customToggles'].toggleActive(context);
			})
		add = sanitizeSubredditList(add);
		add = add.filter(function(subreddit) {
			return remove.indexOf(subreddit) === -1;
		});

		var addElements = add.filter(function(subreddit) {
				var element = findSubredditStylesheetElement(subreddit);
				return element.length === 0;
			})
			.map(function(subreddit) {
				var element = createSubredditStylesheetElement(subreddit);
				return element;
			}).reduce(function(collection, element) {
				return collection.add(element);
			}, $());

		var removeElements = remove.map(function(subreddit) {
				return findSubredditStylesheetElement(subreddit);
			})
			.reduce(function(collection, elements) {
				return collection.add(elements);
			}, $());


		$(document.head).append(addElements);
		removeElements.remove();

	}

	function findSubredditStylesheetElement(subreddit) {
		var element = $('link[rel=stylesheet]')
			.filter(function() {
				var subreddit = $.data(this, 'res-stylesheet');
				if (subreddit && subreddit.toLowerCase() === subreddit.toLowerCase()) {
					return true;
				}
			});
		return element;
	}

	function createSubredditStylesheetElement(subreddit) {
			var element = $('<link rel="stylesheet">')
			.data('res-stylesheet', subreddit)
			.attr('href', '/r/' + subreddit + '/stylesheet.css');
		return element;
	}



});
