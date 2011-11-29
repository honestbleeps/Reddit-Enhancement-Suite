modules.styleTweaks = {
    moduleID: 'styleTweaks',
    moduleName: 'Style Tweaks',
    category: 'UI',
    description: 'Provides a number of style tweaks to the Reddit interface',
    options: { 
        navTop: {
            type: 'boolean',
            value: true,
            description: 'Moves the username navbar to the top (great on netbooks!)'
        },
        commentBoxes: {
            type: 'boolean',
            value: true,
            description: 'Highlights comment boxes for easier reading / placefinding in large threads.'
        },
        commentRounded: {
            type: 'boolean',
            value: true,
            description: 'Round corners of comment boxes'
        },
        commentHoverBorder: {
            type: 'boolean',
            value: false,
            description: 'Highlight comment box hierarchy on hover (turn off for faster performance)'
        },
        commentIndent: {
            type: 'text',
            value: 10,
            description: 'Indent comments by [x] pixels (only enter the number, no \'px\')'
        },
        continuity: {
            type: 'boolean',
            value: false,
            description: 'Show comment continuity lines'
        },
        lightSwitch: {
            type: 'boolean',
            value: true,
            description: 'Enable lightswitch (toggle between light / dark reddit)'
        },
        lightOrDark: {
            type: 'enum',
            values: [
                { name: 'Light', value: 'light' },
                { name: 'Dark', value: 'dark' }
            ],
            value: 'light',
            description: 'Light, or dark?'
        },
        visitedStyle: {
            type: 'boolean',
            value: false,
            description: 'Reddit makes it so no links on comment pages appear as "visited" - including user profiles. This option undoes that.'
        },
        showExpandos: {
            type: 'boolean',
            value: true,
            description: 'Bring back video and text expando buttons for users with compressed link display'
        },
        colorBlindFriendly: {
            type: 'boolean',
            value: false,
            description: 'Use colorblind friendly styles when possible'
        }
    },
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },    
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);
            
            // wow, Reddit doesn't define a visited class for any links on comments pages...
            // let's put that back if users want it back.
            // If not, we still need a visited class for links in comments, like imgur photos for example, or inline image viewer can't make them look different when expanded!
            if (this.options.visitedStyle.value) {
                RESUtils.addCSS(".comment a:visited { color:#551a8b }");
            } else {
                RESUtils.addCSS(".comment .md p > a:visited { color:#551a8b }");
            }

            // get rid of antequated option we've removed (err, renamed) due to performance issues.
            if (typeof(this.options.commentBoxHover) != 'undefined') {
                delete this.options.commentBoxHover;
                RESStorage.setItem('RESoptions.styleTweaks', JSON.stringify(modules.styleTweaks.options));
            }
            if (this.options.navTop.value) {
                this.navTop();
            }
            var commentsRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i);
            if ((this.options.commentBoxes.value) && (commentsRegex.test(location.href))) {
                this.commentBoxes();
            }
            if (this.options.lightSwitch.value) {
                this.lightSwitch();
            }
            this.isDark = false;
            if (this.options.lightOrDark.value === 'dark') {
                this.isDark = true;
                this.redditDark();
            }
            if (this.options.colorBlindFriendly.value) {
                var orangered = document.body.querySelector('#mail');
                if ((orangered) && (hasClass(orangered, 'havemail'))) {
                    orangered.setAttribute('style','background-image: url(http://thumbs.reddit.com/t5_2s10b_5.png); background-position: 0px 0px;');
                }
            }
            if (this.options.showExpandos.value) {
                RESUtils.addCSS('.compressed .expando-button { display: block !important; }');
                var twitterLinks = document.body.querySelectorAll('.entry > p.title > a.title');
                var isTwitterLink = /twitter.com\/(?:#!\/)?([\w]+)\/(status|statuses)\/([\d]+)/i;
                for (var i=0, len = twitterLinks.length; i<len; i++) {
                    var thisHref = twitterLinks[i].getAttribute('href');
                    thisHref = thisHref.replace('/#!','');
                    if (isTwitterLink.test(thisHref)) {
                        var thisExpandoButton = document.createElement('div');
                        thisExpandoButton.setAttribute('class','expando-button collapsed selftext');
                        thisExpandoButton.addEventListener('click',modules.styleTweaks.toggleTweetExpando,false);
                        $(twitterLinks[i].parentNode).after(thisExpandoButton);
                    }
                }
            }
            this.userbarHider();
            this.subredditStyles();
        }
    },
    toggleTweetExpando: function(e) {
        var thisExpando = e.target.nextSibling.nextSibling.nextSibling;
        if (hasClass(e.target,'collapsed')) {
            removeClass(e.target,'collapsed');
            addClass(e.target,'expanded');
            var twitterLink = e.target.previousSibling.firstChild.getAttribute('href');
            twitterLink = twitterLink.replace('/#!','');
            var match = twitterLink.match(/twitter.com\/[^\/]+\/(?:status|statuses)\/([\d]+)/i);
            if (match != null) {
                var jsonURL = 'http://api.twitter.com/1/statuses/show/'+match[1]+'.json';
                if (typeof chrome != 'undefined') {
                    // we've got chrome, so we need to hit up the background page to do cross domain XHR
                    thisJSON = {
                        requestType: 'loadTweet',
                        url: jsonURL
                    }
                    chrome.extension.sendRequest(thisJSON, function(response) {
                        // send message to background.html 
                        var tweet = response;
                        thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
                        thisExpando.style.display = 'block';
                    });
                } else if (typeof safari != 'undefined') {
                    // we've got safari, so we need to hit up the background page to do cross domain XHR
                    modules.styleTweaks.tweetExpando = thisExpando;
                    thisJSON = {
                        requestType: 'loadTweet',
                        url: jsonURL
                    }
                    safari.self.tab.dispatchMessage("loadTweet", thisJSON);
                } else if (typeof opera != 'undefined') {
                    // we've got opera, so we need to hit up the background page to do cross domain XHR
                    modules.styleTweaks.tweetExpando = thisExpando;
                    thisJSON = {
                        requestType: 'loadTweet',
                        url: jsonURL
                    }
                    opera.extension.postMessage(JSON.stringify(thisJSON));
                } else if (typeof(self.on) === 'function') {
                    // we've got a jetpack extension, hit up the background page...
                    modules.styleTweaks.tweetExpando = thisExpando;
                    thisJSON = {
                        requestType: 'loadTweet',
                        url: jsonURL
                    }
                    self.postMessage(thisJSON);
                } else {
                    GM_xmlhttpRequest({
                        method:    "GET",
                        url:    jsonURL,
                        target: thisExpando,
                        onload:    function(response) {
                            var tweet = JSON.parse(response.responseText);
                            thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
                            thisExpando.style.display = 'block';
                        }
                    });
                }
            }
        } else {
            addClass(e.target,'collapsed');
            removeClass(e.target,'expanded');
            thisExpando.style.display = 'none';
        }
        
    },
    navTop: function() {
        RESUtils.addCSS('#header-bottom-right { top: 19px; border-radius: 0px 0px 0px 3px; -moz-border-radius: 0px 0px 0px 3px; -webkit-border-radius: 0px 0px 0px 3px; bottom: auto;  }');
    },
    userbarHider: function() {
        RESUtils.addCSS("#userbarToggle { position: absolute; top: 0px; left: -5px; width: 16px; padding-right: 3px; height: 21px; font-size: 15px; border-radius: 4px 0px 0px 4px; color: #a1bcd6; display: inline-block; background-color: #dfecf9; border-right: 1px solid #cee3f8; cursor: pointer; text-align: right; line-height: 20px; }");
        RESUtils.addCSS("#header-bottom-right .user { margin-left: 16px; }");
        // RESUtils.addCSS(".userbarHide { background-position: 0px -137px; }");
        RESUtils.addCSS("#userbarToggle.userbarShow { left: -12px; }");
        var userbar = document.getElementById('header-bottom-right');
        if (userbar) {
            this.userbarToggle = createElementWithID('div','userbarToggle');
            this.userbarToggle.innerHTML = '&raquo;';
            this.userbarToggle.setAttribute('title','Toggle Userbar');
            addClass(this.userbarToggle, 'userbarHide');
            this.userbarToggle.addEventListener('click', function(e) {
                modules.styleTweaks.toggleUserBar();
            }, false);
            userbar.insertBefore(this.userbarToggle, userbar.firstChild);
            if (RESStorage.getItem('RESmodules.styleTweaks.userbarState') === 'hidden') {
                this.toggleUserBar();
            }
        }
    },
    toggleUserBar: function() {
        var nextEle = this.userbarToggle.nextSibling;
        if (hasClass(this.userbarToggle,'userbarHide')) {
            removeClass(this.userbarToggle,'userbarHide');
            addClass(this.userbarToggle,'userbarShow');
            this.userbarToggle.innerHTML = '&laquo;';
            RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'hidden');
            modules.accountSwitcher.closeAccountMenu();
            while ((typeof nextEle != 'undefined') && (nextEle != null)) {
                nextEle.style.display = 'none';
                nextEle = nextEle.nextSibling;
            }
        } else {
            removeClass(this.userbarToggle,'userbarShow');
            addClass(this.userbarToggle,'userbarHide');
            this.userbarToggle.innerHTML = '&raquo;';
            RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'visible');
            while ((typeof nextEle != 'undefined') && (nextEle != null)) {
            if(nextEle.className.match(/mail/)){
                nextEle.style.display = 'inline-block';
            } else {
                nextEle.style.display = 'inline';
            }
        nextEle = nextEle.nextSibling;
            }
        }
    },
    commentBoxes: function() {
        // replaced with a less intensive method... adapted from Reddit Comment Boxes via:
        // @description      Updated version of Tiby312's Reddit Comment Boxes script (http://userscripts.org/scripts/show/63628) 
        // @author        flatluigi
        

        RESUtils.addCSS(".parentComment { background-color:#ffffff !important; } ");
        RESUtils.addCSS(".comment{");
        if (this.options.commentRounded.value) {
            RESUtils.addCSS("    -moz-border-radius:3px !important;"+
                "      -webkit-border-radius:3px !important;"+
                "      border-radius:3px !important;");
        }
        RESUtils.addCSS("    margin-left:"+this.options.commentIndent.value+"px !important;"+
        "    margin-right:8px!important;"+
        "    margin-top:0px!important;"+
        "    margin-bottom:8px!important;"+
        // commented out, we'll do this in the parentHover class for more CSS friendliness to custom subreddit stylesheets...
        // "    background-color:#ffffff !important;"+
        "    border:1px solid #e6e6e6 !important;"+
        "    padding-left:5px!important;"+
        "    padding-top:5px!important;"+
        "    padding-right:8px!important;"+
        "    padding-bottom:0px!important;"+
        "    overflow: hidden !important;"+
        "}");
        if (this.options.continuity.value) {
            RESUtils.addCSS('.comment div.child { border-left: 1px dotted #555555 !important; } ');
        } else {
            RESUtils.addCSS('.comment div.child { border-left: none !important; } ');
        }
        RESUtils.addCSS(".comment .comment{"+
        "    margin-right:0px!important;"+
        "    background-color:#F7F7F8 !important;"+    
        "}"+
        ".comment .comment .comment{"+
        "    background-color:#ffffff !important;"+    
        "}"+
        ".comment .comment .comment .comment{"+
        "    background-color:#F7F7F8 !important;"+    
        "}"+
        ".comment .comment .comment .comment .comment{"+
        "    background-color:#ffffff !important;"+    
        "}"+
        ".comment .comment .comment .comment .comment .comment{"+
        "    background-color:#F7F7F8 !important;"+    
        "}"+
        ".comment .comment .comment .comment .comment .comment .comment{"+
        "    background-color:#ffffff !important;"+    
        "}"+
        ".comment .comment .comment .comment .comment .comment .comment .comment{"+
        "    background-color:#F7F7F8 !important;"+    
        "}"+
        ".comment .comment .comment .comment .comment .comment .comment .comment .comment{"+
        "    background-color:#ffffff !important;"+    
        "}"+
        ".comment .comment .comment .comment .comment .comment .comment .comment .comment .comment{"+
        "    background-color:#F7F7F8 !important;"+    
        "}"+
        /*
        ".commentarea, .link, .comment {"+
        "    overflow:hidden; !important;"+
        "}"+
        */
        "body > .content {"+
        " padding-right:0px; !important;"+
        "}"); 
        if (this.options.commentHoverBorder.value) {
            RESUtils.addCSS(" .comment:hover {border: 1px solid #99AAEE !important; }");
        }
    },
    lightSwitch: function() {
        // RESUtils.addCSS("#lightSwitch { width: 24px; height: 11px; display: inline-block; background-image: url('http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png'); cursor: pointer; }");
        RESUtils.addCSS(".lightOn { background-position: 0px -96px; } ");
        RESUtils.addCSS(".lightOff { background-position: 0px -108px; } ");
        RESUtils.addCSS('#lightSwitchToggle { float: right; margin-right: 10px; margin-top: 10px; line-height: 10px; }');
        var thisFrag = document.createDocumentFragment();
        /*
        var separator = document.createElement('span');
        addClass(separator,'separator');
        separator.innerHTML = '|';
        */
        this.lightSwitch = document.createElement('li');
        this.lightSwitch.setAttribute('title',"Toggle night and day");
        this.lightSwitch.addEventListener('click',function(e) {
            e.preventDefault();
            if (modules.styleTweaks.isDark === true) {
                RESUtils.setOption('styleTweaks','lightOrDark','light');
                removeClass(modules.styleTweaks.lightSwitchToggle, 'enabled');
                modules.styleTweaks.redditDark(true);
            } else {
                RESUtils.setOption('styleTweaks','lightOrDark','dark');
                addClass(modules.styleTweaks.lightSwitchToggle, 'enabled');
                modules.styleTweaks.redditDark();
            }
        }, true);
        // this.lightSwitch.setAttribute('id','lightSwitch');
        this.lightSwitch.innerHTML = 'night mode';
        this.lightSwitchToggle = createElementWithID('div','lightSwitchToggle','toggleButton');
        this.lightSwitchToggle.innerHTML = '<span class="toggleOn">on</span><span class="toggleOff">off</span>';
        this.lightSwitch.appendChild(this.lightSwitchToggle);
        (this.options.lightOrDark.value === 'dark') ? addClass(this.lightSwitchToggle, 'enabled') : removeClass(this.lightSwitchToggle, 'enabled');
        // thisFrag.appendChild(separator);
        thisFrag.appendChild(this.lightSwitch);
        // if (RESConsole.RESPrefsLink) $(RESConsole.RESPrefsLink).after(thisFrag);
        $('#RESDropdownOptions').append(this.lightSwitch);
    },
    subredditStyles: function() {
        this.ignoredSubReddits = [];
        var getIgnored = RESStorage.getItem('RESmodules.styleTweaks.ignoredSubredditStyles');
        if (getIgnored) {
            this.ignoredSubReddits = safeJSON.parse(getIgnored, 'RESmodules.styleTweaks.ignoredSubredditStyles');
        }
        this.head = document.getElementsByTagName("head")[0];
        var subredditTitle = document.querySelector('.titlebox h1');
        var styleToggle = document.createElement('div');
        styleToggle.setAttribute('style','display: block !important;');
        var thisLabel = document.createElement('label');
        addClass(styleToggle,'styleToggle');
        thisLabel.setAttribute('for','subRedditStyleCheckbox');
        thisLabel.innerHTML = 'Use subreddit style ';
        styleToggle.appendChild(thisLabel);
        this.styleToggleCheckbox = document.createElement('input');
        this.styleToggleCheckbox.setAttribute('type','checkbox');
        this.styleToggleCheckbox.setAttribute('name','subRedditStyleCheckbox');
        if (RESUtils.currentSubreddit()) {
            this.curSubReddit = RESUtils.currentSubreddit().toLowerCase();
        }
        if ((this.curSubReddit != null) && (subredditTitle != null)) {
            var idx = this.ignoredSubReddits.indexOf(this.curSubReddit);
            if (idx === -1) {
                this.styleToggleCheckbox.checked = true;
            } else {
                this.toggleSubredditStyle(false);
            }
            this.styleToggleCheckbox.addEventListener('change', function(e) {
                modules.styleTweaks.toggleSubredditStyle(this.checked);
            }, false);
            styleToggle.appendChild(this.styleToggleCheckbox);
            $(subredditTitle).after(styleToggle);
        }
    },
    toggleSubredditStyle: function(toggle) {
        if (toggle) {
            var idx = this.ignoredSubReddits.indexOf(this.curSubReddit);
            if (idx != -1) this.ignoredSubReddits.splice(idx, 1); // Remove it if found...
            var subredditStyleSheet = document.createElement('link');
            subredditStyleSheet.setAttribute('title','applied_subreddit_stylesheet');
            subredditStyleSheet.setAttribute('rel','stylesheet');
            subredditStyleSheet.setAttribute('href','http://www.reddit.com/r/'+this.curSubReddit+'/stylesheet.css');
            this.head.appendChild(subredditStyleSheet);
        } else {
            var idx = this.ignoredSubReddits.indexOf(this.curSubReddit); // Find the index
            if (idx==-1) this.ignoredSubReddits[this.ignoredSubReddits.length] = this.curSubReddit;
            var subredditStyleSheet = this.head.querySelector('link[title=applied_subreddit_stylesheet]');
            if (!subredditStyleSheet) subredditStyleSheet = this.head.querySelector('style[title=applied_subreddit_stylesheet]');
            if (subredditStyleSheet) {
                subredditStyleSheet.parentNode.removeChild(subredditStyleSheet);
            }
        }
        RESStorage.setItem('RESmodules.styleTweaks.ignoredSubredditStyles',JSON.stringify(this.ignoredSubReddits));
    },
    redditDark: function(off) {
        if (off) {
            this.isDark = false;
            if (typeof(this.darkStyle) != 'undefined') {
                this.darkStyle.parentNode.removeChild(this.darkStyle);
                removeClass(document.body,'res-nightmode');
            }
        } else {
            this.isDark = true;
            addClass(document.body,'res-nightmode');
            var css = "div[class=\"organic-listing\"] ul[class=\"tabmenu \"], div[id=\"header-bottom-left\"]] {background-color: #666 !important; } ::-moz-selection {    background:orangered; }";
            css += "html {background-color:#222 !important;}";
            css += ".res-nightmode {background-color:#222 !important;}";
            css += ".res-nightmode body > .content {background-color:#222 !important;}";
            css += ".res-nightmode .flair {background-color:#bbb!important;color:black!important;}";
            css += ".res-nightmode .RESUserTagImage, .res-nightmode button.arrow.prev, .res-nightmode button.arrow.next {opacity:0.5;}";
            css += ".res-nightmode #RESConsole {background-color:#ddd;}";
            css += ".res-nightmode #RESConsoleTopBar #RESLogo, .res-nightmode #progressIndicator {opacity:0.4;}";
            css += ".res-nightmode .tabmenu li a, .res-nightmode .login-form, .res-nightmode .login-form input[name*='passwd'], .res-nightmode .login-form-side .submit {background-color:#bbb;}";
            css += ".res-nightmode .login-form-side input {width:auto!important;}";
            css += ".res-nightmode form.login-form.login-form-side {background-color: #888;color: #eee;}";
            css += ".res-nightmode #RESConsoleTopBar, .res-nightmode .moduleHeader, .res-nightmode .allOptionsContainer, .res-nightmode .optionContainer {background-color: #ccc;color:black !important;}"; 
            css += ".res-nightmode #siteTable sitetable{background-color:#222 !important;}";
            css += ".res-nightmode #commentNavButtons * {color:white !important;}";
            css += ".res-nightmode .usertable .btn {border-color:#aa9 !important;color:#aa9 !important;}";
            css += ".res-nightmode .usertable tr .user b {color:#aa9 !important;}";
            css += ".res-nightmode .thinig.spam {background-color:salmon !important;}";
            css += ".res-nightmode .wikipage h1 {color:#ddd !important;}";
            css += ".res-nightmode .titlebox .usertext-body .md h3 {color:black !important;}";
            css += ".res-nightmode .new-comment .usertext-body .md {border:0.1em #aaa dashed;}";
            css += ".res-nightmode .sitetable .moderator {background-color:#282 !omportant;color:white !important;}";
            css += ".res-nightmode .sitetable .admin {background-color:#F01 !omportant;color:white !important;}";
            css += ".res-nightmode .message ul {color:#abcabc !important;}";
            css += ".res-nightmode .side .spacer > #search input {background-color:#444 !important;}";
            css += ".res-nightmode input[type=\"text\"] {background-color:#aaa !important;}";
            css += ".res-nightmode .share-button .option {color: #8AD !important;}";
            css += "body.res-nightmode > .content > .spacer > .sitetable:before, body > .content > .sharelink ~ .sitetable:before, .res-nightmode .side .age, .res-nightmode .trophy-info * {color: #ddd !important;}";
            css += ".res-nightmode .livePreview blockquote {border-left: 2px solid white !important};";
            css += ".res-nightmode #RESDashboardComponent, .res-nightmode RESDashboardComponentHeader {background-color: #ddd !important;}";
            css += ".res-nightmode #RESDashboardAddComponent, .res-nightmode .RESDashboardComponentHeader {background-color: #bbb !important;}";
            css += ".res-nightmode .addNewWidget, .res-nightmode .widgetPath, .res-nightmode #authorInfoToolTip a.option {color: white !important;}";
            css += ".res-nightmode .entry .score {color:#dde !important;}";
            css += ".res-nightmode .entry p.tagline:first-of-type, .res-nightmode .entry time {color:#dd8;}"
            css += ".res-nightmode  code {color:#6c0 !important;}"
            css += ".res-nightmode .entry .domain a {color:cyan !important;}"
            css += ".res-nightmode .traffic-table tr.odd {color: #222 !important;}"
            css += ".res-nightmode .side, .res-nightmode .flairselector, .res-nightmode .linefield {background-color: #222;}"
            css += ".res-nightmode .big-mod-buttons .pretty-button {color:black !important;}"
            css += ".res-nightmode .voteWeight { background-color: #222 !important; color: white !important;}"
            css += ".res-nightmode form.flairtoggle, .res-nightmode .trophy-area .content, .res-nightmode .side .spacer h1, .res-nightmode .NERPageMarker, .res-nightmode .side .spacer {background-color:#222 !important;color:#ddd !important;}";
            css += ".res-nightmode .sitetable .thing {border-color:transparent !important;}"
            css += ".res-nightmode .message.message-reply.recipient > .entry .head, .message.message-parent.recipient > .entry .head {color:inherit !important;}"
            css += ".res-nightmode #header {background-color:#666660 !important;}";
            css += "body { background-color: #222 !important; } .infobar { background-color:#222 !important; color:black !important; }";
            css += ".side { background:none !important; } h2, .tagline a, .content a, .footer a, .wired a, .side a, .subredditbox li a { color:#8AD !important; }";
            css += ".rank .star { color:orangered !important; } .content { color:#CCC !important; } .thing .title.loggedin, .link .title { color:#DFDFDF !important; }";
            // css += ".link .midcol, .linkcompressed .midcol, .comment .midcol { background:none !important; margin-right:6px !important; margin-top:4px !important; margin-left: 0px !important; }";
            // css += ".link .midcol { width:24px !important; } .link .midcol .arrow { margin-left:7px !important; margin-right:7px !important; }";
            css += ".arrow { height:14px !important; margin-top:0 !important; width:15px !important; }";
            css += ".arrow.up { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=zs9q49wxah08x4kpv2tu5x4nbda7kmcpgkbj) -15px 0 no-repeat !important; }";
            css += ".arrow.down { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=10999ad3mtco31oaf6rrggme3t9jdztmxtg6) -15px -14px no-repeat !important; }";
            css += ".arrow.up:hover { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=9oeida688vtqjpb4k0uy93oongrzuv5j7vcj) -30px 0 no-repeat !important; }";
            css += ".arrow.down:hover { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=cmsw4qrin2rivequ0x1wnmn8ltd7ke328yqs) -30px -14px no-repeat !important; }";
            css += ".arrow.upmod { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=8oarqkcswl255wrw3q1kyd74xrty50a7wr3z) 0 0 no-repeat !important; }";
            css += ".arrow.downmod { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=90eauq018nf41z3vr0u249gv2q6651xyzrkh) 0 -14px no-repeat !important; }";
            css += ".link .score.likes, .linkcompressed .score.likes { color:orangered !important; }";
            css += ".link .score.dislikes, .linkcompressed .score.dislikes { color:#8AD !important; }";
            css += ".linkcompressed .entry .buttons li a, .link .usertext .md, .thing .compressed, organic-listing .link, .organic-listing .link.promotedlink, .link.promotedlink.promoted { background:none !important; }";
            css += ".message.new > .entry {background-color:#444444; border:1px solid #E9E9E9; padding:6px; } ";
            css += ".subredditbox li a:before { content:\"#\" !important; } .subredditbox li { font-weight:bold !important; text-transform:lowercase !important; }";
            css += ".side h3:after { content:\" (#reddit on freenode)\" !important; font-size:85% !important; font-weight:normal !important; }";
            css += "#subscribe a { color:#8AD !important; } .dropdown.lightdrop .drop-choices { background-color:#333 !important; }";
            css += ".dropdown.lightdrop a.choice:hover { background-color:#111 !important; } .midcol {margin-right:7px !important;} .side { background:none !important; color:#fff; margin-left:10px !important; }";
            css += ".dropdown.lightdrop a.choice:hover { background-color:#111 !important; } .side { background:none !important; color:#fff !important; margin-left:10px !important; }";
            css += ".side h4, .side h3 { color:#ddd !important; } .side h5 { color:#aaa !important; margin-top:5px !important; } .side p { margin-top:5px !important; }";
            css += ".sidebox, .subredditbox, .subreddit-info, .raisedbox, .login-form-side { background-color:#393939 !important; border:2px solid #151515 !important; color:#aaa !important; border-radius:8px !important; -moz-border-radius:8px !important; -webkit-border-radius:8px !important; }";
            css += ".login-form-side { background:#e8690a !important; border-bottom:0 !important; border-color:#e8690a !important; padding-bottom:1px !important; position:relative !important; }";
            css += ".login-form-side input { width:125px !important; } .login-form-side label { color:#111 !important; } .login-form-side a { color:#FFFFFF !important; font-size:11px !important; }";
            css += ".login-form-side .error { color:#660000 !important; } .subreddit-info .label { color:#aaa !important; } .subreddit-info { padding:10px !important; }";
            css += ".subreddit-info .spacer a { background-color:#222; border:none !important; margin-right:3px !important; }";
            css += ".subredditbox ul { padding:10px 0px 10px 3px !important; width:140px !important; } .subredditbox ul a:hover { text-decoration:underline !important; } .morelink { background:none !important; border:0 !important; border-radius-bottomleft:6px !important; -moz-border-radius-bottomleft:6px !important; -webkit-border-radius-bottomleft:6px !important; -moz-border-radius-topright:6px !important; -webkit-border-radius-bottom-left-radius:6px !important; -webkit-border-radius-top-right-radius:6px !important; }";
            css += ".morelink.blah:hover { background:none !important; color:#369 !important; } .morelink.blah { background:none !important; border:0 !important; color:#369 !important; }";
            css += ".morelink:hover { border:0 !important; color:white !important; } .sidebox { padding-left:60px !important; }";
            css += ".sidebox.submit { background:#393939 url(http://thumbs.reddit.com/t5_2qlyl_2.png?v=0s1s9iul2umpm0bx46cioc7yjwbkprt7r2qr) no-repeat 6px 50% !important; }";
            css += ".sidebox .spacer, .linkinfo {background-color:#393939 !important; } .nub {background-color: transparent !important;}";
            css += ".sidebox.create { background:#393939 url(http://thumbs.reddit.com/t5_2qlyl_1.png?v=gl82ywfldj630zod4iaq56cidjud4n79wqw8) no-repeat 6px 50% !important; }";
            css += ".sidebox .subtitle { color:#aaa !important; } h1 { border-bottom:1px solid #444 !important; }";
            css += "button.btn { background:none !important; border:2px solid black !important; color:black !important; position:relative !important; width:auto !important; }";
            css += ".commentreply .buttons button { margin-left:0 !important; margin-top:5px !important; } .commentreply .textarea { color:black !important; }";
            css += ".menuarea { margin-right:315px !important; } .permamessage { background-image:url(http://thumbs.reddit.com/t5_2qlyl_3.png?v=uza2aq80cb2x2e90ojhdqooj1wazax4jjzfc) !important; border-color:#369 !important; }";
            css += ".commentbody.border { background-color:#369 !important; } .commentreply .help tr { background:none !important; } .commentreply table.help { margin:2px !important; }";
            css += "#newlink th { padding-top:5px !important; vertical-align:top !important; } .pretty-form.long-text input[type=\"text\"], .pretty-form.long-text textarea, .pretty-form.long-text input[type=\"password\"], .commentreply textarea { background-color:#333 !important; border:2px solid black !important; color:#CCC !important; padding:4px !important; }";
            css += "input#title { height:5em !important; } .spam, .reported { background:none !important; border:2px dotted !important; padding:4px !important; }";
            css += ".spam { border-color:orangered !important; } .reported { border-color:goldenrod !important; } .organic-listing .linkcompressed { background:none !important; }";
            css += ".organic-listing .nextprev img { opacity:.7 !important; } .organic-listing .nextprev img:hover { opacity:.85 !important; }";
            css += "#search input[type=\"text\"] { background-color:#222 !important; color:gray !important; } #search input[type=\"text\"]:focus { color:white !important; }";
            css += "#sr-header-area, #sr-more-link { background:#c2d2e2 !important; } ";
            css += "#header-bottom-left .tabmenu .selected a { border-bottom:none !important; padding-bottom:0 !important; } #ad-frame { opacity:.8 !important; }";
            css += ".comment.unread { background-color:#4A473B !important; } .raisedbox .flat-list a { background-color:#222 !important; -moz-border-radius:2px !important; -webkit-border-radius:2px !important; }";
            css += ".raisedbox .flat-list a:hover { background-color:#336699 !important; color:white !important; } .instructions { background:white !important; padding:10px !important; }";
            css += ".instructions .preftable th, .instructions .pretty-form  { color:black !important; } #feedback { padding:10px !important; } span[class=\"hover pagename redditname\"] a {font-size: 1.7em !important;}";
            css += ".thing .title.loggedin:visited, .link .title:visited  {color: #666666 !important;} legend {background-color: black !important;}";
            css += "a.author.moderator, a.moderator {color:#3F4 !important; } a.author.friend, a.friend {color:rgb(255, 139, 36) !important; } a.submitter {color: #36F !important; }";
            css += "a.author.admin, a.admin{color: #611 !important; } a.author.submitter { }   table[class=\"markhelp md\"] tr td { background-color: #555 !important; }";
            css += "div.infobar { color: #ccc !important; }  table[class=\"markhelp md\"] tr[style=\"background-color: rgb(255, 255, 153); text-align: center;\"] td { background-color: #36c !important; }";
            css += "form[class=\"usertext border\"] div.usertext-body { background-color: transparent !important;  border-width: 2px !important; border-style: solid !important; border-color: #999 !important; }";
            // css += "div[class=\"midcol likes\"], div[class=\"midcol dislikes\"], div[class=\"midcol unvoted\"] {padding: 0px 7px 0px 0px !important;}";
            css += "form[class=\"usertext border\"] div.usertext-body div.md { background-color: transparent !important; } form#form-t1_c0b71p54yc div {color: black !important;}";
            css += "a[rel=\"tag\"], a.dsq-help {color: #8AD !important; }  div[class=\"post-body entry-content\"], div.dsq-auth-header { color: #ccc !important; }";
            css += "div#siteTable div[onclick=\"click_thing(this)\"] {background-color: #222 !important;} .md p {color: #ddd !important; } .mail .havemail img, .mail .nohavemail img {   visibility: hidden; }";
            css += ".havemail {   background: url('http://i.imgur.com/2Anoz.gif') bottom left no-repeat; }  .mail .nohavemail {   background: url('http://imgur.com/6WV6Il.gif') bottom left no-repeat; }";
            css += "#header-bottom-right { background-color: #BBBBBB !important; }";
            css += '.expando-button.image {background: none !important; background-image: url(http://thumbs.reddit.com/t5_2s10b_2.png) !important;}';
            css += '.expando-button.image.collapsed {background-position: 0px 0px !important;}';
            css += '.expando-button.image.collapsed:hover {background-position: 0px -24px !important;}';
            css += '.expando-button.image.expanded, .eb-se { margin-bottom:5px; background-position: 0px -48px !important;}';
            css += '.expando-button.image.expanded:hover, .eb-seh {background-position: 0px -72px !important;}';
            css += '.expando-button.selftext {background: none !important; background-image: url(http://thumbs.reddit.com/t5_2s10b_2.png) !important;}';
            css += '.expando-button.selftext.collapsed {background-position: 0px -96px !important;}';
            css += '.expando-button.selftext.collapsed:hover {background-position: 0px -120px !important;}';
            css += '.expando-button.selftext.expanded, .eb-se { margin-bottom:5px; background-position: 0px -144px !important;}';
            css += '.expando-button.selftext.expanded:hover, .eb-seh {background-position: 0px -168px !important;}';
            css += '.expando-button.video {background: none !important; background-image: url(http://thumbs.reddit.com/t5_2s10b_2.png) !important;}';
            css += '.expando-button.video.collapsed {background-position: 0px -192px !important;}';
            css += '.expando-button.video.collapsed:hover {background-position: 0px -216px !important;}';
            css += '.expando-button.video.expanded, .eb-se { margin-bottom:5px; background-position: 0px -240px !important;}';
            css += '.expando-button.video.expanded:hover, .eb-seh {background-position: 0px -264px !important;}';
            css += '.expando-button {  background-color:transparent!important; }';
            css += '.RESdupeimg { color: #eeeeee; font-size: 10px;  }';
            css += '.keyHighlight, .keyHighlight div.md { background-color: #666666 !important; } .keyHighlight .title.loggedin:visited, .keyHighlight .title:visited { color: #dfdfdf !important; } .nub {background: none !important;}';
            css += '.side .titlebox { padding-left:5px!important;}';
            css += '.user b { color:#444!important; }';
            css += '.drop-choices { background-color:#C2D2E2!important; }';
            css += '.drop-choices a { color:black!important; }';
            css += '.subreddit .usertext .md { background-color:#222!important; color:#CCC!important; }';
            css += '.toggle .option { color:#FFF!important; }';
            css += '.formtabs-content { border-top: 6px solid #111!important; }';
            css += 'form#newlink.submit ul.tabmenu>li.selected a { background-color:#111!important; color:#88AADD!important; }';
            css += 'a.link-button, a.text-button { color:#444!important; }';
            css += 'form#newlink.submit button.btn { background-color:#111!important; color:#88AADD!important; }';
            css += '#sr-autocomplete-area { z-index:1!important; }';
            css += 'form#newlink.submit textarea, form#newlink.submit input#url, form#newlink.submit input#sr-autocomplete { background-color:#666!important; color:#CCC!important; }';
            css += '.create-reddit { border:none!important; }';
            css += '.create-reddit span.title { background-color:#111!important; color:#88AADD!important; }';
            css += '.linefield .linefield-content { border-color: #111!important; }';
            css += '.create-reddit input#title, .create-reddit input#name.text, .create-reddit input#domain.text { height:1.2em!important; background-color:#666!important; color:#CCC!important; }';
            css += '.linefield .delete-field { background-color:transparent!important; }';
            css += '.instructions { background-color:transparent!important; }';
            css += '.instructions .preftable th { color:#CCC!important; }';
            css += '.icon-menu a, FORM.leavemoderator-button { background-color:#222!important; }';
            css += '#pref-delete .delete-field { background-color:transparent!important; }';
            css += '.NERdupe p.title:after { color: #dddddd !important; }';
            css += '.savedComment { color: #dddddd !important; }';
            if (this.options.commentBoxes.value) {
                css += ".comment{"+
                "    background-color:#444444 !important;"+    
                "}"+
                ".comment .comment{"+
                "    background-color:#111111 !important;"+    
                "}"+
                ".comment .comment .comment{"+
                "    background-color:#444444 !important;"+    
                "}"+
                ".comment .comment .comment .comment{"+
                "    background-color:#111111 !important;"+    
                "}"+
                ".comment .comment .comment .comment .comment{"+
                "    background-color:#444444 !important;"+    
                "}"+
                ".comment .comment .comment .comment .comment .comment{"+
                "    background-color:#111111 !important;"+    
                "}"+
                ".comment .comment .comment .comment .comment .comment .comment{"+
                "    background-color:#444444 !important;"+    
                "}"+
                ".comment .comment .comment .comment .comment .comment .comment .comment{"+
                "    background-color:#111111 !important;"+    
                "}"+
                ".comment .comment .comment .comment .comment .comment .comment .comment .comment{"+
                "    background-color:#444444 !important;"+    
                "}"+
                ".comment .comment .comment .comment .comment .comment .comment .comment .comment .comment{"+
                "    background-color:#111111 !important;"+    
                "}";
                css += '.thing { margin-bottom: 10px; border: 1px solid #666666 !important; } ';
            }
            css += '.organic-listing .link { background-color: #333333 !important; } .sidecontentbox { background-color: #111111; } .side { background: none !important; }';
            if (this.options.continuity.value) {
                css += '.comment div.child { border-left: 1px dotted #555555 !important; } ';
            } else {
                css += '.comment div.child { border-left: none !important; } ';
            }
            css += '.roundfield {background-color: #111111 !important;}';
            css += '#authorInfoToolTip { background-color: #666666 !important; color: #cccccc !important; border-color: #888888 !important; } #authorInfoToolTip a { color: #88AADD !important; } ';
            css += '.new-comment .usertext-body { background-color: #334455 !important; border: none !important; margin:-1px 0; }';
            css += '.usertext-edit textarea { background-color: #666666 !important; color: #CCCCCC !important; } ';
            css += '.RESDialogSmall { background-color: #666666 !important; color: #CCCCCC !important; } ';
            css += '.RESDialogSmall h3 { background-color: #222222 !important; color: #CCCCCC !important; } ';
            // css += 'body, .sidecontentbox .content, .linkinfo, .titlebox  { background-image: none !important }';
            // css += '.titlebox .md {background-color: transparent !important}';
            this.darkStyle = createElementWithID('style', 'darkStyle');
            this.darkStyle.innerHTML = css;
            document.body.appendChild(this.darkStyle);
        }
        // GM_addStyle(css);
    }
};
