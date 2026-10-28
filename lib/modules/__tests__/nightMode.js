/* @flow */

import test from 'ava';
import { getTimes } from 'suncalc';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

async function getNightModeState(instant, {
	latitude = 0,
	longitude = 0,
	utcOffset = 0,
	mode = 'automatic',
	start = '20:00',
	end = '6:00',
	systemDark = false,
} = {}) {
	const currentTime = new Date(instant);
	const states = [];
	let reportState;
	const state = new Promise(resolve => { reportState = resolve; });
	const nightMode = await loadModule(new URL('../nightMode.js', import.meta.url), {
		'lodash-es': 'export function pull() {}',
		'../core/module': 'export class Module {}',
		'../core/init': 'export const loadOptions = Promise.resolve();',
		'../core/modules': 'export function isRunning() { return true; }',
		'../core/options': 'export function save() {}',
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
			export const Storage = { wrap: () => ({ get: async () => null }) };
			export const i18n = key => key;
		`,
		'./customToggles': `
			export class Toggle {
				onToggle() {}
				onStateChange() {}
				addCLI() {}
				addMenuItem() {}
				toggle(type, enabled) { reportState({ type, enabled }); }
			}
		`,
	}, {
		reportState,
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
		window: { matchMedia: () => ({ matches: systemDark }) },
	});

	nightMode.module.options.automaticNightMode.value = mode;
	nightMode.module.options.nightModeStart.value = start;
	nightMode.module.options.nightModeEnd.value = end;
	nightMode.module.beforeLoad();
	return { ...await state, geolocationUsed: states.length > 0 };
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
