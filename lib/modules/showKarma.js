/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { formatDate, formatDateDiff, formatNumber, getUserInfo, loggedInUser } from '../utils';

export const module: Module<*> = new Module('showKarma');

module.moduleName = 'showKarmaName';
module.category = 'myAccountCategory';
module.description = 'showKarmaDesc';
module.options = {
	showCommentKarma: {
		type: 'boolean',
		value: true,
		description: 'Show comment karma in addition to post karma',
	},
	separator: {
		type: 'text',
		value: '\u00b7',
		description: 'Separator character between post/comment karma',
		advanced: true,
	},
	useCommas: {
		type: 'boolean',
		value: true,
		description: 'Use commas for large karma numbers',
	},
	showGold: {
		type: 'boolean',
		value: true,
		description: 'Display gilded icon if current user has gold status',
	},
};

module.go = async () => {
	const username = loggedInUser();
	if (username) {
		if (module.options.showCommentKarma.value) {
			await updateKarmaDiv(username);
		} else {
			formatPostKarma();
		}
		if (module.options.showGold.value) {
			updateUserSpan();
		}
	}
};

async function updateKarmaDiv(username) {
	const karmaDiv = document.querySelector('#header-bottom-right .userkarma');

	if (karmaDiv) {
		karmaDiv.title = '';

		const { data } = await getUserInfo();

		let postKarma = data.link_karma;
		let commentKarma = data.comment_karma;

		if (module.options.useCommas.value) {
			postKarma = commaNumber(postKarma);
			commentKarma = commaNumber(commentKarma);
		} else {
			postKarma = uncommaNumber(postKarma);
		}

		$(karmaDiv).safeHtml(
			`<a title="post karma" href="/user/${username}/submitted/">${postKarma}</a>
			${module.options.separator.value}
			<a title="comment karma" href="/user/${username}/comments/">${commentKarma}</a>`
		);
	}
}

// If the user has gold and would like to, display the gilded-icon in the user span.
async function updateUserSpan() {
	// Get the user <span> located in the userbar
	const userSpan = document.querySelector('#header-bottom-right .user');

	if (userSpan) {
		// Let's get the user's data.
		const { data } = await getUserInfo();

		// If the user has gold, display the icon and set the title text to the
		// time remaining till it expires.
		if (data.is_gold) {
			const $gilded = $('<span>', { class: 'gilded-icon' });

			if (data.gold_expiration) {
				const today = new Date();
				const expDate = new Date(data.gold_expiration * 1000); // s -> ms
				$gilded.attr('title', `Until ${formatDate(expDate)} (${formatDateDiff(today, expDate)})`);
			}

			// Prepend the icon to user <span> s/t it appears before the username.
			$(userSpan).prepend($gilded);
		}
	}
}

function formatPostKarma(value) {
	const container = document.querySelector('#header-bottom-right .user .userkarma');
	value = (typeof value !== 'undefined') ? value : container.textContent;

	if (!module.options.useCommas.value) {
		container.textContent = uncommaNumber(value);
	}
}

function commaNumber(value) {
	return formatNumber(value);
}

function uncommaNumber(value) {
	const match = String(value || 0).match(/(\w+)/g);
	return match ? match.join('') : '0';
}
