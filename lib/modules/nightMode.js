addModule('nightMode', function(module, moduleID) {
	$.extend(module, {
	moduleName: 'Night Mode',
	description: 'A darker, more eye-friendly version of Reddit suited for night browsing.\
		<br><br>Note: Using this on/off switch will disable all features of the night mode module completely.\
		<br>To simply turn off night mode, use the nightModeOn switch below.',
	category: 'UI',
	options: {
		nightModeOn: {
			type: 'boolean',
			value: false,
			description: 'Enable/disable night mode.'
		},
		nightSwitch: {
			type: 'boolean',
			value: true,
			description: 'Enable night switch, a toggle between day and night reddit located in the Settings dropdown menu.',
			advanced: true
		},
		automaticNightMode: {
			type: 'boolean',
			value: false,
			description: 'Enable automatic night mode&mdash;night mode automatically starts and stops at the times configured below.\
				<br><br>For the times below, a 24-hour clock ("military time") from 0:00 to 23:59 is used.\
				<br>e.g. the time 8:20pm would be written as 20:20, and 12:30am would be written as 00:30 or 0:30.\
				<br><br>To temporarily override automatic night mode, manually flip the night mode switch.\
				<br>Configure how long the override lasts below.'
		},
		nightModeStart: {
			type: 'text',
			value: '20:00',
			description: 'Time that automatic night mode starts. Default is 20:00 (8:00pm).',
			dependsOn: 'automaticNightMode'
		},
		nightModeEnd: {
			type: 'text',
			value: '6:00',
			description: 'Time that automatic night mode ends. Default is 6:00 (6:00am).',
			dependsOn: 'automaticNightMode'
		},
		nightModeOverrideHours: {
			type: 'text',
			value: 8,
			description: 'Number of hours that the automatic night mode override lasts. Default is 8 (hours).\
				<br>You can use a decimal number of hours here as well; e.g. 0.1 hours (which is 6 min).',
			dependsOn: 'automaticNightMode'
		},
		useSubredditStyles: {
			type: 'boolean',
			value: false,
			description: 'Don\'t disable subreddit styles by default when using night mode.\
				<br><br>When using night mode, subreddit styles are automatically disabled unless <a href="/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit">the subreddit indicates it is night mode-friendly</a>. You must tick the "Use subreddit stylesheet" in a subreddit\'s sidebar to enable subreddit styles in that subreddit. This is because most subreddits are not night mode-friendly.\
				<br><br>If you choose to show subreddit styles, you will see flair images and spoiler tags, but be warned: <em>you may see bright images, comment highlighting, etc.</em> It is up to the mods of each subreddit to make their sub night mode friendly, which is not a tiny amount of work. Please be polite when requesting moderators make a sub night mode friendly.',
			advanced: true
		},
		subredditStylesWhitelist: {
			type: 'list',
			value: '',
			listType: 'subreddits',
			description: 'Allow the subreddits listed to display subreddit styles during night mode if useSubredditStyles is disabled.'
		}
	},
	onToggle: function(onOrOff) {
		// If night mode is turned off, disable night mode completely
		if (!onOrOff) {
			module.disableNightMode();
		}
	},
	beforeLoad: function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			// If night mode is enabled, set a localStorage token so that in the future,
			// we can add the res-nightmode class to the page prior to page load.
			if (module.isNightModeOn()) {
				module.enableNightMode();
			} else {
				module.disableNightMode();
			}
		} else {
			// failsafe to disable night mode if the module is disabled
			if (localStorage.getItem('RES_nightMode')) {
				localStorage.removeItem('RES_nightMode');
			}
		}
	},
	go: function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			// handle night mode scenarios (check if subreddit is compatible, etc)
			module.handleNightModeAtStart();

			module.handleAutomaticNightMode();

			if (module.options.nightSwitch.value) {
				module.createNightSwitch();
			}

			modules['commandLine'].registerCommand(/^(ls|ns)$/, 'ns - toggle nightSwitch',
				function(command, val, match) {
					if (match[1] === 'ls') {
						return 'Toggle nightSwitch (deprecated, use "ns" instead).';
					} else {
						return 'Toggle nightSwitch';
					}

				}, function(command, value, match, e) {
					RESUtils.click(modules['nightMode'].nightSwitch);
				}
			);
		}
	},

	isNightModeOn: function() {
		return module.isEnabled() && module.options.nightModeOn.value;
	},
	handleAutomaticNightMode: function() {
		if (!module.options.automaticNightMode.value) {
			return;
		}

		// Handle automatic night mode override
		var MS_IN_HOUR = 3600000, // 1000(ms) * 60(s) * 60(min)

			// Grab the override start time, if it exists
			nightModeOverrideStart = RESStorage.getItem('RESmodules.nightMode.nightModeOverrideStart'),
			nightModeOverrideLength = MS_IN_HOUR * module.options.nightModeOverrideHours.value,

			// RESStorage.getItem returns null if no item is found, so default
			// nightModeOverrideEnd to 0
			nightModeOverrideEnd = (nightModeOverrideStart ?
				nightModeOverrideStart + nightModeOverrideLength : 0),

			isOverrideActive = (Date.now() <= nightModeOverrideEnd);

		// Toggle is needed if night mode time is reached but night mode is
		// disabled, or vice versa, *unless* override is active
		var needsNightModeToggle = !isOverrideActive &&
			(module.isNightModeOn() !== module.isTimeForNightMode());

		if (!needsNightModeToggle) {
			return;
		}

		if (module.isNightModeOn()) {
			module.disableNightMode();
		} else {
			module.enableNightMode();
		}
	},
	overrideNightMode: function() {
		if (!module.options.automaticNightMode.value) {
			return;
		}

		// Temporarily disable automatic night mode by setting the start time
		// of override
		RESStorage.setItem('RESmodules.nightMode.nightModeOverrideStart',
			Date.now());
	},
	isTimeForNightMode: function() {
		var currentDate = new Date(),
			currentHour = currentDate.getHours(),
			currentMinute = currentDate.getMinutes(),
			currentTime = currentHour * 100 + currentMinute,

			startingTime = module.convertTimeStringToInt(module.options.nightModeStart.value),
			endingTime = module.convertTimeStringToInt(module.options.nightModeEnd.value);

		if (startingTime <= endingTime) {
			// e.g. enabled between 6am (600) and 8pm (2000)
			return (startingTime <= currentTime) && (currentTime <= endingTime);
		} else {
			// e.g. enabled between 8pm (2000) and 6am (600)
			return (currentTime <= endingTime) || (startingTime <= currentTime);
		}
	},
	convertTimeStringToInt: function(timeString) {
		// Converts a string of form "12:30" to an integer 1230
		var array = timeString.split(':'),
			hour = parseInt(array[0], 10),
			minute = parseInt(array[1], 10),
			time = hour * 100 + minute;

		return time;
	},
	handleNightModeAtStart: function() {
		var curSubreddit = RESUtils.currentSubreddit() || '',
			index = module.options.subredditStylesWhitelist.value.split(',').indexOf(curSubreddit.toLowerCase());

		if (index !== -1) {
			// go no further. this subreddit is whitelisted.
			return;
		}

		// check the sidebar for a link [](#/RES_SR_Config/NightModeCompatible) that indicates the sub is night mode compatible.
		module.isNightmodeCompatible = (document.querySelector('.side a[href="#/RES_SR_Config/NightModeCompatible"]') !== null);
		module.isNightmodeCompatible = module.isNightmodeCompatible || module.options.useSubredditStyles.value;

		// if night mode is on and the sub isn't compatible, disable its stylesheet.
		if (module.isNightModeOn() && !module.isNightmodeCompatible) {
			// hide header images since sub isn't night mode compatible and therefore they
			// may be bright images, etc.
			RESUtils.addCSS('.res-nightmode #header, .res-nightmode #header-bottom-left { background: #666660!important; }');
			modules['styleTweaks'].disableSubredditStyle();
		}
	},
	createNightSwitch: function() {
		var thisFrag = document.createDocumentFragment(),
			toggleOn = RESUtils.createElementWithID('span', null, 'toggleOn', 'on'),
			toggleOff = RESUtils.createElementWithID('span', null, 'toggleOff', 'off');

		RESUtils.addCSS('.lightOn { background-position: 0 -96px; }');
		RESUtils.addCSS('.lightOff { background-position: 0 -108px; }');
		module.nightSwitch = document.createElement('li');
		module.nightSwitch.setAttribute('title', 'Toggle night and day');
		module.nightSwitch.addEventListener('click', function(e) {
			e.preventDefault();
			if (module.isNightModeOn()) {
				module.nightSwitchToggle.classList.remove('enabled');
				module.disableNightMode();
			} else {
				module.nightSwitchToggle.classList.add('enabled');
				module.enableNightMode();
			}

			module.overrideNightMode();
		}, true);
		// module.nightSwitch.setAttribute('id', 'nightSwitch');
		module.nightSwitch.textContent = 'night mode';
		module.nightSwitchToggle = RESUtils.createElementWithID('div', 'nightSwitchToggle', 'toggleButton');

		module.nightSwitchToggle.appendChild(toggleOn);
		module.nightSwitchToggle.appendChild(toggleOff);

		module.nightSwitch.appendChild(module.nightSwitchToggle);
		if (module.isNightModeOn()) {
			module.nightSwitchToggle.classList.add('enabled');
		} else {
			module.nightSwitchToggle.classList.remove('enabled');
		}
		// thisFrag.appendChild(separator);
		thisFrag.appendChild(module.nightSwitch);
		// if (RESConsole.RESPrefsLink) insertAfter(RESConsole.RESPrefsLink, thisFrag);
		$('#RESDropdownOptions').append(module.nightSwitch);
	},
	enableNightMode: function() {
		// Set the user preference, if possible (which is not at page load)
		if (RESStorage.isReady) {
			RESUtils.setOption('nightMode', 'nightModeOn', true);
		}

		localStorage.setItem('RES_nightMode', true);
		document.html.classList.add('res-nightmode');

		if (document.body) {
			document.body.classList.add('res-nightmode');
		} else {
			// still get RESDoBeforeLoad function to add .res-nightmode to body just in
			// case subreddit stylesheets specified body.res-nightmode instead of
			// just .res-nightmode
			RESUtils.bodyClasses.push('res-nightmode');
		}
	},
	disableNightMode: function() {
		// Set the user preference, if possible (which is not at page load)
		if (RESStorage.isReady) {
			RESUtils.setOption('nightMode', 'nightModeOn', false);
		}

		localStorage.removeItem('RES_nightMode');
		document.html.classList.remove('res-nightmode');

		if (document.body) {
			document.body.classList.remove('res-nightmode');
		}
	},
	addSubredditToWhitelist: function(subreddit) {
		subreddit = subreddit ? subreddit.toLowerCase() : '';

		var whitelist = module.options.subredditStylesWhitelist.value.split(','),
			index = whitelist.indexOf(subreddit);

		if (index === -1) {
			// Add if not found
			whitelist.push(subreddit);
		}

		RESUtils.setOption('nightMode', 'subredditStylesWhitelist',
			whitelist.join(','));
	},
	removeSubredditFromWhitelist: function(subreddit) {
		subreddit = subreddit ? subreddit.toLowerCase() : '';

		var whitelist = module.options.subredditStylesWhitelist.value.split(','),
			index = whitelist.indexOf(subreddit);

		if (index !== -1) {
			// Remove if found
			whitelist.splice(index, 1);
		}

		RESUtils.setOption('nightMode', 'subredditStylesWhitelist',
			whitelist.join(','));
	}
	});
});
