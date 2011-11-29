modules.hideChildComments = {
    moduleID: 'hideChildComments',
    moduleName: 'Hide All Child Comments',
    category: 'Comments',
    options: {
        // any configurable options you have go here...
        // options must have a type and a value.. 
        // valid types are: text, boolean (if boolean, value must be true or false)
        // for example:
        automatic: {
            type: 'boolean',
            value: false,
            description: 'Automatically hide all but parent comments, or provide a link to hide them all?'
        }
    },
    description: 'Allows you to hide all comments except for replies to the OP for easier reading.',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
        /https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
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
            var toggleButton = document.createElement('li');
            this.toggleAllLink = document.createElement('a');
            this.toggleAllLink.innerHTML = 'hide all child comments';
            this.toggleAllLink.setAttribute('action','hide');
            this.toggleAllLink.setAttribute('href','javascript:void(0);');
            this.toggleAllLink.setAttribute('title','Show only replies to original poster.');
            this.toggleAllLink.addEventListener('click', function() {
                modules.hideChildComments.toggleComments(this.getAttribute('action'));
                if (this.getAttribute('action') === 'hide') {
                    this.setAttribute('action','show');
                    this.setAttribute('title','Show all comments.');
                    this.innerHTML = 'show all child comments';
                } else {
                    this.setAttribute('action','hide');
                    this.setAttribute('title','Show only replies to original poster.');
                    this.innerHTML = 'hide all child comments';
                }
            }, true);
            toggleButton.appendChild(this.toggleAllLink);
            var commentMenu = document.querySelector('ul.buttons');
            if (commentMenu) {
                commentMenu.appendChild(toggleButton);
                var rootComments = document.querySelectorAll('div.commentarea > div.sitetable > div.thing > div.child > div.listing');
                for (var i=0, len=rootComments.length; i<len; i++) {
                    var toggleButton = document.createElement('li');
                    var toggleLink = document.createElement('a');
                    toggleLink.innerHTML = 'hide child comments';
                    toggleLink.setAttribute('action','hide');
                    toggleLink.setAttribute('href','javascript:void(0);');
                    toggleLink.setAttribute('class','toggleChildren');
                    // toggleLink.setAttribute('title','Hide child comments.');
                    toggleLink.addEventListener('click', function(e) {
                        modules.hideChildComments.toggleComments(this.getAttribute('action'), this);
                        if (this.getAttribute('action') === 'hide') {
                            this.setAttribute('action','show');
                            // this.setAttribute('title','show child comments.');
                            this.innerHTML = 'show child comments';
                        } else {
                            this.setAttribute('action','hide');
                            // this.setAttribute('title','hide child comments.');
                            this.innerHTML = 'hide child comments';
                        }
                    }, true);
                    toggleButton.appendChild(toggleLink);
                    var sib = rootComments[i].parentNode.previousSibling;
                    if (typeof sib != 'undefined') {
                        var sibMenu = sib.querySelector('ul.buttons');
                        if (sibMenu) sibMenu.appendChild(toggleButton);
                    }
                }
                if (this.options.automatic.value) {
                    RESUtils.click(this.toggleAllLink);
                }
            }
        }
    },
    toggleComments: function(action, obj) {
        if (obj) {
            var thisChildren = obj.parentNode.parentNode.parentNode.parentNode.nextSibling.firstChild;
            if (thisChildren.tagName === 'FORM') thisChildren = thisChildren.nextSibling;
            (action === 'hide') ? thisChildren.style.display = 'none' : thisChildren.style.display = 'block';
        } else {
            // toggle all comments
            var commentContainers = document.querySelectorAll('div.commentarea > div.sitetable > div.thing');
            for (var i=0, len=commentContainers.length; i<len; i++) {
                var thisChildren = commentContainers[i].querySelector('div.child > div.sitetable');
                var thisToggleLink = commentContainers[i].querySelector('a.toggleChildren');
                if (thisToggleLink != null) {
                    if (action === 'hide') {
                        if (thisChildren != null) {
                            thisChildren.style.display = 'none' 
                        }
                        thisToggleLink.innerHTML = 'show child comments';
                        // thisToggleLink.setAttribute('title','show child comments');
                        thisToggleLink.setAttribute('action','show');
                    } else {
                        if (thisChildren != null) {
                            thisChildren.style.display = 'block';
                        }
                        thisToggleLink.innerHTML = 'hide child comments';
                        // thisToggleLink.setAttribute('title','hide child comments');
                        thisToggleLink.setAttribute('action','hide');
                    }
                }
            }
        }
    }
};
