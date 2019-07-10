/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import { Storage, i18n } from '../environment';
import { firstValid, hashCode, string, waitForEvent } from '../utils';
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
			key: 'id',
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
		}],
		value: ([]: Array<[string, boolean, boolean]>),
	},
};

const notificationsContainer = string.html`<div id="RESNotifications"></div>`;
const lastShownStorage = Storage.wrapBlob('notifications.lastShown', (): number => 0);
let lastShown;

module.beforeLoad = async () => {
	lastShown = await lastShownStorage.getAll();
};

module.go = () => {
	document.body.append(notificationsContainer);
};

const activeNotifications = {};

type NotificationOptions = {
	message: string | HTMLElement,
	cooldown?: number,
	header?: string,
	closeDelay?: number,
	notificationID?: string,
	moduleID?: string,
	optionKey?: string,
	noDisable?: boolean,
	type?: 'error',
};

export function showNotification(data: string | NotificationOptions, _delay?: number): { element: HTMLElement, close(): void } {
	if (!Modules.isRunning(module)) return notificationError('Module not running');

	if (typeof data === 'string') {
		data = ({ message: data }: NotificationOptions);
	}

	const id = `${String(firstValid(data.moduleID, '--'))}-${String(firstValid(data.notificationID, data.optionKey, data.header, hashCode(data.message instanceof HTMLElement ? data.message.outerHTML : data.message)))}`;

	const existing = activeNotifications[id];
	if (existing) {
		existing.element.dispatchEvent(new CustomEvent('notification-reset'));
		return existing;
	}

	const storage = Options.table.getMatchingValueOrAdd(module, 'notificationTypes', { id }, data);

	if (!storage.enabled) return notificationError('Notification is disabled');

	if (data.cooldown) {
		const _last = lastShown[id] || 0;
		if (data.cooldown > Date.now() - _last) return notificationError('Notification is cooling down');
		lastShownStorage.set(id, Date.now());
	}

	const element = createNotificationElement(id, data);

	const close = _.once((instant: boolean = true) => {
		delete activeNotifications[id];

		// When closing with timerOn, don't hesitate at end of animation. Otherwise do a quick fade.
		$(element)
			.fadeOut(instant ? 0 : 200)
			.promise().then(() => element.remove());
	});

	const notification = activeNotifications[id] = { element, close };

	if (data.noDisable) {
		element.querySelector('.RESNotificationFooter').remove();
	} else {
		element.querySelector('.RESNotificationToggle input').addEventListener('change', (e: any) => {
			storage.enabled = e.target.checked;
		});
	}

	element.querySelector('.RESNotificationClose').addEventListener('click', () => { notification.close(); });

	const isSticky = module.options.sticky.value === 'all' ||
		(module.options.sticky.value === 'notificationType' && storage.sticky);

	const delay = +firstValid(_delay, data.closeDelay, parseInt(module.options.closeDelay.value, 10), (module.options.closeDelay: any).default);
	const fadeDuration = +firstValid(parseInt(module.options.fadeOutLength.value, 10), (module.options.fadeOutLength: any).default);
	if (!isSticky && delay !== Infinity) {
		(async function resetCloseTimer() {
			await new Promise(requestAnimationFrame); // Only start timer when frame becomes visible
			if (element.matches(':hover')) await waitForEvent(element, 'mouseleave');

			let fadeTimer;
			const hideTimer = setTimeout(() => {
				element.classList.add('transitionToTransparent');
				element.style.transitionDuration = `${fadeDuration / 1000}s`;
				fadeTimer = setTimeout(() => close(true), fadeDuration);
			}, delay);

			await waitForEvent(element, 'mouseenter', 'notification-reset');

			element.classList.remove('transitionToTransparent');

			if (fadeTimer) clearTimeout(fadeTimer);
			if (hideTimer) clearTimeout(hideTimer);

			resetCloseTimer();
		})();
	}

	notificationsContainer.prepend(element);

	requestAnimationFrame(() => {
		requestAnimationFrame(() => { element.style.maxHeight = '100vh'; });
	});

	return notification;
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

function renderHeaderHtml(data) {
	let header;

	const mod = data.moduleID && Modules.getUnchecked(data.moduleID);

	if (data.header) {
		header = data.header;
	} else {
		header = [];

		if (mod) {
			header.push(i18n(mod.moduleName));
		}

		if (data.type === 'error') {
			header.push('Error');
		}

		header = header.join(' ');
	}

	if (mod && !mod.hidden) {
		header += SettingsNavigation.makeUrlHashLink(mod.moduleID, data.optionKey, ' ', 'gearIcon');
	}

	return header;
}

function createNotificationElement(id, data) {
	const $element = $('<div>', {
		id,
		class: ['RESNotification', id].join(' '),
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
	$element.find('h3').append(renderHeaderHtml(data));
	$element.find('.RESNotificationContent').append(data.message);
	const { moduleID, notificationID } = data;
	if (moduleID && notificationID) $element.find('.RESNotificationToggle').attr('title', `Show notifications from ${moduleID} - ${notificationID}`);
	return $element.get(0);
}
