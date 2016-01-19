addModule('saveComments', function(module, moduleID) {
	module.moduleName = 'Save Comments';
	module.category = 'Comments';
	module.exclude = [
		'submit'
	];
	module.loadDynamicOptions = function() {
		this.description = '\
			<p>You can save comments with RES: click the <em>save-RES</em> button below the comment. You can view \
			these comments on your user page under the <a href="/user/me/saved/#comments">saved</a> tab. \
			If you use ' + modules['settingsNavigation'].makeUrlHashLink('keyboardNav') + ', you can press ' + modules['keyboardNav'].getNiceKeyCode('toggleCmdLine') + ' \
			to open the RES command line, then type in <code>me/sc</code> to see saved-RES comments.</p>\
			<p>Saving with RES saves a comment locally in your browser. This means that you can see the comment you saved \
			<i>as it looked when you saved it</i>, even if it is later edited or deleted. \
			You can save comments with RES if you are not logged in, or if you are logged in to any account—all the \
			comments will be visible in one location. You will only be able to view saved RES comments on whichever browser\
			you have RES istalled on.</p>\
			<p>When saving comments with reddit, you must be logged into an account; the comment is saved specifically for that account;\
			it won\'t be shown if you switch to a different account or log out. You can view these comments whenever you are logged into\
			the reddit account you saved them from, including on other browsers or devices.</p>	\
			<p>Visually, saving comments with reddit looks the same as saving with RES—but the text is not saved locally,\
			so the saved comment text shows the <i>current</i> state of the comment. If the comment has been edited or deleted \
			since you saved it, the text that displays on your account\'s "saved" page will look different then it looked when you saved it.</p>\
			<p>If you have <a href="/gold/about">reddit gold</a> on an account, you can add a category/tag to comments you have saved \
			with reddit, then filter saved comments/posts by category. (You cannot sort or filter comments saved with RES.)</p> \
			';
	};

	var savedRe = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/([\-\w]+)\/saved\/?/i;

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var currURL = location.href;
			if (RESUtils.pageType() === 'comments') {
				// load already-saved comments into memory...
				loadSavedComments();
				addSaveLinks();
				$('body').on('click', 'li.saveComments', function(e) {
					e.preventDefault();
					var $this = $(this);
					saveComment(this, $this.data('saveID'), $this.data('saveLink'), $this.data('saveUser'));
				});
				$('body').on('click', 'li.unsaveComments', function(e) {
					// e.preventDefault();
					var id = $(this).data('unsaveID');
					unsaveComment(id, this);
				});
			} else if (savedRe.test(currURL)) {
				// load already-saved comments into memory...
				loadSavedComments();
				addSavedCommentsTab();
				drawSavedComments();
				if (location.hash === '#comments') {
					showSavedTab(location.hash);
				}
			}
			RESUtils.watchForElement('newComments', addSaveLinkToComment);
		}
	};

	function addSaveLinks(ele) {
		ele = ele || document.body;

		// top: new-style. bottom: old-style.
		var allComments = ele.querySelectorAll('div.commentarea > div.sitetable > div.thing div.entry, ' +
			'div.commentarea > div.sitetable > div.thing div.entry div.entry');
		RESUtils.forEachChunked(allComments, 15, 1000, function(comment, i, array) {
			addSaveLinkToComment(comment);
		});
	}

	var storedComments = {};

	function addSaveLinkToComment(commentObj) {
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

			if (storedComments && storedComments[saveID]) {
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
	}

	function loadSavedComments() {
		// first, check if we're storing saved comments the old way (as an array)...
		var thisComments = RESStorage.getItem('RESmodules.saveComments.savedComments');
		if (thisComments === null) {
			storedComments = {};
		} else {
			storedComments = safeJSON.parse(thisComments, 'RESmodules.saveComments.savedComments');
			// old way of storing saved comments... convert...
			if (thisComments.slice(0, 1) === '[') {
				var newFormat = {};
				for (var i in storedComments) {
					var urlSplit = storedComments[i].href.split('/');
					var thisID = urlSplit[urlSplit.length - 1];
					newFormat[thisID] = storedComments[i];
				}
				storedComments = newFormat;
				RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(newFormat));
			}
		}
	}

	function saveComment(obj, id, href, username) {
		// reload saved comments in case they've been updated in other tabs (works in all but greasemonkey)
		loadSavedComments();
		// loop through comments and make sure we haven't already saved this one...
		if (storedComments[id]) {
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
				storedComments[id] = savedComment;

				var $unsaveObj = $('<li>');
				$unsaveObj.html('<a href="javascript:void 0">unsave-RES</a>')
					.data('unsaveID', id)
					.data('unsaveLink', href)
					.addClass('unsaveComments');

				$(obj).replaceWith($unsaveObj);
			}
			modules['selectedEntry'].select(selectedThing); // restore munging
			RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(storedComments));
		}
	}

	function addSavedCommentsTab() {
		var tabs = '';
		tabs += '<ul id="res-contentTabs">';
		tabs += '<li class="selected"><a href="#standard">Reddit-saved</a></li>';
		tabs += '<li><a href="#comments">RES-saved</a></li>';
		tabs += '</ul>';
		var $tabs = $(tabs);

		$tabs.find('a').on('click', function(event) {
			event.preventDefault();
			showSavedTab(event.target.hash);
		});

		$tabs.insertBefore($('body > .content > #siteTable'));
	}

	function showSavedTab(tab) {
		var $siteTable = $('body > .content > #siteTable');
		var $tabs = $('#res-contentTabs');
		var $savedCommentsContent = $('#res-saveComments');
		if ($tabs.length < 1) {
			return console.error('No element found with ID res-contentTabs');
		}
		switch(tab) {
			default:
				history.replaceState({}, document.title, '.');
				$siteTable.show();
				$savedCommentsContent.hide();
				$('.neverEndingReddit').show();
				$tabs.find('li').removeClass('selected');
				$tabs.find('li:first-of-type').addClass('selected');
				break;
			case '#comments':
				history.replaceState({}, document.title, '#comments');
				$siteTable.hide();
				$('.neverEndingReddit').hide();
				$savedCommentsContent.show();
				$tabs.find('li').removeClass('selected');
				$tabs.find('a[href="' + tab + '"]').parent().addClass('selected');
				break;
		}
	}

	function drawSavedComments() {
		var aboutShortcuts;
		var about = RESUtils.createElement('div', null, 'res-saveComments-tip');
		var subRegex = /(\/r\/.+?)\//i;
		var date;
		var savedCommentsContent = $('#res-saveComments')[0] || RESUtils.createElement('div', 'res-saveComments', 'linklisting');

		document.querySelector('body > div.content').appendChild(savedCommentsContent);
		savedCommentsContent.appendChild(about);

		if (modules['keyboardNav'].isEnabled()) {
			aboutShortcuts = RESUtils.createElement('div', null, 'infobar');
			$(aboutShortcuts).safeHtml('<p><b>Keyboard Shortcuts</b> (' + modules['settingsNavigation'].makeUrlHashLink('keyboardNav', 'savePost', 'configure') + ')</p>\
			<ul><li>Press ' + modules['keyboardNav'].getNiceKeyCode('savePost') + ' to save a <i>post</i> to your reddit account.</li>\
			<li>' + modules['keyboardNav'].getNiceKeyCode('saveComment') + ' to save a <i>comment</i>.</li>\
			<li>' + modules['keyboardNav'].getNiceKeyCode('saveRES') + ' to save a comment locally with RES.</li></ul>');
			about.appendChild(aboutShortcuts);
		}

		for (var i in storedComments) {
			if ((i !== 'RESPro_add') && (i !== 'RESPro_delete')) {
				var thisComment = document.createElement('div');
				date = new Date(storedComments[i].timeSaved);
				thisComment.classList.add('res-savedComment');
				thisComment.classList.add('entry');
				// this is all saved locally, but just for safety, we'll clean out any script tags and whatnot...
				// we'll also remove iframe / video tags because they might autoplay.
				// TODO: save comments using markdown instead of HTML in the future. It's cleaner/safer/better.
				var cleanHTML = '<div class="savedCommentHeader"><a href="' + escapeHTML(storedComments[i].href) + '"><b>' + escapeHTML(storedComments[i].username) + '</b> in ' + escapeHTML(storedComments[i].href.match(subRegex)[1]) + ' - saved <time title="' + RESUtils.niceDateTime(date) + '">' + RESUtils.niceDateDiff(date) + ' ago</time></a></div>';
				cleanHTML += '<div class="savedCommentBody md">' + storedComments[i].comment.replace(/<(script|iframe|video)(.|\s)*?\/(script|iframe|video)>/g, '') + '</div>';
				cleanHTML += '<div class="savedCommentFooter"><ul class="flat-list buttons"><li><a href="' + escapeHTML(storedComments[i].href) + '">permalink</a></li><li><a class="unsaveComment" href="#">unsave-RES</a></li></ul></div>';
				$(thisComment).html(cleanHTML);
				var unsaveLink = thisComment.querySelector('.unsaveComment');
				$(unsaveLink)
					.data('unsaveID', i)
					.data('unsaveLink', storedComments[i].href);
				unsaveLink.addEventListener('click', function(e) {
					e.preventDefault();
					unsaveComment($(this).data('unsaveID'));
				}, true);
				savedCommentsContent.appendChild(thisComment);
			}
		}
		if (!Object.getOwnPropertyNames(storedComments).length) {
			var blurb = $('<div><h1>Saving comments with RES</h1><div>' + module.description + '</div></div>');
			about.insertBefore(blurb[0], aboutShortcuts);
		}
	}

	function unsaveComment(id, unsaveLink) {
		var $savedCommentsContent = $('#res-saveComments');
		delete storedComments[id];
		RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(storedComments));
		if ($savedCommentsContent.length > 0) {
			$savedCommentsContent.remove();
			drawSavedComments();
			showSavedTab('#comments');
		} else {
			var commentObj = unsaveLink.parentNode.parentNode;
			unsaveLink.parentNode.removeChild(unsaveLink);
			addSaveLinkToComment(commentObj);
		}
	}

	module.showEducationalNotification = function() {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			optionKey: 'savePost',
			notificationID: 'saveRES-educational',
			closeDelay: 10000,
			cooldown: 3 * 7 * 24 * 60 * 60 * 1000,
			header: 'Saving Posts and Comments',
			message: '<p>The keyboard shortcuts <b>"' + modules['keyboardNav'].getNiceKeyCode('savePost') + '"</b> (posts) and <b>"' + modules['keyboardNav'].getNiceKeyCode('saveComment') + '"</b> (comments) will save a post/comment to your reddit account (same as the "save" button). It will be accessible from anywhere that you\'re logged in, but the original text will not be preserved if it is edited or deleted.</p>' +
				'<p>The keyboard shortcut <b>"' + modules['keyboardNav'].getNiceKeyCode('saveRES') + '"</b> will save a comment to RES (same as the "save-RES" button). It will only be available locally, but the original text will be preserved if the comment is edited or deleted.</p>' +
				'<p>These shortcuts can be changed in the ' + modules['settingsNavigation'].makeUrlHashLink('keyboardNav', 'savePost', 'settings console') + '.<p>'
		});
	};
});
