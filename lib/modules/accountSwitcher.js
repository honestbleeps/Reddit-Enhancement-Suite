/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { Alert, formatDate, formatDateDiff, getUserInfo, loggedInUser } from '../utils';
import { ajax, deleteCookies, multicast } from '../environment';
import * as BetteReddit from './betteReddit';
import * as CommandLine from './commandLine';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('accountSwitcher');

module.moduleName = 'accountSwitcherName';
module.category = 'myAccountCategory';
module.description = `
	Store username/password pairs and switch accounts instantly while browsing Reddit!
	\n\n<br><br>
	If you forget a password which is stored in Account Switcher, <a href="/r/Enhancement/wiki/faq/passwords">you can recover them from RES settings</a>.
	Be aware that RES offers very little protection for stored passwords, so be careful when sharing your computer or settings!
`;
module.options = {
	keepLoggedIn: {
		type: 'boolean',
		value: false,
		description: 'accountSwitcherKeepLoggedInDesc',
		title: 'accountSwitcherKeepLoggedInTitle',
	},
	accounts: {
		type: 'table',
		addRowText: 'accountSwitcherAddAccount',
		fields: [{
			name: 'accountSwitcherUsername',
			type: 'text',
		}, {
			name: 'accountSwitcherPassword',
			type: 'password',
		}],
		value: ([]: Array<[string, string]>),
		description: 'accountSwitcherAccountsDesc',
		title: 'accountSwitcherAccountsTitle',
	},
	updateOtherTabs: {
		type: 'boolean',
		description: 'accountSwitcherUpdateOtherTabsDesc',
		title: 'accountSwitcherUpdateOtherTabsTitle',
		value: true,
		advanced: true,
	},
	reloadOtherTabs: {
		type: 'boolean',
		description: 'accountSwitcherReloadOtherTabsDesc',
		title: 'accountSwitcherReloadOtherTabsTitle',
		value: false,
		advanced: true,
	},
	showCurrentUserName: {
		type: 'boolean',
		value: false,
		description: 'accountSwitcherShowCurrentUserNameDesc',
		title: 'accountSwitcherShowCurrentUserNameTitle',
		advanced: true,
	},
	dropDownStyle: {
		type: 'enum',
		values: [{
			name: 'accountSwitcherSnoo',
			value: 'alien',
		}, {
			name: 'accountSwitcherSimpleArrow',
			value: 'arrow',
		}],
		value: 'alien',
		description: 'accountSwitcherDropDownStyleDesc',
		title: 'accountSwitcherDropDownStyleTitle',
		advanced: true,
		bodyClass: true,
	},
	showUserDetails: {
		type: 'boolean',
		value: true,
		description: 'accountSwitcherShowUserDetailsDesc',
		title: 'accountSwitcherShowUserDetailsTitle',
		advanced: true,
	},
	showKarma: {
		type: 'boolean',
		value: true,
		description: 'accountSwitcherShowKarmaDesc',
		title: 'accountSwitcherShowKarmaTitle',
		advanced: true,
		dependsOn: 'showUserDetails',
	},
	showGold: {
		type: 'boolean',
		value: true,
		description: 'accountSwitcherShowGoldDesc',
		title: 'accountSwitcherShowGoldTitle',
		advanced: true,
		dependsOn: 'showUserDetails',
	},
};

let userLink, $downArrow, $downArrowOverlay;

export let $accountMenu;

module.go = () => {
	userLink = document.querySelector('#header-bottom-right > span.user > a');
	if (userLink) {
		userLink.style.marginRight = '2px';
		if (module.options.dropDownStyle.value === 'alien') {
			$downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"></span>');
			$downArrow = $('<span id="RESAccountSwitcherIcon"></span>');
		} else {
			$downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"><span class="downArrow"></span></span>');
			$downArrow = $('<span id="RESAccountSwitcherIcon"><span class="downArrow"></span></span>');
		}
		$downArrowOverlay
			.on('click', () => {
				toggleAccountMenu(false);
				manageAccounts();
			})
			.appendTo(document.body);

		$downArrow.on('click', () => { toggleAccountMenu(true); });

		$(userLink).after($downArrow);

		$accountMenu = $('<ul id="RESAccountSwitcherDropdown" class="RESDropdownList"></ul>');

		const dropdownTimer = _.debounce(() => toggleAccountMenu(false), 1000);
		$accountMenu.add($downArrowOverlay)
			.on('mouseenter', dropdownTimer.cancel)
			.on('mouseleave', dropdownTimer);

		$accountMenu.on('click', '.accountName', function(e: Event) {
			e.preventDefault();
			switchTo($.data(this, 'username'));
		});
		$accountMenu.on('click', '.addAccount', (e: Event) => {
			e.preventDefault();
			toggleAccountMenu(false);
			manageAccounts();
		});

		const loggedIn = loggedInUser();

		const usernamesToDisplay = module.options.accounts.value
			.map(([username]) => username)
			.filter(username => (
				!loggedIn ||
				username.toUpperCase() !== loggedIn.toUpperCase() ||
				module.options.showCurrentUserName.value
			));

		for (const username of usernamesToDisplay) {
			const $accountLink = $('<li>', {
				class: 'accountName',
			});
			// Check if user is logged in before comparing
			if (loggedIn && username.toUpperCase() === loggedIn.toUpperCase()) {
				$accountLink.addClass('active');
			}

			$accountLink.data('username', username)
				.appendTo($accountMenu);
		}

		if (usernamesToDisplay.length) {
			populateUsers();
		}

		$('<li>', {
			class: 'addAccount',
			text: '+ add account',
		}).appendTo($accountMenu);

		$(document.body).append($accountMenu);
	}


	CommandLine.registerCommand(/^sw$/, 'sw [username] - switch users to [username]',
		(command, val) => {
			const found = findMatchingAccount(val, true);
			if (val && found) {
				return `Switch to username: ${found[0]}`;
			} else {
				return 'Switch to username: ...';
			}
		},
		(command, val) => {
			if (!val.length) {
				return 'No username specified.';
			}

			const found = findMatchingAccount(val, true);

			if (found) {
				switchTo(found[0]);
			} else {
				manageAccounts();
			}
		}
	);

	if (module.options.updateOtherTabs.value) {
		window.addEventListener('focus', _onFocus);
	}
};

function populateUsers() {
	$accountMenu.find('.accountName')
		.each((index, ele) => populateUser(ele));
}

async function populateUser(container) {
	const username = $(container).data('username');

	// Ignore "+ add account"
	if (!username) {
		return;
	}

	const $contents = $(document.createDocumentFragment());
	$contents.append(username);

	if (module.options.showUserDetails.value) {
		const { data: userInfo } = await getUserInfo(username);

		// Display the karma of the user
		if (module.options.showKarma.value && userInfo.link_karma !== undefined) {
			const karma = $('<span>').safeHtml(`(${userInfo.link_karma} &middot; ${userInfo.comment_karma})`);
			$contents.append(karma);
		}

		if (module.options.showGold.value && userInfo.is_gold) {
			// If the user has gold display the icon and set the title text to the time remaining till it expires

			const $gilded = $('<span>', { class: 'gilded-icon' });
			if (userInfo.gold_expiration) {
				const today = new Date();
				const expDate = new Date(userInfo.gold_expiration * 1000); // s -> ms
				$gilded.attr('title', `Until ${formatDate(expDate)} (${formatDateDiff(today, expDate)})`);
			}

			$contents.append($gilded);
		}
	}

	$(container).empty().append($contents);
}

function toggleAccountMenu(open) {
	if (open) {
		let thisHeight = 18;
		let thisX, thisY;
		if ($accountMenu.css('position') !== 'fixed') {
			thisX = $(userLink).offset().left;
			thisY = $(userLink).offset().top;
		} else {
			thisX = $('#header-bottom-right').position().left + $(userLink).position().left;
			thisY = $(userLink).position().top;
			if (BetteReddit.module.options.pinHeader.value === 'subanduser') {
				thisHeight += $('#sr-header-area').height();
			} else if (BetteReddit.module.options.pinHeader.value === 'header') {
				thisHeight += $('#sr-header-area').height();
			}
		}
		$accountMenu.css({
			top: `${thisY + thisHeight}px`,
			left: `${thisX}px`,
		});
		$accountMenu.show();
		thisX = $downArrow.offset().left;
		thisY = $downArrow.offset().top;
		$downArrowOverlay.css({
			top: `${thisY - 4}px`,
			left: `${thisX - 3}px`,
		});

		$downArrowOverlay.show();
	} else {
		$accountMenu.hide();
		$downArrowOverlay.hide();
	}
}

export function closeAccountMenu() {
	// this function basically just exists for other modules to call.
	if (!$accountMenu) return;
	$accountMenu.hide();
}

function findMatchingAccount(username, partialMatch) {
	const accounts = module.options.accounts.value;
	const matched = accounts.find(([user]) => user.toUpperCase() === username.toUpperCase());

	if (matched || !partialMatch) {
		return matched;
	}

	return accounts.find(([user]) => user.toUpperCase().startsWith(username.toUpperCase()));
}

async function switchTo(user) {
	const account = findMatchingAccount(user);
	if (!account) return;
	const [username, password] = account;

	// Remove old session cookie (reddit_session)
	// in FF we also need to remove this (secure_session), but it should be safe to remove either way.
	await deleteCookies('reddit_session', 'secure_session');

	const response = await ajax({
		method: 'POST',
		url: '/api/login',
		credentials: true,
		data: {
			user: username,
			passwd: password,
			rem: module.options.keepLoggedIn.value ? 'on' : 'off',
		},
	});

	try {
		JSON.parse(response);
	} catch (error) {
		Notifications.showNotification({
			type: 'error',
			moduleID: 'accountSwitcher',
			message: 'Could not switch accounts. Reddit may be under heavy load. Please try again in a few moments.',
		});
		throw new Error(response);
	}

	if (response.includes('WRONG_PASSWORD')) {
		Alert.open(`
			Could not log in as <b>${username}</b> because either the username or password is wrong.
			<p>Check your settings?</p>
		`, { cancelable: true }).then(manageAccounts);

		switchedAccount(false);
	} else if (response.includes('RATELIMIT')) {
		Alert.open(`
			Could not log in as <b>${username}</b> because reddit is seeing too many requests from you too quickly.
			Perhaps you've been trying to log in using the wrong username or password?
			<p>Check your settings?</p>
		`, { cancelable: true }).then(manageAccounts);

		switchedAccount(false);
	} else {
		switchedAccount(username);
	}
}

function switchedAccount(username) {
	if (module.options.updateOtherTabs.value) {
		switchedAccountElsewhere(username);
	}
	if (username) {
		reloadPage();
	}
}

let _usernameElsewhere;
let _notifiedSwitchedAccount = false;
let _switchedAccountMessage;

const switchedAccountElsewhere = multicast(username => {
	_usernameElsewhere = username;
	if (_switchedAccountMessage) {
		_switchedAccountMessage.close();
	}
	_switchedAccountMessage = undefined;
}, { name: 'switchedAccountElsewhere', local: false });

async function _onFocus() {
	if (_usernameElsewhere === undefined) return;

	const currentUsername = (loggedInUser() || '').toLowerCase();
	if (currentUsername === (_usernameElsewhere || '').toLowerCase()) {
		_notifiedSwitchedAccount = false;
		return;
	}

	if (_notifiedSwitchedAccount) return;
	_notifiedSwitchedAccount = true;

	if (_switchedAccountMessage) {
		_switchedAccountMessage.close();
	}
	_switchedAccountMessage = await _notifySwitchedAccountElsewhere();
}

function _notifySwitchedAccountElsewhere() {
	const username = _usernameElsewhere;

	const hasDraft = Array.from(document.getElementsByTagName('textarea'))
		.some(textarea => textarea.value);

	if (!hasDraft && module.options.reloadOtherTabs.value) {
		reloadPage();
		return;
	}

	let message = username ?
		`You switched to /u/${username}.` :
		'You have been logged out.';

	if (hasDraft) {
		message += ` However, you haven't finished posting on this page as /u/${loggedInUser() || ''}.`;
	}
	message += ` <p><a class="RESNotificationButtonBlue" href="${location.pathname}">reload</a></p>`;

	return Notifications.showNotification({
		moduleID: 'accountSwitcher',
		optionKey: 'updateOtherTabs',
		message,
	});
}

function manageAccounts() {
	SettingsNavigation.loadSettingsPage(module.moduleID, 'accounts');
}

function reloadPage() {
	if ((/^#page=/).test(location.hash)) {
		location.hash = '';
	}
	location.reload();
}
