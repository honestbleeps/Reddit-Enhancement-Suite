
modules.saveComments = {
    moduleID: 'saveComments',
    moduleName: 'Save Comments',
    category: 'Comments',
    options: {
        // any configurable options you have go here...
        // options must have a type and a value.. 
        // valid types are: text, boolean (if boolean, value must be true or false)
        // for example:
    },
    description: 'Save Comments allows you to save comments, since reddit doesn\'t!',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i
    ],
    exclude: [
        /https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.\/]*\/?/i,
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*\/submit\/?/i,
        /https?:\/\/([a-z]+).reddit.com\/submit\/?/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            var currURL = location.href;
            var commentsRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i);
            var savedRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/saved\/?/i);
            if (commentsRegex.test(currURL)) {
                // load already-saved comments into memory...
                this.loadSavedComments();
                this.addSaveLinks();
            } else if (savedRegex.test(currURL)) {
                // load already-saved comments into memory...
                this.loadSavedComments();
                this.addSavedCommentsTab();
                this.drawSavedComments();
                if (location.hash === '#comments') {
                    this.showSavedTab('comments');
                }
            } else {
                this.addSavedCommentsTab();
            }
            // Watch for any future 'reply' forms, or stuff loaded in via "load more comments"...
            document.body.addEventListener(
                'DOMNodeInserted',
                function( event ) {
                    if ((event.target.tagName === 'DIV') && (hasClass(event.target,'thing'))) {
                        modules.saveComments.addSaveLinks(event.target);
                    }
                },
                false
            );
        }
    },
    addSaveLinks: function(ele) {
        if (!ele) var ele = document.body;
        this.allComments = ele.querySelectorAll('div.commentarea > div.sitetable > div.thing div.entry div.noncollapsed');
        this.allCommentsCount = this.allComments.length;
        this.allCommentsi = 0;
        (function(){
            // add 15 save links at a time...
            var chunkLength = Math.min((modules.saveComments.allCommentsCount - modules.saveComments.allCommentsi), 15);
            for (var i=0;i<chunkLength;i++) {
                var thisi = modules.saveComments.allCommentsi;
                var thisComment = modules.saveComments.allComments[thisi];
                modules.saveComments.addSaveLinkToComment(thisComment);
                modules.saveComments.allCommentsi++;
            }
            if (modules.saveComments.allCommentsi < modules.saveComments.allCommentsCount) {
                setTimeout(arguments.callee, 1000);
            }
        })();        
    },
    addSaveLinkToComment: function(commentObj) {
        var commentsUL = commentObj.querySelector('ul.flat-list');
        var permaLink = commentsUL.querySelector('li.first a.bylink');
        if (permaLink != null) {
            // if there's no 'parent' link, then we don't want to put the save link before 'lastchild', we need to move it one to the left..
            // note that if the user is not logged in, there is no next link for first level comments... set to null!
            if (RESUtils.loggedInUser()) {
                if (permaLink.parentNode.nextSibling != null) {
                    if (typeof(permaLink.parentNode.nextSibling.firstChild.getAttribute) != 'undefined') {
                        var nextLink = permaLink.parentNode.nextSibling.firstChild.getAttribute('href');
                    } else {
                        var nextLink = null;
                    }
                } else {
                    var nextLink = null;
                }
            } else {
                var nextLink = null;
            }
            var isTopLevel = ((nextLink == null) || (nextLink.indexOf('#') === -1));
            var userLink = commentObj.querySelector('a.author');
            if (userLink != null) {
                var saveUser = userLink.text;
                var saveHREF = permaLink.getAttribute('href');
                var splitHref = saveHREF.split('/');
                var saveID = splitHref[splitHref.length-1];
                var saveLink = document.createElement('li');
                if ((typeof(this.storedComments) != 'undefined') && (typeof(this.storedComments[saveID]) != 'undefined')) {
                    saveLink.innerHTML = '<a href="/saved#comments">saved</a>';
                } else {
                    saveLink.innerHTML = '<a href="javascript:void(0);" class="saveComments">save</a>';
                    saveLink.setAttribute('saveID',saveID);
                    saveLink.setAttribute('saveLink',saveHREF);
                    saveLink.setAttribute('saveUser',saveUser);
                    saveLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        modules.saveComments.saveComment(this, this.getAttribute('saveID'), this.getAttribute('saveLink'), this.getAttribute('saveUser'));
                    }, true);
                }
                var whereToInsert = commentsUL.lastChild;
                if (isTopLevel) whereToInsert = whereToInsert.previousSibling;
                commentsUL.insertBefore(saveLink, whereToInsert);
            }
        }
    },
    loadSavedComments: function() {
        // first, check if we're storing saved comments the old way (as an array)...
        var thisComments = RESStorage.getItem('RESmodules.saveComments.savedComments');
        if (thisComments == null) {
            this.storedComments = {};
        } else {
            this.storedComments = safeJSON.parse(thisComments, 'RESmodules.saveComments.savedComments');
            // console.log(this.storedComments);
            // old way of storing saved comments... convert...
            if (thisComments.slice(0,1) === '[') {
                var newFormat = {};
                for (var i in this.storedComments) {
                    var urlSplit = this.storedComments[i].href.split('/');
                    var thisID = urlSplit[urlSplit.length-1];
                    newFormat[thisID] = this.storedComments[i];
                }
                this.storedComments = newFormat;
                RESStorage.setItem('RESmodules.saveComments.savedComments',JSON.stringify(newFormat));
            } 
        }
    },
    saveComment: function(obj, id, href, username, comment) {
        // reload saved comments in case they've been updated in other tabs (works in all but greasemonkey)
        this.loadSavedComments();
        // loop through comments and make sure we haven't already saved this one...
        if (typeof(this.storedComments[id]) != 'undefined') {
            RESAlert('comment already saved!');
        } else {
            if (modules.keyboardNav.isEnabled()) {
                // unfocus it before we save it so we don't save the keyboard annotations...
                modules.keyboardNav.keyUnfocus(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]);
            }
            var comment = obj.parentNode.parentNode.querySelector('div.usertext-body > div.md');
            if (comment != null) {
                commentHTML = comment.innerHTML;
                var savedComment = {
                    href: href,
                    username: username,
                    comment: commentHTML,
                    timeSaved: Date()
                };
                this.storedComments[id] = savedComment;
                var unsaveObj = document.createElement('li');
                unsaveObj.innerHTML = '<a href="javascript:void(0);">unsave</a>';
                unsaveObj.setAttribute('unsaveID',id);
                unsaveObj.setAttribute('unsaveLink',href);
                unsaveObj.setAttribute('class','saveComments');
                unsaveObj.addEventListener('click', function(e) {
                    // e.preventDefault();
                    var id = this.getAttribute('unsaveID');
                    modules.saveComments.unsaveComment(id, this);
                }, false);
                obj.parentNode.replaceChild(unsaveObj, obj);
            }
            if (modules.keyboardNav.isEnabled()) {
                modules.keyboardNav.keyFocus(modules.keyboardNav.keyboardLinks[modules.keyboardNav.activeIndex]);
            }
            if (RESUtils.proEnabled()) {
                // add sync adds/deletes for RES Pro.
                if (typeof(this.storedComments.RESPro_add) === 'undefined') {
                    this.storedComments.RESPro_add = {}
                }
                if (typeof(this.storedComments.RESPro_delete) === 'undefined') {
                    this.storedComments.RESPro_delete = {}
                }
                // add this ID next time we sync...
                this.storedComments.RESPro_add[id] = true;
                // make sure we don't run a delete on this ID next time we sync...
                if (typeof(this.storedComments.RESPro_delete[id]) != 'undefined') delete this.storedComments.RESPro_delete[id];
            }
            RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(this.storedComments));
            if (RESUtils.proEnabled()) {
                modules.RESPro.authenticate(function() {
                    modules.RESPro.saveModuleData('saveComments');
                });
            }
        }
    },
    addSavedCommentsTab: function() {
        var mainmenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
        if (mainmenuUL) {
            var menuItems = mainmenuUL.querySelectorAll('li');
            for (var i=0, len=menuItems.length;i<len;i++) {
                var savedLink = menuItems[i].querySelector('a');
                if ((hasClass(menuItems[i], 'selected')) && (savedLink.href === 'http://www.reddit.com/saved/')) {
                    menuItems[i].addEventListener('click', function(e) {
                        e.preventDefault();
                        modules.saveComments.showSavedTab('links');
                    }, true);
                }
                if (savedLink.href === 'http://www.reddit.com/saved/') {
                    this.savedLinksTab = menuItems[i];
                    savedLink.innerHTML = 'saved links';
                }
            }
            this.savedCommentsTab = document.createElement('li');
            this.savedCommentsTab.innerHTML = '<a href="javascript:void(0);">saved comments</a>';
            var savedRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/saved\/?/i);
            if (savedRegex.test(location.href)) {
                this.savedCommentsTab.addEventListener('click', function(e) {
                    e.preventDefault();
                    modules.saveComments.showSavedTab('comments');
                }, true);
            } else {
                this.savedCommentsTab.addEventListener('click', function(e) {
                    e.preventDefault();
                    location.href = location.protocol + '//www.reddit.com/saved/#comments';
                }, true);
            }
            if (this.savedLinksTab != null) {
                $(this.savedLinksTab).after(this.savedCommentsTab);
            }
        }
    },
    showSavedTab: function(tab) {
        switch(tab) {
            case 'links':
                location.hash = 'links';
                this.savedLinksContent.style.display = 'block';
                this.savedCommentsContent.style.display = 'none';
                addClass(this.savedLinksTab, 'selected');
                removeClass(this.savedCommentsTab, 'selected');
                break;
            case 'comments':
                location.hash = 'comments';
                this.savedLinksContent.style.display = 'none';
                this.savedCommentsContent.style.display = 'block';
                removeClass(this.savedLinksTab, 'selected');
                addClass(this.savedCommentsTab, 'selected');
                break;
        }
    },
    drawSavedComments: function() {
        RESUtils.addCSS('.savedComment { padding: 5px; font-size: 12px; margin-bottom: 20px; margin-left: 40px; margin-right: 10px; border: 1px solid #CCCCCC; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; width: auto; } ');
        RESUtils.addCSS('.savedCommentHeader { margin-bottom: 8px; }');
        RESUtils.addCSS('.savedCommentBody { margin-bottom: 8px; }');
        RESUtils.addCSS('#savedLinksList { margin-top: 10px; }');
        // css += '.savedCommentFooter {  }';
        this.savedLinksContent = document.body.querySelector('BODY > div.content');
        this.savedCommentsContent = createElementWithID('div', 'savedLinksList');
        this.savedCommentsContent.style.display = 'none';
        this.savedCommentsContent.setAttribute('class','sitetable linklisting');
        for (var i in this.storedComments) {
            if ((i != 'RESPro_add') && (i != 'RESPro_delete')) {
                var clearLeft = document.createElement('div');
                clearLeft.setAttribute('class','clearleft');
                var thisComment = document.createElement('div');
                addClass(thisComment, 'savedComment');
                addClass(thisComment, 'thing entry');
                thisComment.innerHTML = '<div class="savedCommentHeader">Comment by user: ' + this.storedComments[i].username + ' saved on ' + this.storedComments[i].timeSaved + '</div><div class="savedCommentBody">' + this.storedComments[i].comment + '</div>';
                thisComment.innerHTML += '<div class="savedCommentFooter"><ul class="flat-list buttons"><li><a class="unsaveComment" href="javascript:void(0);">unsave</a></li><li><a href="' + this.storedComments[i].href + '">view original</a></li></ul></div>';
                var unsaveLink = thisComment.querySelector('.unsaveComment');
                unsaveLink.setAttribute('unsaveID', i);
                unsaveLink.setAttribute('unsaveLink', this.storedComments[i].href);
                unsaveLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    modules.saveComments.unsaveComment(this.getAttribute('unsaveID'));
                }, true);
                this.savedCommentsContent.appendChild(thisComment);
                this.savedCommentsContent.appendChild(clearLeft);
            }
        }
        if (this.storedComments.length === 0) {
            this.savedCommentsContent.innerHTML = '<li>You have not yet saved any comments.</li>';
        }
        $(this.savedLinksContent).after(this.savedCommentsContent);
    },
    unsaveComment: function(id, unsaveLink) {
        /*
        var newStoredComments = [];
        for (var i=0, len=this.storedComments.length;i<len;i++) {
            if (this.storedComments[i].href != href) {
                newStoredComments.push(this.storedComments[i]);
            } else {
                // console.log('found match. deleted comment');
            }
        }
        this.storedComments = newStoredComments;
        */
        delete this.storedComments[id];
        if (RESUtils.proEnabled()) {
            // add sync adds/deletes for RES Pro.
            if (typeof(this.storedComments.RESPro_add) === 'undefined') {
                this.storedComments.RESPro_add = {}
            }
            if (typeof(this.storedComments.RESPro_delete) === 'undefined') {
                this.storedComments.RESPro_delete = {}
            }
            // delete this ID next time we sync...
            this.storedComments.RESPro_delete[id] = true;
            // make sure we don't run an add on this ID next time we sync...
            if (typeof(this.storedComments.RESPro_add[id]) != 'undefined') delete this.storedComments.RESPro_add[id];
        }
        RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(this.storedComments));
        if (RESUtils.proEnabled()) {
            modules.RESPro.authenticate(function() {
                modules.RESPro.saveModuleData('saveComments');
            });
        }
        if (typeof(this.savedCommentsContent) != 'undefined') {
            this.savedCommentsContent.parentNode.removeChild(this.savedCommentsContent);
            this.drawSavedComments();
            this.showSavedTab('comments');
        } else {
            var commentObj = unsaveLink.parentNode.parentNode;
            unsaveLink.parentNode.removeChild(unsaveLink);
            this.addSaveLinkToComment(commentObj);
        }
    }
};

