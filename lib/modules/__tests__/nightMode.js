/* @flow */

import test from 'ava';
import { getTimes } from 'suncalc';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

function tick() {
	return new Promise(resolve => { setTimeout(resolve, 10); });
}

async function getNightModeState(instant, {
	latitude = 0,
	longitude = 0,
	utcOffset = 0,
	mode = 'automatic',
	start = '20:00',
	end = '6:00',
	systemDark = false,
	overrideStart = null,
	protocol = 'https:',
	waitForToggle = true,
	buildTarget = 'firefox',
} = {}) {
	const currentTime = new Date(instant);
	const states = [];
	const events = [];
	const media = { dark: systemDark, listeners: [] };
	const storage = {
		value: overrideStart,
		get() { return Promise.resolve(this.value); },
		set(value) { this.value = value; return Promise.resolve(); },
		delete() { events.push('clearOverride'); this.value = null; return Promise.resolve(); },
	};
	let reportState;
	const state = new Promise(resolve => { reportState = resolve; });
	const nightMode = await loadModule(new URL('../nightMode.js', import.meta.url), {
		'lodash-es': 'export function pull() {}',
		'../core/module': 'export class Module {}',
		'../core/init': 'export const loadOptions = Promise.resolve();',
		'../core/modules': 'export function isRunning() { return true; }',
		'../core/options': 'export function save(option) { events.push("save:" + option.value); }',
		'../utils': `
			export const HOUR = 3600000;
			export const currentSubreddit = () => '';
			export const appType = () => 'r2';
			export const Alert = {};
			export const BodyClasses = {};
			export const PagePhases = {};
			export function waitForChild() {}
		`,
		'../environment': `
			export const Session = { get: async () => undefined };
			export const Storage = { wrap: () => storage };
			export const Permissions = { request: async perms => { events.push(\`permission:\${perms}\`); } };
			export const i18n = key => key;
		`,
		'./customToggles': `
			export class Toggle {
				onToggle() {}
				onStateChange() {}
				addCLI() {}
				addMenuItem() {}
				toggle(type, enabled) { events.push(\`toggle:\${enabled}\`); reportState({ type, enabled }); }
			}
		`,
	}, {
		reportState,
		events,
		process: { env: { BUILD_TARGET: buildTarget } },
		storage,
		location: { protocol },
		console: { warn() {} },
		Date: class extends Date {
			constructor(value = currentTime) { super(value); }
			static now() { return currentTime.getTime(); }
			getTimezoneOffset() { return -utcOffset; }
		},
		navigator: {
			geolocation: {
				getCurrentPosition(resolve) {
					states.push('geolocation');
					resolve({ coords: { latitude, longitude } });
				},
			},
		},
		window: {
			matchMedia: () => ({
				get matches() { return media.dark; },
				addEventListener(type, listener) { media.listeners.push(listener); },
			}),
		},
	});

	nightMode.module.options.automaticNightMode.value = mode;
	nightMode.module.options.nightModeStart.value = start;
	nightMode.module.options.nightModeEnd.value = end;
	nightMode.module.beforeLoad();
	const result = waitForToggle ? await state : await tick();
	return { ...result, options: nightMode.module.options, geolocationUsed: states.length > 0, nightMode, events, media, storage };
}

test('automatic night mode switches at sunrise and sunset', async t => {
	const { sunrise, sunset } = getTimes(new Date('2026-03-20T12:00:00Z'), 0, 0, 0, 0);
	await Promise.all([
		[new Date(sunrise.getTime() - 1), true],
		[sunrise, false],
		[new Date(sunset.getTime() - 1), false],
		[sunset, true],
	].map(async ([instant, expected]) => {
		const state = await getNightModeState(instant);
		t.is(state.type, 'auto');
		t.is(state.enabled, expected);
		t.true(state.geolocationUsed);
	}));
});

test('automatic night mode handles polar day and polar night in both hemispheres', async t => {
	await Promise.all([
		[69.65, '2026-06-21T12:00:00Z', false],
		[69.65, '2026-12-21T12:00:00Z', true],
		[-77.85, '2026-06-21T12:00:00Z', true],
		[-77.85, '2026-12-21T12:00:00Z', false],
	].map(async ([latitude, instant, expected]) => {
		const state = await getNightModeState(instant, { latitude });
		t.is(state.enabled, expected);
	}));
});

test('automatic night mode uses the civil day near the date line', async t => {
	await Promise.all([
		['2026-03-19T13:00:00Z', -41.29, 174.78, 780, true],
		['2026-03-19T23:00:00Z', -41.29, 174.78, 780, false],
		['2026-03-20T09:00:00Z', -41.29, 174.78, 780, true],
		['2026-03-20T12:00:00Z', 21.31, -157.86, -600, true],
		['2026-03-20T22:00:00Z', 21.31, -157.86, -600, false],
		['2026-03-21T08:00:00Z', 21.31, -157.86, -600, true],
	].map(async ([instant, latitude, longitude, utcOffset, expected]) => {
		const state = await getNightModeState(instant, { latitude, longitude, utcOffset });
		t.is(state.enabled, expected, `${instant}`);
	}));
});

test('user-defined schedules still support overnight and daytime intervals', async t => {
	await Promise.all([
		['20:00', '6:00', '03', true],
		['20:00', '6:00', '12', false],
		['20:00', '6:00', '21', true],
		['6:00', '20:00', '03', false],
		['6:00', '20:00', '12', true],
		['6:00', '20:00', '21', false],
	].map(async ([start, end, hour, expected]) => {
		const state = await getNightModeState(new Date(2026, 2, 20, Number(hour)), { mode: 'user', start, end });
		t.is(state.enabled, expected);
		t.false(state.geolocationUsed);
	}));
});

test('system night mode does not request geolocation', async t => {
	await Promise.all([false, true].map(async systemDark => {
		const state = await getNightModeState('2026-03-20T12:00:00Z', { mode: 'system', systemDark });
		t.is(state.enabled, systemDark);
		t.false(state.geolocationUsed);
	}));
});

test('system night mode follows live color scheme changes', async t => {
	const { media, events } = await getNightModeState(Date.now(), { mode: 'system', systemDark: false });
	t.deepEqual(events, ['toggle:false']);
	media.dark = true;
	for (const listener of media.listeners) listener();
	await tick();
	t.deepEqual(events, ['toggle:false', 'toggle:true']);
});

test('saving a schedule clears a manual override and applies it immediately', async t => {
	const now = new Date(2026, 2, 20, 21).getTime();
	const { nightMode, events, storage } = await getNightModeState(now, {
		mode: 'none',
		overrideStart: now,
		waitForToggle: false,
	});
	t.deepEqual(events, []);

	nightMode.module.options.automaticNightMode.value = 'user';
	nightMode.module.onSaveSettings({ automaticNightMode: { value: 'user' } });
	await tick();
	t.deepEqual(events, ['clearOverride', 'toggle:true']);
	t.is(storage.value, null);

	nightMode.module.onSaveSettings({ coloredLinks: { value: true } });
	await tick();
	t.deepEqual(events, ['clearOverride', 'toggle:true']);
});

test('saving automatic mode in an extension page requests the geolocation permission', async t => {
	const { nightMode, events } = await getNightModeState(Date.now(), {
		mode: 'none',
		protocol: 'chrome-extension:',
		waitForToggle: false,
	});
	nightMode.module.options.automaticNightMode.value = 'automatic';
	nightMode.module.onSaveSettings({ automaticNightMode: { value: 'automatic' } });
	await tick();
	t.is(events[0], 'permission:geolocation');
	t.true(events.includes('clearOverride'));
});

test('automatic night mode is not offered in Chrome builds', async t => {
	const { options } = await getNightModeState(Date.now(), { mode: 'none', buildTarget: 'chrome', waitForToggle: false });
	t.false(options.automaticNightMode.values.some(({ value }) => value === 'automatic'));
	t.is(options.automaticNightMode.description, 'nightModeAutomaticNightModeDescNoGeolocation');

	const firefox = await getNightModeState(Date.now(), { mode: 'none', waitForToggle: false });
	t.true(firefox.options.automaticNightMode.values.some(({ value }) => value === 'automatic'));
});

test('saved automatic night mode is disabled in Chrome builds without using geolocation', async t => {
	const state = await getNightModeState(Date.now(), { mode: 'automatic', buildTarget: 'chrome', waitForToggle: false });
	t.is(state.options.automaticNightMode.value, 'none');
	t.deepEqual(state.events, ['save:none']);
	t.false(state.geolocationUsed);
});
