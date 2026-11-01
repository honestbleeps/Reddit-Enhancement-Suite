/* @flow */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

async function runUpdate({ from, to, isBeta = false, options = {} }) {
	const events = [];
	const state = { events, from, to, isBeta };

	const { module } = await loadModule(new URL('../onboarding.js', import.meta.url), {
		'../core/module': `
			export class Module {
				constructor(moduleID) { this.moduleID = moduleID; }
			}
		`,
		'../core/metadata': `
			const { to, isBeta } = globalThis.__onboardingTest;
			export const version = to;
			export { isBeta };
			export const updatedURL = 'https://example.com/release';
		`,
		'../environment': `
			const state = globalThis.__onboardingTest;
			export const Storage = {
				wrap: () => ({
					get: async () => state.from,
					set: () => {},
				}),
			};
			export const openNewTab = () => { state.events.push('tab'); };
			export const i18n = key => key;
		`,
		'./notifications': `
			export const showNotification = () => { globalThis.__onboardingTest.events.push('popup'); };
		`,
	}, { __onboardingTest: state, console: { log() {} } });

	for (const [key, value] of Object.entries(options)) {
		module.options[key].value = value;
	}
	await module.go();
	return events;
}

test('stable releases use only the matching update setting', async t => {
	t.deepEqual(await runUpdate({ from: '5.24.0', to: '5.26.0', options: { updateNotification: 'notification' } }), ['popup']);
	t.deepEqual(await runUpdate({ from: '5.24.0', to: '5.26.0', options: { updateNotification: 'releaseNotes' } }), ['tab']);
	t.deepEqual(await runUpdate({ from: '5.24.0', to: '5.26.0', options: { updateNotification: 'nothing' } }), []);
	t.deepEqual(await runUpdate({ from: '5.26.1', to: '5.26.2', options: { patchUpdateNotification: 'notification', updateNotification: 'releaseNotes' } }), ['popup']);
	t.deepEqual(await runUpdate({ from: '5.26.1', to: '5.26.2', options: { patchUpdateNotification: 'releaseNotes' } }), ['tab']);
	t.deepEqual(await runUpdate({ from: '5.26.1', to: '5.26.2', options: { patchUpdateNotification: 'none' } }), []);
});

test('beta releases use only the beta update setting', async t => {
	t.deepEqual(await runUpdate({ from: '5.24.0', to: '5.25.0', isBeta: true, options: { betaUpdateNotification: 'notification', updateNotification: 'releaseNotes' } }), ['popup']);
	t.deepEqual(await runUpdate({ from: '5.25.0', to: '5.25.1', isBeta: true, options: { betaUpdateNotification: 'none', patchUpdateNotification: 'releaseNotes' } }), []);
	t.deepEqual(await runUpdate({ from: '5.25.0', to: '5.25.1', isBeta: true, options: { betaUpdateNotification: 'releaseNotes', patchUpdateNotification: 'notification' } }), ['tab']);
});

test('no notification on first install or downgrade', async t => {
	t.deepEqual(await runUpdate({ from: null, to: '5.26.0' }), []);
	t.deepEqual(await runUpdate({ from: '5.26.2', to: '5.26.1' }), []);
});
