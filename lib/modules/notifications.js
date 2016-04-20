import { $ } from '../vendor';
import { fadeElementIn, fadeElementOut, firstValid, hashCode } from '../utils';
import { init, setOption, tableOption } from '../core';
import { storage } from 'environment';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'notifications';
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
		modules['commandLine'].registerCommand('notification', false,
			() => {},
			(command, val) => {
				// test notification
				module.showNotification(val, 4000);
			}
		);
	};

	let notificationCount, notificationTimers, $RESNotifications;

	function getOrAddNotificationType(notification) {
		const valueIdentifier = {
			moduleID: firstValid(notification.moduleID, '--'),
			notificationID: firstValid(notification.notificationID, notification.optionKey, notification.header, hashCode(notification.message || ''))
		};

		const value = tableOption.getMatchingValueOrAdd(module.moduleID, 'notificationTypes', valueIdentifier, hydrateValue);
		function hydrateValue() {
			return { ...notification, ...valueIdentifier };
		}

		if (typeof value[4] !== 'number') {
			value[4] = parseInt(value[4], 10) || 0;
		}
		return tableOption.mapValueToObject(module.options.notificationTypes, value);
	}

	function enableNotificationType(notificationType, enabled) {
		const value = tableOption.getMatchingValueOrAdd(module.moduleID, 'notificationTypes', notificationType);
		value[2] = !!enabled;
		setOption(module.moduleID, 'notificationTypes', module.options.notificationTypes.value);
	}

	module.showNotification = async function(contentObj, delay) {
		if (!module.isEnabled()) return false;
		if (typeof contentObj.message === 'undefined') {
			if (typeof contentObj === 'string') {
				contentObj = { message: contentObj };
			} else {
				return false;
			}
		}

		const notificationType = getOrAddNotificationType(contentObj);
		if (!notificationType.enabled) return notificationError('enabled');
		if (!(await hasNotificationCooledDown(notificationType))) return notificationError('cooldown');
		logNotification(notificationType);

		contentObj.renderedHeader = renderHeaderHtml(contentObj, notificationType);

		const thisNotification = createNotificationElement(contentObj, notificationType);
		if (contentObj.closeDelay !== undefined) {
			delay = contentObj.closeDelay;
		}

		if (contentObj.noDisable) {
			thisNotification.querySelector('.RESNotificationFooter').style.display = 'none';
		} else {
			thisNotification.querySelector('.RESNotificationToggle input').addEventListener('change', e => {
				enableNotificationType(notificationType, e.target.checked);
			});
		}
		const thisNotificationCloseButton = thisNotification.querySelector('.RESNotificationClose');
		thisNotificationCloseButton.addEventListener('click', e => {
			const thisNotification = e.target.parentNode.parentNode;
			closeNotification(thisNotification);
		}, false);

		const isSticky = module.options.sticky.value === 'all' ||
			(module.options.sticky.value === 'notificationType' &&
			notificationType.sticky);


		let notificationOpened = false;
		let notificationClosed = false;

		init.bodyReady.then(() => {
			if (notificationClosed) return;
			notificationOpened = true;

			setupNotificationsContainer();

			if (!isSticky) {
				setCloseNotificationTimer(thisNotification, delay);
			}

			$RESNotifications
				.show()
				.append(thisNotification);

			fadeElementIn(thisNotification, 0.2);
			notificationCount++;
			// Not sure why this won't work without fadeElementIn() above.
			$(thisNotification).addClass('transition');
		});

		return {
			element: thisNotification,
			close() {
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
			close() {},
			error
		};
	}

	function renderHeaderHtml(contentObj) {
		let header;
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
		if (typeof notificationCount === 'undefined') {
			const adFrame = document.body.querySelector('#ad-frame');
			if (adFrame) {
				adFrame.style.display = 'none';
			}
			const userBar = document.querySelector('#header-bottom-right');
			notificationCount = 0;
			notificationTimers = [];
			$RESNotifications = $('<div>', { id: 'RESNotifications' })
				.css('top', `${userBar.offsetTop + userBar.offsetHeight}px`)
				.appendTo(document.body);
		}
	}

	function createNotificationElement(contentObj, notificationType) {
		const $thisNotification = $('<div>', {
			id: `RESNotification-${notificationCount || 0}`,
			class: 'RESNotification',
			html: `
				<div class="RESNotificationHeader">
					<h3></h3>
					<div class="RESNotificationClose RESCloseButton">&times;</div>
				</div>
				<div class="RESNotificationContent"></div>
				<div class="RESNotificationFooter">
					<label class="RESNotificationToggle">
					<input type="checkbox" checked> Always show this type of notification</label>
				</div>
			`
		});
		$thisNotification.find('h3').append(contentObj.renderedHeader);
		$thisNotification.find('.RESNotificationContent').append(contentObj.message);
		$thisNotification.find('.RESNotificationToggle').attr('title', `Show notifications from ${notificationType.moduleID} - ${notificationType.notificationID}`);
		return $thisNotification.get(0);
	}

	function setCloseNotificationTimer(e, delay, duration) {
		delay = firstValid(delay, parseInt(module.options['closeDelay'].value, 10), module.options['closeDelay'].default);
		duration = firstValid(duration, parseInt(module.options['fadeOutLength'].value, 10), module.options['fadeOutLength'].default);
		const thisNotification = (typeof e.currentTarget !== 'undefined') ? e.currentTarget : e;
		const thisNotificationID = thisNotification.getAttribute('id').split('-')[1];
		thisNotification.classList.add('timerOn');
		// Note: setAttribute() may or may not remove other styles. Make sure there is some redundancy in place.
		thisNotification.setAttribute('style', `-webkit-animation-delay: ${delay / 1000}s; -webkit-animation-duration: ${duration / 1000}s; animation-delay: ${delay / 1000}s; animation-duration: ${duration / 1000}s`);
		// Total delay including fade out duration.
		delay += duration;
		clearTimeout(notificationTimers[thisNotificationID]);
		const thisTimer = setTimeout(() => closeNotification(thisNotification), delay);
		notificationTimers[thisNotificationID] = thisTimer;
		thisNotification.addEventListener('mouseenter', cancelCloseNotificationTimer, false);
		thisNotification.removeEventListener('mouseleave', setCloseNotificationTimer, false);
	}

	function cancelCloseNotificationTimer(e) {
		const thisNotificationID = e.currentTarget.getAttribute('id').split('-')[1];
		e.currentTarget.classList.remove('timerOn');
		e.currentTarget.removeAttribute('style');
		clearTimeout(notificationTimers[thisNotificationID]);
		e.target.removeEventListener('mouseenter', cancelCloseNotificationTimer, false);
		e.currentTarget.addEventListener('mouseleave', setCloseNotificationTimer, false);
	}

	function closeNotification(ele) {
		// When closing with timerOn, don't hesitate at end of animation. Otherwise do a quick fade.
		const fadeLength = ele.classList.contains('timerOn') ? 0 : 0.2;
		fadeElementOut(ele, fadeLength).then(notificationClosed);
	}

	function notificationClosed() {
		const notifications = $RESNotifications.find('.RESNotification');
		let destroyed = 0;
		for (const notification of Array.from(notifications)) {
			if (notification.style.opacity === '0') {
				notification.parentNode.removeChild(notification);
				destroyed++;
			}
		}
		if (destroyed === notifications.length) {
			$RESNotifications.hide();
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
		return await storage.get('RESmodules.notifications.recent') || [];
	}

	async function logNotification(notificationType) {
		const collection = await getRecentNotifications();
		const newItem = {
			moduleID: notificationType.moduleID,
			notificationID: notificationType.notificationID,
			timestamp: Date.now()
		};

		collection.unshift(newItem);
		const pruned = pruneLog(collection);
		storage.set('RESmodules.notifications.recent', pruned);
	}

	const maxItemsPerNotificationType = 1;
	function pruneLog(collection) {
		const pruned = [];
		const index = {};
		for (const item of collection) {
			index[item.moduleID] = index[item.moduleID] || {};
			index[item.moduleID][item.notificationID] = 1 + (index[item.moduleID][item.notificationID] || 0);

			if (+index[item.moduleID][item.notificationID] === maxItemsPerNotificationType) {
				pruned.push(item);
			}
		}

		return pruned;
	}
}
