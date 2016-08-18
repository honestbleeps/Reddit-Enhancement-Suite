import _ from 'lodash';
import Favico from 'favico.js';
import { $ } from '../vendor';
import { loggedInUser } from '../utils';
import { multicast } from '../environment';
import * as BetteReddit from './betteReddit';
import * as Floater from './floater';

export const module = {};

module.moduleID = 'orangered';
module.moduleName = 'Unread Messages';
module.category = 'My account';
module.description = 'Helping you get your daily dose of orangereds';

module.options = {
	openMailInNewTab: {
		description: 'When clicking the mail envelope or modmail icon, open mail in a new tab?',
		type: 'boolean',
		value: false,
	},
	updateCurrentTab: {
		description: 'Update mail buttons on current tab when RES checks for orangereds',
		type: 'boolean',
		value: true,
	},
	updateOtherTabs: {
		description: 'Update all open tabs when RES checks for orangereds',
		type: 'boolean',
		value: true,
	},
	showFloatingEnvelope: {
		type: 'boolean',
		value: true,
		description: 'Show an envelope (inbox) icon in the top right corner',
	},
	hideUnreadCount: {
		type: 'boolean',
		value: false,
		description: 'Hide unread message count',
		bodyClass: true,
	},
	retroUnreadCount: {
		type: 'boolean',
		value: false,
		description: 'If you dislike the unread count provided by native reddit, you can replace it with the RES-style bracketed unread count',
		bodyClass: true,
	},
	showUnreadCountInTitle: {
		type: 'boolean',
		value: false,
		description: 'Show unread message count in page/tab title?',
	},
	showUnreadCountInFavicon: {
		type: 'boolean',
		value: true,
		description: 'Show unread message count in favicon?',
	},
	resetFaviconOnLeave: {
		type: 'boolean',
		value: true,
		description: 'Reset the favicon before leaving the page. \n\n This prevents the unread badge from appearing in bookmarks, but may hurt browser caching.',
	},
	unreadLinksToInbox: {
		type: 'boolean',
		value: false,
		description: 'Always go to the inbox, not unread messages, when clicking on orangered',
		advanced: true,
		dependsOn: 'updateCurrentTab',
	},
	hideModMail: {
		type: 'boolean',
		value: false,
		description: 'Hide the mod mail button in user bar.',
		bodyClass: true,
	},
};

let nativeInboxButton, nativeMailCount, $floatingInboxButton, $floatingInboxCount;

module.go = () => {
	if (!loggedInUser()) {
		return;
	}

	setupFloatingButtons();
	setupNativeButtons();

	if (module.options.openMailInNewTab.value) {
		$('#mail, .message-count, #modmail').add($floatingInboxButton).add($floatingInboxCount)
			.attr('target', '_blank');
	}

	updateFromPage();
};

export function updateFromPage(doc) {
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
	$().add($floatingInboxButton).add(nativeInboxButton)
		.attr('title', count ? 'new mail!' : 'No new mail')
		.toggleClass('havemail', !!count)
		.toggleClass('nohavemail', !count)
		.attr('href', getInboxLink(count));
}

function updateMailCountElements(count) {
	$().add($floatingInboxCount).add(nativeMailCount)
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

function setupNativeButtons() {
	if (nativeInboxButton) return;

	nativeInboxButton = document.querySelector('#header-bottom-right #mail');
	nativeMailCount = document.querySelector('#header-bottom-right .message-count');
	if (!nativeMailCount && (module.options.updateCurrentTab.value || module.options.updateOtherTabs.value)) {
		nativeMailCount	= document.createElement('a');
		nativeMailCount.style = 'display: inline-none;';
		$(nativeInboxButton).after(nativeMailCount);
	}
}

function setupFloatingButtons() {
	if (!module.options.showFloatingEnvelope.value) return;
	if ($floatingInboxCount) return;

	const pinHeader = BetteReddit.module.options.pinHeader.value;
	if (pinHeader === 'sub' || pinHeader === 'none') {
		$floatingInboxButton = $('<a>', { id: 'NREMail' });
		Floater.addElement($floatingInboxButton);

		$floatingInboxCount = $('<a>', { id: 'NREMailCount' });
		$floatingInboxCount.css('display', 'none');
		$floatingInboxCount.attr('href', getInboxLink(true));
		Floater.addElement($floatingInboxCount);
	}
}

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
