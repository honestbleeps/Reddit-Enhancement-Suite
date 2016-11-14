import _ from 'lodash';
import quickMessageTemplate from '../templates/quickMessage.mustache';
import { $ } from '../vendor';
import {
	HOUR,
	checkKeysForEvent,
	currentSubreddit,
	getUrlParams,
	isModeratorAnywhere,
	loggedInUser,
	regexes,
	string,
} from '../utils';
import * as Modules from '../core/modules';
import { Storage, ajax } from '../environment';
import * as CommandLine from './commandLine';
import * as CommentTools from './commentTools';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';
import * as UsernameHider from './usernameHider';

export const module = {};

module.moduleID = 'quickMessage';
module.moduleName = 'quickMessageName';
module.category = 'usersCategory';
module.description = 'quickMessageDesc';
module.options = {
	openQuickMessage: {
		type: 'keycode',
		value: [77, false, true, false], // control-m
		description: 'Keyboard shortcut to open the quick message dialog.',
	},
	defaultSubject: {
		type: 'text',
		value: '',
		description: 'Text that will automatically be inserted into the subject field, unless it is auto-filled by context.',
	},
	sendAs: {
		type: 'enum',
		values: [{
			name: 'Current user',
			value: 'user',
		}, {
			name: 'Current subreddit',
			value: 'sub',
		}, {
			name: 'Last selected',
			value: 'last',
		}, {
			name: 'Last selected (this page load)',
			value: 'temporary',
		}],
		value: 'user',
		description: 'The default user or subreddit to select when the "from" field is unspecified.<p>Reverts to the current user if the selected option can\'t be used (i.e. you aren\'t a moderator of the current subreddit).</p>',
	},
	handleContentLinks: {
		type: 'boolean',
		value: true,
		description: 'Open the quick message dialog when clicking on reddit.com/message/compose links in comments, selftext, or wiki pages.',
	},
	handleSideLinks: {
		type: 'boolean',
		value: true,
		description: 'Open the quick message dialog when clicking on reddit.com/message/compose links in the sidebar. (e.g. "message the moderators")',
	},
	linkToCurrentPage: {
		type: 'boolean',
		value: true,
		description: 'Automatically start with a link to the current page in the message body (or, if opened from the user info popup, a link to the current post or comment).',
	},
};

module.go = () => {
	CommandLine.registerCommand(
		(cmd, val) => cmd === 'qm' && (/^(?:([^\s]+)(?:\s(.*))?)?$/).exec(val),
		'qm [recipient [message]] - open quick message dialog',
		(command, val, [, to, body]) => {
			if (body) {
				return `quick message to ${to}: ${body}`;
			} else if (to) {
				return `quick message to ${to}`;
			}
			return 'quick message';
		},
		(command, val, [, to, body]) => {
			openQuickMessageDialog({ to, body });
		}
	);

	// global keyboard shortcut
	window.addEventListener('keydown', e => {
		if (checkKeysForEvent(e, module.options.openQuickMessage.value)) {
			e.preventDefault();
			openQuickMessageDialog();
		}
	}, true);

	if (module.options.handleContentLinks.value) {
		$('div.content[role="main"]').on('click', 'a[href*="/message/compose"]', messageLinkEventHandler);
	}
	if (module.options.handleSideLinks.value) {
		$('div.side').on('click', 'a[href*="/message/compose"]', messageLinkEventHandler);
	}
};

const quickMessageDialog = _.once(() => {
	const $dialog = $('<div>', {
		id: 'quickMessage',
		html: quickMessageTemplate({ settingsUrl: SettingsNavigation.makeUrlHash(module.moduleID) }),
	});

	const from = $dialog.find('#quickMessageDialogFrom').get(0);
	const to = $dialog.find('#quickMessageDialogTo').get(0);
	const subject = $dialog.find('#quickMessageDialogSubject').get(0);
	const body = $dialog.find('#quickMessageDialogBody').get(0);

	// close dialog with "x" button
	$dialog
		.find('#quickMessageDialogClose')
		.on('click', e => {
			e.preventDefault();
			closeQuickMessageDialog();
		});

	// close dialog with escape key
	$dialog
		.get(0)
		.addEventListener('keydown', e => {
			if (e.keyCode === CommentTools.KEYS.ESCAPE) {
				e.preventDefault();
				closeQuickMessageDialog();
			}
		}, true);

	// send with "send message" button
	$dialog
		.find('#quickMessageDialogSend')
		.get(0)
		.addEventListener('click', e => {
			e.preventDefault();
			sendMessage();
		}, true);

	// send with control-enter
	CommentTools.onCtrlEnter('#quickMessageDialog', sendMessage);

	// open full message form
	$dialog
		.find('a.fullMessageForm')
		// mousedown isn't fired if you tab over to the button
		.on('mousedown focus', e => { e.target.href = getFullMessageFormUrl(); })
		.on('click', closeQuickMessageDialog);

	$dialog.find('a').on('keypress', e => {
		if ((e.keyCode || e.which) === 13) {
			$(e.target).trigger('click');
		}
	});

	// show moderator shield when sending from subreddit and store the user's selection
	from.addEventListener('change', ({ target }) => {
		updateModeratorIcon(target.value.startsWith('/r/'));
		Storage.set(`RESmodules.quickMessage.lastSentAs.${loggedInUser()}`, target.value);
	});

	$dialog.appendTo(document.body);

	return { $dialog, from, to, subject, body };
});

function updateModeratorIcon(state) {
	quickMessageDialog().$dialog
		.find('label[for=quickMessageDialogFrom]')
		.toggleClass('moderator', state);
}

function messageLinkEventHandler(e) {
	const { href, pathname } = e.target;
	const hasModifier = e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;
	if (e.which === 1 && !hasModifier && regexes.composeMessage.test(pathname)) {
		e.preventDefault();

		const { to, subject, message: body } = getUrlParams(href);
		const srMatch = regexes.subreddit.exec(pathname);

		openQuickMessageDialog({
			from: srMatch ? `/r/${srMatch[1]}` : undefined,
			to,
			subject,
			body,
		});
		return true;
	}
}

export function onClickMessageLink(event) {
	if (!Modules.isRunning(module)) {
		return false;
	}
	return messageLinkEventHandler(event);
}

// Resolves an array of objects:
// { name: '/u/realUsername' /* or '/r/subreddit' */,
//   displayText: '/u/anonymous' /* optional */ }
async function getValidSendFrom() {
	const username = loggedInUser();

	if (!username) {
		return [];
	}

	const users = [{
		name: `/u/${username}`,
		displayText: `/u/${Modules.isEnabled(UsernameHider) ? UsernameHider.getDisplayText(username) : username}`,
	}];

	if (isModeratorAnywhere()) {
		const { data } = await ajax({
			url: '/subreddits/mine/moderator.json',
			data: {
				limit: 1000,
				show: 'all',
				user: loggedInUser(), // for the cache
			},
			type: 'json',
			cacheFor: HOUR,
		});
		const modSubs = data.children.map(({ data }) => ({ name: data.url.slice(0, -1) }));
		users.push(...modSubs);
	}

	return users;
}

const setUpSendFromDropdown = _.once(async () => {
	const senders = await getValidSendFrom();
	for (const { name, displayText } of senders) {
		const currentOption = document.createElement('option');
		currentOption.value = name;
		currentOption.text = displayText || name;
		quickMessageDialog().from.add(currentOption);
	}
	quickMessageDialog().from.disabled = (senders.length < 2);
});

function focusFirstEmpty() {
	Array.from(quickMessageDialog().$dialog.find('input, textarea'))
		.find((ele, i, { length }) => !ele.value || i === length - 1)
		.focus();
}

async function updateSelectedSender(desiredUser = '') {
	const sendAsOptions = Array.from(quickMessageDialog().from.options).map(ele => ele.textContent.toLowerCase());
	let indexToSelect = sendAsOptions.indexOf(desiredUser.toLowerCase());

	if (indexToSelect === -1) {
		switch (module.options.sendAs.value) {
			case 'sub':
				const subreddit = `/r/${currentSubreddit()}`;
				indexToSelect = sendAsOptions.indexOf(subreddit.toLowerCase());
				break;
			case 'last':
				const lastSelected = await Storage.get(`RESmodules.quickMessage.lastSentAs.${loggedInUser()}`);
				if (lastSelected) {
					indexToSelect = sendAsOptions.indexOf(lastSelected.toLowerCase());
				}
				break;
			case 'temporary':
				indexToSelect = quickMessageDialog().from.selectedIndex;
				break;
			// case 'user':
			default:
				indexToSelect = 0;
				break;
		}
	}

	quickMessageDialog().from.selectedIndex = (indexToSelect !== -1 ? indexToSelect : 0);
	updateModeratorIcon(quickMessageDialog().from.value.startsWith('/r/'));
}

export async function openQuickMessageDialog({ from = '', to = '', subject = module.options.defaultSubject.value, body = module.options.linkToCurrentPage.value ? location.href : '' } = {}) {
	if (!loggedInUser()) {
		Notifications.showNotification({
			moduleID: 'quickMessage',
			notificationID: 'quickMessageNoUser',
			header: 'Not Logged In.',
			closeDelay: 3000,
			message: 'You must log in to use the quick message dialog.',
		});
		return;
	}

	await setUpSendFromDropdown();

	await updateSelectedSender(from);
	quickMessageDialog().to.value = to;
	quickMessageDialog().subject.value = subject;
	quickMessageDialog().body.value = body;

	quickMessageDialog().$dialog.fadeIn(300);

	focusFirstEmpty();
}

function closeQuickMessageDialog() {
	quickMessageDialog().$dialog.fadeOut(300);

	// remove focus from any input fields
	for (const ele of quickMessageDialog().$dialog.find('input, textarea, button')) {
		ele.blur();
	}
}

function getFullMessageFormUrl() {
	const subreddit = quickMessageDialog().from.value.startsWith('/r/') ? quickMessageDialog().from.value : '';
	return subreddit +
		string.encode`/message/compose?to=${quickMessageDialog().to.value}&subject=${quickMessageDialog().subject.value}&message=${quickMessageDialog().body.value}`;
}

const presetSendErrors = {
	NO_USER: 'No recipient specified.',
	NO_SUBJECT: 'No subject specified.',
	NO_TEXT: 'Message body is empty.',
	BAD_CAPTCHA: '<p>Sorry, reddit requires you to enter a captcha to send messages. This is usually because your account is brand new or has low karma.</p><b>Click on "open full message form" and try again (your message will be preserved).</b>',
	TOO_LONG: 'Either your subject (max 100 characters) or body (max 10,000 characters) is too long.',
};

async function sendMessage() {
	const from = quickMessageDialog().from.value;

	try {
		const { json: { errors } } = await ajax({
			method: 'POST',
			url: '/api/compose',
			data: {
				api_type: 'json',
				from_sr: from.includes('/r/') ? from.slice(3) : '',
				subject: quickMessageDialog().subject.value,
				text: quickMessageDialog().body.value,
				to: quickMessageDialog().to.value,
			},
			type: 'json',
		});

		if (errors[0]) {
			Notifications.showNotification({
				moduleID: 'quickMessage',
				notificationID: 'quickMessageSendError',
				header: 'Message not sent.',
				closeDelay: 15000,
				message: presetSendErrors[errors[0][0]] || `${errors[0][0]} : ${errors[0][1]}`, // errors[0][0] is the error name, [1] is reddit's description of the error
			});
		} else {
			closeQuickMessageDialog();
		}
	} catch (e) {
		Notifications.showNotification({
			moduleID: 'quickMessage',
			notificationID: 'failedToSendQuickMessage',
			header: 'Sending Failed!',
			closeDelay: 15000,
			message: 'Reddit is likely under heavy load. Either wait a minute or click on "open full message form" and try again (your message will be preserved).',
		});
		throw e;
	}
}
