import * as KeyboardNav from './keyboardNav';
import * as Notifications from './notifications';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';
import { $ } from '../vendor';
import {
	Alert,
	escapeHTML,
	forEachChunked,
	isPageType,
	watchForElement
} from '../utils';
import { Storage } from 'environment';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'saveComments';
	module.moduleName = 'Save Comments';
	module.category = 'Comments';
	module.exclude = [
		'submit'
	];
	module.beforeLoad = function() {
		this.description = `
			You can save comments with RES: click the <em>save-RES</em> button below the comment. You can view
			these comments on your user page under the "saved - RES" tab (reddit.com/user/MyUsername/saved#comments).
			If you use ${SettingsNavigation.makeUrlHashLink('keyboardNav')}, you can press ${KeyboardNav.getNiceKeyCode('toggleCmdLine')}
			to open the RES command line, then type in <code>me/sc</code> to see saved-RES comments.
			<br><br>
			Saving with RES saves a comment locally in your browser. This means that you can see the comment you saved
			<i>as it looked when you saved it</i>, even if it is later edited or deleted.
			You can save comments with RES if you are not logged in, or if you are logged in to any account—all the
			comments will be visible in one location. You will only be able to view saved RES comments on whichever browser
			you have RES installed on.
			<br><br>
			When saving comments with reddit, you must be logged into an account; the comment is saved specifically for that account;
			it won't be shown if you switch to a different account or log out. You can view these comments whenever you are logged into
			the reddit account you saved them from, including on other browsers or devices.
			<br><br>
			Visually, saving comments with reddit looks the same as saving with RES—but the text is not saved locally,
			so the saved comment text shows the <i>current</i> state of the comment. If the comment has been edited or deleted
			since you saved it, the text that displays on your account's "saved" page will look different then it looked when you saved it.
			<br><br>
			If you have <a href="/gold/about">reddit gold</a> on an account, you can add a category/tag to comments you have saved
			with reddit, then filter saved comments/posts by category. (You cannot sort or filter comments saved with RES.)
		`;
	};

	const savedRe = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/([\-\w]+)\/saved\/?/i;

	module.beforeLoad = async function() {
		await loadSavedComments();
	};

	module.go = function() {
		const currURL = location.href;
		if (isPageType('comments')) {
			addSaveLinks();
			$('body').on('click', 'li.saveComments', function(e) {
				e.preventDefault();
				const $this = $(this);
				saveComment(this, $this.data('saveID'), $this.data('saveLink'), $this.data('saveUser'));
			});
			$('body').on('click', 'li.unsaveComments', function() {
				// e.preventDefault();
				const id = $(this).data('unsaveID');
				unsaveComment(id, this);
			});
		} else if (savedRe.test(currURL)) {
			addSavedCommentsTab();
			drawSavedComments();
			if (location.hash === '#comments') {
				showSavedTab('comments');
			}
		} else {
			addSavedCommentsTab();
		}
		watchForElement('newComments', addSaveLinkToComment);
	};

	function addSaveLinks(ele) {
		ele = ele || document.body;

		// top: new-style. bottom: old-style.
		const allComments = ele.querySelectorAll('div.commentarea > div.sitetable > div.thing div.entry, ' +
			'div.commentarea > div.sitetable > div.thing div.entry div.entry');
		allComments::forEachChunked(comment => addSaveLinkToComment(comment));
	}

	let storedComments = {};

	function addSaveLinkToComment(commentObj) {
		const $commentObj = $(commentObj);
		const $commentsUL = $commentObj.find('ul.flat-list');
		const $permaLink = $commentsUL.find('li.first a.bylink');

		if ($permaLink.length > 0) {
			// Insert the link right after Reddit Gold's "save" comment link
			const $userLink = $commentObj.find('a.author');
			let saveUser;

			if ($userLink.length === 0) {
				saveUser = '[deleted]';
			} else {
				saveUser = $userLink.text();
			}

			const saveHref = $permaLink.attr('href');
			const splitHref = saveHref.split('/');
			const saveID = splitHref[splitHref.length - 1];
			const $saveLink = $('<li>');

			if (storedComments && storedComments[saveID]) {
				$saveLink.html('<a class="RES-saved noCtrlF" href="/saved#comments" data-text="saved-RES"></a>');
			} else {
				$saveLink.html('<a class="RES-save noCtrlF" href="javascript:void 0" title="Save using RES - which is local only, but preserves the full text in case someone edits/deletes it" data-text="save-RES"></a>')
					.addClass('saveComments')
					.data('saveID', saveID)
					.data('saveLink', saveHref)
					.data('saveUser', saveUser);
			}

			const $whereToInsert = $commentsUL.find('.comment-save-button');
			$whereToInsert.after($saveLink);
		}
	}

	async function loadSavedComments() {
		storedComments = await Storage.get('RESmodules.saveComments.savedComments') || {};
	}

	function saveComment(obj, id, href, username) {
		// loop through comments and make sure we haven't already saved this one...
		if (storedComments[id]) {
			Alert.open('comment already saved!');
		} else {
			const selectedThing = SelectedEntry.unselect(); // un-munge annotations or other mutilations

			const comment = obj.parentNode.parentNode.querySelector('div.usertext-body > div.md');
			if (comment) {
				const savedComment = {
					href,
					username,
					comment: comment.innerHTML.replace(/<script(.|\s)*?\/script>/g, ''),
					timeSaved: Date.now()
				};
				storedComments[id] = savedComment;
				Storage.patch('RESmodules.saveComments.savedComments', { [id]: savedComment });

				const $unsaveObj = $('<li>');
				$unsaveObj.html('<a href="javascript:void 0">unsave-RES</a>')
					.data('unsaveID', id)
					.data('unsaveLink', href)
					.addClass('unsaveComments');

				$(obj).replaceWith($unsaveObj);
			}
			SelectedEntry.select(selectedThing); // restore munging
		}
	}

	function addSavedCommentsTab() {
		const mainmenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
		if (mainmenuUL) {
			const menuItems = mainmenuUL.querySelectorAll('li');
			for (const menuItem of Array.from(menuItems)) {
				const savedLink = menuItem.querySelector('a');
				if ((menuItem.classList.contains('selected')) && (savedRe.test(savedLink.getAttribute('href')))) {
					menuItem.addEventListener('click', e => {
						e.preventDefault();
						showSavedTab('links');
					}, true);
				}

				if (savedRe.test(savedLink.getAttribute('href'))) {
					$(menuItem).attr('id', 'savedLinksTab');
					savedLink.textContent = 'saved - reddit';
				}
			}

			$('<li id="savedCommentsTab">')
				.html('<a href="javascript:void 0">saved - RES</a>')
				.insertAfter('#savedLinksTab');
			if (savedRe.test(location.href)) {
				$('#savedCommentsTab').on('click', e => {
					e.preventDefault();
					showSavedTab('comments');
				});
			} else {
				$('#savedCommentsTab').on('click', e => {
					e.preventDefault();
					location.href = '/saved/#comments';
				});
			}
		}
	}

	let savedLinksContent, $savedCommentsContent;

	function showSavedTab(tab) {
		switch (tab) {
			case 'links':
				location.hash = 'links';
				savedLinksContent.style.display = 'block';
				$savedCommentsContent.hide();
				$('#savedLinksTab').addClass('selected');
				$('#savedCommentsTab').removeClass('selected');
				break;
			case 'comments':
				location.hash = 'comments';
				savedLinksContent.style.display = 'none';
				$savedCommentsContent.show();
				$('#savedLinksTab').removeClass('selected');
				$('#savedCommentsTab').addClass('selected');
				break;
			default:
				break;
		}
	}

	function drawSavedComments() {
		savedLinksContent = document.body.querySelector('BODY > div.content');
		$savedCommentsContent = $('<div>', {
			id: 'savedLinksList',
			class: 'sitetable linklisting',
			style: 'display: none'
		});

		const saveRESTips = document.createElement('div');
		saveRESTips.classList.add('savedComment', 'entry');
		$(saveRESTips).safeHtml(`
			<p><b>Tip:</b> Don't see a comment here? Check the "saved - reddit" tab above.</p>
			<p>
				Currently, the keyboard shortcut "${KeyboardNav.getNiceKeyCode('savePost')}" saves a post to your reddit account,
				"${KeyboardNav.getNiceKeyCode('saveComment')}" saves a comment to your reddit account,
				and "${KeyboardNav.getNiceKeyCode('saveRES')}" saves a comment locally with RES.
				These can be changed in the ${SettingsNavigation.makeUrlHashLink('keyboardNav', 'savePost', 'settings console')}.
			</p>
		`);
		$savedCommentsContent.append(saveRESTips);

		for (const i in storedComments) {
			if ((i !== 'RESPro_add') && (i !== 'RESPro_delete')) {
				const clearLeft = document.createElement('div');
				clearLeft.setAttribute('class', 'clearleft');
				const thisComment = document.createElement('div');
				thisComment.classList.add('savedComment');
				thisComment.classList.add('entry');
				// this is all saved locally, but just for safety, we'll clean out any script tags and whatnot...
				// we'll also remove iframe / video tags because they might autoplay.
				// TODO: save comments using markdown instead of HTML in the future. It's cleaner/safer/better.
				const cleanHTML = `
					<div class="savedCommentHeader">Comment by user: ${escapeHTML(storedComments[i].username)} saved on ${escapeHTML(storedComments[i].timeSaved)}</div>
					<div class="savedCommentBody md">${storedComments[i].comment.replace(/<(script|iframe|video)(.|\s)*?\/(script|iframe|video)>/g, '')}</div>
					<div class="savedCommentFooter"><ul class="flat-list buttons"><li><a class="unsaveComment" href="javascript:void 0">unsave-RES</a></li><li><a href="${escapeHTML(storedComments[i].href)}">view original</a></li></ul></div>
				`;
				$(thisComment).html(cleanHTML);
				const unsaveLink = thisComment.querySelector('.unsaveComment');
				$(unsaveLink)
					.data('unsaveID', i)
					.data('unsaveLink', storedComments[i].href);
				unsaveLink.addEventListener('click', function(e) {
					e.preventDefault();
					unsaveComment($(this).data('unsaveID'));
				}, true);
				$savedCommentsContent.append(thisComment);
				$savedCommentsContent.append(clearLeft);
			}
		}
		if (!Object.getOwnPropertyNames(storedComments).length) {
			const $blurb = $(`
				<li class="savedComment entry">
					<p>Click the <em>save-RES</em> button on a comment, then come here to see it.</p>
					<hr>
					<p>${module.description}</p>
				</li>
			`);

			$savedCommentsContent.append($blurb);
		}
		$(savedLinksContent).after($savedCommentsContent);
	}

	function unsaveComment(id, unsaveLink) {
		delete storedComments[id];
		Storage.deletePath('RESmodules.saveComments.savedComments', id);
		if ($savedCommentsContent) {
			$savedCommentsContent.remove();
			drawSavedComments();
			showSavedTab('comments');
		} else {
			const commentObj = unsaveLink.parentNode.parentNode;
			unsaveLink.parentNode.removeChild(unsaveLink);
			addSaveLinkToComment(commentObj);
		}
	}

	module.showEducationalNotification = function() {
		Notifications.showNotification({
			moduleID: module.moduleID,
			optionKey: 'savePost',
			notificationID: 'saveRES-educational',
			closeDelay: 10000,
			cooldown: 3 * 7 * 24 * 60 * 60 * 1000,
			header: 'Saving Posts and Comments',
			message: `
				<p>
					The keyboard shortcuts <b>"${KeyboardNav.getNiceKeyCode('savePost')}"</b> (posts) and <b>"${KeyboardNav.getNiceKeyCode('saveComment')}"</b> (comments) will save a post/comment to your reddit account (same as the "save" button).
					It will be accessible from anywhere that you're logged in, but the original text will not be preserved if it is edited or deleted.
				</p>
				<p>
					The keyboard shortcut <b>"${KeyboardNav.getNiceKeyCode('saveRES')}"</b> will save a comment to RES (same as the "save-RES" button).
					It will only be available locally, but the original text will be preserved if the comment is edited or deleted.
				</p>
				<p>These shortcuts can be changed in the ${SettingsNavigation.makeUrlHashLink('keyboardNav', 'savePost', 'settings console')}.<p>
			`
		});
	};
}
