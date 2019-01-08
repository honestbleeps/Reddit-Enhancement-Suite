/* @flow */

import { Module } from '../core/module';
import { Alert, formatDate, formatDateDiff, getUserInfo, isLoggedIn, loggedInUser, string } from '../utils';
import { ajax, multicast, i18n } from '../environment';
import * as CommandLine from './commandLine';
import * as Hover from './hover';
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

let hover;

module.go = () => {
	const downArrow = module.options.dropDownStyle.value === 'alien' ?
		string.html`<span id="RESAccountSwitcherIcon"></span>` :
		string.html`<span id="RESAccountSwitcherIcon"><span class="downArrow"></span></span>`;
	downArrow.addEventListener('click', () => hover.begin());
	downArrow.addEventListener('dblclick', manageAccounts);

	const userLink = document.querySelector('#header-bottom-right > span.user > a');
	if (userLink) {
		userLink.style.marginRight = '2px';
		userLink.after(downArrow);
	} else {
		Floater.addElement(downArrow, { order: 3 });
	}

	hover = Hover.dropdownList(module.moduleID)
		.options({
			className: 'RESAccountSwitcherDropdown',
			openDelay: 0,
			offsetHeight: 5,
		})
		.populateWith(createAccountMenu)
		.target(downArrow);

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

async function createAccountMenu() {
	const accountMenu = document.createDocumentFragment();

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
				<span style="margin-right: auto;">${username}</span>
				${module.options.showKarma.value && data.link_karma && string._html`
					<span style="margin-left: 4px">(${data.link_karma} &middot; ${data.comment_karma})</span>
				`}
				${module.options.showGold.value && data.is_gold && string._html`
					<span style="all: initial; margin-left: 4px; line-height: 0;" class="gilded-icon" title="${goldExpDate && i18n('accountSwitcherGoldUntil', formatDate(goldExpDate), formatDateDiff(new Date(), goldExpDate))}"></span>
				`}
				<a style="margin-left: 4px" onclick="event.stopPropagation()" href="/user/${username}" class="res-icon linkIcon"></a>
			</li>
		`;
		element.addEventListener('click', () => switchTo(username));
		accountMenu.append(element);
	}

	{
		const element = string.html`<li class="addAccount">+ add account</li>`;
		element.addEventListener('click', manageAccounts);
		accountMenu.append(element);
	}

	return [accountMenu];
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
		const message =
			(jqueryRpc.includes('PASSWORD') && i18n('accountSwitcherLoginError', username)) ||
			(jqueryRpc.includes('RATELIMIT') && i18n('accountSwitcherRateLimitError')) ||
			i18n('accountSwitcherUnknownError', username, jqueryRpc);
		Alert.open(message, { cancelable: true })
			.then(manageAccounts);
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
	hover.close();
	SettingsNavigation.open(module.moduleID, 'accounts');
}

function reloadPage() {
	NeverEndingReddit.resetReturnToPage();
	location.reload();
}
