addModule('notifications', function(module, moduleID) {
	module.moduleName = 'RES Notifications';
	module.category = 'Core';
	module.description = 'Manage pop-up notifications for RES functions';
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
				function(command, val) {
					// test notification
					module.showNotification(val, 4000);
				}
			);
		}
	};

	var notificationCount, notificationTimers, RESNotifications;

	function saveOptions() {
		RESUtils.options.saveModuleOptions(moduleID);
	}

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

	function enableNotificationType(notificationType, enabled) {
		var value = RESUtils.options.table.getMatchingValueOrAdd(moduleID, 'notificationTypes', notificationType);
		value[2] = !!enabled;
		saveOptions();
	}

	module.showNotification = async function(contentObj, delay) {
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
		if (!(await hasNotificationCooledDown(notificationType))) return notificationError('cooldown');
		logNotification(notificationType);

		contentObj.renderedHeader = renderHeaderHtml(contentObj, notificationType);

		var thisNotification = createNotificationElement(contentObj, notificationType);
		if (contentObj.closeDelay !== undefined) {
			delay = contentObj.closeDelay;
		}

		if (contentObj.noDisable) {
			thisNotification.querySelector('.RESNotificationFooter').style.display = 'none';
		} else {
			thisNotification.querySelector('.RESNotificationToggle input').addEventListener('change', function(e) {
				enableNotificationType(notificationType, e.target.checked);
			});
		}
		var thisNotificationCloseButton = thisNotification.querySelector('.RESNotificationClose');
		thisNotificationCloseButton.addEventListener('click', function(e) {
			var thisNotification = e.target.parentNode.parentNode;
			closeNotification(thisNotification);
		}, false);

		var isSticky = module.options.sticky.value === 'all' ||
			(module.options.sticky.value === 'notificationType' &&
			notificationType.sticky);


		var notificationOpened = false;
		var notificationClosed = false;

		RESUtils.init.await.bodyReady.then(() => {
			if (notificationClosed) return;
			notificationOpened = true;

			setupNotificationsContainer();

			if (!isSticky) {
				setCloseNotificationTimer(thisNotification, delay);
			}

			RESNotifications.style.display = 'block';
			RESNotifications.appendChild(thisNotification);
			modules['styleTweaks'].setSRStyleToggleVisibility(false);
			RESUtils.fadeElementIn(thisNotification, 0.2);
			notificationCount++;
			// Not sure why this won't work without fadeElementIn() above.
			$(thisNotification).addClass('transition');
		});

		return {
			element: thisNotification,
			close: function() {
				if (notificationClosed) return;
				notificationClosed = true;
				if (notificationOpened) {
					closeNotification(thisNotification);
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

	function renderHeaderHtml(contentObj) {
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

		if (contentObj.moduleID && modules[contentObj.moduleID]) {
			header += modules['settingsNavigation'].makeUrlHashLink(contentObj.moduleID, contentObj.optionKey, ' ', 'gearIcon');
		}

		return header;
	}

	function setupNotificationsContainer() {
		if (typeof notificationCount === 'undefined') {
			var adFrame = document.body.querySelector('#ad-frame');
			if (adFrame) {
				adFrame.style.display = 'none';
			}
			var userBar = document.querySelector('#header-bottom-right');
			notificationCount = 0;
			notificationTimers = [];
			RESNotifications = RESUtils.createElement('div', 'RESNotifications');
			RESNotifications.style.top = userBar.offsetTop + userBar.offsetHeight + 'px';
			document.body.appendChild(RESNotifications);
		}
	}

	function createNotificationElement(contentObj, notificationType) {
		var thisNotification = RESUtils.createElement('div', 'RESNotification-' + (notificationCount || 0), 'RESNotification');
		// all content in contentObj is written by our own code to fire notifications and is therefore safe.
		// TODO: Let's clean this up anyhow in the near future.
		$(thisNotification).html('<div class="RESNotificationHeader"><h3>' + contentObj.renderedHeader + '</h3><div class="RESNotificationClose RESCloseButton">&times;</div></div><div class="RESNotificationContent">' + contentObj.message + '</div><div class="RESNotificationFooter"><label class="RESNotificationToggle"><input type="checkbox" checked> Always show this type of notification</label></div>');
		thisNotification.querySelector('.RESNotificationToggle').setAttribute('title', 'Show notifications from ' + notificationType.moduleID + ' - ' + notificationType.notificationID);
		return thisNotification;
	}

	function setCloseNotificationTimer(e, delay, duration) {
		delay = RESUtils.firstValid(delay, parseInt(module.options['closeDelay'].value, 10), module.options['closeDelay'].default);
		duration = RESUtils.firstValid(duration, parseInt(module.options['fadeOutLength'].value, 10), module.options['fadeOutLength'].default);
		var thisNotification = (typeof e.currentTarget !== 'undefined') ? e.currentTarget : e;
		var thisNotificationID = thisNotification.getAttribute('id').split('-')[1];
		thisNotification.classList.add('timerOn');
		// Note: setAttribute() may or may not remove other styles. Make sure there is some redundancy in place.
		thisNotification.setAttribute('style', '-webkit-animation-delay: ' + delay / 1000 + 's; -webkit-animation-duration: ' + duration / 1000 + 's; animation-delay: ' + delay / 1000 + 's; animation-duration: ' + duration / 1000 + 's');
		// Total delay including fade out duration.
		delay += duration;
		clearTimeout(notificationTimers[thisNotificationID]);
		var thisTimer = setTimeout(function() {
			closeNotification(thisNotification);
		}, delay);
		notificationTimers[thisNotificationID] = thisTimer;
		thisNotification.addEventListener('mouseenter', cancelCloseNotificationTimer, false);
		thisNotification.removeEventListener('mouseleave', setCloseNotificationTimer, false);
	}

	function cancelCloseNotificationTimer(e) {
		var thisNotificationID = e.currentTarget.getAttribute('id').split('-')[1];
		e.currentTarget.classList.remove('timerOn');
		e.currentTarget.removeAttribute('style');
		clearTimeout(notificationTimers[thisNotificationID]);
		e.target.removeEventListener('mouseenter', cancelCloseNotificationTimer, false);
		e.currentTarget.addEventListener('mouseleave', setCloseNotificationTimer, false);
	}

	function closeNotification(ele) {
		// When closing with timerOn, don't hesitate at end of animation. Otherwise do a quick fade.
		var fadeLength = ele.classList.contains('timerOn') ? 0 : 0.2;
		RESUtils.fadeElementOut(ele, fadeLength, notificationClosed);
	}

	function notificationClosed() {
		var notifications = RESNotifications.querySelectorAll('.RESNotification'),
			destroyed = 0;
		for (var i = 0, len = notifications.length; i < len; i++) {
			if (notifications[i].style.opacity === '0') {
				notifications[i].parentNode.removeChild(notifications[i]);
				destroyed++;
			}
		}
		if (destroyed == notifications.length) {
			RESNotifications.style.display = 'none';
		}
		// Check that all notifications are removed before resetting styleToggleVisibility.
		if (!RESNotifications.hasChildNodes()) {
			modules['styleTweaks'].setSRStyleToggleVisibility(true);
		}
	}

	async function hasNotificationCooledDown(notificationType) {
		const recentNotifications = await getRecentNotifications();

		const latestNotificationOfSameType = recentNotifications.find(({ moduleID, notificationID }) =>
			moduleID === notificationType.moduleID && notificationID === notificationType.notificationID
		);

		if (!latestNotificationOfSameType || !latestNotificationOfSameType.timestamp) {
			return true;
		}

		if ((latestNotificationOfSameType.timestamp + notificationType.cooldown) <= Date.now()) {
			return true;
		}

		return false;
	}

	async function getRecentNotifications() {
		return await RESEnvironment.storage.get('RESmodules.notifications.recent') || [];
	}

	async function logNotification(notificationType) {
		const collection = await getRecentNotifications();
		var newItem = {
			moduleID: notificationType.moduleID,
			notificationID: notificationType.notificationID,
			timestamp: Date.now()
		};

		collection.unshift(newItem);
		var pruned = pruneLog(collection);
		RESEnvironment.storage.set('RESmodules.notifications.recent', pruned);
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
