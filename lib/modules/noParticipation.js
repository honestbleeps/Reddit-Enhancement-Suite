addModule('noParticipation', function(module, moduleID) {
	module.name = "No Participation";
	module.description = "Discourage interfering with normal subreddit culture when following a No-Participation link";
	module.category = "Comments";

	module.options = {
		revertAccidentalVote: {
			type: 'boolean',
			value: true,
			description: "If you upvote or downvote something, undo it."
		}
	};

	module.include = [ 
		/^https?:\/\/[.*\.]?np\.reddit\.com\/*/i 
	];

	var alreadyNotified = false;

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (RESUtils.pageType() === 'comments' || RESUtils.pageType() === 'linklist') {
				applyNoParticipationMode();
			}


			if (!(RESUtils.pageType() === 'comments' || RESUtils.pageType() === 'linklist') || document.body.classList.has('front-page') || document.body.classList.has('profile-page')) {
				notifyNpIrrelevant();
			}
		}
	};

	function notifyNpIrrelevant() {
		var reloadWithoutNp = [ window.location.protocol, '//', 'reddit.com', window.location.path, window.location.search, window.location.hash ].join('');

		modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'ok-participation',
			header: 'Okay to Participate',
			message: "You're browsing in No-Participation mode, but it's not currently necessary.	\
				<p><a href=\"' + reloadWithoutNp + "\">Click here to return to normal reddit</a></p>";

		});
	}

	function notifyNpActive() {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'no-participation',
			header: 'No Participation',
			message: "You're browsing in No-Participation mode. Please respect the subreddit by not voting or commenting."
		});
	}

	function notifyNoVote() {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'no-voting',
			header: 'No Participation',
			message: "You're browsing in No-Participation mode. Please do not vote.";
		});
	}

	function notifyNoComment() {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'revertAccidentalVote',
			header: 'No Participation',
			message: "You're browsing in No-Participation mode. Please do not comment.";
		});
	}

	function applyNoParticipationMode() {
		notifyNpActive();

		watchForVote();
		RESUtils.watchForElement('newComments', watchForVote);

		watchForComment();
		RESUtils.watchForElement('newCommentsForm', watchForComment);
	}

	function watchForVote(container) {
		container = container || document.body;

		var arrows = $(container).find(".arrow.up, .arrow.down").on("click", onVote);
	}

	module.notifyVoted = function(elemVotedOn) {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			onVote(elemVotedOn);
	}

	function onVote(elemVotedOn) {
		notifyNoVote();
		if (module.options.revertAccidentalVote.value) {
			revertVote(elemVotedOn);
		}
	}

	function revertVote(voteButton) {
		setTimeout(function() {
			if (voteButton.classList.has('upmod') || voteButton.classList.has('downmod')) {
				RESUtils.click(voteButton);		
			}
		}, 2000);
	}


	function warnBeforeComment(container) {
		container = container || document.body;

		modules['commentTools'].getCommentTextarea(container).once('keydown', function() {
			if (alreadyNotified) return;
			alreadyNotified = true;

			notifyNoComment();
		});	
	}
});
