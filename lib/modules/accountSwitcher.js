/* @flow */

import _ from 'lodash';
import { Module } from '../core/module';
import {
	Alert,
	addFloater,
	formatDate,
	formatDateDiff,
	getUserInfo,
	isLoggedIn,
	loggedInUser,
	mutex,
	string,
} from '../utils';
import { ajax, multicast, i18n } from '../environment';
import * as CommandLine from './commandLine';
import * as Hover from './hover';
import * as Notifications from './notifications';
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

const accounts = _.once(() =>
	module.options.accounts.value.reduce((acc, v) => {
		acc[v[0].toLowerCase()] = {
			text: v[0],
			storedPassword: v[1],
			requiresOtp: v[2],
		};
		return acc;
	}, {}),
);

module.contentStart = () => {
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
		addFloater(downArrow, { order: 3 });
	}

	hover = Hover.dropdownList(module.moduleID)
		.options({
			className: 'RESAccountSwitcherDropdown',
			openDelay: 0,
			offsetHeight: 5,
		})
		.populateWith(createAccountMenu)
		.target(downArrow);

	let username;
	CommandLine.registerCommand(/^sw$/, `sw [username] - ${i18n('accountSwitcherCliHelp')}`,
		(command, val) => {
			const usernames = Object.keys(accounts()).filter(username => username.startsWith(val.toLowerCase()));
			username = usernames.includes(val) ? val : usernames[0];
			return `${i18n('accountSwitcherCliSwitchToUsernamePrompt')} ${val}${_.without(usernames, val).length ? `[${usernames.map(v => v.replace(val, '')).filter(Boolean).join('|')}]` : ''}`;
		},
		() => {
			if (username) switchTo(username);
			else manageAccounts();
		},
	);
};

async function createAccountMenu() {
	const accountMenu = document.createDocumentFragment();

	const users = await Promise.all(
		Object.entries(accounts())
			.map(async ([username, { text }]) => ({
				text,
				username,
				active: username.localeCompare(loggedInUser() || '', { sensitivity: 'base' }) === 0,
				data: module.options.showUserDetails.value && (await getUserInfo(username).catch(e => {
					console.error('Error loading userinfo for', username, e);
					return {};
				})).data || {},
			})),
	);

	for (const { text, username, active, data } of users) {
		if (!module.options.showCurrentUserName.value && active) continue;

		const goldExpDate = data.gold_expiration && new Date(data.gold_expiration * 1000);
		const element = string.html`
			<li class="accountName ${active && 'active'}">
				<span style="margin-right: auto;">${text}</span>
				${module.options.showKarma.value && data.link_karma && string._html`
					<span style="margin-left: 4px">(${data.link_karma} &middot; ${data.comment_karma})</span>
				`}
				${module.options.showGold.value && data.is_gold && string._html`
					<span style="all: initial; margin-left: 4px; line-height: 0;" class="gilded-icon" title="${goldExpDate && i18n('accountSwitcherGoldUntil', formatDate(goldExpDate), formatDateDiff(new Date(), goldExpDate))}"></span>
				`}
				<a style="margin-left: 4px" onclick="event.stopPropagation()" href="/user/${username}" class="res-icon linkIcon"></a>
			</li>
		`;
        element.addEventListener('click', () => {
            const oldCursorStyle = document.body.style.cursor;
            document.body.style.cursor = 'wait';
            await switchTo(username).catch(console.error);
            document.body.style.cursor = oldCursorStyle;
        });
		accountMenu.append(element);
	}

	{
		const element = string.html`<li class="addAccount">+ add account</li>`;
		element.addEventListener('click', manageAccounts);
		accountMenu.append(element);
	}

	return [accountMenu];
}

const switchTo = mutex(async (username: string) => {
	const { storedPassword, requiresOtp } = accounts()[username];

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
			moduleID: 'accountSwitcher',
			message: i18n('accountSwitcherAccountSwitchError'),
		});

		throw e;
	});
	
	if (module.options.updateOtherTabs.value) {
		switchedAccountElsewhere(success ? username : null);
	}

	if (success) {
		reloadPage();
	} else {
		// (hackily) try to figure out why login failed
		const jqueryRpc = JSON.stringify(jquery);
		const message =
			(jqueryRpc.includes('PASSWORD') && i18n('accountSwitcherLoginError', username)) ||
			(jqueryRpc.includes('RATELIMIT') && i18n('accountSwitcherRateLimitError')) ||
			i18n('accountSwitcherUnknownError', username, jqueryRpc);
		Alert.open(message, { cancelable: true })
			.then(manageAccounts);
	}
});

const switchedAccountElsewhere = multicast(username => {
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

	Notifications.showNotification({
		moduleID: 'accountSwitcher',
		optionKey: 'updateOtherTabs',
		message,
	});
}, { name: 'switchedAccountElsewhere', local: false, crossContext: false });

function manageAccounts() {
	hover.close();
	SettingsNavigation.open(module.moduleID, 'accounts');
}

function reloadPage() {
	// Create a new history entry, in case the current one contains state data specific to the old user
	history.pushState({}, '');
	location.reload();
}
