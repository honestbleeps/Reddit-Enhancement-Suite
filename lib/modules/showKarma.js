import { $ } from '../vendor';
import { commaDelimitedNumber, getUserInfo, loggedInUser } from '../utils';

export const module = {};

module.moduleID = 'showKarma';
module.moduleName = 'Show Karma';
module.category = 'My account';
module.description = 'Add more info and tweaks to the karma next to your username in the user menu bar.';
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
};

module.go = async function() {
	if (loggedInUser()) {
		if (module.options.showCommentKarma.value) {
			await updateKarmaDiv();
		} else {
			formatPostKarma();
		}
	}
};

async function updateKarmaDiv() {
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
			`<a title="post karma" href="/user/${loggedInUser()}/submitted/">${postKarma}</a>
			${module.options.separator.value}
			<a title="comment karma" href="/user/${loggedInUser()}/comments/">${commentKarma}</a>`
		);
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
	return commaDelimitedNumber(value);
}

function uncommaNumber(value) {
	const match = String(value || 0).match(/(\w+)/g);
	return match ? match.join('') : 0;
}
