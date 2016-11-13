import _ from 'lodash';
import { $ } from '../vendor';
import * as Init from '../core/init';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import { Storage, i18n } from '../environment';
import { firstValid, hashCode } from '../utils';
import * as CommandLine from './commandLine';
import * as SettingsNavigation from './settingsNavigation';

export const module = {};

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
			value: 'notificationType',
		}, {
			name: 'always sticky',
			value: 'all',
		}, {
			name: 'never sticky',
			value: 'none',
		}],
	},
	closeDelay: {
		type: 'text',
		value: 3000,
		description: 'In milliseconds, length of time until a notification begins to disappear.',
	},
	fadeOutLength: {
		type: 'text',
		value: 3000,
		description: 'In milliseconds, length of time available to stop a notification from disappearing.',
		advanced: true,
	},
	notificationTypes: {
		description: 'Manage different types of notifications',
		type: 'table',
		advanced: true,
		addRowText: 'manually register notification type',
		fields: [
			{
				name: 'moduleID',
				type: 'text',
			},
			{
				name: 'notificationID',
				type: 'text',
			},
			{
				name: 'enabled',
				type: 'boolean',
				value: true,
			},
			{
				name: 'sticky',
				type: 'boolean',
				value: false,
			},
			{
				name: 'cooldown',
				type: 'text',
				value: 0,
			},
		],
		value: [],
	},
};

module.beforeLoad = () => {
	CommandLine.registerCommand('notification', false,
		() => {},
		(command, val) => {
			// test notification
			showNotification(val, 4000);
		}
	);
};

const notificationTimers = [];
let notificationCount = 0;
let $RESNotifications;

function getOrAddNotificationType(notification) {
	const valueIdentifier = {
		moduleID: firstValid(notification.moduleID, '--'),
		notificationID: firstValid(notification.notificationID, notification.optionKey, notification.header, hashCode(notification.message || '')),
	};

	const value = Options.table.getMatchingValueOrAdd(module, 'notificationTypes', valueIdentifier, hydrateValue);
	function hydrateValue() {
		return { ...notification, ...valueIdentifier };
	}

	if (typeof value[4] !== 'number') {
		value[4] = parseInt(value[4], 10) || 0;
	}
	return Options.table.mapValueToObject(module.options.notificationTypes, value);
}

function enableNotificationType(notificationType, enabled) {
	const value = Options.table.getMatchingValueOrAdd(module, 'notificationTypes', notificationType);
	value[2] = !!enabled;
	Options.set(module, 'notificationTypes', module.options.notificationTypes.value);
}

export async function showNotification(contentObj, delay) {
	if (!Modules.isRunning(module)) return false;
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
	});

	const isSticky = module.options.sticky.value === 'all' ||
		(module.options.sticky.value === 'notificationType' &&
		notificationType.sticky);


	let notificationOpened = false;
	let notificationClosed = false;

	Init.bodyReady.then(() => {
		if (notificationClosed) return;
		notificationOpened = true;

		setupNotificationsContainer();

		if (!isSticky) {
			setCloseNotificationTimer(thisNotification, delay);
		}

		$RESNotifications
			.show()
			.append(thisNotification);

		notificationCount++;

		$(thisNotification)
			.fadeIn(200)
			.addClass('transition');
	});

	return {
		element: thisNotification,
		close() {
			if (notificationClosed) return;
			notificationClosed = true;
			if (notificationOpened) {
				closeNotification(thisNotification);
			}
		},
	};
}

function notificationError(error) {
	// If a notification cannot be shown for some reason (e.g. cooldown or disabled),
	// return a notification-like object to avoid breaking caller

	return {
		element: document.createElement('div'),
		close() {},
		error,
	};
}

function renderHeaderHtml(contentObj) {
	let header;

	const mod = Modules.getUnchecked(contentObj.moduleID);

	if (contentObj.header) {
		header = contentObj.header;
	} else {
		header = [];

		if (mod) {
			header.push(i18n(mod.moduleName));
		}

		if (contentObj.type === 'error') {
			header.push('Error');
		}

		header = header.join(' ');
	}

	if (mod && !mod.hidden) {
		header += SettingsNavigation.makeUrlHashLink(mod.moduleID, contentObj.optionKey, ' ', 'gearIcon');
	}

	return header;
}

const setupNotificationsContainer = _.once(() => {
	const adFrame = document.body.querySelector('#ad-frame');
	if (adFrame) {
		adFrame.style.display = 'none';
	}

	const userBar = document.querySelector('#header-bottom-right');
	$RESNotifications = $('<div>', { id: 'RESNotifications' })
		.css('top', `${userBar.offsetTop + userBar.offsetHeight}px`)
		.appendTo(document.body);
});

function createNotificationElement(contentObj, notificationType) {
	const $thisNotification = $('<div>', {
		id: `RESNotification-${notificationCount || 0}`,
		class: ['RESNotification', `${notificationType.moduleID}-${notificationType.notificationID}`].join(' '),
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
		`,
	});
	$thisNotification.find('h3').append(contentObj.renderedHeader);
	$thisNotification.find('.RESNotificationContent').append(contentObj.message);
	$thisNotification.find('.RESNotificationToggle').attr('title', `Show notifications from ${notificationType.moduleID} - ${notificationType.notificationID}`);
	return $thisNotification.get(0);
}

function setCloseNotificationTimer(e, delay, duration) {
	delay = firstValid(delay, parseInt(module.options.closeDelay.value, 10), module.options.closeDelay.default);
	duration = firstValid(duration, parseInt(module.options.fadeOutLength.value, 10), module.options.fadeOutLength.default);
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
	thisNotification.addEventListener('mouseenter', cancelCloseNotificationTimer);
	thisNotification.removeEventListener('mouseleave', setCloseNotificationTimer);
}

function cancelCloseNotificationTimer(e) {
	const thisNotificationID = e.currentTarget.getAttribute('id').split('-')[1];
	e.currentTarget.classList.remove('timerOn');
	e.currentTarget.removeAttribute('style');
	clearTimeout(notificationTimers[thisNotificationID]);
	e.target.removeEventListener('mouseenter', cancelCloseNotificationTimer);
	e.currentTarget.addEventListener('mouseleave', setCloseNotificationTimer);
}

function closeNotification(ele) {
	// When closing with timerOn, don't hesitate at end of animation. Otherwise do a quick fade.
	$(ele)
		.fadeOut(ele.classList.contains('timerOn') ? 0 : 200)
		.promise().then(notificationClosed);
}

function notificationClosed() {
	const notifications = $RESNotifications.find('.RESNotification');
	let destroyed = 0;
	for (const notification of notifications) {
		if (!notification.offsetParent) {
			notification.remove();
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
	return await Storage.get('RESmodules.notifications.recent') || [];
}

async function logNotification(notificationType) {
	const collection = await getRecentNotifications();
	const newItem = {
		moduleID: notificationType.moduleID,
		notificationID: notificationType.notificationID,
		timestamp: Date.now(),
	};

	collection.unshift(newItem);
	const pruned = pruneLog(collection);
	Storage.set('RESmodules.notifications.recent', pruned);
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
