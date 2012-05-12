modules['RESTips'] = {
	moduleID: 'RESTips',
	moduleName: 'RES Tips and Tricks',
	category: 'UI',
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
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			this.menuItem = createElementWithID('li','RESTipsMenuItem');
			this.menuItem.innerHTML = 'RES Tips and Tricks';
			this.menuItem.addEventListener('click', function(e) {
				modules['RESTips'].randomTip();
			}, false);
			$('#RESDropdownOptions').append(this.menuItem);
			
			if (this.options.dailyTip.value) {
				this.dailyTip();
			}
			/*
			guiders.createGuider({
			  attachTo: '#RESSettingsButton',
			  // buttons: [{name: "Next"}],
			  description: "Guiders are a user interface design pattern for introducing features of software. This dialog box, for example, is the first in a series of guiders that together make up a guide.",
			  id: "first",
			  // next: "second",
			  overlay: true,
			  xButton: true,
			  title: "Welcome to Guiders.js!"
			}).show();
			*/
			/*
			setTimeout(function() {
				guiders.createGuider({
					  attachTo: "#RESSettingsButton",
					  buttons: [{name: "Close"},
								{name: "Next"}],
					  description: "This is just some sorta test guider, here... woop woop.",
					  id: "first",
					  next: "second",
					  // offset: { left: -200, top: 120 },
					  position: 5,
					  title: "Guiders are typically attached to an element on the page."
				}).show();
				guiders.createGuider({
					  attachTo: "a.toggleImage:first",
					  buttons: [{name: "Close"},
								{name: "Next"}],
					  description: "An example of an image expando",
					  id: "second",
					  next: "third",
					  // offset: { left: -200, top: 120 },
					  position: 3,
					  title: "Guiders are typically attached to an element on the page."
				});
			}, 2000);
			*/
		}
	},
	dailyTip: function() {
		var lastCheck = parseInt(RESStorage.getItem('RESLastToolTip')) || 0;
		var now = new Date();
		// 86400000 = 1 day
		if ((now.getTime() - lastCheck) > 86400000) {
			// mark off that we've displayed a new tooltip
			RESStorage.setItem('RESLastToolTip',now.getTime());
			if (lastCheck == 0) {
				//var thisTip = 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, bug reports, etc - head over to <a href="http://reddit.com/r/Enhancement">/r/Enhancement</a>.<br>Do you keep seeing this message? <a target=\"_blank\" href=\"http://reddit.honestbleeps.com/faq\">see the FAQ</a> about BetterPrivacy and similar addons.';
				this.showTip(0);
			} else {
				setTimeout(function() {
					modules['RESTips'].randomTip();
				}, 500);
			}
		}
	},
	randomTip: function() {
		this.currTip = Math.floor(Math.random()*this.tips.length);
		this.showTip(this.currTip);
	},
	disableDailyTipsCheckbox: function(e) {
		modules['RESTips'].options.dailyTip.value = e.target.checked;
		RESStorage.setItem('RESoptions.RESTips', JSON.stringify(modules['RESTips'].options));
	},
	nextTip: function() {
		if (typeof(this.currTip) == 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(1);
	},
	prevTip: function() {
		if (typeof(this.currTip) == 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(-1);
	},
	nextPrevTip: function(idx) {
		if (typeof(this.currTip) == 'undefined') this.currTip = 0;
		// if (idx<0) guiders.hideAll();
		guiders.hideAll();
		this.currTip += idx;
		if (this.currTip < 0) {
			this.currTip = this.tips.length-1;
		} else if (this.currTip >= this.tips.length) {
			this.currTip = 0;
		}
		this.showTip(this.currTip);
	},
	tips: Array(
		{
			message: 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, bug reports, or just help getting a question answered, be sure to subscribe to <a href="http://reddit.com/r/Enhancement">/r/Enhancement</a>.'
		},
		{ 
			message: "Most of RES is configurable. Roll over the gear icon and click the settings console link to check it out.",
			attachTo: "#openRESPrefs",
			position: 5
		},
		{ 
			message: "Click the tag icon next to a user to tag that user with any name you like - you can also color code the tag.",
			attachTo: ".RESUserTagImage:visible",
			position: 3
		},
		{ message: "Don't forget to subscribe to <a href=\"http://reddit.com/r/Enhancement\">/r/Enhancement</a> to keep up to date on the latest versions of RES, report bugs, or suggest features!" },
		{ message: "Don't want to see posts containing certain keywords? Want to filter out certain subreddits from /r/all? Try the filteReddit module!" },
		{ message: "Keyboard Navigation is one of the most underutilized features in RES. You should try it!  Hit the ? key (shift-/) to see a list of commands." },
		{ message: "Did you know you can configure the appearance of a number of things in RES? For example: Keyboard navigation lets you configure the look of the 'selected' box, and commentBoxes lets you configure the borders / shadows." },
		{ message: "Do you subscribe to a ton of reddits? Give the subreddit tagger a try, it can make your homepage a bit more readable." },
		{ message: "If you haven't tried it yet, Keyboard Navigation is great. Just hit ? while browsing for instructions." },
		{ message: "Roll over a user's name to get information about them such as their karma, and how long they've been a reddit user." },
		{ message: "Hover over the 'parent' link in comments pages to see the text of the parent being referred to." },
		{ message: "You can configure the color and style of the User Highlighter module if you want to change how the highlights look." },
		{ message: "Not a fan of how comments pages look? You can change the appearance in the Style Tweaks module" },
		{ message: "Don't like the style in a certain subreddit? RES gives you a checkbox to disable styles individually - check the right sidebar!" },
		{ message: "Looking for posts by submitter, post with photos, or posts in IAmA form? Try out the comment navigator." },
		{ message: "Have you seen the RES Dashboard? It allows you to do all sorts of great stuff, like keep track of lower traffic subreddits, and manage your user tags and thread subscriptions!" },
		{ message: "Sick of seeing these tips?  They only show up once every 24 hours, but you can disable that in the RES Tips and Tricks preferences." },
		{ message: "Did you know that there is now a 'keep me logged in' option in the Account Switcher? Turn it on if you want to stay logged in to Reddit when using the switcher!" },
		{ message: "See that little [vw] next to users you've voted on?  That's their vote weight - it moves up and down as you vote the same user up / down." }
	),
	tour: [
		// array of guiders will go here... and we will add a "tour" button somewhere to start the tour...
	],
	initTips: function() {
		$('#disableDailyTipsCheckbox').live('click', modules['RESTips'].disableDailyTipsCheckbox);
		for (var i=0, len=this.tips.length; i<len; i++) {
			var thisID = "tip"+i;
			var nextidx = ((parseInt(i+1)) >= len) ? 0 : (parseInt(i+1));
			var nextID = "tip"+nextidx;
			var thisChecked = (modules['RESTips'].options.dailyTip.value) ? 'checked="checked"' : '';
			/*
			if (! this.tips[i].attachTo) {
				return false;
			}
			*/
			guiders.createGuider({
				  attachTo: this.tips[i].attachTo,
				  buttons: [{
								name: "Prev",
								onclick: modules['RESTips'].prevTip
							},
							{
								name: "Next",
								onclick: modules['RESTips'].nextTip
							}],
				  buttonCustomHTML: "<input type=\"checkbox\" id=\"disableDailyTipsCheckbox\" "+thisChecked+" /><label for=\"disableDailyTipsCheckbox\" class=\"stopper\"> Show these tips once every 24 hours</label>",
				  description: this.tips[i].message,
				  id: thisID,
				  next: nextID,
				  position: this.tips[i].position,
				  xButton: true,
				  title: "RES Tips and Tricks"
			});
		}
	
	},
	showTip: function(idx) {
		if (typeof(this.tipsInitialized) == 'undefined') {
			this.initTips();
			this.tipsInitialized = true;
		}
		guiders.show('tip'+idx);
	},
	showGuider: function(guiderID) {
		guiders.show(guiderID);
	}
};
