modules.keyboardNav = {
    moduleID: 'keyboardNav',
    moduleName: 'Keyboard Navigation',
    category: 'UI',
    options: {
        // any configurable options you have go here...
        // options must have a type and a value.. 
        // valid types are: text, boolean (if boolean, value must be true or false)
        // for example:
        focusBorder: {
            type: 'text',
            value: '1px dashed #888888', 
            description: 'Border style of focused element'
        },
        focusBGColor: {
            type: 'text',
            value: '#F0F3FC', 
            description: 'Background color of focused element'
        },
        focusBGColorNight: {
            type: 'text',
            value: '#666', 
            description: 'Background color of focused element in Night Mode'
         },
         focusFGColorNight: {
            type: 'text',
            value: '#DDD', 
            description: 'Foreground color of focused element in Night Mode'
         },
        autoSelectOnScroll: {
            type: 'boolean',
            value: false,
            description: 'Automatically select the topmost element for keyboard navigation on window scroll'
        },
        scrollOnExpando: {
            type: 'boolean',
            value: true,
            description: 'Scroll window to top of link when expando key is used (to keep pics etc in view)'
        },
        scrollStyle: {
            type: 'enum',
            values: [
                { name: 'directional', value: 'directional' },
                { name: 'page up/down', value: 'page' },
                { name: 'lock to top', value: 'top' }
            ],
            value: 'directional',
            description: 'When moving up/down with keynav, when and how should RES scroll the window?'
        },
        commentsLinkNumbers: {
            type: 'boolean',
            value: true,
            description: 'Assign number keys to links within selected comment'
        },
        commentsLinkNewTab: {
            type: 'boolean',
            value: true,
            description: 'Open number key links in a new tab'
        },
        clickFocus: {
            type: 'boolean',
            value: true,
            description: 'Move keyboard focus to a link or comment when clicked with the mouse'
        },
        onHideMoveDown: {
            type: 'boolean',
            value: true,
            description: 'After hiding a link, automatically select the next link'
        },
        toggleHelp: {
            type: 'keycode',
            value: [191,false,false,true], // ? (note the true in the shift slot)
            description: 'Show help'
        },
        toggleCmdLine: {
            type: 'keycode',
            value: [190,false,false,false], // .
            description: 'Show/hide commandline box'
        },
        hide: {
            type: 'keycode',
            value: [72,false,false,false], // h
            description: 'Hide link'
        },
        moveUp: {
            type: 'keycode',
            value: [75,false,false,false], // k
            description: 'Move up (previous link or comment)'
        },
        moveDown: {
            type: 'keycode',
            value: [74,false,false,false], // j
            description: 'Move down (next link or comment)'
        },
        moveTop: {
            type: 'keycode',
            value: [75,false,false,true], // shift-k
            description: 'Move to top of list (on link pages)'
        },
        moveBottom: {
            type: 'keycode',
            value: [74,false,false,true], // shift-j
            description: 'Move to bottom of list (on link pages)'
        },
        moveUpSibling: {
            type: 'keycode',
            value: [75,false,false,true], // shift-k
            description: 'Move to previous sibling (in comments) - skips to previous sibling at the same depth.'
        },
        moveDownSibling: {
            type: 'keycode',
            value: [74,false,false,true], // shift-j
            description: 'Move to next sibling (in comments) - skips to next sibling at the same depth.'
        },
        moveToParent: {
            type: 'keycode',
            value: [80,false,false,false], // p
            description: 'Move to parent (in comments).'
        },
        followLink: {
            type: 'keycode',
            value: [13,false,false,false], // enter
            description: 'Follow link (hold shift to open it in a new tab) (link pages only)'
        },
        followLinkNewTab: {
            type: 'keycode',
            value: [13,false,false,true], // shift-enter
            description: 'Follow link in new tab (link pages only)'
        },
        toggleExpando: {
            type: 'keycode',
            value: [88,false,false,false], // x
            description: 'Toggle expando (image/text/video) (link pages only)'
        },
        toggleViewImages: {
            type: 'keycode',
            value: [88,false,false,true], // shift-x
            description: 'Toggle "view images" button'
        },
        toggleChildren: {
            type: 'keycode',
            value: [13,false,false,false], // enter
            description: 'Expand/collapse comments (comments pages only)'
        },
        followComments: {
            type: 'keycode',
            value: [67,false,false,false], // c
            description: 'View comments for link (shift opens them in a new tab)'
        },
        followCommentsNewTab: {
            type: 'keycode',
            value: [67,false,false,true], // shift-c
            description: 'View comments for link in a new tab'
        },
        followLinkAndCommentsNewTab: {
            type: 'keycode',
            value: [76,false,false,false], // l
            description: 'View link and comments in new tabs'
        },
        followLinkAndCommentsNewTabBG: {
            type: 'keycode',
            value: [76,false,false,true], // shift-l
            description: 'View link and comments in new background tabs'
        },
        upVote: {
            type: 'keycode',
            value: [65,false,false,false], // a
            description: 'Upvote selected link or comment'
        },
        downVote: {
            type: 'keycode',
            value: [90,false,false,false], // z
            description: 'Downvote selected link or comment'
        },
        save: {
            type: 'keycode',
            value: [83,false,false,false], // s
            description: 'Save the current link'
        },
        reply: {
            type: 'keycode',
            value: [82,false,false,false], // r
            description: 'Reply to current comment (comment pages only)'
        },
        followSubreddit: {
            type: 'keycode',
            value: [82,false,false,false], // r
            description: 'Go to subreddit of selected link (link pages only)'
        },
        inbox: {
            type: 'keycode',
            value: [73,false,false,false], // i
            description: 'Go to inbox'
        },
        frontPage: {
            type: 'keycode',
            value: [70,false,false,false], // f
            description: 'Go to front page'
        },
        subredditFrontPage: {
            type: 'keycode',
            value: [70,false,false,true], // shift-f
            description: 'Go to front page'
        },
        nextPage: {
            type: 'keycode',
            value: [78,false,false,false], // n
            description: 'Go to next page (link list pages only)'
        },
        prevPage: {
            type: 'keycode',
            value: [80,false,false,false], // p
            description: 'Go to prev page (link list pages only)'
        },
        link1: {
            type: 'keycode',
            value: [49,false,false,false], // 1
            description: 'Open first link within comment.',
            noconfig: true
        },
        link2: {
            type: 'keycode',
            value: [50,false,false,false], // 2
            description: 'Open link #2 within comment.',
            noconfig: true
        },
        link3: {
            type: 'keycode',
            value: [51,false,false,false], // 3
            description: 'Open link #3 within comment.',
            noconfig: true
        },
        link4: {
            type: 'keycode',
            value: [52,false,false,false], // 4
            description: 'Open link #4 within comment.',
            noconfig: true
        },
        link5: {
            type: 'keycode',
            value: [53,false,false,false], // 5
            description: 'Open link #5 within comment.',
            noconfig: true
        },
        link6: {
            type: 'keycode',
            value: [54,false,false,false], // 6
            description: 'Open link #6 within comment.',
            noconfig: true
        },
        link7: {
            type: 'keycode',
            value: [55,false,false,false], // 7
            description: 'Open link #7 within comment.',
            noconfig: true
        },
        link8: {
            type: 'keycode',
            value: [56,false,false,false], // 8
            description: 'Open link #8 within comment.',
            noconfig: true
        },
        link9: {
            type: 'keycode',
            value: [57,false,false,false], // 9
            description: 'Open link #9 within comment.',
            noconfig: true
        },
        link10: {
            type: 'keycode',
            value: [48,false,false,false], // 0
            description: 'Open link #10 within comment.',
            noconfig: true
        }
    },
    description: 'Keyboard navigation for reddit!',
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
            // do stuff now!
            // this is where your code goes...
            // get rid of antequated option we've removed
            if (this.options.autoSelectOnScroll.value) {
                window.addEventListener('scroll', modules.keyboardNav.handleScroll, false);
            }
            if (typeof(this.options.scrollTop) != 'undefined') {
                if (this.options.scrollTop.value) this.options.scrollStyle.value === 'top';
                delete this.options.scrollTop;
                RESStorage.setItem('RESoptions.keyboardNav', JSON.stringify(modules.keyboardNav.options));
            }
            if (typeof(this.options.focusBorder) === 'undefined') {
                focusBorder = '1px dashed #888888';
            } else {
                focusBorder = this.options.focusBorder.value;
            }
            if (typeof(this.options.focusBGColor) === 'undefined') {
                focusBGColor = '#F0F3FC';
            } else {
                focusBGColor = this.options.focusBGColor.value;
            }
            if (!(this.options.focusBGColorNight.value)) {
                focusBGColorNight = '#666';
            } else {
                focusBGColorNight = this.options.focusBGColorNight.value;
            }
            if (!(this.options.focusFGColorNight.value)) {
                focusFGColorNight = '#DDD';
            } else {
                focusFGColorNight = this.options.focusFGColorNight.value;
            }

            var borderType = 'outline';
            if (typeof opera != 'undefined') borderType = 'border';
            RESUtils.addCSS(' \
                .keyHighlight { '+borderType+': '+focusBorder+'; background-color: '+focusBGColor+'; } \
                .res-nightmode .keyHighlight, .res-nightmode .keyHighlight .usertext-body, .res-nightmode .keyHighlight .usertext-body .md, .res-nightmode .keyHighlight .usertext-body .md p, .res-nightmode .keyHighlight .noncollapsed, .res-nightmode .keyHighlight .noncollapsed .md, .res-nightmode .keyHighlight .noncollapsed .md p { background-color: '+focusBGColorNight+' !important; color: '+focusFGColorNight+' !important;} \
                .res-nightmode .keyHighlight a.title:first-of-type {color: ' + focusFGColorNight + ' !important; } \
                #keyHelp { display: none; position: fixed; height: 90%; overflow-y: auto; right: 20px; top: 20px; z-index: 1000; border: 2px solid #AAAAAA; border-radius: 5px 5px 5px 5px; -moz-border-radius: 5px 5px 5px 5px; -webkit-border-radius: 5px 5px 5px 5px; width: 300px; padding: 5px; background-color: #ffffff; } \
                #keyHelp th { font-weight: bold; padding: 2px; border-bottom: 1px dashed #dddddd; } \
                #keyHelp td { padding: 2px; border-bottom: 1px dashed #dddddd; } \
                #keyHelp td:first-child { width: 70px; } \
                #keyCommandLineWidget { font-size: 14px; display: none; position: fixed; top: 200px; left: 50%; margin-left: -275px; z-index: 9999; width: 550px; border: 3px solid #555555; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; padding: 10px; background-color: #333333; color: #CCCCCC; opacity: 0.95; } \
                #keyCommandInput { width: 240px; background-color: #999999; margin-right: 10px; } \
                #keyCommandInputTip { margin-top: 5px; color: #99FF99; } \
                #keyCommandInputTip ul { font-size: 11px; list-style-type: disc; }  \
                #keyCommandInputTip li { margin-left: 15px; }  \
                #keyCommandInputError { margin-top: 5px; color: red; font-weight: bold; } \
            ');
            this.drawHelp();
            this.attachCommandLineWidget();
            window.addEventListener('keydown', function(e) {
                // console.log(e.keyCode);
                modules.keyboardNav.handleKeyPress(e);
            }, true);
            this.scanPageForKeyboardLinks();
            // listen for new DOM nodes so that modules like autopager, never ending reddit, "load more comments" etc still get keyboard nav.
            document.body.addEventListener('DOMNodeInserted', function(event) {
                if ((event.target.tagName === 'DIV') && ((event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1) || (hasClass(event.target,'child')) || (hasClass(event.target,'thing')))) {
                    modules.keyboardNav.scanPageForKeyboardLinks(true);
                }
            }, true);
        }
    },
    handleScroll: function(e) {
        if ((! modules.keyboardNav.recentKeyPress) && (! RESUtils.elementInViewport(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]))) {
            for (var i=0, len=modules.keyboardNav.keyboardLinks.length; i<len; i++) {
                if (RESUtils.elementInViewport(modules.keyboardNav.keyboardLinks[i])) {
                    modules.keyboardNav.keyUnfocus(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]);
                    modules.keyboardNav.activeIndex = i;
                    modules.keyboardNav.keyFocus(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]);
                    break;
                }
            }
        }
    },
    attachCommandLineWidget: function() {
        this.commandLineWidget = createElementWithID('div','keyCommandLineWidget');
        this.commandLineInput = createElementWithID('input','keyCommandInput');
        this.commandLineInput.setAttribute('type','text');
        this.commandLineInput.addEventListener('blur', function(e) {
            modules.keyboardNav.toggleCmdLine(false);
        }, false);
        this.commandLineInput.addEventListener('keyup', function(e) {
            if (e.keyCode === 27) {
                // close prompt.
                modules.keyboardNav.toggleCmdLine(false);
            } else {
                // auto suggest?
                modules.keyboardNav.cmdLineHelper(e.target.value);
            }
        }, false);
        this.commandLineInputTip = createElementWithID('div','keyCommandInputTip');
        this.commandLineInputError = createElementWithID('div','keyCommandInputError');

        /*
        this.commandLineSubmit = createElementWithID('input','keyCommandInput');
        this.commandLineSubmit.setAttribute('type','submit');
        this.commandLineSubmit.setAttribute('value','go');
        */
        this.commandLineForm = createElementWithID('form','keyCommandForm');
        this.commandLineForm.appendChild(this.commandLineInput);
        // this.commandLineForm.appendChild(this.commandLineSubmit);
        var txt = document.createTextNode('type a command, ? for help, esc to close');
        this.commandLineForm.appendChild(txt);
        this.commandLineForm.appendChild(this.commandLineInputTip);
        this.commandLineForm.appendChild(this.commandLineInputError);
        this.commandLineForm.addEventListener('submit', modules.keyboardNav.cmdLineSubmit, false);
        this.commandLineWidget.appendChild(this.commandLineForm);
        document.body.appendChild(this.commandLineWidget);
        
    },
    cmdLineHelper: function (val) {
        var splitWords = val.split(' ');
        var command = splitWords[0];
        splitWords.splice(0,1);
        var val = splitWords.join(' ');
        if (command.slice(0,2) === 'r/') {
            // get the subreddit name they've typed so far (anything after r/)...
            var srString = command.slice(2);
            this.cmdLineShowTip('navigate to subreddit: ' + srString);
        } else if (command.slice(0,1) === '/') {
            // get the subreddit name they've typed so far (anything after r/)...
            var srString = command.slice(1);
            this.cmdLineShowTip('sort by ([n]ew, [t]op, [h]ot, [c]ontroversial): ' + srString);
        } else if (command === 'tag') {
            if ((typeof(this.cmdLineTagUsername) === 'undefined') || (this.cmdLineTagUsername === '')) {
                var searchArea = modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex];
                var authorLink = searchArea.querySelector('a.author');
                this.cmdLineTagUsername = authorLink.innerHTML;
            }
            var str = 'tag user ' + this.cmdLineTagUsername;
            if (val) {
                str += ' as: ' + val;
            }
            this.cmdLineShowTip(str);
        } else if (command === 'user') {
            var str = 'go to profile';
            if (val) {
                str += ' for: ' + val;
            }
            this.cmdLineShowTip(str);
        } else if (command === 'sw') {
            this.cmdLineShowTip('Switch users to: ' + val);
        } else if (command === 'm') {
            this.cmdLineShowTip('View messages.');
        } else if (command === 'mm') {
            this.cmdLineShowTip('View moderator mail.');
        } else if (command === 'ls') {
            this.cmdLineShowTip('Toggle lightSwitch.');
        } else if (command.slice(0,1) === '?') {
            var str = 'Currently supported commands:';
            str += '<ul>';
            str += '<li>r/[subreddit] - navigates to subreddit</li>'
            str += '<li>/n, /t, /h or /c - goes to new, top, hot or controversial sort of current subreddit</li>'
            str += '<li>[number] - navigates to the link with that number (comments pages) or rank (link pages)</li>'
            str += '<li>tag [text] - tags author of currently selected link/comment as text</li>'
            str += '<li>sw [username] - switch users to [username]</li>'
            str += '<li>user [username] - view profile for [username]</li>'
            str += '<li>m - go to inbox</li>'
            str += '<li>mm - go to moderator mail</li>'
            str += '<li>ls - toggle lightSwitch</li>'
            str += '<li>RESStorage [get|set|update|remove] [key] [value] - For debug use only, you shouldn\'t mess with this unless you know what you\'re doing.</li>'
            str += '</ul>';
            this.cmdLineShowTip(str);
        } else {
            this.cmdLineShowTip('');
        }
    },
    cmdLineShowTip: function(str) {
        this.commandLineInputTip.innerHTML = str;
    },
    cmdLineShowError: function(str) {
        this.commandLineInputError.innerHTML = str;
    },
    toggleCmdLine: function(force) {
        var open = (((force == null) || (force === true)) && (this.commandLineWidget.style.display != 'block'))
        delete this.cmdLineTagUsername;
        if (open) {
            this.cmdLineShowError('');
            this.commandLineWidget.style.display = 'block';
            setTimeout(function() {
                modules.keyboardNav.commandLineInput.focus();
            }, 20);
            this.commandLineInput.value = '';
        } else {
            modules.keyboardNav.commandLineInput.blur();
            this.commandLineWidget.style.display = 'none';
        }
    },
    cmdLineSubmit: function(e) {
        e.preventDefault();
        modules.keyboardNav.commandLineInputError.innerHTML = '';
        var theInput = modules.keyboardNav.commandLineInput.value;
        // see what kind of input it is:
        if (theInput.indexOf('r/') != -1) {
            // subreddit? (r/subreddit or /r/subreddit)
            theInput = theInput.replace('/r/','').replace('r/','');
            location.href = '/r/'+theInput;        
        } else if (theInput.indexOf('/') === 0) {
            // sort...
            theInput = theInput.slice(1);
            switch (theInput) {
                case 'n':
                    theInput = 'new';
                    break;
                case 't':
                    theInput = 'top';
                    break;
                case 'h':
                    theInput = 'hot';
                    break;
                case 'c':
                    theInput = 'controversial';
                    break;
            }
            validSorts = ['new','top','hot','controversial'];
            if (RESUtils.currentUserProfile()) {
                location.href = '/user/'+RESUtils.currentUserProfile()+'?sort='+theInput;
            } else if (validSorts.indexOf(theInput) != -1) {
                location.href = '/r/'+RESUtils.currentSubreddit()+'/'+theInput;
            } else {
                modules.keyboardNav.cmdLineShowError('invalid sort command - must be [n]ew, [t]op, [h]ot or [c]ontroversial');
                return false;
            }
        } else if (!(isNaN(parseInt(theInput, 10)))) {
            if (RESUtils.pageType() === 'comments') {
                // comment link number? (integer)
                modules.keyboardNav.commentLink(parseInt(theInput, 10)-1);
            } else if (RESUtils.pageType() === 'linklist') {
                modules.keyboardNav.keyUnfocus(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]);
                modules.keyboardNav.activeIndex = parseInt(theInput, 10) - 1;
                modules.keyboardNav.keyFocus(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]);
                modules.keyboardNav.followLink();
            }
        } else {
            var splitWords = theInput.split(' ');
            var command = splitWords[0];
            splitWords.splice(0,1);
            var val = splitWords.join(' ');
            switch (command) {
                case 'tag':
                    var searchArea = modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex];
                    var tagLink = searchArea.querySelector('a.userTagLink');
                    if (tagLink) {
                        RESUtils.click(tagLink);
                        setTimeout(function() {
                            if (val != '') {
                                document.getElementById('userTaggerTag').value = val;
                            }
                        }, 20);
                    }
                    break;
                case 'sw':
                    // switch accounts (username is required)
                    if (val.length <= 1) {
                        modules.keyboardNav.cmdLineShowError('No username specified.');
                        return false;
                    } else {
                        // first make sure the account exists...
                        var accounts = modules.accountSwitcher.options.accounts.value;
                        var found = false;
                        for (var i=0, len=accounts.length; i<len; i++) {
                            thisPair = accounts[i];
                            if (thisPair[0] === val) {
                                found = true;
                            }
                        }
                        if (found) {
                            modules.accountSwitcher.switchTo(val);
                        } else {
                            modules.keyboardNav.cmdLineShowError('No such username in accountSwitcher.');
                            return false;
                        }
                    }
                    break;
                case 'user':
                    // view profile for username (username is required)
                    if (val.length <= 1) {
                        modules.keyboardNav.cmdLineShowError('No username specified.');
                        return false;
                    } else {
                        location.href = '/user/' + val;
                    }
                    break;
                case 'userinfo':
                    // view JSON data for username (username is required)
                    if (val.length <= 1) {
                        modules.keyboardNav.cmdLineShowError('No username specified.');
                        return false;
                    } else {
                        GM_xmlhttpRequest({
                            method:    "GET",
                            url:    location.protocol + "//www.reddit.com/user/" + val + "/about.json",
                            onload:    function(response) {
                                RESAlert(response.responseText);
                            }
                        });
                    }
                    break;
                case 'userbadge':
                    // get CSS code for a badge for username (username is required)
                    if (val.length <= 1) {
                        modules.keyboardNav.cmdLineShowError('No username specified.');
                        return false;
                    } else {
                        GM_xmlhttpRequest({
                            method:    "GET",
                            url:    location.protocol + "//www.reddit.com/user/" + val + "/about.json",
                            onload:    function(response) {
                                var thisResponse = JSON.parse(response.responseText);
                                var css = ', .id-t2_'+thisResponse.data.id+':before';
                                RESAlert(css);
                            }
                        });
                    }
                    break;
                case 'm':
                    // go to inbox
                    location.href = '/message/inbox/';
                    break;
                case 'mm':
                    // go to mod mail
                    location.href = '/message/moderator/';
                    break;
                case 'ls':
                    // toggle lightSwitch
                    RESUtils.click(modules.styleTweaks.lightSwitch);
                    break;
                case 'notification':
                    // test notification
                    RESUtils.notification(val, 4000);
                    break;
                case 'RESStorage':
                    // get or set RESStorage data
                    var splitWords = val.split(' ');
                    if (splitWords.length < 2) {
                        modules.keyboardNav.cmdLineShowError('You must specify "get [key]", "update [key]" or "set [key] [value]"');
                    } else {
                        var command = splitWords[0];
                        var key = splitWords[1];
                        if (splitWords.length > 2) {
                            splitWords.splice(0,2);
                            var value = splitWords.join(' ');
                        }
                        // console.log(command);
                        if (command === 'get') {
                            RESAlert('Value of RESStorage['+key+']: <br><br><textarea rows="5" cols="50">' + RESStorage.getItem(key) + '</textarea>');
                        } else if (command === 'update') {
                            var now = new Date().getTime();
                            RESAlert('Value of RESStorage['+key+']: <br><br><textarea id="RESStorageUpdate'+now+'" rows="5" cols="50">' + RESStorage.getItem(key) + '</textarea>', function() {
                                var textArea = document.getElementById('RESStorageUpdate'+now);
                                if (textArea) {
                                    var value = textArea.value;
                                    RESStorage.setItem(key, value);
                                }
                            });
                        } else if (command === 'remove') {
                            RESStorage.removeItem(key);
                            RESAlert('RESStorage['+key+'] deleted');
                        } else if (command === 'set') {
                            RESStorage.setItem(key, value);
                            RESAlert('RESStorage['+key+'] set to:<br><br><textarea rows="5" cols="50">' + value + '</textarea>');
                        } else {
                            modules.keyboardNav.cmdLineShowError('You must specify either "get [key]" or "set [key] [value]"');
                        }
                    }
                    break;
                case '?':
                    // user is already looking at help... do nothing.
                    return false;
                    break;
                default:
                    modules.keyboardNav.cmdLineShowError('unknown command - type ? for help');
                    return false;
                    break;
            }
        }
        // hide the commandline tool...
        modules.keyboardNav.toggleCmdLine(false);
    },
    scanPageForKeyboardLinks: function(isNew) {
        if (typeof isNew === 'undefined') {
            isNew = false;
        }
        // check if we're on a link listing (regular page, subreddit page, etc) or comments listing...
        this.pageType = RESUtils.pageType();
        switch(this.pageType) {
            case 'linklist':
            case 'profile':
                // get all links into an array...
                var siteTable = document.querySelector('#siteTable');
                var stMultiCheck = document.querySelectorAll('#siteTable');
                // stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
                if (stMultiCheck.length === 2) {
                    siteTable = stMultiCheck[1];
                }
                if (siteTable) {
                    this.keyboardLinks = document.body.querySelectorAll('div.linklisting .entry');
                    if (!isNew) {
                        if (RESStorage.getItem('RESmodules.keyboardNavLastIndex.'+location.href) > 0) {
                            this.activeIndex = RESStorage.getItem('RESmodules.keyboardNavLastIndex.'+location.href);
                        } else {
                            this.activeIndex = 0;
                        }
                        if (RESStorage.getItem('RESmodules.keyboardNavLastIndex.'+location.href) >= this.keyboardLinks.length) {
                            this.activeIndex = 0;
                        }
                    }
                }
                break;
            case 'comments':
                // get all links into an array...
                this.keyboardLinks = document.body.querySelectorAll('#siteTable .entry, div.content > div.commentarea .entry');
                if (!(isNew)) {
                    this.activeIndex = 0;
                }
                break;
            case 'inbox':
                var siteTable = document.querySelector('#siteTable');
                if (siteTable) {
                    this.keyboardLinks = siteTable.querySelectorAll('.entry');
                    this.activeIndex = 0;
                }
                break;
        }
        // wire up keyboard links for mouse clicky selecty goodness...
        if ((typeof(this.keyboardLinks) != 'undefined') && (this.options.clickFocus.value)) {
            for (var i=0, len=this.keyboardLinks.length;i<len;i++) {
                this.keyboardLinks[i].setAttribute('keyIndex', i);
                this.keyboardLinks[i].addEventListener('click', function(e) {
                    var thisIndex = parseInt(this.getAttribute('keyIndex'));
                    if (modules.keyboardNav.activeIndex != thisIndex) {
                        modules.keyboardNav.keyUnfocus(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]);
                        modules.keyboardNav.activeIndex = thisIndex;
                        modules.keyboardNav.keyFocus(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]);
                    }
                }, true);
            }
            this.keyFocus(this.keyboardLinks[this.activeIndex]);
        }
    },
    recentKey: function() {
        modules.keyboardNav.recentKeyPress = true;
        clearTimeout(modules.keyboardNav.recentKey);
        modules.keyboardNav.recentKeyTimer = setTimeout(function() {
            modules.keyboardNav.recentKeyPress = false;
        }, 1000);
    },
    keyFocus: function(obj) {
        if ((typeof obj != 'undefined') && (hasClass(obj, 'keyHighlight'))) {
            return false;
        } else if (typeof obj != 'undefined') {
            addClass(obj, 'keyHighlight');
            if ((this.pageType === 'linklist') || (this.pageType === 'profile')) RESStorage.setItem('RESmodules.keyboardNavLastIndex.'+location.href, this.activeIndex);
            if ((this.pageType === 'comments') && (this.options.commentsLinkNumbers.value)) {
                var links = obj.querySelectorAll('div.md a');
                var annotationCount = 0;
                for (var i=0, len=links.length; i<len; i++) {
                    if ((!(hasClass(links[i],'madeVisible'))) && (!(hasClass(links[i],'toggleImage')) && (!(hasClass(links[i],'noKeyNav'))))) {
                        var annotation = document.createElement('span');
                        annotationCount++;
                        annotation.innerHTML = '['+annotationCount+'] ';
                        addClass(annotation,'keyNavAnnotation');
                        if (!(hasClass(links[i],'hasListener'))) {
                            addClass(links[i],'hasListener');
                            links[i].addEventListener('click',function(e) {
                                e.preventDefault();
                                var button = e.button;
                                if ((modules.keyboardNav.options.commentsLinkNewTab.value) || e.ctrlKey) {
                                    button = 1;
                                }
                                if (button === 1) {
                                    if (typeof chrome != 'undefined') {
                                        thisJSON = {
                                            requestType: 'keyboardNav',
                                            linkURL: this.getAttribute('href'),
                                            button: button
                                        }
                                        chrome.extension.sendRequest(thisJSON, function(response) {
                                            // send message to background.html to open new tabs...
                                            return true;
                                        });
                                    } else if (typeof safari != 'undefined') {
                                        thisJSON = {
                                            requestType: 'keyboardNav',
                                            linkURL: this.getAttribute('href'),
                                            button: button
                                        }
                                        safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
                                    } else if (typeof opera != 'undefined') {
                                        thisJSON = {
                                            requestType: 'keyboardNav',
                                            linkURL: this.getAttribute('href'),
                                            button: button
                                        }
                                        opera.extension.postMessage(JSON.stringify(thisJSON));
                                    } else if (typeof(self.on) === 'function') {
                                        thisJSON = {
                                            requestType: 'keyboardNav',
                                            linkURL: this.getAttribute('href'),
                                            button: button
                                        }
                                        self.postMessage(thisJSON);
                                    } else {
                                        window.open(this.getAttribute('href'));
                                    }
                                } else {
                                    location.href = this.getAttribute('href');
                                }
                            }, true);
                        }
                        links[i].parentNode.insertBefore(annotation, links[i]);
                    }
                }
            }
        }
    },
    keyUnfocus: function(obj) {
        removeClass(obj, 'keyHighlight');
        if (this.pageType === 'comments') {
            var annotations = obj.querySelectorAll('div.md .keyNavAnnotation');
            for (var i=0, len=annotations.length; i<len; i++) {
                annotations[i].parentNode.removeChild(annotations[i]);
            }
        }
    },
    drawHelp: function() {
        var thisHelp = createElementWithID('div','keyHelp');
        var helpTable = document.createElement('table');
        thisHelp.appendChild(helpTable);
        var helpTableHeader = document.createElement('thead');
        var helpTableHeaderRow = document.createElement('tr');
        var helpTableHeaderKey = document.createElement('th');
        helpTableHeaderKey.innerHTML = 'Key';
        helpTableHeaderRow.appendChild(helpTableHeaderKey);
        var helpTableHeaderFunction = document.createElement('th');
        helpTableHeaderFunction.innerHTML = 'Function';
        helpTableHeaderRow.appendChild(helpTableHeaderFunction);
        helpTableHeader.appendChild(helpTableHeaderRow);
        helpTable.appendChild(helpTableHeader);
        helpTableBody = document.createElement('tbody');
        for (i in this.options) {
            var isLink = new RegExp(/^link[\d]+$/i);
            if ((this.options[i].type === 'keycode') && (!isLink.test(i))) {
                var thisRow = document.createElement('tr');
                var thisRowKey = document.createElement('td');
                var keyCodeArray = this.options[i].value;
                if (typeof keyCodeArray === 'string') {
                    keyCodeAarray = parseInt(keyCodeArray, 10);
                }
                if (typeof keyCodeArray === 'number') {
                    keyCodeArray = [keyCodeArray, false, false, false, false];
                }
                thisRowKey.innerHTML = RESUtils.niceKeyCode(keyCodeArray);
                thisRow.appendChild(thisRowKey);
                var thisRowDesc = document.createElement('td');
                thisRowDesc.innerHTML = this.options[i].description;
                thisRow.appendChild(thisRowDesc);
                helpTableBody.appendChild(thisRow);
            }
        }
        helpTable.appendChild(helpTableBody);
        document.body.appendChild(thisHelp);
    },
    handleKeyPress: function(e) {
        if ((document.activeElement.tagName === 'BODY') && (!(konami.almostThere))) {
            // comments page, or link list?
            keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
            switch(this.pageType) {
                case 'linklist':
                case 'profile':
                    switch(true) {
                        case keyArrayCompare(keyArray, this.options.moveUp.value):
                            this.moveUp();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveDown.value):
                            this.moveDown();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveTop.value):
                            this.moveTop();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveBottom.value):
                            this.moveBottom();
                            break;
                        case keyArrayCompare(keyArray, this.options.followLink.value):
                            this.followLink();
                            break;
                        case keyArrayCompare(keyArray, this.options.followLinkNewTab.value):
                            e.preventDefault();
                            this.followLink(true);
                            break;
                        case keyArrayCompare(keyArray, this.options.followComments.value):
                            this.followComments();
                            break;
                        case keyArrayCompare(keyArray, this.options.followCommentsNewTab.value):
                            e.preventDefault();
                            this.followComments(true);
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleExpando.value):
                            this.toggleExpando();
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleViewImages.value):
                            this.toggleViewImages();
                            break;
                        case keyArrayCompare(keyArray, this.options.followLinkAndCommentsNewTab.value):
                            e.preventDefault();
                            this.followLinkAndComments();
                            break;
                        case keyArrayCompare(keyArray, this.options.followLinkAndCommentsNewTabBG.value):
                            e.preventDefault();
                            this.followLinkAndComments(true);
                            break;
                        case keyArrayCompare(keyArray, this.options.upVote.value):
                            this.upVote();
                            break;
                        case keyArrayCompare(keyArray, this.options.downVote.value):
                            this.downVote();
                            break;
                        case keyArrayCompare(keyArray, this.options.save.value):
                            this.saveLink();
                            break;
                        case keyArrayCompare(keyArray, this.options.inbox.value):
                            e.preventDefault();
                            this.inbox();
                            break;
                        case keyArrayCompare(keyArray, this.options.frontPage.value):
                            e.preventDefault();
                            this.frontPage();
                            break;
                        case keyArrayCompare(keyArray, this.options.nextPage.value):
                            e.preventDefault();
                            this.nextPage();
                            break;
                        case keyArrayCompare(keyArray, this.options.prevPage.value):
                            e.preventDefault();
                            this.prevPage();
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleHelp.value):
                            this.toggleHelp();
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleCmdLine.value):
                            this.toggleCmdLine();
                            break;
                        case keyArrayCompare(keyArray, this.options.hide.value):
                            this.hide();
                            break;
                        case keyArrayCompare(keyArray, this.options.followSubreddit.value):
                            this.followSubreddit();
                            break;
                        default:
                            // do nothing. unrecognized key.
                            break;
                    }
                    break;
                case 'comments':
                    switch(true) {
                        case keyArrayCompare(keyArray, this.options.toggleHelp.value):
                            this.toggleHelp();
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleCmdLine.value):
                            this.toggleCmdLine();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveUp.value):
                            this.moveUp();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveDown.value):
                            this.moveDown();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveUpSibling.value):
                            this.moveUpSibling();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveDownSibling.value):
                            this.moveDownSibling();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveToParent.value):
                            this.moveToParent();
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleChildren.value):
                            this.toggleChildren();
                            break;
                        case keyArrayCompare(keyArray, this.options.followLinkNewTab.value):
                            // only execute if the link is selected on a comments page...
                            if (this.activeIndex === 0) {
                                e.preventDefault();
                                this.followLink(true);
                            }
                            break;
                        case keyArrayCompare(keyArray, this.options.save.value):
                            if (this.activeIndex === 0) {
                                this.saveLink();
                            } else {
                                this.saveComment();
                            }
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleExpando.value):
                            this.toggleAllExpandos();
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleViewImages.value):
                            this.toggleViewImages();
                            break;
                        case keyArrayCompare(keyArray, this.options.upVote.value):
                            this.upVote();
                            break;
                        case keyArrayCompare(keyArray, this.options.downVote.value):
                            this.downVote();
                            break;
                        case keyArrayCompare(keyArray, this.options.reply.value):
                            e.preventDefault();
                            this.reply();
                            break;
                        case keyArrayCompare(keyArray, this.options.inbox.value):
                            e.preventDefault();
                            this.inbox();
                            break;
                        case keyArrayCompare(keyArray, this.options.frontPage.value):
                            e.preventDefault();
                            this.frontPage();
                            break;
                        case keyArrayCompare(keyArray, this.options.subredditFrontPage.value):
                            e.preventDefault();
                            this.frontPage(true);
                            break;
                        case keyArrayCompare(keyArray, this.options.link1.value):
                            e.preventDefault();
                            this.commentLink(0);
                            break;
                        case keyArrayCompare(keyArray, this.options.link2.value):
                            e.preventDefault();
                            this.commentLink(1);
                            break;
                        case keyArrayCompare(keyArray, this.options.link3.value):
                            e.preventDefault();
                            this.commentLink(2);
                            break;
                        case keyArrayCompare(keyArray, this.options.link4.value):
                            e.preventDefault();
                            this.commentLink(3);
                            break;
                        case keyArrayCompare(keyArray, this.options.link5.value):
                            e.preventDefault();
                            this.commentLink(4);
                            break;
                        case keyArrayCompare(keyArray, this.options.link6.value):
                            e.preventDefault();
                            this.commentLink(5);
                            break;
                        case keyArrayCompare(keyArray, this.options.link7.value):
                            e.preventDefault();
                            this.commentLink(6);
                            break;
                        case keyArrayCompare(keyArray, this.options.link8.value):
                            e.preventDefault();
                            this.commentLink(7);
                            break;
                        case keyArrayCompare(keyArray, this.options.link9.value):
                            e.preventDefault();
                            this.commentLink(8);
                            break;
                        case keyArrayCompare(keyArray, this.options.link10.value):
                            e.preventDefault();
                            this.commentLink(9);
                            break;
                        default:
                            // do nothing. unrecognized key.
                            break;
                    }
                    break;
                case 'inbox':
                    switch(true) {
                        case keyArrayCompare(keyArray, this.options.toggleHelp.value):
                            this.toggleHelp();
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleCmdLine.value):
                            this.toggleCmdLine();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveUp.value):
                            this.moveUp();
                            break;
                        case keyArrayCompare(keyArray, this.options.moveDown.value):
                            this.moveDown();
                            break;
                        case keyArrayCompare(keyArray, this.options.toggleChildren.value):
                            this.toggleChildren();
                            break;
                        case keyArrayCompare(keyArray, this.options.upVote.value):
                            this.upVote();
                            break;
                        case keyArrayCompare(keyArray, this.options.downVote.value):
                            this.downVote();
                            break;
                        case keyArrayCompare(keyArray, this.options.reply.value):
                            e.preventDefault();
                            this.reply();
                            break;
                        case keyArrayCompare(keyArray, this.options.frontPage.value):
                            e.preventDefault();
                            this.frontPage();
                            break;
                        default:
                            // do nothing. unrecognized key.
                            break;
                    }
                    break;
            }
        } else {
            // console.log('ignored keypress');
        }
    },
    toggleHelp: function() {
        (document.getElementById('keyHelp').style.display === 'block') ? this.hideHelp() : this.showHelp();
    },
    showHelp: function() {
        // show help!
        RESUtils.fadeElementIn(document.getElementById('keyHelp'), 0.3);
    },
    hideHelp: function() {
        // show help!
        RESUtils.fadeElementOut(document.getElementById('keyHelp'), 0.3);
    },
    hide: function() {
        // find the hide link and click it...
        var hideLink = this.keyboardLinks[this.activeIndex].querySelector('form.hide-button > span > a');
        RESUtils.click(hideLink);
        // if ((this.options.onHideMoveDown.value) && (!modules.betteReddit.options.fixHideLink.value)) {
        if (this.options.onHideMoveDown.value) {
            this.moveDown();
        }
    },
    followSubreddit: function() {
        // find the subreddit link and click it...
        var srLink = this.keyboardLinks[this.activeIndex].querySelector('A.subreddit');
        if (srLink) {
            var thisHREF = srLink.getAttribute('href');
            location.href = thisHREF;
        }
    },
    moveUp: function() {
        if (this.activeIndex > 0) {
            this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
            this.activeIndex--;
            thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            // skip over hidden elements...
            while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex > 0)) {
                this.activeIndex--;
                thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            }
            this.keyFocus(this.keyboardLinks[this.activeIndex]);
            if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) || (this.options.scrollStyle.value === 'top')) {
                RESUtils.scrollTo(0,thisXY.y);
            }
            
            modules.keyboardNav.recentKey();
        }
    },
    moveDown: function() {
        if (this.activeIndex < this.keyboardLinks.length-1) {
            this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
            this.activeIndex++;
            thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            // skip over hidden elements...
            while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length-1)) {
                this.activeIndex++;
                thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            }
            this.keyFocus(this.keyboardLinks[this.activeIndex]);
            // console.log('xy: ' + RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]).toSource());
            /*
            if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) || (this.options.scrollTop.value)) {
                RESUtils.scrollTo(0,thisXY.y);
            }
            */
            if (this.options.scrollStyle.value === 'top') {
                RESUtils.scrollTo(0,thisXY.y);
            } else if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex])))) {
                var thisHeight = this.keyboardLinks[this.activeIndex].offsetHeight;
                if (this.options.scrollStyle.value === 'page') {
                    RESUtils.scrollTo(0,thisXY.y);
                } else {
                    RESUtils.scrollTo(0,thisXY.y - window.innerHeight + thisHeight + 5);
                }
            }
            modules.keyboardNav.recentKey();
        }
    },
    moveTop: function() {
            this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
            this.activeIndex = 0;
            this.keyFocus(this.keyboardLinks[this.activeIndex]);
            thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
                RESUtils.scrollTo(0,thisXY.y);
            }
            modules.keyboardNav.recentKey();
    },
    moveBottom: function() {
            this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
            this.activeIndex = this.keyboardLinks.length-1;
            this.keyFocus(this.keyboardLinks[this.activeIndex]);
            thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
                RESUtils.scrollTo(0,thisXY.y);
            }
            modules.keyboardNav.recentKey();
    },
    moveDownSibling: function() {
        if (this.activeIndex < this.keyboardLinks.length-1) {
            this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
            var thisParent = this.keyboardLinks[this.activeIndex].parentNode;
            var childCount = thisParent.querySelectorAll('.entry').length;
            this.activeIndex += childCount;
            // skip over hidden elements...
            thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length-1)) {
                this.activeIndex++;
                thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            }
            if ((this.pageType === 'linklist') || (this.pageType === 'profile')) RESStorage.setItem('RESmodules.keyboardNavLastIndex.'+location.href, this.activeIndex);
            this.keyFocus(this.keyboardLinks[this.activeIndex]);
            if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
                RESUtils.scrollTo(0,thisXY.y);
            }
        }
        modules.keyboardNav.recentKey();
    },
    moveUpSibling: function() {
        if (this.activeIndex < this.keyboardLinks.length-1) {
            this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
            var thisParent = this.keyboardLinks[this.activeIndex].parentNode;
            if (thisParent.previousSibling != null) {
                var childCount = thisParent.previousSibling.previousSibling.querySelectorAll('.entry').length;
            } else {
                var childCount = 1;
            }
            this.activeIndex -= childCount;
            // skip over hidden elements...
            thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length-1)) {
                this.activeIndex++;
                thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
            }
            if ((this.pageType === 'linklist') || (this.pageType === 'profile')) RESStorage.setItem('RESmodules.keyboardNavLastIndex.'+location.href, this.activeIndex);
            this.keyFocus(this.keyboardLinks[this.activeIndex]);
            if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
                RESUtils.scrollTo(0,thisXY.y);
            }
        }
        modules.keyboardNav.recentKey();
    },
    moveToParent: function() {
        if ((this.activeIndex < this.keyboardLinks.length-1) && (this.activeIndex > 1)) {
            var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
            // check if we're at the top parent, first... if the great grandparent has a class of content, do nothing.
            if (!hasClass(firstParent.parentNode.parentNode.parentNode,'content')) {
                if (firstParent != null) {
                    this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
                    var thisParent = firstParent.parentNode.parentNode.previousSibling;
                    var newKeyIndex = parseInt(thisParent.getAttribute('keyindex'));
                    this.activeIndex = newKeyIndex;
                    this.keyFocus(this.keyboardLinks[this.activeIndex]);
                    thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
                    if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
                        RESUtils.scrollTo(0,thisXY.y);
                    }
                }
            }
        }
        modules.keyboardNav.recentKey();
    },
    toggleChildren: function() {
        if (this.activeIndex === 0) {
            // Ahh, we're not in a comment, but in the main story... that key should follow the link.
            this.followLink();
        } else {
            // find out if this is a collapsed or uncollapsed view...
            var thisCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.collapsed');
            var thisNonCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.noncollapsed');
            if (thisCollapsed.style.display != 'none') {
                thisToggle = thisCollapsed.querySelector('a.expand');
            } else {
                // check if this is a "show more comments" box, or just contracted content...
                moreComments = thisNonCollapsed.querySelector('span.morecomments > a');
                if (moreComments) {
                    thisToggle = moreComments;
                } else {
                    thisToggle = thisNonCollapsed.querySelector('a.expand');
                }
            }
            RESUtils.click(thisToggle);
        }
    },
    toggleExpando: function() {
        var thisExpando = this.keyboardLinks[this.activeIndex].querySelector('.expando-button');
        if (thisExpando) {
            RESUtils.click(thisExpando);
            if (this.options.scrollOnExpando.value) {
                thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
                RESUtils.scrollTo(0,thisXY.y);
            }
        }
    },
    toggleViewImages: function() {
        var thisViewImages = document.body.querySelector('#viewImagesButton');
        if (thisViewImages) {
            RESUtils.click(thisViewImages);
        }
    },
    toggleAllExpandos: function() {
        var thisExpandos = this.keyboardLinks[this.activeIndex].querySelectorAll('.expando-button');
        if (thisExpandos) {
            for (var i=0,len=thisExpandos.length; i<len; i++) {
                RESUtils.click(thisExpandos[i]);
            }
        }
    },
    followLink: function(newWindow) {
        var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.title');
        var thisHREF = thisA.getAttribute('href');
        // console.log(thisA);
        if (newWindow) {
            if (typeof chrome != 'undefined') {
                thisJSON = {
                    requestType: 'keyboardNav',
                    linkURL: thisHREF
                }
                chrome.extension.sendRequest(thisJSON, function(response) {
                    // send message to background.html to open new tabs...
                    return true;
                });
            } else if (typeof safari != 'undefined') {
                thisJSON = {
                    requestType: 'keyboardNav',
                    linkURL: thisHREF
                }
                safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
            } else if (typeof opera != 'undefined') {
                thisJSON = {
                    requestType: 'keyboardNav',
                    linkURL: thisHREF
                }
                opera.extension.postMessage(JSON.stringify(thisJSON));
            } else if (typeof(self.on) === 'function') {
                thisJSON = {
                    requestType: 'keyboardNav',
                    linkURL: thisHREF
                }
                self.postMessage(thisJSON);
            } else {
                window.open(thisHREF);
            }
        } else {
            location.href = thisHREF;
        }
    },
    followComments: function(newWindow) {
        var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.comments');
        var thisHREF = thisA.getAttribute('href');
        if (newWindow) {
            if (typeof chrome != 'undefined') {
                thisJSON = {
                    requestType: 'keyboardNav',
                    linkURL: thisHREF
                }
                chrome.extension.sendRequest(thisJSON, function(response) {
                    // send message to background.html to open new tabs...
                    return true;
                });
            } else if (typeof safari != 'undefined') {
                thisJSON = {
                    requestType: 'keyboardNav',
                    linkURL: thisHREF
                }
                safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
            } else if (typeof opera != 'undefined') {
                thisJSON = {
                    requestType: 'keyboardNav',
                    linkURL: thisHREF
                }
                opera.extension.postMessage(JSON.stringify(thisJSON));
            } else {
                window.open(thisHREF);
            }
        } else {
            location.href = thisHREF;
        }
    },
    followLinkAndComments: function(background) {
        // find the [l+c] link and click it...
        var lcLink = this.keyboardLinks[this.activeIndex].querySelector('.redditSingleClick');
        RESUtils.mousedown(lcLink, background);
    },
    upVote: function() {
        if (typeof(this.keyboardLinks[this.activeIndex]) === 'undefined') return false;
        if (this.keyboardLinks[this.activeIndex].previousSibling.tagName === 'A') {
            var upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.upmod');
        } else {
            var upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.upmod');
        }
        RESUtils.click(upVoteButton);
    },
    downVote: function() {
        if (typeof(this.keyboardLinks[this.activeIndex]) === 'undefined') return false;
        if (this.keyboardLinks[this.activeIndex].previousSibling.tagName === 'A') {
            var downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.downmod');
        } else {
            var downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.downmod');
        }
        RESUtils.click(downVoteButton);
    },
    saveLink: function() {
        var saveLink = this.keyboardLinks[this.activeIndex].querySelector('form.save-button > span > a');
        if (saveLink) RESUtils.click(saveLink);
    },
    saveComment: function() {
        var saveComment = this.keyboardLinks[this.activeIndex].querySelector('.saveComments');
        if (saveComment) RESUtils.click(saveComment);
    },
    reply: function() {
        // activeIndex = 0 means we're at the original post, not a comment
        if ((this.activeIndex > 0) || (RESUtils.pageType('comments') != true)) {
            if ((RESUtils.pageType('comments')) && (this.activeIndex === 0) && (! location.href.match('/message/'))) {
                $('.usertext-edit textarea:first').focus();
            } else {
                var commentButtons = this.keyboardLinks[this.activeIndex].querySelectorAll('ul.buttons > li > a');
                for (var i=0, len=commentButtons.length;i<len;i++) {
                    if (commentButtons[i].innerHTML === 'reply') {
                        RESUtils.click(commentButtons[i]);
                    }
                }
            }
        } else {
            infoBar = document.body.querySelector('.infobar');
            // We're on the original post, so shift keyboard focus to the comment reply box.
            if (infoBar) {
                // uh oh, we must be in a subpage, there is no first comment box. The user probably wants to reply to the OP. Let's take them to the comments page.
                var commentButton = this.keyboardLinks[this.activeIndex].querySelector('ul.buttons > li > a.comments');
                location.href = commentButton.getAttribute('href');
            } else {
                var firstCommentBox = document.querySelector('.commentarea textarea[name=text]');
                firstCommentBox.focus();
            }
        }
    },
    inbox: function() {
        location.href = location.protocol + '//www.reddit.com/message/inbox/';
    },
    frontPage: function(subreddit) {
        var newhref = location.protocol + '//www.reddit.com/';
        if (subreddit) {
            newhref += 'r/' + RESUtils.currentSubreddit();
        }
        location.href = newhref;
    },
    nextPage: function() {
        // if Never Ending Reddit is enabled, just scroll to the bottom.  Otherwise, click the 'next' link.
        if (modules.neverEndingReddit.isEnabled()) {
            RESUtils.click(modules.neverEndingReddit.progressIndicator);
            this.moveBottom();
        } else {
            // get the first link to the next page of reddit...
            var nextPrevLinks = document.body.querySelectorAll('.content .nextprev a');
            if (nextPrevLinks.length > 0) {
                var nextLink = nextPrevLinks[nextPrevLinks.length-1];
                // RESUtils.click(nextLink);
                location.href = nextLink.getAttribute('href');
            }
        }
    },
    prevPage: function() {
        // if Never Ending Reddit is enabled, do nothing.  Otherwise, click the 'prev' link.
        if (modules.neverEndingReddit.isEnabled()) {
            return false;
        } else {
            // get the first link to the next page of reddit...
            var nextPrevLinks = document.body.querySelectorAll('.content .nextprev a');
            if (nextPrevLinks.length > 0) {
                var prevLink = nextPrevLinks[0];
                // RESUtils.click(prevLink);
                location.href = prevLink.getAttribute('href');
            }
        }
    },
    commentLink: function(num) {
        if (this.options.commentsLinkNumbers.value) {
            var links = this.keyboardLinks[this.activeIndex].querySelectorAll('div.md a:not(.expando-button):not(.madeVisible)');
            if (typeof(links[num]) != 'undefined') {
                var thisLink = links[num];
                if ((thisLink.nextSibling) && (typeof(thisLink.nextSibling.tagName) != 'undefined') && (hasClass(thisLink.nextSibling, 'expando-button'))) {
                    thisLink = thisLink.nextSibling;
                }
                RESUtils.click(thisLink);
            }
        }
    }
};
