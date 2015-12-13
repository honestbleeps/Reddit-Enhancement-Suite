addModule('uppersAndDowners', {
	moduleID: 'uppersAndDowners',
	moduleName: 'Uppers and Downers Enhanced',
	category: 'Appearance',
	options: {
		showSigns: {
			type: 'boolean',
			value: false,
			description: 'Show +/- signs next to upvote/downvote tallies.',
			advanced: true
		},
		applyToLinks: {
			type: 'boolean',
			value: true,
			description: 'Uppers and Downers on links.'
		},
		postUpvoteStyle: {
			type: 'text',
			value: 'color:rgb(255, 139, 36); font-weight:normal;',
			description: 'CSS style for post upvotes',
			advanced: true
		},
		postDownvoteStyle: {
			type: 'text',
			value: 'color:rgb(148, 148, 255); font-weight:normal;',
			description: 'CSS style for post upvotes',
			advanced: true
		},
		commentUpvoteStyle: {
			type: 'text',
			value: 'color:rgb(255, 139, 36); font-weight:bold;',
			description: 'CSS style for comment upvotes',
			advanced: true
		},
		commentDownvoteStyle: {
			type: 'text',
			value: 'color:rgb(148, 148, 255); font-weight:bold;',
			description: 'CSS style for comment upvotes',
			advanced: true
		},
		forceVisible: {
			type: 'boolean',
			value: false,
			description: 'Force upvote/downvote counts to be visible (when subreddit CSS tries to hide them)'
		}
	},
	description: 'Displays upvote and downvote counts on comments.<br><br>(reddit "fuzzes" vote counts as an anti-spam measure. RES only displays what reddit serves up.)',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'linklist',
		'profile',
		'comments'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// added code to force inline-block and opacity: 1 to prevent CSS from hiding .res_* classes...
			var forceVisible = (this.options.forceVisible.value) ? '; visibility: visible !important; opacity: 1 !important; display: inline-block !important;' : '';
			var css = '.res_comment_ups { ' + this.options.commentUpvoteStyle.value + forceVisible + ' } .res_comment_downs { ' + this.options.commentDownvoteStyle.value + forceVisible + ' }';
			css += '.res_post_ups { ' + this.options.postUpvoteStyle.value + forceVisible + ' } .res_post_downs { ' + this.options.postDownvoteStyle.value + forceVisible + ' }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (RESUtils.pageType() === 'comments') {
				this.commentsWithMoos = [];
				this.moreCommentsIDs = [];
				this.applyUppersAndDownersToComments();
				RESUtils.watchForElement('newComments', modules['uppersAndDowners'].applyUppersAndDownersToComments);
			} else if (RESUtils.pageType() === 'profile') {
				this.commentsWithMoos = [];
				this.moreCommentsIDs = [];
				this.applyUppersAndDownersToMixed();
				RESUtils.watchForElement('siteTable', modules['uppersAndDowners'].applyUppersAndDownersToMixed);

			} else if ((RESUtils.pageType() === 'linklist') && (this.options.applyToLinks.value)) {
				this.linksWithMoos = [];
				this.applyUppersAndDownersToLinks();
				RESUtils.watchForElement('siteTable', modules['uppersAndDowners'].applyUppersAndDownersToLinks);
			}
		}
	},
	applyUppersAndDownersToComments: function(ele) {
		if (!ele) {
			ele = document.body;
		}
		if (ele.classList.contains('comment')) {
			modules['uppersAndDowners'].showUppersAndDownersOnComment(ele);
		} else if (ele.classList.contains('entry')) {
			modules['uppersAndDowners'].showUppersAndDownersOnComment(ele.parentNode);
		} else {
			var allComments = ele.querySelectorAll('div.comment');
			RESUtils.forEachChunked(allComments, 15, 1000, function(comment, i, array) {
				modules['uppersAndDowners'].showUppersAndDownersOnComment(comment);
			});
		}
	},
	applyUppersAndDownersToMixed: function(ele) {
		ele = ele || document.body;
		var linkList = ele.querySelectorAll('div.thing.link, div.thing.comment'),
			displayType = 'regular',
			thisPlus, thisMinus;
		if (modules['uppersAndDowners'].options.showSigns.value) {
			thisPlus = '+';
			thisMinus = '-';
		} else {
			thisPlus = '';
			thisMinus = '';
		}
		for (var i = 0, len = linkList.length; i < len; i++) {
			if (linkList[i].classList.contains('link')) {
				var thisups = linkList[i].getAttribute('data-ups'),
					thisdowns = linkList[i].getAttribute('data-downs'),
					thisTagline = linkList[i].querySelector('p.tagline'),
					upsAndDownsEle;

				if (thisups === '?') {
					thisups = '<a href="/r/announcements/comments/28hjga/reddit_changes_individual_updown_vote_counts_no/">?</a>';
					thisdowns = thisups;
				}
				// Check if compressed link display or regular...
				if ((typeof thisTagline !== 'undefined') && (thisTagline !== null)) {
					upsAndDownsEle = $('<span> (<span class="res_post_ups">' + thisPlus + thisups + '</span>|<span class="res_post_downs">' + thisMinus + thisdowns + '</span>) </span>');
					if (displayType === 'regular') {
						// thisTagline.insertBefore(upsAndDownsEle, thisTagline.firstChild);
						$(thisTagline).prepend(upsAndDownsEle);
					} else {
						$(thisTagline).after(upsAndDownsEle);
					}
				}
			} else {
				modules['uppersAndDowners'].showUppersAndDownersOnComment(linkList[i]);
			}
		}

	},
	showUppersAndDownersOnComment: function(commentEle) {
		// if this is not a valid comment (e.g. a load more comments div, which has the same classes for some reason)
		if ((commentEle.getAttribute('data-votesvisible') === 'true') || (commentEle.classList.contains('morechildren')) || (commentEle.classList.contains('morerecursion')) || (commentEle.classList.contains('score-hidden'))) {
			return;
		}
		commentEle.setAttribute('data-votesvisible', 'true');
		var tagline = commentEle.querySelector('p.tagline');
		var ups = commentEle.getAttribute('data-ups');
		var downs = commentEle.getAttribute('data-downs');
		var openparen, closeparen, mooups, moodowns, voteUps, voteDowns, pipe;
		var frag = document.createDocumentFragment(); //using a fragment speeds this up by a factor of about 2


		if (modules['uppersAndDowners'].options.showSigns.value) {
			ups = '+' + ups;
			downs = '-' + downs;
		}

		openparen = document.createTextNode(' (');
		frag.appendChild(openparen);

		mooups = document.createElement('span');
		mooups.className = 'res_comment_ups';
		voteUps = document.createTextNode(ups);

		mooups.appendChild(voteUps);
		frag.appendChild(mooups);

		pipe = document.createTextNode('|');
		tagline.appendChild(pipe);

		moodowns = document.createElement('span');
		moodowns.className = 'res_comment_downs';

		voteDowns = document.createTextNode(downs);
		moodowns.appendChild(voteDowns);

		frag.appendChild(moodowns);

		closeparen = document.createTextNode(')');
		frag.appendChild(closeparen);

		frag.appendChild(openparen);
		frag.appendChild(mooups);
		frag.appendChild(pipe);
		frag.appendChild(moodowns);
		frag.appendChild(closeparen);

		tagline.appendChild(frag);
	},
	applyUppersAndDownersToLinks: function(ele) {
		// Since we're dealing with max 100 links at a time, we don't need a chunker here...
		ele = ele || document.body;
		var linkList = ele.querySelectorAll('div.thing.link'),
			displayType = 'regular',
			thisPlus, thisMinus;
		if (modules['uppersAndDowners'].options.showSigns.value) {
			thisPlus = '+';
			thisMinus = '-';
		} else {
			thisPlus = '';
			thisMinus = '';
		}
		for (var i = 0, len = linkList.length; i < len; i++) {
			var thisups = linkList[i].getAttribute('data-ups'),
				thisdowns = linkList[i].getAttribute('data-downs'),
				thisTagline = linkList[i].querySelector('p.tagline'),
				upsAndDownsEle;

			if (thisups === '?') {
				thisups = '<a href="/r/announcements/comments/28hjga/reddit_changes_individual_updown_vote_counts_no/">?</a>';
				thisdowns = thisups;
			}
			// Check if compressed link display or regular...
			if ((typeof thisTagline !== 'undefined') && (thisTagline !== null)) {
				upsAndDownsEle = $('<span> (<span class="res_post_ups">' + thisPlus + thisups + '</span>|<span class="res_post_downs">' + thisMinus + thisdowns + '</span>) </span>');
				if (displayType === 'regular') {
					// thisTagline.insertBefore(upsAndDownsEle, thisTagline.firstChild);
					$(thisTagline).prepend(upsAndDownsEle);
				} else {
					$(thisTagline).after(upsAndDownsEle);
				}
			}
		}
	}
});
