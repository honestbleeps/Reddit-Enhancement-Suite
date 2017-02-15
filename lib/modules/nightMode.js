/* @flow */

import _ from 'lodash';
import { getTimes as getSunriseSunset } from 'suncalc';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Init from '../core/init';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import {
	Alert,
	BodyClasses,
	CreateElement,
	currentSubreddit,
	nextFrame,
	HOUR,
	MINUTE,
} from '../utils';
import { Session, Storage, i18n, multicast } from '../environment';
import * as CommandLine from './commandLine';
import * as Menu from './menu';
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
		description: `
			Always keep subreddit styles enabled when using night mode, ignoring the compatability check.
			<br><br>When using night mode, subreddit styles are automatically disabled unless <a href="/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit">the subreddit indicates it is night mode-friendly</a>. You must tick the "Use subreddit stylesheet" in a subreddit's sidebar to enable subreddit styles in that subreddit. This is because most subreddits are not night mode-friendly.
			<br><br>If you choose to show subreddit styles, you will see flair images and spoiler tags, but be warned: <em>you may see bright images, comment highlighting, etc.</em> It is up to the mods of each subreddit to make their sub night mode friendly, which is not a tiny amount of work. Please be polite when requesting moderators make a sub night mode friendly.
		`,
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

const nightmodeOverrideStorage = Storage.wrap('RESmodules.nightMode.nightModeOverrideStart', (null: null | number));

module.onToggle = toggle => {
	// If the module is turned off, disable night mode completely
	if (!toggle) {
		disableNightMode();
	}
};

module.loadDynamicOptions = () => {
	// To avoid the flash of unstyled content, the very first thing we should do is get a hold
	// of the document object and add necessary classes...
	if (typeof localStorage === 'object' && localStorage.getItem('RES_nightMode')) {
		// No need to check the background - we're in night mode for sure.
		enableNightMode();
	}
};

module.beforeLoad = () => {
	// If night mode is enabled, set a localStorage token so that in the future,
	// we can add the res-nightmode class to the page prior to page load.
	if (isNightModeOn()) {
		enableNightMode();
	} else {
		disableNightMode();
	}
};

module.always = () => {
	if (!Modules.isRunning(module)) {
		// Failsafe to disable night mode if the module is disabled
		disableNightMode();
	}
};

module.go = () => {
	handleAutomaticNightMode();

	if (module.options.nightSwitch.value) {
		createNightSwitch();
	}

	CommandLine.registerCommand(/^(ls|ns)$/, 'ns - toggle nightSwitch',
		(command, val, match) => {
			if (match[1] === 'ls') {
				return 'Toggle nightSwitch (deprecated, use "ns" instead).';
			} else {
				return 'Toggle nightSwitch';
			}
		}, () => {
			userToggledNightMode();
		}
	);
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
		toggleNightMode();
	}

	// wait 5 minutes, then wait for the next frame (i.e. wait for the tab to be focused)
	setTimeout(() => nextFrame(check), 5 * MINUTE);
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

				return Alert.open(i18n('nightModeAutomaticNightModeDenied', 'confirm'), { cancelable: true })
					.then(() => {
						// they clicked confirm, turn it off
						Options.set(module, 'automaticNightMode', 'none');

						return {
							startingTime: new Date(0),
							endingTime: new Date(0),
						};
					});
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

let $nightSwitch;

function createNightSwitch() {
	$nightSwitch = $('<div>', {
		text: 'night mode',
		title: 'Toggle night and day',
	});

	const toggle = CreateElement.toggleButton(
		undefined,
		'nightSwitchToggle',
		isNightModeOn(),
		'☽',
		'☀'
	);
	$(toggle).appendTo($nightSwitch);

	Menu.addMenuItem($nightSwitch, userToggledNightMode);
}

function updateNightSwitch(toggle) {
	if (!$nightSwitch) return;
	$nightSwitch.find('.toggleButton').toggleClass('enabled', toggle);
}

function userToggledNightMode(e) {
	if (e) {
		e.preventDefault();
	}

	toggleNightMode();
	overrideNightMode();
}

function toggleNightMode() {
	if (isNightModeOn()) {
		disableNightMode();
	} else {
		enableNightMode();
	}
	StyleTweaks.toggleSubredditStyleIfNecessary();
}

const enableNightMode = multicast(() => {
	Options.set(module, 'nightModeOn', true);
	localStorage.setItem('RES_nightMode', 'true');
	BodyClasses.add('res-nightmode');
	updateNightSwitch(true);
}, { name: 'enableNightMode' });

const disableNightMode = multicast(() => {
	Options.set(module, 'nightModeOn', false);
	localStorage.removeItem('RES_nightMode');
	BodyClasses.remove('res-nightmode');
	updateNightSwitch(false);
}, { name: 'disableNightMode' });
