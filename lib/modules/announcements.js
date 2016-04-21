// import announcementsNotificationTemplate from '../templates/announcementsNotification.hbs';
import { $ } from '../vendor';
import { DAY, HOUR, isCurrentSubreddit } from '../utils';
import { Metadata } from '../core';
import { Storage, ajax } from 'environment';

export const module = {};
{ // eslint-disable-line no-lone-blocks
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
		lastID: 'RESModules.announcement.lastAnnouncementID'
	};

	const archiveAfter = 31 * DAY;
	const pizzazzAfter = 29 * DAY;
	// const notifyAgainAfter = 4 * DAY;
	const recheckPostAfter = HOUR;

	const now = Date.now();

	module.go = function() {
		if (isCurrentSubreddit(subreddit)) {
			setMarkedRead();
		} else {
			maybeNotify();
		}
	};

	function openAnnouncements() {
		location.href = viewUrl;
	}

	async function maybeNotify() {
		const post = await getLatestPost();
		// has the user ever seen a notification? (i.e. is this a fresh install?)
		const hasSeenNotification = await Storage.has(keys.lastUnreadDate);

		if (!post) {
			return;
		}

		// if the post is novel, mark the latest ID and unread date, even if we don't end up showing a notification
		if (await Storage.get(keys.lastID) !== post.id) {
			Storage.set(keys.lastID, post.id);
			Storage.set(keys.lastUnreadDate, now);
		}

		if (post.created_js + archiveAfter <= now) {
			// archived
			return;
		}

		if (post.created_js <= await getMarkedRead()) {
			// posted before last "marked read"
			return;
		}

		const lastUnreadDate = await Storage.get(keys.lastUnreadDate);

		const url = post.id ? `/${post.id}` : viewUrl;
		const withPizzazz = lastUnreadDate + pizzazzAfter < now;

		showMenuBadge(post, url, withPizzazz);

		if (hasSeenNotification) {
			// showNotification(post, url); // TODO: Make this slightly less obnoxious
			addMenuItem(post, url);
		}
	}

	/*
	function showNotification(post, url) {
		const $message = $(announcementsNotificationTemplate({ url, viewUrl, post }));

		modules['notifications'].showNotification({
			moduleID,
			notificationID: post.id || subreddit,
			sticky: true,
			cooldown: notifyAgainAfter,
			header: `New post in /r/${subreddit}`,
			message: $message
		});
	}
	*/

	function showMenuBadge(post, url, withPizzazz) {
		modules['RESMenu'].setNewNotification(openAnnouncements, withPizzazz);
	}

	function addMenuItem(post, url) {
		const $menuItem = $('<div>', { id: 'RESAnnouncementMenuItem' });
		$('<span class="RESMenuItemButton"><span class="gearIcon newNotification" title="mark as read" /></span>')
			.appendTo($menuItem)
			.on('click', e => {
				e.preventDefault();
				e.stopPropagation();

				setMarkedRead();
				e.target.classList.remove('newNotification');
			});
		const menuMessage = `A new post has been made to /r/${subreddit}${post.author ? ` by /u/${post.author}` : ''}`;
		$('<a>new announcement!</a>')
			.attr({ href: url, title: menuMessage })
			.appendTo($menuItem);
		modules['RESMenu'].addMenuItem($menuItem, openAnnouncements);
	}

	module.resetStorage = function(values) {
		// For debugging
		Object.keys(keys).forEach(name => Storage.delete(keys[name]));
		console.log('Cleared storage items for', module.moduleID);

		if (values) {
			Object.keys(values).forEach(name => Storage.set(keys[name], values[name]));
			console.log('Set storage items:', values);
		}
	};

	async function getLatestPost() {
		const { data: { children: [{ data }] } } = await ajax({
			url: sourceUrl,
			type: 'json',
			cacheFor: recheckPostAfter
		});

		return {
			...data,
			created_js: data.created_utc * 1000
		};
	}

	async function getMarkedRead() {
		return parseInt(await Storage.get(keys.markedReadDate), 10) || 0;
	}

	function setMarkedRead() {
		Storage.set(keys.markedReadDate, now);
	}
}
