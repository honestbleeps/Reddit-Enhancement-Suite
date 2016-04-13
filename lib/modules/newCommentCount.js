import _ from 'lodash';
import { $ } from '../vendor';
import {
	Thing,
	batch,
	escapeHTML,
	gdAlert,
	isCurrentSubreddit,
	isPageType,
	loggedInUser,
	niceDateDiff,
	niceDateTime,
	regexes,
	watchForElement
} from '../utils';
import { ajax, storage } from '../environment';

addModule('newCommentCount', (module, moduleID) => {
	module.moduleName = 'New Comment Count';
	module.category = 'Submissions';
	module.description = 'Tells you how many comments have been posted since you last viewed a thread.';
	module.options = {
		cleanComments: {
			type: 'text',
			value: 7,
			description: 'Number of days before RES stops keeping track of a viewed thread'
		},
		subscriptionLength: {
			type: 'text',
			value: 2,
			description: 'Number of days before thread subscriptions expire (<code>0</code> to subscribe forever)'
		}
	};

	let commentCounts;

	module.beforeLoad = async function() {
		if (!this.isEnabled() || !this.isMatchURL()) return;
		await getLatestCommentCounts();
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (isPageType('comments')) {
				updateCommentCount();

				watchForElement('newCommentsForms', updateCommentCountFromMyComment);
				watchForElement('newComments', updateCommentCountFromMyComment);
				if (document.querySelector('.commentarea .panestack-title')) {
					handleToggleButton();
				}
			} else if (isCurrentSubreddit('dashboard')) {
				// If we're on the dashboard, add a tab to it...
				// add tab to dashboard
				modules['dashboard'].addTab('newCommentsContents', 'My Subscriptions');
				// populate the contents of the tab
				const $showDiv = $('<div class="show">Show </div>');
				const $subscriptionFilter = $('<select id="subscriptionFilter"><option>subscribed threads</option><option>all threads</option></select>');
				$showDiv.append($subscriptionFilter);
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
				$showDiv.append(' ').append($openOnReddit);
				$('#newCommentsContents').append($showDiv);
				$('#subscriptionFilter').change(() => drawSubscriptionsTable());
				const $thisTable = $('<table id="newCommentsTable" />');
				$thisTable.append('<thead><tr><th sort="" class="active">Submission</th><th sort="subreddit">Subreddit</th><th sort="updateTime">Last viewed</th><th sort="subscriptionDate">Expires in</th><th class="actions">Actions</th></tr></thead><tbody></tbody>');
				$('#newCommentsContents').append($thisTable);
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
		}
	};

	let currentSortMethod, isDescending;

	function drawSubscriptionsTable(sortMethod, descending) {
		const filterType = $('#subscriptionFilter').val();
		currentSortMethod = sortMethod || currentSortMethod;
		isDescending = (descending === undefined) ? isDescending : !!descending;
		const thisCounts = [];
		for (const i in commentCounts) {
			commentCounts[i].id = i;
			// grab the subreddit out of the URL and store it in match[i]
			const match = commentCounts[i].url.match(regexes.subreddit);
			if (match) {
				commentCounts[i].subreddit = match[1].toLowerCase();
				thisCounts.push(commentCounts[i]);
			}
		}
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
			if ((filterType === 'all threads') || ((filterType === 'subscribed threads') && (isSubscribed))) {
				const thisUpdateTime = new Date(updateTime);
				const now = new Date();

				// set up buttons.
				const thisTrash = handleButton(id, 'delete');
				const thisRenewButton = handleButton(id, 'renew');
				const thisUnsubButton = handleButton(id, 'unsubscribe');
				const thisSubscribeButton = handleButton(id, 'subscribe');

				let thisExpiresContent;
				if (isSubscribed) {
					// expire time is in days, so: 1000ms * 60s * 60m * 24hr = 86400000 * [2].
					const thisExpires = new Date(subscriptionDate + (86400000 * module.options.subscriptionLength.value));
					thisExpiresContent = `<abbr title="${niceDateTime(thisExpires)}">${niceDateDiff(now, thisExpires)}</abbr>`;
				} else {
					thisExpiresContent = '';
				}

				// populate table row.
				const thisROW = `
					<tr><td><a href="${url}">${escapeHTML(title)}</a></td>
					<td><a href="/r/${subreddit}">/r/${subreddit}</a></td>
					<td><abbr title="${niceDateTime(thisUpdateTime)}">${niceDateDiff(thisUpdateTime)} ago</abbr></td>
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
			if (filterType === 'subscribed threads') {
				$('#newCommentsTable tbody').append('<td colspan="5">You are currently not subscribed to any threads. To subscribe to a thread, click the "subscribe" button found near the top of the comments page.</td>');
			} else {
				$('#newCommentsTable tbody').append('<td colspan="5">No threads found</td>');
			}
			$('#openOnReddit').hide();
		} else {
			$('#openOnReddit').show();
		}
	}

	function renewSubscriptionButton(e) {
		const thisURL = $(e.currentTarget).data('threadid');
		renewSubscription(thisURL);
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountRenew',
			moduleID: 'newCommentCount',
			optionKey: 'subscriptionLength',
			message: `Subscription renewed for ${module.options.subscriptionLength.value} days.`
		});
	}

	function renewSubscription(threadid) {
		const now = Date.now();
		commentCounts[threadid].subscriptionDate = now;
		storage.patch('RESmodules.newCommentCount.counts', { [threadid]: { subscriptionDate: now } });
		drawSubscriptionsTable();
	}

	function unsubscribeButton(e) {
		const thisURL = $(e.currentTarget).data('threadid');
		unsubscribe(thisURL);
	}

	function stopTracking(e) {
		const threadId = $(e.currentTarget).data('threadid');
		const $button = $(e.currentTarget);
		gdAlert.open(`Are you sure you want to stop tracking new comments on post: "${commentCounts[threadId].title}"?`,
			() => {
				delete commentCounts[threadId];
				storage.deletePath('RESmodules.newCommentCount.counts', threadId);
				$button.closest('tr').remove();
			}
		);
	}

	function unsubscribe(threadid) {
		delete commentCounts[threadid].subscriptionDate;
		storage.deletePath('RESmodules.newCommentCount.counts', threadid, 'subscriptionDate');
		drawSubscriptionsTable();
	}

	function subscribeButton(e) {
		const thisURL = $(e.currentTarget).data('threadid');
		subscribe(thisURL);
	}

	function subscribe(threadid) {
		const now = Date.now();
		commentCounts[threadid].subscriptionDate = now;
		storage.patch('RESmodules.newCommentCount.counts', { [threadid]: { subscriptionDate: now } });
		drawSubscriptionsTable();
	}

	async function processCommentCounts(ele = document.body) {
		let lastClean = await storage.get('RESmodules.newCommentCount.lastClean');
		const now = Date.now();
		if (lastClean === null) {
			lastClean = now;
			storage.set('RESmodules.newCommentCount.lastClean', now);
		}
		// Clean cache every six hours
		if ((now - lastClean) > 21600000) {
			await cleanCache();
		}
		const IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		const commentsLinks = ele.querySelectorAll('.sitetable.linklisting div.thing.link a.comments');
		Array.from(commentsLinks).forEach(link => {
			const href = link.getAttribute('href');
			// split number from the word comments
			const thisCount = link.textContent.replace(/\D/g, '');
			const matches = IDre.exec(href);
			if (matches) {
				const thisID = matches[1];
				if ((typeof commentCounts[thisID] !== 'undefined') && (commentCounts[thisID] !== null)) {
					const diff = thisCount - commentCounts[thisID].count;
					if (diff > 0) {
						const $newString = $(`<span class="newComments">&nbsp;(${diff} new)</span>`);
						$(link).append($newString);
					}
				}
			}
		});
	}

	function updateCommentCountFromMyComment(entry) {
		const user = loggedInUser();
		// don't update for user comment count, if detected new comment wasn't from the user
		if (user && user === new Thing(entry).getAuthor()) {
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
	function saveCommentCount(commentID, newCommentCount) {
		// ensure objects exist
		if (typeof commentCounts === 'undefined') commentCounts = {};
		if (typeof commentCounts[commentID] === 'undefined') commentCounts[commentID] = {};

		// create patch for change
		const patch = {
			count: !isNaN(newCommentCount) ? newCommentCount : 0,
			url: location.href.replace(location.hash, ''),
			title: document.title,
			updateTime: Date.now()
		};
		Object.assign(commentCounts[commentID], patch);
		storage.patch('RESmodules.newCommentCount.counts', { [commentID]: patch });

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
			const currentCommentCount = thisCount.textContent.replace(/\D/g, '');

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
			if ((commentCounts[i] !== null) && ((now - commentCounts[i].updateTime) > (86400000 * module.options.cleanComments.value))) {
				// commentCounts[i] = null;
				delete commentCounts[i];
			} else if (commentCounts[i] === null) {
				delete commentCounts[i];
			}
		}
		storage.set('RESmodules.newCommentCount.counts', commentCounts);
		storage.set('RESmodules.newCommentCount.lastClean', now);
	}

	function handleButton(threadid, action) {
		const $button = $('<span>', {
			class: 'RESSubscriptionButton',
			'data-threadid': threadid
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
			click: toggleSubscription
		}).appendTo('.commentarea .panestack-title')
	);

	function handleToggleButton() {
		const $toggleButton = _toggleButton();
		if (typeof commentCounts[currentCommentID].subscriptionDate !== 'undefined') {
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
		commentCounts = await storage.get('RESmodules.newCommentCount.counts') || {};
	}

	function subscribeToThread(commentID) {
		commentID = commentID || currentCommentID;
		const now = Date.now();
		commentCounts[commentID].subscriptionDate = now;
		storage.patch('RESmodules.newCommentCount.counts', { [commentID]: { subscriptionDate: now } });
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountSubscribe',
			moduleID: 'newCommentCount',
			optionKey: 'subscriptionLength',
			message: `
				<p>
					You are now subscribed to this thread for ${module.options.subscriptionLength.value} days.
					When new comments are posted you'll receive a notification.
				</p>
				<p><a href="/r/Dashboard#newCommentsContents">Manage subscriptions</a></p>
			`
		}, 5000);
	}

	function unsubscribeFromThread(commentID) {
		commentID = commentID || currentCommentID;

		delete commentCounts[commentID].subscriptionDate;
		storage.deletePath('RESmodules.newCommentCount.counts', commentID, 'subscriptionDate');
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountUnsubscribe',
			moduleID: 'newCommentCount',
			message: 'You are now unsubscribed from this thread.'
		}, 3000);
	}

	function checkSubscriptions() {
		if (commentCounts) {
			for (const i in commentCounts) {
				const thisSubscription = commentCounts[i];
				if ((thisSubscription) && (typeof thisSubscription.subscriptionDate !== 'undefined')) {
					const lastCheck = parseInt(thisSubscription.lastCheck, 10) || 0;
					const subscriptionDate = parseInt(thisSubscription.subscriptionDate, 10);
					// If it's been subscriptionLength days since we've subscribed, we're going to delete this subscription...
					const now = Date.now();
					if ((now - subscriptionDate) > (module.options.subscriptionLength.value * 86400000)) {
						delete commentCounts[i].subscriptionDate;
					}
					// if we haven't checked this subscription in 5 minutes, try it again...
					if ((now - lastCheck) > 300000) {
						thisSubscription.lastCheck = now;
						commentCounts[i] = thisSubscription;
						checkThread(`t3_${i}`);
					}
				}
			}
			storage.set('RESmodules.newCommentCount.counts', commentCounts);
		}
	}

	const checkThread = batch(async commentIDs => {
		const commentInfo = await ajax({
			url: `/by_id/${commentIDs.join(',')}.json`,
			type: 'json'
		});

		if (!commentInfo.data) {
			throw new Error(`Could not find comment counts: ${JSON.stringify(commentInfo)}`);
		}

		commentInfo.data.children.forEach(async ({ data: { id, num_comments: commentCount } }) => {
			const subObj = commentCounts[id];
			const unsubscribeButton = handleButton(id, 'unsubscribe');

			if (subObj.count < commentCount) {
				commentCounts[id].count = commentCount;

				const notification = await modules['notifications'].showNotification({
					header: 'New comments',
					notificationID: 'newCommentCount',
					moduleID: 'newCommentCount',
					noDisable: true,
					message: `<p><a href="${subObj.url}">${escapeHTML(subObj.title)}</a></p>`
				}, 10000);

				// add button to unsubscribe from within notification.
				unsubscribeButton.addEventListener('click', notification.close, false);
				$(notification.element).find('.RESNotificationContent').append(unsubscribeButton);
			}
		});

		storage.set('RESmodules.newCommentCount.counts', commentCounts);
	});
});
