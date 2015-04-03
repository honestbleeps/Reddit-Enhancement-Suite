addModule('stylesheet', function(module, moduleID) {
	module.moduleName = 'Stylesheet Loader';
	module.description = 'Load stylesheets from other subreddits';
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

	module.options.subredditClass = {
		type: 'boolean',
		value: true,
		description: 'When browsing a subreddit, add the subreddit name as a class to the body.' +
			'\n\n<br><br>For example, /r/ExampleSubreddit adds <code>body.res-r-examplesubreddit</code>'
	};
	module.options.multiredditClass = {
		type: 'boolean',
		value: true,
		description: 'When browsing a multireddit, add the multireddit name as a class to the body.' +
			'\n\n<br><br>For example, /u/ExampleUser/m/ExampleMulti adds <code>body.res-m-examplemulti</code>'
	};
	module.options.usernameClass = {
		type: 'boolean',
		value: true,
		description: 'When browsing a user profile, add the username as a class to the body.' +
			'\n\n<br><br>For example, /u/ExampleUser adds <code>body.res-u-exampleuser</code>'
	};

	module.beforeLoad = function() {
		if (!(module.isEnabled() && module.isMatchURL())) return;

		if (module.options.subredditClass.value) {
			applySubredditClass();
		}
		if (module.options.usernameClass.value) {
			applyUsernameClass();
		}
		if (module.options.multiredditClass.value) {
			applyMultiredditClass();
		}
		applyDocumentClasses();
		loadSubredditStylesheets();

		$(modules['customToggles']).on('activated deactivated', function() {
			applyDocumentClasses();
			loadSubredditStylesheets();
		});
	};

	function applySubredditClass() {
		var name = RESUtils.currentSubreddit();
		if (name) {
			name = name.toLowerCase();
			RESUtils.addBodyClasses('res-r-' + name);
		}
	};

	function applyMultiredditClass() {
		var name = RESUtils.currentMultireddit();
		if (name) {
			name = name.toLowerCase();
			RESUtils.addBodyClasses('res-m-' + name);
		}
	};

	function applyUsernameClass() {
		var name = RESUtils.currentUserProfile();
		if (name) {
			name = name.toLowerCase();
			RESUtils.addBodyClasses('res-u-' + name);
		}
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
		if (!subreddit) return $();
		subreddit = subreddit.toLowerCase();
		var element = $('link[rel=stylesheet]')
			.filter(function() {
				var subreddit = $.data(this, 'res-stylesheet');
				if (subreddit === subreddit.toLowerCase()) {
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
