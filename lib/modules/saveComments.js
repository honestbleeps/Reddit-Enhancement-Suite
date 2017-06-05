/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	Alert,
	WEEK,
	formatDate,
	formatDateDiff,
	formatDateTime,
	isPageType,
	niceKeyCode,
	string,
	watchForThings,
	Thing,
} from '../utils';
import { Storage, i18n } from '../environment';
import * as KeyboardNav from './keyboardNav';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('saveComments');

module.moduleName = 'saveCommentsName';
module.category = 'commentsCategory';
module.exclude = [
	'submit',
];

module.loadDynamicOptions = () => {
	module.description = `
		<p>To save comments with RES click the <em>save-RES</em> button below a comment. You can view
		saved comments on your user page under the <a href="/user/me/saved/#comments">saved</a> tab.
		If you use ${SettingsNavigation.makeUrlHashLink(KeyboardNav.module.moduleID)}, you can press
		<code>${niceKeyCode(KeyboardNav.module.options.toggleCmdLine.value)}</code>
		to open the RES command line, then type in <code>me/sc</code> to see saved-RES comments.</p>
		<p>Saving with RES saves a comment locally in your browser. This means that you can view the comment you saved
		<i>as it looked when you saved it</i>, even if it is later edited or deleted.
		You can save comments with RES if you are not logged in, or if you are logged in to any account—all the
		comments will be visible in one location. You will only be able to view saved RES comments on whichever browser
		you have RES installed on.</p>
		<p>When saving comments with reddit, you must be logged into an account; the comment is saved specifically for that account;
		it won't be shown if you switch to a different account or log out. You can view these comments whenever you are logged into
		the reddit account you saved them from, including on other browsers or devices.</p>
		<p>Visually, saving comments with reddit looks the same as saving with RES—but the text is not saved locally,
		so the saved comment text shows the <i>current</i> state of the comment. If the comment has been edited or deleted
		since you saved it, the text that displays on your account's "saved" page will look different than it looked when you saved it.</p>
		<p>If you have <a href="/gold/about">reddit gold</a> on an account, you can add a category/tag to comments you have saved
		with reddit, then filter saved comments/posts by category. (You cannot sort or filter comments saved with RES.)</p>
	`;
};

const savedRe = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/([\-\w]+)\/saved\/?/i;

const savedCommentStorage = Storage.wrap('RESmodules.saveComments.savedComments', ({}: { [commentId: string]: {|
	href: string,
	username: string,
	comment: string,
	timeSaved: string,
|} }));
let savedCommentIDs;

module.beforeLoad = async () => {
	savedCommentIDs = new Set(Object.keys(await savedCommentStorage.get()));

	if (isPageType('comments', 'commentsLinklist')) watchForThings(['comment'], addSaveLinkToComment);
};

module.go = async () => {
	if (isPageType('comments', 'commentsLinklist')) {
		$('body').on('click', 'li.saveComments', function(e: Event) {
			e.preventDefault();
			const $this = $(this);
			saveComment(this, $this.data('saveID'), $this.data('saveLink'), $this.data('saveUser'));
		});
		$('body').on('click', 'li.unsaveComments', function() {
			// e.preventDefault();
			const id = $(this).data('unsaveID');
			unsaveComment(id, this);
		});
	} else if (savedRe.test(location.href)) {
		await drawSavedComments();
		switchTab(location.hash);
	} else {
		addTabs({ onSavedPage: false });
	}
};

function addSaveLinkToComment(thing) {
	const permaLink = thing.getCommentPermalink();
	if (!permaLink) return;

	const saveHref = permaLink.href;
	const saveID = thing.getFullname().split('_').slice(-1)[0];
	const saveUser = thing.getAuthor() || '[deleted]';

	const $saveLink = $('<li>');

	if (savedCommentIDs.has(saveID)) {
		$saveLink.html('<a class="RES-saved noCtrlF" href="/user/me/saved#comments" data-text="saved-RES"></a>');
	} else {
		$saveLink.html('<a class="RES-save noCtrlF" href="javascript:void 0" title="Save using RES - which is local only, but preserves the full text in case someone edits/deletes it" data-text="save-RES"></a>')
			.addClass('saveComments')
			.data('saveID', saveID)
			.data('saveLink', saveHref)
			.data('saveUser', saveUser);
	}

	// Insert the link right after Reddit Gold's "save" comment link
	const whereToInsert = thing.element.querySelector('.comment-save-button');
	$saveLink.insertAfter(whereToInsert);
}

function saveComment(obj, id, href, username) {
	if (savedCommentIDs.has(id)) {
		Alert.open('comment already saved!');
	} else {
		const comment = obj.parentNode.parentNode.querySelector('div.usertext-body > div.md');
		if (comment) {
			const pureComment = $(comment).clone();
			pureComment.find('.keyNavAnnotation, .expando-button, .res-expando-box, script').remove();
			const savedComment = {
				href,
				username,
				comment: pureComment.html(),
				timeSaved: new Date().toString(),
			};

			savedCommentStorage.patch({ [id]: savedComment });
			savedCommentIDs.add(id);

			const $unsaveObj = $('<li>');
			$unsaveObj.html('<a href="javascript:void 0">unsave-RES</a>')
				.data('unsaveID', id)
				.data('unsaveLink', href)
				.addClass('unsaveComments');

			$(obj).replaceWith($unsaveObj);
		}
	}
}

const addTabs = _.once(({ onSavedPage = true } = {}) => {
	const $reddit = $('#header-bottom-left .tabmenu li').filter((i, e) => {
		const a: ?HTMLAnchorElement = (e.querySelector('a'): any);
		return a && savedRe.test(a.href);
	});
	$reddit.find('a')
		.attr('href', onSavedPage ? '#links' : '/saved/#links')
		.text('saved - reddit');

	const $res = $('<li>').append($('<a>', {
		href: onSavedPage ? '#comments' : '/saved/#comments',
		text: 'saved - RES',
	}));
	$res.insertAfter($reddit);

	if (onSavedPage) {
		$reddit.add($res).find('a').click(e => {
			switchTab((e.target: any).hash);
		});
	}

	return { $reddit, $res };
});

function switchTab(tabHash) {
	const $redditSaved = $('#siteTable, .neverEndingReddit');
	const $resSaved = $('#res-saveComments');

	switch (tabHash) {
		case '#comments':
			$redditSaved.hide();
			addTabs().$reddit.removeClass('selected');
			$resSaved.show();
			addTabs().$res.addClass('selected');
			break;
		case '#links':
		default:
			$resSaved.hide();
			addTabs().$res.removeClass('selected');
			$redditSaved.show();
			addTabs().$reddit.addClass('selected');
			break;
	}
}

const savedCommentsTemplate = ({ comments, keyNavTip, moduleDescription }) => string.html`
	<div id="res-saveComments" class="sitetable linklisting">
		${!comments.length && string._html`
			<div class="res-module-description md">
				<h1>Saving comments with RES</h1>
				${string.safe(moduleDescription)}
			</div>
		`}
		${keyNavTip && keyNavTip.map(({ keyNavHash, savePostKey, saveCommentKey, saveRESKey }) => string._html`
			<div class="res-module-tip infobar">
				<p><i>Keyboard Shortcuts</i> <a class="gearIcon" href="${keyNavHash}" title="RES settings"></a></p>
				<ul>
					<li><b>${savePostKey}}</b>: save a submission.</li>
					<li><b>${saveCommentKey}</b>: save a comment (to your reddit account).</li>
					<li><b>${saveRESKey}</b>: save a comment with RES.</li>
				</ul>
			</div>
		`)}
		<div class="res-saveComments-list">
			${comments.map(({ id, link, username, dateTime, date, timeAgo, body }) => string._html`
				<div class="entry res-savedComment">
					<div class="savedCommentHeader">
						<a href="${link}">
							<b>${username}</b>
							- saved <date title="${dateTime}" datetime="${date}">${timeAgo}</date> ago
						</a>
					</div>
					<div class="savedCommentBody md">${string.safe(body)}</div>
					<div class="savedCommentFooter">
						<ul class="flat-list buttons">
							<li><a href="${link}">permalink</a></li>
							<li><a class="unsaveComment" href="#" data-unsaveID="${id}">unsave-RES</a></li>
						</ul>
					</div>
				</div>
			`)}
		</div>
	</div>
`;

async function drawSavedComments() {
	const savedComments = await savedCommentStorage.get();

	const comments = Object.entries(savedComments).map(([id, { comment, href, username, timeSaved }]) => {
		const date = new Date(timeSaved);
		return {
			id,
			link: href,
			username,
			date: formatDate(date),
			dateTime: formatDateTime(date),
			timeAgo: formatDateDiff(date),
			body: comment.replace(/<(script|iframe|video)(.|\s)*?\/(script|iframe|video)>/g, ''),
		};
	});

	const $saveCommentsContent = $(savedCommentsTemplate({
		moduleDescription: i18n(module.description),
		keyNavTip: Modules.isEnabled(KeyboardNav) && [{
			keyNavHash: SettingsNavigation.makeUrlHash(KeyboardNav.module.moduleID, 'savePost'),
			savePostKey: niceKeyCode(KeyboardNav.module.options.savePost.value),
			saveCommentKey: niceKeyCode(KeyboardNav.module.options.saveComment.value),
			saveRESKey: niceKeyCode(KeyboardNav.module.options.saveRES.value),
		}],
		comments,
	}));

	$saveCommentsContent.appendTo('body > .content');

	$saveCommentsContent.on('click', '.unsaveComment', (e: Event) => {
		e.preventDefault();
		unsaveComment($(e.target).attr('data-unsaveID'));
		$(e.target).text('removed');
	});
}

function unsaveComment(id, unsaveLink) {
	savedCommentStorage.deletePath(id);
	savedCommentIDs.delete(id);
	if (unsaveLink) {
		const commentObj = unsaveLink.parentNode.parentNode;
		unsaveLink.remove();
		addSaveLinkToComment(Thing.checkedFrom(commentObj));
	}
}

export function showEducationalNotification() {
	Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'savePost',
		notificationID: 'saveRES-educational',
		closeDelay: 10000,
		cooldown: 3 * WEEK,
		header: 'Saving Posts and Comments',
		message: `
			<p>
				The keyboard shortcuts <b>"${niceKeyCode(KeyboardNav.module.options.savePost.value)}"</b> (posts) and <b>"${niceKeyCode(KeyboardNav.module.options.saveComment.value)}"</b> (comments) will save a post/comment to your reddit account (same as the "save" button).
				It will be accessible from anywhere that you're logged in, but the original text will not be preserved if it is edited or deleted.
			</p>
			<p>
				The keyboard shortcut <b>"${niceKeyCode(KeyboardNav.module.options.saveRES.value)}"</b> will save a comment to RES (same as the "save-RES" button).
				It will only be available locally, but the original text will be preserved if the comment is edited or deleted.
			</p>
			<p>These shortcuts can be changed in the ${SettingsNavigation.makeUrlHashLink(KeyboardNav.module.moduleID, 'savePost', 'settings console')}.<p>
		`,
	});
}
