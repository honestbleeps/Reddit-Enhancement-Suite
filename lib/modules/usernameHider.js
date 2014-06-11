modules['usernameHider'] = {
	moduleID: 'usernameHider',
	moduleName: 'Username Hider',
	category: 'Accounts',
	options: {
		displayText: {
			type: 'text',
			value: '~anonymous~',
			description: 'What to replace your username with, default is ~anonymous~'
		}
	},
	description: 'Username hider hides your username from displaying on your screen when you\'re logged in to reddit. \
	This way, if someone looks over your shoulder at work, or if you take a screenshot, your reddit username is not shown. \
	This only affects your screen. There is no way to post or comment on reddit without your post being linked to the account \
	you made it from.',
	
// once mouseover shows real name (see issues/1139), add the following text to the description:
// Mousing over the text hiding your username reveals your real username. This makes it easy to double check \
// that you're commenting/posting from the correct account, while still keeping your username hidden from prying eyes. \

	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (!RESUtils.loggedInUser(true)) {
				this.tryAgain = true;
				return false;
			}
			this.hideUsername();
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.tryAgain && RESUtils.loggedInUser()) {
				this.hideUsername();
				RESUtils.addStyle(RESUtils.css);
			}
		}
	},
	hideUsername: function() {
		var user = RESUtils.loggedInUser(),
			curatedBy = document.querySelector('.multi-details > h2 a');
		RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\'], #header .user > a, .titlebox .tagline a.author, .commentingAs, .bottom a[href*=\'/' + user + '\'] {line-height:0;font-size:0;content:none;}');
		RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\']:after, #header .user > a:after, .titlebox .tagline a.author:after, .bottom a[href*=\'/' + user + '\']:after {content: "' + this.options.displayText.value + '";letter-spacing:normal;font-size:10px;}');
		RESUtils.addCSS('.commentingAs:after {content: "Commenting as: ' + this.options.displayText.value + '";letter-spacing:normal;font-size:12px;}');
		if (modules['userHighlight'].isEnabled()) {
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:after, p.tagline > .moderator[href*=\'/' + user + '\']:after{background-color:inherit;padding:0 2px;font-weight:bold;border-radius:3px;color:#fff;}');
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:after{ background-color:' + modules['userHighlight'].options.OPColor.value + ';}');
			RESUtils.addCSS('p.tagline > .moderator[href*=\'/' + user + '\']:after{ background-color:' + modules['userHighlight'].options.modColor.value + ';}');
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:hover:after{ background-color:' + modules['userHighlight'].options.OPColorHover.value + ';}');
			RESUtils.addCSS('p.tagline > .moderator[href*=\'/' + user + '\']:hover:after{ background-color:' + modules['userHighlight'].options.modColorHover.value + ';}');
		}
		if (curatedBy && curatedBy.href.slice(-(user.length + 1)) === '/' + user) {
			curatedBy.textContent = 'curated by /u/' + this.options.displayText.value;
		}
	}
};
