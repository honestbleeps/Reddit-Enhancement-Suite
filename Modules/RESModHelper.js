
modules['modHelper'] = {
    moduleID: 'modHelper',
    moduleName: 'Moderation Helper',
    options: {
        cannedReplies: {
            type: 'table',
            fields: [
                { name: 'label', type: 'text' },
                { name: 'body', type: 'text' }
            ],
            value: [],
            description: 'Set a series of default replies below.'
        }
    },
    description: 'Helps you moderate your subreddits',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: new Array(
        /https?:\/\/([a-z]+).reddit.com\/[\?]*/i
    ),
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            document.body.addEventListener('DOMNodeInserted', function(event) {
                if (event.target.tagName == 'DIV' && hasClass(event.target, 'markdownEditor')) {
                    var replies = this.options.cannedReplies.value;
                    if (replies != null) {
                        var selector = document.createElement('select');
                        var option = document.createElement('option');
                        option.text = 'Canned Replies';
                        selector.add(option);
                        for(var i = 0;i<replies.length;i++) {
                            var option = document.createElement('option');
                            option.value = replies[i][1];
                            option.text = replies[i][0];
                            selector.add(option);
                        }
                        var textArea = event.target.parentNode.getElementsByTagName('textarea')[0]
                        selector.addEventListener('change', function(e) {
                            textArea.value = selector.value;
                        });
                        event.target.appendChild( selector );
                    }
                }
            });
        }
    }
};