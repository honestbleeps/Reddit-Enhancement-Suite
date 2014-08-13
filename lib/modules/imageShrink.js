modules['imageShrink'] = {
    moduleID: 'imageShrink',
    moduleName: 'Image Shrink',
    category: 'UI',
    options: {
        maxImageSize: {
            type: 'enum',
            values: [{
                name: 'None (Full Size)',
                value: ''
            }, {
                name: 'Small (160px)',
                value: 't'
            }, {
                name: 'Medium (320px)',
                value: 'm'
            }, {
                name: 'Large (640px)',
                value: 'l'
            }, {
                name: 'Huge (1024px)',
                value: 'h'
            }],
            value: '',
            description: 'Choose the maximum size of imgur images to prevent excessive loading for excessively large images.'
        }
    },
    description: 'Choose the maximum size of imgur images to prevent excessive loading for excessively large images.',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    include: [
        'all'
    ],
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            modules['imageShrink'].updatePage();
            RESUtils.watchForElement('siteTable', function(e) {
                modules['imageShrink'].updatePage(e);
                console.log(e);
            });

        }
    },
    updatePage: function(siteTable) {
        siteTable = siteTable || document;

        var modifier = this.options.maxImageSize.value;
        if (modifier == '')
            return;
        var posts = siteTable.getElementsByClassName('thing');
        for (var i = 0; i < posts.length; i++) {
            var post = posts[i];
            var aTag;
            if (post.className.indexOf('half') > -1) { //sidebar differs from normal posts
                aTag = post.getElementsByClassName('reddit-link-title')[0];
            } else {
                var title = post.getElementsByClassName('title')[0];
                aTag = title.getElementsByTagName('a')[0];
            }
            if (aTag.id == 'shrinkedUrl') //already been edited
                continue;
            aTag.id = 'shrinkedUrl';
            aTag.href = this.changeLink(aTag.href, modifier) || modules['imageShrink'].changeLink(aTag.href, modifier); //append the appropriate character to the end and updates tag
        }
    },
    changeLink: function(link, suffix) {
        var imgurCheck = new RegExp(/(https?\:)?\/\/(i\.)?imgur.com\/.*\.(jpg|png|gif|apng|jpeg)/i);

        if (!imgurCheck.test(link))
            return link;

        var extension = new RegExp(/\.(jpg|png|gif|apng|jpeg)/i);
        var index = link.search(extension);
        link = link.substr(0, index) + suffix + link.substr(index);

        return link;
    }
};
