/* @flow */

import testTemplate from '../templates/test.mustache';
import { MODULE_PROFILING_KEY, PERF_PROFILING_KEY, RES_DISABLED_KEY } from '../constants/sessionStorage';
import { Module } from '../core/module';
import { Alert } from '../utils';
import { Session, Storage, XhrCache, i18n, isPrivateBrowsing, multicast } from '../environment';
import * as Notifications from './notifications';
import * as UserTagger from './userTagger';

export const module: Module<*> = new Module('troubleshooter');

module.moduleName = 'troubleshooterName';
module.alwaysEnabled = true;
module.sort = -7;
module.description = 'Resolve common problems and clean/clear unwanted settings data.<br/><br/>' +
	'Your first line of defence against browser crashes/updates, or potential issues with RES, is a frequent backup.<br/><br/>' +
	'See <a href="/r/Enhancement/wiki/backing_up_res_settings">here</a> for details on backing up your RES settings.';
module.category = 'aboutCategory';
module.options = {
	clearCache: {
		type: 'button',
		text: 'Clear',
		callback: clearCache,
		description: 'Clear your RES cache and session. This includes the "My Subreddits" dropdown and cached user or subreddit info.',
	},
	clearTags: {
		type: 'button',
		text: 'Clear',
		callback: clearTags,
		description: 'Remove all entries for users with between +1 and -1 vote tallies (only non-tagged users).',
	},
	resetToFactory: {
		type: 'button',
		text: 'Reset',
		callback: resetToFactory,
		description: 'Warning: This will remove all your RES settings, including tags, saved comments, filters etc!',
	},
	disableRES: {
		type: 'button',
		text: 'Disable',
		callback: disableRES,
		description: `
			Reloads the page and disables RES for this tab <i>only</i>. RES will still be enabled
			in any other reddit tabs or windows you currently have open or open after this. This feature can be
			used for troubleshooting, as well as to quickly hide usernotes, vote counts, subreddit shortcuts,
			and other RES data for clean screenshotting.
		`,
	},
	profileStartup: {
		type: 'button',
		text: 'Enable',
		callback: enablePerfProfiling,
		description: 'Reloads the page and profiles startup time. Future reloads in the current tab only will also be profiled.',
	},
	profileModules: {
		type: 'button',
		text: 'Enable',
		callback: enableModuleProfiling,
		description: 'Reloads the page and profiles the duration of each module stage (in the console). Future reloads in the current tab only will also be profiled.',
	},
	breakpoint: {
		type: 'button',
		text: 'Pause JavaScript',
		callback() {
			debugger; // eslint-disable-line no-debugger
		},
		description: 'Pause JavaScript execution to allow debugging',
	},
	testTemplates: {
		type: 'button',
		text: 'Test templates',
		callback: testTemplates,
		description: 'Test rendering templates (and notifications).',
	},
	testEnvironment: {
		type: 'button',
		text: 'Test environment',
		callback: testEnvironment,
		description: 'A few environment/browser specific tests',
	},
};

function clearCache() {
	XhrCache.clear();
	Session.clear();
	Notifications.showNotification(i18n('troubleshooterCachesCleared'), 2500);
}

async function clearTags() {
	const confirm = window.confirm(i18n('troubleshooterAreYouPositive'));
	if (confirm) {
		const tags = await UserTagger.tagStorage.get();
		if (tags) {
			let cnt = 0;
			for (const i in tags) {
				if ((tags[i].votes === 1 || tags[i].votes === 0 || tags[i].votes === -1) && !tags[i].hasOwnProperty('tag')) {
					delete tags[i];
					cnt += 1;
				}
			}
			UserTagger.tagStorage.set(tags);
			Notifications.showNotification(i18n('troubleshooterEntriesRemoved', cnt), 2500);
		}
	} else {
		Notifications.showNotification(i18n('troubleshooterNoActionTaken'), 2500);
	}
}

function resetToFactory() {
	const confirm = window.prompt(i18n('troubleshooterThisWillKillYourSettings', 'trash'));
	if (confirm === 'trash' || confirm === '"trash"') {
		clearCache();
		Storage.clear();
		Notifications.showNotification(i18n('troubleshooterSettingsReset'), 2500);
	} else {
		Notifications.showNotification(i18n('troubleshooterNoActionTaken'), 2500);
	}
}

function disableRES() {
	sessionStorage.setItem(RES_DISABLED_KEY, 'true');
	window.location.reload();
}

function enablePerfProfiling() {
	sessionStorage.setItem(PERF_PROFILING_KEY, 'true');
	location.hash = '';
	location.reload();
}

function enableModuleProfiling() {
	sessionStorage.setItem(MODULE_PROFILING_KEY, 'true');
	location.hash = '';
	location.reload();
}

function testTemplates() {
	const templateText = testTemplate({ name: 'FakeUsername' });
	console.log(templateText);

	Notifications.showNotification({
		moduleID: module.moduleID,
		header: 'Template test',
		message: templateText,
	});
}

const testMulticast = multicast(val => {
	Alert.open(`Multicast: ${val}`);
}, { name: 'testMulticast', local: false });

async function testEnvironment() {
	const testKey = '__test__';
	const rows = [];

	try {
		let rand;

		rows.push(`Private browsing: ${await isPrivateBrowsing()}`, '');

		rand = Math.random();
		rows.push(`Sending multicast: ${rand}`, '');
		testMulticast(rand);

		rand = Math.random();
		rows.push(`Storage.set(): ${rand}`);
		Storage.set(testKey, rand);
		rows.push(`Storage.get(): ${(await Storage.get(testKey): any)}`);
		rows.push(`Storage.has(): ${(await Storage.has(testKey): any)}`);
		rows.push('Storage.delete()');
		Storage.delete(testKey);
		rows.push(`Storage.get(): ${(await Storage.get(testKey): any)}`);
		rows.push(`Storage.has(): ${(await Storage.has(testKey): any)}`, '');

		rand = Math.random();
		rows.push(`Session.set(): ${rand}`);
		Session.set(testKey, rand);
		rows.push(`Session.get(): ${(await Session.get(testKey): any)}`);
		rows.push(`Session.has(): ${(await Session.has(testKey): any)}`);
		rows.push('Session.delete()');
		Session.delete(testKey);
		rows.push(`Session.get(): ${(await Session.get(testKey): any)}`);
		rows.push(`Session.has(): ${(await Session.has(testKey): any)}`, '');

		rand = Math.random();
		const wrapped = Storage.wrap(testKey, 'default');
		rows.push(`wrapped.set(): ${rand}`);
		wrapped.set(rand);
		rows.push(`wrapped.get(): ${(await wrapped.get(): any)}`);
		rows.push(`wrapped.has(): ${(await wrapped.has(): any)}`);
		rows.push('wrapped.delete()');
		wrapped.delete();
		rows.push(`wrapped.get(): ${(await wrapped.get(): any)}`);
		rows.push(`wrapped.has(): ${(await wrapped.has(): any)}`, '');

		rand = Math.random();
		const domain = Storage.wrapDomain(x => testKey + x, 'default');
		rows.push(`domain.set(): ${rand}`);
		domain.set(1, rand);
		rows.push(`domain.get(): ${(await domain.get(1, testKey): any)}`);
		rows.push(`domain.has(): ${(await domain.has(1, testKey): any)}`);
		rows.push('domain.delete()');
		domain.delete(1, testKey);
		rows.push(`domain.get(): ${(await domain.get(1, testKey): any)}`);
		rows.push(`domain.has(): ${(await domain.has(1, testKey): any)}`, '');
	} catch (e) {
		rows.push('', `Errored: ${e}`);
		console.error(e);
	}

	Alert.open(rows.join('<br>'));
}
