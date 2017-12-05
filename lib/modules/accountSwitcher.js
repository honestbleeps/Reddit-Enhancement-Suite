/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { Alert, formatDate, formatDateDiff, getUserInfo, loggedInUser } from '../utils';
import { ajax, multicast, i18n } from '../environment';
import * as BetteReddit from './betteReddit';
import * as CommandLine from './commandLine';
import * as Notifications from './notifications';
import * as NeverEndingReddit from './neverEndingReddit';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('accountSwitcher');

module.moduleName = 'accountSwitcherName';
module.category = 'myAccountCategory';
module.description = 'accountSwitcherDesc';
module.options = {
	keepLoggedIn: {
		type: 'boolean',
		value: false,
		description: 'accountSwitcherKeepLoggedInDesc',
		title: 'accountSwitcherKeepLoggedInTitle',
		keywords: ['remember'],
	},
	accounts: {
		type: 'table',
		addRowText: 'accountSwitcherAddAccount',
		fields: [{
			key: 'username',
			name: 'accountSwitcherUsername',
			type: 'text',
		}, {
			key: 'password',
			name: 'accountSwitcherPassword',
			type: 'password',
		}, {
			key: '2fa',
			name: 'accountSwitcherRequiresOtp',
			type: 'boolean',
			value: false,
		}],
		value: ([]: Array<[string, string, boolean]>),
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
		dependsOn: options => options.showUserDetails.value,
	},
	showGold: {
		type: 'boolean',
		value: true,
		description: 'accountSwitcherShowGoldDesc',
		title: 'accountSwitcherShowGoldTitle',
		advanced: true,
		dependsOn: options => options.showUserDetails.value,
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


	CommandLine.registerCommand(/^sw$/, `sw [username] - ${i18n('accountSwitcherCliHelp')}`,
		(command, val) => {
			const found = findMatchingAccount(val, true);
			if (val && found) {
				return i18n('accountSwitcherCliSwitchToUsernamePrompt', found[0]);
			} else {
				return i18n('accountSwitcherCliSwitchToUsernamePrompt', '...');
			}
		},
		(command, val) => {
			if (!val.length) {
				return i18n('accountSwitcherCliNoUsername');
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
		const { data: userInfo } = await getUserInfo(username).catch(e => {
			console.error('Error loading userinfo for', username, e);
			return { data: {} };
		});

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
				$gilded.attr('title', i18n('accountSwitcherGoldUntil', formatDate(expDate), formatDateDiff(today, expDate)));
			}

			$contents.append($gilded);
		}

		// Append link to profile page
		$contents.append($('<a>', { href: `/user/${username}`, class: 'res-icon linkIcon' }).on('click', (e: Event) => e.stopPropagation()));
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
	const [username, password, requiresOtp] = account;

	// Don't await promise yet so that the OTP can be entered while logging out
	const logoutPromise = loggedInUser() && ajax({ method: 'POST', url: '/logout' });

	let otp;
	if (requiresOtp) {
		otp = {
			otp: window.prompt(i18n('accountSwitcherOptPrompt', username)),
		};
	}

	await logoutPromise;

	const { success, jquery } = await ajax({
		method: 'POST',
		url: '/api/login',
		data: {
			user: username,
			passwd: password,
			...otp,
			rem: module.options.keepLoggedIn.value ? 'on' : 'off',
		},
		type: 'json',
	}).catch(e => {
		Notifications.showNotification({
			type: 'error',
			moduleID: 'accountSwitcher',
			message: i18n('accountSwitcherAccountSwitchError'),
		});
		throw e;
	});

	if (success) {
		switchedAccount(username);
	} else {
		switchedAccount(false);
		// (hackily) try to figure out why login failed
		const jqueryRpc = JSON.stringify(jquery);
		if (jqueryRpc.includes('PASSWORD')) {
			Alert.open(i18n('accountSwitcherLoginError', username), { cancelable: true })
				.then(manageAccounts);
		} else if (jqueryRpc.includes('RATELIMIT')) {
			Alert.open(i18n('accountSwitcherRateLimitError', username), { cancelable: true })
				.then(manageAccounts);
		} else {
			Alert.open(i18n('accountSwitcherUnknownError', username, jqueryRpc), { cancelable: true })
				.then(manageAccounts);
		}
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
}, { name: 'switchedAccountElsewhere', local: false, crossContext: false });

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
		i18n('accountSwitcherUserSwitched', username) :
		i18n('accountSwitcherLoggedOut');

	if (hasDraft) {
		message += ` ${i18n('accountSwitcherDraft', loggedInUser() || '')}`;
	}
	message += ` <p><a class="RESNotificationButtonBlue" href="${location.pathname}">${i18n('accountSwitcherReload')}</a></p>`;

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
	NeverEndingReddit.resetReturnToPage();
	location.reload();
}
