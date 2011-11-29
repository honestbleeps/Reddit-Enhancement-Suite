modules.userHighlight = {
    moduleID: 'userHighlight',
    moduleName: 'User Highlighter',
    category: 'Users',
    description: 'Highlights certain users in comment threads: OP, Admin, Friends, Mod - contributed by MrDerk',
    options: { 
        highlightOP: {
            type: 'boolean',
            value: true,
            description: 'Highlight OP\'s comments'
        },
        OPColor: {
            type: 'text',
            value: '#0055DF',
            description: 'Color to use to highlight OP. Defaults to original text color'
        },
        OPColorHover: {
            type: 'text',
            value: '#4E7EAB',
            description: 'Color used to highlight OP on hover.'
        },
        highlightAdmin: {
            type: 'boolean',
            value: true,
            description: 'Highlight Admin\'s comments'
        },
        adminColor: {
            type: 'text',
            value: '#FF0011',
            description: 'Color to use to highlight Admins. Defaults to original text color'
        },
        adminColorHover: {
            type: 'text',
            value: '#B3000C',
            description: 'Color used to highlight Admins on hover.'
        },
        highlightFriend: {
            type: 'boolean',
            value: true,
            description: 'Highlight Friends\' comments'
        },
        friendColor: {
            type: 'text',
            value: '#FF4500',
            description: 'Color to use to highlight Friends. Defaults to original text color'
        },
        friendColorHover: {
            type: 'text',
            value: '#B33000',
            description: 'Color used to highlight Friends on hover.'
        },
        highlightMod: {
            type: 'boolean',
            value: true,
            description: 'Highlight Mod\'s comments'
        },
        modColor: {
            type: 'text',
            value: '#228822',
            description: 'Color to use to highlight Mods. Defaults to original text color'
        },
        modColorHover: {
            type: 'text',
            value: '#134913',
            description: 'Color used to highlight Mods on hover. Defaults to gray.'
        },
        fontColor: {
            type: 'text',
            value: 'white',
            description: 'Color for highlighted text.',
        }
    },
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[\?]*/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },    
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);
            if (this.options.highlightFriend.value) {
                var name = 'friend';
                var color = this.options.friendColor.value;
                var hoverColor = this.options.friendColorHover.value;
                this.doHighlight(name,color,hoverColor);
            }
            if (this.options.highlightMod.value) {
                var name = 'moderator';
                var color = this.options.modColor.value;
                var hoverColor = this.options.modColorHover.value;
                this.doHighlight(name,color,hoverColor);
            }
            if (this.options.highlightAdmin.value) {
                var name = 'admin';
                var color = this.options.adminColor.value;
                var hoverColor = this.options.adminColorHover.value;
                this.doHighlight(name,color,hoverColor);
            }
            if (this.options.highlightOP.value) {
                var name = 'submitter';
                var color = this.options.OPColor.value;
                var hoverColor = this.options.OPColorHover.value;
                this.doHighlight(name,color,hoverColor);
            }            
        }
    },
    doHighlight: function(name,color,hoverColor) {
        // First look for .noncollapsed members. If they're there, we have comments
        // If we skip the noncollapsed, we can pick up the gray, collapsed versions
        // If that's the case, you'll end up with gray as your 'default' color
        var firstComment = document.querySelector('.noncollapsed .' + name);
        // This kicks in if a friend/admin/mod has made a post but not a comment, 
        // allowing them to be highlighted at the top of the submission
        if (firstComment == null) { 
            firstComment = document.querySelector('.' + name); 
        }
        if (firstComment != null) {
            if (color === 'default') {
                color = this.getStyle(firstComment, 'color');
            }
            if (hoverColor === 'default') {
                hoverColor = "#AAA";
            }
            if(typeof color != "undefined" && color != 'rgb(255, 255, 255)') {
                RESUtils.addCSS("\
                .author." + name + " { \
                    color: " + this.options.fontColor.value + " !important; \
                    font-weight: bold; \
                    padding: 0 2px 0 2px; \
                    border-radius: 3px; \
                    -moz-border-radius: 3px; \
                    -webkit-border-radius: 3px; \
                    background-color:" + color + " !important} \
                .collapsed .author." + name + " { \
                    color: white !important; \
                    background-color: #AAA !important}\
                .author." + name + ":hover {\
                    background-color: " + hoverColor + " !important; \
                    text-decoration: none !important}");
                // this.addCSS(css);
            }        
        }
    },
    /*addCSS: function(css) {
        // Add CSS Style
        var heads = document.getElementsByTagName("head");
        if (heads.length > 0) {
            var node = document.createElement("style");
            node.type = "text/css";
            node.appendChild(document.createTextNode(css));
            heads[0].appendChild(node);
        }
    },*/
    getStyle: function(oElm, strCssRule){
        var strValue = "";
        if(document.defaultView && document.defaultView.getComputedStyle){
            strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
        }
        else if(oElm.currentStyle){
            strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
                return p1.toUpperCase();
            });
            strValue = oElm.currentStyle[strCssRule];
        }
        return strValue;
    }
}; 
