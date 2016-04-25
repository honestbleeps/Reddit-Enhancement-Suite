import { $ } from '../vendor';
import { commaDelimitedNumber, getUserInfo, loggedInUser } from '../utils';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'showKarma';
	module.moduleName = 'Show Karma';
	module.category = 'My account';
	module.description = 'Add more info and tweaks to the karma next to your username in the user menu bar.';
	module.options = {
		showCommentKarma: {
			type: 'boolean',
			value: true,
			description: 'Show comment karma in addition to link karma'
		},
		separator: {
			type: 'text',
			value: '\u00b7',
			description: 'Separator character between post/comment karma',
			advanced: true
		},
		useCommas: {
			type: 'boolean',
			value: true,
			description: 'Use commas for large karma numbers'
		}
	};

	module.go = async function() {
		if (loggedInUser()) {
			if (this.options.showCommentKarma.value) {
				await updateKarmaDiv();
			} else {
				formatLinkKarma();
			}
		}
	};

	async function updateKarmaDiv() {
		const karmaDiv = document.querySelector('#header-bottom-right .userkarma');

		if (karmaDiv) {
			karmaDiv.title = '';

			const { data } = await getUserInfo();

			let linkKarma = data.link_karma;
			let commentKarma = data.comment_karma;

			if (module.options.useCommas.value) {
				linkKarma = commaNumber(linkKarma);
				commentKarma = commaNumber(commentKarma);
			} else {
				linkKarma = uncommaNumber(linkKarma);
			}

			$(karmaDiv).safeHtml(
				`<a title="link karma" href="/user/${loggedInUser()}/submitted/">${linkKarma}</a>
				${module.options.separator.value}
				<a title="comment karma" href="/user/${loggedInUser()}/comments/">${commentKarma}</a>`
			);
		}
	}

	function formatLinkKarma(value) {
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
		value = value || 0;
		value = String(value).match(/(\w+)/g);
		return value ? value.join('') : 0;
	}
}
