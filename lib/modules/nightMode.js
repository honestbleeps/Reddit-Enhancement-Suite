addModule('nightMode', function(module, moduleID) {
	module.moduleName = 'Night Mode';
	module.description = 'A darker, more eye-friendly version of Reddit suited for night browsing.';
	module.category = 'UI';
	module.options = {
		lightOrDark: {
			type: 'enum',
			values: [{
				name: 'Light',
				value: 'light'
			}, {
				name: 'Dark',
				value: 'dark'
			}],
			value: 'light',
			description: 'Light, or dark?'
		},
		lightSwitch: {
			type: 'boolean',
			value: true,
			description: 'Enable lightswitch, a toggle between light / dark reddit located in the Settings dropdown menu',
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
			description: 'Time that automatic night mode starts. Default is 20:00 (8:00pm).'
		},
		nightModeEnd: {
			type: 'text',
			value: '6:00',
			description: 'Time that automatic night mode ends. Default is 6:00 (6:00am).'
		},
		nightModeOverrideHours: {
			type: 'text',
			value: 8,
			description: 'Number of hours that the automatic night mode override lasts. Default is 8 (hours).\
				<br>You can use a decimal number of hours here as well; e.g. 0.1 hours (which is 6 min).'
		},
		useSubredditStyleInNightMode: {
			type: 'boolean',
			value: false,
			description: "Don't disable subreddit styles by default when using night mode.\
				<br><br>When using night mode, subreddit styles are automatically disabled unless <a href='/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit'>the subreddit indicates it is night mode-friendly</a>. you must tick the 'Use subreddit stylesheet' in a subreddit's sidebar to enable subreddit styles in that subreddit. This is because most subreddits are not night mode-friendly.\
				<br><br>If you choose to show subreddit styles, you will see flair images and spoiler tags, but be warned: <em>you may see bright images, comment highlighting, etc.</em>  If you do, please message the mods for that subreddit.",
			advanced: true
		}
	};

	$.extend(module, {
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// If night mode is enabled, set a localStorage token so that in the future,
			// we can add the res-nightmode class to the page prior to page load.
			if (this.isDark()) {
				this.enableNightMode();
			} else {
				this.disableNightMode();
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get the head ASAP!
			this.head = document.getElementsByTagName("head")[0];

			// handle night mode scenarios (check if subreddit is compatible, etc)
			this.handleNightModeAtStart();

			if (this.isDark()) {
				// still add .res-nightmode to body just in case subreddit stylesheets specified body.res-nightmode instead of just .res-nightmode
				document.body.classList.add('res-nightmode');
			}

			this.handleAutomaticNightMode();

			if (this.options.lightSwitch.value) {
				this.createLightSwitch();
			}
		}
	},

	isDark: function() {
		return this.options.lightOrDark.value === 'dark';
	},
	handleAutomaticNightMode: function() {
		if (!this.options.automaticNightMode.value) {
			return;
		}

		// Handle automatic night mode override
		var MS_IN_HOUR = 3600000, // 1000(ms) * 60(s) * 60(min)

			// Grab the override start time, if it exists
			nightModeOverrideStart = RESStorage.getItem('RESmodules.nightMode.nightModeOverrideStart'),
			nightModeOverrideLength = MS_IN_HOUR * this.options.nightModeOverrideHours.value,

			// RESStorage.getItem returns null if no item is found, so default
			// nightModeOverrideEnd to 0
			nightModeOverrideEnd = (nightModeOverrideStart ?
				nightModeOverrideStart + nightModeOverrideLength : 0),

			isOverrideActive = (Date.now() <= nightModeOverrideEnd);

		// Toggle is needed if night mode time is reached but night mode is
		// disabled, or vice versa, *unless* override is active
		var needsNightModeToggle = !isOverrideActive &&
			(this.isDark() !== this.isTimeForNightMode());

		if (!needsNightModeToggle) {
			return;
		}

		if (this.isDark()) {
			this.disableNightMode();
		} else {
			this.enableNightMode();
		}
	},
	overrideNightMode: function() {
		if (!modules['nightMode'].options.automaticNightMode.value) {
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

			startingTime = this.convertTimeStringToInt(this.options.nightModeStart.value),
			endingTime = this.convertTimeStringToInt(this.options.nightModeEnd.value);

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
		this.nightModeWhitelist = [];
		var getWhitelist = RESStorage.getItem('RESmodules.nightMode.nightModeWhitelist');
		if (getWhitelist) {
			this.nightModeWhitelist = safeJSON.parse(getWhitelist, 'RESmodules.nightMode.nightModeWhitelist');
		}
		var idx = this.nightModeWhitelist.indexOf(this.curSubReddit);
		if (idx !== -1) {
			// go no further. this subreddit is whitelisted.
			return;
		}

		// check the sidebar for a link [](#/RES_SR_Config/NightModeCompatible) that indicates the sub is night mode compatible.
		this.isNightmodeCompatible = (document.querySelector('.side a[href="#/RES_SR_Config/NightModeCompatible"]') !== null);
		this.isNightmodeCompatible = this.isNightmodeCompatible || this.options.useSubredditStyleInNightMode.value;

		// if night mode is on and the sub isn't compatible, disable its stylesheet.
		if (this.isDark() && !this.isNightmodeCompatible) {
			// hide header images since sub isn't night mode compatible and therefore they
			// may be bright images, etc.
			RESUtils.addCSS('.res-nightmode #header, .res-nightmode #header-bottom-left { background: #666660!important; }')
			this.disableSubredditStyle();
		}
	},
	createLightSwitch: function() {
		RESUtils.addCSS(".lightOn { background-position: 0 -96px; } ");
		RESUtils.addCSS(".lightOff { background-position: 0 -108px; } ");
		var thisFrag = document.createDocumentFragment();
		this.lightSwitch = document.createElement('li');
		this.lightSwitch.setAttribute('title', "Toggle night and day");
		this.lightSwitch.addEventListener('click', function(e) {
			e.preventDefault();
			if (modules['nightMode'].isDark()) {
				modules['nightMode'].lightSwitchToggle.classList.remove('enabled');
				modules['nightMode'].disableNightMode();
			} else {
				modules['nightMode'].lightSwitchToggle.classList.add('enabled');
				modules['nightMode'].enableNightMode();
			}

			modules['nightMode'].overrideNightMode();
		}, true);
		// this.lightSwitch.setAttribute('id','lightSwitch');
		this.lightSwitch.textContent = 'night mode';
		this.lightSwitchToggle = RESUtils.createElementWithID('div', 'lightSwitchToggle', 'toggleButton');
		$(this.lightSwitchToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
		this.lightSwitch.appendChild(this.lightSwitchToggle);
		if (this.isDark()) {
			this.lightSwitchToggle.classList.add('enabled');
		} else {
			this.lightSwitchToggle.classList.remove('enabled');
		}
		// thisFrag.appendChild(separator);
		thisFrag.appendChild(this.lightSwitch);
		// if (RESConsole.RESPrefsLink) insertAfter(RESConsole.RESPrefsLink, thisFrag);
		$('#RESDropdownOptions').append(this.lightSwitch);
	},
	enableNightMode: function() {
		// Set the user preference, if possible (which is not at page load)
		if (RESStorage.getItem) {
			RESUtils.setOption('nightMode', 'lightOrDark', 'dark');
		}

		localStorage.setItem('RES_nightMode', true);
		document.html.classList.add('res-nightmode');

		if (document.body) {
			document.body.classList.add('res-nightmode');
		}
	},
	disableNightMode: function() {
		// Set the user preference, if possible (which is not at page load)
		if (RESStorage.getItem) {
			RESUtils.setOption('nightMode', 'lightOrDark', 'light');
		}

		localStorage.removeItem('RES_nightMode');
		document.html.classList.remove('res-nightmode');

		if (document.body) {
			document.body.classList.remove('res-nightmode');
		}
	}
	});
});
