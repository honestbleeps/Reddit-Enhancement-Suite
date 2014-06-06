addModule('noParticipation', function(module, moduleID) {
	module.name = "No Participation";
	module.description = "Discourage interfering with normal subreddit culture when following a No-Participation link";
	module.category = "Comments";

	module.options = {
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
		/^https?:\/\/(?:.*\.)?(?:\w+-)?np(?:-\w+)?\.reddit\.com\/*/i  // np.reddit.com, np-nm.reddit.com, nm-np.reddit.com, www.np.reddit.com
	];

	module.go = function() {
		if (this.isEnabled() && this.isMatchURL() && RESUtils.loggedInUser()) {

			if (!(RESUtils.pageType() === 'comments' || RESUtils.pageType() === 'linklist') || document.body.classList.contains('front-page') || document.body.classList.contains('profile-page')) {
				notifyNpIrrelevant();
			} else if (RESUtils.pageType() === 'comments' || RESUtils.pageType() === 'linklist') {
				applyNoParticipationMode();
			}

			if (module.options.disableCommentTextarea.value) {
				RESUtils.addCSS('.usertext textarea[disabled] { background-color: #ccc; }');
			}
		}
	};

	function notifyNpIrrelevant() {
		var reloadWithoutNp = [ window.location.protocol, '//', 'reddit.com', window.location.path, window.location.search, window.location.hash ].join('');

		modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'ok-participation',
			closeDelay: 3000,
			header: 'Okay to Participate',
			message: "You're browsing in No-Participation mode, but it's not currently necessary.	\
				<p><a href=\"" + reloadWithoutNp + "\">Click here to return to normal reddit</a></p>"
		});
	}

	function notifyNpActive() {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'no-participation',
			closeDelay: 3000,
			header: 'No Participation',
			message: "Please respect the subreddit by not voting or commenting."
		});
	}

	function notifyNoVote(voteButton) {
		var notification = modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: 'undoVoteAutomatically',
			header: 'No Participation',
			message: "Please don't vote." + (!module.options.undoVoteAutomatically.value ? '<p><button class="RES-np-revertvote">Undo vote</button></p>' : '')
		});

		$(notification.element).find('.RES-np-revertvote').on('click', function(e) {
			revertVote(voteButton, true);
			notification.close();
		});
	}

	function notifyNoComment() {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: 'disableCommentTextarea',
			header: 'No Participation',
			message: "Please don't comment."
		});
	}

	function applyNoParticipationMode() {
		notifyNpActive();

		watchForVote();
		RESUtils.watchForElement('newComments', watchForVote);

		watchForComment();
		RESUtils.watchForElement('newCommentsForms', watchForComment);
	}

	function watchForVote(container) {
		container = container || document.body;

		var arrows = $(container).find(".arrow").on("click", function(e) {
			onVote(e.target);
		});
	}

	function onVote(voteButton) {
		if (!(voteButton.classList.contains('upmod') || voteButton.classList.contains('downmod'))) {
			return;
		}

		notifyNoVote(voteButton);
		if (module.options.undoVoteAutomatically.value) {
			revertVote(voteButton);
		}
	}

	function revertVote(voteButton, immediately) {
		setTimeout(function() {
			if (voteButton.classList.contains('upmod') || voteButton.classList.contains('downmod')) {
				RESUtils.click(voteButton);
			}
		}, (immediately ? 0 : 2000));
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
