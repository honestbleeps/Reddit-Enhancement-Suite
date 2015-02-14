modules['singleClick'] = {
	moduleID: 'singleClick',
	moduleName: 'Single Click Opener',
	category: 'Posts',
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
		buttonLocation: {
			type: 'enum',
			value: 'addbutton',
			description: 'Add the [l+c] button or apply single-click to the link title',
			values: [{
				value: 'addbutton',
				name: 'add [l+c] button'
			}, {
				value: 'title-l+c',
				name: 'post title opens link and comments'
			}, {
				value: 'title-comments',
				name: 'post title opens comments'
			}]
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
		if (this.isEnabled() && this.isMatchURL()) {
			RESUtils.addCSS('.redditSingleClick { color: #888; font-weight: bold; cursor: pointer; padding: 0 1px; }');
		}
	},
	go: function() {
		if (this.isEnabled() && this.isMatchURL()) {
			this.applyLinks();
			RESUtils.watchForElement('siteTable', modules['singleClick'].applyLinks);
		}
	},
	applyLinks: function(ele) {
		ele = ele || document;
		var entries = ele.querySelectorAll('#siteTable .entry, #siteTable_organic .entry');
		for (var i = 0, len = entries.length; i < len; i++) {
			var entry = entries[i];
			if (!entry || $(entry).data('lcTagged')) continue;
			$(entry).data('lcTagged', true);

			var urls = modules['singleClick'].getThingUrls(entry);
			if (!urls) continue;

			var singleClickLink;
			switch (modules['singleClick'].options.buttonLocation.value) {
				case 'title-l+c':
				case 'title-comments':
					singleClickLink = entry.querySelector('a.title');
					break;
				case 'addbutton':
				default:
					singleClickLink = modules['singleClick'].createButton(entry, urls);
					break;
			}

			// we have to switch to mousedown because Webkit is being a douche and not triggering click events on middle click.
			singleClickLink.addEventListener('mousedown', modules['singleClick'].onClickSingleElement);
			// prevent clicks too
			singleClickLink.addEventListener('click', modules['singleClick'].onClickSingleElement);

		}
	},
	createButton: function (entry, urls) {
		var thisUL = entry.querySelector('ul.flat-list');
		var singleClickLI = document.createElement('li');
		// changed from a link to a span because you can't cancel a new window on middle click of a link during the mousedown event, and a click event isn't triggered.
		singleClickLink = document.createElement('span');
		// singleClickLink.setAttribute('href','javascript:void(0);');
		singleClickLink.setAttribute('class', 'redditSingleClick');
		singleClickLink.textContent = urls.link ? '[l+c]' : '[l=c]';

		singleClickLI.appendChild(singleClickLink);
		thisUL.appendChild(singleClickLI);

		return singleClickLink;
	},
	onClickSingleElement: function(e) {
		if (e.button === 2) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();

		if (e.type === 'click') {
			return;
		}

		var urls = modules['singleClick'].getThingUrls(e.target);

		var thisJSON = {
			requestType: 'singleClick',
			linkURL: urls.link || urls.comments,
			openOrder: modules['singleClick'].options.openOrder.value,
			commentsURL: urls.comments,
			button: (modules['singleClick'].options.openBackground.value) ? 1 : 0,
			ctrl: e.ctrlKey
		};

		BrowserStrategy.sendMessage(thisJSON);
	},
	getThingUrls: function (ele) {
		var thing = $(ele).closest('.thing')[0];
		var thisLink = (thisLink = thing.querySelector('a.title')) && thisLink.href;
		var thisComments = (thisComments = thing.querySelector('.comments')) && thisComments.href;
		var domain = (domain = thing.querySelector('.domain a')) && domain.href;
		if (!thisLink) return;

		if ((thisLink === thisComments) && modules['singleClick'].options.hideLEC.value) return;

		if (modules['singleClick'].options.buttonLocation === 'title-comments') {
			thisLink = false;
		} else if (RESUtils.subredditRegex.test(domain)) {
			thisLink = false;
		} else if (!/^http/i.test(thisLink)) {
			// turn relative urls (no http://domain) into absolute because chrome barfs on creating new tabs with relative urls
			thisLink = location.protocol + '//' + document.domain + thisLink;
		}

		return {
			link: thisLink,
			comments: thisComments
		}
	}
};
