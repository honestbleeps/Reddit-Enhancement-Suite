/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { ajax, i18n } from '../environment';
import * as Modules from '../core/modules';
import {
	getUserInfo,
	loggedInUser,
	string,
	waitForDescendant,
	watchForFutureChildren,
} from '../utils';
import * as CommentNavigator from './commentNavigator';
// import * as QuickMessage from './quickMessage';
import * as UserHighlight from './userHighlight';
import * as UserTagger from './userTagger';

export const module: Module<*> = new Module('userInfo');

module.moduleName = 'userInfoName';
module.category = 'usersCategory';
module.description = 'userInfoDesc';
module.options = {
	hoverInfo: {
		title: 'userInfoHoverInfoTitle',
		type: 'boolean',
		value: true,
		description: 'userInfoHoverInfoDesc',
	},
	useQuickMessage: {
		title: 'userInfoUseQuickMessageTitle',
		type: 'boolean',
		value: true,
		description: 'userInfoUseQuickMessageDesc',
		dependsOn: options => options.hoverInfo.value,
	},
	gildComments: {
		title: 'userInfoGildCommentsTitle',
		type: 'boolean',
		value: true,
		description: 'userInfoGildCommentsDesc',
		advanced: true,
		dependsOn: options => options.hoverInfo.value,
	},
	highlightButton: {
		title: 'userInfoHighlightButtonTitle',
		type: 'boolean',
		value: true,
		description: 'userInfoHighlightButtonDesc',
		advanced: true,
		dependsOn: options => options.hoverInfo.value,
	},
	highlightColor: {
		title: 'userInfoHighlightColorTitle',
		type: 'color',
		value: '#5544CC',
		description: 'userInfoHighlightColorDesc',
		advanced: true,
		dependsOn: options => options.highlightButton.value,
	},
	highlightColorHover: {
		title: 'userInfoHighlightColorHoverTitle',
		type: 'color',
		value: '#6677AA',
		description: 'userInfoHighlightColorHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightButton.value,
	},
};

export const highlightedUsers = {};

module.go = () => {
	watchForFutureChildren(document.body, '.author-tooltip', card => {
		renderHoverCardInfo(card);
	});
};

async function renderHoverCardInfo(hoverCard) {
	const authorLink = await waitForDescendant(hoverCard, '.author-tooltip__profile-link');
	const [, username] = UserTagger.usernameRE.exec(authorLink.getAttribute('href'));
	applyResData(hoverCard, username);
}

/**
 * Apply additional RES data to the reddit hover-cards
 */
async function applyResData(hoverCard, username) {
	const links = hoverCard.querySelector('.author-tooltip__link-list');

	attachUserTagger(hoverCard, username);

	// Extra buttons (dont add if their is no links section - ie. its you)
	if (links) {
		const buttons = await Promise.all([createHighlightButton(username), createIgnoreButton(username), createFriendButton(username)]);
		for (const button of buttons) {
			if (!button) continue;
			links.appendChild(button);
		}
	}
}

function attachUserTagger(card: HTMLElement, username) {
	if (!Modules.isRunning(UserTagger)) return;

	const header = card.querySelector('.author-tooltip__head');
	// `applyToUser` adds the tag after the element provided
	const span = document.createElement('span');
	header.prepend(span);
	UserTagger.applyToUser(span, { username, renderTaggingIcon: true, renderVoteWeight: false });
}

function createHighlightButton(username) {
	if (!module.options.highlightButton.value) return;

	const isHighlight = !highlightedUsers[username];
	const highlightButton = string.html`<li><a class="${isHighlight ? 'blue' : 'red'}" id="highlightUser" data-userid="${username}">${isHighlight ? i18n('userInfoHighlight') : i18n('userInfoUnhighlight')}</a></li>`;

	highlightButton.addEventListener('click', (e: Event) => {
		if (e.target.tagName !== 'A') return;
		e.preventDefault();

		const userid = e.target.getAttribute('data-userid');
		toggleUserHighlight(e.target, userid);
	});

	return highlightButton;
}

async function createIgnoreButton(username) {
	if (!Modules.isRunning(UserTagger)) return;

	const userTag = await UserTagger.Tag.get(username);

	const ignoreButton = string.html`<li><a class="${userTag.ignored ? 'red' : 'blue'}" id="ignoreUser">&empty; ${userTag.ignored ? i18n('userInfoUnignore') : i18n('userInfoIgnore')}</a></li>`;

	ignoreButton.addEventListener('click', (e: Event) => {
		if (e.target.tagName !== 'A') return;
		e.preventDefault();

		if (e.target.classList.contains('blue')) userTag.ignore();
		else userTag.unignore();
		$(e.target).toggleClass('blue').toggleClass('red');
	});

	return ignoreButton;
}

async function createFriendButton(username) {
	if (!loggedInUser()) return;

	let data;
	try {
		({ data } = await getUserInfo(username));
	} catch (e) {
		return;
	}

	const friendButton = string.html`
		<li><a class="option active ${data.is_friend ? 'remove' : 'add'}" href="#" tabindex="100">${i18n('userInfoAddRemoveFriends', data.is_friend ? '-' : '+')}</a></li>
	`;

	friendButton.addEventListener('click', async (e: MouseEvent) => {
		if (e.target.tagName !== 'A') return;
		e.preventDefault();
		const $link = $(e.target);
		const isRemove = $link.hasClass('remove');
		await ajax({
			method: 'POST',
			url: `/api/${isRemove ? 'unfriend' : 'friend'}`,
			data: {
				type: 'friend',
				name: data.name,
				container: `t2_${(await getUserInfo()).data.id}`,
			},
		});
		$link
			.toggleClass('remove', !isRemove)
			.toggleClass('add', isRemove)
			.text(`${isRemove ? '+' : '-'} friends`);
		// The cache is now outdated, so expire it.
		ajax.invalidate({ url: `/user/${data.name}/about.json` });
	});

	return friendButton;
}

function toggleUserHighlight(authorInfoToolTipHighlight, userid, thing) {
	if (highlightedUsers[userid]) {
		highlightedUsers[userid].remove();
		delete highlightedUsers[userid];
		toggleUserHighlightButton(authorInfoToolTipHighlight, true);
	} else {
		highlightedUsers[userid] = UserHighlight.highlightUser(userid);
		toggleUserHighlightButton(authorInfoToolTipHighlight, false);
	}

	if (Modules.isRunning(CommentNavigator) && CommentNavigator.module.options.openOnHighlightUser.value) {
		CommentNavigator.setCategory('highlighted', true);
		if (thing) CommentNavigator.updateFromSelected(thing);
		CommentNavigator.toggle(false, true);
	}
}

function toggleUserHighlightButton(authorInfoToolTipHighlight, canHighlight) {
	$(authorInfoToolTipHighlight)
		.toggleClass('blue', canHighlight)
		.toggleClass('red', !canHighlight)
		.text(canHighlight ? i18n('userInfoHighlight') : i18n('userInfoUnhighlight'));
}
