/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { ajax, i18n } from '../environment';
import * as Modules from '../core/modules';
import {
	click,
	downcast,
	formatDate,
	formatDateDiff,
	formatNumber,
	getUserInfo,
	isPageType,
	loggedInUser,
	string,
} from '../utils';
import * as CommentNavigator from './commentNavigator';
import * as Hover from './hover';
import * as QuickMessage from './quickMessage';
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
	hoverDelay: {
		title: 'userInfoHoverDelayTitle',
		type: 'text',
		value: '800',
		description: 'userInfoHoverDelayDesc',
		advanced: true,
		dependsOn: options => options.hoverInfo.value,
	},
	fadeDelay: {
		title: 'userInfoFadeDelayTitle',
		type: 'text',
		value: '200',
		description: 'userInfoFadeDelayDesc',
		advanced: true,
		dependsOn: options => options.hoverInfo.value,
	},
	fadeSpeed: {
		title: 'userInfoFadeSpeedTitle',
		type: 'text',
		value: '0.7',
		description: 'userInfoFadeSpeedDesc',
		advanced: true,
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
	if (module.options.hoverInfo.value) {
		$(document.body).on('mouseover', UserTagger.usernameSelector, handleMouseOver);
	}
};

function handleMouseOver(e: Event) {
	if (!UserTagger.usernameRE.test((e.target: any).href)) return;
	Hover.infocard(module.moduleID)
		.target(e.target)
		.options({
			width: 475,
			openDelay: module.options.hoverDelay.value,
			fadeDelay: module.options.fadeDelay.value,
			fadeSpeed: module.options.fadeSpeed.value,
		})
		.populateWith(showUserInfo)
		.begin();
}

async function showUserInfo(target, update) {
	const authorLink = downcast(target, HTMLAnchorElement);

	const match = authorLink.href.match(UserTagger.usernameRE);
	if (!match) return [null, i18n('userInfoInvalidUsernameLink')];

	const username = match[1];

	update(username);

	let data;

	try {
		({ data } = await getUserInfo(username));
	} catch (e) {
		return [null, i18n('userInfoUserNotFound')];
	}

	if (data.is_suspended) {
		return [null, i18n('userInfoUserSuspended')];
	}

	const d = new Date(data.created_utc * 1000);

	const $header = $('<div />');

	$header.append(string.escapeHTML`<a href="/user/${data.name}">/u/${data.name}</a> (<a href="/user/${data.name}/submitted/">${i18n('userInfoLinks')}</a>) (<a href="/user/${data.name}/comments/">${i18n('userInfoComments')}</a>)`);

	if (loggedInUser()) {
		// Add friend button to header.
		const $friendButton = $(`
			<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;">
				<a class="option active ${data.is_friend ? 'remove' : 'add'}" href="#" tabindex="100">${i18n('userInfoAddRemoveFriends', data.is_friend ? '-' : '+')}</a>
			</span>
		`);

		$friendButton.click(async e => {
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

		$header.append($friendButton);
	}

	update($header);

	let userHTML = string.escapeHTML`
		<div class="authorFieldPair"><div class="authorLabel">${i18n('userInfoRedditorSince')}</div> <div class="authorDetail">${formatDate(d)} (${formatDateDiff(d)})</div></div>
		<div class="authorFieldPair"><div class="authorLabel">${i18n('userInfoPostKarma')}</div> <div class="authorDetail">${formatNumber(data.link_karma)}</div></div>
		<div class="authorFieldPair"><div class="authorLabel">${i18n('userInfoCommentKarma')}</div> <div class="authorDetail">${formatNumber(data.comment_karma)}</div></div>
	`;

	const nameLowercase = (data.name || '').toLowerCase();

	if (UserTagger.tags && UserTagger.tags[nameLowercase] && UserTagger.tags[nameLowercase].link) {
		const links = UserTagger.tags[nameLowercase].link.split(/\s/).reduce((acc, url) => acc + string.escapeHTML`<a target="_blank" rel="noopener noreferer" href="${url}">${url.replace(/^https?:\/\/(www\.)?/, '')}</a>`, '');
		userHTML += `<div class="authorFieldPair"><div class="authorLabel">${i18n('userInfoLink')}</div> <div class="authorDetail">${links}</div></div>`;
	}

	userHTML += string.escapeHTML`
		<div class="clear"></div>
		<div class="bottomButtons">
			<a target="_blank" rel="noopener noreferer" class="blueButton composeButton" href="/message/compose/?to=${data.name}"><img src="https://redditstatic.s3.amazonaws.com/mailgray.png"> ${i18n('userInfoSendMessage')}</a>
	`;

	if (data.is_gold) {
		userHTML += string.escapeHTML`<a target="_blank" rel="noopener noreferer" class="blueButton" href="/gold/about">${i18n('userInfoUserHasRedditGold')}</a>`;
	} else {
		userHTML += string.escapeHTML`<a target="_blank" rel="noopener noreferer" id="gildUser" class="blueButton" href="/gold?goldtype=gift&recipient=${data.name}">${i18n('userInfoGiftRedditGold')}</a>`;
	}

	if (module.options.highlightButton.value) {
		const isHighlight = !highlightedUsers[data.id];
		userHTML += string.escapeHTML`<div class="${isHighlight ? 'blueButton' : 'redButton'}" id="highlightUser" data-userid="${data.id}">${isHighlight ? i18n('userInfoHighlight') : i18n('userInfoUnhighlight')}</div>`;
	}

	const userTaggerEnabled = Modules.isRunning(UserTagger);

	const isUnignore = userTaggerEnabled && UserTagger.tags && UserTagger.tags[nameLowercase] && UserTagger.tags[nameLowercase].ignore;
	userHTML += string.escapeHTML`<div class="${isUnignore ? 'redButton' : 'blueButton'}" id="ignoreUser" user="${nameLowercase}">&empty; ${isUnignore ? i18n('userInfoUnignore') : i18n('userInfoIgnore')}</div>`;

	userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div

	const body = $('<div id="authorInfoToolTip" />').append(userHTML);

	if (userTaggerEnabled) {
		const ignoreButton = body.find('#ignoreUser');
		ignoreButton.on('click', ignoreUser);
	}
	if (module.options.highlightButton.value) {
		body.find('#highlightUser').on('click', ({ target }: Event) => {
			const userid = target.getAttribute('data-userid');
			toggleUserHighlight(target, userid);
		});
	}
	if (module.options.gildComments.value && isPageType('comments', 'commentsLinklist')) {
		body.find('#gildUser').on('click', (e: MouseEvent) => {
			if (e.ctrlKey || e.cmdKey || e.shiftKey) return;

			const comment = $(authorLink).closest('.comment');
			if (!comment.length) return;

			hideAuthorInfo();
			const giveGold = comment.find('.give-gold')[0];
			click(giveGold);
			e.preventDefault();
		});
	}

	if (module.options.useQuickMessage.value && Modules.isRunning(QuickMessage)) {
		body.find('a.composeButton').on('click', (e: JQueryMouseEventObject) => {
			if (e.which === 1) {
				e.preventDefault();

				let entryUrl;
				if (QuickMessage.module.options.linkToCurrentPage.value) {
					entryUrl = $(authorLink).closest('.entry').find('a.bylink').attr('href');
					if (entryUrl && !entryUrl.includes('?context=')) {
						entryUrl += '?context=10';
					}
				}

				QuickMessage.openQuickMessageDialog({
					to: data.name,
					body: entryUrl,
				});
				hideAuthorInfo();
			}
		});
	}

	return [null, body];
}

function hideAuthorInfo() {
	Hover.infocard(module.moduleID).close();
}

function toggleUserHighlight(authorInfoToolTipHighlight, userid) {
	if (highlightedUsers[userid]) {
		highlightedUsers[userid].remove();
		delete highlightedUsers[userid];
		toggleUserHighlightButton(authorInfoToolTipHighlight, true);
		if (Modules.isRunning(CommentNavigator) && CommentNavigator.module.options.openOnHighlightUser.value) {
			CommentNavigator.getPostsByCategory(); // refresh informations
		}
	} else {
		highlightedUsers[userid] = UserHighlight.highlightUser(userid);
		toggleUserHighlightButton(authorInfoToolTipHighlight, false);
		if (Modules.isRunning(CommentNavigator) && CommentNavigator.module.options.openOnHighlightUser.value) {
			CommentNavigator.showNavigator('highlighted');
		}
	}
}

function toggleUserHighlightButton(authorInfoToolTipHighlight, canHighlight) {
	$(authorInfoToolTipHighlight)
		.toggleClass('blueButton', canHighlight)
		.toggleClass('redButton', !canHighlight)
		.text(canHighlight ? i18n('userInfoHighlight') : i18n('userInfoUnhighlight'));
}

function ignoreUser(e: Event) {
	let thisIgnore;
	if (e.target.classList.contains('blueButton')) {
		e.target.classList.remove('blueButton');
		e.target.classList.add('redButton');
		$(e.target).html(string.escapeHTML`&empty; ${i18n('userInfoUnignore')}`);
		thisIgnore = true;
	} else {
		e.target.classList.remove('redButton');
		e.target.classList.add('blueButton');
		$(e.target).html(string.escapeHTML`&empty; ${i18n('userInfoIgnore')}`);
		thisIgnore = false;
	}
	const thisName = e.target.getAttribute('user');
	UserTagger.ignoreUser(thisName, thisIgnore);
}
