addModule('announcements', (module, moduleID) => {
	module.moduleName = 'RES Announcements';
	module.category = 'Core';
	module.description = 'Keep up with important news';
	module.alwaysEnabled = true;
	module.hidden = true;

	const sourceUrl = '/r/RESAnnouncements/new.json?limit=1';
	const viewUrl = '/r/RESAnnouncements/new';

	const keys = {
		unread: 'RESmodules.announcement.newAnnouncement',
		lastUnreadDate: 'RESmodules.announcement.lastUnreadDate',
		posts: 'RESmodules.announcements.announcements',
		lastID: 'RESModules.announcement.lastAnnouncementID'
	};

	const clearAnnouncements = RESUtils.currentSubreddit('RESAnnouncements');

	module.beforeLoad = function() {
		if (clearAnnouncements) {
			clearUnread();
		} else {
			checkForUpdate();
		}
	};

	module.go = async function() {
		if (await RESEnvironment.storage.has(keys.unread)) {
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

		const menuItem = RESUtils.createElement('div', 'RESAnnouncementMenuItem');
		$('<span class="RESMenuItemButton"><span class="gearIcon newNotification" /></span>').appendTo(menuItem)
			.on('click', e => {
				e.preventDefault();
				e.stopPropagation();

				clearUnread();
				e.target.classList.remove('newNotification');
			});
		$('<a>new announcement!</a>', { href: viewUrl }).appendTo(menuItem);
		modules['RESMenu'].addMenuItem(menuItem, openAnnouncements);
	}

	function clearUnread() {
		RESEnvironment.storage.delete(keys.unread);
		RESEnvironment.storage.delete(keys.lastUnreadDate);
	}

	async function checkForUpdate() {
		const { data } = await RESEnvironment.ajax({
			url: sourceUrl,
			type: 'json',
			cacheFor: RESUtils.DAY
		});

		const lastID = await RESEnvironment.storage.get(keys.lastID);
		const thisID = data.children[0].data.id;

		if (thisID !== lastID) {
			RESEnvironment.storage.set(keys.unread, true);
			RESEnvironment.storage.set(keys.lastUnreadDate, Date.now());
		}

		RESEnvironment.storage.set(keys.lastID, thisID);
	}
});
