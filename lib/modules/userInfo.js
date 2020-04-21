/* @flow */

import $ from 'jquery';
import { Module } from '../core/module';
import { ajax, i18n } from '../environment';
import * as Modules from '../core/modules';
import {
	click,
	CreateElement,
	downcast,
	formatDate,
	formatDateDiff,
	formatNumber,
	getUserInfo,
	usernameSelector,
	getUsernameFromLink,
	loggedInUser,
	loggedInUserHash,
	string,
	Thing,
} from '../utils';
import * as CommentNavigator from './commentNavigator';
import * as FilteReddit from './filteReddit';
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

module.contentStart = () => {
	if (module.options.hoverInfo.value) {
		Hover.infocard(module.moduleID)
			.options({
				width: 475,
				openDelay: parseFloat(module.options.hoverDelay.value),
				fadeDelay: parseFloat(module.options.fadeDelay.value),
				fadeSpeed: parseFloat(module.options.fadeSpeed.value),
			})
			.populateWith(showUserInfo)
			.watch(usernameSelector);
	}
};

async function showUserInfo(card) {
	const username = getUsernameFromLink(card.getCheckedTarget());

	if (!username) {
		console.error(i18n('userInfoInvalidUsernameLink'));
		return;
	}

	const thing = Thing.from(card.getCheckedTarget());
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

	const header = string.html`
		<div>
			<a href="/user/${data.name}">/u/${data.name}</a>
		 	(<a href="/user/${data.name}/submitted/">${i18n('userInfoLinks')}</a>)
		 	(<a href="/user/${data.name}/comments/">${i18n('userInfoComments')}</a>)
		</div>
	`;

	if (loggedInUser()) {
		const button = CreateElement.fancyToggleButton(
			i18n('userInfoAddRemoveFriends'),
			'',
			() => data.is_friend,
			async state => {
				ajax({
					method: 'POST',
					url: `/api/${state ? 'friend' : 'unfriend'}`,
					data: {
						type: 'friend',
						name: data.name,
						container: `t2_${(await getUserInfo()).data.id}`,
					},
				});
				ajax.invalidate({ url: `/user/${data.name}/about.json` });
			},
		);
		button.style.marginLeft = '12px';
		header.appendChild(button);
	}

	card.populate([header]);

	const $body = $('<div id="authorInfoToolTip" />');

	let userHTML = string.escape`
		<div class="fieldPair"><div class="fieldPair-label">${i18n('userInfoRedditorSince')}</div> <div class="fieldPair-text">${formatDate(d)} (${formatDateDiff(d)})</div></div>
		<div class="fieldPair"><div class="fieldPair-label">${i18n('userInfoPostKarma')}</div> <div class="fieldPair-text">${formatNumber(data.link_karma)}</div></div>
		<div class="fieldPair"><div class="fieldPair-label">${i18n('userInfoCommentKarma')}</div> <div class="fieldPair-text">${formatNumber(data.comment_karma)}</div></div>
	`;

	const userTaggerEnabled = Modules.isRunning(UserTagger);
	const userTag = userTaggerEnabled && await UserTagger.Tag.get(data.name);

	if (userTaggerEnabled) {
		userHTML += `<div class="fieldPair"><div class="fieldPair-label">${i18n('userInfoUserTag')}</div> <div class="fieldPair-text" style="display:flex"><a class="author" style="display: none;" href="/u/${data.name}"/></div></div>`;
	}

	if (userTag && userTag.link) {
		const links = userTag.link.split(/\s/).reduce((acc, url) => acc + string.escape`<a target="_blank" rel="noopener noreferer" href="${url}">${url.replace(/^https?:\/\/(www\.)?/, '')}</a>`, '');
		userHTML += `<div class="fieldPair"><div class="fieldPair-label">${i18n('userInfoLink')}</div> <div class="fieldPair-text">${links}</div></div>`;
	}

	userHTML += string.escape`
		<div class="clear"></div>
		<div class="bottomButtons">
			<a target="_blank" rel="noopener noreferer" class="blueButton composeButton" href="/message/compose/?to=${data.name}"><img src="https://redditstatic.s3.amazonaws.com/mailgray.png"> ${i18n('userInfoSendMessage')}</a>
	`;

	

	if (data.is_gold) {
		userHTML += string.escape`<a target="_blank" rel="noopener noreferer" class="blueButton" href="/gold/about">${i18n('userInfoUserHasRedditGold')}</a>`;
	} else {
		userHTML += string.escape`<a target="_blank" rel="noopener noreferer" id="gildUser" class="blueButton" href="/gold?goldtype=gift&recipient=${data.name}">${i18n('userInfoGiftRedditGold')}</a>`;
	}

	if (module.options.highlightButton.value) {
		const isHighlight = !highlightedUsers[data.id];
		userHTML += string.escape`<div class="${isHighlight ? 'blueButton' : 'redButton'}" id="highlightUser" data-userid="${data.id}">${isHighlight ? i18n('userInfoHighlight') : i18n('userInfoUnhighlight')}</div>`;
	}

	if (userTag){
		userHTML += string.escape`<a target="_blank" rel="noopener noreferer" id="blockUser" class="blueButton">${i18n('userInfoBlock')}</a>`;
		
		$body.on('click', '#blockUser', (e: Event) => {
			
			loggedInUserHash().then(
				hash => {
					ajax({
					method: 'POST',
					url: `/api/block_user`,
					data: {
						account_id: `t2_`+userTag.id,
						api_type: 'json',
						name: userTag.id,
						uh: String(hash)},
					}).then(() => FilteReddit.listFilters.users.toggleString(userTag.id, true, false))					
				}
			);
		});
	}

	if (userTag) {
		const getButton = () => string.html`<div class="${userTag.ignored ? 'redButton' : 'blueButton'}" id="ignoreUser">&empty; ${userTag.ignored ? i18n('userInfoUnignore') : i18n('userInfoIgnore')}</div>`;

		$body.on('click', '#ignoreUser', (e: Event) => {
			if (e.currentTarget.classList.contains('blueButton')) userTag.ignore();
			else userTag.unignore();
			e.currentTarget.replaceWith(getButton());
		});

		userHTML += getButton().outerHTML;
	}

	userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div

	$body.append(userHTML);

	if (userTag) {
		userTag.add(downcast($body.find('.author').get(0), HTMLAnchorElement), { renderTaggingIcon: true });
	}

	if (module.options.highlightButton.value) {
		$body.find('#highlightUser').on('click', ({ currentTarget }: Event) => {
			const userid = currentTarget.getAttribute('data-userid');
			toggleUserHighlight(currentTarget, userid, thing);
		});
	}
	if (module.options.gildComments.value && thing && thing.isComment()) {
		$body.find('#gildUser').on('click', (e: MouseEvent) => {
			if (!thing || e.ctrlKey || e.metaKey || e.shiftKey) return;

			card.close();
			const giveGold = thing.entry.querySelector('.give-gold');
			click(giveGold);
			e.preventDefault();
		});
	}

	if (module.options.useQuickMessage.value && Modules.isRunning(QuickMessage)) {
		$body.find('a.composeButton').on('click', (e: JQueryMouseEventObject) => {
			if (e.which === 1) {
				e.preventDefault();

				let entryUrl;
				if (QuickMessage.module.options.linkToCurrentPage.value && thing) {
					const permalink = thing.getCommentPermalink();
					if (permalink) {
						entryUrl = permalink.href;
						if (!entryUrl.includes('?context=')) entryUrl += '?context=10';
					}
				}

				QuickMessage.openQuickMessageDialog({
					to: data.name,
					body: entryUrl,
				});
				card.close();
			}
		});
	}

	return [null, $body];
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
		.toggleClass('blueButton', canHighlight)
		.toggleClass('redButton', !canHighlight)
		.text(canHighlight ? i18n('userInfoHighlight') : i18n('userInfoUnhighlight'));
}
