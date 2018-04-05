/* @flow */

import _ from 'lodash';
import { getTimes as getSunriseSunset } from 'suncalc';
import { Module } from '../core/module';
import * as Init from '../core/init';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import {
	appType,
	Alert,
	BodyClasses,
	currentSubreddit,
	HOUR,
	MINUTE,
} from '../utils';
import { Session, Storage, i18n } from '../environment';
import * as CustomToggles from './customToggles';
import * as StyleTweaks from './styleTweaks';

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

module.exclude = [
	'd2x',
];

const localStorageKey = 'RES_nightMode';
const nightmodeOverrideStorage = Storage.wrap('RESmodules.nightMode.nightModeOverrideStart', (null: null | number));
let toggle;

module.onToggle = enabled => {
	// If the module is turned off, disable night mode completely
	if (toggle.enabled && !enabled) toggle.toggle();
};

module.loadDynamicOptions = () => {
	// To avoid the flash of unstyled content, the very first thing we should do is get a hold
	// of the document object and add necessary classes...
	if (typeof localStorage === 'object' && localStorage.getItem(localStorageKey)) {
		addNightMode();
	}
};

module.beforeLoad = () => {
	if (isNightModeOn()) {
		addNightMode();
	} else {
		removeNightMode();
	}

	toggle = new CustomToggles.Toggle('nightMode', i18n('nightModeToggleText'), module.options.nightModeOn.value);
	toggle.onToggle(type => {
		if (type === 'manual') overrideNightMode();
		Options.set(module, 'nightModeOn', toggle.enabled);
	});
	toggle.onStateChange(() => {
		if (toggle.enabled) addNightMode();
		else removeNightMode();
		StyleTweaks.toggleSubredditStyleIfNecessary();
	});
	toggle.addCLI('ns');
};

module.always = () => {
	if (!Modules.isRunning(module)) {
		// Nightmode might have been erronously applied in `loadDynamicOptions`
		removeNightMode();
	}
};

module.go = () => {
	handleAutomaticNightMode();

	if (module.options.nightSwitch.value) {
		toggle.addMenuItem(i18n('nightModeToggleTitle'), '☽', '☀');
	}
};

export function isNightModeOn(): boolean {
	return Modules.isRunning(module) && module.options.nightModeOn.value;
}

export async function isNightmodeCompatible(): Promise<boolean> {
	await Init.loadOptions;

	if (!isNightModeOn()) {
		// nightmode is off
		return true;
	}

	const subreddit = currentSubreddit();
	if (!subreddit) {
		// not in a subreddit, vanilla reddit is compatible
		return true;
	}

	if (module.options.useSubredditStyles.value) {
		// user has chosen to always use subreddit styles regardless of compatibility
		return true;
	}

	if (['all', 'popular', 'friends', 'mod'].includes(subreddit)) {
		// special-case subreddits are always compatible
		return true;
	}

	const isWhitelisted = module.options.subredditStylesWhitelist.value.split(',').includes(subreddit.toLowerCase());
	if (isWhitelisted) {
		// This subreddit is whitelisted.
		return true;
	}

	const cached = await Session.get(`isNightmodeCompatible.${subreddit.toLowerCase()}`);
	if (cached !== undefined) {
		// update the cache for next pageload
		updateCache(subreddit);
		return cached;
	}

	return updateCache(subreddit);

	async function updateCache(subreddit) {
		await Init.bodyReady;
		// Check the sidebar for a link [](#/RES_SR_Config/NightModeCompatible) that indicates the sub is night mode compatible.
		const isCompatible = !!document.querySelector('.side a[href="#/RES_SR_Config/NightModeCompatible"]');
		Session.set(`isNightmodeCompatible.${subreddit.toLowerCase()}`, isCompatible);
		return isCompatible;
	}
}

export async function toggledSubredditStyle(toggledOn: boolean): Promise<void> {
	const currSub = currentSubreddit();
	if (!isNightModeOn() || !currSub) {
		// nightmode is off or not in a subreddit, subreddit style toggling is irrelevant
		return;
	}

	const subreddit = currSub.toLowerCase();
	const whitelist = module.options.subredditStylesWhitelist.value.split(',');

	if (toggledOn && !(await isNightmodeCompatible())) {
		// toggled on and incompatible, add to whitelist
		if (!whitelist.includes(subreddit)) {
			whitelist.push(subreddit);
		}
	} else if (!toggledOn) {
		// toggled off, remove from whitelist
		_.pull(whitelist, subreddit);
	}

	Options.set(module, 'subredditStylesWhitelist', whitelist.join(','));
}

const handleAutomaticNightMode = _.once(async function check() {
	if (module.options.automaticNightMode.value === 'none') {
		return;
	}

	// Handle automatic night mode override
	// Grab the override start time, if it exists
	const nightModeOverrideStart = await nightmodeOverrideStorage.get();
	const nightModeOverrideLength = HOUR * parseFloat(module.options.nightModeOverrideHours.value);

	const nightModeOverrideEnd = (parseInt(nightModeOverrideStart, 10) || 0) + nightModeOverrideLength;

	const isOverrideActive = (Date.now() <= nightModeOverrideEnd);

	// Toggle is needed if night mode time is reached but night mode is
	// disabled, or vice versa, *unless* override is active
	const needsNightModeToggle = !isOverrideActive &&
		(isNightModeOn() !== await isTimeForNightMode());

	if (needsNightModeToggle) {
		toggle.toggle('auto');
	}

	// wait 5 minutes, then wait for the next frame (i.e. wait for the tab to be focused)
	setTimeout(() => requestAnimationFrame(check), 5 * MINUTE);
});

function overrideNightMode() {
	if (module.options.automaticNightMode.value === 'none') {
		return;
	}

	// Temporarily disable automatic night mode by setting the start time
	// of override
	nightmodeOverrideStorage.set(Date.now());
}

/**
 * Gets user's latitude and longitude using Geolocation API.
 */
function getGeolocation() {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			position => resolve(position.coords),
			reject
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
						return Alert.open(i18n('nightModeAutomaticNightModeDenied', 'confirm'), { cancelable: true })
							.then(() => {
								// they clicked confirm, turn it off
								Options.set(module, 'automaticNightMode', 'none');

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
			return 'res-nightmode';
		case 'd2x':
			return 'res-d2x-nightmode';
		default:
			throw new Error(`Impossible appType: ${appType()}`);
	}
};

const addNightMode = () => {
	BodyClasses.add(className());
	// Set a localStorage token so that in the future we can add nightmode to the page prior to page load.
	localStorage.setItem(localStorageKey, 'true');
};

const removeNightMode = () => {
	BodyClasses.remove(className());
	localStorage.removeItem(localStorageKey);
};
