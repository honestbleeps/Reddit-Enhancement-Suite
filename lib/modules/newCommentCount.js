/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	DAY,
	MINUTE,
	Alert,
	Thing,
	escapeHTML,
	execRegexes,
	filterMap,
	formatDateDiff,
	formatDateTime,
	getPostMetadata,
	isCurrentSubreddit,
	isPageType,
	loggedInUser,
	regexes,
	watchForThings,
	mutex,
	waitForEvent,
	batch,
} from '../utils';
import { Storage, isPrivateBrowsing } from '../environment';
import * as Dashboard from './dashboard';
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
		value: '7',
		description: 'newCommentCountCleanCommentsDesc',
		title: 'newCommentCountCleanCommentsTitle',
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

const currentId: ?string = (execRegexes.comments(location.pathname) || [])[2];
const lastCleanStorage = Storage.wrap('RESmodules.newCommentCount.lastClean', 0);
const entryStorage = Storage.wrapPrefix('newCommentCount.', (): {|
	count: number,
	updateTime: number,
|} => {
	throw new Error('Default value should never be retrieved');
});

const subscriptionStorage = Storage.wrapBlob('RESmodules.newCommentCount.subscriptions', (): {|
	count: number,
	subscriptionDate: number,
	editedTime: number,
	updateTime: number,
	url: string,
	title: string,
|} => { throw new Error('Subscription not found'); });

module.beforeLoad = () => {
	updateToggleSubscriptionButton();

	// Immediate in order to avoid many entry lookups
	watchForThings(['post'], displayNewCommentCount, { immediate: true });
};

module.go = () => {
	if (isPageType('comments')) {
		watchForThings(['comment'], updateCurrentCommentCountFromMyComment);
		if (module.options.showSubscribeButton.value) {
			getToggleSubscriptionButton().appendTo('.commentarea .panestack-title');
		}
	} else if (isCurrentSubreddit('dashboard')) {
		addDashboardFunctionality();
	}
};

module.afterLoad = () => {
	// Avoid missing notifications by only running the check when document is visible
	if (!document.hidden) {
		checkSubscriptions();
	}

	if (isPageType('comments')) {
		updateCurrentEntry();
	}

	maybePruneOldEntries();
};

const getEntryBatched = batch(async ids => {
	const entries = await entryStorage.getMultipleNullable(ids);
	return ids.map(id => entries[id]);
}, { size: Infinity, delay: 0 });

function setEntry(id: string, newCommentCount) {
	if (!module.options.monitorPostsVisited.value) return false;
	if (!module.options.monitorPostsVisitedIncognito.value && isPrivateBrowsing()) return false;

	entryStorage.set(id, {
		count: newCommentCount,
		updateTime: Date.now(),
	});
}

export async function hasEntry(thing: Thing): Promise<boolean> {
	return !!(await getEntryBatched(thing.getFullname().split('_').slice(-1)[0]));
}

export async function getNewCount(thing: Thing): Promise<?number> {
	const currentCount = thing.getCommentCount();

	const countObj = await getEntryBatched(thing.getFullname().split('_').slice(-1)[0]);
	const lastOpenedCount = countObj && countObj.count;

	if (typeof currentCount !== 'number' || typeof lastOpenedCount !== 'number') return;

	return Math.max(currentCount - lastOpenedCount, 0);
}

async function displayNewCommentCount(thing) {
	const newCount = await getNewCount(thing);
	if (typeof newCount !== 'number') return;
	if (!newCount && module.options.hideWhenUnchanged.value) return;

	if (newCount) thing.element.classList.add('res-hasNewComments');

	$(thing.getCommentCountElement())
		.append(`<span class="newComments">&nbsp;(${newCount} new)</span>`);
}

function getListingThing() {
	return Thing.checkedFrom(document.querySelector('#siteTable a.comments'));
}

/**
 * Handle updating page's comment counts
 */
function updateCurrentEntry() {
	if (!currentId) return;
	setEntry(currentId, getListingThing().getCommentCount());
}

function updateCurrentCommentCountFromMyComment(thing) {
	if (!currentId) return;

	const timestamp = thing.getTimestamp();
	const isRecent = timestamp && (Date.now() - timestamp.getTime()) < 10000;
	const isMine = loggedInUser() === thing.getAuthor();
	if (isRecent && isMine) {
		setEntry(currentId, getListingThing().getCommentCount() + 1);
	}
}

async function maybePruneOldEntries() {
	// Clean counts every six hours
	const now = Date.now();
	if ((now - await lastCleanStorage.get()) < 0.25 * DAY) return;
	lastCleanStorage.set(now);

	const keepTrackPeriod = DAY * parseInt(module.options.cleanComments.value, 10);
	for (const [id, { updateTime }] of Object.entries(await entryStorage.getAll())) {
		if ((now - updateTime) > keepTrackPeriod) {
			stopTracking(id);
		}
	}
}

const getToggleSubscriptionButton = _.once(() =>
	$('<span>', {
		id: 'REScommentSubToggle',
		class: 'RESSubscriptionButton',
		click: updateToggleSubscriptionButton,
	})
);

const updateToggleSubscriptionButton = mutex(async () => {
	if (!currentId) throw new Error('No currentId');

	const $button = getToggleSubscriptionButton();
	const subscriptions = await subscriptionStorage.getAll();
	if (subscriptions.hasOwnProperty(currentId)) {
		// Unsubscribe.
		$button
			.html('<span class="res-icon">&#xF038;</span> unsubscribe')
			.attr('title', 'stop receiving notifications')
			.addClass('unsubscribe');
		return waitForEvent($button.get(0), 'click').then(async () => {
			await unsubscribe(currentId);
			Notifications.showNotification({
				notificationID: 'newCommentCountUnsubscribe',
				moduleID: 'newCommentCount',
				message: 'You are now unsubscribed from this thread.',
			}, 3000);
		});
	} else {
		// Subscribe.
		$button
			.html('<span class="res-icon">&#xF03B;</span> subscribe')
			.attr('title', 'notify me of new comments')
			.removeClass('unsubscribe');
		return waitForEvent($button.get(0), 'click').then(async () => {
			const listingThing = getListingThing();
			await subscribe(currentId, listingThing.getCommentCount(), listingThing.getPostEditTimestamp());
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
		});
	}
});

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

function stopTracking(id) {
	return entryStorage.delete(id);
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

		const notification = await Notifications.showNotification({
			header: 'New comments',
			notificationID: 'newCommentCount',
			moduleID: 'newCommentCount',
			noDisable: true,
			message: `<p><a href="${url}">${escapeHTML(title)}</a></p>`,
		}, 10000);

		// add button to unsubscribe from within notification.
		const { button, promise } = createButton(id, 'unsubscribe');
		promise.then(notification.close);
		$(notification.element).find('.RESNotificationContent').append(button);
	}
	if (module.options.notifyEditedPosts.value && newEditedTime > editedTime) {
		subscriptionStorage.patch(id, { editedTime: newEditedTime });

		const notification = await Notifications.showNotification({
			header: 'Post edited',
			notificationID: 'newCommentCount',
			moduleID: 'newCommentCount',
			optionKey: 'notifyEditedPosts',
			noDisable: true,
			message: `<p><a href="${url}">${escapeHTML(title)}</a></p>`,
		}, 10000);

		// add button to unsubscribe from within notification.
		const { button, promise } = createButton(id, 'unsubscribe');
		promise.then(notification.close);
		$(notification.element).find('.RESNotificationContent').append(button);
	}
}

function createButton(id, type) {
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
		case 'delete':
			$button
				.html('<span class="res-icon">&#xF155;</span>')
				.attr('title', 'delete from list')
				.addClass('deleteIcon');
			action = async () => {
				const { title } = await subscriptionStorage.get(id);
				return Alert.open(`Are you sure you want to unsubscribe from post: "${title}"?`, { cancelable: true })
					.then(() => unsubscribe(id));
			};
			break;
		default:
			break;
	}

	return { button: $button.get(0), promise: waitForEvent($button.get(0), 'click').then(action) };
}

function addDashboardFunctionality() {
	// add tab to dashboard
	const $tabPage = Dashboard.addTab('newCommentsContents', 'My Subscriptions', module.moduleID);
	// populate the contents of the tab
	const $openOnReddit = $('<a href="#" id="openOnReddit">as reddit link listing</a>');
	$openOnReddit.click(event => {
		event.preventDefault();
		let url = 't3_';
		const $threads = $('#newCommentsTable tbody > tr');
		const ids = $threads.get().map(ele => ele.getAttribute('data-id'));
		const concatIds = ids.join(',t3_');
		url += concatIds;
		location.href = `/by_id/${url}`;
	});
	$tabPage.append($openOnReddit);
	const $thisTable = $('<table id="newCommentsTable" />');
	$thisTable.append('<thead><tr><th sort="" class="active">Submission</th><th sort="subreddit">Subreddit</th><th sort="updateTime">Last viewed</th><th sort="subscriptionDate">Expires in</th><th class="actions">Actions</th></tr></thead><tbody></tbody>');
	$tabPage.append($thisTable);
	$('#newCommentsTable thead th').click(function(e) {
		e.preventDefault();
		if ($(this).hasClass('actions')) {
			return false;
		}
		if ($(this).hasClass('active')) {
			$(this).toggleClass('descending');
		}
		$(this).addClass('active');
		$(this).siblings().removeClass('active').find('SPAN').remove();
		$(this).find('.sortAsc, .sortDesc').remove();
		if ($(e.target).hasClass('descending')) {
			$(this).append('<span class="sortDesc" />');
		} else {
			$(this).append('<span class="sortAsc" />');
		}
		drawSubscriptionsTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
	});
	drawSubscriptionsTable();
}

let currentSortMethod, isDescending;

async function drawSubscriptionsTable(sortMethod, descending) {
	currentSortMethod = sortMethod || currentSortMethod;
	isDescending = (descending === undefined) ? isDescending : !!descending;
	$('#newCommentsTable tbody').html('');
	const thisCounts = filterMap(Object.entries(await subscriptionStorage.getAll()), ([id, commentCount]) => {
		const match = new URL(commentCount.url).pathname.match(regexes.subreddit);
		if (match) {
			return [{
				id,
				subreddit: match[1].toLowerCase(),
				...commentCount,
			}];
		}
	});
	switch (currentSortMethod) {
		case 'subscriptionDate':
			thisCounts.sort((a, b) =>
				(a.subscriptionDate > b.subscriptionDate) ? 1 : (b.subscriptionDate > a.subscriptionDate) ? -1 : 0
			);
			if (isDescending) thisCounts.reverse();
			break;
		case 'updateTime':
			thisCounts.sort((a, b) =>
				(a.updateTime > b.updateTime) ? 1 : (b.updateTime > a.updateTime) ? -1 : 0
			);
			if (isDescending) thisCounts.reverse();
			break;
		case 'subreddit':
			thisCounts.sort((a, b) =>
				(a.subreddit > b.subreddit) ? 1 : (b.subreddit > a.subreddit) ? -1 : 0
			);
			if (isDescending) thisCounts.reverse();
			break;
		default:
			thisCounts.sort((a, b) =>
				(a.title > b.title) ? 1 : (b.title > a.title) ? -1 : 0
			);
			if (isDescending) thisCounts.reverse();
			break;
	}
	let rows = 0;
	for (const { subscriptionDate, updateTime, id, url, title, subreddit } of thisCounts) {
		if (subscriptionDate) {
			const thisUpdateTime = new Date(updateTime);
			const now = new Date();

			// set up buttons.
			const { button: thisTrashButton, promise: thisTrashPromise } = createButton(id, 'delete');
			thisTrashPromise.then(drawSubscriptionsTable);
			const { button: thisRenewButton, promise: thisRenewPromise } = createButton(id, 'renew');
			thisRenewPromise.then(drawSubscriptionsTable);
			const { button: thisUnsubButton, promise: thisUnsubPromise } = createButton(id, 'unsubscribe');
			thisUnsubPromise.then(drawSubscriptionsTable);

			const thisExpires = new Date(subscriptionDate + (DAY * parseInt(module.options.subscriptionLength.value, 10)));
			const thisExpiresContent = `<abbr title="${formatDateTime(thisExpires)}">${formatDateDiff(now, thisExpires)}</abbr>`;

			// populate table row.
			const thisROW = `
				<tr data-id="${id}"><td><a href="${url}">${escapeHTML(title)}</a></td>
				<td><a href="/r/${subreddit}">/r/${subreddit}</a></td>
				<td><abbr title="${formatDateTime(thisUpdateTime)}">${formatDateDiff(thisUpdateTime)} ago</abbr></td>
				<td>${thisExpiresContent}</td><td></td></tr>
			`;

			const $thisROW = $(thisROW);

			// add buttons.
			$thisROW.find('td:last-of-type').append(thisTrashButton);
			$thisROW.find('td:last-of-type').append(thisRenewButton).append(' ');
			$thisROW.find('td:last-of-type').append(thisUnsubButton);

			$('#newCommentsTable tbody').append($thisROW);
			rows++;
		}
	}
	if (rows === 0) {
		$('#newCommentsTable tbody').append('<td colspan="5">You are currently not subscribed to any threads. To subscribe to a thread, click the "subscribe" button found near the top of the comments page.</td>');
		$('#openOnReddit').hide();
	} else {
		$('#openOnReddit').show();
	}
}
