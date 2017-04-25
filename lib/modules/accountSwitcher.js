/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { Alert, formatDate, formatDateDiff, getUserInfo, isLoggedIn, loggedInUser, string } from '../utils';
import { ajax, multicast, i18n } from '../environment';
import * as BetteReddit from './betteReddit';
import * as CommandLine from './commandLine';
import * as Floater from './floater';
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

	userLink = document.querySelector('#header-bottom-right > span.user > a');
	if (userLink) {
		userLink.style.marginRight = '2px';
		$(userLink).after($downArrow);
	} else {
		Floater.addElement($downArrow, { order: 3 });
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

const createAccountMenu = _.once(async () => {
	$accountMenu = $('<ul id="RESAccountSwitcherDropdown" class="RESDropdownList"></ul>')
		.appendTo(document.body);

	const dropdownTimer = _.debounce(() => toggleAccountMenu(false), 1000);
	$accountMenu.add($downArrowOverlay)
		.on('mouseenter', dropdownTimer.cancel)
		.on('mouseleave', dropdownTimer);

	const users = await Promise.all(
		module.options.accounts.value
			.map(async ([username]) => ({
				username,
				active: username.localeCompare(loggedInUser() || '') === 0,
				data: module.options.showUserDetails.value && (await getUserInfo(username).catch(e => {
					console.error('Error loading userinfo for', username, e);
					return {};
				})).data || {},
			}))
	);

	for (const { username, active, data } of users) {
		if (!module.options.showCurrentUserName.value && active) continue;

		const goldExpDate = data.gold_expiration && new Date(data.gold_expiration * 1000);
		const element = string.html`
			<li class="accountName ${active && 'active'}">
				${username}
				${module.options.showKarma.value && data.link_karma && string._html`
					<span>(${data.link_karma} &middot; ${data.comment_karma})</span>
				`}
				${module.options.showGold.value && data.is_gold && string._html`
					<span class="gilded-icon" title="${goldExpDate && i18n('accountSwitcherGoldUntil', formatDate(goldExpDate), formatDateDiff(new Date(), goldExpDate))}">
				`}
				<a onclick="event.stopPropagation()" href="/user/${username}" class="res-icon linkIcon"></a>
			</li>
		`;
		element.addEventListener('click', () => switchTo(username));
		$accountMenu.append(element);
	}

	$('<li>', {
		class: 'addAccount',
		text: '+ add account',
		click: () => {
			toggleAccountMenu(false);
			manageAccounts();
		},
	}).appendTo($accountMenu);
});

function toggleAccountMenu(open) {
	if (open) {
		createAccountMenu();

		let thisHeight = 18;
		let thisX, thisY;
		if (!userLink) {
			// Assumes account switcher button is near top right corner
			const offset = $downArrow.offset();
			thisX = window.innerWidth - $accountMenu.outerWidth() - 15;
			thisY = offset.top;
		} else if ($accountMenu.css('position') !== 'fixed') {
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
	const [username, storedPassword, requiresOtp] = account;

	// Don't await promise yet so that the password and OTP can be entered while logging out
	const logoutPromise = isLoggedIn() && ajax({ method: 'POST', url: '/logout' });

	const password = storedPassword ? storedPassword : window.prompt(i18n('accountSwitcherPasswordPrompt', username));

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
