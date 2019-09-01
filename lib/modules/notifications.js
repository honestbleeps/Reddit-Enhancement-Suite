/* @flow */

import $ from 'jquery';
import _ from 'lodash';
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

module.go = () => {
	document.body.append(notificationsContainer);
};

const activeNotifications = new Set();

type NotificationOptions = {|
	message: string | HTMLElement,
	cooldown?: number,
	header?: string,
	closeDelay?: number,
	notificationID?: string,
	moduleID?: string,
	optionKey?: string,
	noDisable?: boolean,
|};

export function showNotification(opts: string | NotificationOptions, _delay?: number): { element: HTMLElement, close(): void } {
	const data: NotificationOptions = typeof opts === 'string' ? { message: opts } : opts;
	const id = `${String(firstValid(data.moduleID, '--'))}-${String(firstValid(data.notificationID, data.optionKey, data.header, hashCode(data.message instanceof HTMLElement ? data.message.outerHTML : data.message)))}`;
	const mod = data.moduleID && Modules.getUnchecked(data.moduleID);

	const element = string.html`
		<div class="RESNotification" data-id="${id}">
			<div class="RESNotificationHeader">
				<h3>${data.header || (mod ? i18n(mod.moduleName) : '') || ''}</h3>
				${mod && !mod.hidden ?	string.safe(SettingsNavigation.makeUrlHashLink(mod.moduleID, data.optionKey, ' ', 'gearIcon')) : ''}
				<div class="RESCloseButton"></div>
			</div>
			<div class="RESNotificationContent"></div>
			<div class="RESNotificationFooter" ${data.noDisable ? 'hidden' : ''}>
				<label class="RESNotificationToggle" title="Show notifications from ${id}">
					<input type="checkbox" checked> Always show this type of notification
				</label>
			</div>
		</div>
	`;

	$(element.querySelector('.RESNotificationContent')).append(data.message);

	const inner = element.innerHTML;
	const existing = [...activeNotifications.values()].find(({ element }) => element.innerHTML === inner);
	if (existing) {
		existing.element.dispatchEvent(new CustomEvent('notification-reset'));
		return existing;
	}

	const close = _.once(() => {
		activeNotifications.delete(notification);
		element.remove();
	});

	const notification = { element, close };
	activeNotifications.add(notification);

	const storage = Options.table.getMatchingValueOrAdd(module, 'notificationTypes', { id }, data);

	element.querySelector('.RESNotificationToggle input').addEventListener('change', (e: any) => {
		storage.enabled = e.target.checked;
	});

	element.querySelector('.RESCloseButton').addEventListener('click', () => { close(); });

	const isSticky = module.options.sticky.value === 'all' ||
		(module.options.sticky.value === 'notificationType' && storage.sticky);
	const delay = +firstValid(_delay, data.closeDelay, parseInt(module.options.closeDelay.value, 10), (module.options.closeDelay: any).default);
	const fadeDuration = +firstValid(parseInt(module.options.fadeOutLength.value, 10), (module.options.fadeOutLength: any).default);

	async function resetCloseTimer() {
		await new Promise(requestAnimationFrame); // Only start timer when frame becomes visible
		if (element.matches(':hover')) await waitForEvent(element, 'mouseleave');

		let fadeTimer;
		const hideTimer = setTimeout(() => {
			element.classList.add('transitionToTransparent');
			element.style.transitionDuration = `${fadeDuration / 1000}s`;
			fadeTimer = setTimeout(() => close(), fadeDuration);
		}, delay);

		await waitForEvent(element, 'mouseenter', 'notification-reset');

		element.classList.remove('transitionToTransparent');

		if (fadeTimer) clearTimeout(fadeTimer);
		if (hideTimer) clearTimeout(hideTimer);

		resetCloseTimer();
	}

	(async () => {
		if (!storage.enabled || !Modules.isRunning(module)) return;

		if (data.cooldown) {
			if (data.cooldown > Date.now() - await lastShownStorage.get(id)) return;
			lastShownStorage.set(id, Date.now());
		}

		requestAnimationFrame(() => {
			if (window.getComputedStyle(element).maxHeight === 'initial') return;
			element.style.maxHeight = '100vh';
		});

		notificationsContainer.prepend(element);

		if (!isSticky && delay !== Infinity) resetCloseTimer();
	})();

	return notification;
}
