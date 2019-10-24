/* @flow */

import _ from 'lodash';
import { Module } from '../core/module';
import * as Metadata from '../core/metadata';
import { addFloater, DAY, HOUR, isCurrentSubreddit, CreateElement, string } from '../utils';
import { Storage, ajax, openNewTab, i18n } from '../environment';
import type { RedditListing, RedditLink } from '../types/reddit';
import * as Menu from './menu';

export const module: Module<*> = new Module('announcements');

module.moduleName = 'announcementsName';
module.category = 'coreCategory';
module.description = 'announcementsDesc';
module.hidden = true;

const subreddit = Metadata.announcementsSubreddit;
const sourceUrl = `/r/${subreddit}/new.json?limit=1`;
const viewUrl = `/r/${subreddit}/new`;

const markedReadDate = Storage.wrap('RESmodules.announcement.markedReadDate', 0);
const lastUnreadDate = Storage.wrap('RESmodules.announcement.lastUnreadDate', 0);
const lastID = Storage.wrap('RESModules.announcement.lastAnnouncementID', (null: null | string));

const archiveAfter = 31 * DAY;
const pizzazzAfter = 29 * DAY;
// const notifyAgainAfter = 4 * DAY;
const recheckPostAfter = HOUR;

const now = Date.now();

let biff;

module.go = async () => {
	if (isCurrentSubreddit(subreddit)) {
		setMarkedRead();
	} else {
		const post = await postForNotification();
		if (post) {
			notify(post);
		}
	}
};

async function postForNotification() {
	const post = await getLatestPost();
	if (!post) {
		return false;
	}
	cacheLatestPost(post);

	const result = await shouldNotify(post);
	return result ? post : false;
}

async function shouldNotify(post) {
	const createdDate = post.created_utc * 1000;

	if (createdDate + archiveAfter <= now) {
		// archived
		return false;
	}

	if (createdDate <= await markedReadDate.get()) {
		// posted before last "marked read"
		return false;
	}

	if (!isPostRelevant(post)) {
		return false;
	}

	return true;
}

const notify = _.once(async post => {
	const url = post.id ? `/comments/${post.id}` : viewUrl;
	const withPizzazz = (await lastUnreadDate.get()) + pizzazzAfter < now;
	const title = post.author ?
		i18n('announcementsNewPostByUser', subreddit, post.author) :
		i18n('announcementsNewPost', subreddit);

	addAnnouncementBiff(post, url, title, withPizzazz);

	// has the user ever seen a notification? (i.e. is this a fresh install?)
	const hasSeenNotification = await lastUnreadDate.has();
	if (hasSeenNotification) {
		// showNotification(post, url); // TODO: Make this slightly less obnoxious
		Menu.addMenuItem(
			() => string.html`<span title="${title}">
				new announcement!
				<span data-action="preventOpenNewTab" class="RESMenuItemButton res-icon"></span> // TODO Restore title="i18n('announcementsMarkAsRead')"
			</span>`,
			e => {
				setMarkedRead();
				if (e.target.closest('[data-action="preventOpenNewTab"]')) return;
				openNewTab(url);
			},
			-8
		);
	}
});

async function cacheLatestPost(post) {
	// if the post is novel, mark the latest ID and unread date, even if we don't end up showing a notification
	if (post.id !== await lastID.get()) {
		lastID.set(post.id);
		lastUnreadDate.set(now);
	}
}

/*
function showNotification(post, url) {
	Notifications.showNotification({
		moduleID,
		notificationID: post.id || subreddit,
		sticky: true,
		cooldown: notifyAgainAfter,
		header: `New post in /r/${subreddit}`,
		message: announcementsNotificationTemplate({ url, viewUrl, post })
	});
}
*/

function addAnnouncementBiff(post, url, title, withPizzazz) {
	biff = string.html`<a id="RESAnnouncementAlert" class="${withPizzazz ? 'important' : ''} href="${url}" target="_blank">`;
	biff.append(CreateElement.icon(0xF076, 'span', '', title));
	biff.addEventListener('click', setMarkedRead);

	addFloater(biff, { container: 'inNavbar' });
}

async function getLatestPost() {
	const { data: { children: [{ data }] } } = (await ajax({
		url: sourceUrl,
		type: 'json',
		cacheFor: recheckPostAfter,
	}): RedditListing<RedditLink>);

	return data;
}

function setMarkedRead() {
	markedReadDate.set(now);
	if (biff) biff.remove();
}

function isPostRelevant(post) {
	if (!(/chrome|safari|firefox|opera|edge/i).test(post.title)) {
		// If post is not browser specific, post is relevant
		return true;
	}

	if (post.title.toLowerCase().includes((process.env.BUILD_TARGET: any).toLowerCase())) {
		// If post mentions user's browser, post is relevant
		return true;
	}

	return false;
}
