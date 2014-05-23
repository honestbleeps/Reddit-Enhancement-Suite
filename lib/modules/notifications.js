addModule('notifications', function(module, moduleID) {
	$.extend(module, {
		moduleName: 'RES Notifications',
		category: 'About RES',
		description: 'Manage pop-up notifications for RES functions',
		include: [
			/.*/i
		]
	});
	module.options = {
		closeDelay: {
			type: 'text',
			value: 3000,
			description: 'Delay, in milliseconds, before notification fades away'
		},
		sticky: {
			description: 'Allow notifications to be "sticky" and stay visible until you manually close them',
			type: 'enum',
			value: 'notificationType',
			values: [{
				name: 'notificationType',
				value: 'notificationType'
			}, {
				name: 'all',
				value: 'all'
			}, {
				name: 'none',
				value: 'none'
			}]
		},
		notificationTypes: {
			description: 'Manage different types of notifications',
			type: 'table',
			addRowText: 'manually register notification type',
			fields: [
				{ 
					name: 'moduleID',
					type: 'text'
				},
				{
					name: 'notificationID',
					type: 'text'
				},
				{
					name: 'enabled',
					type: 'boolean',
					value: true
				},
				{
					name: 'sticky',
					type: 'boolean',
					value: false
				},
				{
					name: 'cooldown',
					type: 'text',
					value: 0
				}
			],
			value: []
		}
	};

	module.saveOptions =function() {
		RESStorage.setItem('RESoptions.notifications', JSON.stringify(modules['notifications'].options));
	};
	
	function getOrAddNotificationType (notification) {
		var valueIdentifier = {
			moduleID: RESUtils.firstValid(notification.moduleID, '--'),
			notificationID: RESUtils.firstValid(notification.notificationID, notification.optionKey, notification.header, RESUtils.hashCode(notification.message || '')),
		};
		
		var value = RESUtils.options.table.getMatchingValueOrAdd(moduleID, 'notificationTypes', valueIdentifier, hydrateValue);
		function hydrateValue() {
			return $.extend({}, notification, valueIdentifier);
		}

		if (typeof value[4] != "number") {
			value[4] = parseInt(value[4], 10) || 0;
		}
		var notificationType = RESUtils.options.table.mapValueToObject(moduleID, 'notificationTypes', value);
		return notificationType;
	};
	module.enableNotificationType = function(notificationType, enabled) {
		var value = RESUtils.options.table.getMatchingValueOrAdd(moduleID, 'notificationTypes', notificationType);
		value[2] = !!enabled;
		modules['notifications'].saveOptions();
	};

	module.showNotification = function(contentObj, delay) {
		if (!module.isEnabled()) return;
		if (typeof contentObj.message === 'undefined') {
			if (typeof contentObj === 'string') {
				contentObj = { message: contentObj };
			} else {
				return false;
			}
		}

		var notificationType = getOrAddNotificationType(contentObj);
		 if (!notificationType.enabled) return;
		 if (!hasNotificationCooledDown(notificationType)) return;
		 logNotification(notificationType);

		contentObj.renderedHeader = renderHeaderHtml(contentObj, notificationType);

		setupNotificationsContainer();

		var thisNotification = createNotificationElement(contentObj, notificationType);
		
		thisNotification.querySelector('.RESNotificationToggle input').addEventListener('change', function(e) {
			modules['notifications'].enableNotificationType(notificationType, e.target.checked);
		});
		var thisNotificationCloseButton = thisNotification.querySelector('.RESNotificationClose');
		thisNotificationCloseButton.addEventListener('click', function(e) {
			var thisNotification = e.target.parentNode.parentNode;
			modules['notifications'].closeNotification(thisNotification);
		}, false);

		var isSticky = modules['notifications'].options.sticky.value == 'all'
			|| (modules['notifications'].options.sticky.value == 'notificationType' && notificationType.sticky);
		if (!isSticky) {
			module.setCloseNotificationTimer(thisNotification, delay);
		} 
		module.RESNotifications.style.display = 'block';
		module.RESNotifications.appendChild(thisNotification);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'notification');
		RESUtils.fadeElementIn(thisNotification, 0.2, 1);
		module.notificationCount++;

		return {
			element: thisNotification,
			close: function() { module.closeNotification(thisNotification); }
		}
	};

	function renderHeaderHtml(contentObj, notificationType) {
		var header;
		if (contentObj.header) {
			header = contentObj.header;
		} else {
			header = [];

			if (contentObj.moduleID && modules[contentObj.moduleID]) {
				header.push(modules[contentObj.moduleID].moduleName);
			}

			if (contentObj.type === 'error') {
				header.push('Error');
			} else {
				header.push('Notification');
			}


			header = header.join(' ');
		}

		if (contentObj.moduleID && modules[contentObj.moduleID]) {
			header += modules['settingsNavigation'].makeUrlHashLink(contentObj.moduleID, contentObj.optionKey, ' ', 'gearIcon');
		}

		return header;
	}

	function setupNotificationsContainer() {
		if (typeof module.notificationCount === 'undefined') {
			module.adFrame = document.body.querySelector('#ad-frame');
			if (module.adFrame) {
				module.adFrame.style.display = 'none';
			}
			module.notificationCount = 0;
			module.notificationTimers = [];
			module.RESNotifications = RESUtils.createElementWithID('div', 'RESNotifications');
			document.body.appendChild(module.RESNotifications);
		}
	}

	function createNotificationElement(contentObj, notificationType) {
		var thisNotification = document.createElement('div');
		thisNotification.classList.add('RESNotification');
		thisNotification.setAttribute('id', 'RESNotification-' + module.notificationCount);
		$(thisNotification).html('<div class="RESNotificationHeader"><h3>' + contentObj.renderedHeader + '</h3><div class="RESNotificationClose RESCloseButton">&times;</div></div><div class="RESNotificationContent">' + contentObj.message + '</div><div class="RESNotificationFooter"><label class="RESNotificationToggle"><input type="checkbox" checked> Always show this type of notification</label></div>');
		thisNotification.querySelector('.RESNotificationToggle').setAttribute('title', 'Show notifications from ' + notificationType.moduleID + ' - ' + notificationType.notificationID);
		return thisNotification;
	}

	module.setCloseNotificationTimer = function(e, delay) {
		delay = RESUtils.firstValid(delay, parseInt(modules['notifications'].options['closeDelay'].value, 10), modules['notifications'].options['closeDelay'].default);
		var thisNotification = (typeof e.currentTarget !== 'undefined') ? e.currentTarget : e;
		var thisNotificationID = thisNotification.getAttribute('id').split('-')[1];
		thisNotification.classList.add('timerOn');
		clearTimeout(modules['notifications'].notificationTimers[thisNotificationID]);
		var thisTimer = setTimeout(function() {
			modules['notifications'].closeNotification(thisNotification);
		}, delay);
		modules['notifications'].notificationTimers[thisNotificationID] = thisTimer;
		thisNotification.addEventListener('mouseover', modules['notifications'].cancelCloseNotificationTimer, false);
		thisNotification.removeEventListener('mouseout', modules['notifications'].setCloseNotification, false);
	};
	module.cancelCloseNotificationTimer = function(e) {
		var thisNotificationID = e.currentTarget.getAttribute('id').split('-')[1];
		e.currentTarget.classList.remove('timerOn');
		clearTimeout(modules['notifications'].notificationTimers[thisNotificationID]);
		e.target.removeEventListener('mouseover', modules['notifications'].cancelCloseNotification, false);
		e.currentTarget.addEventListener('mouseout', modules['notifications'].setCloseNotificationTimer, false);
	};
	module.closeNotification = function(ele) {
		RESUtils.fadeElementOut(ele, 0.1, modules['notifications'].notificationClosed);
	};
	module.notificationClosed = function(ele) {
		var notifications = modules['notifications'].RESNotifications.querySelectorAll('.RESNotification'),
			destroyed = 0;
		for (var i = 0, len = notifications.length; i < len; i++) {
			if (notifications[i].style.opacity === '0') {
				notifications[i].parentNode.removeChild(notifications[i]);
				destroyed++;
			}
		}
		if (destroyed == notifications.length) {
			modules['notifications'].RESNotifications.style.display = 'none';
			if (RESUtils.adFrame) RESUtils.adFrame.style.display = 'block';
		}

		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'notification');
	};

	function hasNotificationCooledDown(notificationType) {
		var latestNotificationOfSameType;
		var recentNotifications = getRecentNotifications();

		for (var i = 0; i < recentNotifications.length; i++) {
			var current = recentNotifications[i];
			if (current.moduleID == notificationType.moduleID &&
				current.notificationID == notificationType.notificationID) {
				latestNotificationOfSameType = current;
				break;
			}
		}

		if (!latestNotificationOfSameType || !latestNotificationOfSameType.timestamp) {
			return true;
		}

		if ((latestNotificationOfSameType.timestamp + notificationType.cooldown) <= Date.now()) {
			return true;
		}

		return false;
	}

	function getRecentNotifications() {
		var storage = RESStorage.getItem('RESmodules.notifications.recent');
		if (storage) {
			var recents = JSON.parse(storage);
			return recents;
		} else {
			return [];
		}
	}

	function logNotification(notificationType) {
		var collection = getRecentNotifications();
		var newItem = {
			moduleID: notificationType.moduleID,
			notificationID: notificationType.notificationID,
			timestamp: Date.now()
		};

		collection.unshift(newItem);
		var pruned = pruneLog(collection);
		RESStorage.setItem('RESmodules.notifications.recent', JSON.stringify(pruned));
	}

	var maxItemsPerNotificationType = 1;
	function pruneLog(collection) {
		var pruned = [];
		var index = {};
		for (var i = 0, length = collection.length; i < length; i++) {
			var item = collection[i];
			index[item.moduleID] = index[item.moduleID] || {};
			index[item.moduleID][item.notificationID] = 1 + (index[item.moduleID][item.notificationID] || 0)

			if (index[item.moduleID][item.notificationID] == maxItemsPerNotificationType) {
				pruned.push(item);
			}
		}

		return pruned;
	}
});
