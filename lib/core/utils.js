// define common RESUtils - reddit related functions and data that may need to be accessed...
var RESUtils = {};
// set up arrays for html tag classes and body tag classes to be added as early
// as possible and all at once to avoid excess screen repaints
RESUtils.htmlClasses = [];
RESUtils.bodyClasses = ['res', 'res-v430'];

RESUtils.preInit = function() {
	// we store a localStorage key because the async call is too slow to add classes to
	// the document prior to page load, thus the flash of unstyled content.
	RESUtils.getDocHTML();
};
// to avoid the flash of unstyled content, the very first thing we should do is get a hold
// of the document object and add necessary classes...
RESUtils.getDocHTML = function() {
	if (document && typeof modules !== 'undefined') {
		document.html = document.documentElement;
		if (localStorage.getItem('RES_nightMode')) {
			// no need to check the background - we're in night mode for sure.
			var setNightMode = setInterval(function() {
				if (modules['nightMode']) {
					modules['nightMode'].enableNightMode();
					clearInterval(setNightMode);
				}
			}, 1);
		}
	} else {
		setTimeout(RESUtils.getDocHTML, 1);
	}
};
// A cache variable to store CSS that will be applied at the end of execution...
RESUtils.randomHash = function(len) {
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	var numChars = len || 5;
	var randomString = '';
	for (var i = 0; i < numChars; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomString += chars.substring(rnum, rnum + 1);
	}
	return randomString;
};
RESUtils.hashCode = function(str) {
	var hash = 0,
		i, len, char;
	if (str.length === 0) return hash;
	for (i = 0, len = str.length; i < len; i++) {
		char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};
RESUtils.postLoad = false;
RESUtils.css = '';
RESUtils.addCSS = function(css) {
	if (RESUtils.postLoad) {
		var style = RESUtils.addStyle(css);
		return {
			remove: function() {
				style.parentNode.removeChild(style);
			}
		};
	} else {
		this.css += css;
	}
};
RESUtils.insertParam = function(href, key, value) {
	var pre = '&';
	if (href.indexOf('?') === -1) pre = '?';
	return href + pre + key + '=' + value;
};
// checks if script should run on current URL using exclude / include.
RESUtils.isMatchURL = function(moduleID) {
	var i, len,
		currURL = location.href,
		pageType = RESUtils.pageType();

	// stop if not on reddit
	if (!RESUtils.isReddit()) {
		return false;
	}

	// get includes and excludes...
	var excludes = modules[moduleID].exclude,
		includes = modules[moduleID].include;

	// first check excludes...
	if (typeof excludes !== 'undefined') {
		for (i = 0, len = excludes.length; i < len; i++) {
			var exclude = excludes[i];
			// console.log(moduleID + ' -- ' + excludes[i] + ' - excl test - ' + currURL + ' - result: ' + excludes[i].test(currURL));

			// assume that modules should not be excluded for *all* of reddit
			if (exclude.test && exclude.test(currURL) || exclude === pageType) {
				return false;
			}
		}
	}

	// then check includes...
	for (i = 0, len = includes.length; i < len; i++) {
		var include = includes[i];
		// console.log(moduleID + ' -- ' + includes[i] + ' - incl test - ' + currURL + ' - result: ' + includes[i].test(currURL));

		if (include.test && include.test(currURL) || include === pageType ||
				include === 'all') {
			return true;
		}
	}

	return false;
};
// gets options for a module...
RESUtils.getOptionsFirstRun = [];
RESUtils.getOptions = function(moduleID) {
	if (this.getOptionsFirstRun[moduleID]) {
		// we've already grabbed these out of localstorage, so modifications should be done in memory. just return that object.
		return modules[moduleID].options;
	}
	var thisOptions = RESStorage.getItem('RESoptions.' + moduleID);
	if ((thisOptions) && (thisOptions !== 'undefined') && (thisOptions !== null)) {
		// merge options (in case new ones were added via code) and if anything has changed, update to localStorage
		var storedOptions = safeJSON.parse(thisOptions, 'RESoptions.' + moduleID);
		var codeOptions = modules[moduleID].options;
		var newOption = false;
		for (var attrname in codeOptions) {
			codeOptions[attrname].default = codeOptions[attrname].value;
			if (typeof storedOptions[attrname] === 'undefined') {
				newOption = true;
				storedOptions[attrname] = codeOptions[attrname];
			} else {
				codeOptions[attrname].value = storedOptions[attrname].value;
			}
		}
		modules[moduleID].options = codeOptions;
		if (newOption) {
			RESStorage.setItem('RESoptions.' + moduleID, JSON.stringify(modules[moduleID].options));
		}
	} else {
		// nothing in localStorage, let's set the defaults...
		RESStorage.setItem('RESoptions.' + moduleID, JSON.stringify(modules[moduleID].options));
	}
	this.getOptionsFirstRun[moduleID] = true;
	return modules[moduleID].options;
};
RESUtils.getUrlParams = function() {
	var result = {}, queryString = location.search.substring(1),
		re = /([^&=]+)=([^&]*)/g,
		m;
	while ((m = re.exec(queryString))) {
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	return result;
};
RESUtils.setOption = function(moduleID, optionName, optionValue) {
	if (/_[\d]+$/.test(optionName)) {
		optionName = optionName.replace(/_[\d]+$/, '');
	}
	var thisOptions = this.getOptions(moduleID);
	var saveOptionValue;
	if (optionValue === '') {
		saveOptionValue = '';
	} else if ((isNaN(optionValue)) || (typeof optionValue === 'boolean') || (typeof optionValue === 'object')) {
		saveOptionValue = optionValue;
	} else if (optionValue.indexOf('.') !== -1) {
		saveOptionValue = parseFloat(optionValue);
	} else {
		saveOptionValue = parseInt(optionValue, 10);
	}
	thisOptions[optionName].value = saveOptionValue;
	// save it to the object...
	modules[moduleID].options = thisOptions;
	// save it to RESStorage...
	RESStorage.setItem('RESoptions.' + moduleID, JSON.stringify(modules[moduleID].options));
	return true;
};
RESUtils.click = function(obj, button) {
	var evt = document.createEvent('MouseEvents');
	button = button || 0;
	evt.initMouseEvent('click', true, true, window.wrappedJSObject, 0, 1, 1, 1, 1, false, false, false, false, button, null);
	obj.dispatchEvent(evt);
};
RESUtils.mousedown = function(obj, button) {
	var evt = document.createEvent('MouseEvents');
	button = button || 0;
	evt.initMouseEvent('mousedown', true, true, window.wrappedJSObject, 0, 1, 1, 1, 1, false, false, false, false, button, null);
	obj.dispatchEvent(evt);
};
RESUtils.loggedInUser = function(tryingEarly) {
	if (typeof this.loggedInUserCached === 'undefined') {
		var userLink = document.querySelector('#header-bottom-right > span.user > a');
		if ((userLink !== null) && (!userLink.classList.contains('login-required'))) {
			this.loggedInUserCached = userLink.textContent;
			// HERE BE DRAGONS
			// this.verifyHash(this.loggedInUserCached);
			this.loggedInUserHashCached = document.querySelector('[name=uh]').value;
		} else {
			if (tryingEarly) {
				// trying early means we're trying before DOM load may be complete, so if we fail here
				// we don't want to null this, we want to allow another try.
				// currently the only place this is really used is username hider, which tries (if possible)
				// to hide the username as early/fast as possible.
				delete this.loggedInUserCached;
				delete this.loggedInUserHashCached;
			} else {
				this.loggedInUserCached = null;
			}
		}
	}
	return this.loggedInUserCached;
};
RESUtils.loggedInUserHash = function() {
	this.loggedInUser();
	return this.loggedInUserHashCached;
};
RESUtils.problemHashes = [991658920,3385400];
RESUtils.getUserInfo = function(callback, username, live) {
	// Default to currently logged-in user, for backwards compatibility
	username = (typeof username !== 'undefined' ? username : RESUtils.loggedInUser());
	if (username === null) return false;

	// Default to getting live data (i.e. from reddit's server)
	live = (typeof live === 'boolean' ? live : true);

	if (!(username in RESUtils.userInfoCallbacks)) {
		RESUtils.userInfoCallbacks[username] = [];
	}
	RESUtils.userInfoCallbacks[username].push(callback);
	var cacheData = RESStorage.getItem('RESUtils.userInfoCache.' + username) || '{}';
	var userInfoCache = safeJSON.parse(cacheData);
	var lastCheck = (userInfoCache !== null) ? parseInt(userInfoCache.lastCheck, 10) || 0 : 0;
	var now = Date.now();
	// 300000 = 5 minutes
	if (live && ((now - lastCheck) > 300000) || lastCheck > now) { // avoid timezone problem
		if (!RESUtils.userInfoRunning) {
			RESUtils.userInfoRunning = true;
			BrowserStrategy.ajax({
				method: 'GET',
				url: location.protocol + '//' + location.hostname + '/user/' + encodeURIComponent(username) + '/about.json?app=res',
				onload: function(response) {
					var thisResponse;
					try {
						thisResponse = JSON.parse(response.responseText);
					} catch (e) {
						console.log('utils: Error parsing response from reddit');
						console.log(response.responseText);
						return false;
					}
					var userInfoCache = {
						lastCheck: now,
						userInfo: thisResponse
					};
					RESStorage.setItem('RESUtils.userInfoCache.' + username, JSON.stringify(userInfoCache));
					while (RESUtils.userInfoCallbacks[username].length > 0) {
						var thisCallback = RESUtils.userInfoCallbacks[username].pop();
						thisCallback(userInfoCache.userInfo);
					}
					RESUtils.userInfoRunning = false;
				}
			});
		}
	} else {
		while (RESUtils.userInfoCallbacks[username].length > 0) {
			var thisCallback = RESUtils.userInfoCallbacks[username].pop();
			thisCallback(userInfoCache.userInfo);
		}
	}
};
RESUtils.userInfoCallbacks = {};
RESUtils.allRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\//i;
RESUtils.commentsRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/[-\w\.\/]*\/comments/i;
RESUtils.nosubCommentsRegex = /https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/comments\/[-\w\.\/]*/i;
RESUtils.friendsCommentsRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/r\/friends\/*comments/i;
RESUtils.inboxRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/(?:r\/[-\w\.\/]+?\/)?message\//i;
RESUtils.profileRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/user\/([-\w\.#=]*)\/?(?:comments)?\/?(?:\?(?:[a-z]+=[a-zA-Z0-9_%]*&?)*)?$/i;
RESUtils.submitRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/(?:[-\w\.\/]*\/)?submit\/?(?:\?.*)?$/i;
RESUtils.prefsRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/prefs/i;
RESUtils.wikiRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/(?:r\/[-\w\.]+\/)?wiki/i;
RESUtils.styleSheetRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/(?:r\/[-\w\.]+\/)?about\/stylesheet/i;
RESUtils.searchRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/(?:[-\w\.\/]*\/)?search/i;
// commentPermalinkRegex, subredditRegex, multiredditRegex, and domainRegex are just after
RESUtils.verifyHash = function(hash) {
	if ($.inArray(RESUtils.hashCode(hash), RESUtils.problemHashes) !== -1) {
		throw 'Error';
	}
};
RESUtils.isReddit = function() {
	var currURL = location.href;
	return RESUtils.allRegex.test(currURL);
};
RESUtils.pageType = function() {
	if (typeof this.pageTypeSaved === 'undefined') {
		var pageType = '';
		var currURL = location.href.split('#')[0];
		if (RESUtils.profileRegex.test(currURL)) {
			pageType = 'profile';
		} else if ((RESUtils.commentsRegex.test(currURL)) || (RESUtils.friendsCommentsRegex.test(currURL)) || (RESUtils.nosubCommentsRegex.test(currURL))) {
			pageType = 'comments';
		} else if (RESUtils.inboxRegex.test(currURL)) {
			pageType = 'inbox';
		} else if (RESUtils.submitRegex.test(currURL)) {
			pageType = 'submit';
		} else if (RESUtils.prefsRegex.test(currURL)) {
			pageType = 'prefs';
		} else if (RESUtils.wikiRegex.test(currURL)) {
			pageType = 'wiki';
		} else if (RESUtils.styleSheetRegex.test(currURL)) {
			pageType = 'stylesheet';
		} else {
			pageType = 'linklist';
		}
		this.pageTypeSaved = pageType;
	}
	return this.pageTypeSaved;
};
RESUtils.commentPermalinkRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/[-\w\.\/]*comments\/[a-z0-9]+\/[^\/]+\/[a-z0-9]+$/i;
RESUtils.isCommentPermalinkPage = function() {
	if (typeof this.isCommentPermalinkSaved === 'undefined') {
		var currURL = location.href.split('#')[0];
		if (RESUtils.commentPermalinkRegex.test(currURL)) {
			this.isCommentPermalinkSaved = true;
		} else {
			this.isCommentPermalinkSaved = false;
		}
	}

	return this.isCommentPermalinkSaved;
};
RESUtils.subredditRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/r\/([\w\.\+]+)/i;
RESUtils.multiredditRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/((?:me|user\/[-\w\.#=]*)\/(?:m|f)\/([\w\.\+]+))/i;
RESUtils.domainRegex = /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/domain\/([\w\.\+]+)/i;
RESUtils.currentSubreddit = function(check) {
	if (typeof this.curSub === 'undefined') {
		var match = location.href.match(RESUtils.subredditRegex);
		if (match !== null) {
			this.curSub = match[1];
			if (check) return (match[1].toLowerCase() === check.toLowerCase());
			return match[1];
		} else {
			if (check) return false;
			return null;
		}
	} else {
		if (check) return (this.curSub.toLowerCase() === check.toLowerCase());
		return this.curSub;
	}
};
RESUtils.subredditForElement = function(element) {
	var $thing = $(element).closest('.thing');
	if (!$thing.length) return;

	var $subredditElement = $thing.find('.subreddit');

	if (!$subredditElement.length) {
		$subredditElement = $thing.find('.tagline a').filter(function() {
			return RESUtils.subredditRegex.test(this.href);
		});
	}

	if (!$subredditElement.length) {
		$subredditElement = $('.sitetable .link .subreddit');
	}

	if ($subredditElement.length) {
		var subredditName = $subredditElement[0].href.match(RESUtils.subredditRegex)[1];
		return subredditName;
	}
};
RESUtils.currentMultireddit = function(check) {
	if (typeof this.curMulti === 'undefined') {
		var match = location.href.match(RESUtils.multiredditRegex);
		if (match !== null) {
			this.curMulti = match[1];
			if (check) return (match[1].toLowerCase() === check.toLowerCase());
			return match[1];
		} else {
			if (check) return false;
			return null;
		}
	} else {
		if (check) return (this.curMulti.toLowerCase() === check.toLowerCase());
		return this.curMulti;
	}
};
RESUtils.currentDomain = function(check) {
	if (typeof this.curDom === 'undefined') {
		var match = location.href.match(RESUtils.domainRegex);
		if (match !== null) {
			this.curDom = match[1];
			if (check) return (match[1].toLowerCase() === check.toLowerCase());
			return match[1];
		} else {
			if (check) return false;
			return null;
		}
	} else {
		if (check) return (this.curDom.toLowerCase() === check.toLowerCase());
		return this.curDom;
	}
};
RESUtils.currentUserProfile = function() {
	if (typeof this.curUserProfile === 'undefined') {
		var match = location.href.match(RESUtils.profileRegex);
		if (match !== null) {
			this.curUserProfile = match[1];
			return match[1];
		} else {
			return null;
		}
	} else {
		return this.curUserProfile;
	}
};
RESUtils.subredditForPost = function (thingEle) {
	var postSubreddit = '';
	var thisSubRedditEle = $(thingEle).find('A.subreddit')[0];
	if ((typeof thisSubRedditEle !== 'undefined') && (thisSubRedditEle !== null)) {
		postSubreddit = RESUtils.subredditRegex.exec(thisSubRedditEle.href)[1] || '';
	}
	return postSubreddit;
};

RESUtils.getHeaderMenuList = function() {
	var mainMenuUL;
	if ((/search\?\/?q\=/.test(location.href)) ||
			(/\/about\/(?:reports|spam|unmoderated)/.test(location.href)) ||
			(location.href.indexOf('/modqueue') !== -1) ||
			(location.href.toLowerCase().indexOf('/dashboard') !== -1)) {
		var hbl = document.getElementById('header-bottom-left');
		if (hbl) {
			mainMenuUL = document.createElement('ul');
			mainMenuUL.setAttribute('class', 'tabmenu viewimages');
			mainMenuUL.setAttribute('style', 'display: inline-block');
			hbl.appendChild(mainMenuUL);
		}
	} else {
		mainMenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
	}

	return mainMenuUL;
}
RESUtils.getXYpos = function(obj) {
	var topValue = 0,
		leftValue = 0;
	while (obj) {
		leftValue += obj.offsetLeft;
		topValue += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return {
		'x': leftValue,
		'y': topValue
	};
};
RESUtils.elementInViewport = function(obj) {
	if (!obj) {
		return false;
	}
	// check the headerOffset - if we've pinned the subreddit bar, we need to add some pixels so the "visible" stuff is lower down the page.
	var headerOffset = this.getHeaderOffset();
	var top = obj.offsetTop - headerOffset;
	var left = obj.offsetLeft;
	var width = obj.offsetWidth;
	var height = obj.offsetHeight;
	while (obj.offsetParent) {
		obj = obj.offsetParent;
		top += obj.offsetTop;
		left += obj.offsetLeft;
	}
	return (
		top >= window.pageYOffset &&
		left >= window.pageXOffset &&
		(top + height) <= (window.pageYOffset + window.innerHeight - headerOffset) &&
		(left + width) <= (window.pageXOffset + window.innerWidth)
	);
};
// Returns percentage of the element that is within the viewport along the y-axis
// Note that it doesn't matter where the element is on the x-axis, it can be totally invisible to the user
// and this function might still return 1!
RESUtils.getPercentageVisibleYAxis = function(obj) {
	var rect = obj.getBoundingClientRect();
	var top = Math.max(0, rect.bottom - rect.height);
	var bottom = Math.min(document.documentElement.clientHeight, rect.bottom);
	if (rect.height === 0) {
		return 0;
	}
	return Math.max(0, (bottom - top) / rect.height);
};
// Returns percentage of the element that is within the viewport along the x-axis
// Note that it doesn't matter where the element is on the y-axis, it can be totally invisible to the user
// and this function might still return 1!
RESUtils.getPercentageVisibleXAxis = function(obj) {
	var rect = obj.getBoundingClientRect();
	var left = Math.max(0, rect.left);
	var right = Math.min(document.documentElement.clientWidth, rect.right);
	if (rect.width === 0) {
		return 0;
	}
	return Math.max(0, (right - left) / rect.width);
};
// Returns percentage of the element that is within the viewport
RESUtils.getPercentageVisible = function(obj) {
	return RESUtils.getPercentageVisibleXAxis(obj) * RESUtils.getPercentageVisibleYAxis(obj);
};
RESUtils.setMouseXY = function(e) {
	e = e || window.event;
	var cursor = {
		x: 0,
		y: 0
	};
	if (e.pageX || e.pageY) {
		cursor.x = e.pageX;
		cursor.y = e.pageY;
	} else {
		cursor.x = e.clientX +
			(document.documentElement.scrollLeft ||
			document.body.scrollLeft) -
			document.documentElement.clientLeft;
		cursor.y = e.clientY +
			(document.documentElement.scrollTop ||
			document.body.scrollTop) -
			document.documentElement.clientTop;
	}
	RESUtils.mouseX = cursor.x;
	RESUtils.mouseY = cursor.y;
};
RESUtils.elementUnderMouse = function(obj) {
	var $obj = $(obj),
		top = $obj.offset().top,
		left = $obj.offset().left,
		width = $obj.outerWidth(),
		height = $obj.outerHeight(),
		right = left + width,
		bottom = top + height;
	if ((RESUtils.mouseX >= left) && (RESUtils.mouseX <= right) && (RESUtils.mouseY >= top) && (RESUtils.mouseY <= bottom)) {
		return true;
	} else {
		return false;
	}
};
RESUtils.doElementsCollide = function(ele1, ele2, margin) {
	margin = margin || 0;
	ele1 = $(ele1);
	ele2 = $(ele2);

	var dims1 = ele1.offset();
	dims1.right = dims1.left + ele1.width();
	dims1.bottom = dims1.top + ele1.height();

	dims1.left -= margin;
	dims1.top -= margin;
	dims1.right += margin;
	dims1.bottom += margin;


	var dims2 = ele2.offset();
	dims2.right = dims2.left + ele2.width();
	dims2.bottom = dims2.top + ele2.height();

	if (
		(
			(dims1.left < dims2.left && dims2.left < dims1.right) ||
			(dims1.left < dims2.right && dims2.right < dims1.right) ||
			(dims2.left < dims1.left && dims1.left < dims2.right) ||
			(dims2.left < dims1.right && dims1.right < dims2.right)
		) &&
		(
			(dims1.top < dims2.top && dims2.top < dims1.bottom) ||
			(dims1.top < dims2.bottom && dims2.bottom < dims1.bottom) ||
			(dims2.top < dims1.top && dims1.top < dims2.bottom) ||
			(dims2.top < dims1.bottom && dims1.bottom < dims2.bottom))
	) {
		// In layman's terms:
		// If one of the box's left/right borders is between the other box's left/right
		// and same with top/bottom,
		// then they collide.
		// This could probably be logicked into a more compact form.

		return true;
	}

	return false;
};
RESUtils.scrollTo = function(x, y) {
	var headerOffset = this.getHeaderOffset();
	window.scrollTo(x, y - headerOffset);
};
RESUtils.getHeaderOffset = function() {
	if (typeof this.headerOffset === 'undefined') {
		this.headerOffset = 0;
		switch (modules['betteReddit'].options.pinHeader.value) {
			case 'none':
				break;
			case 'sub':
			case 'subanduser':
				this.theHeader = document.getElementById('sr-header-area');
				break;
			case 'header':
				this.theHeader = document.getElementById('header');
				break;
		}
		if (this.theHeader) {
			this.headerOffset = this.theHeader.offsetHeight + 6;
		}
	}
	return this.headerOffset;
};
RESUtils.setSelectValue = function(obj, value) {
	for (var i = 0, len = obj.length; i < len; i++) {
		// for some reason in firefox, obj[0] is undefined... weird. adding a test for existence of obj[i]...
		// okay, now as of ff8, it's even barfing here unless we console.log out a check - nonsensical.
		// a bug has been filed to bugzilla at:
		// https://bugzilla.mozilla.org/show_bug.cgi?id=702847
		if ((obj[i]) && (obj[i].value === value)) {
			obj[i].selected = true;
		}
	}
};
RESUtils.addStyle = function(css) {
	var style = document.createElement('style');
	style.textContent = css;
	var head = document.getElementsByTagName('head')[0];
	if (head) {
		head.appendChild(style);
		return style;
	}
};
RESUtils.stripHTML = function(str) {
	var regExp = /<\/?[^>]+>/gi;
	str = str.replace(regExp, '');
	return str;
};
RESUtils.sanitizeHTML = function(htmlStr) {
	return window.Pasteurizer.safeParseHTML(htmlStr).wrapAll('<div></div>').parent().html();
};
RESUtils.firstValid = function() {
	for (var i = 0, len = arguments.length; i < len; i++) {
		var argument = arguments[i];

		if (argument === void 0) continue;
		if (argument == null) continue;
		if (typeof argument === 'number' && isNaN(argument)) continue;

		return arguments[i];
	}
};
RESUtils.fadeElementTo = function(el, speedInSeconds, finalOpacity, callback) {
	var initialOpacity, opacityDelta, duration, startTime;
	start();

	function start() {
		if (el._resIsFading) {
			return;
		} else if (finalOpacity === 0 && el.style.display === 'none') {
			// already faded out, don't need to fade out again.
			done();
			return;
		} else {
			setup();
			go();
		}
	}

	function setup() {
		el._resIsFading = true;

		if (el.style.display === 'none' || el.style.display === '') {
			initialOpacity = 0;
			el.style.display = 'block';
		} else {
			initialOpacity = parseFloat(el.style.opacity) || 1;
		}

		if (typeof finalOpacity === 'undefined') {
			finalOpacity = 1;
		}
		speedInSeconds = Math.max(speedInSeconds, 0.1); //set a minimum speed
	}

	function go() {
		$(el).fadeTo(speedInSeconds * 1000, finalOpacity, done);
	};

	function done() {
		el.style.opacity = finalOpacity;
		if (finalOpacity <= 0) {
			el.style.display = 'none';
		}
		delete el._resIsFading;
		if (callback && callback.call) {
			callback();
		}
	}


	return true;
};
RESUtils.fadeElementOut = function(el, speed, callback) {
	RESUtils.fadeElementTo(el, speed, 0, callback);
};
RESUtils.fadeElementIn = function(el, speed, finalOpacity, callback) {
	RESUtils.fadeElementTo(el, speed, finalOpacity, callback);
};

RESUtils.setCursorPosition = function(form, pos) {
	var elem = $(form)[0];
	if (!elem) return;

	if (elem.setSelectionRange) {
		elem.setSelectionRange(pos, pos);
	} else if (elem.createTextRange) {
		var range = elem.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}

	return form;
};
RESUtils.setNewNotification = function() {
	$('#RESSettingsButton, #RESMainGearOverlay .gearIcon').addClass('newNotification').click(function() {
		location.href = '/r/RESAnnouncements';
	});
};
RESUtils.createMultiLock = function() {
	var locks = {};
	var count = 0;

	return {
		lock: function(lockname, value) {
			if (typeof lockname === 'undefined') return;
			if (locks[lockname]) return;

			locks[lockname] = value || true;
			count++;
			return true;
		},
		unlock: function(lockname) {
			if (typeof lockname === 'undefined') return;
			if (!locks[lockname]) return;

			locks[lockname] = false;
			count--;
			return true;
		},
		locked: function(lockname) {
			if (typeof lockname !== 'undefined') {
				// Is this lock set?
				return locks[lockname];
			} else {
				// Is any lock set?
				return count > 0;
			}
		}
	};
};
RESUtils.indexOptionTable = function(moduleID, optionKey, keyFieldIndex) {
	var source = modules[moduleID].options[optionKey].value;
	var keyIsList =
		modules[moduleID].options[optionKey].fields[keyFieldIndex].type === 'list' ?
		',' :
		false;
	return RESUtils.indexArrayByProperty(source, keyFieldIndex, keyIsList);
};
RESUtils.indexArrayByProperty = function(source, keyIndex, keyValueSeparator) {
	if (!source || !source.length) {
		return function() {};
	}

	var index = createIndex();
	return getItem;

	function createIndex() {
		var index = {};

		for (var i = 0, length = source.length; i < length; i++) {
			var item = source[i];
			var key = item && item[keyIndex];
			if (!key) continue;

			if (keyValueSeparator) {
				var keys = key.toLowerCase().split(keyValueSeparator);
				for (var ki = 0, klength = keys.length; ki < klength; ki++) {
					key = keys[ki];
					index[key] = item;
				}
			} else {
				index[key] = item;
			}
		}

		return index;
	}

	function getItem(key) {
		key = key && key.toLowerCase();
		var item = index[key];
		return item;
	}
};

RESUtils.options = {};


RESUtils.options.listTypes = {};
RESUtils.options.listTypes['subreddits'] = {
	source: '/api/search_reddit_names.json?app=res',
	hintText: 'type a subreddit name',
	onResult: function(response) {
		var names = response.names;
		var results = [];
		for (var i = 0, len = names.length; i < len; i++) {
			results.push({
				id: names[i],
				name: names[i]
			});
		}
		return results;
	},
	onCachedResult: function(response) {
		var names = response.names;
		var results = [];
		for (var i = 0, len = names.length; i < len; i++) {
			results.push({
				id: names[i],
				name: names[i]
			});
		}
		return results;
	}
};


(function() {
	RESUtils.options.table = {};

	RESUtils.options.table.getMatchingValue = function (moduleID, optionKey, valueIdentifiers) {
		var option = modules[moduleID].options[optionKey];
		var values = option.value;
		var matchingValue;
		if (!(option.type === 'table' && values && values.length)) return;

		for (var vi = 0, vlength = values.length; vi < vlength; vi++) {
			var value = values[vi];
			var match = false;
			for (var fi = 0, flength = option.fields.length; fi < flength; fi++) {
				var field = option.fields[fi];
				var fieldValue = value[fi];
				var matchValue = RESUtils.firstValid(valueIdentifiers[fi], valueIdentifiers[field.name]);

				if (matchValue === void 0) {
					continue;
				} else if (matchValue === fieldValue) {
					match = true;
					continue;
				} else {
					match = false;
					break;
				}
			}

			if (match) {
				matchingValue = value;
				break;
			}
		}

		return matchingValue;
	};

	RESUtils.options.table.addValue = function (moduleID, optionKey, value) {
		var option = modules[moduleID].options[optionKey];
		if (option.type !== 'table') {
			console.error('Tried to save table value to non-table option: modules[\'' + moduleID + '\'].options.' + optionKey);
			return;
		}

		if (!option.value) {
			option.value = [];
		}
		var values = option.value;


		var optionValue = [];
		for (var i = 0, length = option.fields.length; i < length; i++) {
			var field = option.fields[i];

			var fieldValue = RESUtils.firstValid(value[i], value[field.name], field.value);
			optionValue.push(fieldValue);
		}

		values.push(optionValue);
		RESUtils.setOption(moduleID, optionKey, values);

		return optionValue;
	};

	RESUtils.options.table.getMatchingValueOrAdd = function (moduleID, optionKey, valueIdentifier, hydrateValue) {
		var matchingValue = RESUtils.options.table.getMatchingValue(moduleID, optionKey, valueIdentifier);
		if (!matchingValue) {
			var value = valueIdentifier;
			if (hydrateValue) {
				value = hydrateValue(valueIdentifier);
			}

			matchingValue = RESUtils.options.table.addValue(moduleID, optionKey, value);
		}

		return matchingValue;
	};

	RESUtils.options.table.mapValueToObject = function (moduleID, optionKey, value) {
		var option = modules[moduleID].options[optionKey];

		var object = {};
		for (var i = 0, length = option.fields.length; i < length; i++) {
			var field = option.fields[i];

			object[field.name] = value[i];
		}

		return object;
	};
})();
RESUtils.inList = function(needle, haystack, separator, isCaseSensitive) {
	if (!needle || !haystack) return false;

	separator = separator || ',';

	if (haystack.indexOf(separator) !== -1) {
		var haystacks = haystack.split(separator);
		if (RESUtils.inArray(needle, haystacks, isCaseSensitive)) {
			return true;
		}
	} else {
		if (caseSensitive) {
			return (needle === haystack);
		} else {
			return (needle.toLowerCase() === haystack.toLowerCase());
		}
	}
};
RESUtils.inArray = function(needle, haystacks, isCaseSensitive) {
	if (!isCaseSensitive) needle = needle.toLowerCase();

	for (var i = 0, length = haystacks.length; i < length; i++) {
		if (isCaseSensitive) {
			if (needle === haystacks[i]) {
				return true;
			}
		} else {
			if (needle === haystacks[i].toLowerCase()) {
				return true;
			}
		}
	}
};
RESUtils.firstRun = function() {
	// if this is the first time this version has been run, pop open the what's new tab, background focused.
	if (RESStorage.getItem('RES.firstRun.' + RESVersion) === null) {
		RESStorage.setItem('RES.firstRun.' + RESVersion, 'true');
		RESUtils.openLinkInNewTab('http://redditenhancementsuite.com/whatsnew.html?v=' + RESVersion, false);
	}
};
// checkForUpdate: function(forceUpdate) {
RESUtils.checkForUpdate = function() {
	if (RESUtils.currentSubreddit('RESAnnouncements')) {
		RESStorage.removeItem('RES.newAnnouncement', 'true');
	}
	var now = Date.now();
	var lastCheck = parseInt(RESStorage.getItem('RESLastUpdateCheck'), 10) || 0;
	// if we haven't checked for an update in 24 hours, check for one now!
	// if (((now - lastCheck) > 86400000) || (RESVersion > RESStorage.getItem('RESlatestVersion')) || ((RESStorage.getItem('RESoutdated') === 'true') && (RESVersion === RESStorage.getItem('RESlatestVersion'))) || forceUpdate) {
	if ((now - lastCheck) > 86400000) {
		// now we're just going to check /r/RESAnnouncements for new posts, we're not checking version numbers...
		var lastID = RESStorage.getItem('RES.lastAnnouncementID');
		$.getJSON('/r/RESAnnouncements/.json?limit=1&app=res', function(data) {
			RESStorage.setItem('RESLastUpdateCheck', now);
			var thisID = data.data.children[0].data.id;
			if (thisID !== lastID) {
				RESStorage.setItem('RES.newAnnouncement', 'true');
				RESUtils.setNewNotification();
			}
			RESStorage.setItem('RES.lastAnnouncementID', thisID);
		});
	}
};

RESUtils.proEnabled = function() {
	return ((typeof modules['RESPro'] !== 'undefined') && (modules['RESPro'].isEnabled()));
};
RESUtils.niceKeyCode = function(charCode) {
	var keyComboString = '';
	var testCode, niceString;
	if (typeof charCode === 'string') {
		var tempArray = charCode.split(',');
		if (tempArray.length) {
			if (tempArray[1] === 'true') keyComboString += 'alt-';
			if (tempArray[2] === 'true') keyComboString += 'ctrl-';
			if (tempArray[3] === 'true') keyComboString += 'shift-';
			if (tempArray[4] === 'true') keyComboString += 'command-';
		}
		testCode = parseInt(charCode, 10);
	} else if (typeof charCode === 'object') {
		testCode = parseInt(charCode[0], 10);
		if (charCode[1]) keyComboString += 'alt-';
		if (charCode[2]) keyComboString += 'ctrl-';
		if (charCode[3]) keyComboString += 'shift-';
		if (charCode[4]) keyComboString += 'command-';
	}
	switch (testCode) {
		case -1:
			niceString = 'none'; //  none
			break;
		case 8:
			niceString = 'backspace'; //  backspace
			break;
		case 9:
			niceString = 'tab'; //  tab
			break;
		case 13:
			niceString = 'enter'; //  enter
			break;
		case 16:
			niceString = 'shift'; //  shift
			break;
		case 17:
			niceString = 'ctrl'; //  ctrl
			break;
		case 18:
			niceString = 'alt'; //  alt
			break;
		case 19:
			niceString = 'pause/break'; //  pause/break
			break;
		case 20:
			niceString = 'caps lock'; //  caps lock
			break;
		case 27:
			niceString = 'escape'; //  escape
			break;
		case 33:
			niceString = 'page up'; // page up, to avoid displaying alternate character and confusing people
			break;
		case 34:
			niceString = 'page down'; // page down
			break;
		case 35:
			niceString = 'end'; // end
			break;
		case 36:
			niceString = 'home'; // home
			break;
		case 37:
			niceString = 'left arrow'; // left arrow
			break;
		case 38:
			niceString = 'up arrow'; // up arrow
			break;
		case 39:
			niceString = 'right arrow'; // right arrow
			break;
		case 40:
			niceString = 'down arrow'; // down arrow
			break;
		case 45:
			niceString = 'insert'; // insert
			break;
		case 46:
			niceString = 'delete'; // delete
			break;
		case 91:
			niceString = 'left window'; // left window
			break;
		case 92:
			niceString = 'right window'; // right window
			break;
		case 93:
			niceString = 'select key'; // select key
			break;
		case 96:
			niceString = 'numpad 0'; // numpad 0
			break;
		case 97:
			niceString = 'numpad 1'; // numpad 1
			break;
		case 98:
			niceString = 'numpad 2'; // numpad 2
			break;
		case 99:
			niceString = 'numpad 3'; // numpad 3
			break;
		case 100:
			niceString = 'numpad 4'; // numpad 4
			break;
		case 101:
			niceString = 'numpad 5'; // numpad 5
			break;
		case 102:
			niceString = 'numpad 6'; // numpad 6
			break;
		case 103:
			niceString = 'numpad 7'; // numpad 7
			break;
		case 104:
			niceString = 'numpad 8'; // numpad 8
			break;
		case 105:
			niceString = 'numpad 9'; // numpad 9
			break;
		case 106:
			niceString = 'multiply'; // multiply
			break;
		case 107:
			niceString = 'add'; // add
			break;
		case 109:
			niceString = 'subtract'; // subtract
			break;
		case 110:
			niceString = 'decimal point'; // decimal point
			break;
		case 111:
			niceString = 'divide'; // divide
			break;
		case 112:
			niceString = 'F1'; // F1
			break;
		case 113:
			niceString = 'F2'; // F2
			break;
		case 114:
			niceString = 'F3'; // F3
			break;
		case 115:
			niceString = 'F4'; // F4
			break;
		case 116:
			niceString = 'F5'; // F5
			break;
		case 117:
			niceString = 'F6'; // F6
			break;
		case 118:
			niceString = 'F7'; // F7
			break;
		case 119:
			niceString = 'F8'; // F8
			break;
		case 120:
			niceString = 'F9'; // F9
			break;
		case 121:
			niceString = 'F10'; // F10
			break;
		case 122:
			niceString = 'F11'; // F11
			break;
		case 123:
			niceString = 'F12'; // F12
			break;
		case 144:
			niceString = 'num lock'; // num lock
			break;
		case 145:
			niceString = 'scroll lock'; // scroll lock
			break;
		case 186:
			niceString = ';'; // semi-colon
			break;
		case 187:
			niceString = '='; // equal-sign
			break;
		case 188:
			niceString = ','; // comma
			break;
		case 189:
			niceString = '-'; // dash
			break;
		case 190:
			niceString = '.'; // period
			break;
		case 191:
			niceString = '/'; // forward slash
			break;
		case 192:
			niceString = '`'; // grave accent
			break;
		case 219:
			niceString = '['; // open bracket
			break;
		case 220:
			niceString = '\\'; // back slash
			break;
		case 221:
			niceString = ']'; // close bracket
			break;
		case 222:
			niceString = '\''; // single quote
			break;
		default:
			niceString = String.fromCharCode(testCode);
			break;
	}
	return keyComboString + niceString;
};
RESUtils.niceDate = function(d, usformat) {
	d = d || new Date();
	var year = d.getFullYear();
	var month = (d.getMonth() + 1);
	month = (month < 10) ? '0' + month : month;
	var day = d.getDate();
	day = (day < 10) ? '0' + day : day;
	var fullString = year + '-' + month + '-' + day;
	if (usformat) {
		fullString = month + '-' + day + '-' + year;
	}
	return fullString;
};
RESUtils.niceDateTime = function(d, usformat) {
	d = d || new Date();
	var dateString = RESUtils.niceDate(d);
	var hours = d.getHours();
	hours = (hours < 10) ? '0' + hours : hours;
	var minutes = d.getMinutes();
	minutes = (minutes < 10) ? '0' + minutes : minutes;
	var seconds = d.getSeconds();
	seconds = (seconds < 10) ? '0' + seconds : seconds;
	var fullString = dateString + ' ' + hours + ':' + minutes + ':' + seconds;
	return fullString;
};
RESUtils.niceDateDiff = function(origdate, newdate) {
	// Enter the month, day, and year below you want to use as
	// the starting point for the date calculation
	if (!newdate) {
		newdate = new Date();
	}

	var amonth = origdate.getUTCMonth() + 1;
	var aday = origdate.getUTCDate();
	var ayear = origdate.getUTCFullYear();

	var tyear = newdate.getUTCFullYear();
	var tmonth = newdate.getUTCMonth() + 1;
	var tday = newdate.getUTCDate();

	var y = 1;
	var mm = 1;
	var d = 1;
	var a2 = 0;
	var a1 = 0;
	var f = 28;

	if (((tyear % 4 === 0) && (tyear % 100 !== 0)) || (tyear % 400 === 0)) {
		f = 29;
	}

	var m = [31, f, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	var dyear = tyear - ayear;

	var dmonth = tmonth - amonth;
	if (dmonth < 0 && dyear > 0) {
		dmonth = dmonth + 12;
		dyear--;
	}

	var dday = tday - aday;
	if (dday < 0) {
		if (dmonth > 0) {
			var ma = amonth + tmonth;

			if (ma >= 12) {
				ma = ma - 12;
			}
			if (ma < 0) {
				ma = ma + 12;
			}
			dday = dday + m[ma];
			dmonth--;
			if (dmonth < 0) {
				dyear--;
				dmonth = dmonth + 12;
			}
		} else {
			dday = 0;
		}
	}

	var returnString = '';

	if (dyear === 0) {
		y = 0;
	}
	if (dmonth === 0) {
		mm = 0;
	}
	if (dday === 0) {
		d = 0;
	}
	if ((y === 1) && (mm === 1)) {
		a1 = 1;
	}
	if ((y === 1) && (d === 1)) {
		a1 = 1;
	}
	if ((mm === 1) && (d === 1)) {
		a2 = 1;
	}
	if (y === 1) {
		if (dyear === 1) {
			returnString += dyear + ' year';
		} else {
			returnString += dyear + ' years';
		}
	}
	if ((a1 === 1) && (a2 === 0)) {
		returnString += ' and ';
	}
	if ((a1 === 1) && (a2 === 1)) {
		returnString += ', ';
	}
	if (mm === 1) {
		if (dmonth === 1) {
			returnString += dmonth + ' month';
		} else {
			returnString += dmonth + ' months';
		}
	}
	if (a2 === 1) {
		returnString += ' and ';
	}
	if (d === 1) {
		if (dday === 1) {
			returnString += dday + ' day';
		} else {
			returnString += dday + ' days';
		}
	}
	if (returnString === '') {
		returnString = '0 days';
	}
	return returnString;
};

RESUtils.isEmpty = function(obj) {
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop))
			return false;
	}
	return true;
};

RESUtils.openLinkInNewTab = function(url, focus) {
	var thisJSON = {
		requestType: 'openLinkInNewTab',
		linkURL: url,
		button: focus
	};

	BrowserStrategy.sendMessage(thisJSON);
};
RESUtils.toggleButton = function(moduleID, fieldID, enabled, onText, offText, isTable) {
	var checked, thisToggle,
		toggleOn, toggleOff, field;

	enabled = enabled || false;
	checked = (enabled) ? 'CHECKED' : '';
	onText = onText || 'on';
	offText = offText || 'off';
	thisToggle = document.createElement('div');
	thisToggle.setAttribute('class', 'toggleButton');
	thisToggle.setAttribute('id', fieldID + 'Container');

	toggleOn = RESUtils.createElementWithID('span', null, 'toggleOn noCtrlF', onText);
	toggleOff = RESUtils.createElementWithID('span', null, 'toggleOff noCtrlF', offText);
	field = RESUtils.createElementWithID('input', fieldID);
	field.name = fieldID;
	field.type = 'checkbox';
	if (enabled) {
		field.checked = true;
	}
	if (isTable) {
		field.setAttribute('tableOption', 'true');
	}

	thisToggle.appendChild(toggleOn);
	thisToggle.appendChild(toggleOff);
	thisToggle.appendChild(field);
	thisToggle.addEventListener('click', function(e) {
		var thisCheckbox = this.querySelector('input[type=checkbox]'),
			enabled = thisCheckbox.checked;
		thisCheckbox.checked = !enabled;
		if (enabled) {
			this.classList.remove('enabled');
		} else {
			this.classList.add('enabled');
		}
		if (moduleID) {
			RESConsole.onOptionChange(moduleID, fieldID, enabled, !enabled);
		}
	}, false);
	if (enabled) thisToggle.classList.add('enabled');
	return thisToggle;
};
RESUtils.addCommas = function(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};
RESUtils.generateTable = function(items, call, context) {
	if (!items || !call) return;
	// Sanitize single item into items array
	if (!(items.length && typeof items !== 'string')) items = [items];

	var description = [];
	description.push('<table>');

	for (var i = 0; i < items.length; i++) {
		var item = call(items[i], i, items, context);
		if (typeof item === 'string') {
			description.push(item);
		} else if (item.length) {
			description = description.concat(item);
		}
	}
	description.push('</table>');
	description = description.join('\n');

	return description;
};
RESUtils.xhrCache = function(operation) {
	var thisJSON = {
		requestType: 'XHRCache',
		operation: operation
	};

	BrowserStrategy.sendMessage(thisJSON);
};
RESUtils.initObservers = function() {
	var siteTable, observer;
	if (RESUtils.pageType() !== 'comments') {
		// initialize sitetable observer...
		siteTable = document.getElementById('siteTable');
		var stMultiCheck = document.querySelectorAll('#siteTable');
		if (stMultiCheck.length === 2) {
			siteTable = stMultiCheck[1];
		}

		if (BrowserDetect.MutationObserver && siteTable) {
			observer = new BrowserDetect.MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					if (mutation.addedNodes[0].id.indexOf('siteTable') !== -1) {
						// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
						$(mutation.addedNodes[0]).find('.entry div.expando').each(function() {
							RESUtils.addSelfTextObserver(this);
						});
						RESUtils.watchers.siteTable.forEach(function(callback) {
							if (callback) callback(mutation.addedNodes[0]);
						});
					}
				});
			});

			observer.observe(siteTable, {
				attributes: false,
				childList: true,
				characterData: false
			});
		} else {
			// Opera doesn't support MutationObserver - so we need this for Opera support.
			if (siteTable) {
				siteTable.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') !== -1)) {
						RESUtils.watchers.siteTable.forEach(function(callback) {
							if (callback) callback(event.target);
						});
					}
				}, true);
			}
		}
	} else {
		// initialize sitetable observer...
		siteTable = document.querySelector('.commentarea > .sitetable');
		if (!siteTable) {
			siteTable = document.querySelector('.sitetable');
		}

		if (BrowserDetect.MutationObserver && siteTable) {
			observer = new BrowserDetect.MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {

					// handle comment listing pages (not within a post)
					if (mutation.addedNodes[0].id.indexOf('siteTable') !== -1) {
						// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
						$(mutation.addedNodes[0]).find('.entry div.expando').each(function() {
							RESUtils.addSelfTextObserver(this);
						});
						RESUtils.watchers.siteTable.forEach(function(callback) {
							if (callback) callback(mutation.addedNodes[0]);
						});
					}

					if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains('thing')) {
						var thing = mutation.addedNodes[0];
						var newCommentEntry = thing.querySelector('.entry');
						if (!$(newCommentEntry).data('alreadyDetected')) {
							$(newCommentEntry).data('alreadyDetected', true);
							$(thing).find('.child').each(function() {
								RESUtils.addNewCommentFormObserver(this);
							});
							RESUtils.watchers.newComments.forEach(function(callback) {
								if (callback) callback(newCommentEntry);
							});
						}
					}
				});
			});

			observer.observe(siteTable, {
				attributes: false,
				childList: true,
				characterData: false
			});
		} else {
			// Opera doesn't support MutationObserver - so we need this for Opera support.
			if (siteTable) {
				siteTable.addEventListener('DOMNodeInserted', RESUtils.mutationEventCommentHandler, false);
			}
		}
	}

	$('.entry div.expando').each(function() {
		RESUtils.addSelfTextObserver(this);
	});

	// initialize new comments observers on demand, by first wiring up click listeners to "load more comments" buttons.
	// on click, we'll add a mutation observer...
	$('.morecomments a').on('click', RESUtils.addNewCommentObserverToTarget);

	// initialize new comments forms observers on demand, by first wiring up click listeners to reply buttons.
	// on click, we'll add a mutation observer...
	// $('body').on('click', 'ul.flat-list li a[onclick*=reply]', RESUtils.addNewCommentFormObserver);
	$('.thing .child').each(function() {
		RESUtils.addNewCommentFormObserver(this);
	});

};
// Opera doesn't support MutationObserver - so we need this for Opera support.
RESUtils.mutationEventCommentHandler = function(event) {
	if ((event.target.tagName === 'DIV') && (event.target.classList.contains('thing'))) {
		// we've found a matching element - stop propagation.
		event.stopPropagation();
		// because nested DOMNodeInserted events are an absolute CLUSTER to manage,
		// only send individual comments through to the callback.
		// Otherwise, we end up calling functions on a parent, then its child (which
		// already got scanned when we passed in the parent), etc.
		var thisComment = event.target.querySelector('.entry');
		if (!$(thisComment).data('alreadyDetected')) {
			$(thisComment).data('alreadyDetected', true);
			// wire up listeners for new "more comments" links...
			$(event.target).find('.morecomments a').click(RESUtils.addNewCommentObserverToTarget);
			RESUtils.watchers.newComments.forEach(function(callback) {
				RESUtils.addNewCommentFormObserver(event.target);
				if (callback) callback(thisComment);
			});
		}
	}
};
RESUtils.addNewCommentObserverToTarget = function(e) {
	var ele = $(e.currentTarget).closest('.sitetable')[0];
	// mark this as having an observer so we don't add multiples...
	if (!$(ele).hasClass('hasObserver')) {
		$(ele).addClass('hasObserver');
		RESUtils.addNewCommentObserver(ele);
	}
};
RESUtils.addNewCommentObserver = function(ele) {
	var mutationNodeToObserve = ele;
	if (BrowserDetect.MutationObserver) {
		var observer = new BrowserDetect.MutationObserver(function(mutations) {
			// we need to get ONLY the nodes that are new...
			// get the nodeList from each mutation, find comments within it,
			// then call our callback on it.
			for (var i = 0, len = mutations.length; i < len; i++) {
				var thisMutation = mutations[i];
				var nodeList = thisMutation.addedNodes;
				// look at the added nodes, and find comment containers.
				for (var j = 0, jLen = nodeList.length; j < jLen; j++) {
					if (nodeList[j].classList.contains('thing')) {
						$(nodeList[j]).find('.child').each(function() {
							RESUtils.addNewCommentFormObserver(this);
						});

						// check for "load new comments" links within this group as well...
						$(nodeList[j]).find('.morecomments a').click(RESUtils.addNewCommentObserverToTarget);

						var subComments = nodeList[j].querySelectorAll('.entry');
						// look at the comment containers and find actual comments...
						for (var k = 0, kLen = subComments.length; k < kLen; k++) {
							var thisComment = subComments[k];
							if (!$(thisComment).data('alreadyDetected')) {
								$(thisComment).data('alreadyDetected', true);
								RESUtils.watchers.newComments.forEach(function(callback) {
									if (callback) callback(thisComment);
								});
							}
						}
					}
				}
			}

			// RESUtils.watchers.newComments.forEach(function(callback) {
			// // add form observers to these new comments we've found...
			//	$(mutations[0].target).find('.thing .child').each(function() {
			//		RESUtils.addNewCommentFormObserver(this);
			//	});
			//	// check for "load new comments" links within this group as well...
			//	$(mutations[0].target).find('.morecomments a').click(RESUtils.addNewCommentObserverToTarget);
			//	callback(mutations[0].target);
			// });

			// disconnect this observer once all callbacks have been run.
			// unless we have the nestedlisting class, in which case don't disconnect because that's a
			// bottom level load more comments where even more can be loaded after, so they all drop into this
			// same .sitetable div.
			if (!$(ele).hasClass('nestedlisting')) {
				observer.disconnect();
			}
		});

		observer.observe(mutationNodeToObserve, {
			attributes: false,
			childList: true,
			characterData: false
		});
	} else {
		mutationNodeToObserve.addEventListener('DOMNodeInserted', RESUtils.mutationEventCommentHandler, false);
	}
};
RESUtils.addNewCommentFormObserver = function(ele) {
	var commentsFormParent = ele;
	if (BrowserDetect.MutationObserver) {
		// var mutationNodeToObserve = moreCommentsParent.parentNode.parentNode.parentNode.parentNode;
		var observer = new BrowserDetect.MutationObserver(function(mutations) {
			var form = $(mutations[0].target).children('form');
			if ((form) && (form.length === 1)) {
				RESUtils.watchers.newCommentsForms.forEach(function(callback) {
					callback(form[0]);
				});
			} else {
				var newOwnComment = $(mutations[0].target).find(' > div.sitetable > .thing:first-child'); // assumes new comment will be prepended to sitetable's children
				if ((newOwnComment) && (newOwnComment.length === 1)) {
					// new comment detected from the current user...
					RESUtils.watchers.newComments.forEach(function(callback) {
						callback(newOwnComment[0]);
					});
				}
			}
		});

		observer.observe(commentsFormParent, {
			attributes: false,
			childList: true,
			characterData: false
		});
	} else {
		// Opera doesn't support MutationObserver - so we need this for Opera support.
		commentsFormParent.addEventListener('DOMNodeInserted', function(event) {
			// TODO: proper tag filtering here, it's currently all wrong.
			if (event.target.tagName === 'FORM') {
				RESUtils.watchers.newCommentsForms.forEach(function(callback) {
					if (callback) callback(event.target);
				});
			} else {
				var newOwnComment = $(event.target).find(' > div.sitetable > .thing:first-child'); // assumes new comment will be prepended to sitetable's children
				if ((newOwnComment) && (newOwnComment.length === 1)) {
					// new comment detected from the current user...
					RESUtils.watchers.newComments.forEach(function(callback) {
						callback(newOwnComment[0]);
					});
				}
			}
		}, true);
	}
};
RESUtils.addSelfTextObserver = function(ele) {
	var selfTextParent = ele;
	if (BrowserDetect.MutationObserver) {
		// var mutationNodeToObserve = moreCommentsParent.parentNode.parentNode.parentNode.parentNode;
		var observer = new BrowserDetect.MutationObserver(function(mutations) {
			var form = $(mutations[0].target).find('form');
			if ((form) && (form.length > 0)) {
				RESUtils.watchers.selfText.forEach(function(callback) {
					callback(form[0]);
				});
			}
		});

		observer.observe(selfTextParent, {
			attributes: false,
			childList: true,
			characterData: false
		});
	} else {
		// Opera doesn't support MutationObserver - so we need this for Opera support.
		selfTextParent.addEventListener('DOMNodeInserted', function(event) {
			// TODO: proper tag filtering here, it's currently all wrong.
			if (event.target.tagName === 'FORM') {
				RESUtils.watchers.selfText.forEach(function(callback) {
					if (callback) callback(event.target);
				});
			}
		}, true);
	}
};
RESUtils.watchForElement = function(type, callback) {
	switch (type) {
		case 'siteTable':
			RESUtils.watchers.siteTable.push(callback);
			break;
		case 'newComments':
			RESUtils.watchers.newComments.push(callback);
			break;
		case 'selfText':
			RESUtils.watchers.selfText.push(callback);
			break;
		case 'newCommentsForms':
			RESUtils.watchers.newCommentsForms.push(callback);
			break;
	}
};
RESUtils.watchers = {
	siteTable: [],
	newComments: [],
	selfText: [],
	newCommentsForms: []
};
// A link is a comment code if all these conditions are true:
// * It has no content (i.e. content.length === 0)
// * Its href is of the form "/code" or "#code"
//
// In case it's not clear, here is a list of some common comment
// codes on a specific subreddit:
// http://www.reddit.com/r/metarage/comments/p3eqe/full_updated_list_of_comment_faces_wcodes/
// also for CSS hacks to do special formatting, like /r/CSSlibrary

RESUtils.COMMENT_CODE_REGEX = /^[\/#].+$/;
RESUtils.isCommentCode = function(link) {
	// don't add annotations for hidden links - these are used as CSS
	// hacks on subreddits to do special formatting, etc.
	var content = link.textContent;

	// Note that link.href will return the full href (which includes the
	// reddit.com domain). We don't want that.
	var href = link.getAttribute('href');

	var emptyText = link.textContent.length === 0;
	var isCommentCode = RESUtils.COMMENT_CODE_REGEX.test(href);

	return emptyText && isCommentCode;
};
/*
Starts a unique named timeout.
If there is a running timeout with the same name cancel the old one in favor of the new.
Call with no time/call parameter (null/undefined/missing) to and existing one with the given name.
Used to derfer an action until a series of events has stopped.
e.g. wait until a user a stopped typing to update a comment preview.
(name based on similar function in underscore.js)
*/
RESUtils.debounceTimeouts = {};
RESUtils.debounce = function(name, time, call, data) {
	if (name === null) return;
	if (RESUtils.debounceTimeouts[name] !== undefined) {
		window.clearTimeout(RESUtils.debounceTimeouts[name]);
		delete RESUtils.debounceTimeouts[name];
	}
	if (time !== null && call !== null) {
		RESUtils.debounceTimeouts[name] = window.setTimeout(function() {
			delete RESUtils.debounceTimeouts[name];
			call(data);
		}, time);
	}
};
RESUtils.toolTipTimers = {};
/*
Iterate through an array in chunks, executing a callback on each element.
Each chunk is handled asynchronously from the others with a delay betwen each batch.
If the provided callback returns false iteration will be halted.
*/
RESUtils.forEachChunked = function(array, chunkSize, delay, call) {
	if (typeof array === 'undefined' || array === null) return;
	if (typeof chunkSize === 'undefined' || chunkSize === null || chunkSize < 1) return;
	if (typeof delay === 'undefined' || delay === null || delay < 0) return;
	if (typeof call === 'undefined' || call === null) return;
	var counter = 0;
	var length = array.length;

	function doChunk() {
		for (var end = Math.min(array.length, counter + chunkSize); counter < end; counter++) {
			var ret = call(array[counter], counter, array);
			if (ret === false) return;
		}
		if (counter < array.length) {
			window.setTimeout(doChunk, delay);
		}
	}
	window.setTimeout(doChunk, delay);
};
RESUtils.getComputedStyle = function(elem, property) {
	if (elem.constructor === String) {
		elem = document.querySelector(elem);
	} else if (!(elem instanceof Node)) {
		return undefined;
	}
	var strValue;
	if (document.defaultView && document.defaultView.getComputedStyle) {
		strValue = document.defaultView.getComputedStyle(elem, '').getPropertyValue(property);
	} else if (elem.currentStyle) {
		property = property.replace(/\-(\w)/g, function(strMatch, p1) {
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[property];
	}
	return strValue;
};
// utility function for checking events against keyCode arrays
RESUtils.checkKeysForEvent = function(event, keyArray) {
	//[keycode, alt, ctrl, shift, meta]
	// if we've passed in a number, fix that and make it an array with alt, shift and ctrl set to false.
	if (typeof keyArray === 'number') {
		keyArray = [keyArray, false, false, false, false];
	} else if (keyArray.length === 4) {
		keyArray.push(false);
	}
	// this hack is because Firefox differs from other browsers with keycodes for - and =
	if (BrowserDetect.isFirefox()) {
		if ((event.keyCode === 173) && (keyArray[0] === 189)) {
			keyArray[0] = 173;
		}
		if ((event.keyCode === 61) && (keyArray[0] === 187)) {
			keyArray[0] = 61;
		}
	}

	if (event.keyCode !== keyArray[0]) {
		return false;
	} else if (event.altKey !== keyArray[1]) {
		return false;
	} else if (event.ctrlKey !== keyArray[2]) {
		return false;
	} else if (event.shiftKey !== keyArray[3]) {
		return false;
	} else if (event.metaKey !== keyArray[4]) {
		return false;
	} else {
		return true;
	}
};
RESUtils.createElementWithID = function(elementType, id, classname, textContent) {
	var obj = document.createElement(elementType);
	if (id) {
		obj.setAttribute('id', id);
	}
	if ((typeof classname !== 'undefined') && classname && (classname !== '')) {
		obj.setAttribute('class', classname);
	}
	if (textContent) {
		if (classname && classname.split(' ').indexOf('noCtrlF') !== -1) {
			obj.setAttribute('data-text', textContent);
		} else {
			obj.textContent = textContent;
		}
	}
	return obj;
};
RESUtils.insertAfter = function(referenceNode, newNode) {
	if ((typeof referenceNode === 'undefined') || (referenceNode === null)) {
		console.log(arguments.callee.caller);
	} else if ((typeof referenceNode.parentNode !== 'undefined') && (typeof referenceNode.nextSibling !== 'undefined')) {
		if (referenceNode.parentNode === null) {
			console.log(arguments.callee.caller);
		} else {
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}
	}
};
RESUtils.cssPrefix = function(css) {
	return '-webkit-' + css + ';' + '-o-' + css + ';' + '-moz-' + css + ';' +
		'-ms-' + css + ';' + css + ';';
};
RESUtils.baseStyleProtection = 'margin: 0 !important; background-color: inherit !important; color: inherit !important; position: relative !important; left: 0 !important; top: 0 !important; max-height: none!important; max-width: none!important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0 !important; font-size: 12px !important; float: none !important; opacity: 1 !important;' + RESUtils.cssPrefix('transform: none !important;') + RESUtils.cssPrefix('filter: none !important;');
