addModule('newCommentCount', {
	moduleID: 'newCommentCount',
	moduleName: 'New Comment Count',
	category: 'Submissions',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value..
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		cleanComments: {
			type: 'text',
			value: 7,
			description: 'Clean out cached comment counts of pages you haven\'t visited in [x] days - enter a number here only!'
		},
		subscriptionLength: {
			type: 'text',
			value: 2,
			description: 'Automatically remove thread subscriptions in [x] days (enter zero to keep subscriptions indefinitely) - enter a number here only!'
		}
	},
	description: 'Shows how many new comments there are since your last visit.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.newComments { display: inline; color: orangered; }');
			RESUtils.addCSS('.RESSubscriptionButton { display: inline-block; margin-left: 8px; cursor: pointer; color: #369; font-size: 12px; line-height: 1; padding: 2px 7px; border: 1px solid; border-radius: 2px; background-color: rgb(255,255,255); }');
			RESUtils.addCSS('.RESSubscriptionButton .res-icon { font-size: 12px; }');
			RESUtils.addCSS('#newCommentsTable .RESSubscriptionButton { padding: 0; border: none; background: transparent; }');
			RESUtils.addCSS('#newCommentsTable .RESSubscriptionButton .res-icon { font-size: 16px; vertical-align: middle; }');
			RESUtils.addCSS('#newCommentsTable .deleteIcon { float: right; }');
			RESUtils.addCSS('.sortAsc, .sortDesc { float: none; margin-left: 5px; }');
			RESUtils.addCSS('abbr { cursor: help; border-bottom: 1px dotted; text-decoration: none; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// go!
			var counts = RESStorage.getItem('RESmodules.newCommentCount.counts');
			if (counts === null) counts = '{}';
			this.commentCounts = safeJSON.parse(counts, 'RESmodules.newCommentCount.counts');
			if (RESUtils.pageType() === 'comments') {
				this.updateCommentCount();

				RESUtils.watchForElement('newCommentsForms', modules['newCommentCount'].updateCommentCountFromMyComment);
				RESUtils.watchForElement('newComments', modules['newCommentCount'].updateCommentCountFromMyComment);
				if (document.querySelector('.commentarea .panestack-title')) {
					this.handleToggleButton();
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
					modules['newCommentCount'].drawSubscriptionsTable();
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
					modules['newCommentCount'].drawSubscriptionsTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
				});
				this.drawSubscriptionsTable();
				RESUtils.watchForElement('siteTable', modules['newCommentCount'].processCommentCounts);
				/*
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') !== -1)) {
						modules['newCommentCount'].processCommentCounts(event.target);
					}
				}, true);
				*/
			} else {
				this.processCommentCounts();
				RESUtils.watchForElement('siteTable', modules['newCommentCount'].processCommentCounts);
				/*
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') !== -1)) {
						modules['newCommentCount'].processCommentCounts(event.target);
					}
				}, true);
				*/
			}
			this.checkSubscriptions();
		}
	},
	drawSubscriptionsTable: function(sortMethod, descending) {
		var filterType = $('#subscriptionFilter').val();
		this.currentSortMethod = sortMethod || this.currentSortMethod;
		this.descending = (descending === undefined) ? this.descending : !!descending;
		var thisCounts = [];
		var i;
		for (i in this.commentCounts) {
			this.commentCounts[i].id = i;
			// grab the subreddit out of the URL and store it in match[i]
			var match = this.commentCounts[i].url.match(RESUtils.regexes.subreddit);
			if (match) {
				this.commentCounts[i].subreddit = match[1].toLowerCase();
				thisCounts.push(this.commentCounts[i]);
			}
		}
		$('#newCommentsTable tbody').html('');
		switch (this.currentSortMethod) {
			case 'subscriptionDate':
				thisCounts.sort(function(a, b) {
					return (a.subscriptionDate > b.subscriptionDate) ? 1 : (b.subscriptionDate > a.subscriptionDate) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			case 'updateTime':
				thisCounts.sort(function(a, b) {
					return (a.updateTime > b.updateTime) ? 1 : (b.updateTime > a.updateTime) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			case 'subreddit':
				thisCounts.sort(function(a, b) {
					return (a.subreddit > b.subreddit) ? 1 : (b.subreddit > a.subreddit) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			default:
				thisCounts.sort(function(a, b) {
					return (a.title > b.title) ? 1 : (b.title > a.title) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
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
				var thisTrash = modules['newCommentCount'].handleButton(thisCounts[i].id, 'delete');
				var thisRenewButton = modules['newCommentCount'].handleButton(thisCounts[i].id, 'renew');
				var thisUnsubButton = modules['newCommentCount'].handleButton(thisCounts[i].id, 'unsubscribe');
				var thisSubscribeButton = modules['newCommentCount'].handleButton(thisCounts[i].id, 'subscribe');

				if (isSubscribed) {
					// expire time is in days, so: 1000ms * 60s * 60m * 24hr = 86400000 * [2].
					thisExpires = new Date(thisCounts[i].subscriptionDate + (86400000 * this.options.subscriptionLength.value));
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
	},
	renewSubscriptionButton: function(e) {
		var thisURL = $(e.currentTarget).data('threadid');
		modules['newCommentCount'].renewSubscription(thisURL);
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountRenew',
			moduleID: 'newCommentCount',
			optionKey: 'subscriptionLength',
			message: 'Subscription renewed for ' + modules['newCommentCount'].options.subscriptionLength.value + ' days.'
		});
	},
	renewSubscription: function(threadid) {
		var now = Date.now();
		modules['newCommentCount'].commentCounts[threadid].subscriptionDate = now;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	unsubscribeButton: function(e) {
		var thisURL = $(e.currentTarget).data('threadid');
		modules['newCommentCount'].unsubscribe(thisURL);
	},
	stopTracking: function(e){
		var thread_id = $(e.currentTarget).data('threadid'), button = $(e.currentTarget);
		alert('Are you sure you want to stop tracking new comments on post: "' + modules['newCommentCount'].commentCounts[thread_id].title + '"?',
			function(e){
				delete modules['newCommentCount'].commentCounts[thread_id];
				RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
				button.closest('tr').remove();
			}
		);
	},
	unsubscribe: function(threadid) {
		delete modules['newCommentCount'].commentCounts[threadid].subscriptionDate;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	subscribeButton: function(e) {
		var thisURL = $(e.currentTarget).data('threadid');
		modules['newCommentCount'].subscribe(thisURL);
	},
	subscribe: function(threadid) {
		var now = Date.now();
		modules['newCommentCount'].commentCounts[threadid].subscriptionDate = now;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	processCommentCounts: function(ele) {
		ele = ele || document.body;
		var lastClean = RESStorage.getItem('RESmodules.newCommentCount.lastClean');
		var now = Date.now();
		if (lastClean === null) {
			lastClean = now;
			RESStorage.setItem('RESmodules.newCommentCount.lastClean', now);
		}
		// Clean cache every six hours
		if ((now - lastClean) > 21600000) {
			modules['newCommentCount'].cleanCache();
		}
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var commentsLinks = ele.querySelectorAll('.sitetable.linklisting div.thing.link a.comments');
		Array.prototype.slice.call(commentsLinks).forEach(function(link) {
			var href = link.getAttribute('href');
			var thisCount = link.textContent;
			// split number from the word comments
 			thisCount = thisCount.replace(/\D/g,'');
			var matches = IDre.exec(href);
			if (matches) {
				var thisID = matches[1];
				if ((typeof modules['newCommentCount'].commentCounts[thisID] !== 'undefined') && (modules['newCommentCount'].commentCounts[thisID] !== null)) {
					var diff = thisCount - modules['newCommentCount'].commentCounts[thisID].count;
					if (diff > 0) {
						var newString = $('<span class="newComments">&nbsp;(' + diff + ' new)</span>');
						$(link).append(newString);
					}
				}
			}
		});
	},
	updateCommentCountFromMyComment: function() {
		modules['newCommentCount'].updateCommentCount(true);
	},
	updateCommentCount: function(mycomment) {
		var thisModule = modules['newCommentCount'];
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var matches = IDre.exec(location.href);
		if (matches) {
			if (!thisModule.currentCommentCount) {
				thisModule.currentCommentID = matches[1];
				var thisCount = document.querySelector('#siteTable a.comments');
				if (thisCount) {
					// split number from the word comments
					thisModule.currentCommentCount = thisCount.textContent.replace(/\D/g, '');
					if ((typeof thisModule.commentCounts[thisModule.currentCommentID] !== 'undefined') && (thisModule.commentCounts[thisModule.currentCommentID] !== null)) {
						var prevCommentCount = thisModule.commentCounts[thisModule.currentCommentID].count;
						var diff = thisModule.currentCommentCount - prevCommentCount;
						var newString = $('<span class="newComments">&nbsp;(' + diff + ' new)</span>');
						if (diff > 0) $(thisCount).append(newString);
					}
					if (isNaN(thisModule.currentCommentCount)) thisModule.currentCommentCount = 0;
					if (mycomment) thisModule.currentCommentCount++;
				}
			} else {
				thisModule.currentCommentCount++;
			}
		}
		var now = Date.now();
		if (typeof thisModule.commentCounts === 'undefined') {
			thisModule.commentCounts = {};
		}
		if (typeof thisModule.commentCounts[thisModule.currentCommentID] === 'undefined') {
			thisModule.commentCounts[thisModule.currentCommentID] = {};
		}
		thisModule.commentCounts[thisModule.currentCommentID].count = thisModule.currentCommentCount;
		thisModule.commentCounts[thisModule.currentCommentID].url = location.href.replace(location.hash, '');
		thisModule.commentCounts[thisModule.currentCommentID].title = document.title;
		thisModule.commentCounts[thisModule.currentCommentID].updateTime = now;
		// if (this.currentCommentCount) {
		// dumb, but because of Greasemonkey security restrictions we need a window.setTimeout here...
		window.setTimeout(function() {
			RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		}, 100);
		// }
	},
	cleanCache: function() {
		var now = Date.now();
		for (var i in this.commentCounts) {
			if ((this.commentCounts[i] !== null) && ((now - this.commentCounts[i].updateTime) > (86400000 * this.options.cleanComments.value))) {
				// this.commentCounts[i] = null;
				delete this.commentCounts[i];
			} else if (this.commentCounts[i] === null) {
				delete this.commentCounts[i];
			}
		}
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(this.commentCounts));
		RESStorage.setItem('RESmodules.newCommentCount.lastClean', now);
	},
	handleButton: function(threadid, action) {
		var button = RESUtils.createElement('span', null, 'RESSubscriptionButton');
		button.setAttribute('data-threadid', threadid);

		switch (action) {
			case 'unsubscribe':
				button.innerHTML = '<span class="res-icon">&#xF038;</span> unsubscribe';
				button.setAttribute('title', 'stop receiving notifications');
				button.classList.add('unsubscribe');
				$(button).click(modules['newCommentCount'].unsubscribeButton);
				break;
			case 'subscribe':
				button.innerHTML = '<span class="res-icon">&#xF03B;</span> subscribe';
				button.setAttribute('title', 'notify me of new comments');
				$(button).click(modules['newCommentCount'].subscribeButton);
				break;
			case 'renew':
				button.innerHTML = '<span class="res-icon">&#xF03B;</span> renew';
				button.setAttribute('title', 'renew for ' + modules['newCommentCount'].options.subscriptionLength.value + ' days');
				$(button).click(modules['newCommentCount'].renewSubscriptionButton);
				break;
			case 'delete':
				button.innerHTML = '<span class="res-icon">&#xF155;</span>';
				button.setAttribute('title', 'delete from list');
				button.classList.add('deleteIcon');
				$(button).click(modules['newCommentCount'].stopTracking);
				break;
		}
		return button;
	},
	handleToggleButton: function() {
		if (!this.toggleButton) {
			// Create the button if it doesn't exist.
			this.toggleButton = RESUtils.createElement('span', 'REScommentSubToggle', 'RESSubscriptionButton');
			this.toggleButton.addEventListener('click', modules['newCommentCount'].toggleSubscription, false);
			document.querySelector('.commentarea .panestack-title').appendChild(this.toggleButton);
		}
		if (typeof this.commentCounts[this.currentCommentID].subscriptionDate !== 'undefined') {
			// Unsubscribe.
			this.toggleButton.innerHTML = '<span class="res-icon">&#xF038;</span> unsubscribe';
			this.toggleButton.setAttribute('title', 'stop receiving notifications');
			this.toggleButton.classList.add('unsubscribe');
		} else {
			// Subscribe.
			this.toggleButton.innerHTML = '<span class="res-icon">&#xF03B;</span> subscribe';
			this.toggleButton.setAttribute('title', 'notify me of new comments');
			this.toggleButton.classList.remove('unsubscribe');
		}
	},
	toggleSubscription: function() {
		var commentID = modules['newCommentCount'].currentCommentID;
		if (typeof modules['newCommentCount'].commentCounts[commentID].subscriptionDate !== 'undefined') {
			modules['newCommentCount'].unsubscribeFromThread(commentID);
		} else {
			modules['newCommentCount'].subscribeToThread(commentID);
		}
		modules['newCommentCount'].handleToggleButton();
	},
	getLatestCommentCounts: function() {
		var counts = RESStorage.getItem('RESmodules.newCommentCount.counts');
		if (counts === null) {
			counts = '{}';
		}
		modules['newCommentCount'].commentCounts = safeJSON.parse(counts, 'RESmodules.newCommentCount.counts');
	},
	subscribeToThread: function(commentID) {
		modules['newCommentCount'].getLatestCommentCounts();
		commentID = commentID || modules['newCommentCount'].currentCommentID;
		var now = Date.now();
		modules['newCommentCount'].commentCounts[commentID].subscriptionDate = now;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountSubscribe',
			moduleID: 'newCommentCount',
			optionKey: 'subscriptionLength',
			message: '<p>You are now subscribed to this thread for ' + modules['newCommentCount'].options.subscriptionLength.value + ' days. When new comments are posted you\'ll receive a notification.<p><a href="/r/Dashboard#newCommentsContents">Manage subscriptions</a><p>'
		}, 5000);
	},
	unsubscribeFromThread: function(commentID) {
		modules['newCommentCount'].getLatestCommentCounts();
		commentID = commentID || modules['newCommentCount'].currentCommentID;

		delete modules['newCommentCount'].commentCounts[commentID].subscriptionDate;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		modules['notifications'].showNotification({
			notificationID: 'newCommentCountUnsubscribe',
			moduleID: 'newCommentCount',
			message: 'You are now unsubscribed from this thread.'
		}, 3000);
	},
	checkSubscriptions: function() {
		if (this.commentCounts) {
			var threadsToCheck = [];
			for (var i in this.commentCounts) {
				var thisSubscription = this.commentCounts[i];
				if ((thisSubscription) && (typeof thisSubscription.subscriptionDate !== 'undefined')) {
					var lastCheck = parseInt(thisSubscription.lastCheck, 10) || 0;
					var subscriptionDate = parseInt(thisSubscription.subscriptionDate, 10);
					// If it's been subscriptionLength days since we've subscribed, we're going to delete this subscription...
					var now = Date.now();
					if ((now - subscriptionDate) > (this.options.subscriptionLength.value * 86400000)) {
						delete this.commentCounts[i].subscriptionDate;
					}
					// if we haven't checked this subscription in 5 minutes, try it again...
					if ((now - lastCheck) > 300000) {
						thisSubscription.lastCheck = now;
						this.commentCounts[i] = thisSubscription;
						// this.checkThread(i);
						threadsToCheck.push('t3_' + i);
					}
					RESStorage.setItem('RESmodules.newCommentCount.count', JSON.stringify(this.commentCounts));
				}
			}
			if (threadsToCheck.length > 0) {
				this.checkThreads(threadsToCheck);
			}
		}
	},
	checkThreads: function(commentIDs) {
		RESEnvironment.ajax({
			method: 'GET',
			url: location.protocol + '//' + location.hostname + '/by_id/' + commentIDs.join(',') + '.json?app=res',
			onload: function(response) {
				var commentInfo = JSON.parse(response.responseText);
				if (typeof commentInfo.data !== 'undefined') {
					commentInfo.data.children.forEach(function(comment) {
						var commentID = comment.data.id;
						var subObj = modules['newCommentCount'].commentCounts[commentID];
						var unsubscribeButton = modules['newCommentCount'].handleButton(commentID, 'unsubscribe');
						if (subObj.count < comment.data.num_comments) {
							modules['newCommentCount'].commentCounts[commentID].count = comment.data.num_comments;

							var notification = modules['notifications'].showNotification({
								header: 'New comments',
								notificationID: 'newCommentCount',
								moduleID: 'newCommentCount',
								noDisable: true,
								message: '<p><a href="' + subObj.url + '">' + escapeHTML(subObj.title) + '</a></p>'
							}, 10000);

							// add button to unsubscribe from within notification.
							unsubscribeButton.addEventListener('click', notification.close, false);
							$(notification.element).find('.RESNotificationContent').append(unsubscribeButton);
						}
					});
					RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
				}
			}
		});
	}
});
