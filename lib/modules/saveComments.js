addModule('saveComments', {
	moduleID: 'saveComments',
	moduleName: 'Save Comments',
	category: 'Comments',
	options: {},
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	exclude: [
		'submit'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		this.description = '\
	You can save comments with RES: click the <em>save-RES</em> button below the comment. You can view \
	these comments on your user page under the "saved - RES" tab (reddit.com/user/MyUsername/saved#comments). \
	If you use ' + modules['settingsNavigation'].makeUrlHashLink('keyboardNav') + ', you can press ' + modules['keyboardNav'].getNiceKeyCode('toggleCmdLine') + ' \
	to open the RES command line, then type in <code>me/sc</code> to see saved-RES comments. \
	<br><br>\
	Saving with RES saves a comment locally in your browser. This means that you can see the comment you saved \
	<i>as it looked when you saved it</i>, even if it is later edited or deleted. \
	You can save comments with RES if you are not logged in, or if you are logged in to any account—all the \
	comments will be visible in one location. You will only be able to view saved RES comments on whichever browser\
	you have RES istalled on.\
	<br><br>	\
	When saving comments with reddit, you must be logged into an account; the comment is saved specifically for that account;\
	it won\'t be shown if you switch to a different account or log out. You can view these comments whenever you are logged into\
	the reddit account you saved them from, including on other browsers or devices.  \
	<br><br>	\
	Visually, saving comments with reddit looks the same as saving with RES—but the text is not saved locally,\
	so the saved comment text shows the <i>current</i> state of the comment. If the comment has been edited or deleted \
	since you saved it, the text that displays on your account\'s "saved" page will look different then it looked when you saved it.\
	<br><br>	\
	If you have <a href="/gold/about">reddit gold</a> on an account, you can add a category/tag to comments you have saved \
	with reddit, then filter saved comments/posts by category. (You cannot sort or filter comments saved with RES.) \
	';

		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.RES-save { cursor: help; }');
		}
	},
	savedRe: /^https?:\/\/([a-z]+)\.reddit\.com\/user\/([\-\w]+)\/saved\/?/i,
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var currURL = location.href;
			if (RESUtils.pageType() === 'comments') {
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
			} else if (modules['saveComments'].savedRe.test(currURL)) {
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
			RESUtils.watchForElement('newComments', modules['saveComments'].addSaveLinkToComment);
		}
	},
	addSaveLinks: function(ele) {
		ele = ele || document.body;

		// top: new-style. bottom: old-style.
		var allComments = ele.querySelectorAll('div.commentarea > div.sitetable > div.thing div.entry, ' +
			'div.commentarea > div.sitetable > div.thing div.entry div.entry');
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
				$saveLink.html('<a class="RES-save noCtrlF" href="javascript:void 0" title="Save using RES - which is local only, but preserves the full text in case someone edits/deletes it" data-text="save-RES"></a>')
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
		if (thisComments === null) {
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
	saveComment: function(obj, id, href, username) {
		// reload saved comments in case they've been updated in other tabs (works in all but greasemonkey)
		this.loadSavedComments();
		// loop through comments and make sure we haven't already saved this one...
		if (typeof this.storedComments[id] !== 'undefined') {
			alert('comment already saved!');
		} else {
			var selectedThing = modules['selectedEntry'].unselect(); // un-munge annotations or other mutilations

			var comment = obj.parentNode.parentNode.querySelector('div.usertext-body > div.md');
			if (comment !== null) {
				var commentHTML = comment.innerHTML.replace(/<script(.|\s)*?\/script>/g, ''),
					savedComment = {
						href: href,
						username: username,
						comment: commentHTML,
						timeSaved: Date()
					};
				this.storedComments[id] = savedComment;

				var $unsaveObj = $('<li>');
				$unsaveObj.html('<a href="javascript:void 0">unsave-RES</a>')
					.data('unsaveID', id)
					.data('unsaveLink', href)
					.addClass('unsaveComments');

				$(obj).replaceWith($unsaveObj);
			}
			modules['selectedEntry'].select(selectedThing); // restore munging

			if (RESUtils.proEnabled()) {
				// add sync adds/deletes for RES Pro.
				if (typeof this.storedComments.RESPro_add === 'undefined') {
					this.storedComments.RESPro_add = {};
				}
				if (typeof this.storedComments.RESPro_delete === 'undefined') {
					this.storedComments.RESPro_delete = {};
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
			var menuItems = mainmenuUL.querySelectorAll('li');
			for (var i = 0, len = menuItems.length; i < len; i++) {
				var savedLink = menuItems[i].querySelector('a');
				if ((menuItems[i].classList.contains('selected')) && (modules['saveComments'].savedRe.test(savedLink.getAttribute('href')))) {
					menuItems[i].addEventListener('click', function(e) {
						e.preventDefault();
						modules['saveComments'].showSavedTab('links');
					}, true);
				}

				if (modules['saveComments'].savedRe.test(savedLink.getAttribute('href'))) {
					$(menuItems[i]).attr('id', 'savedLinksTab');
					savedLink.textContent = 'saved - reddit';
				}
			}

			$('<li id="savedCommentsTab">')
				.html('<a href="javascript:void 0">saved - RES</a>')
				.insertAfter('#savedLinksTab');
			if (modules['saveComments'].savedRe.test(location.href)) {
				$('#savedCommentsTab').on('click', function(e) {
					e.preventDefault();
					modules['saveComments'].showSavedTab('comments');
				});
			} else {
				$('#savedCommentsTab').on('click', function(e) {
					e.preventDefault();
					location.href = location.protocol + '//www.reddit.com/saved/#comments';
				});
			}
		}
	},
	showSavedTab: function(tab) {
		switch(tab) {
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
		this.savedCommentsContent = RESUtils.createElement('div', 'savedLinksList');
		this.savedCommentsContent.style.display = 'none';
		this.savedCommentsContent.setAttribute('class', 'sitetable linklisting');

		var saveRESTips = document.createElement('div');
		saveRESTips.classList.add('savedComment', 'entry');
		$(saveRESTips).safeHtml('<p><b>Tip:</b> Don\'t see a comment here? Check the "saved - reddit" tab above.</p><p>Currently, the keyboard shortcut "' + modules['keyboardNav'].getNiceKeyCode('savePost') + '" saves a post to your reddit account, "' + modules['keyboardNav'].getNiceKeyCode('saveComment') + '" saves a comment to your reddit account, and "' + modules['keyboardNav'].getNiceKeyCode('saveRES') + '" saves a comment locally with RES. These can be changed in the ' + modules['settingsNavigation'].makeUrlHashLink('keyboardNav', 'savePost', 'settings console') + '.</p>');
		this.savedCommentsContent.appendChild(saveRESTips);

		for (var i in this.storedComments) {
			if ((i !== 'RESPro_add') && (i !== 'RESPro_delete')) {
				var clearLeft = document.createElement('div');
				clearLeft.setAttribute('class', 'clearleft');
				var thisComment = document.createElement('div');
				thisComment.classList.add('savedComment');
				thisComment.classList.add('entry');
				// this is all saved locally, but just for safety, we'll clean out any script tags and whatnot...
				// we'll also remove iframe / video tags because they might autoplay.
				// TODO: save comments using markdown instead of HTML in the future. It's cleaner/safer/better.
				var cleanHTML = '<div class="savedCommentHeader">Comment by user: ' + escapeHTML(this.storedComments[i].username) + ' saved on ' + escapeHTML(this.storedComments[i].timeSaved) + '</div>';
				cleanHTML += '<div class="savedCommentBody md">' + this.storedComments[i].comment.replace(/<(script|iframe|video)(.|\s)*?\/(script|iframe|video)>/g, '') + '</div>';
				cleanHTML += '<div class="savedCommentFooter"><ul class="flat-list buttons"><li><a class="unsaveComment" href="javascript:void 0">unsave-RES</a></li><li><a href="' + escapeHTML(this.storedComments[i].href) + '">view original</a></li></ul></div>';
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
		if (!Object.getOwnPropertyNames(this.storedComments).length) {
			var blurb = $('	\
				<li class="savedComment entry">	\
					<p>Click the <em>save-RES</em> button on a comment, then come here to see it.</p>	\
					<hr>	\
					<p>' + this.description + '</p>	\
				</li>	\
				');

			$(this.savedCommentsContent).append(blurb);

		}
		RESUtils.insertAfter(this.savedLinksContent, this.savedCommentsContent);
	},
	unsaveComment: function(id, unsaveLink) {
		/*
		var newStoredComments = [];
		for (var i=0, len=this.storedComments.length;i<len;i++) {
			if (this.storedComments[i].href !== href) {
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
				this.storedComments.RESPro_add = {};
			}
			if (typeof this.storedComments.RESPro_delete === 'undefined') {
				this.storedComments.RESPro_delete = {};
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
	},
	showEducationalNotification: function() {
		modules['notifications'].showNotification({
			moduleID: this.moduleID,
			optionKey: 'savePost',
			notificationID: 'saveRES-educational',
			closeDelay: 10000,
			cooldown: 3 * 7 * 24 * 60 * 60 * 1000,
			header: 'Saving Posts and Comments',
			message: '<p>The keyboard shortcuts <b>"' + modules['keyboardNav'].getNiceKeyCode('savePost') + '"</b> (posts) and <b>"' + modules['keyboardNav'].getNiceKeyCode('saveComment') + '"</b> (comments) will save a post/comment to your reddit account (same as the "save" button). It will be accessible from anywhere that you\'re logged in, but the original text will not be preserved if it is edited or deleted.</p>' +
				'<p>The keyboard shortcut <b>"' + modules['keyboardNav'].getNiceKeyCode('saveRES') + '"</b> will save a comment to RES (same as the "save-RES" button). It will only be available locally, but the original text will be preserved if the comment is edited or deleted.</p>' +
				'<p>These shortcuts can be changed in the ' + modules['settingsNavigation'].makeUrlHashLink('keyboardNav', 'savePost', 'settings console') + '.<p>'
		});
	}
});
