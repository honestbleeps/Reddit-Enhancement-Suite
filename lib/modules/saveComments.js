addModule('saveComments', function(module, moduleID) {
	module.moduleName = 'Save Comments';
	module.category = 'Comments';
	module.exclude = [
		'submit'
	];
	module.loadDynamicOptions = function() {
		this.description = '\
			<p>To save comments with RES click the <em>save-RES</em> button below a comment. You can view \
			saved comments on your user page under the <a href="/user/me/saved/#comments">saved</a> tab. \
			If you use ' + modules['settingsNavigation'].makeUrlHashLink('keyboardNav') + ', you can press \
			<code>' + modules['keyboardNav'].getNiceKeyCode('toggleCmdLine') + '</code> \
			to open the RES command line, then type in <code>me/sc</code> to view saved comments.</p>\
			<p>Saving with RES saves a comment locally in your browser. This means that you can view the comment \
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
				drawSavedComments();
				addTabs();
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
				$saveLink.html('<a class="RES-saved noCtrlF" href="/user/me/saved#comments" data-text="saved-RES"></a>');
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
		// TODO: save comments using markdown instead of HTML in the future. It's cleaner/safer/better.
		// Reload saved comments in case they've been updated in other tabs (works in all but greasemonkey)
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

	function addTabs() {
		var tabs = [{
			href: '#standard',
			tab: 'Reddit-saved'
		}, {
			href: '#comments',
			tab: 'RES-saved'
		}];

		RESTemplates.load('contentTabs', function(template) {
			var output = template.html({tabs});
			$(output).insertBefore($('body > .content > #siteTable'));
		});

		var $contentTabs = $('.res-contentTabs');

		switchTab(location.hash);

		$contentTabs.find('a').on('click', function(event) {
			event.preventDefault();
			switchTab(event.target.hash);
		});
	}

	function switchTab(tab) {
		var $redditSaved = $('body > .content > #siteTable, .neverEndingReddit');
		var $resSaved = $('#res-saveComments');
		var $tabs = $('.res-contentTabs');

		if ($tabs.length < 1) {
			return console.error('No element found with the class "res-contentTabs".');
		}

		$tabs.find('li.selected').removeClass('selected');

		if (tab) {
			location.hash = tab;
			$tabs.find('a[href="' + tab + '"]').parent().addClass('selected');
		} else {
			$tabs.find('li:first').addClass('selected');
		}

		$resSaved.hide();
		$redditSaved.hide();

		switch (tab) {
			default:
				$redditSaved.show();
				break;
			case '#comments':
				$resSaved.show();
				break;
		}
	}

	function drawSavedComments() {
		var date, comments = [], keyNavHash;

		// Construct an array containing all saved comments.
		for (var i in storedComments) {
			if ((i !== 'RESPro_add') && (i !== 'RESPro_delete')) {
				date = new Date(storedComments[i].timeSaved);
				comments.push({
					id: i,
					link: escapeHTML(storedComments[i].href),
					username: escapeHTML(storedComments[i].username),
					subreddit: escapeHTML(storedComments[i].href.match(/(\/r\/.+?)\//i)[1]),
					date: RESUtils.niceDate(date),
					dateTime: RESUtils.niceDateTime(date),
					timeAgo: RESUtils.niceDateDiff(date),
					body: storedComments[i].comment.replace(/<(script|iframe|video)(.|\s)*?\/(script|iframe|video)>/g, '')
				});
			}
		}

		if (modules['keyboardNav'].isEnabled()) {
			keyNavHash = modules['settingsNavigation'].makeUrlHash('keyboardNav', 'savePost')
		}

		RESTemplates.load('saveComments', function(template) {
			var output = template.html({
				moduleDescription: module.description,
				keyNavTip: keyNavHash,
				savePostKey: modules['keyboardNav'].getNiceKeyCode('savePost'),
				saveCommentKey: modules['keyboardNav'].getNiceKeyCode('saveComment'),
				saveRESKey: modules['keyboardNav'].getNiceKeyCode('saveRES'),
				comments: comments
			});
			$('body > .content').append(output);
		});

		$('.res-saveComments-list').on('click', function(e) {
			if (e.target.classList.contains('unsaveComment')) {
				e.preventDefault();
				unsaveComment($(e.target).attr('data-unsaveID'), e.target);
			}
		});
	}

	function unsaveComment(id, unsaveLink) {
		var $savedCommentsContent = $('#res-saveComments');
		delete storedComments[id];
		RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(storedComments));
		if ($savedCommentsContent.length > 0) {
			$(unsaveLink).text('removed');
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
