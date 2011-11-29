modules.showKarma = {
    moduleID: 'showKarma',
    moduleName: 'Show Comment Karma',
    category: 'Accounts',
    options: {
        separator: {
            type: 'text',
            value: '\u00b7',
            description: 'Separator character between post/comment karma'
        },
        useCommas: {
            type: 'boolean',
            value: false,
            description: 'Use commas for large karma numbers'
        }
    },
    description: 'Shows your comment karma next to your link karma.',
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
            if (RESUtils.loggedInUser()) {
                RESUtils.loggedInUserInfo(modules.showKarma.updateKarmaDiv);
            }
        }
    },
    updateKarmaDiv: function(userInfo) {
        var karmaDiv = document.querySelector("#header-bottom-right > .user b");
        if ((typeof karmaDiv != 'undefined') && (karmaDiv != null)) {
            var linkKarma = karmaDiv.innerHTML;
            var commentKarma = userInfo.data.comment_karma;
            if (modules.showKarma.options.useCommas.value) {
                linkKarma = RESUtils.addCommas(linkKarma);
                commentKarma = RESUtils.addCommas(commentKarma);
            }
            karmaDiv.innerHTML = linkKarma + " " + modules.showKarma.options.separator.value + " " + commentKarma;
        }
    }
};
