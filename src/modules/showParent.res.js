modules.showParent = {
    moduleID: 'showParent',
    moduleName: 'Show Parent on Hover',
    category: 'Comments',
    options: {
    },
    description: 'Shows parent comment when hovering over the "parent" link of a comment.',
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
            
            // code included from http://userscripts.org/scripts/show/34362
            // author: lazyttrick - http://userscripts.org/users/20871

            this.wireUpParentLinks();
            // Watch for any future 'reply' forms.
            document.body.addEventListener(
                'DOMNodeInserted',
                function( event ) {
                    if ((event.target.tagName === 'DIV') && (hasClass(event.target,'thing'))) {
                        modules.showParent.wireUpParentLinks(event.target);
                    }
                },
                false
            );
            
        }
    },
    show: function (evt) {
        var href = evt.target.getAttribute('href');
        href = href.replace(location.href,'');
        var id = href.replace(/\#/,"");
        var top = parseInt(evt.pageY,10)+10, 
            left = parseInt(evt.pageX,10)+10;
        try{
            var div = createElementWithID('div','parentComment'+id);
            addClass(div, 'comment parentComment');
            var bgFix = '';
            if ((!(modules.styleTweaks.options.commentBoxes.value)) || (!(modules.styleTweaks.isEnabled())))  {
                (modules.styleTweaks.options.lightOrDark.value === 'dark') ? bgFix = 'border: 1px solid #666666; padding: 4px; background-color: #333333;' : bgFix = 'border: 1px solid #666666; padding: 4px; background-color: #FFFFFF;';
            }
            div.setAttribute('style','width:auto;position:absolute; top:'+top+'px; left:'+left+'px; '+bgFix+';');
            var parentDiv = document.querySelector('div.id-t1_'+id);
            div.innerHTML = parentDiv.innerHTML.replace(/\<ul\s+class[\s\S]+\<\/ul\>/,"").replace(/\<a[^\>]+>\[-\]\<\/a\>/,'');
            modules.showParent.getTag('body')[0].appendChild(div);
        } catch(e) {
            // opera.postError(e);
            // console.log(e);
        }
    },
    hide: function (evt) {
        var href = evt.target.getAttribute('href');
        href = href.replace(location.href,'');
        var id = href.replace(/\#/,"");
        try{
            var div = modules.showParent.getId("parentComment"+id);
            div.parentNode.removeChild(div);
        }catch(e){
            // console.log(e);
        }
    },
    getId: function (id, parent) {
        if(!parent)
            return document.getElementById(id);
        return parent.getElementById(id);    
    },
    getTag: function (name, parent) {
        if(!parent)
            return document.getElementsByTagName(name);
        return parent.getElementsByTagName(name);
    }, 
    wireUpParentLinks: function (ele) {
        if (ele == null) ele = document;
        var querySelector = '.child ul.flat-list > li:nth-child(2) > a';
        if (ele != document) {
            // console.log(ele);
            // ele = ele.parentNode.parentNode;
            querySelector = 'ul.flat-list > li:nth-child(2) > a';
            var parentLinks = ele.querySelectorAll(querySelector);
            
            for (var i=0, len=parentLinks.length;i<len;i++) {
                parentLinks[i].addEventListener('mouseover', modules.showParent.show, false);
                parentLinks[i].addEventListener('mouseout', modules.showParent.hide, false);
            }
        } else {
            this.parentLinks = ele.querySelectorAll(querySelector);
            this.parentLinksCount = this.parentLinks.length;
            this.parentLinksi = 0;
            (function(){
                // add 15 event listeners at a time...
                var chunkLength = Math.min((modules.showParent.parentLinksCount - modules.showParent.parentLinksi), 15);
                for (var i=0;i<chunkLength;i++) {
                    modules.showParent.parentLinks[modules.showParent.parentLinksi].addEventListener('mouseover', modules.showParent.show, false);
                    modules.showParent.parentLinks[modules.showParent.parentLinksi].addEventListener('mouseout', modules.showParent.hide, false);
                    modules.showParent.parentLinksi++;
                }
                if (modules.showParent.parentLinksi < modules.showParent.parentLinksCount) {
                    setTimeout(arguments.callee, 1000);
                }
            })();        
        }
    }
};
