/* @flow */

import { pull } from 'lodash-es';
import { getTimes as getSunriseSunset } from 'suncalc';
import { Module } from '../core/module';
import * as Init from '../core/init';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import {
	appType,
	Alert,
	BodyClasses,
	PagePhases,
	currentSubreddit,
	waitForChild,
	HOUR,
} from '../utils';
import { Session, Storage, i18n } from '../environment';
import * as CustomToggles from './customToggles';

export const module: Module<*> = new Module('nightMode');

module.moduleName = 'nightModeName';
module.category = 'appearanceCategory';
module.description = 'nightModeDesc';
module.options = {
	nightModeOn: {
		type: 'boolean',
		value: false,
		description: 'nightModeNightModeOnDesc',
		title: 'nightModeNightModeOnTitle',
	},
	nightSwitch: {
		type: 'boolean',
		value: true,
		description: 'nightModeNightSwitchDesc',
		title: 'nightModeNightSwitchTitle',
		advanced: true,
	},
	automaticNightMode: {
		type: 'enum',
		value: 'none',
		values: [{
			name: 'nightModeAutomaticNightModeNone',
			value: 'none',
		}, {
			name: 'nightModeAutomaticNightModeAutomatic',
			value: 'automatic',
		}, {
			name: 'nightModeAutomaticNightModeUser',
			value: 'user',
		}, {
			name: 'nightModeAutomaticNightModeSystem',
			value: 'system',
		}],
		description: 'nightModeAutomaticNightModeDesc',
		title: 'nightModeAutomaticNightModeTitle',
	},
	nightModeStart: {
		type: 'text',
		value: '20:00',
		description: 'nightModeNightModeStartDesc',
		title: 'nightModeNightModeStartTitle',
		dependsOn: options => options.automaticNightMode.value === 'user',
	},
	nightModeEnd: {
		type: 'text',
		value: '6:00',
		description: 'nightModeNightModeEndDesc',
		title: 'nightModeNightModeEndTitle',
		dependsOn: options => options.automaticNightMode.value === 'user',
	},
	nightModeOverrideHours: {
		type: 'text',
		value: '8',
		description: 'nightModeNightModeOverrideHoursDesc',
		title: 'nightModeNightModeOverrideHoursTitle',
		dependsOn: options => options.automaticNightMode.value !== 'none',
	},
	useSubredditStyles: {
		type: 'boolean',
		value: false,
		description: 'nightModeUseSubredditStylesDesc',
		title: 'nightModeUseSubredditStylesTitle',
		advanced: true,
	},
	subredditStylesWhitelist: {
		type: 'list',
		value: '',
		listType: 'subreddits',
		description: 'nightModeSubredditStylesWhitelistDesc',
		title: 'nightModeSubredditStylesWhitelistTitle',
	},
	coloredLinks: {
		type: 'boolean',
		bodyClass: true,
		value: false,
		description: 'nightModeColoredLinksDesc',
		title: 'nightModeColoredLinksTitle',
	},
};

const localStorageKey = 'RES_nightMode';
export const nightModeActive = () => typeof localStorage === 'object' && !!localStorage.getItem(localStorageKey);
const nightmodeOverrideStorage = Storage.wrap('RESmodules.nightMode.nightModeOverrideStart', (null: null | number));
let toggle;

module.onInit = () => {
	// To avoid the flash of unstyled content, the very first thing we should do is get a hold
	// of the document object and add necessary classes...
	if (nightModeActive()) addStyle();
};

module.beforeLoad = () => {
	toggle = new CustomToggles.Toggle('nightMode', i18n('nightModeToggleText'), module.options.nightModeOn.value);
	toggle.onToggle(type => {
		Options.save(module.options.nightModeOn);
		if (type === 'manual') nightmodeOverrideStorage.set(Date.now());
	});
	toggle.onStateChange(() => {
		module.options.nightModeOn.value = toggle.enabled;
		refreshStyle();
		refreshSubredditStyleCompatability();
	});
	toggle.addCLI('ns');
	if (module.options.nightSwitch.value) toggle.addMenuItem(i18n('nightModeToggleTitle'), 7, '☽', '☀');

	if (module.options.automaticNightMode.value !== 'none') {
		refreshAutomaticNightMode();
	}

	refreshSubredditStyleCompatability();
};

module.always = () => {
	// Nightmode might have been erronously applied in `onInit`
	refreshStyle();
};

const id = `nightMode.compatibleSubredditStyle.${currentSubreddit()}`;
export let compatibleSubredditStyle =
	Session.get(id).then(compatible => typeof compatible === 'boolean' ? compatible : !nightModeActive());

export const onUpdate: Array<void => (void | Promise<void>)> = [];

async function refreshSubredditStyleCompatability() {
	const subreddit = currentSubreddit();

	const isAllowedByOptions = async () => {
		await Init.loadOptions;

		if (!nightModeActive()) {
			// nightmode is off
			return true;
		}

		if (module.options.useSubredditStyles.value) {
			// user has chosen to always use subreddit styles regardless of compatibility
			return true;
		}

		const isWhitelisted = module.options.subredditStylesWhitelist.value.split(',').includes(subreddit.toLowerCase());
		if (isWhitelisted) {
			// This subreddit is whitelisted.
			return true;
		}
	};

	const hasSidebarIndicator = async () => {
		// Check the sidebar for a link [](#/RES_SR_Config/NightModeCompatible) that indicates the sub is night mode compatible.
		const query = () => !!document.querySelector('.side a[href$="#/RES_SR_Config/NightModeCompatible"]');
		return (
			query() ||
			await PagePhases.bodyStart.then(query) ||
			await waitForChild(document.body, '.side').then(query) ||
			PagePhases.contentStart.then(query)
		);
	};

	compatibleSubredditStyle =
		!subreddit || // not in a subreddit, vanilla reddit is compatible
		['all', 'popular', 'friends', 'mod'].includes(subreddit) || // special-case subreddits are always compatible
		(await isAllowedByOptions()) ||
		(await hasSidebarIndicator());

	const compatible = await compatibleSubredditStyle;
	for (const callback of onUpdate) callback();
	Session.set(id, compatible);
}

export async function toggledSubredditStyle(toggledOn: boolean): Promise<void> {
	const currSub = currentSubreddit();
	if (!nightModeActive() || !currSub) {
		// nightmode is off or not in a subreddit, subreddit style toggling is irrelevant
		return;
	}

	const subreddit = currSub.toLowerCase();
	const whitelist = module.options.subredditStylesWhitelist.value.split(',');

	if (toggledOn && !compatibleSubredditStyle) {
		// toggled on and incompatible, add to whitelist
		if (!whitelist.includes(subreddit)) {
			whitelist.push(subreddit);
		}
	} else if (!toggledOn) {
		// toggled off, remove from whitelist
		pull(whitelist, subreddit);
	}

	module.options.subredditStylesWhitelist.value = whitelist.join(',');
	Options.save(module.options.subredditStylesWhitelist);

	await refreshSubredditStyleCompatability();
}

async function refreshAutomaticNightMode() {
	const nightModeOverrideStart = await nightmodeOverrideStorage.get();
	const nightModeOverrideLength = HOUR * parseFloat(module.options.nightModeOverrideHours.value);
	const nightModeOverrideEnd = (parseInt(nightModeOverrideStart, 10) || 0) + nightModeOverrideLength;
	if (Date.now() <= nightModeOverrideEnd) return;

	toggle.toggle('auto', await isTimeForNightMode());
}

/**
 * Gets user's latitude and longitude using Geolocation API.
 */
function getGeolocation() {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			position => resolve(position.coords),
			reject,
		);
	});
}

/**
 * Determines night mode startind time and ending time based on user's peferences.
 * If automatic mode is enabled, it will try to determine user's geolocation and use it
 * to calculate sunrise and sunset times.
 * If the user chose user-defined hours or the function will fail to determine user's location,
 * nightModeStart and nightModeEnd values will be used.
 */
async function getNightModeTimes() {
	switch (module.options.automaticNightMode.value) {
		case 'automatic':
			try {
				const { latitude, longitude } = await getGeolocation();
				const { sunrise, sunset } = getSunriseSunset(new Date(), latitude, longitude);
				return { startingTime: sunset, endingTime: sunrise };
			} catch (err) {
				console.warn('Failed to init automatic night mode:', err);

				switch (err.code) {
					case err.PERMISSION_DENIED:
						// Ignore permission issues when the user is in the settings console
						// The settings console requires different permissions than the content script
						if (!location.protocol.startsWith('http')) throw err;

						return Alert.open(i18n('nightModeAutomaticNightModeDenied', 'confirm'), { cancelable: true })
							.then(() => {
								// they clicked confirm, turn it off
								module.options.automaticNightMode.value = 'none';
								Options.save(module.options.automaticNightMode);

								return {
									startingTime: new Date(0),
									endingTime: new Date(0),
								};
							});
					case err.POSITION_UNAVAILABLE:
					case err.TIMEOUT:
					case err.UNKNOWN_ERROR:
					default:
						throw err;
				}
			}
		case 'user':
			return {
				startingTime: timeStringToDate(module.options.nightModeStart.value),
				endingTime: timeStringToDate(module.options.nightModeEnd.value),
			};
		default:
			throw new Error(`Invalid automaticNightMode value: ${module.options.automaticNightMode.value}`);
	}
}

async function isTimeForNightMode() {
	if (module.options.automaticNightMode.value === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	const currentTime = new Date();
	const { startingTime, endingTime } = await getNightModeTimes();

	if (startingTime <= endingTime) {
		// e.g. enabled between 6am (600) and 8pm (2000)
		return (startingTime <= currentTime) && (currentTime < endingTime);
	} else {
		// e.g. enabled between 8pm (2000) and 6am (600)
		return (startingTime <= currentTime) || (currentTime < endingTime);
	}
}

/**
 * Converts a string of form "12:30" to the current date at that time.
 */
function timeStringToDate(timeString) {
	const [hour, minute] = timeString.split(':').map(s => parseInt(s, 10));
	const date = new Date();
	date.setHours(hour, minute, 0 /* s */, 0 /* ms */);
	return date;
}

const className = () => {
	switch (appType()) {
		case 'r2':
		case 'options':
			return 'res-nightmode';
		case 'd2x':
			return 'res-d2x-nightmode';
		default:
			throw new Error(`Impossible appType: ${appType()}`);
	}
};

const addStyle = () => BodyClasses.add(className());
const removeStyle = () => BodyClasses.remove(className());

const refreshStyle = () => {
	if (Modules.isRunning(module) && module.options.nightModeOn.value) {
		addStyle();
		// Set a localStorage token so that in the future we can add nightmode to the page prior to page load.
		localStorage.setItem(localStorageKey, 'true');
	} else {
		removeStyle();
		localStorage.removeItem(localStorageKey);
	}
};
