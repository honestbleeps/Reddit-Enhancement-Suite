addModule('RESAnnouncements', function(module, moduleID) {
	module.moduleName = 'RES Announcements';
	module.category = 'Core';
	module.description = 'Keep up with important news';
	module.alwaysEnabled = true;
	module.hidden = true;

	var sourceUrl = 'r/RESAnnouncements/new.json?limit=1&app=res';
	var viewUrl = '/r/RESAnnouncements/new';

	var keys = {
		unread: 'RESmodules.announcement.newAnnouncement',
		posts: 'RESmodules.announcements.announcements',
		lastID: 'RESModules.announcement.lastAnnouncementID'
	};

	module.go = function() {
		if (RESUtils.currentSubreddit('RESAnnouncements')) {
			clearUnread();
		}
		checkForUpdate();
		if (RESStorage.getItem(keys.unread)) {
			setNewNotification();
		}
	};

	function openAnnouncements() {
		location.href = viewUrl;
	}

	function setNewNotification() {
		modules['RESMenu'].setNewNotification(openAnnouncements);

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
	}

	function checkForUpdate() {
		RESUtils.cache.fetch({
			key: keys.posts,
			endpoint: sourceUrl,
			expires: 86400000, // 24hrs
			callback: function(data) {
				var lastID = RESStorage.getItem(keys.lastID);

				var thisID = data.data.children[0].data.id;
				if (thisID !== lastID) {
					RESStorage.setItem(keys.unread, 'true');
					setNewNotification();
				}
				RESStorage.setItem(keys.lastID, thisID);
			}
		});
	}
});
