addModule('stylesheet', (module, moduleID) => {
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
		callback() {
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
		description: `
			When browsing a subreddit, add the subreddit name as a class to the body.
			<br><br>For example, /r/ExampleSubreddit adds <code>body.res-r-examplesubreddit</code>
		`
	};
	module.options.multiredditClass = {
		type: 'boolean',
		value: true,
		description: `
			When browsing a multireddit, add the multireddit name as a class to the body.
			<br><br>For example, /u/ExampleUser/m/ExampleMulti adds <code>body.res-user-exampleuser-m-examplemulti</code>
		`
	};
	module.options.usernameClass = {
		type: 'boolean',
		value: true,
		description: `
			When browsing a user profile, add the username as a class to the body.
			<br><br>For example, /u/ExampleUser adds <code>body.res-user-exampleuser</code>
		`
	};
	module.options.loggedInUserClass = {
		type: 'boolean',
		value: false,
		description: `
			When logged in, add your username as a class to the body.
			<br><br>For example, /u/ExampleUser adds <code>body.res-me-exampleuser</code>
		`
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

		$(modules['customToggles']).on('activated deactivated', () => {
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
		let name = RESUtils.currentSubreddit();
		if (name) {
			name = name.toLowerCase();
			RESUtils.bodyClasses.add(`res-r-${name}`);
		}
	}

	function applyMultiredditClass() {
		let name = RESUtils.currentMultireddit();
		if (name) {
			name = name.toLowerCase().replace(/\//g, '-');
			RESUtils.bodyClasses.add(`res-${name}`);
		}
	}

	function applyUsernameClass() {
		let name = RESUtils.currentUserProfile();
		if (name) {
			name = name.toLowerCase();
			RESUtils.bodyClasses.add(`res-user-${name}`);
		}
	}

	function applyLoggedInUserClass() {
		let name = RESUtils.loggedInUser();
		if (name) {
			name = name.toLowerCase();
			RESUtils.bodyClasses.add(`res-me-${name}`);
		}
	}

	function applyBodyClasses() {
		const addClasses = module.options.bodyClasses.value
			.filter(row => shouldApply(row[3], row[1], row[2]))
			.map(row => (row[0] || '').split(/[\s,]/));

		const removeClasses = module.options.bodyClasses.value
			.filter(row => !shouldApply(row[3], row[1], row[2]))
			.map(row => (row[0] || '').split(/[\s,]/));


		RESUtils.bodyClasses.add(...addClasses);
		RESUtils.bodyClasses.remove(...removeClasses);
	}


	function sanitizeSubredditList() {
		const uncleanValues = this.map(row => row[0]);
		return RESUtils.options.listTypes['subreddits'].sanitizeValues(uncleanValues);
	}

	function loadSubredditStylesheets() {
		const remove = module.options.loadSubredditStylesheets.value
			.filter(row => !shouldApply(row[3], row[1], row[2]))
			::sanitizeSubredditList();

		const add = module.options.loadSubredditStylesheets.value
			.filter(row => shouldApply(row[3], row[1], row[2]))
			::sanitizeSubredditList()
			.filter(subreddit => remove.indexOf(subreddit) === -1);

		const addElements = add
			.filter(subreddit => findSubredditStylesheetElement(subreddit).length === 0)
			.map(subreddit => createSubredditStylesheetElement(subreddit))
			.reduce((collection, element) => collection.add(element), $());

		const removeElements = remove
			.map(subreddit => findSubredditStylesheetElement(subreddit))
			.reduce((collection, elements) => collection.add(elements), $());


		$(document.head).append(addElements);
		removeElements.remove();
	}

	function findSubredditStylesheetElement(findSubreddit) {
		if (!findSubreddit) return $();
		findSubreddit = findSubreddit.toLowerCase();
		return $('link[rel=stylesheet]')
			.filter(function() {
				const subreddit = $.data(this, 'res-stylesheet');
				if (subreddit && findSubreddit === subreddit.toLowerCase()) {
					return true;
				}
			});
	}

	function createSubredditStylesheetElement(subreddit) {
		return $('<link rel="stylesheet">')
			.data('res-stylesheet', subreddit)
			.attr('href', `/r/${subreddit}/stylesheet.css`);
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

		const addElements = module.options.snippets.value
			.filter(row => shouldApply(row[3], row[1], row[2]) && findSnippetElement(row[0]).length === 0)
			.map(row => createSnippetElement(row[0]))
			.reduce((collection, element) => collection.add(element), $());

		const removeElements = module.options.snippets.value
			.filter(row => !shouldApply(row[3], row[1], row[2]))
			.map(row => findSnippetElement(row[0]))
			.reduce((collection, element) => collection.add(element), $());

		$(document.head).append(addElements);
		removeElements.remove();
	}

	function shouldApply(toggle, applyTo, applyList) {
		if (toggle && !modules['customToggles'].toggleActive(toggle)) return false;

		const subreddit = RESUtils.currentSubreddit();
		if (!subreddit) return true;

		const all = (applyList && applyList.indexOf('all') !== -1);
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
			default:
				break;
		}
		return true;
	}
});
