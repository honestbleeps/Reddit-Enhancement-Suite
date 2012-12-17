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
// @version       4.1.5
// @updateURL     http://redditenhancementsuite.com/latest/reddit_enhancement_suite.meta.js
// @downloadURL   http://redditenhancementsuite.com/latest/reddit_enhancement_suite.user.js
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js
// ==/UserScript==

var RESVersion = "4.1.5";

/*
	Reddit Enhancement Suite - a suite of tools to enhance Reddit
	Copyright (C) 2010-2012 - honestbleeps (steve@honestbleeps.com)

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

var tokenizeCSS = 'ul.token-input-list-facebook { overflow: hidden; height: auto !important; height: 1%; width: 400px; border: 1px solid #96bfe8; cursor: text; font-size: 12px; font-family: Verdana; min-height: 1px; z-index: 1010; margin: 0; padding: 0; background-color: #fff; list-style-type: none; clear: left; }';
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
guidersCSS += '.guider_arrow { width: 42px; height: 42px; position: absolute; display: none; background-repeat: no-repeat; z-index: 100000006 !important; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAACoCAMAAAChZYy6AAABelBMVEX///8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzN+fn4zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzPe3t4zMzMzMzN2dnYzMzMzMzPV1dUzMzMzMzMzMzMzMzMzMzN8fHwzMzOEhIQzMzPa2tozMzMzMzNtbW0zMzNzc3MzMzMzMzPR0dFtbW1xcXHS0tIzMzMzMzNxcXHh4eEzMzMzMzPi4uIzMzMzMzMzMzMzMzMzMzMzMzOEhITPz8+MjIwzMzMzMzMzMzOHh4czMzMzMzPZ2dkzMzMzMzPPz88zMzPW1tYzMzMzMzPV1dVvb28zMzMzMzMzMzOBgYEzMzPY2NiBgYHh4eHd3d3Nzc3o6OikpKQzMzPe3t7R0dEzMzPZ2dna2tqHh4czMzMzMzP///+41NW+AAAAfXRSTlMAAAECBA0HCBUfDhYsYy4gPU07CyF4PFCLjnVhA3ZMYC1PuxSMOmJ0jSscivBOGbY+eepVDDZ3Hrk/vgbuKn+yNLUJKOmxs+pZU7TwMgXcEhcmHRNun+SzNw+HvnJe6Eok50vsZArrpHFSNbyJ137v7ufmkyXv6F/s6qFWWFA9DhkAAAWkSURBVHhe7djpU+LKHsfh3ARiQBE0ioIIKoSwCKiAiAguuG+Ay7jv+z4uozNq/vebDub8OImdpOq8O3W+L62nPkVZZTc24aEokiQMjWUnaBNlCEcicb+5zhAeSy/mLYwhPDebPHY2iJjWxcvrBb4jZggLwn4i0NnRZAAL4k4S7SJu1sOCtHNtDBRtYByLgepjoIDn290+PEYENoPFQAFPR90+b3PY4kcYQ+VNSpgLZ/wp2kPhqIxHFRioeq+jUf7Ny+VXVtkcRcoUs6OpW37vIF0pm3MUUMwep7bXks4Kc2YCit2Pi8ur64x1iQSK39199rCUM0SfnrMvJdoAfdjgk5uWLf0PsLAT2P3MFsusSYcuDLv6bTGuGLfS2r+sXhGetvU12pkU7SFlioE2EbbUW2tPiG/gjatVDYEC7EHQARBHfykhjv7sCSkgho4g2I2BQAHaZYijI0OhwWC3owsghv4eCmhBoH+0IWz5veAOxpwiNAPEHcUfXoB6B3zYzmCg/rXxzy8juOL0KRsZm1sWNLc8NxZhPQTFRtKz79p0fTYdYSmCmogvfhT+aMn9QnIxPkERJO0Pe91DWjTBH+f9NEmQJrPdGQz8xsuTQIfTYkZ/4VQd0xUb1MgmOmMNTB1FEHJ2BCfP2+UoytZ3dUNWHW2qRr+yjmAIkx34KwrZnu/pOIrSKIrNQrT5KwrZ1h79KMpa7Q5b6KdWVDc7L0eV2V9KOQPR2mwjZCHqlqPKrKtXGfXJUUW2TZmdlqPKbIsyOxmFqDp7ox+FrF4UssNAR91eiGpmX3FROds/XBMNQ1Sd7bO5FqryKOrjIKqZneK9YT+K4rOn1ezj7RuXgSgmu6MXhU8beBCEH9t7XCaFolrZ2O6GIFysHeQhisnauU/+6e4ymV5JeRDQyDLFbPL5/spZWYUoJpuKFzez2etKmYUoJktby5aXwwwDX9qwWQ/NbpVK1jOQeEuZlujckrGbhBSncP+NJCnKYwhSJnqCZQ3BOrM/HokYgow9vJgeMwDr7V1O78fsnCEYC7oL78va0CpCR3dwMDAkXu3GoHRZ68PQ0NeFpgEbHd221lAPgtJwsAWgPCxsQ/Bvlx4eunoU1xge9gqKqWEfgjcAgaphv2sYoJqSHjrF2EV4ClA5OFTiRS6GigsI4ClpYsvF7OduYAcgji5tWTaT/MYDACylSy/Z5ycAGjRXOsze3xmiS9bM9dXlxQ99SpjOmIozubY99ahLqZy5XEkf7PG3U0c6lKRy7OpKnvO+8dHRVxyVux465c+EOa/PHR2dxFI1np7EURmbaLPfEm6W8IwmJUiEGUtDc5PP3T4PGCgWDygoFnd0to8DBorHQHVx4hyoPj4BqoWdIg4k9oFq4lgHX1hfBqCJj5Ozc8YOeEseDniD14bxy8j4Ffcv3f/UI9HUP1ZR9OUpR6MvT7qUyp1ZS6UtlvaQGArSzGQOXyxlK03pUA9brlxns5vFeMpEfkfhJKBXK86r++dktoj+IZX3HfWkVtLJy7sn/pOzW00klqKoP3+wdiEIG7uxxnrIqilpSmW4vW3xQH4I2PpaUFZFIRr28lOCuJ3+NsgqKYqaM9zb7SOiC65TyKooRNGGIauiKGrhfNEjBFEWPq2KUjQT9rpHJQhZJZWjzb7oq0x7XTYHyqopijZAFGVbpayCQnQSKGQVFEWb3NNCzW6qWSWFqDqroBCtWY+craXVaPuMjCBrR9laWo3Oyway3ShbS6VohxyF/QpVszVUinaiqDrbJWa/KEQH1PRnTZaA6DgCGlkCE5U3Ego67GYpS2CikB2Us0Q16oQoLosoVYeiCQGzITlLyNFzHB0JBJ1SlpCiMRTFZ2NdjJglqtHACZ7+/sqix7/8MY+i+KwbPQCQ0pNisrCvRf8UPtCTYvWhcl3Q3Hv1odL48+f/AZYqoYKwlk9uAAAAAElFTkSuQmCC); }  ';
guidersCSS += '.guider_arrow_right { display: block; background-position: 0px 0px; right: -42px; }';
guidersCSS += '.guider_arrowdown { display: block; background-position: 0px -42px; bottom: -42px; }';
guidersCSS += '.guider_arrow_up { display: block; background-position: 0px -126px; top: -42px; }';
guidersCSS += '.guider_arrow_left { display: block; background-position: 0px -84px; left: -42px;}';




// DOM utility functions
var escapeLookups = { "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" };
function escapeHTML(str) { return (str == null) ? null : str.toString().replace(/[&"<>]/g, function(m) { return escapeLookups[m] }) };

// set up MutationObserver variable to take whichever is supported / existing...
// unfortunately, this doesn't (currently) exist in Opera.
// var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;
// At the time of writing WebKit's mutation oberver leaks entire pages on refresh so it needs to be disabled.
var MutationObserver = window.MutationObserver || /* window.WebKitMutationObserver || */ window.MozMutationObserver || null;
// null out MutationObserver to test legacy DOMNodeInserted
// MutationObserver = null;

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
				$(thisExpando).html('<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+escapeHTML(tweet.user.profile_image_url)+'"></div>' + escapeHTML(tweet.user.screen_name) + ': ' + escapeHTML(tweet.text) + '</div></div></form>');
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
			$(thisExpando).html('<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+escapeHTML(tweet.user.profile_image_url)+'"></div>' + escapeHTML(tweet.user.screen_name) + ': ' + escapeHTML(tweet.text) + '</div></div></form>');
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
			$(thisExpando).html('<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+escapeHTML(tweet.user.profile_image_url)+'"></div>' + escapeHTML(tweet.user.screen_name) + ': ' + escapeHTML(tweet.text) + '</div></div></form>');
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

// listen for messages from chrome background page
if (typeof(chrome) != 'undefined') {
	chrome.extension.onMessage.addListener(
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

	if (BrowserDetect.browser == "Explorer") {
		GM_xmlhttpRequest = function(obj) {
			var crossDomain = (obj.url.indexOf(location.hostname) == -1);
			if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
				obj.requestType = 'GM_xmlhttpRequest';
				var request = new XDomainRequest();
				request.onload = function() {obj.onload(request);}
				request.onerror = function() {if (obj.onerror) {obj.onerror(request);}}
				request.open(obj.method,obj.url);
				request.send(obj.data);
				return request;
			} else {
				var request=new XMLHttpRequest();
				request.onreadystatechange=function() { if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); } }
				request.onerror=function() { if(obj.onerror) { obj.onerror(request); } }
				try { request.open(obj.method,obj.url,true); } catch(e) { if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return; }
				if(obj.headers) { for(var name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
				request.send(obj.data);
				return request;
			}
		}
	}
	
	if (typeof(chrome) != 'undefined') {
		GM_xmlhttpRequest = function(obj) {
			var crossDomain = (obj.url.indexOf(location.hostname) == -1);
			
			if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
				obj.requestType = 'GM_xmlhttpRequest';
				if (typeof(obj.onload) != 'undefined') {
					chrome.extension.sendMessage(obj, function(response) {
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
	randomHash: function(len) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var numChars = len || 5;
		var randomString;
		for (var i=0; i<numChars; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomString += chars.substring(rnum,rnum+1);			
		}
		return randomString;
	},
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
	submitRegex: /https?:\/\/([a-z]+).reddit.com\/([-\w\.\/]*\/)?submit\/?$/i,
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
	matchDOM: /https?:\/\/(?:[a-z]+).reddit.com\/domain\/([\w\.\+]+).*/i,
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
	currentDomain: function(check) {
		if (typeof(this.curDom) == 'undefined') {
			var match = location.href.match(RESUtils.matchDOM);
			if (match != null) {
				this.curDom = match[1];
				if (check) return (match[1].toLowerCase() == check.toLowerCase());
				return match[1];
			} else {
				if (check) return false;
				return null;
			}
		} else {
			if (check) return (this.curDom.toLowerCase() == check.toLowerCase());
			return this.curDom;
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
	sanitizeHTML: function(htmlStr) {
		//Wrap in a custom root element to help make sure it parses.
		var xml = $.parseXML('<root>'+htmlStr+'</root>');
		//Whitelist safe elements
		$(xml).find('root :not(h1,h2,h3,h4,h5,h6,span,div,code,br,hr,p,a,img,pre,\
blockquote,table,thead,tbody,tfoot,tr,th,td,strong,em,i,b,u,ul,ol,li,dl,dt,dd)').each(function(i,e,a){
			$(this).replaceWith($(this.childNodes));
		});
		//Strip non-whitelisted attributes
		$(xml).find('root *').each(function(i, element) {
			var attrs = $.map(this.attributes, function(attr) {return attr.name});
			var node = this;
			var name = this.tagName;
			$.each(attrs, function(i, attrName) {
				if (name == 'a' && attrName == 'href') return;
				else if (name == 'img' && attrName == 'src') return;
				else if (attrName == 'title') return;
				else if (attrName = 'alt') return;
				else node.removeAttribute(attrName);
			});
		});
		var safe = new XMLSerializer().serializeToString(xml);
		return safe.slice(6,-7);
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
				var thisJSON = {
					requestType: 'compareVersion',
					url: jsonURL
				};
				chrome.extension.sendMessage(thisJSON, function(response) {
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
				$(RESConsole.RESCheckUpdateButton).html('You are out of date! <a target="_blank" href="http://reddit.honestbleeps.com/download">[click to update]</a>');
			}
			return true;
		} else {
			RESStorage.setItem('RESlatestVersion',response.latestVersion);
			RESStorage.setItem('RESoutdated','false');
			if (forceUpdate) {
				$(RESConsole.RESCheckUpdateButton).html('You are up to date!');
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
					var submittingHTML = " \
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
								<li>Have you searched /r/RESIssues to see if someone else has reported it?</li> \
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
					$(this.submittingToEnhancement).html(submittingHTML);
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
								txt+= "- Platform: " + BrowserDetect.OS + "\n";
								txt+= "- Did you search /r/RESIssues before submitting this: No. That, or I didn't notice this text here and edit it!\n\n";
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
			var thisJSON = {
				requestType: 'openLinkInNewTab',
				linkURL: url,
				button: focus
			};
			// send message to background.html to open new tabs...
			chrome.extension.sendMessage(thisJSON);
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
		$(thisNotification).html('<div class="RESNotificationHeader"><h3>'+header+'</h3><div class="RESNotificationClose RESCloseButton">&times;</div></div><div class="RESNotificationContent">'+content+'</div>');
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
	toggleButton: function(fieldID, enabled, onText, offText, isTable) {
		enabled = enabled || false;
		var checked = (enabled) ? 'CHECKED' : '';
		onText = onText || 'on';
		offText = offText || 'off';
		var thisToggle = document.createElement('div');
		thisToggle.setAttribute('class','toggleButton');
		thisToggle.setAttribute('id',fieldID+'Container');
		var tableAttr = '';
		if (isTable) {
			tableAttr = ' tableOption="true"';
		}
		$(thisToggle).html('<span class="toggleOn">'+onText+'</span><span class="toggleOff">'+offText+'</span><input id="'+fieldID+'" type="checkbox" '+tableAttr+checked+'>');
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
			chrome.extension.sendMessage(thisJSON);
		} else if (typeof(safari) != 'undefined') {
			safari.self.tab.dispatchMessage('XHRCache', thisJSON);
		} else if (typeof(opera) != 'undefined') {
			opera.extension.postMessage(JSON.stringify(thisJSON));
		} else if (typeof(self.on) == 'function') {
			self.postMessage(thisJSON);
		}
	},
	initObservers: function() {
		if (RESUtils.pageType() == 'comments') {
			// initialize comments page based sitetable observer...
			var siteTable = document.querySelector('.commentarea > div.sitetable');
			if (MutationObserver && siteTable) {
				var observer = new MutationObserver(function(mutations) {  
					mutations.forEach(function(mutation) {
						// when a node is added on a comments page, check if it's a new self comment.
						if ($(mutation.addedNodes[0]).hasClass('comment')) {
							RESUtils.watchers.newComments.forEach(function(callback) {
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
						if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
							RESUtils.watchers.newComments.forEach(function(callback) {
								if (callback) callback(event.target);
							});
						}
					}, true);
				}
			}
		} else {
			// initialize sitetable observer...
			var siteTable = document.querySelector('#siteTable');
			if (MutationObserver && siteTable) {
				var observer = new MutationObserver(function(mutations) {  
					mutations.forEach(function(mutation) {
						if (mutation.addedNodes[0].id.indexOf('siteTable') != -1) {
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
						if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
							RESUtils.watchers.siteTable.forEach(function(callback) {
								if (callback) callback(event.target);
							});
						}
					}, true);
				}
			}
		}

		$('.entry div.expando').each(function() {
			RESUtils.addSelfTextObserver(this);
		});

		// initialize new comments observers on demand, by first wiring up click listeners to "load more comments" buttons.
		// on click, we'll add a mutation observer...
		$('.morecomments a').click(RESUtils.addNewCommentObserverToTarget);

		// initialize new comments forms observers on demand, by first wiring up click listeners to reply buttons.
		// on click, we'll add a mutation observer...
		// $('body').delegate('ul.flat-list li a[onclick*=reply]', 'click', RESUtils.addNewCommentFormObserver);
		$('.thing .child').each(function() {
			RESUtils.addNewCommentFormObserver(this);
		});

	},
	addNewCommentObserverToTarget: function (e) {
		var ele = $(e.currentTarget).closest('.sitetable')[0];
		// mark this as having an observer so we don't add multiples...
		if (! $(ele).hasClass('hasObserver')) {
			$(ele).addClass('hasObserver');
			RESUtils.addNewCommentObserver(ele);
		}
	},
	addNewCommentObserver: function(ele) {
		var mutationNodeToObserve = ele;
		if (MutationObserver) {
			// console.log('node to observe:');
			// console.log(mutationNodeToObserve);
			var observer = new MutationObserver(function(mutations) {  
				RESUtils.watchers.newComments.forEach(function(callback) {
					// add form observers to these new comments we've found...
					$(mutations[0].target).find('.thing .child').each(function() {
						RESUtils.addNewCommentFormObserver(this);
					});					
					// check for "load new comments" links within this group as well...
					$(mutations[0].target).find('.morecomments a').click(RESUtils.addNewCommentObserverToTarget);
					callback(mutations[0].target);
				});
				// disconnect this observer once all callbacks have been run.
				observer.disconnect();
			});

			observer.observe(mutationNodeToObserve, {
				attributes: false, 
				childList: true,
				characterData: false
			});				
		} else {
			// Opera doesn't support MutationObserver - so we need this for Opera support.
			mutationNodeToObserve.addEventListener('DOMNodeInserted', function(event) {
				// TODO: proper tag filtering here, it's currently probably all wrong.
				if ((event.target.tagName == 'DIV') && (hasClass(event.target, 'thing'))) {
					RESUtils.watchers.newComments.forEach(function(callback) {
						if (callback) callback(event.target);
					});
				}
			}, true);
		}
	},
	addNewCommentFormObserver: function(ele) {
		var commentsFormParent = ele;
		if (MutationObserver) {
			// var mutationNodeToObserve = moreCommentsParent.parentNode.parentNode.parentNode.parentNode;
			var observer = new MutationObserver(function(mutations) {  
				var form = $(mutations[0].target).children('form');
				if ((form) && (form.length == 1)) {
					RESUtils.watchers.newCommentsForms.forEach(function(callback) {
						callback(form[0]);
					});
				} else {
					var newOwnComment = $(mutations[0].target).children('div.sitetable');
					if ((newOwnComment) && (newOwnComment.length == 1)) {
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
				if (event.target.tagName == 'FORM') {
					RESUtils.watchers.newCommentsForms.forEach(function(callback) {
						if (callback) callback(event.target);
					});
				}
			}, true);
		}
	},
	addSelfTextObserver: function(ele) {
		var selfTextParent = ele;
		if (MutationObserver) {
			// var mutationNodeToObserve = moreCommentsParent.parentNode.parentNode.parentNode.parentNode;
			var observer = new MutationObserver(function(mutations) {  
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
				if (event.target.tagName == 'FORM') {
					RESUtils.watchers.newCommentsForms.forEach(function(callback) {
						if (callback) callback(event.target);
					});
				}
			}, true);
		}
	},
	watchForElement: function(type, callback) {
		switch(type) {
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
	},
	watchers: {
		siteTable: [],
		newComments: [],
		selfText: [],
		newCommentsForms: []
	},
	// A link is a comment code if all these conditions are true:
	// * It has no content (i.e. content.length == 0)
	// * Its href is of the form "/code"
	//
	// In case it's not clear, here is a list of some common comment
	// codes on a specific subreddit:
	// http://www.reddit.com/r/metarage/comments/p3eqe/full_updated_list_of_comment_faces_wcodes/
	COMMENT_CODE_REGEX: /^\/\w+$/,
	isCommentCode: function (link) {
		var content = link.innerHTML;

		// Note that link.href will return the full href (which includes the
		// reddit.com domain). We don't want that.
		var href = link.getAttribute("href");
		
		return !content && this.COMMENT_CODE_REGEX.test(href);
	},
	/*
    Starts a unique named timeout.
    If there is a running timeout with the same name cancel the old one in favor of the new.
    Call with no time/call parameter (null/undefined/missing) to and existing one with the given name.
    Used to derfer an action until a series of events has stopped.
    e.g. wait until a user a stopped typing to update a comment preview.
    (name based on similar function in underscore.js)
    */
	debounceTimeouts: {},
	debounce: function(name, time, call, data) {
    	if (name == null) return;
		if (RESUtils.debounceTimeouts[name] !== undefined) {
            window.clearTimeout(RESUtils.debounceTimeouts[name]);
            delete RESUtils.debounceTimeouts[name];
        }
        if (time != null && call != null) {
	        RESUtils.debounceTimeouts[name] = window.setTimeout(function() {
	        	delete RESUtils.debounceTimeouts[name];
	            call(data);
	        }, time);
	    }
    },
    /*
    Iterate through an array in chunks, executing a callback on each element.
    Each chunk is handled asynchronously from the others with a delay betwen each batch.
    If the provided callback returns false iteration will be halted.
    */
    forEachChunked: function(array, chunkSize, delay, call) {
		if (array == null) return;
		if (chunkSize == null || chunkSize < 1) return;
		if (delay == null || delay < 0) return;
		if (call == null) return;
		var counter = 0;
		var length = array.length;
		function doChunk() {
			for (var end = Math.min(array.length, counter+chunkSize); counter < end; counter++) {
				var ret = call(array[counter], counter, array);
				if (ret === false) return;
			}
			if (counter < array.length) {
				window.setTimeout(doChunk, delay);
			}
		}
		window.setTimeout(doChunk, delay);
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
		// gdAlert.container.getElementsByTagName("SPAN")[0].innerHTML = text;
		$(gdAlert.container.getElementsByTagName("SPAN")[0]).html(text);
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
		$(this.gearOverlay).html('<div class="gearIcon"></div>');
		
		this.prefsDropdown = createElementWithID('div','RESPrefsDropdown','RESDropdownList');
		$(this.prefsDropdown).html('<ul id="RESDropdownOptions"><li id="SettingsConsole">settings console</li></ul>');
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
		this.loader = 'data:image/gif;base64,R0lGODlhHQAWANUAAESatESetEyetEyitEyivFSivFSmvFymvFyqvGSqvGSqxGSuxGyuxGyyxHSyxHS2xHS2zHy2zHy6zIS6zIS+zIy+zIzCzIzC1JTG1JzK1JzK3JzO3KTO3KTS3KzS3KzW3LTW3LTW5LTa5Lza5Lze5MTe5MTi5MTi7Mzi7Mzm7NTm7NTq7Nzq7Nzq9Nzu9OTu9OTy9Ozy9Oz29Oz2/PT2/PT6/Pz6/Pz+/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/h1CdWlsdCB3aXRoIEdJRiBNb3ZpZSBHZWFyIDQuMAAh+QQIBgAAACwAAAAAHQAWAAAG/sCbcEgs3myyEIzjQr2MUGjrgpFMrJIMhxTtei4SbPhKwXCeXaLren00GIuHlSLxzNJDD4NOWST8CwsUgxEjeEIcDYN0ICkjFA4UFYMcRXckIS8XKysTCJKSGCMkHBUXpwwXRC8UGheLpgsMDBKmF6YWF7kODYY3LmawoKcXCxIKFMSnkBIELDczIxODk2SmpoMFbg8XDg4SAAoTNTUY1BcTDQsKCw2nGGAMBAUJDQcCDZ8yNzESya8NFDCAEFAChoO6GGSowEDDggsq0HhIZisVixkwQFDBkIHCARQ1XICosSIGEYe5MFjAsE8IigwcYWa402VEyoNmRozgkEFDbs8MBRS0jJJCwAOcMn1u4MBTA4UHNdLIgIAOg08NGphqZWAggohDHBIEqMCRqZYMEjZMMPBgaJcYcDAcQMBhwgMOGOg9AOHrUIkQ8hJQQKDgQaQFEQ4ZuRABxSwREtqWcKHYiIwaWm6UGBG18o0gACH5BAgGAAAALAAAAAAdABYAAAb+wJtwSCwKXabWBjaS2YxQowqDkUysEg4GFe1+LtgrVkKddYsvCRbSYCwcEgpl4jGfhR3GnLJILP4JchQQJXdCHhCCEiApIxUNFZESGkUzNCsaMBwjMRQFE3IVGCMkHBYXFBcQGEM1NhRUexWqCRAQsxcWuBcXEQgkQjEXGYIUFanIDxENEry5F48SByo3MCWCx1fGzlcHCxKQEggUAgYWrqjGcg0LCguQuVUNBwUJbgIKDBFmMKi4DfnYKCBDhUqDCRgWYFDmAoYQDs2cMcCwYkaMEBYKUjiAAsaMDzFgxCDiocEpDBcwjBSSIkMGDRkwWHDYJUSqghg2jBjB4eVzSwwKINA4Y0JAhIIuYcLkoKFnAwc1zsyYYCFC0pccsmZNcNCDoQ4FCmAQ1TPr2A4JClCIeufFggcUAkDg8ECCBwkF4F4YYYhlCAQFHEwwwECCAwcINDzpK2QGBQ4gFEwAsSDDDA4vGBOxUaMfFw5cNN8IAgAh+QQIBgAAACwAAAAAHQAWAAAG/sCbcEgsClcqlAc2qtWMUCOKc5FYrZyK6xmFhizWiURMxmBm3SIMMp48GoyFQ0Kpc9BpIcchpiz+gHUUESd5Qh4QghIhKCMUDhQVFBIYRTMvMxgtIxw1GAJ0khkiJRwUF6gRGUNOGRUYghQYEQgSEBcWFBa7uGAEIUI1p7GSFRUXg3MRqKgWFwoRCSs3LiPIkhRkyKgSDggFj3UHEwcEFk8ZoXUNCn8OqBjIDQj0Cg0CCA8PMTctsMcX4jBwwI6SGQsZAnJYcKrBCn43ODxgFvBCixkwvpjJQIGBChU3RqioAVFIiAjOMFjAIGNICgwZNGTA4ABGmhATzZjhMIJTacyYNClwiVLCgKyNP2VyWIqhgIOhUGQkwyBT6VIOGRSA4WCIg4AGHDNgZYrBawEMUKO0aCCBAYALGRiUZVCLwoMRhoS80IDgQIQGBuY0SJDgRMm8MCiguJAgZgIUL23mlcLyBQbJk28EAQAh+QQIBgAAACwAAAAAHQAWAAAG/sCbcEgsClWwEElFstWMUGPpM5FUJxTMBUaLRkcUq2QsplwwXS8R5hBDGoxFm0LXyNRDj4OCXSQWgAl0FBEpeEIce3QSISlgDhUUFRAXRTQqNRwlKhgzGgUQgxkjJRxmFxcTHEMzLyRmgxQaFIIQFReRqBcWFxIDH0MYsZKSu2MMhLoWtwzNKjctHsJ0FWPFqBMLCAIXDxEXBw4MARhPHhKSkXCADbdnFA4KfggNBaASMDecxBcN8g7+JGAYiArEggwOHHRogOLODQ8NdF1YgKHFjCRnBlqQ0MKEjRRN8g0JcWoghhhDUmTIoCEDBQUio3hQYMEkhg0jRnBgyTMLcEovJhbUHLiypQYNOzlIABDhiZcYLx/wbMmh6k4IGbAe0jBgQi+kGapi4FABAAIOP9WsiCDBnksHHDAceEABAgMTh4TMqIBggYQDCCREWHBgAYxneYW0wPCiwQIQEh686FAusREQHmyE4FDDhuUbQQAAIfkECAYAAAAsAAAAAB0AFgAABv7Am3BILN5sqhlHVUrVaMaosSSSUCTYygUTm0mlKKxkIiZTKJrat/hqkCcPhrxhpVQw3rXwA6FMKAoLgoJnVyl6QhwMhRIfKCQUDhV2EBdFNSc0IhwvGiocCH12GSMlHBQXqRIcQzMoKhMWhRQZFwwSERd2uhcWvRQFHkMef4UVkxcVVgtXqRYYWg4HDSs3LRgYs2apvRMGCgJjDxcKoQIYNjcjEWe6DQyBDVpbFg8JDAsGDAcCDxQuN1DwSgVvwYMGCiRgyyYBxQILExR8iBBCzY0QDXz5YoChxQwYIZ5hyAANRokYLkQ8IfJhHoZnMYagyEBTA4QDMNZwMCAS23aGESM6ZNAwlGaFPGByLaRZMwMHDRwaBKCQ7osMCQUk1NQAlYPXlxoUaECE4QCGCKuccqDpwUEABh5eIFoRKUCCqBKIJbgg4V4LREJmPFAQ4UGBRQ0QIJjgggTgISpGmFDwwAODCy0mbHhshIaHQxdG3KhRFXAQACH5BAgGAAAALAAAAAAdABYAAAb+wJtwSCzeaiwYxwVyxWrGqBEVklAkksmFspxJpalHdoydZDu0b7HlME8ejAVDTKFULlC1MAShTCgLCguDC3V+J182QxmFdRIeKSMUDnYUEBhGJy4rGDAeJRwMlHYZI6B3FxcPHUM0ISwVlXUYGA0QWhRbFhe7FhUIHkI1JVaGsbEXERILf6mpuxEDDCs3LncWdRVYuc4WBgsCDxUNFA8CEAUXNzYnVrEUDXEKDXcYFxURB3IICgoCDRhY3EDRLFUDQRAOSqCFAV4KZRgQcMDAYQiJB7xSMcCwggaMEBVoZaAlA0XHEDBqKBLSAZU9DDGGoNCAIYMGBwdiftFQwAJ1Q4ojRnDIYLOoBC9fVORiOFKDTQ0coi44oE7NjAYCKBB1CnVD1JoVDlTUcwEgAy4Zog7lcMDAQhd6qmFIAEBCBgUWODhokKHBgQY648Jg0CCCvwgUEhxIwCFoXCIqXGRIUFOBBxINSDyO4mnGCgoubMDYLCQIACH5BAgGAAAALAAAAAAdABYAAAb+wJtwSCzeaq+W59WZuWrGqFHFkVAkkolFMkrRpFIUZJLFlsmiGLi4gmApjwaD0ZhQ7hfbejhyUOwLCQuDC3d3JWB6QhoIhhEgKCMUfhUVEBlGKCcwFyonHhwOEHcVGCMkHBUXFxUNHEM1HigZFBWGpRENFKsXFr2/FA0hQjAtdoa1uxcSDwyjqr4XfwIKLDcxyYZktau+CgkGDRcPERQBDo1HJ8fSDQsKCw2qGNIQBQsMCQcMAggaLTdQlOPFQIGzBgokYFhIYQGIDA0yFAqR4csNExC6XWBwgcUMGCFKLVwYo0WJGiVW2FB0Q4OWVQtlDJmFQUOGCAlgrOFw4MJ9SAwcRozokEGDhg0cLDiYsWbFlpEZMBQtyoFDBgYOLkABM+NAAQsZpmqoWjUDhwYFPuy5sYwCgppmrVot8EBCBRdrX2AoIADDhAVhGZQ6YEDC1rUrGEwyUIBChAUIFpAwtZaIixkQHEpYUOKqC5aVh7AoYcNDhRozXoQWEgQAIfkECAYAAAAsAAAAAB0AFgAABv7Am3BILN5ostNo5ZmtbMaosZWhUCQTSUVSItWk0hIES5aQJ6UXuLgyZyONBcMhsVIw37VwBJlYFwmACwt2FCNgUEIZCFZZICkjFA4UFRQRG0YuITIaIi0eGBARdhohJRwXqRcLGUQeIRx+dn4SCxWptxYXt1sRIUIuK5V2FZWpEw0OCxYUqbpWBgYsR8NWW3W4FxYOCIMWEg4XAggMFDY1IpW3FHEKCw23GBeSAgoNDAINBQcbLTcqD5rNY6CAAQSCEjAopMAAg4cFGBw0QJFhhpATE1StwrBiRgwQdzBkwEABBo0QNFacKILhgSqFMYak0JAhg4YIEGKC8cDggnZChRxGjOBQk6aGWjLWrKDw4OdIoxqIcnBgwUIeKTEMKFBo0yaHr0Q1GCBwSA9JBwe6fs3AwcKBC+Bc6LkRg0IBBBrmcGDHoYKAtDrnomhwAd8yBggUPAjxoMRcIjFgJJAAYgEEE2NqWHzMpkWNCx5usFDD+UYQACH5BAgGAAAALAAAAAAdABYAAAb+wJtwSCzeajWRqjSKqYxQ6OuCkVgnFMlpVItGR1fJxCrJUkYvb3EliYwfjLijPN501cKQw7zo+ymAEyJqNkIaCYBZICgjFHsVFRIcRjQcMCEbMSESD1gVFBkiJRwWFxQXCxhEIRkeiaeOEgqnFRcVpbUXViBCLSUYr5+fpgsQCqYXyaYUCQQsR8CAn2MUuRcWEgcOC4ALFgcEDBI2NRymtRQNfg25GBMNAQgMDQUJCAUZaS4OFsMMfQ4aKJCAoaAFCBJGLPiEoIQHGEJInFKWqsUMTRQKZrjg4IUNES1klCiCgYGygjGGoMigIUOGahC9bLJQsOCGESM6tGSpYYFwgRlqUgSs6ZKlSw4tQU24EyXGAQgYXGpoqYGDVXMCDozEA+yAggwYrlqV0CBDgwZp8MyQUOABBgMUODiI0MGBgAQhVuAZUqKaAgEQKCBI0CAjA717h9QogaBqggshEnCwkTYxkRU0VkxQYcNETMtBAAAh+QQIBgAAACwAAAAAHQAWAAAG/sCbcEgs3mo0kAuEaq2MUOiLgpFYKZLLaBTthrATSViMrYRe3WILLHk0GAuHhILt1NLDDyNMWSgWCQsLFBNYXHg3HIN0EiApIxQOFBWEHEU1Nh4oKRgvJREMk5MYIyUclBcXCxdEKBcedIUXFAwPCpOpFhSpqQ8Qhy0dHHR0lKgXChIIu7kYWA4DLUcchaJ8vLoUBhELEhYMEg0A4DY1GbMVsw2CCg3pGFUMAgftBgcLBxcyNzEQzBQNFDBwEFACPAwXJjTwEOEBhgQeSMAQIoKChXQXGGBYMSOGiAoHLSxQcePECRsoZhDBoCAVQgwxhqDAoCGDBngqu0A6CI/DdJYONoMaKLCvS4oDDQ5moGlzA4cNSzNEuNNFhoIKFjAE1eCUg9cIARaUQMTBgQAIN716lZr1gIOJeGY0yBehgFaNHBAMYEBiLKIbJDg8KGBgwgMECRxUgNAg5l8hNjQwgAQRw4IUMKQ9JuLiRsUaMEYUfRwEADs=';
		RESConsoleTopBar.setAttribute('class','RESDialogTopBar');
		$(RESConsoleTopBar).html('<img id="RESLogo" src="'+this.logo+'"><h1>reddit enhancement suite</h1>');
		RESConsoleHeader.appendChild(RESConsoleTopBar);
		this.RESConsoleVersion = createElementWithID('div','RESConsoleVersion');
		$(this.RESConsoleVersion).text('v' + RESVersion);
		RESConsoleTopBar.appendChild(this.RESConsoleVersion);
		var RESSubredditLink = createElementWithID('a','RESConsoleSubredditLink');
		$(RESSubredditLink).text('/r/Enhancement');
		RESSubredditLink.setAttribute('href','http://reddit.com/r/Enhancement');
		RESSubredditLink.setAttribute('alt','The RES Subreddit');
		RESConsoleTopBar.appendChild(RESSubredditLink);
		// create the close button and place it in the header
		var RESClose = createElementWithID('span', 'RESClose', 'RESCloseButton');
		$(RESClose).text('X');
		RESClose.addEventListener('click',function(e) {
			e.preventDefault();
			RESConsole.close();
		}, true);
		RESConsoleTopBar.appendChild(RESClose);
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
			$(thisMenuItem).text(menuItems[i]);
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
	drawConfigPanel: function(category) {
		category = category || this.categories[0];
		$(this.RESConsoleConfigPanel).html('');
		this.RESConfigPanelSelector = createElementWithID('select', 'RESConfigPanelSelector');
		var thisOption = document.createElement('option');
		thisOption.setAttribute('value','');
		$(thisOption).text('Select Module');
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
			$(thisOption).html(modules[thisModule].moduleName);
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
			$(thisModuleButton).text(modules[thisModule].moduleName);
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
		$(this.RESConfigPanelOptions).html('<h1>RES Module Configuration</h1> Select a module from the column at the left to enable or disable it, and configure its various options.');
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
				$(thisOptionFormEle).html(escapeHTML(optionObject.value));
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
				var thisOptionFormEle = RESUtils.toggleButton(optionName, optionObject.value, null, null, isTable);
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
		$(this.RESConfigPanelOptions).html('');
		// put in the description, and a button to enable/disable the module, first..
		var thisHeader = document.createElement('div');
		addClass(thisHeader, 'moduleHeader');
		$(thisHeader).html('<span class="moduleName">' + modules[moduleID].moduleName + '</span>');
		var thisToggle = document.createElement('div');
		addClass(thisToggle,'moduleToggle');
		if (moduleID == 'dashboard') thisToggle.style.display = 'none';
		$(thisToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
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
		$(thisDescription).html(modules[moduleID].description);
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
				$(thisLabel).text(i);
				var thisOptionDescription = createElementWithID('div', null, 'optionDescription');
				$(thisOptionDescription).html(thisOptions[i].description);
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
							$(thisTH).text(thisOptions[i].fields[j].name);
							thisTableHeader.appendChild(thisTH);
						}
						// add delete column
						thisTH = document.createElement('th');
						$(thisTH).text('delete');
						thisTableHeader.appendChild(thisTH);
						thisThead.appendChild(thisTableHeader);
						thisTable.appendChild(thisThead);
						var thisTbody = document.createElement('tbody');
						thisTbody.setAttribute('id','tbody_'+i);
						for (var j=0;j<thisOptions[i].value.length;j++) {
							var thisTR = document.createElement('tr');
							for (var k=0;k<thisOptions[i].fields.length;k++) {
								var thisTD = document.createElement('td');
								thisTD.className = 'hasTableOption';
								var thisOpt = thisOptions[i].fields[k];
								var thisFullOpt = i + '_' + thisOptions[i].fields[k].name;
								thisOpt.value = thisOptions[i].value[j][k];
								// var thisOptInputName = thisOpt.name + '_' + j;
								var thisOptInputName = thisFullOpt + '_' + j;
								var thisTableEle = this.drawOptionInput(moduleID, thisOptInputName, thisOpt, true);
								thisTD.appendChild(thisTableEle);
								thisTR.appendChild(thisTD);
							}
							// add delete button <span class="deleteButton"></span>
							thisTD = document.createElement('td');
							var thisDeleteButton = document.createElement('div');
							thisDeleteButton.className = 'deleteButton';
							thisDeleteButton.addEventListener('click', RESConsole.deleteOptionRow);
							thisTD.appendChild(thisDeleteButton);
							thisTR.appendChild(thisTD);
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
							newCell.className = 'hasTableOption';
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
						// add delete button
						thisTD = document.createElement('td');
						var thisDeleteButton = document.createElement('div');
						thisDeleteButton.className = 'deleteButton';
						thisDeleteButton.addEventListener('click', RESConsole.deleteOptionRow);
						thisTD.appendChild(thisDeleteButton);
						newRow.appendChild(thisTD);
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
			$(this.keyCodeModal).text('Press a key (or combination with shift, alt and/or ctrl) to assign this action.');
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
			$(noOptions).text('There are no configurable options for this module');
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
	deleteOptionRow: function(e) {
		var thisRow = e.target.parentNode.parentNode;
		$(thisRow).remove();
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
						var cells = thisRows[j].querySelectorAll('td.hasTableOption');
						var notAllBlank = false;
						for (var k=0; k<cells.length; k++) {
							var inputs = cells[k].querySelectorAll('input[tableOption=true], textarea[tableOption=true]');
							var optionValue = null;
							for (var l=0;l<inputs.length;l++) {
								// get the module name out of the input's moduleid attribute
								// var moduleID = inputs[l].getAttribute('moduleID');
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
							if (optionValue || notAllBlank) {
								optionRow.push(optionValue);
							}
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
			$(statusEle).text('Options have been saved...');
			statusEle.setAttribute('style','display: block; opacity: 1');
		}
		RESUtils.fadeElementOut(statusEle, 0.1)
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
		<p>Description: Reddit Enhancement Suite is a collection of modules that makes browsing reddit a whole lot easier.</p> \
		<p>It\'s built with <a target="_blank" href="http://redditenhancementsuite.com/api">an API</a> that allows you to contribute and include your own modules!</p> \
		<p>If you\'ve got bug reports or issues with RES, please see the <a target="_blank" href="http://www.reddit.com/r/RESIssues/">RESIssues</a> subreddit. If you\'d like to follow progress on RES, or you\'d like to converse with other users, please see the <a target="_blank" href="http://www.reddit.com/r/Enhancement/">Enhancement subreddit.</a> </p> \
		<p>If you want to contact me directly with suggestions, bug reports or just want to say you appreciate the work, an <a href="mailto:steve@honestbleeps.com">email</a> would be great.</p> \
		<p>License: Reddit Enhancement Suite is released under the <a target="_blank" href="http://www.gnu.org/licenses/gpl-3.0.html">GPL v3.0</a>.</p> \
		<p><strong>Note:</strong> Reddit Enhancement Suite will check, at most once a day, to see if a new version is available.  No data about you is sent to me nor is it stored.</p> \
	</div> \
	<div id="RESTeam" class="aboutPanel"> \
		<h3>About the RES Team</h3> \
		<p>Steve Sobel (<a target="_blank" href="http://www.reddit.com/user/honestbleeps/">honestbleeps</a>) is the primary developer of RES.  Beyond that, there are a number of people who have contributed code, design and/or great ideas to RES.  To read more about the RES team, visit <a target="_blank" href="http://redditenhancementsuite.com/about.html">the RES website.</a></p> \
	</div> \
</div> \
		'
		$(RESConsoleAboutPanel).html(AboutPanelHTML);
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
		$(proPanelHeader).html('RES Pro allows you to save your preferences to the RES Pro server.<br><br><strong>Please note:</strong> this is beta functionality right now. Please don\'t consider this to be a "backup" solution just yet. To start, you will need to <a target="_blank" href="http://redditenhancementsuite.com/register.php">register for a PRO account</a> first, then email <a href="mailto:steve@honestbleeps.com">steve@honestbleeps.com</a> with your RES Pro username to get access.');
		RESConsoleProPanel.appendChild(proPanelHeader);
		this.proSetupButton = createElementWithID('div','RESProSetup');
		this.proSetupButton.setAttribute('class','RESButton');
		$(this.proSetupButton).text('Configure RES Pro');
		this.proSetupButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].configure();
		}, false);
		RESConsoleProPanel.appendChild(this.proSetupButton);
		/*
		this.proAuthButton = createElementWithID('div','RESProAuth');
		this.proAuthButton.setAttribute('class','RESButton');
		$(this.proAuthButton).html('Authenticate');
		this.proAuthButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].authenticate();
		}, false);
		RESConsoleProPanel.appendChild(this.proAuthButton);
		*/
		this.proSaveButton = createElementWithID('div','RESProSave');
		this.proSaveButton.setAttribute('class','RESButton');
		$(this.proSaveButton).text('Save Module Options');
		this.proSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].savePrefs();
			modules['RESPro'].authenticate(modules['RESPro'].savePrefs());
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveButton);

		/*
		this.proUserTaggerSaveButton = createElementWithID('div','RESProSave');
		this.proUserTaggerSaveButton.setAttribute('class','RESButton');
		$(this.proUserTaggerSaveButton).html('Save user tags to Server');
		this.proUserTaggerSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			modules['RESPro'].saveModuleData('userTagger');
		}, false);
		RESConsoleProPanel.appendChild(this.proUserTaggerSaveButton);
		*/

		this.proSaveCommentsSaveButton = createElementWithID('div','RESProSaveCommentsSave');
		this.proSaveCommentsSaveButton.setAttribute('class','RESButton');
		$(this.proSaveCommentsSaveButton).text('Save saved comments to Server');
		this.proSaveCommentsSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].saveModuleData('saveComments');
			modules['RESPro'].authenticate(modules['RESPro'].saveModuleData('saveComments'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveCommentsSaveButton);
		
		this.proSubredditManagerSaveButton = createElementWithID('div','RESProSubredditManagerSave');
		this.proSubredditManagerSaveButton.setAttribute('class','RESButton');
		$(this.proSubredditManagerSaveButton).text('Save subreddits to server');
		this.proSubredditManagerSaveButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].saveModuleData('SubredditManager');
			modules['RESPro'].authenticate(modules['RESPro'].saveModuleData('subredditManager'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSubredditManagerSaveButton);
		
		this.proSaveCommentsGetButton = createElementWithID('div','RESProGetSavedComments');
		this.proSaveCommentsGetButton.setAttribute('class','RESButton');
		$(this.proSaveCommentsGetButton).text('Get saved comments from Server');
		this.proSaveCommentsGetButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].getModuleData('saveComments');
			modules['RESPro'].authenticate(modules['RESPro'].getModuleData('saveComments'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSaveCommentsGetButton);

		this.proSubredditManagerGetButton = createElementWithID('div','RESProGetSubredditManager');
		this.proSubredditManagerGetButton.setAttribute('class','RESButton');
		$(this.proSubredditManagerGetButton).text('Get subreddits from Server');
		this.proSubredditManagerGetButton.addEventListener('click', function(e) {
			e.preventDefault();
			// modules['RESPro'].getModuleData('SubredditManager');
			modules['RESPro'].authenticate(modules['RESPro'].getModuleData('subredditManager'));
		}, false);
		RESConsoleProPanel.appendChild(this.proSubredditManagerGetButton);
		
		this.proGetButton = createElementWithID('div','RESProGet');
		this.proGetButton.setAttribute('class','RESButton');
		$(this.proGetButton).text('Get options from Server');
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


/************************************************************************************************************

Creating your own module:

Modules must have the following format, with required functions:
- moduleID - the name of the module, i.e. myModule
- moduleName - a "nice name" for your module...
- description - for the config panel, explains what the module is
- isEnabled - should always return RESConsole.getModulePrefs('moduleID') - where moduleID is your module name.
- isMatchURL - should always return RESUtils.isMatchURL('moduleID') - checks your include and exclude URL matches.
- include - an array of regexes to match against location.href (basically like include in GM)
- exclude (optional) - an array of regexes to exclude against location.href
- go - always checks both if isEnabled() and if RESUtils.isMatchURL(), and if so, runs your main code.

modules['myModule'] = {
	moduleID: 'myModule',
	moduleName: 'my module',
	category: 'CategoryName',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		defaultMessage: {
			type: 'text',
			value: 'this is default text',
			description: 'explanation of what this option is for'
		},
		doSpecialStuff: {
			type: 'boolean',
			value: false,
			description: 'explanation of what this option is for'
		}
	},
	description: 'This is my module!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/http:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i,
		/http:\/\/([a-z]+).reddit.com\/message\/comments\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
		}
	}
}; // note: you NEED this semicolon at the end!

************************************************************************************************************/


modules['subRedditTagger'] = {
	moduleID: 'subRedditTagger',
	moduleName: 'Subreddit Tagger',
	category: 'Filters',
	options: {
		subReddits: {
			type: 'table',
			addRowText: '+add tag',
			fields: [
				{ name: 'subreddit', type: 'text' },
				{ name: 'doesntContain', type: 'text' },
				{ name: 'tag', type: 'text' }
			],
			value: [
				/*
				['somebodymakethis','SMT','[SMT]'],
				['pics','pic','[pic]']
				*/
			],
			description: 'Set your subreddits below. For that subreddit, if the title of the post doesn\'t contain what you place in the "doesn\'t contain" field, the subreddit will be tagged with whatever you specify.'
		}
	},
	description: 'Adds tags to posts on subreddits (i.e. [SMT] on SomebodyMakeThis when the user leaves it out)',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			this.checkForOldSettings();
			this.SRTDoesntContain = [];
			this.SRTTagWith = [];
			this.loadSRTRules();
			
			RESUtils.watchForElement('siteTable', modules['subRedditTagger'].scanTitles);
			this.scanTitles();
			
		}
	},
	loadSRTRules: function () {
		var subReddits = this.options.subReddits.value;
		for (var i=0, len=subReddits.length; i<len; i++) {
			var thisGetArray = subReddits[i];
			if (thisGetArray) {
				modules['subRedditTagger'].SRTDoesntContain[thisGetArray[0].toLowerCase()] = thisGetArray[1];
				modules['subRedditTagger'].SRTTagWith[thisGetArray[0].toLowerCase()] = thisGetArray[2];
			}
		}
	},
	scanTitles: function(obj) {
		var qs = '#siteTable > .thing > DIV.entry';
		if (obj) {
			qs = '.thing > DIV.entry';
		} else {
			obj = document;
		}
		var entries = obj.querySelectorAll(qs);
		for (var i=0, len=entries.length; i<len;i++) {
			var thisSubRedditEle = entries[i].querySelector('A.subreddit');
			if ((typeof(thisSubRedditEle) != 'undefined') && (thisSubRedditEle != null)) {
				var thisSubReddit = thisSubRedditEle.innerHTML.toLowerCase();
				if (typeof(modules['subRedditTagger'].SRTDoesntContain[thisSubReddit]) != 'undefined') {
					var thisTitle = entries[i].querySelector('a.title');
					if (!(hasClass(thisTitle, 'srTagged'))) {
						addClass(thisTitle, 'srTagged');
						var thisString = modules['subRedditTagger'].SRTDoesntContain[thisSubReddit];
						var thisTagWith = modules['subRedditTagger'].SRTTagWith[thisSubReddit];
						if (thisTitle.text.indexOf(thisString) == -1) {
							$(thisTitle).html(escapeHTML(thisTagWith) + ' ' + thisTitle.textContent);
						}
					}
				}
			}
		}
	},
	checkForOldSettings: function() {
		var settingsCopy = [];
		var subRedditCount = 0;
		while (RESStorage.getItem('subreddit_' + subRedditCount)) {
			var thisGet = RESStorage.getItem('subreddit_' + subRedditCount).replace(/\"/g,"");
			var thisGetArray = thisGet.split("|");
			settingsCopy[subRedditCount] = thisGetArray;
			RESStorage.removeItem('subreddit_' + subRedditCount);
			subRedditCount++;
		}
		if (subRedditCount > 0) {
			RESUtils.setOption('subRedditTagger', 'subReddits', settingsCopy);
		}
	}

}; 


modules['uppersAndDowners'] = {
	moduleID: 'uppersAndDowners',
	moduleName: 'Uppers and Downers Enhanced',
	category: 'UI',
	options: {
		showSigns: {
			type: 'boolean',
			value: false,
			description: 'Show +/- signs next to upvote/downvote tallies.'
		},
		applyToLinks: {
			type: 'boolean',
			value: true,
			description: 'Uppers and Downers on links.'
		},
		postUpvoteStyle: {
			type: 'text',
			value: 'color:rgb(255, 139, 36); font-weight:normal;',
			description: 'CSS style for post upvotes'
		},
		postDownvoteStyle: {
			type: 'text',
			value: 'color:rgb(148, 148, 255); font-weight:normal;',
			description: 'CSS style for post upvotes'
		},
		commentUpvoteStyle: {
			type: 'text',
			value: 'color:rgb(255, 139, 36); font-weight:bold;',
			description: 'CSS style for comment upvotes'
		},
		commentDownvoteStyle: {
			type: 'text',
			value: 'color:rgb(148, 148, 255); font-weight:bold;',
			description: 'CSS style for comment upvotes'
		},
		forceVisible: {
			type: 'boolean',
			value: false,
			description: 'Force upvote/downvote counts to be visible (when subreddit CSS tries to hide them)'
		}
	},
	description: 'Displays up/down vote counts on comments.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/?(?:\??[\w]+=[\w]+&?)*/i,
		/https?:\/\/([a-z]+).reddit.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i,
		/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// added code to force inline-block and opacity: 1 to prevent CSS from hiding .res_* classes...
			var forceVisible = (this.options.forceVisible.value) ? '; visibility: visible !important; opacity: 1 !important; display: inline-block !important;' : '';
			var css = '.res_comment_ups { '+this.options.commentUpvoteStyle.value+forceVisible+' } .res_comment_downs { '+this.options.commentDownvoteStyle.value+forceVisible+' }';
			css += '.res_post_ups { '+this.options.postUpvoteStyle.value+forceVisible+' } .res_post_downs { '+this.options.postDownvoteStyle.value+forceVisible+' }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get rid of the showTimeStamp options since Reddit now has this feature natively.
			if (typeof(this.options.showTimestamp) != 'undefined') {
				delete this.options.showTimestamp;
				RESStorage.setItem('RESoptions.uppersAndDowners', JSON.stringify(modules['uppersAndDowners'].options));
			}
			if (RESUtils.pageType() == 'comments') {
				this.commentsWithMoos = [];
				this.moreCommentsIDs = [];
				this.applyUppersAndDownersToComments();
				RESUtils.watchForElement('newComments', modules['uppersAndDowners'].applyUppersAndDownersToComments);
			} else if (RESUtils.pageType() == 'profile') {
				this.commentsWithMoos = [];
				this.moreCommentsIDs = [];
				this.applyUppersAndDownersToMixed();
				RESUtils.watchForElement('siteTable', modules['uppersAndDowners'].applyUppersAndDownersToMixed);

			} else if ((RESUtils.pageType() == 'linklist') && (this.options.applyToLinks.value)) {
				this.linksWithMoos = [];
				this.applyUppersAndDownersToLinks();
				RESUtils.watchForElement('siteTable', modules['uppersAndDowners'].applyUppersAndDownersToLinks);
			}
		}
	},
	applyUppersAndDownersToComments: function(ele) {
		if (!ele) {
			ele = document.body;
		} 
		if (hasClass(ele,'comment')) {
			modules['uppersAndDowners'].showUppersAndDownersOnComment(ele);
		} else {
			var allComments = ele.querySelectorAll('div.comment');
			RESUtils.forEachChunked(allComments, 15, 1000, function(comment, i, array) {
				modules['uppersAndDowners'].showUppersAndDownersOnComment(comment);
			});
		}
	},
	applyUppersAndDownersToMixed: function(ele) {
		ele = ele || document.body;
		var linkList = ele.querySelectorAll('div.thing.link, div.thing.comment');
		var displayType = 'regular';
		if (modules['uppersAndDowners'].options.showSigns.value) {
			var thisPlus = '+';
			var thisMinus = '-';
		} else {
			var thisPlus = '';
			var thisMinus = '';
		}
		for (var i=0, len=linkList.length; i<len; i++) {
			if (hasClass(linkList[i], 'link')) {
				var thisups = linkList[i].getAttribute('data-ups');
				var thisdowns = linkList[i].getAttribute('data-downs');

				var thisTagline = linkList[i].querySelector('p.tagline');
				// Check if compressed link display or regular...
				if ((typeof(thisTagline) != 'undefined') && (thisTagline != null)) {
					var upsAndDownsEle = $("<span> (<span class='res_post_ups'>"+thisPlus+thisups+"</span>|<span class='res_post_downs'>"+thisMinus+thisdowns+"</span>) </span>");
					if (displayType == 'regular') {
						// thisTagline.insertBefore(upsAndDownsEle, thisTagline.firstChild);
						$(thisTagline).prepend(upsAndDownsEle);
					} else {
						$(thisTagline).after(upsAndDownsEle);
					}
				}
			} else {
				modules['uppersAndDowners'].showUppersAndDownersOnComment(linkList[i]);
			}
		}

	},
	showUppersAndDownersOnComment: function(commentEle) {
		if (commentEle.getAttribute('data-votesvisible') == 'true') return;
		commentEle.setAttribute('data-votesvisible', 'true');
		var tagline = commentEle.querySelector('p.tagline');
		var ups = commentEle.getAttribute('data-ups');
		var downs = commentEle.getAttribute('data-downs');
		var openparen, closeparen, mooups, moodowns, voteUps, voteDowns, pipe;
		var frag = document.createDocumentFragment(); //using a fragment speeds this up by a factor of about 2


		if (modules['uppersAndDowners'].options.showSigns.value) {
			ups = '+'+ups;
			downs = '-'+downs;
		}

		openparen = document.createTextNode(" (");
		frag.appendChild(openparen);

		mooups = document.createElement("span");
		mooups.className = "res_comment_ups";
		voteUps = document.createTextNode(ups);

		mooups.appendChild(voteUps);
		frag.appendChild(mooups);

		pipe = document.createTextNode("|");
		tagline.appendChild(pipe);

		moodowns = document.createElement("span");
		moodowns.className = "res_comment_downs";

		voteDowns = document.createTextNode(downs);
		moodowns.appendChild(voteDowns);

		frag.appendChild(moodowns);

		closeparen = document.createTextNode(")");
		frag.appendChild(closeparen);

		frag.appendChild(openparen);
		frag.appendChild(mooups);
		frag.appendChild(pipe);
		frag.appendChild(moodowns);
		frag.appendChild(closeparen);

		tagline.appendChild(frag);
	},
	applyUppersAndDownersToLinks: function(ele) {
		// Since we're dealing with max 100 links at a time, we don't need a chunker here...
		ele = ele || document.body;
		var linkList = ele.querySelectorAll('div.thing.link');
		var displayType = 'regular';
		if (modules['uppersAndDowners'].options.showSigns.value) {
			var thisPlus = '+';
			var thisMinus = '-';
		} else {
			var thisPlus = '';
			var thisMinus = '';
		}
		for (var i=0, len=linkList.length; i<len; i++) {
			var thisups = linkList[i].getAttribute('data-ups');
			var thisdowns = linkList[i].getAttribute('data-downs');

			var thisTagline = linkList[i].querySelector('p.tagline');
			// Check if compressed link display or regular...
			if ((typeof(thisTagline) != 'undefined') && (thisTagline != null)) {
				var upsAndDownsEle = $("<span> (<span class='res_post_ups'>"+thisPlus+thisups+"</span>|<span class='res_post_downs'>"+thisMinus+thisdowns+"</span>) </span>");
				if (displayType == 'regular') {
					// thisTagline.insertBefore(upsAndDownsEle, thisTagline.firstChild);
					$(thisTagline).prepend(upsAndDownsEle);
				} else {
					$(thisTagline).after(upsAndDownsEle);
				}
			}
		}
	}
};

modules['keyboardNav'] = {
	moduleID: 'keyboardNav',
	moduleName: 'Keyboard Navigation',
	category: 'UI',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		focusBorder: {
			type: 'text',
			value: '1px dashed #888888', 
			description: 'Border style of focused element'
		},
		focusBGColor: {
			type: 'text',
			value: '#F0F3FC', 
			description: 'Background color of focused element'
		},
		focusBGColorNight: {
			type: 'text',
			value: '#666', 
			description: 'Background color of focused element in Night Mode'
 		},
 		focusFGColorNight: {
			type: 'text',
			value: '#DDD', 
			description: 'Foreground color of focused element in Night Mode'
 		},
		autoSelectOnScroll: {
			type: 'boolean',
			value: false,
			description: 'Automatically select the topmost element for keyboard navigation on window scroll'
		},
		scrollOnExpando: {
			type: 'boolean',
			value: true,
			description: 'Scroll window to top of link when expando key is used (to keep pics etc in view)'
		},
		scrollStyle: {
			type: 'enum',
			values: [
				{ name: 'directional', value: 'directional' },
				{ name: 'page up/down', value: 'page' },
				{ name: 'lock to top', value: 'top' }
			],
			value: 'directional',
			description: 'When moving up/down with keynav, when and how should RES scroll the window?'
		},
		commentsLinkNumbers: {
			type: 'boolean',
			value: true,
			description: 'Assign number keys (e.g. [1]) to links within selected comment'
		},
		commentsLinkNumberPosition: {
			type: 'boolean',
			type: 'enum',
			values: [
				{ name: 'Place on right', value: 'right' },
				{ name: 'Place on left', value: 'left' }
			],
			value: 'right',
			description: 'Which side commentsLinkNumbers are displayed'
		},
		commentsLinkNewTab: {
			type: 'boolean',
			value: true,
			description: 'Open number key links in a new tab'
		},
		clickFocus: {
			type: 'boolean',
			value: true,
			description: 'Move keyboard focus to a link or comment when clicked with the mouse'
		},
		onHideMoveDown: {
			type: 'boolean',
			value: true,
			description: 'After hiding a link, automatically select the next link'
		},
		onVoteMoveDown: {
			type: 'boolean',
			value: false,
			description: 'After voting on a link, automatically select the next link'
		},
		toggleHelp: {
			type: 'keycode',
			value: [191,false,false,true], // ? (note the true in the shift slot)
			description: 'Show help'
		},
		toggleCmdLine: {
			type: 'keycode',
			value: [190,false,false,false], // .
			description: 'Show/hide commandline box'
		},
		hide: {
			type: 'keycode',
			value: [72,false,false,false], // h
			description: 'Hide link'
		},
		moveUp: {
			type: 'keycode',
			value: [75,false,false,false], // k
			description: 'Move up (previous link or comment)'
		},
		moveDown: {
			type: 'keycode',
			value: [74,false,false,false], // j
			description: 'Move down (next link or comment)'
		},
		moveTop: {
			type: 'keycode',
			value: [75,false,false,true], // shift-k
			description: 'Move to top of list (on link pages)'
		},
		moveBottom: {
			type: 'keycode',
			value: [74,false,false,true], // shift-j
			description: 'Move to bottom of list (on link pages)'
		},
		moveUpSibling: {
			type: 'keycode',
			value: [75,false,false,true], // shift-k
			description: 'Move to previous sibling (in comments) - skips to previous sibling at the same depth.'
		},
		moveDownSibling: {
			type: 'keycode',
			value: [74,false,false,true], // shift-j
			description: 'Move to next sibling (in comments) - skips to next sibling at the same depth.'
		},
		moveUpThread: {
			type: 'keycode',
			value: [75,true,false,true], // shift-alt-k
			description: 'Move to the topmost comment of the previous thread (in comments).'
		},
		moveDownThread: {
			type: 'keycode',
			value: [74,true,false,true], // shift-alt-j
			description: 'Move to the topmost comment of the next thread (in comments).'
		},
		moveToTopComment: {
			type: 'keycode',
			value: [84,false,false,false], // t
			description: 'Move to the topmost comment of the current thread (in comments).'
		},
		moveToParent: {
			type: 'keycode',
			value: [80,false,false,false], // p
			description: 'Move to parent (in comments).'
		},
		followLink: {
			type: 'keycode',
			value: [13,false,false,false], // enter
			description: 'Follow link (hold shift to open it in a new tab) (link pages only)'
		},
		followLinkNewTab: {
			type: 'keycode',
			value: [13,false,false,true], // shift-enter
			description: 'Follow link in new tab (link pages only)'
		},
		followLinkNewTabFocus: {
			type: 'boolean',
			value: true,
			description: 'When following a link in new tab - focus the tab?'
		},
		toggleExpando: {
			type: 'keycode',
			value: [88,false,false,false], // x
			description: 'Toggle expando (image/text/video) (link pages only)'
		},
		previousGalleryImage: {
			type: 'keycode',
			value: [219, false, false, false], //[
			description: 'View the previous image of an inline gallery.'
		},
		nextGalleryImage: {
			type: 'keycode',
			value: [221, false, false, false], //]
			description: 'View the next image of an inline gallery.'
		},
		toggleViewImages: {
			type: 'keycode',
			value: [88,false,false,true], // shift-x
			description: 'Toggle "view images" button'
		},
		toggleChildren: {
			type: 'keycode',
			value: [13,false,false,false], // enter
			description: 'Expand/collapse comments (comments pages only)'
		},
		followComments: {
			type: 'keycode',
			value: [67,false,false,false], // c
			description: 'View comments for link (shift opens them in a new tab)'
		},
		followCommentsNewTab: {
			type: 'keycode',
			value: [67,false,false,true], // shift-c
			description: 'View comments for link in a new tab'
		},
		followLinkAndCommentsNewTab: {
			type: 'keycode',
			value: [76,false,false,false], // l
			description: 'View link and comments in new tabs'
		},
		followLinkAndCommentsNewTabBG: {
			type: 'keycode',
			value: [76,false,false,true], // shift-l
			description: 'View link and comments in new background tabs'
		},
		upVote: {
			type: 'keycode',
			value: [65,false,false,false], // a
			description: 'Upvote selected link or comment'
		},
		downVote: {
			type: 'keycode',
			value: [90,false,false,false], // z
			description: 'Downvote selected link or comment'
		},
		save: {
			type: 'keycode',
			value: [83,false,false,false], // s
			description: 'Save the current link'
		},
		reply: {
			type: 'keycode',
			value: [82,false,false,false], // r
			description: 'Reply to current comment (comment pages only)'
		},
		followSubreddit: {
			type: 'keycode',
			value: [82,false,false,false], // r
			description: 'Go to subreddit of selected link (link pages only)'
		},
		followSubredditNewTab: {
			type: 'keycode',
			value: [82,false,false,true], // shift-r
			description: 'Go to subreddit of selected link in a new tab (link pages only)'
		},
		inbox: {
			type: 'keycode',
			value: [73,false,false,false], // i
			description: 'Go to inbox'
		},
		inboxNewTab: {
			type: 'keycode',
			value: [73,false,false,true], // shift+i
			description: 'Go to inbox in a new tab'
		},
		frontPage: {
			type: 'keycode',
			value: [70,false,false,false], // f
			description: 'Go to front page'
		},
		subredditFrontPage: {
			type: 'keycode',
			value: [70,false,false,true], // shift-f
			description: 'Go to subreddit front page'
		},
		nextPage: {
			type: 'keycode',
			value: [78,false,false,false], // n
			description: 'Go to next page (link list pages only)'
		},
		prevPage: {
			type: 'keycode',
			value: [80,false,false,false], // p
			description: 'Go to prev page (link list pages only)'
		},
		link1: {
			type: 'keycode',
			value: [49,false,false,false], // 1
			description: 'Open first link within comment.',
			noconfig: true
		},
		link2: {
			type: 'keycode',
			value: [50,false,false,false], // 2
			description: 'Open link #2 within comment.',
			noconfig: true
		},
		link3: {
			type: 'keycode',
			value: [51,false,false,false], // 3
			description: 'Open link #3 within comment.',
			noconfig: true
		},
		link4: {
			type: 'keycode',
			value: [52,false,false,false], // 4
			description: 'Open link #4 within comment.',
			noconfig: true
		},
		link5: {
			type: 'keycode',
			value: [53,false,false,false], // 5
			description: 'Open link #5 within comment.',
			noconfig: true
		},
		link6: {
			type: 'keycode',
			value: [54,false,false,false], // 6
			description: 'Open link #6 within comment.',
			noconfig: true
		},
		link7: {
			type: 'keycode',
			value: [55,false,false,false], // 7
			description: 'Open link #7 within comment.',
			noconfig: true
		},
		link8: {
			type: 'keycode',
			value: [56,false,false,false], // 8
			description: 'Open link #8 within comment.',
			noconfig: true
		},
		link9: {
			type: 'keycode',
			value: [57,false,false,false], // 9
			description: 'Open link #9 within comment.',
			noconfig: true
		},
		link10: {
			type: 'keycode',
			value: [48,false,false,false], // 0
			description: 'Open link #10 within comment.',
			noconfig: true
		}
	},
	description: 'Keyboard navigation for reddit!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var focusBorder, focusFGColorNight, focusBGColor, focusBGColorNight;
			if (typeof(this.options.focusBorder) == 'undefined') {
				focusBorder = '1px dashed #888888';
			} else {
				focusBorder = this.options.focusBorder.value;
			}
			if (typeof(this.options.focusBGColor) == 'undefined') {
				focusBGColor = '#F0F3FC';
			} else {
				focusBGColor = this.options.focusBGColor.value;
			}
			if (!(this.options.focusBGColorNight.value)) {
				focusBGColorNight = '#666';
			} else {
				focusBGColorNight = this.options.focusBGColorNight.value;
			}
			if (!(this.options.focusFGColorNight.value)) {
				focusFGColorNight = '#DDD';
			} else {
				focusFGColorNight = this.options.focusFGColorNight.value;
			}

			var borderType = 'outline';
			if (typeof(opera) != 'undefined') borderType = 'border';
			RESUtils.addCSS(' \
				.keyHighlight { '+borderType+': '+focusBorder+'; background-color: '+focusBGColor+'; } \
				.res-nightmode .keyHighlight, .res-nightmode .keyHighlight .usertext-body, .res-nightmode .keyHighlight .usertext-body .md, .res-nightmode .keyHighlight .usertext-body .md p, .res-nightmode .keyHighlight .noncollapsed, .res-nightmode .keyHighlight .noncollapsed .md, .res-nightmode .keyHighlight .noncollapsed .md p { background-color: '+focusBGColorNight+' !important; color: '+focusFGColorNight+' !important;} \
				.res-nightmode .keyHighlight a.title:first-of-type {color: ' + focusFGColorNight + ' !important; } \
				#keyHelp { display: none; position: fixed; height: 90%; overflow-y: auto; right: 20px; top: 20px; z-index: 1000; border: 2px solid #AAAAAA; border-radius: 5px 5px 5px 5px; -moz-border-radius: 5px 5px 5px 5px; -webkit-border-radius: 5px 5px 5px 5px; width: 300px; padding: 5px; background-color: #ffffff; } \
				#keyHelp th { font-weight: bold; padding: 2px; border-bottom: 1px dashed #dddddd; } \
				#keyHelp td { padding: 2px; border-bottom: 1px dashed #dddddd; } \
				#keyHelp td:first-child { width: 70px; } \
				#keyCommandLineWidget { font-size: 14px; display: none; position: fixed; top: 200px; left: 50%; margin-left: -275px; z-index: 9999; width: 550px; border: 3px solid #555555; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; padding: 10px; background-color: #333333; color: #CCCCCC; opacity: 0.95; } \
				#keyCommandInput { width: 240px; background-color: #999999; margin-right: 10px; } \
				#keyCommandInputTip { margin-top: 5px; color: #99FF99; } \
				#keyCommandInputTip ul { font-size: 11px; list-style-type: disc; }  \
				#keyCommandInputTip li { margin-left: 15px; }  \
				#keyCommandInputError { margin-top: 5px; color: red; font-weight: bold; } \
				.keyNavAnnotation { font-size: 9px; position: relative; top: -6px; } \
			');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			// get rid of antequated option we've removed
			this.keyboardNavLastIndexCache = safeJSON.parse(RESStorage.getItem('RESmodules.keyboardNavLastIndex'), false, true);
			if (! this.keyboardNavLastIndexCache) {
				// this is a one time function to delete old keyboardNavLastIndex junk.
				this.keyboardNavLastIndexCache = {};
				var now = new Date().getTime();
				for (idx in RESStorage) {
					if (idx.match(/keyboardNavLastIndex/)) {
						var url = idx.replace('RESmodules.keyboardNavLastIndex.','');
						this.keyboardNavLastIndexCache[url] = {
							index: RESStorage[idx],
							updated: now
						}
						RESStorage.removeItem(idx);
					}
				}
				this.keyboardNavLastIndexCache.lastScan = now;
				RESStorage.setItem('RESmodules.keyboardNavLastIndex', JSON.stringify(this.keyboardNavLastIndexCache));
			} else {
				// clean cache every 6 hours - delete any urls that haven't been visited in an hour.
				var now = new Date().getTime();
				if ((typeof(this.keyboardNavLastIndexCache.lastScan) == 'undefined') || (now - this.keyboardNavLastIndexCache.lastScan > 21600000)) {
					for (idx in this.keyboardNavLastIndexCache) {
						if ((typeof(this.keyboardNavLastIndexCache[idx]) == 'object') && (now - this.keyboardNavLastIndexCache[idx].updated > 3600000)) {
							delete this.keyboardNavLastIndexCache[idx];
						}
					}
					this.keyboardNavLastIndexCache.lastScan = now;
					RESStorage.setItem('RESmodules.keyboardNavLastIndex', JSON.stringify(this.keyboardNavLastIndexCache));
				}
			}

			if (this.options.autoSelectOnScroll.value) {
				window.addEventListener('scroll', modules['keyboardNav'].handleScroll, false);
			}
			if (typeof(this.options.scrollTop) != 'undefined') {
				if (this.options.scrollTop.value) this.options.scrollStyle.value = 'top';
				delete this.options.scrollTop;
				RESStorage.setItem('RESoptions.keyboardNav', JSON.stringify(modules['keyboardNav'].options));
			}
			this.drawHelp();
			this.attachCommandLineWidget();
			window.addEventListener('keydown', function(e) {
				// console.log(e.keyCode);
				modules['keyboardNav'].handleKeyPress(e);
			}, true);
			this.scanPageForKeyboardLinks();
			// listen for new DOM nodes so that modules like autopager, never ending reddit, "load more comments" etc still get keyboard nav.
			if (RESUtils.pageType() == 'comments') {
				RESUtils.watchForElement('newComments', modules['keyboardNav'].scanPageForNewKeyboardLinks);
			} else {
				RESUtils.watchForElement('siteTable', modules['keyboardNav'].scanPageForNewKeyboardLinks);
			}
		}
	},
	scanPageForNewKeyboardLinks: function() {
		modules['keyboardNav'].scanPageForKeyboardLinks(true);
	},
	setKeyIndex: function() {
		var trimLoc = location.href;
		// remove any trailing slash from the URL
		if (trimLoc.substr(-1) == '/') trimLoc = trimLoc.substr(0,trimLoc.length-1);
		if (typeof(this.keyboardNavLastIndexCache[trimLoc]) == 'undefined') {
			this.keyboardNavLastIndexCache[trimLoc] = {};
		}
		var now = new Date().getTime();
		this.keyboardNavLastIndexCache[trimLoc] = {
			index: this.activeIndex,
			updated: now
		}
		RESStorage.setItem('RESmodules.keyboardNavLastIndex', JSON.stringify(this.keyboardNavLastIndexCache));
	},
	handleScroll: function(e) {
		if (modules['keyboardNav'].scrollTimer) clearTimeout(modules['keyboardNav'].scrollTimer);
		modules['keyboardNav'].scrollTimer = setTimeout(modules['keyboardNav'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function() {
		if ((! modules['keyboardNav'].recentKeyPress) && (! RESUtils.elementInViewport(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]))) {
			for (var i=0, len=modules['keyboardNav'].keyboardLinks.length; i<len; i++) {
				if (RESUtils.elementInViewport(modules['keyboardNav'].keyboardLinks[i])) {
					modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
					modules['keyboardNav'].activeIndex = i;
					modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
					break;
				}
			}
		}
	},
	attachCommandLineWidget: function() {
		this.commandLineWidget = createElementWithID('div','keyCommandLineWidget');
		this.commandLineInput = createElementWithID('input','keyCommandInput');
		this.commandLineInput.setAttribute('type','text');
		this.commandLineInput.addEventListener('blur', function(e) {
			modules['keyboardNav'].toggleCmdLine(false);
		}, false);
		this.commandLineInput.addEventListener('keyup', function(e) {
			if (e.keyCode == 27) {
				// close prompt.
				modules['keyboardNav'].toggleCmdLine(false);
			} else {
				// auto suggest?
				modules['keyboardNav'].cmdLineHelper(e.target.value);
			}
		}, false);
		this.commandLineInputTip = createElementWithID('div','keyCommandInputTip');
		this.commandLineInputError = createElementWithID('div','keyCommandInputError');

		/*
		this.commandLineSubmit = createElementWithID('input','keyCommandInput');
		this.commandLineSubmit.setAttribute('type','submit');
		this.commandLineSubmit.setAttribute('value','go');
		*/
		this.commandLineForm = createElementWithID('form','keyCommandForm');
		this.commandLineForm.appendChild(this.commandLineInput);
		// this.commandLineForm.appendChild(this.commandLineSubmit);
		var txt = document.createTextNode('type a command, ? for help, esc to close');
		this.commandLineForm.appendChild(txt);
		this.commandLineForm.appendChild(this.commandLineInputTip);
		this.commandLineForm.appendChild(this.commandLineInputError);
		this.commandLineForm.addEventListener('submit', modules['keyboardNav'].cmdLineSubmit, false);
		this.commandLineWidget.appendChild(this.commandLineForm);
		document.body.appendChild(this.commandLineWidget);
		
	},
	cmdLineHelper: function (val) {
		var splitWords = val.split(' ');
		var command = splitWords[0];
		splitWords.splice(0,1);
		var val = splitWords.join(' ');
		if (command.slice(0,2) == 'r/') {
			// get the subreddit name they've typed so far (anything after r/)...
			var srString = command.slice(2);
			this.cmdLineShowTip('navigate to subreddit: ' + srString);
		} else if (command.slice(0,2) == 'u/') {
			// get the user name they've typed so far (anything after u/)...
			var userString = command.slice(2);
			this.cmdLineShowTip('navigate to user profile: ' + userString);
		} else if (command.slice(0,1) == '/') {
			var srString = command.slice(1);
			this.cmdLineShowTip('sort by ([n]ew, [t]op, [h]ot, [c]ontroversial): ' + srString);
		} else if (command == 'tag') {
			if ((typeof(this.cmdLineTagUsername) == 'undefined') || (this.cmdLineTagUsername == '')) {
				var searchArea = modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex];
				var authorLink = searchArea.querySelector('a.author');
				this.cmdLineTagUsername = authorLink.innerHTML;
			}
			var str = 'tag user ' + this.cmdLineTagUsername;
			if (val) {
				str += ' as: ' + val;
			}
			this.cmdLineShowTip(str);
		} else if (command == 'user') {
			var str = 'go to profile';
			if (val) {
				str += ' for: ' + val;
			}
			this.cmdLineShowTip(str);
		} else if (command == 'sw') {
			this.cmdLineShowTip('Switch users to: ' + val);
		} else if (command == 'm') {
			this.cmdLineShowTip('View messages.');
		} else if (command == 'mm') {
			this.cmdLineShowTip('View moderator mail.');
		} else if (command == 'ls') {
			this.cmdLineShowTip('Toggle lightSwitch.');
		} else if (command == 'srstyle') {
			var str = 'toggle subreddit style';
			if (val) {
				str += ' for: ' + val;
			} else {
				if (RESUtils.currentSubreddit()) {
					str += ' for: ' + RESUtils.currentSubreddit();
				}
			}
			this.cmdLineShowTip(str);
		} else if (command == 'XHRCache') {
			this.cmdLineShowTip('clear - clear the cache (use if inline images aren\'t loading properly)');
		} else if (command.slice(0,1) == '?') {
			var str = 'Currently supported commands:';
			str += '<ul>';
			str += '<li>r/[subreddit] - navigates to subreddit</li>';
			str += '<li>/n, /t, /h or /c - goes to new, top, hot or controversial sort of current subreddit</li>';
			str += '<li>[number] - navigates to the link with that number (comments pages) or rank (link pages)</li>';
			str += '<li>tag [text] - tags author of currently selected link/comment as text</li>';
			str += '<li>sw [username] - switch users to [username]</li>';
			str += '<li>user [username] - view profile for [username]</li>';
			str += '<li>m - go to inbox</li>';
			str += '<li>mm - go to moderator mail</li>';
			str += '<li>ls - toggle lightSwitch</li>';
			str += '<li>srstyle [subreddit] [on|off] - toggle subreddit style on/off (if no subreddit is specified, uses current subreddit)</li>';
			str += '<li>RESStorage [get|set|update|remove] [key] [value] - For debug use only, you shouldn\'t mess with this unless you know what you\'re doing.</li>';
			str += '<li>XHRCache clear - manipulate the XHR cache </li>';
			str += '</ul>';
			this.cmdLineShowTip(str);
		} else {
			this.cmdLineShowTip('');
		}
	},
	cmdLineShowTip: function(str) {
		$(this.commandLineInputTip).html(str);
	},
	cmdLineShowError: function(str) {
		$(this.commandLineInputError).html(str);
	},
	toggleCmdLine: function(force) {
		var open = (((force == null) || (force == true)) && (this.commandLineWidget.style.display != 'block'))
		delete this.cmdLineTagUsername;
		if (open) {
			this.cmdLineShowError('');
			this.commandLineWidget.style.display = 'block';
			setTimeout(function() {
				modules['keyboardNav'].commandLineInput.focus();
			}, 20);
			this.commandLineInput.value = '';
		} else {
			modules['keyboardNav'].commandLineInput.blur();
			this.commandLineWidget.style.display = 'none';
		}
	},
	cmdLineSubmit: function(e) {
		e.preventDefault();
		$(modules['keyboardNav'].commandLineInputError).html('');
		var theInput = modules['keyboardNav'].commandLineInput.value;
		// see what kind of input it is:
		if (theInput.indexOf('r/') != -1) {
			// subreddit? (r/subreddit or /r/subreddit)
			theInput = theInput.replace('/r/','').replace('r/','');
			location.href = '/r/'+theInput;		
		} else if (theInput.indexOf('u/') != -1) {
			// subreddit? (r/subreddit or /r/subreddit)
			theInput = theInput.replace('/u/','').replace('u/','');
			location.href = '/u/'+theInput;		
		} else if (theInput.indexOf('/') == 0) {
			// sort...
			theInput = theInput.slice(1);
			switch (theInput) {
				case 'n':
					theInput = 'new';
					break;
				case 't':
					theInput = 'top';
					break;
				case 'h':
					theInput = 'hot';
					break;
				case 'c':
					theInput = 'controversial';
					break;
			}
			validSorts = ['new','top','hot','controversial'];
			if (validSorts.indexOf(theInput) != -1) {
				if (RESUtils.currentUserProfile()) {
					location.href = '/user/'+RESUtils.currentUserProfile()+'?sort='+theInput;
				} else if (RESUtils.currentSubreddit()) {
					location.href = '/r/'+RESUtils.currentSubreddit()+'/'+theInput;
				} else {
					location.href = '/'+theInput;
				}
			} else {
				modules['keyboardNav'].cmdLineShowError('invalid sort command - must be [n]ew, [t]op, [h]ot or [c]ontroversial');
				return false;
			}
		} else if (!(isNaN(parseInt(theInput)))) {
			if (RESUtils.pageType() == 'comments') {
				// comment link number? (integer)
				modules['keyboardNav'].commentLink(parseInt(theInput)-1);
			} else if (RESUtils.pageType() == 'linklist') {
				modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
				modules['keyboardNav'].activeIndex = parseInt(theInput) - 1;
				modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
				modules['keyboardNav'].followLink();
			}
		} else {
			var splitWords = theInput.split(' ');
			var command = splitWords[0];
			splitWords.splice(0,1);
			var val = splitWords.join(' ');
			switch (command) {
				case 'tag':
					var searchArea = modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex];
					var tagLink = searchArea.querySelector('a.userTagLink');
					if (tagLink) {
						RESUtils.click(tagLink);
						setTimeout(function() {
							if (val != '') {
								document.getElementById('userTaggerTag').value = val;
							}
						}, 20);
					}
					break;
				case 'sw':
					// switch accounts (username is required)
					if (val.length <= 1) {
						modules['keyboardNav'].cmdLineShowError('No username specified.');
						return false;
					} else {
						// first make sure the account exists...
						var accounts = modules['accountSwitcher'].options.accounts.value;
						var found = false;
						for (var i=0, len=accounts.length; i<len; i++) {
							var thisPair = accounts[i];
							if (thisPair[0] == val) {
								found = true;
							}
						}
						if (found) {
							modules['accountSwitcher'].switchTo(val);
						} else {
							modules['keyboardNav'].cmdLineShowError('No such username in accountSwitcher.');
							return false;
						}
					}
					break;
				case 'user':
					// view profile for username (username is required)
					if (val.length <= 1) {
						modules['keyboardNav'].cmdLineShowError('No username specified.');
						return false;
					} else {
						location.href = '/user/' + val;
					}
					break;
				case 'userinfo':
					// view JSON data for username (username is required)
					if (val.length <= 1) {
						modules['keyboardNav'].cmdLineShowError('No username specified.');
						return false;
					} else {
						GM_xmlhttpRequest({
							method:	"GET",
							url:	location.protocol + "//"+location.hostname+"/user/" + val + "/about.json?app=res",
							onload:	function(response) {
								alert(response.responseText);
							}
						});
					}
					break;
				case 'userbadge':
					// get CSS code for a badge for username (username is required)
					if (val.length <= 1) {
						modules['keyboardNav'].cmdLineShowError('No username specified.');
						return false;
					} else {
						GM_xmlhttpRequest({
							method:	"GET",
							url:	location.protocol + "//"+location.hostname+"/user/" + val + "/about.json?app=res",
							onload:	function(response) {
								var thisResponse = JSON.parse(response.responseText);
								var css = ', .id-t2_'+thisResponse.data.id+':before';
								alert(css);
							}
						});
					}
					break;
				case 'm':
					// go to inbox
					location.href = '/message/inbox/';
					break;
				case 'mm':
					// go to mod mail
					location.href = '/message/moderator/';
					break;
				case 'ls':
					// toggle lightSwitch
					RESUtils.click(modules['styleTweaks'].lightSwitch);
					break;
				case 'srstyle':
					// toggle subreddit style
					var sr;
					var toggleText;
					var splitWords = val.split(' ');
					if (splitWords.length == 2) {
						sr = splitWords[0];
						toggleText = splitWords[1];
					} else {
						sr = RESUtils.currentSubreddit();
						toggleText = splitWords[0];
					}
					if (!sr) {
						modules['keyboardNav'].cmdLineShowError('No subreddit specified.');
						return false;
					}
					if (toggleText == 'on') {
						toggle = true;
					} else if (toggleText == 'off') {
						toggle = false;
					} else {
						modules['keyboardNav'].cmdLineShowError('You must specify "on" or "off".');
						return false;
					}
					var action = (toggle) ? 'enabled' : 'disabled';
					modules['styleTweaks'].toggleSubredditStyle(toggle, sr);
					RESUtils.notification('Subreddit style '+action+' for subreddit: '+sr, 4000);
					break;
				case 'notification':
					// test notification
					RESUtils.notification(val, 4000);
					break;
				case 'RESStorage':
					// get or set RESStorage data
					var splitWords = val.split(' ');
					if (splitWords.length < 2) {
						modules['keyboardNav'].cmdLineShowError('You must specify "get [key]", "update [key]" or "set [key] [value]"');
					} else {
						var command = splitWords[0];
						var key = splitWords[1];
						if (splitWords.length > 2) {
							splitWords.splice(0,2);
							var value = splitWords.join(' ');
						}
						// console.log(command);
						if (command == 'get') {
							alert('Value of RESStorage['+key+']: <br><br><textarea rows="5" cols="50">' + RESStorage.getItem(key) + '</textarea>');
						} else if (command == 'update') {
							var now = new Date().getTime();
							alert('Value of RESStorage['+key+']: <br><br><textarea id="RESStorageUpdate'+now+'" rows="5" cols="50">' + RESStorage.getItem(key) + '</textarea>', function() {
								var textArea = document.getElementById('RESStorageUpdate'+now);
								if (textArea) {
									var value = textArea.value;
									RESStorage.setItem(key, value);
								}
							});
						} else if (command == 'remove') {
							RESStorage.removeItem(key);
							alert('RESStorage['+key+'] deleted');
						} else if (command == 'set') {
							RESStorage.setItem(key, value);
							alert('RESStorage['+key+'] set to:<br><br><textarea rows="5" cols="50">' + value + '</textarea>');
						} else {
							modules['keyboardNav'].cmdLineShowError('You must specify either "get [key]" or "set [key] [value]"');
						}
					}
					break;
				case 'XHRCache':
					var splitWords = val.split(' ');
					if (splitWords.length < 1) {
						modules['keyboardNav'].cmdLineShowError('Operation required [clear]');
					} else {
						switch (splitWords[0]) {
							case 'clear':
								RESUtils.xhrCache('clear');
								break;
							default:
								modules['keyboardNav'].cmdLineShowError('The only accepted operation is <tt>clear</tt>');
								break;
						}
					}
					break;
				case '?':
					// user is already looking at help... do nothing.
					return false;
					break;
				default:
					modules['keyboardNav'].cmdLineShowError('unknown command - type ? for help');
					return false;
					break;
			}
		}
		// hide the commandline tool...
		modules['keyboardNav'].toggleCmdLine(false);
	},
	scanPageForKeyboardLinks: function(isNew) {
		if (typeof(isNew) == 'undefined') {
			isNew = false;
		}
		// check if we're on a link listing (regular page, subreddit page, etc) or comments listing...
		this.pageType = RESUtils.pageType();
		switch(this.pageType) {
			case 'linklist':
			case 'profile':
				// get all links into an array...
				var siteTable = document.querySelector('#siteTable');
				var stMultiCheck = document.querySelectorAll('#siteTable');
				// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
				if (stMultiCheck.length == 2) {
					siteTable = stMultiCheck[1];
				}
				if (siteTable) {
					this.keyboardLinks = document.body.querySelectorAll('div.linklisting .entry');
					if (!isNew) {
						if ((this.keyboardNavLastIndexCache[location.href]) && (this.keyboardNavLastIndexCache[location.href].index > 0)) {
							this.activeIndex = this.keyboardNavLastIndexCache[location.href].index;
						} else {
							this.activeIndex = 0;
						}
						if ((this.keyboardNavLastIndexCache[location.href]) && (this.keyboardNavLastIndexCache[location.href].index >= this.keyboardLinks.length)) {
							this.activeIndex = 0;
						}
					}
				}
				break;
			case 'comments':
				// get all links into an array...
				this.keyboardLinks = document.body.querySelectorAll('#siteTable .entry, div.content > div.commentarea .entry');
				if (!(isNew)) {
					this.activeIndex = 0;
				}
				break;
			case 'inbox':
				var siteTable = document.querySelector('#siteTable');
				if (siteTable) {
					this.keyboardLinks = siteTable.querySelectorAll('.entry');
					this.activeIndex = 0;
				}
				break;
		}
		// wire up keyboard links for mouse clicky selecty goodness...
		if ((typeof(this.keyboardLinks) != 'undefined') && (this.options.clickFocus.value)) {
			for (var i=0, len=this.keyboardLinks.length;i<len;i++) {
				this.keyboardLinks[i].setAttribute('keyIndex', i);
				// changed parentElement to parentNode for FF3.6 compatibility.
				this.keyboardLinks[i].parentNode.addEventListener('click', (function(e) {
					var thisIndex = parseInt(this.getAttribute('keyIndex'));
					if (modules['keyboardNav'].activeIndex != thisIndex) {
						modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
						modules['keyboardNav'].activeIndex = thisIndex;
						modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
					}
				}).bind(this.keyboardLinks[i]), true);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
		}
	},
	recentKey: function() {
		modules['keyboardNav'].recentKeyPress = true;
		clearTimeout(modules['keyboardNav'].recentKey);
		modules['keyboardNav'].recentKeyTimer = setTimeout(function() {
			modules['keyboardNav'].recentKeyPress = false;
		}, 1000);
	},
	keyFocus: function(obj) {
		if ((typeof(obj) != 'undefined') && (hasClass(obj, 'keyHighlight'))) {
			return false;
		} else if (typeof(obj) != 'undefined') {
			addClass(obj, 'keyHighlight');
			if ((this.pageType == 'linklist') || (this.pageType == 'profile')) {
				this.setKeyIndex();
			}
			if ((this.pageType == 'comments') && (this.options.commentsLinkNumbers.value)) {
				var links = obj.querySelectorAll('div.md a');
				var annotationCount = 0;
				for (var i=0, len=links.length; i<len; i++) {
					if (!(hasClass(links[i], 'madeVisible') ||
					      hasClass(links[i], 'toggleImage') ||
					      hasClass(links[i], 'noKeyNav') ||
					      RESUtils.isCommentCode(links[i]))) {
						var annotation = document.createElement('span');
						annotationCount++;
						$(annotation).text('['+annotationCount+'] ');
						annotation.title = 'press '+annotationCount+' to open link';
						addClass(annotation,'keyNavAnnotation');
						/*
						if (!(hasClass(links[i],'hasListener'))) {
							addClass(links[i],'hasListener');
							links[i].addEventListener('click', modules['keyboardNav'].handleKeyLink, true);
						}
						*/
						if (modules['keyboardNav'].options.commentsLinkNumberPosition.value == 'right') {
							insertAfter(links[i], annotation);
						} else {
							links[i].parentNode.insertBefore(annotation, links[i]);
						}
					}
				}
			}
		}
	},
	handleKeyLink: function(link) {
		var button = 0;
		if ((modules['keyboardNav'].options.commentsLinkNewTab.value) || e.ctrlKey) {
			button = 1;
		}
		if (hasClass(link, 'toggleImage')) {
			RESUtils.click(link);
			return false;
		}
		var thisURL = link.getAttribute('href');
		var isLocalToPage = (thisURL.indexOf('reddit') != -1) && (thisURL.indexOf('comments') != -1) && (thisURL.indexOf('#') != -1);
		if ((!isLocalToPage) && (button == 1)) {
			if (typeof(chrome) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisURL,
					button: button
				};
				chrome.extension.sendMessage(thisJSON);
			} else if (typeof(safari) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisURL,
					button: button
				}
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (typeof(opera) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisURL,
					button: button
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else if (typeof(self.on) == 'function') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisURL,
					button: button
				}
				self.postMessage(thisJSON);
			} else {
				window.open(this.getAttribute('href'));
			}
		} else {
			location.href = this.getAttribute('href');
		}
	},
	keyUnfocus: function(obj) {
		removeClass(obj, 'keyHighlight');
		if (this.pageType == 'comments') {
			var annotations = obj.querySelectorAll('div.md .keyNavAnnotation');
			for (var i=0, len=annotations.length; i<len; i++) {
				annotations[i].parentNode.removeChild(annotations[i]);
			}
		}
	},
	drawHelp: function() {
		var thisHelp = createElementWithID('div','keyHelp');
		var helpTable = document.createElement('table');
		thisHelp.appendChild(helpTable);
		var helpTableHeader = document.createElement('thead');
		var helpTableHeaderRow = document.createElement('tr');
		var helpTableHeaderKey = document.createElement('th');
		$(helpTableHeaderKey).text('Key');
		helpTableHeaderRow.appendChild(helpTableHeaderKey);
		var helpTableHeaderFunction = document.createElement('th');
		$(helpTableHeaderFunction).text('Function');
		helpTableHeaderRow.appendChild(helpTableHeaderFunction);
		helpTableHeader.appendChild(helpTableHeaderRow);
		helpTable.appendChild(helpTableHeader);
		var helpTableBody = document.createElement('tbody');
		var isLink = new RegExp(/^link[\d]+$/i);
		for (var i in this.options) {
			if ((this.options[i].type == 'keycode') && (!isLink.test(i))) {
				var thisRow = document.createElement('tr');
				var thisRowKey = document.createElement('td');
				var keyCodeArray = this.options[i].value;
				if (typeof(keyCodeArray) == 'string') {
					keyCodeAarray = parseInt(keyCodeArray);
				}
				if (typeof(keyCodeArray) == 'number') {
					keyCodeArray = [keyCodeArray, false, false, false, false];
				}
				$(thisRowKey).html(RESUtils.niceKeyCode(keyCodeArray));
				thisRow.appendChild(thisRowKey);
				var thisRowDesc = document.createElement('td');
				$(thisRowDesc).html(this.options[i].description);
				thisRow.appendChild(thisRowDesc);
				helpTableBody.appendChild(thisRow);
			}
		}
		helpTable.appendChild(helpTableBody);
		document.body.appendChild(thisHelp);
	},
	handleKeyPress: function(e) {
		var konamitest = (typeof(konami) == 'undefined') || (!konami.almostThere)
		if ((document.activeElement.tagName == 'BODY') && (konamitest)) {
			// comments page, or link list?
			var keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
			switch(this.pageType) {
				case 'linklist':
				case 'profile':
					switch(true) {
						case keyArrayCompare(keyArray, this.options.moveUp.value):
							this.moveUp();
							break;
						case keyArrayCompare(keyArray, this.options.moveDown.value):
							this.moveDown();
							break;
						case keyArrayCompare(keyArray, this.options.moveTop.value):
							this.moveTop();
							break;
						case keyArrayCompare(keyArray, this.options.moveBottom.value):
							this.moveBottom();
							break;
						case keyArrayCompare(keyArray, this.options.followLink.value):
							this.followLink();
							break;
						case keyArrayCompare(keyArray, this.options.followLinkNewTab.value):
							e.preventDefault();
							this.followLink(true);
							break;
						case keyArrayCompare(keyArray, this.options.followComments.value):
							this.followComments();
							break;
						case keyArrayCompare(keyArray, this.options.followCommentsNewTab.value):
							e.preventDefault();
							this.followComments(true);
							break;
						case keyArrayCompare(keyArray, this.options.toggleExpando.value):
							this.toggleExpando();
							break;
						case keyArrayCompare(keyArray, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							break;
						case keyArrayCompare(keyArray, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							break;
						case keyArrayCompare(keyArray, this.options.toggleViewImages.value):
							this.toggleViewImages();
							break;
						case keyArrayCompare(keyArray, this.options.followLinkAndCommentsNewTab.value):
							e.preventDefault();
							this.followLinkAndComments();
							break;
						case keyArrayCompare(keyArray, this.options.followLinkAndCommentsNewTabBG.value):
							e.preventDefault();
							this.followLinkAndComments(true);
							break;
						case keyArrayCompare(keyArray, this.options.upVote.value):
							this.upVote(true);
							break;
						case keyArrayCompare(keyArray, this.options.downVote.value):
							this.downVote(true);
							break;
						case keyArrayCompare(keyArray, this.options.save.value):
							this.saveLink();
							break;
						case keyArrayCompare(keyArray, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
							break;
						case keyArrayCompare(keyArray, this.options.inboxNewTab.value):
							e.preventDefault();
							this.inbox(true);
							break;
						case keyArrayCompare(keyArray, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						case keyArrayCompare(keyArray, this.options.nextPage.value):
							e.preventDefault();
							this.nextPage();
							break;
						case keyArrayCompare(keyArray, this.options.prevPage.value):
							e.preventDefault();
							this.prevPage();
							break;
						case keyArrayCompare(keyArray, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case keyArrayCompare(keyArray, this.options.toggleCmdLine.value):
							this.toggleCmdLine();
							break;
						case keyArrayCompare(keyArray, this.options.hide.value):
							this.hide();
							break;
						case keyArrayCompare(keyArray, this.options.followSubreddit.value):
							this.followSubreddit();
							break;
						case keyArrayCompare(keyArray, this.options.followSubredditNewTab.value):
							this.followSubreddit(true);
							break;
						default:
							// do nothing. unrecognized key.
							break;
					}
					break;
				case 'comments':
					switch(true) {
						case keyArrayCompare(keyArray, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case keyArrayCompare(keyArray, this.options.toggleCmdLine.value):
							this.toggleCmdLine();
							break;
						case keyArrayCompare(keyArray, this.options.moveUp.value):
							this.moveUp();
							break;
						case keyArrayCompare(keyArray, this.options.moveDown.value):
							this.moveDown();
							break;
						case keyArrayCompare(keyArray, this.options.moveUpSibling.value):
							this.moveUpSibling();
							break;
						case keyArrayCompare(keyArray, this.options.moveDownSibling.value):
							this.moveDownSibling();
							break;
						case keyArrayCompare(keyArray, this.options.moveUpThread.value):
							this.moveUpThread();
							break;
						case keyArrayCompare(keyArray, this.options.moveDownThread.value):
							this.moveDownThread();
							break;
						case keyArrayCompare(keyArray, this.options.moveToTopComment.value):
							this.moveToTopComment();
							break;
						case keyArrayCompare(keyArray, this.options.moveToParent.value):
							this.moveToParent();
							break;
						case keyArrayCompare(keyArray, this.options.toggleChildren.value):
							this.toggleChildren();
							break;
						case keyArrayCompare(keyArray, this.options.followLinkNewTab.value):
							// only execute if the link is selected on a comments page...
							if (this.activeIndex == 0) {
								e.preventDefault();
								this.followLink(true);
							}
							break;
						case keyArrayCompare(keyArray, this.options.save.value):
							if (this.activeIndex == 0) {
								this.saveLink();
							} else {
								this.saveComment();
							}
							break;
						case keyArrayCompare(keyArray, this.options.toggleExpando.value):
							this.toggleAllExpandos();
							break;
						case keyArrayCompare(keyArray, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							break;
						case keyArrayCompare(keyArray, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							break;
						case keyArrayCompare(keyArray, this.options.toggleViewImages.value):
							this.toggleViewImages();
							break;
						case keyArrayCompare(keyArray, this.options.upVote.value):
							this.upVote();
							break;
						case keyArrayCompare(keyArray, this.options.downVote.value):
							this.downVote();
							break;
						case keyArrayCompare(keyArray, this.options.reply.value):
							e.preventDefault();
							this.reply();
							break;
						case keyArrayCompare(keyArray, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
							break;
						case keyArrayCompare(keyArray, this.options.inboxNewTab.value):
							e.preventDefault();
							this.inbox(true);
							break;
						case keyArrayCompare(keyArray, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						case keyArrayCompare(keyArray, this.options.subredditFrontPage.value):
							e.preventDefault();
							this.frontPage(true);
							break;
						case keyArrayCompare(keyArray, this.options.link1.value):
							e.preventDefault();
							this.commentLink(0);
							break;
						case keyArrayCompare(keyArray, this.options.link2.value):
							e.preventDefault();
							this.commentLink(1);
							break;
						case keyArrayCompare(keyArray, this.options.link3.value):
							e.preventDefault();
							this.commentLink(2);
							break;
						case keyArrayCompare(keyArray, this.options.link4.value):
							e.preventDefault();
							this.commentLink(3);
							break;
						case keyArrayCompare(keyArray, this.options.link5.value):
							e.preventDefault();
							this.commentLink(4);
							break;
						case keyArrayCompare(keyArray, this.options.link6.value):
							e.preventDefault();
							this.commentLink(5);
							break;
						case keyArrayCompare(keyArray, this.options.link7.value):
							e.preventDefault();
							this.commentLink(6);
							break;
						case keyArrayCompare(keyArray, this.options.link8.value):
							e.preventDefault();
							this.commentLink(7);
							break;
						case keyArrayCompare(keyArray, this.options.link9.value):
							e.preventDefault();
							this.commentLink(8);
							break;
						case keyArrayCompare(keyArray, this.options.link10.value):
							e.preventDefault();
							this.commentLink(9);
							break;
						default:
							// do nothing. unrecognized key.
							break;
					}
					break;
				case 'inbox':
					switch(true) {
						case keyArrayCompare(keyArray, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case keyArrayCompare(keyArray, this.options.toggleCmdLine.value):
							this.toggleCmdLine();
							break;
						case keyArrayCompare(keyArray, this.options.moveUp.value):
							this.moveUp();
							break;
						case keyArrayCompare(keyArray, this.options.moveDown.value):
							this.moveDown();
							break;
						case keyArrayCompare(keyArray, this.options.toggleChildren.value):
							this.toggleChildren();
							break;
						case keyArrayCompare(keyArray, this.options.upVote.value):
							this.upVote();
							break;
						case keyArrayCompare(keyArray, this.options.downVote.value):
							this.downVote();
							break;
						case keyArrayCompare(keyArray, this.options.reply.value):
							e.preventDefault();
							this.reply();
							break;
						case keyArrayCompare(keyArray, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						default:
							// do nothing. unrecognized key.
							break;
					}
					break;
			}
		} else {
			// console.log('ignored keypress');
		}
	},
	toggleHelp: function() {
		(document.getElementById('keyHelp').style.display == 'block') ? this.hideHelp() : this.showHelp();
	},
	showHelp: function() {
		// show help!
		RESUtils.fadeElementIn(document.getElementById('keyHelp'), 0.3);
	},
	hideHelp: function() {
		// show help!
		RESUtils.fadeElementOut(document.getElementById('keyHelp'), 0.3);
	},
	hide: function() {
		// find the hide link and click it...
		var hideLink = this.keyboardLinks[this.activeIndex].querySelector('form.hide-button > span > a');
		RESUtils.click(hideLink);
		// if ((this.options.onHideMoveDown.value) && (!modules['betteReddit'].options.fixHideLink.value)) {
		if (this.options.onHideMoveDown.value) {
			this.moveDown();
		}
	},
	followSubreddit: function(newWindow) {
		// find the subreddit link and click it...
		var srLink = this.keyboardLinks[this.activeIndex].querySelector('A.subreddit');
		if (srLink) {
			var thisHREF = srLink.getAttribute('href');
			if (newWindow) {
			var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1;
			if (typeof(chrome) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				};
				chrome.extension.sendMessage(thisJSON);
			} else if (typeof(safari) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				}
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (typeof(opera) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else if (typeof(self.on) == 'function') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				}
				self.postMessage(thisJSON);
			} else {
				window.open(thisHREF);
			}
		} else {
			location.href = thisHREF;
		}
		}
	},
	moveUp: function() {
		if (this.activeIndex > 0) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex--;
			var thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			// skip over hidden elements...
			while ((thisXY.x == 0) && (thisXY.y == 0) && (this.activeIndex > 0)) {
				this.activeIndex--;
				thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) || (this.options.scrollStyle.value == 'top')) {
				RESUtils.scrollTo(0,thisXY.y);
			}
			
			modules['keyboardNav'].recentKey();
		}
	},
	moveDown: function() {
		if (this.activeIndex < this.keyboardLinks.length-1) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex++;
			var thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			// skip over hidden elements...
			while ((thisXY.x == 0) && (thisXY.y == 0) && (this.activeIndex < this.keyboardLinks.length-1)) {
				this.activeIndex++;
				thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			// console.log('xy: ' + RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]).toSource());
			/*
			if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) || (this.options.scrollTop.value)) {
				RESUtils.scrollTo(0,thisXY.y);
			}
			*/
			if (this.options.scrollStyle.value == 'top') {
				RESUtils.scrollTo(0,thisXY.y);
			} else if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex])))) {
				var thisHeight = this.keyboardLinks[this.activeIndex].offsetHeight;
				if (this.options.scrollStyle.value == 'page') {
					RESUtils.scrollTo(0,thisXY.y);
				} else {
					RESUtils.scrollTo(0,thisXY.y - window.innerHeight + thisHeight + 5);
				}
			}
			if ((RESUtils.pageType() == 'linklist') && (this.activeIndex == (this.keyboardLinks.length-1) && (modules['neverEndingReddit'].isEnabled() && modules['neverEndingReddit'].options.autoLoad.value))) {
				this.nextPage();
			}
			modules['keyboardNav'].recentKey();
		}
	},
	moveTop: function() {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex = 0;
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			var thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0,thisXY.y);
			}
			modules['keyboardNav'].recentKey();
	},
	moveBottom: function() {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex = this.keyboardLinks.length-1;
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			var thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0,thisXY.y);
			}
			modules['keyboardNav'].recentKey();
	},
	moveDownSibling: function() {
		if (this.activeIndex < this.keyboardLinks.length-1) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			var thisParent = this.keyboardLinks[this.activeIndex].parentNode;
			var childCount = thisParent.querySelectorAll('.entry').length;
			this.activeIndex += childCount;
			// skip over hidden elements...
			var thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			while ((thisXY.x == 0) && (thisXY.y == 0) && (this.activeIndex < this.keyboardLinks.length-1)) {
				this.activeIndex++;
				thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			if ((this.pageType == 'linklist') || (this.pageType == 'profile')) {
				this.setKeyIndex();
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0,thisXY.y);
			}
		}
		modules['keyboardNav'].recentKey();
	},
	moveUpSibling: function() {
		if (this.activeIndex < this.keyboardLinks.length-1) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			var thisParent = this.keyboardLinks[this.activeIndex].parentNode;
			if (thisParent.previousSibling != null) {
				var childCount = thisParent.previousSibling.previousSibling.querySelectorAll('.entry').length;
			} else {
				var childCount = 1;
			}
			this.activeIndex -= childCount;
			// skip over hidden elements...
			var thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			while ((thisXY.x == 0) && (thisXY.y == 0) && (this.activeIndex < this.keyboardLinks.length-1)) {
				this.activeIndex++;
				thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			if ((this.pageType == 'linklist') || (this.pageType == 'profile')) {
				this.setKeyIndex();
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0,thisXY.y);
			}
		}
		modules['keyboardNav'].recentKey();
	},
	moveUpThread: function() {
		if ((this.activeIndex < this.keyboardLinks.length-1) && (this.activeIndex > 1)) {
			this.moveToTopComment();
		}
		this.moveUpSibling();
	},
	moveDownThread: function() {
		if ((this.activeIndex < this.keyboardLinks.length-1) && (this.activeIndex > 1)) {
			this.moveToTopComment();
		}
		this.moveDownSibling();
	},
	moveToTopComment: function() {
		if ((this.activeIndex < this.keyboardLinks.length-1) && (this.activeIndex > 1)) {
			var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			//goes up to the root of the current thread
			while (!hasClass(firstParent.parentNode.parentNode.parentNode,'content') && (firstParent != null)) {
				this.moveToParent();
				firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			}
		}
	},
	moveToParent: function() {
		if ((this.activeIndex < this.keyboardLinks.length-1) && (this.activeIndex > 1)) {
			var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			// check if we're at the top parent, first... if the great grandparent has a class of content, do nothing.
			if (!hasClass(firstParent.parentNode.parentNode.parentNode,'content')) {
				if (firstParent != null) {
					this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
					var thisParent = firstParent.parentNode.parentNode.previousSibling;
					var newKeyIndex = parseInt(thisParent.getAttribute('keyindex'));
					this.activeIndex = newKeyIndex;
					this.keyFocus(this.keyboardLinks[this.activeIndex]);
					var thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
					if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
						RESUtils.scrollTo(0,thisXY.y);
					}
				}
			}
		}
		modules['keyboardNav'].recentKey();
	},
	toggleChildren: function() {
		if (this.activeIndex == 0) {
			// Ahh, we're not in a comment, but in the main story... that key should follow the link.
			this.followLink();
		} else {
			// find out if this is a collapsed or uncollapsed view...
			var thisCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.collapsed');
			var thisNonCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.noncollapsed');
			if (thisCollapsed.style.display != 'none') {
				thisToggle = thisCollapsed.querySelector('a.expand');
			} else {
				// check if this is a "show more comments" box, or just contracted content...
				moreComments = thisNonCollapsed.querySelector('span.morecomments > a');
				if (moreComments) {
					thisToggle = moreComments;
				} else {
					thisToggle = thisNonCollapsed.querySelector('a.expand');
				}
				// 'continue this thread' links
				contThread = thisNonCollapsed.querySelector('span.deepthread > a');
				if(contThread){
					thisToggle = contThread;
				}
			}
			RESUtils.click(thisToggle);
		}
	},
	toggleExpando: function() {
		var thisExpando = this.keyboardLinks[this.activeIndex].querySelector('.expando-button');
		if (thisExpando) {
			RESUtils.click(thisExpando);
			if (this.options.scrollOnExpando.value) {
				var thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
				RESUtils.scrollTo(0,thisXY.y);
			}
		}
	},
	previousGalleryImage: function() {
		var previousButton = this.keyboardLinks[this.activeIndex].querySelector('.RESGalleryControls .previous');
		if (previousButton) {
			RESUtils.click(previousButton);
		}
	},
	nextGalleryImage: function() {
		var nextButton = this.keyboardLinks[this.activeIndex].querySelector('.RESGalleryControls .next');
		if (nextButton) {
			RESUtils.click(nextButton);
		}
	},
	toggleViewImages: function() {
		var thisViewImages = document.body.querySelector('#viewImagesButton');
		if (thisViewImages) {
			RESUtils.click(thisViewImages);
		}
	},
	toggleAllExpandos: function() {
		var thisExpandos = this.keyboardLinks[this.activeIndex].querySelectorAll('.expando-button');
		if (thisExpandos) {
			for (var i=0,len=thisExpandos.length; i<len; i++) {
				RESUtils.click(thisExpandos[i]);
			}
		}
	},
	followLink: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.title');
		var thisHREF = thisA.getAttribute('href');
		// console.log(thisA);
		if (newWindow) {
			var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1;
			if (typeof(chrome) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				};
				chrome.extension.sendMessage(thisJSON);
			} else if (typeof(safari) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				}
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (typeof(opera) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else if (typeof(self.on) == 'function') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				}
				self.postMessage(thisJSON);
			} else {
				window.open(thisHREF);
			}
		} else {
			location.href = thisHREF;
		}
	},
	followComments: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.comments');
		var thisHREF = thisA.getAttribute('href');
		if (newWindow) {
			if (typeof(chrome) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				};
				chrome.extension.sendMessage(thisJSON);
			} else if (typeof(safari) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (typeof(opera) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else if (typeof(self.on) == 'function') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				self.postMessage(thisJSON);
			} else {
				window.open(thisHREF);
			}
		} else {
			location.href = thisHREF;
		}
	},
	followLinkAndComments: function(background) {
		// find the [l+c] link and click it...
		var lcLink = this.keyboardLinks[this.activeIndex].querySelector('.redditSingleClick');
		RESUtils.mousedown(lcLink, background);
	},
	upVote: function(link) {
		if (typeof(this.keyboardLinks[this.activeIndex]) == 'undefined') return false;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName == 'A') {
			var upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.upmod');
		} else {
			var upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.upmod');
		}
		RESUtils.click(upVoteButton);
		if (link && this.options.onVoteMoveDown.value) {
			this.moveDown();
		}
	},
	downVote: function(link) {
		if (typeof(this.keyboardLinks[this.activeIndex]) == 'undefined') return false;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName == 'A') {
			var downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.downmod');
		} else {
			var downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.downmod');
		}
		RESUtils.click(downVoteButton);
		if (link && this.options.onVoteMoveDown.value) {
			this.moveDown();
		}
	},
	saveLink: function() {
		var saveLink = this.keyboardLinks[this.activeIndex].querySelector('form.save-button > span > a');
		if (saveLink) RESUtils.click(saveLink);
	},
	saveComment: function() {
		var saveComment = this.keyboardLinks[this.activeIndex].querySelector('.saveComments');
		if (saveComment) RESUtils.click(saveComment);
	},
	reply: function() {
		// activeIndex = 0 means we're at the original post, not a comment
		if ((this.activeIndex > 0) || (RESUtils.pageType('comments') != true)) {
			if ((RESUtils.pageType('comments')) && (this.activeIndex == 0) && (! location.href.match('/message/'))) {
				$('.usertext-edit textarea:first').focus();
			} else {
				var commentButtons = this.keyboardLinks[this.activeIndex].querySelectorAll('ul.buttons > li > a');
				for (var i=0, len=commentButtons.length;i<len;i++) {
					if (commentButtons[i].innerHTML == 'reply') {
						RESUtils.click(commentButtons[i]);
					}
				}
			}
		} else {
			infoBar = document.body.querySelector('.infobar');
			// We're on the original post, so shift keyboard focus to the comment reply box.
			if (infoBar) {
				// uh oh, we must be in a subpage, there is no first comment box. The user probably wants to reply to the OP. Let's take them to the comments page.
				var commentButton = this.keyboardLinks[this.activeIndex].querySelector('ul.buttons > li > a.comments');
				location.href = commentButton.getAttribute('href');
			} else {
				var firstCommentBox = document.querySelector('.commentarea textarea[name=text]');
				firstCommentBox.focus();
			}
		}
	},
	inbox: function(newWindow) {
		var thisHREF = location.protocol + '//'+location.hostname+'/message/inbox/';
		if (newWindow) {
			if (typeof(chrome) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				};
				chrome.extension.sendMessage(thisJSON);
			} else if (typeof(safari) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (typeof(opera) != 'undefined') {
				var thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else {
				window.open(thisHREF);
			}
		} else {
			location.href = location.protocol + '//'+location.hostname+'/message/inbox/';
		}
	},
	frontPage: function(subreddit) {
		var newhref = location.protocol + '//'+location.hostname+'/';
		if (subreddit) {
			newhref += 'r/' + RESUtils.currentSubreddit();
		}
		location.href = newhref;
	},
	nextPage: function() {
		// if Never Ending Reddit is enabled, just scroll to the bottom.  Otherwise, click the 'next' link.
		if ((modules['neverEndingReddit'].isEnabled()) && (modules['neverEndingReddit'].progressIndicator)) {
			RESUtils.click(modules['neverEndingReddit'].progressIndicator);
			this.moveBottom();
		} else {
			// get the first link to the next page of reddit...
			var nextPrevLinks = document.body.querySelectorAll('.content .nextprev a');
			if (nextPrevLinks.length > 0) {
				var nextLink = nextPrevLinks[nextPrevLinks.length-1];
				// RESUtils.click(nextLink);
				location.href = nextLink.getAttribute('href');
			}
		}
	},
	prevPage: function() {
		// if Never Ending Reddit is enabled, do nothing.  Otherwise, click the 'prev' link.
		if (modules['neverEndingReddit'].isEnabled()) {
			return false;
		} else {
			// get the first link to the next page of reddit...
			var nextPrevLinks = document.body.querySelectorAll('.content .nextprev a');
			if (nextPrevLinks.length > 0) {
				var prevLink = nextPrevLinks[0];
				// RESUtils.click(prevLink);
				location.href = prevLink.getAttribute('href');
			}
		}
	},
	commentLink: function(num) {
		if (this.options.commentsLinkNumbers.value) {
			var links = this.keyboardLinks[this.activeIndex].querySelectorAll('div.md a:not(.expando-button):not(.madeVisible)');
			if (typeof(links[num]) != 'undefined') {
				var thisLink = links[num];
				if ((thisLink.nextSibling) && (typeof(thisLink.nextSibling.tagName) != 'undefined') && (hasClass(thisLink.nextSibling, 'expando-button'))) {
					thisLink = thisLink.nextSibling;
				}
				// RESUtils.click(thisLink);
				this.handleKeyLink(thisLink);
			}
		}
	}
}; 

// user tagger functions
modules['userTagger'] = {
	moduleID: 'userTagger',
	moduleName: 'User Tagger',
	category: 'Users',
	options: {
		/*
		defaultMark: {
			type: 'text',
			value: '_',
			description: 'clickable mark for users with no tag'
		},
		*/
		hardIgnore: {
			type: 'boolean',
			value: false,
			description: 'If "hard ignore" is off, only post titles and comment text is hidden. If it is on, the entire block is hidden (or in comments, collapsed).'
		},
		colorUser: {
			type: 'boolean',
			value: true,
			description: 'Color users based on cumulative upvotes / downvotes'
		},
		storeSourceLink: {
			type: 'boolean',
			value: true,
			description: 'By default, store a link to the link/comment you tagged a user on'
		},
		hoverInfo: {
			type: 'boolean',
			value: true,
			description: 'Show information on user (karma, how long they\'ve been a redditor) on hover.'
		},
		hoverDelay: {
			type: 'text',
			value: 400,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 400.'
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
			description: 'Show date (redditor since...) in US format (i.e. 08-31-2010)'
		},
		vwNumber: {
			type: 'boolean',
			value: true,
			description: 'Show the number (i.e. [+6]) rather than [vw]'
		},
		vwTooltip: {
			type: 'boolean',
			value: true,
			description: 'Show the vote weight tooltip on hover (i.e. "your votes for...")'
		}
	},
	description: 'Adds a great deal of customization around users - tagging them, ignoring them, and more.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: Array(
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.]*/i
	),
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var css = '.comment .tagline { display: inline; }';
			css += '#userTaggerToolTip { display: none; position: absolute; width: 334px; height: 248px; }';
			css += '#userTaggerToolTip label { margin-top: 5px; clear: both; float: left; width: 110px; }';
			css += '#userTaggerToolTip input[type=text], #userTaggerToolTip select { margin-top: 5px; float: left; width: 195px; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; margin-bottom: 6px; }';
			css += '#userTaggerToolTip input[type=checkbox] { margin-top: 5px; float: left; }';
			css += '#userTaggerToolTip input[type=submit] { cursor: pointer; position: absolute; right: 16px; bottom: 16px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; } ';
			css += '#userTaggerToolTip .toggleButton { margin-top: 5px; margin-bottom: 5px; }';
			css += '#userTaggerClose { position: absolute; right: 7px; top: 7px; z-index: 11; }';

			css += '.ignoredUserComment { color: #CACACA; padding: 3px; font-size: 10px; }';
			css += '.ignoredUserPost { color: #CACACA; padding: 3px; font-size: 10px; }';
			css += 'a.voteWeight { text-decoration: none; color: #336699; }';
			css += 'a.voteWeight:hover { text-decoration: none; }';
			css += '#authorInfoToolTip { display: none; position: absolute; width: 412px; z-index: 10001; }';
			css += '#authorInfoToolTip .authorLabel { float: left; width: 140px; margin-bottom: 12px; }';
			css += '#authorInfoToolTip .authorDetail { float: left; width: 240px; margin-bottom: 12px; }';
			css += '#authorInfoToolTip .blueButton { float: right; margin-left: 8px; cursor: pointer; margin-top: 12px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff !important; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #107ac4; }';
			css += '#authorInfoToolTip .redButton { float: right; margin-left: 8px; cursor: pointer; margin-top: 12px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff !important; border: 1px solid #bc3d1b; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #ff5757; }';

			css += '#benefits { width: 200px; margin-left: 0px; }';
			css += '#userTaggerToolTip #userTaggerVoteWeight { width: 30px; }';
			css += '.RESUserTagImage { display: inline-block; width: 16px; height: 8px; background-image: url(\'http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png\'); background-repeat: no-repeat; background-position: -16px -137px; }';
			css += '.userTagLink { display: inline-block; }';
			css += '.hoverHelp { margin-left: 3px; cursor: pointer; color: #336699; text-decoration: underline; }';
			css += '.userTagLink.hasTag, #userTaggerPreview { display: inline-block; padding: 0px 4px 0px 4px; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; }';
			css += '#userTaggerPreview { float: left; height: 16px; margin-bottom: 10px; }';
			css += '#userTaggerToolTip .toggleButton .toggleOn { background-color: #107ac4; color: #ffffff;  }';
			css += '#userTaggerToolTip .toggleButton.enabled .toggleOn { background-color: #dddddd ; color: #636363; }';
			css += '#userTaggerToolTip .toggleButton.enabled .toggleOff { background-color: #d02020; color: #ffffff; }'; 
			css += '#userTaggerToolTip .toggleButton .toggleOff { background-color: #dddddd; color: #636363; } ';
			css += '#userTaggerTable th { -moz-user-select: none; -webkit-user-select: none; -o-user-select: none; user-select: none; }'
			css += '#userTaggerTable tbody .deleteButton { cursor: pointer; width: 16px; height: 16px; background-image: url(data:image/gif;base64,R0lGODlhEAAQAOZOAP///3F6hcopAJMAAP/M//Hz9OTr8ZqksMTL1P8pAP9MDP9sFP+DIP8zAO7x8/D1/LnEz+vx+Flha+Ln7OLm61hhayk0QCo1QMfR2eDo8b/K1M/U2pqiqcfP15WcpcLK05ymsig0P2lyftnf5naBi8XJzZ6lrJGdqmBqdKissYyZpf/+/puotNzk66ayvtbc4rC7x9Xd5n+KlbG7xpiirnJ+ivDz9KKrtrvH1Ojv9ePq8HF8h2x2gvj9/yYyPmRueFxlb4eRm+71+kFLVdrb3c/X4KOnrYGMl3uGke/0+5Sgq1ZfaY6Xn/X4+f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAE4ALAAAAAAQABAAAAexgE6CggGFAYOIiAEPEREPh4lOhpOUgwEAmJmaABuQAUktMUUYGhAwLiwnKp41REYmHB5MQUcyN0iQTjsAHU05ICM4SjMQJIg8AAgFBgcvE5gUJYgiycsHDisCApjagj/VzAACBATa5AJOKOAHAAMMDOTvA05A6w7tC/kL804V9uIKAipA52QJgA82dNAQRyBBgwYJyjmRgKmHkAztHA4YAJHfEB8hLFxI0W4AACcbnQQCADs=)}';
			
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			
			this.usernameRE = /(?:u|user)\/([\w\-]+)/;
			// Get user tag data...
			var tags = RESStorage.getItem('RESmodules.userTagger.tags');
			this.tags = null;
			if (typeof(tags) != 'undefined') this.tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true);
			// check if we're using the old method of storing user tags... yuck!
			if (this.tags == null) {
				this.updateTagStorage();
			}
			// If we're on the dashboard, add a tab to it...
			if (RESUtils.currentSubreddit('dashboard')) {
				// add tab to dashboard
				modules['dashboard'].addTab('userTaggerContents','My User Tags');
				// populate the contents of the tab
				var showDiv = $('<div class="show">Show:</div>')
				var tagFilter = $('<select id="tagFilter"><option>tagged users</option><option>all users</option></select>')
				$(showDiv).append(tagFilter);
				$('#userTaggerContents').append(showDiv);
				$('#tagFilter').change(function(){ 
					modules['userTagger'].drawUserTagTable();
				});

				var tagsPerPage = parseInt(modules['dashboard'].options['tagsPerPage'].value);
				if (tagsPerPage) {
					var controlWrapper = document.createElement('div');
					controlWrapper.id = 'tagPageControls';
					controlWrapper.className  = 'RESGalleryControls';
					controlWrapper.page = 1;
					controlWrapper.pageCount = 1;

					var leftButton = document.createElement("a");
					leftButton.className = 'previous noKeyNav';
					leftButton.addEventListener('click', function(e){
						if (controlWrapper.page == 1) {
							controlWrapper.page = controlWrapper.pageCount;
						} else {
							controlWrapper.page -= 1;
						}
						modules['userTagger'].drawUserTagTable();
					});
					controlWrapper.appendChild(leftButton);

					var posLabel = document.createElement('span');
					posLabel.className = 'RESGalleryLabel';
					posLabel.textContent = "1 of 2";
					controlWrapper.appendChild(posLabel);

					var rightButton = document.createElement("a");
					rightButton.className = 'next noKeyNav';
					rightButton.addEventListener('click', function(e){
						if (controlWrapper.page == controlWrapper.pageCount) {
							controlWrapper.page = 1;
						} else {
							controlWrapper.page += 1;
						}
						modules['userTagger'].drawUserTagTable();
					});
					controlWrapper.appendChild(rightButton);

					$('#userTaggerContents').append(controlWrapper);

				}
				var thisTable = $('<table id="userTaggerTable" />');
				$(thisTable).append('<thead><tr><th sort="" class="active">Username <span class="sortAsc"></span></th><th sort="tag">Tag</th><th sort="ignore">Ignored</th><th sort="color">Color</th><th sort="votes">Vote Weight</th></tr></thead><tbody></tbody>');
				$('#userTaggerContents').append(thisTable);
				$('#userTaggerTable thead th').click(function(e) {
					e.preventDefault();
					if ($(this).hasClass('delete')) {
						return false;
					}
					if ($(this).hasClass('active')) {
						$(this).toggleClass('descending');
					}
					$(this).addClass('active');
					$(this).siblings().removeClass('active').find('SPAN').remove();
					$(this).find('.sortAsc, .sortDesc').remove();
					($(e.target).hasClass('descending')) ? $(this).append('<span class="sortDesc" />') : $(this).append('<span class="sortAsc" />');
					modules['userTagger'].drawUserTagTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
				});
				this.drawUserTagTable();
				
			}


			// set up an array to cache user data
			this.authorInfoCache = [];
			if (this.options.colorUser.value) {
				this.attachVoteHandlers(document.body);
			}
			// add tooltip to document body...
			this.userTaggerToolTip = createElementWithID('div','userTaggerToolTip', 'RESDialogSmall');
			var thisHTML = '<h3>Tag User</h3><div id="userTaggerToolTipContents" class="RESDialogContents clear">';
			thisHTML += '<form name="userTaggerForm" action=""><input type="hidden" id="userTaggerName" value="">';
			thisHTML += '<label for="userTaggerTag">Tag</label> <input type="text" id="userTaggerTag" value="">';
			thisHTML += '<div id="userTaggerClose" class="RESCloseButton">&times;</div>';
			thisHTML += '<label for="userTaggerColor">Color</label> <select id="userTaggerColor">';
			for (var color in this.bgToTextColorMap) {
				var thisValue = color;
				if (thisValue == 'none') thisValue = '';
				thisHTML += '<option style="background-color: '+color+'; color: '+this.bgToTextColorMap[color]+'!important" value="'+thisValue+'">'+color+'</option>';
			}
			thisHTML += '</select>';
			thisHTML += '<label for="userTaggerPreview">Preview</label> <span id="userTaggerPreview"></span>';
			thisHTML += '<label for="userTaggerIgnore">Ignore</label>';// <input type="checkbox" id="userTaggerIgnore" value="true">';
			thisHTML += '<label for="userTaggerLink">Link<span class="hoverHelp" title="add a link for this user (shows up in hover pane)">?</span></label> <input type="text" id="userTaggerLink" value="">';
			thisHTML += '<label for="userTaggerVoteWeight">Vote Weight<span class="hoverHelp" title="manually edit vote weight for this user">?</span></label> <input type="text" size="2" id="userTaggerVoteWeight" value="">';
			thisHTML += '<div class="clear"></div><input type="submit" id="userTaggerSave" value="Save"></form></div>';
			$(this.userTaggerToolTip).html(thisHTML);
			var ignoreLabel = this.userTaggerToolTip.querySelector('label[for=userTaggerIgnore]');
			insertAfter(ignoreLabel, RESUtils.toggleButton('userTaggerIgnore', false, 'no', 'yes'));
			this.userTaggerTag = this.userTaggerToolTip.querySelector('#userTaggerTag');
			this.userTaggerTag.addEventListener('keyup', modules['userTagger'].updateTagPreview, false);
			this.userTaggerColor = this.userTaggerToolTip.querySelector('#userTaggerColor');
			this.userTaggerColor.addEventListener('change', modules['userTagger'].updateTagPreview, false);
			this.userTaggerPreview = this.userTaggerToolTip.querySelector('#userTaggerPreview');
			var userTaggerSave = this.userTaggerToolTip.querySelector('#userTaggerSave');
			userTaggerSave.setAttribute('type','submit');
			userTaggerSave.setAttribute('value','✓ save tag');
			userTaggerSave.addEventListener('click', function(e) {
				e.preventDefault();
				modules['userTagger'].saveTagForm();
			}, false);
			var userTaggerClose = this.userTaggerToolTip.querySelector('#userTaggerClose');
			userTaggerClose.addEventListener('click', function(e) {
				modules['userTagger'].closeUserTagPrompt();
			}, false);
			//this.userTaggerToolTip.appendChild(userTaggerSave);
			this.userTaggerForm = this.userTaggerToolTip.querySelector('FORM');
			this.userTaggerForm.addEventListener('submit',function(e) {
				e.preventDefault();
				modules['userTagger'].saveTagForm();
			}, true);
			document.body.appendChild(this.userTaggerToolTip);
			if (this.options.hoverInfo.value) {
				this.authorInfoToolTip = createElementWithID('div', 'authorInfoToolTip', 'RESDialogSmall');
				this.authorInfoToolTipHeader = document.createElement('h3');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipHeader);
				this.authorInfoToolTipCloseButton = createElementWithID('div', 'authorInfoToolTipClose', 'RESCloseButton');
				$(this.authorInfoToolTipCloseButton).text('X');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipCloseButton);
				this.authorInfoToolTipCloseButton.addEventListener('click', function(e) {
					if (typeof(modules['userTagger'].hideTimer) != 'undefined') {
						clearTimeout(modules['userTagger'].hideTimer);
					}
					modules['userTagger'].hideAuthorInfo();
				}, false);
				this.authorInfoToolTipContents = createElementWithID('div','authorInfoToolTipContents', 'RESDialogContents');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipContents);
				this.authorInfoToolTip.addEventListener('mouseover', function(e) {
					if (typeof(modules['userTagger'].hideTimer) != 'undefined') {
						clearTimeout(modules['userTagger'].hideTimer);
					}
				}, false);
				this.authorInfoToolTip.addEventListener('mouseout', function(e) {
					if (e.target.getAttribute('class') != 'hoverAuthor') {
						modules['userTagger'].hideTimer = setTimeout(function() {
							modules['userTagger'].hideAuthorInfo();
						}, modules['userTagger'].options.fadeDelay.value);
					}
				}, false);
				document.body.appendChild(this.authorInfoToolTip);
			}
			document.getElementById('userTaggerTag').addEventListener('keydown', function(e) {
				if (e.keyCode == 27) {
					// close prompt.
					modules['userTagger'].closeUserTagPrompt();
				}
			}, true);
			//console.log('before applytags: ' + Date());
			this.applyTags();
			//console.log('after applytags: ' + Date());
			RESUtils.watchForElement('siteTable', modules['userTagger'].attachVoteHandlers);
			RESUtils.watchForElement('siteTable', modules['userTagger'].applyTags);

			var userpagere = new RegExp(/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+\/?/i);
			if (userpagere.test(location.href)) {
				var friendButton = document.querySelector('.titlebox .fancy-toggle-button');
				if ((typeof(friendButton) != 'undefined') && (friendButton != null)) {
					var firstAuthor = document.querySelector('a.author');
					if ((typeof(firstAuthor) != 'undefined') && (firstAuthor != null)) {
						var thisFriendComment = firstAuthor.getAttribute('title');
						(thisFriendComment != null) ? thisFriendComment = thisFriendComment.substring(8,thisFriendComment.length-1) : thisFriendComment = '';
					} else {
						var thisFriendComment = '';
					}
					// this stopped working. commenting it out for now.  if i add this back I need to check if you're reddit gold anyway.
					/*
					var benefitsForm = document.createElement('div');
					var thisUser = document.querySelector('.titlebox > h1').innerHTML;
					$(benefitsForm).html('<form action="/post/friendnote" id="friendnote-r9_2vt1" method="post" class="pretty-form medium-text friend-note" onsubmit="return post_form(this, \'friendnote\');"><input type="hidden" name="name" value="'+thisUser+'"><input type="text" maxlength="300" name="note" id="benefits" class="tiny" onfocus="$(this).parent().addClass(\'edited\')" value="'+thisFriendComment+'"><button onclick="$(this).parent().removeClass(\'edited\')" type="submit">submit</button><span class="status"></span></form>');
					insertAfter( friendButton, benefitsForm );
					*/
				}
			}
		}
	},
	attachVoteHandlers: function(obj) {
		var voteButtons = obj.querySelectorAll('.arrow');
		this.voteStates = [];
		for (var i=0, len=voteButtons.length;i<len;i++) {
			// get current vote states so that when we listen, we check the delta...
			// pairNum is just the index of the "pair" of vote arrows... it's i/2 with no remainder...
			var pairNum = Math.floor(i/2);
			if (typeof(this.voteStates[pairNum]) == 'undefined') {
				this.voteStates[pairNum] = 0;
			}
			if (hasClass(voteButtons[i], 'upmod')) {
				this.voteStates[pairNum] = 1;
			} else if (hasClass(voteButtons[i], 'downmod')) {
				this.voteStates[pairNum] = -1;
			}
			// add an event listener to vote buttons to track votes, but only if we're logged in....
			voteButtons[i].setAttribute('pairNum',pairNum);
			if (RESUtils.loggedInUser()) {
				voteButtons[i].addEventListener('click', modules['userTagger'].handleVoteClick, true);
			}
		}
	},
	handleVoteClick: function(e) {
		var tags = RESStorage.getItem('RESmodules.userTagger.tags');
		if (typeof(tags) != 'undefined') modules['userTagger'].tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true);
		if (e.target.getAttribute('onclick').indexOf('unvotable') == -1) {
			var pairNum = e.target.getAttribute('pairNum');
			if (pairNum) pairNum = parseInt(pairNum);
			var thisAuthorA = this.parentNode.nextSibling.querySelector('p.tagline a.author');
			// if this is a post with a thumbnail, we need to adjust the query a bit...
			if (thisAuthorA == null && hasClass(this.parentNode.nextSibling,'thumbnail')) {
				thisAuthorA = this.parentNode.nextSibling.nextSibling.querySelector('p.tagline a.author');
			}
			if (thisAuthorA) {
				var thisVWobj = this.parentNode.nextSibling.querySelector('.voteWeight');
				if (!thisVWobj) thisVWobj = this.parentNode.parentNode.querySelector('.voteWeight');
				// but what if no obj exists
				var thisAuthor = thisAuthorA.text;
				var votes = 0;
				if (typeof(modules['userTagger'].tags[thisAuthor]) != 'undefined') {
					if (typeof(modules['userTagger'].tags[thisAuthor].votes) != 'undefined') {
						votes = parseInt(modules['userTagger'].tags[thisAuthor].votes);
					}
				} else {
					modules['userTagger'].tags[thisAuthor] = {};
				}
				// there are 6 possibilities here:
				// 1) no vote yet, click upmod
				// 2) no vote yet, click downmod
				// 3) already upmodded, undoing
				// 4) already downmodded, undoing
				// 5) upmodded before, switching to downmod
				// 6) downmodded before, switching to upmod
				var upOrDown = '';
				((hasClass(this, 'up')) || (hasClass(this, 'upmod'))) ? upOrDown = 'up' : upOrDown = 'down';
				// did they click the up arrow, or down arrow?
				switch (upOrDown) {
					case 'up':
						// the class changes BEFORE the click event is triggered, so we have to look at them backwards.
						// if the arrow now has class "up" instead of "upmod", then it was "upmod" before, which means
						// we are undoing an upvote...
						if (hasClass(this, 'up')) {
							// this is an undo of an upvote. subtract one from votes. We end on no vote.
							votes--;
							modules['userTagger'].voteStates[pairNum] = 0;
						} else {
							// They've upvoted... the question is, is it an upvote alone, or an an undo of a downvote?
							// add one vote either way...
							votes++;
							// if it was previously downvoted, add another!
							if (modules['userTagger'].voteStates[pairNum] == -1) {
								votes++;
							}
							modules['userTagger'].voteStates[pairNum] = 1;
						}
						break;
					case 'down':
						// the class changes BEFORE the click event is triggered, so we have to look at them backwards.
						// if the arrow now has class "up" instead of "upmod", then it was "upmod" before, which means
						// we are undoing an downvote...
						if (hasClass(this, 'down')) {
							// this is an undo of an downvote. subtract one from votes. We end on no vote.
							votes++;
							modules['userTagger'].voteStates[pairNum] = 0;
						} else {
							// They've downvoted... the question is, is it an downvote alone, or an an undo of an upvote?
							// subtract one vote either way...
							votes--;
							// if it was previously upvoted, subtract another!
							if (modules['userTagger'].voteStates[pairNum] == 1) {
								votes--;
							}
							modules['userTagger'].voteStates[pairNum] = -1;
						}
						break;
				}
				/*
				if ((hasClass(this, 'upmod')) || (hasClass(this, 'down'))) {
					// upmod = upvote.  down = undo of downvote.
					votes = votes + 1;
				} else if ((hasClass(this, 'downmod')) || (hasClass(this, 'up'))) {
					// downmod = downvote.  up = undo of downvote.
					votes = votes - 1;
				}
				*/
				modules['userTagger'].tags[thisAuthor].votes = votes;
				RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(modules['userTagger'].tags));
				modules['userTagger'].colorUser(thisVWobj, thisAuthor, votes);
			}
		}
	},
	drawUserTagTable: function(sortMethod, descending) {
		this.currentSortMethod = sortMethod || this.currentSortMethod;
		this.descending = (descending == null) ? this.descending : descending == true;
		var taggedUsers = [];
		var filterType = $('#tagFilter').val();
		for (var i in this.tags) {
			if (filterType == 'tagged users') {
				if (typeof(this.tags[i].tag) != 'undefined') taggedUsers.push(i);
			} else {
				taggedUsers.push(i);
			}
		}
		switch (this.currentSortMethod) {
			case 'tag':
				taggedUsers.sort(function(a,b) { 
					var tagA = (typeof(modules['userTagger'].tags[a].tag) == 'undefined') ? 'zzzzz' : modules['userTagger'].tags[a].tag.toLowerCase();
					var tagB = (typeof(modules['userTagger'].tags[b].tag) == 'undefined') ? 'zzzzz' : modules['userTagger'].tags[b].tag.toLowerCase();
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (this.descending) taggedUsers.reverse();
				break;
			case 'ignore':
				taggedUsers.sort(function(a,b) { 
					var tagA = (typeof(modules['userTagger'].tags[a].ignore) == 'undefined') ? 'z' : 'a';
					var tagB = (typeof(modules['userTagger'].tags[b].ignore) == 'undefined') ? 'z' : 'a';
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (this.descending) taggedUsers.reverse();
				break;
			case 'color':
				taggedUsers.sort(function(a,b) { 
					var colorA = (typeof(modules['userTagger'].tags[a].color) == 'undefined') ? 'zzzzz' : modules['userTagger'].tags[a].color.toLowerCase();
					var colorB = (typeof(modules['userTagger'].tags[b].color) == 'undefined') ? 'zzzzz' : modules['userTagger'].tags[b].color.toLowerCase();
					return (colorA > colorB) ? 1 : (colorB > colorA) ? -1 : 0;
				});
				if (this.descending) taggedUsers.reverse();
				break;
			case 'votes':
				taggedUsers.sort(function(a,b) { 
					var tagA = (typeof(modules['userTagger'].tags[a].votes) == 'undefined') ? 0 : modules['userTagger'].tags[a].votes;
					var tagB = (typeof(modules['userTagger'].tags[b].votes) == 'undefined') ? 0 : modules['userTagger'].tags[b].votes;
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : (a.toLowerCase() > b.toLowerCase());
				});
				if (this.descending) taggedUsers.reverse();
				break;
			default:
				// sort users, ignoring case
				taggedUsers.sort(function(a,b) { 
					return (a.toLowerCase() > b.toLowerCase()) ? 1 : (b.toLowerCase() > a.toLowerCase()) ? -1 : 0;
				});
				if (this.descending) taggedUsers.reverse();
				break;
		}
		$('#userTaggerTable tbody').html('');
		var tagsPerPage = parseInt(modules['dashboard'].options['tagsPerPage'].value);
		var count = taggedUsers.length;
		var start = 0;
		var end = count;

		if (tagsPerPage) {
			var tagControls = $('#tagPageControls');
			var page = tagControls.prop('page');
			var pages = Math.ceil(count / tagsPerPage);
			page = Math.min(page, pages);
			page = Math.max(page, 1);
			tagControls.prop('page', page).prop('pageCount', pages);
			tagControls.find('.RESGalleryLabel').text(page + ' of ' + pages);
			start = tagsPerPage*(page-1);
			end = Math.min(count, tagsPerPage*page);
		}

		for (var i = start; i < end; i++) {
			var thisUser = taggedUsers[i];
			var thisTag = (typeof(this.tags[thisUser].tag) == 'undefined') ? '' : this.tags[thisUser].tag;
			var thisVotes = (typeof(this.tags[thisUser].votes) == 'undefined') ? 0 : this.tags[thisUser].votes;
			var thisColor = (typeof(this.tags[thisUser].color) == 'undefined') ? '' : this.tags[thisUser].color;
			var thisIgnore = (typeof(this.tags[thisUser].ignore) == 'undefined') ? 'no' : 'yes';
			
			var userTagLink = document.createElement('a');
			if (thisTag == '') {
				// thisTag = '<div class="RESUserTagImage"></div>';
				userTagLink.setAttribute('class','userTagLink RESUserTagImage');
			} else {
				userTagLink.setAttribute('class','userTagLink hasTag');
			}
			$(userTagLink).html(escapeHTML(thisTag));
			if (thisColor) {
				userTagLink.setAttribute('style','background-color: '+thisColor+'; color: '+this.bgToTextColorMap[thisColor]+'!important');
			}
			userTagLink.setAttribute('username',thisUser);
			userTagLink.setAttribute('title','set a tag');
			userTagLink.setAttribute('href','javascript:void(0)');
			userTagLink.addEventListener('click', function(e) {
				modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
			}, true);
			
			$('#userTaggerTable tbody').append('<tr><td><a class="author" href="/user/'+thisUser+'">'+thisUser+'</a> <span class="deleteButton" user="'+thisUser+'"></span></td><td id="tag_'+i+'"></td><td id="ignore_'+i+'">'+thisIgnore+'</td><td><span style="color: '+thisColor+'">'+thisColor+'</span></td><td>'+thisVotes+'</td></tr>');
			$('#tag_'+i).append(userTagLink);
		}
		$('#userTaggerTable tbody .deleteButton').click(function(e) {
			var thisUser = $(this).attr('user');
			var answer = confirm("Are you sure you want to delete the tag for user: "+thisUser+"?");
			if (answer) {
				delete modules['userTagger'].tags[thisUser];
				RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(modules['userTagger'].tags));
				$(this).closest('tr').remove();
			}
		});
	},
	saveTagForm: function() {
		var thisName = document.getElementById('userTaggerName').value;
		var thisTag = document.getElementById('userTaggerTag').value;
		var thisColor = document.getElementById('userTaggerColor').value;
		var thisIgnore = document.getElementById('userTaggerIgnore').checked;
		var thisLink = document.getElementById('userTaggerLink').value;
		var thisVotes = parseInt(document.getElementById('userTaggerVoteWeight').value);
		if (isNaN(thisVotes)) thisVotes = 0;
		modules['userTagger'].setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes);
	},
	bgToTextColorMap: {
		'none':'black',
		'aqua':'black',
		'black':'white',
		'blue':'white',
		'fuchsia':'white',
		'gray':'white',
		'green':'white',
		'lime':'black',
		'maroon':'white',
		'navy':'white',
		'olive':'black',
		'orange':'black',
		'purple':'white',
		'red':'black',
		'silver':'black',
		'teal':'white',
		'white':'black',
		'yellow':'black'
	},
	openUserTagPrompt: function(obj, username) {
		var thisXY=RESUtils.getXYpos(obj);
		this.clickedTag = obj;
		var thisH3 = document.querySelector('#userTaggerToolTip h3');
		thisH3.textContent = 'Tag '+username;
		document.getElementById('userTaggerName').value = username;
		var thisTag = null;
		var thisIgnore = null;
		if (typeof(this.tags[username]) != 'undefined') {
			if (typeof(this.tags[username].tag) != 'undefined') {
				document.getElementById('userTaggerTag').value = this.tags[username].tag;
			} else {
				document.getElementById('userTaggerTag').value = '';
			}
			if (typeof(this.tags[username].ignore) != 'undefined') {
				document.getElementById('userTaggerIgnore').checked = this.tags[username].ignore;
				var thisToggle = document.getElementById('userTaggerIgnoreContainer');
				if (this.tags[username].ignore) addClass(thisToggle,'enabled');
			} else {
				document.getElementById('userTaggerIgnore').checked = false;
			}
			if (typeof(this.tags[username].votes) != 'undefined') {
				document.getElementById('userTaggerVoteWeight').value = this.tags[username].votes;
			} else {
				document.getElementById('userTaggerVoteWeight').value = '';
			}
			if (typeof(this.tags[username].link) != 'undefined') {
				document.getElementById('userTaggerLink').value = this.tags[username].link;
			} else {
				document.getElementById('userTaggerLink').value = '';
			}
			if (typeof(this.tags[username].color) != 'undefined') {
				RESUtils.setSelectValue(document.getElementById('userTaggerColor'), this.tags[username].color);
			} else {
				document.getElementById('userTaggerColor').selectedIndex = 0;
			}
		} else {
			document.getElementById('userTaggerTag').value = '';
			document.getElementById('userTaggerIgnore').checked = false;
			document.getElementById('userTaggerVoteWeight').value = '';
			document.getElementById('userTaggerLink').value = '';
			if (this.options.storeSourceLink.value) {
				var closestEntry = $(obj).closest('.entry');
				var linkTitle = $(closestEntry).find('a.title');
				if (linkTitle.length) {
					document.getElementById('userTaggerLink').value = $(linkTitle).attr('href');
				} else {
					var permaLink = $(closestEntry).find('.flat-list.buttons li.first a');
					if (permaLink.length) {
						document.getElementById('userTaggerLink').value = $(permaLink).attr('href');
					}
				}
			}
			document.getElementById('userTaggerColor').selectedIndex = 0;
		}
		this.userTaggerToolTip.setAttribute('style', 'display: block; top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
		document.getElementById('userTaggerTag').focus();
		modules['userTagger'].updateTagPreview();
		return false;
	},
	updateTagPreview: function() {
		$(modules['userTagger'].userTaggerPreview).text(modules['userTagger'].userTaggerTag.value);
		var bgcolor = modules['userTagger'].userTaggerColor[modules['userTagger'].userTaggerColor.selectedIndex].value;
		modules['userTagger'].userTaggerPreview.style.backgroundColor = bgcolor;
		modules['userTagger'].userTaggerPreview.style.color = modules['userTagger'].bgToTextColorMap[bgcolor];
	},
	closeUserTagPrompt: function() {
		this.userTaggerToolTip.setAttribute('style','display: none');
		if (modules['keyboardNav'].isEnabled()) {
			var inputs = this.userTaggerToolTip.querySelectorAll('INPUT, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			for (var i=0,len=inputs.length; i<len; i++) {
				inputs[i].blur();
			}
		}
	},
	setUserTag: function(username, tag, color, ignore, link, votes, noclick) {
		if (((tag != null) && (tag != '')) || (ignore)) {
			if (tag == '') tag = 'ignored';
			if (typeof(this.tags[username]) == 'undefined') this.tags[username] = {};
			this.tags[username].tag = tag;
			this.tags[username].link = link;
			if (color != '') {
				this.tags[username].color = color;
			}
			if (ignore) {
				this.tags[username].ignore = true;
			} else {
				delete this.tags[username].ignore;
			}
			if (!noclick) {
				this.clickedTag.setAttribute('class','userTagLink hasTag');
				this.clickedTag.setAttribute('style', 'background-color: '+color+'; color: ' + this.bgToTextColorMap[color]+'!important');
				$(this.clickedTag).html(escapeHTML(tag));
			}
		} else {
			if (typeof(this.tags[username]) != 'undefined') {
				delete this.tags[username].tag;
				delete this.tags[username].color;
				delete this.tags[username].link;
				if (this.tags[username].tag == 'ignored') delete this.tags[username].tag;
				delete this.tags[username].ignore;
			}
			if (!noclick) {
				this.clickedTag.setAttribute('style', 'background-color: none');
				this.clickedTag.setAttribute('class','userTagLink RESUserTagImage');
				$(this.clickedTag).html('');
			}
		}

		if (typeof(this.tags[username]) != 'undefined') {
			this.tags[username].votes = (isNaN(votes)) ? 0 : votes;
		}
		if (!noclick) {
			var thisVW = this.clickedTag.parentNode.parentNode.querySelector('a.voteWeight');
			if (thisVW) {
				this.colorUser(thisVW, username, votes);
			}
		}
		if (RESUtils.isEmpty(this.tags[username])) delete this.tags[username];
		RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(this.tags));
		this.closeUserTagPrompt();
	},
	applyTags: function(ele) {
		if (ele == null) ele = document;
		var authors = ele.querySelectorAll('.noncollapsed a.author, p.tagline a.author, #friend-table span.user a, .sidecontentbox .author, div.md a[href^="/u/"], .usertable a.author');
		RESUtils.forEachChunked(authors, 15, 1000, function(arrayElement, index, array) {
			modules['userTagger'].applyTagToAuthor(arrayElement);
		});
	},
	applyTagToAuthor: function(thisAuthorObj) {
		var userObject = [];
		// var thisAuthorObj = this.authors[authorNum];
		if ((thisAuthorObj) && (!(hasClass(thisAuthorObj,'userTagged'))) && (typeof(thisAuthorObj) != 'undefined') && (thisAuthorObj != null)) {
			if (this.options.hoverInfo.value) {
				// add event listener to hover, so we can grab user data on hover...
				thisAuthorObj.addEventListener('mouseover', function(e) {
					modules['userTagger'].showTimer = setTimeout(function() {
						modules['userTagger'].showAuthorInfo(thisAuthorObj);
					}, modules['userTagger'].options.hoverDelay.value);
				}, false);
				thisAuthorObj.addEventListener('mouseout', function(e) {
					clearTimeout(modules['userTagger'].showTimer);
				}, false);
			}
			var test = thisAuthorObj.href.match(this.usernameRE);
			if (test) var thisAuthor = test[1];
			// var thisAuthor = thisAuthorObj.text;
			var noTag = false;
			if ((thisAuthor) && (thisAuthor.substr(0,3) == '/u/')) {
				noTag = true;
				thisAuthor = thisAuthor.substr(3);
			}
			if (!noTag) {
				addClass(thisAuthorObj, 'userTagged');
				if (typeof(userObject[thisAuthor]) == 'undefined') {
					var thisVotes = 0;
					var thisTag = null;
					var thisColor = null;
					var thisIgnore = null;
					if ((this.tags != null) && (typeof(this.tags[thisAuthor]) != 'undefined')) {
						if (typeof(this.tags[thisAuthor].votes) != 'undefined') {
							thisVotes = parseInt(this.tags[thisAuthor].votes);
						}
						if (typeof(this.tags[thisAuthor].tag) != 'undefined') {
							thisTag = this.tags[thisAuthor].tag;
						}
						if (typeof(this.tags[thisAuthor].color) != 'undefined') {
							thisColor = this.tags[thisAuthor].color;
						}
						if (typeof(this.tags[thisAuthor].ignore) != 'undefined') {
							thisIgnore = this.tags[thisAuthor].ignore;
						}
					}
					userObject[thisAuthor] = {
						tag: thisTag,
						color: thisColor,
						ignore: thisIgnore,
						votes: thisVotes
					}
				}
				
				var userTagFrag = document.createDocumentFragment();
				
				var userTagLink = document.createElement('a');
				if (!(thisTag)) {
					// thisTag = '<div class="RESUserTagImage"></div>';
					userTagLink.setAttribute('class','userTagLink RESUserTagImage');
				} else {
					userTagLink.setAttribute('class','userTagLink hasTag');
				}
				$(userTagLink).html(escapeHTML(thisTag));
				if (thisColor) {
					userTagLink.setAttribute('style','background-color: '+thisColor+'; color: '+this.bgToTextColorMap[thisColor]+'!important');
				}
				userTagLink.setAttribute('username',thisAuthor);
				userTagLink.setAttribute('title','set a tag');
				userTagLink.setAttribute('href','javascript:void(0)');
				userTagLink.addEventListener('click', function(e) {
					modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
				}, true);
				var userTag = document.createElement('span');
				addClass(userTag, 'RESUserTag');
				// var lp = document.createTextNode(' (');
				// var rp = document.createTextNode(')');
				userTag.appendChild(userTagLink);
				// userTagFrag.appendChild(lp);
				userTagFrag.appendChild(userTag);
				// userTagFrag.appendChild(rp);
				if (this.options.colorUser.value) {
					var userVoteFrag = document.createDocumentFragment();
					var spacer = document.createTextNode(' ');
					userVoteFrag.appendChild(spacer);
					var userVoteWeight = document.createElement('a');
					userVoteWeight.setAttribute('href','javascript:void(0)');
					userVoteWeight.setAttribute('class','voteWeight');
					$(userVoteWeight).text('[vw]');
					userVoteWeight.addEventListener('click', function(e) {
						var theTag = this.parentNode.querySelector('.userTagLink');
						modules['userTagger'].openUserTagPrompt(theTag, theTag.getAttribute('username'));
					}, true);
					this.colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
					userVoteFrag.appendChild(userVoteWeight);
					userTagFrag.appendChild(userVoteFrag);
				}
				insertAfter( thisAuthorObj, userTagFrag );
				thisIgnore = userObject[thisAuthor].ignore;
				if (thisIgnore && (RESUtils.pageType('profile') != true)) {
					if (this.options.hardIgnore.value) {
						if (RESUtils.pageType() == 'comments') {
							var thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
							if (thisComment) {
								$(thisComment).textContent = thisAuthor + ' is an ignored user';
								addClass(thisComment, 'ignoredUserComment');

								var toggle = thisComment.parentNode.querySelector('a.expand');
								RESUtils.click(toggle);
							}
							// firefox fails when we use this jquery call, so we're ditching it
							// in favor of the above lines (grabbing toggle, using RESUtils.click...)
							// $(thisComment).parent().find('a.expand').click();
						} else {
							var thisPost = thisAuthorObj.parentNode.parentNode.parentNode;
							// hide post block first...
							thisPost.style.display = 'none';
							// hide associated voting block...
							if (thisPost.previousSibling) {
								thisPost.previousSibling.style.display = 'none';
							}
						}
					} else {
						if (RESUtils.pageType() == 'comments') {
							var thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
							if (thisComment) {
								thisComment.textContent = thisAuthor + ' is an ignored user';
								addClass(thisComment, 'ignoredUserComment');
							}
						} else {
							var thisPost = thisAuthorObj.parentNode.parentNode.parentNode.querySelector('p.title');
							if (thisPost) {
								// need this setTimeout, potentially because destroying the innerHTML causes conflict with other modules?
								setTimeout(function() {
									thisPost.textContent = thisAuthor + ' is an ignored user';
								}, 100);
								thisPost.setAttribute('class','ignoredUserPost');
							}
						}
					}
				}				
			}
		}
	},
	colorUser: function(obj, author, votes) {
		if (this.options.colorUser.value) {
			votes = parseInt(votes);
			var red = 255;
			var green = 255;
			var blue = 255;
			var voteString = '+';
			if (votes > 0) {
				red = Math.max(0, (255-(8*votes)));
				green = 255;
				blue = Math.max(0, (255-(8*votes)));
			} else if (votes < 0) {
				red = 255;
				green = Math.max(0, (255-Math.abs(8*votes)));
				blue = Math.max(0, (255-Math.abs(8*votes)));
				voteString = '';
			}
			voteString = voteString + votes;
			var rgb='rgb('+red+','+green+','+blue+')';
			if (obj != null) {
				if (votes == 0) {
					obj.style.display = 'none';
				} else {
					obj.style.display = 'inline';
					obj.style.backgroundColor = rgb;
					if (this.options.vwNumber.value) obj.textContent = '[' + voteString + ']';
					if (this.options.vwTooltip.value) obj.setAttribute('title','your votes for '+escapeHTML(author)+': '+escapeHTML(voteString));
				}
			}
		}
	},
	showAuthorInfo: function(obj) {
		var isFriend = (hasClass(obj, 'friend')) ? true : false;
		var thisXY=RESUtils.getXYpos(obj);
		// var thisUserName = obj.textContent;
		var test = obj.href.match(this.usernameRE);
		if (test) var thisUserName = test[1];
		// if (thisUserName.substr(0,3) == '/u/') thisUserName = thisUserName.substr(3);
		$(this.authorInfoToolTipHeader).html('<a href="/user/'+escapeHTML(thisUserName)+'">' + escapeHTML(thisUserName) + '</a> (<a href="/user/'+escapeHTML(thisUserName)+'/submitted/">Links</a>) (<a href="/user/'+escapeHTML(thisUserName)+'/comments/">Comments</a>)');
		RESUtils.loggedInUserInfo(function(userInfo) {
			var myID = 't2_'+userInfo.data.id;
			if (isFriend) {
				var friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active remove" href="#" tabindex="100" onclick="return toggle(this, unfriend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'), friend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'))">- friends</a><a class="option add" href="#">+ friends</a></span>';
			} else {
				var friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active add" href="#" tabindex="100" onclick="return toggle(this, friend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'), unfriend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'))">+ friends</a><a class="option remove" href="#">- friends</a></span>';
			}
			var friendButtonEle = $(friendButton);
			$(modules['userTagger'].authorInfoToolTipHeader).append(friendButtonEle);
		});
		$(this.authorInfoToolTipContents).html('<a class="hoverAuthor" href="/user/'+escapeHTML(thisUserName)+'">'+escapeHTML(thisUserName)+'</a>:<br><img src="'+RESConsole.loader+'"> loading...');
		if((window.innerWidth-thisXY.x)<=412){
			this.authorInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 14) + 'px; left: ' + (thisXY.x - 180) + 'px;');
		} else {
			this.authorInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 14) + 'px; left: ' + (thisXY.x - 10) + 'px;');
		}
		if(this.options.fadeSpeed.value < 0 || this.options.fadeSpeed.value > 1 || isNaN(this.options.fadeSpeed.value)) {
			this.options.fadeSpeed.value = 0.3;
		}
		RESUtils.fadeElementIn(this.authorInfoToolTip, this.options.fadeSpeed.value);
		setTimeout(function() {
			if (!RESUtils.elementUnderMouse(modules['userTagger'].authorInfoToolTip)) {
				modules['userTagger'].hideAuthorInfo();
			}
		}, 1000);
		if (typeof(this.authorInfoCache[thisUserName]) != 'undefined') {
			this.writeAuthorInfo(this.authorInfoCache[thisUserName]);
		} else {
			GM_xmlhttpRequest({
				method:	"GET",
				url:	location.protocol + "//"+location.hostname+"/user/" + thisUserName + "/about.json?app=res",
				onload:	function(response) {
					var thisResponse = JSON.parse(response.responseText);
					modules['userTagger'].authorInfoCache[thisUserName] = thisResponse;
					modules['userTagger'].writeAuthorInfo(thisResponse);
				}
			});
		}
	},
	writeAuthorInfo: function(jsonData) {
		var utctime = jsonData.data.created;
		var d = new Date(utctime*1000);
		// var userHTML = '<a class="hoverAuthor" href="/user/'+jsonData.data.name+'">'+jsonData.data.name+'</a>:';
		var userHTML = '<div class="authorLabel">Redditor since:</div> <div class="authorDetail">' + RESUtils.niceDate(d, this.options.USDateFormat.value) + ' ('+RESUtils.niceDateDiff(d)+')</div>';
		userHTML += '<div class="authorLabel">Link Karma:</div> <div class="authorDetail">' + escapeHTML(jsonData.data.link_karma) + '</div>';
		userHTML += '<div class="authorLabel">Comment Karma:</div> <div class="authorDetail">' + escapeHTML(jsonData.data.comment_karma) + '</div>';
		if ((typeof(modules['userTagger'].tags[jsonData.data.name]) != 'undefined') && (modules['userTagger'].tags[jsonData.data.name].link)) {
			userHTML += '<div class="authorLabel">Link:</div> <div class="authorDetail"><a target="_blank" href="'+escapeHTML(modules['userTagger'].tags[jsonData.data.name].link)+'">website link</a></div>';
		}
		userHTML += '<div class="clear"></div><div class="bottomButtons">';
		userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/message/compose/?to='+escapeHTML(jsonData.data.name)+'"><img src="/static/mailgray.png"> send message</a>';
		if (jsonData.data.is_gold) {
			userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/gold">User has Reddit Gold</a>';
		} else {
			userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/gold?goldtype=gift&recipient='+escapeHTML(jsonData.data.name)+'">Gift Reddit Gold</a>';
		}
		if ((modules['userTagger'].tags[jsonData.data.name]) && (modules['userTagger'].tags[jsonData.data.name].ignore)) {
			userHTML += '<div class="redButton" id="ignoreUser" user="'+escapeHTML(jsonData.data.name)+'">&empty; Unignore</div>';
		} else {
			userHTML += '<div class="blueButton" id="ignoreUser" user="'+escapeHTML(jsonData.data.name)+'">&empty; Ignore</div>';
		}
		userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		$(this.authorInfoToolTipContents).html(userHTML);
		this.authorInfoToolTipIgnore = this.authorInfoToolTipContents.querySelector('#ignoreUser');
		this.authorInfoToolTipIgnore.addEventListener('click', modules['userTagger'].ignoreUser, false);
	},
	ignoreUser: function(e) {
		if (hasClass(e.target,'blueButton')) {
			removeClass(e.target,'blueButton');
			addClass(e.target,'redButton');
			$(e.target).html('&empty; Unignore');
			var thisIgnore = true;
		} else {
			removeClass(e.target,'redButton');
			addClass(e.target,'blueButton');
			$(e.target).html('&empty; Ignore');
			var thisIgnore = false;
		}
		var thisName = e.target.getAttribute('user');
		var thisColor, thisLink, thisVotes, thisTag;
		if (modules['userTagger'].tags[thisName]) {
			thisColor = modules['userTagger'].tags[thisName].color || '';
			thisLink = modules['userTagger'].tags[thisName].link || '';
			thisVotes = modules['userTagger'].tags[thisName].votes || 0;
			thisTag = modules['userTagger'].tags[thisName].tag || '';
		} 
		if ((thisIgnore) && (thisTag == '')) {
			thisTag = 'ignored';
		} else if ((!thisIgnore) && (thisTag == 'ignored')) {
			thisTag = '';
		}
		modules['userTagger'].setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes, true); // last true is for noclick param
	},
	hideAuthorInfo: function(obj) {
		// this.authorInfoToolTip.setAttribute('style', 'display: none');
		if(this.options.fadeSpeed.value < 0 || this.options.fadeSpeed.value > 1 || isNaN(this.options.fadeSpeed.value)) {
			this.options.fadeSpeed.value = 0.3;
		}
		RESUtils.fadeElementOut(this.authorInfoToolTip, this.options.fadeSpeed.value);
	},
	updateTagStorage: function() {
		// update tag storage format from the old individual bits to a big JSON blob
		// It's OK that we're directly accessing localStorage here because if they have old school tag storage, it IS in localStorage.
		(typeof(unsafeWindow) != 'undefined') ? ls = unsafeWindow.localStorage : ls = localStorage;
		var tags = {};
		var toRemove = [];
		for (var i = 0, len=ls.length; i < len; i++){
			var keySplit = null;
			if (ls.key(i)) keySplit = ls.key(i).split('.');
			if (keySplit) {
				var keyRoot = keySplit[0];
				switch (keyRoot) {
					case 'reddituser':
						var thisNode = keySplit[1];
						if (typeof(tags[keySplit[2]]) == 'undefined') {
							tags[keySplit[2]] = {};
						}
						if (thisNode == 'votes') {
							tags[keySplit[2]].votes = ls.getItem(ls.key(i));
						} else if (thisNode == 'tag') {
							tags[keySplit[2]].tag = ls.getItem(ls.key(i));
						} else if (thisNode == 'color') {
							tags[keySplit[2]].color = ls.getItem(ls.key(i));
						} else if (thisNode == 'ignore') {
							tags[keySplit[2]].ignore = ls.getItem(ls.key(i));
						}
						// now delete the old stored garbage...
						var keyString = 'reddituser.'+thisNode+'.'+keySplit[2];
						toRemove.push(keyString);
						break;
					default:
						// console.log('Not currently handling keys with root: ' + keyRoot);
						break;
				}
			}
		}
		this.tags = tags;
		RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(this.tags));
		// now remove the old garbage...
		for (var i=0, len=toRemove.length; i<len; i++) {
			ls.removeItem(toRemove[i]);
		}
	}
};

// betteReddit
modules['betteReddit'] = {
	moduleID: 'betteReddit',
	moduleName: 'betteReddit',
	category: 'UI',
	options: {
		fullCommentsLink: {
			type: 'boolean',
			value: true,
			description: 'add "full comments" link to comment replies, etc'
		},
		fullCommentsText: {
			type: 'text',
			value: 'full comments',
			description: 'text of full comments link'
		},
		commentsLinksNewTabs: {
			type: 'boolean',
			value: false,
			description: 'Open links found in comments in a new tab'
		},
		fixSaveLinks: {
			type: 'boolean',
			value: true,
			description: 'Make "save" links change to "unsave" links when clicked'
		},
		fixHideLinks: {
			type: 'boolean',
			value: true,
			description: 'Make "hide" links change to "unhide" links when clicked, and provide a 5 second delay prior to hiding the link'
		},
		searchSubredditByDefault: {
			type: 'boolean',
			value: true,
			description: 'Search the current subreddit by default when using the search box, instead of all of reddit.'
		},
		showUnreadCount: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count next to orangered?'
		},
		showUnreadCountInTitle: {
			type: 'boolean',
			value: false,
			description: 'Show unread message count in page/tab title?'
		},
		showUnreadCountInFavicon: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count in favicon?'
		},
		unreadLinksToInbox: {
			type: 'boolean',
			value: false,
			description: 'Always go to the inbox, not unread messages, when clicking on orangered'
		},
		videoTimes: {
			type: 'boolean',
			value: true,
			description: 'Show lengths of videos when possible'
		},
		videoUploaded: {
			type: 'boolean',
			value: false,
			description: 'Show upload date of videos when possible'
		},
		toolbarFix: { 
			type: 'boolean',
			value: true,
			description: 'Don\'t use Reddit Toolbar when linking to sites that may not function (twitter, youtube and others)'
		},
		pinHeader: {
		   type: 'enum',
		   values: [
			   { name: 'None', value: 'none' },
			   { name: 'Subreddit Bar only', value: 'sub' },
			   { name: 'User Bar', value: 'userbar' },
			   { name: 'Subreddit Bar and User bar', value: 'subanduser' },
			   { name: 'Full Header', value: 'header' }
		   ],
		   value: 'none',
		   description: 'Pin the subreddit bar or header to the top, even when you scroll.'
		},
		turboSelfText: {
			type: 'boolean',
			value: true,
			description: 'Preload selftext data to make selftext expandos faster (preloads after first expando)'
		},
		showInputLength: {
			type: 'boolean',
			value: true,
			description: 'When submitting, display the number of characters entered in the title and text fields and indicate when you go over the 300 character limit for titles.'
		}
	},
	description: 'Adds a number of interface enhancements to Reddit, such as "full comments" links, the ability to unhide accidentally hidden posts, and more',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/.*/i
	),
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if ((this.options.toolbarFix.value) && ((RESUtils.pageType() == 'linklist') || RESUtils.pageType() == 'comments')) { 
				this.toolbarFix();
			}
			if ((RESUtils.pageType() == 'comments') && (this.options.commentsLinksNewTabs.value)) {
				this.commentsLinksNewTabs();
			}
			// if (((RESUtils.pageType() == 'inbox') || (RESUtils.pageType() == 'profile') || ((RESUtils.pageType() == 'comments') && (RESUtils.currentSubreddit('friends')))) && (this.options.fullCommentsLink.value)) {
			// removed profile pages since Reddit does this natively now for those...
			if (((RESUtils.pageType() == 'inbox') || ((RESUtils.pageType() == 'comments') && (RESUtils.currentSubreddit('friends') == false))) && (this.options.fullCommentsLink.value)) {
				// RESUtils.addCSS('a.redditFullCommentsSub { font-size: 9px !important; color: #BBBBBB !important; }');
				this.fullComments();
			}
			if ((RESUtils.pageType() == 'profile') && (location.href.split('/').indexOf(RESUtils.loggedInUser()) != -1)) {
				this.editMyComments();
			}
			if (((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments')) && (this.options.fixSaveLinks.value)) {
				this.fixSaveLinks();
			}
			if (((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments')) && (this.options.fixHideLinks.value)) {
				this.fixHideLinks();
			}
			if ((this.options.turboSelfText.value) && (RESUtils.pageType() == 'linklist')) {
				this.setUpTurboSelfText();
			}
			if (this.options.showUnreadCountInFavicon.value) {
				var faviconDataurl = 'data:image/x-icon;base64,AAABAAIAEBAAAAAAAABoBQAAJgAAACAgAAAAAAAAqAgAAI4FAAAoAAAAEAAAACAAAAABAAgAAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wBBRP4Aq5qHAFNOSgCkpv4A4Mu0AA8Q/gCAc2cAzM7+ADYvKQCys7QA/urQAGVo/gCGh4kA1NbYAMWvmgBjZWYA5efoAJucngD//+MAwcPFACIk/gCbinkAycGtADo8PgDz2sIAal5RADAy/gBvcHEA9PbzALijkACMfm8AqqmoALCy/gCAgHsAc2piAMnMzwDBw/4AXVxcAJGUlwDOuKMAR0dHANfDrABLTv4Aubu+ADIzNQBbVlEA++HJAP/23ACho6UAa2RdAJOEdQD3+P4A2tzeAO7UvACEeW4AjY2KALCfjgBsa2oArq6uAM/R0wB2cGwA//DWAKOYiACCg4MAemxfAPDw8ABOSkYA4+PjAMm7pgBeWlYAgHt3AGZhWwBtamQA+t7EAGVbUgB7b2QAoaGgAP7kzADdyLEA9Pf6AP774ACwnIoAZ15VAJiHdwBbXWAAy8vLAIh8cAC0oY0AZ2VkALy+vwD+7dMA9t3FAHJwbgB/f38Aqq2vAP//5wB4bWMA7ta/AHVqXwCCfXsAmYp8AIJ1aQDS0tIApKSkAP7jyQDOuaYA/vjeAH1xZQCBgYEArp2MAJ2enwD5+v4A//LYAH5zaQD13MMAd2xhAJWFdgD+69IA/ujPAGxsbABycXAAtqOPAN/IsQDLu6YA/v7+AP/84QD/+t8A/vfbAP7v1QD64MgA1dfZAH5+fgD//uIA/v7jAP/43QD+990AZVxTAP/x1wD+8tcA/u7UAOTk4wCYiHgA///kAP/+4wD++t8A/vneAP743QD/79UA/u3SAP7s0gD+69EA/unQAPXcxACrra8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AD8/Pz8/Pz8/Pz8/Pz8/Pz8/XV1dKY8IYgiPKV1dXV0/P11QVDubPYQ9mztUUF1dP4krRC1+V26Fbld+LUQrXT+UiiV+fiFoQ2ghfn4lil0/P15+fn5+fn5+fn5+fl5dPx8qfn4iHAl+CRwifn4qHz9IHTx+BQcmfiYHBX48HUg/PjYZDh5+fn5+fh4OGTY+P0YzOCBKOTILcCNJIDgzRj8/XV1dfFkXClUQGl1qXV0/P11dXTB4XWdrXV1YRzpdPz9dXV1dXV1vZBhCVlEEXT8/XV1dXV2DY0xtQCRaZl0/P11dXV1dXV1dXV1dXV1dPz8/Pz8/Pz8/Pz8/Pz8/Pz8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAACAAAABAAAAAAQAIAAAAAACABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AJSr/AJmJegCIjf4AREZIANzFsADGy/4AUFb/ACgjHwBpamsAAAD/AP/mzQCmp6cA2dnaAL29vgDl6P4AYllPAMWzoAAQEhQAMjQ2AHp7fQCxtv4AlZaWAP784AASFv4A7NfAALGgjwCCdGYAy8vLAPPz9ACJiosARz83AFZNRAB1aV0A1Nj+AFJTVQCzs7MAjX9yAFtdXwDi4uIAqJaGALyplgDRvagAMiwnABkbHQB9g/4ACgoKAOLPuQD+8dcA6+vrAGphVwCdnp4A9t3GAD43LwB0dHQAgYOEADw8PAAdIf8A0tLSAPf5/wC5vv4AxcXGAJ+QgAAbFxMA3eH/AGJjZACtra0A9+rSAE9HQADs7/4AIyQmAHl1aQAsLzEATE5QAEpP/wAhHRoAXFJIAI+PjwAeICIAAwUHAD9BQgBWWFoAwa6bAMm8qAATEA0A///nAOnSuwAVFxgA3d3dAHltYACJe20AlIV2APj4+AA4My4A/vfcAP7s0gDUwa0AuaSSAPviyQA4ODgAt7e3AKGiogAODg8AKyssAMvP/gCBh/4ALiklAIR3awDOzs8A38u2AH9wYwAIBgQAb2NYADYwKgD7+/sA8PDwAPPbxABJS00AwcLCABke/gDY2/8ADgwJAAUDAgAjIB0A+eXMAF9gYgCbm5sAkpOUABQSEQBEPDUAUVFRAIWFhQAZGRkAIyMjAPP1/gDp7P4AtaORAAYHBwAfGxgA39/gAC8xMwDv2cIASUE4AK+vsADmz7kAAQMFABAQEAD+6dAAMSokAEE4MQBVS0EAyLWhAGVlZQCai30AjIyMAP7+4wAUFBQA/vneAP7z2gD+7tUALy8vADs1LgComYgA/f39APb29gAbHR8A/ePLAPngyADb29sAQkRGAEZISgDWw68A07+qAFpQRgBkW1EAvquYAHZ2dgCWh3gADw0MACAiJAD8584ANTc5ADc5OwDZxrEAV1dXAAMCAgDiy7UAjI2PAAwLCwDb3/4Aw7CcAJ+foACDdmgAoZGCABIUFgAjHxoAJSUlAPbcxADIzf4A79fAAOzZwgC3vP4A59G7AOLNtwBdXV0Av62aAAQEBAAGBQQACQgHABYWFgD09PUAFxocADAzNQDDw8MAWE5FAMOynwBaXF0AbmJWAGBiYwC3opAAAgEBABISEgD+6M8A/OXNADAqJgAyLSkANi8oADQ1NgDTvakAtba3AMGwnQBkWk8Aq6ytAG1jWQBjZWYAnY+AAP//5QD+9dsA+N7GAODNtwDRv6oAw66bAAcICQD+/v4A+vr6ABQRDgD5+fkAFhgZAP/43QAaGhoA8fHxAP/w1gD/7dMA6urqAP///wAAVvz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8VgD8NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTX8AKA1NTU1NTU1NagM/fz8oKCg/KDfqDU1NTU1NTU1NaAAoDU1NTU1NQz8p63CWq4gIJciA5g1oJQ1NTU1NTU1oACgNTU1Naf8uCKLz8NJq9knStX4z/ZNEmDfNTU1NTWgAPw1NTX9Gq/dRzhtXQEBAQEBAaQOF7cAgmH8NTU1NfwAoDU1oNhVtJD09PT09PSlHqT09PT09B1RAOwx7zU1oACgNaDOAEL19PT09CWDhtKd+mSbXfT09PROACb8NTWgAKDgy3sK9PT09PTNALl/D9ZDsdLF+/T09PRmAM5gNaAA/PyuRwEBAQEBAU4dAQEBAQEBdIR0AQEBAQFSxLWo/ADuV93p9PT09PT09PT09PT09PT09PT09PT09IwA8pSgABgqijL09PT09PT09PT09PT09PT09PT09PT09EccoKAAnLBn0/T09PT09COH9PT09PT09GlG9PT09PT0jRxfoADtcQBZAQEBATwICwJBAQEBATxLCzp5AQEBAQFY48n5AIlQkzf09PT0BwsLC2r09PT0xwsLCy709PT0Zc9HLJ8AlhVlADv09PQQGQsLyvT09PSIeAsLPfT09PfSmR5Q3ACVvPSDZ6n09PQjLhb09PT09PS+BD309PTTOYX79NXBAG/UdAG53g0BAQEBAQEBAQEBAQEBAQEBPmihdAH+kmIARGsT23YAALaQXfT09PT09PT09PT0PiTdAKrmNC1y7gD5dVuC186sIdDDJIAPWf4yjB3Afk/doufxIHpV6I5fAKBjoKCglN+gzLKPQNGK82cv0FU2wa1glN+UyHWgY6AA/DU1NTU1NTWnoKBjkSspAD8wdf2gDDU1DJQMqDU1/ACgNTU1NTU1NTU1NainlPx8bPmoNTU1Y5Tlv3XfxjWgAKA1NTU1NTU1NTU1NTU1MeprlDU1NajgEbqKTGHfNaAAoDU1NTU1NTU1NTU1NTWUsLq7pzVjnlySdygFCX2ooAD8NTU1NTU1NTU1NTU1NWN1vcLt/Y5UxOsBAQ4ABgz8AKA1NTU1NTU1NTU1NTU1NfxF4kheky+z5HP0H3DIY6AAoDU1NTU1NTU1NTU1NTU1YBuB4TOj8G6LphQAmmA1oACgNTU1NTU1NTU1NTU1NTU1qMiU/GCnlMvB2lNgNTWgAPw1NTU1NTU1NTU1NTU1NTXvY+81NTU1p6D8lDU1NfwAVvz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8VgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAP////8K';
				// remove current favicons and replace accordingly, or tinycon has a cross domain issue since the real favicon is on redditstatic.com.
				$('head link[rel="shortcut icon"], head link[rel="icon"]').attr('href',faviconDataurl);
			}


			
			if ((modules['betteReddit'].options.toolbarFix.value) && (RESUtils.pageType() == 'linklist')) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].toolbarFix);
			}
			if ((RESUtils.pageType() == 'inbox') && (modules['betteReddit'].options.fullCommentsLink.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fullComments);
			}
			if (((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments')) && (modules['betteReddit'].options.fixSaveLinks.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fixSaveLinks);
			}
			if (((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments')) && (modules['betteReddit'].options.fixHideLinks.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fixHideLinks);
			}
			if ((RESUtils.pageType() == 'comments') && (modules['betteReddit'].options.commentsLinksNewTabs.value)) {
				RESUtils.watchForElement('newComments', modules['betteReddit'].commentsLinksNewTabs);
			}

			if ((RESUtils.currentSubreddit() != null) && (this.options.searchSubredditByDefault.value)) {
				// make sure we're not on a search results page...
				if (location.href.indexOf('/r/'+RESUtils.currentSubreddit()+'/search') == -1) {
					this.searchSubredditByDefault();
				}
			}
			if ((this.options.videoTimes.value) && ((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments'))) {
				this.getVideoTimes();
				// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...
				
				RESUtils.watchForElement('siteTable', modules['betteReddit'].getVideoTimes);
			}
			if ((RESUtils.loggedInUser() != null) && ((this.options.showUnreadCount.value) || (this.options.showUnreadCountInTitle.value) || (this.options.showUnreadCountInFavicon.value))) {
				// Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
				// RESUtils.addCSS('#mail { min-width: 16px !important; width: auto !important; text-indent: 18px !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				// removing text indent - on 11/14/11 reddit changed the mail sprites, so I have to change how this is handled..
				RESUtils.addCSS('#mail { top: 2px; min-width: 16px !important; width: auto !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				// RESUtils.addCSS('#mail.havemail { top: 2px !important; margin-right: 1px; }');
				RESUtils.addCSS('#mail.havemail { top: 2px !important; }');
				if ((typeof(chrome)  != 'undefined') || (typeof(safari) != 'undefined')) {
					// I hate that I have this conditional CSS in here but I can't figure out why it's needed for webkit and screws up firefox.
					RESUtils.addCSS('#mail.havemail { top: 0px; }');
				}
				this.showUnreadCount();
			}
			switch(this.options.pinHeader.value) {
				case 'header':
					this.pinHeader();
					$('body').addClass('pinHeader-header');
					break;
				case 'sub':
					this.pinSubredditBar();
					$('body').addClass('pinHeader-sub');
					break;
				case 'subanduser':
					this.pinSubredditBar();
					this.pinUserBar();
					$('body').addClass('pinHeader-subanduser');
					break;
				case 'userbar':
					this.pinUserBar();
					$('body').addClass('pinHeader-userbar');
					break;
				default:
					break;
			}
			if ((RESUtils.pageType() == 'submit') && (this.options.showInputLength.value)) {
				this.showInputLength();
			}
		}
	},
	commentsLinksNewTabs: function(ele) {
		ele = ele || document.body;
		var links = ele.querySelectorAll('div.md a');
		for (var i=0, len=links.length; i<len; i++) {
			links[i].target = '_blank';
		}
	},
	setUpTurboSelfText: function() {
		// TODO: Turbo selftext seems a little wonky on NER pages
		modules['betteReddit'].selfTextHash = {};
		$('.expando-button.selftext:not(".twitter")').live('click', modules['betteReddit'].showSelfText);
		$('#siteTable').data('jsonURL', location.href+'.json');

		RESUtils.watchForElement('siteTable', modules['betteReddit'].setNextSelftextURL);
	},
	setNextSelftextURL: function(ele) {
		if (modules['neverEndingReddit'].nextPageURL) {
			var jsonURL = modules['neverEndingReddit'].nextPageURL.replace('/?','/.json?');
			$(ele).data('jsonURL',jsonURL);
		}
	},
	showSelfText: function(event) {
		var thisID = $(event.target).parent().parent().attr('data-fullname');
		if (typeof(modules['betteReddit'].selfTextHash[thisID]) == 'undefined') {
			// we haven't gotten JSON data for this set of links yet... get it, then replace the click listeners with our own...
			var jsonURL = $(event.target).closest('.sitetable.linklisting').data('jsonURL');
			modules['betteReddit'].getSelfTextData(jsonURL);
		} else {
			if ($(event.target).hasClass('collapsed')) {
				$(event.target).removeClass('collapsed');
				$(event.target).addClass('expanded');
				$(event.target).parent().find('.expando').html(
					'<form class="usertext"><div class="usertext-body">' + 
					$('<div/>').html(modules['betteReddit'].selfTextHash[thisID]).text() + 
					'</div></form>'
				).show();
			} else {
				$(event.target).removeClass('expanded');
				$(event.target).addClass('collapsed');
				$(event.target).parent().find('.expando').hide();
			}

		}
	},
	getSelfTextData: function(href) {
		$.getJSON(href, modules['betteReddit'].applyTurboSelfText);
	},
	applyTurboSelfText: function(data) {
		var linkList = data.data.children;
		for (var i=0, len=linkList.length; i<len; i++) {
			var thisID = linkList[i].data.name;
			if (i == 0) {
				var thisSiteTable = $('.id-'+thisID).closest('.sitetable.linklisting');
				$(thisSiteTable).find('.expando-button.selftext').removeAttr('onclick');
			}
			modules['betteReddit'].selfTextHash[thisID] = linkList[i].data.selftext_html;
		}
	},
	getInboxLink: function (havemail) {
		if (havemail && !modules['betteReddit'].options.unreadLinksToInbox.value) { 
			return '/message/unread/';
		}

		return '/message/inbox/';
	},
	showUnreadCount: function() {
		if (typeof(this.mail) == 'undefined') {
			this.mail = document.querySelector('#mail');
			if (this.mail) {
				this.mailCount = createElementWithID('a','mailCount');
				this.mailCount.display = 'none';
				this.mailCount.setAttribute('href', this.getInboxLink(true));
				insertAfter(this.mail, this.mailCount);
			}
		}
		if (this.mail) {
			$(modules['betteReddit'].mail).html('');
			if (hasClass(this.mail, 'havemail')) {
				this.mail.setAttribute('href', this.getInboxLink(true));
				var lastCheck = parseInt(RESStorage.getItem('RESmodules.betteReddit.msgCount.lastCheck.'+RESUtils.loggedInUser())) || 0;
				var now = new Date();
				// 300000 = 5 minutes... we don't want to annoy Reddit's servers too much with this query...
				if ((now.getTime() - lastCheck) > 300000) {
					GM_xmlhttpRequest({
						method:	"GET",
						url:	location.protocol + '//' + location.hostname + "/message/unread/.json?mark=false&app=res",
						onload:	function(response) {
							// save that we've checked in the last 5 minutes
							var now = new Date();
							RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.'+RESUtils.loggedInUser(), now.getTime());
							var data = JSON.parse(response.responseText);
							var count = data.data.children.length;
							RESStorage.setItem('RESmodules.betteReddit.msgCount.'+RESUtils.loggedInUser(), count);
							modules['betteReddit'].setUnreadCount(count);
						}
					});
				} else {
					var count = RESStorage.getItem('RESmodules.betteReddit.msgCount.'+RESUtils.loggedInUser());
					modules['betteReddit'].setUnreadCount(count);
				}
			} else {
				// console.log('no need to get count - no new mail. resetting lastCheck');
				modules['betteReddit'].setUnreadCount(0);
				RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.'+RESUtils.loggedInUser(), 0);
			}
		}
	},
	setUnreadCount: function(count) {
		if (count>0) {
			if (this.options.showUnreadCountInTitle.value) {
				var newTitle = '[' + count + '] ' + document.title.replace(/^\[[\d]+\]\s/,'');
				document.title = newTitle;
			}
			if (this.options.showUnreadCountInFavicon.value) {
				Tinycon.setBubble(count);
			}
			if (this.options.showUnreadCount.value) {
				modules['betteReddit'].mailCount.display = 'inline-block'
				modules['betteReddit'].mailCount.textContent = '['+count+']';
				if (modules['neverEndingReddit'].NREMailCount) {
					modules['neverEndingReddit'].NREMailCount.display = 'inline-block'
					modules['neverEndingReddit'].NREMailCount.textContent = '['+count+']';
				}
			}
		} else {
			var newTitle = document.title.replace(/^\[[\d]+\]\s/,'');
			document.title = newTitle;
			if (modules['betteReddit'].mailCount) {
				modules['betteReddit'].mailCount.display = 'none';
				$(modules['betteReddit'].mailCount).html('');
				if (modules['neverEndingReddit'].NREMailCount) {
					modules['neverEndingReddit'].NREMailCount.display = 'none'
					$(modules['neverEndingReddit'].NREMailCount).html('');
				}
			}
			if (this.options.showUnreadCountInFavicon.value) {
				Tinycon.setBubble(0);
			}
		}
	},
	toolbarFixLinks: [
		'etsy.com',
		'youtube.com',
		'youtu.be',
		'twitter.com',
		'teamliquid.net',
		'flickr.com',
		'github.com',
		'battle.net',
		'play.google.com',
		'plus.google.com'
	],
	checkToolbarLink: function(url) {
		for (var i=0, len=this.toolbarFixLinks.length; i<len; i++) {
			if (url.indexOf(this.toolbarFixLinks[i]) != -1) return true;
		}
		return false;
	},
	toolbarFix: function(ele) {
		var root = ele || document;
		var links = root.querySelectorAll('div.entry a.title');
		for (var i=0, len=links.length; i<len; i++) {
			if (modules['betteReddit'].checkToolbarLink(links[i].getAttribute('href'))) {
				links[i].removeAttribute('onmousedown');
			}
			// patch below for comments pages thanks to redditor and resident helperninja gavin19
			if (links[i].getAttribute('srcurl')) {
				if (modules['betteReddit'].checkToolbarLink(links[i].getAttribute('srcurl'))) {
					links[i].removeAttribute('onmousedown');
				}
			}
		}
	},
	fullComments: function(ele) {
		var root = ele || document;
		var entries = root.querySelectorAll('#siteTable .entry');

		for (var i=0, len=entries.length; i<len;i++) {
			var linkEle = entries[i].querySelector('A.bylink');
			var thisCommentsLink = '';
			if ((typeof(linkEle) != 'undefined') && (linkEle != null)) {
				thisCommentsLink = linkEle.getAttribute('href');
			}
			if (thisCommentsLink != '') {
				thisCommentsSplit = thisCommentsLink.split("/");
				thisCommentsSplit.pop();
				thisCommentsLink = thisCommentsSplit.join("/");
				linkList = entries[i].querySelector('.flat-list');
				var fullCommentsLink = document.createElement('li');
				$(fullCommentsLink).html('<a class="redditFullComments" href="' + escapeHTML(thisCommentsLink) + '">'+ escapeHTML(this.options.fullCommentsText.value) +'</a>');
				linkList.appendChild(fullCommentsLink);
			}
		}
	},
	editMyComments: function(ele) {
		var root = ele || document;
		var entries = root.querySelectorAll('#siteTable .entry');
		for (var i=0, len=entries.length; i<len;i++) {
			var linkEle = entries[i].querySelector('A.bylink');
			var thisCommentsLink = '';
			if ((typeof(linkEle) != 'undefined') && (linkEle != null)) {
				thisCommentsLink = linkEle.getAttribute('href');
			}
			if (thisCommentsLink != '') {
				permalink = entries[i].querySelector('.flat-list li.first');
				var editLink = document.createElement('li');
				$(editLink).html('<a onclick="return edit_usertext(this)" href="javascript:void(0);">edit</a>');
				insertAfter(permalink, editLink);
			}
		}
	},
	fixSaveLinks: function(ele) {
		var root = ele || document;
		var saveLinks = root.querySelectorAll('FORM.save-button > SPAN > A');
		for (var i=0, len=saveLinks.length; i<len; i++) {
			saveLinks[i].removeAttribute('onclick');
			saveLinks[i].setAttribute('action','save');
			saveLinks[i].addEventListener('click', modules['betteReddit'].saveLink, false);
		}
		var unsaveLinks = document.querySelectorAll('FORM.unsave-button > SPAN > A');
		for (var i=0, len=saveLinks.length; i<len; i++) {
			if (typeof(unsaveLinks[i]) != 'undefined') {
				unsaveLinks[i].removeAttribute('onclick');
				unsaveLinks[i].setAttribute('action','unsave');
				unsaveLinks[i].addEventListener('click', modules['betteReddit'].saveLink, false);
			}
		}
	},
	fixHideLinks: function(ele) {
		var root = ele || document;
		var hideLinks = root.querySelectorAll('FORM.hide-button > SPAN > A');
		for (var i=0, len=hideLinks.length; i<len; i++) {
			hideLinks[i].removeAttribute('onclick');
			hideLinks[i].setAttribute('action','hide');
			hideLinks[i].addEventListener('click', modules['betteReddit'].hideLinkEventHandler, false);
		}
		var unhideLinks = document.querySelectorAll('FORM.unhide-button > SPAN > A');
		for (var i=0, len=hideLinks.length; i<len; i++) {
			if (typeof(unhideLinks[i]) != 'undefined') {
				unhideLinks[i].removeAttribute('onclick');
				unhideLinks[i].setAttribute('action','unhide');
				unhideLinks[i].addEventListener('click', modules['betteReddit'].hideLinkEventHandler, false);
			}
		}
	},
	saveLink: function(e) {
		if (e) modules['betteReddit'].saveLinkClicked = e.target;
		if (modules['betteReddit'].saveLinkClicked.getAttribute('action') == 'unsave') {
			$(modules['betteReddit'].saveLinkClicked).text('unsaving...');
		} else {
			$(modules['betteReddit'].saveLinkClicked).text('saving...');
		}
		if (modules['betteReddit'].modhash) {
			var action = modules['betteReddit'].saveLinkClicked.getAttribute('action');
			var parentThing = modules['betteReddit'].saveLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
			var idRe = /id-([\w]+)/i;
			var getLinkid = idRe.exec(parentThing.getAttribute('class'));
			var linkid = getLinkid[1];
			if (action == 'unsave') {
				var executed = 'unsaved';
				var apiURL = location.protocol + '//'+location.hostname+'/api/unsave';
			} else {
				var executed = 'saved';
				var apiURL = location.protocol + '//'+location.hostname+'/api/save';
			}
			var params = 'id='+linkid+'&executed='+executed+'&uh='+modules['betteReddit'].modhash+'&renderstyle=html';
			GM_xmlhttpRequest({
				method:	"POST",
				url:	apiURL,
				data: params,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				onload:	function(response) {
					if (response.status == 200) {
						if (modules['betteReddit'].saveLinkClicked.getAttribute('action') == 'unsave') {
							$(modules['betteReddit'].saveLinkClicked).text('save');
							modules['betteReddit'].saveLinkClicked.setAttribute('action','save');
						} else {
							$(modules['betteReddit'].saveLinkClicked).text('unsave');
							modules['betteReddit'].saveLinkClicked.setAttribute('action','unsave');
						}
					} else {
						delete modules['betteReddit'].modhash;
						alert('Sorry, there was an error trying to '+modules['betteReddit'].saveLinkClicked.getAttribute('action')+' your submission. Try clicking again.');
					}
				}
			});
		} else {
			GM_xmlhttpRequest({
				method:	"GET",
				url:	location.protocol + '//'+location.hostname+'/api/me.json?app=res',
				onload:	function(response) {
					var data = safeJSON.parse(response.responseText);
					if (typeof(data.data) == 'undefined') {
						alert('Sorry, there was an error trying to '+modules['betteReddit'].saveLinkClicked.getAttribute('action')+' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
					} else if ((typeof(data.data.modhash) != 'undefined') && (data.data.modhash)) {
						modules['betteReddit'].modhash = data.data.modhash;
						modules['betteReddit'].saveLink();
					}
				}
			});
		}
	},
	hideLinkEventHandler: function(e) {
		modules['betteReddit'].hideLink(e.target);
	},
	hideLink: function(clickedLink) {
		if (clickedLink.getAttribute('action') == 'unhide') {
			$(clickedLink).text('unhiding...');
		} else {
			$(clickedLink).text('hiding...');
		}
		if (modules['betteReddit'].modhash) {
			var action = clickedLink.getAttribute('action');
			var parentThing = clickedLink.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
			var idRe = /id-([\w]+)/i;
			var getLinkid = idRe.exec(parentThing.getAttribute('class'));
			var linkid = getLinkid[1];
			if (action == 'unhide') {
				var executed = 'unhidden';
				var apiURL = 'http://'+location.hostname+'/api/unhide';
			} else {
				var executed = 'hidden';
				var apiURL = 'http://'+location.hostname+'/api/hide';
			}
			var params = 'id='+linkid+'&executed='+executed+'&uh='+modules['betteReddit'].modhash+'&renderstyle=html';
			if (RESUtils.currentSubreddit()) {
				params += '&r='+RESUtils.currentSubreddit();
			}
			GM_xmlhttpRequest({
				method:	"POST",
				url:	apiURL,
				data: params,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				onload:	function(response) {
					if (response.status == 200) {
						if (clickedLink.getAttribute('action') == 'unhide') {
							$(clickedLink).text('hide');
							clickedLink.setAttribute('action','hide');
							if (typeof(modules['betteReddit'].hideTimer) != 'undefined') clearTimeout(modules['betteReddit'].hideTimer);
						} else {
							$(clickedLink).text('unhide');
							clickedLink.setAttribute('action','unhide');
							modules['betteReddit'].hideTimer = setTimeout(function() {
								modules['betteReddit'].hideFader(clickedLink);
							}, 5000);
						}
					} else {
						delete modules['betteReddit'].modhash;
						alert('Sorry, there was an error trying to '+clickedLink.getAttribute('action')+' your submission. Try clicking again.');
					}
				}
			});
		} else {
			GM_xmlhttpRequest({
				method:	"GET",
				url:	location.protocol + '//'+location.hostname+'/api/me.json?app=res',
				onload:	function(response) {
					var data = safeJSON.parse(response.responseText);
					if (typeof(data.data) == 'undefined') {
						alert('Sorry, there was an error trying to '+clickedLink.getAttribute('action')+' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
					} else if ((typeof(data.data.modhash) != 'undefined') && (data.data.modhash)) {
						modules['betteReddit'].modhash = data.data.modhash;
						modules['betteReddit'].hideLink(clickedLink);
					}
				}
			});
		}
	},
	hideFader: function(ele) {
		var parentThing = ele.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
		RESUtils.fadeElementOut(parentThing, 0.3);
	},
	searchSubredditByDefault: function() {
		// Reddit now has this feature... but for some reason the box isn't checked by default, so we'll still do that...
		var restrictSearch = document.body.querySelector('INPUT[name=restrict_sr]');
		if (restrictSearch) {
			restrictSearch.checked = true;
		}
	},
	getVideoTimes: function(obj) {
		obj = obj || document;
		var youtubeLinks = obj.querySelectorAll('a.title[href*="youtube.com"]');
		if (youtubeLinks) {
			var re = new RegExp(/[\[|\(][0-9]*:[0-9]*[\]|\)]/), ytLinks = [];
			for (var i=0, len=youtubeLinks.length; i<len; i+=1) {
				if(!youtubeLinks[i].innerHTML.match(re)) {
					ytLinks.push(youtubeLinks[i]);
				}
			}
			youtubeLinks = ytLinks;
			var getYoutubeIDRegex = /\?v=([\w\-]{11})&?/i;
			var getYoutubeStartTimeRegex = /\[[\d]+:[\d]+\]/i;
			var titleHasTimeRegex = 
			// var getYoutubeIDRegex = /\?v=([\w\-]+)&?/i;
			modules['betteReddit'].youtubeLinkIDs = [];
			modules['betteReddit'].youtubeLinkRefs = {};
			for (var i=0, len=youtubeLinks.length; i<len; i++) {
				var match = getYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href'));
				if (match) {
					// add quotes so URL creation is doable with just a join...
					var thisYTID = '"'+match[1]+'"';
					modules['betteReddit'].youtubeLinkIDs.push(thisYTID);
					modules['betteReddit'].youtubeLinkRefs[thisYTID] = youtubeLinks[i];
				}
				var timeMatch = getYoutubeStartTimeRegex.exec(youtubeLinks[i].getAttribute('href'));
				var titleMatch = youtubeLinks[i].innerHTML.match(titleHasTimeRegex);
				if (timeMatch && !titleMatch) {
					youtubeLinks[i].textContent += ' (@'+timeMatch[1]+')';
				}
			}
			modules['betteReddit'].getVideoJSON();
		}
	},
	getVideoJSON: function() {
		var thisBatch = modules['betteReddit'].youtubeLinkIDs.splice(0,8);
		if (thisBatch.length) {
			var thisIDString = thisBatch.join('%7C');
			// var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&fields=entry(id,media:group(yt:duration))&alt=json';
			var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&v=2&fields=entry(id,title,media:group(yt:duration,yt:videoid,yt:uploaded))&alt=json';
			GM_xmlhttpRequest({
				method:	"GET",
				url:	jsonURL,
				onload:	function(response) {
					var data = safeJSON.parse(response.responseText, null, true);
					if ((typeof(data.feed) != 'undefined') && (typeof(data.feed.entry) != 'undefined')) {
						for (var i=0, len=data.feed.entry.length; i<len; i++) {
							var thisYTID = '"'+data.feed.entry[i]['media$group']['yt$videoid']['$t']+'"';
							var thisTotalSecs = data.feed.entry[i]['media$group']['yt$duration']['seconds'];
							var thisTitle = data.feed.entry[i]['title']['$t'];
							var thisMins = Math.floor(thisTotalSecs/60);
							var thisSecs = (thisTotalSecs%60);
							if (thisSecs < 10) thisSecs = '0'+thisSecs;
							var thisTime = ' - [' + thisMins + ':' + thisSecs + ']';
							if(modules['betteReddit'].options.videoUploaded.value){
								var thisUploaded = data.feed.entry[i]['media$group']['yt$uploaded']['$t'];
								thisUploaded = thisUploaded.match(/[^T]*/);
								thisTime += '['+ thisUploaded +']';
							}
							if (typeof(modules['betteReddit'].youtubeLinkRefs[thisYTID]) != 'undefined') {
								modules['betteReddit'].youtubeLinkRefs[thisYTID].textContent += ' ' + thisTime;
								modules['betteReddit'].youtubeLinkRefs[thisYTID].setAttribute('title','YouTube title: '+thisTitle);
							}
						}
						// wait a bit, make another request...
						setTimeout(modules['betteReddit'].getVideoJSON, 500);
					}
				}
			});
		}
	},
	pinSubredditBar: function() {
		// Make the subreddit bar at the top of the page a fixed element
		// The subreddit manager code changes the document's structure
		var sm = modules['subredditManager'].isEnabled();

		var sb = document.getElementById('sr-header-area');
		if (sb == null) return; // reddit is under heavy load
		var header = document.getElementById('header');

		// add a dummy <div> inside the header to replace the subreddit bar (for spacing)
		var spacer = document.createElement('div');
		// null parameter is necessary for FF3.6 compatibility.
		spacer.style.paddingTop = window.getComputedStyle(sb, null).paddingTop;
		spacer.style.paddingBottom = window.getComputedStyle(sb, null).paddingBottom;

		// HACK: for some reason, if the SM is enabled, the SB gets squeezed horizontally,
		//       and takes up three rows of vertical space (even at low horizontal resolution).
		if (sm) spacer.style.height = (parseInt(window.getComputedStyle(sb, null).height) / 3 - 3)+'px';
		else    spacer.style.height = window.getComputedStyle(sb, null).height;

		//window.setTimeout(function(){
		// add the spacer; take the subreddit bar out of the header and put it above
		header.insertBefore(spacer, sb);
		document.body.insertBefore(sb,header);

		// make it fixed
		// RESUtils.addCSS('div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; box-shadow: 0px 2px 2px #AAA;}');
		// something changed on Reddit on 1/31/2012 that made this header-bottom-left margin break subreddit stylesheets... commenting out seems to fix it?
		// and now later on 1/31 they've changed it back and I need to add this line back in...
		RESUtils.addCSS('#header-bottom-left { margin-top: 19px; }');
		RESUtils.addCSS('div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; }');
		this.pinCommonElements(sm);
	},
	pinUserBar: function() {
		// Make the user bar at the top of the page a fixed element
		this.userBarElement = document.getElementById('header-bottom-right');
		var thisHeight = $('#header-bottom-right').height();
		RESUtils.addCSS('#header-bottom-right:hover { opacity: 1 !important;  }');
		RESUtils.addCSS('#header-bottom-right { height: '+parseInt(thisHeight+1)+'px; }');
		// make the account switcher menu fixed
		window.addEventListener('scroll', modules['betteReddit'].handleScroll, false);
		this.pinCommonElements();
	},
	handleScroll: function(e) {
		if (modules['betteReddit'].scrollTimer) clearTimeout(modules['betteReddit'].scrollTimer);
		modules['betteReddit'].scrollTimer = setTimeout(modules['betteReddit'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function(e) {
		if (RESUtils.elementInViewport(modules['betteReddit'].userBarElement)) {
			modules['betteReddit'].userBarElement.setAttribute('style','');
			if (typeof(modules['accountSwitcher'].accountMenu) != 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style','position: absolute;');
			}
		} else if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
			if (typeof(modules['accountSwitcher'].accountMenu) != 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style','position: fixed;');
			}
			modules['betteReddit'].userBarElement.setAttribute('style','position: fixed; z-index: 10000 !important; top: 19px; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		} else {
			if (typeof(modules['accountSwitcher'].accountMenu) != 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style','position: fixed;');
			}
			modules['betteReddit'].userBarElement.setAttribute('style','position: fixed; z-index: 10000 !important; top: 0px; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		}
	},
	pinHeader: function() {
		// Makes the Full header a fixed element

		// the subreddit manager code changes the document's structure
		var sm = modules['subredditManager'].isEnabled();

		var header = document.getElementById('header');
		if (header == null) return; // reddit is under heavy load

		// add a dummy <div> to the document for spacing
		var spacer = document.createElement('div');
		spacer.id = 'RESPinnedHeaderSpacer';

		// without the next line, the subreddit manager would make the subreddit bar three lines tall and very narrow
		RESUtils.addCSS('#sr-header-area {left: 0; right: 0;}');
		spacer.style.height = $('#header').outerHeight() + "px";

		// insert the spacer
		document.body.insertBefore(spacer, header.nextSibling);

		// make the header fixed
		RESUtils.addCSS('#header, #RESAccountSwitcherDropdown {position:fixed;}');
		// RESUtils.addCSS('#header {left: 0; right: 0; box-shadow: 0px 2px 2px #AAA;}');
		RESUtils.addCSS('#header {left: 0; right: 0; }');
		var headerHeight = $('#header').height() + 15;
		RESUtils.addCSS('#RESNotifications { top: '+headerHeight+'px } ');
		this.pinCommonElements(sm);

		// TODO Needs testing
		// Sometimes this gets executed before the subreddit logo has finished loading. When that
		// happens, the spacer gets created too short, so when the SR logo finally loads, the header
		// grows and overlaps the top of the page, potentially obscuring the first link. This checks
		// to see if the image is finished loading. If it is, then the spacer's height is set. Otherwise,
		// it pauses, then loops.
		// added a check that this element exists, so it doesn't error out RES.
		if (document.getElementById('header-img') && (!document.getElementById('header-img').complete)) setTimeout(function(){
					   if (document.getElementById('header-img').complete)
							   // null parameter is necessary for FF3.6 compatibility.
							   document.getElementById('RESPinnedHeaderSpacer').style.height = window.getComputedStyle(document.getElementById('header'), null).height;
					   else setTimeout(arguments.callee, 10);
			   }, 10);
	},
	pinCommonElements: function(sm) {
		// pin the elements common to both pinHeader() and pinSubredditBar()
		if (sm) {
			   // RES's subreddit menu
			   RESUtils.addCSS('#RESSubredditGroupDropdown, #srList, #RESShortcutsAddFormContainer, #editShortcutDialog {position: fixed !important;}');
		} else {
			   RESUtils.addCSS('#sr-more-link: {position: fixed;}');
			   // reddit's subreddit menu (not the RES one); only shows up if you are subscribed to enough subreddits (>= ~20).
			   RESUtils.addCSS('div#subreddit_dropdown.drop-choices {position: fixed;}');
		}
	},
	showInputLength: function() {
		RESUtils.addCSS('.RESCharCounter { color: grey; float: right; }');
		RESUtils.addCSS('.RESCharCounter.tooLong { color: red; }');
		$('#title-field span.title').after($('<span>').attr('id', 'titleLength').attr('title','character limit: 300').addClass('RESCharCounter').text('0/300'));
		this.titleLength = $('#titleLength');
		$('#title-field textarea[name="title"]').bind('input', function() {
			var len = $(this).val().length;
			if (len > 300) {
				$(modules['betteReddit'].titleLength).text(len+'/300').addClass('tooLong');
			} else {
				$(modules['betteReddit'].titleLength).text(len+'/300').removeClass('tooLong');
			}
		});

		$('#text-field span.title + span').after($('<span>').attr('id', 'textLength').attr('title','character limit: 10,000').addClass('RESCharCounter').text('0/10000'));
		$('#text-field textarea[name="text"]').bind('input', function() {
			$('#textLength').text($(this).val().length + '/10000');
		});
	}
};

modules['singleClick'] = {
	moduleID: 'singleClick',
	moduleName: 'Single Click Opener',
	category: 'UI',
	options: {
		openOrder: {
			type: 'enum',
			values: [
				{ name: 'open comments then link', value: 'commentsfirst' },
				{ name: 'open link then comments', value: 'linkfirst' }
			],
			value: 'commentsfirst',
			description: 'What order to open the link/comments in.'
		},
		hideLEC: {
			type: 'boolean',
			value: false,
			description: 'Hide the [l=c] when the link is the same as the comments page'
		},
		openBackground: {
			type: 'boolean',
			value: false,
			description: 'Open the [l+c] link in background tabs'
		}
	},
	description: 'Adds an [l+c] link that opens a link and the comments page in new tabs for you in one click.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i,
		/https?:\/\/([a-z]+).reddit.com\/r\/[-\w\._]*\//i
	),
	exclude: Array(
		/https?:\/\/([a-z]+).reddit.com\/r\/[-\w\._\/\?]*\/comments[-\w\._\/\?=]*/i
	),
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.redditSingleClick { color: #888888; font-weight: bold; cursor: pointer; padding: 0 1px; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff here!
			this.applyLinks();
			// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...
			RESUtils.watchForElement('siteTable', modules['singleClick'].applyLinks);
		}
	},
	applyLinks: function(ele) {
		var ele = ele || document;
		var entries = ele.querySelectorAll('#siteTable .entry, #siteTable_organic .entry');
		for (var i=0, len=entries.length; i<len;i++) {
			if ((typeof(entries[i]) != 'undefined') && (!(hasClass(entries[i],'lcTagged')))) {
				addClass(entries[i],'lcTagged')
				var thisLA = entries[i].querySelector('A.title');
				if (thisLA != null) {
					var thisLink = thisLA.getAttribute('href');
					var thisComments = entries[i].querySelector('.comments');
					if (!(thisLink.match(/^http/i))) {
						thisLink = 'http://' + document.domain + thisLink;
					}
					var thisUL = entries[i].querySelector('ul.flat-list');
					var singleClickLI = document.createElement('li');
					// changed from a link to a span because you can't cancel a new window on middle click of a link during the mousedown event, and a click event isn't triggered.
					var singleClickLink = document.createElement('span');
					// singleClickLink.setAttribute('href','javascript:void(0);');
					singleClickLink.setAttribute('class','redditSingleClick');
					singleClickLink.setAttribute('thisLink',thisLink);
					singleClickLink.setAttribute('thisComments',thisComments);
					if (thisLink != thisComments) {
						singleClickLink.textContent = '[l+c]';
					} else if (!(modules['singleClick'].options.hideLEC.value)) {
						singleClickLink.textContent = '[l=c]';
					}
					singleClickLI.appendChild(singleClickLink);
					thisUL.appendChild(singleClickLI);
					// we have to switch to mousedown because Webkit is being a douche and not triggering click events on middle click.  
					// ?? We should still preventDefault on a click though, maybe?
					singleClickLink.addEventListener('mousedown', function(e) {
						e.preventDefault();
						var lcMouseBtn = (modules['singleClick'].options.openBackground.value) ? 1 : 0;
						if (e.button != 2) {
							// check if it's a relative link (no http://domain) because chrome barfs on these when creating a new tab...
							var thisLink = $(this).parent().parent().parent().find('a.title').attr('href');
							if (!(thisLink.match(/^http/i))) {
								thisLink = 'http://' + document.domain + thisLink;
							}
							if (typeof(chrome) != 'undefined') {
								var thisJSON = {
									requestType: 'singleClick',
									linkURL: thisLink,
									openOrder: modules['singleClick'].options.openOrder.value,
									commentsURL: this.getAttribute('thisComments'),
									button: lcMouseBtn,
									ctrl: e.ctrlKey
								};
								chrome.extension.sendMessage(thisJSON);
							} else if (typeof(safari) != 'undefined') {
								var thisJSON = {
									requestType: 'singleClick',
									linkURL: thisLink,
									openOrder: modules['singleClick'].options.openOrder.value,
									commentsURL: this.getAttribute('thisComments'),
									button: lcMouseBtn,
									ctrl: e.ctrlKey
								}
								safari.self.tab.dispatchMessage("singleClick", thisJSON);
							} else if (typeof(opera) != 'undefined') {
								var thisJSON = {
									requestType: 'singleClick',
									linkURL: thisLink,
									openOrder: modules['singleClick'].options.openOrder.value,
									commentsURL: this.getAttribute('thisComments'),
									button: lcMouseBtn,
									ctrl: e.ctrlKey
								}
								opera.extension.postMessage(JSON.stringify(thisJSON));
							} else if (typeof(self.on) == 'function') {
								var thisJSON = {
									requestType: 'singleClick',
									linkURL: thisLink,
									openOrder: modules['singleClick'].options.openOrder.value,
									commentsURL: this.getAttribute('thisComments'),
									button: lcMouseBtn,
									ctrl: e.ctrlKey
								}
								self.postMessage(thisJSON);
							} else {
								var thisLink = $(this).parent().parent().parent().find('a.title').attr('href');
								if (!(thisLink.match(/^http/i))) {
									thisLink = 'http://' + document.domain + thisLink;
								}
								if (modules['singleClick'].options.openOrder.value == 'commentsfirst') {
									if (thisLink != this.getAttribute('thisComments')) {
										// console.log('open comments');
										window.open(this.getAttribute('thisComments'));
									}
									window.open(thisLink);
								} else {
									window.open(thisLink);
									if (thisLink != this.getAttribute('thisComments')) {
										// console.log('open comments');
										window.open(this.getAttribute('thisComments'));
									}
								}
							}
						}
					}, false);
				}
			}
		}

	}
};

modules['commentPreview'] = {
	moduleID: 'commentPreview',
	moduleName: 'Live Comment Preview',
	category: 'Comments',
	options: {
		// any configurable options you have go here...
		commentingAs: {
			type: 'boolean',
			value: true,
			description: 'Shows your currently logged in username to avoid posting from the wrong account.'
		},
		subredditAutocomplete: {
			type: 'boolean',
			value: true,
			description: 'Show subreddit autocomplete tool when typing in posts, comments and replies'
		},
		keyboardShortcuts: {
			type: 'boolean',
			value: true,
			description: 'Use keyboard shortcuts to apply styles to selected text'
		},
		macros: {
			type: 'table',
			addRowText: '+add shortcut',
			fields: [
				{ name: 'label', type: 'text' },
				{ name: 'text', type: 'textarea' }
			],
			value: [
			],
			description: "Add buttons to insert frequently used snippets of text."
		}
	},
	description: 'Provides a live preview of comments, as well as shortcuts for easier markdown.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/message\/[-\w\.]*\/?[-\w\.]*/i,
		/https?:\/\/([a-z]+).reddit.com\/r\/[-\w\.]*\/submit\/?/i,
		/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.\/]*\/?/i,
		/https?:\/\/([a-z]+).reddit.com\/submit\/?/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.markdownEditor { white-space: nowrap;  }');
			RESUtils.addCSS('.markdownEditor a { margin-right: 8px; text-decoration: none; font-size: 11px; }');
			RESUtils.addCSS('.selectedItem { color: #ffffff; background-color: #5f99cf; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview { position: relative; width: auto; margin-bottom: 15px; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview .RESDialogContents h3 { font-weight: bold; }');
			RESUtils.addCSS('.RESMacroDropdownTitle, .RESMacroDropdownTitleOverlay { cursor: pointer; display: inline-block; font-size: 11px; text-decoration: underline; color: gray; padding-left: 2px; padding-right: 21px; background-image: url(http://www.redditstatic.com/droparrowgray.gif); background-position: 100% 50%; background-repeat: no-repeat; }');
			RESUtils.addCSS('.RESMacroDropdownTitleOverlay { cursor: pointer; }');
			RESUtils.addCSS('#RESMacroDropdown { display: none; }');
			RESUtils.addCSS('#RESMacroDropdownContainer { display: none; position: absolute; }');
			RESUtils.addCSS('#RESMacroDropdownList { margin-top: 0; width: auto; max-width: 300px; }');
			RESUtils.addCSS('#RESMacroDropdown li { padding-right: 10px; height: 25px; line-height: 24px; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if (this.options.subredditAutocomplete.value) this.subredditAutocomplete();

			// ###########################################################################
			// Start user script 
			// ###########################################################################


			this.converter = SnuOwnd.getParser();


			// Bootstrap with the top-level comment always in the page, and editors for your existing comments.
			modules['commentPreview'].wireupCommentEditors();
			
			// Add "view source" buttons
			modules['commentPreview'].wireupViewSourceButtons(document.body);

			RESUtils.watchForElement('newCommentsForms', modules['commentPreview'].wireupCommentEditors);
			RESUtils.watchForElement('newComments', modules['commentPreview'].wireupViewSourceButtons);
			
			$('.entry .flat-list.buttons li.viewSource').live('click', modules['commentPreview'].viewSource);

		}
	},
	wireupViewSourceButtons: function(ele) {
		if (ele == null) ele = document;
		if ((RESUtils.pageType() == 'comments') || (RESUtils.pageType() == 'inbox'))  {
			var menus = ele.querySelectorAll('.entry .flat-list.buttons li:first-child');
			RESUtils.forEachChunked(menus, 15, 1000, function(menu, i, array) {
				var viewSource = document.createElement('li');
				$(viewSource).addClass('viewSource').html('<a href="javascript:void(0)">source</a>');
				insertAfter(menu.nextSibling != null?menu.nextSibling:menu, viewSource);
			});			
		}
	},
	//Find any fieldsets with a class of liveComment as children of this element and remove them.
	removeExistingPreview: function( parent ) {
		var previews = parent.querySelectorAll('div.livePreview');
		
		for (var i = 0, preview = null; preview = previews[i]; i++)
		{		
			preview.parentNode.removeChild( preview );
			break;
		}
	},
	removeExistingEditor: function( parent ) {
		// var divs = parent.getElementsByTagName('div');
		var divs = parent.querySelectorAll('.markdownEditor, .commentingAs');
		
		for (var i = 0, div = null; div = divs[i]; i++)
		{
			div.parentNode.removeChild( div );
		}
	},
	addPreviewToParent: function( parent ) {	
		// remove any existing preview, because reddit's clone will copy the other one in here...
		modules['commentPreview'].removeExistingPreview( parent );		
		// also remove the existing editor, same reason.
		modules['commentPreview'].removeExistingEditor( parent );

		/*
		var set=document.createElement('fieldset');
		set.setAttribute('class', 'liveComment');

		var legend=document.createElement('legend');
		legend.textContent='Live Preview';

		var preview=document.createElement('div');
		preview.setAttribute('class', 'md');

		set.appendChild(legend);
		set.appendChild(preview);
		*/
		var previewContainer = document.createElement('div');
		previewContainer.setAttribute('class','RESDialogSmall livePreview');
		$(previewContainer).html('<h3>Live Preview</h3>');
		
		var preview = document.createElement('div');
		preview.setAttribute('class','md RESDialogContents');
		previewContainer.appendChild(preview);

		// modification: hide this thing until someone types...
		preview.parentNode.style.display = 'none';
		
		// parent.appendChild(set);
		parent.appendChild(previewContainer);

		var textAreas = parent.getElementsByTagName('textarea');
		
		if ( textAreas[0] )
		{		
			var targetTextArea = textAreas[0];
		
			targetTextArea.addEventListener('input', function(e) {
				modules['commentPreview'].refreshPreview(preview, targetTextArea);
			}, false);			
			if (modules['commentPreview'].options.keyboardShortcuts.value) {
				targetTextArea.addEventListener(
					'keydown',
					function(e)
					{
						if ((e.ctrlKey || e.metaKey) && (!e.shiftKey) && (!e.altKey)) {
							/*
								text = text.replace(/(?:^|[^\S])(~~)((?:.+)(?:(?:\n.+)+)?)\1/g,
									" <del>$2</del>");
									
								// <strong> must go first:
								// text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,
								// text = text.replace(/(^|[^\S])(\*\*|__)(.+)\n?(.*)\2/g,
								// text = text.replace(/(\*\*|__)((?:.+)(?:(?:\n.+)+)?)\1/g,
								text = text.replace(/(\*\*)((?:.+?)(?:(?:\n.*)+)?)\1/g,
									"<strong>$2</strong>");

								// text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,
								// (^|[^\S])(\*|_)([^*]+)(([\n{1}].+)+)?\2
								// (^|[^\S])(\*|_)[^*]+\2
								// text = text.replace(/(^|[^\S])(\*|_)(.+)\n?(.*)\2/g,
								text = text.replace(/(\*)((?:.+?)(?:(?:\n.*)+)?)\1/g,
									"<em>$2</em>");
								text = text.replace(/(?:^|[^\S])(_)((?:.+)(?:(?:\n.*)+)?)\1/g,
									" <em>$2</em>");
							
							*/
							var toReplaceSplit = $(e.target).getSelection().text.split('\n\n');
							var end = '\n\n';
							for (var i=0, len=toReplaceSplit.length; i<len; i++) {
								toReplace = toReplaceSplit[i];
								if (i==len-1) end = '';
								if (toReplace != '') {
									switch (String.fromCharCode(e.keyCode)) {
										case 'I':
											e.preventDefault();
											if (((toReplace.substr(0,1) == '*') && (toReplace.substr(0,2) != '**')) && ((toReplace.substr(-1) == '*') && (toReplace.substr(-2) != '**'))) {
												toReplace = toReplace.substr(1,toReplace.length-2);
											} else {
												toReplace = '*'+toReplace+'*';
											}
											toReplace += end;
											$(e.target).replaceSelection(toReplace,true);
											break;
										case 'B':
											e.preventDefault();
											if ((toReplace.substr(0,2) == '**') && (toReplace.substr(-2) == '**')) {
												toReplace = toReplace.substr(2,toReplace.length-4);
											} else {
												toReplace = '**'+toReplace+'**';
											}
											toReplace += end;
											$(e.target).replaceSelection(toReplace,true);
											break;
										case 'S':
											e.preventDefault();
											if ((toReplace.substr(0,2) == '~~') && (toReplace.substr(-2) == '~~')) {
												toReplace = toReplace.substr(2,toReplace.length-4);
											} else {
												toReplace = '~~'+toReplace+'~~';
											}
											toReplace += end;
											$(e.target).replaceSelection(toReplace,true);
											break;
									}
								}
							}
						}
					},
					false
				);	
			}

			
			preview.textArea = targetTextArea;
		
			modules['commentPreview'].addPreviewClearOnCommentSubmit( parent, preview );
		}
		
		return preview;
	},
	addPreviewClearOnCommentSubmit: function( parent, preview ) {
		var buttons = parent.getElementsByTagName('button');
		
		for (var i = 0, button = null; button = buttons[i]; i++)
		{
			if ( button.getAttribute('class') == "save" )
			{
				button.addEventListener(
					'click', 
					function()
					{
						$(preview).html('');
					}, 
					false
				);
			}
		}	
	},
	wireupCommentEditors: function (ele) {
		ele = ele || document.body;
		var editDivs = $(ele).find('div.usertext-edit').each(function() {
			var editDiv = this;
			// console.log('add preview to: ');
			// console.log(editDiv);
			var preview = modules['commentPreview'].addPreviewToParent( editDiv );
			modules['commentPreview'].addMarkdownEditorToForm( editDiv, preview );
		});
		
	},
	refreshPreview: function ( preview, targetTextArea ) {
		// modification: hide this thing if it's empty...
		if (targetTextArea.value == '') {
			preview.parentNode.style.display = 'none';
		} else {
			preview.parentNode.style.display = 'block';
		}
		RESUtils.debounce('refreshPreview', 250, function() {
			$(preview).html(modules['commentPreview'].converter.render(targetTextArea.value));
		});		
	},
	addMarkdownEditorToForm: function ( parent, preview ) {	
		var textAreas = parent.getElementsByTagName('textarea');
		
		if ( !textAreas[0] ) return;
		
		var targetTextArea = textAreas[0];
		targetTextArea.setAttribute('tabIndex',0);
		
		
		var controlBox = document.createElement( 'div' );
		controlBox.setAttribute('class', 'markdownEditor');
		parent.insertBefore( controlBox, parent.firstChild );

		if ((modules['commentPreview'].options.commentingAs.value) && (!(modules['usernameHider'].isEnabled()))) {
			// show who we're commenting as...
			var commentingAs = document.createElement('div');
			commentingAs.setAttribute('class', 'commentingAs');
			$(commentingAs).text('Commenting as: ' + RESUtils.loggedInUser());
			parent.insertBefore( commentingAs, parent.firstChild );
		}
		
		var bold = new modules['commentPreview'].EditControl(
			'<b>Bold</b>',
			function()
			{
				modules['commentPreview'].tagSelection( targetTextArea, '**', '**' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			},
			'ctrl-b'
		);
		
		var italics = new modules['commentPreview'].EditControl(
			'<i>Italic</i>',
			function()
			{
				modules['commentPreview'].tagSelection( targetTextArea, '*', '*' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			},
			'ctrl-i'
		);
		
		var strikethrough = new modules['commentPreview'].EditControl(
			'<del>strike</del>',
			function()
			{
				modules['commentPreview'].tagSelection( targetTextArea, '~~', '~~' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			},
			'ctrl-s'
		);
		
		var superscript = new modules['commentPreview'].EditControl(
			'<sup>sup</sup>',
			function()
			{
				modules['commentPreview'].tagSelection( targetTextArea, '^', '' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			}
		);

		var link = new modules['commentPreview'].EditControl(
			'Link',
			function()
			{
				linkSelection( targetTextArea );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			}
		);
		
		var quote = new modules['commentPreview'].EditControl(
			'|Quote',
			function()
			{
				modules['commentPreview'].prefixSelectionLines( targetTextArea, '>' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			}
		);
		
		var code = new modules['commentPreview'].EditControl(
			'<span style="font-family: Courier New;">Code</span>',
			function()
			{
				modules['commentPreview'].prefixSelectionLines( targetTextArea, '    ' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			}
		);
		
		var bullets = new modules['commentPreview'].EditControl(
			'&bull;Bullets',
			function()
			{
				modules['commentPreview'].prefixSelectionLines( targetTextArea, '* ' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			}
		);
		
		var numbers = new modules['commentPreview'].EditControl(
			'1.Numbers',
			function()
			{
				modules['commentPreview'].prefixSelectionLines( targetTextArea, '1. ' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			}
		);
		
		var disapproval = new modules['commentPreview'].EditControl(
			'&#3232;\_&#3232;',
			function() {
				modules['commentPreview'].prefixCursor( modules['commentPreview'].macroTargetTextarea, '&#3232;\\\_&#3232;' );
				modules['commentPreview'].refreshPreview( modules['commentPreview'].macroTargetPreview, modules['commentPreview'].macroTargetTextarea );
				modules['commentPreview'].macroTargetTextarea.focus();
			}
		);
		
		var promoteRES = new modules['commentPreview'].EditControl(
			'[Promote]',
			function() {
				var thisCount = $(this).data('promoteCount') || 0;
				thisCount++;
				$(this).data('promoteCount',thisCount);
				if (thisCount > 2) {
					$(this).hide();
					modules['commentPreview'].lod();
					return false;
				}
				modules['commentPreview'].prefixSelectionLines( modules['commentPreview'].macroTargetTextarea, '[Reddit Enhancement Suite](http://redditenhancementsuite.com)' );
				modules['commentPreview'].refreshPreview( modules['commentPreview'].macroTargetPreview, modules['commentPreview'].macroTargetTextarea );
				modules['commentPreview'].macroTargetTextarea.focus();
			}
		);
		
		var reddiquette = new modules['commentPreview'].EditControl(
			'reddiquette',
			function() {
				var thisCount = $(this).data('promoteCount') || 0;
				thisCount++;
				$(this).data('promoteCount',thisCount);
				if (thisCount > 2) {
					$(this).hide();
					// modules['commentPreview'].lod();
					return false;
				}
				modules['commentPreview'].prefixCursor( targetTextArea, '[reddiquette](http://www.reddit.com/help/reddiquette) ' );
				modules['commentPreview'].refreshPreview( preview, targetTextArea );
				targetTextArea.focus();
			}
		);
		
		controlBox.appendChild( bold.create() );
		controlBox.appendChild( italics.create() );
		controlBox.appendChild( strikethrough.create() );
		controlBox.appendChild( superscript.create() );
		controlBox.appendChild( link.create() );
		controlBox.appendChild( quote.create() );
		controlBox.appendChild( code.create() );
		controlBox.appendChild( bullets.create() );
		controlBox.appendChild( numbers.create() );
		// controlBox.appendChild( disapproval.create() );
		controlBox.appendChild( reddiquette.create() );
		// controlBox.appendChild( promoteRES.create() );
		modules['commentPreview'].macroDropdownTitle = $('<span class="RESMacroDropdownTitle">macros</span>')
		$(controlBox).append(modules['commentPreview'].macroDropdownTitle);
		// add one single dropdown to the document body rather than creating multiples...
		if (typeof(modules['commentPreview'].macroDropdownContainer) == 'undefined') {
			modules['commentPreview'].macroDropdownContainer = $('<span id="RESMacroDropdown"><span class="RESMacroDropdownTitleOverlay">macros</span></span>')
			modules['commentPreview'].macroDropdown = $('<ul id="RESMacroDropdownList" class="RESDropdownList"></ul>')
			var thisLI = $('<li />');
			$(thisLI).append(disapproval.create());
			$(modules['commentPreview'].macroDropdown).append(thisLI);
			thisLI = $('<li />');
			$(thisLI).append(promoteRES.create());
			$(modules['commentPreview'].macroDropdown).append(thisLI);
			Array.prototype.slice.call(modules['commentPreview'].options['macros'].value).forEach(function(elem, index, array) {
				var thisLI = $('<li />');
				$(thisLI).append(new modules['commentPreview'].EditControl(elem[0], function(){
					modules['commentPreview'].prefixCursor( modules['commentPreview'].macroTargetTextarea, elem[1] );
					modules['commentPreview'].refreshPreview( modules['commentPreview'].macroTargetPreview, modules['commentPreview'].macroTargetTextarea );
					$(modules['commentPreview'].macroDropdownContainer).hide();
					modules['commentPreview'].macroTargetTextarea.focus();
				}).create());
				$(modules['commentPreview'].macroDropdown).append(thisLI);
			});
			// add the "+ add macro" button
			var thisLI = $('<li><a href="javascript:void(0)">+ add macro</a>');
			$(thisLI).click(modules['commentPreview'].manageMacros)
			$(modules['commentPreview'].macroDropdown).append(thisLI);
			$(modules['commentPreview'].macroDropdownContainer).append(modules['commentPreview'].macroDropdown);
			$(modules['commentPreview'].macroDropdownContainer).mouseleave(function(e) {
				$(this).hide();
			});
			$(document.body).append( modules['commentPreview'].macroDropdownContainer );
		}
		// attach listeners to dropdowntitles to show the dropdown...
		$(".RESMacroDropdownTitle").live('click', modules['commentPreview'].showMacroDropdown);
	}, 
	EditControl: function ( label, editFunction, shortcutKey ) {
		this.create = function() 
		{
			this.link = document.createElement('a');
			if (shortcutKey) this.link.title = shortcutKey;
			$(this.link).html(label);
			this.link.setAttribute('tabindex','1');
			this.link.href = 'javascript:;';
			// this.link.setAttribute('style','Margin-Right: 15px; text-decoration: none;');
			
			this.link.execute = editFunction;
			
			modules['commentPreview'].addEvent( this.link, 'click', 'execute' );
			
			return this.link;	
		}
	},
	tagSelection: function ( targetTextArea, tagOpen, tagClose, textEscapeFunction ) {	
		//record scroll top to restore it later.
		var scrollTop = targetTextArea.scrollTop;
		
		//We will restore the selection later, so record the current selection.
		var selectionStart = targetTextArea.selectionStart;
		var selectionEnd = targetTextArea.selectionEnd;
		
		var selectedText = targetTextArea.value.substring( selectionStart, selectionEnd );
		
		//Markdown doesn't like it when you tag a word like **this **. The space messes it up. So we'll account for that because Firefox selects the word, and the followign space when you double click a word.
		var potentialTrailingSpace = '';
		
		if( selectedText[ selectedText.length - 1 ] == ' ' )
		{
			potentialTrailingSpace = ' ';
			selectedText = selectedText.substring( 0, selectedText.length - 1 );
		}
		
		if ( textEscapeFunction )
		{
			selectedText = textEscapeFunction( selectedText );
		}
		
		targetTextArea.value = 
			targetTextArea.value.substring( 0, selectionStart ) + //text leading up to the selection start
			tagOpen + 
			selectedText +
			tagClose + 
			potentialTrailingSpace +
			targetTextArea.value.substring( selectionEnd ); //text after the selection end
		
		targetTextArea.selectionStart = selectionStart + tagOpen.length;
		targetTextArea.selectionEnd = selectionEnd + tagOpen.length;
		
		targetTextArea.scrollTop = scrollTop;
	},
	linkSelection: function ( targetTextArea ) {
		var url = prompt( "Enter the URL:", "" );

		if ( url != null )
		{
			modules['commentPreview'].tagSelection(
				targetTextArea,
				'[',
				'](' + url.replace( /\(/, '\\(' ).replace( /\)/, '\\)' ) + ')', //escape parens in url
				function( text )
				{
					return text.replace( /\[/, '\\[' ).replace( /\]/, '\\]' ).replace( /\(/, '\\(' ).replace( /\)/, '\\)' ); //escape brackets and parens in text
				}
			);
		}
	},
	prefixCursor: function ( targetTextArea, prefix ) {
		//Is scrollTop necessary?
		var scrollTop = targetTextArea.scrollTop;
		var text = targetTextArea.value;
		var selectionStart = targetTextArea.selectionStart;
		text = text.slice(0, selectionStart) + prefix + text.slice(selectionStart);
		targetTextArea.value  = text;
		targetTextArea.selectionStart += prefix.length;
		targetTextArea.scrollTop = scrollTop;
	},
	prefixSelectionLines: function ( targetTextArea, prefix ) {
		var scrollTop = targetTextArea.scrollTop;
		var selectionStart = targetTextArea.selectionStart;
		var selectionEnd = targetTextArea.selectionEnd;
		
		var selectedText = targetTextArea.value.substring( selectionStart, selectionEnd );
		
		var lines = selectedText.split( '\n' );
		
		var newValue = '';
		
		for( var i = 0; i < lines.length; i++ )
		{
			// newValue += prefix + lines[i] + '\n';
			newValue += prefix + lines[i];
			if ( ( i + 1 ) != lines.length ) {newValue += '\n';}
		}
		
		targetTextArea.value = 
			targetTextArea.value.substring( 0, selectionStart ) + //text leading up to the selection start
			newValue + 
			targetTextArea.value.substring( selectionEnd ); //text after the selection end
		
		targetTextArea.scrollTop = scrollTop;
	},
	//Delegated event wire-up utitlity. Using this allows you to use the "this" keyword in a delegated function.
	addEvent: function ( target, eventName, handlerName ) {
		target.addEventListener(eventName, function(e){target[handlerName](e);}, false);
	},
	/*
	addParentListener: function (event) {
		var moreCommentsParent = event.currentTarget;
		if (MutationObserver) {
			var mutationNodeToObserve = $(moreCommentsParent).closest('div.sitetable')[0];
			var observer = new MutationObserver(function(mutations) {  
//				mutations.forEach(function(mutation) {
					$(mutations[0].target).find('form').each(function() {
						modules['commentPreview'].wireupCommentEditors( this );
					});
					$(mutations[0].target).find('div.thing').each(function() {
						modules['commentPreview'].wireupCommentEditors( this );
						modules['commentPreview'].wireupViewSourceButtons( this );
					});
//				});
			});

			observer.observe(mutationNodeToObserve, {
				attributes: true, 
				childList: true, 
				characterData: true
			});				
		} else {
			// not currently set up for non mutation observer supporting browsers, they handle
			// this differently and nothing is necessary here.
		}
	},
	*/
	manageMacros: function() {
		RESConsole.open();
		RESConsole.menuClick(document.getElementById('Menu-Comments'));
		RESConsole.drawConfigOptions('commentPreview');
	},
	showMacroDropdown: function(e) {
		modules['commentPreview'].macroTargetTextarea = $(e.target).parent().parent().find('textarea')[0];
		modules['commentPreview'].macroTargetPreview = $(e.target).parent().parent().find('.livePreview div.md')[0];
		//get the position of the placeholder element  
		var pos = $(e.target).offset();    
		// var eWidth = $(this).outerWidth();
		// var mWidth = $(dropdown).outerWidth();
		// var left = (pos.left + eWidth - mWidth) + "px";
		var left = (pos.left) + "px";
		// var top = $(this).outerHeight()+pos.top + "px";
		var top = (pos.top) + "px";
		//show the dropdown directly over the placeholder  
		$(modules['commentPreview'].macroDropdownContainer).css( { 
			position: 'absolute',
			zIndex: 50,
			left: left, 
			top: top
		}).show();
	},
	lod: function() {
		if (typeof(this.firstlod) == 'undefined') {
			this.firstlod = true;
			$('body').append('<div id="RESlod" style="display: none; position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #dddddd; opacity: 0.9; z-index: 99999;"><div style="position: relative; text-align: center; width: 400px; height: 300px; margin: auto;"><div style="font-size: 100px; margin-bottom: 10px;">&#3232;\_&#3232;</div> when you do this, people direct their frustrations at <b>me</b>... could we please maybe give this a rest?</div></div>');
		}
		$('#RESlod').fadeIn('slow', function() {
			setTimeout(function() {
				$('#RESlod').fadeOut('slow');
			}, 5000);
		});
	},
	viewSource: function(e) {
		e.preventDefault();
		var ele = e.target;
		if (ele) {
			var permalink = ele.parentNode.parentNode.firstChild.firstChild;
			if (permalink) {
				// check if we've already viewed the source.. if so just reveal it instead of loading...
				var prevSib = ele.parentNode.parentNode.previousSibling;
				if (typeof(prevSib.querySelector) == 'undefined') prevSib = prevSib.previousSibling;
				var sourceDiv = prevSib.querySelector('.viewSource');
				if (sourceDiv) {
					sourceDiv.style.display = 'block';
				} else {
					var jsonURL = permalink.getAttribute('href');
					var urlSplit = jsonURL.split('/');
					var postID = urlSplit[urlSplit.length - 1];
					var sourceLink = 'comment';
					if (hasClass(permalink, 'comments')) {
						sourceLink = 'selftext';
					}
					if (jsonURL.indexOf('?context') != -1) {
						jsonURL = jsonURL.replace('?context=3','.json?');
					} else {
						jsonURL += '/.json';
					}
					modules['commentPreview'].viewSourceEle = ele;
					modules['commentPreview'].viewSourceLink = sourceLink;
					jsonURL = RESUtils.insertParam(jsonURL,'app','res');
					GM_xmlhttpRequest({
						method:	"GET",
						url:	jsonURL,
						onload:	function(response) {
							var thisResponse = JSON.parse(response.responseText);
							var userTextForm = document.createElement('div');
							addClass(userTextForm,'usertext-edit');
							addClass(userTextForm,'viewSource');
							if (modules['commentPreview'].viewSourceLink == 'comment') {
								var sourceText = null;
								if (typeof(thisResponse[1]) != 'undefined') {
									sourceText = thisResponse[1].data.children[0].data.body;
								} else if (location.href.match(/message\/moderator/)) {
									// since we're in modmail, we have to parse the tree.
									// this is a bit odd, and maybe a reddit API bug, but
									// whatever the case, it's the only way to get the right item.
									var thisData = thisResponse.data.children[0].data;
									if (thisData.id == postID) {
										sourceText = thisData.body;
									} else {
										for (var i=0, len=thisData.replies.data.children.length; i<len; i++) {
											var replyData = thisData.replies.data.children[i].data;
											if (replyData.id == postID) {
												sourceText = replyData.body;
												break;
											}
										}
									}
								} else {
									sourceText = thisResponse.data.children[0].data.body;
								}
								// sourceText in this case is reddit markdown. escaping it would screw it up.
								$(userTextForm).html('<div><textarea rows="1" cols="1" name="text">' + sourceText + '</textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div>');
							} else {
								var sourceText = thisResponse[0].data.children[0].data.selftext;
								// sourceText in this case is reddit markdown. escaping it would screw it up.
								$(userTextForm).html('<div><textarea rows="1" cols="1" name="text">' + sourceText + '</textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div>');
							}
							var cancelButton = userTextForm.querySelector('.cancel');
							cancelButton.addEventListener('click', modules['commentPreview'].hideSource, false);
							var prevSib = modules['commentPreview'].viewSourceEle.parentNode.parentNode.previousSibling;
							if (typeof(prevSib.querySelector) == 'undefined') prevSib = prevSib.previousSibling;
							prevSib.appendChild(userTextForm);
						}
					});
				}
				
			}
		}
	},
	hideSource: function(e) {
		e.target.parentNode.parentNode.parentNode.style.display = 'none';
	},
	subredditAutocomplete: function(formEle) {
		if (!this.subredditAutocompleteRunOnce) {
			// Keys "enum"
			this.KEY = {
				BACKSPACE: 8,
				TAB: 9,
				ENTER: 13,
				ESCAPE: 27,
				SPACE: 32,
				PAGE_UP: 33,
				PAGE_DOWN: 34,
				END: 35,
				HOME: 36,
				LEFT: 37,
				UP: 38,
				RIGHT: 39,
				DOWN: 40,
				NUMPAD_ENTER: 108,
				COMMA: 188
			};
			if (!formEle) formEle = $('textarea:not([name=title])');
			this.subredditAutocompleteRunOnce = true;
			this.subredditAutocompleteCache = {};
			this.subredditRE = /\W\/?r\/([\w\.]*)$/,
			this.subredditSkipRE = /\W\/?r\/([\w\.]*)\ $/,
			this.linkReplacementRE = /([^\w\[\(])\/r\/(\w*(?:\.\w*)?)([^\w\]\)])/g;
			modules['commentPreview'].subredditAutocompleteDropdown = $('<div id="subreddit_dropdown" class="drop-choices srdrop inuse" style="display:none; position:relative;"><a class="choice"></a></div>');
			$('body').append(modules['commentPreview'].subredditAutocompleteDropdown);
		}
		$(formEle).live('keyup', modules['commentPreview'].subredditAutocompleteTrigger );
		$(formEle).live('keydown', modules['commentPreview'].subredditAutocompleteNav );
	},
	subredditAutocompleteTrigger: function(event) {
		if (/[^A-Za-z0-9 ]/.test(String.fromCharCode(event.keyCode))) {
			return false;
		}
		if (typeof(modules['commentPreview'].subredditAutoCompleteAJAXTimer) != 'undefined') clearTimeout(modules['commentPreview'].subredditAutoCompleteAJAXTimer);
		modules['commentPreview'].currentTextArea = event.target;
		var	match = modules['commentPreview'].subredditRE.exec( ' '+ event.target.value.substr( 0, event.target.selectionStart ) );
		if( !match || match[1] == '' || match[1].length > 10 ) {
			// if space or enter, check if they skipped over a subreddit autocomplete without selecting one..
			if ((event.keyCode == 32) || (event.keyCode == 13)) {
				match = modules['commentPreview'].subredditSkipRE.exec( ' '+ event.target.value.substr( 0, event.target.selectionStart ) );
				if (match) {
					modules['commentPreview'].addSubredditLink(match[1]);
				}
			}
			return modules['commentPreview'].hideSubredditAutocompleteDropdown();
		}

		var query = match[1].toLowerCase();
		if( modules['commentPreview'].subredditAutocompleteCache[query]) return modules['commentPreview'].updateSubredditAutocompleteDropdown( modules['commentPreview'].subredditAutocompleteCache[query], event.target );

		var thisTarget = event.target;
		modules['commentPreview'].subredditAutoCompleteAJAXTimer = setTimeout(
			function() {
				$.post('/api/search_reddit_names.json?app=res', {query:query},
				// $.post('/reddits/search.json', {q:query},
					function(r){
						modules['commentPreview'].subredditAutocompleteCache[query]=r['names'];
						modules['commentPreview'].updateSubredditAutocompleteDropdown( r['names'], thisTarget );
						modules['commentPreview'].subredditAutocompleteDropdownSetNav(0);
					},
				"json");
			
			}, 200);


		$(this).blur( modules['commentPreview'].hideSubredditAutocompleteDropdown );	
	},
	subredditAutocompleteNav: function(event) {
		if ($("#subreddit_dropdown").is(':visible')) {
			switch (event.keyCode) {
				case modules['commentPreview'].KEY.DOWN:
				case modules['commentPreview'].KEY.RIGHT:
					event.preventDefault();
					var reddits = $("#subreddit_dropdown a.choice");
					if (modules['commentPreview'].subredditAutocompleteDropdownNavidx < reddits.length-1) modules['commentPreview'].subredditAutocompleteDropdownNavidx++;
					modules['commentPreview'].subredditAutocompleteDropdownSetNav(modules['commentPreview'].subredditAutocompleteDropdownNavidx);
					break;
				case modules['commentPreview'].KEY.UP:
				case modules['commentPreview'].KEY.LEFT:
					event.preventDefault();
					if (modules['commentPreview'].subredditAutocompleteDropdownNavidx > 0) modules['commentPreview'].subredditAutocompleteDropdownNavidx--;
					modules['commentPreview'].subredditAutocompleteDropdownSetNav(modules['commentPreview'].subredditAutocompleteDropdownNavidx);
					break;
				case modules['commentPreview'].KEY.TAB:
				case modules['commentPreview'].KEY.ENTER:
					event.preventDefault();
					var reddits = $("#subreddit_dropdown a.choice");
					RESUtils.mousedown(reddits[modules['commentPreview'].subredditAutocompleteDropdownNavidx]);
					break;
				case modules['commentPreview'].KEY.ESCAPE:
					event.preventDefault();
					modules['commentPreview'].hideSubredditAutocompleteDropdown();
					break;
			}
		}
	},
	subredditAutocompleteDropdownSetNav: function(idx) {
		modules['commentPreview'].subredditAutocompleteDropdownNavidx = idx;
		var reddits = $("#subreddit_dropdown a.choice");
		for (var i=0, len=reddits.length; i<len; i++) {
			$(reddits[i]).removeClass('selectedItem');
			if (i == idx) $(reddits[i]).addClass('selectedItem');
		}
	},
	hideSubredditAutocompleteDropdown: function() {
		$("#subreddit_dropdown").hide();
	},
	updateSubredditAutocompleteDropdown: function(sr_names, textarea) {
		$( textarea ).after( modules['commentPreview'].subredditAutocompleteDropdown );

		if(!sr_names.length) return	modules['commentPreview'].hideSubredditAutocompleteDropdown();

		var first_row = modules['commentPreview'].subredditAutocompleteDropdown.children(":first");
		modules['commentPreview'].subredditAutocompleteDropdown.children().remove();

		for (var i=0, len=sr_names.length; i<len; i++) {
			if( i>10 ) break;
			var new_row=first_row.clone();
			new_row.text( sr_names[i] );
			modules['commentPreview'].subredditAutocompleteDropdown.append(new_row);
			new_row.mousedown( modules['commentPreview'].updateSubredditAutocompleteTextarea );
		}
		modules['commentPreview'].subredditAutocompleteDropdown.show();
		if (typeof(modules['commentPreview'].subredditAutocompleteDropdownNavidx) == 'undefined') modules['commentPreview'].subredditAutocompleteDropdownNavidx = 0;
		modules['commentPreview'].subredditAutocompleteDropdownSetNav(modules['commentPreview'].subredditAutocompleteDropdownNavidx);
	
	},
	updateSubredditAutocompleteTextarea: function(event) {
		modules['commentPreview'].hideSubredditAutocompleteDropdown();
		modules['commentPreview'].addSubredditLink(this.innerHTML);
	},
	addSubredditLink: function(subreddit) {
		var textarea	= modules['commentPreview'].currentTextArea,
			caretPos	= textarea.selectionStart,
			beforeCaret	= textarea.value.substr( 0,caretPos ),
			afterCaret	= textarea.value.substr( caretPos );

		// var srLink = '[/r/'+subreddit+'](/r/'+subreddit+') ';
		var srLink = '/r/'+subreddit+' ';
		beforeCaret		= beforeCaret.replace( /\/?r\/(\w*)\ ?$/, srLink );
		textarea.value	= beforeCaret + afterCaret;
		textarea.selectionStart	= textarea.selectionEnd	= beforeCaret.length;
		textarea.focus()
	
	}
};

modules['usernameHider'] = {
	moduleID: 'usernameHider',
	moduleName: 'Username Hider',
	category: 'Accounts',
	options: {
		displayText: {
			type: 'text',
			value: '~anonymous~',
			description: 'What to replace your username with, default is ~anonymous~'
		}
	},
	description: 'This module hides your real username when you\'re logged in to reddit.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i,
		/https?:\/\/reddit.com\/[-\w\.\/]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (!RESUtils.loggedInUser()) return false;
			var userNameEle = document.querySelector('#header-bottom-right > span > a');
			userNameEle.textContent = this.options.displayText.value;
			RESUtils.watchForElement('siteTable', modules['usernameHider'].hideUsername);
			RESUtils.watchForElement('newComments', modules['usernameHider'].hideUsername);
			this.hideUsername();
		}
	},
	hideUsername: function(ele) {
		ele = ele || document;
		var authors = ele.querySelectorAll('.author');
		for (var i=0, len=authors.length; i<len;i++) {
			if (authors[i].textContent == RESUtils.loggedInUser()) {
				authors[i].textContent = modules['usernameHider'].options.displayText.value;
			}
		}
	
	}
};

/* siteModule format:
name: {
//Initialization method for things that cannot be performed inline. The method 
//is required to be present, but it can be empty
	go: function(){},

//Returns true/false to indicate whether the siteModule will attempt to handle the link
//the only parameter is the anchor element
	detect: function(element) {return true/false;},

//This is where links are parsed, cache checks are made, and XHR is performed.
//This method will call handleInfo unless the module is deferred in which case it will call createImageExpando
//the only parameter is the anchor element
	handleLink: function(element) {},

//This is were the embedding information is added to the link
//the first parameter is the same anchor element passed to handleLink
//the second parameter is module specific data
//if successful handleInfo should call modules['showImages'].createImageExpando(elem)
//if the module is deferred, then use revealImageDeferred
	handleInfo: function(elem, info) {}

//Optional value indication part of the process of the retrieving 
//embed information should not occur until the user clicks on the 
//expand button
	deferred: boolean,

//optional method that acts in place of the usual handleLink when the module is deferred
	deferredHandleInk: function(elem) {}
}
*/
/*
Embedding infomation:
all embedding information (except 'site') is to be attatched the 
html anchor in the handleInfo function

required type:
	'IMAGE' for single images | 'GALLERY' for image galleries | 'TEXT' html/text to be displayed
required src:
	if type is TEXT then src is HTML (be carefull what is accepted here)
	if type is IMAGE then src is an image URL string
	if type is GALLERY then src is an array of objects with the following properties:
		required src: URL of the image
		optional href: URL of the page containing the image (per image)
		optional title: string to displayed directly above the image (per image)
		optional caption: string to be displayed directly below the image (per image)
optional imageTitle:
	string to be displayed above the image (gallery level).
optional caption:
	string to be displayed below the image
optional credits:
	string to be displayed below caption
optional galleryStart:
	zero-indexed page number to open the gallery to
*/
modules['showImages'] = {
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
		markVisited: {
			type: 'boolean',
			value: true,
			description: 'Mark links visited when you view images (does eat some resources).'
		},
		sfwHistory: {
			type: 'enum',
			value: 'add',
			values: [
				{name: 'Add links to history', value: 'add'},
				{name: 'Color links, but do not add to history', value: 'color'},
				{name: 'Do not add or color links.', value: 'none'}
			],
			description: 'Keeps NSFW links from being added to your browser history <span style="font-style: italic">by the markVisited feature</span>.<br/>\
				<span style="font-style: italic">If you chose the second option, then links will be blue again on refresh.</span><br/>\
				<span style="color: red">This does not change your basic browser behavior.\
				If you click on a link then it will still be added to your history normally.\
				This is not a substitute for using your browser\'s privacy mode.</span>'
		},
		ignoreDuplicates: {
			type: 'boolean',
			value: true,
			description: 'Do not create expandos for images that appear multiple times in a page.'
		},
		displayImageCaptions: {
			type: 'boolean',
			value: true,
			description: 'Retrieve image captions/attribution information.'
		}
	},
	description: 'Opens images inline in your browser with the click of a button. Also has configuration options, check it out!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\_\?=]*/i
	),
	exclude: Array(
		/https?:\/\/([a-z]+).reddit.com\/ads\/[-\w\.\_\?=]*/i,
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*\/submit\/?$/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS(".expando-button.image { vertical-align:top !important; float: left; width: 23px; height: 23px; max-width: 23px; max-height: 23px; display: inline-block; background-image: url('http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png'); margin-right: 6px; cursor: pointer;  padding: 0px; }");
			RESUtils.addCSS(".expando-button.image.commentImg { float: none; margin-left: 4px; } ");
			RESUtils.addCSS(".expando-button.image.collapsed { background-position: 0px 0px; } ");
			RESUtils.addCSS(".expando-button.image.collapsed:hover { background-position: 0px -24px; } ");
			RESUtils.addCSS(".expando-button.image.expanded { background-position: 0px -48px; } ");
			RESUtils.addCSS(".expando-button.image.expanded:hover { background-position: 0px -72px; } ");
			RESUtils.addCSS(".expando-button.image.gallery.collapsed { background-position: 0px -368px; } ");
			RESUtils.addCSS(".expando-button.image.gallery.collapsed:hover { background-position: 0px -392px; } ");
			RESUtils.addCSS(".expando-button.image.gallery.expanded { background-position: 0px -416px; } ");
			RESUtils.addCSS(".expando-button.image.gallery.expanded:hover { background-position: 0px -440px; } ");
			RESUtils.addCSS(".madeVisible { clear: left; display: block; overflow: hidden; } ");
			RESUtils.addCSS(".madeVisible a { display: inline-block; overflow: hidden; } ");
			RESUtils.addCSS(".RESImage { float: left; display: block !important;  } ");
			RESUtils.addCSS(".RESdupeimg { color: #000000; font-size: 10px;  } ");
			RESUtils.addCSS(".RESClear { clear: both; margin-bottom: 10px;  } ");
			RESUtils.addCSS('.RESGalleryControls { }');
			RESUtils.addCSS('.RESGalleryControls a { cursor: pointer; display: inline-block; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 16px; height: 16px; margin: 5px; }');
			RESUtils.addCSS('.RESGalleryControls span { position: relative; top: -9px; }');
			RESUtils.addCSS('.RESGalleryControls .previous { background-position: 0px -352px; }');
			RESUtils.addCSS('.RESGalleryControls .next { background-position: 16px -352px; }');
			RESUtils.addCSS('.RESGalleryControls .end { background-position-y: -336px; }');
			RESUtils.addCSS('.RESGalleryControls .previous:hover { background-position: 0px -320px; }');
			RESUtils.addCSS('.RESGalleryControls .next:hover { background-position: 16px -320px; }');
			RESUtils.addCSS('.RESGalleryControls .end:hover { background-position-y: -304px; }');
			RESUtils.addCSS('.imgTitle { font-size: 13px; padding: 2px; }');
			RESUtils.addCSS('.imgCredits { font-size: 11px; padding: 2px; }');
			RESUtils.addCSS('.thing .title.visited { color: #551A8B; }');
//			RESUtils.addCSS('.side.hidden { width: 0px; overflow-x: hidden; }');
			if (!this.options.displayImageCaptions.value) {
				RESUtils.addCSS('.imgTitle, .imgCaptions { display: none; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			this.imageList = [];
			this.imagesRevealed = {};
			this.dupeAnchors = 0;
			this.goneWild = '';
			this.goneWildModes = {};

			if (this.options.markVisited.value) {
				// we only need this iFrame hack if we're unable to add to history directly, which Firefox addons and Chrome can do.
				if ((typeof(chrome) == 'undefined') && (typeof(self.on) == 'undefined')) {
					this.imageTrackFrame = document.createElement('iframe');
					this.imageTrackFrame.addEventListener('load', function() {
						setTimeout(modules['showImages'].imageTrackShift, 300);
					}, false);
					this.imageTrackFrame.style.display = 'none';
					this.imageTrackFrame.style.width = '0px';
					this.imageTrackFrame.style.height = '0px';
					document.body.appendChild(this.imageTrackFrame);
				}
				this.imageTrackStack = [];
			}

			//set up all site modules
			for (var key in this.siteModules) {
				this.siteModules[key].go();
			}
			this.scanningForImages = false;

			RESUtils.watchForElement('siteTable', modules['showImages'].findAllImages);
			RESUtils.watchForElement('selfText', modules['showImages'].findAllImagesInSelfText);


/*
			document.body.addEventListener('DOMNodeInserted', function(event) {
				var target = event.target;
				if (
					((target.tagName == 'DIV') && ( (target.id.indexOf('siteTable') != -1) || hasClass(target, 'comment')))
					|| ((target.tagName == 'FORM') && target.className == 'usertext')
				   ) {
					   var isSelfText = (target.tagName == 'FORM');
					   modules['showImages'].findAllImages(target, isSelfText);
				   }
			}, true);
*/			

			this.createImageButtons();
			this.findAllImages();
			document.addEventListener('dragstart', function(){return false;}, false);
		}
	},
	findAllImagesInSelfText: function(ele) {
		modules['showImages'].findAllImages(ele, true);
	},
	createImageButtons: function() {
		if ((location.href.match(/search\?\/?q\=/)) || (location.href.match(/about\/reports/)) || (location.href.match(/about\/spam/)) || (location.href.match(/about\/unmoderated/)) || (location.href.match(/modqueue/)) || (location.href.toLowerCase().match('dashboard'))) {
			var hbl = document.body.querySelector('#header-bottom-left');
			if (hbl) {
				var mainMenuUL = document.createElement('ul');
				mainMenuUL.setAttribute('class','tabmenu viewimages');
				mainMenuUL.setAttribute('style','display: inline-block');
				hbl.appendChild(mainMenuUL);
			}
		} else {
			var mainMenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
		}
		if (mainMenuUL) {
			var li = document.createElement('li');
			var a = document.createElement('a');
			var text = document.createTextNode('scanning for images...');
			this.scanningForImages = true;

			a.href = 'javascript:void(0);';
			a.id = 'viewImagesButton';
			a.addEventListener('click', function(e) {
				e.preventDefault();
				if (!modules['showImages'].scanningForImages) {
					modules['showImages'].showImagesToggle();
				}
			}, true);
			a.appendChild(text);
			li.appendChild(a);
			mainMenuUL.appendChild(li);
			this.viewImageButton = a;
			/*
			   To enable go gonewild mode for a subreddit add [](/RESGoneWildEnable) to the markdown code for the sidebar.
			   This should not have any visible effect on the HTML.
			   When gonewild mode is enabled, by default tabs 'm' and 'f' will be displayed.
			   If the default choices are not desired, then use [](/RESGoneWildEnable-nodefault) instead.
			   If custom tabs are desired append ? to the link followed by up to 8 label/taglist pairs separated by &
			   A label/taglist pair takes the form label=taglist
			   A taglist has can contain up to 8 tags separated by ,
			   Labels and tags can be up to 32 characters long and may contain upper and lowercase letters, numbers, underscores, hyphens, and spaces.
			   Labels appear to the right of the "view images" button and are surrounded by [] brackets.
			   Post titles are searched for any place that an entry in the tag list appears surrounded by any kind of bracket <>, [], (), {}.
			   Tags are not case sensitive.

			   Example:
			   To duplicate the behavior originally used for /r/gonewild you would use:
				   [](/RESGoneWildEnable-nodefault?m=m,man,male&f=f,fem,female)
			 */
			var goneWildEnabler = document.querySelector('.side .md a[href^="/RESGoneWildEnable"]');

			//This is hardcoded until the mods of /r/gonewild add the tag 
			if (!goneWildEnabler && /gonewild/i.test(location.href)) {
				goneWildEnabler = $('<a href="/RESGoneWildEnable">')[0];
			}

			if (goneWildEnabler) {
				var switches = {};
				var switchCount = 0;
				if (!/RESGoneWildEnable-nodefault/i.test(goneWildEnabler.pathname)) {
					switches['m'] = ['m', 'man', 'male'];
					switches['f'] = ['f', 'fem', 'female'];
					switchCount = 2;
				}
				var whitelist = /^[A-Za-z0-9_ \-]{1,32}$/;
				if (goneWildEnabler.search) {
					var pairs = goneWildEnabler.search.slice(1).split('&');
					for (var i = 0; i < pairs.length && switchCount < 8; i++) {
						var pair = pairs[i].split('=');
						if (pair.length != 2) continue;
						var label = decodeURIComponent(pair[0]);
						if (!whitelist.test(label)) continue;
						var parts = pair[1].split(',');
						var acceptedParts = [];
						for (var j = 0; j < parts.length && acceptedParts.length < 8; j++) {
							var part = decodeURIComponent(parts[j]);
							if (!whitelist.test(part)) continue;
							else acceptedParts.push(part);
						}
						if (acceptedParts.length > 0) {
							if (!(label in switches)) switchCount++;
							switches[label] = acceptedParts;
						}
					}
				}
				if (switchCount > 0) {
					for (var key in switches) {
						this.goneWildModes[key] = new RegExp('[\\[\\{\\<\\(]('+switches[key].join('|')+')[\\]\\}\\>\\)]','i');
					}
				}
			}

			if (!/comments\/[-\w\.\/]/i.test(location.href)) {
				for (var mode in this.goneWildModes) {
					var li = document.createElement('li');
					var a = document.createElement('a');
					var text = document.createTextNode('['+mode+']');
					a.href = 'javascript:void(0);';
					a.addEventListener('click', (function(mode) {
						return function(e) {
							e.preventDefault();
							modules['showImages'].showImagesToggle(mode);
						};
					})(mode), true);

					a.appendChild(text);
					li.appendChild(a);
					mainMenuUL.appendChild(li);
				}
			}
		}
	},
	updateImageButtons: function(imgCount) {
		if (typeof(this.viewImageButton) != 'undefined') {
			var buttonText = (this.allImagesVisible ?'hide':'view') + ' images ';
			if (! RESUtils.currentSubreddit('dashboard')) buttonText += '(' + imgCount + ')';
			$(this.viewImageButton).text(buttonText);
		}
	},
	findImageFilter: function(image, goneWild) {
		if (goneWild in this.goneWildModes) var re = this.goneWildModes[goneWild];
		else goneWild = '';
		var titleMatch = (goneWild?re.test(image.text):false);
		image.NSFW = false;
		if (this.options.hideNSFW.value) {
			image.NSFW = /nsfw/i.test(image.text);
		}
		return (image.href && (goneWild == '' || titleMatch) && !image.NSFW && typeof(image.site) != 'undefined');
	},
	findImages: function(goneWild, showMore) {
		for (var i = 0, len = this.imageList.length; i < len; i++) {
			var image = this.imageList[i];
			this.revealImage(image, showMore && (this.findImageFilter(image.imageLink, goneWild)));
		}
	},
	showImagesToggle: function(goneWild, showMore) {
		if (!goneWild) this.goneWild = goneWild = '';
		else this.goneWild = goneWild;

		if (this.allImagesVisible && !showMore) {
			// Images are visible, and this request didn't come from never ending reddit, so hide the images...
			// (if it came from NER, we'd want to make the next batch also visible...)

			this.allImagesVisible = false;
			for (var i=0, len=this.imageList.length; i < len; i++) {
				this.revealImage(this.imageList[i], false);
			}
			this.updateImageButtons(this.imageList.length);
			return false;
		} else {
			this.allImagesVisible = true;
			this.updateImageButtons(this.imageList.length);
			this.findImages(goneWild, true);
		}
	},
	findAllImages: function(elem, isSelfText) {
		modules['showImages'].scanningForImages = true;
		if (elem == null) {
			elem = document.body;
		}
		// get elements common across all pages first...
		// if we're on a comments page, get those elements too...
		var commentsre = /comments\/[-\w\.\/]/i;
		var userre = /user\/[-\w\.\/]/i;
		modules['showImages'].scanningSelfText = false;
		var allElements = [];
		if (commentsre.test(location.href) || userre.test(location.href)) {
			allElements = elem.querySelectorAll('#siteTable a.title, .expando .usertext-body > div.md a, .content .usertext-body > div.md a');
		} else if (isSelfText) {
			// We're scanning newly opened (from an expando) selftext...
			allElements = elem.querySelectorAll('.usertext-body > div.md a');
			modules['showImages'].scanningSelfText = true;
		} else {
			allElements = elem.querySelectorAll('#siteTable A.title');
		}

		if (RESUtils.pageType() == 'comments') {
			RESUtils.forEachChunked(allElements, 15, 1000, function(element, i, array) {
				modules['showImages'].checkElementForImage(element);
				if (i >= array.length - 1) {
					modules['showImages'].scanningSelfText = false;
					modules['showImages'].scanningForImages = false;
					modules['showImages'].updateImageButtons(modules['showImages'].imageList.length);
				}
			});
		} else {
			var chunkLength = allElements.length;
			for (var i = 0; i < chunkLength; i++) {
				modules['showImages'].checkElementForImage(allElements[i]);
			}
			modules['showImages'].scanningSelfText = false;
			modules['showImages'].scanningForImages = false;
			modules['showImages'].updateImageButtons(modules['showImages'].imageList.length);
		}
	},
	checkElementForImage: function(elem) {
		if (this.options.hideNSFW.value) {
			if (hasClass(elem, 'title')) {
				elem.NSFW = hasClass(elem.parentNode.parentNode.parentNode, 'over18');
			}
		} else {
			elem.NSFW = false;
		}
		var href = elem.href;
		if ((!hasClass(elem, 'imgScanned') && (typeof(this.imagesRevealed[href]) == 'undefined' || !this.options.ignoreDuplicates.value || (RESUtils.currentSubreddit('dashboard'))) && href != null) || this.scanningSelfText) {
			addClass(elem, 'imgScanned');
			this.dupeAnchors++;
			var siteFound = false;
			if (siteFound = this.siteModules['default'].detect(elem)) {
				elem.site = 'default';
			}
			if (!siteFound) {
				for (var site in this.siteModules) {
					if (site == 'default') continue;
					if (this.siteModules[site].detect(elem)) {
						elem.site = site;
						siteFound = true;
						break;
					}
				}
			}
			if (siteFound && !elem.NSFW) {
				this.imagesRevealed[href] = this.dupeAnchors;
				this.siteModules[elem.site].handleLink(elem);
			}
		} else if (!hasClass(elem, 'imgScanned')) {
			var textFrag = document.createElement('span');
			textFrag.setAttribute('class','RESdupeimg');
			$(textFrag).html(' <a class="noKeyNav" href="#img'+escapeHTML(this.imagesRevealed[href])+'" title="click to scroll to original">[RES ignored duplicate image]</a>');
			insertAfter(elem, textFrag);
		}
	},
	createImageExpando: function(elem) {
		if (!elem) return false;
		var href = elem.href;
		if (!href) return false;
		//This should not be reached in the case of duplicates
		elem.name = 'img'+this.imagesRevealed[href];

		//expandLink aka the expando button
		var expandLink = document.createElement('a');
		expandLink.className = 'toggleImage expando-button collapsed';
		if (elem.type == 'IMAGE') expandLink.className += ' image';
		if (elem.type == 'GALLERY') expandLink.className += ' image gallery';
		if (elem.type == 'TEXT') expandLink.className += ' selftext';
		$(expandLink).html('&nbsp;');
		expandLink.addEventListener('click', function(e) {
			e.preventDefault();
			modules['showImages'].revealImage(e.target, (hasClass(e.target, 'collapsed') != null));
		}, true);
		var preNode = null;
		if (hasClass(elem.parentNode, 'title')) {
			preNode = elem.parentNode;
			addClass(expandLink, 'linkImg');
		} else {
			preNode = elem;
			addClass(expandLink, 'commentImg');
		}
		insertAfter(preNode, expandLink);
		/*
		 * save the link element for later use since some extensions
		 * like web of trust can place other elements in places that
		 * confuse the old method
		 */
		expandLink.imageLink = elem;
		this.imageList.push(expandLink);

		if (this.scanningSelfText && this.options.autoExpandSelfText.value) {
			this.revealImage(expandLink, true);
		} else if (this.allImagesVisible) {
			// this may have come from an asynchronous call, in which case it'd get missed by findAllImages, so
			// if all images are supposed to be visible, expand this link now.
			this.revealImage(expandLink, this.findImageFilter(expandLink.imageLink, this.goneWild));


		}
		if (this.scanningForImages == false) {
			// also since this may have come from an asynchronous call, we need to update the view images count.
			this.updateImageButtons(this.imageList.length);
		}
	},
	//Used when returning to the deferred call needs to go back to the reveal process
	revealImageDeferred: function(elem) {
		if (hasClass(elem.parentNode, 'title')) {
			var button = elem.parentNode.nextSibling;
		} else {
			var button = elem.nextSibling;
		}
		this.revealImage(button, true);
	},
	revealImage: function(expandoButton, showHide) {
		if ((!expandoButton) || (! $(expandoButton).is(':visible'))) return false;
		// showhide = false means hide, true means show!

		var imageLink = expandoButton.imageLink;
		if (typeof(this.siteModules[imageLink.site]) == 'undefined') {
			console.log('something went wrong scanning image from site: ' + imageLink.site);
			return;
		}
		if (this.siteModules[imageLink.site].deferred && typeof(imageLink.src) == 'undefined') {
			this.siteModules[imageLink.site].deferredHandleLink(imageLink);
			return;
		}

		if (expandoButton.expandoBox && hasClass(expandoButton.expandoBox, 'madeVisible')) {
			if (!showHide) {
				removeClass(expandoButton, 'expanded');
				addClass(expandoButton, 'collapsed');
				expandoButton.expandoBox.style.display = 'none';
			} else {
				removeClass(expandoButton, 'collapsed');
				addClass(expandoButton, 'expanded');
				expandoButton.expandoBox.style.display = 'block';
			}
			this.handleSidebarHiding()
		} else if (showHide) {
			//TODO: flash, custom
			switch (imageLink.type) {
				case 'IMAGE':
					this.generateImageExpando(expandoButton);
					break;
				case 'GALLERY':
					this.generateGalleryExpando(expandoButton);
					break;
				case 'TEXT':
					this.generateTextExpando(expandoButton);
					break;
			}
		}
	},
	generateImageExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var imgDiv = document.createElement('div');
		addClass(imgDiv, 'madeVisible');

		if ('imageTitle' in imageLink) {
			var header = document.createElement('h3');
			header.className = 'imgTitle';
			$(header).text(imageLink.imageTitle);
			imgDiv.appendChild(header);
		}

		var imageAnchor = document.createElement('a');
		addClass(imageAnchor, 'madeVisible');
		imageAnchor.href = imageLink.href;
		if (this.options.openInNewWindow.value) {
			imageAnchor.target = '_blank';
		}


		// I know it's weird, but going back to RES's old way of using innerHTML here instead of
		// appending as a DOM element is what fixes the GIF stuttering problem in Firefox.
		// Why?  No logical reason I can fathom.
		/*
		var image = document.createElement('img');
		if (imageLink.type == 'IMAGE_SCRAPE') {
			image.src = imageLink.getAttribute('scraped_src');
		} else {
			image.src = imageLink.src;
		}
		image.title = 'drag to resize';
		addClass(image, 'RESImage');
		image.style.maxWidth = this.options.maxWidth.value + 'px';
		image.style.maxHeight = this.options.maxHeight.value + 'px';

		imageAnchor.appendChild(image);
		*/
		var thisSrc = (imageLink.type == 'IMAGE_SCRAPE') ? imageLink.getAttribute('scraped_src') : imageLink.src;
		$(imageAnchor).html('<img title="drag to resize" class="RESImage" style="max-width:'+this.options.maxWidth.value+'px;max-height:'+this.options.maxHeight.value+'px;" src="' + thisSrc + '" />');
		var image = imageAnchor.querySelector('IMG');

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			try {
				$(credits).html(RESUtils.sanitizeHTML(imageLink.credits));
			} catch (e) {
				$(credits).text(imageLink.credits);
			}
			imgDiv.appendChild(credits);
		}

		imgDiv.appendChild(imageAnchor);

		if ('caption' in imageLink) {
			var captions = document.createElement('div');
			captions.className = 'imgCaptions';
			$(captions).text(imageLink.caption);
			imgDiv.appendChild(captions);
		}


		if (hasClass(expandoButton, 'commentImg')) {
			insertAfter(expandoButton, imgDiv);
		} else {
			expandoButton.parentNode.appendChild(imgDiv);
		}
		expandoButton.expandoBox = imgDiv;

		removeClass(expandoButton, 'collapsed');
		addClass(expandoButton, 'expanded');

		this.trackImageLoad(imageLink, image);
		this.makeImageZoomable(image);
	},
	generateGalleryExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var which = imageLink.galleryStart || 0;

		var imgDiv = document.createElement('div');
		addClass(imgDiv, 'madeVisible');
		imgDiv.sources = imageLink.src;
		imgDiv.currentImage = which;

		var header = document.createElement('h3');
		addClass(header, 'imgTitle');
		header.textContent = imageLink.imageTitle || '';
		imgDiv.appendChild(header);

		var imageAnchor = document.createElement('a');
		addClass(imageAnchor, 'madeVisible');
		imageAnchor.href = imgDiv.sources[which].href || imageLink.href;
		if (this.options.openInNewWindow.value) {
			imageAnchor.target ='_blank';
		}
		
		var controlWrapper = document.createElement('div');
		controlWrapper.className  = 'RESGalleryControls';

		var leftButton = document.createElement("a");
		leftButton.className = 'previous noKeyNav';
		leftButton.addEventListener('click', function(e){
			var topWrapper = e.target.parentElement.parentElement;
			if (topWrapper.currentImage == 0) {
				topWrapper.currentImage = topWrapper.sources.length-1;
			} else {
				topWrapper.currentImage -= 1;
			}
			adjustGalleryDisplay(topWrapper);
		});
		controlWrapper.appendChild(leftButton);

		var posLabel = document.createElement('span');
		posLabel.className = 'RESGalleryLabel';
		var niceLength = (imgDiv.sources.length < 10) ? '0'+imgDiv.sources.length : imgDiv.sources.length;
		var niceWhich = (which+1 < 10) ? '0'+(which+1) : (which+1);
		posLabel.textContent = niceWhich + " of " + niceLength;
		controlWrapper.appendChild(posLabel);

		var rightButton = document.createElement("a");
		rightButton.className = 'next noKeyNav';
		rightButton.addEventListener('click', function(e){
			var topWrapper = e.target.parentElement.parentElement;
			if (topWrapper.currentImage == topWrapper.sources.length-1) {
				topWrapper.currentImage = 0;
			} else {
				topWrapper.currentImage += 1;
			}
			adjustGalleryDisplay(topWrapper);
		});
		controlWrapper.appendChild(rightButton);

		imgDiv.appendChild(controlWrapper);

		var image = document.createElement('img');
		image.src = imgDiv.sources[which].src;
		image.title = 'drag to resize';
		addClass(image, 'RESImage');
		image.style.maxWidth = this.options.maxWidth.value + 'px';
		image.style.maxHeight = this.options.maxHeight.value + 'px';

		imageAnchor.appendChild(image);

		var imageWrapper = document.createElement('div');
		imageWrapper.className = 'imgWrapper';

		var imageTitle = document.createElement('h4');
		imageTitle.className = 'imgCaptions';
		imageTitle.textContent = imgDiv.sources[which].title || '';
		imageWrapper.appendChild(imageTitle);

		imageWrapper.appendChild(imageAnchor);

		var imageCaptions = document.createElement('div');
		imageCaptions.className = 'imgCaptions';
		imageCaptions.textContent = imgDiv.sources[which].caption || '';
		imageWrapper.appendChild(imageCaptions);

		imgDiv.appendChild(imageWrapper);

		//Adjusts the images for the gallery navigation buttons as well as the "n of m" display.
		function adjustGalleryDisplay(topLevel) {
			var source = topLevel.sources[topLevel.currentImage];
			topLevel.querySelector('img.RESImage').src = source.src;
			imageAnchor.href = source.href || imageLink.href;
			var paddedImageNumber = (topLevel.currentImage+1 < 10) ? '0'+(topLevel.currentImage+1) : topLevel.currentImage+1;
			var niceLength = (imgDiv.sources.length < 10) ? '0'+imgDiv.sources.length : imgDiv.sources.length;
			topLevel.querySelector('.RESGalleryLabel').textContent = (paddedImageNumber+" of "+niceLength);
			if (topLevel.currentImage == 0) {
				leftButton.classList.add('end');
				rightButton.classList.remove('end');
			} else if (topLevel.currentImage == topLevel.sources.length-1) {
				leftButton.classList.remove('end');
				rightButton.classList.add('end');
			} else {
				leftButton.classList.remove('end');
				rightButton.classList.remove('end');
			}
			imageTitle.textContent = source.title || '';
			imageCaptions.textContent = source.caption || '';
		}

		var captions = document.createElement('div');
		captions.className = 'imgCaptions';
		captions.textContent = imageLink.caption || '';
		imgDiv.appendChild(captions);

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			try {
				$(credits).html(RESUtils.sanitizeHTML(imageLink.credits||''));
			} catch (e) {
				$(credits).text(imageLink.credits||'');
			}
			imgDiv.appendChild(credits);
		}

		if (hasClass(expandoButton, 'commentImg')) {
			insertAfter(expandoButton, imgDiv);
		} else {
			expandoButton.parentNode.appendChild(imgDiv);
		}
		expandoButton.expandoBox = imgDiv;

		removeClass(expandoButton, 'collapsed');
		addClass(expandoButton, 'expanded');

		this.trackImageLoad(imageLink, image);
		this.makeImageZoomable(image);
	},
	generateTextExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madevisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		header.textContent = imageLink.imageTitle || '';
		imgDiv.appendChild(header);

		var text = document.createElement('div');
		text.className = 'md';
		try {
			$(text).html(RESUtils.sanitizeHTML(imageLink.src));
		} catch (error) {
			// $(text).html([
			// 	"Something bad happened while formatting this entry.<br/>",
			// 	"Yo can try refreshing the page to see if that fixes it.",
			// 	"If that doesnt work then it may be helpful to report the issue",
			// 	"to <a href=\"http://reddit.com/r/RESIssues\">/r/RESIssues</a> and make sure you include the information below the line.",
			// 	"<hr/><br/>",
			// 	"\n<blockquote>    "+$("<div>").text((imageLink.src||'').replace(/\n/g, '\n    ')).html() + "</blockquote>\n<br/>"
			// ].join('\n'));
			$(text).text(imageLink.src)
		}
		imgDiv.appendChild(text);

		var captions = document.createElement('div');
		captions.className = 'imgCaptions';
		captions.textContent = imageLink.caption || '';
		imgDiv.appendChild(captions);

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			try {
				$(credits).html(RESUtils.sanitizeHTML(imageLink.credits||''));
			} catch (e) {
				$(credits).text(imageLink.credits||'');
			}
			imgDiv.appendChild(credits);
		}

		wrapperDiv.appendChild(imgDiv);
		if (hasClass(expandoButton, 'commentImg')) {
			insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}
		expandoButton.expandoBox = imgDiv;

		removeClass(expandoButton, 'collapsed');
		addClass(expandoButton, 'expanded');
		
		//TODO: Decide how to handle history for this.
		//Selfposts already don't mark it, so either don't bother or add marking for selfposts.
	},
	trackImageLoad: function(link, image) {
		if (modules['showImages'].options.markVisited.value) {
			var isNSFW = $(link).closest('.thing').is('.over18');
			var sfwMode = modules['showImages'].options['sfwHistory'].value;

			if ((typeof(chrome) != 'undefined') || (typeof(self.on) != 'undefined')) {
				var url = link.historyURL || link.href;
				if (!isNSFW || sfwMode != 'none') addClass(link, 'visited');
				if (!isNSFW || sfwMode == 'add') {
					modules['showImages'].imageTrackStack.push(url);
					if (modules['showImages'].imageTrackStack.length == 1) setTimeout(modules['showImages'].imageTrackShift, 300);
				}
			} else {
				image.addEventListener('load', function(e) {
					var url = link.historyURL || link.href;
					if (!isNSFW || sfwMode != 'none') addClass(link, 'visited');
					if (!isNSFW || sfwMode == 'add') {
						modules['showImages'].imageTrackStack.push(url);
						if (modules['showImages'].imageTrackStack.length == 1) setTimeout(modules['showImages'].imageTrackShift, 300);
					}
				}, false);
			}
		}
		// hide the sidebar if the image is bigger when it expands...
		image.addEventListener('load', function(e) {
			modules['showImages'].handleSidebarHiding(e.target);
		}, false);
	},
	imageTrackShift: function() {
		var url = modules['showImages'].imageTrackStack.shift();
		if (typeof(url) == 'undefined') {
			modules['showImages'].handleSidebarHiding();
			return;
		}
		if (typeof(chrome) != 'undefined') {
			if (!chrome.extension.inIncognitoContext) {
				chrome.extension.sendMessage({
					requestType: 'addURLToHistory',
					url: url
				});
			}
			modules['showImages'].imageTrackShift();
		} else if (typeof(self.on) != 'undefined') {
			// update: using XPCOM we may can add URLs to Firefox history without the iframe hack!
			var thisJSON = {
				requestType: 'addURLToHistory',
				url: url
			}
			self.postMessage(thisJSON);
			modules['showImages'].imageTrackShift();
		} else if (typeof(modules['showImages'].imageTrackFrame.contentWindow) != 'undefined') {
			modules['showImages'].imageTrackFrame.contentWindow.location.replace(url);
		} else {
			modules['showImages'].imageTrackFrame.location.replace(url);
		}			
	},
	dragTargetData: {
		//numbers just picked as sane initialization values
		imageWidth: 100,
		diagonal: 0, //zero to represent the state where no the mouse button is not down
		dragging: false
	},
	getDragSize: function(e){
		var rc = e.target.getBoundingClientRect();
		var p = Math.pow;
		var dragSize = p(p(e.clientX-rc.left, 2)+p(e.clientY-rc.top, 2), .5);
		return Math.round(dragSize);
	},
	handleSidebarHiding: function(image) {
		RESUtils.debounce('handleSidebarHiding', 50, function() {
			/*
			 * If the image parameter is passed, then scan the entire page for the
			 * largest image that belongs to the IIV.
			 * Otherwise only scan the passed image
			 */

			//Get the x position of the rightmost edge of whatever images are being scanned
			//Note: a scan of approx 500 images takes 47ms (Chrome 19.0.1084.54 Mac @ 2.53Ghz) 
			var rightEdge = Math.max.apply(Math, $(image || 'div.madeVisible img').map(function(){
				return $(this).position().left+this.offsetWidth;
			}));
			//Find the x-index of the sidebar (
			var leftEdge = window.innerWidth - $('.side').width();
			if (image) {
				//Since we only looked at one image, take into account the rightmost edge from the last full scan
				var bestEdge = Math.max(rightEdge, this.furthestRightEdge || 0);
			} else {
				//Since we are calculating this for everything we already know the answer,
				//and save the value
				var bestEdge = this.furthestRightEdge = rightEdge;
			}
			//Allow a 15 pixel buffer 
			if (leftEdge - bestEdge < 15) {
				$('.side').fadeOut();
				if (image) {
					var closest = $(image).closest('div.md');
					var maxWidth = $(closest).css('max-width');
					$(closest).data('max-width',maxWidth);
					$(closest).css('max-width','100%');
				}
				/*
				 * search for .side.hidden
				 * While this is better than .fadeOut since things moved out
				 * of the sidebar using CSS are still visible,
				 * there are some issues with that methods that I have not
				 * resolved to my satisfation.
				 * (note: the fix is easy, I would just rather not do it)
				 */
				// $('.side').addClass('hidden');
			} else {
				$('.side').fadeIn();
				// $('.side').removeClass('hidden');
			}
		});
	},	
	makeImageZoomable: function(imageTag) {
		if (this.options.imageZoom.value) {
			// Add listeners for drag to resize functionality...
			imageTag.addEventListener('mousedown', function(e) {
				if (e.button == 0) {
					if (!imageTag.minWidth) imageTag.minWidth = Math.max(1, Math.min(imageTag.width, 100));
					modules['showImages'].dragTargetData.imageWidth = e.target.width;
					modules['showImages'].dragTargetData.diagonal = modules['showImages'].getDragSize(e);
					modules['showImages'].dragTargetData.dragging = false;
					e.preventDefault();
				}
			}, true);
			imageTag.addEventListener('mousemove', function(e) {
				if (modules['showImages'].dragTargetData.diagonal){
					var newDiagonal = modules['showImages'].getDragSize(e);
					var oldDiagonal = modules['showImages'].dragTargetData.diagonal;
					var imageWidth = modules['showImages'].dragTargetData.imageWidth;
					e.target.style.maxWidth=e.target.style.width=Math.max(e.target.minWidth, newDiagonal/oldDiagonal*imageWidth)+'px';

					e.target.style.maxHeight='';
					e.target.style.height='auto';
					modules['showImages'].handleSidebarHiding(e.target);
					modules['showImages'].dragTargetData.dragging = true;
				}
			}, false);
			imageTag.addEventListener('mouseout', function(e) {
				modules['showImages'].dragTargetData.diagonal = 0;
			}, false);
			imageTag.addEventListener('mouseup', function(e) {
				if (modules['showImages'].dragTargetData.diagonal) {
					var newDiagonal = modules['showImages'].getDragSize(e);
					var oldDiagonal = modules['showImages'].dragTargetData.diagonal;
					var imageWidth = modules['showImages'].dragTargetData.imageWidth;
					e.target.style.maxWidth=e.target.style.width=Math.max(e.target.minWidth, newDiagonal/oldDiagonal*imageWidth)+'px';
				}

				modules['showImages'].handleSidebarHiding();
				modules['showImages'].dragTargetData.diagonal = 0;
			}, false);
			imageTag.addEventListener('click', function(e) {
				modules['showImages'].dragTargetData.diagonal = 0;
				if (modules['showImages'].dragTargetData.dragging) {
					modules['showImages'].dragTargetData.dragging = false;
					e.preventDefault();
					return false;
				}
			}, false);
		}
	},
	// this function is only ever used by imgclean, which currently is being removed from RES, so this function is being commented out.
	/*
	scrapeHTML: function(elem, url, selector, handler) {
		GM_xmlhttpRequest({
			method:	"GET",
			url:	url,
			onload:	function(response) {
				var thisHTML = response.responseText;
				var tempDiv = document.createElement('div');
				// remove script tags for safety's sake.
				$(tempDiv).html(thisHTML.replace(/<script(.|\s)*?\/script>/g, ''));
				var scrapedImg = tempDiv.querySelector(selector);
				if (typeof(handler) == 'function') {
					scrapedImg = handler(scrapedImg);
				}
				// just in case the site (i.e. flickr) has an onload, kill it to avoid JS errors.
//				if (!scrapedImg) return;
				if (scrapedImg) {
					$(scrapedImg).removeAttr('onclick');

					modules['showImages'].siteModules[elem.site].handleInfo(elem, {
						src: scrapedImg.src
					});
				} else {
					// uh oh, scraping failed.
					console.log(tempDiv);
				}
			}
		});

	},
	*/
	siteModules: {
		'default': {
			acceptRegex: /\.(gif|jpe?g|png)(?:[?&#_].*|$)/i,
			rejectRegex: /(wikipedia\.org\/wiki|photobucket\.com|gifsound\.com)/i,
			go: function(){},
			detect: function(elem) {
				var href = elem.href;
				return (this.acceptRegex.test(href) && !this.rejectRegex.test(href));
			},
			handleLink: function(elem) {
				var href = elem.href;
				this.handleInfo(elem, {
					type: 'IMAGE',
					src: elem.href
				});
			},
			handleInfo: function(elem, info) {
				elem.type = info.type;
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		imgur: {
			APIKey: 'fe266bc9466fe69aa1cf0904e7298eda',
			// hashRe:/^https?:\/\/(?:[i.]|[edge.]|[www.])*imgur.com\/(?:r\/[\w]+\/)?([\w]{5,}(?:[&,][\w]{5,})?)(\..+)?(?:#(\d*))?$/i,
			// the modified regex below fixes detection of "edited" imgur images, but imgur's edited images are broken right now actually, falling into
			// a redirect loop.  preserving the old one just in case.  however it also fixes detection of the extension (.jpg, for example) which
			// was too greedy a search...
			hashRe:/^https?:\/\/(?:[i.]|[edge.]|[www.])*imgur.com\/(?:r\/[\w]+\/)?([\w]{5,}(?:[&,][\w]{5,})?)(\.[\w]{3,4})?(?:#(\d*))?(?:\?(?:\d*))?$/i,
			albumHashRe: /^https?:\/\/(?:i\.)?imgur.com\/a\/([\w]+)(\..+)?(?:\/)?(?:#\d*)?$/i,
			apiPrefix: 'http://api.imgur.com/2/',
			calls: {},
			go: function(){},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('imgur.com/') >= 0;
			},
			handleLink: function(elem) {
				var href = elem.href.split('?')[0];
				var groups = this.hashRe.exec(href);
				if (!groups) var albumGroups = this.albumHashRe.exec(href);
				if (groups && !groups[2]) {
					if (groups[1].search(/[&,]/) > -1) {
						var hashes = groups[1].split(/[&,]/);
						modules['showImages'].siteModules['imgur'].handleInfo(elem, {
							album: {images: hashes.map(function(hash) {
								return {
									image: {title: '', caption: '', hash: hash},
									links: {original: 'http://i.imgur.com/'+hash+'.jpg'}
								};
							})}
						});
					} else {
						// removed caption API calls as they don't seem to exist/matter for single images, only albums...
						//If we don't show captions, then we can skip the API call.
						modules['showImages'].siteModules['imgur'].handleInfo(elem, {image: {
							links: {
								//Imgur doesn't really care about the extension and the browsers don't seem to either.
								original: 'http://i.imgur.com/'+groups[1]+'.jpg'
							}, image: {}}
						});
					}
				} else if (albumGroups && !albumGroups[2]) {
					var apiURL = this.apiPrefix + 'album/' + albumGroups[1] + '.json';
					if (apiURL in this.calls) {
						this.handleInfo(elem, this.calls[apiURL]);
					} else {
						GM_xmlhttpRequest({
							method: 'GET',
							url: apiURL,
//							aggressiveCache: true,
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
								} catch (error) {
									var json = {};
								}
								modules['showImages'].siteModules['imgur'].calls[apiURL] = json;
								modules['showImages'].siteModules['imgur'].handleInfo(elem, json);
							}
						});
					}
				}
			},
			handleInfo: function(elem, info) {
				if ('image' in info) {
					this.handleSingleImage(elem, info);
				} else if ('album' in info) {
					this.handleGallery(elem, info);
				} else {
					// console.log("ERROR", info);
					// console.log(arguments.callee.caller);
				}
			},
			handleSingleImage: function(elem, info) {
				elem.src = info.image.links.original;
				elem.href = info.image.links.original;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				elem.type = 'IMAGE';
				if (info.image.image.caption) elem.caption = info.image.image.caption;
				modules['showImages'].createImageExpando(elem);
			},
			handleGallery: function(elem, info) {
				var base = elem.href.split('#')[0];
				elem.src = info.album.images.map(function(e, i, a) {
					return {
						title: e.image.title,
						src: e.links.original,
						href: base + '#' + e.image.hash,
						caption: e.image.caption
					};
				});
				if (elem.hash) {
					var hash = elem.hash.slice(1);
					if (isNaN(hash)) {
						for (var i = 0; i < elem.src.length; i++) {
							if (hash == info.album.images[i].image.hash) {
								elem.galleryStart = i;
								break;
							}
						}
					} else {
						elem.galleryStart = parseInt(hash);
					}
				}
				elem.imageTitle = info.album.title;
				elem.caption  = info.album.description;
				elem.type = 'GALLERY';
				modules['showImages'].createImageExpando(elem);
			}
		},
		ehost: {
			hashRe: /^http:\/\/(?:i\.)?(?:\d+\.)?eho.st\/(\w+)\/?/i,
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('eho.st') >= 0 && href.substring(-1) != '+';
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, {
						src: 'http://i.eho.st/'+groups[1]+'.jpg'
					});
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		picsarus: {
			hashRe:/^https?:\/\/(?:[i.]|[edge.]|[www.])*picsarus.com\/(?:r\/[\w]+\/)?([\w]{6,})(\..+)?$/i,
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('picsarus.com') >= 0 && href.substring(-1) != '+';
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, {
						src: 'http://www.picsarus.com/'+groups[1]+'.jpg'
					});
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		snaggy: {
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('snag.gy/') >= 0;
			},
			handleLink: function(elem) {
				var href = elem.href;
				var extensions = ['.jpg','.png','.gif'];
				if (href.indexOf('i.snag') == -1) href = href.replace('snag.gy', 'i.snag.gy');
				if (extensions.indexOf(href.substr(-4)) == -1) href = href+'.jpg';
				this.handleInfo(elem, {src: href});
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		picshd: {
			deferred: true,
			hashRe:/^https?:\/\/(?:[i.]|[edge.]|[www.])*picshd.com\/([\w]{5,})(\..+)?$/i,
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('picshd.com/') >= 0;
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, 'http://i.picshd.com/'+groups[1]+'.jpg');
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		minus: {
			hashRe: /^http:\/\/min.us\/([\w]+)(?:#[\d+])?$/i,
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('min.us') >= 0 && href.indexOf('blog.') == -1;
			},
			handleLink: function(elem) {
				var href = elem.href.split('?')[0];
				//TODO: just make default run first and remove this
				var getExt = href.split('.');
				var ext = (getExt.length > 1?getExt[getExt.length - 1].toLowerCase():'');
				if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext)) {
					var groups = this.hashRe.exec(href);
					if (groups && !groups[2]) {
						var hash = groups[1];
						if (hash.substr(0, 1) == 'm') {
							var apiURL = 'http://min.us/api/GetItems/' + hash;
							if (apiURL in this.calls) {
								this.handleInfo(elem, this.calls[apiURL]);
							} else {
								GM_xmlhttpRequest({
									method: 'GET',
									url: apiURL,
									onload: function(response) {
										try {
											var json = JSON.parse(response.responseText);
										} catch (e) {
											var json = {};
										}
										modules['showImages'].siteModules['minus'].calls[apiURL] = json;
										modules['showImages'].siteModules['minus'].handleInfo(elem, json);
									}
								});
							}
						} // if not 'm', not a gallery, we can't do anything with the API.
					}
				}
			},
			handleInfo: function(elem, info) {
				//TODO: Handle titles
				//TODO: Handle possibility of flash items
				if ('ITEMS_GALLERY' in info) {
					if (info.ITEMS_GALLERY.length > 1) {
						elem.type = 'GALLERY';
						elem.src = {
							src: info.ITEMS_GALLERY
						};
					} else {
						elem.type = 'IMAGE';
						elem.href = info.ITEMS_GALLERY[0];
						if (RESUtils.pageType() == 'linklist') {
							$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
						}
						elem.src = info.ITEMS_GALLERY[0];
					}
					modules['showImages'].createImageExpando(elem);
				}
			}
		},
		flickr: {
			hashRe: /^http:\/\/(?:\w+).?flickr.com\/(?:.*)\/([\d]{10})\/?(?:.*)?$/i,
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href;
				return this.hashRe.test(href);
			},
			handleLink: function(elem) {
				var href = elem.href;
				var groups = this.hashRe.exec(href);
				if (groups && !groups[2]) {
					var photoID = groups[1];
					var apiURL = 'http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=0414c8799c8baa02c83cf14c219e5b46&photo_id='+photoID+'&format=json&nojsoncallback=1';
					if (apiURL in this.calls) {
						this.handleInfo(elem, this.calls[apiURL]);
					} else {
						GM_xmlhttpRequest({
							method: 'GET',
							url: apiURL,
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
								} catch (e) {
									var json = {};
								}
								modules['showImages'].siteModules['flickr'].calls[apiURL] = json;
								modules['showImages'].siteModules['flickr'].handleInfo(elem, json);
							}
						});
					}
				}
			},
			handleInfo: function(elem, info) {
				if (typeof(info.sizes) == 'undefined') {
					return false;
				}
				var biggest = 0;
				var source = '';
				for (i in info.sizes['size']) {
					var thisObj = info.sizes['size'][i];
					if (thisObj['width'] > biggest) {
						biggest = thisObj['width'];
						source = thisObj['source'];
					}
				}
				elem.type = 'IMAGE';
				elem.href = source;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				elem.src = source;
				modules['showImages'].createImageExpando(elem);
			}
		},
		/*
		// imgclean hasn't been used on reddit in a couple of months, removing support for now.
		imgclean: {
			deferred: true,
			go: function() {},
			detect: function(elem) {
				return (elem.href.indexOf('imgclean.com/?p=')>=0);
			},
			handleLink: function(elem) {
				//Only do this here if deferred
				modules['showImages'].createImageExpando(elem);
			},
			deferredHandleLink: function(elem) {
				modules['showImages'].scrapeHTML(elem, elem.href, '.imgclear-entry-image > IMG')
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				// we don't overwrite the URL here since this is a deferred/scraped call.
				// elem.href = info.src;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				elem.src = info.src;
				modules['showImages'].revealImageDeferred(elem);
			}
		},
		*/
		steam: {
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('cloud.steampowered.com') >= 0;
			},
			handleLink: function(elem) {
				this.handleInfo(elem, elem.href);
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		quickmeme: {
			hashRe: /^http:\/\/(?:(?:www.)?quickmeme.com\/meme|qkme.me|i.qkme.me)\/([\w]+)\/?/i,
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('qkme.me') >= 0 || href.indexOf('quickmeme.com') >= 0;
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, 'http://i.qkme.me/'+groups[1]+'.jpg');
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		deviantart: {
			calls: {},
			matchRe: /^http:\/\/(?:fav.me\/.*|(?:.+\.)?deviantart.com\/(?:art\/.*|[^#]*#\/d.*))$/i,
			go: function() {},
			detect: function(elem) {
				return this.matchRe.test(elem.href);
			},
			handleLink: function(elem) {
				var apiURL = 'http://backend.deviantart.com/oembed?url=' + encodeURIComponent(elem.href);
				if (apiURL in this.calls) {
					this.handleInfo(elem, this.calls[apiURL]);
				} else {
					GM_xmlhttpRequest({
						method: 'GET',
						url: apiURL,
						aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
							} catch(error) {
								var json = {};
							}
							modules['showImages'].siteModules['deviantart'].calls[apiURL] = json;
							modules['showImages'].siteModules['deviantart'].handleInfo(elem, json);
						}
					});
				}
			},
			handleInfo: function(elem, info) {
				if ('url' in info) {
					elem.imageTitle = info.title;
					var original_url = elem.href;
					if(['jpg', 'jpeg', 'png', 'gif'].indexOf(info.url)) {
						elem.src = info.url;
						// elem.href = info.url;
					} else {
						elem.src = info.thumbnail_url;
						// elem.href = info.thumbnail_url;
					}
					if (RESUtils.pageType() == 'linklist') {
						$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
					}
					// elem.credits = 'Original link: <a href="'+original_url+'">'+original_url+'</a><br>Art by: <a href="'+info.author_url+'">'+info.author_name+'</a> @ DeviantArt';
					elem.credits = 'Art by: <a href="'+info.author_url+'">'+info.author_name+'</a> @ DeviantArt';
					elem.type = 'IMAGE';
					modules['showImages'].createImageExpando(elem);
				}
			}
		},
		tumblr: {
			calls: {},
			APIKey: 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq',
			matchRE: /^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/post\/(\d+)(?:\/.*)?$/i,
			go: function() { },
			detect: function(elem) {
				return this.matchRE.test(elem.href);
			},
			handleLink: function(elem) {
				var groups = this.matchRE.exec(elem.href);
				if (groups) {
					var apiURL = 'http://api.tumblr.com/v2/blog/'+groups[1]+'/posts?api_key='+this.APIKey+'&id='+groups[2] + '&filter=raw';
					if (apiURL in this.calls) {
						this.handleInfo(elem, this.calls[apiURL]);
					} else {
						GM_xmlhttpRequest({
							method:'GET',
							url: apiURL,
							aggressiveCache: true,
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
								} catch (error) {
									var json = {};
								}
								if ('meta' in json && json.meta.status == 200) {
									modules['showImages'].siteModules['tumblr'].calls[apiURL] = json;
									modules['showImages'].siteModules['tumblr'].handleInfo(elem, json);
								}
							}
						});
					}
				}
			},
			handleInfo: function(elem, info) {
				var original_url = elem.href;
				var post = info.response.posts[0];
				switch (post.type) {
					case 'photo':
						if (post.photos.length > 1) {
							elem.type = 'GALLERY';
							elem.src = post.photos.map(function(e) {
								return {
									src: e.original_size.url,
									caption: e.caption
								};
							});
						} else {
							elem.type = "IMAGE";
							elem.src = post.photos[0].original_size.url;
						}
						break;
					case 'text':
						elem.type = 'TEXT';
						elem.imageTitle = post.title;
						if (post.format == 'markdown') {
							elem.src = modules['commentPreview'].converter.render(post.body)
						} else if (post.format == 'html') {
							elem.src = post.body;
						}
						 break;
					default:
						return;
						break;
				}
				elem.caption = post.caption;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				elem.credits = 'Posted by: <a href="'+info.response.blog.url+'">'+info.response.blog.name+'</a> @ Tumblr';
				modules['showImages'].createImageExpando(elem);
			}
		},
		memecrunch: {
			hashRe: /^http:\/\/memecrunch.com\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i,
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('memecrunch.com') >= 0;
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups && typeof(groups[1]) != 'undefined') {
					this.handleInfo(elem, 'http://memecrunch.com/meme/'+groups[1]+'/'+(groups[2]||'null')+'/image.png');
				}
			},
			handleInfo: function(elem, info) {
					elem.type = 'IMAGE';
					elem.src = info;
					elem.href = info;
					if (RESUtils.pageType() == 'linklist') {
						$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
					}
					modules['showImages'].createImageExpando(elem);
			}
		},
		livememe: {
			hashRe: /^http:\/\/(?:www.livememe.com|lvme.me)\/(?!edit)([\w]+)\/?/i,
			go: function() { },
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('livememe.com') >= 0;
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (groups) {
					this.handleInfo(elem, 'http://www.livememe.com/'+groups[1]+'.jpg');
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		memefive: {
			hashRe: /^http:\/\/(?:www.memefive.com)\/meme\/([\w]+)\/?/i,
			altHashRe: /^http:\/\/(?:www.memefive.com)\/([\w]+)\/?/i,
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('memefive.com') >= 0;
			},
			handleLink: function(elem) {
				var groups = this.hashRe.exec(elem.href);
				if (!groups) {
					groups = this.altHashRe.exec(elem.href);
				}
				if (groups) {
					this.handleInfo(elem, 'http://memefive.com/memes/'+groups[1]+'.jpg');
				}
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() == 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href',elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		}
	}
};

modules['showKarma'] = {
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
				RESUtils.loggedInUserInfo(modules['showKarma'].updateKarmaDiv);
			}
		}
	},
	updateKarmaDiv: function(userInfo) {
		var karmaDiv = document.querySelector("#header-bottom-right .userkarma");
		if ((typeof(karmaDiv) != 'undefined') && (karmaDiv != null)) {
			var linkKarma = karmaDiv.innerHTML;
			karmaDiv.title = '';
			var commentKarma = userInfo.data.comment_karma;
			if (modules['showKarma'].options.useCommas.value) {
				linkKarma = RESUtils.addCommas(linkKarma);
				commentKarma = RESUtils.addCommas(commentKarma);
			}
			$(karmaDiv).html("<a title=\"link karma\" href=\"/user/" + RESUtils.loggedInUser() + "/submitted/\">" + linkKarma + "</a> " + modules['showKarma'].options.separator.value + " <a title=\"comment karma\" href=\"/user/" + RESUtils.loggedInUser() + "/comments/\">" + commentKarma + "</a>");
		}
	}
};

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
			this.toggleAllLink.textContent = 'hide all child comments';
			this.toggleAllLink.setAttribute('action','hide');
			this.toggleAllLink.setAttribute('href','javascript:void(0);');
			this.toggleAllLink.setAttribute('title','Show only replies to original poster.');
			this.toggleAllLink.addEventListener('click', function() {
				modules['hideChildComments'].toggleComments(this.getAttribute('action'));
				if (this.getAttribute('action') == 'hide') {
					this.setAttribute('action','show');
					this.setAttribute('title','Show all comments.');
					this.textContent = 'show all child comments';
				} else {
					this.setAttribute('action','hide');
					this.setAttribute('title','Show only replies to original poster.');
					this.textContent = 'hide all child comments';
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
					toggleLink.textContent = 'hide child comments';
					toggleLink.setAttribute('action','hide');
					toggleLink.setAttribute('href','javascript:void(0);');
					toggleLink.setAttribute('class','toggleChildren');
					// toggleLink.setAttribute('title','Hide child comments.');
					toggleLink.addEventListener('click', function(e) {
						modules['hideChildComments'].toggleComments(this.getAttribute('action'), this);
						if (this.getAttribute('action') == 'hide') {
							this.setAttribute('action','show');
							// this.setAttribute('title','show child comments.');
							this.textContent = 'show child comments';
						} else {
							this.setAttribute('action','hide');
							// this.setAttribute('title','hide child comments.');
							this.textContent = 'hide child comments';
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
						thisToggleLink.textContent = 'show child comments';
						// thisToggleLink.setAttribute('title','show child comments');
						thisToggleLink.setAttribute('action','show');
					} else {
						if (thisChildren != null) {
							thisChildren.style.display = 'block';
						}
						thisToggleLink.textContent = 'hide child comments';
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

			$('ul.flat-list > li:nth-child(4) > a')
				.live('mouseover', modules['showParent'].show)
				.live('mouseout', modules['showParent'].hide);
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
			var replacedHTML = parentDiv.innerHTML.replace(/\<ul\s+class[\s\S]+\<\/ul\>/,"").replace(/\<a[^\>]+>\[-\]\<\/a\>/,'');
			// replacedHTML is HTML that's already on the page. We need it in tact, we can't escape it, but if it's already on the page, it's not going to be malicious.
			// hence no escapeHTML call here.
			$(div).html(replacedHTML);
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
			
			if (RESUtils.pageType() != 'linklist') {
				sessionStorage.NERpageURL = location.href;
			}
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
				this.NREMailCount.setAttribute('href',modules['betteReddit'].getInboxLink(true));
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
			this.NREMail.setAttribute('href', modules['betteReddit'].getInboxLink(true));
			this.NREMail.setAttribute('title','new mail!');
			var newMailImg = '/static/mail.png';
			if (modules['styleTweaks'].options.colorBlindFriendly.value) {
				newMailImg = 'http://thumbs.reddit.com/t5_2s10b_5.png';
			}
			addClass(this.NREMail, 'havemail');
			modules['betteReddit'].showUnreadCount();
		} else {
			modules['neverEndingReddit'].hasNewMail = false;
			addClass(this.NREMail, 'nohavemail');
			this.NREMail.setAttribute('href',modules['betteReddit'].getInboxLink(false));
			this.NREMail.setAttribute('title','no new mail');
			removeClass(this.NREMail, 'havemail');
			modules['betteReddit'].setUnreadCount(0);
		}
	},
	attachModalWidget: function() {
		this.modalWidget = createElementWithID('div','NERModal');
		$(this.modalWidget).html('&nbsp;');
		this.modalContent = createElementWithID('div','NERContent');
		$(this.modalContent).html('<div id="NERModalClose" class="RESCloseButton">&times;</div>Never Ending Reddit has detected that you are returning from a page that it loaded. Please give us a moment while we reload that content and return you to where you left off.<br><img src="'+RESConsole.loader+'">');
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
		$(this.progressIndicator).html('Never Ending Reddit - '+scrollMsg+'click to activate, or you can <a id="NERStaticLink" href="'+this.nextPageURL+'">open the URL manually</a>');
		this.progressIndicator.id = 'progressIndicator';
		this.progressIndicator.className = 'neverEndingReddit';
		this.progressIndicator.addEventListener('click', function(e) {
			if (e.target.id == 'NERStaticLink') {
				return true;
			} else {
				e.preventDefault();
				modules['neverEndingReddit'].loadNewPage();
			}
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
			$(this.progressIndicator).html('<img src="'+RESConsole.loader+'"> Loading next page...');
			this.isLoading = true;
			// as a sanity check, which should NEVER register true, we'll make sure this.nextPageURL is on the same domain we're browsing...
			if (this.nextPageURL.indexOf(location.hostname) == -1) {
				console.log('Next page URL mismatch. Something strange may be afoot.')
				return false;
			}
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
					$(tempDiv).html(thisHTML.replace(/<script(.|\s)*?\/script>/g, ''));
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
							$(pageMarker).text('Page ' + modules['neverEndingReddit'].currPage);
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
									$(endOfReddit).text('You\'ve reached the last page available.  There are no more pages to load.');
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
						var e = document.createEvent("Events");
						e.initEvent("neverEndingLoad", true, true);
						window.dispatchEvent(e);					
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
			$(newHTML).html('Reddit has responded "there doesn\'t seem to be anything here." - this sometimes happens after several pages as votes shuffle posts up and down. You\'ll have to <a href="'+location.href.split('#')[0]+'">start from the beginning.</a>  If you like, you can try loading <a target="_blank" href="'+modules['neverEndingReddit'].nextPageURL+'">the same URL that RES tried to load.</a> If you are interested, there is a <a target="_blank" href="http://www.reddit.com/r/Enhancement/comments/s72xt/never_ending_reddit_and_reddit_barfing_explained/">technical explanation here</a>.');
			newHTML.setAttribute('style','cursor: auto !important;');
		} else {
			$(newHTML).text('It appears Reddit is under heavy load or has barfed for some other reason, so Never Ending Reddit couldn\'t load the next page. Click here to try to load the page again.');
			newHTML.addEventListener('click', function(e) {
				modules['neverEndingReddit'].attachLoaderWidget();
				modules['neverEndingReddit'].loadNewPage(false, true);
				e.target.parentNode.removeChild(e.target);
				e.target.textContent = 'Loading... or trying, anyway...';
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

modules['saveComments'] = {
	moduleID: 'saveComments',
	moduleName: 'Save Comments',
	category: 'Comments',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
	},
	description: 'Save Comments allows you to save comments, since reddit doesn\'t!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i
	),
	exclude: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*\/submit\/?/i,
		/https?:\/\/([a-z]+).reddit.com\/submit\/?/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var currURL = location.href;
			var commentsRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i);
			var savedRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/user\/([\w]+)\/saved\/?/i);
			if (commentsRegex.test(currURL)) {
				// load already-saved comments into memory...
				this.loadSavedComments();
				this.addSaveLinks();
				$('li.saveComments').live('click', function(e) {
					e.preventDefault();
					modules['saveComments'].saveComment(this, this.getAttribute('saveID'), this.getAttribute('saveLink'), this.getAttribute('saveUser'));
				});
				$('li.unsaveComments').live('click', function(e) {
					// e.preventDefault();
					var id = this.getAttribute('unsaveID');
					modules['saveComments'].unsaveComment(id, this);
				});
			} else if (savedRegex.test(currURL)) {
				// load already-saved comments into memory...
				this.loadSavedComments();
				this.addSavedCommentsTab();
				this.drawSavedComments();
				if (location.hash == '#comments') {
					this.showSavedTab('comments');
				}
			} else {
				this.addSavedCommentsTab();
			}
			// Watch for any future 'reply' forms, or stuff loaded in via "load more comments"...
			/*
			document.body.addEventListener(
				'DOMNodeInserted',
				function( event ) {
					if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
						modules['saveComments'].addSaveLinks(event.target);
					}
				},
				false
			);
			*/
			RESUtils.watchForElement('newComments', modules['saveComments'].addSaveLinks);
		}
	},
	addSaveLinks: function(ele) {
		if (!ele) var ele = document.body;
		var allComments = ele.querySelectorAll('div.commentarea > div.sitetable > div.thing div.entry div.noncollapsed');
		RESUtils.forEachChunked(allComments, 15, 1000, function(comment, i, array) {
			modules['saveComments'].addSaveLinkToComment(comment);
		});
	},
	addSaveLinkToComment: function(commentObj) {
		var commentsUL = commentObj.querySelector('ul.flat-list');
		var permaLink = commentsUL.querySelector('li.first a.bylink');
		if (permaLink != null) {
			// if there's no 'parent' link, then we don't want to put the save link before 'lastchild', we need to move it one to the left..
			// note that if the user is not logged in, there is no next link for first level comments... set to null!
			if (RESUtils.loggedInUser()) {
				if (permaLink.parentNode.nextSibling != null) {
					if (typeof(permaLink.parentNode.nextSibling.firstChild.getAttribute) != 'undefined') {
						var nextLink = permaLink.parentNode.nextSibling.firstChild.getAttribute('href');
					} else {
						var nextLink = null;
					}
				} else {
					var nextLink = null;
				}
			} else {
				var nextLink = null;
			}
			var isTopLevel = ((nextLink == null) || (nextLink.indexOf('#') == -1));
			var userLink = commentObj.querySelector('a.author');
			if (userLink == null) {
				var saveUser = '[deleted]';
			} else {
				var saveUser = userLink.text;
			}
			var saveHREF = permaLink.getAttribute('href');
			var splitHref = saveHREF.split('/');
			var saveID = splitHref[splitHref.length-1];
			var saveLink = document.createElement('li');
			if ((typeof(this.storedComments) != 'undefined') && (typeof(this.storedComments[saveID]) != 'undefined')) {
				$(saveLink).html('<a href="/saved#comments">saved</a>');
			} else {
				$(saveLink).html('<a href="javascript:void(0);">save</a>');
				saveLink.setAttribute('class',  'saveComments');
				saveLink.setAttribute('saveID',saveID);
				saveLink.setAttribute('saveLink',saveHREF);
				saveLink.setAttribute('saveUser',saveUser);
			}
			var whereToInsert = commentsUL.lastChild;
			if (isTopLevel) whereToInsert = whereToInsert.previousSibling;
			commentsUL.insertBefore(saveLink, whereToInsert);
		}
	},
	loadSavedComments: function() {
		// first, check if we're storing saved comments the old way (as an array)...
		var thisComments = RESStorage.getItem('RESmodules.saveComments.savedComments');
		if (thisComments == null) {
			this.storedComments = {};
		} else {
			this.storedComments = safeJSON.parse(thisComments, 'RESmodules.saveComments.savedComments');
			// console.log(this.storedComments);
			// old way of storing saved comments... convert...
			if (thisComments.slice(0,1) == '[') {
				var newFormat = {};
				for (var i in this.storedComments) {
					var urlSplit = this.storedComments[i].href.split('/');
					var thisID = urlSplit[urlSplit.length-1];
					newFormat[thisID] = this.storedComments[i];
				}
				this.storedComments = newFormat;
				RESStorage.setItem('RESmodules.saveComments.savedComments',JSON.stringify(newFormat));
			} 
		}
	},
	saveComment: function(obj, id, href, username, comment) {
		// reload saved comments in case they've been updated in other tabs (works in all but greasemonkey)
		this.loadSavedComments();
		// loop through comments and make sure we haven't already saved this one...
		if (typeof(this.storedComments[id]) != 'undefined') {
			alert('comment already saved!');
		} else {
			if (modules['keyboardNav'].isEnabled()) {
				// unfocus it before we save it so we don't save the keyboard annotations...
				modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
			}
			var comment = obj.parentNode.parentNode.querySelector('div.usertext-body > div.md');
			if (comment != null) {
				commentHTML = comment.innerHTML;
				var savedComment = {
					href: href,
					username: username,
					comment: commentHTML,
					timeSaved: Date()
				};
				this.storedComments[id] = savedComment;
				var unsaveObj = document.createElement('li');
				$(unsaveObj).html('<a href="javascript:void(0);">unsave</a>');
				unsaveObj.setAttribute('unsaveID',id);
				unsaveObj.setAttribute('unsaveLink',href);
				unsaveObj.setAttribute('class','unsaveComments');

				obj.parentNode.replaceChild(unsaveObj, obj);
			}
			if (modules['keyboardNav'].isEnabled()) {
				modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
			}
			if (RESUtils.proEnabled()) {
				// add sync adds/deletes for RES Pro.
				if (typeof(this.storedComments.RESPro_add) == 'undefined') {
					this.storedComments.RESPro_add = {}
				}
				if (typeof(this.storedComments.RESPro_delete) == 'undefined') {
					this.storedComments.RESPro_delete = {}
				}
				// add this ID next time we sync...
				this.storedComments.RESPro_add[id] = true;
				// make sure we don't run a delete on this ID next time we sync...
				if (typeof(this.storedComments.RESPro_delete[id]) != 'undefined') delete this.storedComments.RESPro_delete[id];
			}
			RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(this.storedComments));
			if (RESUtils.proEnabled()) {
				modules['RESPro'].authenticate(function() {
					modules['RESPro'].saveModuleData('saveComments');
				});
			}
		}
	},
	addSavedCommentsTab: function() {
		var mainmenuUL = document.body.querySelector('#header-bottom-left ul.tabmenu');
		if (mainmenuUL) {
			var savedRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/user\/[\w]+\/saved\/?/i);
			var menuItems = mainmenuUL.querySelectorAll('li');
			for (var i=0, len=menuItems.length;i<len;i++) {
				var savedLink = menuItems[i].querySelector('a');
				if ((hasClass(menuItems[i], 'selected')) && (savedRegex.test(savedLink.href))) {
					menuItems[i].addEventListener('click', function(e) {
						e.preventDefault();
						modules['saveComments'].showSavedTab('links');
					}, true);
				}
				var thisUser = RESUtils.loggedInUser() || '';
				if (savedRegex.test(savedLink.href)) {
					this.savedLinksTab = menuItems[i];
					savedLink.textContent = 'saved links';
				}
			}
			this.savedCommentsTab = document.createElement('li');
			$(this.savedCommentsTab).html('<a id="savedCommentsTab" href="javascript:void(0);">saved comments</a>');
			if (savedRegex.test(location.href)) {
				this.savedCommentsTab.addEventListener('click', function(e) {
					e.preventDefault();
					modules['saveComments'].showSavedTab('comments');
				}, true);
			} else {
				this.savedCommentsTab.addEventListener('click', function(e) {
					e.preventDefault();
					location.href = location.protocol + '//www.reddit.com/saved/#comments';
				}, true);
			}
			if (this.savedLinksTab != null) {
				insertAfter(this.savedLinksTab, this.savedCommentsTab);
			}
		}
	},
	showSavedTab: function(tab) {
		switch(tab) {
			case 'links':
				location.hash = 'links';
				this.savedLinksContent.style.display = 'block';
				this.savedCommentsContent.style.display = 'none';
				addClass(this.savedLinksTab, 'selected');
				removeClass(this.savedCommentsTab, 'selected');
				break;
			case 'comments':
				location.hash = 'comments';
				this.savedLinksContent.style.display = 'none';
				this.savedCommentsContent.style.display = 'block';
				removeClass(this.savedLinksTab, 'selected');
				addClass(this.savedCommentsTab, 'selected');
				break;
		}
	},
	drawSavedComments: function() {
		RESUtils.addCSS('.savedComment { padding: 5px; font-size: 12px; margin-bottom: 20px; margin-left: 40px; margin-right: 10px; border: 1px solid #CCCCCC; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; width: auto; } ');
		RESUtils.addCSS('.savedCommentHeader { margin-bottom: 8px; }');
		RESUtils.addCSS('.savedCommentBody { margin-bottom: 8px; }');
		RESUtils.addCSS('#savedLinksList { margin-top: 10px; }');
		// css += '.savedCommentFooter {  }';
		this.savedLinksContent = document.body.querySelector('BODY > div.content');
		this.savedCommentsContent = createElementWithID('div', 'savedLinksList');
		this.savedCommentsContent.style.display = 'none';
		this.savedCommentsContent.setAttribute('class','sitetable linklisting');
		for (var i in this.storedComments) {
			if ((i != 'RESPro_add') && (i != 'RESPro_delete')) {
				var clearLeft = document.createElement('div');
				clearLeft.setAttribute('class','clearleft');
				var thisComment = document.createElement('div');
				addClass(thisComment, 'savedComment');
				addClass(thisComment, 'thing entry');
				// this is all saved locally, but just for safety, we'll clean out any script tags and whatnot...
				var cleanHTML = '<div class="savedCommentHeader">Comment by user: ' + escapeHTML(this.storedComments[i].username) + ' saved on ' + escapeHTML(this.storedComments[i].timeSaved) + '</div>';
				cleanHTML += '<div class="savedCommentBody">' + this.storedComments[i].comment.replace(/<script(.|\s)*?\/script>/g, '') + '</div>';
				cleanHTML += '<div class="savedCommentFooter"><ul class="flat-list buttons"><li><a class="unsaveComment" href="javascript:void(0);">unsave</a></li><li><a href="' + escapeHTML(this.storedComments[i].href) + '">view original</a></li></ul></div>'
				$(thisComment).html(cleanHTML);
				var unsaveLink = thisComment.querySelector('.unsaveComment');
				unsaveLink.setAttribute('unsaveID', i);
				unsaveLink.setAttribute('unsaveLink', this.storedComments[i].href);
				unsaveLink.addEventListener('click', function(e) {
					e.preventDefault();
					modules['saveComments'].unsaveComment(this.getAttribute('unsaveID'));
				}, true);
				this.savedCommentsContent.appendChild(thisComment);
				this.savedCommentsContent.appendChild(clearLeft);
			}
		}
		if (this.storedComments.length == 0) {
			$(this.savedCommentsContent).html('<li>You have not yet saved any comments.</li>');
		}
		insertAfter(this.savedLinksContent, this.savedCommentsContent);
	},
	unsaveComment: function(id, unsaveLink) {
		/*
		var newStoredComments = [];
		for (var i=0, len=this.storedComments.length;i<len;i++) {
			if (this.storedComments[i].href != href) {
				newStoredComments.push(this.storedComments[i]);
			} else {
				// console.log('found match. deleted comment');
			}
		}
		this.storedComments = newStoredComments;
		*/
		delete this.storedComments[id];
		if (RESUtils.proEnabled()) {
			// add sync adds/deletes for RES Pro.
			if (typeof(this.storedComments.RESPro_add) == 'undefined') {
				this.storedComments.RESPro_add = {}
			}
			if (typeof(this.storedComments.RESPro_delete) == 'undefined') {
				this.storedComments.RESPro_delete = {}
			}
			// delete this ID next time we sync...
			this.storedComments.RESPro_delete[id] = true;
			// make sure we don't run an add on this ID next time we sync...
			if (typeof(this.storedComments.RESPro_add[id]) != 'undefined') delete this.storedComments.RESPro_add[id];
		}
		RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(this.storedComments));
		if (RESUtils.proEnabled()) {
			modules['RESPro'].authenticate(function() {
				modules['RESPro'].saveModuleData('saveComments');
			});
		}
		if (typeof(this.savedCommentsContent) != 'undefined') {
			this.savedCommentsContent.parentNode.removeChild(this.savedCommentsContent);
			this.drawSavedComments();
			this.showSavedTab('comments');
		} else {
			var commentObj = unsaveLink.parentNode.parentNode;
			unsaveLink.parentNode.removeChild(unsaveLink);
			this.addSaveLinkToComment(commentObj);
		}
	}
};

modules['userHighlight'] = {
	moduleID: 'userHighlight',
	moduleName: 'User Highlighter',
	category: 'Users',
	description: 'Highlights certain users in comment threads: OP, Admin, Friends, Mod - contributed by MrDerk',
	options: { 
		highlightOP: {
			type: 'boolean',
			value: true,
			description: 'Highlight OP\'s comments'
		},
		OPColor: {
			type: 'text',
			value: '#0055DF',
			description: 'Color to use to highlight OP. Defaults to original text color'
		},
		OPColorHover: {
			type: 'text',
			value: '#4E7EAB',
			description: 'Color used to highlight OP on hover.'
		},
		highlightAdmin: {
			type: 'boolean',
			value: true,
			description: 'Highlight Admin\'s comments'
		},
		adminColor: {
			type: 'text',
			value: '#FF0011',
			description: 'Color to use to highlight Admins. Defaults to original text color'
		},
		adminColorHover: {
			type: 'text',
			value: '#B3000C',
			description: 'Color used to highlight Admins on hover.'
		},
		highlightFriend: {
			type: 'boolean',
			value: true,
			description: 'Highlight Friends\' comments'
		},
		friendColor: {
			type: 'text',
			value: '#FF4500',
			description: 'Color to use to highlight Friends. Defaults to original text color'
		},
		friendColorHover: {
			type: 'text',
			value: '#B33000',
			description: 'Color used to highlight Friends on hover.'
		},
		highlightMod: {
			type: 'boolean',
			value: true,
			description: 'Highlight Mod\'s comments'
		},
		modColor: {
			type: 'text',
			value: '#228822',
			description: 'Color to use to highlight Mods. Defaults to original text color'
		},
		modColorHover: {
			type: 'text',
			value: '#134913',
			description: 'Color used to highlight Mods on hover. Defaults to gray.'
		},
		fontColor: {
			type: 'text',
			value: 'white',
			description: 'Color for highlighted text.'
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},	
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.highlightOP.value) {
				var name = 'submitter';
				var color = this.options.OPColor.value;
				var hoverColor = this.options.OPColorHover.value;
				this.doHighlight(name,color,hoverColor);
			}
			if (this.options.highlightFriend.value) {
				var name = 'friend';
				var color = this.options.friendColor.value;
				var hoverColor = this.options.friendColorHover.value;
				this.doHighlight(name,color,hoverColor);
			}
			if (this.options.highlightMod.value) {
				var name = 'moderator';
				var color = this.options.modColor.value;
				var hoverColor = this.options.modColorHover.value;
				this.doHighlight(name,color,hoverColor);
			}
			if (this.options.highlightAdmin.value) {
				var name = 'admin';
				var color = this.options.adminColor.value;
				var hoverColor = this.options.adminColorHover.value;
				this.doHighlight(name,color,hoverColor);
			}			
		}
	},
	doHighlight: function(name,color,hoverColor) {
		// First look for .noncollapsed members. If they're there, we have comments
		// If we skip the noncollapsed, we can pick up the gray, collapsed versions
		// If that's the case, you'll end up with gray as your 'default' color
		var firstComment = document.querySelector('.noncollapsed .' + name);
		// This kicks in if a friend/admin/mod has made a post but not a comment, 
		// allowing them to be highlighted at the top of the submission
		if (firstComment === null) { 
			firstComment = document.querySelector('.' + name); 
		}
		if (firstComment != null) {
			if (color === 'default') {
				color = this.getStyle(firstComment, 'color');
			}
			if (hoverColor === 'default') {
				hoverColor = "#AAA";
			}
			if(typeof(color) != "undefined" && color != 'rgb(255, 255, 255)') {
				RESUtils.addCSS("\
				.author." + name + " { \
					color: " + this.options.fontColor.value + " !important; \
					font-weight: bold; \
					padding: 0 2px 0 2px; \
					border-radius: 3px; \
					-moz-border-radius: 3px; \
					-webkit-border-radius: 3px; \
					background-color:" + color + " !important} \
				.collapsed .author." + name + " { \
					color: white !important; \
					background-color: #AAA !important}\
				.author." + name + ":hover {\
					background-color: " + hoverColor + " !important; \
					text-decoration: none !important}");
				// this.addCSS(css);
			}		
		}
	},
	/*addCSS: function(css) {
		// Add CSS Style
		var heads = document.getElementsByTagName("head");
		if (heads.length > 0) {
			var node = document.createElement("style");
			node.type = "text/css";
			node.appendChild(document.createTextNode(css));
			heads[0].appendChild(node);
		}
	},*/
	getStyle: function(oElm, strCssRule){
		var strValue = "";
		if(document.defaultView && document.defaultView.getComputedStyle){
			strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
		}
		else if(oElm.currentStyle){
			strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
				return p1.toUpperCase();
			});
			strValue = oElm.currentStyle[strCssRule];
		}
		return strValue;
	}
}; 

modules['styleTweaks'] = {
	moduleID: 'styleTweaks',
	moduleName: 'Style Tweaks',
	category: 'UI',
	description: 'Provides a number of style tweaks to the Reddit interface',
	options: { 
		navTop: {
			type: 'boolean',
			value: true,
			description: 'Moves the username navbar to the top (great on netbooks!)'
		},
		commentBoxes: {
			type: 'boolean',
			value: true,
			description: 'Highlights comment boxes for easier reading / placefinding in large threads.'
		},
		/* REMOVED for performance reasons...
		commentBoxShadows: {
			type: 'boolean',
			value: false,
			description: 'Drop shadows on comment boxes (turn off for faster performance)'
		},
		*/
		commentRounded: {
			type: 'boolean',
			value: true,
			description: 'Round corners of comment boxes'
		},
		commentHoverBorder: {
			type: 'boolean',
			value: false,
			description: 'Highlight comment box hierarchy on hover (turn off for faster performance)'
		},
		commentIndent: {
			type: 'text',
			value: 10,
			description: 'Indent comments by [x] pixels (only enter the number, no \'px\')'
		},
		continuity: {
			type: 'boolean',
			value: false,
			description: 'Show comment continuity lines'
		},
		lightSwitch: {
			type: 'boolean',
			value: true,
			description: 'Enable lightswitch (toggle between light / dark reddit)'
		},
		lightOrDark: {
			type: 'enum',
			values: [
				{ name: 'Light', value: 'light' },
				{ name: 'Dark', value: 'dark' }
			],
			value: 'light',
			description: 'Light, or dark?'
		},
		visitedStyle: {
			type: 'boolean',
			value: false,
			description: 'Reddit makes it so no links on comment pages appear as "visited" - including user profiles. This option undoes that.'
		},
		showExpandos: {
			type: 'boolean',
			value: true,
			description: 'Bring back video and text expando buttons for users with compressed link display'
		},
		colorBlindFriendly: {
			type: 'boolean',
			value: false,
			description: 'Use colorblind friendly styles when possible'
		},
		scrollSubredditDropdown: {
			type: 'boolean',
			value: true,
			description: 'Scroll the standard subreddit dropdown (useful for pinned header and disabled Subreddit Manager)'
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},	
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// wow, Reddit doesn't define a visited class for any links on comments pages...
			// let's put that back if users want it back.
			// If not, we still need a visited class for links in comments, like imgur photos for example, or inline image viewer can't make them look different when expanded!
			if (this.options.visitedStyle.value) {
				RESUtils.addCSS(".comment a:visited { color:#551a8b }");
			} else {
				RESUtils.addCSS(".comment .md p > a:visited { color:#551a8b }");
			}
			if (this.options.showExpandos.value) {
				RESUtils.addCSS('.compressed .expando-button { display: block !important; }');
			}
			var commentsRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i);
			if ((this.options.commentBoxes.value) && (commentsRegex.test(location.href))) {
				this.commentBoxes();
			}
			this.isDark = false;
			if (this.options.lightOrDark.value == 'dark') {
				this.isDark = true;
				this.redditDark();
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			
			if (this.isDark) {
				addClass(document.body,'res-nightmode');
			}
			// get rid of antequated option we've removed (err, renamed) due to performance issues.
			if (typeof(this.options.commentBoxHover) != 'undefined') {
				delete this.options.commentBoxHover;
				RESStorage.setItem('RESoptions.styleTweaks', JSON.stringify(modules['styleTweaks'].options));
			}
			if (this.options.navTop.value) {
				this.navTop();
			}
			if (this.options.lightSwitch.value) {
				this.lightSwitch();
			}
			if (this.options.colorBlindFriendly.value) {
				var orangered = document.body.querySelector('#mail');
				if ((orangered) && (hasClass(orangered, 'havemail'))) {
					orangered.setAttribute('style','background-image: url(http://thumbs.reddit.com/t5_2s10b_5.png); background-position: 0px 0px;');
				}
			}
			if (this.options.scrollSubredditDropdown.value) {
				var calcedHeight = Math.floor(window.innerHeight * 0.95);
				if( $('.drop-choices.srdrop').height() > calcedHeight ) {
					RESUtils.addCSS('.drop-choices.srdrop { \
						overflow-y:scroll; \
						height:' + calcedHeight + 'px; \
					}');
				}
			}
			if (this.options.showExpandos.value) {
				RESUtils.addCSS('.compressed .expando-button { display: block !important; }');
				var twitterLinks = document.body.querySelectorAll('.entry > p.title > a.title');
				var isTwitterLink = /twitter.com\/(?:#!\/)?([\w]+)\/(status|statuses)\/([\d]+)/i;
				for (var i=0, len = twitterLinks.length; i<len; i++) {
					var thisHref = twitterLinks[i].getAttribute('href');
					thisHref = thisHref.replace('/#!','');
					if (isTwitterLink.test(thisHref)) {
						var thisExpandoButton = document.createElement('div');
						thisExpandoButton.setAttribute('class','expando-button collapsed selftext twitter');
						thisExpandoButton.addEventListener('click',modules['styleTweaks'].toggleTweetExpando,false);
						insertAfter(twitterLinks[i].parentNode, thisExpandoButton);
					}
				}
			}
			this.userbarHider();
			this.subredditStyles();
		}
	},
	toggleTweetExpando: function(e) {
		var thisExpando = e.target.nextSibling.nextSibling.nextSibling;
		if (hasClass(e.target,'collapsed')) {
			$(e.target).removeClass('collapsed').addClass('expanded');
			console.log(thisExpando);
			if (hasClass(thisExpando,'twitterLoaded')) {
				thisExpando.style.display = 'block';
				return;
			}
			var twitterLink = e.target.previousSibling.querySelector('.title');
			if (twitterLink) twitterLink = twitterLink.getAttribute('href').replace('/#!','');
			var match = twitterLink.match(/twitter.com\/[^\/]+\/(?:status|statuses)\/([\d]+)/i);
			if (match != null) {
				var jsonURL = 'http://api.twitter.com/1/statuses/show/'+match[1]+'.json';
				if (typeof(chrome) != 'undefined') {
					// we've got chrome, so we need to hit up the background page to do cross domain XHR
					var thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					};
					chrome.extension.sendMessage(thisJSON, function(response) {
						// send message to background.html 
						var tweet = response;
						$(thisExpando).html('<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+escapeHTML(tweet.user.profile_image_url)+'"></div>' + escapeHTML(tweet.user.screen_name) + ': ' + escapeHTML(tweet.text) + '</div></div></form>');
						thisExpando.style.display = 'block';
						addClass(thisExpando,'twitterLoaded');
					});
				} else if (typeof(safari) != 'undefined') {
					// we've got safari, so we need to hit up the background page to do cross domain XHR
					modules['styleTweaks'].tweetExpando = thisExpando;
					var thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					}
					safari.self.tab.dispatchMessage("loadTweet", thisJSON);
				} else if (typeof(opera) != 'undefined') {
					// we've got opera, so we need to hit up the background page to do cross domain XHR
					modules['styleTweaks'].tweetExpando = thisExpando;
					var thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					}
					opera.extension.postMessage(JSON.stringify(thisJSON));
				} else if (typeof(self.on) == 'function') {
					// we've got a jetpack extension, hit up the background page...
					modules['styleTweaks'].tweetExpando = thisExpando;
					var thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					}
					self.postMessage(thisJSON);
				} else {
					GM_xmlhttpRequest({
						method:	"GET",
						url:	jsonURL,
						target: thisExpando,
						onload:	function(response) {
							var tweet = JSON.parse(response.responseText);
							$(thisExpando).html('<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+escapeHTML(tweet.user.profile_image_url)+'"></div>' + escapeHTML(tweet.user.screen_name) + ': ' + escapeHTML(tweet.text) + '</div></div></form>');
							thisExpando.style.display = 'block';
						}
					});
				}
			}
		} else {
			$(e.target).removeClass('expanded').addClass('collapsed');
			thisExpando.style.display = 'none';
		}
		
	},
	navTop: function() {
		RESUtils.addCSS('#header-bottom-right { top: 19px; border-radius: 0px 0px 0px 3px; -moz-border-radius: 0px 0px 0px 3px; -webkit-border-radius: 0px 0px 0px 3px; bottom: auto;  }');
		$('#header-bottom-right').addClass('res-navTop');
	},
	userbarHider: function() {
		RESUtils.addCSS("#userbarToggle { min-height: 22px; position: absolute; top: 0px; left: -5px; width: 16px; padding-right: 3px; height: 100%; font-size: 15px; border-radius: 4px 0px 0px 4px; color: #a1bcd6; display: inline-block; background-color: #dfecf9; border-right: 1px solid #cee3f8; cursor: pointer; text-align: right; line-height: 24px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { min-height: 26px; }");
		RESUtils.addCSS("#header-bottom-right .user { margin-left: 16px; }");
		// RESUtils.addCSS(".userbarHide { background-position: 0px -137px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { left: -12px; }");
		RESUtils.addCSS(".res-navTop #userbarToggle.userbarShow { top:0 }");
		this.userbar = document.getElementById('header-bottom-right');
		if (this.userbar) {
			this.userbarToggle = createElementWithID('div','userbarToggle');
			$(this.userbarToggle).html('&raquo;');
			this.userbarToggle.setAttribute('title','Toggle Userbar');
			addClass(this.userbarToggle, 'userbarHide');
			this.userbarToggle.addEventListener('click', function(e) {
				modules['styleTweaks'].toggleUserBar();
			}, false);
			this.userbar.insertBefore(this.userbarToggle, this.userbar.firstChild);
			// var currHeight = $(this.userbar).height();
			// $(this.userbarToggle).css('height',currHeight+'px');
			if (RESStorage.getItem('RESmodules.styleTweaks.userbarState') == 'hidden') {
				this.toggleUserBar();
			}
		}
	},
	toggleUserBar: function() {
		var nextEle = this.userbarToggle.nextSibling;
		// hide userbar.
		if (hasClass(this.userbarToggle,'userbarHide')) {
			removeClass(this.userbarToggle,'userbarHide');
			addClass(this.userbarToggle,'userbarShow');
			$(this.userbarToggle).html('&laquo;');
			RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'hidden');
			modules['accountSwitcher'].closeAccountMenu();
			while ((typeof(nextEle) != 'undefined') && (nextEle != null)) {
				nextEle.style.display = 'none';
				nextEle = nextEle.nextSibling;
			}
		// show userbar.
		} else {
			removeClass(this.userbarToggle,'userbarShow');
			addClass(this.userbarToggle,'userbarHide');
			$(this.userbarToggle).html('&raquo;');
			RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'visible');
			while ((typeof(nextEle) != 'undefined') && (nextEle != null)) {
			if ((nextEle.className.match(/mail/)) || (nextEle.id == 'openRESPrefs')) {
				nextEle.style.display = 'inline-block';
			} else {
				nextEle.style.display = 'inline';
			}
		nextEle = nextEle.nextSibling;
			}
		}
	},
	commentBoxes: function() {
		// replaced with a less intensive method... adapted from Reddit Comment Boxes via:
		// @description	  Updated version of Tiby312's Reddit Comment Boxes script (http://userscripts.org/scripts/show/63628) 
		// @author        flatluigi
		

		RESUtils.addCSS(".parentComment { background-color:#ffffff !important; } ");
		RESUtils.addCSS(".comment{");
		if (this.options.commentRounded.value) {
			RESUtils.addCSS("	-moz-border-radius:3px !important;"+
				" 	 -webkit-border-radius:3px !important;"+
				" 	 border-radius:3px !important;");
		}
		RESUtils.addCSS("	margin-left:"+this.options.commentIndent.value+"px !important;"+
		"	margin-right:8px!important;"+
		"	margin-top:0px!important;"+
		"	margin-bottom:8px!important;"+
		// commented out, we'll do this in the parentHover class for more CSS friendliness to custom subreddit stylesheets...
		// "	background-color:#ffffff !important;"+
		"	border:1px solid #e6e6e6 !important;"+
		"	padding-left:5px!important;"+
		"	padding-top:5px!important;"+
		"	padding-right:8px!important;"+
		"	padding-bottom:0px!important;"+
		"	overflow: hidden !important;"+
		"}");
		if (this.options.continuity.value) {
			RESUtils.addCSS('.comment div.child { border-left: 1px dotted #555555 !important; } ');
		} else {
			RESUtils.addCSS('.comment div.child { border-left: none !important; } ');
		}
		RESUtils.addCSS(".comment .comment{"+
		"	margin-right:0px!important;"+
		"	background-color:#F7F7F8 !important;"+	
		"}"+
		".comment .comment .comment{"+
		"	background-color:#ffffff !important;"+	
		"}"+
		".comment .comment .comment .comment{"+
		"	background-color:#F7F7F8 !important;"+	
		"}"+
		".comment .comment .comment .comment .comment{"+
		"	background-color:#ffffff !important;"+	
		"}"+
		".comment .comment .comment .comment .comment .comment{"+
		"	background-color:#F7F7F8 !important;"+	
		"}"+
		".comment .comment .comment .comment .comment .comment .comment{"+
		"	background-color:#ffffff !important;"+	
		"}"+
		".comment .comment .comment .comment .comment .comment .comment .comment{"+
		"	background-color:#F7F7F8 !important;"+	
		"}"+
		".comment .comment .comment .comment .comment .comment .comment .comment .comment{"+
		"	background-color:#ffffff !important;"+	
		"}"+
		".comment .comment .comment .comment .comment .comment .comment .comment .comment .comment{"+
		"	background-color:#F7F7F8 !important;"+	
		"}"+
		/*
		".commentarea, .link, .comment {"+
		"	overflow:hidden; !important;"+
		"}"+
		*/
		"body > .content {"+
		" padding-right:0px; !important;"+
		"}"); 
		if (this.options.commentHoverBorder.value) {
			RESUtils.addCSS(" .comment:hover {border: 1px solid #99AAEE !important; }");
		}
	},
	lightSwitch: function() {
		RESUtils.addCSS(".lightOn { background-position: 0px -96px; } ");
		RESUtils.addCSS(".lightOff { background-position: 0px -108px; } ");
		RESUtils.addCSS('#lightSwitchToggle { float: right; margin-right: 10px; margin-top: 10px; line-height: 10px; }');
		var thisFrag = document.createDocumentFragment();
		this.lightSwitch = document.createElement('li');
		this.lightSwitch.setAttribute('title',"Toggle night and day");
		this.lightSwitch.addEventListener('click',function(e) {
			e.preventDefault();
			if (modules['styleTweaks'].isDark == true) {
				RESUtils.setOption('styleTweaks','lightOrDark','light');
				removeClass(modules['styleTweaks'].lightSwitchToggle, 'enabled');
				RESUtils.notification('Dark style will be removed on next page load.')
				// modules['styleTweaks'].redditDark(true);
			} else {
				RESUtils.setOption('styleTweaks','lightOrDark','dark');
				addClass(modules['styleTweaks'].lightSwitchToggle, 'enabled');
				RESUtils.notification('Dark style will be applied on next page load.')
				// modules['styleTweaks'].redditDark();
			}
		}, true);
		// this.lightSwitch.setAttribute('id','lightSwitch');
		this.lightSwitch.textContent = 'night mode';
		this.lightSwitchToggle = createElementWithID('div','lightSwitchToggle','toggleButton');
		$(this.lightSwitchToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
		this.lightSwitch.appendChild(this.lightSwitchToggle);
		(this.options.lightOrDark.value == 'dark') ? addClass(this.lightSwitchToggle, 'enabled') : removeClass(this.lightSwitchToggle, 'enabled');
		// thisFrag.appendChild(separator);
		thisFrag.appendChild(this.lightSwitch);
		// if (RESConsole.RESPrefsLink) insertAfter(RESConsole.RESPrefsLink, thisFrag);
		$('#RESDropdownOptions').append(this.lightSwitch);
	},
	subredditStyles: function() {
		this.ignoredSubReddits = [];
		var getIgnored = RESStorage.getItem('RESmodules.styleTweaks.ignoredSubredditStyles');
		if (getIgnored) {
			this.ignoredSubReddits = safeJSON.parse(getIgnored, 'RESmodules.styleTweaks.ignoredSubredditStyles');
		}
		this.head = document.getElementsByTagName("head")[0];
		var subredditTitle = document.querySelector('.titlebox h1');
		var styleToggle = document.createElement('div');
		// great, now people are still finding ways to hide this.. these extra declarations are to try and fight that.
		// Sorry, subreddit moderators, but users can disable all subreddit stylesheets if they want - this is a convenience 
		// for them and I think taking this functionality away from them is unacceptable.
		styleToggle.setAttribute('style','display: block !important; position: relative !important; left: 0px !important; top: 0px !important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0px !important; font-size: 12px !important; z-index: 2147483647 !important;');
		var thisLabel = document.createElement('label');
		// addClass(styleToggle,'styleToggle');
		this.styleToggleCheckbox = document.createElement('input');
		this.styleToggleCheckbox.setAttribute('type','checkbox');
		var styleCBName = RESUtils.randomHash();
		this.styleToggleCheckbox.setAttribute('id',styleCBName);
		this.styleToggleCheckbox.setAttribute('name',styleCBName);
		this.styleToggleCheckbox.setAttribute('style','display: inline-block !important; position: relative !important; left: 0px !important; top: 0px !important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0px !important; font-size: 12px !important; z-index: 2147483647 !important;');
		if (RESUtils.currentSubreddit()) {
			this.curSubReddit = RESUtils.currentSubreddit().toLowerCase();
		}
		if ((this.curSubReddit != null) && (subredditTitle != null)) {
			var idx = this.ignoredSubReddits.indexOf(this.curSubReddit);
			if (idx == -1) {
				this.styleToggleCheckbox.checked = true;
			} else {
				this.toggleSubredditStyle(false);
			}
			this.styleToggleCheckbox.addEventListener('change', function(e) {
				modules['styleTweaks'].toggleSubredditStyle(this.checked);
			}, false);
			styleToggle.appendChild(this.styleToggleCheckbox);
			insertAfter(subredditTitle, styleToggle);
		}
		thisLabel.setAttribute('for',styleCBName);
		thisLabel.setAttribute('style','display: inline-block !important; position: relative !important; left: 0px !important; top: 0px !important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0px !important; font-size: 12px !important; margin-left: 4px !important; z-index: 2147483647 !important;');
		thisLabel.textContent = 'Use subreddit style ';
		styleToggle.appendChild(thisLabel);
	},
	toggleSubredditStyle: function(toggle, subreddit) {
		var togglesr = (subreddit) ? subreddit.toLowerCase() : this.curSubReddit;
		if (toggle) {
			var idx = this.ignoredSubReddits.indexOf(togglesr);
			if (idx != -1) this.ignoredSubReddits.splice(idx, 1); // Remove it if found...
			var subredditStyleSheet = document.createElement('link');
			subredditStyleSheet.setAttribute('title','applied_subreddit_stylesheet');
			subredditStyleSheet.setAttribute('rel','stylesheet');
			subredditStyleSheet.setAttribute('href','http://www.reddit.com/r/'+togglesr+'/stylesheet.css');
			if (!subreddit || (subreddit == this.curSubReddit)) this.head.appendChild(subredditStyleSheet);
		} else {
			var idx = this.ignoredSubReddits.indexOf(togglesr); // Find the index
			if (idx==-1) this.ignoredSubReddits[this.ignoredSubReddits.length] = togglesr;
			var subredditStyleSheet = this.head.querySelector('link[title=applied_subreddit_stylesheet]');
			if (!subredditStyleSheet) subredditStyleSheet = this.head.querySelector('style[title=applied_subreddit_stylesheet]');
			if ((subredditStyleSheet) && (!subreddit || (subreddit == this.curSubReddit))) {
				subredditStyleSheet.parentNode.removeChild(subredditStyleSheet);
			}
		}
		RESStorage.setItem('RESmodules.styleTweaks.ignoredSubredditStyles',JSON.stringify(this.ignoredSubReddits));
	},
	redditDark: function(off) {
		if (off) {
			this.isDark = false;
			if (typeof(this.darkStyle) != 'undefined') {
				this.darkStyle.parentNode.removeChild(this.darkStyle);
				removeClass(document.body,'res-nightmode');
			}
		} else {
			this.isDark = true;
			var css = ".organic-listing .tabmenu, #header-bottom-left { background-color: #666 !important; }";
			css += "html, body, body > .content {background-color:#222 !important;}";
			css += " body {background-image:none !important}";
			css += " .comment .md p a[href='/spoiler'] {background-color: #000 !important;color: #000 !important;}";
			css += " .comment .md p a[href='/spoiler']:hover, .comment .md p a[href='/spoiler']:active {color: #FFF !important;}";
			css += " .titlebox blockquote,  .sidecontentbox .content {background-color: #111;}";
			css += " .flair {background-color:#bbb!important;color:black!important;}";
			css += " .RESUserTagImage,  button.arrow.prev,  button.arrow.next {opacity:0.5;}";
			css += " #RESConsole {background-color:#ddd;}";
			css += " #RESMenu li.active {background-color:#7f7f7f !important;}";
			css += " #RESConsoleContent,  #RESMenu li {background-color:#eee;}";
			css += " #RESConsoleTopBar #RESLogo,  #progressIndicator {opacity:0.4;}";
			css += " .tabmenu li a,  .login-form,  .login-form input[name*='passwd'],  .login-form-side .submit {background-color:#bbb;}";
			css += " .login-form-side input {width:auto!important;}";
			css += " form.login-form.login-form-side {background-color: #888;color: #eee;}";
			css += " #RESConsoleTopBar,  .moduleHeader,  .allOptionsContainer,  .optionContainer {background-color: #ccc;color:black !important;}"; 
			css += " #siteTable sitetable{background-color:#222 !important;}";
			css += " #commentNavButtons * {color:white !important;}";
			css += " .usertable .btn {border-color:#aa9 !important;color:#aa9 !important;}";
			css += " .usertable tr .user .userkarma {color:#aa9 !important;}";
			css += " .thing.spam {background-color:salmon !important;}";
			css += " .wikipage h1 {color:#ddd !important;}";
			css += " .titlebox .usertext-body .md h3, #userTaggerTable th, #newCommentsTable th {color:#000;}";
			css += " .new-comment .usertext-body .md {border:0.1em #aaa dashed;}";
			css += " .sitetable .moderator {background-color:#282!important;}";
			css += " .sitetable .admin {background-color:#F01!important;}";
			css += " .message ul {color:#abcabc !important;}";
			css += " .side .spacer > #search input {background-color:#444 !important;}";
			css += " input[type=\"text\"] {background-color:#aaa !important;}";
			css += " .share-button .option {color: #8AD !important;}";
			css += "body > .content > .spacer > .sitetable:before, body > .content > .sharelink ~ .sitetable:before,  .side .age,  .trophy-info * {color: #ddd !important;}";
			css += " .livePreview blockquote {border-left: 2px solid white !important};";
			css += " #RESDashboardComponent,  RESDashboardComponentHeader {background-color: #ddd !important;}";
			css += " #RESDashboardAddComponent,  .RESDashboardComponentHeader {background-color: #bbb !important;}";
			css += " .addNewWidget, .editWidget, .RESDashboardComponent a.widgetPath,  #authorInfoToolTip a.option,  .updateTime {color: white !important;}";
			css += " .entry .score {color:#dde !important;}";
			css += " .entry p.tagline:first-of-type,  .entry time {color:#dd8;}"
			css += "  code {color:#6c0 !important;}"
			css += " .entry .domain a {color:cyan !important;}"
			css += " .traffic-table tr.odd {color: #222 !important;}"
			css += " .side,  .flairselector,  .linefield {background-color: #222;}"
			css += " .big-mod-buttons .pretty-button {color:black !important;}"
			css += " .voteWeight { background-color: #222 !important; color: white !important;}"
			css += " form.flairtoggle,  .trophy-area .content,  .side .spacer h1,  .NERPageMarker,  .side .spacer {background-color:#222 !important;color:#ddd !important;}";
			css += " .sitetable .thing {border-color:transparent !important;}"
			css += " .message.message-reply.recipient > .entry .head, .message.message-parent.recipient > .entry .head {color:inherit !important;}"
			css += " #header {background-color:#666660 !important;}";
			css += "body { background-color: #222 !important; } .infobar { background-color:#222 !important; color:black !important; }";
			css += '.toggle .option { color:#FFF!important; }';
			css += "#subscribe a, .share .option, h2, .tagline a, .content a, .footer a, .wired a, .side a, .subredditbox li a { color:#8AD !important; }";
			css += ".rank .star { color:orangered !important; } .content { color:#CCC !important; } .thing .title.loggedin, .link .title { color:#DFDFDF !important; }";
			css += ".arrow { height:14px !important; margin-top:0 !important; width:15px !important; }";
			css += ".arrow.up { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=zs9q49wxah08x4kpv2tu5x4nbda7kmcpgkbj) -15px 0 no-repeat !important; }";
			css += ".arrow.down { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=10999ad3mtco31oaf6rrggme3t9jdztmxtg6) -15px -14px no-repeat !important; }";
			css += ".arrow.up:hover { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=9oeida688vtqjpb4k0uy93oongrzuv5j7vcj) -30px 0 no-repeat !important; }";
			css += ".arrow.down:hover { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=cmsw4qrin2rivequ0x1wnmn8ltd7ke328yqs) -30px -14px no-repeat !important; }";
			css += ".arrow.upmod { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=8oarqkcswl255wrw3q1kyd74xrty50a7wr3z) 0 0 no-repeat !important; }";
			css += ".arrow.downmod { background:url(http://thumbs.reddit.com/t5_2qlyl_0.png?v=90eauq018nf41z3vr0u249gv2q6651xyzrkh) 0 -14px no-repeat !important; }";
			css += ".link .score.likes, .linkcompressed .score.likes { color:orangered !important; }";
			css += ".link .score.dislikes, .linkcompressed .score.dislikes { color:#8AD !important; }";
			css += ".linkcompressed .entry .buttons li a, .link .usertext .md, .thing .compressed, organic-listing .link, .organic-listing .link.promotedlink, .link.promotedlink.promoted { background:none !important; }";
			css += ".message.new > .entry {background-color:#444444; border:1px solid #E9E9E9; padding:6px; } ";
			css += ".subredditbox li a:before { content:\"#\" !important; } .subredditbox li { font-weight:bold !important; text-transform:lowercase !important; }";
			css += ".dropdown.lightdrop .drop-choices { background-color:#333 !important; }";
			css += ".dropdown.lightdrop a.choice:hover { background-color:#111 !important; } .midcol {margin-right:7px !important;}  .side {color:#fff; margin-left:10px !important; }";
			css += ".side h4, .side h3 { color:#ddd !important; } .side h5 { color:#aaa !important; margin-top:5px !important; } .side p { margin-top:5px !important; }";
			css += ".sidebox, .subredditbox, .subreddit-info, .raisedbox, .login-form-side { background-color:#393939 !important; border:2px solid #151515 !important; color:#aaa !important; border-radius:8px !important; -moz-border-radius:8px !important; -webkit-border-radius:8px !important; }";
			css += ".login-form-side { background:#e8690a !important; border-bottom:0 !important; border-color:#e8690a !important; padding-bottom:1px !important; position:relative !important; }";
			css += ".login-form-side input { width:125px !important; } .login-form-side label { color:#111 !important; } .login-form-side a { color:#FFFFFF !important; font-size:11px !important; }";
			css += ".login-form-side .error { color:#660000 !important; } .subreddit-info .label { color:#aaa !important; } .subreddit-info { padding:10px !important; }";
			css += ".subreddit-info .spacer a { background-color:#222; border:none !important; margin-right:3px !important; }";
			css += ".subredditbox ul { padding:10px 0px 10px 3px !important; width:140px !important; } .subredditbox ul a:hover { text-decoration:underline !important; } .morelink { background:none !important; border:0 !important; border-radius-bottomleft:6px !important; -moz-border-radius-bottomleft:6px !important; -webkit-border-radius-bottomleft:6px !important; -moz-border-radius-topright:6px !important; -webkit-border-radius-bottom-left-radius:6px !important; -webkit-border-radius-top-right-radius:6px !important; }";
			css += ".morelink.blah:hover { background:none !important; color:#369 !important; } .morelink.blah { background:none !important; border:0 !important; color:#369 !important; }";
			css += ".morelink:hover { border:0 !important; color:white !important; } .sidebox { padding-left:60px !important; }";
			css += ".sidebox.submit { background:#393939 url(http://thumbs.reddit.com/t5_2qlyl_2.png?v=0s1s9iul2umpm0bx46cioc7yjwbkprt7r2qr) no-repeat 6px 50% !important; }";
			css += ".sidebox .spacer, .linkinfo {background-color:#393939 !important; } .nub {background-color: transparent !important;}";
			css += ".sidebox.create { background:#393939 url(http://thumbs.reddit.com/t5_2qlyl_1.png?v=gl82ywfldj630zod4iaq56cidjud4n79wqw8) no-repeat 6px 50% !important; }";
			css += ".sidebox .subtitle { color:#aaa !important; } h1 { border-bottom:1px solid #444 !important; }";
			css += "button.btn { background:none !important; border:2px solid black !important; color:black !important; position:relative !important; width:auto !important; }";
			css += ".commentreply .buttons button { margin-left:0 !important; margin-top:5px !important; } .commentreply .textarea { color:black !important; }";
			css += ".menuarea { margin-right:315px !important; } .permamessage { background-image:url(http://thumbs.reddit.com/t5_2qlyl_3.png?v=uza2aq80cb2x2e90ojhdqooj1wazax4jjzfc) !important; border-color:#369 !important; }";
			css += ".commentbody.border { background-color:#369 !important; } .commentreply .help tr { background:none !important; } .commentreply table.help { margin:2px !important; }";
			css += "#newlink th { padding-top:5px !important; vertical-align:top !important; } .pretty-form.long-text input[type=\"text\"], .pretty-form.long-text textarea, .pretty-form.long-text input[type=\"password\"], .commentreply textarea { background-color:#333 !important; border:2px solid black !important; color:#CCC !important; padding:4px !important; }";
			css += "input#title { height:5em !important; } .spam, .reported { background:none !important; border:2px dotted !important; padding:4px !important; }";
			css += ".spam { border-color:orangered !important; } .reported { border-color:goldenrod !important; } .organic-listing .linkcompressed { background:none !important; }";
			css += ".organic-listing .nextprev img { opacity:.7 !important; } .organic-listing .nextprev img:hover { opacity:.85 !important; }";
			css += "#search input[type=\"text\"] { background-color:#222 !important; color:gray !important; } #search input[type=\"text\"]:focus { color:white !important; }";
			css += "#sr-header-area, #sr-more-link { background:#c2d2e2 !important; } ";
			css += "#header-bottom-left .tabmenu .selected a { border-bottom:none !important; padding-bottom:0 !important; } #ad-frame { opacity:.8 !important; }";
			css += ".comment.unread { background-color:#4A473B !important; } .raisedbox .flat-list a { background-color:#222 !important; -moz-border-radius:2px !important; -webkit-border-radius:2px !important; }";
			css += ".raisedbox .flat-list a:hover { background-color:#336699 !important; color:white !important; } .instructions { background:white !important; padding:10px !important; }";
			css += ".instructions .preftable th, .instructions .pretty-form  { color:black !important; } #feedback { padding:10px !important; } span[class=\"hover pagename redditname\"] a {font-size: 1.7em !important;}";
			css += ".thing .title.loggedin:visited, .link .title:visited  {color: #666666 !important;} legend {background-color: black !important;}";
			css += "a.author.moderator, a.moderator, a.author.friend, a.friend, a.author.admin, a.admin {color:#fff !important; }";
			css += "table[class=\"markhelp md\"] tr td { background-color: #555 !important; }";
			css += "div.infobar { color: #ccc !important; }  table[class=\"markhelp md\"] tr[style=\"background-color: rgb(255, 255, 153); text-align: center;\"] td { background-color: #36c !important; }";
			css += "form[class=\"usertext border\"] div.usertext-body { background-color: transparent !important;  border-width: 2px !important; border-style: solid !important; border-color: #999 !important; }";
			css += "form[class=\"usertext border\"] div.usertext-body div.md { background-color: transparent !important; } form#form-t1_c0b71p54yc div {color: black !important;}";
			css += "a[rel=\"tag\"], a.dsq-help {color: #8AD !important; }  div[class=\"post-body entry-content\"], div.dsq-auth-header { color: #ccc !important; }";
			css += "div#siteTable div[onclick=\"click_thing(this)\"] {background-color: #222 !important;} .md p {color: #ddd !important; } .mail .havemail img, .mail .nohavemail img {   visibility: hidden; }";
			css += ".havemail {   background: url('http://i.imgur.com/2Anoz.gif') bottom left no-repeat; }  .mail .nohavemail {   background: url('http://imgur.com/6WV6Il.gif') bottom left no-repeat; }";
			css += "#header-bottom-right { background-color: #BBBBBB !important; }";
			css += '.expando-button.image {background: none !important; background-image: url(http://a.thumbs.redditmedia.com/JTs29zfSOzSMYO0B.png) !important;}';
			css += '.expando-button.image.collapsed {background-position: 0px 0px !important;}';
			css += '.expando-button.image.collapsed:hover {background-position: 0px -24px !important;}';
			css += '.expando-button.image.expanded, .eb-se { margin-bottom:5px; background-position: 0px -48px !important;}';
			css += '.expando-button.image.expanded:hover, .eb-seh {background-position: 0px -72px !important;}';
			css += '.expando-button.image.gallery.collapsed {background-position: 0px -288px !important;}';
			css += '.expando-button.image.gallery.collapsed:hover {background-position: 0px -312px !important;}';
			css += '.expando-button.image.gallery.expanded  { margin-bottom:5px; background-position: 0px -336px !important;}';
			css += '.expando-button.image.gallery.expanded:hover {background-position: 0px -360px !important;}';
			css += '.expando-button.selftext {background: none !important; background-image: url(http://a.thumbs.redditmedia.com/JTs29zfSOzSMYO0B.png) !important;}';
			css += '.expando-button.selftext.collapsed {background-position: 0px -96px !important;}';
			css += '.expando-button.selftext.collapsed:hover {background-position: 0px -120px !important;}';
			css += '.expando-button.selftext.expanded, .eb-se { margin-bottom:5px; background-position: 0px -144px !important;}';
			css += '.expando-button.selftext.expanded:hover, .eb-seh {background-position: 0px -168px !important;}';
			css += '.expando-button.video {background: none !important; background-image: url(http://a.thumbs.redditmedia.com/JTs29zfSOzSMYO0B.png) !important;}';
			css += '.expando-button.video.collapsed {background-position: 0px -192px !important;}';
			css += '.expando-button.video.collapsed:hover {background-position: 0px -216px !important;}';
			css += '.expando-button.video.expanded, .eb-se { margin-bottom:5px; background-position: 0px -240px !important;}';
			css += '.expando-button.video.expanded:hover, .eb-seh {background-position: 0px -264px !important;}';
			css += '.expando-button {  background-color:transparent!important; }';
			css += '.RESdupeimg { color: #eeeeee; font-size: 10px;  }';
			css += '.keyHighlight, .keyHighlight div.md { background-color: #666666 !important; } .keyHighlight .title.loggedin:visited, .keyHighlight .title:visited { color: #dfdfdf !important; } .nub {background: none !important;}';
			css += '.side .titlebox { padding-left:5px!important;}';
			css += '.user .userkarma { color:#444!important; }';
			css += '.drop-choices { background-color:#C2D2E2!important; }';
			css += '.drop-choices a { color:black!important; }';
			css += '.subreddit .usertext .md { background-color:#222!important; color:#CCC!important; }';
			css += '.formtabs-content { border-top: 6px solid #111!important; }';
			css += 'form#newlink.submit ul.tabmenu>li.selected a { background-color:#111!important; color:#88AADD!important; }';
			css += 'a.link-button, a.text-button { color:#444!important; }';
			css += 'form#newlink.submit button.btn { background-color:#111!important; color:#88AADD!important; }';
			css += '#sr-autocomplete-area { z-index:1!important; }';
			css += 'form#newlink.submit textarea, form#newlink.submit input#url, form#newlink.submit input#sr-autocomplete { background-color:#666!important; color:#CCC!important; }';
			css += '.create-reddit { border:none!important; }';
			css += '.create-reddit span.title { background-color:#111!important; color:#88AADD!important; }';
			css += '.linefield .linefield-content { border-color: #111!important; }';
			css += '.create-reddit input#title, .create-reddit input#name.text, .create-reddit input#domain.text { height:1.2em!important; background-color:#666!important; color:#CCC!important; }';
			css += '.linefield .delete-field { background-color:transparent!important; }';
			css += '.instructions { background-color:transparent!important; }';
			css += '.instructions .preftable th { color:#CCC!important; }';
			css += '.icon-menu a, FORM.leavemoderator-button { background-color:#222!important; }';
			css += '.leavemoderator, FORM.leavecontributor-button { background-color:#222!important; }';
			css += '#pref-delete .delete-field { background-color:transparent!important; }';
			css += '.NERdupe p.title:after { color: #dddddd !important; }';
			css += '.savedComment { color: #dddddd !important; }';
			if (this.options.commentBoxes.value) {
				css += ".comment{"+
				"	background-color:#444444 !important;"+	
				"}"+
				".comment .comment{"+
				"	background-color:#111111 !important;"+	
				"}"+
				".comment .comment .comment{"+
				"	background-color:#444444 !important;"+	
				"}"+
				".comment .comment .comment .comment{"+
				"	background-color:#111111 !important;"+	
				"}"+
				".comment .comment .comment .comment .comment{"+
				"	background-color:#444444 !important;"+	
				"}"+
				".comment .comment .comment .comment .comment .comment{"+
				"	background-color:#111111 !important;"+	
				"}"+
				".comment .comment .comment .comment .comment .comment .comment{"+
				"	background-color:#444444 !important;"+	
				"}"+
				".comment .comment .comment .comment .comment .comment .comment .comment{"+
				"	background-color:#111111 !important;"+	
				"}"+
				".comment .comment .comment .comment .comment .comment .comment .comment .comment{"+
				"	background-color:#444444 !important;"+	
				"}"+
				".comment .comment .comment .comment .comment .comment .comment .comment .comment .comment{"+
				"	background-color:#111111 !important;"+	
				"}";
				css += '.thing { margin-bottom: 10px; border: 1px solid #666666 !important; } ';
			}
			css += '.organic-listing .link { background-color: #333333 !important; } .sidecontentbox { background-color: #111111; }';
			if (this.options.continuity.value) {
				css += '.comment div.child { border-left: 1px dotted #555555 !important; } ';
			} else {
				css += '.comment div.child { border-left: none !important; } ';
			}
			css += '.roundfield {background-color: #111111 !important;}';
			css += '#authorInfoToolTip { background-color: #666666 !important; color: #cccccc !important; border-color: #888888 !important; } #authorInfoToolTip a { color: #88AADD !important; } ';
			css += '.new-comment .usertext-body { background-color: #334455 !important; border: none !important; margin:-1px 0; }';
			css += '.usertext-edit textarea { background-color: #666666 !important; color: #CCCCCC !important; } ';
			css += '.RESDialogSmall { background-color: #666666 !important; color: #CCCCCC !important; } ';
			css += '.RESDialogSmall h3 { background-color: #222222 !important; color: #CCCCCC !important; } ';
			css += 'ul.token-input-list-facebook { background-color: #aaa; }';
			RESUtils.addCSS(css);
		}
		// GM_addStyle(css);
	}
}; 

modules['accountSwitcher'] = {
	moduleID: 'accountSwitcher',
	moduleName: 'Account Switcher',
	category: 'Accounts',
	options: {
		accounts: {
			type: 'table',
			addRowText: '+add account',
			fields: [
				{ name: 'username', type: 'text' },
				{ name: 'password', type: 'password' }
			],
			value: [
				/*
				['somebodymakethis','SMT','[SMT]'],
				['pics','pic','[pic]']
				*/
			],
			description: 'Set your usernames and passwords below. They are only stored in RES preferences.'
		},
		keepLoggedIn: {
			type: 'boolean',
			value: false,
			description: 'Keep me logged in when I restart my browser.'
		},
		showCurrentUserName: {
			type: 'boolean',
			value: false,
			description: 'Show my current user name in the Account Switcher.'
		},
		dropDownStyle: {
			type: 'enum',
			values: [
				{ name: 'snoo (alien)', value: 'alien' },
				{ name: 'simple arrow', value: 'arrow' }
			],
			value: 'alien',
			description: 'Use the "snoo" icon, or older style dropdown?'
		}
	},
	description: 'Store username/password pairs and switch accounts instantly while browsing Reddit!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#header-bottom-right { height: auto; padding: 4px 4px 7px }')
			RESUtils.addCSS('#RESAccountSwitcherDropdown { min-width: 110px; width: auto; display: none; position: absolute; z-index: 999; }');
			RESUtils.addCSS('#RESAccountSwitcherDropdown li.accountName { height: auto; line-height: 20px; padding-top: 2px; padding-bottom: 2px; }');
			if (this.options.dropDownStyle.value == 'alien') {
				// this.alienIMG = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC" />';
				RESUtils.addCSS('#RESAccountSwitcherIcon { cursor: pointer; margin-left: 3px; display: inline-block; width: 12px; vertical-align: middle; height: 16px; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC); }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay { cursor: pointer; position: absolute; display: none; width: 11px; height: 22px; background-position: 2px 3px; padding-left: 2px; padding-right: 2px; padding-top: 3px; border: 1px solid #336699; border-bottom: 1px solid #5f99cf; background-color: #5f99cf; border-radius: 3px 3px 0px 0px; z-index: 100; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC); }');
			} else {
				RESUtils.addCSS('#RESAccountSwitcherIcon { display: inline-block; vertical-align: middle; margin-left: 3px; }');
				RESUtils.addCSS('#RESAccountSwitcherIcon .downArrow { cursor: pointer; margin-top: 2px; display: block; width: 16px; height: 10px; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-position: 0px -106px; }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay { cursor: pointer; position: absolute; display: none; width: 20px; height: 22px; z-index: 100; border: 1px solid #336699; border-bottom: 1px solid #5f99cf; background-color: #5f99cf; border-radius: 3px 3px 0px 0px; }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay .downArrow { margin-top: 6px; margin-left: 3px; display: inline-block; width: 18px; height: 10px; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-position: 0px -96px; }');
				// this.alienIMG = '<span class="downArrow"></span>';
			}
			// RESUtils.addCSS('#RESAccountSwitcherIconOverlay { display: none; position: absolute; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			this.userLink = document.querySelector('#header-bottom-right > span.user > a');
			if (this.userLink) {
				this.userLink.style.marginRight = '2px';
				this.loggedInUser = RESUtils.loggedInUser();
				// var downArrowIMG = 'data:image/gif;base64,R0lGODlhBwAEALMAAAcHBwgICAoKChERETs7Ozo6OkJCQg0NDRoaGhAQEAwMDDIyMv///wAAAAAAAAAAACH5BAEAAAwALAAAAAAHAAQAAAQQ0BSykADsDAUwY4kQfOT4RQA7';
				if (this.options.dropDownStyle.value == 'alien') {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"></span>');
				} else {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"><span class="downArrow"></span></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"><span class="downArrow"></span></span>');
				}
				$(this.downArrowOverlay).click(function() {
					modules['accountSwitcher'].toggleAccountMenu(false);
					modules['accountSwitcher'].manageAccounts();
				})
				$(document.body).append(this.downArrowOverlay);
				$(this.downArrow).click(function() {
					modules['accountSwitcher'].toggleAccountMenu(true);
				});
				$(this.downArrowOverlay).mouseleave(function() {
					modules['accountSwitcher'].dropdownTimer = setTimeout(function() {
						modules['accountSwitcher'].toggleAccountMenu(false);
					}, 1000);
				});


				// insertAfter(this.userLink, downArrow);
				$(this.userLink).after(this.downArrow);

				this.accountMenu = $('<ul id="RESAccountSwitcherDropdown" class="RESDropdownList"></ul>')
				$(this.accountMenu).mouseenter(function() {
					clearTimeout(modules['accountSwitcher'].dropdownTimer);
				});
				$(this.accountMenu).mouseleave(function() {
					modules['accountSwitcher'].toggleAccountMenu(false);
				});
				// GM_addStyle(css);
				var accounts = this.options.accounts.value;
				if (accounts != null) {
					var accountCount = 0;
					for (var i=0, len=accounts.length; i<len; i++) {
						var thisPair = accounts[i];
						if (thisPair[0] != this.loggedInUser || this.options.showCurrentUserName.value){
							accountCount++;
							var thisLI = document.createElement('LI');
							addClass(thisLI, 'accountName');
							if (thisPair[0] == this.loggedInUser) {
								addClass(thisLI, 'active');
							}
							thisLI.setAttribute('data-username',thisPair[0]);
							$(thisLI).text(thisPair[0]);
							thisLI.style.cursor = 'pointer';
							thisLI.addEventListener('click', function(e) {
								e.preventDefault();
								// modules['accountSwitcher'].toggleAccountMenu(false);
								modules['accountSwitcher'].switchTo(e.target.getAttribute('data-username'));
							}, true);
							$(this.accountMenu).append(thisLI);
						}
					}
					var thisLI = document.createElement('LI');
					addClass(thisLI, 'accountName');
					thisLI.textContent = '+ add account';
					thisLI.style.cursor = 'pointer';
					thisLI.addEventListener('click', function(e) {
						e.preventDefault();
						modules['accountSwitcher'].toggleAccountMenu(false);
						modules['accountSwitcher'].manageAccounts();
					}, true);
					$(this.accountMenu).append(thisLI);
				}
				$(document.body).append(this.accountMenu);
			}
		}
	},
	toggleAccountMenu: function(open) {
		if ((open) || (! $(modules['accountSwitcher'].accountMenu).is(':visible'))) {
			var thisHeight = 18;
			if ($('#RESAccountSwitcherDropdown').css('position') != 'fixed') {
				var thisX = $(modules['accountSwitcher'].userLink).offset().left;
				var thisY = $(modules['accountSwitcher'].userLink).offset().top;
			} else {
				var thisX = $('#header-bottom-right').position().left + $(modules['accountSwitcher'].userLink).position().left;
				var thisY = $(modules['accountSwitcher'].userLink).position().top;
				if (modules['betteReddit'].options.pinHeader.value == 'subanduser') {
					thisHeight += $('#sr-header-area').height();
				} else if (modules['betteReddit'].options.pinHeader.value == 'header') {
					thisHeight += $('#sr-header-area').height();
				}
			}
			$(modules['accountSwitcher'].accountMenu).css({
				top: (thisY + thisHeight) + 'px',
				left: (thisX) + 'px'
			});
			$(modules['accountSwitcher'].accountMenu).show();
			var thisX = $(modules['accountSwitcher'].downArrow).offset().left;
			var thisY = $(modules['accountSwitcher'].downArrow).offset().top;
			$(modules['accountSwitcher'].downArrowOverlay).css({
				top: (thisY-4) + 'px',
				left: (thisX-3) + 'px'
			});

			$(modules['accountSwitcher'].downArrowOverlay).show();
		} else {
			$(modules['accountSwitcher'].accountMenu).hide();
			$(modules['accountSwitcher'].downArrowOverlay).hide();
		}
	},
	closeAccountMenu: function() {
		// this function basically just exists for other modules to call.
		$(this.accountMenu).hide();
	},
	switchTo: function(username) {
		var accounts = this.options.accounts.value;
		var password = '';
		var rem = '';
		if (this.options.keepLoggedIn.value) {
			rem = '&rem=on';
		}
		for (var i=0, len=accounts.length; i<len; i++) {
			var thisPair = accounts[i];
			if (thisPair[0] == username) {
				password = thisPair[1];
			}
		}
		// console.log('request with user: ' +username+ ' -- passwd: ' + password);
		var loginUrl = 'https://ssl.reddit.com/api/login';
		// unfortunately, due to 3rd party cookie issues, none of the below browsers work with ssl.
		if (typeof(opera) != 'undefined') {
			loginUrl = 'http://'+location.hostname+'/api/login';
		} else if ((typeof(chrome) != 'undefined') && (chrome.extension.inIncognitoContext)) {
			loginUrl = 'http://'+location.hostname+'/api/login';
		} else if (typeof(safari) != 'undefined') {
			loginUrl = 'http://'+location.hostname+'/api/login';
		}
		GM_xmlhttpRequest({
			method:	"POST",
			url:	loginUrl,
			data: 'user='+RESUtils.urlencode(username)+'&passwd='+RESUtils.urlencode(password)+rem,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload:	function(response) {
				// console.log(response.responseText);
				// var data = JSON.parse(response.responseText);
				var badData = false;
				try {
					var data = JSON.parse(response.responseText);
				} catch(error) {
					var data = {};
					badData = true;
				}
				// var errorCheck = data.jquery[10][3][0];
				var error = /WRONG_PASSWORD/;
				var rateLimit = /RATELIMIT/;
				if (badData) {
					RESUtils.notification('There was an error switching accounts. Reddit may be under heavy load. Please try again in a few moments.');
				} else if (error.test(response.responseText)) {
					alert('Incorrect login and/or password. Please check your configuration.');
				} else if (rateLimit.test(response.responseText)) {
					alert('RATE LIMIT: The Reddit API is seeing too many hits from you too fast, perhaps you keep submitting a wrong password, etc?  Try again in a few minutes.');
				} else {
					location.reload();
				}
			}
		});
	},
	manageAccounts: function() {
		RESConsole.open();
		RESConsole.menuClick(document.getElementById('Menu-Accounts'));
		RESConsole.drawConfigOptions('accountSwitcher');
	}
};

modules['filteReddit'] = {
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
		NSFWQuickToggle: {
			type: 'boolean',
			value: true,
			description: 'Add a quick NSFW on/off toggle to the gear menu'
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
					source: '/api/search_reddit_names.json?app=res', 
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
			description: 'Type in a subreddit you want to ignore (only applies to /r/all or /domain/* urls)'
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
					source: '/api/search_reddit_names.json?app=res', 
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
		},
		flair: {
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
					source: '/api/search_reddit_names.json?app=res', 
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
			description: 'Type in keywords you want to ignore if they are contained in link flair'
		}
	},
	description: 'Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all or /domain/*).',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/?(?:\??[\w]+=[\w]+&?)*/i,
		/https?:\/\/([a-z]+).reddit.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
	),
	exclude: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/saved\/?/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled()) {
			RESUtils.addCSS('#nsfwSwitchToggle { float: right; margin-right: 10px; margin-top: 10px; line-height: 10px; }');
			RESUtils.addCSS('.RESFilterToggle { margin-right: 5px; color: white; background-image: url(/static/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('.RESFilterToggle.remove { background-image: url(/static/bg-button-remove.png) }');
			RESUtils.addCSS('.RESFiltered { display: none !important; }');
			if (this.options.NSFWfilter.value) {
				RESUtils.addCSS('.over18 { display: none !important; }');
			}
		}
	},
	go: function() {
		// shh I'm cheating. This runs the toggle on every single page, bypassing isMatchURL.
		if ((this.isEnabled()) && (this.options.NSFWQuickToggle.value)) {
			var thisFrag = document.createDocumentFragment();
			this.nsfwSwitch = document.createElement('li');
			this.nsfwSwitch.setAttribute('title',"Toggle NSFW Filter");
			this.nsfwSwitch.addEventListener('click',function(e) {
				e.preventDefault();
				if (modules['filteReddit'].options.NSFWfilter.value == true) {
					modules['filteReddit'].filterNSFW(false);
					RESUtils.setOption('filteReddit','NSFWfilter',false);
					removeClass(modules['filteReddit'].nsfwSwitchToggle, 'enabled');
				} else {
					modules['filteReddit'].filterNSFW(true);
					RESUtils.setOption('filteReddit','NSFWfilter',true);
					addClass(modules['filteReddit'].nsfwSwitchToggle, 'enabled');
				}
			}, true);
			this.nsfwSwitch.textContent = 'nsfw filter';
			this.nsfwSwitchToggle = createElementWithID('div','nsfwSwitchToggle','toggleButton');
			$(this.nsfwSwitchToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
			this.nsfwSwitch.appendChild(this.nsfwSwitchToggle);
			(this.options.NSFWfilter.value) ? addClass(this.nsfwSwitchToggle, 'enabled') : removeClass(this.nsfwSwitchToggle, 'enabled');
			thisFrag.appendChild(this.nsfwSwitch);
			$('#RESDropdownOptions').append(this.nsfwSwitch);
		}

		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			this.scanEntries();
			RESUtils.watchForElement('siteTable', modules['filteReddit'].scanEntries);
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
		var filterSubs = (RESUtils.currentSubreddit('all')) || (RESUtils.currentDomain());
		for (var i=0, len=entries.length; i<len;i++) {
			var postTitle = entries[i].querySelector('.entry a.title').innerHTML;
			var postDomain = entries[i].querySelector('.entry span.domain > a').innerHTML.toLowerCase();
			var thisSubreddit = entries[i].querySelector('.entry a.subreddit');
			var postFlair = entries[i].querySelector('.entry span.linkflairlabel');
			if (thisSubreddit != null) {
				var postSubreddit = thisSubreddit.innerHTML;
			} else {
				var postSubreddit = false;
			}
			var filtered = false;
			var currSub = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : null;
			filtered = modules['filteReddit'].filterTitle(postTitle, postSubreddit || RESUtils.currentSubreddit());
			if (!filtered) filtered = modules['filteReddit'].filterDomain(postDomain, postSubreddit || currSub);
			if ((!filtered) && (filterSubs) && (postSubreddit)) {
				filtered = modules['filteReddit'].filterSubreddit(postSubreddit);
			}
			if ((!filtered) && (postFlair)) {
				filtered = modules['filteReddit'].filterFlair(postFlair.textContent, postSubreddit || RESUtils.currentSubreddit());
			}
			if (filtered) {
				addClass(entries[i],'RESFiltered')
			}
		}
	},
	filterNSFW: function(filterOn) {
		if (filterOn == true) {
			$('.over18').hide();
			if ($('#nsfwstyle').length == 0) {
				$('body').append('<style id="nsfwstyle" />')
			}
			$('#nsfwstyle').html('.over18 { display: none; }');
		} else {
			$('.over18').show();
			if ($('#nsfwstyle').length == 0) {
				$('body').append('<style id="nsfwstyle" />')
			}
			$('#nsfwstyle').html('.over18 { display: block; }');
		}
	},
	filterTitle: function(title, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		return this.arrayContainsSubstring(this.options.keywords.value, title.toLowerCase(), reddit);
	},
	filterDomain: function(domain, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		var domain = (domain) ? domain.toLowerCase() : null;
		return this.arrayContainsSubstring(this.options.domains.value, domain, reddit);
	},
	filterSubreddit: function(subreddit) {
		return this.arrayContainsSubstring(this.options.subreddits.value, subreddit.toLowerCase(), null, true);
	},
	filterFlair: function(flair, reddit) {
		var reddit = (reddit) ? reddit.toLowerCase() : null;
		return this.arrayContainsSubstring(this.options.flair.value, flair.toLowerCase(), reddit);
	},
	unescapeHTML: function(theString) {
		var temp = document.createElement("div");
		$(temp).html(theString);
		var result = temp.childNodes[0].nodeValue;
		temp.removeChild(temp.firstChild);
		delete temp;
		return result;	
	},
	arrayContainsSubstring: function(obj, stringToSearch, reddit, fullmatch) {
		stringToSearch = this.unescapeHTML(stringToSearch);
		var i = obj.length;
		while (i--) {
			if ((typeof(obj[i]) != 'object') || (obj[i].length<3)) {
				if (obj[i].length == 1) obj[i] = obj[i][0];
				obj[i] = [obj[i], 'everywhere',''];
			}
			var searchString = obj[i][0];
			var applyTo = obj[i][1];
			var applyList = obj[i][2].toLowerCase().split(',');
			var skipCheck = false;
			switch (applyTo) {
				case 'exclude':
					if (applyList.indexOf(reddit) != -1) {
						skipCheck = true;
					}
					break;
				case 'include':
					if (applyList.indexOf(reddit) == -1) {
						skipCheck = true;
					}
					break;
			}
			// if fullmatch is defined, don't do a substring match... this is used for subreddit matching on /r/all for example
			if ((!skipCheck) && (fullmatch) && (obj[i] != null) && (stringToSearch.toLowerCase() == searchString.toLowerCase())) return true;
			if ((!skipCheck) && (!fullmatch) && (obj[i] != null) && (stringToSearch.indexOf(searchString.toString().toLowerCase()) != -1)) {
				return true;
			}
		}
		return false;
	},
	toggleFilter: function(e) {
		var thisSubreddit = e.target.getAttribute('subreddit').toLowerCase();
		var filteredReddits = modules['filteReddit'].options.subreddits.value || [];
		var exists=false;
		for (var i=0, len=filteredReddits.length; i<len; i++) {
			if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() == thisSubreddit)) {
				exists=true;
				filteredReddits.splice(i,1);
				e.target.setAttribute('title','Filter this subreddit from /r/all and /domain/*');
				e.target.textContent = '+filter';
				removeClass(e.target,'remove');
				break;
			}
		}
		if (!exists) {
			var thisObj = [thisSubreddit, 'everywhere',''];
			filteredReddits.push(thisObj);
			e.target.setAttribute('title','Stop filtering this subreddit from /r/all and /domain/*');
			e.target.textContent = '-filter';
			addClass(e.target,'remove');
		}
		modules['filteReddit'].options.subreddits.value = filteredReddits;
		// save change to options...
		RESStorage.setItem('RESoptions.filteReddit', JSON.stringify(modules['filteReddit'].options));
	}
};

modules['newCommentCount'] = {
	moduleID: 'newCommentCount',
	moduleName: 'New Comment Count',
	category: 'Comments',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		cleanComments: {
			type: 'text',
			value: 7,
			description: 'Clean out cached comment counts of pages you haven\'t visited in [x] days - enter a number here only!'
		},
		subscriptionLength: {
			type: 'text',
			value: 2,
			description: 'Automatically remove thread subscriptions in [x] days - enter a number here only!'
		}
	},
	description: 'Shows how many new comments there are since your last visit.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/.*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.newComments { display: inline; color: orangered; }');
			RESUtils.addCSS('.RESSubscriptionButton { display: inline-block; margin-left: 15px; padding: 1px 0px 1px 0px; text-align: center; width: 78px; font-weight: bold; cursor: pointer; color: #336699; border: 1px solid #b6b6b6; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('td .RESSubscriptionButton { margin-left: 0; margin-right: 15px; } ');
			RESUtils.addCSS('.RESSubscriptionButton.unsubscribe { color: orangered; }');
			RESUtils.addCSS('.RESSubscriptionButton:hover { background-color: #f0f3fc; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// go!
			var counts = RESStorage.getItem('RESmodules.newCommentCount.counts');
			if (counts == null) counts = '{}';
			this.commentCounts = safeJSON.parse(counts, 'RESmodules.newCommentCount.counts');
			if (RESUtils.pageType() == 'comments') {
				this.updateCommentCount();
				// TODO: "my" new comment detector? let's see if the other catches it.

				RESUtils.watchForElement('newComments', modules['newCommentCount'].updateCommentCountFromMyComment);
				/*
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
						modules['newCommentCount'].updateCommentCount(true);
					}
				}, true);
				*/
				this.addSubscribeLink();
			} else if (RESUtils.currentSubreddit('dashboard')) {
				// If we're on the dashboard, add a tab to it...
				// add tab to dashboard
				modules['dashboard'].addTab('newCommentsContents','My Subscriptions');
				// populate the contents of the tab
				var showDiv = $('<div class="show">Show:</div>')
				var subscriptionFilter = $('<select id="subscriptionFilter"><option>subscribed threads</option><option>all threads</option></select>')
				$(showDiv).append(subscriptionFilter);
				$('#newCommentsContents').append(showDiv);
				$('#subscriptionFilter').change(function(){ 
					modules['newCommentCount'].drawSubscriptionsTable();
				});
				var thisTable = $('<table id="newCommentsTable" />');
				$(thisTable).append('<thead><tr><th sort="" class="active">Thread title</th><th sort="subreddit">Subreddit</th><th sort="updateTime">Last Visited</th><th sort="subscriptionDate">Subscription Expires</th><th class="actions">Actions</th></tr></thead><tbody></tbody>');
				$('#newCommentsContents').append(thisTable);
				$('#newCommentsTable thead th').click(function(e) {
					e.preventDefault();
					if ($(this).hasClass('actions')) {
						return false;
					}
					if ($(this).hasClass('active')) {
						$(this).toggleClass('descending');
					}
					$(this).addClass('active');
					$(this).siblings().removeClass('active').find('SPAN').remove();
					$(this).find('.sortAsc, .sortDesc').remove();
					($(e.target).hasClass('descending')) ? $(this).append('<span class="sortDesc" />') : $(this).append('<span class="sortAsc" />');
					modules['newCommentCount'].drawSubscriptionsTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
				});
				this.drawSubscriptionsTable();
				RESUtils.watchForElement('siteTable', modules['newCommentCount'].processCommentCounts);
				/*
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
						modules['newCommentCount'].processCommentCounts(event.target);
					}
				}, true);
				*/
			} else {
				this.processCommentCounts();
				RESUtils.watchForElement('siteTable', modules['newCommentCount'].processCommentCounts);
				/*
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
						modules['newCommentCount'].processCommentCounts(event.target);
					}
				}, true);
				*/
			}
			this.checkSubscriptions();
		}
	},
	drawSubscriptionsTable: function(sortMethod, descending) {
		var filterType = $('#subscriptionFilter').val();
		this.currentSortMethod = sortMethod || this.currentSortMethod;
		this.descending = (descending == null) ? this.descending : descending == true;
		var thisCounts = [];
		for (var i in this.commentCounts) {
			this.commentCounts[i].id = i;
			// grab the subreddit out of the URL and store it in match[i]
			var match = this.commentCounts[i].url.match(RESUtils.matchRE);
			if (match) {
				this.commentCounts[i].subreddit = match[1].toLowerCase();
				thisCounts.push(this.commentCounts[i]);
			}
		}
		$('#newCommentsTable tbody').html('');
		switch (this.currentSortMethod) {
			case 'subscriptionDate':
				thisCounts.sort(function(a,b) { 
					return (a.subscriptionDate > b.subscriptionDate) ? 1 : (b.subscriptionDate > a.subscriptionDate) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			case 'updateTime':
				thisCounts.sort(function(a,b) { 
					return (a.updateTime > b.updateTime) ? 1 : (b.updateTime > a.updateTime) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			case 'subreddit':
				thisCounts.sort(function(a,b) { 
					return (a.subreddit > b.subreddit) ? 1 : (b.subreddit > a.subreddit) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			default:
				thisCounts.sort(function(a,b) { 
					return (a.title > b.title) ? 1 : (b.title > a.title) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
			break;
		}
		var rows = 0;
		for (var i in thisCounts) {
			if ((filterType == 'all threads') || ((filterType == 'subscribed threads') && (typeof(thisCounts[i].subscriptionDate) != 'undefined'))) {
				var thisTitle = thisCounts[i].title;
				var thisURL = thisCounts[i].url;
				var thisUpdateTime = new Date(thisCounts[i].updateTime);
				// expire time is this.options.subscriptionLength.value days, so: 1000ms * 60s * 60m * 24hr = 86400000
				// then multiply by this.options.subscriptionLength.value
				var thisSubscriptionExpirationDate = (typeof(thisCounts[i].subscriptionDate) != 'undefined') ? new Date(thisCounts[i].subscriptionDate + (86400000 * this.options.subscriptionLength.value)) : 0;
				if (thisSubscriptionExpirationDate > 0) {
					var thisExpiresContent = RESUtils.niceDateTime(thisSubscriptionExpirationDate);
					var thisRenewButton = '<span class="RESSubscriptionButton renew" title="renew subscription to this thread" data-threadid="'+thisCounts[i].id+'">renew</span>';
					var thisUnsubButton = '<span class="RESSubscriptionButton unsubscribe" title="unsubscribe from this thread" data-threadid="'+thisCounts[i].id+'">unsubscribe</span>';
					var thisActionContent = thisRenewButton+thisUnsubButton;

				} else {
					var thisExpiresContent = 'n/a';
					var thisActionContent = '<span class="RESSubscriptionButton subscribe" title="subscribe to this thread" data-threadid="'+thisCounts[i].id+'">subscribe</span>';
				}
				var thisSubreddit = '<a href="/r/'+thisCounts[i].subreddit+'">/r/'+thisCounts[i].subreddit+'</a>';
				var thisROW = $('<tr><td><a href="'+thisURL+'">'+thisTitle+'</a></td><td>'+thisSubreddit+'</td><td>'+RESUtils.niceDateTime(thisUpdateTime)+'</td><td>'+thisExpiresContent+'</td><td>'+thisActionContent+'</td></tr>');
				$(thisROW).find('.renew').click(modules['newCommentCount'].renewSubscriptionButton);
				$(thisROW).find('.unsubscribe').click(modules['newCommentCount'].unsubscribeButton);
				$(thisROW).find('.subscribe').click(modules['newCommentCount'].subscribeButton);
				$('#newCommentsTable tbody').append(thisROW);
				rows++;
			}
		}
		if (rows == 0) {
			if (filterType == 'subscribed threads') {
				$('#newCommentsTable tbody').append('<td colspan="5">You are currently not subscribed to any threads. To subscribe to a thread, click the "subscribe" button found near the top of the comments page.</td>');
			} else {
				$('#newCommentsTable tbody').append('<td colspan="5">No threads found</td>');
			}
		}
	},
	renewSubscriptionButton: function(e) {
		var thisURL = $(e.target).attr('data-threadid');
		modules['newCommentCount'].renewSubscription(thisURL);
		RESUtils.notification('Your subscription has been renewed - it will expire in '+modules['newCommentCount'].options.subscriptionLength.value+' days.')
	},
	renewSubscription: function(threadid) {
		var now = new Date();
		modules['newCommentCount'].commentCounts[threadid].subscriptionDate = now.getTime();
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	unsubscribeButton: function(e) {
		var confirmunsub = window.confirm('Are you sure you want to unsubscribe?');
		if (confirmunsub) {
			var thisURL = $(e.target).attr('data-threadid');
			modules['newCommentCount'].unsubscribe(thisURL);
		}
	},
	unsubscribe: function(threadid) {
		delete modules['newCommentCount'].commentCounts[threadid].subscriptionDate;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	subscribeButton: function(e) {
		var thisURL = $(e.target).attr('data-threadid');
		modules['newCommentCount'].subscribe(thisURL);
	},
	subscribe: function(threadid) {
		var now = new Date();
		modules['newCommentCount'].commentCounts[threadid].subscriptionDate = now.getTime();
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	processCommentCounts: function(ele) {
		var ele = ele || document.body;
		var lastClean = RESStorage.getItem('RESmodules.newCommentCount.lastClean');
		var now = new Date();
		if (lastClean == null) {
			lastClean = now.getTime();
			RESStorage.setItem('RESmodules.newCommentCount.lastClean', now.getTime());
		}
		// Clean cache every six hours
		if ((now.getTime() - lastClean) > 21600000) {
			modules['newCommentCount'].cleanCache();
		}
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var commentsLinks = ele.querySelectorAll('.sitetable.linklisting div.thing.link a.comments');
		for (var i=0, len=commentsLinks.length; i<len;i++) {
			var href = commentsLinks[i].getAttribute('href');
			var thisCount = commentsLinks[i].innerHTML;
			var split = thisCount.split(' ');
			thisCount = split[0];
			var matches = IDre.exec(href);
			if (matches) {
				var thisID = matches[1];
				if ((typeof(modules['newCommentCount'].commentCounts[thisID]) != 'undefined') && (modules['newCommentCount'].commentCounts[thisID] != null)) {
					var diff = thisCount - modules['newCommentCount'].commentCounts[thisID].count;
					if (diff > 0) {
						var newString = $('<span class="newComments">&nbsp;('+diff+' new)</span>');
						$(commentsLinks[i]).append(newString);
					}
				}
			}
		}
	},
	updateCommentCountFromMyComment: function() {
		modules['newCommentCount'].updateCommentCount(true);
	},
	updateCommentCount: function(mycomment) {
		var thisModule = modules['newCommentCount'];
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var matches = IDre.exec(location.href);
		if (matches) {
			if (!thisModule.currentCommentCount) {
				thisModule.currentCommentID = matches[1];
				var thisCount = document.querySelector('#siteTable a.comments');
				if (thisCount) {
					var split = thisCount.innerHTML.split(' ');
					thisModule.currentCommentCount = split[0];
					if ((typeof(thisModule.commentCounts[thisModule.currentCommentID]) != 'undefined') && (thisModule.commentCounts[thisModule.currentCommentID] != null)) {
						var prevCommentCount = thisModule.commentCounts[thisModule.currentCommentID].count;
						var diff = thisModule.currentCommentCount - prevCommentCount;
						var newString = $('<span class="newComments">&nbsp;('+diff+' new)</span>');
						if (diff>0) $(thisCount).append(newString);
					}
					if (isNaN(thisModule.currentCommentCount)) thisModule.currentCommentCount = 0;
					if (mycomment) thisModule.currentCommentCount++;
				}
			} else {
				thisModule.currentCommentCount++;
			}
		}
		var now = new Date();
		if (typeof(thisModule.commentCounts) == 'undefined') {
			thisModule.commentCounts = {};
		}
		if (typeof(thisModule.commentCounts[thisModule.currentCommentID]) == 'undefined') {
			thisModule.commentCounts[thisModule.currentCommentID] = {};
		}
		thisModule.commentCounts[thisModule.currentCommentID].count = thisModule.currentCommentCount;
		thisModule.commentCounts[thisModule.currentCommentID].url = location.href.replace(location.hash, '');
		thisModule.commentCounts[thisModule.currentCommentID].title = document.title;
		thisModule.commentCounts[thisModule.currentCommentID].updateTime = now.getTime();
		// if (this.currentCommentCount) {
		// dumb, but because of Greasemonkey security restrictions we need a window.setTimeout here...
		window.setTimeout( function() {
			RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		}, 100);
		// }
	},
	cleanCache: function() {
		var now = new Date();
		for (var i in this.commentCounts) {
			if ((this.commentCounts[i] != null) && ((now.getTime() - this.commentCounts[i].updateTime) > (86400000 * this.options.cleanComments.value))) {
				// this.commentCounts[i] = null;
				delete this.commentCounts[i];
			} else if (this.commentCounts[i] == null) {
				delete this.commentCounts[i];
			}
		}
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(this.commentCounts));
		RESStorage.setItem('RESmodules.newCommentCount.lastClean', now.getTime());
	},
	addSubscribeLink: function() {
		var commentCount = document.body.querySelector('.commentarea .panestack-title');
		if (commentCount) {
			this.commentSubToggle = createElementWithID('span','REScommentSubToggle','RESSubscriptionButton');
			this.commentSubToggle.addEventListener('click', modules['newCommentCount'].toggleSubscription, false);
			commentCount.appendChild(this.commentSubToggle);
			if (typeof(this.commentCounts[this.currentCommentID].subscriptionDate) != 'undefined') {
				this.commentSubToggle.textContent = 'unsubscribe';
				this.commentSubToggle.setAttribute('title','unsubscribe from thread');
				addClass(this.commentSubToggle,'unsubscribe');
			} else {
				this.commentSubToggle.textContent = 'subscribe';
				this.commentSubToggle.setAttribute('title','subscribe to this thread to be notified when new comments are posted');
				removeClass(this.commentSubToggle,'unsubscribe');
			}
		}
	},
	toggleSubscription: function() {
		var commentID = modules['newCommentCount'].currentCommentID;
		if (typeof(modules['newCommentCount'].commentCounts[commentID].subscriptionDate) != 'undefined') {
			modules['newCommentCount'].unsubscribeFromThread(commentID);
		} else {
			modules['newCommentCount'].subscribeToThread(commentID);
		}
	},
	getLatestCommentCounts: function() {
		var counts = RESStorage.getItem('RESmodules.newCommentCount.counts');
		if (counts == null) {
			counts = '{}';
		}
		modules['newCommentCount'].commentCounts = safeJSON.parse(counts, 'RESmodules.newCommentCount.counts');
	},
	subscribeToThread: function(commentID) {
		modules['newCommentCount'].getLatestCommentCounts();
		modules['newCommentCount'].commentSubToggle.textContent = 'unsubscribe';
		modules['newCommentCount'].commentSubToggle.setAttribute('title','unsubscribe from thread');
		addClass(modules['newCommentCount'].commentSubToggle,'unsubscribe');
		commentID = commentID || modules['newCommentCount'].currentCommentID;
		var now = new Date();
		modules['newCommentCount'].commentCounts[commentID].subscriptionDate = now.getTime();
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		RESUtils.notification({ 
			header: 'Subscription Notification', 
			message: 'You are now subscribed to this thread for '+modules['newCommentCount'].options.subscriptionLength.value+' days. You will be notified if new comments are posted since your last visit.' 
		}, 3000);
	},
	unsubscribeFromThread: function(commentID) {
		modules['newCommentCount'].getLatestCommentCounts();
		modules['newCommentCount'].commentSubToggle.textContent = 'subscribe';
		modules['newCommentCount'].commentSubToggle.setAttribute('title','subscribe to this thread and be notified when new comments are posted');
		removeClass(modules['newCommentCount'].commentSubToggle,'unsubscribe');
		commentID = commentID || modules['newCommentCount'].currentCommentID;
		var now = new Date();
		delete modules['newCommentCount'].commentCounts[commentID].subscriptionDate;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		RESUtils.notification({ 
			header: 'Subscription Notification', 
			message: 'You are now unsubscribed from this thread.'
		}, 3000);
	},
	checkSubscriptions: function() {
		if (this.commentCounts) {
			var threadsToCheck = [];
			for (var i in this.commentCounts) {
				var thisSubscription = this.commentCounts[i];
				if ((thisSubscription) && (typeof(thisSubscription.subscriptionDate) != 'undefined')) {
					var lastCheck = parseInt(thisSubscription.lastCheck) || 0;
					var subscriptionDate = parseInt(thisSubscription.subscriptionDate);
					// If it's been subscriptionLength days since we've subscribed, we're going to delete this subscription...
					var now = new Date();
					if ((now.getTime() - subscriptionDate) > (this.options.subscriptionLength.value * 86400000)) {
						delete this.commentCounts[i].subscriptionDate;
					}
					// if we haven't checked this subscription in 5 minutes, try it again...
					if ((now.getTime() - lastCheck) > 300000) {
						thisSubscription.lastCheck = now.getTime();
						this.commentCounts[i] = thisSubscription;
						// this.checkThread(i);
						threadsToCheck.push('t3_'+i);
					}
					RESStorage.setItem('RESmodules.newCommentCount.count', JSON.stringify(this.commentCounts));
				}
			}
			if (threadsToCheck.length > 0) {
				this.checkThreads(threadsToCheck);
			}
		}
	},
	checkThreads: function(commentIDs) {
		GM_xmlhttpRequest({
			method:	"GET",
			url: location.protocol + '//' + location.hostname + '/by_id/' + commentIDs.join(',') + '.json?app=res',
			onload:	function(response) {
				var now = new Date();
				var commentInfo = JSON.parse(response.responseText);
				if (typeof(commentInfo.data) != 'undefined') {
					for (var i=0, len=commentInfo.data.children.length; i<len; i++) {
						var commentID = commentInfo.data.children[i].data.id;
						var subObj = modules['newCommentCount'].commentCounts[commentID];
						if (subObj.count < commentInfo.data.children[i].data.num_comments) {
							modules['newCommentCount'].commentCounts[commentID].count = commentInfo.data.children[i].data.num_comments;
							RESUtils.notification({ 
								header: 'Subscription Notification', 
								message: '<p>New comments posted to thread:</p> <a href="'+subObj.url+'">' + subObj.title + '</a> <p><a class="RESNotificationButtonBlue" href="'+subObj.url+'">view the submission</a></p><div class="clear"></div>'
							}, 10000);
						}
					}
					RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
				}
			}
		});
	}
};

modules['spamButton'] = {
	moduleID: 'spamButton',
	moduleName: 'Spam Button',
	category: 'Filters',
	options: {
	},
	description: 'Adds a Spam button to posts for easy reporting.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// check if the spam button was on by default from an old install of RES.  Per Reddit Admin request, this is being
			// disabled by default due to excess misuse, but people who want to purposefully re-enable it may do so.
			var reset = RESStorage.getItem('RESmodules.spamButton.reset');
			if (!reset) {
				RESStorage.setItem('RESmodules.spamButton.reset','true');
				RESConsole.enableModule('spamButton', false);
			}
		
			// this is where your code goes...
			// credit to tico24 for the idea, here: http://userscripts.org/scripts/review/84454
			// code adapted for efficiency...
			if (RESUtils.loggedInUser() != RESUtils.currentUserProfile()) {
				RESUtils.watchForElement('siteTable', modules['spamButton'].addSpamButtons);
				this.addSpamButtons();
			}
		}
	},
	addSpamButtons: function(ele) {
		if (ele == null) ele = document;
		if ((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments') || (RESUtils.pageType() == 'profile')) {
			var allLists = ele.querySelectorAll('#siteTable ul.flat-list.buttons');
			for(var i=0, len=allLists.length; i<len; i++)
			{
				var permaLink = allLists[i].childNodes[0].childNodes[0].href;

				var spam = document.createElement('li');
				// insert spam button second to last in the list... this is a bit hacky and assumes singleClick is enabled...
				// it should probably be made smarter later, but there are so many variations of configs, etc, that it's a bit tricky.
				allLists[i].lastChild.parentNode.insertBefore(spam, allLists[i].lastChild);
				
				// it's faster to figure out the author only if someone actually clicks the link, so we're modifying the code to listen for clicks and not do all that queryselector stuff.
				var a = document.createElement('a');
				a.setAttribute('class', 'option');
				a.setAttribute('title', 'Report this user as a spammer');
				a.addEventListener('click', modules['spamButton'].reportPost, false);
				a.setAttribute('href', 'javascript:void(0)');
				a.textContent= 'rts';
				a.title = "reportthespammers"
				spam.appendChild(a);
			}
		}
	},
	reportPost: function(e) {
		var a = e.target;
		var authorProfileContainer = a.parentNode.parentNode.parentNode;
		var authorProfileLink = authorProfileContainer.querySelector('.author');
		var href = authorProfileLink.href;
		var authorName = authorProfileLink.innerHTML;
		a.setAttribute('href', 'http://www.reddit.com/r/reportthespammers/submit?url=' + href + '&title=overview for '+authorName);
		a.setAttribute('target', '_blank');
	}
};

modules['commentNavigator'] = {
	moduleID: 'commentNavigator',
	moduleName: 'Comment Navigator',
	category: 'Comments',
	description: 'Provides a comment navigation tool to easily find comments by OP, mod, etc.',
	options: { 
		showByDefault: {
			type: 'boolean',
			value: false,
			description: 'Display Comment Navigator by default'
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#REScommentNavBox { position: fixed; z-index: 999; right: 10px; top: 46px; width: 265px; border: 1px solid gray; background-color: #ffffff; opacity: 0.3; padding: 3px; user-select: none; -webkit-user-select: none; -moz-user-select: none; -webkit-transition:opacity 0.5s ease-in; -moz-transition:opacity 0.5s ease-in; -o-transition:opacity 0.5s ease-in; -ms-transition:opacity 0.5s ease-in; -transition:opacity 0.5s ease-in; }');
			RESUtils.addCSS('#REScommentNavBox:hover { opacity: 1 }');
			RESUtils.addCSS('#REScommentNavToggle { float: left; display: inline; margin-left: 0px; width: 100%; }');
			RESUtils.addCSS('.commentarea .menuarea { margin-right: 0px; }');
			RESUtils.addCSS('.menuarea > .spacer { margin-right: 0px; }');
			RESUtils.addCSS('#commentNavButtons { margin: auto; }');
			RESUtils.addCSS('#commentNavUp { margin: auto; cursor: pointer; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 32px; height: 20px; background-position: 0px -224px; }');
			RESUtils.addCSS('#commentNavDown { margin: auto; cursor: pointer; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 32px; height: 20px; background-position: 0px -244px; }');
			RESUtils.addCSS('#commentNavUp.noNav { background-position: 0px -264px; }');
			RESUtils.addCSS('#commentNavDown.noNav { background-position: 0px -284px; }');
			RESUtils.addCSS('#commentNavButtons { display: none; margin-left: 12px; text-align: center; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.commentNavSortType { cursor: pointer; font-weight: bold; float: left; margin-left: 6px; }');
			RESUtils.addCSS('#commentNavPostCount { color: #1278d3; }');
			RESUtils.addCSS('.noNav #commentNavPostCount { color: #dddddd; }');
			RESUtils.addCSS('.commentNavSortTypeDisabled { color: #dddddd; }');
			RESUtils.addCSS('.commentNavSortType:hover { text-decoration: underline; }');
			RESUtils.addCSS('#REScommentNavToggle span { float: left; margin-left: 6px; }');
			RESUtils.addCSS('.menuarea > .spacer { float: left; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// draw the commentNav box
			this.commentNavBox = createElementWithID('div','REScommentNavBox');
			addClass(this.commentNavBox, 'RESDialogSmall');
			// var commentArea = document.body.querySelector('div.sitetable.nestedlisting');
			var commentArea = document.body.querySelector('.commentarea .menuarea');
			if (commentArea) {
				this.commentNavToggle = createElementWithID('div','REScommentNavToggle');
				$(this.commentNavToggle).html('<span>navigate by:</span>');
				var sortTypes = ['submitter', 'moderator', 'friend', 'me', 'admin', 'IAmA', 'images', 'popular', 'new'];
				for (var i=0, len=sortTypes.length; i<len; i++) {
					var thisCategory = sortTypes[i];
					// var thisEle = document.createElement('div');
					var thisEle = createElementWithID('div','navigateBy'+thisCategory);
					switch(thisCategory) {
						case 'submitter':
							thisEle.setAttribute('title','Navigate comments made by the post submitter');
							break;
						case 'moderator':
							thisEle.setAttribute('title','Navigate comments made by moderators');
							break;
						case 'friend':
							thisEle.setAttribute('title','Navigate comments made by users on your friends list');
							break;
						case 'me':
							thisEle.setAttribute('title','Navigate comments made by you');
							break;
						case 'admin':
							thisEle.setAttribute('title','Navigate comments made by reddit admins');
							break;
						case 'IAmA':
							thisEle.setAttribute('title','Navigate through questions that have been answered by the submitter (most useful in /r/IAmA)');
							break;
						case 'images':
							thisEle.setAttribute('title','Navigate through comments with images');
							break;
						case 'popular':
							thisEle.setAttribute('title','Navigate through comments in order of highest vote total');
							break;
						case 'new':
							thisEle.setAttribute('title','Navigate through new comments (Reddit Gold users only)');
							break;
						default:
							break;
					}
					thisEle.setAttribute('index',i+1);
					addClass(thisEle,'commentNavSortType');
					thisEle.textContent = thisCategory;
					if (thisCategory == 'new') {
						var isGold = document.body.querySelector('.gold-accent.comment-visits-box');
						if (isGold) {
							thisEle.setAttribute('style','color: #9A7D2E;');
						} else {
							addClass(thisEle,'commentNavSortTypeDisabled');
						}
					}
					if ((thisCategory != 'new') || (isGold)) {
						thisEle.addEventListener('click', function(e) {
							modules['commentNavigator'].showNavigator(e.target.getAttribute('index'));
						}, false);
					}
					this.commentNavToggle.appendChild(thisEle);
					if (i<len-1) {
						var thisDivider = document.createElement('span');
						thisDivider.textContent = '|';
						this.commentNavToggle.appendChild(thisDivider);
					}
				}

				// commentArea.insertBefore(this.commentNavToggle,commentArea.firstChild);
				commentArea.appendChild(this.commentNavToggle,commentArea.firstChild);
				if (!(this.options.showByDefault.value)) {
					this.commentNavBox.style.display = 'none';
				}
				var navBoxHTML = ' \
					\
					<h3>Navigate by: \
						<select id="commentNavBy"> \
							<option name=""></option> \
							<option name="submitter">submitter</option> \
							<option name="moderator">moderator</option> \
							<option name="friend">friend</option> \
							<option name="me">me</option> \
							<option name="admin">admin</option> \
							<option name="IAmA">IAmA</option> \
							<option name="images">images</option> \
							<option name="popular">popular</option> \
							<option name="new">new</option> \
						</select> \
					</h3>\
					<div id="commentNavCloseButton" class="RESCloseButton">&times;</div> \
					<div class="RESDialogContents"> \
						<div id="commentNavButtons"> \
							<div id="commentNavUp"></div> <div id="commentNavPostCount"></div> <div id="commentNavDown"></div> \
						</div> \
					</div> \
				';
				$(this.commentNavBox).html(navBoxHTML);
				this.posts = [];
				this.nav = [];
				this.navSelect = this.commentNavBox.querySelector('#commentNavBy');
				this.commentNavPostCount = this.commentNavBox.querySelector('#commentNavPostCount');
				this.commentNavButtons = this.commentNavBox.querySelector('#commentNavButtons');
				this.commentNavCloseButton = this.commentNavBox.querySelector('#commentNavCloseButton');
				this.commentNavCloseButton.addEventListener('click',function(e) {
					modules['commentNavigator'].commentNavBox.style.display = 'none';
				}, false);
				this.commentNavUp = this.commentNavBox.querySelector('#commentNavUp');
				this.commentNavUp.addEventListener('click',modules['commentNavigator'].moveUp, false);
				this.commentNavDown = this.commentNavBox.querySelector('#commentNavDown');
				this.commentNavDown.addEventListener('click',modules['commentNavigator'].moveDown, false);
				this.navSelect.addEventListener('change', modules['commentNavigator'].changeCategory, false);
				document.body.appendChild(this.commentNavBox);
			}
		}
	},
	changeCategory: function() {
		var index = modules['commentNavigator'].navSelect.selectedIndex;
		modules['commentNavigator'].currentCategory = modules['commentNavigator'].navSelect.options[index].value;
		if (modules['commentNavigator'].currentCategory != '') {
			modules['commentNavigator'].getPostsByCategory(modules['commentNavigator'].currentCategory);
			modules['commentNavigator'].commentNavButtons.style.display = 'block';
		} else {
			modules['commentNavigator'].commentNavButtons.style.display = 'none';
		}
	},
	showNavigator: function(categoryID) {
		modules['commentNavigator'].commentNavBox.style.display = 'block';
		this.navSelect.selectedIndex = categoryID;
		modules['commentNavigator'].changeCategory();
	},
	getPostsByCategory: function () {
		var category = modules['commentNavigator'].currentCategory;
		if ((typeof(category) != 'undefined') && (category != '')) {
			if (typeof(this.posts[category]) == 'undefined') {
				switch (category) {
					case 'submitter':
					case 'moderator':
					case 'friend':
					case 'admin':
						this.posts[category] = document.querySelectorAll('.noncollapsed a.author.'+category);
						this.resetNavigator(category);
						break;
					case 'me':
						RESUtils.loggedInUserInfo(function(userInfo) {
							var myID = 't2_'+userInfo.data.id;
							modules['commentNavigator'].posts[category] = document.querySelectorAll('.noncollapsed a.author.id-'+myID);
							modules['commentNavigator'].resetNavigator(category);
						});
						break;
					case 'IAmA':
						var submitterPosts = document.querySelectorAll('.noncollapsed a.author.submitter');
						this.posts[category] = [];
						for (var i=0, len=submitterPosts.length; i<len; i++) {
							// go seven parents up to get the proper parent post...
							var sevenUp = submitterPosts[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
							if (sevenUp.parentNode.nodeName == 'BODY') {
								this.posts[category].push(submitterPosts[i].parentNode.parentNode);
							} else {
								this.posts[category].push(sevenUp);
							}
						}
						this.resetNavigator(category);
						break;
					case 'images':
						var imagePosts = document.querySelectorAll('.toggleImage');
						this.posts[category] = imagePosts;
						this.resetNavigator(category);
						break;
					case 'popular':
						var allComments = document.querySelectorAll('.noncollapsed');
						var commentsObj = [];
						for (var i=0, len=allComments.length; i<len; i++) {
							var thisScore = allComments[i].querySelector('.unvoted');
							if (thisScore) {
								var scoreSplit = thisScore.innerHTML.split(' ');
								var score = scoreSplit[0];
							} else {
								var score = 0;
							}
							commentsObj[i] = {
								comment: allComments[i],
								score: score
							}
						}
						commentsObj.sort(function(a, b) {
							return parseInt(b.score) - parseInt(a.score);
						});
						this.posts[category] = [];
						for (var i=0, len=commentsObj.length; i<len; i++) {
							this.posts[category][i] = commentsObj[i].comment;
						}
						this.resetNavigator(category);
						break;
					case 'new':
						this.posts[category] = document.querySelectorAll('.new-comment');
						this.resetNavigator(category);
						break;
				}
			}
		}
	},
	resetNavigator: function(category) {
		this.nav[category] = 0;
		if (this.posts[category].length) {
			modules['commentNavigator'].scrollToNavElement();
			removeClass(modules['commentNavigator'].commentNavUp, 'noNav');
			removeClass(modules['commentNavigator'].commentNavDown, 'noNav');
			removeClass(modules['commentNavigator'].commentNavButtons, 'noNav');
		} else {
			modules['commentNavigator'].commentNavPostCount.textContent = 'none';
			addClass(modules['commentNavigator'].commentNavUp, 'noNav');
			addClass(modules['commentNavigator'].commentNavDown, 'noNav');
			addClass(modules['commentNavigator'].commentNavButtons, 'noNav');
		}
	},
	moveUp: function() {
		var category = modules['commentNavigator'].currentCategory;
		if (modules['commentNavigator'].posts[category].length) {
			if (modules['commentNavigator'].nav[category] > 0) {
				modules['commentNavigator'].nav[category]--;
			} else {
				modules['commentNavigator'].nav[category] = modules['commentNavigator'].posts[category].length - 1;
			}
			modules['commentNavigator'].scrollToNavElement();
		}
	},
	moveDown: function() {
		var category = modules['commentNavigator'].currentCategory;
		if (modules['commentNavigator'].posts[category].length) {
			if (modules['commentNavigator'].nav[category] < modules['commentNavigator'].posts[category].length - 1) {
				modules['commentNavigator'].nav[category]++;
			} else {
				modules['commentNavigator'].nav[category] = 0;
			}
			modules['commentNavigator'].scrollToNavElement();
		}
	},
	scrollToNavElement: function() {
		var category = modules['commentNavigator'].currentCategory;
		$(modules['commentNavigator'].commentNavPostCount).text(modules['commentNavigator'].nav[category]+1 + '/' + modules['commentNavigator'].posts[category].length);
		var thisXY=RESUtils.getXYpos(modules['commentNavigator'].posts[category][modules['commentNavigator'].nav[category]]);
		RESUtils.scrollTo(0,thisXY.y);
	}
}; 


/*
modules['redditProfiles'] = {
	moduleID: 'redditProfiles',
	moduleName: 'Reddit Profiles',
	category: 'Users',
	options: {
	},
	description: 'Pulls in profiles from redditgifts.com when viewing a user profile.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/http:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			RESUtils.addCSS('.redditGiftsProfileField { margin-top: 3px; margin-bottom: 6px; }');
			RESUtils.addCSS('.redditGiftsTrophy { margin-right: 4px; }');
			var thisCache = RESStorage.getItem('RESmodules.redditProfiles.cache');
			if (thisCache == null) {
				thisCache = '{}';
			}
			this.profileCache = safeJSON.parse(thisCache);
			if (this.profileCache == null) this.profileCache = {};
			var userRE = /\/user\/(\w+)/i;
			var match = userRE.exec(location.href);
			if (match) {
				var username = match[1];
				this.getProfile(username);
			}
		}
	},
	getProfile: function(username) {
		var lastCheck = 0;
		if ((typeof(this.profileCache[username]) != 'undefined') && (this.profileCache[username] != null)) {
			lastCheck = this.profileCache[username].lastCheck;
		}
		var now = new Date();
		if ((now.getTime() - lastCheck) > 900000) {
			var jsonURL = 'http://redditgifts.com/profiles/view-json/'+username+'/';
			GM_xmlhttpRequest({
				method:	"GET",
				url:	jsonURL,
				onload:	function(response) {
					try {
						// if it is JSON parseable, it's a profile.
						var profileData = JSON.parse(response.responseText);
					} catch(error) {
						// if it is NOT JSON parseable, it's a 404 - user doesn't have a profile.
						var profileData = {};
					}
					var now = new Date();
					profileData.lastCheck = now.getTime();
					// set the last check time...
					modules['redditProfiles'].profileCache[username] = profileData;
					RESStorage.setItem('RESmodules.redditProfiles.cache', JSON.stringify(modules['redditProfiles'].profileCache));
					modules['redditProfiles'].displayProfile(username, profileData);
				}
			});
		} else {
			this.displayProfile(username, this.profileCache[username]);
		}
	},
	displayProfile: function(username, profileObject) {
		if (typeof(profileObject) != 'undefined') {
			var firstSpacer = document.querySelector('div.side > div.spacer');
			var newSpacer = document.createElement('div');
			var profileHTML = '<div class="sidecontentbox profile-area"><a class="helplink" target="_blank" href="http://redditgifts.com">what\'s this?</a><h1>PROFILE</h1><div class="content">';
			var profileBody = '';
			if (typeof(profileObject.body) != 'undefined') {
				profileBody += '<h3><a target="_blank" href="http://redditgifts.com/profiles/view/'+username+'">RedditGifts Profile:</a></h3>';
				profileBody += '<div class="redditGiftsProfileField">'+profileObject.body+'</div>';
			}
			if (typeof(profileObject.description) != 'undefined') {
				profileBody += '<h3>Description:</h3>';
				profileBody += '<div class="redditGiftsProfileField">'+profileObject.description+'</div>';
			}
			if (typeof(profileObject.photo) != 'undefined') {
				profileBody += '<h3>Photo:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="'+profileObject.photo.url+'"><img src="'+profileObject.photo_small.url+'" /></a></div>';
			}
			if (typeof(profileObject.twitter_username) != 'undefined') {
				profileBody += '<h3>Twitter:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="http://twitter.com/'+profileObject.twitter_username+'">@'+profileObject.twitter_username+'</a></div>';
			}
			if (typeof(profileObject.website) != 'undefined') {
				profileBody += '<h3>Website:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="'+profileObject.website+'">[link]</a></div>';
			}
			if (typeof(profileObject.trophies) != 'undefined') {
				profileBody += '<h3>RedditGifts Trophies:</h3>';
				var count=1;
				var len=profileObject.trophies.length;
				for (var i in profileObject.trophies) {
					var rowNum = parseInt(count/2);
					if (count==1) {
						profileBody += '<table class="trophy-table"><tbody>';
					}
					// console.log('count: ' + count + ' -- mod: ' + (count%2) + ' len: ' + len);
					// console.log('countmod: ' + ((count%2) == 0));
					if ((count%2) == 1) {
						profileBody += '<tr>';
					}
					if ((count==len) && ((count%2) == 1)) {
						profileBody += '<td class="trophy-info" colspan="2">';
					} else {
						profileBody += '<td class="trophy-info">';
					}
					profileBody += '<div><img src="'+profileObject.trophies[i].url+'" alt="'+profileObject.trophies[i].title+'" title="'+profileObject.trophies[i].title+'"><br><span class="trophy-name">'+profileObject.trophies[i].title+'</span></div>';
					profileBody += '</td>';
					if (((count%2) == 0) || (count==len)) {
						profileBody += '</tr>';
					}
					count++;
				}
				if (count) {
					profileBody += '</tbody></table>';
				}
			}
			if (profileBody == '') {
				profileBody = 'User has not filled out a profile on <a target="_blank" href="http://redditgifts.com">RedditGifts</a>.';
			}
			profileHTML += profileBody + '</div></div>';
			$(newSpacer).html(profileHTML);
			addClass(newSpacer,'spacer');
			insertAfter(firstSpacer,newSpacer);
		}
	}
};
*/

modules['subredditManager'] = {
	moduleID: 'subredditManager',
	moduleName: 'Subreddit Manager',
	category: 'UI',
	options: {
		subredditShortcut: {
			type: 'boolean',
			value: true,
			description: 'Add +shortcut button in subreddit sidebar for easy addition of shortcuts.'
		},
		linkDashboard: {
			type: 'boolean',
			value: true,
			description: 'Show "DASHBOARD" link in subreddit manager'
		},
		linkAll: {
			type: 'boolean',
			value: true,
			description: 'Show "ALL" link in subreddit manager'
		},
		linkFront: {
			type: 'boolean',
			value: true,
			description: 'show "FRONT" link in subreddit manager'
		},
		linkRandom: {
			type: 'boolean',
			value: true,
			description: 'Show "RANDOM" link in subreddit manager'
		},
		linkRandNSFW: {
			type: 'boolean',
			value: false,
			description: 'Show "RANDNSFW" link in subreddit manager'
		},
		linkFriends: {
			type: 'boolean',
			value: true,
			description: 'Show "FRIENDS" link in subreddit manager'
		},
		linkMod: {
			type: 'boolean',
			value: true,
			description: 'Show "MOD" link in subreddit manager'
		},
		linkModqueue: {
			type: 'boolean',
			value: true,
			description: 'Show "MODQUEUE" link in subreddit manager'
		}
	},
	description: 'Allows you to customize the top bar with your own subreddit shortcuts, including dropdown menus of multi-reddits and more.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/.*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.srOver { outline: 1px dashed black; }');
			RESUtils.addCSS('body { overflow-x: hidden; }');
			RESUtils.addCSS('#sr-header-area a { font-size: 100% !important; }');
			RESUtils.addCSS('#srList { position: absolute; top: 18px; left: 0px; z-index: 9999; display: none; border: 1px solid black; background-color: #FAFAFA; max-height: 92%; width: auto; overflow-y: auto; }');
			RESUtils.addCSS('#srList tr { border-bottom: 1px solid gray; }');
			RESUtils.addCSS('#srList thead td { cursor: pointer; }');
			RESUtils.addCSS('#srList td { padding-left: 8px; padding-right: 8px; padding-top: 3px; padding-bottom: 3px; }');
			RESUtils.addCSS('#srList td.RESvisited, #srList td.RESshortcut { text-transform: none; }');
			RESUtils.addCSS('#srList td.RESshortcut {cursor: pointer;}');
			RESUtils.addCSS('#srList td a { width: 100%; display: block; }');
			RESUtils.addCSS('#srList tr:hover { background-color: #eeeeff; }');
			RESUtils.addCSS('#srLeftContainer, #RESStaticShortcuts, #RESShortcuts, #srDropdown { display: inline; float: left; position: relative; z-index: 5; }');
			RESUtils.addCSS('#editShortcutDialog { display: none; z-index: 999; position: absolute; top: 25px; left: 5px; width: 230px; padding: 10px; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; font-size: 12px; color: #000000; }');
			RESUtils.addCSS('#editShortcutDialog h3 { display: inline-block; float: left; font-size: 13px; margin-top: 6px; }');
			RESUtils.addCSS('#editShortcutClose { float: right; margin-top: 2px; margin-right: 0px; }');
			RESUtils.addCSS('#editShortcutDialog label { clear: both; float: left; width: 100px; margin-top: 12px; }');
			RESUtils.addCSS('#editShortcutDialog input { float: left; width: 126px; margin-top: 10px; }');
			RESUtils.addCSS('#editShortcutDialog input[type=button] { float: right; width: 45px; margin-left: 10px; cursor: pointer; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; }');
			if ((typeof(chrome) != 'undefined') || (typeof(safari) != 'undefined')) {
				RESUtils.addCSS('#srLeftContainer { margin-right: 14px; }');
			} else {
				RESUtils.addCSS('#srLeftContainer { margin-right: 6px; }');
			}
			RESUtils.addCSS('#srLeftContainer { z-index: 4; padding-left: 4px; }');
			
			// RESUtils.addCSS('#RESShortcuts { position: absolute; left: '+ this.srLeftContainerWidth+'px;  z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; margin-top: -2px; padding-top: 2px; }');
			RESUtils.addCSS('#RESShortcutsViewport { width: auto; max-height: 20px; overflow: hidden; } ');
			RESUtils.addCSS('#RESShortcuts { z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown { display: none; position: absolute; z-index: 99999; padding: 3px; background-color: #F0F0F0; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown li { padding-left: 3px; padding-right: 3px; margin-bottom: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown li:hover { background-color: #F0F0FC; }');

			RESUtils.addCSS('#RESShortcutsEditContainer { width: 52px; position: absolute; right: 0px; top: 0px; z-index: 999; background-color: #f0f0f0; height: 16px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('#RESShortcutsRight { right: 0px; }');
			RESUtils.addCSS('#RESShortcutsAdd { right: 15px; }');
			RESUtils.addCSS('#RESShortcutsLeft { right: 31px; }');
			RESUtils.addCSS('#RESShortcutsRight, #RESShortcutsLeft, #RESShortcutsAdd, #RESShortcutsTrash {  width: 16px; cursor: pointer; background: #F0F0F0; font-size: 20px; color: #369; height: 18px; line-height: 15px; position: absolute; top: 0px; z-index: 999; background-color: #f0f0f0; user-select: none; -webkit-user-select: none; -moz-user-select: none;  } ');
			RESUtils.addCSS('#RESShortcutsTrash { display: none; font-size: 17px; width: 16px; cursor: pointer; right: 15px; height: 16px; position: absolute; top: 0px; z-index: 1000; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.srSep { margin-left: 6px; }');
			RESUtils.addCSS('.RESshortcutside { margin-right: 5px; margin-top: 2px; color: white; background-image: url(/static/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444444; padding: 1px 6px; border-radius: 3px 3px 3px 3px; }');
			RESUtils.addCSS('.RESshortcutside.remove { background-image: url(/static/bg-button-remove.png) }');
			RESUtils.addCSS('.RESshortcutside:hover { background-color: #f0f0ff; }');
			// RESUtils.addCSS('h1.redditname > a { float: left; }');
			RESUtils.addCSS('h1.redditname { overflow: auto; }');
			RESUtils.addCSS('.sortAsc, .sortDesc { float: right; background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 12px; height: 12px; background-repeat: no-repeat; }');
			RESUtils.addCSS('.sortAsc { background-position: 0px -149px; }');
			RESUtils.addCSS('.sortDesc { background-position: -12px -149px; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer { display: none; position: absolute; width: 290px; padding: 2px; right: 0px; top: 21px; z-index: 10000; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; font-size: 12px; color: #000000; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer  a { font-weight: bold; }');
			RESUtils.addCSS('#newShortcut { width: 130px; }');
			RESUtils.addCSS('#displayName { width: 130px; }');
			RESUtils.addCSS('#shortCutsAddForm { padding: 5px; }');
			RESUtils.addCSS('#shortCutsAddForm div { font-size: 10px; margin-bottom: 10px; }');
			RESUtils.addCSS('#shortCutsAddForm label { display: inline-block; width: 100px; }');
			RESUtils.addCSS('#shortCutsAddForm input[type=text] { width: 170px; margin-bottom: 6px; }');
			RESUtils.addCSS('#addSubreddit { float: right; cursor: pointer; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; }');
			RESUtils.addCSS('.RESShortcutsCurrentSub { color:orangered!important; font-weight:bold; }');
			RESUtils.addCSS('.RESShortcutsCurrentSub:visited { color:orangered!important; font-weight:bold; }');
			RESUtils.addCSS('#srLeftContainer, #RESShortcutsViewport, #RESShortcutsEditContainer{max-height:18px;}');

			// this shows the sr-header-area that we hid while rendering it (to curb opera's glitchy "jumping")...
			if (typeof(opera) != 'undefined') {
				RESUtils.addCSS('#sr-header-area { display: block !important; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.manageSubreddits();
			if (RESUtils.currentSubreddit() != null) {
				this.setLastViewtime();
			}
		}
	},
	manageSubreddits: function() {
		// This is the init function for Manage Subreddits - it'll get your preferences and redraw the top bar.
		this.redrawSubredditBar();
		// Listen for subscriptions / unsubscriptions from reddits so we know to reload the JSON string...
		// also, add a +/- shortcut button...
		if ((RESUtils.currentSubreddit()) && (this.options.subredditShortcut.value == true)) {
			var subButtons = document.querySelectorAll('.fancy-toggle-button');
			// for (var h=0, len=currentSubreddits.length; h<len; h++) {
			for (var h=0, len=subButtons.length; h<len; h++) {
				var subButton = subButtons[h];
				if ((RESUtils.currentSubreddit().indexOf('+') == -1) && (RESUtils.currentSubreddit() != 'mod')) {
					var thisSubredditFragment = RESUtils.currentSubreddit();
					var isMulti = false;
				} else if ($(subButton).parent().hasClass('subButtons')) {
					var isMulti = true;
					var thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
				} else {
					var isMulti = true;
					var thisSubredditFragment = $(subButton).next().text();
				}
				if (! ($('#subButtons-'+thisSubredditFragment).length>0)) {
					var subButtonsWrapper = $('<div id="subButtons-'+thisSubredditFragment+'" class="subButtons" style="margin: 0 !important;"></div>');
					$(subButton).wrap(subButtonsWrapper);
					// move this wrapper to the end (after any icons that may exist...)
					if (isMulti) {
						var theWrap = $(subButton).parent();
						$(theWrap).appendTo($(theWrap).parent());
					}
				}
				subButton.addEventListener('click',function() {
					// reset the last checked time for the subreddit list so that we refresh it anew no matter what.
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.'+RESUtils.loggedInUser(),0);
				},false);
				var theSC = document.createElement('span');
				theSC.setAttribute('style','display: inline-block !important;');
				theSC.setAttribute('class','RESshortcut RESshortcutside');
				theSC.setAttribute('subreddit',thisSubredditFragment);
				var idx = -1;
				for (var i=0, sublen=modules['subredditManager'].mySubredditShortcuts.length; i<sublen; i++) {
					if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == thisSubredditFragment.toLowerCase()) {
						idx=i;
						break;
					}
				}
				if (idx != -1) {
					theSC.textContent = '-shortcut';
					theSC.setAttribute('title','Remove this subreddit from your shortcut bar');
					addClass(theSC,'remove');
				} else {
					theSC.textContent = '+shortcut';
					theSC.setAttribute('title','Add this subreddit to your shortcut bar');
				}
				theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);
				// subButton.parentNode.insertBefore(theSC, subButton);
				// theSubredditLink.appendChild(theSC);
				$('#subButtons-'+thisSubredditFragment).append(theSC);
				var next = $('#subButtons-'+thisSubredditFragment).next();
				if ($(next).hasClass('title') && (! $('#subButtons-'+thisSubredditFragment).hasClass('swapped'))) {
					$('#subButtons-'+thisSubredditFragment).before($(next));
					$('#subButtons-'+thisSubredditFragment).addClass('swapped');
				}
			}
		}
		// If we're on the reddit-browsing page (/reddits), add +shortcut and -shortcut buttons...
		if (location.href.match(/https?:\/\/www.reddit.com\/reddits\/?(\?[\w=&]+)*/)) {
			this.browsingReddits();
		}
	},
	browsingReddits: function() {
		var subredditLinks = document.body.querySelectorAll('p.titlerow > a');
		if (subredditLinks) {
			for (var i=0, len=subredditLinks.length; i<len; i++) {
				if (typeof(subredditLinks[i]) == 'undefined') break;
				var match = subredditLinks[i].getAttribute('href').match(/https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w]+).*/i);
				if (match != null) {
					var theSC = document.createElement('span');
					theSC.setAttribute('style','display: inline-block; margin-right: 0');
					theSC.setAttribute('class','RESshortcut RESshortcutside');
					theSC.setAttribute('subreddit',match[1]);
					var idx = -1;
					for (var j=0, len=modules['subredditManager'].mySubredditShortcuts.length; j<len; j++) {
						if (modules['subredditManager'].mySubredditShortcuts[j].subreddit == RESUtils.currentSubreddit()) {
							idx=j;
							break;
						}
					}
					if (idx != -1) {
						theSC.textContent = '-shortcut';
						theSC.setAttribute('title','Remove this subreddit from your shortcut bar');
					} else {
						theSC.textContent = '+shortcut';
						theSC.setAttribute('title','Add this subreddit to your shortcut bar');
					}
					theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);
					// subButton.parentNode.insertBefore(theSC, subButton);
					subredditLinks[i].parentNode.parentNode.previousSibling.appendChild(theSC);
				} else {
					// uh oh...
				}
			}
		}
	},
	redrawShortcuts: function() {
		this.shortCutsContainer.textContent = '';
		var shortCuts = RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser());
		if (shortCuts == null) {
			shortCuts = RESStorage.getItem('RESmodules.betteReddit.subredditShortcuts.'+RESUtils.loggedInUser());
			// if we used to have these settings in betteReddit, clean them up.
			if (shortCuts != null) {
				var betteRedditOptions = JSON.parse(RESStorage.getItem('RESoptions.betteReddit'));
				delete betteRedditOptions.manageSubreddits;
				delete betteRedditOptions.linkDashboard;
				delete betteRedditOptions.linkAll;
				delete betteRedditOptions.linkFriends;
				delete betteRedditOptions.linkMod;
				delete betteRedditOptions.linkRandom;
				delete betteRedditOptions.linkHome;
				RESStorage.setItem('RESoptions.betteReddit', JSON.stringify(betteRedditOptions));
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(), shortCuts);
				RESStorage.removeItem('RESmodules.betteReddit.subredditShortcuts.'+RESUtils.loggedInUser());
				RESUtils.notification({
					header: 'RES Notification', 
					message: 'Subreddit Manager is now a separate module (removed from betteReddit) to avoid confusion. If you dislike this feature, you may disable the module in the RES console' 
				});
			}
		}
		if ((shortCuts != null) && (shortCuts != '') && (shortCuts != [])) {
			this.mySubredditShortcuts = safeJSON.parse(shortCuts, 'RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser())
			// go through the list of shortcuts and print them out...
			for (var i=0, len=this.mySubredditShortcuts.length; i<len; i++) {
				if (typeof(this.mySubredditShortcuts[i]) == 'string') {
					this.mySubredditShortcuts[i] = {
						subreddit: this.mySubredditShortcuts[i],
						displayName: this.mySubredditShortcuts[i]
					}
				} 
				var thisShortCut = document.createElement('a');
				thisShortCut.setAttribute('draggable','true');
				thisShortCut.setAttribute('orderIndex',i);
				thisShortCut.setAttribute('data-subreddit',this.mySubredditShortcuts[i].subreddit);
				addClass(thisShortCut, 'subbarlink');
				if ((RESUtils.currentSubreddit() != null) && (RESUtils.currentSubreddit().toLowerCase() == this.mySubredditShortcuts[i].subreddit.toLowerCase())) {
					addClass(thisShortCut, 'RESShortcutsCurrentSub');
				}
				thisShortCut.setAttribute('href','/r/'+this.mySubredditShortcuts[i].subreddit);
				thisShortCut.textContent = this.mySubredditShortcuts[i].displayName;
				thisShortCut.addEventListener('click', function(e) {
					if (e.button != 0 || e.ctrlKey || e.metaKey || e.altKey) {
						// open in new tab, let the browser handle it
						return true;
					} else {
						e.preventDefault();
						// use to open links in new tabs... work on this later...
						modules['subredditManager'].clickedShortcut = e.target.getAttribute('href');
						if (typeof(modules['subredditManager'].clickTimer) == 'undefined') {
							modules['subredditManager'].clickTimer = setTimeout(modules['subredditManager'].followSubredditShortcut, 300);
						}
					}
				}, false);
				thisShortCut.addEventListener('dblclick', function(e) {
					e.preventDefault();
					clearTimeout(modules['subredditManager'].clickTimer);
					delete modules['subredditManager'].clickTimer;
					modules['subredditManager'].editSubredditShortcut(e.target);
				}, false);
				thisShortCut.addEventListener('mouseover', function(e) {
					clearTimeout(modules['subredditManager'].hideSubredditGroupDropdownTimer);
					if ((typeof(e.target.getAttribute) != 'undefined') && (e.target.getAttribute('href').indexOf('+') != -1)) {
						var subreddits = e.target.getAttribute('href').replace('/r/','').split('+');
						modules['subredditManager'].showSubredditGroupDropdown(subreddits, e.target);
					}
				}, false);
				thisShortCut.addEventListener('mouseout', function(e) {
					modules['subredditManager'].hideSubredditGroupDropdownTimer = setTimeout(function() {
						modules['subredditManager'].hideSubredditGroupDropdown();
					}, 500);
				}, false);
				thisShortCut.addEventListener('dragstart', modules['subredditManager'].subredditDragStart, false);
				thisShortCut.addEventListener('dragenter', modules['subredditManager'].subredditDragEnter, false)
				thisShortCut.addEventListener('dragover', modules['subredditManager'].subredditDragOver, false);
				thisShortCut.addEventListener('dragleave', modules['subredditManager'].subredditDragLeave, false);
				thisShortCut.addEventListener('drop', modules['subredditManager'].subredditDrop, false);
				thisShortCut.addEventListener('dragend', modules['subredditManager'].subredditDragEnd, false);
				this.shortCutsContainer.appendChild(thisShortCut);
				if (i < len-1) {
					var sep = document.createElement('span');
					sep.setAttribute('class','separator');
					sep.textContent = '-';
					this.shortCutsContainer.appendChild(sep);
				} 
			}
			if (this.mySubredditShortcuts.length == 0) {
				this.shortCutsContainer.style.textTransform = 'none';
				this.shortCutsContainer.textContent = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			} else {
				this.shortCutsContainer.style.textTransform = '';
			}
		} else {
			this.shortCutsContainer.style.textTransform = 'none';
			this.shortCutsContainer.textContent = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			this.mySubredditShortcuts = [];
		}
		// clip the width of the container to the remaining area...
		// this.shortCutsContainer.style.width = parseInt(window.innerWidth - this.srLeftContainerWidth - 40) + 'px';
	},
	showSubredditGroupDropdown: function(subreddits, obj) {
		if (typeof(this.subredditGroupDropdown) == 'undefined') {
			this.subredditGroupDropdown = createElementWithID('div','RESSubredditGroupDropdown');
			this.subredditGroupDropdownUL = document.createElement('ul');
			this.subredditGroupDropdown.appendChild(this.subredditGroupDropdownUL);
			document.body.appendChild(this.subredditGroupDropdown);
			this.subredditGroupDropdown.addEventListener('mouseout', function(e) {
				modules['subredditManager'].hideSubredditGroupDropdownTimer = setTimeout(function() {
					modules['subredditManager'].hideSubredditGroupDropdown();
				}, 500);
			}, false);
			this.subredditGroupDropdown.addEventListener('mouseover', function(e) {
				clearTimeout(modules['subredditManager'].hideSubredditGroupDropdownTimer);
			}, false);
		}
		this.groupDropdownVisible = true;
		if (subreddits) {
			$(this.subredditGroupDropdownUL).html('');
			for (var i=0, len=subreddits.length; i<len; i++) {
				var thisLI = $('<li><a href="/r/'+subreddits[i]+'">'+subreddits[i]+'</a></li>');
				$(this.subredditGroupDropdownUL).append(thisLI);
			}
			var thisXY = RESUtils.getXYpos(obj);
			this.subredditGroupDropdown.style.top = (thisXY.y + 16) + 'px';
			// if fixed, override y to just be the height of the subreddit bar...
			// this.subredditGroupDropdown.style.position = 'fixed';
			// this.subredditGroupDropdown.style.top = '20px';
			this.subredditGroupDropdown.style.left = thisXY.x + 'px';
			this.subredditGroupDropdown.style.display = 'block';
		}
	},
	hideSubredditGroupDropdown: function() {
		delete modules['subredditManager'].hideSubredditGroupDropdownTimer;
		if (this.subredditGroupDropdown) this.subredditGroupDropdown.style.display = 'none';
	},
	editSubredditShortcut: function(ele) {
		var subreddit = ele.getAttribute('href').slice(3);
		var idx;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == subreddit) {
				idx = i;
				break;
			}
		}
		if (typeof(this.editShortcutDialog) == 'undefined') {
			this.editShortcutDialog = createElementWithID('div','editShortcutDialog');
			document.body.appendChild(this.editShortcutDialog);
		}
		var thisForm = '<form name="editSubredditShortcut"><h3>Edit Shortcut</h3><div id="editShortcutClose" class="RESCloseButton">&times;</div><label for="subreddit">Subreddit:</label> <input type="text" name="subreddit" value="'+subreddit+'" id="shortcut-subreddit"><br>'
		thisForm += '<label for="displayName">Display Name:</label><input type="text" name="displayName" value="'+ele.textContent+'" id="shortcut-displayname">';
		thisForm += '<input type="hidden" name="idx" value="'+idx+'"><input type="button" name="shortcut-save" value="save" id="shortcut-save"></form>';
		$(this.editShortcutDialog).html(thisForm);
		
		this.subredditInput = this.editShortcutDialog.querySelector('input[name=subreddit]');
		this.displayNameInput = this.editShortcutDialog.querySelector('input[name=displayName]');

		this.subredditForm = this.editShortcutDialog.querySelector('FORM');
		this.subredditForm.addEventListener('submit', function(e) {
			e.preventDefault();
		}, false);

		this.saveButton = this.editShortcutDialog.querySelector('input[name=shortcut-save]');
		this.saveButton.addEventListener('click', function(e) {
			var idx = modules['subredditManager'].editShortcutDialog.querySelector('input[name=idx]').value;
			var subreddit = modules['subredditManager'].editShortcutDialog.querySelector('input[name=subreddit]').value;
			var displayName = modules['subredditManager'].editShortcutDialog.querySelector('input[name=displayName]').value;
			if ((subreddit == '') || (displayName == '')) {
				// modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
				subreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
				modules['subredditManager'].removeSubredditShortcut(subreddit);
			} else {
				if (RESUtils.proEnabled()) {
					// store a delete for the old subreddit, and an add for the new.
					var oldsubreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
					if (typeof(modules['subredditManager'].RESPro) == 'undefined') {
						if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()) != null) {
							var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser());
						} else {
							var temp = { add: {}, del: {} };
						}
						modules['subredditManager'].RESPro = temp;
					}
					if (typeof(modules['subredditManager'].RESPro.add) == 'undefined') {
						modules['subredditManager'].RESPro.add = {}
					}
					if (typeof(modules['subredditManager'].RESPro.del) == 'undefined') {
						modules['subredditManager'].RESPro.del = {}
					}
					// add modules['subredditManager'] new subreddit next time we sync...
					modules['subredditManager'].RESPro.add[subreddit] = true;
					// delete the old one
					modules['subredditManager'].RESPro.del[oldsubreddit] = true;
					// make sure we don't run an add on the old subreddit next time we sync...
					if (typeof(modules['subredditManager'].RESPro.add[oldsubreddit]) != 'undefined') delete modules['subredditManager'].RESPro.add[oldsubreddit];
					// make sure we don't run a delete on the new subreddit next time we sync...
					if (typeof(modules['subredditManager'].RESPro.del[subreddit]) != 'undefined') delete modules['subredditManager'].RESPro.del[subreddit];
					RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
				}
				modules['subredditManager'].mySubredditShortcuts[idx] = {
					subreddit: subreddit,
					displayName: displayName
				}
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(),JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
				if (RESUtils.proEnabled()) {
					modules['RESPro'].saveModuleData('subredditManager');
				}
			}
			modules['subredditManager'].editShortcutDialog.style.display = 'none';
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();
		}, false);

		// handle enter and escape keys in the dialog box...
		this.subredditInput.addEventListener('keyup', function(e) {
			if (e.keyCode == 27) {
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
				modules['subredditManager'].editShortcutDialog.blur();
			} else if (e.keyCode == 13) {
				RESUtils.click(modules['subredditManager'].saveButton);
			}
		}, false);
		this.displayNameInput.addEventListener('keyup', function(e) {
			if (e.keyCode == 27) {
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
				modules['subredditManager'].editShortcutDialog.blur();
			} else if (e.keyCode == 13) {
				RESUtils.click(modules['subredditManager'].saveButton);
			}
		}, false);

		var cancelButton = this.editShortcutDialog.querySelector('#editShortcutClose');
		cancelButton.addEventListener('click', function(e) {
			modules['subredditManager'].editShortcutDialog.style.display = 'none';
		}, false);
		this.editShortcutDialog.style.display = 'block';
		var thisLeft = Math.min(RESUtils.mouseX, window.innerWidth-300);
		this.editShortcutDialog.style.left = thisLeft + 'px';
		setTimeout(function() {
			modules['subredditManager'].subredditInput.focus()
		}, 200);
	},
	followSubredditShortcut: function() {
		if (typeof(self.on) == 'function') {
			// stupid firefox... sigh...
			location.href = location.protocol + '//' + location.hostname + modules['subredditManager'].clickedShortcut;
		} else {
			location.href = modules['subredditManager'].clickedShortcut;
		}
	},
	subredditDragStart: function(e) {
		clearTimeout(modules['subredditManager'].clickTimer);
		// Target (this) element is the source node.
		this.style.opacity = '0.4';
		modules['subredditManager'].shortCutsTrash.style.display = 'block';
		modules['subredditManager'].dragSrcEl = this;

		e.dataTransfer.effectAllowed = 'move';
		// because Safari is stupid, we have to do this.
		modules['subredditManager'].srDataTransfer = this.getAttribute('orderIndex') + ',' + this.getAttribute('data-subreddit');
		// e.dataTransfer.setData('text/html', this.getAttribute('orderIndex') + ',' + this.innerHTML);
	},
	subredditDragEnter: function(e) {
		addClass(this,'srOver');
		return false;
	},
	subredditDragOver: function(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
		// addClass(this,'srOver');

		return false;
	},
	subredditDragLeave: function(e) {
		removeClass(this,'srOver');
		return false;
	},
	subredditDrop: function(e) {
		// this/e.target is current target element.
		if (e.stopPropagation) {
			e.stopPropagation(); // Stops some browsers from redirecting.
		}
		// Stops other browsers from redirecting.
		e.preventDefault();
		modules['subredditManager'].shortCutsTrash.style.display = 'none';
		// Don't do anything if dropping the same column we're dragging.
		if (modules['subredditManager'].dragSrcEl != this) {
			if (e.target.getAttribute('id') != 'RESShortcutsTrash') {
				// get the order index of the src and destination to swap...
				// var theData = e.dataTransfer.getData('text/html').split(',');
				var theData = modules['subredditManager'].srDataTransfer.split(',');
				var srcOrderIndex = parseInt(theData[0]);
				// var srcSubreddit = theData[1];
				var srcSubreddit = modules['subredditManager'].mySubredditShortcuts[srcOrderIndex];
				var destOrderIndex = parseInt(this.getAttribute('orderIndex'));
				var destSubreddit = modules['subredditManager'].mySubredditShortcuts[destOrderIndex];
				var rearranged = [];
				var rearrangedI = 0;
				for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
					if ((i != srcOrderIndex) && (i != destOrderIndex)) {
						rearranged[rearrangedI] = modules['subredditManager'].mySubredditShortcuts[i];
						rearrangedI++;
					} else if (i == destOrderIndex) {
						if (destOrderIndex > srcOrderIndex) {
							// if dragging right, order dest first, src next.
							rearranged[rearrangedI] = destSubreddit;
							rearrangedI++;
							rearranged[rearrangedI] = srcSubreddit;
							rearrangedI++;
						} else {
							// if dragging left, order src first, dest next.
							rearranged[rearrangedI] = srcSubreddit;
							rearrangedI++;
							rearranged[rearrangedI] = destSubreddit;
							rearrangedI++;
						}
					}
				}
				modules['subredditManager'].mySubredditShortcuts = rearranged;
				// save the updated order...
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(),JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
				// redraw the shortcut bar...
				modules['subredditManager'].redrawShortcuts();
				removeClass(this,'srOver');
			} else {
				// var theData = e.dataTransfer.getData('text/html').split(',');
				var theData = modules['subredditManager'].srDataTransfer.split(',');
				// console.log(theData);
				var srcOrderIndex = parseInt(theData[0]);
				var srcSubreddit = theData[1];
				modules['subredditManager'].removeSubredditShortcut(srcSubreddit);
			}
		}
		return false;
	},
	subredditDragEnd: function(e) {
		modules['subredditManager'].shortCutsTrash.style.display = 'none';
		this.style.opacity = '1';
		return false;
	},
	redrawSubredditBar: function() {
		this.headerContents = document.querySelector('#sr-header-area');
		if (this.headerContents) {
			// for opera, because it renders progressively and makes it look "glitchy", hide the header bar, then show it all at once with CSS.
			// if (typeof(opera) != 'undefined') this.headerContents.style.display = 'none';
			// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
			$(this.headerContents).html('');
			this.srLeftContainer = createElementWithID('div','srLeftContainer');
			this.srLeftContainer.setAttribute('class','sr-bar');
			this.srDropdown = createElementWithID('div','srDropdown');
			this.srDropdownContainer = createElementWithID('div','srDropdownContainer');
			$(this.srDropdownContainer).html('<a href="javascript:void(0)">My Subreddits</a>');
			this.srDropdownContainer.addEventListener('click',modules['subredditManager'].toggleSubredditDropdown, false);
			this.srDropdown.appendChild(this.srDropdownContainer);
			this.srList = createElementWithID('table','srList');
			// this.srDropdownContainer.appendChild(this.srList);
			document.body.appendChild(this.srList);
			this.srLeftContainer.appendChild(this.srDropdown);
			var sep = document.createElement('span');
			sep.setAttribute('class','srSep');
			sep.textContent = '|';
			this.srLeftContainer.appendChild(sep);
			// now put in the shortcuts...
			this.staticShortCutsContainer = document.createElement('div');
			this.staticShortCutsContainer.setAttribute('id','RESStaticShortcuts');
			/* this probably isn't the best way to give the option, since the mechanic is drag/drop for other stuff..  but it's much easier for now... */
			$(this.staticShortCutsContainer).html('');
			var specialButtonSelected = {};
			var subLower = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : 'home';
			specialButtonSelected[subLower] = 'RESShortcutsCurrentSub';
			var shortCutsHTML = '';
			if (this.options.linkDashboard.value) shortCutsHTML += '<span class="separator">-</span><a id="RESDashboardLink" class="subbarlink '+specialButtonSelected['dashboard']+'" href="/r/Dashboard/">DASHBOARD</a>';
			if (this.options.linkFront.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink '+specialButtonSelected['home']+'" href="/">FRONT</a>';
			if (this.options.linkAll.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink '+specialButtonSelected['all']+'" href="/r/all/">ALL</a>';
			if (this.options.linkRandom.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/random/">RANDOM</a>';
			if (this.options.linkRandNSFW.value) shortCutsHTML += '<span class="separator over18">-</span><a class="subbarlink over18" href="/r/randnsfw/">RANDNSFW</a>';
			if (RESUtils.loggedInUser() != null) {
				if (this.options.linkFriends.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink '+specialButtonSelected['friends']+'" href="/r/friends/">FRIENDS</a>';
				var modmail = document.getElementById('modmail');
				if (modmail) {
					if (this.options.linkMod.value) shortCutsHTML += '<span class="separator">-</span><a class=" '+specialButtonSelected['mod']+'" href="/r/mod/">MOD</a>';
					if (this.options.linkModqueue.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/mod/about/modqueue">MODQUEUE</a>';
				}
			}
			$(this.staticShortCutsContainer).append(shortCutsHTML);
			
			this.srLeftContainer.appendChild(this.staticShortCutsContainer);
			this.srLeftContainer.appendChild(sep);
			this.headerContents.appendChild(this.srLeftContainer);			
						
			this.shortCutsViewport = document.createElement('div');
			this.shortCutsViewport.setAttribute('id','RESShortcutsViewport');
			this.headerContents.appendChild(this.shortCutsViewport);

			this.shortCutsContainer = document.createElement('div');
			this.shortCutsContainer.setAttribute('id','RESShortcuts');
			this.shortCutsContainer.setAttribute('class','sr-bar');
			this.shortCutsViewport.appendChild(this.shortCutsContainer);

			this.shortCutsEditContainer = document.createElement('div');
			this.shortCutsEditContainer.setAttribute('id','RESShortcutsEditContainer');
			this.headerContents.appendChild(this.shortCutsEditContainer);
			
			// now add an event listener to show the edit bar on hover...
			/* not working so great, too much glitchiness... maybe we'll address this later when we have more time...
			this.headerContents.addEventListener('mouseover', modules['subredditManager'].showShortcutButtons, false);
			this.headerContents.addEventListener('mouseout', modules['subredditManager'].hideShortcutButtons, false);
			*/

			// add right scroll arrow...
			this.shortCutsRight = document.createElement('div');
			this.shortCutsRight.setAttribute('id','RESShortcutsRight');
			this.shortCutsRight.textContent = '>';
			// this.containerWidth = this.shortCutsContainer.scrollWidth;
			this.shortCutsRight.addEventListener('click', function(e) {
				modules['subredditManager'].containerWidth = modules['subredditManager'].shortCutsContainer.offsetWidth;
				// var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				// width of browser minus width of left container plus a bit extra for padding...
				// var containerWidth = window.innerWidth + 20 - modules['subredditManager'].srLeftContainer.scrollWidth;
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px',''));
				if (isNaN(marginLeft)) marginLeft = 0;
				var shiftWidth = $('#RESShortcutsViewport').width() - 80;
				if (modules['subredditManager'].containerWidth > (shiftWidth)) {
					marginLeft -= shiftWidth;
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				} else {
					// console.log('already all the way over.');
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsRight);

			// add an "add shortcut" button...
			this.shortCutsAdd = document.createElement('div');
			this.shortCutsAdd.setAttribute('id','RESShortcutsAdd');
			this.shortCutsAdd.textContent = '+';
			this.shortCutsAdd.title = 'add shortcut';
			this.shortCutsAddFormContainer = document.createElement('div');
			this.shortCutsAddFormContainer.setAttribute('id','RESShortcutsAddFormContainer');
			this.shortCutsAddFormContainer.style.display = 'none';
			var thisForm = ' \
				<form id="shortCutsAddForm"> \
					<div>Add shortcut or multi-reddit (i.e. foo+bar+baz):</div> \
					<label for="newShortcut">Subreddit:</label> <input type="text" id="newShortcut"><br> \
					<label for="displayName">Display Name:</label> <input type="text" id="displayName"><br> \
					<input type="submit" name="submit" value="add" id="addSubreddit"> \
					<div style="clear: both; float: right; margin-top: 5px;"><a style="font-size: 9px;" href="/reddits">Edit frontpage subscriptions</a></div> \
				</form> \
			';
			$(this.shortCutsAddFormContainer).html(thisForm);
			this.shortCutsAddFormField = this.shortCutsAddFormContainer.querySelector('#newShortcut');
			this.shortCutsAddFormFieldDisplayName = this.shortCutsAddFormContainer.querySelector('#displayName');
			modules['subredditManager'].shortCutsAddFormField.addEventListener('keyup', function(e) {
				if (e.keyCode == 27) {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
					modules['subredditManager'].shortCutsAddFormField.blur();
				}
			}, false);
			modules['subredditManager'].shortCutsAddFormFieldDisplayName.addEventListener('keyup', function(e) {
				if (e.keyCode == 27) {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
					modules['subredditManager'].shortCutsAddFormFieldDisplayName.blur();
				}
			}, false);
			
			// add the "add shortcut" form...
			this.shortCutsAddForm = this.shortCutsAddFormContainer.querySelector('#shortCutsAddForm');
			this.shortCutsAddForm.addEventListener('submit', function(e) {
				e.preventDefault();
				var subreddit = modules['subredditManager'].shortCutsAddFormField.value;
				var displayname = modules['subredditManager'].shortCutsAddFormFieldDisplayName.value;
				if (displayname == '') displayname = subreddit;
				subreddit = subreddit.replace('/r/','').replace('r/','');
				modules['subredditManager'].shortCutsAddFormField.value = '';
				modules['subredditManager'].shortCutsAddFormFieldDisplayName.value = '';
				modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
				if (subreddit) {
					modules['subredditManager'].addSubredditShortcut(subreddit, displayname);
				}
			}, false);
			this.shortCutsAdd.addEventListener('click', function(e) {
				if (modules['subredditManager'].shortCutsAddFormContainer.style.display == 'none') {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'block';
					modules['subredditManager'].shortCutsAddFormField.focus();
				} else {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
					modules['subredditManager'].shortCutsAddFormField.blur();
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsAdd);
			document.body.appendChild(this.shortCutsAddFormContainer);
			
			// add the "trash bin"...
			this.shortCutsTrash = document.createElement('div');
			// thisShortCut.setAttribute('draggable','true');
			// thisShortCut.setAttribute('orderIndex',i);
			this.shortCutsTrash.setAttribute('id','RESShortcutsTrash');
			this.shortCutsTrash.textContent = 'X';
			// thisShortCut.addEventListener('dragstart', modules['subredditManager'].subredditDragStart, false);
			this.shortCutsTrash.addEventListener('dragenter', modules['subredditManager'].subredditDragEnter, false)
			this.shortCutsTrash.addEventListener('dragleave', modules['subredditManager'].subredditDragLeave, false);
			// thisShortCut.addEventListener('dragend', modules['subredditManager'].subredditDragEnd, false);
			this.shortCutsTrash.addEventListener('dragover', modules['subredditManager'].subredditDragOver, false);
			this.shortCutsTrash.addEventListener('drop', modules['subredditManager'].subredditDrop, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsTrash);
			
			// add left scroll arrow...
			this.shortCutsLeft = document.createElement('div');
			this.shortCutsLeft.setAttribute('id','RESShortcutsLeft');
			this.shortCutsLeft.textContent = '<';
			this.shortCutsLeft.addEventListener('click', function(e) {
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px',''));
				var shiftWidth = $('#RESShortcutsViewport').width() - 80;
				if (isNaN(marginLeft)) marginLeft = 0;
				marginLeft += shiftWidth;
				if (marginLeft <= 0) {
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsLeft);
			
			this.redrawShortcuts();
		}
	},
	/* not working so great, too much glitchiness... maybe we'll address this later when we have more time...
	showShortcutButtons: function() {
			RESUtils.fadeElementIn(modules['subredditManager'].shortCutsEditContainer, 0.3);
	},
	hideShortcutButtons: function() {
			RESUtils.fadeElementOut(modules['subredditManager'].shortCutsEditContainer, 0.3);
	}, */
	toggleSubredditDropdown: function() {
		if (modules['subredditManager'].srList.style.display == 'block') {
			modules['subredditManager'].srList.style.display = 'none';
		} else {
			if (RESUtils.loggedInUser()) {
				$(modules['subredditManager'].srList).html('<tr><td width="360">Loading subreddits (may take a moment)...<div id="subredditPagesLoaded"></div></td></tr>');
				modules['subredditManager'].subredditPagesLoaded = modules['subredditManager'].srList.querySelector('#subredditPagesLoaded');
				modules['subredditManager'].srList.style.display = 'block';
				modules['subredditManager'].getSubreddits();
			} else {
				$(modules['subredditManager'].srList).html('<tr><td width="360">You must be logged in to load your own list of subreddits. <a style="display: inline; float: left;" href="/reddits">browse them all</a></td></tr>');
				modules['subredditManager'].srList.style.display = 'block';
			}
		}
	},
	mySubreddits: [
	],
	mySubredditShortcuts: [
	],
	getSubredditJSON: function(after) {
		var jsonURL = location.protocol + '//' + location.hostname + '/reddits/mine/.json?app=res';
		if (after) jsonURL += '&after='+after;
		GM_xmlhttpRequest({
			method:	"GET",
			url:	jsonURL,
			onload:	function(response) {
				var thisResponse = JSON.parse(response.responseText);
				if ((typeof(thisResponse.data) != 'undefined') && (typeof(thisResponse.data.children) != 'undefined')) {
					if (modules['subredditManager'].subredditPagesLoaded.innerHTML == '') {
						modules['subredditManager'].subredditPagesLoaded.textContent = 'Pages loaded: 1';
					} else {
						var pages = modules['subredditManager'].subredditPagesLoaded.innerHTML.match(/:\ ([\d]+)/);
						modules['subredditManager'].subredditPagesLoaded.textContent = 'Pages loaded: ' + (parseInt(pages[1])+1);
					}
					var now = new Date();
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.'+RESUtils.loggedInUser(),now.getTime());
					var subreddits = thisResponse.data.children;
					for (var i=0, len=subreddits.length; i<len; i++) {
						var srObj = {
							display_name: subreddits[i].data.display_name,
							url: subreddits[i].data.url,
							over18: subreddits[i].data.over18,
							id: subreddits[i].data.id,
							created: subreddits[i].data.created,
							description: subreddits[i].data.description
						}
						modules['subredditManager'].mySubreddits.push(srObj);
					}
					if (thisResponse.data.after != null) {
						modules['subredditManager'].getSubredditJSON(thisResponse.data.after);
					} else {
						modules['subredditManager'].mySubreddits.sort(function(a,b) {
							var adisp = a.display_name.toLowerCase();
							var bdisp = b.display_name.toLowerCase();
							if (adisp > bdisp) return 1;
							if (adisp == bdisp) return 0;
							return -1;
						});
						RESStorage.setItem('RESmodules.subredditManager.subreddits.'+RESUtils.loggedInUser(),JSON.stringify(modules['subredditManager'].mySubreddits));
						this.gettingSubreddits = false;
						modules['subredditManager'].populateSubredditDropdown();
					}
				} else {
					// user is probably not logged in.. no subreddits found.
					modules['subredditManager'].populateSubredditDropdown(null, true);
				}
			}
		});
	
	},
	getSubreddits: function() {
		modules['subredditManager'].mySubreddits = [];
		var lastCheck = parseInt(RESStorage.getItem('RESmodules.subredditManager.subreddits.lastCheck.'+RESUtils.loggedInUser())) || 0;
		var now = new Date();
		var check = RESStorage.getItem('RESmodules.subredditManager.subreddits.'+RESUtils.loggedInUser());
		// 86400000 = 1 day
		if (((now.getTime() - lastCheck) > 86400000) || (check == null) || (check == '') || (check.length == 0)) {
			if (!this.gettingSubreddits) {
				this.gettingSubreddits = true;
				this.getSubredditJSON();
			} 
		} else {
			modules['subredditManager'].mySubreddits = safeJSON.parse(check, 'RESmodules.subredditManager.subreddits.'+RESUtils.loggedInUser());
			this.populateSubredditDropdown();
		}
	},
	// if badJSON is true, then getSubredditJSON ran into an error...
	populateSubredditDropdown: function(sortBy, badJSON) {
		modules['subredditManager'].sortBy = sortBy || 'subreddit';
		$(modules['subredditManager'].srList).html('');
		// NOTE WE NEED TO CHECK LAST TIME THEY UPDATED THEIR SUBREDDIT LIST AND REPOPULATE...
		var theHead = document.createElement('thead');
		var theRow = document.createElement('tr');
		modules['subredditManager'].srHeader = document.createElement('td');
		modules['subredditManager'].srHeader.addEventListener('click', function() {
			if (modules['subredditManager'].sortBy == 'subreddit') {
				modules['subredditManager'].populateSubredditDropdown('subredditDesc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('subreddit');
			}
		}, false);
		modules['subredditManager'].srHeader.textContent = 'subreddit';
		modules['subredditManager'].srHeader.setAttribute('width','200');
		modules['subredditManager'].lvHeader = document.createElement('td');
		modules['subredditManager'].lvHeader.addEventListener('click', function() {
			if (modules['subredditManager'].sortBy == 'lastVisited') {
				modules['subredditManager'].populateSubredditDropdown('lastVisitedAsc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('lastVisited');
			}
		}, false);
		modules['subredditManager'].lvHeader.textContent = 'Last Visited';
		modules['subredditManager'].lvHeader.setAttribute('width','120');
		var scHeader = document.createElement('td');
		$(scHeader).html('<a style="float: right;" href="/reddits">View all &raquo;</a>');
		theRow.appendChild(modules['subredditManager'].srHeader);
		theRow.appendChild(modules['subredditManager'].lvHeader);
		theRow.appendChild(scHeader);
		theHead.appendChild(theRow);
		modules['subredditManager'].srList.appendChild(theHead);
		var theBody = document.createElement('tbody');
		if (!(badJSON)) {
			var subredditCount = modules['subredditManager'].mySubreddits.length;
			if (typeof(this.subredditsLastViewed) == 'undefined') {
				var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser());
				if (check) {
					this.subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser());
				} else {
					this.subredditsLastViewed = {};
				}
			}
			// copy modules['subredditManager'].mySubreddits to a placeholder array so we can sort without modifying it...
			var sortableSubreddits = modules['subredditManager'].mySubreddits;
			if (sortBy == 'lastVisited') {
				$(modules['subredditManager'].lvHeader).html('Last Visited <div class="sortAsc"></div>');
				modules['subredditManager'].srHeader.textContent = 'subreddit';
				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					(typeof(modules['subredditManager'].subredditsLastViewed[adisp]) == 'undefined') ? alv = 0 : alv = parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited);
					(typeof(modules['subredditManager'].subredditsLastViewed[bdisp]) == 'undefined') ? blv = 0 : blv = parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited);
					if (alv < blv) return 1;
					if (alv == blv) {
						if (adisp > bdisp) return 1;
						return -1;
					}
					return -1;
				});
			} else if (sortBy == 'lastVisitedAsc') {
				$(modules['subredditManager'].lvHeader).html('Last Visited <div class="sortDesc"></div>');
				modules['subredditManager'].srHeader.textContent = 'subreddit';
				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					(typeof(modules['subredditManager'].subredditsLastViewed[adisp]) == 'undefined') ? alv = 0 : alv = parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited);
					(typeof(modules['subredditManager'].subredditsLastViewed[bdisp]) == 'undefined') ? blv = 0 : blv = parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited);
					if (alv > blv) return 1;
					if (alv == blv) {
						if (adisp > bdisp) return 1;
						return -1;
					}
					return -1;
				});
			} else if (sortBy == 'subredditDesc') {
				modules['subredditManager'].lvHeader.textContent = 'Last Visited';
				$(modules['subredditManager'].srHeader).html('subreddit <div class="sortDesc"></div>');
				sortableSubreddits.sort(function(a,b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					if (adisp < bdisp) return 1;
					if (adisp == bdisp) return 0;
					return -1;
				});		
			} else {
				modules['subredditManager'].lvHeader.textContent = 'Last Visited';
				$(modules['subredditManager'].srHeader).html('subreddit <div class="sortAsc"></div>');
				sortableSubreddits.sort(function(a,b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					if (adisp > bdisp) return 1;
					if (adisp == bdisp) return 0;
					return -1;
				});
			}
			for (var i=0; i<subredditCount; i++) {
				var dateString = 'Never';
				var thisReddit = sortableSubreddits[i].display_name.toLowerCase();
				if (typeof(this.subredditsLastViewed[thisReddit]) != 'undefined') {
					var ts = parseInt(this.subredditsLastViewed[thisReddit].last_visited);
					var dateVisited = new Date(ts);
					dateString = RESUtils.niceDate(dateVisited);
				}
				var theRow = document.createElement('tr');
				var theSR = document.createElement('td');
				$(theSR).html('<a href="'+escapeHTML(modules['subredditManager'].mySubreddits[i].url)+'">'+escapeHTML(modules['subredditManager'].mySubreddits[i].display_name)+'</a>');
				theRow.appendChild(theSR);
				var theLV = document.createElement('td');
				theLV.textContent = dateString;
				theLV.setAttribute('class','RESvisited');
				theRow.appendChild(theLV);
				var theSC = document.createElement('td');
				theSC.setAttribute('class','RESshortcut');
				theSC.setAttribute('subreddit',modules['subredditManager'].mySubreddits[i].display_name);
				var idx = -1;
				for (var j=0, len=modules['subredditManager'].mySubredditShortcuts.length; j<len; j++) {
					if (modules['subredditManager'].mySubredditShortcuts[j].subreddit == modules['subredditManager'].mySubreddits[i].display_name) {
						idx=j;
						break;
					}
				}
				if (idx != -1) {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}
						var subreddit = e.target.getAttribute('subreddit');
						modules['subredditManager'].removeSubredditShortcut(subreddit);
					}, false);
					theSC.textContent = '-shortcut';
				} else {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}
						var subreddit = e.target.getAttribute('subreddit');
						modules['subredditManager'].addSubredditShortcut(subreddit);
					}, false);
					theSC.textContent = '+shortcut';
				}
				theRow.appendChild(theSC);
				theBody.appendChild(theRow);
			}
		} else {
			var theRow = document.createElement('tr');
			var theTD = document.createElement('td');
			theTD.textContent = 'There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com';
			theTD.setAttribute('colspan','3');
			theRow.appendChild(theTD);
			theBody.appendChild(theRow);
		}
		modules['subredditManager'].srList.appendChild(theBody);
	},
	toggleSubredditShortcut: function(e) {
		if (e.stopPropagation) {
			e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
		}
		var idx = -1;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == e.target.getAttribute('subreddit').toLowerCase()) {
				idx=i;
				break;
			}
		}
		if (idx != -1) {
			// modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
			modules['subredditManager'].removeSubredditShortcut(e.target.getAttribute('subreddit'));
			e.target.setAttribute('title','Add this subreddit to your shortcut bar');
			e.target.textContent = '+shortcut';
			removeClass(e.target,'remove');
		} else {
			// modules['subredditManager'].mySubredditShortcuts.push(e.target.getAttribute('subreddit'));
			modules['subredditManager'].addSubredditShortcut(e.target.getAttribute('subreddit'));
			e.target.setAttribute('title','Remove this subreddit from your shortcut bar');
			e.target.textContent = '-shortcut';
			addClass(e.target,'remove');
		}
		modules['subredditManager'].redrawShortcuts();
	},
	getLatestShortcuts: function() {
		// re-retreive the latest data to ensure we're not losing info between tab changes...
		var shortCuts = RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser());
		if (!shortCuts) {
			shortCuts = '[]';
		} 
		modules['subredditManager'].mySubredditShortcuts = safeJSON.parse(shortCuts, 'RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser());
	},
	addSubredditShortcut: function(subreddit, displayname) {
		this.getLatestShortcuts();
		var idx = -1;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == subreddit.toLowerCase()) {
				idx = i;
				break;
			}
		}
		if (idx != -1) {
			alert('Whoops, you already have a shortcut for that subreddit');
		} else {
			displayname = displayname || subreddit;
			subredditObj = {
				subreddit: subreddit,
				displayName: displayname
			}
			modules['subredditManager'].mySubredditShortcuts.push(subredditObj);
			if (RESUtils.proEnabled()) {
				if (typeof(modules['subredditManager'].RESPro) == 'undefined') {
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()) != null) {
						var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser());
					} else {
						var temp = { add: {}, del: {} };
					}
					modules['subredditManager'].RESPro = temp;
				}
				if (typeof(modules['subredditManager'].RESPro.add) == 'undefined') {
					modules['subredditManager'].RESPro.add = {}
				}
				if (typeof(modules['subredditManager'].RESPro.del) == 'undefined') {
					modules['subredditManager'].RESPro.del = {}
				}
				// add this subreddit next time we sync...
				modules['subredditManager'].RESPro.add[subreddit] = true;
				// make sure we don't run a delete on this subreddit next time we sync...
				if (typeof(modules['subredditManager'].RESPro.del[subreddit]) != 'undefined') delete modules['subredditManager'].RESPro.del[subreddit];
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}
			RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();
			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}
			RESUtils.notification({ 
				header: 'Subreddit Manager Notification', 
				message: 'Subreddit shortcut added. You can edit by double clicking, or trash by dragging to the trash can.'
			});
		}
	},
	removeSubredditShortcut: function(subreddit) {
		this.getLatestShortcuts();
		var idx = -1;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == subreddit.toLowerCase()) {
				idx = i;
				break;
			}
		}
		if (idx != -1) {
			modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
			if (RESUtils.proEnabled()) {
				if (typeof(modules['subredditManager'].RESPro) == 'undefined') {
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()) != null) {
						var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser());
					} else {
						var temp = { add: {}, del: {} };
					}
					modules['subredditManager'].RESPro = temp;
				}
				if (typeof(modules['subredditManager'].RESPro.add) == 'undefined') {
					modules['subredditManager'].RESPro.add = {}
				}
				if (typeof(modules['subredditManager'].RESPro.del) == 'undefined') {
					modules['subredditManager'].RESPro.del = {}
				}
				// delete this subreddit next time we sync...
				modules['subredditManager'].RESPro.del[subreddit] = true;
				// make sure we don't run an add on this subreddit
				if (typeof(modules['subredditManager'].RESPro.add[subreddit]) != 'undefined') delete modules['subredditManager'].RESPro.add[subreddit];
				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}
			RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();
			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}
		}
	},
	setLastViewtime: function() {
		var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser());
		if (check == null) {
			this.subredditsLastViewed = {};
		} else {
			this.subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser());
		}
		var now = new Date();
		var thisReddit = RESUtils.currentSubreddit().toLowerCase();
		this.subredditsLastViewed[thisReddit] = {
			last_visited: now.getTime()
		}
		RESStorage.setItem('RESmodules.subredditManager.subredditsLastViewed.'+RESUtils.loggedInUser(),JSON.stringify(this.subredditsLastViewed));
	}
}; // note: you NEED this semicolon at the end!

// RES Pro needs some work still... not ready yet.
/*
modules['RESPro'] = {
	moduleID: 'RESPro',
	moduleName: 'RES Pro',
	category: 'Pro Features',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		username: {
			type: 'text',
			value: '',
			description: 'Your RES Pro username'
		},
		password: {
			type: 'password',
			value: '',
			description: 'Your RES Pro password'
		},
		syncFrequency: {
			type: 'enum',
			values: [
				{ name: 'Hourly', value: '3600000' },
				{ name: 'Daily', value: '86400000' },
				{ name: 'Manual Only', value: '-1' }
			],
			value: '86400000',
			description: 'How often should RES automatically sync settings?'
		}
	},
	description: 'RES Pro allows you to sync settings and data to a server. It requires an account, which you can sign up for <a href="http://reddit.honestbleeps.com/register.php">here</a>',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/?/i,
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// if we haven't synced in more than our settings, and settings != manual, sync!
			if (this.options.syncFrequency.value > 0) {
				var lastSync = parseInt(RESStorage.getItem('RESmodules.RESPro.lastSync')) || 0;
				var now = new Date();
				if ((now.getTime() - lastSync) > this.options.syncFrequency.value) {
					this.authenticate(this.autoSync);
				}
			}

		}
	},
	autoSync: function() {
		modules['RESPro'].authenticate(modules['RESPro'].savePrefs);
		
		// modules['RESPro'].authenticate(function() {
		//	modules['RESPro'].saveModuleData('saveComments');
		// });
	},
	saveModuleData: function(module) {
		switch(module){
			case 'userTagger':
				// THIS IS NOT READY YET!  We need to merge votes on the backend.. hard stuff...
				// in this case, we want to send the JSON from RESmodules.userTagger.tags;
				var tags = RESStorage.getItem('RESmodules.userTagger.tags');
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=PUT&type=module_data&module='+module+'&data='+tags,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						var resp = JSON.parse(response.responseText);
						// console.log(resp);
						if (resp.success) {
							if (RESConsole.proUserTaggerSaveButton) RESConsole.proUserTaggerSaveButton.textContent = 'Saved!';
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			case 'saveComments':
				var savedComments = RESStorage.getItem('RESmodules.saveComments.savedComments');
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=PUT&type=module_data&module='+module+'&data='+savedComments,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						// console.log(response.responseText);
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							if (RESConsole.proSaveCommentsSaveButton) RESConsole.proSaveCommentsSaveButton.textContent = 'Saved!';
							var thisComments = safeJSON.parse(savedComments);
							delete thisComments.RESPro_add;
							delete thisComments.RESPro_delete;
							thisComments = JSON.stringify(thisComments);
							RESStorage.setItem('RESmodules.saveComments.savedComments',thisComments);
							RESUtils.notification({
								header: 'RES Pro Notification', 
								message: 'Saved comments synced to server'
							});
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			case 'subredditManager':
				var subredditManagerData = {};
				subredditManagerData.RESPro = {};

				for (var key in RESStorage) {
					// console.log(key);
					if (key.indexOf('RESmodules.subredditManager') != -1) {
						var keySplit = key.split('.');
						var username = keySplit[keySplit.length-1];
						if ((keySplit.indexOf('subredditsLastViewed') == -1) && (keySplit.indexOf('subreddits') == -1)) {
							// console.log(key);
							(keySplit.indexOf('RESPro') != -1) ? subredditManagerData.RESPro[username] = JSON.parse(RESStorage[key]) : subredditManagerData[username] = JSON.parse(RESStorage[key]);
							// if (key.indexOf('RESPro') == -1) console.log(username + ' -- ' + RESStorage[key]);
							if (key.indexOf('RESPro') != -1) RESStorage.removeItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+username);
						}
					}
				}
				var stringData = JSON.stringify(subredditManagerData);
				stringData = encodeURIComponent(stringData);
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=PUT&type=module_data&module='+module+'&data='+stringData,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						console.log(response.responseText);
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							if (RESConsole.proSubredditManagerSaveButton) RESConsole.proSubredditManagerSaveButton.textContent = 'Saved!';
							RESUtils.notification({
								header: 'RES Pro Notification', 
								message: 'Subreddit shortcuts synced to server'
							});
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			default:
				console.log('invalid module specified: ' + module);
				break;
		}
	},
	getModuleData: function(module) {
		switch(module){
			case 'saveComments':
				if (RESConsole.proSaveCommentsGetButton) RESConsole.proSaveCommentsGetButton.textContent = 'Loading...';
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=GET&type=module_data&module='+module,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							var serverResponse = JSON.parse(response.responseText);
							var serverData = serverResponse.data;
							currentData = safeJSON.parse(RESStorage.getItem('RESmodules.saveComments.savedComments'), 'RESmodules.saveComments.savedComments');
							for (var attrname in serverData) {
								if (typeof(currentData[attrname]) == 'undefined') {
									currentData[attrname] = serverData[attrname];
								} 
							}
							// console.log(JSON.stringify(prefsData));
							RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(currentData));
							if (RESConsole.proSaveCommentsGetButton) RESConsole.proSaveCommentsGetButton.textContent = 'Saved Comments Loaded!';
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			case 'subredditManager':
				if (RESConsole.proSubredditManagerGetButton) RESConsole.proSubredditManagerGetButton.textContent = 'Loading...';
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESsync.php',
					data: 'action=GET&type=module_data&module='+module,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							var serverResponse = JSON.parse(response.responseText);
							var serverData = serverResponse.data;
							for (var username in serverResponse.data) {
								var newSubredditData = serverResponse.data[username];
								var oldSubredditData = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.'+username), 'RESmodules.subredditManager.subredditShortcuts.'+username);
								if (oldSubredditData == null) oldSubredditData = [];
								for (var newidx in newSubredditData) {
									var exists = false;
									for (var oldidx in oldSubredditData) {
										if (oldSubredditData[oldidx].subreddit == newSubredditData[newidx].subreddit) {
											oldSubredditData[oldidx].displayName = newSubredditData[newidx].displayName;
											exists = true;
											break;
										}
									}
									if (!exists) {
										oldSubredditData.push(newSubredditData[newidx]);
									}
								}
								RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.'+username,JSON.stringify(oldSubredditData));
							}
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			default:
				console.log('invalid module specified: ' + module);
				break;
		}
	},
	savePrefs: function() {
		// (typeof(unsafeWindow) != 'undefined') ? ls = unsafeWindow.localStorage : ls = localStorage;
		if (RESConsole.proSaveButton) RESConsole.proSaveButton.textContent = 'Saving...';
		var RESOptions = {};
		// for (var i = 0, len=ls.length; i < len; i++) {
		for(var i in RESStorage) {
			if ((typeof(RESStorage.getItem(i)) != 'function') && (typeof(RESStorage.getItem(i)) != 'undefined')) {
				var keySplit = i.split('.');
				if (keySplit) {
					var keyRoot = keySplit[0];
					switch (keyRoot) {
						case 'RES':
							var thisNode = keySplit[1];
							if (thisNode == 'modulePrefs') {
								RESOptions[thisNode] = safeJSON.parse(RESStorage.getItem(i), i);
							}
							break;
						case 'RESoptions':
							var thisModule = keySplit[1];
							if (thisModule != 'accountSwitcher') {
								RESOptions[thisModule] = safeJSON.parse(RESStorage.getItem(i), i);
							}
							break;
						default:
							//console.log('Not currently handling keys with root: ' + keyRoot);
							break;
					}
				}
			}
		}
		// Post options blob.
		var RESOptionsString = JSON.stringify(RESOptions);
		GM_xmlhttpRequest({
			method:	"POST",
			url:	'http://reddit.honestbleeps.com/RESsync.php',
			data: 'action=PUT&type=all_options&data='+RESOptionsString,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload:	function(response) {
				var resp = JSON.parse(response.responseText);
				// console.log(resp);
				if (resp.success) {
					var now = new Date();
					RESStorage.setItem('RESmodules.RESPro.lastSync',now.getTime());
					if (RESConsole.proSaveButton) RESConsole.proSaveButton.textContent = 'Saved.';
					RESUtils.notification({
						header: 'RES Pro Notification',
						message: 'RES Pro - module options saved to server.'
					});
				} else {
					alert(response.responseText);
				}
			}
		});
	},
	getPrefs: function() {
		console.log('get prefs called');
		if (RESConsole.proGetButton) RESConsole.proGetButton.textContent = 'Loading...';
		GM_xmlhttpRequest({
			method:	"POST",
			url:	'http://reddit.honestbleeps.com/RESsync.php',
			data: 'action=GET&type=all_options',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload:	function(response) {
				var resp = JSON.parse(response.responseText);
				if (resp.success) {
					var modulePrefs = JSON.parse(response.responseText);
					var prefsData = modulePrefs.data;
					//console.log('prefsData:');
					//console.log(prefsData);
					for (var thisModule in prefsData){
						if (thisModule == 'modulePrefs') {
							var thisOptions = prefsData[thisModule];
							RESStorage.setItem('RES.modulePrefs',JSON.stringify(thisOptions));
						} else {
							var thisOptions = prefsData[thisModule];
							RESStorage.setItem('RESoptions.'+thisModule,JSON.stringify(thisOptions));
						}
					}
					if (RESConsole.proGetButton) RESConsole.proGetButton.textContent = 'Preferences Loaded!';
					RESUtils.notification({
						header: 'RES Pro Notification',
						message: 'Module options loaded.'
					});
					// console.log(response.responseText);
				} else {
					alert(response.responseText);
				}
			}
		});
	},
	configure: function() {
		if (!RESConsole.isOpen) RESConsole.open();
		RESConsole.menuClick(document.getElementById('Menu-'+this.category));
		RESConsole.drawConfigOptions('RESPro');
	},
	authenticate: function(callback) {
		if (! this.isEnabled()) {
			return false;
		} else if ((modules['RESPro'].options.username.value == "") || (modules['RESPro'].options.password.value == "")) {
			modules['RESPro'].configure();
		} else if (RESStorage.getItem('RESmodules.RESPro.lastAuthFailed') != 'true') {
			if (typeof(modules['RESPro'].lastAuthFailed) == 'undefined') {
				GM_xmlhttpRequest({
					method:	"POST",
					url:	'http://reddit.honestbleeps.com/RESlogin.php',
					data: 'uname='+modules['RESPro'].options.username.value+'&pwd='+modules['RESPro'].options.password.value,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					onload:	function(response) {
						var resp = JSON.parse(response.responseText);
						if (resp.success) {
							// RESConsole.proAuthButton.textContent = 'Authenticated!';
							RESStorage.removeItem('RESmodules.RESPro.lastAuthFailed');
							if (callback) {
								callback();
							}
						} else {
							// RESConsole.proAuthButton.textContent = 'Authentication failed.';
							modules['RESPro'].lastAuthFailed = true;
							RESStorage.setItem('RESmodules.RESPro.lastAuthFailed','true');
							RESUtils.notification({
								header: 'RES Pro Notification', 
								message: 'Authentication failed - check your username and password.'
							});
						}
					}
				});
			}
		}
	}
}; 
*/
modules['RESTips'] = {
	moduleID: 'RESTips',
	moduleName: 'RES Tips and Tricks',
	category: 'UI',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		dailyTip: {
			type: 'boolean',
			value: true,
			description: 'Show a random tip once every 24 hours.'
		}
	},
	description: 'Adds tips/tricks help to RES console',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// this is where your code goes...
			this.menuItem = createElementWithID('li','RESTipsMenuItem');
			this.menuItem.textContent = 'RES Tips and Tricks';
			this.menuItem.addEventListener('click', function(e) {
				modules['RESTips'].randomTip();
			}, false);
			$('#RESDropdownOptions').append(this.menuItem);
			
			if (this.options.dailyTip.value) {
				this.dailyTip();
			}
			/*
			guiders.createGuider({
			  attachTo: '#RESSettingsButton',
			  // buttons: [{name: "Next"}],
			  description: "Guiders are a user interface design pattern for introducing features of software. This dialog box, for example, is the first in a series of guiders that together make up a guide.",
			  id: "first",
			  // next: "second",
			  overlay: true,
			  xButton: true,
			  title: "Welcome to Guiders.js!"
			}).show();
			*/
			/*
			setTimeout(function() {
				guiders.createGuider({
					  attachTo: "#RESSettingsButton",
					  buttons: [{name: "Close"},
								{name: "Next"}],
					  description: "This is just some sorta test guider, here... woop woop.",
					  id: "first",
					  next: "second",
					  // offset: { left: -200, top: 120 },
					  position: 5,
					  title: "Guiders are typically attached to an element on the page."
				}).show();
				guiders.createGuider({
					  attachTo: "a.toggleImage:first",
					  buttons: [{name: "Close"},
								{name: "Next"}],
					  description: "An example of an image expando",
					  id: "second",
					  next: "third",
					  // offset: { left: -200, top: 120 },
					  position: 3,
					  title: "Guiders are typically attached to an element on the page."
				});
			}, 2000);
			*/
		}
	},
	dailyTip: function() {
		var lastCheck = parseInt(RESStorage.getItem('RESLastToolTip')) || 0;
		var now = new Date();
		// 86400000 = 1 day
		if ((now.getTime() - lastCheck) > 86400000) {
			// mark off that we've displayed a new tooltip
			RESStorage.setItem('RESLastToolTip',now.getTime());
			if (lastCheck == 0) {
				//var thisTip = 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, etc - head over to <a href="http://reddit.com/r/Enhancement">/r/Enhancement</a>.<br>Do you keep seeing this message? <a target=\"_blank\" href=\"http://reddit.honestbleeps.com/faq\">see the FAQ</a> about BetterPrivacy and similar addons.';
				this.showTip(0);
			} else {
				setTimeout(function() {
					modules['RESTips'].randomTip();
				}, 500);
			}
		}
	},
	randomTip: function() {
		this.currTip = Math.floor(Math.random()*this.tips.length);
		this.showTip(this.currTip);
	},
	disableDailyTipsCheckbox: function(e) {
		modules['RESTips'].options.dailyTip.value = e.target.checked;
		RESStorage.setItem('RESoptions.RESTips', JSON.stringify(modules['RESTips'].options));
	},
	nextTip: function() {
		if (typeof(this.currTip) == 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(1);
	},
	prevTip: function() {
		if (typeof(this.currTip) == 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(-1);
	},
	nextPrevTip: function(idx) {
		if (typeof(this.currTip) == 'undefined') this.currTip = 0;
		// if (idx<0) guiders.hideAll();
		guiders.hideAll();
		this.currTip += idx;
		if (this.currTip < 0) {
			this.currTip = this.tips.length-1;
		} else if (this.currTip >= this.tips.length) {
			this.currTip = 0;
		}
		this.showTip(this.currTip);
	},
	tips: Array(
		{
			message: 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, or just help getting a question answered, be sure to subscribe to <a href="http://reddit.com/r/Enhancement">/r/Enhancement</a>.'
		},
		{ 
			message: "Most of RES is configurable. Roll over the gear icon and click the settings console link to check it out.",
			attachTo: "#openRESPrefs",
			position: 5
		},
		{ 
			message: "Click the tag icon next to a user to tag that user with any name you like - you can also color code the tag.",
			attachTo: ".RESUserTagImage:visible",
			position: 3
		},
		{ message: "Don't forget to subscribe to <a href=\"http://reddit.com/r/Enhancement\">/r/Enhancement</a> to keep up to date on the latest versions of RES or suggest features! For bug reports, submit to <a href=\"http://reddit.com/r/RESIssues\">/r/RESIssues</a>" },
		{ message: "Don't want to see posts containing certain keywords? Want to filter out certain subreddits from /r/all? Try the filteReddit module!" },
		{ message: "Keyboard Navigation is one of the most underutilized features in RES. You should try it!  Hit the ? key (shift-/) to see a list of commands." },
		{ message: "Did you know you can configure the appearance of a number of things in RES? For example: Keyboard navigation lets you configure the look of the 'selected' box, and commentBoxes lets you configure the borders / shadows." },
		{ message: "Do you subscribe to a ton of reddits? Give the subreddit tagger a try, it can make your homepage a bit more readable." },
		{ message: "If you haven't tried it yet, Keyboard Navigation is great. Just hit ? while browsing for instructions." },
		{ message: "Roll over a user's name to get information about them such as their karma, and how long they've been a reddit user." },
		{ message: "Hover over the 'parent' link in comments pages to see the text of the parent being referred to." },
		{ message: "You can configure the color and style of the User Highlighter module if you want to change how the highlights look." },
		{ message: "Not a fan of how comments pages look? You can change the appearance in the Style Tweaks module" },
		{ message: "Don't like the style in a certain subreddit? RES gives you a checkbox to disable styles individually - check the right sidebar!" },
		{ message: "Looking for posts by submitter, post with photos, or posts in IAmA form? Try out the comment navigator." },
		{ message: "Have you seen the RES Dashboard? It allows you to do all sorts of great stuff, like keep track of lower traffic subreddits, and manage your user tags and thread subscriptions!" },
		{ message: "Sick of seeing these tips?  They only show up once every 24 hours, but you can disable that in the RES Tips and Tricks preferences." },
		{ message: "Did you know that there is now a 'keep me logged in' option in the Account Switcher? Turn it on if you want to stay logged in to Reddit when using the switcher!" },
		{ message: "See that little [vw] next to users you've voted on?  That's their vote weight - it moves up and down as you vote the same user up / down." }
	),
	tour: [
		// array of guiders will go here... and we will add a "tour" button somewhere to start the tour...
	],
	initTips: function() {
		$('#disableDailyTipsCheckbox').live('click', modules['RESTips'].disableDailyTipsCheckbox);
		for (var i=0, len=this.tips.length; i<len; i++) {
			var thisID = "tip"+i;
			var nextidx = ((parseInt(i+1)) >= len) ? 0 : (parseInt(i+1));
			var nextID = "tip"+nextidx;
			var thisChecked = (modules['RESTips'].options.dailyTip.value) ? 'checked="checked"' : '';
			/*
			if (! this.tips[i].attachTo) {
				return false;
			}
			*/
			guiders.createGuider({
				  attachTo: this.tips[i].attachTo,
				  buttons: [{
								name: "Prev",
								onclick: modules['RESTips'].prevTip
							},
							{
								name: "Next",
								onclick: modules['RESTips'].nextTip
							}],
				  buttonCustomHTML: "<input type=\"checkbox\" id=\"disableDailyTipsCheckbox\" "+thisChecked+" /><label for=\"disableDailyTipsCheckbox\" class=\"stopper\"> Show these tips once every 24 hours</label>",
				  description: this.tips[i].message,
				  id: thisID,
				  next: nextID,
				  position: this.tips[i].position,
				  xButton: true,
				  title: "RES Tips and Tricks"
			});
		}
	
	},
	showTip: function(idx) {
		if (typeof(this.tipsInitialized) == 'undefined') {
			this.initTips();
			this.tipsInitialized = true;
		}
		guiders.show('tip'+idx);
	},
	showGuider: function(guiderID) {
		guiders.show(guiderID);
	}
};


modules['dashboard'] = {
	moduleID: 'dashboard',
	moduleName: 'RES Dashboard',
	category: 'UI',
	options: {
		defaultPosts: {
			type: 'text',
			value: 3,
			description: 'Number of posts to show by default in each widget'
		},
		defaultSort: {
			type: 'enum',
			values: [
				{ name: 'hot', value: 'hot' },
				{ name: 'new', value: 'new' },
				{ name: 'controversial', value: 'controversial' },
				{ name: 'top', value: 'top' }
			],
			value: 'hot',
			description: 'Default sort method for new widgets'
		},
		dashboardShortcut: {
			type: 'boolean',
			value: true,
			description: 'Show +dashboard shortcut in sidebar for easy addition of dashboard widgets.'
		},
		tagsPerPage: {
			type: 'text',
			value: 25,
			description: 'How many user tags to show per page. (enter zero to show all on one page)'
		}
	},
	description: 'The RES Dashboard is home to a number of features including widgets and other useful tools',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.\/]*/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if (this.isEnabled()) {
			this.getLatestWidgets();
			RESUtils.addCSS('.RESDashboardToggle { margin-right: 5px; color: white; background-image: url(/static/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('.RESDashboardToggle.remove { background-image: url(/static/bg-button-remove.png) }');
			if (this.isMatchURL()) {
				$('#RESDropdownOptions').prepend('<li id="DashboardLink"><a href="/r/Dashboard">my dashboard</a></li>');
				if (RESUtils.currentSubreddit()) {
					RESUtils.addCSS('.RESDashboardToggle {}');
					// one more safety check... not sure how people's widgets[] arrays are breaking.
					if (!(this.widgets instanceof Array)) {
						this.widgets = [];
					}
					if (RESUtils.currentSubreddit('dashboard')) {
						$('#noresults, #header-bottom-left .tabmenu:not(".viewimages")').hide();
						$('#header-bottom-left .redditname a:first').text('My Dashboard');
						this.drawDashboard();
					}
					if (this.options.dashboardShortcut.value == true) this.addDashboardShortcuts();
				}
			}
		}
	},
	getLatestWidgets: function() {
		try {
			this.widgets = JSON.parse(RESStorage.getItem('RESmodules.dashboard.' + RESUtils.loggedInUser())) || [];
		} catch (e) {
			this.widgets = [];
		}
	},
	loader: 'data:image/gif;base64,R0lGODlhEAAQAPQAAP///2+NyPb3+7zK5e3w95as1rPD4W+NyKC02oOdz8/Z7Nnh8HqVzMbS6XGOyI2l06m73gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFdyAgAgIJIeWoAkRCCMdBkKtIHIngyMKsErPBYbADpkSCwhDmQCBethRB6Vj4kFCkQPG4IlWDgrNRIwnO4UKBXDufzQvDMaoSDBgFb886MiQadgNABAokfCwzBA8LCg0Egl8jAggGAA1kBIA1BAYzlyILczULC2UhACH5BAkKAAAALAAAAAAQABAAAAV2ICACAmlAZTmOREEIyUEQjLKKxPHADhEvqxlgcGgkGI1DYSVAIAWMx+lwSKkICJ0QsHi9RgKBwnVTiRQQgwF4I4UFDQQEwi6/3YSGWRRmjhEETAJfIgMFCnAKM0KDV4EEEAQLiF18TAYNXDaSe3x6mjidN1s3IQAh+QQJCgAAACwAAAAAEAAQAAAFeCAgAgLZDGU5jgRECEUiCI+yioSDwDJyLKsXoHFQxBSHAoAAFBhqtMJg8DgQBgfrEsJAEAg4YhZIEiwgKtHiMBgtpg3wbUZXGO7kOb1MUKRFMysCChAoggJCIg0GC2aNe4gqQldfL4l/Ag1AXySJgn5LcoE3QXI3IQAh+QQJCgAAACwAAAAAEAAQAAAFdiAgAgLZNGU5joQhCEjxIssqEo8bC9BRjy9Ag7GILQ4QEoE0gBAEBcOpcBA0DoxSK/e8LRIHn+i1cK0IyKdg0VAoljYIg+GgnRrwVS/8IAkICyosBIQpBAMoKy9dImxPhS+GKkFrkX+TigtLlIyKXUF+NjagNiEAIfkECQoAAAAsAAAAABAAEAAABWwgIAICaRhlOY4EIgjH8R7LKhKHGwsMvb4AAy3WODBIBBKCsYA9TjuhDNDKEVSERezQEL0WrhXucRUQGuik7bFlngzqVW9LMl9XWvLdjFaJtDFqZ1cEZUB0dUgvL3dgP4WJZn4jkomWNpSTIyEAIfkECQoAAAAsAAAAABAAEAAABX4gIAICuSxlOY6CIgiD8RrEKgqGOwxwUrMlAoSwIzAGpJpgoSDAGifDY5kopBYDlEpAQBwevxfBtRIUGi8xwWkDNBCIwmC9Vq0aiQQDQuK+VgQPDXV9hCJjBwcFYU5pLwwHXQcMKSmNLQcIAExlbH8JBwttaX0ABAcNbWVbKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICSRBlOY7CIghN8zbEKsKoIjdFzZaEgUBHKChMJtRwcWpAWoWnifm6ESAMhO8lQK0EEAV3rFopIBCEcGwDKAqPh4HUrY4ICHH1dSoTFgcHUiZjBhAJB2AHDykpKAwHAwdzf19KkASIPl9cDgcnDkdtNwiMJCshACH5BAkKAAAALAAAAAAQABAAAAV3ICACAkkQZTmOAiosiyAoxCq+KPxCNVsSMRgBsiClWrLTSWFoIQZHl6pleBh6suxKMIhlvzbAwkBWfFWrBQTxNLq2RG2yhSUkDs2b63AYDAoJXAcFRwADeAkJDX0AQCsEfAQMDAIPBz0rCgcxky0JRWE1AmwpKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICKZzkqJ4nQZxLqZKv4NqNLKK2/Q4Ek4lFXChsg5ypJjs1II3gEDUSRInEGYAw6B6zM4JhrDAtEosVkLUtHA7RHaHAGJQEjsODcEg0FBAFVgkQJQ1pAwcDDw8KcFtSInwJAowCCA6RIwqZAgkPNgVpWndjdyohACH5BAkKAAAALAAAAAAQABAAAAV5ICACAimc5KieLEuUKvm2xAKLqDCfC2GaO9eL0LABWTiBYmA06W6kHgvCqEJiAIJiu3gcvgUsscHUERm+kaCxyxa+zRPk0SgJEgfIvbAdIAQLCAYlCj4DBw0IBQsMCjIqBAcPAooCBg9pKgsJLwUFOhCZKyQDA3YqIQAh+QQJCgAAACwAAAAAEAAQAAAFdSAgAgIpnOSonmxbqiThCrJKEHFbo8JxDDOZYFFb+A41E4H4OhkOipXwBElYITDAckFEOBgMQ3arkMkUBdxIUGZpEb7kaQBRlASPg0FQQHAbEEMGDSVEAA1QBhAED1E0NgwFAooCDWljaQIQCE5qMHcNhCkjIQAh+QQJCgAAACwAAAAAEAAQAAAFeSAgAgIpnOSoLgxxvqgKLEcCC65KEAByKK8cSpA4DAiHQ/DkKhGKh4ZCtCyZGo6F6iYYPAqFgYy02xkSaLEMV34tELyRYNEsCQyHlvWkGCzsPgMCEAY7Cg04Uk48LAsDhRA8MVQPEF0GAgqYYwSRlycNcWskCkApIyEAOwAAAAAAAAAAAA==',
	drawDashboard: function() {
		// this first line hides the "you need RES 4.0+ to view the dashboard" link
		RESUtils.addCSS('.id-t3_qi5iy {display: none;}');
		RESUtils.addCSS('.RESDashboardComponent { position: relative; border: 1px solid #cccccc; border-radius: 3px 3px 3px 3px; overflow: hidden; margin-bottom: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader { box-sizing: border-box; padding: 5px 0px 8px 0px; background-color: #f0f3fc; overflow: hidden; }');
		RESUtils.addCSS('.RESDashboardComponentScrim { position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px; z-index: 5; display: none; }');
		RESUtils.addCSS('.RESDashboardComponentLoader { box-sizing: border-box; position: absolute; background-color: #f2f9ff; border: 1px solid #b9d7f4; border-radius: 3px 3px 3px 3px; width: 314px; height: 40px; left: 50%; top: 50%; margin-left: -167px; margin-top: -20px; text-align: center; padding-top: 11px; }');
		RESUtils.addCSS('.RESDashboardComponentLoader span { position: relative; top: -6px; left: 5px; } ');
		RESUtils.addCSS('.RESDashboardComponentContainer { padding: 10px 15px 0px 15px; min-height: 100px; }');
		RESUtils.addCSS('.RESDashboardComponentContainer.minimized { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath, .addNewWidget, .editWidget { display: inline-block; margin-left: 0px; margin-top: 7px; color: #000000; font-weight: bold; }');
		RESUtils.addCSS('.editWidget { float: left; margin-right: 10px; } ');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath { margin-left: 15px; vertical-align: top; width: 120px; overflow: hidden; text-overflow: ellipsis; }');
		RESUtils.addCSS('#RESDashboardAddComponent, #RESDashboardEditComponent { box-sizing: border-box; padding: 5px 8px 5px 8px; vertical-align: middle; background-color: #cee3f8; border: 1px solid #336699;}');
		RESUtils.addCSS('#RESDashboardEditComponent { display: none; position: absolute; }');
		// RESUtils.addCSS('#RESDashboardComponentScrim, #RESDashboardComponentLoader { background-color: #cccccc; opacity: 0.3; border: 1px solid red; display: none; }');
		RESUtils.addCSS('#addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer { display: none; }');
		RESUtils.addCSS('#addWidgetButtons, #addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer, #editRedditFormContainer { width: auto; min-width: 550px; height: 28px; float: right; text-align: right; }');
		RESUtils.addCSS('#editRedditFormContainer { width: auto; }');
		RESUtils.addCSS('#addUserForm, #addRedditForm { display: inline-block }');
		RESUtils.addCSS('#addUser { width: 200px; height: 24px; }');
		RESUtils.addCSS('#addRedditFormContainer ul.token-input-list-facebook, #editRedditFormContainer ul.token-input-list-facebook { float: left; }');
		RESUtils.addCSS('#addReddit { width: 115px; background-color: #ffffff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('#addRedditDisplayName, #editRedditDisplayName { width: 140px; height: 24px; background-color: #ffffff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('#editReddit { width: 5px; } ');
		RESUtils.addCSS('.addButton, .updateButton { cursor: pointer; display: inline-block; width: auto; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 11px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.cancelButton { width: 50px; text-align: center; cursor: pointer; display: inline-block; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 11px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #D02020; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.backToWidgetTypes { display: inline-block; vertical-align: top; margin-top: 8px; font-weight: bold; color: #000000; cursor: pointer; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul { font-family: Verdana; font-size: 13px; box-sizing: border-box; line-height: 22px; display: inline-block; margin-top: 2px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li { box-sizing: border-box; vertical-align: middle; height: 24px; display: inline-block; cursor: pointer; padding: 0px 6px 0px 6px; border: 1px solid #c7c7c7; background-color: #ffffff; color: #6c6c6c; border-radius: 3px 3px 3px 3px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader .editButton { display: inline-block; padding: 0; width: 24px; -moz-box-sizing: border-box; vertical-align: middle; margin-left: 10px; } ');
		RESUtils.addCSS('.RESDashboardComponent.minimized ul li { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent.minimized li.RESClose, .RESDashboardComponent.minimized li.minimize { display: inline-block; }');
		RESUtils.addCSS('ul.widgetSortButtons li { margin-right: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li.active, .RESDashboardComponentHeader ul li:hover { background-color: #a6ccf1; color: #ffffff; border-color: #699dcf; }');
		RESUtils.addCSS('ul.widgetStateButtons li { margin-right: 5px; }');
		RESUtils.addCSS('ul.widgetStateButtons li:last-child { margin-right: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled { background-color: #dddddd; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled:hover { cursor: auto; background-color: #dddddd; color: #6c6c6c; border: 1px solid #c7c7c7; }');
		RESUtils.addCSS('ul.widgetSortButtons { margin-left: 10px; }');
		RESUtils.addCSS('ul.widgetStateButtons { float: right; margin-right: 8px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.updateTime { cursor: auto; background: none; border: none; color: #afafaf; font-size: 9px; padding-right: 0px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.minimize, ul.widgetStateButtons li.close { font-size: 24px; }');
		RESUtils.addCSS('.minimized ul.widgetStateButtons li.minimize { font-size: 14px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh { margin-left: 3px; width: 24px; position:relative; padding: 0px 0px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh div { height: 16px; width: 16px; position: absolute; left: 4px; top: 4px; background-image: url(\'http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png\'); background-repeat: no-repeat; background-position: -16px -209px; }');
		RESUtils.addCSS('#userTaggerContents .show { display: inline-block; }');
		RESUtils.addCSS('#tagPageControls { display: inline-block; position: relative; top: 9px;}');
		
		var dbLinks = $('span.redditname a');
		if ($(dbLinks).length > 1) {
			$(dbLinks[0]).addClass('active');
		}
		
		// add each subreddit widget...
		// add the "add widget" form...
		this.attachContainer();
		this.attachAddComponent();
		this.attachEditComponent();
		this.initUpdateQueue();
	},
	initUpdateQueue: function() {
		modules['dashboard'].updateQueue = [];
		for (var i in this.widgets) if (this.widgets[i]) this.addWidget(this.widgets[i]);
		setTimeout(function () {
			$('#RESDashboard').dragsort({ 
				dragSelector: "div.RESDashboardComponentHeader",
				dragSelectorExclude: 'a, li, li.refreshAll, li.refresh > div, .editButton',
				dragEnd: modules['dashboard'].saveOrder,
				placeHolderTemplate: "<div class='placeHolder'><div></div></div>"
			});
		}, 300);
	},
	addToUpdateQueue: function(updateFunction) {
		modules['dashboard'].updateQueue.push(updateFunction);
		if (!modules['dashboard'].updateQueueTimer) {
			modules['dashboard'].updateQueueTimer = setInterval(modules['dashboard'].processUpdateQueue, 2000);
			setTimeout(modules['dashboard'].processUpdateQueue, 100);
		}
	},
	processUpdateQueue: function() {
		var thisUpdate = modules['dashboard'].updateQueue.pop();
		thisUpdate();
		if (modules['dashboard'].updateQueue.length < 1) {
			clearInterval(modules['dashboard'].updateQueueTimer);
			delete modules['dashboard'].updateQueueTimer;
		}
	},
	saveOrder: function() {
		var data = $("#siteTable li.RESDashboardComponent").map(function() { return $(this).attr("id"); }).get();
		data.reverse();
		var newOrder = [];
		for (var i=0, len=modules['dashboard'].widgets.length; i<len; i++) {
			var newIndex = data.indexOf(modules['dashboard'].widgets[i].basePath.replace(/(\/|\+)/g, '_'));
			newOrder[newIndex] = modules['dashboard'].widgets[i];
		}
		modules['dashboard'].widgets = newOrder;
		delete newOrder;
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	attachContainer: function() {
		this.siteTable = $('#siteTable.linklisting');
		$(this.siteTable).append('<div id="dashboardContents" class="dashboardPane" />');
		if ((location.hash != '') && (location.hash != '#dashboardContents')) {
			$('span.redditname a').removeClass('active');
			var activeTabID = location.hash.replace('#','#tab-');
			$(activeTabID).addClass('active');
			$('.dashboardPane').hide();
			$(location.hash).show();
		} else {
			$('#userTaggerContents').hide();
		}
		$('span.redditname a:first').click(function(e) {
			e.preventDefault();
			location.hash = 'dashboardContents';
			$('span.redditname a').removeClass('active');
			$(this).addClass('active');
			$('.dashboardPane').hide();
			$('#dashboardContents').show();
		});
	},
	attachEditComponent: function() {
		this.dashboardContents = $('#dashboardContents');
		this.dashboardEditComponent = $('<div id="RESDashboardEditComponent" class="RESDashboardComponent" />');
		$(this.dashboardEditComponent).html(' \
			<div class="editWidget">Edit widget</div> \
			<div id="editRedditFormContainer" class="editRedditForm"> \
				<form id="editRedditForm"><input type="text" id="editReddit"><input type="text" id="editRedditDisplayName" placeholder="display name (e.g. stuff)"><input type="submit" class="updateButton" value="save changes"> <input type="cancel" class="cancelButton" value="cancel"></form> \
			</div> \
		');
		var thisEle = $(this.dashboardEditComponent).find('#editReddit');

		$(this.dashboardEditComponent).find('#editRedditForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = $('#editReddit').val();
				if (thisBasePath != '') {
					if (thisBasePath.indexOf(',') != -1) {
						thisBasePath = thisBasePath.replace(/\,/g,'+');
					}
					modules['dashboard'].widgetBeingEdited.formerBasePath = modules['dashboard'].widgetBeingEdited.basePath;
					modules['dashboard'].widgetBeingEdited.basePath = '/r/'+thisBasePath;
					modules['dashboard'].widgetBeingEdited.displayName = $('#editRedditDisplayName').val();
					modules['dashboard'].widgetBeingEdited.update();
					$('#editReddit').tokenInput('clear');
					$('#RESDashboardEditComponent').fadeOut(function() {
						$('#editReddit').blur();
					});
					modules['dashboard'].widgetBeingEdited.widgetEle.find('.widgetPath').text(modules['dashboard'].widgetBeingEdited.displayName).attr('title','/r/'+thisBasePath);
					modules['dashboard'].updateWidget();
				}
			}
		);
		$(this.dashboardEditComponent).find('.cancelButton').click(
				function(e) {
					$('#editReddit').tokenInput('clear');
					$('#RESDashboardEditComponent').fadeOut(function() {
						$('#editReddit').blur();
					});
				}
		);
		$(document.body).append(this.dashboardEditComponent);
	},
	showEditForm: function() {
		var basePath = modules['dashboard'].widgetBeingEdited.basePath;
		var widgetEle = modules['dashboard'].widgetBeingEdited.widgetEle;
		$('#editRedditDisplayName').val(modules['dashboard'].widgetBeingEdited.displayName);
		var eleTop = $(widgetEle).position().top;
		var eleWidth = $(widgetEle).width();
		$('#RESDashboardEditComponent').css('top',eleTop+'px').css('left','5px').css('width',(eleWidth+2)+'px').fadeIn('fast');
		basePath = basePath.replace(/^\/r\//,'');
		var prepop = [];
		var reddits = basePath.split('+');
		for (var i=0, len=reddits.length; i<len; i++) {
			prepop.push({
				id: reddits[i],
				name: reddits[i]
			});
		}
		if (typeof(modules['dashboard'].firstEdit) == 'undefined') {
			$('#editReddit').tokenInput('/api/search_reddit_names.json?app=res', {
				method: "POST",
				queryParam: "query",
				theme: "facebook",
				allowCustomEntry: true,
				onResult: function(response) {
							var names = response.names;
							var results = [];
							for (var i=0, len=names.length; i<len; i++) {
								results.push({id: names[i], name: names[i]});
							}
							if (names.length == 0) {
								var failedQueryValue = $('#token-input-editReddit').val();
								results.push({id: failedQueryValue, name: failedQueryValue, failedResult: true});
							}
							return results;
						},
				prePopulate: prepop,
				searchingText: 'Searching for matching reddits - may take a few seconds...',
				hintText: 'Type one or more subreddits for which to create a widget.',
				resultsFormatter: function(item) { 
					var thisDesc = item.name;
					if (item['failedResult']) thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
					return "<li>" + thisDesc + "</li>" 
				}
			});
			modules['dashboard'].firstEdit = true;
		} else {
			$('#editReddit').tokenInput('clear');
			for (var i=0, len=prepop.length; i<len; i++) {
				$('#editReddit').tokenInput('add', prepop[i]);
			}
		}
	},
	attachAddComponent: function() {
		this.dashboardContents = $('#dashboardContents');
		this.dashboardAddComponent = $('<div id="RESDashboardAddComponent" class="RESDashboardComponent" />');
		$(this.dashboardAddComponent).html(' \
			<div class="addNewWidget">Add a new widget</div> \
			<div id="addWidgetButtons"> \
				<div class="addButton" id="addMailWidget">+mail widget</div> \
				<div class="addButton" id="addUserWidget">+user widget</div> \
				<div class="addButton" id="addRedditWidget">+subreddit widget</div> \
			</div> \
			<div id="addMailWidgetContainer"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/inbox/">+inbox</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/unread/">+unread</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/messages/">+messages</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/comments/">+comment replies</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/selfreply/">+post replies</div> \
			</div> \
			<div id="addUserFormContainer" class="addUserForm"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<form id="addUserForm"><input type="text" id="addUser"><input type="submit" class="addButton" value="+add"></form> \
			</div> \
			<div id="addRedditFormContainer" class="addRedditForm"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<form id="addRedditForm"><input type="text" id="addReddit"><input type="text" id="addRedditDisplayName" placeholder="display name (e.g. stuff)"><input type="submit" class="addButton" value="+add"></form> \
			</div> \
		');
		$(this.dashboardAddComponent).find('.backToWidgetTypes').click(function(e) {
			$(this).parent().fadeOut(function() {
				$('#addWidgetButtons').fadeIn();
			});
		});
		$(this.dashboardAddComponent).find('.widgetShortcut').click(function(e) {
			var thisBasePath = $(this).attr('widgetPath');
			modules['dashboard'].addWidget({
				basePath: thisBasePath
			}, true);
			$('#addMailWidgetContainer').fadeOut(function() {
				$('#addWidgetButtons').fadeIn();
			});
		});
		$(this.dashboardAddComponent).find('#addRedditWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addRedditFormContainer').fadeIn(function() {
					$('#token-input-addReddit').focus();
				});
			});
		});
		$(this.dashboardAddComponent).find('#addMailWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addMailWidgetContainer').fadeIn();
			});
		});;
		$(this.dashboardAddComponent).find('#addUserWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addUserFormContainer').fadeIn();
			});
		});;
		var thisEle = $(this.dashboardAddComponent).find('#addReddit');
		$(thisEle).tokenInput('/api/search_reddit_names.json?app=res', {
			method: "POST",
			queryParam: "query",
			theme: "facebook",
			allowCustomEntry: true,
			onResult: function(response) {
						var names = response.names;
						var results = [];
						for (var i=0, len=names.length; i<len; i++) {
							results.push({id: names[i], name: names[i]});
						}
						if (names.length == 0) {
							var failedQueryValue = $('#token-input-addReddit').val();
							results.push({id: failedQueryValue, name: failedQueryValue, failedResult: true});
						}
						return results;
					},
			/* prePopulate: prepop, */
			searchingText: 'Searching for matching reddits - may take a few seconds...',
			hintText: 'Type one or more subreddits for which to create a widget.',
			resultsFormatter: function(item) { 
				var thisDesc = item.name;
				if (item['failedResult']) thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
				return "<li>" + thisDesc + "</li>" 
			}
		});
		
		$(this.dashboardAddComponent).find('#addRedditForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = $('#addReddit').val();
				if (thisBasePath != '') {
					if (thisBasePath.indexOf(',') != -1) {
						thisBasePath = thisBasePath.replace(/\,/g,'+');
					}
					var thisDisplayName = ($('#addRedditDisplayName').val()) ? $('#addRedditDisplayName').val() : thisBasePath;
					modules['dashboard'].addWidget({
						basePath: thisBasePath,
						displayName: thisDisplayName
					}, true);
					// $('#addReddit').val('').blur();
					$('#addReddit').tokenInput('clear');
					$('#addRedditFormContainer').fadeOut(function() {
						$('#addReddit').blur();
						$('#addWidgetButtons').fadeIn();
					});
				}
			}
		);
		$(this.dashboardAddComponent).find('#addUserForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = '/user/'+$('#addUser').val();
				modules['dashboard'].addWidget({
					basePath: thisBasePath
				}, true);
				$('#addUser').val('').blur();
				$('#addUserFormContainer').fadeOut(function() {
					$('#addWidgetButtons').fadeIn();
				});
				
			}
		);
		$(this.dashboardContents).append(this.dashboardAddComponent);
		this.dashboardUL = $('<ul id="RESDashboard"></ul>');
		$(this.dashboardContents).append(this.dashboardUL);
	},
	addWidget: function(optionsObject, isNew) {
		if (optionsObject.basePath.slice(0,1) != '/') optionsObject.basePath = '/r/'+optionsObject.basePath;
		var exists=false;
		for (var i=0, len=this.widgets.length; i<len; i++) {
			if (this.widgets[i].basePath == optionsObject.basePath) {
				exists=true;
				break;
			}
		}
		// hide any shortcut button for this widget, since it exists... wait a second, though, or it causes rendering stupidity.
		setTimeout(function() {
			$('.widgetShortcut[widgetPath="'+optionsObject.basePath+'"]').hide();
		}, 1000);
		if (exists && isNew) {
			alert('A widget for '+optionsObject.basePath+' already exists!');
		} else {
			var thisWidget = new this.widgetObject(optionsObject);
			thisWidget.init();
			modules['dashboard'].saveWidget(thisWidget.optionsObject());
		}
	},
	removeWidget: function(optionsObject) {
		this.getLatestWidgets();
		var exists = false;
		for (var i=0, len=modules['dashboard'].widgets.length; i<len; i++) {
			if (modules['dashboard'].widgets[i].basePath == optionsObject.basePath) {
				exists = true;
				$('#'+modules['dashboard'].widgets[i].basePath.replace(/\/|\+/g,'_')).fadeOut('slow', function(ele) {
					$(this).detach();
				});
				modules['dashboard'].widgets.splice(i,1);
				// show any shortcut button for this widget, since we've now deleted it...
				setTimeout(function() {
					$('.widgetShortcut[widgetPath="'+optionsObject.basePath+'"]').show();
				}, 1000);
				break;
			}
		}
		if (!exists) RESUtils.notification('Error, the widget you just tried to remove does not seem to exist.');
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	saveWidget: function(optionsObject, init) {
		this.getLatestWidgets();
		var exists = false;
		for (var i=0, len=modules['dashboard'].widgets.length; i<len; i++) {
			if (modules['dashboard'].widgets[i].basePath == optionsObject.basePath) {
				exists = true;
				modules['dashboard'].widgets[i] = optionsObject;
			}
		}
		if (!exists) modules['dashboard'].widgets.push(optionsObject);
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	updateWidget: function() {
		this.getLatestWidgets();
		var exists = false;
		for (var i=0, len=modules['dashboard'].widgets.length; i<len; i++) {
			if (modules['dashboard'].widgets[i].basePath == modules['dashboard'].widgetBeingEdited.formerBasePath) {
				exists = true;
				delete modules['dashboard'].widgetBeingEdited.formerBasePath;
				modules['dashboard'].widgets[i] = modules['dashboard'].widgetBeingEdited.optionsObject();
			}
		}
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	widgetObject: function(widgetOptions) {
		var thisWidget = this; // keep a reference because the this keyword can mean different things in different scopes...
		thisWidget.basePath = widgetOptions.basePath;
		if ((typeof(widgetOptions.displayName) == 'undefined') || (widgetOptions.displayName == null)) {
			widgetOptions.displayName = thisWidget.basePath;
		}
		thisWidget.displayName = widgetOptions.displayName;
		thisWidget.numPosts = widgetOptions.numPosts || modules['dashboard'].options.defaultPosts.value;
		thisWidget.sortBy = widgetOptions.sortBy || modules['dashboard'].options.defaultSort.value;
		thisWidget.minimized = widgetOptions.minimized || false;
		thisWidget.widgetEle = $('<li class="RESDashboardComponent" id="'+thisWidget.basePath.replace(/\/|\+/g,'_')+'"><div class="RESDashboardComponentScrim"><div class="RESDashboardComponentLoader"><img id="dashboardLoader" src="'+modules['dashboard'].loader+'"><span>querying the server. one moment please.</span></div></div></li>');
		var editButtonHTML = (thisWidget.basePath.indexOf('/r/') == -1) ? '' : '<div class="editButton" title="edit"></div>';
		thisWidget.header = $('<div class="RESDashboardComponentHeader"><a class="widgetPath" title="'+thisWidget.basePath+'" href="'+thisWidget.basePath+'">'+thisWidget.displayName+'</a></div>');
		thisWidget.sortControls = $('<ul class="widgetSortButtons"><li sort="hot">hot</li><li sort="new">new</li><li sort="controversial">controversial</li><li sort="top">top</li></ul>');
		// return an optionsObject, which is what we'll store in the modules['dashboard'].widgets array.
		thisWidget.optionsObject = function() {
			return {
				basePath: thisWidget.basePath,
				displayName: thisWidget.displayName,
				numPosts: thisWidget.numPosts,
				sortBy: thisWidget.sortBy,
				minimized: thisWidget.minimized 
			}
		}
		// set the sort by properly...
		$(thisWidget.sortControls).find('li[sort='+thisWidget.sortBy+']').addClass('active');
		$(thisWidget.sortControls).find('li').click(function(e) {
			thisWidget.sortChange($(e.target).attr('sort'));
		});
		$(thisWidget.header).append(thisWidget.sortControls);
		if ((thisWidget.basePath.indexOf('/r/') != 0) && (thisWidget.basePath.indexOf('/user/') != 0)) {
			setTimeout(function() {
				$(thisWidget.sortControls).hide();
			}, 100);
		}
		thisWidget.stateControls = $('<ul class="widgetStateButtons"><li class="updateTime"></li><li action="refresh" class="refresh"><div action="refresh"></div></li><li action="refreshAll" class="refreshAll">Refresh All</li><li action="addRow">+row</li><li action="subRow">-row</li><li action="edit" class="editButton"></li><li action="minimize" class="minimize">-</li><li action="delete" class="RESClose">&times;</li></ul>');
		$(thisWidget.stateControls).find('li').click(function (e) {
			switch ($(e.target).attr('action')) {
				case 'refresh':
					thisWidget.update();
					break;
				case 'refreshAll':
					$('li[action="refresh"]').click();
					break;
				case 'addRow':
					if (thisWidget.numPosts == 10) break;
					thisWidget.numPosts++;
					if (thisWidget.numPosts == 10) $(thisWidget.stateControls).find('li[action=addRow]').addClass('disabled');
					$(thisWidget.stateControls).find('li[action=subRow]').removeClass('disabled');
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					thisWidget.update();
					break;
				case 'subRow':
					if (thisWidget.numPosts == 0) break;
					thisWidget.numPosts--;
					if (thisWidget.numPosts == 1) $(thisWidget.stateControls).find('li[action=subRow]').addClass('disabled');
					$(thisWidget.stateControls).find('li[action=addRow]').removeClass('disabled');
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					thisWidget.update();
					break;
				case 'minimize':
					$(thisWidget.widgetEle).toggleClass('minimized');
					if ($(thisWidget.widgetEle).hasClass('minimized')) {
						$(e.target).text('+');
						thisWidget.minimized = true;
					} else {
						$(e.target).text('-');
						thisWidget.minimized = false;
						thisWidget.update();
					}
					$(thisWidget.contents).parent().slideToggle();
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					break;
				case 'delete':
					modules['dashboard'].removeWidget(thisWidget.optionsObject());
					break;
			}
		});
		$(thisWidget.header).append(thisWidget.stateControls);
		thisWidget.sortChange = function(sortBy) {
			thisWidget.sortBy = sortBy;
			$(thisWidget.header).find('ul.widgetSortButtons li').removeClass('active');
			$(thisWidget.header).find('ul.widgetSortButtons li[sort='+sortBy+']').addClass('active');
			thisWidget.update();
			modules['dashboard'].saveWidget(thisWidget.optionsObject());
		}
		thisWidget.edit = function(e) {
			modules['dashboard'].widgetBeingEdited = thisWidget;
			modules['dashboard'].showEditForm();
		}
		$(thisWidget.header).find('.editButton').click(thisWidget.edit);
		thisWidget.update = function() {
			if (thisWidget.basePath.match(/\/user\//)) {
				thisWidget.sortPath = (thisWidget.sortBy == 'hot') ? '/' : '?sort='+thisWidget.sortBy;
			} else if (thisWidget.basePath.match(/\/r\//)) {
				thisWidget.sortPath = (thisWidget.sortBy == 'hot') ? '/' : '/'+thisWidget.sortBy+'/';
			} else {
				thisWidget.sortPath = '';
			}
			thisWidget.url = location.protocol + '//' + location.hostname + '/' + thisWidget.basePath + thisWidget.sortPath;
			$(thisWidget.contents).fadeTo('fast',0.25);
			$(thisWidget.scrim).fadeIn();
			$.ajax({
				url: thisWidget.url,
				data: {
					limit: thisWidget.numPosts
				},
				success: thisWidget.populate,
				error: thisWidget.error
			});
		}
		thisWidget.container = $('<div class="RESDashboardComponentContainer"><div class="RESDashboardComponentContents"></div></div>');
		if (thisWidget.minimized) {
			$(thisWidget.container).addClass('minimized');
			$(thisWidget.stateControls).find('li.minimize').addClass('minimized').text('+');
		}
		thisWidget.scrim = $(thisWidget.widgetEle).find('.RESDashboardComponentScrim');
		thisWidget.contents = $(thisWidget.container).find('.RESDashboardComponentContents');
		thisWidget.init = function() {
			if (RESUtils.currentSubreddit('dashboard')) {
				thisWidget.draw();
				if (!thisWidget.minimized) modules['dashboard'].addToUpdateQueue(thisWidget.update);
			}
		}
		thisWidget.draw = function() {
			$(thisWidget.widgetEle).append(thisWidget.header);
			$(thisWidget.widgetEle).append(thisWidget.container);
			if (thisWidget.minimized) $(thisWidget.widgetEle).addClass('minimized');
			modules['dashboard'].dashboardUL.prepend(thisWidget.widgetEle);
			// $(thisWidget.scrim).fadeIn();
		}
		thisWidget.populate = function(response) {
			var widgetContent = $(response).find('#siteTable');
			$(widgetContent).attr('id','siteTable_'+thisWidget.basePath.replace(/\/|\+/g,'_'));
			if (widgetContent.length == 2) widgetContent = widgetContent[1];
			$(widgetContent).attr('url',thisWidget.url+'?limit='+thisWidget.numPosts);
			if ((widgetContent) && ($(widgetContent).html() != '')) {
				// widgetContent will contain HTML from Reddit's page load. No XSS here or you'd already be hit, can't call escapeHTML on this either and wouldn't help anyhow.
				$(thisWidget.contents).html(widgetContent);
				$(thisWidget.contents).fadeTo('fast',1);
				$(thisWidget.scrim).fadeOut(function(e) {
					$(this).hide(); // make sure it is hidden in case the element isn't visible due to being on a different dashboard tab
				})
				$(thisWidget.stateControls).find('.updateTime').text('updated: '+RESUtils.niceDateTime());
			} else {
				if (thisWidget.url.indexOf('/message/') != -1) {
					$(thisWidget.contents).html('<div class="widgetNoMail">No messages were found.</div>');
				} else {
					$(thisWidget.contents).html('<div class="error">There were no results returned for this widget. If you made a typo, simply close the widget to delete it. If reddit is just under heavy load, try clicking refresh in a few moments.</div>');
				}
				$(thisWidget.contents).fadeTo('fast',1);
				$(thisWidget.scrim).fadeOut();
				$(thisWidget.stateControls).find('.updateTime').text('updated: '+RESUtils.niceDateTime());
			}
			// now run watcher functions from other modules on this content...
			RESUtils.watchers.siteTable.forEach(function(callback) {
				if (callback) callback(widgetContent[0]);
			});

		}
		thisWidget.error = function(xhr, err) {
			// alert('There was an error loading data for this widget. Did you type a bad path, perhaps? Removing this widget automatically.');
			// modules['dashboard'].removeWidget(thisWidget.optionsObject());
			if (xhr.status == 404) {
				$(thisWidget.contents).html('<div class="error">This widget received a 404 not found error. You may have made a typo when adding it.</div>');
			} else {
				$(thisWidget.contents).html('<div class="error">There was an error loading data for this widget. Reddit may be under heavy load, or you may have provided an invalid path.</div>');
			}
			$(thisWidget.scrim).fadeOut();
			$(thisWidget.contents).fadeTo('fast',1);
		}
	},
	addDashboardShortcuts: function() {
		var subButtons = document.querySelectorAll('.fancy-toggle-button');
		for (var h=0, len=subButtons.length; h<len; h++) {
			var subButton = subButtons[h];
			if ((RESUtils.currentSubreddit().indexOf('+') == -1) && (RESUtils.currentSubreddit() != 'mod')) {
				var thisSubredditFragment = RESUtils.currentSubreddit();
				var isMulti = false;
			} else if ($(subButton).parent().hasClass('subButtons')) {
				var isMulti = true;
				var thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
			} else {
				var isMulti = true;
				var thisSubredditFragment = $(subButton).next().text();
			}
			if (! ($('#subButtons-'+thisSubredditFragment).length>0)) {
				var subButtonsWrapper = $('<div id="subButtons-'+thisSubredditFragment+'" class="subButtons" style="margin: 0 !important;"></div>');
				$(subButton).wrap(subButtonsWrapper);
				// move this wrapper to the end (after any icons that may exist...)
				if (isMulti) {
					var theWrap = $(subButton).parent();
					$(theWrap).appendTo($(theWrap).parent());
				}
			}
			var dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class','REStoggle RESDashboardToggle');
			dashboardToggle.setAttribute('subreddit',thisSubredditFragment);
			var exists=false;
			for (var i=0, sublen=this.widgets.length; i<sublen; i++) {
				if ((this.widgets[i]) && (this.widgets[i].basePath.toLowerCase() == '/r/'+thisSubredditFragment.toLowerCase())) {
					exists=true;
					break;
				}
			}
			if (exists) {
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title','Remove this subreddit from your dashboard');
				addClass(dashboardToggle,'remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
				dashboardToggle.setAttribute('title','Add this subreddit to your dashboard');
			}
			dashboardToggle.setAttribute('subreddit',thisSubredditFragment)
			dashboardToggle.addEventListener('click', modules['dashboard'].toggleDashboard, false);
			$('#subButtons-'+thisSubredditFragment).append(dashboardToggle);
			var next = $('#subButtons-'+thisSubredditFragment).next();
			if ($(next).hasClass('title') && (! $('#subButtons-'+thisSubredditFragment).hasClass('swapped'))) {
				$('#subButtons-'+thisSubredditFragment).before($(next));
				$('#subButtons-'+thisSubredditFragment).addClass('swapped');
			}
		}
	},
	toggleDashboard: function(e) {
		var thisBasePath = '/r/'+e.target.getAttribute('subreddit');
		if (hasClass(e.target,'remove')) {
			modules['dashboard'].removeWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '+dashboard';
			removeClass(e.target,'remove');
		} else {
			modules['dashboard'].addWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '-dashboard';
			RESUtils.notification({ 
				header: 'Dashboard Notification', 
				message: 'Dashboard widget added for '+thisBasePath+' <p><a class="RESNotificationButtonBlue" href="/r/Dashboard">view the dashboard</a></p><div class="clear"></div>'
			});
			addClass(e.target,'remove');
		}
	},
	addTab: function(tabID, tabName) {
		$('#siteTable.linklisting').append('<div id="'+tabID+'" class="dashboardPane" />');
		$('span.redditname').append('<a id="tab-'+tabID+'" class="dashboardTab" title="'+tabName+'">'+tabName+'</a>');
		$('#tab-'+tabID).click(function(e) {
			location.hash = tabID;
			$('span.redditname a').removeClass('active');
			$(this).addClass('active');
			$('.dashboardPane').hide();
			$('#'+tabID).show();
		});
	}	
}; 

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
			this.subredditInfoToolTipCloseButton.textContent = 'X';
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
			this.addListeners();
			RESUtils.watchForElement('siteTable', modules['subredditInfo'].addListeners);
		}
	},
	addListeners: function(ele) {
		var ele = ele || document.body;
		var subredditLinks = document.body.querySelectorAll('.listing-page a.subreddit');
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
		$(this.subredditInfoToolTipHeader).html('<a href="/r/'+escapeHTML(thisSubreddit)+'">/r/' + escapeHTML(thisSubreddit) + '</a>');
		$(this.subredditInfoToolTipContents).html('<a class="hoverSubreddit" href="/user/'+escapeHTML(thisSubreddit)+'">'+escapeHTML(thisSubreddit)+'</a>:<br><img src="'+RESConsole.loader+'"> loading...');
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
		srHTML += '<div class="subredditLabel">Title:</div> <div class="subredditDetail">' + escapeHTML(jsonData.data.title) + '</div>';
		srHTML += '<div class="subredditLabel">Over 18:</div> <div class="subredditDetail">' + escapeHTML(isOver18) + '</div>';
		// srHTML += '<div class="subredditLabel">Description:</div> <div class="subredditDetail">' + jsonData.data.description + '</div>';
		srHTML += '<div class="clear"></div><div id="subTooltipButtons" class="bottomButtons">';
		srHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		$(this.subredditInfoToolTipContents).html(srHTML);
		// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
		if (modules['subredditManager'].isEnabled()) {
			var theSC = document.createElement('span');
			theSC.setAttribute('style','display: inline-block !important;');
			theSC.setAttribute('class','REStoggle RESshortcut RESshortcutside');
			theSC.setAttribute('subreddit',jsonData.data.display_name.toLowerCase());
			var idx = -1;
			for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
				if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == jsonData.data.display_name.toLowerCase()) {
					idx=i;
					break;
				}
			}
			if (idx != -1) {
				theSC.textContent = '-shortcut';
				theSC.setAttribute('title','Remove this subreddit from your shortcut bar');
				addClass(theSC,'remove');
			} else {
				theSC.textContent = '+shortcut';
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
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title','Remove this subreddit from your dashboard');
				addClass(dashboardToggle,'remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
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
				filterToggle.textContent = '-filter';
				filterToggle.setAttribute('title','Stop filtering from /r/all and /domain/*');
				addClass(filterToggle,'remove');
			} else {
				filterToggle.textContent = '+filter';
				filterToggle.setAttribute('title','Filter this subreddit from /r/all and /domain/*');
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
}; // note: you NEED this semicolon at the end!



/**
 * CommentHidePersistor - stores hidden comments in localStorage and re-hides
 * them on reload of the page.
**/
m_chp = modules['commentHidePersistor'] = {
    moduleID: 'commentHidePersistor',
    moduleName: 'Comment Hide Persistor',
    category: 'Comments',
    description: 'Saves the state of hidden comments across page views.',
    allHiddenThings: {},
    hiddenKeys: [],
    hiddenThings: [],
    hiddenThingsKey: window.location.href,
    maxKeys: 100,
    pruneKeysTo: 50,

    options: {},
    isEnabled: function () {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: new Array(
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
        /https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
    ),
    isMatchURL: function () {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function () {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            m_chp.bindToHideLinks();
            m_chp.hideHiddenThings();
        }
    },
    bindToHideLinks: function () {
        /**
         * For every expand/collapse link, add a click listener that will
         * store or remove the comment ID from our list of hidden comments.
        **/
        $('a.expand').live('click', function () {
            var thing   = $(this).parents('.thing'),
                thingId = thing.data('fullname'),
                collapsing = !$(this).parent().is('.collapsed');

            /* Add our key to pages interacted with, for potential pruning
               later */
            if (m_chp.hiddenKeys.indexOf(m_chp.hiddenThingsKey) == -1) {
                m_chp.hiddenKeys.push(m_chp.hiddenThingsKey);
            }

            if (collapsing) {
                m_chp.addHiddenThing(thingId);
            } else {
                m_chp.removeHiddenThing(thingId);
            }
        });
    },
    loadHiddenThings: function () {
        var hidePersistorJson = RESStorage.getItem('RESmodules.commentHidePersistor.hidePersistor')

        if (hidePersistorJson) {
            try {
                m_chp.hidePersistorData = safeJSON.parse(hidePersistorJson)
                m_chp.allHiddenThings = m_chp.hidePersistorData['hiddenThings']
                m_chp.hiddenKeys = m_chp.hidePersistorData['hiddenKeys']

                /**
                 * Prune allHiddenThings of old content so it doesn't get
                 * huge.
                **/
                if (m_chp.hiddenKeys.length > m_chp.maxKeys) {
                    var pruneStart = m_chp.maxKeys - m_chp.pruneKeysTo,
                        newHiddenThings = {},
                        newHiddenKeys = [];
                    
                    /* Recreate our object as a subset of the original */
                    for (var i=pruneStart; i < m_chp.hiddenKeys.length; i++) {
                        var hiddenKey = m_chp.hiddenKeys[i];
                        newHiddenKeys.push(hiddenKey);
                        newHiddenThings[hiddenKey] = m_chp.allHiddenThings[hiddenKey];
                    }
                    m_chp.allHiddenThings = newHiddenThings;
                    m_chp.hiddenKeys = newHiddenKeys;
                    m_chp.syncHiddenThings();
                }

                if (typeof m_chp.allHiddenThings[m_chp.hiddenThingsKey] !== 'undefined') {
                    m_chp.hiddenThings = m_chp.allHiddenThings[m_chp.hiddenThingsKey];
                    return;
                }
            } catch(e) {}
        }
    },
    addHiddenThing: function (thingId) {
       var i = m_chp.hiddenThings.indexOf(thingId);
       if (i === -1) {
           m_chp.hiddenThings.push(thingId);
       }
       m_chp.syncHiddenThings();
    },
    removeHiddenThing: function (thingId) {
        var i = m_chp.hiddenThings.indexOf(thingId);
        if (i !== -1) {
            m_chp.hiddenThings.splice(i, 1);
        }
        m_chp.syncHiddenThings();
    },
    syncHiddenThings: function () {
        var hidePersistorData;
        m_chp.allHiddenThings[m_chp.hiddenThingsKey] = m_chp.hiddenThings;
        hidePersistorData = {
            'hiddenThings': m_chp.allHiddenThings,
            'hiddenKeys': m_chp.hiddenKeys
        }
        RESStorage.setItem('RESmodules.commentHidePersistor.hidePersistor', JSON.stringify(hidePersistorData));
    },
    hideHiddenThings: function () {
        m_chp.loadHiddenThings();

        for(var i=0, il=m_chp.hiddenThings.length; i < il; i++) {
            var thingId = m_chp.hiddenThings[i],
				// $hideLink = $('div.id-' + thingId + ':first > div.entry div.noncollapsed a.expand');
				// changed how this is grabbed and clicked due to firefox not working properly with it.
				$hideLink = document.querySelector('div.id-' + thingId + ' > div.entry div.noncollapsed a.expand');
            if ($hideLink) {
                /**
                 * Zero-length timeout to defer this action until after the
                 * other modules have finished. For some reason without
                 * deferring the hide was conflicting with the
                 * commentNavToggle width.
                **/
                (function ($hideLink) {
                    window.setTimeout(function () {
                        // $hideLink.click();
                        RESUtils.click($hideLink);
                    }, 0);
                })($hideLink)
            }
        }
    }
}; 


/* END MODULES */

/*
	* Konami-JS ~ 
	* :: Now with support for touch events and multiple instances for 
	* :: those situations that call for multiple easter eggs!
	* Code: http://konami-js.googlecode.com/
	* Examples: http://www.snaptortoise.com/konami-js
	* Copyright (c) 2009 George Mandis (georgemandis.com, snaptortoise.com)
	* Version: 1.3.2 (7/02/2010)
	* Licensed under the GNU General Public License v3
	* http://www.gnu.org/copyleft/gpl.html
	* Tested in: Safari 4+, Google Chrome 4+, Firefox 3+, IE7+ and Mobile Safari 2.2.1
*/
var Konami = function() {
	var konami= {
			addEvent:function ( obj, type, fn, ref_obj )
			{
				if (obj.addEventListener)
					obj.addEventListener( type, fn, false );
				else if (obj.attachEvent)
				{
					// IE
					obj["e"+type+fn] = fn;
					obj[type+fn] = function() { obj["e"+type+fn]( window.event,ref_obj ); }
	
					obj.attachEvent( "on"+type, obj[type+fn] );
				}
			},
	        input:"",
	        prepattern:"38384040373937396665",
			almostThere: false,
	        pattern:"3838404037393739666513",
	        load: function(link) {	
				
				this.addEvent(document,"keydown", function(e,ref_obj) {											
					if (ref_obj) konami = ref_obj; // IE
					konami.input+= e ? e.keyCode : event.keyCode;
					if (konami.input.length > konami.pattern.length) konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
					if (konami.input == konami.pattern) {
						konami.code(link);
						konami.input="";
						return;
                    } else if ((konami.input == konami.prepattern) || (konami.input.substr(2,konami.input.length) == konami.prepattern)) {
						konami.almostThere = true;
						setTimeout(function() {
							konami.almostThere = false;
						}, 2000);
					}
            	},this);
           this.iphone.load(link)
	                
				},
	        code: function(link) { window.location=link},
	        iphone:{
	                start_x:0,
	                start_y:0,
	                stop_x:0,
	                stop_y:0,
	                tap:false,
	                capture:false,
					orig_keys:"",
	                keys:["UP","UP","DOWN","DOWN","LEFT","RIGHT","LEFT","RIGHT","TAP","TAP","TAP"],
	                code: function(link) { konami.code(link);},
	                load: function(link){
									this.orig_keys = this.keys;
	    							konami.addEvent(document,"touchmove",function(e){
	                          if(e.touches.length == 1 && konami.iphone.capture==true){ 
	                            var touch = e.touches[0]; 
	                                konami.iphone.stop_x = touch.pageX;
	                                konami.iphone.stop_y = touch.pageY;
	                                konami.iphone.tap = false; 
	                                konami.iphone.capture=false;
	                                konami.iphone.check_direction();
	                                }
	                                });               
	                        konami.addEvent(document,"touchend",function(evt){
	                                if (konami.iphone.tap==true) konami.iphone.check_direction(link);           
	                                },false);
	                        konami.addEvent(document,"touchstart", function(evt){
	                                konami.iphone.start_x = evt.changedTouches[0].pageX
	                                konami.iphone.start_y = evt.changedTouches[0].pageY
	                                konami.iphone.tap = true
	                                konami.iphone.capture = true
	                                });               
	                                },
	                check_direction: function(link){
	                        x_magnitude = Math.abs(this.start_x-this.stop_x)
	                        y_magnitude = Math.abs(this.start_y-this.stop_y)
	                        x = ((this.start_x-this.stop_x) < 0) ? "RIGHT" : "LEFT";
	                        y = ((this.start_y-this.stop_y) < 0) ? "DOWN" : "UP";
	                        result = (x_magnitude > y_magnitude) ? x : y;
	                        result = (this.tap==true) ? "TAP" : result;                     

	                        if (result==this.keys[0]) this.keys = this.keys.slice(1,this.keys.length)
	                        if (this.keys.length==0) { 
								this.keys=this.orig_keys;
								this.code(link)
							}
					}
	               }
	}
	return konami;
};

function RESPreloadCSS() {
RESUtils.addCSS(' \
#RESConsole { \
	visibility: hidden; \
	color: #000; \
	font-size: 12px; \
	z-index: 1000; \
	position: fixed; \
	margin: auto; \
	top: -1500px; \
	left: 1.5%; \
	width: 95%; \
	height: 85%; \
	overflow: hidden; \
	padding: 10px; \
	box-shadow: 10px 10px 10px #aaa; \
	-moz-box-shadow: 10px 10px 10px #aaa; \
	-webkit-box-shadow: 10px 10px 10px #aaa; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	/* border: 4px solid #CCCCCC; */ \
	background-color: #ffffff; \
	-webkit-transition:top 0.5s ease-in-out; \
	-moz-transition:top 0.5s ease-in-out; \
	-o-transition:top 0.5s ease-in-out; \
	-ms-transition:top 0.5s ease-in-out; \
	-transition:top 0.5s ease-in-out; \
} \
#RESConsole.slideIn { \
	visibility: visible; \
	top: 30px; \
} \
#RESConsole.slideOut { \
	visibility: visible; \
	top: -1500px; \
} \
#modalOverlay { \
	display: none; \
	z-index: 999; \
	position: fixed; \
	top: 0px; \
	left: 0px; \
	width: 100%; \
	height: 100%; \
	background-color: #c9c9c9; \
	opacity: 0; \
	-webkit-transition:opacity 0.4s ease-in-out; \
	-moz-transition:opacity 0.4s ease-in-out; \
	-o-transition:opacity 0.4s ease-in-out; \
	-ms-transition:opacity 0.4s ease-in-out; \
	-transition:opacity 0.4s ease-in-out; \
} \
#modalOverlay.fadeIn { \
	display: block; \
	opacity: 0.9; \
} \
#modalOverlay.fadeOut { \
	display: block; \
	opacity: 0; \
	height: 0; \
} \
#RESSettingsButton { \
	display: inline-block; \
	margin: auto; \
	margin-bottom: -2px; \
	width: 15px; \
	height: 15px; \
	background-image: url(\'http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png\'); \
	background-repeat: no-repeat; \
	background-position: 0px -209px; \
} \
#RESSettingsButton.newNotification, .gearIcon.newNotification { \
	cursor: pointer; \
	background-position: 0px -134px; \
} \
#DashboardLink a { \
	display: block; \
	width: auto; \
	height: auto; \
} \
#RESMainGearOverlay { \
	position: absolute; \
	display: none; \
	width: 27px; \
	height: 24px; \
	border: 1px solid #336699; \
	border-bottom: 1px solid #5f99cf; \
	background-color: #5f99cf; \
	border-radius: 3px 3px 0px 0px; \
	z-index: 10000; \
} \
.gearIcon { \
	position: absolute; \
	top: 3px; \
	left: 6px; \
	width: 15px; \
	height: 15px; \
	background-image: url(\'http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png\'); \
	background-repeat: no-repeat; \
	background-position: 0px -209px; \
} \
#RESPrefsDropdown { \
	display: none; \
	position: absolute; \
	z-index: 10000; \
} \
.RESDropdownList { \
	list-style-type: none; \
	background-color: #5f99cf; \
	width: 180px; \
	border-radius: 0px 0px 3px 3px; \
	border: 1px solid #336699; \
	border-bottom: none; \
	margin-top: -1px; \
} \
.RESDropdownList li { \
	cursor: pointer; \
	border-bottom: 1px solid #336699; \
	height: 35px; \
	line-height: 34px; \
	font-weight: bold; \
	color: #c9def2; \
	padding-left: 10px; \
} \
.RESDropdownList a, .RESDropdownList a:visited { \
	display: inline-block; \
	width: 100%; \
	height: 100%; \
	color: #c9def2; \
} \
.RESDropdownList li:hover, .RESDropdownList li a:hover { \
	background-color: #9cc6ec; \
	color: #336699; \
} \
.editButton { \
	cursor: pointer; \
	width: 24px; \
	height: 22px; \
	background-repeat: no-repeat; \
	background-position: 2px 2px; \
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAY5JREFUeNpi/P//PwM1ABMDlcDAGHTgwAFxigy6d+8e0507d+p+/PixaseOHf1kGfTw4UPON2/edL9//77R0NDQ7unTp2pbtmzZSpJBp0+fFgZSE7W0tIrevXvHcObMGQYFBQWvs2fPftq+fft6ogwCKlY4d+7cPKBhqX///mXQ0NBgAHqP4erVqyDpX/z8/F0EDQJqNj558uRsOTk5v8+fPzOsX7+eAZTeVFVVGV69etXi4uLSYWVldRxZDyN6ggS6xBZoSLuKioo1yJCXL18yPH78mIGdnZ1BVFQ0w8LCYqOxsfELvGF06tQp9pUrV3rp6elZf/jwgeH58+cMwMBl+PTpEyjQq3R0dFZiMwTDRRMmTFADuuLKr1+/WAUEBMAu+fnzJ8ig7MzMzLk2NjY/iUpHgoKCrmlpaawgNsglnJycDGxsbJHR0dEz8BkCAizInG3btglJSUkxaGtrM+zfvx8UsF5LlizZTkyiRfFaenr6/2vXrlXKyMj8/vfv33VgeG0jNvswDt9iBCDAAGGFwZtPlqrJAAAAAElFTkSuQmCC) \
} \
.optionsTable .deleteButton { \
	cursor: pointer; \
	width: 16px; \
	height: 16px; \
	background-image: url(data:image/gif;base64,R0lGODlhEAAQAOZOAP///3F6hcopAJMAAP/M//Hz9OTr8ZqksMTL1P8pAP9MDP9sFP+DIP8zAO7x8/D1/LnEz+vx+Flha+Ln7OLm61hhayk0QCo1QMfR2eDo8b/K1M/U2pqiqcfP15WcpcLK05ymsig0P2lyftnf5naBi8XJzZ6lrJGdqmBqdKissYyZpf/+/puotNzk66ayvtbc4rC7x9Xd5n+KlbG7xpiirnJ+ivDz9KKrtrvH1Ojv9ePq8HF8h2x2gvj9/yYyPmRueFxlb4eRm+71+kFLVdrb3c/X4KOnrYGMl3uGke/0+5Sgq1ZfaY6Xn/X4+f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAE4ALAAAAAAQABAAAAexgE6CggGFAYOIiAEPEREPh4lOhpOUgwEAmJmaABuQAUktMUUYGhAwLiwnKp41REYmHB5MQUcyN0iQTjsAHU05ICM4SjMQJIg8AAgFBgcvE5gUJYgiycsHDisCApjagj/VzAACBATa5AJOKOAHAAMMDOTvA05A6w7tC/kL804V9uIKAipA52QJgA82dNAQRyBBgwYJyjmRgKmHkAztHA4YAJHfEB8hLFxI0W4AACcbnQQCADs=) \
} \
#openRESPrefs { \
	display: inline-block; \
	height: 100%; \
} \
#RESConsoleHeader { \
	width: 100%; \
} \
#RESLogo { \
	margin-right: 5px; \
	float: left; \
} \
.RESDialogTopBar { \
	border-radius: 3px 3px 0px 0px; \
	-moz-border-radius: 3px 3px 0px 0px; \
	-webkit-border-radius: 3px 3px 0px 0px; \
	position: absolute; \
	top: 0px; \
	left: 0px; \
	right: 0px; \
	height: 40px; \
	margin-bottom: 10px; \
	padding-top: 10px; \
	padding-left: 10px; \
	padding-right: 10px; \
	border-bottom: 1px solid #c7c7c7; \
	background-color: #F0F3FC; \
	float: left; \
} \
#RESConsoleTopBar h1 { \
	float: left; \
	margin-top: 6px; \
	padding: 0px; \
	font-size: 14px; \
} \
#RESConsoleSubredditLink { \
	float: right; \
	margin-right: 34px; \
	margin-top: 7px; \
	font-size: 11px; \
} \
#RESKnownBugs, #RESKnownFeatureRequests { \
	list-style-type: disc; \
} \
.RESCloseButton { \
	position: absolute; \
	top: 7px; \
	right: 7px; \
	font: 12px Verdana, sans-serif; \
	background-color: #ffffff; \
	border: 1px solid #d7d9dc; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	color: #9a958e; \
	text-align: center; \
	line-height: 22px; \
	width: 24px; \
	height: 24px; \
	z-index: 1000; \
	cursor: pointer; \
} \
#RESConsoleTopBar .RESCloseButton { \
	top: 9px; \
	right: 9px; \
} \
.RESCloseButton:hover { \
	border: 1px solid #999999; \
	background-color: #dddddd; \
} \
#RESClose { \
	float: right; \
	margin-top: 2px; \
	margin-right: 0px; \
} \
.RESDialogSmall { \
	background-color: #ffffff; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	font-size: 12px; \
	color: #666666; \
	position: relative; \
} \
.RESDialogSmall > h3 { \
	color: #000000; \
	font-size: 14px; \
	margin-top: 6px; \
	margin-bottom: 10px; \
	font-weight: normal; \
	position: absolute; \
	top: -5px; \
	left: 0px; \
	right: 0px; \
	background-color: #f0f3fc; \
	border-bottom: 1px solid #c7c7c7; \
	width: auto; \
	z-index: 10; \
	height: 28px; \
	padding-left: 10px; \
	padding-top: 12px; \
} \
.RESDialogSmall .RESDialogContents, .usertext-edit .RESDialogSmall .md.RESDialogContents { \
	padding: 56px 12px 12px 12px;  \
} \
.usertext-edit .RESDialogSmall .md.RESDialogContents { \
	border: none; \
} \
#RESHelp { \
	background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); \
	background-position: -16px -120px; \
	margin-right: 8px; \
	width: 16px; \
	height: 16px; \
	float: right; \
	cursor: pointer; \
} \
#RESMenu { \
	position: absolute; \
	top: 60px; \
	left: 15px; \
	right: 0px; \
	height: 30px; \
} \
#RESMenu li { \
	float: left; \
	text-align: center; \
	/* min-width: 80px; */ \
	height: 22px; \
	margin-right: 15px; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	padding-top: 6px; \
	padding-bottom: 0px; \
	padding-left: 8px; \
	padding-right: 8px; \
	cursor: pointer; \
	background-color: #dddddd; \
	color: #6c6c6c; \
} \
#RESMenu li.active { \
	border-color: #000000; \
	background-color: #7f7f7f; \
	color: #ffffff; \
} \
#RESMenu li:hover { \
	border-color: #000000; \
} \
#RESConsoleContent { \
	clear: both; \
	padding: 6px; \
	position: absolute; \
	top: 100px; \
	left: 0px; \
	right: 0px; \
	bottom: 0px; \
	border-top: 1px solid #DDDDDD; \
	overflow: auto; \
} \
#RESConfigPanelOptions, #RESAboutDetails { \
	margin-top: 15px; \
	display: block; \
	margin-left: 220px; \
} \
#allOptionsContainer { \
	position: relative; \
} \
#moduleOptionsScrim { \
	display: none; \
	position: absolute; \
	top: 1px; \
	left: 4px; \
	right: 13px; \
	bottom: 1px; \
	border-radius:2px \
	z-index: 1500; \
	background-color: #DDDDDD; \
	opacity: 0.7; \
} \
#moduleOptionsScrim.visible { \
	display: block; \
} \
#RESConfigPanelModulesPane, #RESAboutPane { \
	float: left; \
	width: 195px; \
	padding-right: 15px; \
	border-right: 1px solid #dedede; \
	height: 100%; \
} \
.moduleButton { \
	font-size: 12px; \
	color: #868686; \
	text-align: right; \
	padding-bottom: 3px; \
	padding-top: 3px; \
	margin-bottom: 12px; \
	cursor: pointer; \
	opacity: 0.5; \
} \
.moduleButton.enabled { \
	opacity: 1; \
} \
.moduleButton:hover { \
	text-decoration: underline; \
} \
.moduleButton.active, .moduleButton.active:hover { \
	opacity: 1; \
	font-weight: bold; \
} \
.RESPanel { \
	display: none; \
} \
.clear { \
	clear: both; \
} \
#keyCodeModal { \
	display: none; \
	width: 200px; \
	height: 40px; \
	position: absolute; \
	z-index: 1000; \
	background-color: #FFFFFF; \
	padding: 4px; \
	border: 2px solid #CCCCCC; \
} \
p.moduleListing { \
	padding-left: 5px; \
	padding-right: 5px; \
	padding-top: 5px; \
	padding-bottom: 15px; \
	border: 1px solid #BBBBBB; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
} \
#RESConsoleModulesPanel label { \
	float: left; \
	width: 15%; \
	padding-top: 6px; \
} \
#RESConsoleModulesPanel input[type=checkbox] { \
	float: left; \
	margin-left: 10px; \
} \
#RESConsoleModulesPanel input[type=button] { \
	float: right; \
	padding: 3px; \
	margin-left: 20px; \
	font-size: 12px; \
	border: 1px solid #DDDDDD; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
	background-color: #F0F3FC; \
	margin-bottom: 10px; \
} \
#RESConsoleModulesPanel p { \
	overflow: auto; \
	clear: both; \
	margin-bottom: 10px; \
} \
.moduleDescription { \
	float: left; \
	width: 500px; \
	margin-left: 10px; \
	padding-top: 6px; \
} \
#RESConfigPanelOptions .moduleDescription { \
	margin-left: 0px; \
	margin-top: 10px; \
	padding-top: 0px; \
	clear: both; \
	width: auto; \
} \
.moduleToggle, .toggleButton { \
	float: left; \
	width: 60px; \
	height: 20px; \
	cursor: pointer; \
} \
.moduleHeader { \
	border: 1px solid #c7c7c7; \
	border-radius: 2px 2px 2px 2px; \
	padding: 12px; \
	background-color: #f0f3fc; \
	display: block; \
	margin-bottom: 12px; \
	margin-right: 12px; \
	margin-left: 3px; \
	overflow: auto; \
} \
.moduleName { \
	font-size: 16px; \
	float: left; \
	margin-right: 15px; \
} \
#RESConsole .toggleButton { \
	margin-left: 10px; \
} \
.toggleButton input[type=checkbox] { \
	display: none; \
} \
.moduleToggle span, .toggleButton span { \
	margin-top: -3px; \
	font-size: 11px; \
	padding-top: 3px; \
	width: 28px; \
	height: 17px; \
	float: left; \
	display: inline-block; \
	text-align: center; \
} \
.moduleToggle .toggleOn, .toggleButton .toggleOn { \
	background-color: #dddddd; \
	color: #636363; \
	border-left: 1px solid #636363; \
	border-top: 1px solid #636363; \
	border-bottom: 1px solid #636363; \
	border-radius: 3px 0px 0px 3px; \
} \
.moduleToggle.enabled .toggleOn, .toggleButton.enabled .toggleOn { \
	background-color: #107ac4 ; \
	color: #ffffff; \
} \
.moduleToggle.enabled .toggleOff, .toggleButton.enabled .toggleOff { \
	background-color: #dddddd; \
	color: #636363; \
} \
.moduleToggle .toggleOff, .toggleButton .toggleOff { \
	background-color: #d02020; \
	color: #ffffff; \
	border-right: 1px solid #636363; \
	border-top: 1px solid #636363; \
	border-bottom: 1px solid #636363; \
	border-radius: 0px 3px 3px 0px; \
} \
.optionContainer { \
	position: relative; \
	border: 1px solid #c7c7c7; \
	border-radius: 2px 2px 2px 2px; \
	padding: 12px; \
	background-color: #f0f3fc; \
	display: block; \
	margin-bottom: 12px; \
	margin-right: 12px; \
	margin-left: 3px; \
	overflow: auto; \
} \
.optionContainer table { \
	clear: both; \
	width: 650px; \
	margin-top: 20px; \
} \
.optionContainer label { \
	float: left; \
	width: 175px; \
} \
.optionContainer input[type=text], .optionContainer input[type=password], div.enum { \
	margin-left: 10px; \
	float: left; \
	width: 140px; \
} \
.optionContainer input[type=checkbox] { \
	margin-left: 10px; \
	margin-top: 0px; \
	float: left; \
} \
.optionContainer .optionsTable input[type=text], .optionContainer .optionsTable input[type=password] { \
	margin-left: 0px; \
} \
.optionsTable th, .optionsTable td { \
	padding-bottom: 7px; \
} \
.optionsTable textarea { \
	width: 400px; \
} \
.optionDescription { \
	margin-left: 255px; \
} \
.optionDescription.textInput { \
	margin-left: 340px; \
} \
.optionDescription.table { \
	position: relative; \
	top: auto; \
	left: auto; \
	right: auto; \
	float: left; \
	width: 100%; \
	margin-left: 0px; \
	margin-top: 12px; \
	margin-bottom: 12px; \
} \
#RESConsoleVersion { \
	float: left; \
	font-size: 10px; \
	color: f0f3fc; \
	margin-left: 6px; \
	margin-top: 7px; \
} \
#moduleOptionsSave { \
	display: none; \
	position: fixed; \
	z-index: 1100; \
	top: 98px; \
	right: 4%; \
	cursor: pointer; \
	padding-top: 3px; \
	padding-bottom: 3px; \
	padding-left: 5px; \
	padding-right: 5px; \
	font-size: 12px; \
	color: #ffffff; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #5cc410; \
	margin-bottom: 10px; \
} \
#moduleOptionsSave:hover { \
	background-color: #73e81e; \
} \
.addRowButton { \
	cursor: pointer; \
	padding-top: 2px; \
	padding-bottom: 2px; \
	padding-right: 5px; \
	padding-left: 5px; \
	color: #ffffff; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #107ac4; \
} \
.addRowButton:hover { \
	background-color: #289dee; \
} \
#moduleOptionsSaveBottom { \
	float: right; \
	margin-top: 10px; \
	margin-right: 30px; \
	cursor: pointer; \
	padding: 3px; \
	font-size: 12px; \
	border: 1px solid #DDDDDD; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
	background-color: #F0F3FC; \
	margin-bottom: 10px; \
} \
#moduleOptionsSaveStatus { \
	display: none; \
	position: fixed; \
	top: 98px; \
	right: 160px; \
	width: 180px; \
	padding: 5px; \
	text-align: center; \
	background-color: #FFFACD; \
} \
#moduleOptionsSaveStatusBottom { \
	display: none; \
	float: right; \
	margin-top: 10px; \
	width: 180px; \
	padding: 5px; \
	text-align: center; \
	background-color: #FFFACD; \
} \
#RESConsoleAboutPanel p { \
	margin-bottom: 10px; \
} \
#RESConsoleAboutPanel ul { \
	margin-bottom: 10px; \
	margin-top: 10px; \
} \
#RESConsoleAboutPanel li { \
	list-style-type: disc; \
	margin-left: 15px; \
} \
.aboutPanel { \
	background-color: #f0f3fc; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	padding: 10px; \
} \
.aboutPanel h3 { \
	margin-top: 0px; \
	margin-bottom: 10px; \
} \
#DonateRES { \
	display: block; \
} \
#RESTeam { \
	display: none; \
} \
#AboutRESTeamImage { \
	width: 100%; \
	background-color: #000000; \
	margin-bottom: 12px; \
} \
#AboutRESTeamImage img { \
	display: block; \
	margin: auto; \
} \
#AboutRES { \
	display: none; \
} \
.outdated { \
	float: right; \
	font-size: 11px; \
	margin-right: 15px; \
	margin-top: 5px; \
} \
#RESNotifications { \
	position: fixed; \
	top: 0px; \
	right: 10px; \
	height: auto; \
	width: 360px; \
	background: none; \
} \
.RESNotification { \
	opacity: 0; \
	position: relative; \
	font: 12px/14px Arial, Helvetica, Verdana, sans-serif; \
	z-index: 99999; \
	width: 360px; \
	margin-top: 6px; \
	border: 1px solid #ccccff; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	color: #000000; \
	background-color: #ffffff; \
} \
.RESNotification a { \
	color: orangered; \
} \
.RESNotification a:hover { \
	text-decoration: underline; \
} \
.RESNotification.timerOn { \
	border: 1px solid #c7c7c7; \
} \
.RESNotificationContent { \
	overflow: auto; \
	padding: 10px; \
	color: #999999; \
} \
.RESNotificationContent h2 { \
	color: #000000; \
	margin-bottom: 10px; \
} \
.RESNotificationHeader { \
	padding-left: 10px; \
	padding-right: 10px; \
	background-color: #f0f3fc; \
	border-bottom: #c7c7c7; \
	height: 38px; \
} \
.RESNotificationHeader h3 { \
	padding-top: 12px; \
	font-size: 15px; \
} \
.RESNotificationClose { \
	position: absolute; \
	right: 0px; \
	top: 0px; \
	margin-right: 12px; \
	margin-top: 6px; \
} \
a.RESNotificationButtonBlue { \
	clear: both; \
	float: right; \
	cursor: pointer; \
	margin-top: 12px; \
	padding-top: 3px; \
	padding-bottom: 3px; \
	padding-left: 5px; \
	padding-right: 5px; \
	font-size: 12px; \
	color: #ffffff !important; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #107ac4; \
} \
#baconBit { \
	position: fixed; \
	width: 32px; \
	height: 32px; \
	background-image: url("http://thumbs.reddit.com/t5_2s10b_6.png"); \
	top: -5%; \
	left: -5%; \
	z-index: 999999; \
	-webkit-transform: rotate(0deg); \
	-moz-transform: rotate(0deg); \
	transform: rotate(0deg); \
	-webkit-transition: all 2s linear; \
	-moz-transition: all 2s linear; \
	-o-transition: all 2s linear; \
	-ms-transition: all 2s linear; \
	-transition: all 2s linear; \
} \
#baconBit.makeitrain { \
	top: 100%; \
	left: 100%; \
	-webkit-transform: rotate(2000deg); \
	-moz-transform: rotate(2000deg); \
	transform: rotate(2000deg); \
} \
.RESButton { margin: 5px; padding: 3px; border: 1px solid #999999; width: 120px; cursor: pointer; border-radius: 5px 5px 5px 5px; -moz-border-radius: 5px 5px 5px 5px; -webkit-border-radius: 5px 5px 5px 5px;  } \
.RESButton:hover { background-color: #DDDDDD;  } \
');
}
RESPreloadCSS();

var _beforeLoadComplete = false;
function RESdoBeforeLoad() {
	if (_beforeLoadComplete) return;
	_beforeLoadComplete = true;
	// if (beforeLoadDoneOnce) return;
	// first, go through each module and set all of the options so that if a module needs to check another module's options, they're ready...
	// console.log('get options start: ' + Date());
	for (var thisModuleID in modules) {
		if (typeof(modules[thisModuleID]) == 'object') {
			RESUtils.getOptions(thisModuleID);
		}
	}
	// console.log('get options end: ' + Date());
	for (var thisModuleID in modules) {
		if (typeof(modules[thisModuleID]) == 'object') {
			if (typeof(modules[thisModuleID].beforeLoad) == 'function') modules[thisModuleID].beforeLoad();
		}
	}
	// apply style...
	GM_addStyle(RESUtils.css);
	// clear out css cache...
	RESUtils.css = '';
}

function RESInit() {
	RESUtils.initObservers();
	localStorageFail = false;
	/*
	var backup = {};
	$.extend(backup, RESStorage);
	delete backup.getItem;
	delete backup.setItem;
	delete backup.removeItem;
	console.log(backup);
	*/

	// Check for localStorage functionality...
	try {
		localStorage.setItem('RES.localStorageTest','test');
		// if this is a firefox addon, check for the old lsTest to see if they used to use the Greasemonkey script...
		// if so, present them with a notification explaining that they should download a new script so they can
		// copy their old settings...
		if (typeof(self.on) == 'function') {
			if ((localStorage.getItem('RES.lsTest') == 'test') && (localStorage.getItem('copyComplete') != 'true')) {
				RESUtils.notification('<h2>Important Alert for Greasemonkey Users!</h2>Hey! It looks like you have upgraded to RES 4.0, but used to use the Greasemonkey version of RES. You\'re going to see double until you uninstall the Greasemonkey script. However, you should first copy your settings by clicking the blue button. <b>After installing, refresh this page!</b> <a target="_blank" class="RESNotificationButtonBlue" href="http://redditenhancementsuite.com/gmutil/reddit_enhancement_suite.user.js">GM->FF Import Tool</a>', 15000);
				localStorage.removeItem('RES.lsTest');

				// this is the only "old school" DOMNodeInserted event left... note to readers of this source code:
				// it will ONLY ever be added to the DOM in the specific instance of former OLD RES users from Greasemonkey
				// who haven't yet had the chance to copy their settings to the XPI version of RES.  Once they've completed
				// that, this eventlistener will never be added again, nor will it be added for those who are not in this
				// odd/small subset of people.
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('copyToSimpleStorage') != -1)) {
						GMSVtoFFSS();
					}
				}, true);
			}
		}
	} catch(e) {
		localStorageFail = true;
	}

	addClass(document.body,'res');

	if (localStorageFail) {
		RESFail = "Sorry, but localStorage seems inaccessible. Reddit Enhancement Suite can't work without it. \n\n";
		if (typeof(safari) != 'undefined') {
			RESFail += 'Since you\'re using Safari, it might be that you\'re in private browsing mode, which unfortunately is incompatible with RES until Safari provides a way to allow extensions localStorage access.';
		} else if (typeof(chrome) != 'undefined') {
			RESFail += 'Since you\'re using Chrome, you might just need to go to your extensions settings and check the "Allow in Incognito" box.';
		} else if (typeof(opera) != 'undefined') {
			RESFail += 'Since you\'re using Opera, you might just need to go to your extensions settings and click the gear icon, then click "privacy" and check the box that says "allow interaction with private tabs".';
		} else {
			RESFail += 'Since it looks like you\'re using Firefox, you probably need to go to about:config and ensure that dom.storage.enabled is set to true, and that dom.storage.default_quota is set to a number above zero (i.e. 5120, the normal default)".';
		}
		var userMenu = document.querySelector('#header-bottom-right');
		if (userMenu) {
			var preferencesUL = userMenu.querySelector('UL');
			var separator = document.createElement('span');
			separator.setAttribute('class','separator');
			separator.textContent = '|';
			RESPrefsLink = document.createElement('a');
			RESPrefsLink.setAttribute('href','javascript:void(0)');
			RESPrefsLink.addEventListener('click', function(e) {
				e.preventDefault();
				alert(RESFail);
			}, true);
			RESPrefsLink.textContent = '[RES - ERROR]';
			RESPrefsLink.setAttribute('style','color: red; font-weight: bold;');
			insertAfter(preferencesUL, RESPrefsLink);
			insertAfter(preferencesUL, separator);
		}
	} else {
		document.body.addEventListener('mousemove', RESUtils.setMouseXY, false);
		// added this if statement because some people's Greasemonkey "include" lines are getting borked or ignored, so they're calling RES on non-reddit pages.
		if (location.href.match(/^(http|https):\/\/([\w]+.)?reddit\.com/i)) {
			RESUtils.firstRun();
			RESUtils.checkForUpdate();
			// add the config console link...
			RESConsole.create();
			RESConsole.addConsoleLink();
			RESConsole.addConsoleDropdown();
			RESUtils.checkIfSubmitting();
			// go through each module and run it
			for (var thisModuleID in modules) {
				if (typeof(modules[thisModuleID]) == 'object') {
					  // console.log(thisModuleID + ' start: ' + Date());
					  // perfTest(thisModuleID+' start');
					modules[thisModuleID].go();
					  // perfTest(thisModuleID+' end');
					  // console.log(thisModuleID + ' end: ' + Date());
				}
			}
			GM_addStyle(RESUtils.css);
		//	console.log('end: ' + Date());
		}
		if ((location.href.match(/reddit.honestbleeps.com\/download/)) || (location.href.match(/redditenhancementsuite.com\/download/))) {
			var installLinks = document.body.querySelectorAll('.install');
			for (var i=0, len=installLinks.length;i<len;i++) {
				addClass(installLinks[i], 'update');
				addClass(installLinks[i], 'res4'); // if update but not RES 4, then FF users == greasemonkey...
				removeClass(installLinks[i], 'install');
			}
		}
		konami = new Konami();
		konami.code = function() {
			var baconBit = createElementWithID('div','baconBit');
			document.body.appendChild(baconBit);
			RESUtils.notification({header: 'RES Easter Eggies!', message: 'Mmm, bacon!'});
			setTimeout(function() {
				addClass(baconBit,'makeitrain');
			}, 500);
		}
		konami.load();
	
	}
}

RESStorage = {};
function setUpRESStorage (response) {
	if (typeof(chrome) != 'undefined') {
		RESStorage = response;
		// we'll set up a method for getItem, but it's not adviseable to use since it's asynchronous...
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		// if the fromBG parameter is true, we've been informed by another tab that this item has updated. We should update the data locally, but not send a background request.
		RESStorage.setItem = function(key, value, fromBG) {
			//Protect from excessive disk I/O...
			if (RESStorage[key] != value) {
				// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
				// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
				RESStorage[key] = value;
				var thisJSON =  {
					requestType: 'localStorage',
					operation: 'setItem',
					itemName: key,
					itemValue: value
				};
				if (!fromBG) {
					chrome.extension.sendMessage(thisJSON);
				}
			}
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			var thisJSON =  {
				requestType: 'localStorage',
				operation: 'removeItem',
				itemName: key
			};
			chrome.extension.sendMessage(thisJSON);
		}
		window.localStorage = RESStorage;
		//RESInit();
	} else if (typeof(safari) != 'undefined') {
		RESStorage = response;
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		RESStorage.setItem = function(key, value, fromBG) {
			//Protect from excessive disk I/O...
			if (RESStorage[key] != value) {
				// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
				// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
				RESStorage[key] = value;
				var thisJSON =  {
					requestType: 'localStorage',
					operation: 'setItem',
					itemName: key,
					itemValue: value
				}
				if (!fromBG) {
					safari.self.tab.dispatchMessage("localStorage", thisJSON);
				}
			}
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			var thisJSON =  {
				requestType: 'localStorage',
				operation: 'removeItem',
				itemName: key
			}
			safari.self.tab.dispatchMessage("localStorage", thisJSON);
		}
		window.localStorage = RESStorage;
	} else if (typeof(opera) != 'undefined') {
		RESStorage = response;
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		RESStorage.setItem = function(key, value, fromBG) {
			//Protect from excessive disk I/O...
			if (RESStorage[key] != value) {
				// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
				// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
				RESStorage[key] = value;
				var thisJSON =  {
					requestType: 'localStorage',
					operation: 'setItem',
					itemName: key,
					itemValue: value
				}
				if (!fromBG) {
					opera.extension.postMessage(JSON.stringify(thisJSON));
				} 
			}
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			var thisJSON =  {
				requestType: 'localStorage',
				operation: 'removeItem',
				itemName: key
			}
			opera.extension.postMessage(JSON.stringify(thisJSON));
		}
		window.localStorage = RESStorage;
	} else if (typeof(self.on) != 'undefined') {
		RESStorage = response;
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		RESStorage.setItem = function(key, value, fromBG) {
			// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
			// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
			if (RESStorage[key] != value) {
				RESStorage[key] = value;
				var thisJSON =  {
					requestType: 'localStorage',
					operation: 'setItem',
					itemName: key,
					itemValue: value
				}
				if (!fromBG) {
					self.postMessage(thisJSON);
				} 
			}
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			var thisJSON =  {
				requestType: 'localStorage',
				operation: 'removeItem',
				itemName: key
			}
			self.postMessage(thisJSON);
		}
		window.localStorage = RESStorage;
	} else {
		// must be firefox w/greasemonkey...
		//
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			RESStorage[key] = GM_getValue(key);
			if (typeof(RESStorage[key]) == 'undefined') return null;
			return GM_getValue(key);
		}
		RESStorage.setItem = function(key, value) {
			// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
			// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
			// Wow, GM_setValue doesn't support big integers, so we have to store anything > 2147483647 as a string, so dumb.
			if (typeof(value) != 'undefined') {
				// if ((typeof(value) == 'number') && (value > 2147483647)) {
				if (typeof(value) == 'number') {
					value = value.toString();
				}
			//Protect from excessive disk I/O...
			if (RESStorage[key] != value) {
					RESStorage[key] = value;
					// because we may want to use jQuery events to call GM_setValue and GM_getValue, we must use this ugly setTimeout hack.
					setTimeout(function() {
						GM_setValue(key, value);
					}, 0);
				}
			}
			return true;
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			GM_deleteValue(key);
			return true;
		}
	}
	RESdoBeforeLoad();
}

(function(u) {
	// Don't fire the script on the iframe. This annoyingly fires this whole thing twice. Yuck.
	// Also don't fire it on static.reddit or thumbs.reddit, as those are just images.
	// Also omit blog and code.reddit
	if ((typeof(RESRunOnce) != 'undefined') || (location.href.match(/\/toolbar\/toolbar\?id/i)) || (location.href.match(/comscore-iframe/i)) || (location.href.match(/static\.reddit/i)) || (location.href.match(/thumbs\.reddit/i)) || (location.href.match(/blog\.reddit/i)) || (location.href.match(/code\.reddit/i)) || (location.href.match(/metareddit.com/i))) {
		// do nothing.
		return false;
	}
	RESRunOnce = true;
	if (typeof(chrome) != 'undefined') {
		// we've got chrome, get a copy of the background page's localStorage first, so don't init until after.
		var thisJSON = {
			requestType: 'getLocalStorage'
		};
		chrome.extension.sendMessage(thisJSON, function(response) {
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
			// old schol localStorage from the foreground page to the background page to keep their settings...
			if (typeof(response.importedFromForeground) == 'undefined') {
				// it doesn't exist.. copy it over...
				var thisJSON = {
					requestType: 'saveLocalStorage',
					data: localStorage
				};
				chrome.extension.sendMessage(thisJSON, function(response) {
					setUpRESStorage(response);
				});
			} else {
				setUpRESStorage(response);
			}
		});
	} else if (typeof(safari) != 'undefined') {
		// we've got safari, get localStorage from background process
		thisJSON = {
			requestType: 'getLocalStorage'
		}
		safari.self.tab.dispatchMessage("getLocalStorage", thisJSON);
	} else if (typeof(self.on) != 'undefined') {
		// we've got firefox jetpack, get localStorage from background process
		thisJSON = {
			requestType: 'getLocalStorage'
		}
		self.postMessage(thisJSON);
	} else if (typeof(opera) != 'undefined') {
		// I freaking hate having to use different code that won't run in other browsers to log debugs, so I'm overriding console.log with opera.postError here
		// so I don't have to litter my code with different statements for different browsers when debugging.
		console.log = opera.postError;
		opera.extension.addEventListener( "message", operaMessageHandler, false);	
		window.addEventListener("DOMContentLoaded", function(u) {
			// we've got opera, let's check for old localStorage...
			// RESInit() will be called from operaMessageHandler()
			thisJSON = {
				requestType: 'getLocalStorage'
			}
			opera.extension.postMessage(JSON.stringify(thisJSON));
		}, false);
	} else {
		// Check if GM_getValue('importedFromForeground') has been set.. if not, this is an old user using localStorage;
		(typeof(unsafeWindow) != 'undefined') ? ls = unsafeWindow.localStorage : ls = localStorage;
		if (GM_getValue('importedFromForeground') != 'true') {
			// It doesn't exist, so we need to copy localStorage over to GM_setValue storage...
			for (var i = 0, len=ls.length; i < len; i++){
				var value = ls.getItem(ls.key(i));
				if (typeof(value) != 'undefined') {
					if ((typeof(value) == 'number') && (value > 2147483647)) {
						value = value.toString();
					}
					if (ls.key(i)) {
						GM_setValue(ls.key(i), value);
					}
				}
			}
			GM_setValue('importedFromForeground','true');
		}
		setUpRESStorage();
		//RESInit();
		// console.log(GM_listValues());
	}
})();

function RESInitReadyCheck() {
	if ((typeof(RESStorage.getItem) != 'function') || (document.body == null)) {
		setTimeout(RESInitReadyCheck, 50);
	} else {
		if (typeof(self.on) == 'function') {
			// firefox addon sdk... we've included jQuery... 
			// also, for efficiency, we're going to try using unsafeWindow for "less secure" (but we're not going 2 ways here, so that's OK) but faster DOM node access...
			// console.log('faster?');
			document = unsafeWindow.document;
			window = unsafeWindow;
			if (typeof($) != 'function') {
				console.log('Uh oh, something has gone wrong loading jQuery...');
			}
		} else if ((typeof(unsafeWindow) != 'undefined') && (unsafeWindow.jQuery)) {
			// greasemonkey -- should load jquery automatically because of @require line
			// in this file's header
			if (typeof($) == 'undefined') {
				// greasemonkey-like userscript
				$ = unsafeWindow.jQuery;
				jQuery = $;
			}
		} else if (typeof(window.jQuery) == 'function') {
			// opera...
			$ = window.jQuery;
			jQuery = $;
		} else {
			// chrome and safari...
			if (typeof($) != 'function') {
				console.log('Uh oh, something has gone wrong loading jQuery...');
			}
		}
		if (typeof(opera) != 'undefined') {
			// require.js-like modular injected scripts, code via:
			// http://my.opera.com/BS-Harou/blog/2012/08/08/modular-injcted-scripts-in-extensions
			// Note: This code requires Opera 12.50 to run!
			if (typeof(opera.extension.getFile) == 'function') {
				(function(){var e=opera.extension,t={text:"readAsText",json:"readAsText",dataurl:"readAsDataURL",arraybuffer:"readAsArrayBuffer"};"getFile"in e&&!("getFileData"in e)&&(e.getFileData=function(e,n,r){typeof n=="function"?(r=n,n="text"):(n=n&&n.toLowerCase(),n=n in t?n:"text");if(typeof r!="function")return;var i=opera.extension.getFile(e);if(i){var s=new FileReader;s.onload=function(e){if(n=="json")try{r(JSON.parse(s.result),i)}catch(e){r(null)}else r(s.result,i)},s.onerror=function(e){r(null)},s[t[n]](i)}else setTimeout(r,0,null,i)})})();var global=this,require=function(){function define(e,t){typeof e=="function"||typeof t!="function"?define.compiled=typeof e=="undefined"?null:e:(define._wait=!0,require(e,function(e){var n=[].slice.call(arguments,1),r=e.pop();r.cb(t.apply(global,n))}.bind(global,define._store)))}return define.compiled=null,define._store=null,define._wait=!1,function(){function _compile(){define.compiled=null,define._store=arguments[1]._store;with({})eval(arguments[0]);return define._wait?(define._wait=!1,arguments[1]._store.push({cb:arguments[3],path:arguments[4]}),!1):(processData(define.compiled,arguments[1],arguments[2]),!0)}function processData(e,t,n){t.temp[n]&&delete t.temp[n],t.add(e,n);var r=t.path;if(!(r[n]in require._cache)||e&&require._cache[r[n]]===null)require._cache[r[n]]=e;var i=t.temp[n+1];if(i)if(!i.parsedPath[1]){var s=_compile(i.data,t,n+1,i.cb,i.parsedPath[0]);s||(require._cache[i.path]=null)}else processData(i.data,t,n+1)}function wait(e,t){setTimeout(function(){t.apply(global,e)},0)}function compileCB(e,t,n,r){processData(r,t,n),t.length==t.path.length&&e&&wait(t,e)}function parsePath(e){var t=e.split("!");return!t[1]&&e.indexOf(/\.js$/i)==-1&&(t[0]=e+=".js"),t}return function(e,t){var n=[];n.temp=[],n._store=[],n.add=function(r,i){return this.length==i?(this.push(r),!0):(this.temp[i]={data:r,cb:compileCB.bind(global,t,n,i),parsedPath:parsePath(e[i]),path:e[i]},!1)};if(!e.length)return wait(n,t),null;Array.isArray(e)||(e=[e]),n.path=e;for(var r=0,i=e.length;r<i;r++){if(e[r]==="!domReady"){document.readyState=="complete"||document.readyState=="interactive"?processData(document,n,r):document.addEventListener("DOMContentLoaded",function(r){processData(document,n,r),n.length==e.length&&t&&wait(n,t)}.bind(global,r));continue}var s=parsePath(e[r]);if(!s[0]){processData(null,n,r);continue}if(e[r]in require._cache){processData(require._cache[e[r]],n,r);continue}opera.extension.getFileData((require._base||"")+s[0],s[1]||"text",function(r,i,s){if(s)if(!i[1]){if(n.length!=r){if(n.length>r){debugger;alert("oh shit, this shoud not happen!")}processData(s,n,r);return}var o=_compile(s,n,r,compileCB.bind(global,t,n,r),i[0]);if(!o){require._cache[e[r]]=null;return}}else processData(s,n,r);else processData(null,n,r);n.length==e.length&&t&&wait(n,t)}.bind(global,r,s))}if(n.length==e.length)return t&&wait(n,t),n.length==1?n[0]:n}}()}();require._cache={},require._base="/modules/";

				require(['guiders-1.2.8', 'jquery.dragsort-0.4.3.min', 'jquery.tokeninput', 'jquery-fieldselection.min', 'tinycon.min', 'snuownd', 'test'], function() {
					Tinycon = window.Tinycon;
					SnuOwnd = window.SnuOwnd;
					RESInit();
				});
			} else {
				RESInit();
			}
		} else {
			$(document).ready(RESInit);
		}
		// RESInit();

		// add in Reddit's $.request plugin, used to support flair and such.
		// via: https://github.com/reddit/reddit/blob/master/r2/r2/public/static/js/jquery.reddit.js
		/* The reddit extension for jquery.  This file is intended to store
		 * "utils" type function declarations and to add functionality to "$"
		 * or "jquery" lookups. See 
		 *   http://docs.jquery.com/Plugins/Authoring 
		 * for the plug-in spec.
		*/

		(function($) {

		/* utility functions */

		$.log = function(message) {
		    if (window.console) {
		        if (window.console.debug)
		            window.console.debug(message);
		        else if (window.console.log)
		            window.console.log(message);
		    }
		    else
		        alert(message);
		};

		$.debug = function(message) {
		    if ($.with_default(reddit.debug, false)) {
		        return $.log(message);
		    }
		}
		$.fn.debug = function() { 
		    $.debug($(this));
		    return $(this);
		}

		$.redirect = function(dest) {
		    window.location = dest;
		};

		$.fn.redirect = function(dest) {
		    /* for forms which are "posting" by ajax leading to a redirect */
		    $(this).filter("form").find(".status").show().html("redirecting...");
		    var target = $(this).attr('target');
		    if(target == "_top") {
		      var w = window;
		      while(w != w.parent) {
		        w = w.parent;
		      }
		      w.location = dest;
		    } else {
		      $.redirect(dest);
		    }
		    /* this should never happen, but for the sake of internal consistency */
		    return $(this)
		}

		$.refresh = function() {
		    window.location.reload(true);
		};

		$.defined = function(value) {
		    return (typeof(value) != "undefined");
		};

		$.with_default = function(value, alt) {
		    return $.defined(value) ? value : alt;
		};

		$.websafe = function(text) {
		    if(typeof(text) == "string") {
		        text = text.replace(/&/g, "&amp;")
		            .replace(/"/g, '&quot;') /* " */
		            .replace(/>/g, "&gt;").replace(/</g, "&lt;")
		    }
		    return (text || "");
		};

		$.unsafe = function(text) {
		    /* inverts websafe filtering of reddit app. */
		    if(typeof(text) == "string") {
		        text = text.replace(/&quot;/g, '"')
		            .replace(/&gt;/g, ">").replace(/&lt;/g, "<")
		            .replace(/&amp;/g, "&");
		    }
		    return (text || "");
		};

		$.uniq = function(list, max) {
		    /* $.unique only works on arrays of DOM elements */
		    var ret = [];
		    var seen = {};
		    var num = max ? max : list.length;
		    for(var i = 0; i < list.length && ret.length < num; i++) {
		        if(!seen[list[i]]) {
		            seen[list[i]] = true;
		            ret.push(list[i]);
		        }
		    }
		    return ret;
		};

		/* upgrade show and hide to trigger onshow/onhide events when fired. */
		(function(show, hide) {
		    $.fn.show = function(speed, callback) {
		        $(this).trigger("onshow");
		        return show.call(this, speed, callback);
		    }
		    $.fn.hide = function(speed, callback) {
		        $(this).trigger("onhide");
		        return hide.call(this, speed, callback);
		    }
		})($.fn.show, $.fn.hide);

		/* customized requests (formerly redditRequest) */

		var _ajax_locks = {};
		function acquire_ajax_lock(op) {
		    if(_ajax_locks[op]) {
		        return false;
		    }
		    _ajax_locks[op] = true;
		    return true;
		};

		function release_ajax_lock(op) {
		    delete _ajax_locks[op];
		};

		function handleResponse(action) {
		    return function(r) {
		        if(r.jquery) {
		            var objs = {};
		            objs[0] = jQuery;
		            $.map(r.jquery, function(q) {
		                    var old_i = q[0], new_i = q[1], op = q[2], args = q[3];
		                    if (typeof(args) == "string") {
		                      args = $.unsafe(args);
		                    } else { // assume array
		                      for(var i = 0; args.length && i < args.length; i++)
		                        args[i] = $.unsafe(args[i]);
		                    }
		                    if (op == "call") 
		                        objs[new_i] = objs[old_i].apply(objs[old_i]._obj, args);
		                    else if (op == "attr") {
		                        objs[new_i] = objs[old_i][args];
		                        if(objs[new_i])
		                            objs[new_i]._obj = objs[old_i];
		                        else {
		                            $.debug("unrecognized");
		                        }
		                    } else if (op == "refresh") {
		                        $.refresh();
		                    } else {
		                        $.debug("unrecognized");
		                    }
		                });
		        }
		    };
		};
		$.handleResponse = handleResponse;

		var api_loc = '/api/';
		$.request = function(op, parameters, worker_in, block, type, 
		                     get_only, errorhandler) {
		    /* 
		       Uniquitous reddit AJAX poster.  Automatically addes
		       handleResponse(action) worker to deal with the API result.  The
		       current subreddit (reddit.post_site), the user's modhash
		       (reddit.modhash) and whether or not we are in a frame
		       (reddit.cnameframe) are also automatically sent across.
		     */
		    var action = op;
		    var worker = worker_in;

		    if (rate_limit(op)) {
		        if (errorhandler) {
		            errorhandler('ratelimit')
		        }
		        return
		    }

		    if (window != window.top && !reddit.cnameframe && !reddit.external_frame) {
		        return
		    }

		    /* we have a lock if we are not blocking or if we have gotten a lock */
		    var have_lock = !$.with_default(block, false) || acquire_ajax_lock(action);

		    parameters = $.with_default(parameters, {});
		    worker_in  = $.with_default(worker_in, handleResponse(action));
		    type  = $.with_default(type, "json");
		    if (typeof(worker_in) != 'function')
		        worker_in  = handleResponse(action);
		    var worker = function(r) {
		        release_ajax_lock(action);
		        return worker_in(r);
		    };
		    /* do the same for the error handler, and make sure to release the lock*/
		    errorhandler_in = $.with_default(errorhandler, function() { });
		    errorhandler = function(r) {
		        release_ajax_lock(action);
		        return errorhandler_in(r);
		    };



		    get_only = $.with_default(get_only, false);

		    /* set the subreddit name if there is one */
		    if (reddit.post_site) 
		        parameters.r = reddit.post_site;

		    /* flag whether or not we are on a cname */
		    if (reddit.cnameframe) 
		        parameters.cnameframe = 1;

		    /* add the modhash if the user is logged in */
		    if (reddit.logged) 
		        parameters.uh = reddit.modhash;

		    parameters.renderstyle = reddit.renderstyle;

		    if(have_lock) {
		        op = api_loc + op;
		        /*if( document.location.host == reddit.ajax_domain ) 
		            /* normal AJAX post */

		        $.ajax({ type: (get_only) ? "GET" : "POST",
		                    url: op, 
		                    data: parameters, 
		                    success: worker,
		                    error: errorhandler,
		                    dataType: type});
		        /*else { /* cross domain it is... * /
		            op = "http://" + reddit.ajax_domain + op + "?callback=?";
		            $.getJSON(op, parameters, worker);
		            } */
		    }
		};

		var up_cls = "up";
		var upmod_cls = "upmod";
		var down_cls = "down";
		var downmod_cls = "downmod";

		rate_limit = (function() {
		    var default_rate_limit = 333,  // default rate-limit duration (in ms)
		        rate_limits = {  // rate limit per-action (in ms, 0 = don't rate limit)
		            "vote": 333,
		            "comment": 5000,
		            "ignore": 0,
		            "ban": 0,
		            "unban": 0,
		            "assignad": 0
		        },
		        last_dates = {}

		    // paranoia: copy global functions used to avoid tampering.
		    var _Date = Date

		    return function rate_limit(action) {
		        var now = new _Date(),
		            allowed_interval = action in rate_limits ?
		                               rate_limits[action] : default_rate_limit,
		            last_date = last_dates[action],
		            rate_limited = last_date && (now - last_date) < allowed_interval

		        last_dates[action] = now
		        return rate_limited
		    };
		})()


		$.fn.vote = function(vh, callback, event, ui_only) {
		    /* for vote to work, $(this) should be the clicked arrow */
		    if (reddit.logged && $(this).hasClass("arrow")) {
		        var dir = ( $(this).hasClass(up_cls) ? 1 :
		                    ( $(this).hasClass(down_cls) ? -1 : 0) );
		        var things = $(this).all_things_by_id();
		        /* find all arrows of things on the page */
		        var arrows = things.children().not(".child").find('.arrow');

		        /* set the new arrow states */
		        var u_before = (dir == 1) ? up_cls : upmod_cls;
		        var u_after  = (dir == 1) ? upmod_cls : up_cls;
		        arrows.filter("."+u_before).removeClass(u_before).addClass(u_after);

		        var d_before = (dir == -1) ? down_cls : downmod_cls;
		        var d_after  = (dir == -1) ? downmod_cls : down_cls;
		        arrows.filter("."+d_before).removeClass(d_before).addClass(d_after);

		        /* let the user vote only if they are logged in */
		        if(reddit.logged) {
		            things.each(function() {
		                    var entry =  $(this).find(".entry:first, .midcol:first");
		                    if(dir > 0)
		                        entry.addClass('likes')
		                            .removeClass('dislikes unvoted');
		                    else if(dir < 0)
		                        entry.addClass('dislikes')
		                            .removeClass('likes unvoted');
		                    else
		                        entry.addClass('unvoted')
		                            .removeClass('likes dislikes');
		                });
		            if(!$.defined(ui_only)) {
		                var thing_id = things.filter(":first").thing_id();
		                /* IE6 hack */
		                vh += event ? "" : ("-" + thing_id); 
		                $.request("vote", {id: thing_id, dir : dir, vh : vh});
		            }
		        }
		        /* execute any callbacks passed in.  */
		        if(callback) 
		            callback(things, dir);
		    }
		};

		$.fn.show_unvotable_message = function() {
		  $(this).thing().find(".entry:first .unvotable-message").css("display", "inline-block");
		};

		$.fn.thing = function() {
		    /* Returns the first thing that is a parent of the current element */
		    return this.parents(".thing:first");
		};

		$.fn.all_things_by_id = function() {
		    /* Returns the set of things that have the same ID as the current
		     * element's thing (we make no guarantee about uniqueness of
		     * things across multiple listings on the same page) */
		    return this.thing().add( $.things(this.thing_id()) );
		};

		$.fn.thing_id = function(class_filter) {
		    class_filter = $.with_default(class_filter, "thing");
		    /* Returns the (reddit) ID of the current element's thing */
		    var t = (this.hasClass("thing")) ? this : this.thing();
		    if(class_filter != "thing") {
		        t = t.find("." + class_filter + ":first");
		    }
		    if(t.length) {
		        var id = $.grep(t.get(0).className.match(/\S+/g),
		                        function(i) { return i.match(/^id-/); }); 
		        return (id.length) ? id[0].slice(3, id[0].length) : "";
		    }
		    return "";
		};

		$.things = function() {
		    /* 
		     * accepts a list of thing_ids as the first argument and returns a
		     * jquery object consisting of the union of all things on the page
		     * that represent those things.
		     */
		    var sel = $.map(arguments, function(x) { return ".thing.id-" + x; })
		       .join(", ");
		    return $(sel);
		};

		$.fn.same_author = function() {
		    var aid = $(this).thing_id("author");
		    var ids = [];
		    $(".author.id-" + aid).each(function() {
		            ids.push(".thing.id-" + $(this).thing_id());
		        });
		    return $(ids.join(", "));
		};

		$.fn.things = function() {
		    /* 
		     * try to find all things that occur below a given selector, like:
		     * $('.organic-listing').things('t3_12345')
		     */
		    var sel = $.map(arguments, function(x) { return ".thing.id-" + x; })
		       .join(", ");
		    return this.find(sel);
		};

		$.listing = function(name) {
		    /* 
		     * Given an element name (a sitetable ID or a thing ID, with
		     * optional siteTable_ at the front), return or generate a listing
		     * with the proper id for that name. 
		     *
		     * In the case of a thing ID, this siteTable will be the listing
		     * in the child div of that thing's container.
		     * 
		     * In the case of a general ID, it will be the listing of that
		     * name already present in the DOM.
		     *
		     * On failure, will return a JQuery object of zero length.
		     */
		    name = name || "";
		    var sitetable = "siteTable";
		    /* we'll add the hash specifier in later */
		    if (name.slice(0, 1) == "#" || name.slice(0, 1) == ".")
		        name = name.slice(1, name.length);

		    /* lname should be the name of the actual listing (will always
		     * start with sitetable) while name should be the element it is
		     * named for (strip off sitetable if present) */
		    var lname = name;
		    if(name.slice(0, sitetable.length) != sitetable) 
		        lname = sitetable + ( (name) ? ("_" + name): "");
		    else 
		        name = name.slice(sitetable.length + 1, name.length);

		    var listing = $("#" + lname).filter(":first");
		    /* did the $ lookup match anything? */
		    if (listing.length == 0) {
		        listing = $.things(name).find(".child")
		            .append(document.createElement('div'))
		            .children(":last")
		            .addClass("sitetable")
		            .attr("id", lname);
		    }
		    return listing;
		};


		var thing_init_func = function() { };
		$.fn.set_thing_init = function(func) {
		    thing_init_func = func;
		    $(this).find(".thing:not(.stub)").each(function() { func(this) });
		};


		$.fn.new_thing_child = function(what, use_listing) {
		    var id = this.thing_id();
		    var where = (use_listing) ? $.listing(id) :
		        this.thing().find(".child:first");
		    
		    var new_form;
		    if (typeof(what) == "string") 
		        new_form = where.prepend(what).children(":first");
		    else 
		        new_form = what.hide()
		            .prependTo(where)
		            .show()
		            .find('input[name="parent"]').val(id).end();
		    
		    return (new_form).randomize_ids();
		};

		$.fn.randomize_ids = function() {
		    var new_id = (Math.random() + "").split('.')[1]
		    $(this).find("*[id]").each(function() {
		            $(this).attr('id', $(this).attr("id") + new_id);
		        }).end()
		    .find("label").each(function() {
		            $(this).attr('for', $(this).attr("for") + new_id);
		        });
		    return $(this);
		}

		$.fn.replace_things = function(things, keep_children, reveal, stubs) {
		    /* Given the api-html structured things, insert them into the DOM
		     * in such a way as to remove any elements with the same thing_id.
		     * "keep_children" is a boolean to determine whether or not any
		     * existing child divs should be retained on the new thing (in the
		     * case of a comment tree, flags whether or not the new thing has
		     * the thread present) while "reveal" determines whether or not to
		     * animate the transition from old to new. */
		    var self = this;
		    return $.map(things, function(thing) {
		            var data = thing.data;
		            var existing = $(self).things(data.id);
		            if(stubs) 
		                existing = existing.filter(".stub");
		            if(existing.length == 0) {
		                var parent = $.things(data.parent);
		                if (parent.length) {
		                    existing = $("<div></div>");
		                    parent.find(".child:first").append(existing);
		                }
		            }
		            existing.after($.unsafe(data.content));
		            var new_thing = existing.next();
		            if(keep_children) {
		                /* show the new thing */
		                new_thing.show()
		                    /* but hide its new content */
		                    .children(".midcol, .entry").hide().end()
		                    .children(".child:first")
		                    /* slop over the children */ 
		                    .html(existing.children(".child:first")
		                          .remove().html())
		                    .end();
		                /* hide the old entry and show the new one */
		                if(reveal) {
		                    existing.hide();
		                    new_thing.children(".midcol, .entry").show();
		                }
		                new_thing.find(".rank:first")
		                    .html(existing.find(".rank:first").html());
		            }

		            /* hide and remove old. add in new */
		            if(reveal) {
		                existing.hide();
		                if(keep_children) 
		                    new_thing.children(".midcol, .entry")
		                        .show();
		                else 
		                    new_thing.show();
		                existing.remove();
		            }
		            else { 
		                new_thing.hide();
		                existing.remove();
		             }

		            /* lastly, set the event handlers for these new things */
		            thing_init_func(new_thing);
		            return new_thing;
		        });
		    
		};


		$.insert_things = function(things, append) {
		    /* Insert new things into a listing.*/
		    return $.map(things, function(thing) {
		            var data = thing.data;
		            var s = $.listing(data.parent);
		            if(append)
		                s = s.append($.unsafe(data.content)).children(".thing:last");
		            else
		                s = s.prepend($.unsafe(data.content)).children(".thing:first");
		            thing_init_func(s.hide().show());
		            return s;
		        });
		};

		$.fn.delete_table_row = function(callback) {
		    var tr = this.parents("tr:first").get(0);
		    var table = this.parents("table").get(0);
		    if(tr) {
		        $(tr).fadeOut(function() {
		                table.deleteRow(tr.rowIndex);
		                if(callback) {
		                    callback();
		                }
		            });
		    } else if (callback) {
		        callback();
		    }
		};

		$.fn.insert_table_rows = function(rows, index) {
		    /* find the subset of the current selection that is a table, or
		     * the first parent of the current selection that is a table.*/
		    var tables = ((this.is("table")) ? this.filter("table") : 
		                  this.parents("table:first"));
		    
		    $.map(tables.get(), 
		          function(table) {
		              $.map(rows, function(thing) {
		                      var i = index;
		                      if(i < 0) 
		                          i = Math.max(table.rows.length + i + 1, 0);
		                      i = Math.min(i, table.rows.length);
		                      /* create a new row and set its id and class*/
		                      var row = table.insertRow(i);
		                      $(row).hide().attr("id", thing.id)
		                          .addClass(thing.css_class);
		                      /* insert cells */
		                      $.map(thing.cells, function(cell) {
		                              $(row.insertCell(row.cells.length))
		                                  .html($.unsafe(cell));
		                          });
		                      /* reveal! */
		                      $(row).fadeIn();
		                  });
		          });
		    return this;
		};


		$.fn.captcha = function(iden) {
		    /*  */
		    var c = this.find(".capimage");
		    if(iden) {
		        c.attr("src", "/captcha/" + iden + ".png")
		            .parents("form").find('input[name="iden"]').val(iden);
		    }
		    return c;
		};
		   

		/* Textarea handlers */
		$.fn.insertAtCursor = function(value) {
		    /* "this" refers to current jquery selection and may contain many
		     * non-textarea elements, so filter out and apply to each */
		    return $(this).filter("textarea").each(function() {
		            /* this should be rebound to one of the elements in the orig list.*/
		            var textbox = $(this).get(0);
		            var orig_pos = textbox.scrollTop;
		        
		            if (document.selection) { /* IE */
		                textbox.focus();
		                var sel = document.selection.createRange();
		                sel.text = value;
		            }
		            else if (textbox.selectionStart) {
		                var prev_start = textbox.selectionStart;
		                textbox.value = 
		                    textbox.value.substring(0, textbox.selectionStart) + 
		                    value + 
		                    textbox.value.substring(textbox.selectionEnd, 
		                                            textbox.value.length);
		                prev_start += value.length;
		                textbox.setSelectionRange(prev_start, prev_start);
		            } else {
		                textbox.value += value;
		            }
		        
		            if(textbox.scrollHeight) {
		                textbox.scrollTop = orig_pos;
		            }
		        
		            $(this).focus();
		        })
		    .end();
		};

		$.fn.select_line = function(lineNo) {
		    return $(this).filter("textarea").each(function() {
		            var newline = '\n', newline_length = 1, caret_pos = 0;
		            if ( $.browser.msie ) { /* IE hack */
		                newline = '\r';
		                newline_length = 0;
		                caret_pos = 1;
		            }
		            
		            var lines = $(this).val().split(newline);
		            
		            for(var x=0; x<lineNo-1; x++) 
		                caret_pos += lines[x].length + newline_length;

		            var end_pos = caret_pos;
		            if (lineNo <= lines.length) 
		                end_pos += lines[lineNo-1].length + newline_length;
		            
		            $(this).focus();
		            if(this.createTextRange) {   /* IE */
		                var start = this.createTextRange();
		                start.move('character', caret_pos);
		                var end = this.createTextRange();
		                end.move('character', end_pos);
		                start.setEndPoint("StartToEnd", end);
		                start.select();
		            } else if (this.selectionStart) {
		                this.setSelectionRange(caret_pos, end_pos);
		            }
		            if(this.scrollHeight) {
		                var avgLineHight = this.scrollHeight / lines.length;
		                this.scrollTop = (lineNo-2) * avgLineHight;
		            }
		        });
		};


		$.apply_stylesheet = function(cssText) {
		    
		    var sheet_title = $("head").children("link[title], style[title]")
		        .filter(":first").attr("title") || "preferred stylesheet";

		    if(document.styleSheets[0].cssText) {
		        /* of course IE has to do this differently from everyone else. */
		        var sheets = document.styleSheets;
		        for(var x=0; x < sheets.length; x++) 
		            if(sheets[x].title == sheet_title) {
		                sheets[x].cssText = cssText;
		                break;
		            }
		    } else {
		        /* for everyone else, we walk <head> for the <link> or <style>
		         * that has the old stylesheet, and delete it. Then we add a
		         * <style> with the new one */
		        $("head").children('*[title="' + sheet_title + '"]').remove();
		        var stylesheet = $('<style type="text/css" media="screen"></style>')
		            .attr('title', sheet_title)
		            .text(cssText)
		            .appendTo('head')
		  }
		    
		};

		$.rehighlight_new_comments = function() {
		  checked = $(".comment-visits-box input:checked");
		  if (checked.length > 0) {
		    var v = checked[0].value;
		    highlight_new_comments(v);
		  }
		}

		/* namespace globals for cookies -- default prefix and domain */
		var default_cookie_domain
		$.default_cookie_domain = function(domain) {
		    if (domain) {
		        default_cookie_domain = domain
		    }
		}

		var cookie_name_prefix = "_"
		$.cookie_name_prefix = function(name) {
		    if (name) {
		        cookie_name_prefix = name + "_"
		    }
		}

		/* old reddit-specific cookie functions */
		$.cookie_write = function(c) {
		    if (c.name) {
		        var options = {}
		        options.expires = c.expires
		        options.domain = c.domain || default_cookie_domain
		        options.path = c.path || '/'

		        var key = cookie_name_prefix + c.name,
		            value = c.data

		        if (value === null || value == '') {
		            value = null
		        } else if (typeof(value) != 'string') {
		            value = JSON.stringify(value)
		        }

		        $.cookie(key, value, options)
		    }
		}

		$.cookie_read = function(name, prefix) {
		    var prefixedName = (prefix || cookie_name_prefix) + name,
		        data = $.cookie(prefixedName)

		    try {
		        data = JSON.parse(data)
		    } catch(e) {}

		    return {name: name, data: data}
		}

		})(jQuery);		
		// END REDDIT JS
	}
}

window.onload = RESInitReadyCheck();

var lastPerf = 0;
function perfTest(name) {
	var d = new Date();
	var diff = d.getTime() - lastPerf;
	console.log(name+' executed. Diff since last: ' + diff +'ms');
	lastPerf=d.getTime();
}

