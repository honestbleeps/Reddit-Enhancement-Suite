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
		lastUnreadDate: 'RESmodules.announcement.lastUnreadDate',
		posts: 'RESmodules.announcements.announcements',
		lastID: 'RESModules.announcement.lastAnnouncementID'
	};

	var clearAnnouncements = RESUtils.currentSubreddit('RESAnnouncements');

	module.beforeLoad = function() {
		if (clearAnnouncements) {
			clearUnread();
		} else {
			return checkForUpdate();
		}
	};

	module.go = async function() {
		if (await RESEnvironment.storage.get(keys.unread)) {
			await setNewNotification();
		}
	};

	function openAnnouncements() {
		location.href = viewUrl;
	}

	async function setNewNotification() {
		// if the user hasn't clicked it for 3 days, start to annoy them
		const lastUnread = await RESEnvironment.storage.get(keys.lastUnreadDate);
		const withPizzazz = (lastUnread && (Date.now() - lastUnread > 86400000 * 3));
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
		RESEnvironment.storage.remove(keys.unread);
		RESEnvironment.storage.remove(keys.lastUnreadDate);
	}

	async function checkForUpdate() {
		const { data } = await RESUtils.cache.fetch({
			key: keys.posts,
			endpoint: sourceUrl,
			expires: 86400000 // 24hrs
		});

		const lastID = await RESEnvironment.storage.get(keys.lastID);
		const thisID = data.children[0].data.id;

		if (thisID !== lastID) {
			RESEnvironment.storage.set(keys.unread, 'true');
			RESEnvironment.storage.set(keys.lastUnreadDate, Date.now());
		}

		RESEnvironment.storage.set(keys.lastID, thisID);
	}
});
