addModule('noParticipation', function(module, moduleID) {
	var baseUrl =  [ location.protocol, '//', 'reddit.com' ].join('');
	var urls = {
		moreinfo: baseUrl + '/r/NoParticipation/wiki/intro',
		rules: baseUrl + '/rules'
	};

	module.moduleName = 'No Participation';
	module.description = 'Helps discourage brigading and helps you avoid getting banned, by warning against voting \
		or commenting when following "No Participation" (np) links, and by providing options to prevent you from \
		accidentally participating. \
		<p><a href="' + urls.moreinfo + '" target="_blank">Find out more about "No Participation".</a></p>';

	module.category = ['Comments', 'Subreddits'];

	module.options = {
		disableVoteButtons: {
			type: 'boolean',
			value: false,
			description: 'Hide vote buttons. If you have already visited the page and voted, your prior votes will still be visible.'
		},
		disableCommentTextarea: {
			type: 'boolean',
			value: false,
			description: 'Disable commenting.'
		},
		evenIfSubscriber: {
			type: 'boolean',
			value: false,
			description: 'Enable NP mode in subreddits where you\'re a subscriber'
		},
		escapeNP: {
			type: 'boolean',
			value: true,
			description: 'Remove np mode when leaving a No-Participation page'
		}
	};

	module.include = [
		/^https?:\/\/(?:.*\.)?(?:\w+-)?np(?:-\w+)?\.reddit\.com\/*/i  // np.reddit.com, np-nm.reddit.com, nm-np.reddit.com, www.np.reddit.com, www.np-nm.reddit.com
	];

	var boilerplateNotificationText = '	\
		<p><label class="RES-spoiler">Hover here for more details</label> <span class="RES-spoiler-contents">You came to this page by following a <a data-np="moreinfo" target="_blank">NP</a> link, so you may be interfering with normal conversation. \
		Please respect reddit\'s <a data-np="rules" target="_blank">rules</a> by not commenting or voting. Violating these rules may get you banned.\
		<a data-np="moreinfo" target="_blank">Find out more</a></span></p>';

	var noParticipationActive;

	module.go = function() {
		if (this.isEnabled() && this.isMatchURL()) {
			if (module.options.escapeNP.value) {
				document.body.addEventListener('mousedown', removeNpFromLink);
			}

			if (isNPIrrelevant()) {
				notifyNpIrrelevant();
			} else if (RESUtils.loggedInUser()) {
				if ((RESUtils.pageType() === 'comments' || RESUtils.pageType() === 'linklist') && !(document.body.classList.contains('front-page') || document.body.classList.contains('profile-page'))) {
					applyNoParticipationMode();
				} else {
					notifyNpIrrelevant();
				}

				if (module.options.disableCommentTextarea.value) {
					RESUtils.addCSS('.usertext textarea[disabled] { background-color: #ccc; }');
				}
			}
		}
	};

	var npHrefRegex = /^https?:\/\/(?:[\w\.]*)np\.reddit\.com\//;
	var removeNpRegexp = /^https?:\/\/(?:[\w\.]*)?reddit\.com(.*)/;
	var replaceNpWith = document.location.protocol + '//www.reddit.com';
	function removeNpFromLink(event) {
		var elem = event.target, hrefSansNp;
		if (elem.tagName !== 'A') return;
		if (elem.matches('.md a')) return;
		var href = elem.getAttribute('href');
		if (href[0] === '/') {
			hrefSansNp = replaceNpWith + href;
		} else if (npHrefRegex.test(href)) {
			hrefSansNp = replaceNpWith + href.match(removeNpRegexp)[1];
		}

		if (hrefSansNp) {
			elem.setAttribute('href', hrefSansNp);
		}
	}

	function isNPIrrelevant() {
		var irrelevant = false;
		if (RESUtils.pageType() !== 'comments') {
			if (isSubscriber() && !module.options.evenIfSubscriber.value) {
				irrelevant = true;
			}
		}

		return irrelevant;
	}

	module.isVotingBlocked = function() {
		return noParticipationActive && module.options['disableVoteButtons'].value;
	};
	module.notifyNoVote = notifyNoVote;

	function isSubscriber() {
		return (document.body.classList.contains('subscriber'));
	}

	function setLinkUrls(urls, container) {
		$(container).find('[data-np]').each(function(index, element) {
			var key = element.getAttribute('data-np');
			var url = urls[key] || baseUrl;
			element.setAttribute('href', url);
		});
	}

	function notifyNpIrrelevant() {
		urls.leavenp = [ baseUrl, location.pathname, location.search, location.hash ].join('');
		var message = 'You\'re still browsing in <a data-np="moreinfo" target="_blank">No Participation</a> mode, but it\'s no longer necessary.';
		if (isSubscriber()) {
			message = 'You\'re browsing in <a data-np="moreinfo" target="_blank">No Participation</a> mode, but you\'re a subscriber here.';
		}

		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'ok-participation',
			closeDelay: 3000,
			header: 'Okay to Participate',
			message: message + ' \
				<p><a data-np="leavenp">Click here to return to normal reddit</a></p>'
		});

		setLinkUrls(urls, notification.element);
	}

	function notifyNpActive() {
		var message  = '<strong><span class="res-icon">&#xF15A;</span> Do not vote or comment.</strong>';
		if (isSubscriber()) {
			message = '<span class="res-icon">&#xF15A;</span> Please think before you comment or vote, and remember the subreddit\'s rules. Although you subscribe to this subreddit, you can still derail a particular thread.  <p><a data-np="leavenp">Click here to return to normal reddit.</a></p>';
		}
		message += boilerplateNotificationText;


		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'no-participation',
			closeDelay: 10000,
			header: 'No Participation',
			message: message
		});

		setLinkUrls(urls, notification.element);
	}

	var votedOnButtons = [];
	function notifyNoVote(voteButton) {
		var canUndoVote = $(voteButton).is('.upmod, .downmod');

		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: 'disableVoteButtons',
			cooldown: 5000,
			header: 'No Participation',
			message: '<strong><span class="res-icon">&#xF15A;</span> Do not vote.</strong>' + boilerplateNotificationText +
				(canUndoVote ? '<p><button type="button" class="redButton" data-np="revertvote">Undo vote</button></p>' : '')
		});

		if (notification) {
			setLinkUrls(urls, notification.element);
			$(notification.element).find('[data-np=revertvote]').on('click', function(e) {
				revertVote(votedOnButtons, true);
				notification.close();
			});
		}

		votedOnButtons.push(voteButton);
	}

	function notifyNoComment() {
		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: 'disableCommentTextarea',
			header: 'No Participation',
			message: '<strong><span class="res-icon">&#xF15A;</span> Do not comment.</strong>' + boilerplateNotificationText
		});

		setLinkUrls(urls, notification.element);
	}

	function applyNoParticipationMode() {
		noParticipationActive = true;

		notifyNpActive();

		if (module.options['disableVoteButtons'].value) {
			hideVoteButtons();
		}

		watchForVote();
		RESUtils.watchForElement('newComments', watchForVote);

		watchForComment();
		RESUtils.watchForElement('newCommentsForms', watchForComment);
	}

	function hideVoteButtons() {
		RESUtils.addCSS('.arrow.up:not(.upmod), .arrow.down:not(.downmod) { visibility: hidden; }');
	}

	function watchForVote(container) {
		container = container || document.body;

		$(container).on('click', '.arrow', onClickVote);
	}

	function onClickVote(e) {
		onVote(e.target);
	}

	function onVote(voteButton) {
		if (!voteButton.classList.contains('upmod') && !voteButton.classList.contains('downmod')) {
			return;
		}

		notifyNoVote(voteButton);
	}

	function revertVote(voteButtons, immediately) {
		if (!voteButtons.length) {
			voteButtons = [ voteButtons ];
		}
		setTimeout(_revertVote, (immediately ? 0 : 500));

		function _revertVote() {
			voteButtons.forEach(function(voteButton, index) {
				setTimeout(function() {
					if (voteButton.classList.contains('upmod') || voteButton.classList.contains('downmod')) {
						RESUtils.click(voteButton);
					}
				}, index * 2000 /* respect API limits */);
			});

			var notification = modules['notifications'].showNotification({
				moduleID: moduleID,
				optionKey: 'disableVoteButtons',
				header: 'No Participation',
				message: (voteButtons.length > 1 ? 'Your votes are being reverted.' : 'Your vote has been reverted.') + '	\
					Please remember not to vote!	\
					<p><a data-np="moreinfo" target="_blank">Find out more</a></p>	\
					'
			});
			setLinkUrls(urls, notification.element);
		}
	}

	var alreadyNotified = false;
	function watchForComment(container) {
		container = container || document.body;

		var textareas = modules['commentTools'].getCommentTextarea(container);

		textareas.one('keydown', function() {
			if (alreadyNotified) return;
			alreadyNotified = true;

			notifyNoComment();
		});

		if (module.options.disableCommentTextarea.value) {
			textareas.attr('disabled', true);
		}
	}
});
