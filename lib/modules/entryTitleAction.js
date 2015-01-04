modules['entryTitleAction'] = {
	moduleID: 'entryTitleAction',
	moduleName: 'Entry Title Action',
	category: 'UI',
	options: {
		actionBehavior: {
			type: 'enum',
			values: [
				{ name: 'Open the content (reddit\'s default action).', value: 'link' },
				{ name: 'Open the comments.', value: 'comments' }
			],
			value: 'comments',
			description: 'What action should take place when the entry is clicked.'
		},
		focusBehavior: {
			type: 'enum',
			values: [
				{ name: 'Open in new tab and switch to that tab.', value: 'foreground' },
				{ name: 'Open in new tab and don\'t switch tabs.', value: 'background' }
			],
			value: 'background',
			description: 'Where the link opens.'
		}
	},
	description: 'Adds the ability to modify the behavior when clicking the entry\'s title.<br /><br />Note: <b>This changes reddit\'s default behavior.</b>',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[-\w\._]*\//i
	],
	exclude: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[-\w\._\/\?]*\/comments[-\w\._\/\?=]*/i
	],
	beforeLoad: function() {
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.applyLinks();
			// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get affected.
			RESUtils.watchForElement('siteTable', modules['entryTitleAction'].applyLinks);
		}
	},
	applyLinks: function(ele) {
		selector = '#siteTable .entry, #siteTable_organic .entry';

		ele = ele || document;
		var entries = ele.querySelectorAll(selector);

		for (var i=0, len=entries.length; i<len; i++) {
			if ((typeof entries[i] !== 'undefined') && (!entries[i].classList.contains('entryTitleActionTagged'))) {
				entries[i].classList.add('entryTitleActionTagged')
				var thisLA = entries[i].querySelector('A.title');
				if (thisLA !== null) {
					var thisLink = thisLA.getAttribute('href');
					var thisComments = entries[i].querySelector('.comments');
					if (!(thisLink.match(/^https?/i))) {
						thisLink = location.protocol + '//' + document.domain + thisLink;
					}

					// Set attributes for retrieval later based on settings.
					thisLA.setAttribute('entryTitleActionLink', thisLA.href)
					thisLA.setAttribute('entryTitleActionComments', thisComments.href)

					// TODO: Webkit won't trigger click events on middle click using the 'click' event.  
					// ?? We should still preventDefault on a click though, maybe?
					thisLA.addEventListener('click', function(e) {
						e.preventDefault();

						if (e.button !== 2) {
							// Retrieve attributes based on settings.
							var thisLink = ''
							if (modules['entryTitleAction'].options.actionBehavior.value == 'link') {
								thisLink = $(this).parent().parent().parent().find('a.title').attr('entryTitleActionLink');
							}
							else if (modules['entryTitleAction'].options.actionBehavior.value == 'comments') {
								thisLink = $(this).parent().parent().parent().find('a.title').attr('entryTitleActionComments');
							}

							// check if it's a relative link (no http://domain) because chrome barfs on these when creating a new tab...
							if (!(thisLink.match(/^http/i))) {
								thisLink = 'http://' + document.domain + thisLink;
							}

							var thisJSON = {
								requestType: 'entryTitleAction',
								linkURL: thisLink,
								isBackground: (modules['entryTitleAction'].options.focusBehavior.value === 'background') ? true : false,
								ctrl: e.ctrlKey
							};

							// Post the action.
							var foundBrowserType = modules['entryTitleAction'].postMessageJSON(thisJSON);

							// If can't find browser type, just try to open the url.
							if (!foundBrowserType) {
								// Foreground/background setting doesn't matter here.
								window.open(thisLink);
							}
						}
					}, false);
				}
			}
		}
	},
	postMessageJSON: function(aJSON) {
		if (BrowserDetect.isChrome()) {
			chrome.extension.sendMessage(aJSON);
		}
		else if (BrowserDetect.isSafari()) {
			safari.self.tab.dispatchMessage("entryTitleAction", aJSON);
		}
		else if (BrowserDetect.isOpera()) {
			opera.extension.postMessage(JSON.stringify(aJSON));
		}
		else if (BrowserDetect.isFirefox()) {
			self.postMessage(aJSON);
		}
		else {
			return false;
		}

		return true;
	}
};
