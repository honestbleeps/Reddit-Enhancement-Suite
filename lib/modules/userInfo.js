import * as QuickMessage from './quickMessage';
import { $ } from '../vendor';
import { Modules } from '../core';
import { ajax } from 'environment';
import {
	click,
	getUserInfo,
	isPageType,
	loggedInUser,
	niceDate,
	niceDateDiff,
	string
} from '../utils';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'userInfo';
	module.moduleName = 'User Info';
	module.category = ['Users'];
	module.description = 'Adds a hover tooltip to users';
	module.options = {
		hoverInfo: {
			type: 'boolean',
			value: true,
			description: 'Show information on user (karma, how long they\'ve been a redditor) on hover.'
		},
		useQuickMessage: {
			type: 'boolean',
			value: true,
			description: 'Open the quick message dialog when clicking on the "send message" button in hover info, instead of going straight to reddit\'s message page.',
			dependsOn: 'hoverInfo'
		},
		hoverDelay: {
			type: 'text',
			value: 800,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		fadeSpeed: {
			type: 'text',
			value: 0.7,
			description: 'Fade animation\'s speed (in seconds). Default is 0.7.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		gildComments: {
			type: 'boolean',
			value: true,
			description: 'When clicking the "give gold" button on the user hover info on a comment, give gold to the comment.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		highlightButton: {
			type: 'boolean',
			value: true,
			description: 'Show "highlight" button in user hover info, for distinguishing posts/comments from particular users.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		highlightColor: {
			type: 'color',
			value: '#5544CC',
			description: 'Color used to highlight a selected user, when "highlighted" from hover info.',
			advanced: true,
			dependsOn: 'highlightButton'
		},
		highlightColorHover: {
			type: 'color',
			value: '#6677AA',
			description: 'Color used to highlight a selected user on hover.',
			advanced: true,
			dependsOn: 'highlightButton'
		}
	};

	module.go = function() {
		if (module.options.hoverInfo.value) {
			$(document.body).on('mouseover', modules['userTagger'].usernameSelector, handleMouseOver);
		}
	};

	function handleMouseOver(e) {
		if (!modules['userTagger'].usernameRE.test(e.target.href)) return;
		modules['hover'].infocard(module.moduleID)
			.target(e.target)
			.options({
				width: 475,
				openDelay: module.options.hoverDelay.value,
				fadeDelay: module.options.fadeDelay.value,
				fadeSpeed: module.options.fadeSpeed.value
			})
			.populateWith(showUserInfo)
			.begin();
	}

	async function showUserInfo(authorLink, context, update) {
		const username = authorLink.href.match(modules['userTagger'].usernameRE)[1];

		update(username, '<span class="RESThrobber"></span>');

		let data;

		try {
			({ data } = await getUserInfo(username));
		} catch (e) {
			return [null, 'User not found'];
		}

		const userTaggerEnabled = modules['userTagger'].isEnabled() && modules['userTagger'].isMatchURL();
		const d = new Date(data.created_utc * 1000);

		const $header = $('<div />');

		$header.append(string.escapeHTML`<a href="/user/${data.name}">/u/${data.name}</a> (<a href="/user/${data.name}/submitted/">Links</a>) (<a href="/user/${data.name}/comments/">Comments</a>)`);

		if (loggedInUser()) {
			// Add friend button to header.
			const $friendButton = $(`
				<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;">
					<a class="option active ${data.is_friend ? 'remove' : 'add'}" href="#" tabindex="100">${data.is_friend ? '-' : '+'} friends</a>
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
						container: `t2_${(await getUserInfo()).data.id}`
					}
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
			<div class="authorFieldPair"><div class="authorLabel">Redditor since:</div> <div class="authorDetail">${niceDate(d, module.options.USDateFormat.value)} (${niceDateDiff(d)})</div></div>
			<div class="authorFieldPair"><div class="authorLabel">Link Karma:</div> <div class="authorDetail">${data.link_karma}</div></div>
			<div class="authorFieldPair"><div class="authorLabel">Comment Karma:</div> <div class="authorDetail">${data.comment_karma}</div></div>
		`;

		const nameLowercase = (data.name || '').toLowerCase();

		if (modules['userTagger'].tags && modules['userTagger'].tags[nameLowercase] && modules['userTagger'].tags[nameLowercase].link) {
			const links = modules['userTagger'].tags[nameLowercase].link.split(/\s/).reduce((acc, url) => acc + string.escapeHTML`<a target="_blank" href="${url}">${url.replace(/^https?:\/\/(www\.)?/, '')}</a>`, '');
			userHTML += `<div class="authorFieldPair"><div class="authorLabel">Link:</div> <div class="authorDetail">${links}</div></div>`;
		}

		userHTML += string.escapeHTML`
			<div class="clear"></div>
			<div class="bottomButtons">
				<a target="_blank" class="blueButton composeButton" href="/message/compose/?to=${data.name}"><img src="https://redditstatic.s3.amazonaws.com/mailgray.png"> send message</a>
		`;

		if (data.is_gold) {
			userHTML += '<a target="_blank" class="blueButton" href="/gold/about">User has Reddit Gold</a>';
		} else {
			userHTML += string.escapeHTML`<a target="_blank" id="gildUser" class="blueButton" href="/gold?goldtype=gift&recipient=${data.name}">Gift Reddit Gold</a>`;
		}

		if (module.options.highlightButton.value) {
			const isHighlight = !module.highlightedUsers || !module.highlightedUsers[data.id];
			userHTML += string.escapeHTML`<div class="${isHighlight ? 'blueButton' : 'redButton'}" id="highlightUser" data-userid="${data.id}">${isHighlight ? 'Highlight' : 'Unhighlight'}</div>`;
		}

		const isUnignore = userTaggerEnabled && modules['userTagger'].tags && modules['userTagger'].tags[nameLowercase] && modules['userTagger'].tags[nameLowercase].ignore;
		userHTML += string.escapeHTML`<div class="${isUnignore ? 'redButton' : 'blueButton'}" id="ignoreUser" user="${nameLowercase}">&empty; ${isUnignore ? 'Unignore' : 'Ignore'}</div>`;

		userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div

		const body = $('<div id="authorInfoToolTip" />').append(userHTML);

		if (userTaggerEnabled) {
			const ignoreButton = body.find('#ignoreUser');
			ignoreButton.on('click', ignoreUser);
		}
		if (module.options.highlightButton.value) {
			body.find('#highlightUser').on('click', ({ target }) => {
				const userid = target.getAttribute('data-userid');
				toggleUserHighlight(target, userid);
			});
		}
		if (module.options.gildComments.value && isPageType('comments')) {
			body.find('#gildUser').on('click', e => {
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
			body.find('a.composeButton').on('click', e => {
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
						body: entryUrl
					});
					hideAuthorInfo();
				}
			});
		}

		return [null, body];
	}

	function hideAuthorInfo() {
		modules['hover'].infocard('userInfo').close();
	}

	function toggleUserHighlight(authorInfoToolTipHighlight, userid) {
		if (!module.highlightedUsers) {
			module.highlightedUsers = {};
		}
		if (module.highlightedUsers[userid]) {
			module.highlightedUsers[userid].remove();
			delete module.highlightedUsers[userid];
			toggleUserHighlightButton(authorInfoToolTipHighlight, true);
			if (modules['commentNavigator'].isEnabled() && modules['commentNavigator'].isMatchURL() && modules['commentNavigator'].options.openOnHighlightUser.value) {
				modules['commentNavigator'].getPostsByCategory(); // refresh informations
			}
		} else {
			module.highlightedUsers[userid] = modules['userHighlight'].highlightUser(userid);
			toggleUserHighlightButton(authorInfoToolTipHighlight, false);
			if (modules['commentNavigator'].isEnabled() && modules['commentNavigator'].isMatchURL() && modules['commentNavigator'].options.openOnHighlightUser.value) {
				modules['commentNavigator'].showNavigator('highlighted');
			}
		}
	}

	function toggleUserHighlightButton(authorInfoToolTipHighlight, canHighlight) {
		$(authorInfoToolTipHighlight)
			.toggleClass('blueButton', canHighlight)
			.toggleClass('redButton', !canHighlight)
			.text(canHighlight ? 'Highlight' : 'Unhighlight');
	}

	function ignoreUser(e) {
		let thisIgnore;
		if (e.target.classList.contains('blueButton')) {
			e.target.classList.remove('blueButton');
			e.target.classList.add('redButton');
			$(e.target).html('&empty; Unignore');
			thisIgnore = true;
		} else {
			e.target.classList.remove('redButton');
			e.target.classList.add('blueButton');
			$(e.target).html('&empty; Ignore');
			thisIgnore = false;
		}
		const thisName = e.target.getAttribute('user');
		modules['userTagger'].ignoreUser(thisName, thisIgnore);
	}
}
