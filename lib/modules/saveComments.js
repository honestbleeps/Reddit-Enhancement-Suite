modules['saveComments'] = {
	moduleID: 'saveComments',
	moduleName: 'Save Comments',
	category: 'Comments',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
	},
	description: 'Save Comments saves the full text of comments locally in your browser, unlike Reddit\'s "save" feature, which saves a link to the comment.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*/i
	],
	exclude: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*\/submit\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/submit\/?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.RES-save { cursor: help; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var currURL = location.href;
			var commentsRegex = /^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i;
			var savedRegex = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/([-\w]+)\/saved\/?/i;
			if (commentsRegex.test(currURL)) {
				// load already-saved comments into memory...
				this.loadSavedComments();
				this.addSaveLinks();
				$('body').on('click', 'li.saveComments', function(e) {
					e.preventDefault();
					var $this = $(this);
					modules['saveComments'].saveComment(this, $this.data('saveID'), $this.data('saveLink'), $this.data('saveUser'));
				});
				$('body').on('click', 'li.unsaveComments', function(e) {
					// e.preventDefault();
					var id = $(this).data('unsaveID');
					modules['saveComments'].unsaveComment(id, this);
				});
			} else if (savedRegex.test(currURL)) {
				// load already-saved comments into memory...
				this.loadSavedComments();
				this.addSavedCommentsTab();
				this.drawSavedComments();
				if (location.hash === '#comments') {
					this.showSavedTab('comments');
				}
			} else {
				this.addSavedCommentsTab();
			}
			// Watch for any future 'reply' forms, or stuff loaded in via "load more comments"...
			/*
			document.body.addEventListener(
				'DOMNodeInserted',
				function( event ) {
					if ((event.target.tagName === 'DIV') && (hasClass(event.target,'thing'))) {
						modules['saveComments'].addSaveLinks(event.target);
					}
				},
				false
			);
			*/
			RESUtils.watchForElement('newComments', modules['saveComments'].addSaveLinks);
		}
	},
	addSaveLinks: function(ele) {
		if (!ele) var ele = document.body;
		var allComments = ele.querySelectorAll('div.commentarea > div.sitetable > div.thing div.entry div.noncollapsed');
		RESUtils.forEachChunked(allComments, 15, 1000, function(comment, i, array) {
			modules['saveComments'].addSaveLinkToComment(comment);
		});
	},
	addSaveLinkToComment: function(commentObj) {
		var $commentObj = $(commentObj),
			$commentsUL = $commentObj.find('ul.flat-list'),
			$permaLink = $commentsUL.find('li.first a.bylink');

		if ($permaLink.length > 0) {
			// Insert the link right after Reddit Gold's "save" comment link
			var $userLink = $commentObj.find('a.author'),
				saveUser;

			if ($userLink.length === 0) {
				saveUser = '[deleted]';
			} else {
				saveUser = $userLink.text();
			}

			var saveHref = $permaLink.attr('href'),
				splitHref = saveHref.split('/'),
				saveID = splitHref[splitHref.length - 1],
				$saveLink = $('<li>');

			if ((typeof this.storedComments !== 'undefined') && (typeof this.storedComments[saveID] !== 'undefined')) {
				$saveLink.html('<a class="RES-saved noCtrlF" href="/saved#comments" data-text="saved-RES"></a>');
			} else {
				$saveLink.html('<a class="RES-save noCtrlF" href="javascript:void(0);" title="Save using RES - which is local only, but preserves the full text in case someone edits/deletes it" data-text="save-RES"></a>')
					.addClass('saveComments')
					.data('saveID', saveID)
					.data('saveLink', saveHref)
					.data('saveUser', saveUser);
			}

			var $whereToInsert = $commentsUL.find('.comment-save-button');
			$whereToInsert.after($saveLink);
		}
	},
	loadSavedComments: function() {
		// first, check if we're storing saved comments the old way (as an array)...
		var thisComments = RESStorage.getItem('RESmodules.saveComments.savedComments');
		if (thisComments == null) {
			this.storedComments = {};
		} else {
			this.storedComments = safeJSON.parse(thisComments, 'RESmodules.saveComments.savedComments');
			// old way of storing saved comments... convert...
			if (thisComments.slice(0, 1) === '[') {
				var newFormat = {};
				for (var i in this.storedComments) {
					var urlSplit = this.storedComments[i].href.split('/');
					var thisID = urlSplit[urlSplit.length - 1];
					newFormat[thisID] = this.storedComments[i];
				}
				this.storedComments = newFormat;
				RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(newFormat));
			}
		}
	},
	saveComment: function(obj, id, href, username, comment) {
		// reload saved comments in case they've been updated in other tabs (works in all but greasemonkey)
		this.loadSavedComments();
		// loop through comments and make sure we haven't already saved this one...
		if (typeof this.storedComments[id] !== 'undefined') {
			alert('comment already saved!');
		} else {
			if (modules['keyboardNav'].isEnabled()) {
				// unfocus it before we save it so we don't save the keyboard annotations...
				modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
			}
			var comment = obj.parentNode.parentNode.querySelector('div.usertext-body > div.md');
			if (comment !== null) {
				var commentHTML = comment.innerHTML,
					savedComment = {
						href: href,
						username: username,
						comment: commentHTML,
						timeSaved: Date()
					};
				this.storedComments[id] = savedComment;

				var $unsaveObj = $('<li>');
				$unsaveObj.html('<a href="javascript:void(0);">unsave-RES</a>')
					.data('unsaveID', id)
					.data('unsaveLink', href)
					.addClass('unsaveComments');

				$(obj).replaceWith($unsaveObj);
			}
			if (modules['keyboardNav'].isEnabled()) {
				modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
			}
			if (RESUtils.proEnabled()) {
				// add sync adds/deletes for RES Pro.
				if (typeof this.storedComments.RESPro_add === 'undefined') {
					this.storedComments.RESPro_add = {}
				}
				if (typeof this.storedComments.RESPro_delete === 'undefined') {
					this.storedComments.RESPro_delete = {}
				}
				// add this ID next time we sync...
				this.storedComments.RESPro_add[id] = true;
				// make sure we don't run a delete on this ID next time we sync...
				if (typeof this.storedComments.RESPro_delete[id] !== 'undefined') delete this.storedComments.RESPro_delete[id];
			}
			RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(this.storedComments));
			if (RESUtils.proEnabled()) {
				modules['RESPro'].authenticate(function() {
					modules['RESPro'].saveModuleData('saveComments');
				});
			}
		}
	},
	addSavedCommentsTab: function() {
		var mainmenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
		if (mainmenuUL) {
			var savedRegex = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w]+\/saved\/?/i;
			var menuItems = mainmenuUL.querySelectorAll('li');
			var thisUser = RESUtils.loggedInUser() || '';
			for (var i = 0, len = menuItems.length; i < len; i++) {
				var savedLink = menuItems[i].querySelector('a');
				if ((menuItems[i].classList.contains('selected')) && (savedRegex.test(savedLink.href))) {
					menuItems[i].addEventListener('click', function(e) {
						e.preventDefault();
						modules['saveComments'].showSavedTab('links');
					}, true);
				}

				if (savedRegex.test(savedLink.href)) {
					$(menuItems[i]).attr('id', 'savedLinksTab');
					savedLink.textContent = 'saved links';
				}
			}

			var savedCommentsTab = $('<li id="savedCommentsTab">')
				.html('<a href="javascript:void(0);">saved comments</a>')
				.insertAfter('#savedLinksTab');
			if (savedRegex.test(location.href)) {
				$('#savedCommentsTab').click(function(e) {
					e.preventDefault();
					modules['saveComments'].showSavedTab('comments');
				});
			} else {
				$('#savedCommentsTab').click(function(e) {
					e.preventDefault();
					location.href = location.protocol + '//www.reddit.com/saved/#comments';
				});
			}
		}
	},
	showSavedTab: function(tab) {
		switch (tab) {
			case 'links':
				location.hash = 'links';
				this.savedLinksContent.style.display = 'block';
				this.savedCommentsContent.style.display = 'none';
				$('#savedLinksTab').addClass('selected');
				$('#savedCommentsTab').removeClass('selected');
				break;
			case 'comments':
				location.hash = 'comments';
				this.savedLinksContent.style.display = 'none';
				this.savedCommentsContent.style.display = 'block';
				$('#savedLinksTab').removeClass('selected');
				$('#savedCommentsTab').addClass('selected');
				break;
		}
	},
	drawSavedComments: function() {
		RESUtils.addCSS('.savedComment { padding: 5px 8px; font-size: 12px; margin-bottom: 20px; margin-left: 25px; margin-right: 10px; border: 1px solid #CCC; border-radius: 10px; width: auto; } ');
		RESUtils.addCSS('.savedCommentHeader { margin-bottom: 8px; }');
		RESUtils.addCSS('.savedCommentBody { margin-bottom: 8px; }');
		RESUtils.addCSS('#savedLinksList { margin-top: 10px; }');
		// css += '.savedCommentFooter {  }';
		this.savedLinksContent = document.body.querySelector('BODY > div.content');
		this.savedCommentsContent = RESUtils.createElementWithID('div', 'savedLinksList');
		this.savedCommentsContent.style.display = 'none';
		this.savedCommentsContent.setAttribute('class', 'sitetable linklisting');
		for (var i in this.storedComments) {
			if ((i !== 'RESPro_add') && (i !== 'RESPro_delete')) {
				var clearLeft = document.createElement('div');
				clearLeft.setAttribute('class', 'clearleft');
				var thisComment = document.createElement('div');
				thisComment.classList.add('savedComment');
				thisComment.classList.add('entry');
				// this is all saved locally, but just for safety, we'll clean out any script tags and whatnot...
				var cleanHTML = '<div class="savedCommentHeader">Comment by user: ' + escapeHTML(this.storedComments[i].username) + ' saved on ' + escapeHTML(this.storedComments[i].timeSaved) + '</div>';
				cleanHTML += '<div class="savedCommentBody md">' + this.storedComments[i].comment.replace(/<script(.|\s)*?\/script>/g, '') + '</div>';
				cleanHTML += '<div class="savedCommentFooter"><ul class="flat-list buttons"><li><a class="unsaveComment" href="javascript:void(0);">unsave-RES</a></li><li><a href="' + escapeHTML(this.storedComments[i].href) + '">view original</a></li></ul></div>'
				$(thisComment).html(cleanHTML);
				var unsaveLink = thisComment.querySelector('.unsaveComment');
				$(unsaveLink)
					.data('unsaveID', i)
					.data('unsaveLink', this.storedComments[i].href);
				unsaveLink.addEventListener('click', function(e) {
					e.preventDefault();
					modules['saveComments'].unsaveComment($(this).data('unsaveID'));
				}, true);
				this.savedCommentsContent.appendChild(thisComment);
				this.savedCommentsContent.appendChild(clearLeft);
			}
		}
		if (this.storedComments.length === 0) {
			$(this.savedCommentsContent).html('<li>You have not yet saved any comments.</li>');
		}
		RESUtils.insertAfter(this.savedLinksContent, this.savedCommentsContent);
	},
	unsaveComment: function(id, unsaveLink) {
		/*
		var newStoredComments = [];
		for (var i=0, len=this.storedComments.length;i<len;i++) {
			if (this.storedComments[i].href != href) {
				newStoredComments.push(this.storedComments[i]);
			} else {
				// console.log('found match. deleted comment');
			}
		}
		this.storedComments = newStoredComments;
		*/
		delete this.storedComments[id];
		if (RESUtils.proEnabled()) {
			// add sync adds/deletes for RES Pro.
			if (typeof this.storedComments.RESPro_add === 'undefined') {
				this.storedComments.RESPro_add = {}
			}
			if (typeof this.storedComments.RESPro_delete === 'undefined') {
				this.storedComments.RESPro_delete = {}
			}
			// delete this ID next time we sync...
			this.storedComments.RESPro_delete[id] = true;
			// make sure we don't run an add on this ID next time we sync...
			if (typeof this.storedComments.RESPro_add[id] !== 'undefined') delete this.storedComments.RESPro_add[id];
		}
		RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(this.storedComments));
		if (RESUtils.proEnabled()) {
			modules['RESPro'].authenticate(function() {
				modules['RESPro'].saveModuleData('saveComments');
			});
		}
		if (typeof this.savedCommentsContent !== 'undefined') {
			this.savedCommentsContent.parentNode.removeChild(this.savedCommentsContent);
			this.drawSavedComments();
			this.showSavedTab('comments');
		} else {
			var commentObj = unsaveLink.parentNode.parentNode;
			unsaveLink.parentNode.removeChild(unsaveLink);
			this.addSaveLinkToComment(commentObj);
		}
	}
};
