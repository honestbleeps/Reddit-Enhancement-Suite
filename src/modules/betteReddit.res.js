modules.betteReddit = {
    moduleID: 'betteReddit',
    moduleName: 'betteReddit',
    category: 'UI',
    options: {
        fullCommentsLink: {
            type: 'boolean',
            value: true,
            description: 'add "full comments" link to comment replies, etc'
        },
        fullCommentsText: {
            type: 'text',
            value: 'full comments',
            description: 'text of full comments link'
        },
        fixSaveLinks: {
            type: 'boolean',
            value: true,
            description: 'Make "save" links change to "unsave" links when clicked'
        },
        fixHideLinks: {
            type: 'boolean',
            value: true,
            description: 'Make "hide" links change to "unhide" links when clicked, and provide a 5 second delay prior to hiding the link'
        },
        searchSubredditByDefault: {
            type: 'boolean',
            value: true,
            description: 'Search the current subreddit by default when using the search box, instead of all of reddit.'
        },
        showUnreadCount: {
            type: 'boolean',
            value: true,
            description: 'Show unread message count next to orangered?'
        },
        videoTimes: {
            type: 'boolean',
            value: true,
            description: 'Show lengths of videos when possible'
        },
        toolbarFix: { 
            type: 'boolean',
            value: true,
            description: 'Don\'t use Reddit Toolbar when linking to sites that may not function (twitter, youtube and others)'
        },
        /*,
        pinSubredditBar: {
            type: 'boolean',
            value: false,
            description: 'Pin subreddit bar to the top even when you scroll'
        }
        */
        pinHeader: {
           type: 'enum',
           values: [
               { name: 'None', value: 'none' },
               { name: 'Subreddit Bar only', value: 'sub' },
               { name: 'User Bar', value: 'userbar' },
               { name: 'Full Header', value: 'header' }
           ],
           value: 'none',
           description: 'Pin the subreddit bar or header to the top, even when you scroll.'
        }
    },
    description: 'Adds a number of interface enhancements to Reddit, such "full comments" links, the ability to unhide accidentally hidden posts, and more',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/.*/i
    ],
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);

            if ((this.options.toolbarFix.value) && ((RESUtils.pageType() === 'linklist') || RESUtils.pageType() === 'comments')) { 
                this.toolbarFix();
            }
            // if (((RESUtils.pageType() === 'inbox') || (RESUtils.pageType() === 'profile') || ((RESUtils.pageType() === 'comments') && (RESUtils.currentSubreddit('friends')))) && (this.options.fullCommentsLink.value)) {
            // removed profile pages since Reddit does this natively now for those...
            if (((RESUtils.pageType() === 'inbox') || ((RESUtils.pageType() === 'comments') && (RESUtils.currentSubreddit('friends')))) && (this.options.fullCommentsLink.value)) {
                // RESUtils.addCSS('a.redditFullCommentsSub { font-size: 9px !important; color: #BBBBBB !important; }');
                this.fullComments();
            }
            if ((RESUtils.pageType() === 'profile') && (location.href.split('/').indexOf(RESUtils.loggedInUser()) != -1)) {
                this.editMyComments();
            }
            if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixSaveLinks.value)) {
                this.fixSaveLinks();
            }
            if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixHideLinks.value)) {
                this.fixHideLinks();
            }
            document.body.addEventListener('DOMNodeInserted', function(event) {
                if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
                    if ((modules.betteReddit.options.toolbarFix.value) && (RESUtils.pageType() === 'linklist')) {
                        modules.betteReddit.toolbarFix();
                    }
                    if (((RESUtils.pageType() === 'inbox') || (RESUtils.pageType() === 'profile')) && (modules.betteReddit.options.fullCommentsLink.value)) {
                        modules.betteReddit.fullComments(event.target);
                    }
                    if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (modules.betteReddit.options.fixSaveLinks.value)) {
                        modules.betteReddit.fixSaveLinks(event.target);
                    }
                    if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (modules.betteReddit.options.fixHideLinks.value)) {
                        modules.betteReddit.fixHideLinks(event.target);
                    }
                }
            }, true);
            if ((RESUtils.currentSubreddit() != null) && (this.options.searchSubredditByDefault.value)) {
                // make sure we're not on a search results page...
                if (location.href.indexOf('/r/'+RESUtils.currentSubreddit()+'/search') === -1) {
                    this.searchSubredditByDefault();
                }
            }
            if ((this.options.videoTimes.value) && ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments'))) {
                this.getVideoTimes();
                // listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...
                document.body.addEventListener('DOMNodeInserted', function(event) {
                    if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
                        modules.betteReddit.getVideoTimes(event.target);
                    }
                }, true);
            }
            if ((RESUtils.loggedInUser() != null) && (this.options.showUnreadCount.value)) {
                // Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
                // RESUtils.addCSS('#mail { min-width: 16px !important; width: auto !important; text-indent: 18px !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
                // removing text indent - on 11/14/11 reddit changed the mail sprites, so I have to change how this is handled..
                RESUtils.addCSS('#mail { top: 2px; min-width: 16px !important; width: auto !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
                RESUtils.addCSS('#mail.havemail { top: 2px !important; margin-right: 1px; }');
                if ((typeof chrome  != 'undefined') || (typeof safari != 'undefined')) {
                    // I hate that I have this conditional CSS in here but I can't figure out why it's needed for webkit and screws up firefox.
                    RESUtils.addCSS('#mail.havemail { top: 0px; }');
                }
                this.showUnreadCount();
            }
            switch(this.options.pinHeader.value) {
                case 'header':
                    this.pinHeader();
                    break;
                case 'sub':
                    this.pinSubredditBar();
                    break;
                case 'userbar':
                    this.pinUserBar();
                    break;
                default:
                    break;
            }
        }
    },
    showUnreadCount: function() {
        if (typeof(this.mail) === 'undefined') {
            this.mail = document.querySelector('#mail');
            if (this.mail) {
                this.mailCount = createElementWithID('a','mailCount');
                this.mailCount.display = 'none';
                this.mailCount.setAttribute('href','/message/unread');
                $(this.mail).after(this.mailCount);
            }
        }
        if (this.mail) {
            modules.betteReddit.mail.innerHTML = '';
            if (hasClass(this.mail, 'havemail')) {
                var lastCheck = parseInt(RESStorage.getItem('RESmodules.betteReddit.msgCount.lastCheck.'+RESUtils.loggedInUser())) || 0;
                var now = new Date();
                // 300000 = 5 minutes... we don't want to annoy Reddit's servers too much with this query...
                if ((now.getTime() - lastCheck) > 300000) {
                    GM_xmlhttpRequest({
                        method:    "GET",
                        url:    location.protocol + '//' + location.hostname + "/message/unread/.json?mark=false",
                        onload:    function(response) {
                            // save that we've checked in the last 5 minutes
                            var now = new Date();
                            RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.'+RESUtils.loggedInUser(), now.getTime());
                            var data = JSON.parse(response.responseText);
                            var count = data.data.children.length;
                            RESStorage.setItem('RESmodules.betteReddit.msgCount.'+RESUtils.loggedInUser(), count);
                            modules.betteReddit.setUnreadCount(count);
                        }
                    });
                } else {
                    var count = RESStorage.getItem('RESmodules.betteReddit.msgCount.'+RESUtils.loggedInUser());
                    modules.betteReddit.setUnreadCount(count);
                }
            } else {
                // console.log('no need to get count - no new mail. resetting lastCheck');
                modules.betteReddit.setUnreadCount(0);
                RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.'+RESUtils.loggedInUser(), 0);
            }
        }
    },
    setUnreadCount: function(count) {
        if (count>0) {
            var newTitle = '[' + count + '] ' + document.title.replace(/^\[[\d]+\]\s/,'');
            document.title = newTitle;
            modules.betteReddit.mailCount.display = 'inline-block'
            modules.betteReddit.mailCount.innerHTML = '['+count+']';
        } else {
            modules.betteReddit.mailCount.display = 'none'
            modules.betteReddit.mailCount.innerHTML = '';
        }
    },
    toolbarFix: function(ele) {
        var root = ele || document;
        var links = root.querySelectorAll('div.entry a.title');
        for (var i=0, len=links.length; i<len; i++) {
            if ((links[i].getAttribute('href').indexOf('youtube.com') != -1) || (links[i].getAttribute('href').indexOf('twitter.com') != -1) || (links[i].getAttribute('href').indexOf('teamliquid.net') != -1)) {
                links[i].setAttribute('onmousedown','');
            }
            // patch below for comments pages thanks to redditor and resident helperninja gavin19
            if (links[i].getAttribute('srcurl')) {
                    if ((links[i].getAttribute('srcurl').indexOf('youtube.com') != -1) || (links[i].getAttribute('srcurl').indexOf('twitter.com') != -1) || (links[i].getAttribute('srcurl').indexOf('teamliquid.net') != -1)) {
                    links[i].setAttribute('onmousedown','');
                }
            }
        }
    },
    fullComments: function(ele) {
        var root = ele || document;
        var entries = root.querySelectorAll('#siteTable .entry');

        for (var i=0, len=entries.length; i<len;i++) {
            var linkEle = entries[i].querySelector('A.bylink');
            var thisCommentsLink = '';
            if ((typeof linkEle != 'undefined') && (linkEle != null)) {
                thisCommentsLink = linkEle.getAttribute('href');
            }
            if (thisCommentsLink != '') {
                thisCommentsSplit = thisCommentsLink.split("/");
                thisCommentsSplit.pop();
                thisCommentsLink = thisCommentsSplit.join("/");
                linkList = entries[i].querySelector('.flat-list');
                var fullCommentsLink = document.createElement('li');
                fullCommentsLink.innerHTML = '<a class="redditFullComments" href="' + thisCommentsLink + '">'+ this.options.fullCommentsText.value +'</a>';
                linkList.appendChild(fullCommentsLink);
                /* reddit ended up adding this before 4.0 came out.. d'oh
                var getSubredditRegex = /\/r\/([\w\.]+)/i;
                var match = getSubredditRegex.exec(thisCommentsLink);
                if (match) {
                    var subredditLink = document.createElement('li');
                    subredditLink.innerHTML = '<a class="redditFullCommentsSub" href="/r/' + match[1] + '">(r/'+ match[1] +')</a>';
                    linkList.appendChild(subredditLink);
                }
                */
            }
        }
    },
    editMyComments: function(ele) {
        var root = ele || document;
        var entries = root.querySelectorAll('#siteTable .entry');
        for (var i=0, len=entries.length; i<len;i++) {
            var linkEle = entries[i].querySelector('A.bylink');
            var thisCommentsLink = '';
            if ((typeof linkEle != 'undefined') && (linkEle != null)) {
                thisCommentsLink = linkEle.getAttribute('href');
            }
            if (thisCommentsLink != '') {
                permalink = entries[i].querySelector('.flat-list li.first');
                var editLink = document.createElement('li');
                editLink.innerHTML = '<a onclick="return edit_usertext(this)" href="javascript:void(0);">edit</a>';
                $(permalink).after(editLink);
            }
        }
    },
    fixSaveLinks: function(ele) {
        var root = ele || document;
        var saveLinks = root.querySelectorAll('FORM.save-button > SPAN > A');
        for (var i=0, len=saveLinks.length; i<len; i++) {
            saveLinks[i].setAttribute('onclick','');
            saveLinks[i].setAttribute('action','save');
            saveLinks[i].addEventListener('click', modules.betteReddit.saveLink, false);
        }
        var unsaveLinks = document.querySelectorAll('FORM.unsave-button > SPAN > A');
        for (var i=0, len=saveLinks.length; i<len; i++) {
            if (typeof(unsaveLinks[i]) != 'undefined') {
                unsaveLinks[i].setAttribute('onclick','');
                unsaveLinks[i].setAttribute('action','unsave');
                unsaveLinks[i].addEventListener('click', modules.betteReddit.saveLink, false);
            }
        }
    },
    fixHideLinks: function(ele) {
        var root = ele || document;
        var hideLinks = root.querySelectorAll('FORM.hide-button > SPAN > A');
        for (var i=0, len=hideLinks.length; i<len; i++) {
            hideLinks[i].setAttribute('onclick','');
            hideLinks[i].setAttribute('action','hide');
            hideLinks[i].addEventListener('click', modules.betteReddit.hideLink, false);
        }
        var unhideLinks = document.querySelectorAll('FORM.unhide-button > SPAN > A');
        for (var i=0, len=hideLinks.length; i<len; i++) {
            if (typeof(unhideLinks[i]) != 'undefined') {
                unhideLinks[i].setAttribute('onclick','');
                unhideLinks[i].setAttribute('action','unhide');
                unhideLinks[i].addEventListener('click', modules.betteReddit.hideLink, false);
            }
        }
    },
    saveLink: function(e) {
        if (e) modules.betteReddit.saveLinkClicked = e.target;
        if (modules.betteReddit.saveLinkClicked.getAttribute('action') === 'unsave') {
            modules.betteReddit.saveLinkClicked.innerHTML = 'unsaving...';
        } else {
            modules.betteReddit.saveLinkClicked.innerHTML = 'saving...';
        }
        if (modules.betteReddit.modhash) {
            // modules.betteReddit.saveLinkClicked = e.target;
            var action = modules.betteReddit.saveLinkClicked.getAttribute('action');
            var parentThing = modules.betteReddit.saveLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            var idRe = /id-([\w]+)/i;
            var getLinkid = idRe.exec(parentThing.getAttribute('class'));
            var linkid = getLinkid[1];
            // we also need the modhash to be able to send an API call to save the link...
            /*
            var head = document.getElementsByTagName('head')[0];
            var redditScript = head.querySelectorAll('SCRIPT');
            var modhashRe = /modhash: '([\w]+)'/i;
            for (var i=0, len=redditScript.length; i<len; i++) {
                var modhash = modhashRe.exec(redditScript[i].innerHTML);
                if (modhash) break;
            }
            */
            if (action === 'unsave') {
                var executed = 'unsaved';
                var apiURL = 'http://'+location.hostname+'/api/unsave';
            } else {
                var executed = 'saved';
                var apiURL = 'http://'+location.hostname+'/api/save';
            }
            // var params = 'id='+linkid+'&executed='+executed+'&uh='+modhash[1]+'&renderstyle=html';
            var params = 'id='+linkid+'&executed='+executed+'&uh='+modules.betteReddit.modhash+'&renderstyle=html';
            if (RESUtils.currentSubreddit()) {
                params += '&r='+RESUtils.currentSubreddit();
            }
            GM_xmlhttpRequest({
                method:    "POST",
                url:    apiURL,
                data: params,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload:    function(response) {
                    if (response.status === 200) {
                        if (modules.betteReddit.saveLinkClicked.getAttribute('action') === 'unsave') {
                            modules.betteReddit.saveLinkClicked.innerHTML = 'save';
                            modules.betteReddit.saveLinkClicked.setAttribute('action','save');
                        } else {
                            modules.betteReddit.saveLinkClicked.innerHTML = 'unsave';
                            modules.betteReddit.saveLinkClicked.setAttribute('action','unsave');
                        }
                    } else {
                        delete modules.betteReddit.modhash;
                        RESAlert('Sorry, there was an error trying to '+modules.betteReddit.saveLinkClicked.getAttribute('action')+' your submission. Try clicking again.');
                    }
                }
            });
        } else {
            GM_xmlhttpRequest({
                method:    "GET",
                url:    location.protocol + '//www.reddit.com/api/me.json',
                onload:    function(response) {
                    var data = safeJSON.parse(response.responseText);
                    if (typeof(data.data) === 'undefined') {
                        RESAlert('Sorry, there was an error trying to '+modules.betteReddit.saveLinkClicked.getAttribute('action')+' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
                    } else if ((typeof(data.data.modhash) != 'undefined') && (data.data.modhash)) {
                        modules.betteReddit.modhash = data.data.modhash;
                        modules.betteReddit.saveLink();
                    }
                }
            });
        }
    },
    hideLink: function(e) {
        if (e) modules.betteReddit.hideLinkClicked = e.target;
        if (modules.betteReddit.hideLinkClicked.getAttribute('action') === 'unhide') {
            modules.betteReddit.hideLinkClicked.innerHTML = 'unhiding...';
        } else {
            modules.betteReddit.hideLinkClicked.innerHTML = 'hiding...';
        }
        if (modules.betteReddit.modhash) {
            var action = modules.betteReddit.hideLinkClicked.getAttribute('action');
            var parentThing = modules.betteReddit.hideLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            var idRe = /id-([\w]+)/i;
            var getLinkid = idRe.exec(parentThing.getAttribute('class'));
            var linkid = getLinkid[1];
            if (action === 'unhide') {
                var executed = 'unhidden';
                var apiURL = 'http://'+location.hostname+'/api/unhide';
            } else {
                var executed = 'hidden';
                var apiURL = 'http://'+location.hostname+'/api/hide';
            }
            var params = 'id='+linkid+'&executed='+executed+'&uh='+modules.betteReddit.modhash+'&renderstyle=html';
            if (RESUtils.currentSubreddit()) {
                params += '&r='+RESUtils.currentSubreddit();
            }
            GM_xmlhttpRequest({
                method:    "POST",
                url:    apiURL,
                data: params,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload:    function(response) {
                    if (response.status === 200) {
                        if (modules.betteReddit.hideLinkClicked.getAttribute('action') === 'unhide') {
                            modules.betteReddit.hideLinkClicked.innerHTML = 'hide';
                            modules.betteReddit.hideLinkClicked.setAttribute('action','hide');
                            if (typeof(modules.betteReddit.hideTimer) != 'undefined') clearTimeout(modules.betteReddit.hideTimer);
                        } else {
                            modules.betteReddit.hideLinkClicked.innerHTML = 'unhide';
                            modules.betteReddit.hideLinkClicked.setAttribute('action','unhide');
                            modules.betteReddit.hideTimer = setTimeout(modules.betteReddit.hideFader, 5000);
                        }
                    } else {
                        delete modules.betteReddit.modhash;
                        RESAlert('Sorry, there was an error trying to '+modules.betteReddit.hideLinkClicked.getAttribute('action')+' your submission. Try clicking again.');
                    }
                }
            });
        } else {
            GM_xmlhttpRequest({
                method:    "GET",
                url:    location.protocol + '//www.reddit.com/api/me.json',
                onload:    function(response) {
                    var data = safeJSON.parse(response.responseText);
                    if (typeof(data.data) === 'undefined') {
                        RESAlert('Sorry, there was an error trying to '+modules.betteReddit.hideLinkClicked.getAttribute('action')+' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
                    } else if ((typeof(data.data.modhash) != 'undefined') && (data.data.modhash)) {
                        modules.betteReddit.modhash = data.data.modhash;
                        modules.betteReddit.hideLink();
                    }
                }
            });
        }
    },
    hideFader: function() {
        var parentThing = modules.betteReddit.hideLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        RESUtils.fadeElementOut(parentThing, 0.3);
    },
    searchSubredditByDefault: function() {
        // Reddit now has this feature... but for some reason the box isn't checked by default, so we'll still do that...
        var restrictSearch = document.body.querySelector('INPUT[name=restrict_sr]');
        if (restrictSearch) {
            restrictSearch.checked = true;
        }
    },
    getVideoTimes: function(obj) {
        obj = obj || document;
        var youtubeLinks = obj.querySelectorAll('a.title[href*="youtube.com"]');
        if (youtubeLinks) {
            var getYoutubeIDRegex = /\?v=([\w\-]{11})&?/i;
            var getYoutubeStartTimeRegex = /[\#|\&]t=([\d]+[m|s][\d]*[m|s]?)/i;
            // var getYoutubeIDRegex = /\?v=([\w\-]+)&?/i;
            this.youtubeLinkIDs = [];
            this.youtubeLinkRefs = {};
            for (var i=0, len=youtubeLinks.length; i<len; i++) {
                var match = getYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href'));
                if (match) {
                    // add quotes so URL creation is doable with just a join...
                    var thisYTID = '"'+match[1]+'"';
                    this.youtubeLinkIDs.push(thisYTID);
                    this.youtubeLinkRefs[thisYTID] = youtubeLinks[i];
                }
                var timeMatch = getYoutubeStartTimeRegex.exec(youtubeLinks[i].getAttribute('href'));
                if (timeMatch) {
                    youtubeLinks[i].innerHTML += ' (@'+timeMatch[1]+')';
                }
            }
            this.getVideoJSON();
        }
    },
    getVideoJSON: function() {
        var thisBatch = modules.betteReddit.youtubeLinkIDs.splice(0,8);
        if (thisBatch.length) {
            var thisIDString = thisBatch.join('%7C');
            // var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&fields=entry(id,media:group(yt:duration))&alt=json';
            var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&v=2&fields=entry(id,title,media:group(yt:duration,yt:videoid))&alt=json';
            GM_xmlhttpRequest({
                method:    "GET",
                url:    jsonURL,
                onload:    function(response) {
                    var data = safeJSON.parse(response.responseText, null, true);
                    if ((typeof(data.feed) != 'undefined') && (typeof(data.feed.entry) != 'undefined')) {
                        for (var i=0, len=data.feed.entry.length; i<len; i++) {
                            var thisYTID = '"'+data.feed.entry[i]['media$group']['yt$videoid']['$t']+'"';
                            var thisTotalSecs = data.feed.entry[i]['media$group']['yt$duration']['seconds'];
                            var thisTitle = data.feed.entry[i]['title']['$t'];
                            var thisMins = Math.floor(thisTotalSecs/60);
                            var thisSecs = (thisTotalSecs%60);
                            if (thisSecs < 10) thisSecs = '0'+thisSecs;
                            var thisTime = ' - [' + thisMins + ':' + thisSecs + ']';
                            if (typeof(modules.betteReddit.youtubeLinkRefs[thisYTID]) != 'undefined') {
                                modules.betteReddit.youtubeLinkRefs[thisYTID].innerHTML += ' ' + thisTime;
                                modules.betteReddit.youtubeLinkRefs[thisYTID].setAttribute('title','YouTube title: '+thisTitle);
                            }
                        }
                        // wait a bit, make another request...
                        setTimeout(modules.betteReddit.getVideoJSON, 500);
                    }
                }
            });
        }
    },
    pinSubredditBar: function() {
        // Make the subreddit bar at the top of the page a fixed element
        // The subreddit manager code changes the document's structure
        var sm = modules.subredditManager.isEnabled();

        var sb = document.getElementById('sr-header-area');
        if (sb == null) return; // reddit is under heavy load
        var header = document.getElementById('header');

        // add a dummy <div> inside the header to replace the subreddit bar (for spacing)
        var spacer = document.createElement('div');
        spacer.style.paddingTop = window.getComputedStyle(sb).paddingTop;
        spacer.style.paddingBottom = window.getComputedStyle(sb).paddingBottom;

        // HACK: for some reason, if the SM is enabled, the SB gets squeezed horizontally,
        //       and takes up three rows of vertical space (even at low horizontal resolution).
        if (sm) spacer.style.height = (parseInt(window.getComputedStyle(sb).height) / 3 - 3)+'px';
        else    spacer.style.height = window.getComputedStyle(sb).height;

        //window.setTimeout(function(){
        // add the spacer; take the subreddit bar out of the header and put it above
        header.insertBefore(spacer, sb);
        document.body.insertBefore(sb,header);

        // make it fixed
        // RESUtils.addCSS('div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; box-shadow: 0px 2px 2px #AAA;}');
        RESUtils.addCSS('#header-bottom-left { margin-top: 19px; }');
        RESUtils.addCSS('div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; }');
        this.pinCommonElements(sm);
    },
    pinUserBar: function() {
        // Make the user bar at the top of the page a fixed element
        this.userBarElement = document.getElementById('header-bottom-right');
        var thisHeight = $('#header-bottom-right').height();
        RESUtils.addCSS('#header-bottom-right:hover { opacity: 1 !important;  }');
        RESUtils.addCSS('#header-bottom-right { height: '+parseInt(thisHeight+1)+'px; }');
        // make the account switcher menu fixed
        RESUtils.addCSS('ul#accountSwitcherMenu {position:fixed;}');
        window.addEventListener('scroll', modules.betteReddit.handleScroll, false);
        this.pinCommonElements();
    },
    handleScroll: function(e) {
        if (RESUtils.elementInViewport(modules.betteReddit.userBarElement)) {
            modules.betteReddit.userBarElement.setAttribute('style','');
        } else {
            modules.betteReddit.userBarElement.setAttribute('style','position: fixed; z-index: 10000 !important; top: 0px; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
        }
    },
    pinHeader: function() {
        // Makes the Full header a fixed element

        // the subreddit manager code changes the document's structure
        var sm = modules.subredditManager.isEnabled();

        var header = document.getElementById('header');
        if (header == null) return; // reddit is under heavy load

        // add a dummy <div> to the document for spacing
        var spacer = document.createElement('div');
        spacer.id = 'RESPinnedHeaderSpacer';

        // without the next line, the subreddit manager would make the subreddit bar three lines tall and very narrow
        RESUtils.addCSS('#sr-header-area {left: 0; right: 0;}');
        spacer.style.height = window.getComputedStyle(header).height;

        // insert the spacer
        document.body.insertBefore(spacer, header.nextSibling);

        // make the header fixed
        RESUtils.addCSS('#header, ul#accountSwitcherMenu {position:fixed;}');
        // RESUtils.addCSS('#header {left: 0; right: 0; box-shadow: 0px 2px 2px #AAA;}');
        RESUtils.addCSS('#header {left: 0; right: 0; }');
        var headerHeight = $('#header').height() + 15;
        RESUtils.addCSS('#RESNotifications { top: '+headerHeight+'px } ');
        this.pinCommonElements(sm);

        // TODO Needs testing
        // Sometimes this gets executed before the subreddit logo has finished loading. When that
        // happens, the spacer gets created too short, so when the SR logo finally loads, the header
        // grows and overlaps the top of the page, potentially obscuring the first link. This checks
        // to see if the image is finished loading. If it is, then the spacer's height is set. Otherwise,
        // it pauses, then loops.
        if (!document.getElementById('header-img').complete) setTimeout(function(){
                       if (document.getElementById('header-img').complete)
                               document.getElementById('RESPinnedHeaderSpacer').style.height = window.getComputedStyle(document.getElementById('header')).height;
                       else setTimeout(arguments.callee, 10);
               }, 10);
    },
    pinCommonElements: function(sm) {
        // pin the elements common to both pinHeader() and pinSubredditBar()
        if (sm) {
               // RES's subreddit menu
               RESUtils.addCSS('#RESSubredditGroupDropdown, #srList, #RESShortcutsAddFormContainer, #editShortcutDialog {position: fixed !important;}');
        } else {
               RESUtils.addCSS('#sr-more-link: {position: fixed;}');
               // reddit's subreddit menu (not the RES one); only shows up if you are subscribed to enough subreddits (>= ~20).
               RESUtils.addCSS('.drop-choices {position: fixed;}');
        }
    }
};
