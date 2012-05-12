modules['hideChildComments'] = {
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
			// do stuff now!
			// this is where your code goes...
			var toggleButton = document.createElement('li');
			this.toggleAllLink = document.createElement('a');
			this.toggleAllLink.innerHTML = 'hide all child comments';
			this.toggleAllLink.setAttribute('action','hide');
			this.toggleAllLink.setAttribute('href','javascript:void(0);');
			this.toggleAllLink.setAttribute('title','Show only replies to original poster.');
			this.toggleAllLink.addEventListener('click', function() {
				modules['hideChildComments'].toggleComments(this.getAttribute('action'));
				if (this.getAttribute('action') == 'hide') {
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
						modules['hideChildComments'].toggleComments(this.getAttribute('action'), this);
						if (this.getAttribute('action') == 'hide') {
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
					if (typeof(sib) != 'undefined') {
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
			if (thisChildren.tagName == 'FORM') thisChildren = thisChildren.nextSibling;
			(action == 'hide') ? thisChildren.style.display = 'none' : thisChildren.style.display = 'block';
		} else {
			// toggle all comments
			var commentContainers = document.querySelectorAll('div.commentarea > div.sitetable > div.thing');
			for (var i=0, len=commentContainers.length; i<len; i++) {
				var thisChildren = commentContainers[i].querySelector('div.child > div.sitetable');
				var thisToggleLink = commentContainers[i].querySelector('a.toggleChildren');
				if (thisToggleLink != null) {
					if (action == 'hide') {
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

modules['showParent'] = {
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
			// do stuff now!
			// this is where your code goes...
			
			// code included from http://userscripts.org/scripts/show/34362
			// author: lazyttrick - http://userscripts.org/users/20871

			this.wireUpParentLinks();
			// Watch for any future 'reply' forms.
			document.body.addEventListener(
				'DOMNodeInserted',
				function( event ) {
					if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
						modules['showParent'].wireUpParentLinks(event.target);
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
			if ((!(modules['styleTweaks'].options.commentBoxes.value)) || (!(modules['styleTweaks'].isEnabled())))  {
				(modules['styleTweaks'].options.lightOrDark.value == 'dark') ? bgFix = 'border: 1px solid #666666; padding: 4px; background-color: #333333;' : bgFix = 'border: 1px solid #666666; padding: 4px; background-color: #FFFFFF;';
			}
			div.setAttribute('style','width:auto;position:absolute; top:'+top+'px; left:'+left+'px; '+bgFix+';');
			var parentDiv = document.querySelector('div.id-t1_'+id);
			div.innerHTML = parentDiv.innerHTML.replace(/\<ul\s+class[\s\S]+\<\/ul\>/,"").replace(/\<a[^\>]+>\[-\]\<\/a\>/,'');
			modules['showParent'].getTag('body')[0].appendChild(div);
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
			var div = modules['showParent'].getId("parentComment"+id);
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
				parentLinks[i].addEventListener('mouseover', modules['showParent'].show, false);
				parentLinks[i].addEventListener('mouseout', modules['showParent'].hide, false);
			}
		} else {
			this.parentLinks = ele.querySelectorAll(querySelector);
			this.parentLinksCount = this.parentLinks.length;
			this.parentLinksi = 0;
			(function(){
				// add 15 event listeners at a time...
				var chunkLength = Math.min((modules['showParent'].parentLinksCount - modules['showParent'].parentLinksi), 15);
				for (var i=0;i<chunkLength;i++) {
					modules['showParent'].parentLinks[modules['showParent'].parentLinksi].addEventListener('mouseover', modules['showParent'].show, false);
					modules['showParent'].parentLinks[modules['showParent'].parentLinksi].addEventListener('mouseout', modules['showParent'].hide, false);
					modules['showParent'].parentLinksi++;
				}
				if (modules['showParent'].parentLinksi < modules['showParent'].parentLinksCount) {
					setTimeout(arguments.callee, 1000);
				}
			})();		
		}
	}
};

modules['neverEndingReddit'] = {
	moduleID: 'neverEndingReddit',
	moduleName: 'Never Ending Reddit',
	category: 'UI',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		returnToPrevPage: {
			type: 'boolean',
			value: true,
			description: 'Return to the page you were last on when hitting "back" button?'
		},
		autoLoad: {
			type: 'boolean',
			value: true,
			description: 'Automatically load new page on scroll (if off, you click to load)'
		},
		hideDupes: {
			type: 'enum',
			value: 'fade',
			values: [
				{ name: 'Fade', value: 'fade' },
				{ name: 'Hide', value: 'hide' },
				{ name: 'Do not hide', value: 'none' }
			],
			description: 'Fade or completely hide duplicate posts from previous pages.'
		}
	},
	description: 'Inspired by modules like River of Reddit and Auto Pager - gives you a never ending stream of reddit goodness.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\_\?=]*/i
	],
	exclude: [
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#NERModal { display: none; z-index: 999; position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: #333333; opacity: 0.6; }');
			RESUtils.addCSS('#NERContent { display: none; position: fixed; top: 40px; z-index: 1000; width: 720px; background-color: #FFFFFF; color: #000000; padding: 10px; font-size: 12px; }');
			RESUtils.addCSS('#NERModalClose { position: absolute; top: 3px; right: 3px; }');
			RESUtils.addCSS('#NERFail { width: 95%; height: 30px; font-size: 14px; border: 1px solid #999999; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; padding: 5px; text-align: center; bgcolor: #f0f3fc; cursor: pointer; }');
			RESUtils.addCSS('.NERdupe p.title:after { color: #000000; font-size: 10px; content: \' (duplicate from previous page)\'; }');
			RESUtils.addCSS('.NERPageMarker { text-align: center; color: #7f7f7f; font-size: 14px; margin-top: 6px; margin-bottom: 6px; font-weight: normal; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; padding: 3px 0px 3px 0px; }');
			switch (this.options.hideDupes.value) {
				case 'fade':
					RESUtils.addCSS('.NERdupe { opacity: 0.3; }');
					break;
				case 'hide':
					RESUtils.addCSS('.NERdupe { display: none; }');
					break;
			}
			// set the style for our little loader widget
			RESUtils.addCSS('#progressIndicator { width: 95%; height: 30px; font-size: 14px; border: 1px solid #999999; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; padding: 5px; text-align: center; bgcolor: #f0f3fc; cursor: pointer; } ');
			RESUtils.addCSS('#NREMailCount { margin-left: 0px; float: left; margin-top: 3px;}');
			RESUtils.addCSS('#NREPause { margin-left: 2px; width: 16px; height: 16px; float: left; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); cursor: pointer; background-position: 0px -192px; }');
			RESUtils.addCSS('#NREPause.paused { width: 16px; height: 16px; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); cursor: pointer; background-position: -16px -192px; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			
			// modified from a contribution by Peter Siewert, thanks Peter!
			if (typeof(modules['neverEndingReddit'].dupeHash) == 'undefined') modules['neverEndingReddit'].dupeHash = {};
			var entries = document.body.querySelectorAll('a.comments');
			for(var i = entries.length - 1; i > -1; i--) {
				modules['neverEndingReddit'].dupeHash[entries[i].href] = 1;
			}
			
			this.allLinks = document.body.querySelectorAll('#siteTable div.thing');
			
			// code inspired by River of Reddit, but rewritten from scratch to work across multiple browsers...
			// Original River of Reddit author: reddy kapil
			// Original link to Chrome extension: https://chrome.google.com/extensions/detail/bjiggjllfebckflfdjbimogjieeghcpp
			
			// store access to the siteTable div since that's where we'll append new data...
			var stMultiCheck = document.querySelectorAll('#siteTable');
			this.siteTable = stMultiCheck[0];
			// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
			if (stMultiCheck.length == 2) {
				// console.log('skipped first sitetable, stupid reddit.');
				this.siteTable = stMultiCheck[1];
			}
			// get the first link to the next page of reddit...
			var nextPrevLinks = document.body.querySelectorAll('.content .nextprev a');
			if (nextPrevLinks.length > 0) {
				var nextLink = nextPrevLinks[nextPrevLinks.length-1];
				if (nextLink) {
					this.nextPageURL = nextLink.getAttribute('href');
					var nextXY=RESUtils.getXYpos(nextLink);
					this.nextPageScrollY = nextXY.y;
				}
				this.attachLoaderWidget();
				
				//Reset this info if the page is in a new tab
				// wait, this is always  tre... commenting out.
				/*
				if (window.history.length) {
					console.log('delete nerpage');
					delete sessionStorage['NERpage'];
				*/
				if (this.options.returnToPrevPage.value) {
					// if the user clicks any external links, save that link
					// get all external links and track clicks...
					$('a.title[href^="http://"]').live('click', function(e) {
						// if left click and not going to open in a new tab...
						if ((this.target != '_blank') && (e.which == 1)) sessionStorage.lastPageURL = this.href;
					});
					this.returnToPrevPageCheck();
				}
					
				// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
				if (this.options.autoLoad.value) {
					window.addEventListener('scroll', modules['neverEndingReddit'].handleScroll, false);
				}
			}
			// hide any next/prev page indicators
			var nextprev = document.body.querySelectorAll('.content p.nextprev');
			for (var i=0, len=nextprev.length;i<len;i++) {
				nextprev[i].style.display = 'none';
			}
			// check if the user has new mail...
			this.navMail = document.body.querySelector('#mail');
			this.NREFloat = createElementWithID('div','NREFloat');
			this.NREPause = createElementWithID('div','NREPause');
			this.NREPause.setAttribute('title','Pause / Restart Never Ending Reddit');
			this.isPaused = (RESStorage.getItem('RESmodules.neverEndingReddit.isPaused') == true);
			if (this.isPaused) addClass(this.NREPause,'paused');
			this.NREPause.addEventListener('click',modules['neverEndingReddit'].togglePause, false);
			if ((modules['betteReddit'].options.pinHeader.value != 'userbar') && (modules['betteReddit'].options.pinHeader.value != 'header')) {
				this.NREMail = createElementWithID('a','NREMail');
				if (modules['betteReddit'].options.pinHeader.value == 'sub') {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 23px; right: 8px; display: none; }');
				} else if (modules['betteReddit'].options.pinHeader.value == 'subanduser') {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 44px; right: 0px; display: none; }');
					RESUtils.addCSS('#NREMail { display: none; }');
					RESUtils.addCSS('#NREMailCount { display: none; }');
				} else {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 10px; right: 10px; display: none; }');
				}
				RESUtils.addCSS('#NREMail { width: 16px; height: 12px; float: left; margin-top: 4px; }');
				RESUtils.addCSS('#NREMail.nohavemail { background-image: url(/static/sprite-main.png?v=816b8dcd1f863d0343bb5e0d9e094215); background-position: -16px -521px; }');
				RESUtils.addCSS('#NREMail.havemail { background-image: url(/static/sprite-main.png?v=816b8dcd1f863d0343bb5e0d9e094215); background-position: 0 -521px; }');
				this.NREFloat.appendChild(this.NREMail);
				this.NREMailCount = createElementWithID('a','NREMailCount');
				this.NREMailCount.display = 'none';
				this.NREMailCount.setAttribute('href','/message/unread');
				this.NREFloat.appendChild(this.NREMailCount);
				var hasNew = false;
				if ((typeof(this.navMail) != 'undefined') && (this.navMail != null)) {
					hasNew = hasClass(this.navMail,'havemail');
				}
				this.setMailIcon(hasNew);
			} else {
				this.NREMail = this.navMail;
				RESUtils.addCSS('#NREFloat { position: fixed; top: 30px; right: 8px; display: none; }');
			}
			this.NREFloat.appendChild(this.NREPause);
			document.body.appendChild(this.NREFloat);
		}
	},
	pageMarkers: [],
	pageURLs: [],
	togglePause: function() {
		modules['neverEndingReddit'].isPaused = !modules['neverEndingReddit'].isPaused;
		RESStorage.setItem('RESmodules.neverEndingReddit.isPaused', modules['neverEndingReddit'].isPaused);
		if (modules['neverEndingReddit'].isPaused) {
			addClass(modules['neverEndingReddit'].NREPause, 'paused');
		} else {
			removeClass(modules['neverEndingReddit'].NREPause, 'paused');
			modules['neverEndingReddit'].handleScroll();
		}
	},
	returnToPrevPageCheck: function() {
		this.attachModalWidget();
		// Set the current page to page 1...
		this.currPage = 1;
		if ((sessionStorage.NERpageURL) && (sessionStorage.NERpageURL != sessionStorage.lastPageURL)) {
			var backButtonPageNumber = sessionStorage.getItem('NERpage') || 1;
			if (backButtonPageNumber > 1) {
				this.currPage = backButtonPageNumber;
				this.loadNewPage(true);
			}
		}
		sessionStorage.lastPageURL = location.href;
	},
	handleScroll: function(e) {
		if (modules['neverEndingReddit'].scrollTimer) clearTimeout(modules['neverEndingReddit'].scrollTimer);
		modules['neverEndingReddit'].scrollTimer = setTimeout(modules['neverEndingReddit'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function(e) {
		var thisPageNum = 1;
		for (var i=0, len=modules['neverEndingReddit'].pageMarkers.length; i<len; i++) {
			var thisXY = RESUtils.getXYpos(modules['neverEndingReddit'].pageMarkers[i]);
			if (thisXY.y < window.pageYOffset) {
				thisPageNum = modules['neverEndingReddit'].pageMarkers[i].getAttribute('id').replace('page-','');
			} else {
				break;
			}
		}
		var thisPageType = RESUtils.pageType()+'.'+RESUtils.currentSubreddit();
		RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.'+thisPageType, modules['neverEndingReddit'].pageURLs[thisPageNum]);
		if (thisPageNum != sessionStorage.NERpage) {
			if (thisPageNum > 1) {
				sessionStorage.NERpageURL = location.href;
				sessionStorage.NERpage = thisPageNum;
				modules['neverEndingReddit'].pastFirstPage = true;
			} else {
				delete sessionStorage['NERpage'];
			}
		}
		if ((modules['neverEndingReddit'].fromBackButton != true) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
			for (var i=0, len=modules['neverEndingReddit'].allLinks.length; i<len; i++) {
				if (RESUtils.elementInViewport(modules['neverEndingReddit'].allLinks[i])) {
					var thisClassString = modules['neverEndingReddit'].allLinks[i].getAttribute('class');
					var thisClass = thisClassString.match(/id-t[\d]_[\w]+/);
					if (thisClass) {
						var thisID = thisClass[0];
						var thisPageType = RESUtils.pageType()+'.'+RESUtils.currentSubreddit();
						RESStorage.setItem('RESmodules.neverEndingReddit.lastVisibleIndex.'+thisPageType, thisID);
						break;
					}
				}
			}
		}
		if ((RESUtils.elementInViewport(modules['neverEndingReddit'].progressIndicator)) && (modules['neverEndingReddit'].fromBackButton != true)) {
			if (modules['neverEndingReddit'].isPaused != true) {
				modules['neverEndingReddit'].loadNewPage();
			}
		}
		if ($(window).scrollTop() > 30) {
			modules['neverEndingReddit'].showFloat(true);
		} else {
			modules['neverEndingReddit'].showFloat(false);
		}
	},	
	duplicateCheck: function(newHTML){
		var newLinks = newHTML.querySelectorAll('div.link');
		for(var i = newLinks.length - 1; i > -1; i--) {
			var newLink = newLinks[i];
			var thisCommentLink = newLink.querySelector('a.comments').href;
			if( modules['neverEndingReddit'].dupeHash[thisCommentLink] ) {
				// console.log('found a dupe: ' + newLink.querySelector('a.title').innerHTML);
			  // let's not remove it altogether, but instead dim it...
			  // newLink.parentElement.removeChild(newLink);
			  addClass(newLink, 'NERdupe');
			} else {
				modules['neverEndingReddit'].dupeHash[thisCommentLink] = 1;
			}
		}
		return newHTML;
	},
	setMailIcon: function(newmail) {
		if (RESUtils.loggedInUser() == null) return false;
		if (newmail) {
			modules['neverEndingReddit'].hasNewMail = true;
			removeClass(this.NREMail, 'nohavemail');
			this.NREMail.setAttribute('href','http://www.reddit.com/message/unread/');
			this.NREMail.setAttribute('title','new mail!');
			var newMailImg = '/static/mail.png';
			if (modules['styleTweaks'].options.colorBlindFriendly.value) {
				newMailImg = 'http://thumbs.reddit.com/t5_2s10b_5.png';
			}
			addClass(this.NREMail, 'havemail');
			// this.NREMail.innerHTML = '<img src="'+newMailImg+'" alt="messages">';
			modules['betteReddit'].showUnreadCount();
		} else {
			modules['neverEndingReddit'].hasNewMail = false;
			addClass(this.NREMail, 'nohavemail');
			this.NREMail.setAttribute('href','http://www.reddit.com/message/inbox/');
			this.NREMail.setAttribute('title','no new mail');
			removeClass(this.NREMail, 'havemail');
			// this.NREMail.innerHTML = '<img src="/static/mailgray.png" alt="messages">';
		}
	},
	attachModalWidget: function() {
		this.modalWidget = createElementWithID('div','NERModal');
		this.modalWidget.innerHTML = '&nbsp;';
		this.modalContent = createElementWithID('div','NERContent');
		this.modalContent.innerHTML = '<div id="NERModalClose" class="RESCloseButton">X</div>Never Ending Reddit has detected that you are returning from a page that it loaded. Please give us a moment while we reload that content and return you to where you left off.<br><img src="'+RESConsole.loader+'">';
		document.body.appendChild(this.modalWidget);
		document.body.appendChild(this.modalContent);
		$('#NERModalClose').click(function() {
			$(modules['neverEndingReddit'].modalWidget).hide();
			$(modules['neverEndingReddit'].modalContent).hide();
		});
	},
	attachLoaderWidget: function() {
		// add a widget at the bottom that will be used to detect that we've scrolled to the bottom, and will also serve as a "loading" bar...
		this.progressIndicator = document.createElement('p');
		var scrollMsg = (this.options.autoLoad.value) ? 'scroll or ' : '';
		this.progressIndicator.innerHTML = 'Never Ending Reddit... ['+scrollMsg+'click to activate]';
		this.progressIndicator.id = 'progressIndicator';
		this.progressIndicator.className = 'neverEndingReddit';
		this.progressIndicator.addEventListener('click', function(e) {
			e.preventDefault();
			modules['neverEndingReddit'].loadNewPage();
		}, false);
		insertAfter(this.siteTable, this.progressIndicator);
	},
	loadNewPage: function(fromBackButton, reload) {
		if (fromBackButton) {
			this.fromBackButton = true;
			var thisPageType = RESUtils.pageType()+'.'+RESUtils.currentSubreddit();
			var savePageURL = this.nextPageURL;
			this.nextPageURL = RESStorage.getItem('RESmodules.neverEndingReddit.lastPage.'+thisPageType);
			if ((this.nextPageURL == 'undefined') || (this.nextPageURL == null)) {
				// something went wrong, probably someone hit refresh. Just revert to the first page...
				modules['neverEndingReddit'].fromBackButton = false;
				this.nextPageURL = savePageURL;
				this.currPage = 1;
				return false;
			}
			var leftCentered = Math.floor((window.innerWidth - 720) / 2);
			this.modalWidget.style.display = 'block';
			this.modalContent.style.display = 'block';
			this.modalContent.style.left = leftCentered + 'px';
			// remove the progress indicator early, as we don't want the user to scroll past it on accident, loading more content.
			this.progressIndicator.parentNode.removeChild(modules['neverEndingReddit'].progressIndicator);
		} else {
			this.fromBackButton = false;
		}
		if (this.isLoading != true) {
			this.progressIndicator.removeEventListener('click', modules['neverEndingReddit'].loadNewPage , false);
			this.progressIndicator.innerHTML = '<img src="'+RESConsole.loader+'"> Loading next page...';
			this.isLoading = true;
			GM_xmlhttpRequest({
				method:	"GET",
				url:	this.nextPageURL,
				onload:	function(response) {
					if ((typeof(modules['neverEndingReddit'].progressIndicator.parentNode) != 'undefined') && (modules['neverEndingReddit'].progressIndicator.parentNode != null)) {
						modules['neverEndingReddit'].progressIndicator.parentNode.removeChild(modules['neverEndingReddit'].progressIndicator);
					}
					// drop the HTML we got back into a div...
					var thisHTML = response.responseText;
					var tempDiv = document.createElement('div');
					// clear out any javascript so we don't render it again...
					tempDiv.innerHTML = thisHTML.replace(/<script(.|\s)*?\/script>/g, '');
					// grab the siteTable out of there...
					var newHTML = tempDiv.querySelector('#siteTable');
					// did we find anything?
					if (newHTML) {
						var stMultiCheck = tempDiv.querySelectorAll('#siteTable');
						// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
						if (stMultiCheck.length == 2) {
							// console.log('skipped first sitetable, stupid reddit.');
							newHTML = stMultiCheck[1];
						}
						newHTML.setAttribute('ID','siteTable-'+modules['neverEndingReddit'].currPage+1);
						modules['neverEndingReddit'].duplicateCheck(newHTML);
						// check for new mail
						var hasNewMail = tempDiv.querySelector('#mail');
						if ((typeof(hasNewMail) != 'undefined') && (hasNewMail != null) && (hasClass(hasNewMail,'havemail'))) {
							modules['neverEndingReddit'].setMailIcon(true);
						} else {
							modules['neverEndingReddit'].setMailIcon(false);
						} 
						// load up uppers and downers, if enabled...
						// maybe not necessary anymore..
						/*
						if ((modules['uppersAndDowners'].isEnabled()) && (RESUtils.pageType() == 'comments')) {
							modules['uppersAndDowners'].applyUppersAndDownersToComments(modules['neverEndingReddit'].nextPageURL);
						}
						*/
						// get the new nextLink value for the next page...
						var nextPrevLinks = tempDiv.querySelectorAll('.content .nextprev a');
						if ((nextPrevLinks) && (nextPrevLinks.length)) {
							if (isNaN(modules['neverEndingReddit'].currPage)) modules['neverEndingReddit'].currPage = 1;
							if (!fromBackButton) modules['neverEndingReddit'].currPage++;
							if ((!(modules['neverEndingReddit'].fromBackButton)) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
								modules['neverEndingReddit'].pageURLs[modules['neverEndingReddit'].currPage] = modules['neverEndingReddit'].nextPageURL;
								var thisPageType = RESUtils.pageType()+'.'+RESUtils.currentSubreddit();
								RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.'+thisPageType, modules['neverEndingReddit'].nextPageURL);
								// let's not change the hash anymore now that we're doing it on scroll.
								// location.hash = 'page='+modules['neverEndingReddit'].currPage;
							}
							var nextLink = nextPrevLinks[nextPrevLinks.length-1];
							var pageMarker = createElementWithID('div','page-'+modules['neverEndingReddit'].currPage);
							addClass(pageMarker,'NERPageMarker');
							pageMarker.innerHTML = 'Page ' + modules['neverEndingReddit'].currPage;
							modules['neverEndingReddit'].siteTable.appendChild(pageMarker);
							modules['neverEndingReddit'].pageMarkers.push(pageMarker);
							modules['neverEndingReddit'].siteTable.appendChild(newHTML);
							modules['neverEndingReddit'].isLoading = false;
							if (nextLink) {
								// console.log(nextLink);
								if (nextLink.getAttribute('rel').indexOf('prev') != -1) {
									// remove the progress indicator from the DOM, it needs to go away.
									modules['neverEndingReddit'].progressIndicator.style.display = 'none';
									var endOfReddit = createElementWithID('div','endOfReddit');
									endOfReddit.innerHTML = 'You\'ve reached the last page available.  There are no more pages to load.';
									modules['neverEndingReddit'].siteTable.appendChild(endOfReddit);
									window.removeEventListener('scroll', modules['neverEndingReddit'].handleScroll, false);
								}else {
									// console.log('not over yet');
									modules['neverEndingReddit'].nextPageURL = nextLink.getAttribute('href');
									modules['neverEndingReddit'].attachLoaderWidget();
								}
							}
							modules['neverEndingReddit'].allLinks = document.body.querySelectorAll('#siteTable div.thing');
							if ((fromBackButton) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
								modules['neverEndingReddit'].modalWidget.style.display = 'none';
								modules['neverEndingReddit'].modalContent.style.display = 'none';
								// window.scrollTo(0,0)
								// RESUtils.scrollTo(0,modules['neverEndingReddit'].nextPageScrollY);
								var thisPageType = RESUtils.pageType()+'.'+RESUtils.currentSubreddit();
								var lastTopScrolledID = RESStorage.getItem('RESmodules.neverEndingReddit.lastVisibleIndex.'+thisPageType);
								var lastTopScrolledEle = document.body.querySelector('.'+lastTopScrolledID);
								if (!lastTopScrolledEle) {
									var lastTopScrolledEle = newHTML.querySelector('#siteTable div.thing');
								}
								var thisXY=RESUtils.getXYpos(lastTopScrolledEle);
								RESUtils.scrollTo(0, thisXY.y);
								modules['neverEndingReddit'].fromBackButton = false;
							}
						} else {
							var noresults = tempDiv.querySelector('#noresults');
							var noresultsfound = (noresults) ? true : false;
							modules['neverEndingReddit'].NERFail(noresultsfound);
						}
					}
				},
				onerror: function(err) {
					modules['neverEndingReddit'].NERFail();
				}
			});
		} else {
			// console.log('load new page ignored');
		}
	},
	NERFail: function(noresults) {
		modules['neverEndingReddit'].isLoading = false;
		var newHTML = createElementWithID('div','NERFail');
		if (noresults) {
			newHTML.innerHTML = 'Reddit has responded "there doesn\'t seem to be anything here." - this sometimes happens after several pages as votes shuffle posts up and down. You\'ll have to <a href="'+location.href.split('#')[0]+'">start from the beginning.</a>  If you like, you can try loading <a target="_blank" href="'+modules['neverEndingReddit'].nextPageURL+'">the same URL that RES tried to load.</a> If you are interested, there is a <a target="_blank" href="http://www.reddit.com/r/Enhancement/comments/s72xt/never_ending_reddit_and_reddit_barfing_explained/">technical explanation here</a>.';
			newHTML.setAttribute('style','cursor: auto !important;');
		} else {
			newHTML.innerHTML = 'It appears Reddit is under heavy load or has barfed for some other reason, so Never Ending Reddit couldn\'t load the next page. Click here to try to load the page again.';
			newHTML.addEventListener('click', function(e) {
				modules['neverEndingReddit'].attachLoaderWidget();
				modules['neverEndingReddit'].loadNewPage(false, true);
				e.target.parentNode.removeChild(e.target);
				e.target.innerHTML = 'Loading... or trying, anyway...';
			}, false);
		}
		modules['neverEndingReddit'].siteTable.appendChild(newHTML);
		modules['neverEndingReddit'].modalWidget.style.display = 'none';
		modules['neverEndingReddit'].modalContent.style.display = 'none';
	},
	showFloat: function(show) {
		if (show) {
			this.NREFloat.style.display = 'block';
		} else {
			this.NREFloat.style.display = 'none';
		}
	}
};
