/* @flow */

import { Module } from '../core/module';
import { empty, formatDate, formatDateDiff, formatNumber, getUserInfo, loggedInUser, string } from '../utils';

export const module: Module<*> = new Module('showKarma');

module.moduleName = 'showKarmaName';
module.category = 'myAccountCategory';
module.description = 'showKarmaDesc';
module.options = {
	showCommentKarma: {
		title: 'showKarmaShowCommentKarmaTitle',
		type: 'boolean',
		value: true,
		description: 'showKarmaShowCommentKarmaDesc',
	},
	separator: {
		title: 'showKarmaSeparatorTitle',
		type: 'text',
		value: '\u00b7',
		description: 'showKarmaSeparatorDesc',
		advanced: true,
	},
	useCommas: {
		title: 'showKarmaUseCommasTitle',
		type: 'boolean',
		value: true,
		description: 'showKarmaUseCommasDesc',
	},
	showGold: {
		title: 'showKarmaShowGoldTitle',
		type: 'boolean',
		value: false,
		description: 'showKarmaShowGoldDesc',
	},
};

module.contentStart = async () => {
	if (!loggedInUser()) return;

	const { data } = await getUserInfo();

	updateKarmaDiv(data);

	if (module.options.showGold.value && data.is_gold) {
		displayGold(data.gold_expiration);
	}
};

function updateKarmaDiv(data) {
	const karmaDiv = document.querySelector('#header-bottom-right .userkarma');
	if (!karmaDiv) return;

	karmaDiv.title = '';
	empty(karmaDiv);

	karmaDiv.append(string.html`<a title="post karma" href="/user/me/submitted/">${module.options.useCommas.value ? formatNumber(data.link_karma) : data.link_karma}</a>`);

	if (module.options.showCommentKarma.value) {
		karmaDiv.append(
			module.options.separator.value,
			string.html`<a title="comment karma" href="/user/me/comments/">${module.options.useCommas.value ? formatNumber(data.comment_karma) : data.comment_karma}</a>`,
		);
	}
}

// If the user has gold and would like to, display the gilded-icon in the user span.
function displayGold(expires: number) {
	// Get the user <span> located in the userbar
	const userSpan = document.querySelector('#header-bottom-right .user');
	if (!userSpan) return;

	const today = new Date();
	const expDate = new Date(expires * 1000); // s -> ms
	const title = expDate > today ? `Until ${formatDate(expDate)} (${formatDateDiff(today, expDate)})` : '';

	userSpan.prepend(string.html`<span title="${title}" class="gilded-icon"></span>`);
}
