addModule('stylesheet', function(module, moduleID) {
	module.title = 'Stylesheet Loader';
	module.description = 'Load stylesheets from other subreddits in certain contexts';
	module.category = 'UI';

	module.options.loadSubredditStylesheets = {
		type: 'table',
		fields: [{
			name: 'subreddit',
			type: 'list',
			listType: 'subreddits'
		}, {
			name: 'context',
			type: 'text'
		}]
	};

	module.options.documentClasses = {
		type: 'table',
		fields: [{
			name: 'classes',
			type: 'text'
		}, {
			name: 'context',
			type: 'text'
		}]
	};


	module.beforeLoad = function() {
		if (!(module.isEnabled() && module.isMatchURL())) return;

		applyDocumentClasses();
		loadSubredditStylesheets();
	};

	function applyDocumentClasses() {
		var addClasses = module.options.documentClasses.value
			.filter(function(documentClasses) {
				var context = documentClasses[1];
				return modules['contexts'].contextActive(context);
			})
			.map(function(documentClasses) {
				return documentClasses[0];
			});

		var removeClasses = module.options.documentClasses.value
			.filter(function(documentClasses) {
				var context = documentClasses[1];
				return !modules['contexts'].contextActive(context);
			})
			.map(function(documentClasses) {
				return documentClasses[0];
			});


		RESUtils.documentClasses.add.apply(RESUtils.documentClasses, addClasses);
		RESUtils.documentClasses.remove.apply(RESUtils.documentClasses, removeClasses);
	}


	var _loadSubredditStylesheets;
	function loadSubredditStylesheets() {
		if (!document.head) {
			clearTimeout(_loadSubredditStylesheets);
			_loadSubredditStylesheets = setTimeout(loadSubredditStylesheets, 1)
			return;
		}

		var add = module.options.loadSubredditStylesheets.values
			.filter(function(row) {
				var context = row[1];
				return modules['contexts'].contextActive(context);
			})
			.map(function(row) {
				// TODO: sanitize /r/ and r/ out
				return row[0].split(' ');
			})

		var remove = module.options.loadSubredditStylesheets.values
			.filter(function(row) {
				var context = row[1];
				return !modules['contexts'].contextActive(context);
			})
			.map(function(row) {
				// TODO: sanitize /r/ and r/ out
				return row[0].split(' ');
			})

		add.forEach(function(subreddit) {
			var element = $('link[rel=stylesheet]').filter(function() { return $(this).data('res-stylesheet').toLowerCase() === subreddit.toLowerCase(); });
			if (element.length) return;

			element = $('<link rel="stylesheet">')
				.data('res-stylesheet', subreddit)
				.attr('src', '/r/' + subreddit + '/stylesheet.css');
			element.appendTo(document.head);
		});

		remove.forEach(function(subreddit) {
			var element = $('link[rel=stylesheet]').filter(function() { return $(this).data('res-stylesheet').toLowerCase() === subreddit.toLowerCase(); });
			element.remove();
		}
	}


	module.go = function() {
		$(modules['contexts']).on('activated deactivated', function() {
			applyDocumentClasses();
		});
	}



});
