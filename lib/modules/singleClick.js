addModule('singleClick', function(module, moduleID) {
	module.moduleName = 'Single Click Opener';
	module.category = 'Browsing';
	module.description = 'Adds an [l+c] link that opens a link and the comments page in new tabs for you in one click.';
	module.options = {
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
	};
	module.exclude = [
		'comments',
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/subreddits\/?/i
	];
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.watchForElement('siteTable', applyLinks);
			applyLinks();
		}
	};
	function applyLinks(ele) {
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
					} else if (!(module.options.hideLEC.value)) {
						singleClickLink.textContent = '[l=c]';
					}
					singleClickLI.appendChild(singleClickLink);
					thisUL.appendChild(singleClickLI);
					// we have to switch to mousedown because Webkit is being a douche and not triggering click events on middle click.
					// ?? We should still preventDefault on a click though, maybe?
					singleClickLink.addEventListener('mousedown', function(e) {
						if (e.button !== 2) {
							e.preventDefault();
							// if openBackground is enabled, middle click
							var lcMouseBtn = e.button || (module.options.openBackground.value ? 1 : 0);
							// check if it's a relative link (no http://domain) because chrome barfs on these when creating a new tab...
							var thisLink = $(this).parent().parent().parent().find('a.title').attr('href');
							if (!/^http/i.test(thisLink)) {
								thisLink = location.protocol + '//' + document.domain + thisLink;
							}

							var thisJSON = {
								requestType: 'singleClick',
								linkURL: thisLink,
								openOrder: module.options.openOrder.value,
								commentsURL: this.getAttribute('thisComments'),
								button: lcMouseBtn,
								ctrl: e.ctrlKey
							};

							RESEnvironment.sendMessage(thisJSON);
						}
					}, false);
				}
			}
		}
	}
});
