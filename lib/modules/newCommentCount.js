/* @flow */

import $ from 'jquery';
import { memoize } from 'lodash-es';
import { Module } from '../core/module';
import {
	DAY,
	MINUTE,
	Table,
	Thing,
	addDashboardTab,
	escapeHTML,
	empty,
	execRegexes,
	formatRelativeTime,
	formatDateTime,
	getPostMetadata,
	isPageType,
	maybePruneOldEntries,
	loggedInUser,
	regexes,
	string,
	watchForThings,
	mutex,
	waitForEvent,
	waitForDescendant,
} from '../utils';
import { Storage, isPrivateBrowsing } from '../environment';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('newCommentCount');

module.moduleName = 'newCommentCountName';
module.category = 'submissionsCategory';
module.description = 'newCommentCountDesc';
module.options = {
	hideWhenUnchanged: {
		type: 'boolean',
		value: true,
		description: 'newCommentCountHideWhenUnchangedDesc',
		title: 'newCommentCountHideWhenUnchangedTitle',
	},
	cleanComments: {
		type: 'text',
		value: '30',
		description: 'newCommentCountCleanCommentsDesc',
		title: 'newCommentCountCleanCommentsTitle',
		advanced: true,
	},
	subscriptionLength: {
		type: 'text',
		value: '2',
		description: 'newCommentCountSubscriptionLengthDesc',
		title: 'newCommentCountSubscriptionLengthTitle',
	},
	showSubscribeButton: {
		type: 'boolean',
		value: true,
		description: 'newCommentCountShowSubscribeButtonDesc',
		title: 'newCommentCountShowSubscribeButtonTitle',
	},
	notifyEditedPosts: {
		dependsOn: options => options.showSubscribeButton.value,
		type: 'boolean',
		value: false,
		description: 'newCommentCountNotifyEditedPostsDesc',
		title: 'newCommentCountNotifyEditedPostsTitle',
		advanced: true,
	},
	monitorPostsVisited: {
		type: 'boolean',
		value: true,
		description: 'newCommentCountMonitorPostsVisitedDesc',
		title: 'newCommentCountMonitorPostsVisitedTitle',
		advanced: true,
	},
	monitorPostsVisitedIncognito: {
		dependsOn: options => options.monitorPostsVisited.value,
		type: 'boolean',
		value: false,
		description: 'newCommentCountMonitorPostsVisitedIncognitoDesc',
		title: 'newCommentCountMonitorPostsVisitedIncognitoTitle',
		advanced: true,
	},
};

const entryStorage = Storage.wrapPrefix('newCommentCount.', (): {|
	count: number,
	updateTime: number,
|} => {
	throw new Error('Default value should never be retrieved');
}, undefined, true);

const subscriptionStorage = Storage.wrapBlob('RESmodules.newCommentCount.subscriptions', (): {|
	count: number,
	subscriptionDate: number,
	editedTime: number,
	updateTime: number,
	url: string,
	title: string,
|} => { throw new Error('Subscription not found'); });

module.beforeLoad = () => {
	// Immediately load data in order to have data ready on mutation
	watchForThings(['post'], getNewCount, { immediate: true });

	watchForThings(['post'], displayNewCommentCount);
};

module.contentStart = () => {
	const id = (execRegexes.comments(location.pathname) || [])[2];
	if (id && module.options.showSubscribeButton.value) {
		addSubscriptionButton(id);
	}

	addDashboardTab('newCommentsContents', 'My Subscriptions', module.moduleID, addDashboardFunctionality);
};

let listingThing: ?Thing;
let currentCommentCount: ?number;

module.afterLoad = () => {
	// Avoid missing notifications by only running the check when document is visible
	if (!document.hidden) {
		checkSubscriptions();
	}

	if (isPageType('comments')) {
		listingThing = Thing.from(document.querySelector('#siteTable a.comments'));
		if (listingThing) {
			currentCommentCount = listingThing.getCommentCount();
			if (typeof currentCommentCount === 'number') {
				// Save current comment count
				setEntry(getId(listingThing), currentCommentCount);

				// Increment comment count when posting comment
				watchForThings(['comment'], updateCurrentCommentCountFromMyComment);
			}
		}
	}

	maybePruneOldEntries('newCommentCount', entryStorage, parseInt(module.options.cleanComments.value, 10));
};

const getId = thing => thing.getFullname().split('_').slice(-1)[0];

export const hasEntry = (thing: Thing) => entryStorage.has(getId(thing));

function setEntry(id: string, newCommentCount: number) {
	if (!module.options.monitorPostsVisited.value) return false;
	if (!module.options.monitorPostsVisitedIncognito.value && isPrivateBrowsing()) return false;

	entryStorage.set(id, {
		count: newCommentCount,
		updateTime: Date.now(),
	});
}

export const getNewCount = memoize(async (thing: Thing): Promise<?number> => {
	const currentCount = thing.getCommentCount();
	if (typeof currentCount !== 'number') return;

	const { count: lastOpenedCount } = await entryStorage.getNullable(getId(thing)) || {};
	if (typeof lastOpenedCount !== 'number') return;

	return Math.max(currentCount - lastOpenedCount, 0);
});

async function displayNewCommentCount(thing) {
	const newCount = await getNewCount(thing);
	if (typeof newCount !== 'number') return;
	if (!newCount && module.options.hideWhenUnchanged.value) return;

	if (newCount) thing.element.classList.add('res-hasNewComments');

	$(thing.getCommentCountElement())
		.append(`<span class="newComments">&nbsp;(${newCount} new)</span>`);
}

function updateCurrentCommentCountFromMyComment(thing) {
	const timestamp = thing.getTimestamp();
	const isRecent = timestamp && (Date.now() - timestamp.getTime()) < 10000;
	const isMine = loggedInUser() === thing.getAuthor();
	if (isRecent && isMine && listingThing && typeof currentCommentCount === 'number') {
		setEntry(getId(listingThing), ++currentCommentCount);
	}
}

const addSubscriptionButton = id => {
	const button = string.html`<span id="REScommentSubToggle" class="RESSubscriptionButton"></span>`;

	const refresh = mutex(async () => {
		if (await subscriptionStorage.has(id)) {
			// Unsubscribe.
			$(button)
				.html('<span class="res-icon">&#xF038;</span> unsubscribe')
				.attr('title', 'stop receiving notifications')
				.addClass('unsubscribe');
			waitForEvent(button, 'click').then(async () => {
				await unsubscribe(id);
				Notifications.showNotification({
					notificationID: 'newCommentCountUnsubscribe',
					moduleID: 'newCommentCount',
					message: 'You are now unsubscribed from this thread.',
				}, 3000);
			}).then(refresh);
		} else {
			// Subscribe.
			$(button)
				.html('<span class="res-icon">&#xF03B;</span> subscribe')
				.attr('title', 'notify me of new comments')
				.removeClass('unsubscribe');
			waitForEvent(button, 'click').then(async () => {
				await subscribe(id, currentCommentCount || 0, listingThing && listingThing.getPostEditTimestamp() || 0);
				Notifications.showNotification({
					notificationID: 'newCommentCountSubscribe',
					moduleID: 'newCommentCount',
					optionKey: 'subscriptionLength',
					message: `
						<p>
							You are now subscribed to this thread for ${module.options.subscriptionLength.value} days.
							When new comments are posted you'll receive a notification.
						</p>
						<p><a href="/r/Dashboard#newCommentsContents">Manage subscriptions</a></p>
					`,
				}, 5000);
			}).then(refresh);
		}
	});

	refresh();
	(new Promise(requestAnimationFrame))
		.then(() => waitForDescendant(document.body, '.commentarea .panestack-title, .menuarea'))
		.then(e => { e.append(button); });
};

function subscribe(id, newCommentCount, newEditedTime) {
	const now = Date.now();
	return subscriptionStorage.set(id, {
		count: newCommentCount,
		subscriptionDate: now,
		updateTime: now,
		editedTime: newEditedTime,
		url: location.href.replace(location.hash, ''),
		title: document.title,
	});
}

function unsubscribe(id) {
	return subscriptionStorage.delete(id);
}

async function checkSubscriptions() {
	const now = Date.now();

	for (const [id, subscription] of Object.entries(await subscriptionStorage.getAll())) {
		const { subscriptionDate, updateTime } = subscription;
		// If it's been subscriptionLength days since we've subscribed, we're going to delete this subscription...
		if ((now - subscriptionDate) > (DAY * parseInt(module.options.subscriptionLength.value, 10))) {
			unsubscribe(id);
		} else if ((now - updateTime) > (5 * MINUTE)) {
			subscriptionStorage.patch(id, { updateTime: now });
			checkThread(id, subscription);
		}
	}
}

async function checkThread(id, subscription) {
	const { num_comments: newCount, edited: newEditedTime } = await getPostMetadata({ id });
	const { count, editedTime, url, title } = subscription;

	if (newCount > count) {
		subscriptionStorage.patch(id, { count: newCount });

		const notification = Notifications.showNotification({
			header: 'New comments',
			notificationID: 'newCommentCount',
			moduleID: 'newCommentCount',
			noDisable: true,
			message: `<p><a href="${url}">${escapeHTML(title)}</a></p>`,
		}, Infinity);

		// add button to unsubscribe from within notification.
		$(notification.element).find('.RESNotificationContent')
			.append(createButton(id, 'unsubscribe', notification.close));
	}
	if (module.options.notifyEditedPosts.value && newEditedTime > editedTime) {
		subscriptionStorage.patch(id, { editedTime: newEditedTime });

		const notification = Notifications.showNotification({
			header: 'Post edited',
			notificationID: 'newCommentCount',
			moduleID: 'newCommentCount',
			optionKey: 'notifyEditedPosts',
			noDisable: true,
			message: `<p><a href="${url}">${escapeHTML(title)}</a></p>`,
		}, 10000);

		// add button to unsubscribe from within notification.
		$(notification.element).find('.RESNotificationContent')
			.append(createButton(id, 'unsubscribe', notification.close));
	}
}

function createButton(id, type, onClick) {
	const $button = $('<span class="RESSubscriptionButton">');
	let action;

	switch (type) {
		case 'unsubscribe':
			$button
				.html('<span class="res-icon">&#xF038;</span> unsubscribe')
				.attr('title', 'stop receiving notifications')
				.addClass('unsubscribe');
			action = () => unsubscribe(id);
			break;
		case 'renew':
			$button
				.html('<span class="res-icon">&#xF03B;</span> renew')
				.attr('title', `renew for ${module.options.subscriptionLength.value} days`);
			action = async () => {
				await subscriptionStorage.patch(id, { subscriptionDate: Date.now() });

				Notifications.showNotification({
					notificationID: 'newCommentCountRenew',
					moduleID: 'newCommentCount',
					optionKey: 'subscriptionLength',
					message: `Subscription renewed for ${module.options.subscriptionLength.value} days.`,
				});
			};
			break;
		default:
			break;
	}

	const button = $button.get(0);
	waitForEvent(button, 'click').then(action).then(onClick);
	return button;
}

async function addDashboardFunctionality(tabPage) {
	const subscriptions = Object.entries(await subscriptionStorage.getAll());

	const rows = subscriptions.map(([id, { subscriptionDate, updateTime, url, title }]) => {
		const [, subreddit] = url && new URL(url).pathname.match(regexes.subreddit) || [];
		if (!subreddit) return;

		const updated = new Date(updateTime);
		const expires = new Date(subscriptionDate + (DAY * parseInt(module.options.subscriptionLength.value, 10)));

		return string._html`
				<tr subscription-id="${id}">
					<td><a href="${url}">${escapeHTML(title)}</a></td>
					<td><a href="/r/${subreddit}">/r/${subreddit}</a></td>
					<td><abbr title="${formatDateTime(updated)}">${formatRelativeTime(updated)}</abbr></td>
					<td><abbr title="${formatDateTime(expires)}">${formatRelativeTime(expires)}</abbr></td>
					<td></td>
				</tr>
			`;
	});

	const ele = string.html`<div>
			<a href="/by_id/${subscriptions.map(([id]) => `t3_${id}`).join(',')}">as reddit link listing</a>
			<table id="newCommentsTable">
				<thead>
					<tr>
						<th>Submission</th>
						<th>Subreddit</th>
						<th>Last viewed</th>
						<th>Expires in</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					${rows.length ?
		rows :
		string._html`<td colspan="5">You are currently not subscribed to any threads. To subscribe to a thread, click the "subscribe" button found near the top of the comments page.</td>`
}
				</tbody>
			</table>
		</div>`;

	$(ele).on('click', 'th', Table.sortByColumn);

	for (const row of ele.querySelectorAll('[subscription-id]')) {
		const id = row.getAttribute('subscription-id');
		row.querySelector('td:last-of-type').append(
			createButton(id, 'unsubscribe', () => addDashboardFunctionality(tabPage)),
			createButton(id, 'renew', () => addDashboardFunctionality(tabPage)),
		);
	}

	empty(tabPage);
	tabPage.append(ele);
}
