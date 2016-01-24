addModule('subredditInfo', function(module, moduleID) {
	module.moduleName = 'Subreddit Info';
	module.category = ['Subreddits'];
	module.description = 'Adds a hover tooltip to subreddits';
	module.options = {
		hoverDelay: {
			type: 'text',
			value: 800,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.',
			advanced: true
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.',
			advanced: true
		},
		fadeSpeed: {
			type: 'text',
			value: 0.7,
			description: 'Fade animation\'s speed (in seconds). Default is 0.7.',
			advanced: true
		},
		USDateFormat: {
			type: 'boolean',
			value: false,
			description: 'Show date (subreddit created...) in US format (i.e. 08-31-2010)',
			advanced: true
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			$('body').on('mouseover', 'a.subreddit, a.search-subreddit-link, .md a[href^="/r/"]', handleMouseOver);
		}
	};

	function handleMouseOver(e) {
		// ensure it's a local link, in case some other website could have /r/ in its URLs.
		if (!e.target.href || (e.target.href.indexOf(location.hostname) === -1) || (e.target.textContent.substr(0, 5) === 'self.')) {
			return;
		}
		modules['hover'].infocard('subredditInfo')
			.target(e.target)
			.options({
				width: 450,
				openDelay: module.options.hoverDelay.value,
				fadeDelay: module.options.fadeDelay.value,
				fadeSpeed: module.options.fadeSpeed.value
			})
			.populateWith(showSubredditInfo)
			.begin();
	}

	// create a cache for subreddit data so we only load it once even if the hover is triggered many times
	var subredditInfoCache = [];

	function showSubredditInfo(def, obj, context) {
		var thisSubreddit = obj.href.match(RESUtils.regexes.subredditPostListing)[1].toLowerCase();
		var header = document.createDocumentFragment();
		var link = $('<a href="/r/' + escapeHTML(thisSubreddit) + '">/r/' + escapeHTML(thisSubreddit) + '</a>');
		header.appendChild(link[0]);
		if (RESUtils.loggedInUser()) {
			var subscribeToggle = $('<span />');
			subscribeToggle
				.attr('id', 'RESHoverInfoSubscriptionButton')
				.addClass('res-fancy-toggle-button')
				.css('margin-left', '12px')
				.hide()
				.on('click', toggleSubscription);
			updateToggleButton(subscribeToggle, false);

			header.appendChild(subscribeToggle[0]);
		}
		def.notify(header, null);
		if (subredditInfoCache.hasOwnProperty(thisSubreddit)) {
			writeSubredditInfo(subredditInfoCache[thisSubreddit], def);
		} else {
			RESEnvironment.ajax({
				method: 'GET',
				url: location.protocol + '//' + location.hostname + '/r/' + thisSubreddit + '/about.json?app=res',
				onload: function(response) {
					var thisResponse = safeJSON.parse(response.responseText, null, true);
					if (thisResponse) {
						updateCache(thisSubreddit, thisResponse);
						writeSubredditInfo(thisResponse, def);
					} else {
						writeSubredditInfo({}, def);
					}
				}
			});
		}
	}

	function updateCache(subreddit, data) {
		subreddit = subreddit.toLowerCase();
		if (!data.data) {
			data = {
				data: data
			};
		}
		subredditInfoCache[subreddit] = $.extend(true, {}, subredditInfoCache[subreddit], data);
	}

	function writeSubredditInfo(jsonData, deferred) {
		if (!(jsonData && jsonData.data) || jsonData.kind !== 't5') {
			deferred.resolve(undefined, 'Subreddit not found');
			return false;
		}
		var utctime = jsonData.data.created_utc;
		var d = new Date(utctime * 1000);
		var isOver18 = (jsonData.data.over18 ? 'Yes' : 'No');
		var srHTML = '<div class="subredditInfoToolTip">';
		srHTML += '<div class="subredditLabel">Subreddit created:</div> <div class="subredditDetail">' + RESUtils.niceDate(d, module.options.USDateFormat.value) + ' (' + RESUtils.niceDateDiff(d) + ')</div>';
		srHTML += '<div class="subredditLabel">Subscribers:</div> <div class="subredditDetail">' + RESUtils.createElement.commaDelimitedNumber(jsonData.data.subscribers) + '</div>';
		srHTML += '<div class="subredditLabel">Title:</div> <div class="subredditDetail">' + escapeHTML(jsonData.data.title) + '</div>';
		srHTML += '<div class="subredditLabel">Over 18:</div> <div class="subredditDetail">' + escapeHTML(isOver18) + '</div>';
		// srHTML += '<div class="subredditLabel">Description:</div> <div class="subredditDetail">' + jsonData.data.description + '</div>';
		srHTML += '<div class="clear"></div><div id="subTooltipButtons" class="bottomButtons">';
		srHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		srHTML += '</div>';

		var newBody = $(srHTML);
		var exists;
		// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
		if (modules['subredditManager'].isEnabled()) {
			var theSC = document.createElement('span');
			theSC.setAttribute('class', 'res-fancy-toggle-button REStoggle RESshortcut');
			theSC.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var idx = modules['subredditManager'].mySubredditShortcuts.findIndex(function(shortcut) {
				return shortcut.subreddit.toLowerCase() === jsonData.data.display_name.toLowerCase();
			});
			if (idx !== -1) {
				theSC.textContent = '-shortcut';
				theSC.setAttribute('title', 'Remove this subreddit from your shortcut bar');
				theSC.classList.add('remove');
			} else {
				theSC.textContent = '+shortcut';
				theSC.setAttribute('title', 'Add this subreddit to your shortcut bar');
			}
			theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);

			newBody.find('#subTooltipButtons').append(theSC);
		}
		if (modules['dashboard'].isEnabled()) {
			var dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class', 'res-fancy-toggle-button RESDashboardToggle');
			dashboardToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			exists = modules['dashboard'].widgets.some(function(widget) {
				return widget && (widget.basePath.toLowerCase() === '/r/' + jsonData.data.display_name.toLowerCase());
			});
			if (exists) {
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title', 'Remove this subreddit from your dashboard');
				dashboardToggle.classList.add('remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
				dashboardToggle.setAttribute('title', 'Add this subreddit to your dashboard');
			}
			dashboardToggle.addEventListener('click', modules['dashboard'].toggleDashboard, false);
			newBody.find('#subTooltipButtons').append(dashboardToggle);
		}
		if (modules['filteReddit'].isEnabled()) {
			var filterToggle = document.createElement('span');
			filterToggle.setAttribute('class', 'res-fancy-toggle-button RESFilterToggle');
			filterToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var filteredReddits = modules['filteReddit'].options.subreddits.value;
			exists = filteredReddits.some(function(reddit) {
				return reddit && (reddit[0].toLowerCase() === jsonData.data.display_name.toLowerCase());
			});
			if (exists) {
				filterToggle.textContent = '-filter';
				filterToggle.setAttribute('title', 'Stop filtering from /r/all and /domain/*');
				filterToggle.classList.add('remove');
			} else {
				filterToggle.textContent = '+filter';
				filterToggle.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
			}
			filterToggle.addEventListener('click', modules['filteReddit'].toggleFilter, false);
			newBody.find('#subTooltipButtons').append(filterToggle);
		}

		if (RESUtils.loggedInUser()) {
			var subscribed = !!jsonData.data.user_is_subscriber;

			var subscribeToggle = $('#RESHoverInfoSubscriptionButton');
			subscribeToggle.attr('data-subreddit', jsonData.data.display_name.toLowerCase());
			updateToggleButton(subscribeToggle, subscribed);
			subscribeToggle.fadeIn('fast');
		}

		deferred.resolve(null, newBody);
	}

	function updateToggleButton(toggleButton, subscribed) {
		if (toggleButton instanceof jQuery) toggleButton = toggleButton[0];
		var toggleOn = '+subscribe';
		var toggleOff = '-unsubscribe';
		if (subscribed) {
			toggleButton.textContent = toggleOff;
			toggleButton.classList.add('remove');
		} else {
			toggleButton.textContent = toggleOn;
			toggleButton.classList.remove('remove');
		}
	}

	function toggleSubscription(e) {
		// Get info
		var subscribeToggle = e.target;
		var subreddit = subscribeToggle.getAttribute('data-subreddit').toLowerCase();
		var subredditData = subredditInfoCache[subreddit].data;
		var subscribing = !subredditData.user_is_subscriber;

		updateToggleButton(subscribeToggle, subscribing);

		modules['subredditManager'].subscribeToSubreddit(subredditData.name, subscribing);
		updateCache(subreddit, {
			'user_is_subscriber': subscribing
		});
	}
});
