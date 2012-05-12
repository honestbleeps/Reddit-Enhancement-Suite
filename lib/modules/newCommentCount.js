modules['newCommentCount'] = {
	moduleID: 'newCommentCount',
	moduleName: 'New Comment Count',
	category: 'Comments',
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
			description: 'Automatically remove thread subscriptions in [x] days - enter a number here only!'
		}
	},
	description: 'Shows how many new comments there are since your last visit.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/.*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.newComments { display: inline; color: orangered; }');
			RESUtils.addCSS('.RESSubscriptionButton { display: inline-block; margin-left: 15px; padding: 1px 0px 1px 0px; text-align: center; width: 78px; font-weight: bold; cursor: pointer; color: #336699; border: 1px solid #b6b6b6; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('td .RESSubscriptionButton { margin-left: 0; margin-right: 15px; } ');
			RESUtils.addCSS('.RESSubscriptionButton.unsubscribe { color: orangered; }');
			RESUtils.addCSS('.RESSubscriptionButton:hover { background-color: #f0f3fc; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// go!
			var counts = RESStorage.getItem('RESmodules.newCommentCount.counts');
			if (counts == null) counts = '{}';
			this.commentCounts = safeJSON.parse(counts, 'RESmodules.newCommentCount.counts');
			if (RESUtils.pageType() == 'comments') {
				this.updateCommentCount();
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
						modules['newCommentCount'].updateCommentCount(true);
					}
				}, true);
				this.addSubscribeLink();
			} else if (RESUtils.currentSubreddit('dashboard')) {
				// If we're on the dashboard, add a tab to it...
				// add tab to dashboard
				modules['dashboard'].addTab('newCommentsContents','My Subscriptions');
				// populate the contents of the tab
				var showDiv = $('<div class="show">Show:</div>')
				var subscriptionFilter = $('<select id="subscriptionFilter"><option>subscribed threads</option><option>all threads</option></select>')
				$(showDiv).append(subscriptionFilter);
				$('#newCommentsContents').append(showDiv);
				$('#subscriptionFilter').change(function(){ 
					modules['newCommentCount'].drawSubscriptionsTable();
				});
				var thisTable = $('<table id="newCommentsTable" />');
				$(thisTable).append('<thead><tr><th sort="" class="active">Thread title</th><th sort="subreddit">Subreddit</th><th sort="updateTime">Last Visited</th><th sort="subscriptionDate">Subscription Expires</th><th class="actions">Actions</th></tr></thead><tbody></tbody>');
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
					($(e.target).hasClass('descending')) ? $(this).append('<span class="sortDesc" />') : $(this).append('<span class="sortAsc" />');
					modules['newCommentCount'].drawSubscriptionsTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
				});
				this.drawSubscriptionsTable();
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
						modules['newCommentCount'].processCommentCounts(event.target);
					}
				}, true);
			} else {
				this.processCommentCounts();
			}
			this.checkSubscriptions();
		}
	},
	drawSubscriptionsTable: function(sortMethod, descending) {
		var filterType = $('#subscriptionFilter').val();
		this.currentSortMethod = sortMethod || this.currentSortMethod;
		this.descending = (descending == null) ? this.descending : descending == true;
		var thisCounts = [];
		for (var i in this.commentCounts) {
			this.commentCounts[i].id = i;
			// grab the subreddit out of the URL and store it in match[i]
			var match = this.commentCounts[i].url.match(RESUtils.matchRE);
			if (match) {
				this.commentCounts[i].subreddit = match[1].toLowerCase();
				thisCounts.push(this.commentCounts[i]);
			}
		}
		$('#newCommentsTable tbody').html('');
		switch (this.currentSortMethod) {
			case 'subscriptionDate':
				thisCounts.sort(function(a,b) { 
					return (a.subscriptionDate > b.subscriptionDate) ? 1 : (b.subscriptionDate > a.subscriptionDate) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			case 'updateTime':
				thisCounts.sort(function(a,b) { 
					return (a.updateTime > b.updateTime) ? 1 : (b.updateTime > a.updateTime) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			case 'subreddit':
				thisCounts.sort(function(a,b) { 
					return (a.subreddit > b.subreddit) ? 1 : (b.subreddit > a.subreddit) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			default:
				thisCounts.sort(function(a,b) { 
					return (a.title > b.title) ? 1 : (b.title > a.title) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
			break;
		}
		var rows = 0;
		for (var i in thisCounts) {
			if ((filterType == 'all threads') || ((filterType == 'subscribed threads') && (typeof(thisCounts[i].subscriptionDate) != 'undefined'))) {
				var thisTitle = thisCounts[i].title;
				var thisURL = thisCounts[i].url;
				var thisUpdateTime = new Date(thisCounts[i].updateTime);
				// expire time is this.options.subscriptionLength.value days, so: 1000ms * 60s * 60m * 24hr = 86400000
				// then multiply by this.options.subscriptionLength.value
				var thisSubscriptionExpirationDate = (typeof(thisCounts[i].subscriptionDate) != 'undefined') ? new Date(thisCounts[i].subscriptionDate + (86400000 * this.options.subscriptionLength.value)) : 0;
				if (thisSubscriptionExpirationDate > 0) {
					var thisExpiresContent = RESUtils.niceDateTime(thisSubscriptionExpirationDate);
					var thisRenewButton = '<span class="RESSubscriptionButton renew" title="renew subscription to this thread" data-threadid="'+thisCounts[i].id+'">renew</span>';
					var thisUnsubButton = '<span class="RESSubscriptionButton unsubscribe" title="unsubscribe from this thread" data-threadid="'+thisCounts[i].id+'">unsubscribe</span>';
					var thisActionContent = thisRenewButton+thisUnsubButton;

				} else {
					var thisExpiresContent = 'n/a';
					var thisActionContent = '<span class="RESSubscriptionButton subscribe" title="subscribe to this thread" data-threadid="'+thisCounts[i].id+'">subscribe</span>';
				}
				var thisSubreddit = '<a href="/r/'+thisCounts[i].subreddit+'">/r/'+thisCounts[i].subreddit+'</a>';
				var thisROW = $('<tr><td><a href="'+thisURL+'">'+thisTitle+'</a></td><td>'+thisSubreddit+'</td><td>'+RESUtils.niceDateTime(thisUpdateTime)+'</td><td>'+thisExpiresContent+'</td><td>'+thisActionContent+'</td></tr>');
				$(thisROW).find('.renew').click(modules['newCommentCount'].renewSubscriptionButton);
				$(thisROW).find('.unsubscribe').click(modules['newCommentCount'].unsubscribeButton);
				$(thisROW).find('.subscribe').click(modules['newCommentCount'].subscribeButton);
				$('#newCommentsTable tbody').append(thisROW);
				rows++;
			}
		}
		if (rows == 0) {
			if (filterType == 'subscribed threads') {
				$('#newCommentsTable tbody').append('<td colspan="5">You are currently not subscribed to any threads. To subscribe to a thread, click the "subscribe" button found near the top of the comments page.</td>');
			} else {
				$('#newCommentsTable tbody').append('<td colspan="5">No threads found</td>');
			}
		}
	},
	renewSubscriptionButton: function(e) {
		var thisURL = $(e.target).attr('data-threadid');
		modules['newCommentCount'].renewSubscription(thisURL);
		RESUtils.notification('Your subscription has been renewed - it will expire in '+modules['newCommentCount'].options.subscriptionLength.value+' days.')
	},
	renewSubscription: function(threadid) {
		var now = new Date();
		modules['newCommentCount'].commentCounts[threadid].subscriptionDate = now.getTime();
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	unsubscribeButton: function(e) {
		var confirmunsub = window.confirm('Are you sure you want to unsubscribe?');
		if (confirmunsub) {
			var thisURL = $(e.target).attr('data-threadid');
			modules['newCommentCount'].unsubscribe(thisURL);
		}
	},
	unsubscribe: function(threadid) {
		delete modules['newCommentCount'].commentCounts[threadid].subscriptionDate;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	subscribeButton: function(e) {
		var thisURL = $(e.target).attr('data-threadid');
		modules['newCommentCount'].subscribe(thisURL);
	},
	subscribe: function(threadid) {
		var now = new Date();
		modules['newCommentCount'].commentCounts[threadid].subscriptionDate = now.getTime();
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	processCommentCounts: function(ele) {
		var ele = ele || document.body;
		var lastClean = RESStorage.getItem('RESmodules.newCommentCount.lastClean');
		var now = new Date();
		if (lastClean == null) {
			lastClean = now.getTime();
			RESStorage.setItem('RESmodules.newCommentCount.lastClean', now.getTime());
		}
		// Clean cache every six hours
		if ((now.getTime() - lastClean) > 21600000) {
			this.cleanCache();
		}
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var commentsLinks = ele.querySelectorAll('.sitetable.linklisting div.thing.link a.comments');
		for (var i=0, len=commentsLinks.length; i<len;i++) {
			var href = commentsLinks[i].getAttribute('href');
			var thisCount = commentsLinks[i].innerHTML;
			var split = thisCount.split(' ');
			thisCount = split[0];
			var matches = IDre.exec(href);
			if (matches) {
				var thisID = matches[1];
				if ((typeof(this.commentCounts[thisID]) != 'undefined') && (this.commentCounts[thisID] != null)) {
					var diff = thisCount - this.commentCounts[thisID].count;
					if (diff > 0) {
						commentsLinks[i].innerHTML += ' <span class="newComments">('+diff+' new)</span>';
					}
				}
			}
		}
	},
	updateCommentCount: function(mycomment) {
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var matches = IDre.exec(location.href);
		if (matches) {
			if (!this.currentCommentCount) {
				this.currentCommentID = matches[1];
				var thisCount = document.querySelector('#siteTable a.comments');
				if (thisCount) {
					var split = thisCount.innerHTML.split(' ');
					this.currentCommentCount = split[0];
					if ((typeof(this.commentCounts[this.currentCommentID]) != 'undefined') && (this.commentCounts[this.currentCommentID] != null)) {
						var prevCommentCount = this.commentCounts[this.currentCommentID].count;
						var diff = this.currentCommentCount - prevCommentCount;
						if (diff>0) thisCount.innerHTML = this.currentCommentCount + ' comments ('+diff+' new)';
					}
					if (isNaN(this.currentCommentCount)) this.currentCommentCount = 0;
					if (mycomment) this.currentCommentCount++;
				}
			} else {
				this.currentCommentCount++;
			}
		}
		var now = new Date();
		if (typeof(this.commentCounts) == 'undefined') {
			this.commentCounts = {};
		}
		if (typeof(this.commentCounts[this.currentCommentID]) == 'undefined') {
			this.commentCounts[this.currentCommentID] = {};
		}
		this.commentCounts[this.currentCommentID].count = this.currentCommentCount;
		this.commentCounts[this.currentCommentID].url = location.href.replace(location.hash, '');
		this.commentCounts[this.currentCommentID].title = document.title;
		this.commentCounts[this.currentCommentID].updateTime = now.getTime();
		// if (this.currentCommentCount) {
		// dumb, but because of Greasemonkey security restrictions we need a window.setTimeout here...
		window.setTimeout( function() {
			RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		}, 100);
		// }
	},
	cleanCache: function() {
		var now = new Date();
		for (var i in this.commentCounts) {
			if ((this.commentCounts[i] != null) && ((now.getTime() - this.commentCounts[i].updateTime) > (86400000 * this.options.cleanComments.value))) {
				// this.commentCounts[i] = null;
				delete this.commentCounts[i];
			} else if (this.commentCounts[i] == null) {
				delete this.commentCounts[i];
			}
		}
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(this.commentCounts));
		RESStorage.setItem('RESmodules.newCommentCount.lastClean', now.getTime());
	},
	addSubscribeLink: function() {
		var commentCount = document.body.querySelector('.commentarea .panestack-title');
		if (commentCount) {
			this.commentSubToggle = createElementWithID('span','REScommentSubToggle','RESSubscriptionButton');
			this.commentSubToggle.addEventListener('click', modules['newCommentCount'].toggleSubscription, false);
			commentCount.appendChild(this.commentSubToggle);
			if (typeof(this.commentCounts[this.currentCommentID].subscriptionDate) != 'undefined') {
				this.commentSubToggle.innerHTML = 'unsubscribe';
				this.commentSubToggle.setAttribute('title','unsubscribe from thread');
				addClass(this.commentSubToggle,'unsubscribe');
			} else {
				this.commentSubToggle.innerHTML = 'subscribe';
				this.commentSubToggle.setAttribute('title','subscribe to this thread to be notified when new comments are posted');
				removeClass(this.commentSubToggle,'unsubscribe');
			}
		}
	},
	toggleSubscription: function() {
		var commentID = modules['newCommentCount'].currentCommentID;
		if (typeof(modules['newCommentCount'].commentCounts[commentID].subscriptionDate) != 'undefined') {
			modules['newCommentCount'].unsubscribeFromThread(commentID);
		} else {
			modules['newCommentCount'].subscribeToThread(commentID);
		}
	},
	getLatestCommentCounts: function() {
		var counts = RESStorage.getItem('RESmodules.newCommentCount.counts');
		if (counts == null) {
			counts = '{}';
		}
		modules['newCommentCount'].commentCounts = safeJSON.parse(counts, 'RESmodules.newCommentCount.counts');
	},
	subscribeToThread: function(commentID) {
		modules['newCommentCount'].getLatestCommentCounts();
		modules['newCommentCount'].commentSubToggle.innerHTML = 'unsubscribe';
		modules['newCommentCount'].commentSubToggle.setAttribute('title','unsubscribe from thread');
		addClass(modules['newCommentCount'].commentSubToggle,'unsubscribe');
		commentID = commentID || modules['newCommentCount'].currentCommentID;
		var now = new Date();
		modules['newCommentCount'].commentCounts[commentID].subscriptionDate = now.getTime();
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		RESUtils.notification({ 
			header: 'Subscription Notification', 
			message: 'You are now subscribed to this thread for '+modules['newCommentCount'].options.subscriptionLength.value+' days. You will be notified if new comments are posted since your last visit.' 
		}, 3000);
	},
	unsubscribeFromThread: function(commentID) {
		modules['newCommentCount'].getLatestCommentCounts();
		modules['newCommentCount'].commentSubToggle.innerHTML = 'subscribe';
		modules['newCommentCount'].commentSubToggle.setAttribute('title','subscribe to this thread and be notified when new comments are posted');
		removeClass(modules['newCommentCount'].commentSubToggle,'unsubscribe');
		commentID = commentID || modules['newCommentCount'].currentCommentID;
		var now = new Date();
		delete modules['newCommentCount'].commentCounts[commentID].subscriptionDate;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		RESUtils.notification({ 
			header: 'Subscription Notification', 
			message: 'You are now unsubscribed from this thread.'
		}, 3000);
	},
	checkSubscriptions: function() {
		if (this.commentCounts) {
			var threadsToCheck = [];
			for (var i in this.commentCounts) {
				var thisSubscription = this.commentCounts[i];
				if ((thisSubscription) && (typeof(thisSubscription.subscriptionDate) != 'undefined')) {
					var lastCheck = parseInt(thisSubscription.lastCheck) || 0;
					var subscriptionDate = parseInt(thisSubscription.subscriptionDate);
					// If it's been subscriptionLength days since we've subscribed, we're going to delete this subscription...
					var now = new Date();
					if ((now.getTime() - subscriptionDate) > (this.options.subscriptionLength.value * 86400000)) {
						delete this.commentCounts[i].subscriptionDate;
					}
					// if we haven't checked this subscription in 5 minutes, try it again...
					if ((now.getTime() - lastCheck) > 300000) {
						thisSubscription.lastCheck = now.getTime();
						this.commentCounts[i] = thisSubscription;
						// this.checkThread(i);
						threadsToCheck.push('t3_'+i);
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
		GM_xmlhttpRequest({
			method:	"GET",
			url: location.protocol + '//' + location.hostname + '/by_id/' + commentIDs.join(',') + '.json?app=res',
			onload:	function(response) {
				var now = new Date();
				var commentInfo = JSON.parse(response.responseText);
				if (typeof(commentInfo.data) != 'undefined') {
					for (var i=0, len=commentInfo.data.children.length; i<len; i++) {
						var commentID = commentInfo.data.children[i].data.id;
						var subObj = modules['newCommentCount'].commentCounts[commentID];
						if (subObj.count < commentInfo.data.children[i].data.num_comments) {
							modules['newCommentCount'].commentCounts[commentID].count = commentInfo.data.children[i].data.num_comments;
							RESUtils.notification({ 
								header: 'Subscription Notification', 
								message: '<p>New comments posted to thread:</p> <a href="'+subObj.url+'">' + subObj.title + '</a> <p><a class="RESNotificationButtonBlue" href="'+subObj.url+'">view the submission</a></p><div class="clear"></div>'
							}, 10000);
						}
					}
					RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
				}
			}
		});
	}
};
