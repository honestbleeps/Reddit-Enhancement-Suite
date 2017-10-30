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
	loggedInUser,
	string,
	Thing,
	observe
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
	observe(document.body, { childList: true }, mutation => {
		if (!mutation.addedNodes.length) return;
		//author-tooltip 
		const addedNode = downcast(mutation.addedNodes[0], HTMLElement);
		if (addedNode.classList.contains('author-tooltip')){
			setTimeout(() => { renderHoverCardInfo(addedNode); }, 50); 
		}
	});
};

async function renderHoverCardInfo(hoverCard) {
	const authorLink = hoverCard.querySelector('.author-tooltip__profile-link');
	// Hopefully this will switch to event, but for now, just poll until its there
	// this results in it being a ton less slow to render
	if (!authorLink) {
		return setTimeout(() => { renderHoverCardInfo(hoverCard); }, 50);
	}

	const [, username] = UserTagger.usernameRE.exec(authorLink.href);
	applyResData(hoverCard, username);
}

/**	
 * applyResData
 * Apply additional RES data to the reddit hover-cards
 *
 * @param Element hoverCard 
 * @param string username
 */
async function applyResData(hoverCard, username) {
	let data;

	try {
		({ data } = await getUserInfo(username));
	} catch (e) {
		return [null, i18n('userInfoUserNotFound')];
	}
	if (data.is_suspended) {
		return [null, i18n('userInfoUserSuspended')];
	}

	// Get main elements
	const header = hoverCard.querySelector('.author-tooltip__head');
	const links = hoverCard.querySelector('.author-tooltip__link-list');
	// Render tagger
	const userTag = await attachUserTagger(header, username);

	// Extra buttons
	createFriendButton(links, data);
	createIgnoreButton(links, userTag);
	createHighlightButton(links, username);
}

/**	
 * attachUserTagger
 *
 * @param Element header 
 * @param string username
 */
async function attachUserTagger(header, username) {
	const userTaggerEnabled = Modules.isRunning(UserTagger);
	const userTag = userTaggerEnabled && await UserTagger.Tag.get(username);

	if (userTaggerEnabled) {
		let taggerMarkup = `<a class="author" style="display: none;" href="/u/${username}"/>`;

		if (userTag.link) {
			taggerMarkup += userTag.link.split(/\s/).reduce((acc, url) => acc + string.escape`<a target="_blank" rel="noopener noreferer" href="${url}">${url.replace(/^https?:\/\/(www\.)?/, '')}</a>`, '');
		}

		const tagger = document.createElement('div');
		tagger.classList.add('res-tags');
		tagger.innerHTML = taggerMarkup;
		header.insertBefore(tagger, header.querySelector('h3').nextSibling);

		// Apply tag icon if no tags set
		userTag.add(downcast($(header).find('.author').get(0), HTMLAnchorElement), { renderTaggingIcon: true });
	}

	return userTag;
}

/**	
 * createHighlightButton
 *
 * @param Element links 
 * @param string username
 */
async function createHighlightButton(links, username) {
	if (module.options.highlightButton.value) {
		const isHighlight = !highlightedUsers[username];
		const highlightButton = string.html`<li><a class="${isHighlight ? 'blue' : 'red'}" id="highlightUser" data-userid="${username}">${isHighlight ? i18n('userInfoHighlight') : i18n('userInfoUnhighlight')}</a></li>`;
		
		highlightButton.addEventListener('click', async (e: Event) => {
			if (e.target.tagName !== 'A') return;
			e.preventDefault();

			const userid = e.target.getAttribute('data-userid');
			toggleUserHighlight(e.target, userid);

			$(e.target).toggleClass('blue').toggleClass('red');
		});

		links.appendChild(highlightButton);
	}
}

/**	
 * createIgnoreButton
 *
 * @param Element links 
 * @param userTag
 */
async function createIgnoreButton(links, userTag) {
	const ignoreButton = string.html`<li><a class="${userTag.ignored ? 'red' : 'blue'}" id="ignoreUser">&empty; ${userTag.ignored ? i18n('userInfoUnignore') : i18n('userInfoIgnore')}</a></li>`;

	ignoreButton.addEventListener('click', async (e: Event) => {
		if (e.target.tagName !== 'A') return;
		e.preventDefault();

		if (e.target.classList.contains('blue')) userTag.ignore();
		else userTag.unignore();
		$(e.target).toggleClass('blue').toggleClass('red');
	});

	links.appendChild(ignoreButton);
}

/**	
 * createFriendButton
 *
 * @param Element links 
 * @param object data
 */
async function createFriendButton(links, data) {
	if (loggedInUser()) {
		// Add friend button to header.
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
		
		links.appendChild(friendButton);
	}
}

function toggleUserHighlight(authorInfoToolTipHighlight, userid) {
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
	}
}

function toggleUserHighlightButton(authorInfoToolTipHighlight, canHighlight) {
	$(authorInfoToolTipHighlight)
		.toggleClass('blue', canHighlight)
		.toggleClass('red', !canHighlight)
		.text(canHighlight ? i18n('userInfoHighlight') : i18n('userInfoUnhighlight'));
}
