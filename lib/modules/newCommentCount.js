/* global RESUtils */
addModule('newCommentCount', function(module, moduleID) {
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

	var commentCounts, toggleButton;

	module.beforeLoad = async function() {
		if (!this.isEnabled() || !this.isMatchURL()) return;
		await getLatestCommentCounts();
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (RESUtils.pageType() === 'comments') {
				updateCommentCount();

				RESUtils.watchForElement('newCommentsForms', updateCommentCountFromMyComment);
				RESUtils.watchForElement('newComments', updateCommentCountFromMyComment);
				if (document.querySelector('.commentarea .panestack-title')) {
					handleToggleButton();
				}
			} else if (RESUtils.currentSubreddit('dashboard')) {
				// If we're on the dashboard, add a tab to it...
				// add tab to dashboard
				modules['dashboard'].addTab('newCommentsContents', 'My Subscriptions');
				// populate the contents of the tab
				var showDiv = $('<div class="show">Show </div>');
				var subscriptionFilter = $('<select id="subscriptionFilter"><option>subscribed threads</option><option>all threads</option></select>');
				$(showDiv).append(subscriptionFilter);
				var openOnReddit = $('<a href="#" id="openOnReddit">as reddit link listing</a>');
				$(openOnReddit).click(function(event) {
					event.preventDefault();
					var url = 't3_';
					var $threads = $('#newCommentsTable tr td:last-of-type > span:first-of-type');
					var ids = $threads.get().map(function(ele) { return ele.getAttribute('data-threadid'); });
					var concatIds = ids.join(',t3_');
					url += concatIds;
					location.href = '/by_id/' + url;
				});
				$(showDiv).append(' ').append(openOnReddit);
				$('#newCommentsContents').append(showDiv);
				$('#subscriptionFilter').change(function() {
					drawSubscriptionsTable();
				});
				var thisTable = $('<table id="newCommentsTable" />');
				$(thisTable).append('<thead><tr><th sort="" class="active">Submission</th><th sort="subreddit">Subreddit</th><th sort="updateTime">Last viewed</th><th sort="subscriptionDate">Expires in</th><th class="actions">Actions</th></tr></thead><tbody></tbody>');
				$('#newCommentsContents').append(thisTable);
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
				RESUtils.watchForElement('siteTable', processCommentCounts);
			} else {
				processCommentCounts();
				RESUtils.watchForElement('siteTable', processCommentCounts);
			}
			checkSubscriptions();
		}
	};

	var currentSortMethod, isDescending;

	function drawSubscriptionsTable(sortMethod, descending) {
		var filterType = $('#subscriptionFilter').val();
		currentSortMethod = sortMethod || currentSortMethod;
		isDescending = (descending === undefined) ? isDescending : !!descending;
		var thisCounts = [];
		var i;
		for (i in commentCounts) {
			commentCounts[i].id = i;
			// grab the subreddit out of the URL and store it in match[i]
			var match = commentCounts[i].url.match(RESUtils.regexes.subreddit);
			if (match) {
				commentCounts[i].subreddit = match[1].toLowerCase();
				thisCounts.push(commentCounts[i]);
			}
		}
		$('#newCommentsTable tbody').html('');
		switch (currentSortMethod) {
			case 'subscriptionDate':
				thisCounts.sort(function(a, b) {
					return (a.subscriptionDate > b.subscriptionDate) ? 1 : (b.subscriptionDate > a.subscriptionDate) ? -1 : 0;
				});
				if (isDescending) thisCounts.reverse();
				break;
			case 'updateTime':
				thisCounts.sort(function(a, b) {
					return (a.updateTime > b.updateTime) ? 1 : (b.updateTime > a.updateTime) ? -1 : 0;
				});
				if (isDescending) thisCounts.reverse();
				break;
			case 'subreddit':
				thisCounts.sort(function(a, b) {
					return (a.subreddit > b.subreddit) ? 1 : (b.subreddit > a.subreddit) ? -1 : 0;
				});
				if (isDescending) thisCounts.reverse();
				break;
			default:
				thisCounts.sort(function(a, b) {
					return (a.title > b.title) ? 1 : (b.title > a.title) ? -1 : 0;
				});
				if (isDescending) thisCounts.reverse();
				break;
		}
		var rows = 0;
		for (i in thisCounts) {
			var isSubscribed = typeof thisCounts[i].subscriptionDate !== 'undefined';
			if ((filterType === 'all threads') || ((filterType === 'subscribed threads') && (isSubscribed))) {
				var thisUpdateTime = new Date(thisCounts[i].updateTime);
				var now = new Date();
				var thisExpires;
				var thisExpiresContent;

				// set up buttons.
				var thisTrash = handleButton(thisCounts[i].id, 'delete');
				var thisRenewButton = handleButton(thisCounts[i].id, 'renew');
				var thisUnsubButton = handleButton(thisCounts[i].id, 'unsubscribe');
				var thisSubscribeButton = handleButton(thisCounts[i].id, 'subscribe');

				if (isSubscribed) {
					// expire time is in days, so: 1000ms * 60s * 60m * 24hr = 86400000 * [2].
					thisExpires = new Date(thisCounts[i].subscriptionDate + (86400000 * module.options.subscriptionLength.value));
					thisExpiresContent = '<abbr title="' + RESUtils.niceDateTime(thisExpires) + '">' + RESUtils.niceDateDiff(now, thisExpires) + '</abbr>';
				} else {
					thisExpiresContent = '';
				}

				// populate table row.
				var thisROW = '';
				thisROW += '<tr><td><a href="' + thisCounts[i].url + '">' + escapeHTML(thisCounts[i].title) + '</a></td>';
				thisROW += '<td><a href="/r/' + thisCounts[i].subreddit + '">/r/' + thisCounts[i].subreddit + '</a></td>';
				thisROW += '<td><abbr title="' + RESUtils.niceDateTime(thisUpdateTime) + '">' + RESUtils.niceDateDiff(thisUpdateTime) + ' ago</abbr></td>';
				thisROW += '<td>' + thisExpiresContent + '</td><td></td></tr>';

				var $thisROW = $(thisROW);

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
		var thisURL = $(e.currentTarget).data('threadid');
		renewSubscription(thisURL);
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountRenew',
			moduleID: 'newCommentCount',
			optionKey: 'subscriptionLength',
			message: 'Subscription renewed for ' + module.options.subscriptionLength.value + ' days.'
		});
	}

	function renewSubscription(threadid) {
		var now = Date.now();
		commentCounts[threadid].subscriptionDate = now;
		RESEnvironment.storage.patch('RESmodules.newCommentCount.counts', { [threadid]: { subscriptionDate: now } });
		drawSubscriptionsTable();
	}

	function unsubscribeButton(e) {
		var thisURL = $(e.currentTarget).data('threadid');
		unsubscribe(thisURL);
	}

	function stopTracking(e) {
		var threadId = $(e.currentTarget).data('threadid'),
			button = $(e.currentTarget);
		alert('Are you sure you want to stop tracking new comments on post: "' + commentCounts[threadId].title + '"?',
			function() {
				delete commentCounts[threadId];
				RESEnvironment.storage.deletePath('RESmodules.newCommentCount.counts', threadId);
				button.closest('tr').remove();
			}
		);
	}

	function unsubscribe(threadid) {
		delete commentCounts[threadid].subscriptionDate;
		RESEnvironment.storage.deletePath('RESmodules.newCommentCount.counts', threadid, 'subscriptionDate');
		drawSubscriptionsTable();
	}

	function subscribeButton(e) {
		var thisURL = $(e.currentTarget).data('threadid');
		subscribe(thisURL);
	}

	function subscribe(threadid) {
		var now = Date.now();
		commentCounts[threadid].subscriptionDate = now;
		RESEnvironment.storage.patch('RESmodules.newCommentCount.counts', { [threadid]: { subscriptionDate: now } });
		drawSubscriptionsTable();
	}

	async function processCommentCounts(ele = document.body) {
		let lastClean = await RESEnvironment.storage.get('RESmodules.newCommentCount.lastClean');
		var now = Date.now();
		if (lastClean === null) {
			lastClean = now;
			RESEnvironment.storage.set('RESmodules.newCommentCount.lastClean', now);
		}
		// Clean cache every six hours
		if ((now - lastClean) > 21600000) {
			await cleanCache();
		}
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var commentsLinks = ele.querySelectorAll('.sitetable.linklisting div.thing.link a.comments');
		Array.prototype.slice.call(commentsLinks).forEach(function(link) {
			var href = link.getAttribute('href');
			var thisCount = link.textContent;
			// split number from the word comments
			thisCount = thisCount.replace(/\D/g, '');
			var matches = IDre.exec(href);
			if (matches) {
				var thisID = matches[1];
				if ((typeof commentCounts[thisID] !== 'undefined') && (commentCounts[thisID] !== null)) {
					var diff = thisCount - commentCounts[thisID].count;
					if (diff > 0) {
						var newString = $('<span class="newComments">&nbsp;(' + diff + ' new)</span>');
						$(link).append(newString);
					}
				}
			}
		});
	}

	function updateCommentCountFromMyComment() {
		updateCommentCount(true);
	}

	var currentCommentCount, currentCommentID;

	function updateCommentCount(mycomment) {
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var matches = IDre.exec(location.href);
		if (matches) {
			if (!currentCommentCount) {
				currentCommentID = matches[1];
				var thisCount = document.querySelector('#siteTable a.comments');
				if (thisCount) {
					// split number from the word comments
					currentCommentCount = thisCount.textContent.replace(/\D/g, '');
					if ((typeof commentCounts[currentCommentID] !== 'undefined') && (commentCounts[currentCommentID] !== null)) {
						var prevCommentCount = commentCounts[currentCommentID].count;
						var diff = currentCommentCount - prevCommentCount;
						var newString = $('<span class="newComments">&nbsp;(' + diff + ' new)</span>');
						if (diff > 0) $(thisCount).append(newString);
					}
					if (isNaN(currentCommentCount)) currentCommentCount = 0;
					if (mycomment) currentCommentCount++;
				}
			} else {
				currentCommentCount++;
			}
		}
		var now = Date.now();
		if (typeof commentCounts === 'undefined') {
			commentCounts = {};
		}
		if (typeof commentCounts[currentCommentID] === 'undefined') {
			commentCounts[currentCommentID] = {};
		}
		const patch = {
			count: currentCommentCount,
			url: location.href.replace(location.hash, ''),
			title: document.title,
			updateTime: now
		};
		Object.assign(commentCounts[currentCommentID], patch);
		RESEnvironment.storage.patch('RESmodules.newCommentCount.counts', { [currentCommentID]: patch });
	}

	async function cleanCache() {
		await getLatestCommentCounts();
		var now = Date.now();
		for (var i in commentCounts) {
			if ((commentCounts[i] !== null) && ((now - commentCounts[i].updateTime) > (86400000 * module.options.cleanComments.value))) {
				// commentCounts[i] = null;
				delete commentCounts[i];
			} else if (commentCounts[i] === null) {
				delete commentCounts[i];
			}
		}
		RESEnvironment.storage.set('RESmodules.newCommentCount.counts', commentCounts);
		RESEnvironment.storage.set('RESmodules.newCommentCount.lastClean', now);
	}

	function handleButton(threadid, action) {
		var button = RESUtils.createElement('span', null, 'RESSubscriptionButton');
		button.setAttribute('data-threadid', threadid);

		switch (action) {
			case 'unsubscribe':
				button.innerHTML = '<span class="res-icon">&#xF038;</span> unsubscribe';
				button.setAttribute('title', 'stop receiving notifications');
				button.classList.add('unsubscribe');
				$(button).click(unsubscribeButton);
				break;
			case 'subscribe':
				button.innerHTML = '<span class="res-icon">&#xF03B;</span> subscribe';
				button.setAttribute('title', 'notify me of new comments');
				$(button).click(subscribeButton);
				break;
			case 'renew':
				button.innerHTML = '<span class="res-icon">&#xF03B;</span> renew';
				button.setAttribute('title', 'renew for ' + module.options.subscriptionLength.value + ' days');
				$(button).click(renewSubscriptionButton);
				break;
			case 'delete':
				button.innerHTML = '<span class="res-icon">&#xF155;</span>';
				button.setAttribute('title', 'delete from list');
				button.classList.add('deleteIcon');
				$(button).click(stopTracking);
				break;
		}
		return button;
	}

	function handleToggleButton() {
		if (!toggleButton) {
			// Create the button if it doesn't exist.
			toggleButton = RESUtils.createElement('span', 'REScommentSubToggle', 'RESSubscriptionButton');
			toggleButton.addEventListener('click', toggleSubscription, false);
			document.querySelector('.commentarea .panestack-title').appendChild(toggleButton);
		}
		if (typeof commentCounts[currentCommentID].subscriptionDate !== 'undefined') {
			// Unsubscribe.
			toggleButton.innerHTML = '<span class="res-icon">&#xF038;</span> unsubscribe';
			toggleButton.setAttribute('title', 'stop receiving notifications');
			toggleButton.classList.add('unsubscribe');
		} else {
			// Subscribe.
			toggleButton.innerHTML = '<span class="res-icon">&#xF03B;</span> subscribe';
			toggleButton.setAttribute('title', 'notify me of new comments');
			toggleButton.classList.remove('unsubscribe');
		}
	}

	function toggleSubscription() {
		var commentID = currentCommentID;
		if (typeof commentCounts[commentID].subscriptionDate !== 'undefined') {
			unsubscribeFromThread(commentID);
		} else {
			subscribeToThread(commentID);
		}
		handleToggleButton();
	}

	async function getLatestCommentCounts() {
		commentCounts = await RESEnvironment.storage.get('RESmodules.newCommentCount.counts') || {};
	}

	function subscribeToThread(commentID) {
		commentID = commentID || currentCommentID;
		var now = Date.now();
		commentCounts[commentID].subscriptionDate = now;
		RESEnvironment.storage.patch('RESmodules.newCommentCount.counts', { [commentID]: { subscriptionDate: now } });
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountSubscribe',
			moduleID: 'newCommentCount',
			optionKey: 'subscriptionLength',
			message: '<p>You are now subscribed to this thread for ' + module.options.subscriptionLength.value + ' days. When new comments are posted you\'ll receive a notification.<p><a href="/r/Dashboard#newCommentsContents">Manage subscriptions</a><p>'
		}, 5000);
	}

	function unsubscribeFromThread(commentID) {
		commentID = commentID || currentCommentID;

		delete commentCounts[commentID].subscriptionDate;
		RESEnvironment.storage.deletePath('RESmodules.newCommentCount.counts', commentID, 'subscriptionDate');
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountUnsubscribe',
			moduleID: 'newCommentCount',
			message: 'You are now unsubscribed from this thread.'
		}, 3000);
	}

	function checkSubscriptions() {
		if (commentCounts) {
			for (var i in commentCounts) {
				var thisSubscription = commentCounts[i];
				if ((thisSubscription) && (typeof thisSubscription.subscriptionDate !== 'undefined')) {
					var lastCheck = parseInt(thisSubscription.lastCheck, 10) || 0;
					var subscriptionDate = parseInt(thisSubscription.subscriptionDate, 10);
					// If it's been subscriptionLength days since we've subscribed, we're going to delete this subscription...
					var now = Date.now();
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
			RESEnvironment.storage.set('RESmodules.newCommentCount.counts', commentCounts);
		}
	}

	const checkThread = RESUtils.batch(async commentIDs => {
		const commentInfo = await RESEnvironment.ajax({
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

		RESEnvironment.storage.set('RESmodules.newCommentCount.counts', commentCounts);
	});
});
