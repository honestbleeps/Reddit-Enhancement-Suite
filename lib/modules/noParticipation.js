import _ from 'lodash';
import { $ } from '../vendor';
import {
	BodyClasses,
	click,
	isPageType,
	loggedInUser,
	watchForElement,
} from '../utils';
import * as CommentTools from './commentTools';
import * as Notifications from './notifications';

export const module = {};

module.moduleID = 'noParticipation';

const urls = {
	moreinfo: 'https://www.reddit.com/r/NoParticipation/wiki/intro',
};

module.moduleName = 'No Participation';
module.description = `
	Helps discourage brigading and helps you avoid getting banned, by warning against voting
	or commenting when following "No Participation" (np) links, and by providing options to prevent you from
	accidentally participating.
	<p><a href="${urls.moreinfo}" target="_blank" rel="noopener noreferer">Find out more about "No Participation".</a></p>
`;

module.category = ['Comments', 'Subreddits'];

module.options = {
	disableVoteButtons: {
		type: 'boolean',
		value: false,
		description: 'Hide vote buttons. If you have already visited the page and voted, your prior votes will still be visible.',
		bodyClass: true,
	},
	disableCommentTextarea: {
		type: 'boolean',
		value: false,
		description: 'Disable commenting.',
		bodyClass: true,
	},
	evenIfSubscriber: {
		type: 'boolean',
		value: false,
		description: 'Enable NP mode in subreddits where you\'re a subscriber',
	},
	escapeNP: {
		type: 'boolean',
		value: true,
		description: 'Remove np mode when leaving a No-Participation page',
	},
};

module.include = [
	/^https?:\/\/(?:.*\.)?(?:\w+-)?np(?:-\w+)?\.reddit\.com\/*/i,  // np.reddit.com, np-nm.reddit.com, nm-np.reddit.com, www.np.reddit.com, www.np-nm.reddit.com
];

const boilerplateNotificationText = `
	<p>
		<div class="RES-spoiler">
			<label class="RES-spoiler-title">Hover here for more details</label>
			<div class="RES-spoiler-contents">
				You came to this page by following a <a href="${urls.moreinfo}" target="_blank" rel="noopener noreferer">NP</a> link, so you may be interfering with normal conversation.
				Please respect reddit's <a href="https://reddit.com/rules" target="_blank" rel="noopener noreferer">rules</a> by not commenting or voting. Violating these rules may get you banned.
				<a href="${urls.moreinfo}" target="_blank" rel="noopener noreferer">Find out more</a>
			</div>
		</div>
	</p>
`;

let noParticipationActive;

module.go = () => {
	if (module.options.escapeNP.value) {
		$(document.body).on('mousedown', 'a', removeNpFromLink);
	}

	if (isNPIrrelevant()) {
		notifyNpIrrelevant();
	} else if (loggedInUser()) {
		if (isPageType('comments', 'linklist') && !(document.body.classList.contains('front-page') || document.body.classList.contains('profile-page'))) {
			applyNoParticipationMode();
		} else {
			notifyNpIrrelevant();
		}
	}
};

function removeNpFromLink({ target }) {
	// in self text, rewrite relative links only (where the domain is inherited)
	if (!target.getAttribute('href').startsWith('/') && $(target).is('.md a')) return;

	if (target.hostname.endsWith('np.reddit.com')) {
		target.hostname = 'www.reddit.com';
	}
}

function isNPIrrelevant() {
	return !isPageType('comments') || isSubscriber() && !module.options.evenIfSubscriber.value;
}

export function isVotingBlocked() {
	return noParticipationActive && module.options.disableVoteButtons.value;
}

function isSubscriber() {
	return document.body.classList.contains('subscriber');
}

function nonNpLocation() {
	const nonNpUrl = new URL(location);
	nonNpUrl.hostname = 'www.reddit.com';
	return nonNpUrl.href;
}

function notifyNpIrrelevant() {
	const message = isSubscriber() ?
		`You're browsing in <a href="${urls.moreinfo}" target="_blank" rel="noopener noreferer">No Participation</a> mode, but you're a subscriber here.` :
		`You're still browsing in <a href="${urls.moreinfo}" target="_blank" rel="noopener noreferer">No Participation</a> mode, but it's no longer necessary.`;

	Notifications.showNotification({
		moduleID: module.moduleID,
		notificationID: 'ok-participation',
		closeDelay: 3000,
		header: 'Okay to Participate',
		message: `${message} <p><a href="${nonNpLocation()}">Click here to return to normal reddit</a></p>`,
	});
}

function notifyNpActive() {
	const message = isSubscriber() ? `
			<span class="res-icon">&#xF15A;</span>
			Please think before you comment or vote, and remember the subreddit's rules.
			Although you subscribe to this subreddit, you can still derail a particular thread.
			<p><a href="${nonNpLocation()}">Click here to return to normal reddit.</a></p>
		` : `
			<strong>
				<span class="res-icon">&#xF15A;</span>
				Do not vote or comment.
			</strong>
		`;

	Notifications.showNotification({
		moduleID: module.moduleID,
		notificationID: 'no-participation',
		closeDelay: 10000,
		header: 'No Participation',
		message: `${message}${boilerplateNotificationText}`,
	});
}

const votedOnButtons = [];

export async function notifyNoVote(voteButton) {
	// classes are added after this listener runs
	const canUndoVote = !$(voteButton).is('.upmod, .downmod');

	const notification = await Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'disableVoteButtons',
		cooldown: 5000,
		header: 'No Participation',
		message: `
			<strong><span class="res-icon">&#xF15A;</span> Do not vote.</strong>
			${boilerplateNotificationText}
			${canUndoVote ? '<p><button type="button" class="redButton" data-action="revertvote">Undo vote</button></p>' : ''}
		`,
	});

	if (notification) {
		$(notification.element).find('[data-action=revertvote]').on('click', () => {
			revertVote(votedOnButtons);
			notification.close();
		});
	}

	votedOnButtons.push(voteButton);
}

function notifyNoComment() {
	Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'disableCommentTextarea',
		header: 'No Participation',
		message: `<strong><span class="res-icon">&#xF15A;</span> Do not comment.</strong>${boilerplateNotificationText}`,
	});
}

function applyNoParticipationMode() {
	noParticipationActive = true;

	notifyNpActive();

	BodyClasses.add('res-noParticipation');

	watchForVote();

	watchForComment();
	watchForElement('newCommentsForms', watchForComment);
}

function watchForVote() {
	$(document.body).on('click', '.arrow', e => notifyNoVote(e.target));
}

function revertVote(voteButtons) {
	voteButtons.forEach((voteButton, index) => {
		setTimeout(() => {
			if (voteButton.classList.contains('upmod') || voteButton.classList.contains('downmod')) {
				click(voteButton);
			}
		}, index * 2000 /* respect API limits */);
	});

	Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'disableVoteButtons',
		header: 'No Participation',
		message: `
			${voteButtons.length > 1 ? 'Your votes are being reverted.' : 'Your vote has been reverted.'}
			Please remember not to vote!
			<p><a href="${urls.moreinfo}" target="_blank" rel="noopener noreferer">Find out more</a></p>
		`,
	});
}

const notify = _.once(notifyNoComment);
function watchForComment(container = document.body) {
	const textareas = CommentTools.getCommentTextarea(container);

	textareas.one('keydown', notify);

	if (module.options.disableCommentTextarea.value) {
		textareas.attr('disabled', true);
	}
}
