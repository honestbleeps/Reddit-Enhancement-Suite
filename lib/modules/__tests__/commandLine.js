/* @flow */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

function tick() {
	return new Promise(resolve => { setTimeout(resolve, 10); });
}

function fakeElement() {
	const listeners = {};
	return {
		listeners,
		hidden: true,
		value: '',
		innerHTML: '',
		addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
		dispatchEvent(event) { for (const fn of listeners[event.type] || []) fn(event); },
		focus() {},
		blur() {},
	};
}

async function loadCommandLine() {
	const elements = {
		'#keyCommandInput': fakeElement(),
		'#keyCommandInputTip': fakeElement(),
		'#keyCommandInputError': fakeElement(),
		'#keyCommandForm': fakeElement(),
	};
	const widget = { ...fakeElement(), querySelector: selector => elements[selector] };
	const location = { href: '/start' };
	const storageCalls = [];
	const commandLine = await loadModule(new URL('../commandLine.js', import.meta.url), {
		dompurify: 'export default { sanitize: s => String(s) };',
		'lodash-es': 'export function once(fn) { let r, done; return () => (done ? r : (done = true, r = fn())); }',
		'../core/module': 'export class Module {}',
		'../utils': `
			export const NAMED_KEYS = { Enter: 'Enter', Escape: 'Escape' };
			export const Alert = { open() {} };
			export const string = { html: () => widget, encode: (s, ...v) => String.raw(s, ...v), escape: (s, ...v) => String.raw(s, ...v) };
			export const downcast = x => x;
			export const empty = el => { el.innerHTML = ''; };
			export const currentMultireddit = () => null;
			export const currentSubreddit = () => null;
			export const currentUserProfile = () => null;
			export const loggedInUser = () => null;
		`,
		'../environment': `
			export const XhrCache = {};
			export const ajax = () => Promise.resolve({});
			export const openNewTab = () => {};
			export const Storage = new Proxy({}, { get: (t, k) => (...args) => { storageCalls.push(k); return Promise.resolve(); } });
		`,
		'./menu': 'export function addMenuItem() {}',
	}, {
		widget,
		location,
		storageCalls,
		document: { body: { append() {} }, addEventListener() {} },
		HTMLInputElement: Object,
		Event: class { constructor(type) { this.type = type; } },
	});

	async function submit(value, isTrusted) {
		commandLine.open(value);
		elements['#keyCommandForm'].dispatchEvent({ type: 'keydown', key: 'Enter', isTrusted, shiftKey: false });
		await tick();
	}

	return { submit, location, storageCalls, error: elements['#keyCommandInputError'] };
}

test('trusted Enter executes commands', async t => {
	const { submit, location } = await loadCommandLine();
	await submit('m', true);
	t.is(location.href, '/message/inbox/');
});

test('synthetic Enter does not execute commands', async t => {
	const { submit, location } = await loadCommandLine();
	await submit('m', false);
	t.is(location.href, '/start');
});

test('raw extension storage commands are not available', async t => {
	const { submit, storageCalls, error } = await loadCommandLine();
	await submit('RESStorage get RESoptions.accountSwitcher', true);
	t.deepEqual(storageCalls, []);
	t.is(error.innerHTML, 'unknown command - type ? for help');
});
