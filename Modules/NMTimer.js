modules['nightTimer'] = {
	moduleID: 'nightTimer',
	moduleName: 'Night Timer',
	category: 'UI',
	options: {
		startTime: {
			type: 'text',
			value: '21:00',
			description: "Start time for night mode. Example, 21:00 for 9pm."
		},
		endTime: {
			type: 'text',
			value: '06:00',
			description: "End time for night mode. Example, 06:00 for 6am."
		},
		checkInterval: {
			type: 'text',
			value: '1',
			description: "The interval, in minutes, to check for day/night changeover."
		},
		autoDisableStyles: {
			type: 'boolean',
			value: false,
			description: "Disable subreddit styles automatically upon switching to Night Mode"
		}
	},
	description: 'Automatically turn night mode on/off at the specified times.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(/https?:\/\/([a-z]+).reddit.com\/[\?]*/i),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if ((RESUtils.getOptions('styleTweaks').lightSwitch.value === true) && ((document.querySelector('#lightSwitchToggle')))) {
				var delayInterval = +((this.options.checkInterval.value) * 60000),
					ignoredSubredditsValue = false;
				if (modules['nightTimer'].options.autoDisableStyles.value === true) {
					var thisSubreddit = window.location.href.split('/')[4],
						ignoredSubreddits = modules['styleTweaks'].ignoredSubReddits;
					for (var i in ignoredSubreddits) {
						if (ignoredSubreddits[i] === thisSubreddit) {
							ignoredSubredditsValue = true;
							break;
						}
					}
				}
				this.setMode(ignoredSubredditsValue);
				window.setInterval(function() {
					modules['nightTimer'].setMode(ignoredSubredditsValue)
				}, delayInterval);
			}
		}
	},
	setMode: function(ignoredSubredditsValue) {
		var theStyle, theSwitch = document.querySelector('#lightSwitchToggle');
		if (document.querySelector('input[name*="subRedditStyleCheckbox"]')) {
			theStyle = document.querySelector('input[name*="subRedditStyleCheckbox"]')
		}
		else {
			theStyle = false;
		}
		if ((modules['nightTimer'].checkTime()) && (!theSwitch.className.match(/enabled/))) {
			RESUtils.click(modules['styleTweaks'].lightSwitch);
			if (modules['nightTimer'].options.autoDisableStyles.value === true && theStyle) {
				if (theStyle.checked === true) theStyle.click();
			}
		}
		else if ((!modules['nightTimer'].checkTime()) && (theSwitch.className.match(/enabled/))) {
		    RESUtils.click(modules['styleTweaks'].lightSwitch);
		    if (modules['nightTimer'].options.autoDisableStyles.value === true && ignoredSubredditsValue === false) {
			if(theStyle) theStyle.click();
		}
		}
	},
	checkTime: function() {
		var nowMins = new Date().getMinutes(),
		    nowHrs = new Date().getHours();
		var start = this.options.startTime.value.split(':'),
		    end = this.options.endTime.value.split(':');
		for (var i = 0; i < start.length; i += 1) {
		    start[i] = +start[i];
		    end[i] = +end[i];
		}
		if ((((start[0] < end[0]) && (nowHrs >= start[0] && nowHrs <= end[0])) 
		|| ((start[0] > end[0]) && (nowHrs <= start[0] || nowHrs >= end[0]))) 
		&& ((nowHrs === start[0] && nowMins >= start[1]) || (nowHrs === end[0] && nowMins <= end[1]) || (nowHrs > start[0] && nowHrs < end[0]))
		|| ((start[0] === end[0]) && ((nowMins >= start[1]) && (nowMins <= end[1])))) {
		    return true;
		}
		else {
		    return false;
		}
	}
};
