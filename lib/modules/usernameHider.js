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
	description: 'This module hides your real username when you\'re logged in to reddit.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i,
		/https?:\/\/reddit.com\/[-\w\.\/]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var userNameEle = document.querySelector('#header-bottom-right > span > a');
			userNameEle.textContent = this.options.displayText.value;
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
					modules['usernameHider'].hideUsername(event.target);
				}
			}, true);
			this.hideUsername();
		}
	},
	hideUsername: function(ele) {
		ele = ele || document;
		var authors = ele.querySelectorAll('.author');
		for (var i=0, len=authors.length; i<len;i++) {
			if (authors[i].textContent == RESUtils.loggedInUser()) {
				authors[i].textContent = modules['usernameHider'].options.displayText.value;
			}
		}
	
	}
};
