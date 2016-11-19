/* @flow */

// import announcementsNotificationTemplate from '../templates/announcementsNotification.mustache';
import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Metadata from '../core/metadata';
import { DAY, HOUR, isCurrentSubreddit, CreateElement } from '../utils';
import { Storage, ajax, openNewTab } from '../environment';
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

const keys = {
	markedReadDate: 'RESmodules.announcement.markedReadDate',
	lastUnreadDate: 'RESmodules.announcement.lastUnreadDate',
	lastID: 'RESModules.announcement.lastAnnouncementID',
};

const archiveAfter = 31 * DAY;
const pizzazzAfter = 29 * DAY;
// const notifyAgainAfter = 4 * DAY;
const recheckPostAfter = HOUR;

const now = Date.now();

let $biff;

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

	if (createdDate <= await getMarkedRead()) {
		// posted before last "marked read"
		return false;
	}

	if (!isPostRelevant(post)) {
		return false;
	}

	return true;
}

const notify = _.once(async post => {
	const lastUnreadDate = await Storage.get(keys.lastUnreadDate);

	const url = post.id ? `/${post.id}` : viewUrl;
	const withPizzazz = lastUnreadDate + pizzazzAfter < now;
	const title = `A new post has been made to /r/${subreddit}${post.author ? ` by /u/${post.author}` : ''}`;

	addAnnouncementBiff(post, url, title, withPizzazz);

	// has the user ever seen a notification? (i.e. is this a fresh install?)
	const hasSeenNotification = await Storage.has(keys.lastUnreadDate);
	if (hasSeenNotification) {
		// showNotification(post, url); // TODO: Make this slightly less obnoxious
		addMenuItem(post, url, title);
	}
});

async function cacheLatestPost(post) {
	// if the post is novel, mark the latest ID and unread date, even if we don't end up showing a notification
	if (await Storage.get(keys.lastID) !== post.id) {
		Storage.set(keys.lastID, post.id);
		Storage.set(keys.lastUnreadDate, now);
	}
}

/*
function showNotification(post, url) {
	const $message = $(announcementsNotificationTemplate({ url, viewUrl, post }));

	Notifications.showNotification({
		moduleID,
		notificationID: post.id || subreddit,
		sticky: true,
		cooldown: notifyAgainAfter,
		header: `New post in /r/${subreddit}`,
		message: $message
	});
}
*/

function addMenuItem(post, url, title = '') {
	const $menuItem = $('<div>', { id: 'RESAnnouncementMenuItem' });
	$('<span class="RESMenuItemButton"></span>')
		.append(CreateElement.icon('F134', 'span', '', 'mark as read'))
		.appendTo($menuItem)
		.on('click', (e: Event) => {
			e.preventDefault();
			e.stopPropagation();

			setMarkedRead();
			e.target.classList.remove('newNotification');
		});
	$('<a>new announcement!</a>')
		.attr({ href: url, title, target: '_blank', rel: 'noopener noreferer' })
		.on('click', (e: Event) => {
			e.stopPropagation();
			setMarkedRead();
		})
		.appendTo($menuItem);
	Menu.addMenuItem($menuItem, () => { openNewTab(url); });
}

function addAnnouncementBiff(post, url, title, withPizzazz) {
	$biff = $('<a id="RESAnnouncementAlert" />')
		.attr({ href: url, target: '_blank' })
		.append(CreateElement.icon('F132', 'span', '', title))
		.on('click', setMarkedRead)
		.appendTo('#header-bottom-right');

	if (withPizzazz) {
		$biff.addClass('important');
	}
}

async function getLatestPost() {
	const { data: { children: [{ data }] } } = (await ajax({
		url: sourceUrl,
		type: 'json',
		cacheFor: recheckPostAfter,
	}): RedditListing<RedditLink>);

	return data;
}

async function getMarkedRead() {
	return parseInt(await Storage.get(keys.markedReadDate), 10) || 0;
}

function setMarkedRead() {
	Storage.set(keys.markedReadDate, now);
	if ($biff) {
		$biff.remove();
	}
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
