modules.filteReddit = {
    moduleID: 'filteReddit',
    moduleName: 'filteReddit',
    category: 'Filters',
    options: {
        // any configurable options you have go here...
        // options must have a type and a value.. 
        // valid types are: text, boolean (if boolean, value must be true or false)
        // for example:
        NSFWfilter: {
            type: 'boolean',
            value: false,
            description: 'Filters all links labelled NSFW'
        },
        keywords: {
            type: 'table',
            addRowText: '+add filter',
            fields: [
                { name: 'keyword', type: 'text' },
                { name: 'applyTo',
                    type: 'enum',
                    values: [
                        { name: 'Everywhere', value: 'everywhere' },
                        { name: 'Everywhere but:', value: 'exclude' },
                        { name: 'Only on:', value: 'include' }
                    ],
                    value: 'everywhere',
                    description: 'Apply filter to:'
                },
                { 
                    name: 'reddits', 
                    type: 'list', 
                    source: '/api/search_reddit_names.json', 
                    hintText: 'type a subreddit name',
                    onResult: function(response) {
                        var names = response.names;
                        var results = [];
                        for (var i=0, len=names.length; i<len; i++) {
                            results.push({id: names[i], name: names[i]});
                        }
                        return results;
                    }                    
                } //,
                /* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
            ],
            value: [
            ],
            description: 'Type in title keywords you want to ignore if they show up in a title'
        },
        subreddits: {
            type: 'table',
            addRowText: '+add filter',
            fields: [
                { name: 'subreddit', type: 'text' }
            ],
            value: [
            ],
            description: 'Type in a subreddit you want to ignore (only applies to /r/all)'
        },
        domains: {
            type: 'table',
            addRowText: '+add filter',
            fields: [
                { name: 'domain', type: 'text' },
                { name: 'applyTo',
                    type: 'enum',
                    values: [
                        { name: 'Everywhere', value: 'everywhere' },
                        { name: 'Everywhere but:', value: 'exclude' },
                        { name: 'Only on:', value: 'include' }
                    ],
                    value: 'everywhere',
                    description: 'Apply filter to:'
                },
                { 
                    name: 'reddits', 
                    type: 'list', 
                    source: '/api/search_reddit_names.json', 
                    hintText: 'type a subreddit name',
                    onResult: function(response) {
                        var names = response.names;
                        var results = [];
                        for (var i=0, len=names.length; i<len; i++) {
                            results.push({id: names[i], name: names[i]});
                        }
                        return results;
                    }                    
                } //,
                /* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
            ],
            value: [
            ],
            description: 'Type in domain keywords you want to ignore. Note that \"reddit\" would ignore \"reddit.com\" and \"fooredditbar.com\"'
        }
    },
    description: 'Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all).',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/?(?:\??[\w]+=[\w]+&?)*/i,
        /https?:\/\/([a-z]+).reddit.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
    ],
    exclude: [
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
        /https?:\/\/([a-z]+).reddit.com\/saved\/?/i,
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
            RESUtils.addCSS('.RESFiltered { display: none !important; }');
            if (this.options.NSFWfilter.value) {
                this.filterNSFW();
            }
            document.body.addEventListener('DOMNodeInserted', function(event) {
                if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
                    modules.filteReddit.scanEntries(event.target);
                }
            }, true);
            this.scanEntries();
        }
    },
    scanEntries: function(ele) {
        if (ele == null) {
            var entries = document.querySelectorAll('#siteTable div.thing.link');
        } else {
            var entries = ele.querySelectorAll('div.thing.link');
        }
        // var RALLre = /\/r\/all\/?(([\w]+)\/)?/i;
        // var onRALL = RALLre.exec(location.href);
        var onRALL = (RESUtils.currentSubreddit('all'));
        for (var i=0, len=entries.length; i<len;i++) {
            var postTitle = entries[i].querySelector('.entry a.title').innerHTML;
            var postDomain = entries[i].querySelector('.entry span.domain > a').innerHTML;
            var thisSubreddit = entries[i].querySelector('.entry a.subreddit');
            if (thisSubreddit != null) {
                var postSubreddit = thisSubreddit.innerHTML;
            } else {
                var postSubreddit = false;
            }
            var filtered = false;
            filtered = this.filterTitle(postTitle, postSubreddit || RESUtils.currentSubreddit());
            if (!filtered) filtered = this.filterDomain(postDomain, postSubreddit || RESUtils.currentSubreddit());
            if ((!filtered) && (onRALL) && (postSubreddit)) {
                filtered = this.filterSubreddit(postSubreddit);
            }
            if (filtered) {
                addClass(entries[i],'RESFiltered')
            }
        }
    },
    filterNSFW: function() {
        RESUtils.addCSS('.over18 { display: none !important; }');
    },
    filterTitle: function(title, reddit) {
        return this.arrayContainsSubstring(this.options.keywords.value, title.toLowerCase(), reddit);
    },
    filterDomain: function(domain, reddit) {
        return this.arrayContainsSubstring(this.options.domains.value, domain.toLowerCase(), reddit);
    },
    filterSubreddit: function(subreddit) {
        return this.arrayContainsSubstring(this.options.subreddits.value, subreddit.toLowerCase(), null, true);
    },
    unescapeHTML: function(theString) {
        var temp = document.createElement("div");
        temp.innerHTML = theString;
        var result = temp.childNodes[0].nodeValue;
        temp.removeChild(temp.firstChild);
        delete temp;
        return result;    
    },
    arrayContainsSubstring: function(obj, stringToSearch, reddit, fullmatch) {
      stringToSearch = this.unescapeHTML(stringToSearch);
      var i = obj.length;
      while (i--) {
        var thisObj = obj[i];
        if ((typeof(obj[i]) != 'object') || (obj[i].length<3)) {
            if (obj[i].length = 1) obj[i] = obj[i][0];
            obj[i] = [obj[i], 'everywhere',''];
        }
        var searchString = obj[i][0];
        var applyTo = obj[i][1];
        var applyList = obj[i][2].toLowerCase().split(',');
        switch (applyTo) {
            case 'exclude':
                if (applyList.indexOf(reddit) != -1) {
                    return false;
                }
                break;
            case 'include':
                if (applyList.indexOf(reddit) === -1) {
                    return false;
                }
                break;
        }
        // if fullmatch is defined, don't do a substring match... this is used for subreddit matching on /r/all for example
        if ((fullmatch) && (obj[i] != null) && (stringToSearch.toLowerCase() === searchString.toLowerCase())) return true;
        if ((!fullmatch) && (obj[i] != null) && (stringToSearch.indexOf(searchString.toString().toLowerCase()) != -1)) {
          return true;
        }
      }
      return false;
    }
};
