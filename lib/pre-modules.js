// ==UserScript==
// @name          Reddit Enhancement Suite
// @namespace 	  http://reddit.honestbleeps.com/
// @description	  A suite of tools to enhance reddit...
// @copyright     2010-2012, Steve Sobel (http://redditenhancementsuite.com/)
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html/
// @author        honestbleeps
// @include       http://redditenhancementsuite.com/*
// @include       http://reddit.honestbleeps.com/*
// @include       http://reddit.com/*
// @include       https://reddit.com/*
// @include       http://*.reddit.com/*
// @include       https://*.reddit.com/*
// @version       4.1.2
// @updateURL     http://redditenhancementsuite.com/latest/reddit_enhamcement_suite.meta.js
// @downloadURL   http://redditenhancementsuite.com/latest/reddit_enhancement_suite.user.js
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js
// ==/UserScript==

var RESVersion = "4.1.2";

/*
	Reddit Enhancement Suite - a suite of tools to enhance Reddit
	Copyright (C) 2010-2011 - honestbleeps (steve@honestbleeps.com)

	RES is released under the GPL. However, I do ask a favor (obviously I don't/can't require it, I ask out of courtesy):
	
	Because RES auto updates and is hosted from a central server, I humbly request that if you intend to distribute your own
	modified Reddit Enhancement Suite, you name it something else and make it very clear to your users that it's your own
	branch and isn't related to mine.
	
	RES is updated very frequently, and I get lots of tech support questions/requests from people on outdated versions. If 
	you're distributing RES via your own means, those recipients won't always be on the latest and greatest, which makes 
	it harder for me to debug things and understand (at least with browsers that auto-update) whether or not people are on 
	a current version of RES.
	
	I can't legally hold you to any of this - I'm just asking out of courtesy.
	
	Thanks, I appreciate your consideration.  Without further ado, the all-important GPL Statement:

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

var tokenizeCSS = 'ul.token-input-list-facebook { overflow: hidden; height: auto !important; height: 1%; width: 400px; border: 1px solid #8496ba; cursor: text; font-size: 12px; font-family: Verdana; min-height: 1px; z-index: 1010; margin: 0; padding: 0; background-color: #fff; list-style-type: none; clear: left; }';
tokenizeCSS += 'ul.token-input-list-facebook li input { border: 0; width: 100px; padding: 3px 8px; background-color: white; margin: 2px 0; -webkit-appearance: caret; }';
tokenizeCSS += 'li.token-input-token-facebook { overflow: hidden;  height: auto !important;  height: 15px; margin: 3px; padding: 1px 3px; background-color: #eff2f7; color: #000; cursor: default; border: 1px solid #ccd5e4; font-size: 11px; border-radius: 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px; float: left; white-space: nowrap; }';
tokenizeCSS += 'li.token-input-token-facebook p { display: inline; padding: 0; margin: 0;}';
tokenizeCSS += 'li.token-input-token-facebook span { color: #a6b3cf; margin-left: 5px; font-weight: bold; cursor: pointer;}';
tokenizeCSS += 'li.token-input-selected-token-facebook { background-color: #5670a6; border: 1px solid #3b5998; color: #fff;}';
tokenizeCSS += 'li.token-input-input-token-facebook { float: left; margin: 0; padding: 0; list-style-type: none;}';
tokenizeCSS += 'div.token-input-dropdown-facebook { position: absolute; width: 400px; background-color: #fff; overflow: hidden; border-left: 1px solid #ccc; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; cursor: default; font-size: 11px; font-family: Verdana; z-index: 1001; }';
tokenizeCSS += 'div.token-input-dropdown-facebook p { margin: 0; padding: 5px; font-weight: bold; color: #777;}';
tokenizeCSS += 'div.token-input-dropdown-facebook ul { margin: 0; padding: 0;}';
tokenizeCSS += 'div.token-input-dropdown-facebook ul li { background-color: #fff; padding: 3px; margin: 0; list-style-type: none;}';
tokenizeCSS += 'div.token-input-dropdown-facebook ul li.token-input-dropdown-item-facebook { background-color: #fff;}';
tokenizeCSS += 'div.token-input-dropdown-facebook ul li.token-input-dropdown-item2-facebook { background-color: #fff;}';
tokenizeCSS += 'div.token-input-dropdown-facebook ul li em { font-weight: bold; font-style: normal;}';
tokenizeCSS += 'div.token-input-dropdown-facebook ul li.token-input-selected-dropdown-item-facebook { background-color: #3b5998; color: #fff;}';


var guidersCSS = '.guider { background: #FFF; border: 1px solid #666; font-family: arial; position: absolute; outline: none; z-index: 100000005 !important; padding: 4px 12px; width: 500px; z-index: 100; -moz-box-shadow: 0 0px 8px #111; -webkit-box-shadow: 0 0px 8px #111; box-shadow: 0 0px 8px #111; -moz-border-radius: 4px; -webkit-border-radius: 4px; border-radius: 4px;}';
guidersCSS += '.guider_buttons { height: 36px; position: relative; width: 100%; }';
guidersCSS += '.guider_content { position: relative; }';
guidersCSS += '.guider_description { margin-bottom: 10px; }';
guidersCSS += '.guider_content h1 { color: #1054AA; float: left; font-size: 21px; }';
guidersCSS += '.guider_close { float: right; padding: 10px 0 0; }';
// guidersCSS += '.x_button { background-image: url(\'x_close_button.jpg\'); cursor: pointer; height: 13px; width: 13px; }';
guidersCSS += '.x_button { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAIAAAD9iXMrAAAACXBIWXMAAAsTAAALEwEAmpwYAAABe0lEQVQoFT2RT0/CQBDFd7tbqIULiAaMgK1ngSqFCyHwyaFANS1+BEDigRgIFORAQv/5lhI32eR1duY3b6Z0vvg+Ho+M0TAMGWPx5VBKCSH/OpPJ8OVyqaqKqqqcsSgKophKkpTUIBX6dDptNhuON13X7wq3F4RgkEQJnpCr1c9sNgOFhUHgebvpdNrpdNAiiiIwt1vPdd1er8c5D4IAvAjm8vl8LpebTCZ4SKXSu91+Mh7XajX1Jv17OMCs4PlBBCutVgvIwcBqGIZt269GvVqtwAalMUD8OiYhKGo2Tfv9w7Isw3jTNA3FOGiIHA6FLcByTIjn7dfrdaFwv1gsKuWSoigXntgAxxXGKYHx8WjUqL9gfMdxhta43+/LMpeYHITxled5h5FIquv6Exjw6rifw+Gw2+2ez2eMLOZF62w2a5pm+fEhaYRIu23O51+Kkkpyrn1lmRWLxcQrKmEG+vlZAwQaxRwXa0NUHHzE4i/7vh8TCSTEoEul0h9jNtRZlgw9UAAAAABJRU5ErkJggg==); cursor: pointer; height: 13px; width: 13px; }';
guidersCSS += '.guider_content p { clear: both; color: #333; font-size: 13px; }';
guidersCSS += '.guider_button { background: -moz-linear-gradient(top, #5CA9FF 0%, #3D79C3 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #5CA9FF), color-stop(100%, #3D79C3)); background-color: #4A95E0; border: solid 1px #4B5D7E; color: #FFF; cursor: pointer; display: inline-block; float: right; font-size: 75%; font-weight: bold; margin-left: 6px; min-width: 40px; padding: 3px 5px; text-align: center; text-decoration: none; -moz-border-radius: 2px; -webkit-border-radius: 2px; border-radius: 2px; }';
guidersCSS += '#guider_overlay { background-color: #000; width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; opacity: 0.5; filter: alpha(opacity=50); z-index: 1000; }';
  /**
   * For optimization, the arrows image is inlined in the css below.
   * 
   * To use your own arrows image, replace this background-image with your own arrows.
   * It should have four arrows, top, right, left, and down.
   */ 
guidersCSS += '.guider_arrow { width: 42px; height: 42px; position: absolute; display: none; background-repeat: no-repeat; z-index: 100000006 !important; background-image: url(data:image/png;base64,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); }  ';
guidersCSS += '.guider_arrow_right { display: block; background-position: 0px 0px; right: -42px; }';
guidersCSS += '.guider_arrowdown { display: block; background-position: 0px -42px; bottom: -42px; }';
guidersCSS += '.guider_arrow_up { display: block; background-position: 0px -126px; top: -42px; }';
guidersCSS += '.guider_arrow_left { display: block; background-position: 0px -84px; left: -42px;}';




// DOM utility functions
function insertAfter( referenceNode, newNode ) {
	if ((typeof(referenceNode) == 'undefined') || (referenceNode == null)) {
		console.log(arguments.callee.caller);
	} else if ((typeof(referenceNode.parentNode) != 'undefined') && (typeof(referenceNode.nextSibling) != 'undefined')) {
		if (referenceNode.parentNode == null) {
			console.log(arguments.callee.caller);
		} else {
			referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
		}
	}
};
function createElementWithID(elementType, id, classname) {
	var obj = document.createElement(elementType);
	if (id != null) {
		obj.setAttribute('id', id);
	}
	if ((typeof(classname) != 'undefined') && (classname != '')) {
		obj.setAttribute('class', classname);
	}
	return obj;
};

// this alias is to account for opera having different behavior...
if (typeof(navigator) == 'undefined') navigator = window.navigator;

//Because Safari 5.1 doesn't have Function.bind
if (typeof(Function.prototype.bind) == 'undefined') {
	Function.prototype.bind = function(context) {
		var oldRef = this;
		return function() {
			return oldRef.apply(context || null, Array.prototype.slice.call(arguments));
		};
	}
}

var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			string: navigator.userAgent,
			subString: "iPhone",
			identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();

var safeJSON = {
	// safely parses JSON and won't kill the whole script if JSON.parse fails
	// if localStorageSource is specified, will offer the user the ability to delete that localStorageSource to stop further errors.
	// if silent is specified, it will fail silently...
	parse: function(data, localStorageSource, silent) {
		try {
			if (typeof(safari) != 'undefined') {
				if (data.substring(0,2) == 's{') {
					data = data.substring(1,data.length);
				}
			}
			return JSON.parse(data);
		} catch (error) {
			if (silent) return {};
			if (localStorageSource) {
				var msg = 'Error caught: JSON parse failure on the following data from "'+localStorageSource+'": <textarea rows="5" cols="50">' + data + '</textarea><br>RES can delete this data to stop errors from happening, but you might want to copy/paste it to a text file so you can more easily re-enter any lost information.';
				alert(msg, function() {
					// back up a copy of the corrupt data
					localStorage.setItem(localStorageSource + '.error', data);
					// delete the corrupt data
					RESStorage.removeItem(localStorageSource);
				});
			} else {
				alert('Error caught: JSON parse failure on the following data: ' + data);
			}
			return {};
		}
	}
}

// array compare utility function for keyCode arrays
function keyArrayCompare(fromArr, toArr) {
	// if we've passed in a number, fix that and make it an array with alt, shift and ctrl set to false.
	if (typeof(toArr) == 'number') {
		toArr = [toArr, false, false, false];
	} else if (toArr.length == 4) {
		toArr.push(false);
	}
	if (fromArr.length != toArr.length) return false;
	for (var i = 0; i < toArr.length; i++) {
		if (fromArr[i].compare) { 
			if (!fromArr[i].compare(toArr[i])) return false;
		}
		if (fromArr[i] !== toArr[i]) return false;
	}
	return true;
}

function operaUpdateCallback(obj) {
	RESUtils.compareVersion(obj);
}
function operaForcedUpdateCallback(obj) {
	RESUtils.compareVersion(obj, true);
}

/* DOM utility functions */
function hasClass(ele,cls) {
	if ((typeof(ele) == 'undefined') || (ele == null)) {
		if (typeof(console) != 'undefined') {
			console.log(arguments.callee.caller);
		}
		return false;
	}
	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(ele,cls) {
	if (ele == null) {
		console.log(arguments.callee.caller);
	}
	if (!hasClass(ele,cls)) ele.className += " "+cls;
}
function removeClass(ele,cls) {
	if (hasClass(ele,cls)) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,' ');
	}
}

// This object will store xmlHTTPRequest callbacks for Safari because Safari's extension architecture seems stupid.
// This really shouldn't be necessary, but I can't seem to hold on to an onload function that I pass to the background page...
xhrQueue = { count: 0, onloads: [] };


// if this is a jetpack addon, add an event listener like Safari's message handler...
if (typeof(self.on) == 'function') {
	self.on('message', function(msgEvent) {
		switch (msgEvent.name) {
			case 'GM_xmlhttpRequest':
				// Fire the appropriate onload function for this xmlhttprequest.
				xhrQueue.onloads[msgEvent.XHRID](msgEvent.response);
				break;
			case 'compareVersion':
				var forceUpdate = false;
				if (typeof(msgEvent.message.forceUpdate) != 'undefined') forceUpdate = true;
				RESUtils.compareVersion(msgEvent.message, forceUpdate);
				break;
			case 'loadTweet':
				var tweet = msgEvent.response;
				var thisExpando = modules['styleTweaks'].tweetExpando;
				thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
				thisExpando.style.display = 'block';
				addClass(thisExpando,'twitterLoaded');
				break;
			case 'getLocalStorage':
				// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
				// old school localStorage from the foreground page to the background page to keep their settings...
				if (typeof(msgEvent.message.importedFromForeground) == 'undefined') {
					// it doesn't exist.. copy it over...
					var thisJSON = {
						requestType: 'saveLocalStorage',
						data: localStorage
					}
					self.postMessage(thisJSON);
				} else {
					setUpRESStorage(msgEvent.message);
					//RESInit();
				}
				break;
			case 'saveLocalStorage':
				// Okay, we just copied localStorage from foreground to background, let's set it up...
				setUpRESStorage(msgEvent.message);
				break;
			case 'localStorage':
				RESStorage.setItem(msgEvent.itemName, msgEvent.itemValue, true);
				break;
			default:
				// console.log('unknown event type in self.on');
				// console.log(msgEvent.toSource());
				break;
		}
	});
}

// This is the message handler for Safari - the background page calls this function with return data...
function safariMessageHandler(msgEvent) {
	switch (msgEvent.name) {
		case 'GM_xmlhttpRequest':
			// Fire the appropriate onload function for this xmlhttprequest.
			xhrQueue.onloads[msgEvent.message.XHRID](msgEvent.message);
			break;
		case 'compareVersion':
			var forceUpdate = false;
			if (typeof(msgEvent.message.forceUpdate) != 'undefined') forceUpdate = true;
			RESUtils.compareVersion(msgEvent.message, forceUpdate);
			break;
		case 'loadTweet':
			var tweet = msgEvent.message;
			var thisExpando = modules['styleTweaks'].tweetExpando;
			thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
			thisExpando.style.display = 'block';
			addClass(thisExpando,'twitterLoaded');
			break;
		case 'getLocalStorage':
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
			// old schol localStorage from the foreground page to the background page to keep their settings...
			if (typeof(msgEvent.message.importedFromForeground) == 'undefined') {
				// it doesn't exist.. copy it over...
				var thisJSON = {
					requestType: 'saveLocalStorage',
					data: localStorage
				}
				safari.self.tab.dispatchMessage('saveLocalStorage', thisJSON);
			} else {
				setUpRESStorage(msgEvent.message);
				//RESInit();
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			setUpRESStorage(msgEvent.message);
			//RESInit();
			break;
		case 'localStorage':
			RESStorage.setItem(msgEvent.message.itemName, msgEvent.message.itemValue, true);
			break;
		default:
			// console.log('unknown event type in safariMessageHandler');
			break;
	}
}

// This is the message handler for Opera - the background page calls this function with return data...
function operaMessageHandler(msgEvent) {
	  var eventData = msgEvent.data;
	  switch (eventData.msgType) {
		case 'GM_xmlhttpRequest':
			// Fire the appropriate onload function for this xmlhttprequest.
			xhrQueue.onloads[eventData.XHRID](eventData.data);
			break;
		case 'compareVersion':
			var forceUpdate = false;
			if (typeof(eventData.data.forceUpdate) != 'undefined') forceUpdate = true;
			RESUtils.compareVersion(eventData.data, forceUpdate);
			break;
		case 'loadTweet':
			var tweet = eventData.data;
			var thisExpando = modules['styleTweaks'].tweetExpando;
			thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
			thisExpando.style.display = 'block';
			addClass(thisExpando,'twitterLoaded');
			break;
		case 'getLocalStorage':
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
			// old schol localStorage from the foreground page to the background page to keep their settings...
			if (typeof(eventData.data.importedFromForeground) == 'undefined') {
				// it doesn't exist.. copy it over...
				var thisJSON = {
					requestType: 'saveLocalStorage',
					data: localStorage
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else {
				if (location.hostname.match('reddit')) {
					setUpRESStorage(eventData.data);
					//RESInit();
				}
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			setUpRESStorage(eventData.data);
			if (location.hostname.match('reddit')) {
				//RESInit();
			}
			break;
		case 'localStorage':
			if ((typeof(RESStorage) != 'undefined') && (typeof(RESStorage.setItem) == 'function')) {
				RESStorage.setItem(eventData.itemName, eventData.itemValue, true);
			} else {
				// a change in opera requires this wait/timeout for the RESStorage grab to work...
				function waitForRESStorage(eData) {
					if ((typeof(RESStorage) != 'undefined') && (typeof(RESStorage.setItem) == 'function')) {
						RESStorage.setItem(eData.itemName, eData.itemValue, true);
					} else {
						setTimeout(function() { waitForRESStorage(eData); }, 200);
					}
				}
				var savedEventData = {
					itemName: eventData.itemName,
					itemValue: eventData.itemValue
				};
				waitForRESStorage(savedEventData);
			}
			break;
		default:
			// console.log('unknown event type in operaMessageHandler');
			break;
	  }
}

// listen for requests from chrome background page
if (typeof(chrome) != 'undefined') {
	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse) {
			switch(request.requestType) {
				case 'localStorage':
					RESStorage.setItem(request.itemName, request.itemValue, true);
					break;
				default:
					// sendResponse({status: "unrecognized request type"});
					break;
			}
		}
	);
}

if (typeof(safari) != 'undefined') {
	// Safari has a ridiculous bug that causes it to lose access to safari.self.tab if you click the back button.
	// this stupid one liner fixes that.
	window.onunload = function(){};
	safari.self.addEventListener("message", safariMessageHandler, false);
}
// we can't do this check for opera here because we need to wait until DOMContentLoaded is triggered, I think.  Putting this in RESinit();

// opera compatibility
if (typeof(opera) != 'undefined') {
	// removing this line for new localStorage methodology (store in extension localstorage)
	sessionStorage = window.sessionStorage;
	localStorage = window.localStorage;
	location = window.location;
	XMLHttpRequest = window.XMLHttpRequest;
}

// Firebug stopped showing console.log for some reason. Need to use unsafeWindow if available. Not sure if this was due to a Firebug version update or what.
if (typeof(unsafeWindow) != 'undefined') {
	if ((typeof(unsafeWindow.console) != 'undefined') && (typeof(self.on) != 'function')) {
		console = unsafeWindow.console;
	} else if (typeof(console) == 'undefined') {
		console = {
			log: function(str) {
				return false;
			}
		};
	}
}



// GreaseMonkey API compatibility for non-GM browsers (Chrome, Safari, Firefox)
// @copyright      2009, 2010 James Campos
// @modified		2010 Steve Sobel - added some missing gm_* functions
// @license        cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
if ((typeof GM_deleteValue == 'undefined') || (typeof GM_addStyle == 'undefined')) {
	GM_addStyle = function(css) {
		var style = document.createElement('style');
		style.textContent = css;
		var head = document.getElementsByTagName('head')[0];
		if (head) {
			head.appendChild(style);
		}
	}

	GM_deleteValue = function(name) {
		localStorage.removeItem(name);
	}

	GM_getValue = function(name, defaultValue) {
		var value = localStorage.getItem(name);
		if (!value)
			return defaultValue;
		var type = value[0];
		value = value.substring(1);
		switch (type) {
			case 'b':
				return value == 'true';
			case 'n':
				return Number(value);
			default:
				return value;
		}
	}

	GM_log = function(message) {
		console.log(message);
	}

	GM_registerMenuCommand = function(name, funk) {
	//todo
	}

	GM_setValue = function(name, value) {
		value = (typeof value)[0] + value;
		localStorage.setItem(name, value);
	}
	
	if (typeof(chrome) != 'undefined') {
		GM_xmlhttpRequest = function(obj) {
			var crossDomain = (obj.url.indexOf(location.hostname) == -1);
			
			if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
				obj.requestType = 'GM_xmlhttpRequest';
				if (typeof(obj.onload) != 'undefined') {
					chrome.extension.sendRequest(obj, function(response) {
						obj.onload(response);
					});
				}
			} else {
				var request=new XMLHttpRequest();
				request.onreadystatechange=function() { if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); } }
				request.onerror=function() { if(obj.onerror) { obj.onerror(request); } }
				try { request.open(obj.method,obj.url,true); } catch(e) { if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return; }
				if(obj.headers) { for(var name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
				request.send(obj.data); return request;
			}
		}
	} else if (typeof(safari) != 'undefined')  {
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// Since Safari doesn't provide legitimate callbacks, I have to store the onload function here in the main
			// userscript in a queue (see xhrQueue), wait for data to come back from the background page, then call the onload.

			// oy vey... another problem. When Safari sends xmlhttpRequests from the background page, it loses the cookies etc that it'd have 
			// had from the foreground page... so we need to write a bit of a hack here, and call different functions based on whether or 
			// not the request is cross domain... For same-domain requests, we'll call from the foreground...
			var crossDomain = (obj.url.indexOf(location.hostname) == -1);
			
			if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
				obj.XHRID = xhrQueue.count;
				xhrQueue.onloads[xhrQueue.count] = obj.onload;
				safari.self.tab.dispatchMessage("GM_xmlhttpRequest", obj);
				xhrQueue.count++;
			} else {
				var request=new XMLHttpRequest();
				request.onreadystatechange=function() { if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); } }
				request.onerror=function() { if(obj.onerror) { obj.onerror(request); } }
				try { request.open(obj.method,obj.url,true); } catch(e) { if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return; }
				if(obj.headers) { for(var name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
				request.send(obj.data); return request;
			}
		}
	} else if (typeof(opera) != 'undefined') {
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// Turns out, Opera works this way too, but I'll forgive them since their extensions are so young and they're awesome people...

			// oy vey... cross domain same issue with Opera.
			var crossDomain = (obj.url.indexOf(location.hostname) == -1);
			
			if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
				obj.XHRID = xhrQueue.count;
				xhrQueue.onloads[xhrQueue.count] = obj.onload;
				opera.extension.postMessage(JSON.stringify(obj));
				xhrQueue.count++;
			} else {
				var request=new XMLHttpRequest();
				request.onreadystatechange=function() { if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); } }
				request.onerror=function() { if(obj.onerror) { obj.onerror(request); } }
				try { request.open(obj.method,obj.url,true); } catch(e) { if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return; }
				if(obj.headers) { for(var name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
				request.send(obj.data); return request;
			}
		}
	} else if (typeof(self.on) == 'function') {
		// we must be in a Firefox / jetpack addon...
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// okay, firefox's jetpack addon does this same stuff... le sigh..
			if (typeof(obj.onload) != 'undefined') {
				obj.XHRID = xhrQueue.count;
				xhrQueue.onloads[xhrQueue.count] = obj.onload;
				self.postMessage(obj);
				xhrQueue.count++;
			}
		}
	}
} else {
	// this hack is to avoid an unsafeWindow error message if a gm_xhr is ever called as a result of a jQuery-induced ajax call.
	// yes, it's ugly, but it's necessary if we're using Greasemonkey together with jQuery this way.
	var oldgmx = GM_xmlhttpRequest;
	GM_xmlhttpRequest = function(params) {
		setTimeout(function() {
			oldgmx(params);
		}, 0);
	}
}


var modules = {};

// define common RESUtils - reddit related functions and data that may need to be accessed...
var RESUtils = {
	// A cache variable to store CSS that will be applied at the end of execution...
	css: '',
	addCSS: function(css) {
		this.css += css;
	},
	insertParam: function(href, key, value) {
		var pre = '&';
		if (href.indexOf('?') == -1) pre = '?';
		return href + pre + key + '=' + value;
	},
	// checks if script should run on current URL using exclude / include.
	isMatchURL: function (moduleID) {
		var currURL = location.href;
		// get includes and excludes...
		var excludes = modules[moduleID].exclude;
		var includes = modules[moduleID].include;
		// first check excludes...
		if (typeof(excludes) != 'undefined') {
			for (var i=0, len = excludes.length; i<len; i++) {
				// console.log(moduleID + ' -- ' + excludes[i] + ' - excl test - ' + currURL + ' - result: ' + excludes[i].test(currURL));
				if (excludes[i].test(currURL)) {
					return false;
				}
			}
		}
		// then check includes...
		for (var i=0, len=includes.length; i<len; i++) {
			// console.log(moduleID + ' -- ' + includes[i] + ' - incl test - ' + currURL + ' - result: ' + includes[i].test(currURL));
			if (includes[i].test(currURL)) {
				return true;
			}
		}
		return false;
	},
	// gets options for a module...
	getOptionsFirstRun: [],
	getOptions: function(moduleID) {
		if (this.getOptionsFirstRun[moduleID]) {
			// we've already grabbed these out of localstorage, so modifications should be done in memory. just return that object.
			return modules[moduleID].options;
		}
		var thisOptions = RESStorage.getItem('RESoptions.' + moduleID);
		var currentTime = new Date();
		if ((thisOptions) && (thisOptions != 'undefined') && (thisOptions != null)) {
			// merge options (in case new ones were added via code) and if anything has changed, update to localStorage
			var storedOptions = safeJSON.parse(thisOptions, 'RESoptions.' + moduleID);
			var codeOptions = modules[moduleID].options;
			var newOption = false;
			for (var attrname in codeOptions) {
				if (typeof(storedOptions[attrname]) == 'undefined') {
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
	},
	getUrlParams: function () {
	  var result = {}, queryString = location.search.substring(1),
		  re = /([^&=]+)=([^&]*)/g, m;
	  while (m = re.exec(queryString)) {
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	  }
	  return result;
	},
	setOption: function(moduleID, optionName, optionValue) {
		if (optionName.match(/_[\d]+$/)) {
			optionName = optionName.replace(/_[\d]+$/,'');
		}
		var thisOptions = this.getOptions(moduleID);
		var saveOptionValue;
		if (optionValue == "") {
			saveOptionValue = '';
		} else if ((isNaN(optionValue)) || (typeof(optionValue) == 'boolean') || (typeof(optionValue) == 'object')) {
			saveOptionValue = optionValue;
		} else if (optionValue.indexOf('.')) {
			saveOptionValue = parseFloat(optionValue);
		} else {
			saveOptionValue = parseInt(optionValue);
		}
		thisOptions[optionName].value = saveOptionValue;
		// save it to the object...
		modules[moduleID].options = thisOptions;
		// save it to RESStorage...
		RESStorage.setItem('RESoptions.' + moduleID, JSON.stringify(modules[moduleID].options));
		return true;
	},
	click: function(obj, button) { 
		var button = button || 0;
		var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, button, null); obj.dispatchEvent(evt); 
	},
	mousedown: function(obj, button) { 
		var button = button || 0;
		var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('mousedown', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, button, null); obj.dispatchEvent(evt); 
	},
	loggedInUser: function() {
		if (typeof(this.loggedInUserCached) == 'undefined') {
			var userLink = document.querySelector('#header-bottom-right > span.user > a');
			if ((userLink != null) && (!hasClass(userLink,'login-required'))) {
				this.loggedInUserCached = userLink.innerHTML;
			} else {
				this.loggedInUserCached = null;
			}
		}
		return this.loggedInUserCached;
	},
	loggedInUserInfo: function(callback) {
		if (RESUtils.loggedInUser() == null) return false;
		RESUtils.loggedInUserInfoCallbacks.push(callback);
		var cacheData = RESStorage.getItem('RESUtils.userInfoCache.' + RESUtils.loggedInUser()) || '{}';
		var userInfoCache = safeJSON.parse(cacheData);
		var lastCheck = (userInfoCache != null) ? parseInt(userInfoCache.lastCheck) || 0 : 0;
		var now = new Date();
		// 300000 = 5 minutes
		if ((now.getTime() - lastCheck) > 300000) {
			if (!RESUtils.loggedInUserInfoRunning) {
				RESUtils.loggedInUserInfoRunning = true;
				GM_xmlhttpRequest({
					method:	"GET",
					url:	location.protocol + "//"+ location.hostname+ "/user/" + RESUtils.loggedInUser() + "/about.json?app=res",
					onload:	function(response) {
						var thisResponse = JSON.parse(response.responseText);
						var userInfoCache = {
							lastCheck: now.getTime(),
							userInfo: thisResponse
						}
						RESStorage.setItem('RESUtils.userInfoCache.' + RESUtils.loggedInUser(),JSON.stringify(userInfoCache));
						while (RESUtils.loggedInUserInfoCallbacks.length) {
							var thisCallback = RESUtils.loggedInUserInfoCallbacks.pop();
							thisCallback(userInfoCache.userInfo);
						}
						RESUtils.loggedInUserInfoRunning = false;
					}
				});
			}
		} else {
			while (RESUtils.loggedInUserInfoCallbacks.length) {
				var thisCallback = RESUtils.loggedInUserInfoCallbacks.pop();
				thisCallback(userInfoCache.userInfo);
			}
		}
	},
	loggedInUserInfoCallbacks: [],
	commentsRegex: /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i,
	friendsCommentsRegex: /https?:\/\/([a-z]+).reddit.com\/r\/friends\/*comments\/?/i,
	inboxRegex: /https?:\/\/([a-z]+).reddit.com\/message\/[-\w\.\/]*/i,
	profileRegex: /https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.#=]*\/?(comments)?\/?(\?([a-z]+=[a-zA-Z0-9_%]*&?)*)?$/i, // fix to regex contributed by s_quark
	submitRegex: /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*\/submit\/?$/i,
	prefsRegex: /https?:\/\/([a-z]+).reddit.com\/prefs\/?/i,
	pageType: function() {
		if (typeof(this.pageTypeSaved) == 'undefined') {
			var pageType = '';
			var currURL = location.href.split('#')[0];
			if (RESUtils.profileRegex.test(currURL)) {
				pageType = 'profile';
			} else if ((RESUtils.commentsRegex.test(currURL)) || (RESUtils.friendsCommentsRegex.test(currURL))) {
				pageType = 'comments'
			} else if (RESUtils.inboxRegex.test(currURL)) {
				pageType = 'inbox';
			} else if (RESUtils.submitRegex.test(currURL)) {
				pageType = 'submit';
			} else if (RESUtils.prefsRegex.test(currURL)) {
				pageType = 'prefs';
			} else {
				pageType = 'linklist';
			}
			this.pageTypeSaved = pageType;
		} 
		return this.pageTypeSaved;
	},
	matchRE: /https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w\.\+]+).*/i,
	currentSubreddit: function(check) {
		if (typeof(this.curSub) == 'undefined') {
			var match = location.href.match(RESUtils.matchRE);
			if (match != null) {
				this.curSub = match[1];
				if (check) return (match[1].toLowerCase() == check.toLowerCase());
				return match[1];
			} else {
				if (check) return false;
				return null;
			}
		} else {
			if (check) return (this.curSub.toLowerCase() == check.toLowerCase());
			return this.curSub;
		}
	},
	currentUserProfile: function() {
		if (typeof(this.curUserProfile) == 'undefined') {
			var match = location.href.match(/https?:\/\/(?:[a-z]+).reddit.com\/user\/([\w\.]+).*/i);
			if (match != null) {
				this.curUserProfile = match[1];
				return match[1];
			} else {
				return null;
			}
		} else {
			return this.curUserProfile;
		}
	},
	getXYpos: function (obj) {
		var topValue= 0,leftValue= 0;
		while(obj){
			leftValue+= obj.offsetLeft;
			topValue+= obj.offsetTop;
			obj= obj.offsetParent;
		}
		return { 'x': leftValue, 'y': topValue };
	},
	elementInViewport: function (obj) {
		// check the headerOffset - if we've pinned the subreddit bar, we need to add some pixels so the "visible" stuff is lower down the page.
		var headerOffset = this.getHeaderOffset();
		var top = obj.offsetTop - headerOffset;
		var left = obj.offsetLeft;
		var width = obj.offsetWidth;
		var height = obj.offsetHeight;
		while(obj.offsetParent) {
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
	},
	setMouseXY: function(e) {
		e = e || window.event;
		var cursor = {x:0, y:0};
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
	},
	elementUnderMouse: function (obj) {
		var top = obj.offsetTop;
		var left = obj.offsetLeft;
		var width = obj.offsetWidth;
		var height = obj.offsetHeight;
		var right = left + width;
		var bottom = top + height;
		if ((RESUtils.mouseX >= left) && (RESUtils.mouseX <= right) && (RESUtils.mouseY >= top) && (RESUtils.mouseY <= bottom)) {
			return true;
		} else {
			return false;
		}
	},
	scrollTo: function(x,y) {
		var headerOffset = this.getHeaderOffset();
		window.scrollTo(x,y-headerOffset);
	},
	getHeaderOffset: function() {
		if (typeof(this.headerOffset) == 'undefined') {
			this.headerOffset = 0;
			switch (modules['betteReddit'].options.pinHeader.value) {
				case 'none':
					break;
				case 'sub':
					this.theHeader = document.querySelector('#sr-header-area');
					break;
				case 'subanduser':
					this.theHeader = document.querySelector('#sr-header-area');
					break;
				case 'header':
					this.theHeader = document.querySelector('#header');
					break;
			}
			if (this.theHeader) {
				this.headerOffset = this.theHeader.offsetHeight + 6;
			}
		}
		return this.headerOffset;
	},
	setSelectValue: function(obj, value) {
		for (var i=0, len=obj.length; i < len; i++) {
			// for some reason in firefox, obj[0] is undefined... weird. adding a test for existence of obj[i]...
			// okay, now as of ff8, it's even barfing here unless we console.log out a check - nonsensical.
			// a bug has been filed to bugzilla at:
			// https://bugzilla.mozilla.org/show_bug.cgi?id=702847
			if ((obj[i]) && (obj[i].value == value)) {
				obj[i].selected = true;
			}
		}
	},
	stripHTML: function(str) {
		var regExp = /<\/?[^>]+>/gi;
        str = str.replace(regExp,"");
        return str;
	},
	fadeElementOut: function(obj, speed, callback) {
		if (obj.getAttribute('isfading') == 'in') {
			return false;
		}
		obj.setAttribute('isfading','out');
		speed = speed || 0.1;
		if (obj.style.opacity == '') obj.style.opacity = '1';
		if (obj.style.opacity <= 0) {
			obj.style.display = 'none';
			obj.setAttribute('isfading',false);
			if (callback) callback();
			return true;
		} else {
			var newOpacity = parseFloat(obj.style.opacity) - speed;
			if (newOpacity < speed) newOpacity = 0;
			obj.style.opacity = newOpacity;
			setTimeout(function() { RESUtils.fadeElementOut(obj, speed, callback) }, 100);
		}
	},
	fadeElementIn: function(obj, speed, finalOpacity) {
		finalOpacity = finalOpacity || 1;
		if (obj.getAttribute('isfading') == 'out') {
			return false;
		}
		obj.setAttribute('isfading','in');
		speed = speed || 0.1;
		if ((obj.style.display == 'none') || (obj.style.display == '')) {
			obj.style.opacity = 0;
			obj.style.display = 'block';
		}
		if (obj.style.opacity >= finalOpacity) {
			obj.setAttribute('isfading',false);
			obj.style.opacity = finalOpacity;
			return true;
		} else {
			var newOpacity = parseFloat(obj.style.opacity) + parseFloat(speed);
			if (newOpacity > finalOpacity) newOpacity = finalOpacity;
			obj.style.opacity = newOpacity;
			setTimeout(function() { RESUtils.fadeElementIn(obj, speed, finalOpacity) }, 100);
		}
	},
	setNewNotification: function() {
		$('#RESSettingsButton, .gearIcon').addClass('newNotification').click(function() {
			location.href = '/r/RESAnnouncements';
		});
	},
	firstRun: function() {
		// if this is the first time this version has been run, pop open the what's new tab, background focused.
		if (RESStorage.getItem('RES.firstRun.'+RESVersion) == null) {
			RESStorage.setItem('RES.firstRun.'+RESVersion,'true');
			RESUtils.openLinkInNewTab('http://redditenhancementsuite.com/whatsnew.html?v='+RESVersion, false);
		}
	},
	// checkForUpdate: function(forceUpdate) {
	checkForUpdate: function() {
		if (RESUtils.currentSubreddit('RESAnnouncements')) {
			RESStorage.removeItem('RES.newAnnouncement','true');
		}
		var now = new Date();
		var lastCheck = parseInt(RESStorage.getItem('RESLastUpdateCheck')) || 0;
		// if we haven't checked for an update in 24 hours, check for one now!
		// if (((now.getTime() - lastCheck) > 86400000) || (RESVersion > RESStorage.getItem('RESlatestVersion')) || ((RESStorage.getItem('RESoutdated') == 'true') && (RESVersion == RESStorage.getItem('RESlatestVersion'))) || forceUpdate) {
		if ((now.getTime() - lastCheck) > 86400000) {
			// now we're just going to check /r/RESAnnouncements for new posts, we're not checking version numbers...
			var lastID = RESStorage.getItem('RES.lastAnnouncementID');
			$.getJSON('/r/RESAnnouncements/.json?limit=1&app=res', function(data) {
				RESStorage.setItem('RESLastUpdateCheck',now.getTime());
				var thisID = data.data.children[0].data.id;
				if (thisID != lastID) {
					RESStorage.setItem('RES.newAnnouncement','true');
					RESUtils.setNewNotification();
				}
				RESStorage.setItem('RES.lastAnnouncementID', thisID);
			});
			/*
			var jsonURL = 'http://reddit.honestbleeps.com/update.json?v=' + RESVersion;
			// mark off that we've checked for an update...
			RESStorage.setItem('RESLastUpdateCheck',now.getTime());
			var outdated = false;
			if (typeof(chrome) != 'undefined') {
				// we've got chrome, so we need to hit up the background page to do cross domain XHR
				thisJSON = {
					requestType: 'compareVersion',
					url: jsonURL
				}
				chrome.extension.sendRequest(thisJSON, function(response) {
					// send message to background.html to open new tabs...
					outdated = RESUtils.compareVersion(response, forceUpdate);
				});
			} else if (typeof(safari) != 'undefined') {
				// we've got safari, so we need to hit up the background page to do cross domain XHR
				thisJSON = {
					requestType: 'compareVersion',
					url: jsonURL,
					forceUpdate: forceUpdate
				}
				safari.self.tab.dispatchMessage("compareVersion", thisJSON);
			} else if (typeof(opera) != 'undefined') {
				// we've got opera, so we need to hit up the background page to do cross domain XHR
				thisJSON = {
					requestType: 'compareVersion',
					url: jsonURL,
					forceUpdate: forceUpdate
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else {
				// we've got greasemonkey, so we can do cross domain XHR.
				GM_xmlhttpRequest({
					method:	"GET",
					url:	jsonURL,
					onload:	function(response) {
						outdated = RESUtils.compareVersion(JSON.parse(response.responseText), forceUpdate);
					}
				});
			}
			*/
		}
	},
	/*
	compareVersion: function(response, forceUpdate) {
		if (RESVersion < response.latestVersion) {
			RESStorage.setItem('RESoutdated','true');
			RESStorage.setItem('RESlatestVersion',response.latestVersion);
			RESStorage.setItem('RESmessage',response.message);
			if (forceUpdate) {
				RESConsole.RESCheckUpdateButton.innerHTML = 'You are out of date! <a target="_blank" href="http://reddit.honestbleeps.com/download">[click to update]</a>';
			}
			return true;
		} else {
			RESStorage.setItem('RESlatestVersion',response.latestVersion);
			RESStorage.setItem('RESoutdated','false');
			if (forceUpdate) {
				RESConsole.RESCheckUpdateButton.innerHTML = 'You are up to date!';
			}
			return false;
		}
	},
	*/
	proEnabled: function() {
		return ((typeof(modules['RESPro']) != 'undefined') && (modules['RESPro'].isEnabled()));
	},
	niceKeyCode: function(charCode) {
		var keyComboString = '';
		var testCode, niceString;
		if (typeof(charCode) == 'string') {
			var tempArray = charCode.split(',');
			if (tempArray.length) {
				if (tempArray[1] == 'true') keyComboString += 'alt-';
				if (tempArray[2] == 'true') keyComboString += 'ctrl-';
				if (tempArray[3] == 'true') keyComboString += 'shift-';
				if (tempArray[4] == 'true') keyComboString += 'command-';
			} 
			testCode = parseInt(charCode);
		} else if (typeof(charCode) == 'object') {
			testCode = parseInt(charCode[0]);
			if (charCode[1]) keyComboString += 'alt-';
			if (charCode[2]) keyComboString += 'ctrl-';
			if (charCode[3]) keyComboString += 'shift-';
			if (charCode[4]) keyComboString += 'command-';
		}
		switch(testCode) {
			case 8:
				niceString = "backspace"; //  backspace
				break;
			case 9:
				niceString = "tab"; //  tab
				break;
			case 13:
				niceString = "enter"; //  enter
				break;
			case 16:
				niceString = "shift"; //  shift
				break;
			case 17:
				niceString = "ctrl"; //  ctrl
				break;
			case 18:
				niceString = "alt"; //  alt
				break;
			case 19:
				niceString = "pause/break"; //  pause/break
				break;
			case 20:
				niceString = "caps lock"; //  caps lock
				break;
			case 27:
				niceString = "escape"; //  escape
				break;
			case 33:
				niceString = "page up"; // page up, to avoid displaying alternate character and confusing people	         
				break;
			case 34:
				niceString = "page down"; // page down
				break;
			case 35:
				niceString = "end"; // end
				break;
			case 36:
				niceString = "home"; // home
				break;
			case 37:
				niceString = "left arrow"; // left arrow
				break;
			case 38:
				niceString = "up arrow"; // up arrow
				break;
			case 39:
				niceString = "right arrow"; // right arrow
				break;
			case 40:
				niceString = "down arrow"; // down arrow
				break;
			case 45:
				niceString = "insert"; // insert
				break;
			case 46:
				niceString = "delete"; // delete
				break;
			case 91:
				niceString = "left window"; // left window
				break;
			case 92:
				niceString = "right window"; // right window
				break;
			case 93:
				niceString = "select key"; // select key
				break;
			case 96:
				niceString = "numpad 0"; // numpad 0
				break;
			case 97:
				niceString = "numpad 1"; // numpad 1
				break;
			case 98:
				niceString = "numpad 2"; // numpad 2
				break;
			case 99:
				niceString = "numpad 3"; // numpad 3
				break;
			case 100:
				niceString = "numpad 4"; // numpad 4
				break;
			case 101:
				niceString = "numpad 5"; // numpad 5
				break;
			case 102:
				niceString = "numpad 6"; // numpad 6
				break;
			case 103:
				niceString = "numpad 7"; // numpad 7
				break;
			case 104:
				niceString = "numpad 8"; // numpad 8
				break;
			case 105:
				niceString = "numpad 9"; // numpad 9
				break;
			case 106:
				niceString = "multiply"; // multiply
				break;
			case 107:
				niceString = "add"; // add
				break;
			case 109:
				niceString = "subtract"; // subtract
				break;
			case 110:
				niceString = "decimal point"; // decimal point
				break;
			case 111:
				niceString = "divide"; // divide
				break;
			case 112:
				niceString = "F1"; // F1
				break;
			case 113:
				niceString = "F2"; // F2
				break;
			case 114:
				niceString = "F3"; // F3
				break;
			case 115:
				niceString = "F4"; // F4
				break;
			case 116:
				niceString = "F5"; // F5
				break;
			case 117:
				niceString = "F6"; // F6
				break;
			case 118:
				niceString = "F7"; // F7
				break;
			case 119:
				niceString = "F8"; // F8
				break;
			case 120:
				niceString = "F9"; // F9
				break;
			case 121:
				niceString = "F10"; // F10
				break;
			case 122:
				niceString = "F11"; // F11
				break;
			case 123:
				niceString = "F12"; // F12
				break;
			case 144:
				niceString = "num lock"; // num lock
				break;
			case 145:
				niceString = "scroll lock"; // scroll lock
				break;
			case 186:
				niceString = ";"; // semi-colon
				break;
			case 187:
				niceString = "="; // equal-sign
				break;
			case 188:
				niceString = ","; // comma
				break;
			case 189:
				niceString = "-"; // dash
				break;
			case 190:
				niceString = "."; // period
				break;
			case 191:
				niceString = "/"; // forward slash
				break;
			case 192:
				niceString = "`"; // grave accent
				break;
			case 219:
				niceString = "["; // open bracket
				break;
			case 220:
				niceString = "\\"; // back slash
				break;
			case 221:
				niceString = "]"; // close bracket
				break;
			case 222:
				niceString = "'"; // single quote
				break;
			default:
				niceString = String.fromCharCode(testCode);
				break;
		}
		return keyComboString + niceString;
	},
	niceDate: function(d, usformat) {
		d = d || new Date();
		var year = d.getFullYear();
		var month = (d.getMonth() + 1);
		month = (month < 10) ? '0'+month : month;
		var day = d.getDate();
		day = (day < 10) ? '0'+day : day;
		var fullString = year+'-'+month+'-'+day;
		if (usformat) {
			fullString = month+'-'+day+'-'+year;
		}
		return fullString;
	},
	niceDateTime: function(d, usformat) {
		d = d || new Date();
		var dateString = RESUtils.niceDate(d);
		var hours = d.getHours();
		hours = (hours < 10) ? '0'+hours : hours;
		var minutes = d.getMinutes();
		minutes = (minutes < 10) ? '0'+minutes : minutes;
		var seconds = d.getSeconds();
		seconds = (seconds < 10) ? '0'+seconds : seconds;
		var fullString = dateString + ' ' + hours + ':'+minutes+':'+seconds;
		return fullString;
	},
	niceDateDiff: function(origdate, newdate) {
		// Enter the month, day, and year below you want to use as
		// the starting point for the date calculation
		var amonth = origdate.getUTCMonth()+1;
		var aday = origdate.getUTCDate();
		var ayear = origdate.getUTCFullYear();
		if (newdate == null) newdate = new Date();
		var dyear;
		var dmonth;
		var dday;
		var tyear = newdate.getUTCFullYear();
		var tmonth = newdate.getUTCMonth()+1;
		var tday = newdate.getUTCDate();
		var y=1;
		var mm=1;
		var d=1;
		var a2=0;
		var a1=0;
		var f=28;

		if ((tyear/4)-parseInt(tyear/4)==0) {
			f=29;
		}

		var m = [31, f, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

		dyear = tyear-(ayear);

		dmonth = tmonth-amonth;
		if (dmonth<0) {
			dmonth = dmonth+12;
			dyear--;
		}

		dday = tday-aday;
		if (dday<0) {
			if (dmonth>0) {
				var ma = amonth+tmonth;
				// console.log('amonth: ' + amonth + ' -- tmonth: ' +tmonth);
				// if (ma>12) {ma = ma-12}
				// if (ma==0) {ma = ma+12}
				if (ma>=12) {ma = ma-12}
				if (ma<0) {ma = ma+12}				
				dday = dday+m[ma];
				dmonth--;
				if (dmonth < 0) {
					dyear--;
					dmonth = dmonth+12;
				}
			} else {
				dday=0;
			}
		}

		var returnString = '';
		
		if (dyear==0) {y=0}
		if (dmonth==0) {mm=0}
		if (dday==0) {d=0}
		if ((y==1) && (mm==1)) {a1=1}
		if ((y==1) && (d==1)) {a1=1}
		if ((mm==1) && (d==1)) {a2=1}
		if (y==1){
			if (dyear == 1) {
				returnString += dyear + " year";
			} else {
				returnString += dyear + " years";
			}
		}
		if ((a1==1) && (a2==0)) { returnString += " and "; }
		if ((a1==1) && (a2==1)) { returnString += ", "; }
		if (mm==1){
			if (dmonth == 1) {
				returnString += dmonth + " month";
			} else {
				returnString += dmonth + " months";
			}
		}
		if (a2==1) { returnString += " and "; }
		if (d==1){
			if (dday == 1) {
				returnString += dday + " day";
			} else {
				returnString += dday + " days";
			}
		}
		if (returnString == '') {
			returnString = '0 days';
		}
		return returnString;
	},
	checkIfSubmitting: function() {
		this.checkedIfSubmitting = true;
		if ((location.href.match(/\/r\/[\w]+\/submit\/?/i)) || (location.href.match(/reddit.com\/submit\/?/i))) {
			var thisSubRedditInput = document.getElementById('sr-autocomplete');
			if (thisSubRedditInput) {
				var thisSubReddit = thisSubRedditInput.value;
				var title = document.querySelector('textarea[name=title]');
				if (typeof(this.thisSubRedditInputListener) == 'undefined') {
					this.thisSubRedditInputListener = true;
					thisSubRedditInput.addEventListener('change', function(e) {
						RESUtils.checkIfSubmitting();
					}, false);
				}
				if ((thisSubReddit.toLowerCase() == 'enhancement') || (thisSubReddit.toLowerCase() == 'resissues')) {
					RESUtils.addCSS('#submittingToEnhancement { display: none; min-height: 300px; font-size: 14px; line-height: 15px; margin-top: 10px; width: 518px; position: absolute; z-index: 999; } #submittingToEnhancement ol { margin-left: 10px; margin-top: 15px; list-style-type: decimal; } #submittingToEnhancement li { margin-left: 25px; }');
					RESUtils.addCSS('.submittingToEnhancementButton { border: 1px solid #444444; border-radius: 2px; padding: 3px 6px; cursor: pointer; display: inline-block; margin-top: 12px; }');
					RESUtils.addCSS('#RESBugReport, #RESFeatureRequest { display: none; }');
					RESUtils.addCSS('#RESSubmitOptions .submittingToEnhancementButton { margin-top: 30px; }');
					var textDesc = document.getElementById('text-desc');
					this.submittingToEnhancement = createElementWithID('div','submittingToEnhancement','RESDialogSmall');
					this.submittingToEnhancement.innerHTML = " \
					<h3>Submitting to r/Enhancement</h3> \
					<div class=\"RESDialogContents\"> \
						<div id=\"RESSubmitOptions\"> \
							What kind of a post do you want to submit to r/Enhancement? So that we can better support you, please choose from the options below, and please take care to read the instructions, thanks!<br> \
							<div id=\"RESSubmitBug\" class=\"submittingToEnhancementButton\">I want to submit a bug report</div><br> \
							<div id=\"RESSubmitFeatureRequest\" class=\"submittingToEnhancementButton\">I want to submit a feature request</div><br> \
							<div id=\"RESSubmitOther\" class=\"submittingToEnhancementButton\">I want to submit a general question or other item</div> \
						</div> \
						<div id=\"RESBugReport\"> \
							Are you sure you want to submit a bug report? We get a lot of duplicates and it would really help if you took a moment to read the following: <br> \
							<ol> \
								<li>Have you searched /r/Enhancement to see if someone else has reported it?</li> \
								<li>Have you checked the <a target=\"_blank\" href=\"http://redditenhancementsuite.com:8080/wiki/index.php?title=Category:FAQ\">RES FAQ?</a></li> \
								<li>Are you sure it's a bug with RES specifically? Do you have any other userscripts/extensions running?  How about addons like BetterPrivacy, Ghostery, CCleaner, etc?</li> \
							</ol> \
							<br> \
							Please also check out the latest known / popular bugs first:<br> \
							<ul id=\"RESKnownBugs\"><li style=\"color: red;\">Loading...</li></ul> \
							<span id=\"submittingBug\" class=\"submittingToEnhancementButton\">I still want to submit a bug!</span> \
						</div> \
						<div id=\"RESFeatureRequest\"> \
							So you want to request a feature, great!  Please just consider the following, first:<br> \
							<ol> \
								<li>Have you searched /r/Enhancement to see if someone else has requested it?</li> \
								<li>Is it something that would appeal to Reddit as a whole?  Personal or subreddit specific requests usually aren't added to RES.</li> \
							</ol> \
							<br> \
							Please also check out the latest known popular feature requests first:<br> \
							<ul id=\"RESKnownFeatureRequests\"><li style=\"color: red;\">Loading...</li></ul> \
							<span id=\"submittingFeature\" class=\"submittingToEnhancementButton\">I still want to submit a feature request!<span> \
						</div> \
					</div>";
					insertAfter(textDesc, this.submittingToEnhancement);
					setTimeout(function() {
						$('#RESSubmitBug').click(
							function() { 
								$('#RESSubmitOptions').fadeOut(
									function() { 
										$('#RESBugReport').fadeIn(); 
										GM_xmlhttpRequest({
											method:	"GET",
											url:	'http://redditenhancementsuite.com/knownbugs.json',
											onload:	function(response) {
												$('#RESKnownBugs').html('');
												var data = safeJSON.parse(response.responseText);
												$.each(data, function(key, val) {
													$('#RESKnownBugs').append('<li><a target="_blank" href="'+val.url+'">'+val.description+'</a></li>');
												});
											}
										});
									}
								);
							}
						);
						$('#RESSubmitFeatureRequest').click(
							function() { 
								$('#RESSubmitOptions').fadeOut(
									function() { 
										$('#RESFeatureRequest').fadeIn(); 
										$.getJSON('http://redditenhancementsuite.com/knownfeaturerequests.json', function(data) {
											$('#RESKnownFeatureRequests').html('');
											$.each(data, function(key, val) {
												$('#RESKnownFeatureRequests').append('<li><a target="_blank" href="'+val.url+'">'+val.description+'</a></li>');
											});
										});
									}
								);
							}
						);
						$('#submittingBug').click(
							function() { 
								$('#sr-autocomplete').val('RESIssues');
								$('li a.text-button').click();
								$('#submittingToEnhancement').fadeOut();
								var thisBrowser;
								if (typeof(self.on) == 'function') {
									thisBrowser = 'Firefox';
								} else if (typeof(chrome) != 'undefined') {
									thisBrowser = 'Chrome';
								} else if (typeof(safari) != 'undefined') {
									thisBrowser = 'Safari';
								} else if (typeof(opera) != 'undefined') {
									thisBrowser = 'Opera';
								} else {
									thisBrowser = 'Unknown';
								}
								var txt = "- RES Version: " + RESVersion + "\n";
								// turns out this is pretty useless info, commenting it out.
								// txt += "- Browser: " + navigator.appCodeName + " " + navigator.appName + "\n";
								// txt += "- Browser: " + thisBrowser + "\n";
								txt += "- Browser: " + BrowserDetect.browser + "\n";
								if (typeof(navigator) == 'undefined') navigator = window.navigator;
								txt+= "- Browser Version: " + BrowserDetect.version + "\n";
								txt+= "- Cookies Enabled: " + navigator.cookieEnabled + "\n";
								txt+= "- Platform: " + BrowserDetect.OS + "\n\n";
								$('.usertext-edit textarea').val(txt);
								title.value = '[bug] Please describe your bug here. If you have screenshots, please link them in the selftext.';
							}
						);
						$('#submittingFeature').click(
							function() { 
								$('#sr-autocomplete').val('Enhancement');
								$('#submittingToEnhancement').fadeOut();
								title.value = '[feature request] Please summarize your feature request here, and elaborate in the selftext.';
							}
						);
						$('#RESSubmitOther').click(
							function() { 
								$('#sr-autocomplete').val('Enhancement');
								$('#submittingToEnhancement').fadeOut();
								title.value = '';
							}
						);
						$('#submittingToEnhancement').fadeIn();
					}, 1000);
				} else if (typeof(this.submittingToEnhancement) != 'undefined') {
					this.submittingToEnhancement.parentNode.removeChild(this.submittingToEnhancement);
					if (title.value == 'Submitting a bug? Please read the box above...') {
						title.value = '';
					}
				}
			}
		} 
	},
	urlencode: function(string) {
		// Javascript's escape function is stupid, and ignores the + character. Why? I have no idea.
		// string = string.replace('+', '%2B');
		return escape(this._utf8_encode(string)).replace('+', '%2B');
	},
	urldecode: function(string) {
		return this._utf8_decode(unescape(string));
	},
	// private method for UTF-8 encoding
	_utf8_encode: function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode: function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	},
	isEmpty: function(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
			return false;
		}
		return true;
	},
	openLinkInNewTab: function(url, focus) {
		if (typeof(chrome) != 'undefined') {
			thisJSON = {
				requestType: 'openLinkInNewTab',
				linkURL: url,
				button: focus
			}
			chrome.extension.sendRequest(thisJSON, function(response) {
				// send message to background.html to open new tabs...
				return true;
			});
		} else if (typeof(safari) != 'undefined') {
			thisJSON = {
				requestType: 'openLinkInNewTab',
				linkURL: url,
				button: focus
			}
			safari.self.tab.dispatchMessage("openLinkInNewTab", thisJSON);
		} else if (typeof(opera) != 'undefined') {
			thisJSON = {
				requestType: 'openLinkInNewTab',
				linkURL: url,
				button: focus
			}
			opera.extension.postMessage(JSON.stringify(thisJSON));
		} else if (typeof(self.on) == 'function') {
			thisJSON = {
				requestType: 'openLinkInNewTab',
				linkURL: url,
				button: focus
			}
			self.postMessage(thisJSON);
		} else {
			window.open(url);
		}
	},
	notification: function(contentObj, delay) {
		var content;
		if (typeof(contentObj.message) == 'undefined') {
			if (typeof(contentObj) == 'string') {
				content = contentObj;
			} else {
				return false;
			}
		} else {
			content = contentObj.message;
		}
		var header = (typeof(contentObj.header) == 'undefined') ? 'Notification:' : contentObj.header;
		if (typeof(this.notificationCount) == 'undefined') {
			this.adFrame = document.body.querySelector('#ad-frame');
			if (this.adFrame) {
				this.adFrame.style.display = 'none';
			}
			this.notificationCount = 0;
			this.notificationTimers = [];
			this.RESNotifications = createElementWithID('div','RESNotifications');
			document.body.appendChild(this.RESNotifications);
		}
		var thisNotification = document.createElement('div');
		addClass(thisNotification, 'RESNotification');
		thisNotification.setAttribute('id','RESNotification-'+this.notificationCount);
		thisNotification.innerHTML = '<div class="RESNotificationHeader"><h3>'+header+'</h3><div class="RESNotificationClose RESCloseButton">X</div></div>';
		thisNotification.innerHTML += '<div class="RESNotificationContent">'+content+'</div>';
		var thisNotificationCloseButton = thisNotification.querySelector('.RESNotificationClose');
		thisNotificationCloseButton.addEventListener('click',function(e) {
			var thisNotification = e.target.parentNode.parentNode;
			RESUtils.closeNotification(thisNotification);
		}, false);
		this.setCloseNotificationTimer(thisNotification, delay);
		this.RESNotifications.style.display = 'block';
		this.RESNotifications.appendChild(thisNotification);
		RESUtils.fadeElementIn(thisNotification, 0.2, 1);
		this.notificationCount++;
	},
	setCloseNotificationTimer: function(e, delay) {
		delay = delay || 3000;
		var thisNotification = (typeof(e.currentTarget) != 'undefined') ? e.currentTarget : e;
		var thisNotificationID = thisNotification.getAttribute('id').split('-')[1];
		addClass(thisNotification,'timerOn');
		clearTimeout(RESUtils.notificationTimers[thisNotificationID]);
		var thisTimer = setTimeout(function() {
			RESUtils.closeNotification(thisNotification);
		}, delay);
		RESUtils.notificationTimers[thisNotificationID] = thisTimer;
		thisNotification.addEventListener('mouseover',RESUtils.cancelCloseNotificationTimer, false);
		thisNotification.removeEventListener('mouseout',RESUtils.setCloseNotification,false);
	},
	cancelCloseNotificationTimer: function(e) {
		var thisNotificationID = e.currentTarget.getAttribute('id').split('-')[1];
		removeClass(e.currentTarget,'timerOn');
		clearTimeout(RESUtils.notificationTimers[thisNotificationID]);
		e.target.removeEventListener('mouseover',RESUtils.cancelCloseNotification,false);
		e.currentTarget.addEventListener('mouseout',RESUtils.setCloseNotificationTimer, false);
	},
	closeNotification: function(ele) {
		RESUtils.fadeElementOut(ele, 0.1, RESUtils.notificationClosed);
	},
	notificationClosed: function(ele) {
		var notifications = RESUtils.RESNotifications.querySelectorAll('.RESNotification');
		var destroyed = 0;
		for (var i=0, len=notifications.length; i<len; i++) {
			if (notifications[i].style.opacity == '0') {
				notifications[i].parentNode.removeChild(notifications[i]);
				destroyed++;
			}
		}
		if (destroyed == notifications.length) {
			RESUtils.RESNotifications.style.display = 'none';
			if (RESUtils.adFrame) RESUtils.adFrame.style.display = 'block';
		}
	},
	toggleButton: function(fieldID, enabled, onText, offText) {
		enabled = enabled || false;
		var checked = (enabled) ? 'CHECKED' : '';
		onText = onText || 'on';
		offText = offText || 'off';
		var thisToggle = document.createElement('div');
		thisToggle.setAttribute('class','toggleButton');
		thisToggle.setAttribute('id',fieldID+'Container');
		// thisToggle.innerHTML = '<span class="toggleOn">'+onText+'</span><span class="toggleOff">'+offText+'</span><input type="checkbox" style="visibility: hidden;" '+checked+'>';
		thisToggle.innerHTML = '<span class="toggleOn">'+onText+'</span><span class="toggleOff">'+offText+'</span><input id="'+fieldID+'" type="checkbox" '+checked+'>';
		thisToggle.addEventListener('click',function(e) {
			var thisCheckbox = this.querySelector('input[type=checkbox]');
			var enabled = thisCheckbox.checked;
			thisCheckbox.checked = !enabled;
			(!enabled) ? addClass(this,'enabled') : removeClass(this,'enabled');
		}, false);
		if (enabled) addClass(thisToggle,'enabled');
		return thisToggle;
	},
	addCommas: function(nStr) {
		nStr += '';
		var x = nStr.split('.');
		var x1 = x[0];
		var x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	},
	xhrCache: function(operation) {
		var thisJSON = {
			requestType: 'XHRCache',
			operation: operation
		};
		if (typeof(chrome) != 'undefined') {
			chrome.extension.sendRequest(thisJSON, function(response) {});
		} else if (typeof(safari) != 'undefined') {
			safari.self.tab.dispatchMessage('XHRCache', thisJSON);
		} else if (typeof(opera) != 'undefined') {
			opera.extension.postMessage(JSON.stringify(thisJSON));
		} else if (typeof(self.on) == 'function') {
			self.postMessage(thisJSON);
		}
	}
}
// end RESUtils;

// Create a nice alert function...
var gdAlert = {
	container: false,
	overlay: "",
	
	init: function(callback) {
		//init
		var alertCSS = '#alert_message { ' +
			'display: none;' +
			'opacity: 0.0;' +
			'background-color: #EFEFEF;' +
			'border: 1px solid black;' +
			'color: black;' +
			'font-size: 10px;' +
			'padding: 20px;' +
			'padding-left: 60px;' +
			'padding-right: 60px;' +
			'position: fixed!important;' +
			'position: absolute;' +
			'width: 400px;' +
			'float: left;' +
			'z-index: 10000;' +
			'text-align: left;' +
			'left: auto;' +
			'top: auto;' +
			'}' +
		'#alert_message .button {' +
			'border: 1px solid black;' +
			'font-weight: bold;' +
			'font-size: 10px;' +
			'padding: 4px;' +
			'padding-left: 7px;' +
			'padding-right: 7px;' +
			'float: left;' +
			'background-color: #DFDFDF;' +
			'cursor: pointer;' +
			'}' +
		'#alert_message span {' +
			'display: block;' +
			'margin-bottom: 15px;	' +
			'}';

		GM_addStyle(alertCSS);
		
		gdAlert.populateContainer(callback);

	},
	
	populateContainer: function(callback) {
		gdAlert.container = createElementWithID('div','alert_message');
		gdAlert.container.appendChild(document.createElement('span'));
		if (typeof(callback) == 'function') {
			this.okButton = document.createElement('input');
			this.okButton.setAttribute('type','button');
			this.okButton.setAttribute('value','confirm');
			this.okButton.addEventListener('click',callback, false);
			this.okButton.addEventListener('click',gdAlert.close, false);
			var closeButton = document.createElement('input');
			closeButton.setAttribute('type','button');
			closeButton.setAttribute('value','cancel');
			closeButton.addEventListener('click',gdAlert.close, false);
			gdAlert.container.appendChild(this.okButton);
			gdAlert.container.appendChild(closeButton);
		} else {
			/* if (this.okButton) {
				gdAlert.container.removeChild(this.okButton);
				delete this.okButton;
			} */
			var closeButton = document.createElement('input');
			closeButton.setAttribute('type','button');
			closeButton.setAttribute('value','ok');
			closeButton.addEventListener('click',gdAlert.close, false);
			gdAlert.container.appendChild(closeButton);
		}
		var br = document.createElement('br');
		br.setAttribute('style','clear: both');
		gdAlert.container.appendChild(br);
		document.body.appendChild(gdAlert.container);
	
	},
	
	open: function(text, callback) {
		if (gdAlert.isOpen) {
			console.log('there is already an alert open. break out.');
			return;
		}
		gdAlert.isOpen = true;
		gdAlert.populateContainer(callback);
	
		//set message
		gdAlert.container.getElementsByTagName("SPAN")[0].innerHTML = text;
		gdAlert.container.getElementsByTagName("INPUT")[0].focus();
		gdAlert.container.getElementsByTagName("INPUT")[0].focus();
		
		//create site overlay
		gdAlert.overlay = document.createElement("DIV");
		gdAlert.overlay.style.width = gdAlert.getPageSize()[0] + "px";
		gdAlert.overlay.style.height = gdAlert.getPageSize()[1] + "px";
		gdAlert.overlay.style.backgroundColor = '#333333';
		gdAlert.overlay.style.top = '0';
		gdAlert.overlay.style.left = '0';
		gdAlert.overlay.style.position = 'absolute';
		gdAlert.overlay.style.zIndex = '9999';
		
		document.body.appendChild(gdAlert.overlay);
		
		// center messagebox (requires prototype functions we don't have, so we'll redefine...)
		// var arrayPageScroll = document.viewport.getScrollOffsets();
        // var winH = arrayPageScroll[1] + (document.viewport.getHeight());
        // var lightboxLeft = arrayPageScroll[0];
		var arrayPageScroll = [ document.documentElement.scrollLeft , document.documentElement.scrollTop ];
        var winH = arrayPageScroll[1] + (window.innerHeight);
        var lightboxLeft = arrayPageScroll[0];
		
		gdAlert.container.style.top = ((winH / 2) - 90) + "px";
		gdAlert.container.style.left = ((gdAlert.getPageSize()[0] / 2) - 155) + "px";
		
		/*
		new Effect.Appear(gdAlert.container, {duration: 0.2});
		new Effect.Opacity(gdAlert.overlay, {duration: 0.2, to: 0.8});
		*/
		RESUtils.fadeElementIn(gdAlert.container, 0.3);
		RESUtils.fadeElementIn(gdAlert.overlay, 0.3);
	},
	
	close: function() {
		gdAlert.isOpen = false;
		/*
		new Effect.Fade(gdAlert.container, {duration: 0.3});
		new Effect.Fade(gdAlert.overlay, {duration: 0.3, afterFinish: function() {
			document.body.removeChild(gdAlert.overlay);
		}});	
		*/
		RESUtils.fadeElementOut(gdAlert.container, 0.3);
		RESUtils.fadeElementOut(gdAlert.overlay, 0.3);
	},
	
	getPageSize: function() {
	        
		var xScroll, yScroll;
		
		if (window.innerHeight && window.scrollMaxY) {	
			xScroll = window.innerWidth + window.scrollMaxX;
			yScroll = window.innerHeight + window.scrollMaxY;
		} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
			xScroll = document.body.scrollWidth;
			yScroll = document.body.scrollHeight;
		} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
			xScroll = document.body.offsetWidth;
			yScroll = document.body.offsetHeight;
		}
	
		var windowWidth, windowHeight;
	
		if (self.innerHeight) {	// all except Explorer
			if(document.documentElement.clientWidth){
				windowWidth = document.documentElement.clientWidth; 
			} else {
				windowWidth = self.innerWidth;
			}
			windowHeight = self.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
			windowWidth = document.documentElement.clientWidth;
			windowHeight = document.documentElement.clientHeight;
		} else if (document.body) { // other Explorers
			windowWidth = document.body.clientWidth;
			windowHeight = document.body.clientHeight;
		}	
	
		// for small pages with total height less then height of the viewport
		if(yScroll < windowHeight){
			pageHeight = windowHeight;
		} else { 
			pageHeight = yScroll;
		}
	
		// for small pages with total width less then width of the viewport
		if(xScroll < windowWidth){	
			pageWidth = xScroll;		
		} else {
			pageWidth = windowWidth;
		}
	
		return [pageWidth,pageHeight];
	}
}

//overwrite the alert function
var alert = function(text, callback) {
	if (gdAlert.container == false) {
		gdAlert.init(callback);
	}
	gdAlert.open(text, callback);
}

// this function copies localStorage (from the GM import script) to FF addon simplestorage...
function GMSVtoFFSS() {
	var console = unsafeWindow.console;
	for (var key in localStorage) {
		RESStorage.setItem(key, localStorage[key]);
	}
	localStorage.setItem('copyComplete','true');
	localStorage.removeItem('RES.lsTest');
	RESUtils.notification('Data transfer complete. You may now uninstall the Greasemonkey script');
}

// jquery plugin CSS
RESUtils.addCSS(tokenizeCSS);
RESUtils.addCSS(guidersCSS);
// RES Console CSS


// define the RESConsole class
var RESConsole = {
	modalOverlay: '',
	RESConsoleContainer: '',
	RESConsolePanels: [],
	RESMenuItems: [],
	RESConfigPanelOptions: null,
	// make the modules panel accessible to this class for updating (i.e. when preferences change, so we can redraw it)
	RESConsoleModulesPanel: createElementWithID('div', 'RESConsoleModulesPanel', 'RESPanel'),
	RESConsoleConfigPanel: createElementWithID('div', 'RESConsoleConfigPanel', 'RESPanel'),
	RESConsoleAboutPanel: createElementWithID('div', 'RESConsoleAboutPanel', 'RESPanel'),
	RESConsoleProPanel: createElementWithID('div', 'RESConsoleProPanel', 'RESPanel'),
	addConsoleLink: function() {
		this.userMenu = document.querySelector('#header-bottom-right');
		if (this.userMenu) {
			var RESPrefsLink = $("<span id='openRESPrefs'><span id='RESSettingsButton' title='RES Settings'></span>")
			                    .mouseenter(RESConsole.showPrefsDropdown);
            $(this.userMenu).find("ul").after(RESPrefsLink).after("<span class='separator'>|</span>");
            this.RESPrefsLink = RESPrefsLink[0];
		}
	},
	addConsoleDropdown: function() {
		this.gearOverlay = createElementWithID('div','RESMainGearOverlay');
		this.gearOverlay.setAttribute('class','RESGearOverlay');
		this.gearOverlay.innerHTML = '<div class="gearIcon"></div>';
		
		this.prefsDropdown = createElementWithID('div','RESPrefsDropdown','RESDropdownList');
		this.prefsDropdown.innerHTML = '<ul id="RESDropdownOptions"><li id="SettingsConsole">settings console</li></ul>';
		var thisSettingsButton = this.prefsDropdown.querySelector('#SettingsConsole');
		thisSettingsButton.addEventListener('click', function() { 
			RESConsole.hidePrefsDropdown();
			RESConsole.open();
		}, true);
		$(this.prefsDropdown).mouseleave(function() {
			RESConsole.hidePrefsDropdown();
		});
		$(this.prefsDropdown).mouseenter(function() {
			clearTimeout(RESConsole.prefsTimer);
		});
		$(this.gearOverlay).mouseleave(function() {
			RESConsole.prefsTimer = setTimeout(function() {
				RESConsole.hidePrefsDropdown();
			}, 1000);
		});
		document.body.appendChild(this.gearOverlay);
		document.body.appendChild(this.prefsDropdown);
		if (RESStorage.getItem('RES.newAnnouncement','true')) {
			RESUtils.setNewNotification();
		}
	},
	showPrefsDropdown: function(e) {
		var thisTop = parseInt($(RESConsole.userMenu).offset().top + 1);
		// var thisRight = parseInt($(window).width() - $(RESConsole.RESPrefsLink).offset().left);
		// thisRight = 175-thisRight;
		var thisLeft = parseInt($(RESConsole.RESPrefsLink).offset().left - 6);
		// $('#RESMainGearOverlay').css('left',thisRight+'px');
		$('#RESMainGearOverlay').css('height',$('#header-bottom-right').outerHeight()+'px');
		$('#RESMainGearOverlay').css('left',thisLeft+'px');
		$('#RESMainGearOverlay').css('top',thisTop+'px');
		RESConsole.prefsDropdown.style.top = parseInt(thisTop+$(RESConsole.userMenu).outerHeight())+'px';
		RESConsole.prefsDropdown.style.right = '0px';
		RESConsole.prefsDropdown.style.display = 'block';
		$('#RESMainGearOverlay').show();
	},
	hidePrefsDropdown: function(e) {
		removeClass(RESConsole.RESPrefsLink, 'open');
		$('#RESMainGearOverlay').hide();
		RESConsole.prefsDropdown.style.display = 'none';
	},
	resetModulePrefs: function() {
		prefs = {
			'userTagger': true,
			'betteReddit': true,
			'singleClick': true,
			'subRedditTagger': true,
			'uppersAndDowners': true,
			'keyboardNav': true,
			'commentPreview': true,
			'showImages': true,
			'showKarma': true,
			'usernameHider': false,
			'accountSwitcher': true,
			'styleTweaks': true,
			'filteReddit': true,
			'spamButton': false,
			'RESPro': false
		};
		this.setModulePrefs(prefs);
		return prefs;
	},
	getAllModulePrefs: function(force) {
		// if we've done this before, just return the cached version
		if ((!force) && (typeof(this.getAllModulePrefsCached) != 'undefined')) return this.getAllModulePrefsCached;
		// get the stored preferences out first.
		if (RESStorage.getItem('RES.modulePrefs') != null) {
			var storedPrefs = safeJSON.parse(RESStorage.getItem('RES.modulePrefs'), 'RES.modulePrefs');
		} else if (RESStorage.getItem('modulePrefs') != null) {
			// Clean up old moduleprefs.
			var storedPrefs = safeJSON.parse(RESStorage.getItem('modulePrefs'), 'modulePrefs');
			RESStorage.removeItem('modulePrefs');
			this.setModulePrefs(storedPrefs);
		} else {
			// looks like this is the first time RES has been run - set prefs to defaults...
			storedPrefs = this.resetModulePrefs();
		}
		if (storedPrefs == null) {
			storedPrefs = {};
		}
		// create a new JSON object that we'll use to return all preferences. This is just in case we add a module, and there's no pref stored for it.
		var prefs = {};
		// for any stored prefs, drop them in our prefs JSON object.
		for (var i in modules) {
			if (storedPrefs[i]) {
				prefs[i] = storedPrefs[i];
			} else if ((storedPrefs[i] == null) || (i == 'dashboard')) {
				// looks like a new module, or no preferences. We'll default it to on.
				// we also default dashboard to on. It's not really supposed to be disabled.
				prefs[i] = true;
			} else {
				prefs[i] = false;
			}
		}
		if ((typeof(prefs) != 'undefined') && (prefs != 'undefined') && (prefs)) {
			this.getAllModulePrefsCached = prefs;
			return prefs;
		} 
	},
	getModulePrefs: function(moduleID) {
		if (moduleID) {
			var prefs = this.getAllModulePrefs();
			return prefs[moduleID];
		} else {
			alert('no module name specified for getModulePrefs');
		}
	},
	setModulePrefs: function(prefs) {
		if (prefs != null) {
			RESStorage.setItem('RES.modulePrefs', JSON.stringify(prefs));
			// this.drawModulesPanel();
			return prefs;
		} else {
			alert('error - no prefs specified');
		}
	},
	create: function() {
		// create the console container
		this.RESConsoleContainer = createElementWithID('div', 'RESConsole');
		// hide it by default...
		// this.RESConsoleContainer.style.display = 'none';
		// create a modal overlay
		this.modalOverlay = createElementWithID('div', 'modalOverlay');
		this.modalOverlay.addEventListener('click',function(e) {
			e.preventDefault();
			return false;
		}, true);
		document.body.appendChild(this.modalOverlay);
		// create the header
		var RESConsoleHeader = createElementWithID('div', 'RESConsoleHeader');
		// create the top bar and place it in the header
		var RESConsoleTopBar = createElementWithID('div', 'RESConsoleTopBar');
		this.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAeCAMAAABHRo19AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACxFBMVEXw8/wAAAD+//8EBAQSEhIPDw/w8/v+/v4JCQkHBwcCAgKSk5W8vLz9SADz8/MtLS0iIiIcHBz/VAAYGBmRkZFkZGUkJCQVFhZiYmOZmp2QkpfQ09r9/f3n6vA5OTkvLy//TAAxMTEUFRTl5eVqa2zu8fnt7/fV19ydnqCen6Lt8Pj/TwDk5ORaWlrg4ug1NTUpKSrX19cgICDp6/J6enrFxcW1trpDQ0M7OzwnJyenp6f6TQAXFxj/WACFhojr6+uNjpBHR0cfHx+vr7GSkpJMTEwYGBg+Pj5cXF3CwsJISEj29vYQEBDe3t7+SwBmZmixsbH19fXo6OhQUFAgICJgYWXHyM3q7PTs7vW3uLvb3eKqq650dXbS09js7/aTlJY5OjmUlJeenp7r7vWWl5n8/Px4eHihoqWEhYfO0NTj5euDg4Pa3OGRkpTJy8/g4ODe4Obc3Nzv8vqjo6O1tbW3uLyrq6t1dXX5ya5/f3/5xqxZWVqKiopra2v4uJb99vLCw8fFxsouLS6Oj5Hs7OzY2t+jpKZ4eXv2tY8NDQ35WQny8vJkZGT2lWGQkJB8fHzi5OrLzNFAQUPm6O/3f0W7u7v3oXP4dTb2nXH62MX3pHb87+bn5+dWV1dvb3E0NDT4lWP3jFP4vJn2cS79+vaJioxNTU376d72f0H4Wwf2fT7759z9+fX1lmH4XAv2bSb40bheX2A6Ojr9+vj76t/9+vf76+H5XxVGRkZxcnPQ0te+vr52dnaztLfExMT2tZFYWFhSUlLV1dVwcXL52MS4uLiysrKam5rW1tZPT1CVlZWYmJiUlJRHR0ipqq0qKiqzs7P39/fq6urj4+P89fH09PT6+vo4ODjq7PNsbW4oKCh0dHTv7++3t7fk5u2IiYtFRUU3NzdPT0/Kysru7u6NjY1tbW1gYGBfX19sbGyHh4fh4eEzPXfuAAACPElEQVR4Xq3SQ9fkQBTH4bpVSdru17Zt28bYtm3btm3btm37S8yk0oteTKc7c+a3uf/Nc3JyEvT/48KF69Uhu7dk3AfaZ48PRiHgUwLdpGLdtFbecrkPOxvjuSRcmp2vaIsQt6gdLME4UtlGGs6NFW7+GIw7Qidp2BAq3KaQWg650mwC9LSs6JpRfZG03PTo32reMrmzIW3IlGaSZY/W+aCcoY/xq1SCKXAC5xAaGObkFoSmZoK3uaxqlgzL6vol3UohjIpDLWq6J4jaaNZUnsb4syMCsHU5o10q4015sZAshp2LuuCu4DSZFzJrrh0GURj3Ai8BNHrQ08TdyvZXDsDzYBD+W4OJK5bFh9nGIaRuKKTTxw5fOtJTUCtWjh3H31NQiCdOso2DiVlXSsXGDN+M6XRdnlmtmUNXYrGaLPhD3IFvoQfQrH4KkMdRsjgiK2IZXcurs4zHVvFrdSasQTaeTFu7DtPWa4yaDXSd0xh9N22mMyUVieItWwW8bfuOnbvo2r1n7779mOZ6QByHHsRChw4fsXwsz6OPsdDxE0i0kyQA20rLFIhjzuW0TVxIgpB4Z+AsBRXn1RZTdeEivXFyFbLXJTaJvmkDNJgLrly95iR3juTt9eIbyH6ucJPq2hJGQQiru63lbbriDocc6C7cu1/BgwcPH9U/4cdT9TNQIcd6/oK8fFWbg4Vev0n0I6VvkcO9A38Fq495X5T3wZkhLvAROZ6KYT59Lvvy9VvU9x8/1fW/DEygHfEbNdeCkgdk4HMAAAAASUVORK5CYII=';
		this.loader = 'data:image/gif;base64,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';
		RESConsoleTopBar.innerHTML = '<img id="RESLogo" src="'+this.logo+'"><h1>reddit enhancement suite</h1>';
		RESConsoleHeader.appendChild(RESConsoleTopBar);
		this.RESConsoleVersion = createElementWithID('div','RESConsoleVersion');
		this.RESConsoleVersion.innerHTML = 'v' + RESVersion;
		RESConsoleTopBar.appendChild(this.RESConsoleVersion);
		var RESSubredditLink = createElementWithID('a','RESConsoleSubredditLink');
		RESSubredditLink.innerHTML = '/r/Enhancement';
		RESSubredditLink.setAttribute('href','http://reddit.com/r/Enhancement');
		RESSubredditLink.setAttribute('alt','The RES Subreddit');
		RESConsoleTopBar.appendChild(RESSubredditLink);
		// create the close button and place it in the header
		var RESClose = createElementWithID('span', 'RESClose', 'RESCloseButton');
		RESClose.innerHTML = 'X';
		RESClose.addEventListener('click',function(e) {
			e.preventDefault();
			RESConsole.close();
		}, true);
		RESConsoleTopBar.appendChild(RESClose);
		// create the help button and place it in the header
		/*
		RESHelp = createElementWithID('span', 'RESHelp');
		RESHelp.innerHTML = '&nbsp;';
		RESHelp.addEventListener('click',function(e) {
			e.preventDefault();
			modules['RESTips'].randomTip();
		}, true);
		RESConsoleTopBar.appendChild(RESHelp);
		*/
		/*
		if (RESStorage.getItem('RESoutdated') == 'true') {
			var RESOutdated = document.createElement('div');
			RESOutdated.setAttribute('class','outdated');
			RESOutdated.innerHTML = 'There is a new version of RES! <a target="_blank" href="http://redditenhancementsuite.com/download">click to grab it</a>';
			RESConsoleTopBar.appendChild(RESOutdated); 
		}
		*/
		this.categories = [];
		for (var i in modules) {
			if ((typeof(modules[i].category) != 'undefined') && (this.categories.indexOf(modules[i].category) == -1)) {
				this.categories.push(modules[i].category);
			}
		}
		this.categories.sort();
		// create the menu
		// var menuItems = this.categories.concat(['RES Pro','About RES'));
		var menuItems = this.categories.concat(['About RES']);
		var RESMenu = createElementWithID('ul', 'RESMenu');
		for (var i = 0; i < menuItems.length; i++) {
			var thisMenuItem = document.createElement('li');
			thisMenuItem.innerHTML = menuItems[i];
			thisMenuItem.setAttribute('id', 'Menu-' + menuItems[i]);
			thisMenuItem.addEventListener('click', function(e) {
				e.preventDefault();
				RESConsole.menuClick(this);
			}, true);
			RESMenu.appendChild(thisMenuItem);
		}
		RESConsoleHeader.appendChild(RESMenu);
		this.RESConsoleContainer.appendChild(RESConsoleHeader);
		// Store the menu items in a global variable for easy access by the menu selector function.
		RESConsole.RESMenuItems = RESMenu.querySelectorAll('li');
		// Create a container for each management panel
		this.RESConsoleContent = createElementWithID('div', 'RESConsoleContent');
		this.RESConsoleContainer.appendChild(this.RESConsoleContent);
		// Okay, the console is done. Add it to the document body.
		document.body.appendChild(this.RESConsoleContainer);
	},
	/*
	drawModulesPanel: function() {
		// Create the module management panel (toggle modules on/off)
		var RESConsoleModulesPanel = this.RESConsoleModulesPanel;
		RESConsoleModulesPanel.innerHTML = '';
		var prefs = this.getAllModulePrefs(true);
		var modulesPanelHTML = '';
		var thisChecked;
		for (var i in modules) {
			(prefs[i]) ? thisChecked = 'CHECKED' : thisChecked = '';
			if (typeof(modules[i]) != 'undefined') {
				var thisDesc = modules[i].description;
				modulesPanelHTML += '<p class="moduleListing"><label for="'+i+'">' + modules[i].moduleName + ':</label> <input type="checkbox" name="'+i+'" '+thisChecked+' value="true"> <span class="moduleDescription">'+thisDesc+'</span></p>';
			}
		}
		RESConsoleModulesPanel.innerHTML = modulesPanelHTML;
		var RESConsoleModulesPanelButtons = createElementWithID('span','RESConsoleModulesPanelButtons');
		var RESSavePrefsButton = createElementWithID('input','savePrefs');
		RESSavePrefsButton.setAttribute('type','button');
		RESSavePrefsButton.setAttribute('name','savePrefs');
		RESSavePrefsButton.setAttribute('value','save');
		RESSavePrefsButton.addEventListener('click', function(e) {
			e.preventDefault();
			var modulePrefsCheckboxes = RESConsole.RESConsoleModulesPanel.querySelectorAll('input[type=checkbox]');
			var prefs = {};
			for (var i=0, len=modulePrefsCheckboxes.length;i<len;i++) {
				var thisName = modulePrefsCheckboxes[i].getAttribute('name');
				var thisChecked = modulePrefsCheckboxes[i].checked;
				prefs[thisName] = thisChecked;
			}
			RESConsole.setModulePrefs(prefs);
			RESConsole.close();
		}, true);
		RESConsoleModulesPanelButtons.appendChild(RESSavePrefsButton);
		var RESResetPrefsButton = createElementWithID('input','resetPrefs');
		RESResetPrefsButton.setAttribute('type','button');
		RESResetPrefsButton.setAttribute('name','resetPrefs');
		RESResetPrefsButton.setAttribute('value','reset to default');
		RESConsoleModulesPanelButtons.appendChild(RESResetPrefsButton);
		RESResetPrefsButton.addEventListener('click', function(e) {
			e.preventDefault();
			RESConsole.resetModulePrefs();
		}, true);
		RESConsoleModulesPanel.appendChild(RESConsoleModulesPanelButtons);
		var clearDiv = document.createElement('p');
		clearDiv.setAttribute('class','clear');
		clearDiv.style.display = 'block';
		RESConsoleModulesPanel.appendChild(clearDiv);
		this.RESConsoleContent.appendChild(RESConsoleModulesPanel);
	},
	*/
	drawConfigPanel: function(category) {
		category = category || this.categories[0];
		this.RESConsoleConfigPanel.innerHTML = '';
		// this.RESConsoleConfigPanel = createElementWithID('div', 'RESConsoleConfigPanel', 'RESPanel');
		/*
		RESConfigPanelSelectorLabel = document.createElement('label');
		RESConfigPanelSelectorLabel.setAttribute('for','RESConfigPanelSelector');
		RESConfigPanelSelectorLabel.innerHTML = 'Configure module: ';
		this.RESConsoleConfigPanel.appendChild(RESConfigPanelSelectorLabel);
		*/
		this.RESConfigPanelSelector = createElementWithID('select', 'RESConfigPanelSelector');
		var thisOption = document.createElement('option');
		thisOption.setAttribute('value','');
		thisOption.innerHTML = 'Select Module';
		this.RESConfigPanelSelector.appendChild(thisOption);

		/*
		var moduleTest = RESStorage.getItem('moduleTest');
		if (moduleTest) {
			console.log(moduleTest);
			// TEST loading stored modules...
			var evalTest = eval(moduleTest);
		}
		*/

		var moduleList = [];
		for (var i in modules) {
			if (modules[i].category == category) moduleList.push(i);
		}
		moduleList.sort(function(a,b) {
			if (modules[a].moduleName.toLowerCase() > modules[b].moduleName.toLowerCase()) return 1;
			return -1;
		});
		/*
		for (var i=0, len=moduleList.length; i<len; i++) {
			var thisModule = moduleList[i];
			var thisOption = document.createElement('option');
			thisOption.value = modules[thisModule].moduleID;
			thisOption.innerHTML = modules[thisModule].moduleName;
			this.RESConfigPanelSelector.appendChild(thisOption);
		}
		this.RESConfigPanelSelector.addEventListener('change', function(e) {
			thisModule = this.options[this.selectedIndex].value;
			if (thisModule != '') {
				RESConsole.drawConfigOptions(thisModule);
			}
		}, true);
		this.RESConsoleConfigPanel.appendChild(this.RESConfigPanelSelector);
		*/
		this.RESConfigPanelModulesPane = createElementWithID('div', 'RESConfigPanelModulesPane');
		for (var i=0, len=moduleList.length; i<len; i++) {
			var thisModuleButton = createElementWithID('div', 'module-'+moduleList[i]);
			addClass(thisModuleButton,'moduleButton');
			var thisModule = moduleList[i];
			thisModuleButton.innerHTML = modules[thisModule].moduleName;
			if (modules[thisModule].isEnabled()) {
				addClass(thisModuleButton,'enabled');
			}
			thisModuleButton.setAttribute('moduleID', modules[thisModule].moduleID);
			thisModuleButton.addEventListener('click', function(e) {
				RESConsole.drawConfigOptions(this.getAttribute('moduleID'));
				RESConsole.RESConsoleContent.scrollTop = 0;
			}, false);
			this.RESConfigPanelModulesPane.appendChild(thisModuleButton);
			if (i == 0) var firstModuleButton = thisModuleButton;
		}
		this.RESConsoleConfigPanel.appendChild(this.RESConfigPanelModulesPane);
		
		this.RESConfigPanelOptions = createElementWithID('div', 'RESConfigPanelOptions');
		this.RESConfigPanelOptions.innerHTML = '<h1>RES Module Configuration</h1> Select a module from the column at the left to enable or disable it, and configure its various options.';
		this.RESConsoleConfigPanel.appendChild(this.RESConfigPanelOptions);
		this.RESConsoleContent.appendChild(this.RESConsoleConfigPanel);
		RESUtils.click(firstModuleButton);
	},
	drawOptionInput: function(moduleID, optionName, optionObject, isTable) {
		switch(optionObject.type) {
			case 'textarea':
				// textarea...
				var thisOptionFormEle = createElementWithID('textarea', optionName);
				thisOptionFormEle.setAttribute('type','textarea');
				thisOptionFormEle.setAttribute('moduleID',moduleID);
				thisOptionFormEle.innerHTML = optionObject.value;
				break;
			case 'text':
				// text...
				var thisOptionFormEle = createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('type','text');
				thisOptionFormEle.setAttribute('moduleID',moduleID);
				thisOptionFormEle.setAttribute('value',optionObject.value);
				break;
			case 'list':
				// list...
				var thisOptionFormEle = createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('class','RESInputList');
				thisOptionFormEle.setAttribute('type','text');
				thisOptionFormEle.setAttribute('moduleID',moduleID);
				// thisOptionFormEle.setAttribute('value',optionObject.value);
				existingOptions = optionObject.value;
				if (typeof(existingOptions) == 'undefined') existingOptions = '';
				var prepop = [];
				var optionArray = existingOptions.split(',');
				for (var i=0, len=optionArray.length; i<len; i++) {
					if (optionArray[i] != '') prepop.push({id: optionArray[i], name: optionArray[i]});
				}
				setTimeout(function() {
					$(thisOptionFormEle).tokenInput(optionObject.source, {
						method: "POST",
						queryParam: "query",
						theme: "facebook",
						allowCustomEntry: true,
						onResult: (typeof(optionObject.onResult) == 'function') ? optionObject.onResult : null,
						prePopulate: prepop,
						hintText: (typeof(optionObject.hintText) == 'string') ? optionObject.hintText : null
					});
				}, 100);
				break;
			case 'password':
				// password...
				var thisOptionFormEle = createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('type','password');
				thisOptionFormEle.setAttribute('moduleID',moduleID);
				thisOptionFormEle.setAttribute('value',optionObject.value);
				break;
			case 'boolean':
				// checkbox
				/*
				var thisOptionFormEle = createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('type','checkbox');
				thisOptionFormEle.setAttribute('moduleID',moduleID);
				thisOptionFormEle.setAttribute('value',optionObject.value);
				if (optionObject.value) {
					thisOptionFormEle.setAttribute('checked',true);
				}
				*/
				var thisOptionFormEle = RESUtils.toggleButton(optionName, optionObject.value);
				break;
			case 'enum':
				// radio buttons
				if (typeof(optionObject.values) == 'undefined') {
					alert('misconfigured enum option in module: ' + moduleID);
				} else {
					var thisOptionFormEle = createElementWithID('div', optionName);
					thisOptionFormEle.setAttribute('class','enum');
					for (var j=0;j<optionObject.values.length;j++) {
						var thisDisplay = optionObject.values[j].display;
						var thisValue = optionObject.values[j].value;
						var thisOptionFormSubEle = createElementWithID('input', optionName+'-'+j);
						if (isTable) thisOptionFormSubEle.setAttribute('tableOption','true');
						thisOptionFormSubEle.setAttribute('type','radio');
						thisOptionFormSubEle.setAttribute('name',optionName);
						thisOptionFormSubEle.setAttribute('moduleID',moduleID);
						thisOptionFormSubEle.setAttribute('value',optionObject.values[j].value);
						var nullEqualsEmpty = ((optionObject.value == null) && (optionObject.values[j].value == ''));
						// we also need to check for null == '' - which are technically equal.
						if ((optionObject.value == optionObject.values[j].value) || nullEqualsEmpty)  {
							thisOptionFormSubEle.setAttribute('checked','checked');
						}
						var thisOptionFormSubEleText = document.createTextNode(' ' + optionObject.values[j].name + ' ');
						thisOptionFormEle.appendChild(thisOptionFormSubEle);
						thisOptionFormEle.appendChild(thisOptionFormSubEleText);
						var thisBR = document.createElement('br');
						thisOptionFormEle.appendChild(thisBR);
					}
				}
				break;
			case 'keycode':
				// keycode - shows a key value, but stores a keycode and possibly shift/alt/ctrl combo.
				var thisOptionFormEle = createElementWithID('input', optionName);
				thisOptionFormEle.setAttribute('type','text');
				thisOptionFormEle.setAttribute('class','keycode');
				thisOptionFormEle.setAttribute('moduleID',moduleID);
				thisOptionFormEle.setAttribute('value',optionObject.value);
				break;
			default:
				console.log('misconfigured option in module: ' + moduleID);
				break;
		}
		if (isTable) {
			thisOptionFormEle.setAttribute('tableOption','true');
		}
		return thisOptionFormEle;
	},
	enableModule: function(moduleID, onOrOff) {
		var prefs = this.getAllModulePrefs(true);
		(onOrOff) ? prefs[moduleID] = true : prefs[moduleID] = false;
		this.setModulePrefs(prefs);
	},
	drawConfigOptions: function(moduleID) {
		var moduleButtons = RESConsole.RESConsoleConfigPanel.querySelectorAll('.moduleButton');
		for (var i=0, len=moduleButtons.length; i<len; i++) {
			(moduleButtons[i].getAttribute('moduleID') == moduleID) ? addClass(moduleButtons[i],'active') : removeClass(moduleButtons[i],'active');
		}
		RESConsole.currentModule = moduleID;
		var thisOptions = RESUtils.getOptions(moduleID);
		var optCount = 0;

		this.RESConfigPanelOptions.setAttribute('style','display: block;');
		this.RESConfigPanelOptions.innerHTML = '';
		// put in the description, and a button to enable/disable the module, first..
		var thisHeader = document.createElement('div');
		addClass(thisHeader, 'moduleHeader');
		thisHeader.innerHTML = '<span class="moduleName">' + modules[moduleID].moduleName + '</span>';
		var thisToggle = document.createElement('div');
		addClass(thisToggle,'moduleToggle');
		if (moduleID == 'dashboard') thisToggle.style.display = 'none';
		thisToggle.innerHTML = '<span class="toggleOn">on</span><span class="toggleOff">off</span>';
		if (modules[moduleID].isEnabled()) addClass(thisToggle,'enabled');
		thisToggle.setAttribute('moduleID',moduleID);
		thisToggle.addEventListener('click', function(e) {
			var activePane = RESConsole.RESConfigPanelModulesPane.querySelector('.active');
			var enabled = !(!hasClass(this, 'enabled'));
			if (enabled) {
				removeClass(activePane, 'enabled')
				removeClass(this, 'enabled')
				addClass(RESConsole.moduleOptionsScrim,'visible');
				$('#moduleOptionsSave').hide();
			} else {
				addClass(activePane, 'enabled');
				addClass(this, 'enabled');
				removeClass(RESConsole.moduleOptionsScrim,'visible');
				$('#moduleOptionsSave').fadeIn();
			}
			RESConsole.enableModule(this.getAttribute('moduleID'), !enabled);
		}, true);
		thisHeader.appendChild(thisToggle);
		// not really looping here, just only executing if there's 1 or more options...
		for (var i in thisOptions) {
			var thisSaveButton = createElementWithID('input','moduleOptionsSave');
			thisSaveButton.setAttribute('type','button');
			thisSaveButton.setAttribute('value','save options');
			thisSaveButton.addEventListener('click',function(e) {
				RESConsole.saveCurrentModuleOptions(e);
			}, true);
			this.RESConsoleConfigPanel.appendChild(thisSaveButton);
			var thisSaveStatus = createElementWithID('div','moduleOptionsSaveStatus','saveStatus');
			thisHeader.appendChild(thisSaveStatus);
			break;
		}
		var thisDescription = document.createElement('div');
		addClass(thisDescription,'moduleDescription');
		thisDescription.innerHTML = modules[moduleID].description;
		thisHeader.appendChild(thisDescription);
		this.RESConfigPanelOptions.appendChild(thisHeader);
		var allOptionsContainer = createElementWithID('div', 'allOptionsContainer');
		this.RESConfigPanelOptions.appendChild(allOptionsContainer);
		// now draw all the options...
		for (var i in thisOptions) {
			if (!(thisOptions[i].noconfig)) {
				optCount++;
				var thisOptionContainer = createElementWithID('div', null, 'optionContainer');
				var thisLabel = document.createElement('label');
				thisLabel.setAttribute('for',i);
				thisLabel.innerHTML = i;
				var thisOptionDescription = createElementWithID('div', null, 'optionDescription');
				thisOptionDescription.innerHTML = thisOptions[i].description;
				thisOptionContainer.appendChild(thisLabel);
				if (thisOptions[i].type == 'table') {
					addClass(thisOptionDescription,'table');
					// table - has a list of fields (headers of table), users can add/remove rows...
					if (typeof(thisOptions[i].fields) == 'undefined') {
						alert('misconfigured table option in module: ' + moduleID + ' - options of type "table" must have fields defined');
					} else {
						// get field names...
						var fieldNames = [];
						// now that we know the field names, get table rows...
						var thisTable = document.createElement('table');
						thisTable.setAttribute('moduleID',moduleID);
						thisTable.setAttribute('optionName',i);
						thisTable.setAttribute('class','optionsTable');
						var thisThead = document.createElement('thead');
						var thisTableHeader = document.createElement('tr');
						thisTable.appendChild(thisThead);
						for (var j=0;j<thisOptions[i].fields.length;j++) {
							fieldNames[j] = thisOptions[i].fields[j].name;
							var thisTH = document.createElement('th');
							thisTH.innerHTML = thisOptions[i].fields[j].name;
							thisTableHeader.appendChild(thisTH);
						}
						thisThead.appendChild(thisTableHeader);
						thisTable.appendChild(thisThead);
						var thisTbody = document.createElement('tbody');
						thisTbody.setAttribute('id','tbody_'+i);
						for (var j=0;j<thisOptions[i].value.length;j++) {
							var thisTR = document.createElement('tr');
							for (var k=0;k<thisOptions[i].fields.length;k++) {
								var thisTD = document.createElement('td');
								var thisOpt = thisOptions[i].fields[k];
								var thisFullOpt = i + '_' + thisOptions[i].fields[k].name;
								thisOpt.value = thisOptions[i].value[j][k];
								// var thisOptInputName = thisOpt.name + '_' + j;
								var thisOptInputName = thisFullOpt + '_' + j;
								var thisTableEle = this.drawOptionInput(moduleID, thisOptInputName, thisOpt, true);
								thisTD.appendChild(thisTableEle);
								thisTR.appendChild(thisTD);
							}
							thisTbody.appendChild(thisTR);
						}
						thisTable.appendChild(thisTbody);
						var thisOptionFormEle = thisTable;
					}
					thisOptionContainer.appendChild(thisOptionDescription);
					thisOptionContainer.appendChild(thisOptionFormEle);
					// Create an "add row" button...
					var addRowText = thisOptions[i].addRowText || 'Add Row';
					var addRowButton = document.createElement('input');
					addClass(addRowButton,'addRowButton');
					addRowButton.setAttribute('type','button');
					addRowButton.setAttribute('value',addRowText);
					addRowButton.setAttribute('optionName',i);
					addRowButton.setAttribute('moduleID',moduleID);
					addRowButton.addEventListener('click',function() {
						var optionName = this.getAttribute('optionName');
						var thisTbodyName = 'tbody_' + optionName;
						var thisTbody = document.getElementById(thisTbodyName);
						var newRow = document.createElement('tr');
						var rowCount = (thisTbody.querySelectorAll('tr')) ? thisTbody.querySelectorAll('tr').length + 1 : 1;
						for (var i=0, len=modules[moduleID].options[optionName].fields.length;i<len;i++) {
							var newCell = document.createElement('td');
							var thisOpt = modules[moduleID].options[optionName].fields[i];
							if (thisOpt.type != 'enum') thisOpt.value = '';
							var optionNameWithRow = optionName+'_'+rowCount;
							var thisInput = RESConsole.drawOptionInput(moduleID, optionNameWithRow, thisOpt, true);
							newCell.appendChild(thisInput);
							newRow.appendChild(newCell);
							var firstText = newRow.querySelector('input[type=text]');
							if (!firstText) firstText = newRow.querySelector('textarea');
							if (firstText) {
								setTimeout(function() {
									firstText.focus();
								}, 200);
							}
						}
						thisTbody.appendChild(newRow);
					}, true);
					thisOptionContainer.appendChild(addRowButton);
				} else {
					if ((thisOptions[i].type == 'text') || (thisOptions[i].type == 'password') || (thisOptions[i].type == 'keycode')) addClass(thisOptionDescription,'textInput');
					var thisOptionFormEle = this.drawOptionInput(moduleID, i, thisOptions[i]);
					thisOptionContainer.appendChild(thisOptionFormEle);
					thisOptionContainer.appendChild(thisOptionDescription);
				}
				var thisClear = document.createElement('div');
				thisClear.setAttribute('class','clear');
				thisOptionContainer.appendChild(thisClear);
				allOptionsContainer.appendChild(thisOptionContainer);
			}
		}
		// run through any keycode options and mask them for input...
		var keyCodeInputs = this.RESConfigPanelOptions.querySelectorAll('.keycode');
		if (keyCodeInputs.length > 0) {
			this.keyCodeModal = createElementWithID('div','keyCodeModal');
			this.keyCodeModal.innerHTML = 'Press a key (or combination with shift, alt and/or ctrl) to assign this action.';
			document.body.appendChild(this.keyCodeModal);
			for (var i=0, len=keyCodeInputs.length;i<len;i++) {
				keyCodeInputs[i].style.border = '1px solid red';
				keyCodeInputs[i].style.display = 'none';
				thisKeyCodeDisplay = createElementWithID('input',keyCodeInputs[i].getAttribute('id')+'-display');
				thisKeyCodeDisplay.setAttribute('type','text');
				thisKeyCodeDisplay.setAttribute('capturefor',keyCodeInputs[i].getAttribute('id'));
				thisKeyCodeDisplay.setAttribute('displayonly','true');
				thisKeyCodeDisplay.setAttribute('value',RESUtils.niceKeyCode(keyCodeInputs[i].value.toString()));
				// thisKeyCodeDisplay.disabled = true;
				thisKeyCodeDisplay.addEventListener('blur',function(e) {
					RESConsole.keyCodeModal.setAttribute('style', 'display: none;');
				}, true);
				thisKeyCodeDisplay.addEventListener('focus',function(e) {
					window.addEventListener('keydown', function(e) {
						if ((RESConsole.captureKey) && (e.keyCode != 16) && (e.keyCode != 17) && (e.keyCode != 18)) {
							// capture the key, display something nice for it, and then close the popup...
							e.preventDefault();
							document.getElementById(RESConsole.captureKeyID).value = e.keyCode + ',' + e.altKey + ',' + e.ctrlKey + ',' + e.shiftKey + ',' + e.metaKey;
							var keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
							document.getElementById(RESConsole.captureKeyID+'-display').value = RESUtils.niceKeyCode(keyArray);
							RESConsole.keyCodeModal.style.display = 'none';
							RESConsole.captureKey = false;
						}
					}, true);
					thisXY=RESUtils.getXYpos(this, true);
					// RESConsole.keyCodeModal.setAttribute('style', 'display: block; top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
					RESConsole.keyCodeModal.setAttribute('style', 'display: block; top: ' + RESUtils.mouseY + 'px; left: ' + RESUtils.mouseX + 'px;');
					// show dialog box to grab keycode, but display something nice...
					RESConsole.keyCodeModal.style.display = 'block';
					RESConsole.captureKey = true;
					RESConsole.captureKeyID = this.getAttribute('capturefor');
				}, true);
				insertAfter(keyCodeInputs[i], thisKeyCodeDisplay);
			}
		}
		if (optCount == 0) {
			var noOptions = createElementWithID('div','noOptions');
			addClass(noOptions,'optionContainer');
			noOptions.innerHTML = 'There are no configurable options for this module';
			this.RESConfigPanelOptions.appendChild(noOptions);
		} else {
			// var thisSaveStatusBottom = createElementWithID('div','moduleOptionsSaveStatusBottom','saveStatus');
			// this.RESConfigPanelOptions.appendChild(thisBottomSaveButton);
			// this.RESConfigPanelOptions.appendChild(thisSaveStatusBottom);
			this.moduleOptionsScrim = createElementWithID('div','moduleOptionsScrim');
			if (modules[moduleID].isEnabled()) {
				removeClass(RESConsole.moduleOptionsScrim,'visible');
				$('#moduleOptionsSave').fadeIn();
			} else {
				addClass(RESConsole.moduleOptionsScrim,'visible');
				$('#moduleOptionsSave').fadeOut();
			}
			allOptionsContainer.appendChild(this.moduleOptionsScrim);
			// console.log($(thisSaveButton).position());
		}
	},
	saveCurrentModuleOptions: function(e) {
		e.preventDefault();
		var panelOptionsDiv = this.RESConfigPanelOptions;
		// first, go through inputs that aren't a part of a "table of options"...
		var inputs = panelOptionsDiv.querySelectorAll('input, textarea');
		for (var i=0, len=inputs.length;i<len;i++) {
			// save values of any inputs onscreen, but skip ones with 'capturefor' - those are display only.
			var notTokenPrefix = (inputs[i].getAttribute('id') != null) && (inputs[i].getAttribute('id').indexOf('token-input-') == -1);
			if ((notTokenPrefix) && (inputs[i].getAttribute('type') != 'button') && (inputs[i].getAttribute('displayonly') != 'true') && (inputs[i].getAttribute('tableOption') != 'true')) {
				// get the option name out of the input field id - unless it's a radio button...
				if (inputs[i].getAttribute('type') == 'radio') {
					var optionName = inputs[i].getAttribute('name');
				} else {
					var optionName = inputs[i].getAttribute('id');
				}
				// get the module name out of the input's moduleid attribute
				var moduleID = RESConsole.currentModule;
				if (inputs[i].getAttribute('type') == 'checkbox') {
					var optionValue = !!inputs[i].checked;
				} else if (inputs[i].getAttribute('type') == 'radio') {
					if (inputs[i].checked) {
						var optionValue = inputs[i].value;
					}
				} else {
					// check if it's a keycode, in which case we need to parse it into an array...
					if ((inputs[i].getAttribute('class')) && (inputs[i].getAttribute('class').indexOf('keycode') >= 0)) {
						var tempArray = inputs[i].value.split(',');
						// convert the internal values of this array into their respective types (int, bool, bool, bool)
						var optionValue = [parseInt(tempArray[0]), (tempArray[1] == 'true'), (tempArray[2] == 'true'), (tempArray[3] == 'true'), (tempArray[4] == 'true')];
					} else {
						var optionValue = inputs[i].value;
					}
				}
				if (typeof(optionValue) != 'undefined') {
					RESUtils.setOption(moduleID, optionName, optionValue);
				}
			}
		}
		// Check if there are any tables of options on this panel...
		var optionsTables = panelOptionsDiv.querySelectorAll('.optionsTable');
		if (typeof(optionsTables) != 'undefined') {
			// For each table, we need to go through each row in the tbody, and then go through each option and make a multidimensional array.
			// For example, something like: [['foo','bar','baz'],['pants','warez','cats']]
			for (var i=0, len=optionsTables.length;i<len;i++) {
				var moduleID = optionsTables[i].getAttribute('moduleID');
				var optionName = optionsTables[i].getAttribute('optionName');
				var thisTBODY = optionsTables[i].querySelector('tbody');
				var thisRows = thisTBODY.querySelectorAll('tr');
				// check if there are any rows...
				if (typeof(thisRows) != 'undefined') {
					// go through each row, and get all of the inputs...
					var optionMulti = [];
					var optionRowCount = 0;
					for (var j=0;j<thisRows.length;j++) {
						var optionRow = [];
						var cells = thisRows[j].querySelectorAll('td');
						var notAllBlank = false;
						for (var k=0; k<cells.length; k++) {
							var inputs = cells[k].querySelectorAll('input[tableOption=true], textarea[tableOption=true]');
							var optionValue = null;
							for (var l=0;l<inputs.length;l++) {
								// get the module name out of the input's moduleid attribute
								var moduleID = inputs[l].getAttribute('moduleID');
								if (inputs[l].getAttribute('type') == 'checkbox') {
									(inputs[l].checked) ? optionValue = true : optionValue = false;
								} else if (inputs[l].getAttribute('type') == 'radio') {
									if (inputs[l].checked) {
										optionValue = inputs[l].value;
									}
								} else {
									// check if it's a keycode, in which case we need to parse it into an array...
									if ((inputs[l].getAttribute('class')) && (inputs[l].getAttribute('class').indexOf('keycode') >= 0)) {
										var tempArray = inputs[l].value.split(',');
										// convert the internal values of this array into their respective types (int, bool, bool, bool)
										optionValue = [parseInt(tempArray[0]), (tempArray[1] == 'true'), (tempArray[2] == 'true'), (tempArray[3] == 'true')];
									} else {
										optionValue = inputs[l].value;
									}
								}
								if ((optionValue != '') && (inputs[l].getAttribute('type') != 'radio')) {
									notAllBlank = true;
								}
								// optionRow[k] = optionValue;
							}
							optionRow.push(optionValue);
						}
						// just to be safe, added a check for optionRow != null...
						if ((notAllBlank) && (optionRow != null)) {
							optionMulti[optionRowCount] = optionRow;
							optionRowCount++;
						}
					}
					if (optionMulti == null) {
						optionMulti = [];
					}
					// ok, we've got all the rows... set the option.
					if (typeof(optionValue) != 'undefined') {
						RESUtils.setOption(moduleID, optionName, optionMulti);
					}
				}
			}
		}
		
		var statusEle = document.getElementById('moduleOptionsSaveStatus');
		if (statusEle) {
			statusEle.innerHTML = 'Options have been saved...';
			statusEle.setAttribute('style','display: block; opacity: 1');
		}
		RESUtils.fadeElementOut(statusEle, 0.1)
		/*
		var statusEleBottom = document.getElementById('moduleOptionsSaveStatusBottom');
		statusEleBottom.innerHTML = 'Options have been saved...';
		statusEleBottom.setAttribute('style','display: block; opacity: 1');
		RESUtils.fadeElementOut(statusEleBottom, 0.1)
		*/
		if (moduleID == 'RESPro') RESStorage.removeItem('RESmodules.RESPro.lastAuthFailed');
	},
	drawAboutPanel: function() {
		var RESConsoleAboutPanel = this.RESConsoleAboutPanel; 
		var AboutPanelHTML = ' \
<div id="RESAboutPane"> \
	<div id="Button-DonateRES" class="moduleButton active">Donate</div> \
	<div id="Button-AboutRES" class="moduleButton">About RES</div> \
	<div id="Button-RESTeam" class="moduleButton">About the RES Team</div> \
</div> \
<div id="RESAboutDetails"> \
	<div id="DonateRES" class="aboutPanel"> \
		<h3>Contribute to support RES</h3> \
		<p>RES is entirely free - as in beer, as in open source, as in everything.  If you like our work, a contribution would be greatly appreciated.</p> \
		<p>When you contribute, you make it possible for the team to cover hosting costs and other expenses so that we can focus on doing what we do best: making your Reddit experience even better.</p> \
		<p> \
		<strong style="font-weight: bold;">Dwolla is the preferred method of contribution</strong>, because it charges much smaller fees than PayPal and Google: <br><br>\
		<a target="_blank" href="https://www.dwolla.com/u/812-686-0217"><img src="https://www.dwolla.com/content/images/btn-donate-with-dwolla.png"></a>\
		</p> \
		<p> \
		We also do have PayPal: <br> \
		<form action="https://www.paypal.com/cgi-bin/webscr" method="post"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="S7TAR7QU39H22"><input type="image" src="https://www.paypalobjects.com/en_US/i/logo/PayPal_mark_60x38.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1"></form> \
		</p> \
		<p></p> \
		<p></p> \
		<p> \
		Or Google Checkout: \
		<form action="https://checkout.google.com/api/checkout/v2/checkoutForm/Merchant/474530516020369" id="BB_BuyButtonForm" method="post" name="BB_BuyButtonForm" target="_top"> \
			<input name="item_name_1" type="hidden" value="Purchase - Reddit Enhancement Suite"/> \
			<input name="item_description_1" type="hidden" value="purchase"/> \
			<input name="item_quantity_1" type="hidden" value="1"/> \
			$<input name="item_price_1" type="text" value="" size="2" /> \
			<input name="item_currency_1" type="hidden" value="USD"/> \
			<input name="_charset_" type="hidden" value="utf-8"/> \
			<input alt="" src="https://checkout.google.com/buttons/buy.gif?merchant_id=474530516020369&amp;w=117&amp;h=48&amp;style=white&amp;variant=text&amp;loc=en_US" type="image"/> \
		</form> \
		</p> \
	</div> \
	<div id="AboutRES" class="aboutPanel"> \
		<h3>About RES</h3> \
		<p>Author: <a target="_blank" href="http://www.honestbleeps.com/">honestbleeps</a><br></p> \
		<p>UI Designer: <a target="_blank" href="http://www.reddit.com/user/solidwhetstone/">solidwhetstone</a><br></p> \
		<p>Description: Reddit Enhancement Suite is a collection of modules that makes browsing reddit a whole lot easier.</p> \
		<p>It\'s built with <a target="_blank" href="http://redditenhancementsuite.com/api">an API</a> that allows you to contribute and include your own modules!</p> \
		<p>If you\'ve got bug reports, you\'d like to discuss RES, or you\'d like to converse with other users, please see the <a target="_blank" href="http://www.reddit.com/r/Enhancement/">Enhancement subreddit.</a> </p> \
		<p>If you want to contact me directly with suggestions, bug reports or just want to say you appreciate the work, an <a href="mailto:steve@honestbleeps.com">email</a> would be great.</p> \
		<p>License: Reddit Enhancement Suite is released under the <a target="_blank" href="http://www.gnu.org/licenses/gpl-3.0.html">GPL v3.0</a>.</p> \
		<p><strong>Note:</strong> Reddit Enhancement Suite will check, at most once a day, to see if a new version is available.  No data about you is sent to me nor is it stored.</p> \
	</div> \
	<div id="RESTeam" class="aboutPanel"> \
		<h3>About the RES Team</h3> \
		<div id="AboutRESTeamImage"><img src="data:image/png;base64,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"></div> \
		<p>Steve Sobel (<a target="_blank" href="http://www.reddit.com/user/honestbleeps/">honestbleeps</a>) and Daniel Allen (<a target="_blank" href="http://www.reddit.com/user/solidwhetstone/">solidwhetstone</a>) are Chicago-area Redditors on a mission to make your Reddit experience the best it can possibly be. You might say they\'re on a mission from <a target="_blank" href="http://www.businessinsider.com/blackboard/reddit">Snoo</a>.</p> \
	</div> \
</div> \
		'
		RESConsoleAboutPanel.innerHTML = AboutPanelHTML;
		$(RESConsoleAboutPanel).find('.moduleButton').click(function() {
			$('.moduleButton').removeClass('active');
			$(this).addClass('active');
			var thisID = $(this).attr('id');
			var thisPanel = thisID.replace('Button-','');
			var visiblePanel = $(this).parent().parent().find('.aboutPanel:visible');
			$(visiblePanel).fadeOut(function() {
				$('#'+thisPanel).fadeIn();
			});
		});
		this.RESConsoleContent.appendChild(RESConsoleAboutPanel);
	},
	drawProPanel: function() {
		RESConsoleProPanel = this.RESConsoleProPanel;
		var proPanelHeader = document.createElement('div');
		proPanelHeader.innerHTML = 'RES Pro allows you to save your preferences to the RES Pro server.<br><br><strong>Please note:</strong> this is beta functionality right now. Please don\'t consider this to be a "backup" solution just yet. To start, you will need to <a target="_blank" href="http://redditenhancementsuite.com/register.php">register for a PRO account</a> first, then email <a href="mailto:steve@honestbleeps.com">steve@honestbleeps.com</a> with your RES Pro username to get access.';
		RESConsoleProPanel.appendChild(proPanelHeader);
		this.proSetupButton = createElementWithID('div','RESProSetup');
		this.proSetupButton.setAttribute('class','RESButton');
		this.proSetupButton.innerHTML = 'Configure RES Pro';
		this.proSetupButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].configure();
		}, false);
		RESConsoleProPanel.appendChild(this.proSetupButton);
		/*
		this.proAuthButton = createElementWithID('div','RESProAuth');
		this.proAuthButton.setAttribute('class','RESButton');
		this.proAuthButton.innerHTML = 'Authenticate';
		this.proAuthButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].authenticate();
		}, false);
		RESConsoleProPanel.appendChild(this.proAuthButton);
		*/
		this.proSaveButton = createElementWithID('div','RESProSave');
		this.proSaveButton.setAttribute('class','RESButton');
		this.proSaveButton.innerHTML = 'Save Module Options';
		this.proSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].savePrefs();
			modules['RESPro'].authenticate(modules['RESPro'].savePrefs());
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveButton);

		/*
		this.proUserTaggerSaveButton = createElementWithID('div','RESProSave');
		this.proUserTaggerSaveButton.setAttribute('class','RESButton');
		this.proUserTaggerSaveButton.innerHTML = 'Save user tags to Server';
		this.proUserTaggerSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].saveModuleData('userTagger');
		}, false);
		RESConsoleProPanel.appendChild(this.proUserTaggerSaveButton);
		*/

		this.proSaveCommentsSaveButton = createElementWithID('div','RESProSaveCommentsSave');
		this.proSaveCommentsSaveButton.setAttribute('class','RESButton');
		this.proSaveCommentsSaveButton.innerHTML = 'Save saved comments to Server';
		this.proSaveCommentsSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].saveModuleData('saveComments');
			modules['RESPro'].authenticate(modules['RESPro'].saveModuleData('saveComments'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveCommentsSaveButton);
		
		this.proSubredditManagerSaveButton = createElementWithID('div','RESProSubredditManagerSave');
		this.proSubredditManagerSaveButton.setAttribute('class','RESButton');
		this.proSubredditManagerSaveButton.innerHTML = 'Save subreddits to server';
		this.proSubredditManagerSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].saveModuleData('SubredditManager');
			modules['RESPro'].authenticate(modules['RESPro'].saveModuleData('subredditManager'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSubredditManagerSaveButton);
		
		this.proSaveCommentsGetButton = createElementWithID('div','RESProGetSavedComments');
		this.proSaveCommentsGetButton.setAttribute('class','RESButton');
		this.proSaveCommentsGetButton.innerHTML = 'Get saved comments from Server';
		this.proSaveCommentsGetButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].getModuleData('saveComments');
			modules['RESPro'].authenticate(modules['RESPro'].getModuleData('saveComments'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveCommentsGetButton);

		this.proSubredditManagerGetButton = createElementWithID('div','RESProGetSubredditManager');
		this.proSubredditManagerGetButton.setAttribute('class','RESButton');
		this.proSubredditManagerGetButton.innerHTML = 'Get subreddits from Server';
		this.proSubredditManagerGetButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].getModuleData('SubredditManager');
			modules['RESPro'].authenticate(modules['RESPro'].getModuleData('subredditManager'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSubredditManagerGetButton);
		
		this.proGetButton = createElementWithID('div','RESProGet');
		this.proGetButton.setAttribute('class','RESButton');
		this.proGetButton.innerHTML = 'Get options from Server';
		this.proGetButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].getPrefs();
			modules['RESPro'].authenticate(modules['RESPro'].getPrefs());
		}, false);
		RESConsoleProPanel.appendChild(this.proGetButton);
		this.RESConsoleContent.appendChild(RESConsoleProPanel);
	},
	open: function() {
		// no more modules panel!
		// this.drawModulesPanel();
		// Draw the config panel
		this.drawConfigPanel();
		// Draw the about panel
		this.drawAboutPanel();
		// Draw the RES Pro panel
		// this.drawProPanel();
		// Set an easily accessible array of the panels so we can show/hide them as necessary.
		RESConsole.RESConsolePanels = this.RESConsoleContent.querySelectorAll('.RESPanel');

		this.isOpen = true;
		// hide the ad-frame div in case it's flash, because then it covers up the settings console and makes it impossible to see the save button!
		var adFrame = document.getElementById('ad-frame');
		if ((typeof(adFrame) != 'undefined') && (adFrame != null)) {
			adFrame.style.display = 'none';
		}
		// var leftCentered = Math.floor((window.innerWidth - 720) / 2);
		// modalOverlay.setAttribute('style','display: block; height: ' + document.documentElement.scrollHeight + 'px');
		removeClass(this.modalOverlay, 'fadeOut');
		addClass(this.modalOverlay, 'fadeIn');

		// this.RESConsoleContainer.setAttribute('style','display: block; left: ' + leftCentered + 'px');
		// this.RESConsoleContainer.setAttribute('style','display: block; left: 1.5%;');
		removeClass(this.RESConsoleContainer, 'slideOut');
		addClass(this.RESConsoleContainer, 'slideIn');
		RESConsole.menuClick(RESConsole.RESMenuItems[0]);
	},
	close: function() {
		$('#moduleOptionsSave').fadeOut();
		this.isOpen = false;
		// Let's be nice to reddit and put their ad frame back now...
		var adFrame = document.getElementById('ad-frame');
		if ((typeof(adFrame) != 'undefined') && (adFrame != null)) {
			adFrame.style.display = 'block';
		}
		// this.RESConsoleContainer.setAttribute('style','display: none;');
		removeClass(this.modalOverlay, 'fadeIn');
		addClass(this.modalOverlay, 'fadeOut');
		removeClass(this.RESConsoleContainer, 'slideIn');
		addClass(this.RESConsoleContainer, 'slideOut');
		// just in case the user was in the middle of setting a key and decided to close the dialog, clean that up.
		if (typeof(RESConsole.keyCodeModal) != 'undefined') {
			RESConsole.keyCodeModal.style.display = 'none';
			RESConsole.captureKey = false;
		}
	},
	menuClick: function(obj) {
		if (obj) var objID = obj.getAttribute('id');
		// make all menu items look unselected
		var RESMenuItems = RESConsole.RESMenuItems;
		for (var i = 0; i < RESMenuItems.length; i++) {
			removeClass(RESMenuItems[i], 'active');
		}
		// make selected menu item look selected
		addClass(obj, 'active');
		// hide all console panels
		var RESConsolePanels = RESConsole.RESConsolePanels;
		for (var i = 0; i < RESConsolePanels.length; i++) {
			RESConsolePanels[i].setAttribute('style', 'display: none');
		}
		switch(objID) {
			case 'Menu-Enable Modules':
				// show the modules panel
				this.RESConsoleModulesPanel.setAttribute('style', 'display: block');
				break;
			case 'Menu-Configure Modules':
				// show the config panel
				this.RESConfigPanelSelector.selectedIndex = 0;
				this.RESConsoleConfigPanel.setAttribute('style', 'display: block');
				break;
			case 'Menu-About RES':
				// show the about panel
				this.RESConsoleAboutPanel.setAttribute('style', 'display: block');
				break;
			case 'Menu-RES Pro':
				// show the pro panel
				this.RESConsoleProPanel.setAttribute('style', 'display: block');
				break;
			default:
				var objSplit = objID.split('-');
				var category = objSplit[objSplit.length-1];
				this.RESConfigPanelSelector.selectedIndex = 0;
				this.RESConsoleConfigPanel.setAttribute('style', 'display: block');
				this.drawConfigPanel(category);
				break;
		}
	}
};
