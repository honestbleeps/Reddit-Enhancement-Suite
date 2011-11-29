modules.usernameHider = {
    moduleID: 'usernameHider',
    moduleName: 'Username Hider',
    category: 'Accounts',
    options: {
        displayText: {
            type: 'text',
            value: '~anonymous~',
            description: 'What to replace your username with, default is ~anonymous~'
        }
    },
    description: 'This module hides your real username when you\'re logged in to reddit.',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i,
        /https?:\/\/reddit.com\/[-\w\.\/]*/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);
            var userNameEle = document.querySelector('#header-bottom-right > span > a');
            var thisUserName = userNameEle.textContent;
            userNameEle.textContent = this.options.displayText.value;
            var authors = document.querySelectorAll('.author');
            for (var i=0, len=authors.length; i<len;i++) {
                if (authors[i].textContent === thisUserName) {
                    authors[i].textContent = this.options.displayText.value;
                }
            }
        }
    }
};
