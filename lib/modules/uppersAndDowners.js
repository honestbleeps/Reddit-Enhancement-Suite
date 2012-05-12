modules['uppersAndDowners'] = {
	moduleID: 'uppersAndDowners',
	moduleName: 'Uppers and Downers Enhanced',
	category: 'UI',
	options: {
		showSigns: {
			type: 'boolean',
			value: false,
			description: 'Show +/- signs next to upvote/downvote tallies.'
		},
		applyToLinks: {
			type: 'boolean',
			value: true,
			description: 'Uppers and Downers on links.'
		},
		postUpvoteStyle: {
			type: 'text',
			value: 'color:rgb(255, 139, 36); font-weight:normal;',
			description: 'CSS style for post upvotes'
		},
		postDownvoteStyle: {
			type: 'text',
			value: 'color:rgb(148, 148, 255); font-weight:normal;',
			description: 'CSS style for post upvotes'
		},
		commentUpvoteStyle: {
			type: 'text',
			value: 'color:rgb(255, 139, 36); font-weight:bold;',
			description: 'CSS style for comment upvotes'
		},
		commentDownvoteStyle: {
			type: 'text',
			value: 'color:rgb(148, 148, 255); font-weight:bold;',
			description: 'CSS style for comment upvotes'
		},
		forceVisible: {
			type: 'boolean',
			value: false,
			description: 'Force upvote/downvote counts to be visible (when subreddit CSS tries to hide them)'
		}
	},
	description: 'Displays up/down vote counts on comments.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/?(?:\??[\w]+=[\w]+&?)*/i,
		/https?:\/\/([a-z]+).reddit.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i,
		/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// added code to force inline-block and opacity: 1 to prevent CSS from hiding .res_* classes...
			var forceVisible = (this.options.forceVisible.value) ? '; visibility: visible !important; opacity: 1 !important; display: inline-block !important;' : '';
			var css = '.res_comment_ups { '+this.options.commentUpvoteStyle.value+forceVisible+' } .res_comment_downs { '+this.options.commentDownvoteStyle.value+forceVisible+' }';
			css += '.res_post_ups { '+this.options.postUpvoteStyle.value+forceVisible+' } .res_post_downs { '+this.options.postDownvoteStyle.value+forceVisible+' }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get rid of the showTimeStamp options since Reddit now has this feature natively.
			if (typeof(this.options.showTimestamp) != 'undefined') {
				delete this.options.showTimestamp;
				RESStorage.setItem('RESoptions.uppersAndDowners', JSON.stringify(modules['uppersAndDowners'].options));
			}
			if (RESUtils.pageType() == 'comments') {
				this.commentsWithMoos = [];
				this.moreCommentsIDs = [];
				this.applyUppersAndDownersToComments();
				var moreComments = document.querySelectorAll('.morecomments > a');
				for (var i=0, len=moreComments.length; i<len; i++) {
					moreComments[i].addEventListener('click', this.addParentListener, true);
				}
			} else if (RESUtils.pageType() == 'profile') {
				this.commentsWithMoos = [];
				this.moreCommentsIDs = [];
				this.applyUppersAndDownersToMixed();
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
						modules['uppersAndDowners'].applyUppersAndDownersToMixed(event.target);
					}
				}, true);

			} else if ((RESUtils.pageType() == 'linklist') && (this.options.applyToLinks.value)) {
				this.linksWithMoos = [];
				this.applyUppersAndDownersToLinks();
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
						/*
						if (!RESUtils.currentSubreddit('dashboard')) {
							modules['uppersAndDowners'].applyUppersAndDownersToLinks(modules['neverEndingReddit'].nextPageURL);
						} else {
							modules['uppersAndDowners'].applyUppersAndDownersToLinks(event.target.getAttribute('url'));
						}
						*/
						modules['uppersAndDowners'].applyUppersAndDownersToLinks(event.target);
					}
				}, true);
				
			}
		}
	},
	addParentListener: function (event) {
		var moreCommentsParent = event.target;
		// first, make sure we're starting at the <span class="morecomments"> rather than one of its children...
		while ((moreCommentsParent != null) && (moreCommentsParent.className != 'morecomments')) {
			moreCommentsParent = moreCommentsParent.parentNode;
		}
		var i=0;
		// Now, check if this is link nested deep inside comments, or a top level "load more comments" link at the bottom of a page.
		while (i<6) {
			if ((moreCommentsParent != null) && (typeof(moreCommentsParent.parentNode) != 'undefined')) {
				moreCommentsParent = moreCommentsParent.parentNode;
				if (moreCommentsParent.className == 'commentarea') {
					i=6;
				}
			} else {
				i=6;
			}
			i++;
		}
		moreCommentsParent.addEventListener('DOMNodeInserted', modules['uppersAndDowners'].processMoreComments, true);
	},
	processMoreComments: function (event) {
		if ((event.target.tagName == 'DIV') && (hasClass(event.target, 'thing'))) {
			modules['uppersAndDowners'].applyUppersAndDownersToComments(event.target);
		}			
	},
	applyUppersAndDownersToComments: function(ele) {
		if (!ele) {
			ele = document.body;
		} 
		if (hasClass(ele,'comment')) {
			this.allComments = [ele];
		} else {
			this.allComments = ele.querySelectorAll('div.comment');
		}
		this.allCommentsCount = this.allComments.length;
		this.allCommentsi = 0;
		(function(){
			// add 15 save links at a time...
			var chunkLength = Math.min((modules['uppersAndDowners'].allCommentsCount - modules['uppersAndDowners'].allCommentsi), 15);
			for (var i=0;i<chunkLength;i++) {
				var thisi = modules['uppersAndDowners'].allCommentsi;
				var thisComment = modules['uppersAndDowners'].allComments[thisi];
				modules['uppersAndDowners'].showUppersAndDownersOnComment(thisComment);
				modules['uppersAndDowners'].allCommentsi++;
			}
			if (modules['uppersAndDowners'].allCommentsi < modules['uppersAndDowners'].allCommentsCount) {
				setTimeout(arguments.callee, 1000);
			}
		})();		
	},
	applyUppersAndDownersToMixed: function(ele) {
		ele = ele || document.body;
		var linkList = ele.querySelectorAll('div.thing.link, div.thing.comment');
		var displayType = 'regular';
		if (modules['uppersAndDowners'].options.showSigns.value) {
			var thisPlus = '+';
			var thisMinus = '-';
		} else {
			var thisPlus = '';
			var thisMinus = '';
		}
		for (var i=0, len=linkList.length; i<len; i++) {
			if (hasClass(linkList[i], 'link')) {
				var thisups = linkList[i].getAttribute('data-ups');
				var thisdowns = linkList[i].getAttribute('data-downs');

				var thisTagline = linkList[i].querySelector('p.tagline');
				// Check if compressed link display or regular...
				if ((typeof(thisTagline) != 'undefined') && (thisTagline != null)) {
					var upsAndDownsEle = $("<span> (<span class='res_post_ups'>"+thisPlus+thisups+"</span>|<span class='res_post_downs'>"+thisMinus+thisdowns+"</span>) </span>");
					if (displayType == 'regular') {
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
		if (commentEle.getAttribute('data-votesvisible') == 'true') return;
		commentEle.setAttribute('data-votesvisible', 'true');
		var tagline = commentEle.querySelector('p.tagline');
		var ups = commentEle.getAttribute('data-ups');
		var downs = commentEle.getAttribute('data-downs');
		var openparen, closeparen, mooups, moodowns, voteUps, voteDowns, pipe;
		var frag = document.createDocumentFragment(); //using a fragment speeds this up by a factor of about 2


		if (modules['uppersAndDowners'].options.showSigns.value) {
			ups = '+'+ups;
			downs = '-'+downs;
		}

		openparen = document.createTextNode(" (");
		frag.appendChild(openparen);

		mooups = document.createElement("span");
		mooups.className = "res_comment_ups";
		voteUps = document.createTextNode(ups);

		mooups.appendChild(voteUps);
		frag.appendChild(mooups);

		pipe = document.createTextNode("|");
		tagline.appendChild(pipe);

		moodowns = document.createElement("span");
		moodowns.className = "res_comment_downs";

		voteDowns = document.createTextNode(downs);
		moodowns.appendChild(voteDowns);

		frag.appendChild(moodowns);

		closeparen = document.createTextNode(")");
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
		var linkList = ele.querySelectorAll('div.thing.link');
		var displayType = 'regular';
		if (modules['uppersAndDowners'].options.showSigns.value) {
			var thisPlus = '+';
			var thisMinus = '-';
		} else {
			var thisPlus = '';
			var thisMinus = '';
		}
		for (var i=0, len=linkList.length; i<len; i++) {
			var thisups = linkList[i].getAttribute('data-ups');
			var thisdowns = linkList[i].getAttribute('data-downs');

			var thisTagline = linkList[i].querySelector('p.tagline');
			// Check if compressed link display or regular...
			if ((typeof(thisTagline) != 'undefined') && (thisTagline != null)) {
				var upsAndDownsEle = $("<span> (<span class='res_post_ups'>"+thisPlus+thisups+"</span>|<span class='res_post_downs'>"+thisMinus+thisdowns+"</span>) </span>");
				if (displayType == 'regular') {
					// thisTagline.insertBefore(upsAndDownsEle, thisTagline.firstChild);
					$(thisTagline).prepend(upsAndDownsEle);
				} else {
					$(thisTagline).after(upsAndDownsEle);
				}
			}
		}
	}
};
