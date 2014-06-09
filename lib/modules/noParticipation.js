addModule('noParticipation', function(module, moduleID) {
	var baseUrl =  [ window.location.protocol, '//', 'reddit.com' ].join('');
	var moreInfoUrl = baseUrl + '/r/NoParticipation/wiki/intro';

	module.moduleName = "No Participation";
	module.description = "Warn you against voting or commenting when following \"No Participation\" (np) links, \
		to discourage brigading and help you avoid getting banned, and provide options to prevent you from 	\
		participating accidentally.	\
		<p><a href=\"" + moreInfoUrl + "\" target=\"_blank\">Find out more about \"No Participation\".</a></p>	\
						";

	module.category = "Comments";

	module.options = {
		hideVoteButtons: {
			type: 'boolean',
			value: false,
			description: 'Hide vote buttons which you haven\'t voted on'
		},
		undoVoteAutomatically: {
			type: 'boolean',
			value: false,
			description: "If you upvote or downvote something, automatically reset the vote."
		},
		disableCommentTextarea: {
			type: 'boolean',
			value: false,
			description: "Disable commenting"
		}
	};

	module.include = [
		/^https?:\/\/(?:.*\.)?(?:\w+-)?np(?:-\w+)?\.reddit\.com\/*/i  // np.reddit.com, np-nm.reddit.com, nm-np.reddit.com, www.np.reddit.com, www.np-nm.reddit.com
	];

	var noParticipationActive;

	module.go = function() {
		if (this.isEnabled() && this.isMatchURL() && RESUtils.loggedInUser()) {

			if ((RESUtils.pageType() === 'comments' || RESUtils.pageType() === 'linklist') && !(document.body.classList.contains('front-page') || document.body.classList.contains('profile-page'))) {
				applyNoParticipationMode();
			} else {
				notifyNpIrrelevant();
			}

			if (module.options.disableCommentTextarea.value) {
				RESUtils.addCSS('.usertext textarea[disabled] { background-color: #ccc; }');
			}
		}
	};

	module.isVotingBlocked = function() {
		return noParticipationActive && module.options['hideVoteButtons'].value;
	};
	module.notifyNoVote = notifyNoVote;

	function notifyNpIrrelevant() {
		var reloadWithoutNp = [ baseUrl, window.location.pathname, window.location.search, window.location.hash ].join('');

		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'ok-participation',
			closeDelay: 3000,
			header: 'Okay to Participate',
			message: "You're browsing in No Participation mode, but it's not currently necessary.	\
				<p><a data-np=\"leavenp\" href=\"#\">Click here to return to normal reddit</a></p>"
		});

		$(notification.element).find('[data-np=leavenp]').attr('href', reloadWithoutNp);
	}

	function notifyNpActive() {
		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'no-participation',
			closeDelay: 3000,
			header: 'No Participation',
			message: "<strong>Do not vote or comment.</strong> \
				<p>Because you followed a link to here from another subreddit, voting or commenting on this page could result in your account getting banned. \
				<a href=\"#\" data-np=\"moreinfo\" target=\"_blank\">Find out more</a></p>"
		});

		$(notification.element).find("[data-np=moreinfo]").attr('href', moreInfoUrl);
	}

	function notifyNoVote(voteButton) {
		var canUndoVote = !module.options.undoVoteAutomatically.value && $(voteButton).is(".upmod,.downmod");

		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: 'undoVoteAutomatically',
			header: 'No Participation',
			message: "<strong>Do not vote.</strong>	\
				<p>Because you followed a link to here from another subreddit, voting or commenting on this page could result in your account getting banned. \
				<a href=\"#\" data-np=\"moreinfo\" target=\"_blank\">Find out more</a></p>	\
				" + (canUndoVote ? '<p><button class="redButton" data-np="revertvote">Undo vote</button></p>' : '')
		});

		$(notification.element).find("[data-np=moreinfo]").attr('href', moreInfoUrl);
		$(notification.element).find('[data-np=revertvote]').on('click', function(e) {
			revertVote(voteButton, true);
			notification.close();
		});
	}

	function notifyNoComment() {
		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: 'disableCommentTextarea',
			header: 'No Participation',
			message: "<strong>Do not comment.</strong>	\
				<p>Because you followed a link to here from another subreddit, voting or commenting on this page could result in your account getting banned. \
				<a href=\"#\" data-np=\"moreinfo\" target=\"_blank\">Find out more</a></p>	\
				"
		});

		$(notification.element).find("[data-np=moreinfo]").attr('href', moreInfoUrl);
	}

	function applyNoParticipationMode() {
		noParticipationActive = true;

		notifyNpActive();

		if (module.options['hideVoteButtons'].value) {
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

		var arrows = $(container).on('click', ".arrow", onClickVote);
	}

	function onClickVote(e) {
		onVote(e.target);
	}

	function onVote(voteButton) {
		if (!(voteButton.classList.contains('upmod') || voteButton.classList.contains('downmod'))) {
			return;
		}

		if (module.options.undoVoteAutomatically.value) {
			revertVote(voteButton);
		} else {
			notifyNoVote(voteButton);
		}
	}

	function revertVote(voteButton, immediately) {
		setTimeout(revertVote, (immediately ? 0 : 500));

		function revertVote() {
			if (voteButton.classList.contains('upmod') || voteButton.classList.contains('downmod')) {
				RESUtils.click(voteButton);

				var notification = modules['notifications'].showNotification({
					moduleID: moduleID,
					optionKey: 'undoVoteAutomatically',
					header: 'No Participation',
					message: "Your vote has been reverted. Remember not to vote!	\
						<p><a href=\"#\" data-np=\"moreinfo\" target=\"_blank\">Find out more</a></p>	\
						"
				});
				$(notification.element).find("[data-np=moreinfo]").attr('href', moreInfoUrl);

			}
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
