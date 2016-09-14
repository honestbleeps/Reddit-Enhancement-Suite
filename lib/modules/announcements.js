// import announcementsNotificationTemplate from '../templates/announcementsNotification.mustache';
import _ from 'lodash';
import { $ } from '../vendor';
import * as Metadata from '../core/metadata';
import { DAY, HOUR, isCurrentSubreddit, CreateElement, BrowserDetect } from '../utils';
import { Storage, ajax, openNewTab } from '../environment';
import * as Menu from './menu';

export const module = {};

module.moduleID = 'announcements';
module.moduleName = 'RES Announcements';
module.category = 'Core';
module.description = 'Keep up with important news';
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

module.beforeLoad = () => {
	if (isCurrentSubreddit(subreddit)) {
		setMarkedRead();
		return [false];
	} else {
		return [postForNotification()];
	}
};

module.go = async ([loadPost]) => {
	const post = await loadPost;
	if (post) {
		notify(post);
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
	if (post.created_js + archiveAfter <= now) {
		// archived
		return false;
	}

	if (post.created_js <= await getMarkedRead()) {
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
		.on('click', e => {
			e.preventDefault();
			e.stopPropagation();

			setMarkedRead();
			e.target.classList.remove('newNotification');
		});
	$('<a>new announcement!</a>')
		.attr({ href: url, title, target: '_blank', rel: 'noopener noreferer' })
		.on('click', e => {
			e.stopPropagation();
			setMarkedRead();
		})
		.appendTo($menuItem);
	Menu.addMenuItem($menuItem, () => openNewTab(url));
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

if (process.env.NODE_ENV === 'development') {
	module.resetStorage = values => {
		// For debugging
		Object.keys(keys).forEach(name => Storage.delete(keys[name]));
		console.log('Cleared storage items for', module.moduleID);

		if (values) {
			Object.keys(values).forEach(name => Storage.set(keys[name], values[name]));
			console.log('Set storage items:', values);
		}
	};
}

async function getLatestPost() {
	const { data: { children: [{ data }] } } = await ajax({
		url: sourceUrl,
		type: 'json',
		cacheFor: recheckPostAfter,
	});

	return {
		...data,
		created_js: data.created_utc * 1000,
	};
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
	const postTitle = post.title;

	if (postTitle.search(/Chrome|Safari|Firefox|Opera|Edge/) === -1) {
		// If post is not browser specific, post is relevant
		return true;
	}

	if (postTitle.search(BrowserDetect.browser) > -1) {
		// If post mentions user's browser, post is relevant
		return true;
	}

	return false;
}


