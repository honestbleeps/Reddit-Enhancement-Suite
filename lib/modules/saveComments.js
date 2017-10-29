/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
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
module.description = 'saveCommentsDesc';
module.category = 'commentsCategory';
module.exclude = [
	'submit',
];

const savedRe = /\/user\/([\-\w]+)\/saved\/?/i;

const savedCommentStorage = Storage.wrap('RESmodules.saveComments.savedComments', ({}: { [commentId: string]: {|
	href: string,
	username: string,
	comment: string,
	timeSaved: string,
|} }));
let savedCommentIDs;

module.beforeLoad = async () => {
	savedCommentIDs = new Set(Object.keys(await savedCommentStorage.get()));

	watchForThings(['comment'], addSaveLinkToComment);
};

module.go = async () => {
	if (savedRe.test(location.pathname)) {
		await drawSavedComments();
		switchTab(location.hash);
	} else if (isPageType('profile')) {
		addTabs({ onSavedPage: false });
	}
};

function getId(thing) {
	return thing.getFullname().split('_').slice(-1)[0];
}

const unsaveElement = (e => () => e().cloneNode(true))(_.once(() => string.html`
	<li class="unsaveComments">
		<a class="RES-saved noCtrlF" href="/user/me/saved#comments" data-text="saved-RES"></a>
	</li>
`));
const saveElement = (e => () => e().cloneNode(true))(_.once(() => {
	$(document.body).on('click', 'li.saveComments', ({ currentTarget }: Event) => {
		const thing = Thing.checkedFrom(currentTarget);
		saveComment(thing);
		currentTarget.remove();
		addSaveLinkToComment(thing);
	});

	return string.html`
		<li class="saveComments">
			<a class="RES-save noCtrlF" href="javascript:void 0" title="Save using RES - which is local only, but preserves the full text in case someone edits/deletes it" data-text="save-RES"></a>
		</li>
	`;
}));

function addSaveLinkToComment(thing) {
	const sibling = thing.element.querySelector('ul.buttons .comment-save-button');
	if (!sibling) return;
	sibling.after(savedCommentIDs.has(getId(thing)) ? unsaveElement() : saveElement());
}

function getCommentContent(thing) {
	const content = $(thing.entry.querySelector('div.usertext-body > div.md')).clone();
	content.find('.keyNavAnnotation, .expando-button, .res-expando-box, script').remove();
	return content.html();
}

function saveComment(thing: Thing) {
	const id = getId(thing);
	if (savedCommentIDs.has(id)) throw new Error('comment already saved!');

	const permaLink = thing.getCommentPermalink();
	if (!permaLink) throw new Error('Comment lacks permalink');

	savedCommentStorage.patch({
		[id]: {
			href: permaLink.href,
			username: thing.getAuthor() || '[deleted]',
			comment: getCommentContent(thing),
			timeSaved: new Date().toString(),
		},
	});
	savedCommentIDs.add(id);
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
					<li><b>${savePostKey}</b>: save a submission.</li>
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

function unsaveComment(id) {
	savedCommentStorage.deletePath(id);
	savedCommentIDs.delete(id);
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
