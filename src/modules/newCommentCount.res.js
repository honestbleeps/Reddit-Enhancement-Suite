modules.newCommentCount = {
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
        }
    },
    description: 'Shows how many new comments there are since your last visit.',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/.*/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);
            // go!
            var counts = RESStorage.getItem('RESmodules.newCommentCount.counts');
            if (counts == null) {
                counts = '{}';
            }
            this.commentCounts = safeJSON.parse(counts, 'RESmodules.newCommentCount.counts');
            if (RESUtils.pageType() === 'comments') {
                this.updateCommentCount();
                document.body.addEventListener('DOMNodeInserted', function(event) {
                    if ((event.target.tagName === 'DIV') && (hasClass(event.target,'thing'))) {
                        modules.newCommentCount.updateCommentCount();
                    }
                }, true);
                this.addSubscribeLink();
                // this just doesn't really work that well since often times new comments are under the "load more comments" threshhold
                // or if you are visiting the thread often, Reddit Gold doesn't even mark the comments new...
                /* 
                if (typeof(this.commentCounts[this.currentCommentID].subscriptionDate) != 'undefined') {
                    // we are subscribed to this thread already, so scroll to first new post if possible...
                    var firstNew = document.querySelector('.new-comment');
                    if (firstNew) {
                        thisXY=RESUtils.getXYpos(firstNew);
                        RESUtils.scrollTo(0,firstNew);
                    }
                }
                */
            } else {
                this.processCommentCounts();
            }
            RESUtils.addCSS('.newComments { display: inline; color: orangered; }');
            RESUtils.addCSS('#REScommentSubToggle { display: inline-block; margin-left: 15px; padding: 1px 0px 1px 0px; text-align: center; width: 78px; font-weight: bold; cursor: pointer; color: #336699; border: 1px solid #b6b6b6; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px;  }');
            RESUtils.addCSS('#REScommentSubToggle.unsubscribe { color: orangered; }');
            RESUtils.addCSS('#REScommentSubToggle:hover { background-color: #f0f3fc; }');
            this.checkSubscriptions();
        }
    },
    processCommentCounts: function() {
        var lastClean = RESStorage.getItem('RESmodules.newCommentCount.lastClean');
        var now = new Date();
        if (lastClean == null) {
            lastClean = now.getTime();
            RESStorage.setItem('RESmodules.newCommentCount.lastClean', now.getTime());
        }
        // Clean cache once a day
        if ((now.getTime() - lastClean) > 86400000) {
            this.cleanCache();
        }
        var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
        var commentsLinks = document.querySelectorAll('#siteTable div.thing.link a.comments');
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
    updateCommentCount: function() {
        var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
        var matches = IDre.exec(location.href);
        if (matches) {
            if (!this.currentCommentCount) {
                this.currentCommentID = matches[1];
                var thisCount = document.querySelector('#siteTable a.comments');
                if (thisCount) {
                    thisCountText = thisCount.innerHTML
                    var split = thisCountText.split(' ');
                    this.currentCommentCount = split[0];
                    if ((typeof(this.commentCounts[this.currentCommentID]) != 'undefined') && (this.commentCounts[this.currentCommentID] != null)) {
                        var prevCommentCount = this.commentCounts[this.currentCommentID].count;
                        var diff = this.currentCommentCount - prevCommentCount;
                        if (diff>0) thisCount.innerHTML = this.currentCommentCount + ' comments ('+diff+' new)';
                    }
                    if (isNaN(this.currentCommentCount)) this.currentCommentCount = 0;
                }
            } else {
                this.currentCommentCount++;
            }
        }
        var now = new Date();
        if (typeof(this.commentCounts) === 'undefined') {
            this.commentCounts = {};
        }
        if (typeof(this.commentCounts[this.currentCommentID]) === 'undefined') {
            this.commentCounts[this.currentCommentID] = {};
        }
        this.commentCounts[this.currentCommentID].count = this.currentCommentCount;
        this.commentCounts[this.currentCommentID].url = location.href;
        this.commentCounts[this.currentCommentID].title = document.title;
        this.commentCounts[this.currentCommentID].updateTime = now.getTime();
        if (this.currentCommentCount) {
            // dumb, but because of Greasemonkey security restrictions we need a window.setTimeout here...
            window.setTimeout( function() {
                RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules.newCommentCount.commentCounts));
            }, 100);
        }
    },
    cleanCache: function() {
        var now = new Date();
        for(i in this.commentCounts) {
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
            this.commentSubToggle = createElementWithID('span','REScommentSubToggle');
            this.commentSubToggle.addEventListener('click', modules.newCommentCount.toggleSubscription, false);
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
        var commentID = modules.newCommentCount.currentCommentID;
        if (typeof(modules.newCommentCount.commentCounts[commentID].subscriptionDate) != 'undefined') {
            modules.newCommentCount.unsubscribeFromThread(commentID);
        } else {
            modules.newCommentCount.subscribeToThread(commentID);
        }
    },
    subscribeToThread: function(commentID) {
        modules.newCommentCount.commentSubToggle.innerHTML = 'unsubscribe';
        modules.newCommentCount.commentSubToggle.setAttribute('title','unsubscribe from thread');
        addClass(modules.newCommentCount.commentSubToggle,'unsubscribe');
        commentID = commentID || modules.newCommentCount.currentCommentID;
        var now = new Date();
        modules.newCommentCount.commentCounts[commentID].subscriptionDate = now.getTime();
        RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules.newCommentCount.commentCounts));
        RESUtils.notification({ 
            header: 'Subscription Notification', 
            message: 'You are now subscribed to this thread for 48 hours. You will be notified if new comments are posted since your last visit.' 
        }, 3000);
    },
    unsubscribeFromThread: function(commentID) {
        modules.newCommentCount.commentSubToggle.innerHTML = 'subscribe';
        modules.newCommentCount.commentSubToggle.setAttribute('title','subscribe to this thread and be notified when new comments are posted');
        removeClass(modules.newCommentCount.commentSubToggle,'unsubscribe');
        commentID = commentID || modules.newCommentCount.currentCommentID;
        var now = new Date();
        delete modules.newCommentCount.commentCounts[commentID].subscriptionDate;
        RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules.newCommentCount.commentCounts));
        RESUtils.notification({ 
            header: 'Subscription Notification', 
            message: 'You are now unsubscribed from this thread.'
        }, 3000);
    },
    checkSubscriptions: function() {
        if (this.commentCounts) {
            for (i in this.commentCounts) {
                var thisSubscription = this.commentCounts[i];
                if ((thisSubscription) && (typeof(thisSubscription.subscriptionDate) != 'undefined')) {
                    var lastCheck = parseInt(thisSubscription.lastCheck) || 0;
                    var subscriptionDate = parseInt(thisSubscription.subscriptionDate);
                    // If it's been 2 days since we've subscribed, we're going to delete this subscription...
                    var now = new Date();
                    if ((now.getTime() - subscriptionDate) > 172800000) {
                        delete this.commentCounts[i].subscriptionDate;
                    }
                    // if we haven't checked this subscription in 5 minutes, try it again...
                    if ((now.getTime() - lastCheck) > 300000) {
                        thisSubscription.lastCheck = now.getTime();
                        this.commentCounts[i] = thisSubscription;
                        this.checkThread(i);
                    }
                    RESStorage.setItem('RESmodules.newCommentCount.count', JSON.stringify(this.commentCounts));
                }
            }
        }
    },
    checkThread: function(commentID) {
        var subObj = this.commentCounts[commentID];
        GM_xmlhttpRequest({
            method:    "GET",
            url:    subObj.url + '.json?limit=1',
            onload:    function(response) {
                var now = new Date();
                var commentInfo = JSON.parse(response.responseText);
                if (typeof(commentInfo[0].data) != 'undefined') {
                    if (subObj.count < commentInfo[0].data.children[0].data.num_comments) {
                        modules.newCommentCount.commentCounts[commentID].count = commentInfo[0].data.children[0].data.num_comments;
                        RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules.newCommentCount.commentCounts));
                        RESUtils.notification({ 
                            header: 'Subscription Notification', 
                            message: '<p>New comments posted to thread:</p> <a href="'+subObj.url+'">' + subObj.title + '</a> <p><a class="RESNotificationButtonBlue" href="'+subObj.url+'">view the submission</a></p><div class="clear"></div>'
                        }, 10000);
                    }
                }
            }
        });
    }
};
