/* @flow */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

test('switches accounts from old.reddit.com using the www login endpoint', async t => {
	const state = { requests: [], notifications: [], reloads: 0 };
	const { module } = await loadModule(new URL('../accountSwitcher.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../utils': `
			export const Alert = {}, BodyClasses = {};
			export const addFloater = () => {};
			export const formatDate = () => {}, formatDateDiff = () => {}, getUserInfo = () => {};
			export const isLoggedIn = () => true, loggedInUser = () => 'previous-user';
			export const mutex = fn => (...args) => (state.pending = fn(...args));
			export const string = { html: () => ({ addEventListener() {} }) };
		`,
		'../environment': `
			export const ajax = async request => {
				state.requests.push(request);
				if (request.url === '/logout') return '';
				if (new URL(request.url, location.href).hostname === 'old.reddit.com') {
					throw new Error('Login request failed');
				}
				return { success: true };
			};
			export const multicast = fn => fn;
			export const i18n = key => key;
			export const Permissions = {};
		`,
		'./commandLine': 'export const registerCommand = (pattern, help, complete, execute) => { state.complete = complete; state.execute = execute; };',
		'./hover': 'export const dropdownList = () => { const hover = { options: () => hover, populateWith: () => hover, target: () => hover }; return hover; };',
		'./notifications': 'export const showNotification = notification => state.notifications.push(notification);',
		'./settingsNavigation': 'export const open = () => {};',
	}, {
		state,
		process: { env: { BUILD_TARGET: 'chrome' } },
		document: { querySelector: () => null },
		location: { href: 'https://old.reddit.com/r/Enhancement/', reload: () => state.reloads++ },
		history: { pushState: () => {} },
	});
	module.options.accounts.value = [['next-user', 'stored-password', false]];
	module.options.updateOtherTabs.value = false;
	module.contentStart();
	state.complete('sw', 'next-user');
	module.options.keepLoggedIn.value = true;
	state.execute();
	await state.pending;

	t.is(state.requests.length, 2);
	t.is(state.requests[0].url, '/logout');
	t.is(state.requests[1].url, 'https://www.reddit.com/api/login');
	t.is(state.requests[1].method, 'POST');
	t.is(state.requests[1].type, 'json');
	t.deepEqual(state.requests[1].data, { user: 'next-user', passwd: 'stored-password', rem: 'on' });
	t.is(state.reloads, 1);
	t.is(state.notifications.length, 0);
});
