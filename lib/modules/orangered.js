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
	resetFaviconOnLeave: {
		description: 'orangeredResetFaviconOnLeaveDesc',
		title: 'orangeredResetFaviconOnLeaveTitle',
		type: 'boolean',
		value: true,
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

const _setUnreadCount = multicast(count => {
	count = count || 0;

	updateFaviconBadge(count);
	updateTitle(count);
	updateInboxElements(count);
	updateMailCountElements(count);

	if (count > 0) {
		window.dispatchEvent(new Event('orangered'));
	}
}, { name: 'setUnreadCount' });

function setUnreadCount(count) {
	if (module.options.updateOtherTabs.value && typeof count !== 'undefined') {
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

	const favicon = new Favico();

	if (module.options.resetFaviconOnLeave.value) {
		// Prevent notification icon from showing up in bookmarks
		$(window).on('beforeunload', () => favicon.reset());
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
		$(nativeInboxButton).after(nativeInboxCount);
	}
	return { nativeInboxButton, nativeInboxCount };
});

const floatingButtons = _.once(() => {
	if (!module.options.showFloatingEnvelope.value) return {};
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
function getUnreadCount(container = document.body) {
	const mailCount = container.querySelector('.message-count');
	return mailCount && parseInt(mailCount.textContent, 10) || 0;
}
