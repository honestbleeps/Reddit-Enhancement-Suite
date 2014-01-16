modules['subredditInfo'] = {
	moduleID: 'subredditInfo',
	moduleName: 'Subreddit Info',
	category: 'UI',
	options: {
		hoverDelay: {
			type: 'text',
			value: 800,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.'
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.'
		},
		fadeSpeed: {
			type: 'text',
			value: 0.3,
			description: 'Fade animation\'s speed. Default is 0.3, the range is 0-1. Setting the speed to 1 will disable the animation.'
		},
		USDateFormat: {
			type: 'boolean',
			value: false,
			description: 'Show date (subreddit created...) in US format (i.e. 08-31-2010)'
		}
	},
	description: 'Adds a hover tooltip to subreddits',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var css = '';
			css += '.subredditInfoToolTip .subredditLabel { float: left; width: 140px; margin-bottom: 12px; }';
			css += '.subredditInfoToolTip .subredditDetail { float: left; width: 240px; margin-bottom: 12px; }';
			css += '.subredditInfoToolTip .blueButton { float: right; margin-left: 8px; }';
			css += '.subredditInfoToolTip .redButton { float: right; margin-left: 8px; }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// create a cache for subreddit data so we only load it once even if the hover is triggered many times
			this.subredditInfoCache = [];
			this.srRe = /\/r\/(\w+)(?:\/(new|rising|controversial|top))?\/?$/i;

			// get subreddit links and add event listeners...
			this.addListeners();
			RESUtils.watchForElement('siteTable', modules['subredditInfo'].addListeners);
		}
	},
	addListeners: function(ele) {
		var ele = ele || document.body;
		var subredditLinks = document.body.querySelectorAll('.listing-page a.subreddit, .comment .md a[href^="/r/"]');
		if (subredditLinks) {
			var len = subredditLinks.length;
			for (var i = 0; i < len; i++) {
				var thisSRLink = subredditLinks[i];
				if (modules['subredditInfo'].srRe.test(thisSRLink.href)) {
					thisSRLink.addEventListener('mouseover', function(e) {
						modules['hover'].begin(e.target, {
							width: 450,
							openDelay: modules['subredditInfo'].options.hoverDelay.value,
							fadeDelay: modules['subredditInfo'].options.fadeDelay.value,
							fadeSpeed: modules['subredditInfo'].options.fadeSpeed.value
						}, modules['subredditInfo'].showSubredditInfo, {});
					}, false);
				}
			}
		}
	},
	showSubredditInfo: function(def, obj, context) {
		var mod = modules['subredditInfo'];
		var thisSubreddit = obj.href.replace(/.*\/r\//, '').replace(/\/$/, '');
		var header = document.createDocumentFragment();
		var link = $('<a href="/r/' + escapeHTML(thisSubreddit) + '">/r/' + escapeHTML(thisSubreddit) + '</a>');
		header.appendChild(link[0]);
		if (RESUtils.loggedInUser()) {
			var subscribeToggle = $('<span />');
			subscribeToggle
				.attr('id', 'RESHoverInfoSubscriptionButton')
				.addClass('RESFilterToggle')
				.css('margin-left', '12px')
				.hide()
				.on('click', modules['subredditInfo'].toggleSubscription);
			modules['subredditInfo'].updateToggleButton(subscribeToggle, false);

			header.appendChild(subscribeToggle[0]);
		}
		var body = '\
			<div class="subredditInfoToolTip">\
				<a class="hoverSubreddit" href="/user/' + escapeHTML(thisSubreddit) + '">' + escapeHTML(thisSubreddit) + '</a>:<br>\
				<span class="RESThrobber"></span> loading...\
			</div>';
		def.notify(header, null);
		if (typeof mod.subredditInfoCache[thisSubreddit] !== 'undefined') {
			mod.writeSubredditInfo(mod.subredditInfoCache[thisSubreddit], def);
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + "//" + location.hostname + "/r/" + thisSubreddit + "/about.json?app=res",
				onload: function(response) {
					var thisResponse = safeJSON.parse(response.responseText, null, true);
					if (thisResponse) {
						mod.updateCache(thisSubreddit, thisResponse);
						mod.writeSubredditInfo(thisResponse, def);
					} else {
						mod.writeSubredditInfo({}, def);
					}
				}
			});
		}
	},
	updateCache: function(subreddit, data) {
		subreddit = subreddit.toLowerCase();
		if (!data.data) {
			data = {
				data: data
			};
		}
		this.subredditInfoCache = this.subredditInfoCache || [];
		this.subredditInfoCache[subreddit] = $.extend(true, {}, this.subredditInfoCache[subreddit], data);
	},
	writeSubredditInfo: function(jsonData, deferred) {
		if (!jsonData.data) {
			var srHTML = '<div class="subredditInfoToolTip">Subreddit not found</div>';
			var newBody = $(srHTML);
			deferred.resolve(null, newBody)
			return;
		}
		var utctime = jsonData.data.created_utc;
		var d = new Date(utctime * 1000);
		var isOver18;
		jsonData.data.over18 === true ? isOver18 = 'Yes' : isOver18 = 'No';
		var srHTML = '<div class="subredditInfoToolTip">';
		srHTML += '<div class="subredditLabel">Subreddit created:</div> <div class="subredditDetail">' + RESUtils.niceDate(d, this.options.USDateFormat.value) + ' (' + RESUtils.niceDateDiff(d) + ')</div>';
		srHTML += '<div class="subredditLabel">Subscribers:</div> <div class="subredditDetail">' + RESUtils.addCommas(jsonData.data.subscribers) + '</div>';
		srHTML += '<div class="subredditLabel">Title:</div> <div class="subredditDetail">' + escapeHTML(jsonData.data.title) + '</div>';
		srHTML += '<div class="subredditLabel">Over 18:</div> <div class="subredditDetail">' + escapeHTML(isOver18) + '</div>';
		// srHTML += '<div class="subredditLabel">Description:</div> <div class="subredditDetail">' + jsonData.data.description + '</div>';
		srHTML += '<div class="clear"></div><div id="subTooltipButtons" class="bottomButtons">';
		srHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		srHTML += '</div>';

		var newBody = $(srHTML);
		// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
		if (modules['subredditManager'].isEnabled()) {
			var theSC = document.createElement('span');
			theSC.setAttribute('style', 'display: inline-block !important;');
			theSC.setAttribute('class', 'REStoggle RESshortcut RESshortcutside');
			theSC.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var idx = -1;
			for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
				if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == jsonData.data.display_name.toLowerCase()) {
					idx = i;
					break;
				}
			}
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
			dashboardToggle.setAttribute('class', 'RESDashboardToggle');
			dashboardToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var exists = false;
			for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
				if ((modules['dashboard'].widgets[i]) && (modules['dashboard'].widgets[i].basePath.toLowerCase() === '/r/' + jsonData.data.display_name.toLowerCase())) {
					exists = true;
					break;
				}
			}
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
			filterToggle.setAttribute('class', 'RESFilterToggle');
			filterToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var exists = false;
			var filteredReddits = modules['filteReddit'].options.subreddits.value;
			for (var i = 0, len = filteredReddits.length; i < len; i++) {
				if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() == jsonData.data.display_name.toLowerCase())) {
					exists = true;
					break;
				}
			}
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
			var subscribed = !! jsonData.data.user_is_subscriber;

			var subscribeToggle = $('#RESHoverInfoSubscriptionButton');
			subscribeToggle.attr('data-subreddit', jsonData.data.display_name.toLowerCase());
			modules['subredditInfo'].updateToggleButton(subscribeToggle, subscribed);
			subscribeToggle.fadeIn('fast');
		}

		deferred.resolve(null, newBody)
	},
	updateToggleButton: function(toggleButton, subscribed) {
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
	},
	toggleSubscription: function(e) {
		// Get info
		var subscribeToggle = e.target;
		var subreddit = subscribeToggle.getAttribute('data-subreddit').toLowerCase();
		var subredditData = modules['subredditInfo'].subredditInfoCache[subreddit].data;
		var subscribing = !subredditData.user_is_subscriber;

		modules['subredditInfo'].updateToggleButton(subscribeToggle, subscribing);

		modules['subredditManager'].subscribeToSubreddit(subredditData.name, subscribing);
		modules['subredditInfo'].updateCache(subreddit, {
			'user_is_subscriber': subscribing
		});
	}
};