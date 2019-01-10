/* @flow */

import _ from 'lodash';
import Favico from 'favico.js';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import { loggedInUser } from '../utils';
import { Session, multicast } from '../environment';
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
	faviconUseLegacy: {
		description: 'faviconUseLegacyDesc',
		title: 'faviconUseLegacyTitle',
		type: 'boolean',
		value: false,
		dependsOn: options => options.showUnreadCountInFavicon.value,
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
	// Refresh only when count is unchanged, to avoid initializing favicon, misc elements
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
	// browser should auto resolve to this if all get removed, but just in case, setting it explicitly
	if (module.options.faviconUseLegacy.value) {
		selectedFavicon.setAttribute('href', 'data:image/png;base64,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');
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

const nativeButtons = _.once(() => {
	const nativeInboxButton = document.querySelector('#header-bottom-right #mail');
	let nativeInboxCount = document.querySelector('#header-bottom-right .message-count');
	if (!nativeInboxCount && (module.options.updateCurrentTab.value || module.options.updateOtherTabs.value)) {
		nativeInboxCount = document.createElement('a');
		nativeInboxCount.style.display = 'none';
		nativeInboxButton.after(nativeInboxCount);
	}
	return { nativeInboxButton, nativeInboxCount };
});

const floatingButtons = _.once(() => {
	if (!module.options.showFloatingEnvelope.value) {
		return { $floatingInboxButton: undefined, $floatingInboxCount: undefined };
	}
	let $floatingInboxButton, $floatingInboxCount;

	const pinHeader = BetteReddit.module.options.pinHeader.value;
	if (pinHeader === 'sub' || pinHeader === 'none') {
		$floatingInboxButton = $('<a>', { id: 'NREMail' });
		Floater.addElement($floatingInboxButton);

		$floatingInboxCount = $('<a>', { id: 'NREMailCount' });
		$floatingInboxCount.css('display', 'none');
		$floatingInboxCount.attr('href', getInboxLink(true));
		Floater.addElement($floatingInboxCount);
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
