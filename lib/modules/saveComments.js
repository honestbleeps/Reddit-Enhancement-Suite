/* @flow */

import $ from 'jquery';
import { once } from 'lodash-es';
import { markdown } from 'snudown-js';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	CreateElement,
	WEEK,
	addDashboardTab,
	formatDate,
	formatDateDiff,
	formatDateTime,
	isPageType,
	niceKeyCode,
	preventCloning,
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

const savedCommentStorage = Storage.wrapBlob('RESmodules.saveComments.savedComments', (): {|
	href: string,
	username: string,
	comment: string,
	timeSaved: string,
|} => { throw new Error('Saved comment not found'); });

module.beforeLoad = () => {
	watchForThings(['comment'], thing => {
		const sibling = thing.entry.querySelector('.comment-save-button');
		if (!sibling) return;
		sibling.after(saveElement());
	});
};

module.contentStart = () => {
	if (isPageType('profile')) {
		CreateElement.tabMenuItem({
			text: 'saved - RES',
			onChange: () => { location.href = '/r/dashboard/#savedComments'; },
		});
	}

	addDashboardTab('savedComments', 'Saved Comments', module.moduleID, async tabPage => $(tabPage).append(await drawSavedComments()));
};

const saveElement = (e => () => preventCloning(e().cloneNode(true)))(once(() => {
	$(document.body).on('click', 'li.saveComments', ({ currentTarget }: Event) => {
		if (currentTarget.classList.contains('saved-RES')) return;

		const thing = Thing.checkedFrom(currentTarget);
		saveComment(thing);

		const a = (currentTarget.firstElementChild: any);
		requestAnimationFrame(() => {
			a.dataset.text = 'saved-RES';
			a.href = '/r/dashboard#savedComments';
		});
	});

	return string.html`
		<li class="saveComments">
			<a class="RES-save noCtrlF" href="javascript:void 0" title="Save using RES - which is local only, but preserves the full text in case someone edits/deletes it" data-text="save-RES"></a>
		</li>
	`;
}));

async function saveComment(thing: Thing) {
	const permaLink = thing.getCommentPermalink();
	if (!permaLink) throw new Error('Comment lacks permalink');

	const textBody = thing.getTextBody();
	if (!textBody) throw new Error('Comment text body not found');

	const id = thing.getFullname().split('_').slice(-1)[0];
	if ((await savedCommentStorage.getAll()).hasOwnProperty(id)) return;

	const comment = $(textBody).clone();
	comment.find('.keyNavAnnotation, .expando-button, .res-expando-box, script, .userTagLink').remove();

	savedCommentStorage.set(id, {
		href: permaLink.href,
		username: thing.getAuthor() || '[deleted]',
		comment: comment.html(),
		timeSaved: new Date().toString(),
	});
}

const savedCommentsTemplate = ({ comments, keyNavTip, moduleDescription }) => string.html`
	<div id="res-saveComments" class="sitetable linklisting">
		${!comments.length && string._html`
			<div class="res-module-description md">
				<h1>Saving comments with RES</h1>
				${string.safe(markdown(moduleDescription))}
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

const drawSavedComments = once(async () => {
	const savedComments = await savedCommentStorage.getAll();

	const comments = Object.entries(savedComments).map(([id, { comment, href, username, timeSaved }]) => {
		const date = new Date(timeSaved);
		return {
			id,
			link: href,
			username,
			date: formatDate(date),
			dateTime: formatDateTime(date),
			timeAgo: formatDateDiff(date),
			body: (typeof comment === 'string' ? comment : '' /* `undefined` might have been saved at a buggy past */)
				.replace(/<(script|iframe|video)(.|\s)*?\/(script|iframe|video)>/g, ''),
		};
	});

	return $(savedCommentsTemplate({
		moduleDescription: i18n(module.description),
		keyNavTip: Modules.isEnabled(KeyboardNav) && [{
			keyNavHash: SettingsNavigation.makeUrlHash(KeyboardNav.module.moduleID, 'savePost'),
			savePostKey: niceKeyCode(KeyboardNav.module.options.savePost.value),
			saveCommentKey: niceKeyCode(KeyboardNav.module.options.saveComment.value),
			saveRESKey: niceKeyCode(KeyboardNav.module.options.saveRES.value),
		}],
		comments,
	}))
		.on('click', '.unsaveComment', (e: Event) => {
			e.preventDefault();
			savedCommentStorage.delete(e.currentTarget.dataset.unsaveid);
			e.currentTarget.textContent = 'removed';
		});
});

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
