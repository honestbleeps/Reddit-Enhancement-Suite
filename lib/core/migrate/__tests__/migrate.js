/* @flow */

import test from 'ava';

import { loadModule } from '../../../environment/foreground/__tests__/helpers/loadModule.js';

async function runMigrationsFrom(lastMigratedVersion, initialStorage) {
	const store = { RESOptionsVersion: lastMigratedVersion, ...structuredClone(initialStorage) };
	const chrome = {
		storage: {
			local: {
				get(keys, callback) {
					const result = keys === null ? { ...store } : {};
					if (keys !== null) {
						for (const [key, defaultValue] of Object.entries(keys)) {
							result[key] = Object.hasOwn(store, key) ? structuredClone(store[key]) : defaultValue;
						}
					}
					callback(result);
				},
				set(items, callback) {
					Object.assign(store, structuredClone(items));
					callback();
				},
				remove(keys, callback) {
					for (const key of [].concat(keys)) delete store[key];
					callback();
				},
			},
		},
	};

	const { migrate } = await loadModule(new URL('../migrate.js', import.meta.url), {
		'../utils/api': 'export const apiToPromise = fn => (...args) => new Promise(resolve => fn(...args, resolve));',
		'./messaging': 'export function sendMessage() { throw new Error("unexpected message"); }',
	}, {
		chrome,
		console: { log() {}, warn() {}, error: console.error },
		process: { env: { BUILD_TARGET: 'firefox' } },
		structuredClone,
	});
	await migrate();
	return store;
}

test('removes stored No Participation settings', async t => {
	const store = await runMigrationsFrom('5.24.10-reenable-accountSwitcher', {
		'RESoptions.noParticipation': { escapeNP: { value: false } },
		'RESoptions.notifications': {
			sticky: { value: 'all' },
			notificationTypes: {
				value: [
					['noParticipation-no-participation', false, false],
					['keyboardNav-moveDown', true, true],
					['noParticipation-disableVoteButtons', true, false],
				],
			},
		},
		'RES.modulePrefs': { noParticipation: true, keyboardNav: false },
		'notifications.lastShown': { 'noParticipation-disableVoteButtons': 1, 'keyboardNav-moveDown': 2 },
	});

	t.false(Object.hasOwn(store, 'RESoptions.noParticipation'));
	t.deepEqual(store['RES.modulePrefs'], { keyboardNav: false });
	t.deepEqual(store['RESoptions.notifications'], {
		sticky: { value: 'all' },
		notificationTypes: { value: [['keyboardNav-moveDown', true, true]] },
	});
	t.deepEqual(store['notifications.lastShown'], { 'keyboardNav-moveDown': 2 });
	t.is(store.RESOptionsVersion, '5.26.4-remove-quickMessage');
});

test('leaves storage without No Participation settings untouched', async t => {
	const initialStorage = {
		'RESoptions.notifications': { notificationTypes: { value: [['keyboardNav-moveDown', true, true]] } },
		'RES.modulePrefs': { keyboardNav: false },
	};
	const store = await runMigrationsFrom('5.24.10-reenable-accountSwitcher', initialStorage);

	t.deepEqual(store['RESoptions.notifications'], initialStorage['RESoptions.notifications']);
	t.deepEqual(store['RES.modulePrefs'], initialStorage['RES.modulePrefs']);
	t.false(Object.hasOwn(store, 'notifications.lastShown'));
	t.is(store.RESOptionsVersion, '5.26.4-remove-quickMessage');
});

test('removes stored Quick Message settings', async t => {
	const store = await runMigrationsFrom('5.26.1-remove-noParticipation', {
		'RESoptions.quickMessage': { defaultSubject: { value: 'hi' } },
		'RESoptions.userInfo': { hoverInfo: { value: false }, useQuickMessage: { value: false } },
		'RESoptions.messageMenu': { useQuickMessage: { value: true } },
		'RESoptions.notifications': {
			notificationTypes: {
				value: [
					['quickMessage-quickMessageNoUser', false, false],
					['keyboardNav-moveDown', true, true],
				],
			},
		},
		'RES.modulePrefs': { quickMessage: false, keyboardNav: false },
		'RESmodules.quickMessage.lastSentAs.someone': '/r/something',
		'notifications.lastShown': { 'quickMessage-quickMessageSendError': 1, 'keyboardNav-moveDown': 2 },
	});

	t.false(Object.hasOwn(store, 'RESoptions.quickMessage'));
	t.false(Object.hasOwn(store, 'RESmodules.quickMessage.lastSentAs.someone'));
	t.deepEqual(store['RESoptions.userInfo'], { hoverInfo: { value: false } });
	t.deepEqual(store['RESoptions.messageMenu'], {});
	t.deepEqual(store['RESoptions.notifications'], { notificationTypes: { value: [['keyboardNav-moveDown', true, true]] } });
	t.deepEqual(store['RES.modulePrefs'], { keyboardNav: false });
	t.deepEqual(store['notifications.lastShown'], { 'keyboardNav-moveDown': 2 });
	t.is(store.RESOptionsVersion, '5.26.4-remove-quickMessage');
});

test('leaves storage without Quick Message settings untouched', async t => {
	const initialStorage = {
		'RESoptions.userInfo': { hoverInfo: { value: false } },
		'RESoptions.notifications': { notificationTypes: { value: [['keyboardNav-moveDown', true, true]] } },
		'RES.modulePrefs': { keyboardNav: false },
	};
	const store = await runMigrationsFrom('5.26.1-remove-noParticipation', initialStorage);

	t.deepEqual(store['RESoptions.userInfo'], initialStorage['RESoptions.userInfo']);
	t.deepEqual(store['RESoptions.notifications'], initialStorage['RESoptions.notifications']);
	t.deepEqual(store['RES.modulePrefs'], initialStorage['RES.modulePrefs']);
	t.false(Object.hasOwn(store, 'RESoptions.messageMenu'));
	t.false(Object.hasOwn(store, 'notifications.lastShown'));
	t.is(store.RESOptionsVersion, '5.26.4-remove-quickMessage');
});
