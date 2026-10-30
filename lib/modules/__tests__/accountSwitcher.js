/* @flow */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

async function setup({ hostname = 'old.reddit.com', loggedIn = true, requiresOtp = false, storedPassword = 'stored-password', loginError = false, buildTarget = 'chrome' } = {}) {
	const state = { requests: [], notifications: [], prompts: [], reloads: 0, permissions: 0 };
	const { module } = await loadModule(new URL('../accountSwitcher.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../utils': `
			export const Alert = {}, BodyClasses = {};
			export const addFloater = () => {};
			export const formatDate = () => {}, formatDateDiff = () => {}, getUserInfo = () => {};
			export const isLoggedIn = () => loggedIn, loggedInUser = () => 'previous-user';
			export const mutex = fn => (...args) => (state.pending = fn(...args));
			export const string = { html: () => ({ addEventListener() {} }) };
		`,
		'../environment': `
			export const ajax = async request => {
				state.requests.push(request);
				if (request.url === '/logout') return '';
				if (loginError || new URL(request.url, location.href).hostname === 'old.reddit.com') {
					throw new Error('Login request failed');
				}
				return { success: true };
			};
			export const multicast = fn => fn;
			export const i18n = key => key;
			export const Permissions = { requestDataCollection: async () => { state.permissions++; } };
		`,
		'./commandLine': 'export const registerCommand = (pattern, help, complete, execute) => { state.complete = complete; state.execute = execute; };',
		'./hover': 'export const dropdownList = () => { const hover = { options: () => hover, populateWith: () => hover, target: () => hover }; return hover; };',
		'./notifications': 'export const showNotification = notification => state.notifications.push(notification);',
		'./settingsNavigation': 'export const open = () => {};',
	}, {
		state,
		loggedIn,
		loginError,
		process: { env: { BUILD_TARGET: buildTarget } },
		document: { querySelector: () => null },
		window: { prompt: message => {
			state.prompts.push(message);
			return message === 'accountSwitcherPasswordPrompt' ? 'prompted-password' : '123456';
		} },
		location: { href: `https://${hostname}/r/Enhancement/`, reload: () => state.reloads++ },
		history: { pushState: () => {} },
	});
	module.options.accounts.value = [['next-user', storedPassword, requiresOtp]];
	module.options.updateOtherTabs.value = false;
	module.contentStart();
	state.complete('sw', 'next-user');
	return { state, module, switchAccount: () => { state.execute(); return state.pending; } };
}

for (const hostname of ['old.reddit.com', 'www.reddit.com', 'new.reddit.com', 'en.reddit.com']) {
	test(`switches accounts from ${hostname} using the www login endpoint`, async t => {
		const { state, module, switchAccount } = await setup({ hostname });
		module.options.keepLoggedIn.value = true;
		await switchAccount();

		t.is(state.requests.length, 2);
		t.is(state.requests[0].url, '/logout');
		t.is(state.requests[1].url, 'https://www.reddit.com/api/login');
		t.is(state.requests[1].method, 'POST');
		t.is(state.requests[1].type, 'json');
		t.deepEqual(state.requests[1].data, { user: 'next-user', passwd: 'stored-password', rem: 'on' });
		t.is(state.reloads, 1);
		t.is(state.notifications.length, 0);
	});
}

test('logs in from old Reddit without an existing session, with a prompted password and OTP', async t => {
	const { state, switchAccount } = await setup({ loggedIn: false, storedPassword: '', requiresOtp: true, buildTarget: 'firefox' });
	await switchAccount();

	t.is(state.requests.length, 1);
	t.is(state.requests[0].url, 'https://www.reddit.com/api/login');
	t.deepEqual(state.requests[0].data, { user: 'next-user', passwd: 'prompted-password', otp: '123456', rem: 'off' });
	t.deepEqual(state.prompts, ['accountSwitcherPasswordPrompt', 'accountSwitcherOptPrompt']);
	t.is(state.permissions, 1);
	t.is(state.reloads, 1);
});

test('reports a failed login without reloading the logged-out page', async t => {
	const { state, switchAccount } = await setup({ loginError: true });
	await t.throwsAsync(switchAccount, { message: 'Login request failed' });

	t.is(state.reloads, 0);
	t.is(state.notifications.length, 1);
	t.is(state.notifications[0].message, 'accountSwitcherAccountSwitchError');
});
