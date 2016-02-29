addModule('announcements', function(module, moduleID) {
	module.moduleName = 'RES Announcements';
	module.category = 'Core';
	module.description = 'Keep up with important news';
	module.alwaysEnabled = true;
	module.hidden = true;

	var sourceUrl = 'r/RESAnnouncements/new.json?limit=1&app=res';
	var viewUrl = '/r/RESAnnouncements/new';

	var keys = {
		unread: 'RESmodules.announcement.newAnnouncement',
		lastUnreadDate: 'RESmodules.announcement.lastUnreadDate',
		posts: 'RESmodules.announcements.announcements',
		lastID: 'RESModules.announcement.lastAnnouncementID'
	};

	var clearAnnouncements = RESUtils.currentSubreddit('RESAnnouncements');

	module.beforeLoad = function() {
		return RESStorage.loadItem.apply(RESStorage, Object.getOwnPropertyNames(keys).map(function(key) {
			return keys[key];
		}))
		.then(function() {
			if (clearAnnouncements) {
				clearUnread();
				return false;
			} else {
				return checkForUpdate();
			}
		});
	};

	module.go = function() {
		if (RESStorage.getItem(keys.unread)) {
			setNewNotification();
		}
	};

	function openAnnouncements() {
		location.href = viewUrl;
	}

	function setNewNotification() {
		// if the user hasn't clicked it for 3 days, start to annoy them
		var lastUnread = RESStorage.getItem(keys.lastUnreadDate),
			withPizzazz = (lastUnread && (new Date() - lastUnread > 86400000 * 3));
		modules['RESMenu'].setNewNotification(openAnnouncements, withPizzazz);

		var menuItem = RESUtils.createElement('div', 'RESAnnouncementMenuItem');
		$('<span class="RESMenuItemButton"><span class="gearIcon newNotification" /></span>').appendTo(menuItem)
			.on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();

				clearUnread();
				e.target.classList.remove('newNotification');
			});
		$('<a>new announcement!</a>', { href: viewUrl }).appendTo(menuItem);
		modules['RESMenu'].addMenuItem(menuItem, openAnnouncements);
	}

	function clearUnread() {
		RESStorage.removeItem(keys.unread);
		RESStorage.removeItem(keys.lastUnreadDate);
		return $.Deferred().resolve(false);
	}

	function checkForUpdate() {
		return RESUtils.cache.fetch({
			key: keys.posts,
			endpoint: sourceUrl,
			expires: 86400000, // 24hrs
			callback: function(data) {
				var lastID = RESStorage.getItem(keys.lastID);

				var thisID = data.data.children[0].data.id;
				if (thisID !== lastID) {
					RESStorage.setItem(keys.unread, 'true');
					RESStorage.setItem(keys.lastUnreadDate, new Date());
					setNewNotification();
				}
				RESStorage.setItem(keys.lastID, thisID);
			}
		});
	}
});
