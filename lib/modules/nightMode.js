import _ from 'lodash';
import { $ } from '../vendor';
import * as Init from '../core/init';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import { BodyClasses, CreateElement, currentSubreddit } from '../utils';
import { Session, Storage, multicast } from '../environment';
import * as CommandLine from './commandLine';
import * as Menu from './menu';
import * as SettingsConsole from './settingsConsole';
import * as StyleTweaks from './styleTweaks';

export const module = {};

module.moduleID = 'nightMode';
module.moduleName = 'Night Mode';
module.category = 'Appearance';
module.description = `
	A darker, more eye-friendly version of Reddit suited for night browsing.
	<br><br>Note: Using this on/off switch will disable all features of the night mode module completely.
	<br>To simply turn off night mode, use the nightModeOn switch below.
`;
module.options = {
	nightModeOn: {
		type: 'boolean',
		value: false,
		description: 'Enable/disable night mode.',
	},
	nightSwitch: {
		type: 'boolean',
		value: true,
		description: 'Enable night switch, a toggle between day and night reddit located in the Settings dropdown menu.',
		advanced: true,
	},
	automaticNightMode: {
		type: 'boolean',
		value: false,
		description: `
			Enable automatic night mode&mdash;night mode automatically starts and stops at the times configured below.
			<br><br>For the times below, a 24-hour clock ("military time") from 0:00 to 23:59 is used.
			<br>e.g. the time 8:20pm would be written as 20:20, and 12:30am would be written as 00:30 or 0:30.
			<br><br>To temporarily override automatic night mode, manually flip the night mode switch.
			<br>Configure how long the override lasts below.
		`,
	},
	nightModeStart: {
		type: 'text',
		value: '20:00',
		description: 'Time that automatic night mode starts. Default is 20:00 (8:00pm).',
		dependsOn: 'automaticNightMode',
	},
	nightModeEnd: {
		type: 'text',
		value: '6:00',
		description: 'Time that automatic night mode ends. Default is 6:00 (6:00am).',
		dependsOn: 'automaticNightMode',
	},
	nightModeOverrideHours: {
		type: 'text',
		value: 8,
		description: `
			Number of hours that the automatic night mode override lasts. Default is 8 (hours).
			<br>You can use a decimal number of hours here as well; e.g. 0.1 hours (which is 6 min).
		`,
		dependsOn: 'automaticNightMode',
	},
	useSubredditStyles: {
		type: 'boolean',
		value: false,
		description: `
			Always keep subreddit styles enabled when using night mode, ignoring the compatability check.
			<br><br>When using night mode, subreddit styles are automatically disabled unless <a href="/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit">the subreddit indicates it is night mode-friendly</a>. You must tick the "Use subreddit stylesheet" in a subreddit's sidebar to enable subreddit styles in that subreddit. This is because most subreddits are not night mode-friendly.
			<br><br>If you choose to show subreddit styles, you will see flair images and spoiler tags, but be warned: <em>you may see bright images, comment highlighting, etc.</em> It is up to the mods of each subreddit to make their sub night mode friendly, which is not a tiny amount of work. Please be polite when requesting moderators make a sub night mode friendly.
		`,
		advanced: true,
	},
	subredditStylesWhitelist: {
		type: 'list',
		value: '',
		listType: 'subreddits',
		description: 'Allow the subreddits listed to display subreddit styles during night mode if useSubredditStyles is disabled.',
	},
	coloredLinks: {
		type: 'boolean',
		bodyClass: true,
		value: false,
		description: 'Color links blue and purple',
	},
};

module.onToggle = function(toggle) {
	// If the module is turned off, disable night mode completely
	if (!toggle) {
		disableNightMode();
	}
};

module.loadDynamicOptions = function() {
	// To avoid the flash of unstyled content, the very first thing we should do is get a hold
	// of the document object and add necessary classes...
	if (typeof localStorage === 'object' && localStorage.getItem('RES_nightMode')) {
		// No need to check the background - we're in night mode for sure.
		enableNightMode();
	}
};

module.beforeLoad = function() {
	// If night mode is enabled, set a localStorage token so that in the future,
	// we can add the res-nightmode class to the page prior to page load.
	if (isNightModeOn()) {
		enableNightMode();
	} else {
		disableNightMode();
	}
};

module.always = function() {
	if (!Modules.isRunning(module)) {
		// Failsafe to disable night mode if the module is disabled
		disableNightMode();
	}
};

module.go = function() {
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

export function isNightModeOn() {
	return Modules.isRunning(module) && module.options.nightModeOn.value;
}

export async function isNightmodeCompatible() {
	if (!isNightModeOn()) {
		// nightmode is off
		return true;
	}

	if (!currentSubreddit()) {
		// not in a subreddit, vanilla reddit is compatible
		return true;
	}

	if (module.options.useSubredditStyles.value) {
		// user has chosen to always use subreddit styles regardless of compatibility
		return true;
	}

	const isWhitelisted = module.options.subredditStylesWhitelist.value.split(',').includes(currentSubreddit().toLowerCase());
	if (isWhitelisted) {
		// This subreddit is whitelisted.
		return true;
	}

	const cached = await Session.get(`isNightmodeCompatible.${currentSubreddit().toLowerCase()}`);
	if (cached !== undefined) {
		// update the cache for next pageload
		updateCache();
		return cached;
	}

	return updateCache();

	async function updateCache() {
		await Init.bodyReady;
		// Check the sidebar for a link [](#/RES_SR_Config/NightModeCompatible) that indicates the sub is night mode compatible.
		const isCompatible = !!document.querySelector('.side a[href="#/RES_SR_Config/NightModeCompatible"]');
		Session.set(`isNightmodeCompatible.${currentSubreddit().toLowerCase()}`, isCompatible);
		return isCompatible;
	}
}

export async function toggledSubredditStyle(toggledOn) {
	if (!isNightModeOn() || !currentSubreddit()) {
		// nightmode is off or not in a subreddit, subreddit style toggling is irrelevant
		return;
	}

	const subreddit = currentSubreddit().toLowerCase();
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

async function handleAutomaticNightMode() {
	if (!module.options.automaticNightMode.value) {
		return;
	}

	// Handle automatic night mode override
	const MS_IN_HOUR = 3600000; // 1000(ms) * 60(s) * 60(min)

	// Grab the override start time, if it exists
	const nightModeOverrideStart = await Storage.get('RESmodules.nightMode.nightModeOverrideStart');
	const nightModeOverrideLength = MS_IN_HOUR * module.options.nightModeOverrideHours.value;

	const nightModeOverrideEnd = (parseInt(nightModeOverrideStart, 10) || 0) + nightModeOverrideLength;

	const isOverrideActive = (Date.now() <= nightModeOverrideEnd);

	// Toggle is needed if night mode time is reached but night mode is
	// disabled, or vice versa, *unless* override is active
	const needsNightModeToggle = !isOverrideActive &&
		(isNightModeOn() !== isTimeForNightMode());

	if (needsNightModeToggle) {
		toggleNightMode();
	}
}

function overrideNightMode() {
	if (!module.options.automaticNightMode.value) {
		return;
	}

	// Temporarily disable automatic night mode by setting the start time
	// of override
	Storage.set('RESmodules.nightMode.nightModeOverrideStart', Date.now());
}

function isTimeForNightMode() {
	const currentDate = new Date();
	const currentHour = currentDate.getHours();
	const currentMinute = currentDate.getMinutes();
	const currentTime = currentHour * 100 + currentMinute;

	const startingTime = convertTimeStringToInt(module.options.nightModeStart.value);
	const endingTime = convertTimeStringToInt(module.options.nightModeEnd.value);

	if (startingTime <= endingTime) {
		// e.g. enabled between 6am (600) and 8pm (2000)
		return (startingTime <= currentTime) && (currentTime < endingTime);
	} else {
		// e.g. enabled between 8pm (2000) and 6am (600)
		return (startingTime <= currentTime) || (currentTime < endingTime);
	}
}

function convertTimeStringToInt(timeString) {
	// Converts a string of form "12:30" to an integer 1230
	const array = timeString.split(':');
	const hour = parseInt(array[0], 10);
	const minute = parseInt(array[1], 10);
	return hour * 100 + minute;
}

let $nightSwitch;

function createNightSwitch() {
	$nightSwitch = $('<div>', {
		text: 'night mode',
		title: 'Toggle night and day',
	});

	const toggle = CreateElement.toggleButton(
		enabled => SettingsConsole.onOptionChange(module, 'nightSwitchToggle', !enabled),
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
	if (typeof toggle === 'undefined') {
		toggle = isNightModeOn();
	}
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
	localStorage.setItem('RES_nightMode', true);
	BodyClasses.add('res-nightmode');
	updateNightSwitch(true);
}, { name: 'enableNightMode' });

const disableNightMode = multicast(() => {
	Options.set(module, 'nightModeOn', false);
	localStorage.removeItem('RES_nightMode');
	BodyClasses.remove('res-nightmode');
	updateNightSwitch(false);
}, { name: 'disableNightMode' });
