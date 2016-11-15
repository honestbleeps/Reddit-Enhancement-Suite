yourimport testTemplate from '../templates/test.mustache';
import { MODULE_PROFILING_KEY, PERF_PROFILING_KEY, RES_DISABLED_KEY } from '../constants/sessionStorage';
import { Alert } from '../utils';
import { Session, Storage, XhrCache, isPrivateBrowsing, multicast } from '../environment';
import * as Notifications from './notifications';

export const module = {};

module.moduleID = 'troubleshooter';
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
		description: 'Test rendering templates',
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
	Notifications.showNotification('All caches cleared.', 2500);
}

async function clearTags() {
	const confirm = window.confirm('Are you positive?');
	if (confirm) {
		const tags = await Storage.get('RESmodules.userTagger.tags');
		if (tags) {
			let cnt = 0;
			for (const i in tags) {
				if ((tags[i].votes === 1 || tags[i].votes === 0 || tags[i].votes === -1) && !tags[i].hasOwnProperty('tag')) {
					delete tags[i];
					cnt += 1;
				}
			}
			Storage.set('RESmodules.userTagger.tags', tags);
			Notifications.showNotification(`${cnt} entries removed.`, 2500);
		}
	} else {
		Notifications.showNotification('No action was taken', 2500);
	}
}

function resetToFactory() {
	const confirm = window.prompt('This will kill all your settings and saved data. If you\'re certain, type in "trash".');
	if (confirm === 'trash' || confirm === '"trash"') {
		clearCache();
		Storage.clear();
		Notifications.showNotification('All settings reset. Reload to see the result.', 2500);
	} else {
		Notifications.showNotification('No action was taken', 2500);
	}
}

function disableRES() {
	sessionStorage.setItem(RES_DISABLED_KEY, true);
	window.location.reload();
}

function enablePerfProfiling() {
	sessionStorage.setItem(PERF_PROFILING_KEY, true);
	location.hash = '';
	location.reload();
}

function enableModuleProfiling() {
	sessionStorage.setItem(MODULE_PROFILING_KEY, true);
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
		rows.push(`Setting storage: ${rand}`);
		Storage.set(testKey, rand);
		rows.push(`Loaded storage: ${await Storage.get(testKey)}`);
		rows.push(`Storage has: ${await Storage.has(testKey)}`);
		Storage.delete(testKey);
		rows.push(`After deletion: ${await Storage.get(testKey)}`);
		rows.push(`Storage has: ${await Storage.has(testKey)}`, '');

		rand = Math.random();
		rows.push(`Setting session: ${rand}`);
		Session.set(testKey, rand);
		rows.push(`Loaded session: ${await Session.get(testKey)}`);
		rows.push(`Session has: ${await Session.has(testKey)}`);
		Session.delete(testKey);
		rows.push(`After deletion: ${await Session.get(testKey)}`);
		rows.push(`Session has: ${await Session.has(testKey)}`, '');
	} catch (e) {
		rows.push('', `Errored: ${e}`);
		console.error(e);
	}

	Alert.open(rows.join('<br>'));
}
