addModule('announcements', function(module, moduleID) {
	module.moduleName = 'RES Announcements';
	module.category = 'Core';
	module.description = 'Keep up with important news';
	module.hidden = true;

	var subreddit = RESMetadata.announcementsSubreddit;
	var sourceUrl = 'r/' + subreddit + '/new.json?limit=1&app=res';
	var viewUrl = '/r/' + subreddit + '/new';

	var keys = {
		markedReadDate: 'RESmodules.announcement.markedReadDate',
		lastUnreadDate: 'RESmodules.announcement.lastUnreadDate',
		posts: 'RESmodules.announcements.announcements',
		lastID: 'RESModules.announcement.lastAnnouncementID'
	};

	var archiveAfter = 86400000 * 31; //14;
	var pizzazzAfter = 86400000 * 29; //3;
	// var notifyAgainAfter = 86400000 * 4;
	var recheckPostAfter = 3600000; // 1hr

	var now = Date.now();
	var latestPost;
	var lastUnreadDate;
	var storageWorks;

	module.beforeLoad = function() {
		return RESStorage.loadItem.apply(RESStorage, Object.getOwnPropertyNames(keys).map(function(key) {
			return keys[key];
		}))
		.then(function() {
			lastUnreadDate = RESStorage.getItem(keys.lastUnreadDate);
			if (lastUnreadDate) {
				storageWorks = true;
			}
		})
		.then(function() {
			return getLatestPost().then(function(post) {
				latestPost = post;
				if (RESStorage.getItem(keys.lastID) !== post.id) {
					RESStorage.setItem(keys.lastID, post.id);
					RESStorage.setItem(keys.lastUnreadDate, now);
					lastUnreadDate = now;
				}
			});
		});
	};

	module.go = function() {
		if (RESUtils.currentSubreddit(subreddit)) {
			setMarkedRead();
		} else {
			notify(latestPost);
		}
	};

	function openAnnouncements() {
		location.href = viewUrl;
	}

	function notify(post) {
		if (!post) {
			return;
		}

		if (latestPost.created_js + archiveAfter <= now) {
			// archived
			return;
		}

		if (latestPost.created_js <= getMarkedRead()) {
			// posted since last "marked read"
			return;
		}

		var url = post && post.id ? 'https://redd.it/' + post.id : viewUrl;

		showMenuBadge(post, url);
		if (storageWorks) {
			// showNotification(post, url);  // TODO: Make this slightly less obnoxious
			addMenuItem(post, url);
		}
	}
	/*
	function showNotification(post, url) {
		RESTemplates.load('announcements-notification', function(template) {
			var $message = template.html({
				url: url,
				viewUrl: viewUrl,
				post: post
			});

			modules['notifications'].showNotification({
				moduleID: moduleID,
				notificationID: post.id || subreddit,
				sticky: true,
				cooldown: notifyAgainAfter,
				header: 'New post in /r/' + subreddit,
				message: $message
			});
		});
	}
	*/

	function showMenuBadge(post, url) {
		var withPizzazz = lastUnreadDate && lastUnreadDate + pizzazzAfter < now;
		modules['RESMenu'].setNewNotification(openAnnouncements, withPizzazz);
	}

	function addMenuItem(post, url) {
		var menuItem = RESUtils.createElement('div', 'RESAnnouncementMenuItem');
		$('<span class="RESMenuItemButton"><span class="gearIcon newNotification" title="mark as read" /></span>').appendTo(menuItem)
			.on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();

				setMarkedRead();
				e.target.classList.remove('newNotification');
			});
		var menuMessage = 'A new post has been made to /r/' + subreddit + (post.author ? ' by /u/' + post.author : '');
		$('<a>new announcement!</a>').attr({ href: url, title: menuMessage }).appendTo(menuItem);
		modules['RESMenu'].addMenuItem(menuItem, openAnnouncements);
	}

	module.resetStorage = function(values) {
		// For debugging
		Object.keys(keys).forEach(function(name) {
			RESStorage.removeItem(keys[name]);
		});
		console.log('Cleared storage items for', moduleID);

		if (values) {
			Object.keys(values).forEach(function(name) {
				RESStorage.setItem(keys[name], values[name]);
			});
			console.log('Set storage items:', values);
		}
	};


	function getLatestPost() {
		var deferred = $.Deferred();
		RESUtils.cache.fetch({
			key: keys.posts,
			endpoint: sourceUrl,
			expires: recheckPostAfter,
			callback: function(data) {
				var post = data.data.children[0].data;
				post.created_js = post.created_utc * 1000;
				deferred.resolve(post);
			}
		});
		return deferred.promise();
	}

	function getMarkedRead() {
		return parseInt(RESStorage.getItem(keys.markedReadDate), 10) || 0;
	}

	function setMarkedRead() {
		RESStorage.setItem(keys.markedReadDate, now);
	}
});
