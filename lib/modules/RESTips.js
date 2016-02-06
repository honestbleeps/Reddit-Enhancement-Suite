addModule('RESTips', (module, moduleID) => {
	module.moduleName = 'RES Tips and Tricks';
	module.category = ['About RES'];
	module.description = 'Adds tips/tricks help to RES console';
	module.options = {
		dailyTip: {
			type: 'boolean',
			value: true,
			description: 'Show a random tip once every 24 hours.'
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.menuItem = RESUtils.createElement('div', 'RESTipsMenuItem');
			this.menuItem.textContent = 'tips & tricks';

			modules['RESMenu'].addMenuItem(this.menuItem, randomTip);

			if (this.options.dailyTip.value) {
				dailyTip();
			}
		}
	};

	function handleEscapeKey(event) {
		if (event.which === 27) {
			module.hideTip();
		}
	}

	let currTip;

	async function dailyTip() {
		const lastCheck = parseInt(await RESEnvironment.storage.get('RESLastToolTip'), 10) || 0;
		const now = Date.now();
		// 86400000 = 1 day
		if ((now - lastCheck) > 86400000) {
			// mark off that we've displayed a new tooltip
			RESEnvironment.storage.set('RESLastToolTip', now);
			if (lastCheck === 0) {
				module.showTip(0);
			} else {
				setTimeout(randomTip, 500);
			}
		}
	}

	function randomTip() {
		currTip = Math.floor(Math.random() * tips.length);
		module.showTip(currTip);
	}

	module.disableDailyTipsCheckbox = function(e) {
		module.options.dailyTip.value = e.target.checked;
		RESUtils.options.saveModuleOptions('RESTips');
	};

	function nextTip() {
		if (typeof currTip === 'undefined') currTip = 0;
		nextPrevTip(1);
	}

	function prevTip() {
		if (typeof currTip === 'undefined') currTip = 0;
		nextPrevTip(-1);
	}

	function nextPrevTip(idx) {
		if (typeof currTip === 'undefined') currTip = 0;
		module.hideTip();
		currTip += idx;
		if (currTip < 0) {
			currTip = tips.length - 1;
		} else if (currTip >= tips.length) {
			currTip = 0;
		}
		module.showTip(currTip);
	}

	function generateTitle(help) {
		return help.title || 'RES Tips and Tricks';
	}

	function generateContent(help, elem) {
		const description = [];

		if (help.message) description.push(help.message);

		if (help.keyboard) {
			// TODO: microtemplate
			const disabled = !modules['keyboardNav'].isEnabled();
			description.push('<h2 class="keyboardNav' + (disabled ? 'keyboardNavDisabled' : '') + '">');
			description.push('Keyboard Navigation' + (disabled ? ' (disabled)' : ''));
			description.push('</h2>');

			const keyboardTable = RESUtils.createElement.table(help.keyboard, generateContentKeyboard, elem);
			if (keyboardTable) description.push(keyboardTable);
		}

		if (help.option) {
			description.push('<h2 class="settingsPointer">');
			description.push('<span class="gearIcon"></span> RES Settings');
			description.push('</h2>');

			const optionTable = RESUtils.createElement.table(help.option, generateContentOption, elem);
			if (optionTable) description.push(optionTable);
		}

		return description.join('\n');
	}

	function generateContentKeyboard(keyboardNavOption) {
		const keyCode = modules['keyboardNav'].getNiceKeyCode(keyboardNavOption);
		if (!keyCode) return;

		const description = [];
		description.push('<tr>');
		description.push('<td><code>' + keyCode.toLowerCase() + '</code></td>');
		description.push('<td>' + keyboardNavOption + '</td>');
		description.push('</tr><tr>');
		description.push('<td>&nbsp;</td>'); // for styling
		description.push('<td>' + modules['keyboardNav'].options[keyboardNavOption].description + '</td>');
		description.push('</tr>');

		return description;
	}

	function generateContentOption(option) {
		const _module = modules[option.moduleID];
		if (!_module) return;

		const description = [];

		description.push('<tr>');
		description.push('<td>' + _module.category + '</td>');

		description.push('<td>');
		description.push(modules['settingsNavigation'].makeUrlHashLink(option.moduleID, null, _module.moduleName));
		description.push('</td>');

		description.push('<td>');
		description.push(option.key ? modules['settingsNavigation'].makeUrlHashLink(option.moduleID, option.key) : '&nbsp;');
		description.push('</td>');

		if (_module.options[option.key]) {
			description.push('</tr><tr>');
			description.push('<td colspan="3">' + _module.options[option.key].description + '</td>');
		}
		description.push('</tr>');

		return description;
	}

	const consoleTip = {
		message: 'Roll over the gear icon <span class="gearIcon"></span> and click "settings console" to explore the RES settings.  You can enable, disable or change just about anything you like/dislike about RES!<br><br>Once you\'ve opened the console once, this message will not appear again.',
		attachTo: '#openRESPrefs',
		position: 5
	};
	const tips = [{
		message: 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, or just help getting a question answered, be sure to subscribe to <a href="/r/Enhancement">/r/Enhancement</a>.',
		attachTo: '#openRESPrefs',
		position: 5
	}, {
		message: 'Click the tag icon next to a user to tag that user with any name you like - you can also color code the tag.',
		attachTo: '.RESUserTagImage:visible',
		position: 3,
		option: { moduleID: 'userTagger' }
	}, {
		message: 'If your RES data gets deleted or you move to a new computer, you can restore it from backup. <br><br><b>Firefox</b> especially sometimes loses your RES settings and data. <br><br><a href="/r/Enhancement/wiki/backing_up_res_settings" target="_blank">Learn where RES stores your data and settings</a></p>',
		title: 'Back up your RES data!'
	}, {
		message: 'Don\'t forget to subscribe to <a href="/r/Enhancement">/r/Enhancement</a> to keep up to date on the latest versions of RES or suggest features! For bug reports, submit to <a href="/r/RESIssues">/r/RESIssues</a>'
	}, {
		message: 'Don\'t want to see posts containing certain keywords? Want to filter out certain subreddits from /r/all? Try the filteReddit module!',
		option: { moduleID: 'filteReddit' }
	}, {
		message: 'Keyboard Navigation is one of the most underutilized features in RES. You should try it!',
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
	}, {
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
	}];

	const initTips = RESUtils.once(() => {
		$('body').on('click', '#disableDailyTipsCheckbox', module.disableDailyTipsCheckbox);

		// create the special "you have never visited the console" guider...
		createGuider(0, 'console');
		for (let i = 0; i < tips.length; i++) {
			createGuider(i);
		}
	});

	function createGuider(i, special) {
		let thisID, thisTip;

		if (special === 'console') {
			thisID = special;
			thisTip = consoleTip;
		} else {
			thisID = 'tip' + i;
			thisTip = tips[i];
		}
		const title = generateTitle(thisTip);
		const len = tips.length;
		const description = generateContent(thisTip);
		const attachTo = thisTip.attachTo;
		const nextidx = ((parseInt(i + 1, 10)) >= len) ? 0 : (parseInt(i + 1, 10));
		const nextID = 'tip' + nextidx;
		const thisChecked = (module.options.dailyTip.value) ? 'checked="checked"' : '';

		const guiderObj = {
			attachTo,
			buttons: [{
				name: 'Prev',
				onclick: prevTip
			}, {
				name: 'Next',
				onclick: nextTip
			}],
			description,
			buttonCustomHTML: '<label class="stopper"> <input type="checkbox" name="disableDailyTipsCheckbox" id="disableDailyTipsCheckbox" ' + thisChecked + ' />Show these tips once every 24 hours</label>',
			id: thisID,
			next: nextID,
			onShow,
			onHide,
			position: tips[i].position,
			xButton: true,
			title
		};
		if (special === 'console') {
			delete guiderObj.buttonCustomHTML;
			delete guiderObj.next;
			delete guiderObj.buttons;

			guiderObj.title = 'RES is extremely configurable';
		}

		guiders.createGuider(guiderObj);
	}

	module.showTip = function(idx, special) {
		initTips();

		if (!special) {
			guiders.show('tip' + idx);
		} else {
			guiders.show('console');
		}

		$('body').on('keyup', handleEscapeKey);
	};

	module.hideTip = function() {
		guiders.hideAll();
		$('body').off('keyup', handleEscapeKey);
	};

	function onShow() {
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'tipstricks');
	}

	function onHide() {
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'tipstricks');
	}
});
