modules.showImages = {
    moduleID: 'showImages',
    moduleName: 'Inline Image Viewer',
    category: 'UI',
    options: {
        maxWidth: {
            type: 'text',
            value: '640',
            description: 'Max width of image displayed onscreen'
        },
        maxHeight: {
            type: 'text',
            value: '480',
            description: 'Max height of image displayed onscreen'
        },
        openInNewWindow: {
            type: 'boolean',
            value: true,
            description: 'Open images in a new tab/window when clicked?'
        },
        hideNSFW: {
            type: 'boolean',
            value: false,
            description: 'If checked, do not show images marked NSFW.'
        },
        /*
        it seems imgur has made some changes that break this feature, time to remove it...
        imageSize: {
            type: 'enum',
            values: [
                { name: 'default', value: '' },
                { name: 'Huge', value: 'h' },
                { name: 'Large', value: 'l' },
                { name: 'Medium', value: 'm' },
                { name: 'Small', value: 't' },
                { name: 'Big Square', value: 'b' },
                { name: 'Small Square', value: 's' }
            ],
            value: '',
            description: 'imgur only: which imgur size to display inline.'
        },
        */
        autoExpandSelfText: {
            type: 'boolean',
            value: true,
            description: 'When loading selftext from an Aa+ expando, auto reveal images.'
        },
        imageZoom: {
            type: 'boolean',
            value: true,
            description: 'Allow dragging to resize/zoom images.'
        },
        /* reddit made this impossible by hiding the HTML, sorry...
        hoverPreview: {
            type: 'boolean',
            value: true,
            description: 'Show thumbnail preview when hovering over expando.'
        },
        */
        markVisited: {
            type: 'boolean',
            value: true,
            description: 'Mark links visited when you view images (does eat some resources).'
        }
    },
    description: 'Opens images inline in your browser with the click of a button. Also has configuration options, check it out!',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\_\?=]*/i
    ],
    exclude: [
        /https?:\/\/([a-z]+).reddit.com\/ads\/[-\w\.\_\?=]*/i,
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*\/submit\/?$/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);
            
            // Show Images - source originally from Richard Lainchbury - http://userscripts.org/scripts/show/67729
            // Source modified to work as a module in RES, and improved slightly..
            // RESUtils.addCSS(".expando-button.image { float: left; width: 23px; height: 23px; max-width: 23px; max-height: 23px; display: inline-block; background-image: url('http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png'); margin-right: 6px; cursor: pointer;  padding: 0px; }");
            RESUtils.addCSS(".expando-button.image { vertical-align:top !important; float: left; width: 23px; height: 23px; max-width: 23px; max-height: 23px; display: inline-block; background-image: url('http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png'); margin-right: 6px; cursor: pointer;  padding: 0px; }");
            RESUtils.addCSS(".expando-button.image.commentImg { float: none; margin-left: 4px; } ");
            RESUtils.addCSS(".expando-button.image.collapsed { background-position: 0px 0px; } ");
            RESUtils.addCSS(".expando-button.image.collapsed:hover { background-position: 0px -24px; } ");
            RESUtils.addCSS(".expando-button.image.expanded { background-position: 0px -48px; } ");
            RESUtils.addCSS(".expando-button.image.expanded:hover { background-position: 0px -72px; } ");
            RESUtils.addCSS(".isGallery { margin-left: 30px; margin-top: 3px; } ");
            RESUtils.addCSS(".madeVisible { clear: left; display: block; overflow: hidden; } ");
            RESUtils.addCSS(".madeVisible a { display: inline-block; overflow: hidden; } ");
            RESUtils.addCSS(".RESImage { float: left; display: block !important;  } ");
            RESUtils.addCSS(".RESdupeimg { color: #000000; font-size: 10px;  } ");
            RESUtils.addCSS(".RESClear { clear: both; margin-bottom: 10px;  } ");
            // potential fix for sidebar overlapping expanded images, but only helps partially...
            // now that drag hides sidebar, removing this css. 4.0.2
            // RESUtils.addCSS(".md { max-width: 100% !important;}");
            
            
            this.imageList = [];
            this.imagesRevealed = [];
            this.flickrImages = [];
            this.dupeAnchors = 0;
            if (this.options.markVisited.value) {
                this.imageTrackFrame = document.createElement('iframe');
                this.imageTrackFrame.addEventListener('load', function() {
                    setTimeout(modules.showImages.imageTrackPop, 300);
                }, false);
                this.imageTrackFrame.style.display = 'none';
                this.imageTrackFrame.style.width = '0px';
                this.imageTrackFrame.style.height = '0px';
                this.imageTrackStack = [];
                document.body.appendChild(this.imageTrackFrame);
            }

            document.body.addEventListener('DOMNodeInserted', function(event) {
                if (
                    ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) ||
                    ((event.target.tagName === 'DIV') && (hasClass(event.target, 'comment'))) ||
                    ((event.target.tagName === 'FORM') && (event.target.getAttribute('class') === 'usertext'))
                )
                {
                    var isSelfText = false;
                    if (event.target.tagName === 'FORM') {
                        isSelfText = true;
                    }
                    modules.showImages.findAllImages(event.target, isSelfText);
                    if ((modules.showImages.allImagesVisible) && (!isSelfText)) {
                        modules.showImages.waitForScan = setInterval(function() {
                            if (!(modules.showImages.scanningForImages)) {
                                modules.showImages.showImages(modules.showImages.gw, true);
                                clearInterval(modules.showImages.waitForScan);
                            }
                        }, 100);
                    }
                }
            }, true);
            
            // create a div for the thumbnail tooltip...
            RESUtils.addCSS('#RESThumbnailToolTip { display: none; position: absolute; border: 2px solid gray; z-index: 9999; }');
            modules.showImages.toolTip = createElementWithID('div','RESThumbnailToolTip');
            document.body.appendChild(modules.showImages.toolTip);
            
            
            // this.imguReddit();
            this.createImageButtons();
            this.findAllImages();
            document.addEventListener('dragstart',function(){return false}, false);
        }
    },
    getDragSize: function(e){
        var dragSize = (p=Math.pow)(p(e.clientX-(rc=e.target.getBoundingClientRect()).left,2)+p(e.clientY-rc.top,2),.5);
        return Math.round(dragSize);
    },
    createImageButtons: function() {
        if (location.href.match(/search\?\/?q\=/)) {
            var hbl = document.body.querySelector('#header-bottom-left');
            if (hbl) {
                var mainmenuUL = document.createElement('ul');
                mainmenuUL.setAttribute('class','tabmenu');
                hbl.appendChild(mainmenuUL);
            }
        } else {
            var mainmenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
        }
        
        if (mainmenuUL) {

            var li = document.createElement('li');
            var a = document.createElement('a');
            var text = document.createTextNode('scanning for images...');
            this.scanningForImages = true;

            a.setAttribute('href','javascript:void(0);');
            a.setAttribute('id','viewImagesButton');
            a.addEventListener('click', function(e) {
                e.preventDefault();
                if (!(modules.showImages.scanningForImages)) {
                    modules.showImages.showImages();
                }
            }, true);
            a.appendChild(text);
            li.appendChild(a);
            mainmenuUL.appendChild(li);
            this.viewButton = a;
            this.gw = '';

            var commentsre = new RegExp(/comments\/[-\w\.\/]/i);
            // if (!(commentsre.test(location.href)) && (window.location.href.indexOf('gonewild')>=0)){
            if (!(commentsre.test(location.href)) && (window.location.href.match(/gonewild/i))) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                var text = document.createTextNode('[m]');
                a.setAttribute('href','javascript:void(0);');
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    modules.showImages.gw = 'm';
                    modules.showImages.showImages('m');
                }, true);
                a.appendChild(text);
                li.appendChild(a);
                mainmenuUL.appendChild(li);

                var li = document.createElement('li');
                var a = document.createElement('a');
                var text = document.createTextNode('[f]');
                a.setAttribute('href','javascript:void(0);');
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    modules.showImages.gw = 'f';
                    modules.showImages.showImages('f');
                }, true);
                a.appendChild(text);
                li.appendChild(a);
                mainmenuUL.appendChild(li);
            }
        }
    
    },
    updateImageButtons: function(imgCount) {
        if ((typeof(this.viewButton) != 'undefined')) {
            if (this.allImagesVisible) {
                this.viewButton.innerHTML = 'hide images ('+imgCount+')';
            } else {
                this.viewButton.innerHTML = 'view images ('+imgCount+')';
            }
        }
    },
    findImages: function(gonewild, showmore) {
        switch (gonewild) {
            case 'f':
                re = new RegExp(/[\[\{\<\(](f|fem|female)[\]\}\>\)]/i);
                break;
            case 'm':
                re = new RegExp(/[\[\{\<\(](m|man|male)[\]\}\>\)]/i);
                break;
        }
        if (this.options.hideNSFW.value) {
            re = new RegExp(/nsfw/i);
        }
        for(var i=0, len=this.imageList.length;i<len;i++) {
            var href = this.imageList[i].getAttribute("href").toLowerCase();
            var checkhref = href.toLowerCase();
            var title_text=this.imageList[i].text;
            (gonewild) ? titleMatch = re.test(title_text) : titleMatch = false;
            var NSFW = false;
            if (this.options.hideNSFW.value) {
                NSFW = re.test(title_text);
            }
            var isImgur = (checkhref.indexOf('imgur.com')>=0);
            var isEhost = (checkhref.indexOf('eho.st')>=0);
            var isSnaggy = (checkhref.indexOf('snag.gy')>=0);
            var isPhotobucket = (checkhref.indexOf('photobucket.com')>=0);
            var isFlickr = ((checkhref.indexOf('flickr.com')>=0) && (checkhref.indexOf('/sets/') === -1));
            var isMinus = ((checkhref.indexOf('min.us')>=0) && (checkhref.indexOf('blog.') === -1));
            var isQkme = (checkhref.indexOf('qkme.me')>=0) || (checkhref.indexOf('quickmeme.com')>=0);
            var isGifSound = (checkhref.indexOf('gifsound.com')>=0);
            // if (href && (gonewild === '' || titleMatch) && (!isGifSound) && (!NSFW) && (href.indexOf('wikipedia.org/wiki') < 0) && (!isPhotobucket) && (isImgur || isEhost || isSnaggy || isFlickr || isMinus || isQkme || href.indexOf('imgur.')>=0 || href.indexOf('.jpeg')>=0 || href.indexOf('.jpg')>=0 || href.indexOf('.gif')>=0 || href.indexOf('.png')>=0)) {
                if (hasClass(this.imageList[i].parentNode,'title')) {
                    var targetImage = this.imageList[i].parentNode.nextSibling
                } else {
                    var targetImage = this.imageList[i].nextSibling
                }
                this.revealImage(targetImage, showmore);
            // }
        }
    },
    imgurType: function(url) {
        // Detect the type of imgur link
        // Direct image link?  http://i.imgur.com/0ZxQF.jpg
        // imgur "page" link?  http://imgur.com/0ZxQF
        // imgur "gallery"?    ??????????
        var urlPieces = url.split('?');
        var cleanURL = urlPieces[0];
        var directImg = /i.imgur.com\/[\w]+\.[\w]+/gi;
        var imgPage = /imgur.com\.[\w+]$/gi;
    },
    findAllImages: function(ele, isSelfText) {
        this.scanningForImages = true;
        if (ele == null) {
            ele = document.body;
        }
        // get elements common across all pages first...
        // if we're on a comments page, get those elements too...
        var commentsre = new RegExp(/comments\/[-\w\.\/]/i);
        var userre = new RegExp(/user\/[-\w\.\/]/i);
        this.scanningSelfText = false;
        if ((commentsre.test(location.href)) || (userre.test(location.href))) {
            this.allElements = ele.querySelectorAll('#siteTable A.title, .expando .usertext-body > div.md a, .content .usertext-body > div.md a');
        } else if (isSelfText) {
            // We're scanning newly opened (from an expando) selftext...
            this.allElements = ele.querySelectorAll('.usertext-body > div.md a');
            this.scanningSelfText = true;
        } else {
            this.allElements = ele.querySelectorAll('#siteTable A.title');
        }
        // make an array to store any links we've made calls to for the imgur API so we don't do any multiple hits to it.
        this.imgurCalls = [];
        this.minusCalls = [];
        // this.allElements contains all link elements on the page - now let's filter it for images...
        // this.imgurHashRe = /^http:\/\/([i.]|[edge.]|[www.])*imgur.com\/([\w]+)(\..+)?$/i;
        this.imgurHashRe = /^http:\/\/(?:[i.]|[edge.]|[www.])*imgur.com\/(?:r\/[\w]+\/)?([\w]+)(\..+)?$/i;
        // this.imgurAlbumRe = /^http:\/\/[i.]*imgur.com\/a\/([\w]+)(\..+)?$/i;
        this.minusHashRe = /^http:\/\/min.us\/([\w]+)(?:#[\d+])?$/i;
        this.qkmeHashRe = /^http:\/\/(?:www.quickmeme.com\/meme|qkme.me)\/([\w]+)\/?/i;
        this.ehostHashRe = /^http:\/\/(?:i\.)?(?:\d+\.)?eho.st\/(\w+)\/?/i;
        var groups = [];
        this.allElementsCount=this.allElements.length;
        this.allElementsi = 0;
        if (RESUtils.pageType() === 'comments') {
            (function(){
                // we're on a comments page which is more intense, so just scan 15 links at a time...
                var chunkLength = Math.min((modules.showImages.allElementsCount - modules.showImages.allElementsi), 15);
                for (var i=0;i<chunkLength;i++) {
                    modules.showImages.checkElementForImage(modules.showImages.allElementsi);
                    modules.showImages.allElementsi++;
                }
                if (modules.showImages.allElementsi < modules.showImages.allElementsCount) {
                    setTimeout(arguments.callee, 1000);
                } else {
                    modules.showImages.scanningSelfText = false;
                    modules.showImages.scanningForImages = false;
                    modules.showImages.updateImageButtons(modules.showImages.imageList.length);
                }
            })();        
        } else {
            var chunkLength = modules.showImages.allElementsCount;
            for (var i=0;i<chunkLength;i++) {
                modules.showImages.checkElementForImage(modules.showImages.allElementsi);
                modules.showImages.allElementsi++;
            }
            modules.showImages.scanningSelfText = false;
            modules.showImages.scanningForImages = false;
            modules.showImages.updateImageButtons(modules.showImages.imageList.length);
        }
    },
    checkElementForImage: function(index) {
        var NSFW = false;
        ele = this.allElements[index];
        var href = ele.getAttribute('href');
        var checkhref = href.toLowerCase();
        if (this.options.hideNSFW.value) {
            // if it's a link, not a comment link, check for over18 class...
            if (hasClass(ele,'title')) {
                var thingObj = ele.parentNode.parentNode.parentNode;
                if (hasClass(thingObj,'over18')) NSFW = true;
            }
        }
        // the this.scanningSelfText variable is set as true when we're scanning newly loaded selfText via an expando...
        // this is done so that we do not do the RES ignored duplicate image thing, because when you close a selfText expando,
        // reddit completely deletes it from the DOM instead of just hiding it, so re-opening it causes a total rescan.
        if (((!(hasClass(ele,'imgScanned'))) && (typeof(this.imagesRevealed[href]) === 'undefined') && (href != null)) || this.scanningSelfText) {
            addClass(ele,'imgScanned');
            this.dupeAnchors++;
            var isImgur = (checkhref.indexOf('imgur.com')>=0);
            var isEhost = (checkhref.indexOf('eho.st')>=0);
            var isSnaggy = (checkhref.indexOf('snag.gy')>=0);
            var isPhotobucket = (checkhref.indexOf('photobucket.com')>=0);
            var isFlickr = ((href.indexOf('flickr.com')>=0) && (href.indexOf('/sets/') === -1));
            var isMinus = ((checkhref.indexOf('min.us')>=0) && (checkhref.indexOf('blog.') === -1));
            var isQkme = (checkhref.indexOf('qkme.me')>=0) || (checkhref.indexOf('quickmeme.com')>=0);
            var isGifSound = (checkhref.indexOf('gifsound.com')>=0);
            if (!(ele.getAttribute('scanned') === 'true') && (checkhref.indexOf('wikipedia.org/wiki') < 0) && (!isGifSound) && (!NSFW) && (!isPhotobucket) && (isImgur || isEhost || isSnaggy || isFlickr || isMinus || isQkme || checkhref.indexOf('.jpeg')>=0 || checkhref.indexOf('.jpg')>=0 || checkhref.indexOf('.gif')>=0 || checkhref.indexOf('.png')>=0)) {
                if (isImgur) {
                    // if it's not a full (direct) imgur link, get the relevant data and append it... otherwise, go now!
                    // first, kill any URL parameters that screw with the parser, like ?full.
                    var splithref = href.split('?');
                    href = splithref[0];
                    var orighref = href;
                    /*
                    if ((this.options.imageSize.value != null) && (this.options.imageSize.value != '')) { 
                        splithref = href.split('.');
                        if ((splithref[splithref.length-1] === 'jpg') || (splithref[splithref.length-1] === 'jpeg') || (splithref[splithref.length-1] === 'png') || (splithref[splithref.length-1] === 'gif'))  {
                            splithref[splithref.length-2] += this.options.imageSize.value;
                            href = splithref.join('.');
                        }
                    }
                    */
                    ele.setAttribute('href',href);
                    // now, strip the hash off of it so we can make an API call if need be
                    var groups = this.imgurHashRe.exec(href);
                    // if we got a match, but we don't have a file extension, hit the imgur API for that info
                    if (groups && !groups[2]) {
                        var apiURL = 'http://api.imgur.com/2/image/'+groups[1]+'.json';
                        // avoid making duplicate calls from the same page... want to minimize hits to imgur API
                        if (typeof(this.imgurCalls[apiURL]) === 'undefined') {
                            // store the object we want to modify when the json request is finished...
                            this.imgurCalls[apiURL] = ele;
                            GM_xmlhttpRequest({ 
                                method: 'GET', 
                                url: apiURL,
                                onload: function(response) {
                                    try {
                                        var json = JSON.parse(response.responseText);
                                    } catch(error) {
                                        // uh oh, we got something bad back from the API.
                                        // console.log(response.responseText);
                                        var json = {};
                                    }
                                    if ((typeof(json.image) != 'undefined') && (json.image.links.original)) {
                                        if (typeof(modules.showImages.imgurCalls[apiURL]) != 'undefined') {
                                            modules.showImages.imgurCalls[apiURL].setAttribute('href',json.image.links.original);
                                        }
                                    }
                                }
                            });
                        }
                    } 
                    if (groups) this.createImageExpando(ele);
                } else if (isEhost) {
                    if (href.substr(-1) != '+') {
                        var groups = this.ehostHashRe.exec(href);
                        if (groups) {
                            ele.setAttribute('href','http://i.eho.st/'+groups[1]+'.jpg');
                            this.createImageExpando(ele);
                        }
                    }
                } else if (isSnaggy) {
                    var extensions = ['.jpg','.png','.gif'];
                    if (href.indexOf('i.snag') === -1) href = href.replace('snag.gy','i.snag.gy');
                    if (extensions.indexOf(href.substr(-4)) === -1) href = href+'.jpg';
                    ele.setAttribute('href',href);
                    this.createImageExpando(ele);
                } else if (isMinus) {
                    var splithref = href.split('?');
                    href = splithref[0];
                    var getExt = href.split('.');
                    var ext = '';
                    if (getExt.length > 1) {
                        ext = getExt[getExt.length-1].toLowerCase();
                    } 
                    if ((ext != 'jpg') && (ext != 'jpeg') && (ext != 'gif') && (ext != 'png')) {
                        var orighref = href;
                        var groups = this.minusHashRe.exec(href);
                        if (groups && !groups[2]) {
                            var imgHash = groups[1];
                            if (imgHash.substr(0,1) === 'm') {
                                var apiURL = 'http://min.us/api/GetItems/' + imgHash;
                                if (typeof(this.minusCalls[apiURL]) === 'undefined') {
                                    this.minusCalls[apiURL] = ele;
                                    GM_xmlhttpRequest({ 
                                        method: 'GET', 
                                        url: apiURL,
                                        onload: function(response) {
                                            // console.log(response.responseText);
                                            var json = safeJSON.parse(response.responseText, null, true);
                                            if (typeof(json.ITEMS_GALLERY) === 'undefined') {
                                                // return; // api failure
                                            } else {
                                                var firstImg = json.ITEMS_GALLERY[0];
                                                var imageString = json.ITEMS_GALLERY.join(' ');
                                                modules.showImages.minusCalls[apiURL].setAttribute('minusgallery',imageString);
                                            }
                                        }
                                    });
                                }
                                this.createImageExpando(ele);
                            } // if not 'm', not a gallery, we can't do anything with the API.
                        }
                    } else {
                        this.createImageExpando(ele);
                    }
                } else if (isFlickr) {
                    // Check to make sure we don't already have an expando... Reddit creates them for videos.
                    var videoExpando = ele.parentNode.parentNode.querySelector('DIV.video');
                    if (videoExpando == null) {
                        this.createImageExpando(ele);
                    }
                } else if (isQkme) {
                    var groups = this.qkmeHashRe.exec(href);
                    if (groups) {
                        ele.setAttribute('href','http://i.qkme.me/'+groups[1]+'.jpg');
                        this.createImageExpando(ele);
                    }
                } else {
                    this.createImageExpando(ele);
                }
            }
        } else if (!(hasClass(ele,'imgFound'))) {
            if (!(RESUtils.currentSubreddit('dashboard')) && !(ele.getAttribute('scanned') === 'true') && (checkhref.indexOf('wikipedia.org/wiki') < 0) && (checkhref.indexOf('imgur.')>=0 || checkhref.indexOf('.jpeg')>=0 || checkhref.indexOf('.jpg')>=0 || checkhref.indexOf('.gif')>=0)) {
                var textFrag = document.createElement('span');
                textFrag.setAttribute('class','RESdupeimg');
                textFrag.innerHTML = ' <a class="noKeyNav" href="#img'+this.imagesRevealed[href]+'" title="click to scroll to original">[RES ignored duplicate image]</a>';
                $(ele).after(textFrag);
            }
        }
    },
    createImageExpando: function(obj) {
        var href = obj.getAttribute('href');
        this.imagesRevealed[href] = this.dupeAnchors;
        ele.setAttribute('name','img'+this.dupeAnchors);
        addClass(obj,'imgFound');
        obj.setAttribute('scanned','true');
        this.imageList.push(obj);
        var thisExpandLink = document.createElement('a');
        thisExpandLink.setAttribute('class','toggleImage expando-button image');
        // thisExpandLink.innerHTML = '[show img]';
        thisExpandLink.innerHTML = '&nbsp;';
        removeClass(thisExpandLink, 'expanded');
        addClass(thisExpandLink, 'collapsed');
        thisExpandLink.addEventListener('click', function(e) {
            e.preventDefault();
            var isCollapsed = hasClass(e.target, 'collapsed') != null;
            modules.showImages.revealImage(e.target, isCollapsed);
        }, true);
        if (hasClass(obj.parentNode,'title')) {
            var nodeToInsertAfter = obj.parentNode;
            addClass(thisExpandLink, 'linkImg');
            /* reddit broke this :(
            if (this.options.hoverPreview.value) {
                thisExpandLink.addEventListener('mouseover', function(e) {
                    e.preventDefault();
                    modules.showImages.thumbnailTarget = e.target;
                    modules.showImages.toolTipTimer = setTimeout(modules.showImages.showThumbnail, 1000);
                }, false);
                thisExpandLink.addEventListener('mouseout', function(e) {
                    e.preventDefault();
                    clearTimeout(modules.showImages.toolTipTimer);
                    modules.showImages.hideThumbnail();
                }, false);
            }
            */
        } else {
            var nodeToInsertAfter = obj;
            addClass(thisExpandLink, 'commentImg');
        }
        $(nodeToInsertAfter).after(thisExpandLink);
        if (this.scanningSelfText && this.options.autoExpandSelfText.value) {
            this.revealImage(thisExpandLink, true);
        }
    },
    showThumbnail: function() {
        var gpClass = modules.showImages.thumbnailTarget.parentNode.parentNode.getAttribute('class');
        console.log(gpClass);
        var idRe = /id-([\w]+)/;
        var match = idRe.exec(gpClass);
        if (match && (typeof(match[1]) != 'undefined')) {
            thisXY=RESUtils.getXYpos(modules.showImages.thumbnailTarget);
            // console.log(thisXY.x);
            thisXY.x += 30;
            // console.log(thisXY.x);
            modules.showImages.toolTip.innerHTML = '<img src="http://thumbs.reddit.com/'+match[1]+'.png">';
            // console.log('top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
            modules.showImages.toolTip.setAttribute('style', 'top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
            RESUtils.fadeElementIn(modules.showImages.toolTip, 0.3);
        }
    },
    hideThumbnail: function(e) {
        if (modules.showImages.toolTip.getAttribute('isfading') != 'in') {
            RESUtils.fadeElementOut(modules.showImages.toolTip, 0.3);
        } else {
            // image is in the middle of fading in... try again in 200ms and fade it out after it's done fading in.
            setTimeout(modules.showImages.hideThumbnail, 200);
        }
    },
    revealImage: function(showLink, showhide) {
        clearTimeout(modules.showImages.toolTipTimer);
        this.hideThumbnail();
        // showhide = false means hide, true means show!
        if (hasClass(showLink, 'commentImg')) {
            var thisImageLink = showLink.previousSibling;
            var imageCheck = showLink.nextSibling;
        } else {
            var thisImageLink = showLink.parentNode.firstChild.firstChild;
            var imageCheck = showLink.parentNode.lastChild;
        }
        // Check if the next sibling is an image. If so, we've already revealed that image.
        if ((typeof imageCheck != 'undefined') && (imageCheck != null) && (typeof(imageCheck.tagName) != 'undefined') && (hasClass(imageCheck, 'madeVisible'))) {
            // if ((showhide != true) && (imageCheck.style.display != 'none')) {
            if (showhide != true) {
                imageCheck.style.display = 'none';
                removeClass(showLink, 'expanded');
                addClass(showLink, 'collapsed');
                $('div.side').fadeIn();
            } else {
                imageCheck.style.display = 'block';
                removeClass(showLink, 'collapsed');
                addClass(showLink, 'expanded');
            }
        } else {
            // we haven't revealed this image before. Load it in.
            var href = thisImageLink.getAttribute('href').replace('"','&quot;');
            var orighref = href;
            var ext = (href.indexOf('imgur.')>=0 && href.indexOf('.jpg')<0 && href.indexOf('.png')<0 && href.indexOf('.gif')<0) ? '.jpg' :'';
            /*
            if ((this.options.imageSize.value != null) && (this.options.imageSize.value != '') && (href.indexOf('imgur.com') != -1)) {
                var repString = this.options.imageSize.value + '.' + ext;
                orighref = href.replace(repString, '.'+ext);
            }
            */
            var img = document.createElement('div');
            img.setAttribute('class','madeVisible');
            var imgA = document.createElement('a');
            addClass(imgA,'madeVisible');
            if (this.options.openInNewWindow.value) {
                imgA.setAttribute('target','_blank');
            }
            imgA.setAttribute('href',orighref);
            img.appendChild(imgA);
            if (thisImageLink.getAttribute('minusGallery') != null) {
                var imageList = thisImageLink.getAttribute('minusGallery').split(' ');
                var imageNum = 0;
                var hashTest = thisImageLink.getAttribute('href').split('#');
                if (hashTest.length > 1) {
                    imageNum = hashTest[1] - 1;
                }
                var href = imageList[imageNum];
                // if the min.us gallery is empty, the image was deleted.. show a placeholder..
                if (href === '') href = 'http://i.min.us/ibmYy2.jpg';
                imgA.innerHTML = '<img class="RESImage" style="max-width:'+this.options.maxWidth.value+'px; max-height:'+this.options.maxHeight.value+'px;" src="' + href + ext + '" /><div class="isGallery">[this is the first image in a gallery - click for more]</div>';
                var imgTag = img.querySelector('IMG');
                this.trackImageLoad(imgTag);
                this.makeImageZoomable(imgTag);
            } else if (href.indexOf('www.flickr.com') >= 0) {
                this.flickrImages[href] = img;
                GM_xmlhttpRequest({
                    method:    "GET",
                    url:    href,
                    onload:    function(response) {
                        var thisHTML = response.responseText;
                        var tempDiv = document.createElement(tempDiv);
                        // This regex has been commented out because it slows Opera WAY down...
                        // It's there as a security check to kill out any script tags... but for now it's not known to cause any problems if we leave it, so we will.
                        // tempDiv.innerHTML = thisHTML.replace(/<script(.|\s)*?\/script>/g, '');
                        tempDiv.innerHTML = thisHTML;
                        if (href.indexOf('/sizes') != -1) {
                            var flickrImg = tempDiv.querySelector('#allsizes-photo > IMG');
                        } else {
                            var flickrImg = tempDiv.querySelector('#photo > .photo-div > IMG');
                        }
                        var flickrStyle = 'display:block;max-width:'+modules.showImages.options.maxWidth.value+'px;max-height:'+modules.showImages.options.maxHeight.value+'px;';
                        flickrImg.setAttribute('width','');
                        flickrImg.setAttribute('height','');
                        flickrImg.setAttribute('style',flickrStyle);
                        modules.showImages.flickrImages[href].querySelector('a').appendChild(flickrImg);
                        var imgTag = img.querySelector('IMG');
                        imgTag.setAttribute('flickrsrc',href);
                        modules.showImages.trackImageLoad(imgTag);
                        modules.showImages.makeImageZoomable(imgTag);
                    }
                });
            } else {
                imgA.innerHTML = '<img title="drag to resize" class="RESImage" style="max-width:'+this.options.maxWidth.value+'px;max-height:'+this.options.maxHeight.value+'px;" src="' + href + ext + '" />';
                var imgTag = img.querySelector('IMG');
                this.trackImageLoad(imgTag);
                this.makeImageZoomable(imgTag);
            }
            // var clear = document.createElement('div');
            // clear.setAttribute('class','RESclear');
            if (hasClass(showLink, 'commentImg')) {
                $(showLink).after(img);
            } else {
                showLink.parentNode.appendChild(img);
            }
            // $(showLink).after(img);
            // $(img).after(clear);
            removeClass(showLink, 'collapsed');
            addClass(showLink, 'expanded');
        }
    },
    trackImageLoad: function(imgTag) {
        if (this.options.markVisited.value) {
            imgTag.addEventListener('load', function(e) {
                var thisURL = e.target.getAttribute('src');
                if (e.target.getAttribute('flickrsrc')) {
                    thisURL = e.target.getAttribute('flickrsrc');
                }
                addClass(e.target.parentNode,'visited');
                modules.showImages.imageTrackStack.push(thisURL);
                if (modules.showImages.imageTrackStack.length === 1) setTimeout(modules.showImages.imageTrackPop, 300);
            }, false);
        }
    },
    imageTrackPop: function() {
        var thisURL = modules.showImages.imageTrackStack.pop();
        if (typeof thisURL != 'undefined') {
            if (typeof(modules.showImages.imageTrackFrame.contentWindow) != 'undefined') {
                modules.showImages.imageTrackFrame.contentWindow.location.replace(thisURL);
            } else if (typeof chrome != 'undefined') {
                if (!(chrome.extension.inIncognitoContext)) {
                    thisJSON = {
                        requestType: 'addURLToHistory',
                        url: thisURL
                    }
                    chrome.extension.sendRequest(thisJSON, function(response) {
                        // we don't need to do anything here...
                    });
                }
            } else {
                modules.showImages.imageTrackFrame.location.replace(thisURL);
            }
        }
    },
    makeImageZoomable: function(imgTag) {
        if (this.options.imageZoom.value) {
            // Add listeners for drag to resize functionality...
            imgTag.addEventListener('mousedown', function(e) {
                if (e.button === 0) {
                    $(imgTag).data('containerWidth',$(imgTag).closest('.entry').width());
                    modules.showImages.dragTargetData.iw=e.target.width;
                    modules.showImages.dragTargetData.d=modules.showImages.getDragSize(e);
                    modules.showImages.dragTargetData.dr=false;
                    e.preventDefault();
                }
            }, true);
            imgTag.addEventListener('mousemove', function(e) {
                if (modules.showImages.dragTargetData.d){
                    e.target.style.maxWidth=e.target.style.width=((modules.showImages.getDragSize(e))*modules.showImages.dragTargetData.iw/modules.showImages.dragTargetData.d)+"px";
                    if (parseInt(e.target.style.maxWidth) > $(e.target).data('containerWidth')) {
                        $('div.side').fadeOut();
                    } else {
                        $('div.side').fadeIn();
                    }
                    e.target.style.maxHeight='';
                    e.target.style.height='auto';
                    modules.showImages.dragTargetData.dr=true;
                }
            }, false);
            imgTag.addEventListener('mouseout', function(e) {
                modules.showImages.dragTargetData.d=false;
                if (modules.showImages.dragTargetData.dr) return false;
            }, false);
            imgTag.addEventListener('mouseup', function(e) {
                e.target.style.maxWidth=e.target.style.width=((modules.showImages.getDragSize(e))*modules.showImages.dragTargetData.iw/modules.showImages.dragTargetData.d)+"px";
                if (parseInt(e.target.style.maxWidth) > $(e.target).data('containerWidth')) {
                    $('div.side').fadeOut();
                } else {
                    $('div.side').fadeIn();
                }
                modules.showImages.dragTargetData.d=false;
                if (modules.showImages.dragTargetData.dr) return false;
            }, false);
            imgTag.addEventListener('click', function(e) {
                modules.showImages.dragTargetData.d=false;
                if (modules.showImages.dragTargetData.dr) {
                    e.preventDefault();
                    return false;
                }
            }, false);
        }
    },
    dragTargetData: {},
    showImages: function(gonewild, showmore) {
        if ((this.allImagesVisible) && (!(showmore))) {
            // Images are visible, and this request didn't come from never ending reddit, so hide the images...
            // (if it came from NER, we'd want to make the next batch also visible...)
            this.allImagesVisible = false;
            var imageList = document.body.querySelectorAll('div.madeVisible');
            for (var i=0, len=this.imageList.length;i<len;i++) {
                if (typeof(imageList[i]) != 'undefined') {
                    if (hasClass(imageList[i].previousSibling,'commentImg')) {
                        var targetExpando = imageList[i].previousSibling;
                    } else {
                        var targetExpando = imageList[i].parentNode.firstChild.nextSibling;
                    }
                    this.revealImage(targetExpando, false);
                }
            }
            this.viewButton.innerHTML = 'view images ('+this.imageList.length+')';
            return false;
        } else {
            this.allImagesVisible = true;
            this.viewButton.innerHTML = 'hide images ('+this.imageList.length+')';
            var gw = gonewild || '';
            this.findImages(gw, true);
        }
    }
};
