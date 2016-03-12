addModule('singleClick', {
	moduleID: 'singleClick',
	moduleName: 'Single Click Opener',
	category: 'Browsing',
	options: {
		openOrder: {
			type: 'enum',
			values: [{
				name: 'open comments then link',
				value: 'commentsfirst'
			}, {
				name: 'open link then comments',
				value: 'linkfirst'
			}],
			value: 'commentsfirst',
			description: 'What order to open the link/comments in.'
		},
		hideLEC: {
			type: 'boolean',
			value: false,
			description: 'Hide the [l=c] when the link is the same as the comments page',
			advanced: true
		},
		openBackground: {
			type: 'boolean',
			value: false,
			description: 'Open the [l+c] link in background tabs'
		}
	},
	description: 'Adds an [l+c] link that opens a link and the comments page in new tabs for you in one click.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: [
		'all'
	],
	exclude: [
		'comments',
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/subreddits\/?/i
	],
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.redditSingleClick { color: #888; font-weight: bold; cursor: pointer; padding: 0 1px; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff here!
			this.applyLinks();
			// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...
			RESUtils.watchForElement('siteTable', modules['singleClick'].applyLinks);
		}
	},
	applyLinks: function(ele) {
		ele = ele || document;
		var entries = ele.querySelectorAll('#siteTable .entry, #siteTable_organic .entry');
		for (var i = 0, len = entries.length; i < len; i++) {
			if ((typeof entries[i] !== 'undefined') && (!entries[i].classList.contains('lcTagged'))) {
				entries[i].classList.add('lcTagged');
				var thisLA = entries[i].querySelector('A.title');
				if (thisLA !== null) {
					var thisLink = thisLA.href;
					var thisComments = (thisComments = entries[i].querySelector('.comments')) && thisComments.href;
					var thisUL = entries[i].querySelector('ul.flat-list');
					var singleClickLI = document.createElement('li');
					// changed from a link to a span because you can't cancel a new window on middle click of a link during the mousedown event, and a click event isn't triggered.
					var singleClickLink = document.createElement('span');
					// singleClickLink.setAttribute('href','javascript:void 0');
					singleClickLink.setAttribute('class', 'redditSingleClick');
					singleClickLink.setAttribute('thisLink', thisLink);
					singleClickLink.setAttribute('thisComments', thisComments);
					if (!$(entries[i]).closest('.thing').hasClass('self')) {
						singleClickLink.textContent = '[l+c]';
					} else if (!(modules['singleClick'].options.hideLEC.value)) {
						singleClickLink.textContent = '[l=c]';
					}
					singleClickLI.appendChild(singleClickLink);
					thisUL.appendChild(singleClickLI);
					// we have to switch to mousedown because Webkit is being a douche and not triggering click events on middle click.
					// ?? We should still preventDefault on a click though, maybe?
					singleClickLink.addEventListener('mousedown', modules['singleClick']._handleClick.bind(modules['singleClick'], thisLink, thisComments));
				}
			}
		}
	},
	_handleClick: function(thisLink, thisComments, e) {
		if (e.button === 2) {
			return;
		}
		e.preventDefault();
		// if openBackground is enabled, middle click
		var lcMouseBtn = e.button || (modules['singleClick'].options.openBackground.value ? 1 : 0);
		// check if it's a relative link (no http://domain) because chrome barfs on these when creating a new tab...
		if (!/^http/i.test(thisLink)) {
			thisLink = location.protocol + '//' + document.domain + thisLink;
		}

		var thisJSON = {
			requestType: 'singleClick',
			linkURL: thisLink,
			openOrder: modules['singleClick'].options.openOrder.value,
			commentsURL: thisComments,
			button: lcMouseBtn,
			ctrl: e.ctrlKey
		};

		RESEnvironment.sendMessage(thisJSON);
	}
});
