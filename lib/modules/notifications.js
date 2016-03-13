addModule('notifications', function(module, moduleID) {
	$.extend(module, {
		moduleName: 'RES Notifications',
		category: 'Core',
		description: 'Manage pop-up notifications for RES functions',
		include: [
			/.*/i
		]
	});
	module.options = {
		sticky: {
			description: 'Sticky notifications remain visible until you click the close button.',
			type: 'enum',
			value: 'notificationType',
			values: [{
				name: 'per notification type',
				value: 'notificationType'
			}, {
				name: 'always sticky',
				value: 'all'
			}, {
				name: 'never sticky',
				value: 'none'
			}]
		},
		closeDelay: {
			type: 'text',
			value: 3000,
			description: 'In milliseconds, length of time until a notification begins to disappear.'
		},
		fadeOutLength: {
			type: 'text',
			value: 3000,
			description: 'In milliseconds, length of time available to stop a notification from disappearing.',
			advanced: true
		},
		notificationTypes: {
			description: 'Manage different types of notifications',
			type: 'table',
			advanced: true,
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

	module.go = function() {
		if (this.isEnabled() && this.isMatchURL()) {
			modules['commandLine'].registerCommand('notification', false,
				function() { },
				function (command, val, match, e) {
					// test notification
					modules['notifications'].showNotification(val, 4000);
				}
			);
		}
	};
	module.saveOptions = function() {
		RESUtils.options.saveModuleOptions(moduleID);
	};

	function getOrAddNotificationType(notification) {
		var valueIdentifier = {
			moduleID: RESUtils.firstValid(notification.moduleID, '--'),
			notificationID: RESUtils.firstValid(notification.notificationID, notification.optionKey, notification.header, RESUtils.hashCode(notification.message || ''))
		};

		var value = RESUtils.options.table.getMatchingValueOrAdd(moduleID, 'notificationTypes', valueIdentifier, hydrateValue);
		function hydrateValue() {
			return $.extend({}, notification, valueIdentifier);
		}

		if (typeof value[4] !== 'number') {
			value[4] = parseInt(value[4], 10) || 0;
		}
		var notificationType = RESUtils.options.table.mapValueToObject(moduleID, 'notificationTypes', value);
		return notificationType;
	}
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
		if (!notificationType.enabled) return notificationError('enabled');
		if (!hasNotificationCooledDown(notificationType)) return notificationError('cooldown');
		logNotification(notificationType);

		contentObj.renderedHeader = renderHeaderHtml(contentObj, notificationType);

		var thisNotification = createNotificationElement(contentObj, notificationType);
		if (contentObj.closeDelay !== undefined) {
			delay = contentObj.closeDelay;
		}

		if (contentObj.noDisable) {
			thisNotification.find('.RESNotificationFooter').css('display', 'none');
		} else {
			thisNotification.querySelector('.RESNotificationToggle input').addEventListener('change', function(e) {
				modules['notifications'].enableNotificationType(notificationType, e.target.checked);
			});
		}
		var thisNotificationCloseButton = thisNotification.querySelector('.RESNotificationClose');
		thisNotificationCloseButton.addEventListener('click', function(e) {
			var thisNotification = e.target.parentNode.parentNode;
			modules['notifications'].closeNotification(thisNotification);
		}, false);

		var isSticky = modules['notifications'].options.sticky.value === 'all' ||
			(modules['notifications'].options.sticky.value === 'notificationType' &&
			notificationType.sticky);


		var notificationOpened = false;
		var notificationClosed = false;

		var canShow = $.Deferred();
		function checkCanShow() {
			if (document.body) {
				canShow.resolve();
			} else {
				setTimeout(checkCanShow, 500);
			}
		}

		checkCanShow();
		canShow.done(function() {
			if (notificationClosed) return;
			notificationOpened = true;

			setupNotificationsContainer();

			if (!isSticky) {
				module.setCloseNotificationTimer(thisNotification, delay);
			}

			module.RESNotifications.style.display = 'block';
			module.RESNotifications.appendChild(thisNotification);
			RESUtils.fadeElementIn(thisNotification, 0.2);
			module.notificationCount++;
			// Not sure why this won't work without fadeElementIn() above.
			$(thisNotification).addClass('transition');
		});

		return {
			element: thisNotification,
			close: function() {
				if (notificationClosed) return;
				notificationClosed = true;
				if (notificationOpened) {
					module.closeNotification(thisNotification);
				}
			}
		};
	};

	function notificationError(error) {
		// If a notification cannot be shown for some reason (e.g. cooldown or disabled),
		// return a notification-like object to avoid breaking caller

		return {
			element: document.createElement('div'),
			close: function() {},
			error: error
		};
	}

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
			}


			header = header.join(' ');
		}

		if (contentObj.moduleID && modules[contentObj.moduleID] && !modules[contentObj.moduleID].hidden) {
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
			var userBar = document.querySelector('#header-bottom-right');
			module.notificationCount = 0;
			module.notificationTimers = [];
			module.RESNotifications = RESUtils.createElement('div', 'RESNotifications');
			module.RESNotifications.style.top = userBar.offsetTop + userBar.offsetHeight + 'px';
			document.body.appendChild(module.RESNotifications);
		}
	}

	function createNotificationElement(contentObj, notificationType) {
		var $thisNotification = $(RESUtils.createElement('div', 'RESNotification-' + (module.notificationCount || 0), 'RESNotification'));
		// all content in contentObj is written by our own code to fire notifications and is therefore safe.
		// TODO: Let's clean this up anyhow in the near future.
		$thisNotification.html('<div class="RESNotificationHeader"><h3></h3><div class="RESNotificationClose RESCloseButton">&times;</div></div><div class="RESNotificationContent"></div><div class="RESNotificationFooter"><label class="RESNotificationToggle"><input type="checkbox" checked> Always show this type of notification</label></div>');
 		$thisNotification.find('h3').append(contentObj.renderedHeader);
 		$thisNotification.find('.RESNotificationContent').append(contentObj.message);
		$thisNotification.find('.RESNotificationToggle').attr('title', 'Show notifications from ' + notificationType.moduleID + ' - ' + notificationType.notificationID);
		return $thisNotification.get(0);
	}
	module.setCloseNotificationTimer = function(e, delay, duration) {
		delay = RESUtils.firstValid(delay, parseInt(modules['notifications'].options['closeDelay'].value, 10), modules['notifications'].options['closeDelay'].default);
		duration = RESUtils.firstValid(duration, parseInt(modules['notifications'].options['fadeOutLength'].value, 10), modules['notifications'].options['fadeOutLength'].default);
		var thisNotification = (typeof e.currentTarget !== 'undefined') ? e.currentTarget : e;
		var thisNotificationID = thisNotification.getAttribute('id').split('-')[1];
		thisNotification.classList.add('timerOn');
		// Note: setAttribute() may or may not remove other styles. Make sure there is some redundancy in place.
		thisNotification.setAttribute('style', '-webkit-animation-delay: ' + delay / 1000 + 's; -webkit-animation-duration: ' + duration / 1000 + 's; animation-delay: ' + delay / 1000 + 's; animation-duration: ' + duration / 1000 + 's');
		// Total delay including fade out duration.
		delay = delay + duration;
		clearTimeout(modules['notifications'].notificationTimers[thisNotificationID]);
		var thisTimer = setTimeout(function() {
			modules['notifications'].closeNotification(thisNotification);
		}, delay);
		modules['notifications'].notificationTimers[thisNotificationID] = thisTimer;
		thisNotification.addEventListener('mouseenter', modules['notifications'].cancelCloseNotificationTimer, false);
		thisNotification.removeEventListener('mouseleave', modules['notifications'].setCloseNotificationTimer, false);
	};
	module.cancelCloseNotificationTimer = function(e) {
		var thisNotificationID = e.currentTarget.getAttribute('id').split('-')[1];
		e.currentTarget.classList.remove('timerOn');
		e.currentTarget.removeAttribute('style');
		clearTimeout(modules['notifications'].notificationTimers[thisNotificationID]);
		e.target.removeEventListener('mouseenter', modules['notifications'].cancelCloseNotificationTimer, false);
		e.currentTarget.addEventListener('mouseleave', modules['notifications'].setCloseNotificationTimer, false);
	};
	module.closeNotification = function(ele) {
		// When closing with timerOn, don't hesitate at end of animation. Otherwise do a quick fade.
		var fadeLength = ele.classList.contains('timerOn') ? 0 : 0.2;
		RESUtils.fadeElementOut(ele, fadeLength, modules['notifications'].notificationClosed);
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
			index[item.moduleID][item.notificationID] = 1 + (index[item.moduleID][item.notificationID] || 0);

			if (index[item.moduleID][item.notificationID] == maxItemsPerNotificationType) {
				pruned.push(item);
			}
		}

		return pruned;
	}
});
