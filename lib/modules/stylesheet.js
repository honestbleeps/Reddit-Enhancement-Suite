addModule('stylesheet', function(module, moduleID) {
	module.moduleName = 'Stylesheet Loader';
	module.description = 'Load stylesheets from other subreddits or load your own CSS snippets.';
	module.category = 'Appearance';
	module.exclude = [
		'prefs',
		'account',
		'subredditAbout'
	];

	module.options.redditThemes = {
		description: 'reddit allows you to customize the appearance of reddit! A reddit theme will be applied anywhere the default reddit style is present and subreddit style is disabled via reddit.',
		type: 'button',
		text: 'learn more',
		callback: function() {
			window.location.href = 'https://www.reddit.com/r/Enhancement/wiki/faq/srstyle#reddit_themes';
		}
	};

	module.options.loadSubredditStylesheets = {
		type: 'table',
		value: [
			['RESUpdates', 'everywhere']
		],
		fields: [{
			name: 'subreddit',
			type: 'list',
			listType: 'subreddits'
		}, {
			name: 'applyTo',
			type: 'enum',
			values: [{
				name: 'Everywhere',
				value: 'everywhere'
			}, {
				name: 'Everywhere but:',
				value: 'exclude'
			}, {
				name: 'Only on:',
				value: 'include'
			}],
			value: 'everywhere',
			description: 'Apply filter to:'
		}, {
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits'
		}, {
			name: 'toggleName',
			type: 'text'
		}]
	};

	module.options.snippets = {
		type: 'table',
		value: [],
		fields: [{
			name: 'snippet',
			type: 'textarea'
		}, {
			name: 'applyTo',
			type: 'enum',
			values: [{
				name: 'Everywhere',
				value: 'everywhere'
			}, {
				name: 'Everywhere but:',
				value: 'exclude'
			}, {
				name: 'Only on:',
				value: 'include'
			}],
			value: 'everywhere',
			description: 'Apply filter to:'
		}, {
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits'
		}, {
			name: 'toggleName',
			type: 'text'
		}]
	};

	module.options.bodyClasses = {
		type: 'table',
		value: [],
		fields: [{
			name: 'classes',
			type: 'text'
		}, {
			name: 'applyTo',
			type: 'enum',
			values: [{
				name: 'Everywhere',
				value: 'everywhere'
			}, {
				name: 'Everywhere but:',
				value: 'exclude'
			}, {
				name: 'Only on:',
				value: 'include'
			}],
			value: 'everywhere',
			description: 'Apply filter to:'
		}, {
			name: 'applyToSubreddits',
			type: 'list',
			listType: 'subreddits'
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
			'\n\n<br><br>For example, /u/ExampleUser/m/ExampleMulti adds <code>body.res-user-exampleuser-m-examplemulti</code>'
	};
	module.options.usernameClass = {
		type: 'boolean',
		value: true,
		description: 'When browsing a user profile, add the username as a class to the body.' +
			'\n\n<br><br>For example, /u/ExampleUser adds <code>body.res-user-exampleuser</code>'
	};
	module.options.loggedInUserClass = {
		type: 'boolean',
		value: false,
		description: 'When logged in, add your username as a class to the body.' +
			'\n\n<br><br>For example, /u/ExampleUser adds <code>body.res-me-exampleuser</code>'
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
		applyBodyClasses();
		RESUtils.init.await.headReady.then(loadSubredditStylesheets);
		RESUtils.init.await.headReady.then(applyCssSnippets);

		$(modules['customToggles']).on('activated deactivated', function() {
			applyBodyClasses();
			loadSubredditStylesheets();
			applyCssSnippets();
		});
	};

	module.go = function() {
		if (!(module.isEnabled() && module.isMatchURL())) return;

		if (module.options.loggedInUserClass.value) {
			applyLoggedInUserClass();
		}
	};

	function applySubredditClass() {
		var name = RESUtils.currentSubreddit();
		if (name) {
			name = name.toLowerCase();
			RESUtils.bodyClasses.add('res-r-' + name);
		}
	}

	function applyMultiredditClass() {
		var name = RESUtils.currentMultireddit();
		if (name) {
			name = name.toLowerCase().replace(/\//g, '-');
			RESUtils.bodyClasses.add('res-' + name);
		}
	}

	function applyUsernameClass() {
		var name = RESUtils.currentUserProfile();
		if (name) {
			name = name.toLowerCase();
			RESUtils.bodyClasses.add('res-user-' + name);
		}
	}

	function applyLoggedInUserClass() {
		var name = RESUtils.loggedInUser();
		if (name) {
			name = name.toLowerCase();
			RESUtils.bodyClasses.add('res-me-' + name);
		}
	}

	function applyBodyClasses() {
		var addClasses = module.options.bodyClasses.value
			.filter(function(row) {
				return shouldApply(row[3], row[1], row[2]);
			})
			.map(function(row) {
				return (row[0] || '').split(/[\s,]/);
			});

		var removeClasses = module.options.bodyClasses.value
			.filter(function(row) {
				return !shouldApply(row[3], row[1], row[2]);
			})
			.map(function(row) {
				return (row[0] || '').split(/[\s,]/);
			});


		RESUtils.bodyClasses.add.apply(RESUtils, addClasses);
		RESUtils.bodyClasses.remove.apply(RESUtils, removeClasses);
	}


	function sanitizeSubredditList(uncleanRows) {
		var uncleanValues = uncleanRows.map(function(row) {
			return row[0];
		});

		var subreddits = RESUtils.options.listTypes['subreddits'].sanitizeValues(uncleanValues);
		return subreddits;
	}

	function loadSubredditStylesheets() {
		var remove = module.options.loadSubredditStylesheets.value
			.filter(function(row) {
				return !shouldApply(row[3], row[1], row[2]);
			});
		remove = sanitizeSubredditList(remove);


		var add = module.options.loadSubredditStylesheets.value
			.filter(function(row) {
				return shouldApply(row[3], row[1], row[2]);
			});
		add = sanitizeSubredditList(add);
		add = add.filter(function(subreddit) {
			return remove.indexOf(subreddit) === -1;
		});

		var addElements = add
			.filter(function(subreddit) {
				var element = findSubredditStylesheetElement(subreddit);
				return element.length === 0;
			})
			.map(function(subreddit) {
				var element = createSubredditStylesheetElement(subreddit);
				return element;
			})
			.reduce(function(collection, element) {
				return collection.add(element);
			}, $());

		var removeElements = remove
			.map(function(subreddit) {
				return findSubredditStylesheetElement(subreddit);
			})
			.reduce(function(collection, elements) {
				return collection.add(elements);
			}, $());


		$(document.head).append(addElements);
		removeElements.remove();
	}

	function findSubredditStylesheetElement(findSubreddit) {
		if (!findSubreddit) return $();
		findSubreddit = findSubreddit.toLowerCase();
		var element = $('link[rel=stylesheet]')
			.filter(function() {
				var subreddit = $.data(this, 'res-stylesheet');
				if (subreddit && findSubreddit === subreddit.toLowerCase()) {
					return true;
				}
			});
		return element;
	}

	function createSubredditStylesheetElement(subreddit) {
		var element = $('<link rel="stylesheet">')
			.data('res-stylesheet', subreddit)
			.attr('href', document.location.origin + '/r/' + subreddit + '/stylesheet.css');
		return element;
	}

	function applyCssSnippets() {
		function findSnippetElement(css) {
			if (!css) return $();
			return $('style.res-snippet').filter(function() {
				return $(this).text() === css;
			});
		}
		function createSnippetElement(css) {
			return $('<style class="res-snippet">').text(css);
		}

		var addElements = module.options.snippets.value
			.filter(function(row) {
				return shouldApply(row[3], row[1], row[2]) &&
					findSnippetElement(row[0]).length === 0;
			})
			.map(function(row) {
				return createSnippetElement(row[0]);
			})
			.reduce(function(collection, element) {
				return collection.add(element);
			}, $());

		var removeElements = module.options.snippets.value
			.filter(function(row) {
				return !shouldApply(row[3], row[1], row[2]);
			})
			.map(function(row) {
				return findSnippetElement(row[0]);
			})
			.reduce(function(collection, element) {
				return collection.add(element);
			}, $());

		$(document.head).append(addElements);
		removeElements.remove();
	}

	function shouldApply(toggle, applyTo, applyList) {
		if (toggle && !modules['customToggles'].toggleActive(toggle)) return false;

		var subreddit = RESUtils.currentSubreddit();
		if (!subreddit) return true;

		var all = (applyList && applyList.indexOf('all') !== -1);
		switch (applyTo) {
			case 'exclude':
				if ((applyList.indexOf(subreddit) !== -1) || all) {
					return false;
				}
				break;
			case 'include':
				if (!((applyList.indexOf(subreddit) !== -1) || all)) {
					return false;
				}
				break;
		}
		return true;
	}
});
