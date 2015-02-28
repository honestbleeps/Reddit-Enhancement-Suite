addModule('orangered', function(module, moduleID) {
	module.moduleName = 'Unread Messages'
	module.category = 'Comments';
	module.description = 'Helping you get your daily dose of orangereds';

	module.options = {
		openMailInNewTab: {
			description: 'When clicking the mail envelope or modmail icon, open mail in a new tab?',
			type: 'enum',
			value: false
		},
		showUnreadCount: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count next to orangereds?'
		},
		retroUnreadCount: {
			type: 'boolean',
			value: false,
			description: 'If you dislike the unread count provided by native reddit, you can replace it with the RES-style bracketed unread count',
			dependsOn: 'showUnreadCount'
		},
		showUnreadCountInTitle: {
			type: 'boolean',
			value: false,
			description: 'Show unread message count in page/tab title?'
		},
		showUnreadCountInFavicon: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count in favicon?'
		},
		unreadLinksToInbox: {
			type: 'boolean',
			value: false,
			description: 'Always go to the inbox, not unread messages, when clicking on orangered',
			advanced: true
		},
		hideModMail: {
			type: 'boolean',
			value: false,
			description: 'Hide the mod mail button in user bar.'
		}
	};

	module.go = function() {
		if (!(this.isEnabled() && this.isMatchURL())) return;

		if (module.options.openMailInNewTab.value) {
			$('#mail, #modmail').attr('target', '_blank');
		}

		if ((RESUtils.loggedInUser() !== null) && ((this.options.showUnreadCount.value) || (this.options.showUnreadCountInTitle.value) || (this.options.showUnreadCountInFavicon.value))) {
			// Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
			// removing text indent - on 11/14/11 reddit changed the mail sprites, so I have to change how this is handled..
			RESUtils.addCSS('#mail { top: 2px; min-width: 16px !important; width: auto !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
			// RESUtils.addCSS('#mail.havemail { top: 2px !important; margin-right: 1px; }');
			RESUtils.addCSS('#mail.havemail { top: 2px !important; }');
			if ((BrowserDetect.isChrome()) || (BrowserDetect.isSafari())) {
				// I hate that I have this conditional CSS in here but I can't figure out why it's needed for webkit and screws up firefox.
				RESUtils.addCSS('#mail.havemail { top: 0; }');
			}
			this.showUnreadCount();
		}
		if ((RESUtils.loggedInUser() !== null) && !this.options.showUnreadCount.value) {
			this.hideUnreadCount();
		}
		if (this.options.hideModMail.value) {
			RESUtils.addCSS('#modmail, #modmail + .separator { display:none; }');
		}
	}

	module.updateUnreadCount = function(count) {

	};
});
