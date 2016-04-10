// import announcementsNotificationTemplate from '../templates/announcementsNotification.hbs';

addModule('announcements', (module, moduleID) => {
	module.moduleName = 'RES Announcements';
	module.category = 'Core';
	module.description = 'Keep up with important news';
	module.hidden = true;

	const subreddit = RESMetadata.announcementsSubreddit;
	const sourceUrl = `/r/${subreddit}/new.json?limit=1`;
	const viewUrl = `/r/${subreddit}/new`;

	const keys = {
		markedReadDate: 'RESmodules.announcement.markedReadDate',
		lastUnreadDate: 'RESmodules.announcement.lastUnreadDate',
		lastID: 'RESModules.announcement.lastAnnouncementID'
	};

	const archiveAfter = 31 * RESUtils.DAY;
	const pizzazzAfter = 29 * RESUtils.DAY;
	// const notifyAgainAfter = 4 * RESUtils.DAY;
	const recheckPostAfter = RESUtils.HOUR;

	const now = Date.now();

	module.go = function() {
		if (RESUtils.currentSubreddit(subreddit)) {
			setMarkedRead();
		} else {
			maybeNotify();
		}
	};

	function openAnnouncements() {
		location.href = viewUrl;
	}

	async function maybeNotify() {
		const post = await getLatestPost();
		// has the user ever seen a notification? (i.e. is this a fresh install?)
		const hasSeenNotification = await RESEnvironment.storage.has(keys.lastUnreadDate);

		if (!post) {
			return;
		}

		// if the post is novel, mark the latest ID and unread date, even if we don't end up showing a notification
		if (await RESEnvironment.storage.get(keys.lastID) !== post.id) {
			RESEnvironment.storage.set(keys.lastID, post.id);
			RESEnvironment.storage.set(keys.lastUnreadDate, now);
		}

		if (post.created_js + archiveAfter <= now) {
			// archived
			return;
		}

		if (post.created_js <= await getMarkedRead()) {
			// posted before last "marked read"
			return;
		}

		const lastUnreadDate = await RESEnvironment.storage.get(keys.lastUnreadDate);

		const url = post.id ? `/${post.id}` : viewUrl;
		const withPizzazz = lastUnreadDate + pizzazzAfter < now;

		showMenuBadge(post, url, withPizzazz);

		if (hasSeenNotification) {
			// showNotification(post, url); // TODO: Make this slightly less obnoxious
			addMenuItem(post, url);
		}
	}

	/*
	function showNotification(post, url) {
		const $message = $(announcementsNotificationTemplate({ url, viewUrl, post }));

		modules['notifications'].showNotification({
			moduleID,
			notificationID: post.id || subreddit,
			sticky: true,
			cooldown: notifyAgainAfter,
			header: `New post in /r/${subreddit}`,
			message: $message
		});
	}
	*/

	function showMenuBadge(post, url, withPizzazz) {
		modules['RESMenu'].setNewNotification(openAnnouncements, withPizzazz);
	}

	function addMenuItem(post, url) {
		const menuItem = RESUtils.createElement('div', 'RESAnnouncementMenuItem');
		$('<span class="RESMenuItemButton"><span class="gearIcon newNotification" title="mark as read" /></span>')
			.appendTo(menuItem)
			.on('click', e => {
				e.preventDefault();
				e.stopPropagation();

				setMarkedRead();
				e.target.classList.remove('newNotification');
			});
		const menuMessage = `A new post has been made to /r/${subreddit}${post.author ? ` by /u/${post.author}` : ''}`;
		$('<a>new announcement!</a>')
			.attr({ href: url, title: menuMessage })
			.appendTo(menuItem);
		modules['RESMenu'].addMenuItem(menuItem, openAnnouncements);
	}

	module.resetStorage = function(values) {
		// For debugging
		Object.keys(keys).forEach(name => RESEnvironment.storage.delete(keys[name]));
		console.log('Cleared storage items for', moduleID);

		if (values) {
			Object.keys(values).forEach(name => RESEnvironment.storage.set(keys[name], values[name]));
			console.log('Set storage items:', values);
		}
	};

	async function getLatestPost() {
		const { data: { children: [{ data }] } } = await RESEnvironment.ajax({
			url: sourceUrl,
			type: 'json',
			cacheFor: recheckPostAfter
		});

		return {
			...data,
			created_js: data.created_utc * 1000
		};
	}

	async function getMarkedRead() {
		return parseInt(await RESEnvironment.storage.get(keys.markedReadDate), 10) || 0;
	}

	function setMarkedRead() {
		RESEnvironment.storage.set(keys.markedReadDate, now);
	}
});
