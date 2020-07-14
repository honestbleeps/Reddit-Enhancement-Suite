/* @flow */

import $ from 'jquery';
import { once } from 'lodash-es';
import Favico from 'favico.js';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import { addFloater, loggedInUser } from '../utils';
import { Session, multicast } from '../environment';
import legacyFavicon from '../images/legacyFavicon.png';
import * as BetteReddit from './betteReddit';

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
	faviconUseLegacy: {
		description: 'faviconUseLegacyDesc',
		title: 'faviconUseLegacyTitle',
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
		value: '#ffffff',
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

module.contentStart = () => {
	if (module.options.faviconUseLegacy.value) setupFavicon();

	if (!loggedInUser()) {
		return;
	}

	floatingButtons();
	if (module.options.openMailInNewTab.value) {
		$orangeredElements().attr('target', '_blank').attr('rel', 'noopener noreferer');
	}

	updateFromPage();
};

export async function updateFromPage(doc: HTMLElement = document.body) {
	if (!Modules.isRunning(module)) return;
	if (!module.options.updateCurrentTab.value) return;
	if (!loggedInUser()) return;

	// `doc` may be a cached page. Don't update if more recent data has been processed
	const debuginfoElement = doc.querySelector('.debuginfo');
	// Timestamp example: 2018-12-14 00:21:00.572436+00:00
	const timestampRegex = /(\d{4})-(\d{2})-(\d{2}) (\d{2})\:(\d{2})\:(\d{2})\.(\d+)[+-](\d{2})\:(\d{2})/;
	const [timestamp] = debuginfoElement && timestampRegex.exec(debuginfoElement.textContent) || [];
	if (Date.parse(timestamp)) {
		const lastUpdate = await Session.get('orangered.last-update');
		Session.set('orangered.last-update', timestamp);
		if (lastUpdate && new Date(lastUpdate) >= new Date(timestamp)) return;
	}

	setUnreadCount(getUnreadCount(doc));
}

let lastCount = 0;

const _setUnreadCount = multicast((count: number) => {
	// Refresh only when count is unchanged, to avoid initializing favicon, misc elements unnecessaury
	if (count === lastCount) return;
	lastCount = count;

	updateFaviconBadge(count);
	updateTitle(count);
	updateInboxElements(count);
	updateMailCountElements(count);

	if (count > 0) {
		window.dispatchEvent(new Event('orangered'));
	}
}, { name: 'setUnreadCount', crossContext: false });

function setUnreadCount(count: number) {
	if (module.options.updateOtherTabs.value) {
		_setUnreadCount(count);
	} else {
		_setUnreadCount.local(count);
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

function updateInboxElements(count) {
	const { nativeInboxButton, $floatingInboxButton } = orangeredElements();

	$().add($floatingInboxButton).add(nativeInboxButton)
		.attr('title', count ? 'new mail!' : 'No new mail')
		.toggleClass('havemail', !!count)
		.toggleClass('nohavemail', !count)
		.attr('href', getInboxLink(count));
}

function updateMailCountElements(count) {
	const { nativeInboxCount, $floatingInboxCount } = orangeredElements();

	$().add($floatingInboxCount).add(nativeInboxCount)
		.css('display', count ? 'inline-block' : 'none')
		.attr('href', getInboxLink(count))
		.attr('title', count ? 'new mail!' : 'No new mail')
		.text(count)
		.addClass('message-count');
}

function updateFaviconBadge(count) {
	if (module.options.showUnreadCountInFavicon.value) {
		setupFavicon().badge(count);
	}
}

const setupFavicon = once(() => {
	const favicons = Array.from(document.head.querySelectorAll('link[rel="icon"]'));
	const selectedFavicon = favicons.find(f => f.getAttribute('sizes') === '96x96') || favicons.slice(-1)[0];
	// remove other favicons to ensure that ours is selected
	for (const f of favicons) {
		if (f !== selectedFavicon) f.remove();
	}
	// browser should auto resolve to this if all get removed, but just in case, setting it explicitly
	if (module.options.faviconUseLegacy.value) {
		selectedFavicon.setAttribute('href', legacyFavicon);
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
	modmailButtonSelector: '#modmail',
});

const $orangeredElements = () => Object.values(orangeredElements()).reduce(($all, ele) => $all.add(ele), $());

const nativeButtons = once(() => {
	const nativeInboxButton = document.querySelector('#header-bottom-right #mail');
	let nativeInboxCount = document.querySelector('#header-bottom-right .message-count');
	if (!nativeInboxCount && (module.options.updateCurrentTab.value || module.options.updateOtherTabs.value)) {
		nativeInboxCount = document.createElement('a');
		nativeInboxCount.style.display = 'none';
		nativeInboxButton.after(nativeInboxCount);
	}
	return { nativeInboxButton, nativeInboxCount };
});

const floatingButtons = once(() => {
	if (!module.options.showFloatingEnvelope.value) {
		return { $floatingInboxButton: undefined, $floatingInboxCount: undefined };
	}
	let $floatingInboxButton, $floatingInboxCount;

	const pinHeader = BetteReddit.module.options.pinHeader.value;
	if (pinHeader === 'sub' || pinHeader === 'none') {
		$floatingInboxButton = $('<a>', { id: 'NREMail', class: 'nohavemail' });
		addFloater($floatingInboxButton.get(0));

		$floatingInboxCount = $('<a>', { id: 'NREMailCount' });
		$floatingInboxCount.css('display', 'none');
		$floatingInboxCount.attr('href', getInboxLink(true));
		addFloater($floatingInboxCount.get(0));
	}

	return { $floatingInboxButton, $floatingInboxCount };
});

function getInboxLink(havemail) {
	if (havemail && !module.options.unreadLinksToInbox.value) {
		return '/message/unread/';
	}

	return '/message/inbox/';
}
function getUnreadCount(container) {
	const mailCount = container.querySelector('.message-count');
	return mailCount && parseInt(mailCount.textContent, 10) || 0;
}
