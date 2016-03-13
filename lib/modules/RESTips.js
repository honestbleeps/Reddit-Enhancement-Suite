addModule('RESTips', {
	moduleID: 'RESTips',
	moduleName: 'RES Tips and Tricks',
	category: ['About RES'],
	options: {
		// any configurable options you have go here...
		// options must have a type and a value..
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		dailyTip: {
			type: 'boolean',
			value: true,
			description: 'Show a random tip once every 24 hours.'
		}
	},
	description: 'Adds tips/tricks help to RES console',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled() && this.isMatchURL()) {
			RESUtils.addCSS('.res-help { cursor: help; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.menuItem = RESUtils.createElement('div', 'RESTipsMenuItem');
			this.menuItem.textContent = 'tips & tricks';
			var onClick = function(e) {
				modules['RESTips'].randomTip();
			};

			modules['RESMenu'].addMenuItem(this.menuItem, onClick);

			if (this.options.dailyTip.value) {
				this.dailyTip();
			}

			/*
			guiders.createGuider({
				attachTo: '#RESSettingsButton',
				// buttons: [{name: 'Next'}],
				description: 'Guiders are a user interface design pattern for introducing features of software. This dialog box, for example, is the first in a series of guiders that together make up a guide.',
				id: 'first',
				// next: 'second',
				overlay: true,
				xButton: true,
				title: 'Welcome to Guiders.js!'
			}).show();
			*/
			/*
			setTimeout(function() {
				guiders.createGuider({
					  attachTo: '#RESSettingsButton',
					  buttons: [{name: 'Close'},
								{name: 'Next'}],
					  description: 'This is just some sorta test guider, here... woop woop.',
					  id: 'first',
					  next: 'second',
					  // offset: { left: -200, top: 120 },
					  position: 5,
					  title: 'Guiders are typically attached to an element on the page.'
				}).show();
				guiders.createGuider({
					  attachTo: 'a.toggleImage:first',
					  buttons: [{name: 'Close'},
								{name: 'Next'}],
					  description: 'An example of an image expando',
					  id: 'second',
					  next: 'third',
					  // offset: { left: -200, top: 120 },
					  position: 3,
					  title: 'Guiders are typically attached to an element on the page.'
				});
			}, 2000);
			*/
		}
	},
	handleEscapeKey: function(event) {
		if (event.which === 27) {
			modules['RESTips'].hideTip();
		}
	},
	dailyTip: function() {
		var lastCheck = parseInt(RESStorage.getItem('RESLastToolTip'), 10) || 0;
		var now = Date.now();
		// 86400000 = 1 day
		if ((now - lastCheck) > 86400000) {
			// mark off that we've displayed a new tooltip
			RESStorage.setItem('RESLastToolTip', now);
			if (lastCheck === 0) {
				this.showTip(0);
			} else {
				setTimeout(function() {
					modules['RESTips'].randomTip();
				}, 500);
			}
		}
	},
	randomTip: function() {
		this.currTip = Math.floor(Math.random() * this.tips.length);
		this.showTip(this.currTip);
	},
	disableDailyTipsCheckbox: function(e) {
		modules['RESTips'].options.dailyTip.value = e.target.checked;
		RESUtils.options.saveModuleOptions('RESTips');
	},
	nextTip: function() {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(1);
	},
	prevTip: function() {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(-1);
	},
	nextPrevTip: function(idx) {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		// if (idx < 0) this.hideTip();
		this.hideTip();
		this.currTip += idx;
		if (this.currTip < 0) {
			this.currTip = this.tips.length - 1;
		} else if (this.currTip >= this.tips.length) {
			this.currTip = 0;
		}
		this.showTip(this.currTip);
	},
	generateTitle: function (help) {
		var title = help.title || 'RES Tips and Tricks';
		return title;
	},
	generateContent: function(help, elem) {
		var description = [];

		if (help.message) description.push(help.message);

		if (help.keyboard) {
			// TODO: microtemplate
			var disabled = !modules['keyboardNav'].isEnabled();
			description.push('<h2 class="keyboardNav' + (disabled ? 'keyboardNavDisabled' : '') + '">');
			description.push('Keyboard Navigation' + (disabled ? ' (disabled)' : ''));
			description.push('</h2>');

			var keyboardTable = RESUtils.createElement.table(help.keyboard, this.generateContentKeyboard, elem);
			if (keyboardTable) description.push(keyboardTable);
		}

		if (help.option) {
			description.push('<h2 class="settingsPointer">');
			description.push('<span class="gearIcon"></span> RES Settings');
			description.push('</h2>');

			var optionTable = RESUtils.createElement.table(help.option, this.generateContentOption, elem);
			if (optionTable) description.push(optionTable);
		}

		description = description.join('\n');
		return description;
	},
	generateContentKeyboard: function(keyboardNavOption, index, array, elem) {
		var keyCode = modules['keyboardNav'].getNiceKeyCode(keyboardNavOption);
		if (!keyCode) return;

		var description = [];
		description.push('<tr>');
		description.push('<td><code>' + keyCode.toLowerCase() + '</code></td>');
		description.push('<td>' + keyboardNavOption + '</td>');
		description.push('</tr><tr>');
		description.push('<td>&nbsp;</td>'); // for styling
		description.push('<td>' + modules['keyboardNav'].options[keyboardNavOption].description + '</td>');
		description.push('</tr>');

		return description;
	},
	generateContentOption: function(option, index, array, elem) {
		var module = modules[option.moduleID];
		if (!module) return;

		var description = [];

		description.push('<tr>');
		description.push('<td>' + module.category + '</td>');

		description.push('<td>');
		description.push(modules['settingsNavigation'].makeUrlHashLink(option.moduleID, null, module.moduleName));
		description.push('</td>');

		description.push('<td>');
		description.push(option.key ? modules['settingsNavigation'].makeUrlHashLink(option.moduleID, option.key) : '&nbsp;');
		description.push('</td>');

		if (module.options[option.key]) {
			description.push('</tr><tr>');
			description.push('<td colspan="3">' + module.options[option.key].description + '</td>');
		}
		description.push('</tr>');

		return description;
	},
	consoleTip: {
		message: 'Roll over the gear icon <span class="gearIcon"></span> and click "settings console" to explore the RES settings.  You can enable, disable or change just about anything you like/dislike about RES!<br><br>Once you\'ve opened the console once, this message will not appear again.',
		attachTo: '#openRESPrefs',
		position: 5
	},
	tips: [{
			message: 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, or just help getting a question answered, be sure to subscribe to <a href="/r/Enhancement">/r/Enhancement</a>.',
			attachTo: '#openRESPrefs',
			position: 5
		}, {
			message: 'Click the tag icon next to a user to tag that user with any name you like - you can also color code the tag.',
			attachTo: '.RESUserTagImage:visible',
			position: 3,
			option: { moduleID: 'userTagger' }
		},
		{
			message: 'If your RES data gets deleted or you move to a new computer, you can restore it from backup. <br><br><b>Firefox</b> especially sometimes loses your RES settings and data. <br><br><a href="/r/Enhancement/wiki/backing_up_res_settings" target="_blank">Learn where RES stores your data and settings</a></p>',
			title: 'Back up your RES data!'
		},
		{
			message: 'Don\'t forget to subscribe to <a href="/r/Enhancement">/r/Enhancement</a> to keep up to date on the latest versions of RES or suggest features! For bug reports, submit to <a href="/r/RESIssues">/r/RESIssues</a>'
		},
		{
			message: 'Don\'t want to see posts containing certain keywords? Want to filter out certain subreddits from /r/all? Try the filteReddit module!' ,
			option: { moduleID: 'filteReddit' }
		},
		{
			message: 'Keyboard Navigation is one of the most underutilized features in RES. You should try it!' ,
			option: { moduleID: 'keyboardNav' },
			keyboard: 'toggleHelp'
		}, {
			message: 'Did you know you can configure the appearance of a number of things in RES? For example: keyboard navigation lets you configure the look of the "selected" box, and commentBoxes lets you configure the borders / shadows.',
			option: [{
				moduleID: 'keyboardNav',
				key: 'focusBGColor'
			}, {
				moduleID: 'styleTweaks',
				key: 'commentBoxes'
			}]
		},

		{
			message: 'Do you subscribe to a ton of subreddits? Give the subreddit tagger a try; it can make your homepage a bit more readable.',
			option: {
				moduleID: 'subRedditTagger'
			}
		}, {
			message: 'If you haven\'t tried it yet, Keyboard Navigation is great. Just hit ? while browsing for instructions.',
			option: {
				moduleID: 'keyboardNav'
			},
			keyboard: 'toggleHelp'
		}, {
			message: 'Roll over a user\'s name to get information about them such as their karma, and how long they\'ve been a reddit user.',
			option: {
				moduleID: 'userTagger',
				key: 'hoverInfo'
			}
		}, {
			message: 'Hover over the "parent" link in comments pages to see the text of the parent being referred to.',
			option: {
				moduleID: 'showParent'
			}
		}, {
			message: 'You can configure the color and style of the User Highlighter module if you want to change how the highlights look.',
			option: {
				moduleID: 'userHighlight'
			}
		}, {
			message: 'Not a fan of how comments pages look? You can change the appearance in the Style Tweaks module',
			option: {
				moduleID: 'styleTweaks'
			}
		}, {
			message: 'Don\'t like the style in a certain subreddit? RES gives you a checkbox to disable styles individually - check the right sidebar!'
		}, {
			message: 'Looking for posts by submitter, post with photos, or posts in IAmA form? Try out the comment navigator.'
		}, {
			message: 'Have you seen the <a href="/r/Dashboard">RES Dashboard</a>? It allows you to do all sorts of great stuff, like keep track of lower traffic subreddits, and manage your <a href="/r/Dashboard#userTaggerContents">user tags</a> and <a href="/r/Dashboard#newCommentsContents">thread subscriptions</a>!',
			options: {
				moduleID: 'dashboard'
			}
		}, {
			message: 'Sick of seeing these tips?  They only show up once every 24 hours, but you can disable that in the RES Tips and Tricks preferences.',
			option: {
				moduleID: 'RESTips'
			}
		}, {
			message: 'Did you know that there is now a "keep me logged in" option in the Account Switcher? Turn it on if you want to stay logged in to Reddit when using the switcher!',
			option: {
				moduleID: 'accountSwitcher',
				key: 'keepLoggedIn'
			}
		}, {
			message: 'See that little [vw] next to users you\'ve voted on?  That\'s their vote weight - it moves up and down as you vote the same user up / down.',
			option: {
				moduleID: 'userTagger',
				key: 'vwTooltip'
			}
		}
	],
	tour: [
		// array of guiders will go here... and we will add a "tour" button somewhere to start the tour...
	],
	initTips: function() {
		$('body').on('click', '#disableDailyTipsCheckbox', modules['RESTips'].disableDailyTipsCheckbox);

		// create the special "you have never visited the console" guider...
		this.createGuider(0, 'console');
		for (var i = 0, len = this.tips.length; i < len; i++) {
			this.createGuider(i);
		}
	},
	createGuider: function(i, special) {
		var thisID, thisTip;

		if (special === 'console') {
			thisID = special;
			thisTip = this.consoleTip;
		} else {
			thisID = 'tip' + i;
			thisTip = this.tips[i];
		}
		var title = modules['RESTips'].generateTitle(thisTip),
			len = this.tips.length,
			description = modules['RESTips'].generateContent(thisTip),
			attachTo = thisTip.attachTo,
			nextidx = ((parseInt(i + 1, 10)) >= len) ? 0 : (parseInt(i + 1, 10)),
			nextID = 'tip' + nextidx,
			thisChecked = (modules['RESTips'].options.dailyTip.value) ? 'checked="checked"' : '',
			guiderObj;

		guiderObj = {
			attachTo: attachTo,
			buttons: [{
				name: 'Prev',
				onclick: modules['RESTips'].prevTip
			}, {
				name: 'Next',
				onclick: modules['RESTips'].nextTip
			}],
			description: description,
			buttonCustomHTML: '<label class="stopper"> <input type="checkbox" name="disableDailyTipsCheckbox" id="disableDailyTipsCheckbox" ' + thisChecked + ' />Show these tips once every 24 hours</label>',
			id: thisID,
			next: nextID,
			position: this.tips[i].position,
			xButton: true,
			title: title
		};
		if (special === 'console') {
			delete guiderObj.buttonCustomHTML;
			delete guiderObj.next;
			delete guiderObj.buttons;

			guiderObj.title = 'RES is extremely configurable';
		}

		guiders.createGuider(guiderObj);
	},
	showTip: function(idx, special) {
		if (typeof this.tipsInitialized === 'undefined') {
			this.initTips();
			this.tipsInitialized = true;
		}

		if (!special) {
			guiders.show('tip' + idx);
		} else {
			guiders.show('console');
		}

		$('body').on('keyup', modules['RESTips'].handleEscapeKey);
	},
	hideTip: function() {
		guiders.hideAll();
		$('body').off('keyup', modules['RESTips'].handleEscapeKey);
	}
});
