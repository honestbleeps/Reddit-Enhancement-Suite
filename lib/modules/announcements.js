addModule('RESAnnouncements', function(module, moduleID) {
	module.moduleName = 'RES Announcements';
	module.category = 'About RES';
	module.description = 'Keep up with important news';
	module.alwaysEnabled = true;
	module.hidden = true;

	module.go = function() {
		checkForUpdate();
		if (RESStorage.getItem('RES.newAnnouncement')) {
			setNewNotification();
		}
	}

	function setNewNotification() {
		modules['RESMenu'].setNewNotification(function() {
			location.href = '/r/RESAnnouncements';
		});
	}

	function checkForUpdate() {
		if (RESUtils.currentSubreddit('RESAnnouncements')) {
			RESStorage.removeItem('RES.newAnnouncement');
		}
		RESUtils.cache.fetch({
			key: 'RESmodules.announcements.announcements',
			endPoint: 'r/RESAnnouncements/.json?limit=1&app=res',
			expires: 86400000, // 24hrs
			callback: function(data) {
				var lastID = RESStorage.getItem('RES.lastAnnouncementID');

				var thisID = data.data.children[0].data.id;
				if (thisID !== lastID) {
					RESStorage.setItem('RES.newAnnouncement', 'true');
					module.setNewNotification();
				}
				RESStorage.setItem('RES.lastAnnouncementID', thisID);
			}
		});
	};
});
