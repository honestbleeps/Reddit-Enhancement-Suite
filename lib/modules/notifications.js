/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import { Storage, i18n } from '../environment';
import { firstValid, getHeaderOffset, hashCode, mapScalarToObject, string } from '../utils';
import * as CommandLine from './commandLine';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('notifications');

module.moduleName = 'notificationsName';
module.category = 'coreCategory';
module.description = 'notificationsDesc';
module.options = {
	sticky: {
		description: 'notificationStickyDesc',
		title: 'notificationStickyTitle',
		type: 'enum',
		value: 'notificationType',
		values: [{
			name: 'notificationsPerNotificationType',
			value: 'notificationType',
		}, {
			name: 'notificationsAlwaysSticky',
			value: 'all',
		}, {
			name: 'notificationsNeverSticky',
			value: 'none',
		}],
	},
	closeDelay: {
		type: 'text',
		value: '3000',
		description: 'notificationCloseDelayDesc',
		title: 'notificationCloseDelayTitle',
	},
	fadeOutLength: {
		type: 'text',
		value: '3000',
		description: 'notificationFadeOutLengthDesc',
		title: 'notificationFadeOutLengthTitle',
		advanced: true,
	},
	notificationTypes: {
		description: 'notificationNotificationTypesDesc',
		title: 'notificationNotificationTypesTitle',
		type: 'table',
		advanced: true,
		addRowText: 'notificationsAddNotificationType',
		fields: [{
			key: 'moduleID',
			name: 'moduleID',
			type: 'text',
		}, {
			key: 'notificationID',
			name: 'notificationsNotificationID',
			type: 'text',
		}, {
			key: 'enabled',
			name: 'notificationsEnabled',
			type: 'boolean',
			value: true,
		}, {
			key: 'sticky',
			name: 'notificationsSticky',
			type: 'boolean',
			value: false,
		}, {
			key: 'cooldown',
			name: 'notificationsCooldown',
			type: 'text',
			value: '0',
		}],
		value: ([]: Array<[string, string, boolean, boolean, string]>),
	},
};

const recentNotificationStorage = Storage.wrap('RESmodules.notifications.recent', ([]: Array<{|
	moduleID: string,
	notificationID: string,
	timestamp: number,
|}>));

module.beforeLoad = () => {
	CommandLine.registerCommand('notification', false,
		() => {},
		(command, val) => {
			// test notification
			showNotification(val, 4000);
		}
	);
};

module.go = () => {
	setupNotificationContainer();
};

const notificationTimers = [];
let notificationCount = 0;
const notificationsContainer = string.html`<div id="RESNotifications"></div>`;

function getOrAddNotificationType(notification) {
	const valueIdentifier = {
		moduleID: firstValid(notification.moduleID, '--'),
		notificationID: firstValid(notification.notificationID, notification.optionKey, notification.header, hashCode(notification.message instanceof HTMLElement ? notification.message.outerHTML : notification.message)),
	};

	const value = Options.table.getMatchingValueOrAdd(module, 'notificationTypes', valueIdentifier, hydrateValue);
	function hydrateValue() {
		return { ...notification, ...valueIdentifier };
	}

	if (typeof value[4] !== 'number') {
		value[4] = parseInt(value[4], 10) || 0;
	}
	return mapScalarToObject(module.options.notificationTypes, value);
}

function enableNotificationType(notificationType, enabled) {
	const value = Options.table.getMatchingValueOrAdd(module, 'notificationTypes', notificationType);
	value[2] = !!enabled;
	Options.set(module, 'notificationTypes', module.options.notificationTypes.value);
}

type NotificationOptions = {
	message: string | HTMLElement,
	header?: string,
	closeDelay?: number,
	notificationID?: string,
	moduleID?: string,
	optionKey?: string,
	noDisable?: boolean,
	type?: 'error',
};

export async function showNotification(contentObj: string | NotificationOptions, delay?: number): Promise<{ element: HTMLElement, close(): void }> {
	if (!Modules.isRunning(module)) {
		return {
			element: document.createElement('div'),
			close() {},
		};
	}
	if (typeof contentObj === 'string') {
		contentObj = ({ message: contentObj }: NotificationOptions);
	}

	const notificationType = getOrAddNotificationType(contentObj);
	if (!notificationType.enabled) return notificationError('enabled');
	if (!(await hasNotificationCooledDown(notificationType))) return notificationError('cooldown');
	logNotification(notificationType);

	const thisNotification = createNotificationElement(contentObj, notificationType);
	if (contentObj.closeDelay !== undefined) {
		delay = contentObj.closeDelay;
	}

	if (contentObj.noDisable) {
		thisNotification.querySelector('.RESNotificationFooter').style.display = 'none';
	} else {
		thisNotification.querySelector('.RESNotificationToggle input').addEventListener('change', e => {
			const target: HTMLInputElement = (e.target: any);
			enableNotificationType(notificationType, target.checked);
		});
	}
	const thisNotificationCloseButton = thisNotification.querySelector('.RESNotificationClose');
	thisNotificationCloseButton.addEventListener('click', (e: Event) => {
		const thisNotification: HTMLElement = (e.target: any).parentNode.parentNode;
		closeNotification(thisNotification);
	});

	const isSticky = module.options.sticky.value === 'all' ||
		(module.options.sticky.value === 'notificationType' &&
		notificationType.sticky);

	if (!isSticky && delay !== Infinity) {
		setCloseNotificationTimer({ currentTarget: thisNotification }, delay);
	}

	notificationsContainer.appendChild(thisNotification);

	notificationCount++;

	$(thisNotification)
		.fadeIn(200)
		.addClass('transition');

	return {
		element: thisNotification,
		close: _.once(() => closeNotification(thisNotification)),
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

	const mod = contentObj.moduleID && Modules.getUnchecked(contentObj.moduleID);

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

function setupNotificationContainer() {
	notificationsContainer.style.top = `${getHeaderOffset(true)}px`;
	document.body.append(notificationsContainer);
}

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
	$thisNotification.find('h3').append(renderHeaderHtml(contentObj));
	$thisNotification.find('.RESNotificationContent').append(contentObj.message);
	$thisNotification.find('.RESNotificationToggle').attr('title', `Show notifications from ${notificationType.moduleID} - ${notificationType.notificationID}`);
	return $thisNotification.get(0);
}

function setCloseNotificationTimer({ currentTarget: thisNotification }: Event | { currentTarget: HTMLElement }, delay, duration) {
	delay = +firstValid(delay, parseInt(module.options.closeDelay.value, 10), (module.options.closeDelay: any).default);
	duration = +firstValid(duration, parseInt(module.options.fadeOutLength.value, 10), (module.options.fadeOutLength: any).default);
	const thisNotificationID = +thisNotification.getAttribute('id').split('-')[1];
	thisNotification.classList.add('timerOn');
	// Note: setAttribute() may or may not remove other styles. Make sure there is some redundancy in place.
	thisNotification.setAttribute('style', `-webkit-animation-delay: ${delay / 1000}s; -webkit-animation-duration: ${duration / 1000}s; animation-delay: ${delay / 1000}s; animation-duration: ${duration / 1000}s`);
	// Total delay including fade out duration.
	delay += duration;
	clearAsyncTasks(thisNotification);
	const thisTimer = setTimeout(() => closeNotification(thisNotification), delay);
	notificationTimers[thisNotificationID] = thisTimer;
	thisNotification.addEventListener('mouseenter', cancelCloseNotificationTimer);
}

function cancelCloseNotificationTimer({ currentTarget: thisNotification }: Event) {
	thisNotification.classList.remove('timerOn');
	thisNotification.removeAttribute('style');
	clearAsyncTasks(thisNotification);
	thisNotification.addEventListener('mouseleave', setCloseNotificationTimer);
}

function clearAsyncTasks(thisNotification) {
	thisNotification.removeEventListener('mouseleave', setCloseNotificationTimer);
	thisNotification.removeEventListener('mouseenter', cancelCloseNotificationTimer);
	const thisNotificationID = +thisNotification.getAttribute('id').split('-')[1];
	clearTimeout(notificationTimers[thisNotificationID]);
}

function closeNotification(thisNotification) {
	clearAsyncTasks(thisNotification);

	// When closing with timerOn, don't hesitate at end of animation. Otherwise do a quick fade.
	$(thisNotification)
		.fadeOut(thisNotification.classList.contains('timerOn') ? 0 : 200)
		.promise().then(notificationClosed);
}

function notificationClosed() {
	for (const notification of notificationsContainer.querySelectorAll('.RESNotification')) {
		if (!notification.offsetParent) {
			notification.remove();
		}
	}
}

async function hasNotificationCooledDown(notificationType) {
	const recentNotifications = await recentNotificationStorage.get();

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

async function logNotification(notificationType) {
	const collection = await recentNotificationStorage.get();
	const newItem = {
		moduleID: notificationType.moduleID,
		notificationID: notificationType.notificationID,
		timestamp: Date.now(),
	};

	collection.unshift(newItem);
	const pruned = pruneLog(collection);
	recentNotificationStorage.set(pruned);
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
