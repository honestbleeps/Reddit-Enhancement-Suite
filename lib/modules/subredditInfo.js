modules['subredditInfo'] = {
	moduleID: 'subredditInfo',
	moduleName: 'Subreddit Info',
	category: 'UI',
	options: {
		hoverDelay: {
			type: 'text',
			value: 800,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.'
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.'
		},
		fadeSpeed: {
 			type: 'text',
			value: 0.3,
 			description: 'Fade animation\'s speed. Default is 0.3, the range is 0-1. Setting the speed to 1 will disable the animation.'
 		},
		USDateFormat: {
			type: 'boolean',
			value: false,
			description: 'Show date (subreddit created...) in US format (i.e. 08-31-2010)'
		}
	},
	description: 'Adds a hover tooltip to subreddits',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var css = '';
			css += '#subredditInfoToolTip { display: none; position: absolute; width: 412px; z-index: 10001; }';
			css += '#subredditInfoToolTip .subredditLabel { float: left; width: 140px; margin-bottom: 12px; }';
			css += '#subredditInfoToolTip .subredditDetail { float: left; width: 240px; margin-bottom: 12px; }';
			css += '#subredditInfoToolTip .blueButton { float: right; margin-left: 8px; cursor: pointer; margin-top: 12px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff !important; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #107ac4; }';
			css += '#subredditInfoToolTip .redButton { float: right; margin-left: 8px; cursor: pointer; margin-top: 12px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff !important; border: 1px solid #bc3d1b; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #ff5757; }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...

			// create a cache for subreddit data so we only load it once even if the hover is triggered many times
			this.subredditInfoCache = [];

			// create the tooltip...
			this.subredditInfoToolTip = createElementWithID('div', 'subredditInfoToolTip', 'RESDialogSmall');
			this.subredditInfoToolTipHeader = document.createElement('h3');
			this.subredditInfoToolTip.appendChild(this.subredditInfoToolTipHeader);
			this.subredditInfoToolTipCloseButton = createElementWithID('div', 'subredditInfoToolTipClose', 'RESCloseButton');
			this.subredditInfoToolTipCloseButton.innerHTML = 'X';
			this.subredditInfoToolTip.appendChild(this.subredditInfoToolTipCloseButton);
			this.subredditInfoToolTipCloseButton.addEventListener('click', function(e) {
				if (typeof(modules['subredditInfo'].hideTimer) != 'undefined') {
					clearTimeout(modules['subredditInfo'].hideTimer);
				}
				modules['subredditInfo'].hideSubredditInfo();
			}, false);
			this.subredditInfoToolTipContents = createElementWithID('div','subredditInfoToolTipContents', 'RESDialogContents');
			this.subredditInfoToolTip.appendChild(this.subredditInfoToolTipContents);
			this.subredditInfoToolTip.addEventListener('mouseover', function(e) {
				if (typeof(modules['subredditInfo'].hideTimer) != 'undefined') {
					clearTimeout(modules['subredditInfo'].hideTimer);
				}
			}, false);
			this.subredditInfoToolTip.addEventListener('mouseout', function(e) {
				if (e.target.getAttribute('class') != 'hoverSubreddit') {
					modules['subredditInfo'].hideTimer = setTimeout(function() {
						modules['subredditInfo'].hideSubredditInfo();
					}, modules['subredditInfo'].options.fadeDelay.value);
				}
			}, false);
			document.body.appendChild(this.subredditInfoToolTip);

			// get subreddit links and add event listeners...
			var subredditLinks = document.body.querySelectorAll('.listing-page a.subreddit');
			this.addListeners(subredditLinks);
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
					subredditLinks = event.target.querySelectorAll('a.subreddit');
					modules['subredditInfo'].addListeners(subredditLinks);
				}
			}, true);
		}
	},
	addListeners: function(subredditLinks) {
		if (subredditLinks) {
				var len=subredditLinks.length;
				for (var i=0; i<len; i++) {
					var thisSRLink = subredditLinks[i];
					thisSRLink.addEventListener('mouseover', function(e) {
						modules['subredditInfo'].showTimer = setTimeout(function() {
							modules['subredditInfo'].showSubredditInfo(e.target);
						}, modules['subredditInfo'].options.hoverDelay.value);
					}, false);
					thisSRLink.addEventListener('mouseout', function(e) {
						clearTimeout(modules['subredditInfo'].showTimer);
					}, false);
				}
			}
	},
	showSubredditInfo: function(obj) {
		var thisXY=RESUtils.getXYpos(obj);
		var thisSubreddit = obj.textContent;
		this.subredditInfoToolTipHeader.innerHTML = '<a href="/r/'+thisSubreddit+'">/r/' + thisSubreddit + '</a>';
		this.subredditInfoToolTipContents.innerHTML = '<a class="hoverSubreddit" href="/user/'+thisSubreddit+'">'+thisSubreddit+'</a>:<br><img src="'+RESConsole.loader+'"> loading...';
		if((window.innerWidth-thisXY.x)<=412){
			this.subredditInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 14) + 'px; left: ' + (thisXY.x - 180) + 'px;');
		} else {
			this.subredditInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 14) + 'px; left: ' + (thisXY.x - 10) + 'px;');
		}
		if(this.options.fadeSpeed.value < 0 || this.options.fadeSpeed.value > 1 || isNaN(this.options.fadeSpeed.value)) {
			this.options.fadeSpeed.value = 0.3;
		}
		RESUtils.fadeElementIn(this.subredditInfoToolTip, this.options.fadeSpeed.value);
		setTimeout(function() {
			if (!RESUtils.elementUnderMouse(modules['subredditInfo'].subredditInfoToolTip)) {
				modules['subredditInfo'].hideSubredditInfo();
			}
		}, 1000);
		if (typeof(this.subredditInfoCache[thisSubreddit]) != 'undefined') {
			this.writeSubredditInfo(this.subredditInfoCache[thisSubreddit]);
		} else {
			GM_xmlhttpRequest({
				method:	"GET",
				url:	location.protocol + "//"+location.hostname+"/r/" + thisSubreddit + "/about.json?app=res",
				onload:	function(response) {
					var thisResponse = JSON.parse(response.responseText);
					modules['subredditInfo'].subredditInfoCache[thisSubreddit] = thisResponse;
					modules['subredditInfo'].writeSubredditInfo(thisResponse);
				}
			});
		}
	},
	writeSubredditInfo: function(jsonData) {
		var utctime = jsonData.data.created;
		var d = new Date(utctime*1000);
		var isOver18;
		jsonData.data.over18 === true ? isOver18 = 'Yes' : isOver18 = 'No';
		var srHTML = '<div class="subredditLabel">Subreddit created:</div> <div class="subredditDetail">' + RESUtils.niceDate(d, this.options.USDateFormat.value) + ' ('+RESUtils.niceDateDiff(d)+')</div>';
		srHTML += '<div class="subredditLabel">Subscribers:</div> <div class="subredditDetail">' + RESUtils.addCommas(jsonData.data.subscribers) + '</div>';
		srHTML += '<div class="subredditLabel">Title:</div> <div class="subredditDetail">' + jsonData.data.title + '</div>';
		srHTML += '<div class="subredditLabel">Over 18:</div> <div class="subredditDetail">' + isOver18 + '</div>';
		// srHTML += '<div class="subredditLabel">Description:</div> <div class="subredditDetail">' + jsonData.data.description + '</div>';
		srHTML += '<div class="clear"></div><div id="subTooltipButtons" class="bottomButtons">';
		srHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		this.subredditInfoToolTipContents.innerHTML = srHTML;
		// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
		if (modules['subredditManager'].isEnabled()) {
			var theSC = document.createElement('span');
			theSC.setAttribute('style','display: inline-block !important;');
			theSC.setAttribute('class','RESshortcut RESshortcutside');
			theSC.setAttribute('subreddit',jsonData.data.display_name.toLowerCase());
			var idx = -1;
			for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
				if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == jsonData.data.display_name.toLowerCase()) {
					idx=i;
					break;
				}
			}
			if (idx != -1) {
				theSC.innerHTML = '-shortcut';
				theSC.setAttribute('title','Remove this subreddit from your shortcut bar');
				addClass(theSC,'remove');
			} else {
				theSC.innerHTML = '+shortcut';
				theSC.setAttribute('title','Add this subreddit to your shortcut bar');
			}
			theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);
			// subButton.parentNode.insertBefore(theSC, subButton);
			// theSubredditLink.appendChild(theSC);
			$('#subTooltipButtons').append(theSC);
		}
		if (modules['dashboard'].isEnabled()) {
			var dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class','RESDashboardToggle');
			dashboardToggle.setAttribute('subreddit',jsonData.data.display_name.toLowerCase());
			var exists=false;
			for (var i=0, len=modules['dashboard'].widgets.length; i<len; i++) {
				if ((modules['dashboard'].widgets[i]) && (modules['dashboard'].widgets[i].basePath.toLowerCase() == '/r/'+jsonData.data.display_name.toLowerCase())) {
					exists=true;
					break;
				}
			}
			if (exists) {
				dashboardToggle.innerHTML = '-dashboard';
				dashboardToggle.setAttribute('title','Remove this subreddit from your dashboard');
				addClass(dashboardToggle,'remove');
			} else {
				dashboardToggle.innerHTML = '+dashboard';
				dashboardToggle.setAttribute('title','Add this subreddit to your dashboard');
			}
			dashboardToggle.addEventListener('click', modules['dashboard'].toggleDashboard, false);
			$('#subTooltipButtons').append(dashboardToggle);
		}
		if (modules['filteReddit'].isEnabled()) {
			var filterToggle = document.createElement('span');
			filterToggle.setAttribute('class','RESFilterToggle');
			filterToggle.setAttribute('subreddit',jsonData.data.display_name.toLowerCase());
			var exists=false;
			var filteredReddits = modules['filteReddit'].options.subreddits.value;
			for (var i=0, len=filteredReddits.length; i<len; i++) {
				if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() == jsonData.data.display_name.toLowerCase())) {
					exists=true;
					break;
				}
			}
			if (exists) {
				filterToggle.innerHTML = '-filter';
				filterToggle.setAttribute('title','Stop filtering from /r/all');
				addClass(filterToggle,'remove');
			} else {
				filterToggle.innerHTML = '+filter';
				filterToggle.setAttribute('title','Filter this subreddit from /r/all');
			}
			filterToggle.addEventListener('click', modules['filteReddit'].toggleFilter, false);
			$('#subTooltipButtons').append(filterToggle);
		}
	},
	hideSubredditInfo: function(obj) {
		if(this.options.fadeSpeed.value < 0 || this.options.fadeSpeed.value > 1 || isNaN(this.options.fadeSpeed.value)) {
			this.options.fadeSpeed.value = 0.3;
		}
		RESUtils.fadeElementOut(this.subredditInfoToolTip, this.options.fadeSpeed.value);
	}
};
