/* @flow */

import _ from 'lodash';
import Favico from 'favico.js';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { loggedInUser } from '../utils';
import { multicast } from '../environment';
import * as BetteReddit from './betteReddit';
import * as Floater from './floater';

export const module: Module<*> = new Module('orangered');

module.moduleName = 'orangeredName';
module.category = 'myAccountCategory';
module.description = 'orangeredDesc';

module.options = {
	openMailInNewTab: {
		description: 'orangeredOpenMailInNewTabDesc',
		title: 'orangeredOpenMailInNewTabTitle',
		type: 'boolean',
		value: false,
	},
	updateCurrentTab: {
		description: 'orangeredUpdateCurrentTabDesc',
		title: 'orangeredUpdateCurrentTabTitle',
		type: 'boolean',
		value: true,
	},
	updateOtherTabs: {
		description: 'orangeredUpdateOtherTabsDesc',
		keywords: ['favicon', 'sync'],
		title: 'orangeredUpdateOtherTabsTitle',
		type: 'boolean',
		value: true,
	},
	showFloatingEnvelope: {
		description: 'orangeredShowFloatingEnvelopeDesc',
		title: 'orangeredShowFloatingEnvelopeTitle',
		type: 'boolean',
		value: true,
	},
	retroUnreadCount: {
		description: 'orangeredRetroUnreadCountDesc',
		title: 'orangeredRetroUnreadCountTitle',
		type: 'boolean',
		value: false,
		bodyClass: true,
	},
	showUnreadCountInTitle: {
		description: 'orangeredShowUnreadCountInTitleDesc',
		title: 'orangeredShowUnreadCountInTitleTitle',
		type: 'boolean',
		value: false,
	},
	showUnreadCountInFavicon: {
		description: 'orangeredShowUnreadCountInFaviconDesc',
		title: 'orangeredShowUnreadCountInFaviconTitle',
		type: 'boolean',
		value: true,
	},
	faviconNotificationBGColor: {
		description: 'faviconNotificationBGColorDesc',
		title: 'faviconNotificationBGColorTitle',
		advanced: true,
		type: 'color',
		value: '#5f99cf',
		dependsOn: options => options.showUnreadCountInFavicon.value,
	},
	faviconNotificationTextColor: {
		description: 'faviconNotificationTextColorDesc',
		title: 'faviconNotificationTextColorTitle',
		advanced: true,
		type: 'color',
		value: '#FFFFFF',
		dependsOn: options => options.showUnreadCountInFavicon.value,
	},
	resetFaviconOnLeave: {
		description: 'orangeredResetFaviconOnLeaveDesc',
		title: 'orangeredResetFaviconOnLeaveTitle',
		type: 'boolean',
		value: true,
		dependsOn: options => options.showUnreadCountInFavicon.value,
	},
	unreadLinksToInbox: {
		description: 'orangeredUnreadLinksToInboxDesc',
		title: 'orangeredUnreadLinksToInboxTitle',
		type: 'boolean',
		value: false,
		advanced: true,
	},
	hideEmptyMail: {
		description: 'orangeredHideEmptyMailDesc',
		title: 'orangeredHideEmptyMailTitle',
		type: 'boolean',
		value: false,
		bodyClass: true,
	},
	hideModMail: {
		description: 'orangeredHideModMailDesc',
		title: 'orangeredHideModMailTitle',
		type: 'boolean',
		value: false,
		bodyClass: true,
	},
	hideEmptyModMail: {
		description: 'orangeredHideEmptyModMailDesc',
		title: 'orangeredHideEmptyModMailTitle',
		type: 'boolean',
		value: false,
		bodyClass: true,
		dependsOn: options => !options.hideModMail.value,
	},
	hideNewModMail: {
		description: 'orangeredHideNewModMailDesc',
		title: 'orangeredHideNewModMailTitle',
		type: 'boolean',
		value: false,
		bodyClass: true,
	},
	hideEmptyNewModMail: {
		description: 'orangeredHideEmptyNewModMailDesc',
		title: 'orangeredHideEmptyNewModMailTitle',
		type: 'boolean',
		value: false,
		bodyClass: true,
		dependsOn: options => !options.hideNewModMail.value,
	},
};

module.go = () => {
	if (!loggedInUser()) {
		return;
	}

	floatingButtons();
	if (module.options.openMailInNewTab.value) {
		$orangeredElements().attr('target', '_blank').attr('rel', 'noopener noreferer');
	}

	updateFromPage();
};

export function updateFromPage(doc?: HTMLElement) {
	if (!module.options.updateCurrentTab.value) return;
	if (!loggedInUser()) return;
	setUnreadCount(getUnreadCount(doc));
}

const _setUnreadCount = multicast(data => {
	const {
		messageCount,
		notificationCount,
	} = data;

	const sumCount = messageCount + notificationCount;

	updateFaviconBadge(sumCount);
	updateTitle(sumCount);
	updateInboxElements(data);
	updateMailCountElements(data);

	if (sumCount > 0) {
		const event = new CustomEvent('orangered', { detail: {
			sumCount,
			messageCount,
			notificationCount,
		} });
		window.dispatchEvent(event);
	}
}, { name: 'setUnreadCount', crossContext: false });

function setUnreadCount(data) {
	if (module.options.updateOtherTabs.value && typeof data !== 'undefined') {
		_setUnreadCount(data);
	} else {
		_setUnreadCount.local(data);
	}
}

function updateTitle(count) {
	if (!module.options.showUnreadCountInTitle.value) return;
	if (count > 0) {
		document.title = `[${count}] ${document.title.replace(/^\[[\d]+\]\s/, '')}`;
	} else {
		document.title = document.title.replace(/^\[[\d]+\]\s/, '');
	}
}

function updateInboxElements(data) {
	const {
		messageCount,
		notificationCount,
		modmailHasMail,
		newModmailHasMail,
		messageTitle,
		notificationTitle,
		modmailTitle,
		newModmailTitle,
	} = data;

	const {
		nativeMessageButton,
		floatingMessageButton,
		nativeNotificationButton,
		floatingNotificationButton,
		nativeModmailButton,
		floatingModmailButton,
		nativeNewModmailButton,
		floatingNewModmailButton,
	} = orangeredElements();

	$(nativeMessageButton).add(floatingMessageButton)
		.attr('title', messageTitle)
		.toggleClass('havemail', !!messageCount)
		.toggleClass('nohavemail', !messageCount)
		.attr('href', notificationTitle ? '/message/messages' : getInboxLink(messageCount, 'message'));

	$(nativeNotificationButton).add(floatingNotificationButton)
		.attr('title', notificationTitle)
		.toggleClass('havemail', !!notificationCount)
		.toggleClass('nohavemail', !notificationCount)
		.attr('href', getInboxLink(notificationCount, 'notification'));

	$(nativeModmailButton).add(floatingModmailButton)
		.attr('title', modmailTitle)
		.toggleClass('havemail', !!modmailHasMail)
		.toggleClass('nohavemail', !modmailHasMail)
		.attr('href', '/message/moderator');

	$(nativeNewModmailButton).add(floatingNewModmailButton)
		.attr('title', newModmailTitle)
		.toggleClass('havemail', !!newModmailHasMail)
		.toggleClass('nohavemail', !newModmailHasMail)
		.attr('href', '//mod.reddit.com/');
}

function updateMailCountElements(data) {
	const {
		messageCount,
		notificationCount,
		messageTitle,
		notificationTitle,
	} = data;

	const {
		nativeMessageCount,
		floatingMessageCount,
		nativeNotificationCount,
		floatingNotificationCount,
	} = orangeredElements();

	$(nativeMessageCount).add(floatingMessageCount)
		.attr('title', messageTitle)
		.text(messageCount)
		.css('display', messageCount ? 'inline-block' : 'none')
		.attr('href', notificationTitle ? '/message/messages' : getInboxLink(messageCount, 'message'));

	$(nativeNotificationCount).add(floatingNotificationCount)
		.text(notificationCount)
		.attr('title', notificationTitle)
		.css('display', notificationCount ? 'inline-block' : 'none')
		.attr('href', getInboxLink(notificationCount, 'notification'));
}

function updateFaviconBadge(count) {
	const favicon = setupFaviconBadge();

	if (!favicon) return;

	favicon.badge(count);
}

const setupFaviconBadge = _.once(() => {
	if (!module.options.showUnreadCountInFavicon.value) return false;

	const favicons = Array.from(document.head.querySelectorAll('link[rel="icon"]'));
	const selectedFavicon = favicons.find(f => f.getAttribute('sizes') === '96x96') || _.last(favicons);
	// remove other favicons to ensure that ours is selected
	for (const f of favicons) {
		if (f !== selectedFavicon) f.remove();
	}

	const favicon = new Favico({
		bgColor: module.options.faviconNotificationBGColor.value,
		textColor: module.options.faviconNotificationTextColor.value,
	});

	if (module.options.resetFaviconOnLeave.value) {
		// Prevent notification icon from showing up in bookmarks
		window.addEventListener('beforeunload', () => favicon.reset());
	}

	return favicon;
});

const orangeredElements = () => ({
	...nativeButtons(),
	...floatingButtons(),
});

const $orangeredElements = () => Object.values(orangeredElements()).reduce(($all, ele) => $all.add(ele), $());

const nativeButtons = _.once(() => _nativeButtons(document.body, true));
function _nativeButtons(container = document.body, addIfMissing) {
	const nativeMessageButton = container.querySelector('#header-bottom-right #mail, #header-bottom-right #message');
	const nativeMessageCount = getOrAddInboxCount(container, nativeMessageButton, 'message-count', addIfMissing);
	const nativeNotificationButton = container.querySelector('#header-bottom-right #notification');
	const nativeNotificationCount = getOrAddInboxCount(container, nativeNotificationButton, 'inbox-count', addIfMissing);
	const nativeModmailButton = container.querySelector('#modmail');
	const nativeNewModmailButton = container.querySelector('#new_modmail');

	return {
		nativeMessageButton,
		nativeMessageCount,
		nativeNotificationButton,
		nativeNotificationCount,
		nativeModmailButton,
		nativeNewModmailButton,
	};
}

function getOrAddInboxCount(container, nativeInboxButton, countClassname, addIfMissing) {
	let nativeInboxCount = container.querySelector(`#header-bottom-right .${countClassname}`);
	if (addIfMissing && nativeInboxButton && !nativeInboxCount && (module.options.updateCurrentTab.value || module.options.updateOtherTabs.value)) {
		nativeInboxCount = document.createElement('a');
		nativeInboxCount.classList.add(countClassname);
		nativeInboxCount.style.display = 'none';
		$(nativeInboxButton).after(nativeInboxCount);
	}

	return nativeInboxCount;
}

const floatingButtons = _.once(_floatingButtons);
function _floatingButtons() {
	const DEFAULT = {};
	if (!module.options.showFloatingEnvelope.value) return DEFAULT;
	const pinHeader = BetteReddit.module.options.pinHeader.value;
	if (!(pinHeader === 'sub' || pinHeader === 'none')) {
		return DEFAULT;
	}

	const floatingElements = {};
	for (const [key, e] of Object.entries(nativeButtons())) {
		floatingElements[key.replace(/^native/, 'floating')] = e && e.cloneNode(true);
	}

	for (const k of [
		'floatingMessageButton',
		'floatingMessageCount',
		'floatingNotificationButton',
		'floatingNotificationCount',
		'floatingModmailButton',
		'floatingNewModmailButton',
	]) {
		const element = floatingElements[k];
		if (element) {
			Floater.addElement(element);
		}
	}

	return floatingElements;
}

function getInboxLink(havemail, basepath = 'message') {
	if (havemail && !module.options.unreadLinksToInbox.value) {
		return `/${basepath}/unread/`;
	}

	return `/${basepath}/inbox/`;
}

function getUnreadCount(container) {
	const {
		nativeMessageButton,
		nativeMessageCount,
		nativeNotificationButton,
		nativeNotificationCount,
		nativeModmailButton,
		nativeNewModmailButton,
	} = _nativeButtons(container, false);

	const messageCount = nativeMessageCount && parseInt(nativeMessageCount.textContent, 10) || 0;
	const notificationCount = nativeNotificationCount && parseInt(nativeNotificationCount.textContent, 10) || 0;
	const modmailHasMail = !!(nativeModmailButton && nativeModmailButton.classList.contains('havemail'));
	const newModmailHasMail = !!(nativeNewModmailButton && nativeNewModmailButton.classList.contains('havemail'));

	const messageTitle = nativeMessageButton && nativeMessageButton.getAttribute('title') || '';
	const notificationTitle = nativeNotificationButton && nativeNotificationButton.getAttribute('title') || '';
	const modmailTitle = nativeModmailButton && nativeModmailButton.getAttribute('title') || '';
	const newModmailTitle = nativeNewModmailButton && nativeNewModmailButton.getAttribute('title') || '';

	return {
		messageCount,
		notificationCount,
		modmailHasMail,
		newModmailHasMail,

		messageTitle,
		notificationTitle,
		modmailTitle,
		newModmailTitle,
	};
}
