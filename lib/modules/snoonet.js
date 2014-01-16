/*
modules['snoonet'] = {
	moduleID: 'snoonet',
	moduleName: 'Snoonet IRC',
	category: 'UI',
	options: {
	},
	description: 'Module to simplify adding snoonet IRC support to your subreddit(s)',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		// TODO: maybe don't depend on their sprite sheet?
		var css = '.icon-menu #enableSnoonet:before {';
		css += 'background-image: url(https://redditstatic.s3.amazonaws.com/sprite-reddit.hV9obzo72Pc.png);';
		css += 'background-position: 0px -708px;';
		css += 'background-repeat: no-repeat;';
		css += 'height: 16px;';
		css += 'width: 16px;';
		css += 'display: block;';
		css += 'content: " ";';
		css += 'float: left;';
		css += 'margin-right: 5px;';
		css += '}';
		RESUtils.addCSS(css);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if ($('body').hasClass('moderator')) {
				// if there's not yet a link to chat in the sidebar, add an item to the moderation tools box.
				var chatLink = $('.side .usertext-body').find('a[href*="webchat.snoonet.org"]');
				if (chatLink.length === 0) {
					$('#moderation_tools ul.flat-vert').prepend('<li><a id="enableSnoonet" target="_blank" href="http://api.snoonet.org/reddit/">Enable Live Chat</a> <a id="enableSnoonetHelp" title="what\'s this?" target="_blank" href="/r/Enhancement/wiki/enablechat">(?)</a></li>');
				}
			}
		}
	}
};
*/
