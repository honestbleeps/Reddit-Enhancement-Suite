/* @flow */

import test from 'ava';

import { loadModule } from './helpers/loadModule.js';

async function createNavigation() {
	const listeners = new Set();
	const timers = new Map();
	const frames = [];
	const openedTabs = [];
	const menuCallbacks = [];
	let timerID = 0;
	const origin = 'https://extension.example';
	const window = {
		addEventListener: (type, listener) => listeners.add(listener),
		removeEventListener: (type, listener) => listeners.delete(listener),
	};
	window.top = window;
	const navigation = await loadModule(new URL('../../../modules/settingsNavigation.js', import.meta.url), {
		'../constants/urlHashes': 'export const RES_SETTINGS_HASH = "#res:settings";',
		'../environment': `
			export const context = { origin: 'https://old.reddit.com' };
			export const isOptionsPage = () => false;
			export const getOptionsURL = (hash = '') => new URL('https://extension.example/options.html' + hash);
			export const i18n = key => key;
			export const openNewTab = (...args) => openedTabs.push(args);
		`,
		'../utils': 'export const string = {};',
		'../core/module': 'export class Module {}',
		'../core/modules': 'export const all = () => []; export const getUnchecked = () => undefined;',
		'../modules/menu': 'export const addMenuItem = (render, callback) => menuCallbacks.push(callback);',
		'../modules/commandLine': 'export const registerCommand = () => {};',
	}, {
		window,
		openedTabs,
		menuCallbacks,
		console: { warn() {} },
		location: { href: 'https://old.reddit.com/', pathname: '/', search: '' },
		setTimeout(callback) {
			const id = ++timerID;
			timers.set(id, callback);
			return id;
		},
		clearTimeout: id => timers.delete(id),
		document: {
			createElement() {
				const messages = [];
				return {
					messages,
					contentWindow: { postMessage: (...args) => messages.push(args) },
					addEventListener(type, callback) { this[type] = callback; },
					remove() {},
				};
			},
			body: {
				append: frame => frames.push(frame),
				classList: { add() {}, remove() {} },
			},
		},
	});

	return {
		navigation,
		frames,
		timers,
		listeners,
		openedTabs,
		menuCallbacks,
		dispatch(frame, data, messageOrigin = origin) {
			for (const listener of listeners) listener({ source: frame.contentWindow, origin: messageOrigin, data });
		},
		expire() {
			const callbacks = [...timers.values()];
			timers.clear();
			for (const callback of callbacks) callback();
		},
	};
}

test('default settings menu navigation omits a missing module ID', async t => {
	const page = await createNavigation();
	page.navigation.module.beforeLoad();
	page.navigation.open('search');
	page.menuCallbacks[0]({ target: { getAttribute: () => null } });

	const [message, targetOrigin] = page.frames[0].messages[0];
	t.is(message.load.moduleID, undefined);
	t.is(message.load.optionKey, undefined);
	t.is(targetOrigin, 'https://extension.example');
});

test('closing settings cancels the old watchdog and removes its message listener', async t => {
	const page = await createNavigation();
	page.navigation.open('about');
	page.frames[0].load();
	t.is(page.timers.size, 1);
	page.navigation.close();
	t.is(page.timers.size, 0);
	t.is(page.listeners.size, 0);
	page.navigation.open('search');
	page.expire();
	t.is(page.openedTabs.length, 0);
	t.is(page.frames.length, 2);
});

test('only the current frame at the expected origin can cancel the watchdog', async t => {
	const page = await createNavigation();
	page.navigation.open('about');
	page.frames[0].load();
	page.navigation.close();
	page.navigation.open('search');
	page.frames[1].load();
	page.dispatch(page.frames[0], { loadSuccess: true });
	page.dispatch(page.frames[1], { loadSuccess: true }, 'https://example.com');
	page.dispatch(page.frames[1], null);
	t.is(page.timers.size, 1);
	page.dispatch(page.frames[1], { loadSuccess: true });
	t.is(page.timers.size, 0);
	page.expire();
	t.is(page.openedTabs.length, 0);
});

test('frame reload replaces the watchdog without accumulating listeners', async t => {
	const page = await createNavigation();
	page.navigation.open('search');
	page.frames[0].load();
	page.frames[0].load();
	t.is(page.timers.size, 1);
	t.is(page.listeners.size, 1);
	page.expire();
	t.is(page.openedTabs.length, 1);
	t.is(page.listeners.size, 0);
	t.is(page.timers.size, 0);
});
