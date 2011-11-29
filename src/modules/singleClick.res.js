modules.singleClick = {
    moduleID: 'singleClick',
    moduleName: 'Single Click Opener',
    category: 'UI',
    options: {
        openOrder: {
            type: 'enum',
            values: [
                { name: 'open comments then link', value: 'commentsfirst' },
                { name: 'open link then comments', value: 'linkfirst' }
            ],
            value: 'commentsfirst',
            description: 'What order to open the link/comments in.'
        },
        hideLEC: {
            type: 'boolean',
            value: false,
            description: 'Hide the [l=c] when the link is the same as the comments page'
        }
    },
    description: 'Adds an [l+c] link that opens a link and the comments page in new tabs for you in one click.',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    isURLMatch: function() {

    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[\?]*/i,
        /https?:\/\/([a-z]+).reddit.com\/r\/[-\w\._]*\//i
    ],
    exclude: [
        /https?:\/\/([a-z]+).reddit.com\/r\/[-\w\._\/\?]*\/comments[-\w\._\/\?=]*/i
    ],
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);
            // do stuff here!
            this.applyLinks();
            RESUtils.addCSS('.redditSingleClick { color: #888888; font-weight: bold; cursor: pointer; padding: 0 1px; }');
            // listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...
            document.body.addEventListener('DOMNodeInserted', function(event) {
                if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
                    modules.singleClick.applyLinks();
                }
            }, true);
        }
    },
    applyLinks: function() {
        var entries = document.querySelectorAll('#siteTable .entry');
        for (var i=0, len=entries.length; i<len;i++) {
            if ((typeof(entries[i]) != 'undefined') && (!(hasClass(entries[i],'lcTagged')))) {
                // bug in chrome, barfs on for i in loops with queryselectorall...
                if (i === 'length') break;
                addClass(entries[i],'lcTagged')
                thisLA = entries[i].querySelector('A.title');
                if (thisLA != null) {
                    thisLink = thisLA.getAttribute('href');
                    thisComments = entries[i].querySelector('.comments');
                    if (!(thisLink.match(/^http/i))) {
                        thisLink = 'http://' + document.domain + thisLink;
                    }
                    thisUL = entries[i].querySelector('.flat-list');
                    var singleClickLI = document.createElement('li');
                    // changed from a link to a span because you can't cancel a new window on middle click of a link during the mousedown event, and a click event isn't triggered.
                    var singleClickLink = document.createElement('span');
                    // singleClickLink.setAttribute('href','javascript:void(0);');
                    singleClickLink.setAttribute('class','redditSingleClick');
                    singleClickLink.setAttribute('thisLink',thisLink);
                    singleClickLink.setAttribute('thisComments',thisComments);
                    if (thisLink != thisComments) {
                        singleClickLink.innerHTML = '[l+c]';
                    } else if (!(this.options.hideLEC.value)) {
                        singleClickLink.innerHTML = '[l=c]';
                    }
                    singleClickLI.appendChild(singleClickLink);
                    thisUL.appendChild(singleClickLI);
                    // we have to switch to mousedown because Webkit is being a douche and not triggering click events on middle click.  
                    // ?? We should still preventDefault on a click though, maybe?
                    singleClickLink.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        if (e.button != 2) {
                            // check if it's a relative link (no http://domain) because chrome barfs on these when creating a new tab...
                            var thisLink = this.getAttribute('thisLink')
                            if (typeof chrome != 'undefined') {
                                thisJSON = {
                                    requestType: 'singleClick',
                                    linkURL: this.getAttribute('thisLink'), 
                                    openOrder: modules.singleClick.options.openOrder.value,
                                    commentsURL: this.getAttribute('thisComments'),
                                    button: e.button,
                                    ctrl: e.ctrlKey
                                }
                                chrome.extension.sendRequest(thisJSON, function(response) {
                                    // send message to background.html to open new tabs...
                                    return true;
                                });
                            } else if (typeof safari != 'undefined') {
                                thisJSON = {
                                    requestType: 'singleClick',
                                    linkURL: this.getAttribute('thisLink'), 
                                    openOrder: modules.singleClick.options.openOrder.value,
                                    commentsURL: this.getAttribute('thisComments'),
                                    button: e.button,
                                    ctrl: e.ctrlKey
                                }
                                safari.self.tab.dispatchMessage("singleClick", thisJSON);
                            } else if (typeof opera != 'undefined') {
                                thisJSON = {
                                    requestType: 'singleClick',
                                    linkURL: this.getAttribute('thisLink'), 
                                    openOrder: modules.singleClick.options.openOrder.value,
                                    commentsURL: this.getAttribute('thisComments'),
                                    button: e.button,
                                    ctrl: e.ctrlKey
                                }
                                opera.extension.postMessage(JSON.stringify(thisJSON));
                            } else if (typeof(self.on) === 'function') {
                                thisJSON = {
                                    requestType: 'singleClick',
                                    linkURL: this.getAttribute('thisLink'), 
                                    openOrder: modules.singleClick.options.openOrder.value,
                                    commentsURL: this.getAttribute('thisComments'),
                                    button: e.button,
                                    ctrl: e.ctrlKey
                                }
                                self.postMessage(thisJSON);
                            } else {
                                if (modules.singleClick.options.openOrder.value === 'commentsfirst') {
                                    if (this.getAttribute('thisLink') != this.getAttribute('thisComments')) {
                                        // console.log('open comments');
                                        window.open(this.getAttribute('thisComments'));
                                    }
                                    window.open(this.getAttribute('thisLink'));
                                } else {
                                    window.open(this.getAttribute('thisLink'));
                                    if (this.getAttribute('thisLink') != this.getAttribute('thisComments')) {
                                        // console.log('open comments');
                                        window.open(this.getAttribute('thisComments'));
                                    }
                                }
                            }
                        }
                    }, false);
                }
            }
        }

    }
};
