/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	DAY,
	Alert,
	Thing,
	escapeHTML,
	filterMap,
	forEachChunked,
	formatDateDiff,
	formatDateTime,
	getPostMetadata,
	isCurrentSubreddit,
	isPageType,
	loggedInUser,
	regexes,
	watchForElement,
} from '../utils';
import { Storage, isPrivateBrowsing } from '../environment';
import * as Dashboard from './dashboard';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('newCommentCount');

module.moduleName = 'newCommentCountName';
module.category = 'submissionsCategory';
module.description = 'newCommentCountDesc';
module.options = {
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
	monitorPostsVisited: {
		type: 'boolean',
		value: true,
		description: 'newCommentCountMonitorPostsVisitedDesc',
		title: 'newCommentCountMonitorPostsVisitedTitle',
		advanced: true,
	},
	monitorPostsVisitedIncognito: {
		dependsOn: 'monitorPostsVisited',
		type: 'boolean',
		value: false,
		description: 'newCommentCountMonitorPostsVisitedIncognitoDesc',
		title: 'newCommentCountMonitorPostsVisitedIncognitoTitle',
		advanced: true,
	},
};

const lastCleanStorage = Storage.wrap('RESmodules.newCommentCount.lastClean', (null: null | number));
const commentCountStorage = Storage.wrap('RESmodules.newCommentCount.counts', ({}: { [key: string]: {
	subscriptionDate?: number,
	count: number,
	url: string,
	title: string,
	updateTime: number,
	lastCheck?: number,
} }));
let commentCounts = {};

module.beforeLoad = async () => {
	await getLatestCommentCounts();
};

module.go = () => {
	if (isPageType('comments')) {
		updateCommentCount();

		watchForElement('newCommentsForms', updateCommentCountFromMyComment);
		watchForElement('newComments', updateCommentCountFromMyComment);
		if (module.options.showSubscribeButton.value && document.querySelector('.commentarea .panestack-title')) {
			handleToggleButton();
		}
	} else if (isCurrentSubreddit('dashboard')) {
		// If we're on the dashboard, add a tab to it...
		// add tab to dashboard
		const $tabPage = Dashboard.addTab('newCommentsContents', 'My Subscriptions', module.moduleID);
		// populate the contents of the tab
		const $openOnReddit = $('<a href="#" id="openOnReddit">as reddit link listing</a>');
		$openOnReddit.click(event => {
			event.preventDefault();
			let url = 't3_';
			const $threads = $('#newCommentsTable tr td:last-of-type > span:first-of-type');
			const ids = $threads.get().map(ele => ele.getAttribute('data-threadid'));
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
		watchForElement('siteTable', processCommentCounts);
	} else {
		processCommentCounts();
		watchForElement('siteTable', processCommentCounts);
	}
	checkSubscriptions();
};

let currentSortMethod, isDescending;

function drawSubscriptionsTable(sortMethod, descending) {
	currentSortMethod = sortMethod || currentSortMethod;
	isDescending = (descending === undefined) ? isDescending : !!descending;
	const thisCounts = filterMap(Object.entries(commentCounts), ([id, commentCount]) => {
		const match = new URL(commentCount.url).pathname.match(regexes.subreddit);
		if (match) {
			return [{
				id,
				subreddit: match[1].toLowerCase(),
				...commentCount,
			}];
		}
	});
	$('#newCommentsTable tbody').html('');
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
		const isSubscribed = typeof subscriptionDate !== 'undefined';
		if (isSubscribed) {
			const thisUpdateTime = new Date(updateTime);
			const now = new Date();

			// set up buttons.
			const thisTrash = handleButton(id, 'delete');
			const thisRenewButton = handleButton(id, 'renew');
			const thisUnsubButton = handleButton(id, 'unsubscribe');
			const thisSubscribeButton = handleButton(id, 'subscribe');

			let thisExpiresContent;
			if (isSubscribed) {
				const thisExpires = new Date(subscriptionDate + (DAY * parseInt(module.options.subscriptionLength.value, 10)));
				thisExpiresContent = `<abbr title="${formatDateTime(thisExpires)}">${formatDateDiff(now, thisExpires)}</abbr>`;
			} else {
				thisExpiresContent = '';
			}

			// populate table row.
			const thisROW = `
				<tr><td><a href="${url}">${escapeHTML(title)}</a></td>
				<td><a href="/r/${subreddit}">/r/${subreddit}</a></td>
				<td><abbr title="${formatDateTime(thisUpdateTime)}">${formatDateDiff(thisUpdateTime)} ago</abbr></td>
				<td>${thisExpiresContent}</td><td></td></tr>
			`;

			const $thisROW = $(thisROW);

			// add buttons.
			$thisROW.find('td:first-of-type').append(thisTrash);
			if (isSubscribed) {
				$thisROW.find('td:last-of-type').append(thisRenewButton).append(' ');
				$thisROW.find('td:last-of-type').append(thisUnsubButton);
			} else {
				$thisROW.find('td:last-of-type').append(thisSubscribeButton);
			}

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

function renewSubscriptionButton(e) {
	const thisURL = $(e.currentTarget).attr('data-threadid');
	renewSubscription(thisURL);
	Notifications.showNotification({
		notificationID: 'newCommentCountRenew',
		moduleID: 'newCommentCount',
		optionKey: 'subscriptionLength',
		message: `Subscription renewed for ${module.options.subscriptionLength.value} days.`,
	});
}

function renewSubscription(threadid) {
	const now = Date.now();
	commentCounts[threadid].subscriptionDate = now;
	commentCountStorage.patch({ [threadid]: { subscriptionDate: now } });
	drawSubscriptionsTable();
}

function unsubscribeButton(e) {
	const thisURL = $(e.currentTarget).attr('data-threadid');
	unsubscribe(thisURL);
}

function stopTracking(e) {
	const threadId = $(e.currentTarget).attr('data-threadid');
	const $button = $(e.currentTarget);
	Alert.open(`Are you sure you want to stop tracking new comments on post: "${commentCounts[threadId].title}"?`, { cancelable: true })
		.then(() => {
			delete commentCounts[threadId];
			commentCountStorage.deletePath(threadId);
			$button.closest('tr').remove();
		});
}

function unsubscribe(threadid) {
	delete commentCounts[threadid].subscriptionDate;
	commentCountStorage.deletePath(threadid, 'subscriptionDate');
	drawSubscriptionsTable();
}

function subscribeButton(e) {
	const thisURL = $(e.currentTarget).attr('data-threadid');
	subscribe(thisURL);
}

function subscribe(threadid) {
	const now = Date.now();
	commentCounts[threadid].subscriptionDate = now;
	commentCountStorage.patch({ [threadid]: { subscriptionDate: now } });
	drawSubscriptionsTable();
}

async function processCommentCounts(ele = document.body) {
	let lastClean = await lastCleanStorage.get();
	const now = Date.now();
	if (!lastClean) {
		lastClean = now;
		lastCleanStorage.set(now);
	}
	// Clean cache every six hours
	if ((now - lastClean) > 21600000) {
		await cleanCache();
	}
	const IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
	const commentsLinks = ele.querySelectorAll('.sitetable.linklisting div.thing.link a.comments');
	forEachChunked(commentsLinks, link => {
		const $link = $(link);
		const href = $link.attr('href');
		// split number from the word comments
		const thisCount = $link.text().replace(/\D/g, '');
		const matches = IDre.exec(href);
		if (matches) {
			const thisID = matches[1];
			if (commentCounts[thisID]) {
				const diff = thisCount - commentCounts[thisID].count;
				if (diff > 0) {
					$link.append(`<span class="newComments">&nbsp;(${diff} new)</span>`);
					// add .res-hasNewComments to this post's .thing
					$link.closest('.thing').addClass('res-hasNewComments');
				}
			}
		}
	});
}

function updateCommentCountFromMyComment(entry) {
	const user = loggedInUser();
	// don't update for user comment count, if detected new comment wasn't from the user
	if (user && user === Thing.checkedFrom(entry).getAuthor()) {
		updateCommentCount(true);
	}
}

let currentCommentID;

/**
 * save an updated CommentCount
 *
 * @param {string} commentID - ID of comment to store new count against
 * @param {int} newCommentCount - new number of comments to save
 * @returns {bool}
 */
async function saveCommentCount(commentID, newCommentCount) {
	if (!module.options.monitorPostsVisited.value) return false;
	if (!module.options.monitorPostsVisitedIncognito.value && await isPrivateBrowsing()) return false;

	commentCounts[commentID] = commentCounts[commentID] || {};

	const patch = {
		count: !isNaN(newCommentCount) ? newCommentCount : 0,
		url: location.href.replace(location.hash, ''),
		title: document.title,
		updateTime: Date.now(),
	};

	Object.assign(commentCounts[commentID], patch);
	commentCountStorage.patch({ [commentID]: patch });

	return true;
}

/**
 * Show new comments count to user
 *
 * @param {int} currentCommentCount - number of comments found on this page
 * @returns {void}
 */
function showNewComments(currentCommentCount) {
	const prevCommentCount = commentCounts[currentCommentID].count;
	const diff = currentCommentCount - prevCommentCount;
	if (diff > 0) $('#siteTable a.comments').append(`<span class="newComments">&nbsp;(${diff} new)</span>`);
}

/**
 * Handle updating page's comment counts
 *
 * @param {bool} mycomment - was this triggered by a users comments
 * @returns {bool}
 */
function updateCommentCount(mycomment) {
	// If currentCommentID is already defined, comment counts for this page have already been stored
	if (currentCommentID) {
		if (mycomment) {
			return saveCommentCount(currentCommentID, parseInt(commentCounts[currentCommentID].count, 10) + 1);
		}
		return false;
	}

	// Check this is a comment page, and grab comment id
	const IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
	const matches = IDre.exec(location.href);

	if (matches) {
		// set comment id for general use
		currentCommentID = matches[1];

		// get new count of comments for this page
		const thisCount = document.querySelector('#siteTable a.comments');
		const currentCommentCount = parseInt(thisCount.textContent.replace(/\D/g, ''), 10);

		// if there was an old count, show "new" comment count to user
		if (commentCounts[currentCommentID]) {
			showNewComments(currentCommentCount);
		}

		// Update settings with new comment count
		return saveCommentCount(currentCommentID, currentCommentCount);
	}
	return false;
}

async function cleanCache() {
	await getLatestCommentCounts();
	const now = Date.now();
	for (const i in commentCounts) {
		if (commentCounts[i] && ((now - commentCounts[i].updateTime) > (DAY * parseInt(module.options.cleanComments.value, 10)))) {
			// Do not automatically delete comments belonging to actively subscribed threads
			if (typeof commentCounts[i].subscriptionDate !== 'undefined') {
				continue;
			}
			// commentCounts[i] = null;
			delete commentCounts[i];
		} else if (!commentCounts[i]) {
			delete commentCounts[i];
		}
	}
	commentCountStorage.set(commentCounts);
	lastCleanStorage.set(now);
}

function handleButton(threadid, action) {
	const $button = $('<span>', {
		class: 'RESSubscriptionButton',
		'data-threadid': threadid,
	});

	switch (action) {
		case 'unsubscribe':
			$button
				.html('<span class="res-icon">&#xF038;</span> unsubscribe')
				.attr('title', 'stop receiving notifications')
				.addClass('unsubscribe')
				.click(unsubscribeButton);
			break;
		case 'subscribe':
			$button
				.html('<span class="res-icon">&#xF03B;</span> subscribe')
				.attr('title', 'notify me of new comments')
				.click(subscribeButton);
			break;
		case 'renew':
			$button
				.html('<span class="res-icon">&#xF03B;</span> renew')
				.attr('title', `renew for ${module.options.subscriptionLength.value} days`)
				.click(renewSubscriptionButton);
			break;
		case 'delete':
			$button
				.html('<span class="res-icon">&#xF155;</span>')
				.attr('title', 'delete from list')
				.addClass('deleteIcon')
				.click(stopTracking);
			break;
		default:
			break;
	}
	return $button.get(0);
}

const _toggleButton = _.once(() =>
	$('<span>', {
		id: 'REScommentSubToggle',
		class: 'RESSubscriptionButton',
		click: toggleSubscription,
	}).appendTo('.commentarea .panestack-title')
);

function handleToggleButton() {
	const $toggleButton = _toggleButton();
	if (commentCounts[currentCommentID] && commentCounts[currentCommentID].subscriptionDate !== undefined) {
		// Unsubscribe.
		$toggleButton
			.html('<span class="res-icon">&#xF038;</span> unsubscribe')
			.attr('title', 'stop receiving notifications')
			.addClass('unsubscribe');
	} else {
		// Subscribe.
		$toggleButton
			.html('<span class="res-icon">&#xF03B;</span> subscribe')
			.attr('title', 'notify me of new comments')
			.removeClass('unsubscribe');
	}
}

function toggleSubscription() {
	const commentID = currentCommentID;
	if (typeof commentCounts[commentID].subscriptionDate !== 'undefined') {
		unsubscribeFromThread(commentID);
	} else {
		subscribeToThread(commentID);
	}
	handleToggleButton();
}

async function getLatestCommentCounts() {
	commentCounts = await commentCountStorage.get();
}

function subscribeToThread(commentID) {
	const now = Date.now();
	commentCounts[commentID].subscriptionDate = now;
	commentCountStorage.patch({ [commentID]: { subscriptionDate: now } });
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
}

function unsubscribeFromThread(commentID) {
	delete commentCounts[commentID].subscriptionDate;
	commentCountStorage.deletePath(commentID, 'subscriptionDate');
	Notifications.showNotification({
		notificationID: 'newCommentCountUnsubscribe',
		moduleID: 'newCommentCount',
		message: 'You are now unsubscribed from this thread.',
	}, 3000);
}

function checkSubscriptions() {
	for (const [id, subscription] of Object.entries(commentCounts)) {
		if (subscription && typeof subscription.subscriptionDate !== 'undefined') {
			const lastCheck = parseInt(subscription.lastCheck, 10) || 0;
			const subscriptionDate = parseInt(subscription.subscriptionDate, 10);
			// If it's been subscriptionLength days since we've subscribed, we're going to delete this subscription...
			const now = Date.now();
			if ((now - subscriptionDate) > (DAY * parseInt(module.options.subscriptionLength.value, 10))) {
				delete subscription.subscriptionDate;
			}
			// if we haven't checked this subscription in 5 minutes, try it again...
			if ((now - lastCheck) > 300000) {
				subscription.lastCheck = now;
				checkThread(id);
			}
		}
	}
	commentCountStorage.set(commentCounts);
}

async function checkThread(id) {
	const { count, url, title } = commentCounts[id];
	const { num_comments: newCount } = await getPostMetadata({ id });

	if (newCount > count) {
		commentCounts[id].count = newCount;
		commentCountStorage.patch({ [id]: { count: newCount } });

		const notification = await Notifications.showNotification({
			header: 'New comments',
			notificationID: 'newCommentCount',
			moduleID: 'newCommentCount',
			noDisable: true,
			message: `<p><a href="${url}">${escapeHTML(title)}</a></p>`,
		}, 10000);

		// add button to unsubscribe from within notification.
		const unsubscribeButton = handleButton(id, 'unsubscribe');
		unsubscribeButton.addEventListener('click', notification.close);
		$(notification.element).find('.RESNotificationContent').append(unsubscribeButton);
	}
}
