// ==UserScript==
// @name          Reddit Enhancement Suite
// @namespace 	  http://reddit.honestbleeps.com/
// @description	  A suite of tools to enhance reddit...
// @author        honestbleeps
// @include       http://redditenhancementsuite.com/*
// @include       http://reddit.honestbleeps.com/*
// @include       http://reddit.com/*
// @include       https://reddit.com/*
// @include       http://*.reddit.com/*
// @include       https://*.reddit.com/*
// ==/UserScript==

var RESVersion = "4.0.2";

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
guidersCSS += '.x_button { background-image: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAgEASABIAAD/4QOzRXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAAYgEbAAUAAAABAAAAagEoAAMAAAABAAIAAAExAAIAAAAcAAAAcgEyAAIAAAAUAAAAjodpAAQAAAABAAAApAAAANAACvyAAAAnEAAK/IAAACcQQWRvYmUgUGhvdG9zaG9wIENTNCBXaW5kb3dzADIwMTA6MDk6MjQgMDg6MzY6NDEAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAADaADAAQAAAABAAAADQAAAAAAAAAGAQMAAwAAAAEABgAAARoABQAAAAEAAAEeARsABQAAAAEAAAEmASgAAwAAAAEAAgAAAgEABAAAAAEAAAEuAgIABAAAAAEAAAJ9AAAAAAAAAEgAAAABAAAASAAAAAH/2P/gABBKRklGAAECAABIAEgAAP/tAAxBZG9iZV9DTQAB/+4ADkFkb2JlAGSAAAAAAf/bAIQADAgICAkIDAkJDBELCgsRFQ8MDA8VGBMTFRMTGBEMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAENCwsNDg0QDg4QFA4ODhQUDg4ODhQRDAwMDAwREQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgADQANAwEiAAIRAQMRAf/dAAQAAf/EAT8AAAEFAQEBAQEBAAAAAAAAAAMAAQIEBQYHCAkKCwEAAQUBAQEBAQEAAAAAAAAAAQACAwQFBgcICQoLEAABBAEDAgQCBQcGCAUDDDMBAAIRAwQhEjEFQVFhEyJxgTIGFJGhsUIjJBVSwWIzNHKC0UMHJZJT8OHxY3M1FqKygyZEk1RkRcKjdDYX0lXiZfKzhMPTdePzRieUpIW0lcTU5PSltcXV5fVWZnaGlqa2xtbm9jdHV2d3h5ent8fX5/cRAAICAQIEBAMEBQYHBwYFNQEAAhEDITESBEFRYXEiEwUygZEUobFCI8FS0fAzJGLhcoKSQ1MVY3M08SUGFqKygwcmNcLSRJNUoxdkRVU2dGXi8rOEw9N14/NGlKSFtJXE1OT0pbXF1eX1VmZ2hpamtsbW5vYnN0dXZ3eHl6e3x//aAAwDAQACEQMRAD8A74ehRj023172WNEODju36n3S76L0Q4p9RrdjfUNbnlm522Q5nt3bv3Hbd6jiueG17qqi70fabLHAbPz4b6Lmf8aoF7oafSb6PpOgeo/6G9n53o7/AE/7P8yip//Z/+0IRFBob3Rvc2hvcCAzLjAAOEJJTQQlAAAAAAAQAAAAAAAAAAAAAAAAAAAAADhCSU0D7QAAAAAAEABIAAAAAQABAEgAAAABAAE4QklNBCYAAAAAAA4AAAAAAAAAAAAAP4AAADhCSU0EDQAAAAAABAAAAHg4QklNBBkAAAAAAAQAAAAeOEJJTQPzAAAAAAAJAAAAAAAAAAABADhCSU0nEAAAAAAACgABAAAAAAAAAAI4QklNA/UAAAAAAEgAL2ZmAAEAbGZmAAYAAAAAAAEAL2ZmAAEAoZmaAAYAAAAAAAEAMgAAAAEAWgAAAAYAAAAAAAEANQAAAAEALQAAAAYAAAAAAAE4QklNA/gAAAAAAHAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAOEJJTQQIAAAAAAAQAAAAAQAAAkAAAAJAAAAAADhCSU0EHgAAAAAABAAAAAA4QklNBBoAAAAAA0kAAAAGAAAAAAAAAAAAAAANAAAADQAAAAoAVQBuAHQAaQB0AGwAZQBkAC0AMQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAADQAAAA0AAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAA0AAAAAUmdodGxvbmcAAAANAAAABnNsaWNlc1ZsTHMAAAABT2JqYwAAAAEAAAAAAAVzbGljZQAAABIAAAAHc2xpY2VJRGxvbmcAAAAAAAAAB2dyb3VwSURsb25nAAAAAAAAAAZvcmlnaW5lbnVtAAAADEVTbGljZU9yaWdpbgAAAA1hdXRvR2VuZXJhdGVkAAAAAFR5cGVlbnVtAAAACkVTbGljZVR5cGUAAAAA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bnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNCBXaW5kb3dzIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxMC0wOS0yNFQwODozNjo0MS0wNTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxMC0wOS0yNFQwODozNjo0MS0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTAtMDktMjRUMDg6MzY6NDEtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxQ0Q5QUNCNzQ4QzdERjExOUMyQkU4QkIzMTY5NzZDMCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxQUQ5QUNCNzQ4QzdERjExOUMyQkU4QkIzMTY5NzZDMCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjFDRDlBQ0I3NDhDN0RGMTE5QzJCRThCQjMxNjk3NkMwIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHRpZmY6T3JpZW50YXRpb249IjEiIHRpZmY6WFJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpZUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOlJlc29sdXRpb25Vbml0PSIyIiB0aWZmOk5hdGl2ZURpZ2VzdD0iMjU2LDI1NywyNTgsMjU5LDI2MiwyNzQsMjc3LDI4NCw1MzAsNTMxLDI4MiwyODMsMjk2LDMwMSwzMTgsMzE5LDUyOSw1MzIsMzA2LDI3MCwyNzEsMjcyLDMwNSwzMTUsMzM0MzI7NEZDNkYxNUZCODNCMjY3MjY4NzRCNjRFRTEzRkY2QjgiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIxMyIgZXhpZjpQaXhlbFlEaW1lbnNpb249IjEzIiBleGlmOkNvbG9yU3BhY2U9IjEiIGV4aWY6TmF0aXZlRGlnZXN0PSIzNjg2NCw0MDk2MCw0MDk2MSwzNzEyMSwzNzEyMiw0MDk2Miw0MDk2MywzNzUxMCw0MDk2NCwzNjg2NywzNjg2OCwzMzQzNCwzMzQzNywzNDg1MCwzNDg1MiwzNDg1NSwzNDg1NiwzNzM3NywzNzM3OCwzNzM3OSwzNzM4MCwzNzM4MSwzNzM4MiwzNzM4MywzNzM4NCwzNzM4NSwzNzM4NiwzNzM5Niw0MTQ4Myw0MTQ4NCw0MTQ4Niw0MTQ4Nyw0MTQ4OCw0MTQ5Miw0MTQ5Myw0MTQ5NSw0MTcyOCw0MTcyOSw0MTczMCw0MTk4NSw0MTk4Niw0MTk4Nyw0MTk4OCw0MTk4OSw0MTk5MCw0MTk5MSw0MTk5Miw0MTk5Myw0MTk5NCw0MTk5NSw0MTk5Niw0MjAxNiwwLDIsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMjAsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMzA7NkFFQjM0Q0IwNUE5MkY5RjlCMEU2RjQ1NTQxOUVCRkUiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjFDRDlBQ0I3NDhDN0RGMTE5QzJCRThCQjMxNjk3NkMwIiBzdEV2dDp3aGVuPSIyMDEwLTA5LTI0VDA4OjM2OjQxLTA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ1M0IFdpbmRvd3MiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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); cursor: pointer; height: 13px; width: 13px; }';
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
	obj = document.createElement(elementType);
	if (id != null) {
		obj.setAttribute('id', id);
	}
	if ((typeof(classname) != 'undefined') && (classname != '')) {
		obj.setAttribute('class', classname);
	}
	return obj;
};

// sigh.. opera just has to be a pain in the ass... check for navigator object...
if (typeof(navigator) == 'undefined') navigator = window.navigator;

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
		toArr = Array(toArr,false,false,false);
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
		if (typeof(console) != 'undefined') console.log(arguments.callee.caller);
		return false;
	}
	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(ele,cls) {
	if (ele == null) console.log(arguments.callee.caller);
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
				break;
			case 'getLocalStorage':
				// TODO: this needs to be done for jetpack
				// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
				// old schol localStorage from the foreground page to the background page to keep their settings...
				if (typeof(msgEvent.message.importedFromForeground) == 'undefined') {
					// it doesn't exist.. copy it over...
					var thisJSON = {
						requestType: 'saveLocalStorage',
						data: localStorage
					}
					self.postMessage(thisJSON);
				} else {
					setUpRESStorage(msgEvent.message);
					RESInit();
				}
				break;
			case 'saveLocalStorage':
				// TODO: this needs to be done for jetpack
				// Okay, we just copied localStorage from foreground to background, let's set it up...
				setUpRESStorage(msgEvent.message);
				RESInit();
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
				RESInit();
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			setUpRESStorage(msgEvent.message);
			RESInit();
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
					RESInit();
				}
			}
			break;
		case 'saveLocalStorage':
			// Okay, we just copied localStorage from foreground to background, let's set it up...
			setUpRESStorage(eventData.data);
			if (location.hostname.match('reddit')) {
				RESInit();
			}
			break;
		case 'localStorage':
			if ((typeof(RESStorage) != 'undefined') && (typeof(RESStorage.setItem) == 'function')) {
				RESStorage.setItem(eventData.itemName, eventData.itemValue, true);
			} else {
				// great, opera has screwed some shit up. let's wait until RESStorage is defined, then try again...
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
	safari.self.addEventListener("message", safariMessageHandler, false);
}
// we can't do this check for opera here because we need to wait until DOMContentLoaded is triggered, I think.  Putting this in RESinit();

// opera compatibility
if (typeof(opera) != 'undefined') {
	// removing this line for new localStorage methodology (store in extension localstorage)
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
				if(obj.headers) { for(name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
				request.send(obj.data); return request;
			}
		}
	} else if (typeof(safari) != 'undefined')  {
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// Safari is a bastard.  Since it doesn't provide legitimate callbacks, I have to store the onload function here
			// in the main userscript in a queue (see xhrQueue), wait for data to come back from the background page, then call the onload. Damn this sucks.
			// See how much easier it was up there in the Chrome statement?  Damn.
			if (typeof(obj.onload) != 'undefined') {
				obj.XHRID = xhrQueue.count;
				xhrQueue.onloads[xhrQueue.count] = obj.onload;
				safari.self.tab.dispatchMessage("GM_xmlhttpRequest", obj);
				xhrQueue.count++;
			}
		}
	} else if (typeof(opera) != 'undefined') {
		GM_xmlhttpRequest = function(obj) {
			obj.requestType = 'GM_xmlhttpRequest';
			// Turns out, Opera works this way too, but I'll forgive them since their extensions are so young and they're awesome people...
			// Really though, we need callbacks like Chrome has!  This is such a hacky way to emulate GM_xmlhttpRequest.

			// oy vey... another problem. When Opera sends xmlhttpRequests from the background page, it loses the cookies etc that it'd have 
			// had from the foreground page... so we need to write a bit of a hack here, and call different functions based on whether or 
			// not the request is cross domain... For same-domain requests, we'll call from the foreground...
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
				if(obj.headers) { for(name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
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


var RESConsoleContainer = '';
var modalOverlay = '';
var RESMenuItems = new Array();
var RESConsolePanels = new Array();
var modules = new Array();

// define common RESUtils - reddit related functions and data that may need to be accessed...
var RESUtils = {
	// imgur API key
	imgurAPIKey: 'fe266bc9466fe69aa1cf0904e7298eda',
	// A cache variable to store CSS that will be applied at the end of execution...
	css: '',
	addCSS: function(css) {
		this.css += css;
	},
	// checks if script should run on current URL using exclude / include.
	isMatchURL: function (moduleID) {
		var currURL = location.href;
		// get includes and excludes...
		var excludes = modules[moduleID].exclude;
		var includes = modules[moduleID].include;
		// first check excludes...
		if (typeof(excludes) != 'undefined') {
			for (i=0, len = excludes.length; i<len; i++) {
				// console.log(moduleID + ' -- ' + excludes[i] + ' - excl test - ' + currURL + ' - result: ' + excludes[i].test(currURL));
				if (excludes[i].test(currURL)) {
					return false;
				}
			}
		}
		// then check includes...
		for (i=0, len=includes.length; i<len; i++) {
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
			storedOptions = safeJSON.parse(thisOptions, 'RESoptions.' + moduleID);
			codeOptions = modules[moduleID].options;
			var newOption = false;
			for (attrname in codeOptions) {
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
					url:	location.protocol + "//"+ location.hostname+ "/user/" + RESUtils.loggedInUser() + "/about.json",
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
	pageType: function() {
		if (typeof(this.pageTypeSaved) == 'undefined') {
			var pageType = '';
			var currURL = location.href.split('#')[0];
			var commentsRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i);
			var friendsCommentsRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/r\/friends\/*comments\/?/i);
			var inboxRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/message\/[-\w\.\/]*/i);
			// var profileRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.]*\/?(comments)?\/?$/i);
			var profileRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.#=]*\/?(comments)?\/?(\?([a-z]+=[a-zA-Z0-9_%]*&?)*)?$/i); // fix to regex contributed by s_quark
			var submitRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*\/submit\/?$/i);
			var prefsRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/prefs\/?/i);
			if (profileRegex.test(currURL)) {
				pageType = 'profile';
			} else if ((commentsRegex.test(currURL)) || (friendsCommentsRegex.test(currURL))) {
				pageType = 'comments'
			} else if (inboxRegex.test(currURL)) {
				pageType = 'inbox';
			} else if (submitRegex.test(currURL)) {
				pageType = 'submit';
			} else if (prefsRegex.test(currURL)) {
				pageType = 'prefs';
			} else {
				pageType = 'linklist';
			}
			this.pageTypeSaved = pageType;
		} 
		return this.pageTypeSaved;
	},
	currentSubreddit: function(check) {
		if (typeof(this.curSub) == 'undefined') {
			var match = location.href.match(/https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w\.]+).*/i);
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
		finalvalue = { 'x': leftValue, 'y': topValue };
		return finalvalue;
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
			RESUtils.openLinkInNewTab('http://redditenhancementsuite.com/whatsnew.html#'+RESVersion, false);
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
			$.getJSON('/r/RESAnnouncements/.json?limit=1', function(data) {
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
		keyComboString = '';
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
		var amonth = origdate.getMonth()+1;
		var aday = origdate.getDate();
		var ayear = origdate.getFullYear();

		if (newdate == null) newdate = new Date();
		var dyear;
		var dmonth;
		var dday;
		var tyear = newdate.getFullYear();
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

		m = new Array(31, f, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

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
				if (ma>12) {ma = ma-12}
				if (ma=0) {ma = ma+12}
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
				if (thisSubReddit.toLowerCase() == 'enhancement') {
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
							Are you sure you want to submit a bug report? \
							If so, please consider the following:<br> \
							<ol> \
								<li>Have you searched /r/Enhancement to see if someone else has reported it?</li> \
								<li>Have you checked the <a target=\"_blank\" href=\"http://redditenhancementsuite.com/wiki\">Wiki</a> yet to see if it has already been reported?</li> \
								<li>Are you sure it's a bug with RES specifically? Do you have any other userscripts/extensions running?  How about addons like BetterPrivacy, Ghostery, CCleaner, etc?</li> \
								<li>Okay - if you still want to report a bug, go ahead and report it! RES will automatically place your browser info in the selftext box - please leave it there to aid in debugging!</li> \
							</ol> \
							<span id=\"submittingBug\" class=\"submittingToEnhancementButton\">I still want to submit a bug!</span> \
						</div> \
						<div id=\"RESFeatureRequest\"> \
							So you want to request a feature, great!  Please just consider the following, first:<br> \
							<ol> \
								<li>Have you searched /r/Enhancement to see if someone else has requested it?</li> \
								<li>Are you sure it's a bug with RES specifically? Do you have any other Reddit-related userscripts/extensions running?</li> \
								<li>Okay - if you've answered \"yes\" to all of the above, go ahead and report it. <b>Please be sure to specify:</b> your browser (with version), version of RES, operating system, anything showing up in your Javascript error console, and any special settings you may have that might help debug.</li> \
							</ol> \
							<span id=\"submittingFeature\" class=\"submittingToEnhancementButton\">I still want to submit a feature request!<span> \
						</div> \
					</div>";
					insertAfter(textDesc, this.submittingToEnhancement);
					setTimeout(function() {
						$('#RESSubmitBug').click(
							function() { 
								$('#RESSubmitOptions').fadeOut(
									function() { $('#RESBugReport').fadeIn(); }
								);
							}
						);
						$('#RESSubmitFeatureRequest').click(
							function() { 
								$('#RESSubmitOptions').fadeOut(
									function() { $('#RESFeatureRequest').fadeIn(); }
								);
							}
						);
						$('#submittingBug').click(
							function() { 
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
								$('#submittingToEnhancement').fadeOut();
								title.value = '[feature request] Please summarize your feature request here, and elaborate in the selftext.';
							}
						);
						$('#RESSubmitOther').click(
							function() { 
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
			this.notificationTimers = new Array();
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
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
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

localStorageFail = false;

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
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('copyToSimpleStorage') != -1)) {
					GMSVtoFFSS();
				}
			}, true);
		}
	}
} catch(e) {
	localStorageFail = true;
	/*
	localStorage = {
		getItem: function() {
			return false;
		},
		setItem: function() {
			return false;
		},
		removeItem: function() {
			return false;
		}
	}
	*/
}

// this function copies localStorage (from the GM import script) to FF addon simplestorage...
function GMSVtoFFSS() {
	var console = unsafeWindow.console;
	for (key in localStorage) {
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
	background-image: url(\'http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png\'); \
	background-repeat: no-repeat; \
	background-position: 0px -209px; \
	vertical-align: bottom; \
} \
#RESSettingsButton.newNotification, .gearIcon.newNotification { \
	cursor: pointer; \
	background-position: 0px -135px; \
} \
#DashboardLink a { \
	display: block; \
	width: auto; \
	height: auto; \
} \
#RESMainGearOverlay { \
	position: relative; \
	width: 27px; \
	height: 22px; \
	border: 1px solid #336699; \
	border-bottom: 1px solid #5f99cf; \
	background-color: #5f99cf; \
	border-radius: 3px 3px 0px 0px; \
} \
.gearIcon { \
	position: absolute; \
	top: 3px; \
	left: 6px; \
	width: 15px; \
	height: 15px; \
	background-image: url(\'http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png\'); \
	background-repeat: no-repeat; \
	background-position: 0px -209px; \
} \
#RESPrefsDropdown { \
	display: none; \
	position: absolute; \
	z-index: 10000; \
} \
#RESPrefsDropdown ul { \
	list-style-type: none; \
	background-color: #5f99cf; \
	width: 180px; \
	border-radius: 0px 0px 3px 3px; \
	border: 1px solid #336699; \
	margin-top: -1px; \
} \
#RESPrefsDropdown li { \
	cursor: pointer; \
	border-bottom: 1px solid #336699; \
	height: 35px; \
	line-height: 34px; \
	font-weight: bold; \
	color: #c9def2; \
	padding-left: 10px; \
} \
#RESPrefsDropdown a:visited { \
	color: #c9def2; \
} \
#RESPrefsDropdown li:hover, #RESPrefsDropdown li a:hover { \
	background-color: #9cc6ec; \
	color: #336699; \
} \
#openRESPrefs { \
	display: inline; \
} \
#RESConsoleHeader { \
	width: 100%; \
} \
#RESLogo { \
	margin-right: 5px; \
	float: left; \
} \
#RESConsoleTopBar { \
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
.RESDialogSmall .RESDialogContents { \
	padding: 56px 12px 12px 12px;  \
} \
#RESHelp { \
	background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); \
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


// define the RESConsole class
var RESConsole = {
	// make the modules panel accessible to this class for updating (i.e. when preferences change, so we can redraw it)
	RESConsoleModulesPanel: createElementWithID('div', 'RESConsoleModulesPanel', 'RESPanel'),
	RESConsoleConfigPanel: createElementWithID('div', 'RESConsoleConfigPanel', 'RESPanel'),
	RESConsoleAboutPanel: createElementWithID('div', 'RESConsoleAboutPanel', 'RESPanel'),
	RESConsoleProPanel: createElementWithID('div', 'RESConsoleProPanel', 'RESPanel'),
	addConsoleLink: function() {
		this.userMenu = document.querySelector('#header-bottom-right');
		if (this.userMenu) {
			var preferencesUL = this.userMenu.querySelector('UL');
			var separator = document.createElement('span');
			separator.setAttribute('class','separator');
			separator.innerHTML = '|';
			this.RESPrefsLink = document.createElement('span');
			this.RESPrefsLink.setAttribute('id','openRESPrefs');
			/*
			if (RESStorage.getItem('RESoutdated') == 'true') {
				// this.RESPrefsLink.innerHTML = '[RES](u)';
				this.RESPrefsLink.innerHTML = '<span id="RESSettingsButton" title="RES Settings"></span>(u)';
			} else {
				// this.RESPrefsLink.innerHTML = '[RES]';
				this.RESPrefsLink.innerHTML = '<span id="RESSettingsButton" title="RES Settings"></span>';
			}
			*/
			this.RESPrefsLink.innerHTML = '<span id="RESSettingsButton" title="RES Settings"></span>';
			/*
			this.RESPrefsLink.addEventListener('click', function(e) {
				e.preventDefault();
				// RESConsole.open();
				RESConsole.showPrefsDropdown();
			}, true);
			*/
			// this.RESPrefsLink.addEventListener('click', RESConsole.showPrefsDropdown, true);
			$(this.RESPrefsLink).mouseenter(RESConsole.showPrefsDropdown);
			insertAfter(preferencesUL, this.RESPrefsLink);
			insertAfter(preferencesUL, separator);
		}
	},
	addConsoleDropdown: function() {
		this.prefsDropdown = createElementWithID('div','RESPrefsDropdown');
		this.prefsDropdown.innerHTML = '<div id="RESMainGearOverlay" class="RESGearOverlay"><div class="gearIcon"></div></div><ul id="RESDropdownOptions"><li id="SettingsConsole">settings console</li></ul>';
		var thisSettingsButton = this.prefsDropdown.querySelector('#SettingsConsole');
		thisSettingsButton.addEventListener('click', function() { 
			RESConsole.hidePrefsDropdown();
			RESConsole.open();
		}, true);
		$(this.prefsDropdown).mouseleave(function() {
			RESConsole.hidePrefsDropdown();
		});
		document.body.appendChild(this.prefsDropdown);
		if (RESStorage.getItem('RES.newAnnouncement','true')) {
			RESUtils.setNewNotification();
		}
	},
	showPrefsDropdown: function(e) {
		var thisTop = parseInt($(RESConsole.userMenu).offset().top);
		var thisRight = parseInt($(window).width() - $(RESConsole.RESPrefsLink).offset().left);
		thisRight = 175-thisRight;
		$('#RESMainGearOverlay').css('left',thisRight+'px');
		RESConsole.prefsDropdown.style.top = thisTop+'px';
		RESConsole.prefsDropdown.style.right = '0px';
		RESConsole.prefsDropdown.style.display = 'block';
	},
	hidePrefsDropdown: function(e) {
		removeClass(RESConsole.RESPrefsLink, 'open');
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
		for (i in modules) {
			if (storedPrefs[i]) {
				prefs[i] = storedPrefs[i];
			} else if (storedPrefs[i] == null) {
				// looks like a new module, or no preferences. We'll default it to on.
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
			this.drawModulesPanel();
			return prefs;
		} else {
			alert('error - no prefs specified');
		}
	},
	container: RESConsoleContainer,
	create: function() {
		// create the console container
		RESConsoleContainer = createElementWithID('div', 'RESConsole');
		// hide it by default...
		// RESConsoleContainer.style.display = 'none';
		// create a modal overlay
		modalOverlay = createElementWithID('div', 'modalOverlay');
		modalOverlay.addEventListener('click',function(e) {
			e.preventDefault();
			return false;
		}, true);
		document.body.appendChild(modalOverlay);
		// create the header
		RESConsoleHeader = createElementWithID('div', 'RESConsoleHeader');
		// create the top bar and place it in the header
		RESConsoleTopBar = createElementWithID('div', 'RESConsoleTopBar');
		this.logo = 'data:image/gif;base64,R0lGODlhPAAeAPcAADo6OlxcXSQkJDExMQ8PDwkJCRISEhwcHCgoKBAQEBYWFgQEBAcHBxQVFAICAtDT2pCSlyAgIvDz+2BhZf7//5KTlSIiIvPz87y8vJGRkf7+/jU1NRkZGScnJ6enp/79/WNjY+nr8rW2ulBQUB8fH0xMTBgYGD4+PvX19S8vL42OkN7e3uXl5f7//tXX3Pb29v9PAOvr69fX18XFxe3v98LCwmVlZZmanf9UAOfq8P9YAJKSkrGxseTk5FpaWoWGiP39/f5LACAgIENDQ0dHR56fokhISC0tLXp6ep2eoDk5Of9NALe4u1JSUnZ2dpOUltrc4aurq/adcYeHh9DS15SUl76+vv328u3w+PiVY1lZWvZxLsLDx0VFRfa1kcfIzXx8fGFiY/rYxZSUlP9VAPaVYfhcC5qbmurs9PxJAHFyc+zs7Pvq3/3//+/x+ezv9jg4OF9fX+/v7/tNAOLk6uDg4ODi6IqKimRkZLKysqqrrv369uPj4+jo6CkpKnBxcm1tbUZGRmprbBgYGfnJrjs7PPekdvhbBxcXGPZ9Pvh1NpaXmdLT2Pvr4flfFfzv5u/y+omKjI2Njebo76+vsUdHSPvn3NXV1fZtJoODg/r6+mtra9zc3MrKysnLz/jRuF5fYOrs8+zu9bi4uLu7u2BgYPeMU3h4eHh5e/ehc/nGrPLy8svM0eTm7dja346PkU9PT39/f3R1dmRkZZ6enpiYmLW1tfz8/LO0t/T09Ovu9erq6v///jk6Off39/i4ls7Q1PZ/Qfd/RS4tLtbW1lhYWP36+O7x+Pa1j+7x+YSFh8TExPlZCaOjo5CQkPz18be3t+7u7jc3N3R0dFZXV+Pl697g5uHh4aOkptvd4mxtboiJi29vcUBBQ5GSlPvp3qGipbOzs/nYxKmqrcXGypWVlf369/i8mU9PUBUWFvWWYejp6Ofn55mbnSoqKnV1df359WxsbE1NTbe4vP1IAP5IAP9JAGZmaGdnaDQ0NA0NDf9MAPpNAAAAAP////Dz/CH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzBCMDk1MzM5NkZGMTFERjgyQTZGNzE3MzdDRTMxNzUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzBCMDk1MzQ5NkZGMTFERjgyQTZGNzE3MzdDRTMxNzUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozMEIwOTUzMTk2RkYxMURGODJBNkY3MTczN0NFMzE3NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozMEIwOTUzMjk2RkYxMURGODJBNkY3MTczN0NFMzE3NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAAA8AB4AAAj/AP8JHEiwoMGDCBMqXMhwoIRjBnNU+QGlocWLBr316/WDC41/LvqlONEPHMaTFo+g0qOkQIEUBPD48+dsARaUOBHSYfBGoIRJT/qRmtnDAaOcSAmq8GOQxKaZtPrpSkr1QBKDX/oVMtJPBdWkIfpVO2jnnhZPX5PesJC27UBR2UQsOtBhnis0bpECk0WinwN9FjYMSOCg3yBB5CTkRQipyKx2bv5hQ9RPSYYaK1Zp8NcCRZ0ZtYYsMFBBMRN8ykLktUOAg5EOBhoQiMVipu3bt2PcUZBACAcifvqJcCugxC1/p/rZWHO7Be6ZFG5feNfPx8xM/XIYjPCg4AQICq05/+DkD0y/Zs/T+4uO29YCEP40CCmyvTvB7wpdLEARpZ+H2xoQkooqHzwnhiG/XHGbFf3s4M8wr9TnHXgJ0bBABkcEgNs5/OwzBzLszSQOM0HQU0aI/iBhAgYLsDIQBP3EGGM3D8goY0I39FOADLe1IQwMOsCgCIpSBKEDDo48chs7lFFzEHcTMsRNPs9lUQ8Z9piCmxdp4LDEFnvgNkQhCEF5H4UKRSLPc98Ec0giluAGjzpmYPLJcyCAUqZ9A+G3UBIApGcMG+b4wwtuHzTyTHqBqLEYFQvUpt6k6V1gACWLSZCOE5R2etsOCySz2D+49LMMbi8Ug0F6KzRxCW4yFJlQwagC/UHADLcBMUI/I2RAySh5nGFDAQL0cBsxJqBD60Bh9FNOrjycYAADCyxAwBFjXHCbBwxUotiyAo3TjzvhvHCbL7vw0Ucut2mCARz9zAouQaFoswAC0/AQQ3pyQIPEAAsE0Mq8B23TTwMMEBBYFyUQIY0ABiygQD+wEHxQBQYY0Ek0NUgCSCk+xBHPFBisc80BBghCa0AAOw==';
		this.loader = 'data:image/gif;base64,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';
		RESConsoleTopBar.innerHTML = '<img id="RESLogo" src="'+this.logo+'"><h1>reddit enhancement suite</h1>';
		RESConsoleHeader.appendChild(RESConsoleTopBar);
		this.RESConsoleVersion = createElementWithID('div','RESConsoleVersion');
		this.RESConsoleVersion.innerHTML = 'v' + RESVersion;
		RESConsoleTopBar.appendChild(this.RESConsoleVersion);
		RESSubredditLink = createElementWithID('a','RESConsoleSubredditLink');
		RESSubredditLink.innerHTML = '/r/Enhancement';
		RESSubredditLink.setAttribute('href','http://reddit.com/r/Enhancement');
		RESSubredditLink.setAttribute('alt','The RES Subreddit');
		RESConsoleTopBar.appendChild(RESSubredditLink);
		// create the close button and place it in the header
		RESClose = createElementWithID('span', 'RESClose', 'RESCloseButton');
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
		this.categories = new Array();
		for (i in modules) {
			if ((typeof(modules[i].category) != 'undefined') && (this.categories.indexOf(modules[i].category) == -1)) {
				this.categories.push(modules[i].category);
			}
		}
		this.categories.sort();
		// create the menu
		// var menuItems = this.categories.concat(Array('RES Pro','About RES'));
		var menuItems = this.categories.concat(Array('About RES'));
		RESMenu = createElementWithID('ul', 'RESMenu');
		for (i in menuItems) {
			thisMenuItem = document.createElement('li');
			thisMenuItem.innerHTML = menuItems[i];
			thisMenuItem.setAttribute('id', 'Menu-' + menuItems[i]);
			thisMenuItem.addEventListener('click', function(e) {
				e.preventDefault();
				RESConsole.menuClick(this);
			}, true);
			RESMenu.appendChild(thisMenuItem);
		}
		RESConsoleHeader.appendChild(RESMenu);
		RESConsoleContainer.appendChild(RESConsoleHeader);
		// Store the menu items in a global variable for easy access by the menu selector function.
		RESMenuItems = RESMenu.querySelectorAll('li');
		// Create a container for each management panel
		this.RESConsoleContent = createElementWithID('div', 'RESConsoleContent');
		RESConsoleContainer.appendChild(this.RESConsoleContent);
		// Okay, the console is done. Add it to the document body.
		document.body.appendChild(RESConsoleContainer);
	},
	drawModulesPanel: function() {
		// Create the module management panel (toggle modules on/off)
		RESConsoleModulesPanel = this.RESConsoleModulesPanel;
		RESConsoleModulesPanel.innerHTML = '';
		var prefs = this.getAllModulePrefs(true);
		var modulesPanelHTML = '';
		for (i in modules) {
			(prefs[i]) ? thisChecked = 'CHECKED' : thisChecked = '';
			if (typeof(modules[i]) != 'undefined') {
				thisDesc = modules[i].description;
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
			for (i=0, len=modulePrefsCheckboxes.length;i<len;i++) {
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
		thisOption = document.createElement('option');
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

		var moduleList = Array();
		for (i in modules) {
			if (modules[i].category == category) moduleList.push(i);
		}
		moduleList.sort(function(a,b) {
			if (modules[a].moduleName.toLowerCase() > modules[b].moduleName.toLowerCase()) return 1;
			return -1;
		});
		/*
		for (var i=0, len=moduleList.length; i<len; i++) {
			var thisModule = moduleList[i];
			thisOption = document.createElement('option');
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
		
		RESConfigPanelOptions = createElementWithID('div', 'RESConfigPanelOptions');
		RESConfigPanelOptions.innerHTML = '<h1>RES Module Configuration</h1> Select a module from the column at the left to enable or disable it, and configure its various options.';
		this.RESConsoleConfigPanel.appendChild(RESConfigPanelOptions);
		this.RESConsoleContent.appendChild(this.RESConsoleConfigPanel);
		RESUtils.click(firstModuleButton);
	},
	drawOptionInput: function(moduleID, optionName, optionObject, isTable) {
		switch(optionObject.type) {
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
						thisOptionFormSubEle = createElementWithID('input', optionName+'-'+j);
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
		RESConfigPanelOptions.setAttribute('style','display: block;');
		RESConfigPanelOptions.innerHTML = '';
		// put in the description, and a button to enable/disable the module, first..
		var thisHeader = document.createElement('div');
		addClass(thisHeader, 'moduleHeader');
		thisHeader.innerHTML = '<span class="moduleName">' + modules[moduleID].moduleName + '</span>';
		var thisToggle = document.createElement('div');
		addClass(thisToggle,'moduleToggle');
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
			/*
			var thisBottomSaveButton = createElementWithID('input','moduleOptionsSaveBottom');
			thisBottomSaveButton.setAttribute('type','button');
			thisBottomSaveButton.setAttribute('value','save options');
			thisBottomSaveButton.addEventListener('click',function(e) {
				RESConsole.saveCurrentModuleOptions(e);
			}, true);
			*/
			// thisHeader.appendChild(thisSaveButton);
			this.RESConsoleConfigPanel.appendChild(thisSaveButton);
			var thisSaveStatus = createElementWithID('div','moduleOptionsSaveStatus','saveStatus');
			thisHeader.appendChild(thisSaveStatus);
			break;
		}
		var thisDescription = document.createElement('div');
		addClass(thisDescription,'moduleDescription');
		thisDescription.innerHTML = modules[moduleID].description;
		thisHeader.appendChild(thisDescription);
		RESConfigPanelOptions.appendChild(thisHeader);
		var allOptionsContainer = createElementWithID('div', 'allOptionsContainer');
		RESConfigPanelOptions.appendChild(allOptionsContainer);
		// now draw all the options...
		for (var i in thisOptions) {
			if (!(thisOptions[i].noconfig)) {
				optCount++;
				var thisOptionContainer = createElementWithID('div', null, 'optionContainer');
				var thisLabel = document.createElement('label');
				thisLabel.setAttribute('for',i);
				thisLabel.innerHTML = i;
				thisOptionDescription = createElementWithID('div', null, 'optionDescription');
				thisOptionDescription.innerHTML = thisOptions[i].description;
				thisOptionContainer.appendChild(thisLabel);
				if (thisOptions[i].type == 'table') {
					addClass(thisOptionDescription,'table');
					// table - has a list of fields (headers of table), users can add/remove rows...
					if (typeof(thisOptions[i].fields) == 'undefined') {
						alert('misconfigured table option in module: ' + moduleID + ' - options of type "table" must have fields defined');
					} else {
						// get field names...
						var fieldNames = new Array();
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
								thisOpt = thisOptions[i].fields[k];
								thisFullOpt = i + '_' + thisOptions[i].fields[k].name;
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
		var keyCodeInputs = RESConfigPanelOptions.querySelectorAll('.keycode');
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
							var keyArray = Array(e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey);
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
			RESConfigPanelOptions.appendChild(noOptions);
		} else {
			// var thisSaveStatusBottom = createElementWithID('div','moduleOptionsSaveStatusBottom','saveStatus');
			// RESConfigPanelOptions.appendChild(thisBottomSaveButton);
			// RESConfigPanelOptions.appendChild(thisSaveStatusBottom);
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
		var panelOptionsDiv = document.getElementById('RESConfigPanelOptions');
		// first, go through inputs that aren't a part of a "table of options"...
		var inputs = panelOptionsDiv.querySelectorAll('input');
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
					(inputs[i].checked) ? optionValue = true : optionValue = false;
				} else if (inputs[i].getAttribute('type') == 'radio') {
					if (inputs[i].checked) {
						var optionValue = inputs[i].value;
					}
				} else {
					// check if it's a keycode, in which case we need to parse it into an array...
					if ((inputs[i].getAttribute('class')) && (inputs[i].getAttribute('class').indexOf('keycode') >= 0)) {
						var tempArray = inputs[i].value.split(',');
						// convert the internal values of this array into their respective types (int, bool, bool, bool)
						var optionValue = Array(parseInt(tempArray[0]), (tempArray[1] == 'true'), (tempArray[2] == 'true'), (tempArray[3] == 'true'), (tempArray[4] == 'true'));
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
			for (i=0, len=optionsTables.length;i<len;i++) {
				var moduleID = optionsTables[i].getAttribute('moduleID');
				var optionName = optionsTables[i].getAttribute('optionName');
				var thisTBODY = optionsTables[i].querySelector('tbody');
				var thisRows = thisTBODY.querySelectorAll('tr');
				// check if there are any rows...
				if (typeof(thisRows) != 'undefined') {
					// go through each row, and get all of the inputs...
					var optionMulti = Array();
					var optionRowCount = 0;
					for (var j=0;j<thisRows.length;j++) {
						var optionRow = Array();
						var cells = thisRows[j].querySelectorAll('td');
						var notAllBlank = false;
						for (var k=0; k<cells.length; k++) {
							var inputs = cells[k].querySelectorAll('input[tableOption=true]');
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
										optionValue = Array(parseInt(tempArray[0]), (tempArray[1] == 'true'), (tempArray[2] == 'true'), (tempArray[3] == 'true'));
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
		statusEle.innerHTML = 'Options have been saved...';
		statusEle.setAttribute('style','display: block; opacity: 1');
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
		RESConsoleAboutPanel = this.RESConsoleAboutPanel; 
		var AboutPanelHTML = ' \
<div id="RESAboutPane"> \
	<div id="Button-DonateRES" class="moduleButton active">Donate</div> \
	<div id="Button-AboutRES" class="moduleButton">About RES</div> \
	<div id="Button-RESTeam" class="moduleButton">About the RES Team</div> \
</div> \
<div id="RESAboutDetails"> \
	<div id="DonateRES" class="aboutPanel"> \
		<h3>Donate to support RES</h3> \
		<p>RES is entirely free - as in beer, as in open source, as in everything.  If you like our work, a contribution would be greatly appreciated.</p> \
		<p>When you donate, you make it possible for the team to cover hosting costs and other expenses so that we can focus on doing what we do best: making your Reddit experience even better.</p> \
		<p> \
		<form action="https://www.paypal.com/cgi-bin/webscr" method="post"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="S7TAR7QU39H22"><input type="image" src="https://www.paypal.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1"></form> \
		</p> \
		<p></p> \
		<p></p> \
		<p> \
		Or use Google Checkout: \
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
		<div id="AboutRESTeamImage"><img src="data:image/gif;base64,R0lGODlhpgEeAfcAAP39/QICAvz8/AMDAwQEBPv7+wUFBaCgoPr6+gYGBgcHBwgICKGhoQkJCfn5+Z+fnwoKCgsLC/j4+KKiogwMDHd3d3Z2dldXVw0NDRcXF/Hx8Q4ODg8PD/f393V1dfPz8xAQEPb29np6eoGBgYCAgG1tbRERERkZGX5+fvDw8G9vbxISEhgYGBMTE3l5eYiIiCMjIxQUFHh4eBUVFR8fH3FxcSAgINnZ2X19fXJychsbG39/f+/v7xwcHPX19XR0dPLy8vT09ODg4Obm5oWFhYuLi3Nzc1ZWVuXl5SQkJNvb27y8vIyMjKSkpOvr60REROjo6IqKim5ubmpqaunp6XBwcIKCgpWVlb29vSoqKuzs7OPj43t7e3x8fCIiIh4eHqOjo8DAwGtra9XV1erq6iUlJWxsbGlpad7e3u7u7tzc3N3d3Y+PjxYWFt/f39PT06enpz09PSYmJhoaGpaWlkdHR5CQkL+/v+fn51lZWUxMTC8vL5eXl7Ozsy0tLR0dHaurqzg4OMzMzKioqISEhJycnO3t7be3t9ra2mdnZ9LS0pmZmWNjYyEhIcnJyYODg+Hh4VRUVFtbW4mJidfX1zQ0NEZGRpGRkcjIyNDQ0NbW1o2NjUhISIaGhuLi4sHBwVhYWGBgYLW1tZKSkmZmZkFBQZqamsLCwj8/P8TExLu7u2hoaNjY2F5eXmRkZEpKSk9PT+Tk5I6OjjMzM1BQUCsrK1VVVampqaysrMvLyz4+PktLSycnJ6qqqsrKytHR0UBAQCgoKDk5Oc7OzlxcXDs7O0VFRTc3N8fHx5ubm7a2tr6+vsbGxjIyMrGxsZOTky4uLq6urpiYmDU1NUlJSSwsLCkpKTw8PJ2dna2trcPDw56enjo6OlNTU11dXbS0tM3NzVJSUrCwsE5OTjExMUNDQ4eHh5SUlGVlZa+vr9TU1Li4uKampmJiYrq6umFhYV9fX6WlpTY2NsXFxU1NTVpaWrKysrm5uTAwMEJCQlFRUc/PzwEBAf7+/v///wAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTYzODYzODcwNUQ1MTFFMTkwRjBCRjFBNkM5Q0YyNjMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTYzODYzODgwNUQ1MTFFMTkwRjBCRjFBNkM5Q0YyNjMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5NjM4NjM4NTA1RDUxMUUxOTBGMEJGMUE2QzlDRjI2MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5NjM4NjM4NjA1RDUxMUUxOTBGMEJGMUE2QzlDRjI2MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAACmAR4BAAj/APnx+xcgwACBCBMqFGiQQEEC/yJKnEixosWLGDNq3Mixo0ePDwsGiFhwwMGFKFOqXMlSZYAEEBLwG/mxps2bOHPWFEjQYcufQAnwG/CP57+DOv8JTcq0qdOnGAcOhEq1IwUDBCBW3cq1q8ShA7V6pcjPodKZ/xIxAMNgQtu3bd0ymNv2wNxwU8fq3du0wRQ7iy5JAzMBkDh72QYNmvBgG90JkCPLhUx3rtvJbzFbtqwZrmS5TdKV+2eAKN/TqDfOHHrt1uXOlytXjv14dlzIq44GEGrwXy9/wIMLH058UurjO40WpTqgRzNLx8aRcvUjSq9crNwQ3869u/fv3b/1/yiaF7l51Kv/1doCvr37XuSnDjzgT0A/APgB3O/HH39/f/j5M8p5BFYk30wFLXeaCTR8YQwKgIQxxgfB6SeAAAXcV4AD9/nHX4cf5rffiP0IAICJ+p2IXwEXBqcEOhgUFUB5BdaoVzB0QAGchRgWIGJ++vXXoYj7qWifAP4coGBE8/nTj5PtBejPDjbWOFAAEJzQQw8nKAAWVzzNaKACDTQjxSLqhABchiDa5x53J9r3pJMpAuBPCuCY80VERC1V5Z9eBcACDhrUJ8GRc7653ZNPKlneQA/UB+CTQRL5IaX+5ABogQE0sAIHFEBgWldDxTejAfJNNMcrOVCyI38+pv8oZJGVBllkif7RaWdwfZSyApMMEbTpsE/NRNQApaQCHIpyVtqfrR7eSmc/BfjzwJLL0WdnonN+6CR/ACKZDLF/ihnoVAqYxJC6ZkX0hQhDAOhfhsEx6u23+IILZb33+VOAKHk0oNQABp2UILkI41SWAQkQhUE7mQDXL7cS1ysxo8Nh6uhETW7rHrhwJHxaXukx6VVC5PWWYFlEGRWIKvIiqShx3Ornzxv1TCUUwQWBRZPIQHdkUgMEGBBRGzuwMnN3GmMLKYD7dvutvfXZaY/JQR9HI1WPbv3ochyws+y2+pYNpbf62tyvBkz8wSewTmfNUXrG8tTyUVKVZV5Y7lr/QcWO1QJZ4tlnYwwlkht/9Q99SHJ7qdSS+nPPSFvLbTlVLYCRr3CQm224PwjYeYMuA510+U1hCkRAAgQZ/FLPAy1Q+V5lGbXHNg44KacEJ3breNRQJ24y45zvi+/hT55CwenMVzWQCcpEvvmlFVfMKJIFpFNNURCh1fxHBs14pUADsI41qpSfRznBBFETxrIZYtg4uPTru6O1cWtrPPD2gwtODNj6ngBtUqo25MJ4++EX9Qj3pFiMYwBZQQhSBriRkfQmgBsYCQhcAAuCmMs8lIPdP0ygAiGsiVrWQ1vxkHStr0VKZhmL4f3ewAIK2tAmIxHYNNQRNbJR7XjCQcIT/wgik95474YXKdU/FJCEBGTAD5WgxQi2wYhK4EALvqDB2/aGIAgeZQBGC0YTKpRC79hJeNmCmu/6VzjRaRGJcNyI6V6BgKnRr3rUm5Mv8KEUCGhFKiKbnU0wAIO/sEME53CEGpDQASSc4h5OsBMX/lHEvc2IJqYLSwl0NClw7epzTfsa8TqXQBTlSg2NEFYcV6mRH8SqX5zD2MT8oY3xMC9Y5JHRP3TgBX7IAQZLtAg/aFCCc+BCEGvYxx3ugQggfCAICPgAhZ5EhSwoRWRZgIOdQocfN33ufmjsGPAUyKZqAWcI1hQkK1kZgeipaIEXq5o/xvDG0xGgfMAailASQP8NXvwjENCYgQumAAt5nCAJcTjCJr5xA2ZgQRu/UIMixpACmc3JY2xYolg2ZZIltsITdLpQoop3xvyp0Xr1wt6cbsCAekBgnTAV5j/qkDtvPm5qSAqCMFR5uS8tp1T80EUqS1WJPoThG/EoRDywMAY88AAIWhjDG3gQJxDZLEj+yIQwPgioslwQH4LwFwJ+J5ySilJSjmOUj9YkDlrYYHwciylM+UGB96GNYtMyQwQ2KrdOtSALe7DBBlRZhnGgygAR+Mc7xEGFDzgBD2ugBBVC4AAJ1GesLTIRLO0UJChUIEYBtBL7pqIDsb3TfofD31k9tr/gxAIMu9BKSb6iHLn/wrFUNajPSMsGrnMQRJ0IG0oxadGCexJkFq2oxT84YDQ5FCEb3DIRAjJ0Vf8ESU4hqs8nQMHXP4FFn6QhxPyACE6T2mdbWAVQLkbgT4kcjLbAtW3zBrIHDfhuhf7Awq+4WiMxyUd8wTTaQeRQQ9OYKQep7AEHCCIFQCCDbLrzlpRmidMOVSsXjDDBkpSDkIncLWVb4Qnf/jEFCtVpV+U9a6ymW0d/3OAZRwCgsOIrX1a2wBH1w1eQRDEHkfCXQBbUJT9KQwBRjUoiC6gFH4JwgD1RwBILnkM6hNCBBI4UgYZb4LMAQAkmWCMifrpkLj14rPiQ72RSWUWh7LNWMobz/x+RKkABeIckHjzABl8Rc433vBwKwMym37LTMkBAmlPRmHYkyeXOIgAD80EgA3P4QijCUC0hvGKJkshHRGwRr6rtFqX36h+1nuQmBGRCDBkoykF2Yz73itgoAB4LTeqxVpul9s30kbOdCqCNSrSMaFP5GZ9r3AB7TM2OT8pZ9zrq3Z/xoxov7ZQXqmGMGozgBSjoAxTOUAVQnOAfLYCHCr7NAlVAmLfHuyl5OySvXWXCCDJOogf51LIfc01BMgjcJ6HWwrjSZ7r+IEM7og1Bs/RM2MOea0Sk0Ul7IUkVJrhn+N5bIIbwQ2AsyIEC/hGDHIxCGtFYhyjWkYuxuiMHoP84AxyQYQG3DYAJKqzfHcmaZVJbt81oMAU1VsA65RzMBPhYwLxPRhLvWcBJ5gylvycFgFZEJAEJYFj3dnPohA9wIBuAmedAxwmlJCArv60STRTgtj3AYiCNWEQyttEHZmxB38OBgnL/6QR/IclZxQs1v+oVIP6YSLMy+8ASknEBi0TgFVEYBTWWp5f08EwgIyBpkhRkEqIQTxkLJlnVrW5DhLQBE4X7DzI2XjJA+eTi/DhCEgxCjQewAxNQaHGA6gguFPxjBSAQB1rvdWxZohSPZmu4/RwQhVrkox3V4IUR+oAIIQyDDyXYwx9R1hVzyUJe2O/3WYjCAODwABVH4bz/+IVlgGzk3U4kCOQAItBjeZAAAp0igT0MATX/XCg//lDGArJwAnhwqLXHVj1Rc0cWI0uoNVK84w8+kAYWQwVhcAVSUAo6kD4URxViFgMRgyiTJx8JMBLa4gEDM36cNxMJgAt4ZCdasAc8NSwjUQXh8A8ksAsRMQ5gEC+cJSvdNE8w0Aa0MAOgd3eodTEHuHX2wkbdsSsBYl12IgBDkAv2QAKpFnakMhQjUQoUEisb6F6oUgj+YAe6gXAiuGcEkAGgZ0d2AgaoUlubAgzJAAK1YAUCcwKPgAspoFtIFyd24gbNEAHvcAJi0EkwFIBZNoDf9EOCeCl/Fy4hgmIC4AR3/1AGMgKGUDEULcMPySAvdaR9pfMP4uAJqWQQahiGtjUS9FBHtkYp3rCCxBIJO8UGHfQPnBAP9gAEVcNNT1ItY+AH/4ADecABEWMrQqhAdzWEyFY4xSMxmsUinuQkYxUghhAI4TcWFkcU5UCL/VBHiRMs2GAGZiaKo3hNRQEByGCM1LQ9oWgjUiEw4XAFG7cBJBANigAr/zEn4jAHDdAFm0AAXMBmIxJLa3RlvVeEj5MrdqQ7ujKPjWMnDnBptTMWpTEQqHIIdqh98wYMG+eNNTZkBtAAMvEPJTApOuYPzJBof0IwdbNxWeAIxxAR4XAA65A7slQtyOAKC6AHtxANqP+wB1swBhwyK7FEMzNHVgzELJ8kYc9yf/1CL/7QDb91jlsxEkdnM8JDhUaDkRlZMBCRBSDVIncUBr9lb8jhY8LSCIJgARGRBFEQDewxc0iiDFLgDB3gD9iQAd/gD1RlXUC0RoR4X+jGH2P1JrICIsCxRwghiWDyD69wd1mYSw9hlRnJDwpgAAHwDFAjJ/jyDeEHlscRPlMxC5mwBBGxAmZQCG9gh55kIsOhAWrQIUhpK0Ipc7xHjsFRLSmgCcMABjggAhUgBj9gAaRQAaIwIfG0KzwQBQDEM4bZFV8QL4ijIOlxkY45ii0zDTzgd1ICNc/QlCUpESxQAmmABMFwFLb/EA9rAAAJSIC4gof1cX/yVITAB2oyNE5AgAO2EAgscGQTgQE9QA5V4AgSUABAYAiCMAKzEBFGkz6nQQArMI5m5WoQhJ/RuUoiFgF94A8OAAD0clH+YJaaeR5/IAV34ATLwEcLQAumgAbImDEnUjUA4ABssiIp4ibxRI6kFHqf8wMD0ADBZkEzgp8bAAy7EFgvNTCrUYF6QQCAEDwB1KMReltwFREbVwI/lGOMICwdejIANhCc0Avi0ARW8G2NAAt2oAZ04o+hZ2vp9i33Fy28F2o1R5A3wAtSURKFeSAXQROvpjWa06BNKlewYzQCYwmFYoD3UniquJliFgG0UAOh/1AMDcMJUXAIIMVAzyI1sJmXyphHCpQvnnONTgIGldAGJrEbqDKqVRlIR3ELkoJGfSqhI3ES9yQPnWaMaNpBPmUeE9QAwiYPbDAGtOgvAgmblGKpeodXeCWIQLRrItBHC9NdZEEsA0GhkkKRrSqhCFIqWWBCGHJl9qMHHnRE5qEANMAIUhAKUoAChYAHFQKMAbkovleMZcqt8USsfucPIxCCEpEAK9AGOpAE1dACFgGKm0IBd7CqoVWtSMQQAhMM4HBZlikxrAUPy2GkfDETEAAKt4AGQSCAqFkiMheYgflNPRQiNcepwVg9uPAzETAN4dAJfcAKgiAIvmAKBUoWBv9QGpvSA2TanJuHsJaTHn8wjkeCYseGmpNUOj0LFTYQCqewKwigWUS7NEyTMe+abrtlP4cAQAogDEQADjzgA+pwBaDADZXwBwIjTE6JHANBCyiiWsAiFGnrs+rjY17jPeyzAbpHowfoDwyAN36yF0y6SzIgDhxyXoH4AayQDr0wAX3wBlsACWswDO6QDb0ABsmwCKaADQ9gF2DADliQCmjAA4E4j2Y4jGwKHJlACjoACnAACRKABKJgBLNwqorjESUDAjFwkVe6E6vWG5dQpokjZtApt+VCOXVLPgFgNDAQPfvDW/bjC18IoaTSEAqgAvZAIcPhA2MQDWeQD3siEX//UAvB4AUxQLsXoQArwAvFAAsucAuOMKn3IyUYaj04aCdo0ArWUAOa4A+KEAX6YE1wk7RMkgAYYAtXgAy/gAWr0DDOmhMSBBEwYELzKzwmCUbE613URxF3IybNMAb+cozBNycdYAtkNjKl8wRwUEcdMAZ3UAhR8A7VwHN5pk4KISNbMwAbcAIPog0MmFII6Un7oQR1kAP7IAgeAAPxNm+7mxEDAAtkAAAdwApsMA4AhCpQgRUJEgXHRsE8Yb4XTCA+IW+qRAx/g3+dsznBEQY6+rd6kUN6YArgoAovwAmEJkxighRUKB/MBl8IchEGMA1mwA65gL0WY3crChwpgAXY/8AJeZG8DIGgOLEbEKAL5SAPdYyvTuFTnFAodpiNaBEHjPfFNfIHGhZaJvkPEMAFucMililzAng9k0CqI/MPNNAOcuAFQ1oUPVen3xVCr6aG6hLAwbZqEdECexAKV3AIkKABUQscaSAOXDBENrwaE1R6BLQAtEuFbMwUVPgPbeALH4ya2SgmhdAFYOZsopwaLEBo4Io1jWAKr4J9egklHhIg0RCZydkUyZtPSvRbVXmqP/NjFoc1BP1TJFOJNPJEeWAGHmAH8QAIDMAFs0ABu8BHecOYHZYUIla7AixTfEIB9DEkPDsRIzEBDmAKxfBFTSm96YwcbWABiLB3yNpDOf9YAGwQAx1tu8krbC0TQUPWA5PwCRWwJzlNQLVLFmLBkRQkPmEhdEZAHHyaaNsAHGigXCZRqu3c0qnBD90AztIziFhGLS3qD0pAwrqczxptwSegAg8wCKZAAiaAIF6yAfRABKTwK0WdHDVcOR+U1wQCa0SxB0gANfS8mIkW0v6wR5Q0IzLh11qdHAY6DXEACkKLRwIYS0iyBvKgG2dWfUNRBjwEHG8AAiLhVRrs2ApD0l1T0JZjQVpRDB5M2CnGJAmSa3YCCfBAFOjD0o8NJnNKGrBoXycralDiIwIQCUrRoxCA2nZMFAkwC1AQBOngDVWZLrvxqh+GwbXF3Oixif//4Aqc3GZKFx+LUx9r1Q+mkGo909vmEXX/0AiuAkqc2i12QghFoaviw9tM8RL8AA0/8ACTEAd8IhQgIBMKADtxC2Rnxt2zPBI6cAkCkALuIAXpYDFRvRxxdjyOUAq0LRLOOWbsTUC/fND/wAIeTDXqdil28g0bR8zGomoZ7RTJC0VRCBEB0AIUgBC7HJYXzaQkg87fs8/dwArZAAzLbYLCMdKKoz/BkVPPsD2rE0GXlOAhHhUTFHZ9PBJtENrB6Kb9MgTAVDujapKngtaoIxEc0DAD8AXloAcHauZoliowjks3pDocAFr/sAeclFrUKk7BAXD+gAePkATHIhJIscRV/24gPhcsA1ENsTDfr5xARkBmRyaZRQrnH2EU1fAFfvAKRjACJWBN24wa/nUlclAGjDc+VB40BXGzCqILPGDhhp1GgegjoQMcSHAF0DAQDSMmmJ7oHEM5ELAHdfAEWmQu1NBiU8qX/kAFXxaZR2MERaCL/NCBAgsVApsAdfADuSkDJWALln4ewTISvOACk9AFqHAlIC5AxlJw/CB00nBlFy5OcyI/ZeoPUEAH3ABmfQzsNtEDTwAKrqACiVAHijMFxzivd0QJewICRKEH+wAchiAFEGDFv34TBAALJcAFFiACOZAIOsDa6KEVg8IEWPABihAJu6zfcnOtFyQDJmJOy//itkt+UmPTL1LCA8mgC3/k77b7B/RQAjLgATlgBq7QDhpGE5fYOPCqQuBQQwOhDxsrAC02SSyv0f+wAHlwBi7ABS5ACISw2aseYsEyDpuwBFXmD3cQB6Vy8UDDE09wC9XSImTU53AmPcDHeyGQDdJMGg7h9l/MEwQwB+NgBhbgAiqgAi5QAVUQD4lAHg0QPVcbc3OCCXMQET1wA4RtJymw2bG2FSuQB6RQAxUgDVRwCCUAsOqDFtDABNmgJsARAgwwB2N/OhUez4WNazZviEbpD2mAZycwAAtwyj4PLAvACa1QATXwAyPgARZgBFwQBgBQBMIyA2sgjIVsMUIgBxH/cQY3dYZf2RU6MAWJUAMMUCipUASGCkIjsQAeIA5aUH9ZRQ/r3nn/YAljpXdKPjyyDRD+/PUTSHDgwX79BCCY9a+UKwX/AiT4V9HiRYwZNW7k2NHjR5AhRXIM8A+CGRVSKuDgYi5eKiQC8/wj8C9Qh4MDCSZMWNBnAWAV2eUUKJCMHIkjlf6LoaIEDjwCkZiKkmHpVY4KBhxjF1VAQgD9qFzKgtXs2ZH8/tFIMxBAUYIC/B34p9ai2gP+3hrkuZNvv7AJTSkwUKLUgH+I0S5m3NgxxgGgVMjYgcNcpqL+kMQYUHOEXp45e/bd6a9L3W86iSLglPhxxj0VzvRyKwDO/7k4r0cGCJChBhrVcsOeOjJAsW7kIdXCcOKvgGi9/h7UvYg3Oly/2QGHAADgQ1ACF7zNSF7ePPKS/+JMySHjkhp/AgA8hyORX4JTznWO9kma4CkD/mnlOdLk8sC+8koxQ4p5BpKLGTpCOa8j3nRhBgAEwgqrKEiYOIEfuyYU0aJjOijgK7mKeouuEKnLa6+CDMqsKAHke46IiixBxZoA62rRsR9F5CeAIEfEqCQbpDCCDUjiS0iuIyzSBQi9YIwRuxgBEMCMf3SAIjPACPqFBQJaLDKtEI05A4UhBnrOjUtGOOGuM4G8a4UXCHRLNQBUeSUptYg0jx/EagKxojpFCv8gQMSKcK6fAviKjsXq/nmRqP5Kiys+fxioqQ5dNjhONxADWIC3RB8LoCZEjcxoSKZqwGEJ0CD1x5MvqFNhv7+uRIgnBJxoJw4tVBOoO3+iHJI36swiFMQB+NHDgzDi09IfB5y5BJXEiEwVrWd5G6Aa4MIMbcMtmLDq0G/PWpUAAwJAzC5BnTWgxw2UqBWuSZtt9QFOZdSUNLcI0gaDf/ZAJwZE210q2mjTE7Jeh5NTK4ELJtnCyZ5MsSsBXKwVmL++aEwRiBT92hAXVg8Fd0i1gqnBDh/0ku8tPLBRIcCSKr5qyAGYjcJYfgHzB5M6qFPL56UgqGkDXip19x8DTEj/wIB73NrwILkovcvS6CSFbjTA3koDqRm8acY8DP6QyACXXYXVVYwOFYaQNrt7K4QnqKuFh7D/Kg1MsAroTqGejn3LnyV4ZpojWBdoZ4Q7yn7LcACUoeMYmh5Pizd5+eGm2BoDO6i755ywg4O6iJQYObUUeOIVihyLgAA9EL7FWmRPn8tfF6+bMXE+JR3nHwVs8WYBqRs7gRYagKfbcyARa6QCdfQjCJwGknLBZit5VY2/Gssf+St/EmneXbUqQSGKNLQMbC8ksqkg3rhJlZc3ED7hfXBzEWQL4WjW65JTjVZEIldfQwsvTEATRYBmawLpGvCsk6L+xOh8RjMCTXYh/4VpJIZ6HSHAE0jxigjQTYUbsQs/WOCCYVRJLp2gyT8oEEHEwahXGuSJfBCAALnIiFM84MY/VmCCFp5lSAEahxX4IAGFhMVw8umHLyZQicREqzz3QYwFHISixRnkK29BwAsoQqjzBKMekjgCPPzQKrQMwBZumAAptgFFSE2wX2YCW/j8wi+tFSUbZWJBIqQwJ0a9RgGwYMAhriERA65QbnVpgRGw4A8ERIoMtfhHAvhhiecgZD8avJKM5pc4grzFHRjgxwZAMMIjEYkURIDDWw5XshSkwwiiqlfrwEWnkszCEEQhWeK6Mw9rQDKSSyFSBMrRkHv9owyZQAYjiCEJef9UxFsemReIllaRP4RBAsMTnop+x0eALY6coyybjG6wgX9w4AVL2EEElgXLutGkBP4AwiqUKUlJgsgVfciQXKTBrH9sYkY+YSh/xgamK+2gYXA0y6oS9gJCNAGDQhTIGCbwp0P18mV1CRAGlsGphWZHcf64BJkUAEt+EIBIdADAOyyShH34Iw04aAcojNHNb5WpW2XSQRwOsdBfzUgu00Fn2DKFpdD0RAm54oAv/KGFP8n0NbxRgBWc04UU5g+g52lROwDRAbnwQBhJyQAOyaYdQJZSU6MMQjHsA7PFHIoabBgBHL6Syj/2owO9eEQS/CXWny1NXo7KUFRFGaaCACD/DT841TJFch8QHaOIFYFGTrvzjVAwoh06YCBJopUAQTVgCRoQ5fgYeizpWBBsGPSVdkrzFh88QS1HSIE/1sG6UeXVogmQwXOwgBR8jvWyzUJHIXobW4voIYhiQ+VTM1UynwzDk0tLorPUsgdCECEbfGqoP1iBDQukUKS/tAg6UrmhqKpsNG8xhAdqZ5agWbQiG5hCW/7qhE6IoQrZlN5GXpeBHRwrZYKD6Ipke6leRXhkBCnBP5hXA+eY476NiRYBBoBaUETlDY9UrpGWVgM6RGULMPBlMgoGwNqO8qHQ2UYNq2PZkLiuAZEgQiEkIB/sgAUwyHgAPSaKz7hVok0C/zDcr+YqNrkooTgvI0BN5LA7m0ngLeuQQhWM0bpUUaQdm7DCAXwhFwRAVq7E4xRTKwVhwhmLeFv7AdX4sYB1+OMDujAi836EWI+gSl4VqQRmhkCNViV3UFiZGwdGIA0y9KMbraJBVErmn9YCkGC9OkMWW6hotaygAtLwgZB5ZSsJ9EEWcegZoNBkES3+Qx5jGEiGxiawIKNPEPBIoY80UqdnqQUV+opP+dIMCRkkwhYeXu+r/gGIGU0x03HdlNdadal1Yuq1/ujgocoRAn8IggbsYQGYYdbsQFOUBqmZQLmJFOsVlsplSbBEIKDRgIlsU1FCncEjpEGFTpRJUJfQD/+WoApjx4rmLQKAhg2795ilJaAVySi1msH0HEoUwg7U6KagEDuNR4hAImdcmmJM0AohtFbb1E5lpPoEjzkhimKuLvnrvtCNQpQaWSWzxxRIwYLgGjgAdbhBwd0kY1L6xMF8hDMpA6ttEvioJCHzBx12YYoqVKJ7Z0SVUthFqJKawwXh6IGPFP0zXycGGEZ4SioOBDGfleofwZBFES4QNLj94xhaQNzgkgrI0PBQfIhgwRfqwCogweoJhfgAaFK6IQfc4RwMeAcEfBTNjBBgEP5Ygw0SoJiYqoUCxqgBK+R8abjCZT7yQ8ApXACKYLTMm9TR4qgikARYoGAU53CCQa7/tTg0/CAHwUg75EpCDiUIoANO8IGJ9PTH8i79zSjNIK6nLQOp/4MbPhBACCKRCBRYoA5zsAiOO3KozkQs1Ki4QK7MT1bqlKQHq/AAH9rEirIX+CN2iQMJhLEAfoAAtWCBBqkR7NK2gSEaavMHcFgAYjgAQPulLDiADzCaMNIJ+ZAPB/gFBoCDCiC/bVovFqAHY1iBzpkbHZCEIiA24vEP6tKg7kizt2AFU9gBRrCGiJgojGgAFkiCaQCFM0AHHCCCQwiiwDAafwiBc6gBzkE3qTGAY5AEakgCZMCkkRE8c3Kzr8kL2iqlpJsRm4qWmPqHURAIRAgFOAADPqgBYAiE/4jIu90IlADAgASAlxRKgCeogzMKKO76h12oAisgA06hobm5rEOZg+ipCQNIAAzIMyBSp7ciGXIiGNcShx5YAkhggbP7Gn6gACNoE3P5FS3pBwQQCDTYBgZgA2F4P+pgnooYgB7Qg0foBa8IIpWrPjk7HAXzBx5YBmyIAm/wgxNYAAUgABAog0AoBWqAhVBwihwwAjOwABGYhJRTMw0hiE8ogc36CAKogzjotX/IBx+QHyGSFEmpIKZzqlNzQUkBgAvwpVBzB4FgBlwAgg/AAhLIgXogLWb6pgGggTkImorAABhogAickDGsiSywAA9wBp+Agoa7CgPAAISijjmAA/8nYTKIgip2QqUWhK00cAO9IIbXCCmbEITUs5kA8gdtkIUDoANJSIIYgADUqhvjiIjeCAQxQIEm+IVxcjzok0RMAwsBAAJWULMUyIR14AMcsIAcmAIXIIQXIIJNkIUXeAEZsACGFAFZaJIWDAsgAwdG4Jxv4QcvaAJm6AVcEAQf0AIHQB+OOsA9mr4u3Lae0EWBQABaaB3QmTtB9AdHuAcH8IcxIIQSkARuAK7i2z/qgACBTA8nFBJFbABbyIEu+BLE8QcXoBqQABGKCAAFsCd56RE/cITrEp+/c6gWxLXQkIswAIGK8KREQ6ySsKwkmoZ1gD7yQhYAuIEHYIIuMAf/JhCBbqgFEKidc3ONFqgDLiiCTVCG5ig2xUG91BSlayGBZhAEm8kMKECGaDCFTdgEjIoCOjiHIngBK8CBCrCDJQAc04ks1PEHd2AEegDAdokBfViFLnABWLgGWssSK8E16fsagLFFOcMSXSSIDtAHSGqdiKCHICAIKPAEB0ACShAFEviBPOAAbzrIEhsJreIFV6gCcUgz9JFPAUy3IRG4l0Kjf+iBS8BMlVIp8ZkwjzQ453iOt2ADbQodXwuSQPkWa7gFcENCvxuNQ2CDIuCCPCgFL4CABuiMhokpxAiGHBiFZwAEJVi4JvMEIDhCX8GUwDMaZBCDc+gCowGMEy2A/xRYA02gplRgBmYIg08YBkpABCpIJUzRkulqglUghrDyCA6IF4xggRE4gx8IgipJOJ9YqgcrpwwSDY4KgtYwDhEaAObJA+7bmxvQhkM4gC7wgBBilw9FC62aATHwgCgoltVLCENwmyL5JvSbCLz7BxCoh+xxvI6MsceKL4gKrDyClHd8Fzj6s/L7CC+ANCeDsfiIBVVIBwl5lRAJgC/gBhQAg0HYB3CTIgAIAiKYgz6YthkLsnD7hTWABb6DlLIBspVDKoX4K8Ixm05YhXZAmI/YgwwgFNSSt39IAq9kV4eioHOiS2JKTbLBmUZQJkJBDIp4gWJ7CzIYBG/oBhV4gv95YcVSDbSSMAYjyIFUWFQN8QdSAIl4eUwi0YEKeAMCwZyCRUCVY7C5yozuKJ2rqgO1WABLLUSM2IBE6og4OAdKgNTakgst2AdpqIM96LXj2AA/gAUpeAQ4OAVPADdrCSJC+Idr+BJIfLoxRYgUAQA05J39mNkjtCWwOMIxfa+38AQLMIN2YJ1UIQAKiIjPqwuGLYICaLIJqq4BvbZyos742hBR0CaJ0IoPC5AVyKkMsaV5EANhoIGQ2kTl6gERqIBAbCcn8QdkyEGOEMgesTAZWIOCYDJ1Tb2YDUoJKy+dQB2CQIQ3uiuKwohqQIr3a4YiEEzXoi6FcA4NsFBRYAL/KUCHEtCHKoiHU7gBJUCCUjwWNSWIIWi4R2DeomnZOcvb54gGRhjFUFJTKoKvs30vKpIwghACEfiBUDDBb/mDIwiEi5iBaziqv4LLlOIUawseAy2mojGd03CNxPCwEHmCNIii3e2AZGiFGAi2jD2LBJCEHdgBUZgPwNoQJyiLYtWINngHIgCFMrgksATLJqsuhBsf3Y2znNi5wXSCK6iAJ6AAieiBNtC/JzCyVFmAKUgHAolLGVmIa8kMIHCDDwACnEip23oLXFCAAIiHKjnQTYuwrzAcPIAHN6BEHkpbvdFTwTEa8vUAUjCsjyCSMpCBdgiFOmCCVGCtjBxFpBLY//q1jvA5PZ44JQGoA3nwJ+nhhxTKA5erEX9Qg0W4hHKwM8lVIbsoBxGwgC4olyHWC2/oJI3ggCSIAxlwBkjoB0wggjJ4hsw9veFBXSEG3EsTxaJAgCmoiFeYASmtm2aIBMv7pgKLhGxovAQkm1NrV9faj0gRiArbgI89wCfrZMvhthcZRY/s2p3YiyMtG6MYASNIBMNKlUNRgBM4BhCgFZGRZezS0zWerUlU4toIAUbAAiewgTomgIggAk4RAA2wgxzYgXzQwQQGCW9BjAywABx4hGxY3ruErCvoJDNgg7Y1gk44gGUQgo3qBQ/oAT5AqZj9u4YiZmJ6sqcriEjhgf++gQBaWIEB+NyL0AF6IA92WaYy4AJNMNgZnd7y8rsqeQst2IV/8IKUU2JzBNZ3BQt/2IYfYF0cluXreisKeosO2AYVEINj+BZvGbQBUAYnUScZqy50nD4/WlZUCoya8YcD4dy7KAkOUIWDcIQuQIFHaLiKfGfGFL0jIAEuQAFiG1uazgQWCIAqSOPt/ABpMIIkGIoEJZr40t0EfKwgY003CQsEUIM9oAB0SAB804gWSIQN1b9WIQf/0aGHTt04W2Jb8odlKLsy8AS8RjjO5k3NbYcgCFmUvsIDxesd/gQxkIJdYEUpRQwDmAQpksRbrDbZSich/lX4LI07gM26kan/kuAF0ySDSyABF6gBcY5Msf61ALAEFNgBERgBJUjTTZYAPmsAJIaLE4GtWOgEC6iF1Ijp+cXfSCVhvvbCSBEyYYgAWJC7iyiUd4iCcPCz2LUPGBCFuEzjgI1EsYGvHUWMFfjYuFpqNjvb3qGCUsgpJAzwjTQ4v0gZf9AED1iF1ni/JUKeRaiRAlhcBt+2vrVf8s5r7EAWBCiFjCASA6iyf/CDPiABWzCGRqABV4S35GYhi+CFKqgALmhgzHCt+fEHHPmHCGADBVOIR+S8TugCaLiDTAPxa97rgVnNTQNQA3yHYrjaKHW2dxAFKyiHQDVWo8LnG11NTZZUvoDXFOAS/yCnZndt6LQ1iA8YTAvYvIQbSoeOV/nxB2YogSm4gIejkMSAAWLACS3TSL4OPBoZ2C1UR03LNGFOM3+Igrjxptq0C6FKtBkHCf9mBBJQARHwADMwvQy6Rn94Ax144X/IAQLR456gBHPAzvyAbDaDjlp240UXYX65FiBLAR9Qhh+tiJqQFztAgGeoAtKavYsoCVsABEGsrpZd8hC+y8XZgnaQCAjQan/Ygl+gEgfpVd/JjDSwgjoABScohCuwFm4v6TXfD5p1uxrIA3vyCLswBQUDMvxF6blMdD+64lnGXG2QTXe+9Kso6oyOgCMQPi7oAmCYgRiqdYHwgV14AFtAHv9MsEIqkgt1wAEcEAbThK+CFV8RZnheLkfr6wlESFg7I2ff/gc76IdoqIHoMfZjzQM40GxN7uVInOWxTRFICAUCoIhJ8IcwgIYeKIURSDmyDSC9yW5/sAe7KoZmiIUiCBktG/AXpEQA4vgwEIEc0Ad/79ySiAQH2BqPD0r6rW1Ft+aujSyCCIF2FsNAzliBVAsQAAUUqIEKkAIXQIrxumIhOgdCUITuGQez1RMleAQPCAREgC1GRXueTipzFFMEPEe5GAZxmIUEMOIBcEx+wICQuQNGmBN0MwEZYIA2qVHZDvOPf2M9VYNVgJdT94d4YB4OwIBjOCkgQp/D0ZJQygT/UKiINlgFX3gBEFAFUgRxwJswovFsARgEHDCCbqjbjliALAgAEJj4kmbWW0f0f/lb6+LVSJGLQmghxAP4pfj1ktiAC7AALgCEbJABHHgjhcLrGTEERogFOOgeEtAhgsiEFwAIMYGc+Otn0B/CfgUVJlR4sODCiAwhUmyIUKLBiQsBCGB45p8Cfv8IGPh3TBCURaRW/OPn8h/MmAvMLBpmcaLGixkTXuxZ0R9Hf4hI2GhJw5E/Z3H4mVAwg4FDAf4EAChY1QEbFifGrXKX7QnMPkCl9mSYU6dGhxgRPOiE48iCmHLnDoCW4d+jhWZ97t1b9UBLuSIPAK1odmdEvQAM/0rd4uXfgJdzJ1OubPky5syXA3D+xyJSDQ/Z/BW4tWPcP2FpJDY0WLXGJX/K8JmgM3Vq1UNFutFCQNrhQ+Bl0+5Uy/Nw4rI8IwIoIKDjr2b/AsThBfPCMC2FPMyAyS/AXPBP2Ky7mTE4X71pIR5k6IaPpAEwV5y5I8sE5AAEaqxeKKAAQluEA1MpV7iATwQwHRECAgBUpZNe5h0HoX8FBVEICRaEooNmIOC3innItcbTX4HFNNhte/GFWHuLuQhAIjDJJ5JmNdp4I47eQUZOIi7I4ogPnjjhAyvM0EFHChFiVBAknCjhTxC5MFNARlWx88IeFiBE1XnJ9aVie+ott/+kcWqZtVgBCPi2xjH/rNCGSMbcoQgDOzRyYngDmJCDKoepaFhxZgoKnEEhNLHJLnHFxBl4Mc2yCCQ9kVFIJd41GlMwQhT03HHGoYVTe+v5M0QUMpSQBweZ8VPSP5MA9ZB6YVKkUIk06kiYVKAq9yl7tPrDyhz/GBAXeAa49B0/A8iXI7OaHWurYNDyY4MeOxDCBx2tBFJNMcvw1dFiiBUEYAU4KEdVR70QQQNhQC2WnpLxFrecrLHKaqZV/VSlrz9bGJGHDSIF4swg51xxTUuXnsjZKqcMR2iIwgUaZpepbDKJJYrKxRkBMcnBySoVRFKNjJLBZEMd9vhH3K4YnRf/6kN4MNHFGRckiNl3/ywQBnsR40SiP4BJ+88DhX0pb2JdKiQNZCINQAA/CXRsQGSdNXu1ZQOA9xKyAdjKzxzh7PBIJ9l4M0cdxIASxzVv+IMAuFu+KxGAaIzzZLiuQQlGFF6ItS9rL0/Ys5hJEw6zvYO/elEN/2zgyje3XHEFIx0vOxkB8CjyIIWCw0vvmGFqgCEXpFjSyAwcUDCXAR1jnnMDNlBjgTa+OeeuuILDunuvFGnwggw5SAKBqjCJAHNfaM1amNCC/UMY4BNKPGuoC5FRxnTfeU2jApwlizX4kz1LGT8xWLMLCnbsUIgQB7CgQgUV4KLEIewA4MBiVAH4/59V+95uyt8Y8q4C9KILMJjHbfZFqOp9amKBO9wCIxQoiTioKg/wDDZu8Q1xxAMFINARXf4hhwOsZ14vuxeLJrilLcDhBUwogh1I4IIavOMI4dgDP0ISgMiAECZ7QIE9bqABd+VPX7xTGose6KCLOIENOChBN4iHmQAkYAQAUiFyunSRWjkPeruKYAqVV5VneO1pMSmFGEzwHdeFr41em8wCWNCMa3gDByOIwiQ6gQUJdKAYFxjBKpiQJChxRF8P6gi+biMAK1hBSb7hQTyqkIQbvCqRyEtO7yTYqU1a5HA/8U1VYmENAkSiCcsIAwMIMQNonShn5NDUiDxnmFhqUv89UglCKuzxDUDAIR5gmMAgosGHdlQKJt6DiQnK0QVmIAEICQnXc/rRkSXFqzVgopVUyCCLR7gAFiarDD8qMUQq+UmWvJNK8/DkxWtCrJOwCgoVajESAiSgGWagwi8UEBkCXK6N4OMHOerAjXyUAhQqGIEd7FCEIjBhEtIAB0LcgA8VPKIdPzAEUArAOX+kAKMIWSJFhDAIL2xCPUFBgimkcAwyfPRdsFJOTv70p1g1cHDiogg5/WEHmGRjGewwhxVOMB3KKOs7E9BJuKx5tN2xzCxUqcp/gIAENWhiGIJQwi90Ew4a0Kh85RhBKob4UedIk5wAKpxwlqe84BzkDUT/QEEV6KEAzRhDAg46ayLT4xd/XHBouBoOr5QEqowAyAgyCgAb/CEBMcyTlf50HmQpswEV9EEcE2BHEwbRBGwsgg/i+IQvIDFEhUDhGCVwwRRMIQEBOKADPgACEP4TBiv0gh2UcJBZ7mGHekTAF4uzij/UIYs8lEMCCqGSmE74sBWFroTwOppJmwOgIezhH/LIBRyKgAIY9DAmPVDjPzxgtLzWUlQU88lUnso5jTgAEYPAgSRAEY4LqKAQuZBAAquSN41Ok0w1pd6ngvKLEcjgDKWwWniG+g9i5GuWWnww80x0qxS5c3q9Sst/BHAHkbTODrlA2FAd+9iEzSVZ4Hlj/8dOUB4AhOADIeiAAxzgAy2kYKPS9McavBAKHLjiBROwwyjsgIIRjIAOV6hAIsyQiBIg8EHr+EEOYnCMJM3LH6fAhi7CUU17tTN5rFlrYNOKXj/1bAw2SIA71DCKHciBn17bnkgSwKpV5CqpEPqZzzx5EHTx68Z6IQsPMHGHPgDiEL9IgUMedB5wGTJ0I6JemWzpj3vgoAuJkMNIpKWABvBDUVHY1E2Ym1aFSKWvXbwNeqt5zT9PhQzdaR0+iqI9CY/4RDqoQzOsEQwMNMAAUhtAAhYQgQyUIAikSfVHDWlEfyQDBn54wSYs4IoauEAGHuCCEWRQASOIAAcWkAIX3P8ggTcAogoq+MI/iGA4hWBhFMVAAW6mwtTlIdFTZKrXSxc4PaVBpAn/CIQWcEEIavST1uChBYD2pUD0iLlnP0vrU5G7UWQ7IATI1kkBNAoAuE0spujx0kelUoADjIAJZtgA+RKgs7goIBNbUm6ZGOirdE44V2OG9FrV8i4EcKFjHTNx9mhda35EABWSQIctYNENTtShDk94AirykIg7/AaknjsIR4QwBVbkAxpneAEbCCEDeFzDGl7IAjQCAQoR7EAEJSBEESwgBnT4ASa26ICXACCOTezhFu5KERgzWb16dY44Ezyig/uRJj384wmOaMIkjoCPE8xgA5dD1j+oYez/BkUaXxAbLJk3VRUEZFwh8zhHF2pggSL0ARHG1gkQoOCICchiBJ2AQy6QEPKMB8VwF/68JRECBD6YA5CpKvh0vFaSSBi3gncO9b0KY2p1Gi1EyUWhuzjFg0pBrdcGmGumax0tfiTBErYIBSnekYd6gKIVU6iBLIydP9ws+ydSuQQg/IEEEfwhA2WQQwaoHOvMQSmcQfz8AA6IQDAEhjFYnJJoAANEATSkQuHcWV7N202d0Kq1DGB5iXNQgSSYRBfYwTNYmwiowBEAAzSkSkwEwhpsEYRZGArpDntQBUS4ASlgwGTYQCm4ggdYAQp4AzCQA37IRQtAQw2MAUJonPSI/0hTpdUSBcE5vAAKRMICfNNIGEvHwIAmjIu8DV6VvVSp0RqKRI/D5RvSbBxCQAET3EkA9FrmEQNksJH4GZNIEAAEoEIivEM9rMIUqIAMGME2KBBUVckz+QoeREEQMIQSTEAruM6l5AxMQMAxSIIYTMECrgo/cAACeQoSlCA0vCBj4NxyPZzi9M6DHV4WDVbISQUAFMLqdEMhbIIHDMI63AEziAMdoAIFBEMdiIHb6EuupGLyRBq9McRzVIUPMIA12CHUUIbCHAsdxgAKrEY/2BVbARgp/l5VGIIsEIEVcIOChdA/ZAEyVN0S1Zvn7QU6keHzoFqoPZBOiFxPhMAgCP+DpYjEH2DCNtRhZUQGjZQBMazCKqjAGaDDFBCBFiTH3BxiQTjAEiDCmPjDLdSdhCXLjOjMH7RBYOTME/iGKyLEDVyBBxgDlUnTetGU8qDiKiYRTHHg8yWNnWlCHjTeKDiDGkCEVAwCKXiACFiBIiwEcv3E72EShXwhRFRFGKADPmwG8mEGKnTh7USfBRJepOFB2InAY2TPS1ARBsiBGLjBRTyVLMkjhHARnhRN9ISeNaEFp4gCCehBx4AHQK5AEyDAJbSEJPpjif2bGEhBCRzgOQABv3DSmDgBJbmGMAJILFwBpr3ZsbzRxrhEo3QDK6SXQiyDKezCOywc4VzYS7b/JJi0JWBlI72AHkUAwBH8QxKIgCp8gBEJQDT8QAXsgCy4DUcMo8OpVSqWhYtolGIxwRwcwxkwgjeUwwlgAAWA32SwCmRQgPmUgQlQQAQ0yhzcAt7V1L49HL5UBRSwARt4AEtwjTHRAhaIJUJ4wgvEgjTZHFsxnEa0o18VxvOFnqDY4CisjndQJnhEwhZ8gDLEhYjxpUisgD6QwhmMwCcsw2Uum8TEVAggEpeMIkJQwixw5dSIDwF0BnjoAAV2hASwAx9kgd/lzeC1DBKdoZdgH2kKSgX+SVWggTiCACkcAhQ8yDfIAAlYwSMoobK5pIhUJVo0xzSpAzVYww6Agw8g/8QHrAEl7MM9YMMO1AM3VEMGtAAGtEAt6IEV3IIgoAEU4AEkIII2NMEZPME1yIEt8MEhCMIQcJ6n2NvV6c0bPMImeMPPmYhI4IMrXAIkpAIOwIAXoEEladLnnQtfueM6hVnE9E8slMF3VA1lOo4yQIIhIEHdfQ9f9mUCRMIZTIEV6B5HJNUl3QSXOIj+LIRvuIEt7JDWSKZcsNEC7NCCHVsKTMAkWAOhRp8KBU7MyRTSEGOjEl5EcIonIEwD5MEBaAIUCMASGEEUjMAL7OqmXBIaNtCZLJEGVEAPuAIl4cZZ8UUKbMEwaAMWYMIWhCuyIQAPIAIc9MIt2MMy3AB+mf9QBK0bv2gDDhABJwSdSOwQjUBAFtxMMozLwgGrUcrnqa1lGKrQEoVBda4K1BzLPxQDFWgBDyBACD7jpsrFPu3BMUCDHtwB3iHSqPEbSt5Y3uTmNAEACWwoZ/DQZJhAqpBEACSBJyhELDBADcRBwgFfb5bmKdorzpFZzOXcYTiIA/gDEISgArwDCXiBLQwCCeAAITyCO9DKWdASdCXG6N2CLoyDwxjsb1YQSiKbIXFJNIGUT6hJg2wSUz1oTyyBC/Vro3CNS4QETDSDKGSUNAGt0faEwlIfWejV1j4EgOBC91As5pWBGwRBGvQDE4xEx4qPrVBAPdCBICzpSjqaEaH/KsseBH8BwAegxsROhhewARbcwRlMjQIUrD/kAjZQgwoAF3md5tZ+5s2ZIlt6bjm1R+lJhSHUJAR0xz/oQhVcrRUcwNIqXkx+zhNCRDZkwTkcl/7MjWIWJn0q0G/lS5oIwNu6yET+au9aRTowwSjQw356T6OABwtcAg+klwP8x1nM1M+gZc295DGy1WIQQWWAx874wwcIgCBwSOWKj14GQBl0QwWwQTpoQsIpGmhWkvZi7+KoQ3W1BEDCxBMoYUIswl0kQP4FgYiSgzPQJysqlaHG6ckeJRa10739nnFQwZ0k3z/8gQt0wguMwkImI+icSSlSj4NQwgsmF35dHNui/1cB4MEWFFI6VplhtnBxUIUDDII5jEIp7OdQlZFImMOWFIZLyamXjWXQKGr1kaKLugZr5QNkTMaykIA/vJjGHvBlDIAwhMIeksIIRMMQfBniJM7HIYQj9ECIiUQJxC+aAIgiFEETAIgQJAMhwADe8OaXfBzDNaq85BsUw1yp8sXLPs326MElkI0qSMU0wbDXnvKX4c5H8cUoiIEyuAM4jAEmDMIlnAE8SAIxvMMU/AAKmMIiYMMBMIE3JEIvIICDcpID3ZuKSIUGXEEU7MAf7KWlDAAEqIB+vdT1JU0S4W9g/JWotGWXVMUYcBorTao1IEE/LO0oDOgBKwAvjAMjmP9BCaiACNTANuxq3HaZYOGUP4RBUZTnkgII3PBPyIXBIugDIwCni3Jt4R2thJxofcLnboqz0gTBKmSafOwJGxTBIqSAc1wRsT6TRuVOJ+EWYkjAJDxBHBSDH1QCKqCbZQQAMIRDHhjBICjBYiBzBzohy3DzWPSDN07CFECN9zyL1wDDMjABtXYSpA2KRngzitgc3LIwqfnDDnRXwuTMpxkbOLAEHU9GAMzAHtTBD/yAGRgBEZAAE3gCmIEh+SYEcoHDDrjAD+CCxUHVowFFE9ABN2DBxSUOTSmX78Etr/i0THGniDSHP6gCBKicGcmBLEjDM1BCo6FVWoRxP98rQ/z/gh3gwCMQAhPgQLDQ4XcYgNfsAhPwwS04ggYgElA/NcXU70RUBRLIghWAGD+w0eV0DAiMQRhudkzxxODqSNFQNSsGMkJgAUfKrMcakx/EAoylgDGEtfjIRwPoARf8gAXswAhYwRKMmSUFaZkwNnqlwQ9wQg18AxWsYSr0AS40ASnoA941pK6gMtEqszZbYAU2oVOfYUbojyVkWs5cQBMcgCh0AKnirgM13NkiJSKmw+QUQglMBz3x0HckgMp5AR+kww3YTn6XE2ja63kACCaQwCywCvt2DAFOwxfsAiDU308EruDdBs198xnz2zP1jjtwCOY5T7LExQ4AwJIyjV6S/0/HggcFtIJPusAkiIIz6U4KP0Te/B2n+IQb9CtMEEAS7IIlBMIUMMEmHEAW5B/nQe9ycZm1HraeYWssoSwaNtoVKJjXUIAF4MIDSCS+7QQhBt7vosf+SMAHaAEsxMACGMvWvBEFbMA0qPOO25lZhqZyce8HmMIUGFNgNEo1KEMHaMAQLC2qrblpnlMZzydVpxrncd40MQMNYLrCUEYP3EBVDAMIfMdcHfW/Eiit/kMlqEANjIIjNEhHTOi+MBpuuUjEoSSXIAQiVMAP8MEBTEKmlgR4zIEldEE/UEET/IA8fMAXmtcFEmU8wuQyy+lR0ltRyltVgEMEUKYZtcAL3P8CHLh1MvbeTJ2i58bS3IybDGAABsBssrxED/SBn1vYihxuSwWFQoRBCZzAG0mGDogALH3R+BpuP0v1Oxau4DnHiyBEEwSLv+KMLJCGD6ACTOiADpjMq9caggWDBVRA344ql5Qen1dQOt5Vc4RLVfBAFAhVG8fEsjSAPACiFAjBPSwCN7xAg2ngbnLyvJXXQ4PhYP83MSIGD5h8fli4H5zDBDyA7qm6YgOY3A5KrCwRHpADNyxnpHaGHsjDL7xKbvaZuJ9o3I6V4lWFEGwCNIzjsUSAKYyFb1gyWvEmUVqQGZuhSRnSWe1DOyS6SGAhZSQBGgDIFUBNDFyAzzvNyg//ndcsgDDAAxiAksIjYwXVuwY2h58pw4VSRlxwgBdcQBWggBnUwDIcQBdUwhYcWxgzkEr+cP2KPZ6NGvQm9+EWphQUcmBMAx0swiB4O5WYaPC/OchVBG61siyAAhOURN4+zRxMAArkwhA4U0JEE/Sl+YgDB1lpgSPe+tDkgGKRRb3BVJA6WnHjuBmaSTren49jOKwCxD+BAwcS+LfNH4JYwf4NYFRM4AB+/AhWtHgRY0WKDQXOMAZIAAAA/hz4o0KJij+VKhF08NGhQL+VMwWA46LgnwEQwBihkHWFwZIrMlRUkGHBwqRt8fQQ8idzZD+pT1fKnKry6lOrW6d27YoV/6tMrWOlir26NexYrV+piuUjMAA/An/+BfhX60q8PnieAvBKFTDZsmEHk6UqQOwaJLsGJPinYCOpB0wAbWPw6Y0GsF85r0WbVqtfAAJ6veBV9x8/uwIpulBZIGrZwX/Ntp1Ze+SB1AQpHvAXdeZmvwL8WXEcQAHkunY3ZqSoB0gBAWb+6WgnppbE3Rm5dx+oemLcgah8iFR5oFqDLLCIdTF3JseUEYWSJeuDZd29MM6ijItwwppE4lGDuOD8UUIKGVCoAQUGbrlkmjWeEgAx2dgy66za0LKqqg3butDCDT/rLCsO+xkplxZYM4CTSP5xjJtJ7GgCjYTEEmzEG2uzrf8t8/zpwBNwtmHkiccM4AcCYg5gh45BDuBjFD4WwYIHv3bkcC3PQDxRpUzoeAeCAZBjjaBCfgspRMMwtJCwG/0hTrfmdvONuDXDotCfJUD4x6C45JTzIrsMWEeldB4D5YdWIqhrIu8c5a7Rhgb4pxJDVgIikO0I6oYQbHwZZp50rPhBhjPqQYcJdj4ZgqZ+BJCuAH8OkAKHKuBx4ZA+QHkBK8TaDMxOsEArzE0NOwRMx2I//BBLYLWKlQoYlvunkTEyFSiJTux4QcKpYirR2WaPFVaAD95w5gA6mBilAnJcmOGfTdIA4oMUgoDkF1XEaUKae0oKbDOA1YJKLAAQ8If/hyZwyOCxf/J4ppKBajFHgg5nc5Mw24it6jdZNZ2zYzutGsmHaR7NSDxGpELDmn+4UYGLa+rS7uSaLxqggX8WyEIWJ/xZQw7UKJqInxX0EOERQGJRCYACJIh1JitPFMkvf3LxwAoScvgjEFUKMUaJgANOdlixeSwWbWKvpG3tLNMUzZ8C4mB0Ij7maaDRYIywgg5mOvjN4ALHxdDii59yYphPvsGlD1G+uUOTLQCYwhIDVRLAB0O0SMFXYE3c7EbYZEPgRCyeEYajNhzxRwNM4DgEiqdItzItZTlOdkem/Xng495CFpZwESa1WaMBBjBhHpWk+McGLszhowRJiZ8e/64EDHDsH2FwSSSAAAyyaAFqashBBHEqFslVCguIqceq3dikEzZekOefJ8IgxTXgAMYdeI6PZTNL/TNQYfxXu9tgzE3oI87y4mIXHbyhHNPiRRV2QIJBOCF9OhrcskC3EgCkYQhp6IAEghCEiq1EDUIAzok29i1xfU6DWgnJTN4gDUbM7B8keJOBKIQ+ZyHLcrcDV2569w86IcsrI2GD8YZHPbtM6h0yOUQDYLADGWBDA6hbDfVsdqQjiSdMyqmImP4RgV1IwQI1iIZmfiMV0bgKYyFoQhRkcQB4GGQUfbDEGCzmmcKRKEN9xFFnMmYswnkFS4fU4EiSkRoCEIAiIv8gAmsmJQcXvEAEdAhbPw6GMbcZLpBXGQlVmsal3yCAfWupUIWYxZZWlkWBxMnENkLRAALY5Q+swMpo+gGbM+0wkIbpYJrAAqciPuB3PFKJKeyCNy7yCXsQuIM/DIGPFRgBBziggj0g+UybDeCR3ZOLavw0NNZsRAHX8IAMLhmGFLymL1XhARRYcYc7JOMFOWiGQIghiCnIwI+gO4uwMgaa/akJgWMrJEEvFkMMSc0f7hDI9exCAVHQoyEUoAgvYOGCEZBgGYILqCI/dxvApY84FErp+tgnlZBYqU5rsh0MdedLdYyiFRvgh/H+gYI3sRB96xvJKN32Sc6oLYEe+5P/EYEpyCvk7EXeJMAX/wEPlUzhH7RAARFuUABOePOb4klNXCSimooYIADaMUA1JOEBD5DADu6gAlE/oIk+POIC1BCGPOJQDBhA4DE10IAqOKEIwKlFMMtCpEmRiEjZMBaxj0Ug2vwXyFhxKRdkZNQ/UPENEKQ1UnHAgQy4EA82SraPoLyYD4eDPr/MzkJSo91jxXahw1AFCotQgQnG+o8MIOKnb7QS6Uj3l+CkiTbOIuJSffPGM/kqCrwBK0FYsA9/pIMA5MiaOPJkALpFarreBBSfoGELD6BABkTggzl+4ApqnOB7FpFIC1ZHgkRUTWQBPBttkZq2o+qXoL8aIAdF/xQYQ2QBPGL9gRXiO5BgqIAEHrgCJiQAR6qx8pACTqxkE1kiNm0lpekLWcHQhICRKGEbpFBRWifViTZqCLUebmzhDHrbOEnXN4MJSYGIsMXwVkQS/VBCBlhABEKAQTo1gItEfPzj6W5kAF/oKzQaAdXvpGZSFElAWg0AAxTo4xCILWpkfwWuV5bZWAIjUQfFjNC0SIAaDZlIArZMABGYrDlxoUErRoCDLjCADG18FWwKxN+B3a52lPUQY4EKTDjWCTGdK4AgCFEMBUjkkf8oRhDiBsfjFrCyjEboIpUqXWQOpmn++MURuudkjShgmuPghySYsIlA+2AXYxWrq8G60/+PfQetV6bIAGKwAUEJRBjvTCnwaKtYAv+XK/p1ZW25QshgATGy3hDaVA3SAng1Z3gQqAMKHsEFWWijJC/Fb4fJtlhm0XixMY7JwRAz1DodjJqpmEAnuAEXfhhgAD3IxZt4CWPCaYmAQPxvMUt9Zd+0VCVwYBivL8IJB+jmBJ14ASZUsoZqvGgB46U4FynSwJI3imjlrEQrrrFT8DyClAPdoIdM9JlQK3SYCTdqMNV2QMCsYqyqMd5qdt1Ane0hFFwgwZGVEG1EF3A2NH76C/8ymh1SQQknhKcAyICFK4ygFUHjk874kQBAxO1Nl92vSZ2ObQB+erk4ZlqseECEnKH/VeTh1bI4gmCybjwjHb7UE5/yPvKaldUifkqNORNQC1fkoBu8IMCkNkCJn+K72osepLTHHMAPf1JNAzO455gtkyKQyd/gdaTQBQIBXZSgC1boRDSQYEBPFtjzo29s1EnsjyAAAg486McQFBEGUeSKASgghh8WsHhwEiABBLjE1GYYdT9myLggYrNMjNkcszZXJZiY2252TfFJ0cIfn8gACF4ABkuNZBFHgstmDX8R1RNtqRH5jln/QQFgnCEU8mAKJAGqnoCFYKzzDE5cNk/hNuZ/Pq3mkCvR9mskDsG7Fm+c/sT7NiIAOGAW3oELUCAKqIRpoAJqnI5LjOuAzKxN/0apanylDyzABQZhEMyhE+hIBrwBFrLgeyYCktLKLlYgE34KTTJPmUrKAQ3HpLrvnOzCNxJCFlig/uzvH1hgCNlA0xgAHE5EOs7gHxpgy7yn/KYwPMyJN2jAGMpgAJJAASbP5Yim/2BBBcyAFFphCqaAGyYlCq4PAdvtqGbKCH0uoXJH+zRGzAxpKhwhBlDvZPhvA6DhAnLgBQ4gFdgIYZTBF2LKjaQGkHzuoKailHpJLHKBC1YhFIygC35ADIiBHDIA3FIjOSwiB6hPYMos0QwNteCu4VQDJ8DAH9AAFOZvCnnDMeChHwwBIoQhHjrAYFgnzoxnp8aw/oLtRRrABP9OQAeCoRyeYBEkAAnGIA0OwQZ2w3gMIgY4oR1KQAxIIQdWoQrMoA0U4B5ebKCuhA/bhBBV69lcid0qa0Ta7N1UbQ5+rRG/oweMIRyM4BlOIRaGjwjM4BSsgjjQp5PqkfcICDdMDAEKpACwYARKoA70ABaAAQYoIL4axS4IIAKsbCAowLAwzLGywvMKisMAjAnpTxYUYW52qomGsS4gCQQsTxXgRR5E4SlKghLoYgCOpPB4TTzkoBzq4ALggRGmoAREIBq0IDgGIWeaYwaOoAZIQAYqQB1LQAaPIQs0ASANMdpkrhZjiO0GzJMCDNHycVwAxg1OoycdBeXAYyAGAAb/yiAfqgAQkGEE9MAbmMATdsmXPk2A7lGmniIWJiAP6CEJ2gB75k88wiPoLoIURoOVVlAF2wz7HnAlbhLL+CEDkuCRJk8aR46cBKILVAIbvOsVWMVXBoECWOw1KY4iCEAfuKAKzkAMqmAbHMETZCImOsBX4sEaIKAMRkAarsAesCAW4CAHqoAULKAKXGAKaMFn+CsmBckua7LahiVYVDAXyXOYDOMDIGJ64PAnVa8BWgAYoMF6TkAMRIEHMC82HIuhSGoT/SEFlsAKLCA7ckLYFO+czPDKNmB1Ggrbxqbm+sfdSGl3tkOcNmLyFqAxmszweJEisoBV/KEC/iEG6EAr/61uEJqvKUcuAahBBaYgFEqADdxglwrOPJBAFXwmOG7BCEpgCipABXDgB1Ahdgqmamby3WjuIjvv0LQPI/2xSRVLBSWg3/bSOyKlgcpJPFYjUigABmogHuaBLyyHatAHqDRIJlVCEzbBAkihEpay1fBvO+STQb/DIFwhptYO4QQKhhwQLOKuM0uuIVrNJy3CAJJBJdygDP4BGkQBCE6EOE6UAh7j31Cj/uzCD8TgB87ADCxAFTxIKmBjNIgqfWLCB6RhBFygCipABIxAGIwhJaiOmGSs3V5J0Zql2dgtzfoxsqINAGzhRV7UOa4MA5F1I4xmB+hAHHJBECgBClIgBP+IKoiuVSWG4BsmYRUsgbfAwwR0IAHAQ/W8A5J6QA3CIiZoZ8bqMdQ2JqluLFFthiKuQQKI4xaaLxIy4QOsDgjGgU+QI8HqDydmoQZcQR1rIBk0I9LqLSYcoJcKoLhkwhFIoAK4QAREQAr2qRrOVBDPM/TqkqTYkqYANPNy5BODdZf84Qfob14bARUsQR/QoQJGYAQuoQnE4RPm4RPCIAxSwRGQ4ReQwAkMgQfmSQtOAlScgQjegRMW8Zz+AQNAAA6NtXj+wSlEIxQV7o/YjmxmciR4x2rnVbr4YRn6QgYaIhLeoMJU4gZOwzGyDER/zOVoQAVcIRRcwAN+gOMiliT/QgJqpCPS/GELXmAELEAEkKJl/oET/kZEBpFtujb7SDb7AhUfHRO5csRNJmls9a45CGAG/uAPdKAayiEczqAEzEAFPMACUIAEiMAOroAPsOEA6oMPiIALpAAWaMC7vG/XOlcjdsoG1LKX1BRQrc/QApLU5JVsbUYPAMcBXGQAfmAI8M0f7qAWdIbFNtWs8qEEauAMpEAMikDrggMBTutg8EAaLCAHSiAHZIB+JgUHNkwmde4PL1cuz4ZyA5RNQZbNtATt6EA+E3XYtDQADGABGgACMGADViALUMEYIvgJLOEVxkEPdGEWyiACiI4zkxXliKd7JiUHEmKHRikCt+/Q/2bSTVCzeTECvCiCA05hhxShDf5hBprADT7AR29AH3IiNg2PORLAD7qhBmrAA2QBYpnhBTyADlQBE+ggEuJAFvrVJArBFVg3BzyAEy5QAeAgatgVwBgK1Nj0CAOULkmzxjwRLg3oEVx2GMmVM/lvephDnOo0ajeiXLtjIiDALmjA8qpPmVYwZc+YYwi1hV14qdABLIwA2ZhASkLKH4agDhiFOWBT8SjgCCqgC0igF1yAtwSCAqBWIIySFTrBBSxACjzAFbKAKf+hBYYBiQJqf3CxjBMOeUlPiDoMH/uxNMsiVuiA2+Y1PEDU5XajLxcPhw71/n53/wiyO6wnZfqiMf+FSTxj2R8HKmyd+ZAReQbUISEAwBNM5h8swRyYgATCIFstwd+ybBgp4BU8oB0+2SIaxQ4OAQVcQAakwAxCgQZ+0iCM4PoCGoCQapcL+od2uX41xqEo1MxgyR9UAbS2WaK9iQLc4UxMePfKBnee9LbEdqK31CBEICFiBRNUpAXKwRWe4RkgQSWEIFM+mAx9qxWAwTsCwQPEQAZ2wAPKgWq3Nw4CzYX8VJdlGQURzgiRt9kEasYC+cMGyhccA3g/WqoF4gmII5VMs36h7eAYjnmnep4n4gTeYEL8wQIGwgRowRxMwRdK4gbGr5t688nExAs4wDsswQNyoBVKYRwFQgH/vGsWcLRXCyyUUhiQPExk2m5K6fdCr20rRuIXACuqvXqiFeDUBHtCBQnncKPhJLsijK4CJuQYXQQyAkAXPGAUBiF2nIAWyAmunyyteos38JgfGsEPGmFRKEkgXuEGbMRXnJShAZjnlLotfRX07BfaGK2o9wEnIpuzW/hIMkCsOYz3UjiQq5uFm7szMYDjJJZAu6G3kmB8R8EZkAAKXgG2Q1RoXjTPdsogaKAQ/oZ0ZshK/5EPbQ4JqfQx7Vtzbbm/ePlnNgC7A7yz7WIKOKi+UbBylWuzA5xcs6rCmpEHUCGqBEIOVCAKoqAJikBFeMrfeM1BCYLoFq9LBSIDXGAL/4QD9CDLcuAyvy47iNKMkG3nMX+oVAm0nwWcizZzaJqMuZEVA3whqwvKa3Ontnaoqxl8IBoAGeKmGd8gYmLzBFyhE0iACVahDQFuaOT4jaFvmMUqAvKA40ZsAqu0AS13oM+85ypUmIqKBaebsUQCCILmAnH8UcB0KSdCTC4wAy7ABHocWWGuTbGv5wCVLg1ZwOVkFYaqatAAoxqjryMAFjphE+zAG/rcT+xibmHT5SBJO+YgD5CBOBxATYlcCWVuct3u86itSgE0jDESlP5HJDQAGujcZphjUsTE1/4BBlRAC85By4nnN/9hF9ROhYs8yMnsug9dIDbAF36ql/yBEv8YonsIQAEiIBKsQBYW4QwutZzI9tcVwAIMC7Q7RqHN+HGB25b/J5GaNNApS4CIvMwRyxMGMtNpfZ6ZbOgMohgYIGyGwRW19PCi6hVCgMxC5OBozqCgYsFxHA4voN7qzR/mwQ8O9YAjYBrq4QWuIBTi1s+pZyMiwAaIIQMC4Bv6gpe+5bgU0IAkl9lWfC7R0yINfFd3rpU6BgHCQZvtvbMNVSC8YAfS4DV04QsBvmYu0Bv6QuVtrtwBUuGPvLnvjx+UAe0GVwmIQSAaoPkWgANogQ/4YBwwgCOalxyYwBluYAtqeBY+4TQ50WxoMi5XXqF5dbphXKP/iIzb7uZcxR//REBTdR5SBiIBdKEIJIQqFgGaOz42d+At1b092z5qFp7WKSIPZIiFEqIGKOIPavgxeKEdNsG7MbCYO/7vr2AleGdSOEASwlwkKmQ859vUk7e/U97gAczdDJtteNkrYmUTcl7ZdY3/IgAYlgAIVvYXGOaHnWgiaAC4VCIIPqFGLlp0JrJzxHguuQ/y6XwiIqAXakwC7GBP0AonHmMaXOAVDOIk8/jJKKIPfkMCco2J+k8MFtNVpKaljpqob1HNSZ3qCtqwAcKfv34DCxIkOPBgv4ULEyr0BwCAv0X/Avy7iDGjxo0cO3r8WJFfxgAiA5jU2IPUKQkC+xWQCOVaxX/8/yyC/MhvwD8/nz5hmxKJgw0UQ/wJECChgIB+AAQAOFjQIUKGU436O0DzptatXD3WtDjtg0CHS/05a0PTgAECCfiZKFdKJL+SNrvaXSIwFYaaFwcY+GeNjqGxTAUUaAiVodSoDg22pPq4YcuxkSUrRkjY4GWFmCM7RkyZYDq7pEtnFElzrtysFxtJIgKu5csCBfyliPSvbUjTF+cS4NeCw8Zg2xD4Q3C0nwCImqeCTjhZIlbUvKuXFqlzgsOnTWu7o/HPgN+5FvcUEz43tfWPOiAZZRSen3h+BDAG4qPNuFOJzSUThgqdZpNRhRhn/mHm3EMERgXagZ4V6FlZFNW1Xv+FGqXXkSVgaDGWYREp588H9fwzAH2qWVcidQEooIBNCfwQwkBO+ccghI0VJB1rFu7o1UyVaMAgAAggUNsbkQQwQIkr5lTLESv0piOPF9FjXCYbWJRiAAQEoNZFDdATjXGMTdbfgAo62GCNCToXWlWNKfYmmzc2CGcVUUq5HnUYyRHJDw+IBdGHR73kDxL6kPiblr9VVxIBJQ5gEpL0mcQJMgIhwBSbnRmY2XLT4Qlqb3Pp9A8fzAWqHFP+SADKP47WJNcMNNRH4Y6rmSFQEamlByuGFxEQiaUCSUQsdJxV9hmEmi6WmbEDktnsQ8+GVqOAA2lhg6uhcqTnnR1xwAv/MHlcEYuY/hwW0VL6+SNEPiSSpCRfvK1GE0l8WYQaCFWgMexC/ElEYGKZ5djttlKKZEwILoH4nz+xNENiiVsWzGNOBBjATwT2nOvuXziRygEKnkAkgH4AHHZYZjQyJi2NnT27cmItI1iVtP9Z5phEh8Bq8IWq/ayaxxftEYo5TaRCRm0tPbVpYf7cIM9FJPUMEjm4+DDsS0fFKTCO/jzgLdUVimSAM6hCpuoa75Q0KqmhJpnAP+QAUSh4bnv06EVlmDIWcggA4MBTZNYslc1qWmuZgWiqHCCAAT/22Vjo7CZ2VqptGcACUrMw7hJIUBZVcnD283dtjtTyjwIk+lo5/0b1LZCHM8YVpuqcDhLc+sH/wBLCh5BFVJsAo1CQEcah8vVXIgINk0HYI/VKqivuKCKQYUo1DjmdN1eWuLXYj5nmgjXbfKZAhsyiXuUkaYndRRvQIs0NoKdL/4IdEqRMtolSnLtNGNSTioHQBm2RGwvucjc2jCRAFDKSWUQC5w9R+MFVrMOTbxrwCYGQgRfOw4hOfKOofywgCZLQRANplr2mES5AkZvZy2ykuJexsGug88c+MjCABfAPVFPDiAJ2sQltIKQpTzkMZLB3kOW4AwS5gZSSEJgRnTjKIjDYmIyQOCarfAqK88KQSI6wFP5ghohC8ocSjqCTux3MJp1IyP8QYKAtnCDJXibCyAlUIRClQY5xZ2oZEmPIMjPRSVlHLKSZBNKLAWygBbmjz0VsgApnLAdVTQkUyTKlnKV07x4sCIlqkrTDnn2FHwmoTwZUMA8xDg57nuogF0nDDw5kcJKVqY3gJLCIbLFmUV1kjUgS4YBJCgE8oWQNvqiDGhbs4HNnM0oYA2mj7DHLkDdT4egEpqnLSIU/FfhHBvJhk6kVcyYnGVXc2KaenGCEF4tQQmiYth0EqdJ3eflCVijUw1diqD7/iEAowmBAxcCzQ1dx5Su5ghpGwLNrBKmkP8ZQB3LmszTwIoCj/qGPIBBpISEIRPooippaPIAl3EnXUmr/Q0CYrVKb4+NaCqEJrdEdkiAIGIc3u2CNikCqVtwaQAJMoiSfTswk/FiA6qQWB0AUxVhNQ5aZSmacPvSgIgoo0UFBQp6LtMAIyABYybrjgOgUdJxXvYlIMuAGz6jMJVbhgQdoRdaPWJUfqqvGFi6FkERUyIkX0Yf8BhKRv53Ldo5rzvYKdMS10gxn1zycg9DAyEo8QwoGQFJubpIinoGEAMJABxiABFjBGbZazhLScuCAAQqmqKx4SyNqKFCFtBoFZVWRCNjiytqOoEYZp2pTQ0n3EtKxQXMThWV4SmQCbTjzpP6QBYkYRZKL/oMGdgDSwiISEcQx9Fg11KZjBEnY/2V9F1rMwUQ/R1AEEVhCc6v1CrwcuYBmoEMKFajCFAghg0SgYBTuGAxet7YYmXr3IdKIwEVHhVsEjjKrgBlEh5wi1i3mFpbqbONmAERP/rCDkQneCH0u9o9JyIg2g2WHOnkzx4l57BhWDNxyCou28GGTpX70rUqzGWDESAQZ/9AFODZRARdIgngV9PBfLBIHZdCtht11SVMyFdPujdYfvVDdSSzKywljRJ1yMYl4/gGBRJjwXJ1pZYe1LDWRBIIHcaoR8JYjkSUkYcumcVQCqiCBkh5FIqOxDlF5KR8wG2Fk3PHuHtdUTWkmFoXi66OAEc2Ef0ihAHDYQQW6QIwNuP9yAK/6RymEIEDEzCi0+9nPQEGHoIZFZQkx+AqSfHrm1iUJX0RNQNz+YYMcrIFaB0RzVz74j2cMpHSOxiSIhlEKmmAgA5alo8/2V5MFXILJRSTCtlBjDTgQa9QzhvH4Cls4RLtsM4cT0If8cYR/TMEfhmDACESggnCcYCbtjeJFXAHaVDdZ3y57UEKeUpZlzCFibYk1FHdIKha4YMwN9QcDPOlrrkTqH14Y2XW/W5Xk1MYJZ7jIH0xAwY96sCL2asA5AJtFICRbjaCSgliQY+o9CqjRNz4WdxVXwBZCJbs+QJ+I/RECZVhaBfCYQUV+yhGL1CNGCCoLC1+aIPImRin/BGEGDGDF8ohvJVEXOUEXYpSybVSEn1o3q0UtsgmjMEWVDVvIAAG2jUbolCQYK5hIyN6Fc2XXM2SQw0y2ZTxaUAKw+4HTnNZKLQcdGrEAOiyqD8I0iZyiATGgHvCQcQlC7IAYEEhLrQJdigwq51+PPqybHg2ZT8z7N38xuK9Vc5J/7CCsBMGKvcp+E1pdBB8aiDzODxK8hUzSSC2yV3FPpBNYYG1hT1+Cpl2vlZzoxAZsCIJR9u5bx4n76THEWZsJ6CZLEiTSeyhKJm0jiEuQYBxfzjKi6jODdfx7e81qU7KiBXl/qKKTkJIL9LVMH1ZlVeOgBgIxCM/FU7inEdH1/0GyQDIpJE8ldTIsUQCAgDoQdyEXRQ4jA3NKk3+bUC/bEgAJACkeIwwMtErOwjWp5n32UzjOYngrwz0hsAv/0A3LcRQQ5jCmwAXkMHGnsQAk+A/AkG8LZWOJpz0YJxDO8CRzxGmxp4DRpx7s8w8w8ATP0AUhGIW65UhZ8QUF2HiNBjCj51CxUAHg8WWrASsEsALLQGbB9RwAIAbvcm10xWANQAqDB1iFZHMzxyDVsmiPB3UB4y8SQQnCAQhGgSk5uBwakAyooIUjIUIXwQA4MlAtyHgqGHX+kAyakx6aQzlbGH1soyd7UWSiyC3/4ICDpCDjBTqsEA698US78QBMNv8sggMAk3OKIngRXsAGKXCLTMN4Ltg9hvMmf9h2iwMaYMMC6pAqZEQop4ABoLQRUtQCDQADVFCIjSeISKgyJ3My/sAExHN2qGiO+vQPxaBJTaaEe1QyIcIHlXARGJMkyeMPufAMiVAFhDACzxANihAjzPEDadY6OWET3GA2pPNim3hz0/KHrXhh/RE+1UMQNYgKVFEWJ0MQIqBTZIcRlnUMD1AHiECGh2d41BJTCbEcdnARbVFv5wiTVCMSDTAPELFCjRN+a1cQPCACFtEifoEBRBAKILcRc6AHVtABAjE5VlU5NQE3CiASYsBmL0ZeKVmVgOiK+pZ4q9SIzRMKNgn/WHr0DBEwKWrkZUXlCwjgYuuIldyDapQBYVcQN6u1izFplxXzD2Jgky1lO42BXQ5lD1NlLxGgae9CAApwMWRnAUKACclWl6Byd4qiOvlgQmliejY3YIAEbotTLWrASOxgFTa5HHjgDQZQcPKyZWthEcAABYUGMCgpTYblfedwMXTXPneJm6FCRe4kc4r3ghp5GJMkCHOWEw2AKK5CR7PYAisAL/3zFQqAMRfFC/ySgr3JWHyIk0zVdi/4EOogHABlHNzhD2ogEwuwAERld1wSN9RAUtzGOFAHPmNxCWn0LjuVm/eJlyRBBNdHlZr5eNrDCnPAPxgCVMa5Zf9HUSJX/wyxwByq5EJqFYNNJUiPc3gS4QvEswiiKRFv4AVcNhMUAykXoQCIgCrg5Yc0AnCT9AILgDk8g6D4CaO78g9ZkAZkBiKLNThywhDGEQs6gFXIgwL3cAtWQAE+pWVPQAbXR4jkQ0OIpYmI5pY75w9LoDlXoHcCIQhlEB8JuGW/sRpNICNjSG4v2Dh/4xKT8DrxEaNrOjZz9A+3ICPrSIiBdIwNcQXFxRGkIgIC4QPB8Fy5pRO4cm4smKOHlp0RKnNqwiZLEAB/oAQAUwC98Ae5UXAgsVN8cQT59xzlhljp4g+mUFVYwqVsSqoSx09xsFFP5n3auSkOEQLGYFarQQ0FMf8FBlWQJoENsTlT2gehMMgsJumX/gAHu+MAmVQBcaOeWXcaIWoTM/ALYNmq18kptUEJ9kQe9Fmq2doVc0Q2lXhutjgtMugP2XBUOEETOiEMSWkWf5pbcTMDw/B04HOdi0da2ylTobMcHvAPpMAcQ2ANBAABLVJHXoEhJqATI1CihrOJQSIBsZg3OfGi2nqfulcKChNGYYiMKOl2kGhQBvkPSSBbamA8WmYRzQAow9iW5KaVGPtC2ukPaJAF/4Ary9EHRBYvoYQhPYAN8mgNd8WrW5lo/rAJBmkRziaxR2sX3xAoYsqKhNEdgmMKOjVO9lIGBegPDvAEttqUVjUCy/H/EkbYWIQUm4Z0eg2lkdl1CRexAwVhAezaEVnCFxjQCurgD9b2Dzhgk6Llq4hFGxIxD5pGghGLtKTKnqEpM1I3W02xHODQPEjHFTpgef6gAlAyYb8BAkoLcCcZLeOFmTOksDsqWFuwB/wAAgA1EHVgUZb6g+SQDgWxBn7nBfwijKMFGRrnMBBjMYOru6SRAHghMzL0EB4iEXiQbJEyqpTrTbEhEJOgtWJTEjpxDB/gL4yWOJbZZtsJTdhVFnbSYwwxBhswTgSgQ6ljBFBQPcsxCiLBBShHcwMCPOdyAe+Cp7tLvx7RDpoLM4nBH9pwDNoyiwT7SFbrD30Airnlf9kx/3/hiolQKmXV1BBPJhBN0AAiMbMTEYpvW1fRMCzIARMxGwiDIVqcqZPLkQwkWE6CW7+4iRo0sGsq1ELMcQNnEAMVMcGka1ZTcw0xIhFoAEcobBqwhxrlsJCLlVIOiXpZ5L5WsQQm0CV5JxHSgLxcOAOnMGxOQUtm4CoHoIIrtTT+sA5PMgCI2X8pTMY+IxJpt6S/m11aMA0iWgHFIKNYZRGgMCz+kAbo07x1aBMiYQMFyJZK+HsPib2SwTRLYRj+8AkDF6IZ+hRDUAT0UEwWgQGOEBWv6Q/ioDpf2Zeqohi1MQzE1Cs+XMYxmR7NAIzckTL/obgsIQF54CrFUAha0P8KagoSPcQI1XMcsAAlolwdBAAGLrVdBxJ1fjQVmAJzYcUMU5Ues0AFD1i3ZLUB+7CXBVEbsWBPjXBXGZkgM/JkKeAuxzvKoywSYKp3oxYdDceReakBEuAEl6B7P3pvXYwD5MTL1YEOdcxH+Md9h1tY2dUUxgEOXvCh/4CwwNMPsZBTtfwPx9ABhQQwNRgAZuN7lKGRcNYP+uq24azR5DEXpRAEhXhqlbQcn6BpcaAFIcADPOALM9yxGGEL03wLP5PHovQP+ZCU37a5DRyDE+ov78gKe1AvOjEDmHCL/vAMf+cRFkECVuEmEhFp/PAChOcZ2KUqn2CcQKXRWS01VrX/Acwgmnz4FDwQB/+gA7HhAAgQAm6gpbf2ET2kD9O8BowEbBMmEjPgTk4HkfR6kjA0GXsGE8BwrnyxCg0kEXqA1LplAFiAzxjpD6egE0dARHspUNmVAsIQEkyp1eG8PhbhDYLluapSqwZAAaaiFLTBkQrA1uZaByglEQVg2X/hfmUlEofA1JuJjMV4fzQiAGHFCu6SE4hJH7mwXP4wBFOlFeSQpGwHlkJgT37gs1RpidjlCohChZmd1emBAWnlmha9ocJBE0lwV5XkCCzQhW0tEsBQLBIx3UBVz9fxD20kiNeUxih0SNlFEJkwQaGYB4CjFBJhBZHoYRZxg5VUIGUh/wGGDQJePSPCTBCFgLztbd0xub5lpEcS4RStAgLlEDd9cEUfkLVbIRIF3XBsIHKshRrw8D3AXL2c2xJhdG6fMGdjF6In8AYCJBCsMKl1mR7r6y/v6Q969Q90cEX6KxF3gBYRjuQZ8QXuwc38sRx8EDeS0Ak6MeFM4QCvoBXixED8IRDr4DGP2UgiQQ5iFE26Cn7ZVJK3AHIYgySpWwShtRCTy2CpSACJqHbHIjgkrm7cyRB4MEEQnuS4yQYkE45b4wipJQf30AtZ+wefQzr+kANaEaILIM2ziwZ+F8VlZRF/4ART9pAqyylQwc3+EAbs1X+pSwxgV0mCwEidplv95P8OoeVmcRYB/xAHN03mzDECuQHogQ6TImEJH72HtaEFsAoCcKAINwAHmrPUbHUFZCUSEfCsnZECuoCBuWURZdDppMXPh6RoDYEcBngCWzIe4fEPtQBqxCYBuBG4oyoSK0DUXpvPQqClICC7NkMJOsBpyurrZUx3vIUuY/HfAVADTvAGHyAAtPCx7lEb89B5N1G0DAQZNXXtrGURleCBt/3tTNVY9s0ER8Y+W/IPJuCGhvzk9fKYIrEHWHMcTZNdDiAT/5CQegsR6Waf/W7dFqGXACcRoiAcNrAGVKAw/qANcdNGL6EFFwjPu8AD/RA4/IHFEEvXIvHWmai54qYYe/b/TE5QAx40gpLyD4/wbwSxBJ2EW8CgSYQqni5wETxutrVhD1hyYjif1SfxBQxaSXjQxgHAAA7wASezHPDxB1DAVlkIzyQhqIpr1FKDZhaxn3KqVpGvo3deSZkgj7wu8nT1D5LQAU8BQWHgo3R2E7Bgrw2DCxdRDCwfXACQBvhw2b1O91uo+QGQiMsRBIZtACKWZw/kD4oAciJGEJ+QWgQrHyaRACWPEPaQ2hNmEhJvaI5VqC1uxaSeLcaHnv9ADRwCcP6AC0xkWVyxvjwtfBKhBsQTA/Dq9MyRtlC5PrGv1cZTAQLxAfBwERYwG4PSEJH2IwLhAABB699AggX/8eNH/wDhvzoIAAAo4E/bhoH8DF7EmFHjRoxz1PjrF9LfSJIgSYo0eRKkSAAIRn7r8S+AAgUI+QUY8I8eFH8ABIyMt+KfAWInOBK0OKhnPwAoQTYVKaGYzFH+CkD0BylYxQABjn4FG1bsWLJlzZ5FO/Ymv2kOYoUbqCeIPwH9BAhA0KFfAan8RJEExTGAgYNeDQDqCcCfoBYWLaaFXLCSBpMo+6kceTnz5ZCcV/6koiKCzAQDBgRA6JUGmp53/U1KMPBHEwxika0s4Jmz5ss7Btb72dKfmMJrIx9Hnlz5cuYZbc64xG3gBTxLd9NVvG5AiZHqjHLMWfFfHCBW/WWK4bg5Wf+LT0JU5t2Zd0qniumKdCKwIr+cNk1fySwiIh4TAwD9jrIIAyFIaiqzkhw8pTZUyvspmtMO4m89DTfksEPlHsMptgCq6EClzlLyhxETEPEHHvYSQOyyMWLA0EOwzrBrvpVM3EyzkRr0yR88Xvknga4M4keBf0oQQDHFmhBxBwB6CY+jhYwpUSTLtBQJikr+meONkSCpxSYbz0QzTTUL4s8iELgoL0gHFbNrpBtOuICZFtTKqR7zbpjhoDUzGuCA++TTLVHLfoQoIjKIJKAwg7zChwrs/MGijX8GqOChLx9zTiaLVKAvvpO0pGagPnpy8chBX4U11sgsMiIkB646NTP/J/2JQgE5vBLrsQyEuIySQGUtqAVBNusRxVydBUACf6jQY9MM2ZSpBSzu80cIXgZ65Kc3KABWMItIOPVERH3MYyBl/AFkAIvKRbZee+0lwKsAItWHKQEKiCi+BnvyJ40sRB0r0n9+GIkVTQVFVpcUSl3Jx3U9y+wnLTgRFTV5kbKolZEi0qDaf0BxqZ8rCCgNQZm2cXBHB30cSQaE4MADBv4SAPVen39WsyvUBqJBCboK+Gk3Li9zAJgiyRqal+rUYMFnQrCzz+J1mXVWCGMOOo0/V8X+Bwx/ELjMiIGuobAfWP6hoEqMFvqHgGy4XlRdf+hA6BzfDlISaMEHV3OB/28qRnTHBh2JoKuejzKAgHz5saAAKmJ6/EwzHfuEYKjmO3FH+ZpUbIhrZOqvoHwJmGGAPbTYyx8wBoJhGPO2OJjejBT654RlndJSZoLvUdIPCghHPvkzu/gxeJmbSkGSeTMXDDWFCglCh01fRW0hG5D48UGMab7MJ/k+uGCgodlECIPRcqDLH2ZsGGgC8/xxRgHdMfIqJz1cetDMYnaZN3DAK9RTXgIVCJluXCV2i9qRJ2hgEbl9xSKSi5QNmlCGoSCwQ0KzCCk8pzRToYgzDeoHCf5Rk2uxDzUGOMRIMKG9AFxAAhC5jBXq5kGuHIR5oFtaSS4TAjlYa4FHRCJayP/Bg0tdp2L+0MA4JBWsoeHkH20AwQEHFTb+RINgTOlR4rSWI3/YoQEeS8jj+NEAoZSBNUI42D+m4QRuFYBI++PfUGLoFNGFLjH+mEWNkjhIQlopAdrwhwO2NCe7aENJHwsLQkyDk+4pQGFrAtUJNBE+Zz0RccxCRAYm6TiMNGBPT/CHJuIwEGEowirCUcLxKjg3i+hgCANDXOiC9wmK0K2QvwRmhjYRPwEirknPwAmo8HgRYOULdbF5lZkCYYjEyEeIAwwdRBIBMgTeZADnUIMfBmIL8D0EjJhwHA/FY4km5dJiJmkQHsSpHmDWE5jEeIqz1KWYELhoKJGKHBLXkhP/C6SLR3xkyq4GUZNlEsQApskAHAIxkDNkqS6aUcaFLPiPMxwURU1CQET8oQJB+dKeJ12gaoZgnWKCpJ2GEMamTuMqgf4DAndYSsz0CcTLDEGchKnePzIwjQHYwBR3YYlIptBDc8GsnYmrjCJ/8oBkGgelV02gYdIhM60xKCLa4IACIudMJD70H1+YWNbGpyj6AMAbdRvAJWmpUX7cLTEPWUkKqlFSK/0jCazB2DWfEpFTgGBT+5IJVhWbPFrFz3mV+RdT+rEICGBInYILaB24+qy8eUY7qJslkrxCAANAIBNWqYt5LuOOXm4UFOULowl/soV5tml9i8Xtz7xSjvKE/1E3D8ELXpYqr8sKziJ0wE58QIfNkXSgHGArbk688ooQANcnuamZTDz2FRTkk1mW8UnJCuMxSObWvMh6zAxOi1dProROl3ECOfZT0xZs8qLu5KNLY8eA/kTXTIXIZ5NSOxwjqvMmD/gjQqGimBwIEmHnhXCsUOMVBlRzszpSjCkUclsFWgQVc/HjsxyUNAFooRnBkpe8TqCO8EHlJ0GQTnEHYoM1uNREV7mKS/pQWZNG2MewsqIHclpMPzKlA1KoGyHNUCqlCY8zaPMHO2SsvgDwjKMhSa015xGbKR+hNe/cS12usoWtREquP0ZzmkCEiix1EoIEw4N8p2yvAz8Rgv/qKh9S00eWSG0gF4d6r2K2ORZZ9ESkKLmuS3wgxZvwLs2PRtNobfpnXNo5lz9ZwrGQyILTgpk+lXGpYjzxLbV4RRJg3MxFC3CwKRPgFASbGWd+4g8UFIeskMY1h0D4j0mA+rG5bFAFkJJAi0DDB1+8szU78xNRhNZKAVgAJqyjmLoohhU0gNhGHkMDSDh2Pubzxy0eOhqr5trczaFnPej0OWUL0TWsCBQlFXgBkOQmUc3aDV5XkVixKOQIaDNVO3Hwla4ojBgAv3fs1vAFI57b4euZ3j+aUR285TIxP7mKBw7bY6CdK8EmCnE+lbEBR4PFIgaAg51P5IQ9ZDsj6wv/QFWwG/CInIHfD8f5chxjEQVs1UnAC95l7hIRIKxyzrDKSRPgo9wBpuQGjajbmb/CAkqYELb24LBzFhID22FZNwRjzINzPvbIlMsi3ElaiK1Zl/seggNiJxw/EJm0nfp2JNs4iAEaOrd/2ELouvzJOxruHOL+QxgOkSwKOeODUrBsAWSH/HJmYak6bTbVd6G74DWKvA1sMmAXWzpvSiCqo/8jGdZxIjNAUO6N5IRhOZLsg9jwz/JG3vZq6dlf2hnrlDwEV+aERCO6dxPCxYBFsfdkk00SBFQ42GUBaIAj6BIcp2xz7wX5GGLwGuiR5CIDILt9+M3iFTG0hshBLJ9L/7AxkAV4TOr1aoPRDIrniilmDdoz00asmKFXpOznJomFIto855iwf9iWB/GJn3CAark+8XNAjbAIa0gra3KnHvEJxcgGzDGAMxKcGTCa5bK7E+kFy7o+0kKIBoAR1IMnf0gG6DqKKvsHXuCJtQMjaZivB8RBsViAGKk0HXGeu1AMX2gFDpCc0usQi8iAj8ga+PgkB2EHKlMnfbEIRlCkarILxfiA5jsgHroJJRGZ5IuINJAzI8zB21uIUHgsCkwXHEKakXiEf2g/wfGCLfg0CnQixXiGJHO5i+AHwuC5Jfiy1AoSZdiXC+HCSBkAs/kcl4oIbCi5MoREbfuHaqCj9v8SnpJQjAJAAIfwByc4nQZUE4tohJV6J4rBRF7ZIY5DEr37BxugQ6SRE81oh8PKOozICV5YKfswibpIAekAxUjMwZsIgLvpqqDLmydyhuMhQw7BAEoTIxNyryjbDwP7GHpDtQXrhzQoomGTxAFwgadYLiyAO2Akx2n8h3ogI1Qjn+vgEiAkBcLBASbcqXyTxl+0nn+oACcDAAfwhyIIHLGIARZLu2Xzh0vIv3JESIQJyLrjkthqjabAhKoRnFk4NmUzxhWcHWdjpvBQCozBFUSIiWD5B26AvetQDBWqxYQsw/yLRyb7rjFilMtwhY7jBwoIA8fqo2wimCa4OQQZgC//AKz5iIgD6EmXYYQE84yHqAftUslyFMacmIUZDKCc1JuEepJfRJOA+kaeasgTwQX12UM+9IpOGTLzWANyIL6xsIOeKBFnwYbawMqmjDwIIC4OmIeRaBKEUrlUC5IPeBvng5WFQIWJ6SNQa5ZDGIgN+wp8oEPJ2g0g4BgC0EjsExQQkDa86gzFuIfRkDe5BEZW/AcMcIeRuZjS1CWRKCxaXEbl8AoO8IXYMs3LQIK9mqSjIAD7gYqraKdJYCqNkEwF+JhdyJKmcAiXQIJpWKEd8sxy9IpGYIYmnMrotKZhEAotqpfHAxCaic4HKYIDmsyBaAY6agog/IlPMAHiAyqN/xCamlgAL2on8xGADmAEmYgUVVzOB7QIGng1c/q17XwnIdCBC3q/UHwMS3gPqPq0lKCEOVDOjSCAReBLxaCCiZLMlGSfRuOE6jInh1AMMFCSSInL+8y5x1ijlNvOE53KfsiHDlrNDzkNCOic/DpRCaiWAS0IfPgAWKu3fhytwtO2rsgJQ3kvYmLAgUgdEQ1GYeQ1FGXSB7E5NJKVgVqAR2jSAIoHebHRgYgCz7GxG9iKAdA7+0QK3gGGuVAcukgFHSCl1EDSlQQWXsiDCziCC6BTOa3TOa1TOp1TPOXTPNjGFmWOSMkAPT2CQsVTPbXTOpUES2A9jLgGSYiEPLCFI//Ig0g9scQSU4woA2K4AFugU1CYU1qIiSpJyzY1VeYE1FNtU1DxJZtYiM0RpEw1LvGokVYNlp0rqRZ1VcuSVVV1QFzNNvWgG1atVeXZOWF9VVeds2TdHF0Vj1T11Yd7VcviK45DVmKr1WPNPyNs1VSFVWiN1nAV13EFGg7IAj+kVRLdVnoKS3VlVZM6IAUogwzosQ0ogwbgq3RNjekZ1gt11RCFtG0dtp5BiASAARpBEvEwgEbQlFI9yIHAgDLYgJ4BFmANVlwlVj7MVosV1oF92DQ7ghAwgYIYmmndVX571XSaL4INDxMoh5jwiiS4AR2a1n+4ADKIKdI7WSXVWfD/Wwt1ZUrb20JBmbCMpR0l8I0NsAAXINrHYIFfmD0STCdQeYUhgIumhRjiswkKyIckUA9SchwIQIUsYNOFOKAjMY5m3dWIwzVv8Ic9oVU+dIzhu1CX67GhuQYNkARBgQEkIAKC0Jd/EBldsBZirdlqNSmbMLtezTW21S4S5UYYSIMiABN1QATw+wcd2IJCcL5kjQsfiATMDct/yAIoaDDqsQgvgIS/VVbAPVb2ucHYhTR8oogZoAhu1IHbfRwMgFtB4oDvMAgaOJ6BkId+sAWCKIMteEMKOJaQQQDCfYyfFN0vACqT0h4H04G3G90RNdI/gKaCyACEpR0qeIG6/YcW/2gBDHADU0jY2N0FDXibCNA0UNkA4P2HMvCBKriIHhCKgWABLSCEizCAL3C2DKisG8yA/mVc3MKncugFJRgDYSOIXfgERFCEKHi8fyCHbAgHPhgDRLADZewdbPiFG1iC5xoIRmAGJcgEZ/CDOVCGfhgDLFiGapgDSKADcxgDNXgAw/oHb3AAwq0bLvAFNXCEfSMIUkAGNciFLgicCmCDVUgFIdAGp7GIPAiDG3iDQygFB4wAF3AEJQCHQaCff/ACXLgBTWiCbfQC8oXDSTAHQbGBB9CEN0iHFDiHf0CHXpBIC5CGxzMAU+iCf+AELfgBOniDNbgEGkHCQlCEG8CCJ/8430EQADXAgjuQ5F3AAkR4A3eghgbABgdwgyVYhtD9BzEABzXwhZkciHYAg25whjVQBOJYiCe4B00Yg0L4g3OTBH9IgXk4gF9IkYF4BQBIhQo4hw7ABSXhhJEQhANIBX94Q6EaBk9AARFQghQIpBrogAkwAzZAhB9oAzjoB214gF6QgxP4CESYAEAAgHSorFYoAMI1gEXwgWeognfZJn7oAgR4ACmIh36I439ADDL4hkJIA0MoInhwAECogk5ghVoLvwB4BiAYBSngA0hY0T+4ATd4BEIggzFguCQgA96EgGHwhYGIAUXAA0LIgWjogFH4h0jwB6cZAE/wB2v4Bxb/8AffsIQOkIBhKIRXewSvaANBgIQRcIExSANooIBFEABBeABAOAYs+QYVIIQ3oIMI2AQEUIRtwIU6CAAUQAAwMILDIal/WEsgUIVCqLEu/ocn6IBTsIAXMATGMbdeDowrIgNn+IcGWAd1UJgqAABL+AdL6EclUYBfeIPaiII0+A4QCIIR+AdMQAaCgAAY+IdKQIDjHYjkdYaHGYF+MGxveF5C9gd6IAhV+IV/CIYQGL2BoIM0UBJ28ISp+AddAAI++Id1uAFoMoBdDj8MIIPZGYgZEIpHCAIvGIhaEACN8wInKF8I0IY7GIhOkABx+ocNQINF+IceMAQdAoY04AHf/6AFBHCaV5CAXtmUYfgFw7oELcC2fwABLWCCf2gEDdDfgWgCJPjHIjoBKqDsgcgADaBc/saD2niBRRuIWfgAOoAbTLDucRKAA5ldf0DXXFiGs5LuxJqBEKi1OgCAOkgsMLgBEIiAYRAEKRABGaiCFMACA0CuIggEqBsIXSiAt6KdWKi11PWHfZPn05EGMqiACpCBHDgFHziBHPABK/AAF5CCrZqoXvCF+vyHMNiHfyACf9gGefCCLMU5BVgCBOgCaGC4uvkEbeA3ZlAFfrABMpju6i4SdbAHgtABIWBfCFAF6x4FXHiBMfgHK2CFqtEDDbijfygEVmiBARCEXygBEf+oAAtAglP4h1r4AI2ziIJiAF1IAmiCATKIY4ugB3+QB0HpBgfgmCLQggOeAUSYHRjwhweoAhmwgGH6G1zDJ6GwiFxYAtcWACQTFCCwg8MWAH0QlCa4AQ4wgTEQAndYhkteBxTghwx4ACaSgGz4ljhwAB0341joBIIYAH+ogX+Ah9NuAh64AxrGgnt4AA4gAR9IhSXAgjBYAlz4llsQBLj8hwf+BxOY7bNZh5a7Pa/Igj5wiRR4ABPAgDH4SoLABUH4STdugFSw7gjAgysgiDkQAhv8BxJwgh74hSowhjSwBlHIhoHYBSC42n/ABk3AgBighC1YBxq+g0PwDUuXAUH/iYBJiIWRUIVjMGM4FxQzEIC9sghL0IDAYII0QNg2uIEJIF1/cARVeHZVOIRuyOu3TSxB6HUbSIFvHwgTCAHKtgQDIYgmYAUQoABFEIcVookj9YJK6IR+iIZ/AAYE2Fva2QLWbUV/QIcfdoBVWgRIaIEEoAmgEoEUqAUCUIAF+MdbGIbaGIglSOmB8IJZMIICuAPJDz8CCAZuAJA41gZKB5Z4d3MqiGMIoHg4VIOTH4gVQAP2/QdawAMUcIMvWIA1YINcYNp/eAUNCF2vwAZKAAECUARRKJLGV5g9+IAfoNU/mIUqMIRMWIBGIAOwn31/uNR/CAcH2IV/YAJDgNsM/2Bnv/KHVlghx3e4XBeUXFCF7Q6DTNBeFQCA76+Dflh5Ew+UK+gAgKj1b+AGG/+mJRj4bx2lg/4YKUwSq4tCIhr2/GuFIM4/ff5CKfyX5R8+fyhCZgnwb5Avhdw+WPhHDoJCMG7ahMypcyfPnj5/Ag0qdCc/fgsqhVTX51+UEAJFCpDxzwuZF/8gpLrzjx+YIUkGPnFyZWAPTW7c8fuXLA2eYwNfaeimEJumGP+kfQikcEGZf0lC4FDYzIRCOxo4ZDA0SqGOD2xqktnwr4ihFgPb3GDwj4MmZjQHfjE4dDTp0qZ9vvNneaCmeQPp+UNmJoqEPg3+vfJnS2G0LThhKP+iUsSVOUok/mHZZwXdqBAV/i1QI6RElGp/tHga4YoPgCIDGfkr9S8CHAQPElVg5nrAJH/RSqg4pGbAPzApsKHDgSQTiH/OFJmDziQaFGHAaQcimCCCJtywhAjogAHAbjRA4okMIkChRiP/lBGCHVeB48hAqIQgxCi4OOGPNAod4o8rA13jzxb0/UNPPxcoBIcbdn3xCxnDEaHIhwRgYogRRKByDitFoGNFGskQwM89GlRAAj0DEOLPA2f04k9M/4yCgF3/sIDELQNFgoAiIiSSDCT1KBinnAcac4dkAy2yyVb/hOOIEIicg8FA0yyjyz8qiQBGf/80MgElbmgSjV7/ttyzhhv7eGDgP5zkAgkrzXAQTzanoHEDCgGkZckSGP1jwAiZuIHIKSANpAI4aCjBjAcDNYHEPTeo0YQXA+nhjHS/7EDAnMsym2BaA5TwCRpu5EKMQsEo48Ya0fhBljikQPcMG/yo1I06UMxjBhw17BnKIcPyQ0EvjygUyDeGpmXBASsMRAMDmggRqTwDFXMKJIi8Mks0iLjxRhQcDETOEpCsAWcAPwCsTgmo/nOGPRD/swIYIihEDRYMK3IJDc2y3LJOaaU1UMxT8XtoSCrFXJRCESTxWcxtwKCQzgTAIGhIjUiWlkoDDZAzDDjtqZANc4R0iy8GnAB1SC2UoWzU/y6DHbbMHP/TQ9Ayx9zDCWgLvfTMAwyb08w6sy203ApBkEQEAwWwdCOEDcQBDAvILHUGUStQRkKHzp3T0v/McPbXYlNuWlGNb0X2VjDvyfnldPNN7tcca345UZnXzbbpm6cVzRtGCw06zpXT3iw/9DXOeeyds977y25f/jjvn/t+s+aozsx68psrhPPqOfe9/Oq1Uz8a3aIX/jnM23feN/KMB4+958R7rnpIxPetfFqXpEOB+rGTu3z181uffufkfi+36dwjz33O/9/uc8AbX+44pjPx7S9n3QMd494HQPnRL4Jyy18CGVi48x2wbtNrIPz0hznzRW1mM2CB8HhnNzIJolAoBGTe5IoXQtBN73rYQ1sFDzg34DnvhMyLX/lsOLzkQTCFQhwiEYtoxCMisYgBAQA7"></div> \
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
		RESConsolePanels = this.RESConsoleContent.querySelectorAll('.RESPanel');

		this.isOpen = true;
		// hide the ad-frame div in case it's flash, because then it covers up the settings console and makes it impossible to see the save button!
		var adFrame = document.getElementById('ad-frame');
		if ((typeof(adFrame) != 'undefined') && (adFrame != null)) {
			adFrame.style.display = 'none';
		}
		// var leftCentered = Math.floor((window.innerWidth - 720) / 2);
		// modalOverlay.setAttribute('style','display: block; height: ' + document.documentElement.scrollHeight + 'px');
		removeClass(modalOverlay, 'fadeOut');
		addClass(modalOverlay, 'fadeIn');

		// RESConsoleContainer.setAttribute('style','display: block; left: ' + leftCentered + 'px');
		// RESConsoleContainer.setAttribute('style','display: block; left: 1.5%;');
		removeClass(RESConsoleContainer, 'slideOut');
		addClass(RESConsoleContainer, 'slideIn');
		RESConsole.menuClick(RESMenuItems[0]);
	},
	close: function() {
		$('#moduleOptionsSave').fadeOut();
		this.isOpen = false;
		// Let's be nice to reddit and put their ad frame back now...
		var adFrame = document.getElementById('ad-frame');
		if ((typeof(adFrame) != 'undefined') && (adFrame != null)) {
			adFrame.style.display = 'block';
		}
		// RESConsoleContainer.setAttribute('style','display: none;');
		removeClass(modalOverlay, 'fadeIn');
		addClass(modalOverlay, 'fadeOut');
		removeClass(RESConsoleContainer, 'slideIn');
		addClass(RESConsoleContainer, 'slideOut');
		// just in case the user was in the middle of setting a key and decided to close the dialog, clean that up.
		if (typeof(RESConsole.keyCodeModal) != 'undefined') {
			RESConsole.keyCodeModal.style.display = 'none';
			RESConsole.captureKey = false;
		}
	},
	menuClick: function(obj) {
		if (obj) objID = obj.getAttribute('id');
		// make all menu items look unselected
		for (i in RESMenuItems) {
			if (i == 'length') break;
			removeClass(RESMenuItems[i], 'active');
		}
		// make selected menu item look selected
		addClass(obj, 'active');
		// hide all console panels
		for (i in RESConsolePanels) {
			// bug in chrome, barfs on for i in loops with queryselectorall...
			if (i == 'length') break;
			RESConsolePanels[i].setAttribute('style', 'display: none');
		}
		switch(objID) {
			case 'Menu-Enable Modules':
				// show the modules panel
				RESConsoleModulesPanel.setAttribute('style', 'display: block');
				break;
			case 'Menu-Configure Modules':
				// show the config panel
				this.RESConfigPanelSelector.selectedIndex = 0;
				this.RESConsoleConfigPanel.setAttribute('style', 'display: block');
				break;
			case 'Menu-About RES':
				// show the about panel
				RESConsoleAboutPanel.setAttribute('style', 'display: block');
				break;
			case 'Menu-RES Pro':
				// show the pro panel
				RESConsoleProPanel.setAttribute('style', 'display: block');
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
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			// do stuff now!
			// this is where your code goes...
			this.checkForOldSettings();
			this.SRTDoesntContain = new Array();
			this.SRTTagWith = new Array();
			this.loadSRTRules();
			
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
					modules['subRedditTagger'].scanTitles(event.target);
				}
			}, true);
			this.scanTitles();
			
		}
	},
	loadSRTRules: function () {
		var subReddits = this.options.subReddits.value;
		for (var i=0, len=subReddits.length; i<len; i++) {
			thisGetArray = subReddits[i];
			if (thisGetArray) {
				this.SRTDoesntContain[thisGetArray[0].toLowerCase()] = thisGetArray[1];
				this.SRTTagWith[thisGetArray[0].toLowerCase()] = thisGetArray[2];
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
			// bug in chrome, barfs on for i in loops with queryselectorall...
			if (i == 'length') break;
			thisSubRedditEle = entries[i].querySelector('A.subreddit');
			if ((typeof(thisSubRedditEle) != 'undefined') && (thisSubRedditEle != null)) {
				thisSubReddit = thisSubRedditEle.innerHTML.toLowerCase();
				if (typeof(this.SRTDoesntContain[thisSubReddit]) != 'undefined') {
					thisTitle = entries[i].querySelector('a.title');
					if (!(hasClass(thisTitle, 'srTagged'))) {
						addClass(thisTitle, 'srTagged');
						thisString = this.SRTDoesntContain[thisSubReddit];
						thisTagWith = this.SRTTagWith[thisSubReddit];
						if (thisTitle.text.indexOf(thisString) == -1) {
							thisTitle.innerHTML = thisTagWith + ' ' + thisTitle.innerHTML;
						}
					}
				}
			}
		}
	},
	checkForOldSettings: function() {
		var settingsCopy = Array();
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
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get rid of the showTimeStamp options since Reddit now has this feature natively.
			if (typeof(this.options.showTimestamp) != 'undefined') {
				delete this.options.showTimestamp;
				RESStorage.setItem('RESoptions.uppersAndDowners', JSON.stringify(modules['uppersAndDowners'].options));
			}
			// added code to force inline-block and opacity: 1 to prevent CSS from hiding .res_* classes...
			var forceVisible = (this.options.forceVisible.value) ? '; opacity: 1 !important; display: inline-block !important;' : '';
			var css = '.res_comment_ups { '+this.options.commentUpvoteStyle.value+forceVisible+' } .res_comment_downs { '+this.options.commentDownvoteStyle.value+forceVisible+' }';
			css += '.res_post_ups { '+this.options.postUpvoteStyle.value+forceVisible+' } .res_post_downs { '+this.options.postDownvoteStyle.value+forceVisible+' }';
			RESUtils.addCSS(css);
			if ((RESUtils.pageType() == 'comments') || (RESUtils.pageType() == 'profile')) {
				this.commentsWithMoos = Array();
				this.moreCommentsIDs = Array();
				this.applyUppersAndDownersToComments();
				var moreComments = document.querySelectorAll('.morecomments > a');
				for (var i=0, len=moreComments.length; i<len; i++) {
					moreComments[i].addEventListener('click', this.addParentListener, true);
				}
			} else if ((RESUtils.pageType() == 'linklist') && (this.options.applyToLinks.value)) {
				this.linksWithMoos = Array();
				this.applyUppersAndDownersToLinks();
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
						if (!RESUtils.currentSubreddit('dashboard')) {
							modules['uppersAndDowners'].applyUppersAndDownersToLinks(modules['neverEndingReddit'].nextPageURL);
						} else {
							modules['uppersAndDowners'].applyUppersAndDownersToLinks(event.target.getAttribute('url'));
						}
					}
				}, true);
				
			}
		}
	},
	addParentListener: function (event) {
		var moreCommentsParent = event.target;
		// first, make sure we're starting at the <span class="morecomments"> rather than one of its children...
		while ((moreCommentsParent != null) && (moreCommentsParent.className != 'morecomments')) {
			moreCommentsParent = moreCommentsParent.parentNode;
		}
		var i=0;
		var isDeepComment = true;
		// Now, check if this is link nested deep inside comments, or a top level "load more comments" link at the bottom of a page.
		while (i<6) {
			if ((moreCommentsParent != null) && (typeof(moreCommentsParent.parentNode) != 'undefined')) {
				moreCommentsParent = moreCommentsParent.parentNode;
				if (moreCommentsParent.className == 'commentarea') {
					i=6;
					isDeepComment = false;
				}
			} else {
				i=6;
				isDeepComment = false;
			}
			i++;
		}
		if (isDeepComment) {
			moreCommentsParent.addEventListener('DOMNodeInserted', modules['uppersAndDowners'].processMoreComments, true);
		} else {
			// There isn't a good way to handle this with a single API call right now, so it'd make a new API call for each
			// hit, and that sucks.  Skipping this for now.
			// document.body.addEventListener('DOMNodeInserted', modules['uppersAndDowners'].processMoreCommentsTopLevel, true);
		}
	},
	processMoreCommentsTopLevel: function (event) {
		if (typeof(trackCount) == 'undefined') {
			trackCount = 0;
		} else {
			if (event.target.tagName == 'DIV') {
				trackCount++;
				if (trackCount < 30) {
					// console.log(event.target);
				}
			}
		}
	},
	processMoreComments: function (event) {
		if ((event.target.tagName == 'DIV') && (hasClass(event.target, 'thing'))) {
			var getID = /id-([\w])+\_([\w]+)/i;
			var IDMatch = getID.exec(event.currentTarget.getAttribute('class'));
			if (IDMatch) {
				var thisID = IDMatch[2];
				if (typeof(modules['uppersAndDowners'].moreCommentsIDs[thisID]) == 'undefined') {
					modules['uppersAndDowners'].moreCommentsIDs[thisID] = true;
					var thisHREF = location.href + thisID;
					event.currentTarget.removeEventListener('DOMNodeInserted', this.processMoreComments, true);
					modules['uppersAndDowners'].applyUppersAndDownersToComments(thisHREF);
				}
			}
		}			
	},
	applyUppersAndDownersToComments: function(href) {
		/*
			The Reddit Uppers/Downers module is included as a convenience, but I did not write it.
			Original credits are below.
			
			I have, however, greatly modified it to integrate better with RES and also add some configuration options.
		*/
		/*
		This code is provided as is, with no warranty of any kind.

		I hacked it together in one night for my own use, and have not tested it extensively.

		The script can slow down comment page load time; if the lag is noticeable, you may want
		to change your preferences to load fewer comments per page.

		Note that this runs once and does not install any persistent code on the page. So any votes
		you cast will not affect the numbers displayed until you reload.

		Also note that the ups and downs will not always add up to the score displayed on reddit.
		I think this is because of caching on reddit's part. It's usually within one or two points though.

		Code contributors: Allan Bogh - http://www.opencodeproject.com
				brasso - http://userscripts.org/scripts/show/56641
				savetheclocktower - http://gist.github.com/174069
				skeww (jslint, fragment, chunking) - http://kaioa.com
		*/
		
		var loc, jsonURL, voteTable, onloadJSON, displayVotes, processTree, isComment, processChildren, processReplies, chunker;

		//Get the URL for the JSON details of this comments page
		if (href) {
			loc = href;
		} else {
			loc = "" + window.location;
		}
		jsonURL = loc.replace(/\/$/,'') + "/.json";
		if (loc.indexOf("?") !== -1) {
			jsonURL = loc.replace("?", "/.json?");
		}

		voteTable = {};

		onloadJSON = function (response) {
			var jsonText = response.responseText, data;

			try {
				data = JSON.parse(jsonText);
			} catch (e) {
				if (window.console) {
					// window.console.log(e);
					// window.console.log(jsonText);
				}
			}

			//Load the vote table by processing the tree
			processTree(data); //this takes up no time (4ms on 4000 records)

			//Display the loaded votes
			displayVotes();
		};

		// spend up to 50msec a time with a task, wait for 25msec and continue if necessary
		// changed to 100/100
		chunker = function (items, process) {
			var todo = items.concat();
			setTimeout(function () {
				var start = Date.now();
				do {
					process(todo.shift());
				} while (todo.length && Date.now() - start < 100); // was 50
				if (todo.length) {
					setTimeout(arguments.callee, 100); // was 25
				}
			}, 100); // was 25
		};

		displayVotes = function () {
			//Add the style sheets for up and down ratings

			var taglines,
				commentID = null,
				toArray;

			toArray = function (col) {
				var a = [], i, len;
				for (i = 0, len = col.length; i < len; i++) {
					a[i] = col[i];
				}
				return a;
			};

			taglines = toArray(document.getElementsByClassName("tagline"));

			chunker(taglines, function (item) {
				if ((item) && (item.nextSibling)) {
					var votes, openparen, mooups, pipe, moodowns, voteDowns, voteUps, closeparen, frag;
					if (item.nextSibling.nodeName === "FORM") { //the first item is the title of the post
						commentID = item.nextSibling.firstChild.value;
						if ((voteTable[commentID]) && (typeof(modules['uppersAndDowners'].commentsWithMoos[commentID]) == 'undefined')) {
							modules['uppersAndDowners'].commentsWithMoos[commentID] = true;
							frag = document.createDocumentFragment(); //using a fragment speeds this up by a factor of about 2

							votes = voteTable[commentID];
							
							if (modules['uppersAndDowners'].options.showSigns.value) {
								votes.ups = '+'+votes.ups;
								votes.downs = '-'+votes.downs;
							}

							openparen = document.createTextNode(" (");
							frag.appendChild(openparen);

							mooups = document.createElement("span");
							mooups.className = "res_comment_ups";
							voteUps = document.createTextNode(votes.ups);

							mooups.appendChild(voteUps);
							frag.appendChild(mooups);

							pipe = document.createTextNode("|");
							item.appendChild(pipe);

							moodowns = document.createElement("span");
							moodowns.className = "res_comment_downs";

							voteDowns = document.createTextNode(votes.downs);
							moodowns.appendChild(voteDowns);

							frag.appendChild(moodowns);

							closeparen = document.createTextNode(")");
							frag.appendChild(closeparen);

							frag.appendChild(openparen);
							frag.appendChild(mooups);
							frag.appendChild(pipe);
							frag.appendChild(moodowns);
							frag.appendChild(closeparen);

							item.appendChild(frag);
							// thanks to Reddit user semanticist for the idea/patch to put the date created in here... 
							// reddit has now added this natively, we don't need this...
							/*
							if (modules['uppersAndDowners'].options.showTimestamp.value) {
								// find the modified time and wrap it in a span...
								for (var i=1, len=item.childNodes.length; i<len; i++) {
									// if this is a text node, and comes right after a div with a class of score, it's the time...
									if ((item.childNodes[i].nodeType == 3) && (item.childNodes[i-1].nodeType == 1) && (hasClass(item.childNodes[i-1],'score'))) {
										var timeStampNode = document.createElement('span');
										timeStampNode.innerHTML = item.childNodes[i].textContent;
										timeStampNode.title = new Date(votes.created*1000).toString();
										insertAfter(item.childNodes[i],timeStampNode);
										item.removeChild(item.childNodes[i]);
										break;
									}
								}
							}
							*/
						}
					}				
				}
				
			});
		};

		//Recursively process the comment tree
		processTree = function (obj) {
			var i, il, data, name;
			if (obj instanceof Array) {
				for (i = 0, il = obj.length; i < il; i++) {
					processTree(obj[i]);
				}
			}
			if (obj) {
				data = obj.data;
				if (data) { //Data found
					if (isComment(obj) && data.author !== "[deleted]") {
						name = data.name;
						if (name) { //Store the votes in the vote table
							voteTable[name] = {
								downs: data.downs || 0,
								ups: data.ups || 0,
								created: data.created_utc || 0

							};
						}
					}

					//Process any subtrees
					processChildren(data);
					processReplies(data);

				}
			}
		};

		isComment = function (obj) {
			return obj.kind === "t1";
		};

		processChildren = function (data) {
			var children = data.children, i, il;
			if (children) {
				for (i = 0, il = children.length; i < il; i++) {
					processTree(children[i]);
				}
			}
		};

		processReplies = function (data) {
			var replies = data.replies;
			if (replies) {
				processTree(replies);
			}
		};

		//load the JSON
		if (jsonURL.indexOf('/comscore-iframe/') === -1) {
			// the setTimeout is to avoid an unsafeWindow error with Greasemonkey when processing additional (newly loaded) comments...
			setTimeout(function() {
				GM_xmlhttpRequest({
					method:	"GET",
					url:	jsonURL,
					onload:	onloadJSON
				});
			}, 200);
		}
	},
	applyUppersAndDownersToLinks: function(href) {
		var loc, onloadJSONLinks
		//Get the URL for the JSON details of this comments page
		if (href) {
			loc = href;
		} else {
			loc = "" + window.location;
		}
		jsonURL = loc.replace(/\/$/,'') + "/.json";
		if (loc.indexOf("?") !== -1) {
			jsonURL = loc.replace("?", "/.json?");
		}
		onloadJSONLinks = function (response) {
			var jsonText = response.responseText, data;

			try {
				data = JSON.parse(jsonText);
			} catch (e) {
				if (window.console) {
					// window.console.error(e);
				}
			}

			// Since we're dealing with max 100 links at a time, we don't need a chunker here...
			if ((typeof(data) != 'undefined') && ((typeof(data.data) != 'undefined'))) {
				var linkList = data.data.children;
				var displayType = 'regular';
				if (modules['uppersAndDowners'].options.showSigns.value) {
					var thisPlus = '+';
					var thisMinus = '-';
				} else {
					var thisPlus = '';
					var thisMinus = '';
				}
				for (var i=0, len=linkList.length; i<len; i++) {
					var thisups = linkList[i].data.ups;
					var thisdowns = linkList[i].data.downs;
					var thisid = linkList[i].data.id;
					var thisClass = '.id-t3_'+thisid;
					if (i == 0) {
						var thisSelector = thisClass + ' p.tagline';
						var thisTagline = document.body.querySelector(thisSelector);
						if ((thisTagline) && (thisTagline.innerHTML.indexOf('span class="score likes"') != -1)) {
							displayType = 'compressed';
							var thisSelector = thisClass + ' p.tagline span.likes';
							var thisTagline = document.body.querySelector(thisSelector);
						} 
					} else if (displayType == 'regular') {
						var thisSelector = thisClass + ' p.tagline';
						var thisTagline = document.body.querySelector(thisSelector);
					} else {
						var thisSelector = thisClass + ' p.tagline span.likes';
						var thisTagline = document.body.querySelector(thisSelector);
					}
					// Check if compressed link display or regular...
					if ((typeof(thisTagline) != 'undefined') && (thisTagline != null)) {
						var upsAndDowns = ' (<span class="res_post_ups">'+thisPlus+thisups+'</span>|<span class="res_post_downs">'+thisMinus+thisdowns+'</span>) ';
						var upsAndDownsEle = document.createElement('span');
						upsAndDownsEle.innerHTML = upsAndDowns;
						// thanks to Reddit user semanticist for the idea/patch to put the date created in here... 
						// reddit does this natively now, no more need for this code...
						/*
						if (modules['uppersAndDowners'].options.showTimestamp.value) {
							var thisTimeString = new Date(linkList[i].data.created_utc*1000).toString();
							// find the modified time and wrap it in a span...
							var timeStampNode = document.createElement('span');
							timeStampNode.innerHTML = thisTagline.childNodes[0].textContent;
							timeStampNode.title = thisTimeString;
							insertAfter(thisTagline.childNodes[0],timeStampNode);
							thisTagline.removeChild(thisTagline.childNodes[0]);
						}
						*/
						if (displayType == 'regular') {
							thisTagline.insertBefore(upsAndDownsEle, thisTagline.firstChild);
						} else {
							insertAfter(thisTagline, upsAndDownsEle);
						}
					}
				}
			}
		};
		// load the JSON
		setTimeout(function() {
			GM_xmlhttpRequest({
				method:	"GET",
				url:	jsonURL,
				onload:	onloadJSONLinks
			});
		}, 200);
		
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
			description: 'Assign number keys to links within selected comment'
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
		toggleExpando: {
			type: 'keycode',
			value: [88,false,false,false], // x
			description: 'Toggle expando (image/text/video) (link pages only)'
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
		inbox: {
			type: 'keycode',
			value: [73,false,false,false], // i
			description: 'Go to inbox'
		},
		frontPage: {
			type: 'keycode',
			value: [70,false,false,false], // f
			description: 'Go to front page'
		},
		subredditFrontPage: {
			type: 'keycode',
			value: [70,false,false,true], // shift-f
			description: 'Go to front page'
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
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			// do stuff now!
			// this is where your code goes...
			// get rid of antequated option we've removed
			if (this.options.autoSelectOnScroll.value) {
				window.addEventListener('scroll', modules['keyboardNav'].handleScroll, false);
			}
			if (typeof(this.options.scrollTop) != 'undefined') {
				if (this.options.scrollTop.value) this.options.scrollStyle.value == 'top';
				delete this.options.scrollTop;
				RESStorage.setItem('RESoptions.keyboardNav', JSON.stringify(modules['keyboardNav'].options));
			}
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
			');
			this.drawHelp();
			this.attachCommandLineWidget();
			window.addEventListener('keydown', function(e) {
				// console.log(e.keyCode);
				modules['keyboardNav'].handleKeyPress(e);
			}, true);
			this.scanPageForKeyboardLinks();
			// listen for new DOM nodes so that modules like autopager, never ending reddit, "load more comments" etc still get keyboard nav.
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && ((event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1) || (hasClass(event.target,'child')) || (hasClass(event.target,'thing')))) {
					modules['keyboardNav'].scanPageForKeyboardLinks(true);
				}
			}, true);
		}
	},
	handleScroll: function(e) {
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
		} else if (command.slice(0,1) == '/') {
			// get the subreddit name they've typed so far (anything after r/)...
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
		} else if (command.slice(0,1) == '?') {
			var str = 'Currently supported commands:';
			str += '<ul>';
			str += '<li>r/[subreddit] - navigates to subreddit</li>'
			str += '<li>/n, /t, /h or /c - goes to new, top, hot or controversial sort of current subreddit</li>'
			str += '<li>[number] - navigates to the link with that number (comments pages) or rank (link pages)</li>'
			str += '<li>tag [text] - tags author of currently selected link/comment as text</li>'
			str += '<li>sw [username] - switch users to [username]</li>'
			str += '<li>user [username] - view profile for [username]</li>'
			str += '<li>m - go to inbox</li>'
			str += '<li>mm - go to moderator mail</li>'
			str += '<li>ls - toggle lightSwitch</li>'
			str += '<li>RESStorage [get|set|update|remove] [key] [value] - For debug use only, you shouldn\'t mess with this unless you know what you\'re doing.</li>'
			str += '</ul>';
			this.cmdLineShowTip(str);
		} else {
			this.cmdLineShowTip('');
		}
	},
	cmdLineShowTip: function(str) {
		this.commandLineInputTip.innerHTML = str;
	},
	cmdLineShowError: function(str) {
		this.commandLineInputError.innerHTML = str;
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
		modules['keyboardNav'].commandLineInputError.innerHTML = '';
		var theInput = modules['keyboardNav'].commandLineInput.value;
		// see what kind of input it is:
		if (theInput.indexOf('r/') != -1) {
			// subreddit? (r/subreddit or /r/subreddit)
			theInput = theInput.replace('/r/','').replace('r/','');
			location.href = '/r/'+theInput;		
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
			if (RESUtils.currentUserProfile()) {
				location.href = '/user/'+RESUtils.currentUserProfile()+'?sort='+theInput;
			} else if (validSorts.indexOf(theInput) != -1) {
				location.href = '/r/'+RESUtils.currentSubreddit()+'/'+theInput;
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
							thisPair = accounts[i];
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
							url:	location.protocol + "//www.reddit.com/user/" + val + "/about.json",
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
							url:	location.protocol + "//www.reddit.com/user/" + val + "/about.json",
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
						if (RESStorage.getItem('RESmodules.keyboardNavLastIndex.'+location.href) > 0) {
							this.activeIndex = RESStorage.getItem('RESmodules.keyboardNavLastIndex.'+location.href);
						} else {
							this.activeIndex = 0;
						}
						if (RESStorage.getItem('RESmodules.keyboardNavLastIndex.'+location.href) >= this.keyboardLinks.length) {
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
				this.keyboardLinks[i].addEventListener('click', function(e) {
					var thisIndex = parseInt(this.getAttribute('keyIndex'));
					if (modules['keyboardNav'].activeIndex != thisIndex) {
						modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
						modules['keyboardNav'].activeIndex = thisIndex;
						modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
					}
				}, true);
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
			if ((this.pageType == 'linklist') || (this.pageType == 'profile')) RESStorage.setItem('RESmodules.keyboardNavLastIndex.'+location.href, this.activeIndex);
			if ((this.pageType == 'comments') && (this.options.commentsLinkNumbers.value)) {
				var links = obj.querySelectorAll('div.md a');
				var annotationCount = 0;
				for (var i=0, len=links.length; i<len; i++) {
					if ((!(hasClass(links[i],'madeVisible'))) && (!(hasClass(links[i],'toggleImage')) && (!(hasClass(links[i],'noKeyNav'))))) {
						var annotation = document.createElement('span');
						annotationCount++;
						annotation.innerHTML = '['+annotationCount+'] ';
						addClass(annotation,'keyNavAnnotation');
						if (!(hasClass(links[i],'hasListener'))) {
							addClass(links[i],'hasListener');
							links[i].addEventListener('click',function(e) {
								e.preventDefault();
								var button = e.button;
								if ((modules['keyboardNav'].options.commentsLinkNewTab.value) || e.ctrlKey) {
									button = 1;
								}
								if (button == 1) {
									if (typeof(chrome) != 'undefined') {
										thisJSON = {
											requestType: 'keyboardNav',
											linkURL: this.getAttribute('href'),
											button: button
										}
										chrome.extension.sendRequest(thisJSON, function(response) {
											// send message to background.html to open new tabs...
											return true;
										});
									} else if (typeof(safari) != 'undefined') {
										thisJSON = {
											requestType: 'keyboardNav',
											linkURL: this.getAttribute('href'),
											button: button
										}
										safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
									} else if (typeof(opera) != 'undefined') {
										thisJSON = {
											requestType: 'keyboardNav',
											linkURL: this.getAttribute('href'),
											button: button
										}
										opera.extension.postMessage(JSON.stringify(thisJSON));
									} else if (typeof(self.on) == 'function') {
										thisJSON = {
											requestType: 'keyboardNav',
											linkURL: this.getAttribute('href'),
											button: button
										}
										self.postMessage(thisJSON);
									} else {
										window.open(this.getAttribute('href'));
									}
								} else {
									location.href = this.getAttribute('href');
								}
							}, true);
						}
						links[i].parentNode.insertBefore(annotation, links[i]);
					}
				}
			}
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
		helpTableHeaderKey.innerHTML = 'Key';
		helpTableHeaderRow.appendChild(helpTableHeaderKey);
		var helpTableHeaderFunction = document.createElement('th');
		helpTableHeaderFunction.innerHTML = 'Function';
		helpTableHeaderRow.appendChild(helpTableHeaderFunction);
		helpTableHeader.appendChild(helpTableHeaderRow);
		helpTable.appendChild(helpTableHeader);
		helpTableBody = document.createElement('tbody');
		for (i in this.options) {
			var isLink = new RegExp(/^link[\d]+$/i);
			if ((this.options[i].type == 'keycode') && (!isLink.test(i))) {
				var thisRow = document.createElement('tr');
				var thisRowKey = document.createElement('td');
				var keyCodeArray = this.options[i].value;
				if (typeof(keyCodeArray) == 'string') {
					keyCodeAarray = parseInt(keyCodeArray);
				}
				if (typeof(keyCodeArray) == 'number') {
					keyCodeArray = Array(keyCodeArray, false, false, false, false);
				}
				thisRowKey.innerHTML = RESUtils.niceKeyCode(keyCodeArray);
				thisRow.appendChild(thisRowKey);
				var thisRowDesc = document.createElement('td');
				thisRowDesc.innerHTML = this.options[i].description;
				thisRow.appendChild(thisRowDesc);
				helpTableBody.appendChild(thisRow);
			}
		}
		helpTable.appendChild(helpTableBody);
		document.body.appendChild(thisHelp);
	},
	handleKeyPress: function(e) {
		if ((document.activeElement.tagName == 'BODY') && (!(konami.almostThere))) {
			// comments page, or link list?
			keyArray = Array(e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey);
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
							this.upVote();
							break;
						case keyArrayCompare(keyArray, this.options.downVote.value):
							this.downVote();
							break;
						case keyArrayCompare(keyArray, this.options.save.value):
							this.saveLink();
							break;
						case keyArrayCompare(keyArray, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
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
	followSubreddit: function() {
		// find the subreddit link and click it...
		var srLink = this.keyboardLinks[this.activeIndex].querySelector('A.subreddit');
		if (srLink) {
			var thisHREF = srLink.getAttribute('href');
			location.href = thisHREF;
		}
	},
	moveUp: function() {
		if (this.activeIndex > 0) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex--;
			thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
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
			thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
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
			modules['keyboardNav'].recentKey();
		}
	},
	moveTop: function() {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex = 0;
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0,thisXY.y);
			}
			modules['keyboardNav'].recentKey();
	},
	moveBottom: function() {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex = this.keyboardLinks.length-1;
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
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
			thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			while ((thisXY.x == 0) && (thisXY.y == 0) && (this.activeIndex < this.keyboardLinks.length-1)) {
				this.activeIndex++;
				thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			if ((this.pageType == 'linklist') || (this.pageType == 'profile')) RESStorage.setItem('RESmodules.keyboardNavLastIndex.'+location.href, this.activeIndex);
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
			thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			while ((thisXY.x == 0) && (thisXY.y == 0) && (this.activeIndex < this.keyboardLinks.length-1)) {
				this.activeIndex++;
				thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			if ((this.pageType == 'linklist') || (this.pageType == 'profile')) RESStorage.setItem('RESmodules.keyboardNavLastIndex.'+location.href, this.activeIndex);
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0,thisXY.y);
			}
		}
		modules['keyboardNav'].recentKey();
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
					thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
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
			}
			RESUtils.click(thisToggle);
		}
	},
	toggleExpando: function() {
		var thisExpando = this.keyboardLinks[this.activeIndex].querySelector('.expando-button');
		if (thisExpando) {
			RESUtils.click(thisExpando);
			if (this.options.scrollOnExpando.value) {
				thisXY=RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
				RESUtils.scrollTo(0,thisXY.y);
			}
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
			if (typeof(chrome) != 'undefined') {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				chrome.extension.sendRequest(thisJSON, function(response) {
					// send message to background.html to open new tabs...
					return true;
				});
			} else if (typeof(safari) != 'undefined') {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (typeof(opera) != 'undefined') {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else if (typeof(self.on) == 'function') {
				thisJSON = {
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
	followComments: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.comments');
		var thisHREF = thisA.getAttribute('href');
		if (newWindow) {
			if (typeof(chrome) != 'undefined') {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				chrome.extension.sendRequest(thisJSON, function(response) {
					// send message to background.html to open new tabs...
					return true;
				});
			} else if (typeof(safari) != 'undefined') {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (typeof(opera) != 'undefined') {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				}
				opera.extension.postMessage(JSON.stringify(thisJSON));
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
	upVote: function() {
		if (typeof(this.keyboardLinks[this.activeIndex]) == 'undefined') return false;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName == 'A') {
			var upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.upmod');
		} else {
			var upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.upmod');
		}
		RESUtils.click(upVoteButton);
	},
	downVote: function() {
		if (typeof(this.keyboardLinks[this.activeIndex]) == 'undefined') return false;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName == 'A') {
			var downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.downmod');
		} else {
			var downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.downmod');
		}
		RESUtils.click(downVoteButton);
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
	inbox: function() {
		location.href = location.protocol + '//www.reddit.com/message/inbox/';
	},
	frontPage: function(subreddit) {
		var newhref = location.protocol + '//www.reddit.com/';
		if (subreddit) {
			newhref += 'r/' + RESUtils.currentSubreddit();
		}
		location.href = newhref;
	},
	nextPage: function() {
		// if Never Ending Reddit is enabled, just scroll to the bottom.  Otherwise, click the 'next' link.
		if (modules['neverEndingReddit'].isEnabled()) {
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
				RESUtils.click(thisLink);
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
			description: 'If "hard ignore" is off, only post titles and comment text is hidden. If it is on, the entire block is hidden - note that this would make it difficult/impossible for you to unignore a person.'
		},
		colorUser: {
			type: 'boolean',
			value: true,
			description: 'Color users based on cumulative upvotes / downvotes'
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
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			
			// Get user tag data...
			var tags = RESStorage.getItem('RESmodules.userTagger.tags');
			this.tags = null;
			if (typeof(tags) != 'undefined') this.tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true);
			// check if we're using the old method of storing user tags... yuck!
			if (this.tags == null) {
				this.updateTagStorage();
			}
			// set up an array to cache user data
			this.authorInfoCache = Array();
			if (this.options.colorUser.value) {
				var voteButtons = document.body.querySelectorAll('.arrow');
				this.voteStates = new Array();
				for (var i=0, len=voteButtons.length;i<len;i++) {
					// get current vote states so that when we listen, we check the delta...
					// pairNum is just the index of the "pair" of vote arrows... it's i/2 with no remainder...
					pairNum = Math.floor(i/2);
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
						voteButtons[i].addEventListener('click', function(e) {
							var tags = RESStorage.getItem('RESmodules.userTagger.tags');
							if (typeof(tags) != 'undefined') modules['userTagger'].tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags');
							if (e.target.getAttribute('onclick').indexOf('unvotable') == -1) {
								var pairNum = e.target.getAttribute('pairNum');
								if (pairNum) pairNum = parseInt(pairNum);
								var thisAuthorA = this.parentNode.nextSibling.querySelector('p.tagline a.author');
								// ???? TODO: fix on posts with thumbnails?
								if (thisAuthorA == null && this.parentNode.nextSibling.nextSibling != null) {
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
							
						}, true);
					}
				}
			}
			// add tooltip to document body...
			var css = '#userTaggerToolTip { display: none; position: absolute; width: 334px; height: 248px; }';
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
			css += '#authorInfoToolTip { display: none; position: absolute; width: 412px; }';
			css += '#authorInfoToolTip .authorLabel { float: left; width: 140px; margin-bottom: 12px; }';
			css += '#authorInfoToolTip .authorDetail { float: left; width: 240px; margin-bottom: 12px; }';
			css += '#authorInfoToolTip .blueButton { float: right; margin-left: 8px; cursor: pointer; margin-top: 12px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff !important; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #107ac4; }';
			css += '#authorInfoToolTip .redButton { float: right; margin-left: 8px; cursor: pointer; margin-top: 12px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff !important; border: 1px solid #bc3d1b; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #ff5757; }';

			css += '#benefits { width: 200px; margin-left: 0px; }';
			css += '#userTaggerToolTip #userTaggerVoteWeight { width: 30px; }';
			css += '.RESUserTagImage { display: inline-block; width: 16px; height: 8px; background-image: url(\'http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png\'); background-repeat: no-repeat; background-position: -16px -137px; }';
			css += '.userTagLink { display: inline-block; }';
			css += '.hoverHelp { margin-left: 3px; cursor: pointer; color: #336699; text-decoration: underline; }';
			css += '.userTagLink.hasTag, #userTaggerPreview { display: inline-block; padding: 0px 4px 0px 4px; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; }';
			css += '#userTaggerPreview { float: left; height: 16px; margin-bottom: 10px; }';
			css += '#userTaggerToolTip .toggleButton .toggleOn { background-color: #107ac4; color: #ffffff;  }';
			css += '#userTaggerToolTip .toggleButton.enabled .toggleOn { background-color: #dddddd ; color: #636363; }';
			css += '#userTaggerToolTip .toggleButton.enabled .toggleOff { background-color: #d02020; color: #ffffff; }'; 
			css += '#userTaggerToolTip .toggleButton .toggleOff { background-color: #dddddd; color: #636363; } ';
			
			RESUtils.addCSS(css);
			this.userTaggerToolTip = createElementWithID('div','userTaggerToolTip', 'RESDialogSmall');
			thisHTML = '<h3>Tag User</h3><div id="userTaggerToolTipContents" class="RESDialogContents clear">';
			thisHTML += '<form name="userTaggerForm" action=""><input type="hidden" id="userTaggerName" value="">';
			thisHTML += '<label for="userTaggerTag">Tag</label> <input type="text" id="userTaggerTag" value="">';
			thisHTML += '<div id="userTaggerClose" class="RESCloseButton">X</div>';
			thisHTML += '<label for="userTaggerColor">Color</label> <select id="userTaggerColor">';
			for (color in this.bgToTextColorMap) {
				thisValue = color;
				if (thisValue == 'none') thisValue = '';
				thisHTML += '<option style="background-color: '+color+'; color: '+this.bgToTextColorMap[color]+'" value="'+thisValue+'">'+color+'</option>';
			}
			thisHTML += '</select>';
			thisHTML += '<label for="userTaggerPreview">Preview</label> <span id="userTaggerPreview"></span>';
			thisHTML += '<label for="userTaggerIgnore">Ignore</label>';// <input type="checkbox" id="userTaggerIgnore" value="true">';
			thisHTML += '<label for="userTaggerLink">Link<span class="hoverHelp" title="add a link for this user (shows up in hover pane)">?</span></label> <input type="text" id="userTaggerLink" value="">';
			thisHTML += '<label for="userTaggerVoteWeight">Vote Weight<span class="hoverHelp" title="manually edit vote weight for this user">?</span></label> <input type="text" size="2" id="userTaggerVoteWeight" value="">';
			thisHTML += '<div class="clear"></div><input type="submit" id="userTaggerSave" value="Save"></form></div>';
			this.userTaggerToolTip.innerHTML = thisHTML;
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
				this.authorInfoToolTipCloseButton.innerHTML = 'X';
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
			// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get user tags
			document.body.addEventListener('DOMNodeInserted', function(event) {
				// if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
				if ((event.target.tagName == 'DIV') && ((event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1) || (hasClass(event.target,'child')) || (hasClass(event.target,'thing')))) {
					modules['userTagger'].applyTags(event.target);
				}
			}, true);
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
					var benefitsForm = document.createElement('div');
					var thisUser = document.querySelector('.titlebox > h1').innerHTML;
					benefitsForm.innerHTML = '<form action="/post/friendnote" id="friendnote-r9_2vt1" method="post" class="pretty-form medium-text friend-note" onsubmit="return post_form(this, \'friendnote\');"><input type="hidden" name="name" value="'+thisUser+'"><input type="text" maxlength="300" name="note" id="benefits" class="tiny" onfocus="$(this).parent().addClass(\'edited\')" value="'+thisFriendComment+'"><button onclick="$(this).parent().removeClass(\'edited\')" type="submit">submit</button><span class="status"></span></form>';
					insertAfter( friendButton, benefitsForm );
				}
			}
		}
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
		thisXY=RESUtils.getXYpos(obj);
		this.clickedTag = obj;
		document.querySelector('#userTaggerToolTip h3').innerHTML = 'Tag '+username;
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
			document.getElementById('userTaggerColor').selectedIndex = 0;
		}
		this.userTaggerToolTip.setAttribute('style', 'display: block; top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
		document.getElementById('userTaggerTag').focus();
		modules['userTagger'].updateTagPreview();
		return false;
	},
	updateTagPreview: function() {
		modules['userTagger'].userTaggerPreview.innerHTML = modules['userTagger'].userTaggerTag.value;
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
				this.clickedTag.setAttribute('style', 'background-color: '+color+'; color: ' + this.bgToTextColorMap[color]);
				this.clickedTag.innerHTML = tag;
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
				this.clickedTag.setAttribute('class','userTagLink');
				this.clickedTag.innerHTML = '<div class="RESUserTagImage"></div>';
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
		this.authors = ele.querySelectorAll('.noncollapsed a.author, p.tagline a.author, #friend-table span.user a');
		this.authorCount = this.authors.length;
		this.authori = 0;
		(function(){
			modules['userTagger'].authorCount;
			var chunkLength = Math.min((modules['userTagger'].authorCount - modules['userTagger'].authori), 15);
			for (var i=0;i<chunkLength;i++) {
				var authorNum = modules['userTagger'].authori;
				modules['userTagger'].applyTagToAuthor(modules['userTagger'].authors[authorNum]);
				modules['userTagger'].authori++;
			}
			if (modules['userTagger'].authori < modules['userTagger'].authorCount) {
				setTimeout(arguments.callee, 1000);
			}
		})();		
	},
	applyTagToAuthor: function(thisAuthorObj) {
		var userObject = new Array();
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
			var thisAuthor = thisAuthorObj.text;
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
				thisTag = '<div class="RESUserTagImage"></div>';
				userTagLink.setAttribute('class','userTagLink');
			} else {
				userTagLink.setAttribute('class','userTagLink hasTag');
			}
			userTagLink.innerHTML = thisTag;
			if (thisColor) {
				userTagLink.setAttribute('style','background-color: '+thisColor+'; color: '+this.bgToTextColorMap[thisColor]);
			}
			userTagLink.setAttribute('username',thisAuthor);
			userTagLink.setAttribute('title','set a tag');
			userTagLink.setAttribute('href','javascript:void(0)');
			userTagLink.addEventListener('click', function(e) {
				modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
			}, true);
			var userTag = document.createElement('span');
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
				userVoteWeight.innerHTML = '[vw]';
				userVoteWeight.addEventListener('click', function(e) {
					var theTag = this.parentNode.querySelector('.userTagLink');
					modules['userTagger'].openUserTagPrompt(theTag, theTag.getAttribute('username'));
				}, true);
				this.colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
				userVoteFrag.appendChild(userVoteWeight);
				userTagFrag.appendChild(userVoteFrag);
			}
			insertAfter( thisAuthorObj, userTagFrag );
			// thisAuthorObj.innerHTML += userTagFrag.innerHTML;
			thisIgnore = userObject[thisAuthor].ignore;
			if (thisIgnore && (RESUtils.pageType('profile') != true)) {
				if (this.options.hardIgnore.value) {
					if (RESUtils.pageType() == 'comments') {
						var thisComment = thisAuthorObj.parentNode.parentNode;
						// hide comment block first...
						thisComment.style.display = 'none';
						// hide associated voting block...
						if (thisComment.previousSibling) {
							thisComment.previousSibling.style.display = 'none';
						}
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
							thisComment.innerHTML = thisAuthor + ' is an ignored user';
							addClass(thisComment, 'ignoredUserComment');
						}
					} else {
						var thisPost = thisAuthorObj.parentNode.parentNode.parentNode.querySelector('p.title');
						if (thisPost) {
							// need this setTimeout, potentially because destroying the innerHTML causes conflict with other modules?
							setTimeout(function() {
								thisPost.innerHTML = thisAuthor + ' is an ignored user';
							}, 100);
							thisPost.setAttribute('class','ignoredUserPost');
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
					if (this.options.vwNumber.value) obj.innerHTML = '[' + voteString + ']';
					if (this.options.vwTooltip.value) obj.setAttribute('title','your votes for '+author+': '+voteString);
				}
			}
		}
	},
	showAuthorInfo: function(obj) {
		var isFriend = (hasClass(obj, 'friend')) ? true : false;
		thisXY=RESUtils.getXYpos(obj);
		var objClass = obj.getAttribute('class');
		this.authorInfoToolTipHeader.innerHTML = '<a href="/user/'+obj.textContent+'">' + obj.textContent + '</a>';
		RESUtils.loggedInUserInfo(function(userInfo) {
			var myID = 't2_'+userInfo.data.id;
			if (isFriend) {
				var friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active remove" href="#" tabindex="100" onclick="return toggle(this, unfriend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'), friend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'))">- friends</a><a class="option add" href="#">+ friends</a></span>';
			} else {
				var friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active add" href="#" tabindex="100" onclick="return toggle(this, friend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'), unfriend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'))">+ friends</a><a class="option remove" href="#">- friends</a></span>';
			}
			modules['userTagger'].authorInfoToolTipHeader.innerHTML += friendButton;
		});
		this.authorInfoToolTipContents.innerHTML = '<a class="hoverAuthor" href="/user/'+obj.textContent+'">'+obj.textContent+'</a>:<br><img src="'+RESConsole.loader+'"> loading...';
		this.authorInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 8) + 'px; left: ' + (thisXY.x - 8) + 'px;');
		RESUtils.fadeElementIn(this.authorInfoToolTip, 0.3);
		var thisUserName = obj.textContent;
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
				url:	location.protocol + "//www.reddit.com/user/" + thisUserName + "/about.json",
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
		userHTML += '<div class="authorLabel">Link Karma:</div> <div class="authorDetail">' + jsonData.data.link_karma + '</div>';
		userHTML += '<div class="authorLabel">Comment Karma:</div> <div class="authorDetail">' + jsonData.data.comment_karma + '</div>';
		if ((typeof(modules['userTagger'].tags[jsonData.data.name]) != 'undefined') && (modules['userTagger'].tags[jsonData.data.name].link)) {
			userHTML += '<div class="authorLabel">Link:</div> <div class="authorDetail"><a target="_blank" href="'+modules['userTagger'].tags[jsonData.data.name].link+'">website link</a></div>';
		}
		userHTML += '<div class="clear"></div><div class="bottomButtons">';
		userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/message/compose/?to='+jsonData.data.name+'"><img src="/static/mailgray.png"> send message</a>';
		if (jsonData.data.is_gold) {
			userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/gold">User has Reddit Gold</a>';
		} else {
			userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/gold?goldtype=gift&recipient='+jsonData.data.name+'">Gift Reddit Gold</a>';
		}
		if ((modules['userTagger'].tags[jsonData.data.name]) && (modules['userTagger'].tags[jsonData.data.name].ignore)) {
			userHTML += '<div class="redButton" id="ignoreUser" user="'+jsonData.data.name+'">&empty; Unignore</div>';
		} else {
			userHTML += '<div class="blueButton" id="ignoreUser" user="'+jsonData.data.name+'">&empty; Ignore</div>';
		}
		userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		this.authorInfoToolTipContents.innerHTML = userHTML;
		this.authorInfoToolTipIgnore = this.authorInfoToolTipContents.querySelector('#ignoreUser');
		this.authorInfoToolTipIgnore.addEventListener('click', modules['userTagger'].ignoreUser, false);
	},
	ignoreUser: function(e) {
		if (hasClass(e.target,'blueButton')) {
			removeClass(e.target,'blueButton');
			addClass(e.target,'redButton');
			e.target.innerHTML = '&empty; Unignore';
			var thisIgnore = true;
		} else {
			removeClass(e.target,'redButton');
			addClass(e.target,'blueButton');
			e.target.innerHTML = '&empty; Ignore';
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
		RESUtils.fadeElementOut(this.authorInfoToolTip, 0.3);
	},
	updateTagStorage: function() {
		// update tag storage format from the old individual bits to a big JSON blob
		// It's OK that we're directly accessing localStorage here because if they have old school tag storage, it IS in localStorage.
		(typeof(unsafeWindow) != 'undefined') ? ls = unsafeWindow.localStorage : ls = localStorage;
		var tags = {};
		var toRemove = new Array();
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
		videoTimes: {
			type: 'boolean',
			value: true,
			description: 'Show lengths of videos when possible'
		},
		toolbarFix: { 
			type: 'boolean',
			value: true,
			description: 'Don\'t use Reddit Toolbar when linking to sites that may not function (twitter, youtube and others)'
		},
		/*,
		pinSubredditBar: {
			type: 'boolean',
			value: false,
			description: 'Pin subreddit bar to the top even when you scroll'
		}
		*/
		pinHeader: {
		   type: 'enum',
		   values: [
			   { name: 'None', value: 'none' },
			   { name: 'Subreddit Bar only', value: 'sub' },
			   { name: 'User Bar', value: 'userbar' },
			   { name: 'Full Header', value: 'header' }
		   ],
		   value: 'none',
		   description: 'Pin the subreddit bar or header to the top, even when you scroll.'
		}
	},
	description: 'Adds a number of interface enhancements to Reddit, such "full comments" links, the ability to unhide accidentally hidden posts, and more',
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
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);

			if ((this.options.toolbarFix.value) && ((RESUtils.pageType() == 'linklist') || RESUtils.pageType() == 'comments')) { 
				this.toolbarFix();
			}
			// if (((RESUtils.pageType() == 'inbox') || (RESUtils.pageType() == 'profile') || ((RESUtils.pageType() == 'comments') && (RESUtils.currentSubreddit('friends')))) && (this.options.fullCommentsLink.value)) {
			// removed profile pages since Reddit does this natively now for those...
			if (((RESUtils.pageType() == 'inbox') || ((RESUtils.pageType() == 'comments') && (RESUtils.currentSubreddit('friends')))) && (this.options.fullCommentsLink.value)) {
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
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
					if ((modules['betteReddit'].options.toolbarFix.value) && (RESUtils.pageType() == 'linklist')) {
						modules['betteReddit'].toolbarFix();
					}
					if (((RESUtils.pageType() == 'inbox') || (RESUtils.pageType() == 'profile')) && (modules['betteReddit'].options.fullCommentsLink.value)) {
						modules['betteReddit'].fullComments(event.target);
					}
					if (((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments')) && (modules['betteReddit'].options.fixSaveLinks.value)) {
						modules['betteReddit'].fixSaveLinks(event.target);
					}
					if (((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments')) && (modules['betteReddit'].options.fixHideLinks.value)) {
						modules['betteReddit'].fixHideLinks(event.target);
					}
				}
			}, true);
			if ((RESUtils.currentSubreddit() != null) && (this.options.searchSubredditByDefault.value)) {
				// make sure we're not on a search results page...
				if (location.href.indexOf('/r/'+RESUtils.currentSubreddit()+'/search') == -1) {
					this.searchSubredditByDefault();
				}
			}
			if ((this.options.videoTimes.value) && ((RESUtils.pageType() == 'linklist') || (RESUtils.pageType() == 'comments'))) {
				this.getVideoTimes();
				// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
						modules['betteReddit'].getVideoTimes(event.target);
					}
				}, true);
			}
			if ((RESUtils.loggedInUser() != null) && (this.options.showUnreadCount.value)) {
				// Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
				// RESUtils.addCSS('#mail { min-width: 16px !important; width: auto !important; text-indent: 18px !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				// removing text indent - on 11/14/11 reddit changed the mail sprites, so I have to change how this is handled..
				RESUtils.addCSS('#mail { top: 2px; min-width: 16px !important; width: auto !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				RESUtils.addCSS('#mail.havemail { top: 2px !important; margin-right: 1px; }');
				if ((typeof(chrome)  != 'undefined') || (typeof(safari) != 'undefined')) {
					// I hate that I have this conditional CSS in here but I can't figure out why it's needed for webkit and screws up firefox.
					RESUtils.addCSS('#mail.havemail { top: 0px; }');
				}
				this.showUnreadCount();
			}
			switch(this.options.pinHeader.value) {
				case 'header':
					this.pinHeader();
					break;
				case 'sub':
					this.pinSubredditBar();
					break;
				case 'userbar':
					this.pinUserBar();
					break;
				default:
					break;
			}
		}
	},
	showUnreadCount: function() {
		if (typeof(this.mail) == 'undefined') {
			this.mail = document.querySelector('#mail');
			if (this.mail) {
				this.mailCount = createElementWithID('a','mailCount');
				this.mailCount.display = 'none';
				this.mailCount.setAttribute('href','/message/unread');
				insertAfter(this.mail, this.mailCount);
			}
		}
		if (this.mail) {
			modules['betteReddit'].mail.innerHTML = '';
			if (hasClass(this.mail, 'havemail')) {
				var lastCheck = parseInt(RESStorage.getItem('RESmodules.betteReddit.msgCount.lastCheck.'+RESUtils.loggedInUser())) || 0;
				var now = new Date();
				// 300000 = 5 minutes... we don't want to annoy Reddit's servers too much with this query...
				if ((now.getTime() - lastCheck) > 300000) {
					GM_xmlhttpRequest({
						method:	"GET",
						url:	location.protocol + '//' + location.hostname + "/message/unread/.json?mark=false",
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
			var newTitle = '[' + count + '] ' + document.title.replace(/^\[[\d]+\]\s/,'');
			document.title = newTitle;
			modules['betteReddit'].mailCount.display = 'inline-block'
			modules['betteReddit'].mailCount.innerHTML = '['+count+']';
		} else {
			modules['betteReddit'].mailCount.display = 'none'
			modules['betteReddit'].mailCount.innerHTML = '';
		}
	},
	toolbarFix: function(ele) {
		var root = ele || document;
		var links = root.querySelectorAll('div.entry a.title');
		for (var i=0, len=links.length; i<len; i++) {
			if ((links[i].getAttribute('href').indexOf('youtube.com') != -1) || (links[i].getAttribute('href').indexOf('twitter.com') != -1) || (links[i].getAttribute('href').indexOf('teamliquid.net') != -1)) {
				links[i].setAttribute('onmousedown','');
			}
			// patch below for comments pages thanks to redditor and resident helperninja gavin19
			if (links[i].getAttribute('srcurl')) {
					if ((links[i].getAttribute('srcurl').indexOf('youtube.com') != -1) || (links[i].getAttribute('srcurl').indexOf('twitter.com') != -1) || (links[i].getAttribute('srcurl').indexOf('teamliquid.net') != -1)) {
					links[i].setAttribute('onmousedown','');
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
				fullCommentsLink.innerHTML = '<a class="redditFullComments" href="' + thisCommentsLink + '">'+ this.options.fullCommentsText.value +'</a>';
				linkList.appendChild(fullCommentsLink);
				/* reddit ended up adding this before 4.0 came out.. d'oh
				var getSubredditRegex = /\/r\/([\w\.]+)/i;
				var match = getSubredditRegex.exec(thisCommentsLink);
				if (match) {
					var subredditLink = document.createElement('li');
					subredditLink.innerHTML = '<a class="redditFullCommentsSub" href="/r/' + match[1] + '">(r/'+ match[1] +')</a>';
					linkList.appendChild(subredditLink);
				}
				*/
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
				editLink.innerHTML = '<a onclick="return edit_usertext(this)" href="javascript:void(0);">edit</a>';
				insertAfter(permalink, editLink);
			}
		}
	},
	fixSaveLinks: function(ele) {
		var root = ele || document;
		var saveLinks = root.querySelectorAll('FORM.save-button > SPAN > A');
		for (var i=0, len=saveLinks.length; i<len; i++) {
			saveLinks[i].setAttribute('onclick','');
			saveLinks[i].setAttribute('action','save');
			saveLinks[i].addEventListener('click', modules['betteReddit'].saveLink, false);
		}
		var unsaveLinks = document.querySelectorAll('FORM.unsave-button > SPAN > A');
		for (var i=0, len=saveLinks.length; i<len; i++) {
			if (typeof(unsaveLinks[i]) != 'undefined') {
				unsaveLinks[i].setAttribute('onclick','');
				unsaveLinks[i].setAttribute('action','unsave');
				unsaveLinks[i].addEventListener('click', modules['betteReddit'].saveLink, false);
			}
		}
	},
	fixHideLinks: function(ele) {
		var root = ele || document;
		var hideLinks = root.querySelectorAll('FORM.hide-button > SPAN > A');
		for (var i=0, len=hideLinks.length; i<len; i++) {
			hideLinks[i].setAttribute('onclick','');
			hideLinks[i].setAttribute('action','hide');
			hideLinks[i].addEventListener('click', modules['betteReddit'].hideLink, false);
		}
		var unhideLinks = document.querySelectorAll('FORM.unhide-button > SPAN > A');
		for (var i=0, len=hideLinks.length; i<len; i++) {
			if (typeof(unhideLinks[i]) != 'undefined') {
				unhideLinks[i].setAttribute('onclick','');
				unhideLinks[i].setAttribute('action','unhide');
				unhideLinks[i].addEventListener('click', modules['betteReddit'].hideLink, false);
			}
		}
	},
	saveLink: function(e) {
		if (e) modules['betteReddit'].saveLinkClicked = e.target;
		if (modules['betteReddit'].saveLinkClicked.getAttribute('action') == 'unsave') {
			modules['betteReddit'].saveLinkClicked.innerHTML = 'unsaving...';
		} else {
			modules['betteReddit'].saveLinkClicked.innerHTML = 'saving...';
		}
		if (modules['betteReddit'].modhash) {
			// modules['betteReddit'].saveLinkClicked = e.target;
			var action = modules['betteReddit'].saveLinkClicked.getAttribute('action');
			var parentThing = modules['betteReddit'].saveLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
			var idRe = /id-([\w]+)/i;
			var getLinkid = idRe.exec(parentThing.getAttribute('class'));
			var linkid = getLinkid[1];
			// we also need the modhash to be able to send an API call to save the link...
			/*
			var head = document.getElementsByTagName('head')[0];
			var redditScript = head.querySelectorAll('SCRIPT');
			var modhashRe = /modhash: '([\w]+)'/i;
			for (var i=0, len=redditScript.length; i<len; i++) {
				var modhash = modhashRe.exec(redditScript[i].innerHTML);
				if (modhash) break;
			}
			*/
			if (action == 'unsave') {
				var executed = 'unsaved';
				var apiURL = 'http://'+location.hostname+'/api/unsave';
			} else {
				var executed = 'saved';
				var apiURL = 'http://'+location.hostname+'/api/save';
			}
			// var params = 'id='+linkid+'&executed='+executed+'&uh='+modhash[1]+'&renderstyle=html';
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
						if (modules['betteReddit'].saveLinkClicked.getAttribute('action') == 'unsave') {
							modules['betteReddit'].saveLinkClicked.innerHTML = 'save';
							modules['betteReddit'].saveLinkClicked.setAttribute('action','save');
						} else {
							modules['betteReddit'].saveLinkClicked.innerHTML = 'unsave';
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
				url:	location.protocol + '//www.reddit.com/api/me.json',
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
	hideLink: function(e) {
		if (e) modules['betteReddit'].hideLinkClicked = e.target;
		if (modules['betteReddit'].hideLinkClicked.getAttribute('action') == 'unhide') {
			modules['betteReddit'].hideLinkClicked.innerHTML = 'unhiding...';
		} else {
			modules['betteReddit'].hideLinkClicked.innerHTML = 'hiding...';
		}
		if (modules['betteReddit'].modhash) {
			var action = modules['betteReddit'].hideLinkClicked.getAttribute('action');
			var parentThing = modules['betteReddit'].hideLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
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
						if (modules['betteReddit'].hideLinkClicked.getAttribute('action') == 'unhide') {
							modules['betteReddit'].hideLinkClicked.innerHTML = 'hide';
							modules['betteReddit'].hideLinkClicked.setAttribute('action','hide');
							if (typeof(modules['betteReddit'].hideTimer) != 'undefined') clearTimeout(modules['betteReddit'].hideTimer);
						} else {
							modules['betteReddit'].hideLinkClicked.innerHTML = 'unhide';
							modules['betteReddit'].hideLinkClicked.setAttribute('action','unhide');
							modules['betteReddit'].hideTimer = setTimeout(modules['betteReddit'].hideFader, 5000);
						}
					} else {
						delete modules['betteReddit'].modhash;
						alert('Sorry, there was an error trying to '+modules['betteReddit'].hideLinkClicked.getAttribute('action')+' your submission. Try clicking again.');
					}
				}
			});
		} else {
			GM_xmlhttpRequest({
				method:	"GET",
				url:	location.protocol + '//www.reddit.com/api/me.json',
				onload:	function(response) {
					var data = safeJSON.parse(response.responseText);
					if (typeof(data.data) == 'undefined') {
						alert('Sorry, there was an error trying to '+modules['betteReddit'].hideLinkClicked.getAttribute('action')+' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
					} else if ((typeof(data.data.modhash) != 'undefined') && (data.data.modhash)) {
						modules['betteReddit'].modhash = data.data.modhash;
						modules['betteReddit'].hideLink();
					}
				}
			});
		}
	},
	hideFader: function() {
		var parentThing = modules['betteReddit'].hideLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
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
			var getYoutubeIDRegex = /\?v=([\w\-]{11})&?/i;
			var getYoutubeStartTimeRegex = /[\#|\&]t=([\d]+[m|s][\d]*[m|s]?)/i;
			// var getYoutubeIDRegex = /\?v=([\w\-]+)&?/i;
			this.youtubeLinkIDs = new Array();
			this.youtubeLinkRefs = {};
			for (var i=0, len=youtubeLinks.length; i<len; i++) {
				var match = getYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href'));
				if (match) {
					// add quotes so URL creation is doable with just a join...
					var thisYTID = '"'+match[1]+'"';
					this.youtubeLinkIDs.push(thisYTID);
					this.youtubeLinkRefs[thisYTID] = youtubeLinks[i];
				}
				var timeMatch = getYoutubeStartTimeRegex.exec(youtubeLinks[i].getAttribute('href'));
				if (timeMatch) {
					youtubeLinks[i].innerHTML += ' (@'+timeMatch[1]+')';
				}
			}
			this.getVideoJSON();
		}
	},
	getVideoJSON: function() {
		var thisBatch = modules['betteReddit'].youtubeLinkIDs.splice(0,8);
		if (thisBatch.length) {
			var thisIDString = thisBatch.join('%7C');
			// var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&fields=entry(id,media:group(yt:duration))&alt=json';
			var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&v=2&fields=entry(id,title,media:group(yt:duration,yt:videoid))&alt=json';
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
							if (typeof(modules['betteReddit'].youtubeLinkRefs[thisYTID]) != 'undefined') {
								modules['betteReddit'].youtubeLinkRefs[thisYTID].innerHTML += ' ' + thisTime;
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
		spacer.style.paddingTop = window.getComputedStyle(sb).paddingTop;
		spacer.style.paddingBottom = window.getComputedStyle(sb).paddingBottom;

		// HACK: for some reason, if the SM is enabled, the SB gets squeezed horizontally,
		//       and takes up three rows of vertical space (even at low horizontal resolution).
		if (sm) spacer.style.height = (parseInt(window.getComputedStyle(sb).height) / 3 - 3)+'px';
		else    spacer.style.height = window.getComputedStyle(sb).height;

		//window.setTimeout(function(){
		// add the spacer; take the subreddit bar out of the header and put it above
		header.insertBefore(spacer, sb);
		document.body.insertBefore(sb,header);

		// make it fixed
		// RESUtils.addCSS('div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; box-shadow: 0px 2px 2px #AAA;}');
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
		RESUtils.addCSS('ul#accountSwitcherMenu {position:fixed;}');
		window.addEventListener('scroll', modules['betteReddit'].handleScroll, false);
		this.pinCommonElements();
	},
	handleScroll: function(e) {
		if (RESUtils.elementInViewport(modules['betteReddit'].userBarElement)) {
			modules['betteReddit'].userBarElement.setAttribute('style','');
		} else {
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
		spacer.style.height = window.getComputedStyle(header).height;

		// insert the spacer
		document.body.insertBefore(spacer, header.nextSibling);

		// make the header fixed
		RESUtils.addCSS('#header, ul#accountSwitcherMenu {position:fixed;}');
		// RESUtils.addCSS('#header {left: 0; right: 0; box-shadow: 0px 2px 2px #AAA;}');
		RESUtils.addCSS('#header {left: 0; right: 0; }');
		this.pinCommonElements(sm);

		// TODO Needs testing
		// Sometimes this gets executed before the subreddit logo has finished loading. When that
		// happens, the spacer gets created too short, so when the SR logo finally loads, the header
		// grows and overlaps the top of the page, potentially obscuring the first link. This checks
		// to see if the image is finished loading. If it is, then the spacer's height is set. Otherwise,
		// it pauses, then loops.
		if (!document.getElementById('header-img').complete) setTimeout(function(){
					   if (document.getElementById('header-img').complete)
							   document.getElementById('RESPinnedHeaderSpacer').style.height = window.getComputedStyle(document.getElementById('header')).height;
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
			   RESUtils.addCSS('.drop-choices {position: fixed;}');
		}
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
		}
	},
	description: 'Adds an [l+c] link that opens a link and the comments page in new tabs for you in one click.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	isURLMatch: function() {

	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[\?]*/i,
		/https?:\/\/([a-z]+).reddit.com\/r\/[-\w\._]*\//i
	),
	exclude: Array(
		/https?:\/\/([a-z]+).reddit.com\/r\/[-\w\._\/\?]*\/comments[-\w\._\/\?=]*/i
	),
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			// do stuff here!
			this.applyLinks();
			RESUtils.addCSS('.redditSingleClick { color: #888888; font-weight: bold; cursor: pointer; padding: 0 1px; }');
			// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
					modules['singleClick'].applyLinks();
				}
			}, true);
		}
	},
	applyLinks: function() {
		var entries = document.querySelectorAll('#siteTable .entry');
		for (var i=0, len=entries.length; i<len;i++) {
			if ((typeof(entries[i]) != 'undefined') && (!(hasClass(entries[i],'lcTagged')))) {
				// bug in chrome, barfs on for i in loops with queryselectorall...
				if (i == 'length') break;
				addClass(entries[i],'lcTagged')
				thisLA = entries[i].querySelector('A.title');
				if (thisLA != null) {
					thisLink = thisLA.getAttribute('href');
					thisComments = entries[i].querySelector('.comments');
					if (!(thisLink.match(/^http/i))) {
						thisLink = 'http://' + document.domain + thisLink;
					}
					thisUL = entries[i].querySelector('.flat-list');
					var singleClickLI = document.createElement('li');
					// changed from a link to a span because you can't cancel a new window on middle click of a link during the mousedown event, and a click event isn't triggered.
					var singleClickLink = document.createElement('span');
					// singleClickLink.setAttribute('href','javascript:void(0);');
					singleClickLink.setAttribute('class','redditSingleClick');
					singleClickLink.setAttribute('thisLink',thisLink);
					singleClickLink.setAttribute('thisComments',thisComments);
					if (thisLink != thisComments) {
						singleClickLink.innerHTML = '[l+c]';
					} else if (!(this.options.hideLEC.value)) {
						singleClickLink.innerHTML = '[l=c]';
					}
					singleClickLI.appendChild(singleClickLink);
					thisUL.appendChild(singleClickLI);
					// we have to switch to mousedown because Webkit is being a douche and not triggering click events on middle click.  
					// ?? We should still preventDefault on a click though, maybe?
					singleClickLink.addEventListener('mousedown', function(e) {
						e.preventDefault();
						if (e.button != 2) {
							// check if it's a relative link (no http://domain) because chrome barfs on these when creating a new tab...
							var thisLink = this.getAttribute('thisLink')
							if (typeof(chrome) != 'undefined') {
								thisJSON = {
									requestType: 'singleClick',
									linkURL: this.getAttribute('thisLink'), 
									openOrder: modules['singleClick'].options.openOrder.value,
									commentsURL: this.getAttribute('thisComments'),
									button: e.button,
									ctrl: e.ctrlKey
								}
								chrome.extension.sendRequest(thisJSON, function(response) {
									// send message to background.html to open new tabs...
									return true;
								});
							} else if (typeof(safari) != 'undefined') {
								thisJSON = {
									requestType: 'singleClick',
									linkURL: this.getAttribute('thisLink'), 
									openOrder: modules['singleClick'].options.openOrder.value,
									commentsURL: this.getAttribute('thisComments'),
									button: e.button,
									ctrl: e.ctrlKey
								}
								safari.self.tab.dispatchMessage("singleClick", thisJSON);
							} else if (typeof(opera) != 'undefined') {
								thisJSON = {
									requestType: 'singleClick',
									linkURL: this.getAttribute('thisLink'), 
									openOrder: modules['singleClick'].options.openOrder.value,
									commentsURL: this.getAttribute('thisComments'),
									button: e.button,
									ctrl: e.ctrlKey
								}
								opera.extension.postMessage(JSON.stringify(thisJSON));
							} else if (typeof(self.on) == 'function') {
								thisJSON = {
									requestType: 'singleClick',
									linkURL: this.getAttribute('thisLink'), 
									openOrder: modules['singleClick'].options.openOrder.value,
									commentsURL: this.getAttribute('thisComments'),
									button: e.button,
									ctrl: e.ctrlKey
								}
								self.postMessage(thisJSON);
							} else {
								if (modules['singleClick'].options.openOrder.value == 'commentsfirst') {
									if (this.getAttribute('thisLink') != this.getAttribute('thisComments')) {
										// console.log('open comments');
										window.open(this.getAttribute('thisComments'));
									}
									window.open(this.getAttribute('thisLink'));
								} else {
									window.open(this.getAttribute('thisLink'));
									if (this.getAttribute('thisLink') != this.getAttribute('thisComments')) {
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
		/https?:\/\/([a-z]+).reddit.com\/submit\/?/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			RESUtils.addCSS('.markdownEditor { white-space: nowrap;  }');
			RESUtils.addCSS('.markdownEditor a { margin-right: 8px; text-decoration: none; font-size: 11px; }');
			/*
			RESUtils.addCSS('fieldset.liveComment, fieldset.liveComment legend { border: 1px solid black; border-radius: 1em; -moz-border-radius: 1em; -webkit-border-radius: 1em; }'+
				'fieldset.liveComment { padding: 1ex; margin: 1em 0; }'+
				'fieldset.liveComment legend { padding: 0 1ex; background-color: #E9E9E9; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview STRONG { font-weight: bold; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview EM { font-style: italic; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview PRE { color: auto; margin-top: 10px; margin-bottom: 10px; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview P { margin-bottom: 4px; }');
			*/
			RESUtils.addCSS('.selectedItem { color: #ffffff; background-color: #5f99cf; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview { position: relative; width: auto; margin-bottom: 15px; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview .RESDialogContents h3 { font-weight: bold; }');

			
			if (this.options.subredditAutocomplete.value) this.subredditAutocomplete();
			
			/*
			2009-08-30
				- Fixed top comment box.
				- Added markdown toolbar.
				
			2009-02-05
				- Fixed the preview clearing after clicking "comment". That was broken, too.
				
			2009-02-04
				- Fix because reddit broke it.
			*/

			//
			// showdown.js -- A javascript port of Markdown.
			//
			// Copyright (c) 2007 John Fraser.
			//
			// Original Markdown Copyright (c) 2004-2005 John Gruber
			//   <http://daringfireball.net/projects/markdown/>
			//
			// Redistributable under a BSD-style open source license.
			// See license.txt for more information.
			//
			// The full source distribution is at:
			//
			//				A A L
			//				T C A
			//				T K B
			//
			//   <http://www.attacklab.net/>
			//

			//
			// Wherever possible, Showdown is a straight, line-by-line port
			// of the Perl version of Markdown.
			//
			// This is not a normal parser design; it's basically just a
			// series of string substitutions.  It's hard to read and
			// maintain this way,  but keeping Showdown close to the original
			// design makes it easier to port new features.
			//
			// More importantly, Showdown behaves like markdown.pl in most
			// edge cases.  So web applications can do client-side preview
			// in Javascript, and then build identical HTML on the server.
			//
			// This port needs the new RegExp functionality of ECMA 262,
			// 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers
			// should do fine.  Even with the new regular expression features,
			// We do a lot of work to emulate Perl's regex functionality.
			// The tricky changes in this file mostly have the "attacklab:"
			// label.  Major or self-explanatory changes don't.
			//
			// Smart diff tools like Araxis Merge will be able to match up
			// this file with markdown.pl in a useful way.  A little tweaking
			// helps: in a copy of markdown.pl, replace "#" with "//" and
			// replace "$text" with "text".  Be sure to ignore whitespace
			// and line endings.
			//


			//
			// Showdown usage:
			//
			//   var text = "Markdown *rocks*.";
			//
			//   var converter = new Showdown.converter();
			//   var html = converter.makeHtml(text);
			//
			//   alert(html);
			//
			// Note: move the sample code to the bottom of this
			// file before uncommenting it.
			//


			//
			// Showdown namespace
			//
			var Showdown = {};

			//
			// converter
			//
			// Wraps all "globals" so that the only thing
			// exposed is makeHtml().
			//
			Showdown.converter = function() {

			//
			// Globals:
			//

			// Global hashes, used by various utility routines
			var g_urls;
			var g_titles;
			var g_html_blocks;

			// Used to track when we're inside an ordered or unordered list
			// (see _ProcessListItems() for details):
			var g_list_level = 0;


			this.makeHtml = function(text) {
			//
			// Main function. The order in which other subs are called here is
			// essential. Link and image substitutions need to happen before
			// _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>
			// and <img> tags get encoded.
			//

				// Clear the global hashes. If we don't clear these, you get conflicts
				// from other articles when generating a page which contains more than
				// one article (e.g. an index page that shows the N most recent
				// articles):
				g_urls = new Array();
				g_titles = new Array();
				g_html_blocks = new Array();

				// Replace < with &lt; and > with &gt;
				// COMMENTING TO TEST PATCH FROM: 
				// https://pay.reddit.com/r/Enhancement/comments/fo55a/bug_live_comment_preview_and_reddit_interpret/c1jgpi0?context=3
				// text = text.replace(/</g,"&lt;");
				text = text.replace(/>/g,"&gt;");

				// attacklab: Replace ~ with ~T
				// This lets us use tilde as an escape char to avoid md5 hashes
				// The choice of character is arbitray; anything that isn't
				// magic in Markdown will work.
				// text = text.replace(/~/g,"~T");
				text = text.replace(/(^|[^~])~(?!~)/g,"$1~T");

				// attacklab: Replace $ with ~D
				// RegExp interprets $ as a special character
				// when it's in a replacement string
				text = text.replace(/\$/g,"~D");

				// Standardize line endings
				text = text.replace(/\r\n/g,"\n"); // DOS to Unix
				text = text.replace(/\r/g,"\n"); // Mac to Unix

				// Make sure text begins and ends with a couple of newlines:
				text = "\n\n" + text + "\n\n";

				// Convert all tabs to spaces.
				text = _Detab(text);

				// Strip any lines consisting only of spaces and tabs.
				// This makes subsequent regexen easier to write, because we can
				// match consecutive blank lines with /\n+/ instead of something
				// contorted like /[ \t]*\n+/ .
				text = text.replace(/^[ \t]+$/mg,"");

				// Turn block-level HTML blocks into hash entries
				text = _HashHTMLBlocks(text);

				// Strip link definitions, store in hashes.
				text = _StripLinkDefinitions(text);

				// check for tables...
				text = _DoTables(text);

				text = _RunBlockGamut(text);

				text = _UnescapeSpecialChars(text);

				// attacklab: Restore dollar signs
				text = text.replace(/~D/g,"$$");

				// attacklab: Restore tildes
				text = text.replace(/~T/g,"~");

				return text;
			}


			var _StripLinkDefinitions = function(text) {
			//
			// Strips link definitions from text, stores the URLs and titles in
			// hash references.
			//

				// Link defs are in the form: ^[id]: url "optional title"

				/*
					var text = text.replace(/
							^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
							  [ \t]*
							  \n?				// maybe *one* newline
							  [ \t]*
							<?(\S+?)>?			// url = $2
							  [ \t]*
							  \n?				// maybe one newline
							  [ \t]*
							(?:
							  (\n*)				// any lines skipped = $3 attacklab: lookbehind removed
							  ["(]
							  (.+?)				// title = $4
							  [")]
							  [ \t]*
							)?					// title is optional
							(?:\n+|$)
						  /gm,
						  function(){...});
				*/
				var text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm,
					function (wholeMatch,m1,m2,m3,m4) {
						m1 = m1.toLowerCase();
						g_urls[m1] = _EncodeAmpsAndAngles(m2);  // Link IDs are case-insensitive
						if (m3) {
							// Oops, found blank lines, so it's not a title.
							// Put back the parenthetical statement we stole.
							return m3+m4;
						} else if (m4) {
							g_titles[m1] = m4.replace(/"/g,"&quot;");
						}
						
						// Completely remove the definition from the text
						return "";
					}
				);

				return text;
			}


			var _HashHTMLBlocks = function(text) {
				// attacklab: Double up blank lines to reduce lookaround
				text = text.replace(/\n/g,"\n\n");

				// Hashify HTML blocks:
				// We only want to do this for block-level HTML tags, such as headers,
				// lists, and tables. That's because we still want to wrap <p>s around
				// "paragraphs" that are wrapped in non-block-level tags, such as anchors,
				// phrase emphasis, and spans. The list of tags we're looking for is
				// hard-coded:
				var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
				var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"

				// First, look for nested blocks, e.g.:
				//   <div>
				//     <div>
				//     tags for inner block must be indented.
				//     </div>
				//   </div>
				//
				// The outermost tags must start at the left margin for this to match, and
				// the inner nested divs must be indented.
				// We need to do this before the next, more liberal match, because the next
				// match will start at the first `<div>` and stop at the first `</div>`.

				// attacklab: This regex can be expensive when it fails.
				/*
					var text = text.replace(/
					(						// save in $1
						^					// start of line  (with /m)
						<($block_tags_a)	// start tag = $2
						\b					// word break
											// attacklab: hack around khtml/pcre bug...
						[^\r]*?\n			// any number of lines, minimally matching
						</\2>				// the matching end tag
						[ \t]*				// trailing spaces/tabs
						(?=\n+)				// followed by a newline
					)						// attacklab: there are sentinel newlines at end of document
					/gm,function(){...}};
				*/
				text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement);

				//
				// Now match more liberally, simply from `\n<tag>` to `</tag>\n`
				//

				/*
					var text = text.replace(/
					(						// save in $1
						^					// start of line  (with /m)
						<($block_tags_b)	// start tag = $2
						\b					// word break
											// attacklab: hack around khtml/pcre bug...
						[^\r]*?				// any number of lines, minimally matching
						.*</\2>				// the matching end tag
						[ \t]*				// trailing spaces/tabs
						(?=\n+)				// followed by a newline
					)						// attacklab: there are sentinel newlines at end of document
					/gm,function(){...}};
				*/
				text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement);

				// Special case just for <hr />. It was easier to make a special case than
				// to make the other regex more complicated.  

				/*
					text = text.replace(/
					(						// save in $1
						\n\n				// Starting after a blank line
						[ ]{0,3}
						(<(hr)				// start tag = $2
						\b					// word break
						([^<>])*?			// 
						\/?>)				// the matching end tag
						[ \t]*
						(?=\n{2,})			// followed by a blank line
					)
					/g,hashElement);
				*/
				text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement);

				// Special case for standalone HTML comments:

				/*
					text = text.replace(/
					(						// save in $1
						\n\n				// Starting after a blank line
						[ ]{0,3}			// attacklab: g_tab_width - 1
						<!
						(--[^\r]*?--\s*)+
						>
						[ \t]*
						(?=\n{2,})			// followed by a blank line
					)
					/g,hashElement);
				*/
				text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,hashElement);

				// PHP and ASP-style processor instructions (<?...?> and <%...%>)

				/*
					text = text.replace(/
					(?:
						\n\n				// Starting after a blank line
					)
					(						// save in $1
						[ ]{0,3}			// attacklab: g_tab_width - 1
						(?:
							<([?%])			// $2
							[^\r]*?
							\2>
						)
						[ \t]*
						(?=\n{2,})			// followed by a blank line
					)
					/g,hashElement);
				*/
				text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement);

				// attacklab: Undo double lines (see comment at top of this function)
				text = text.replace(/\n\n/g,"\n");
				return text;
			}

			var hashElement = function(wholeMatch,m1) {
				var blockText = m1;

				// Undo double lines
				blockText = blockText.replace(/\n\n/g,"\n");
				blockText = blockText.replace(/^\n/,"");
				
				// strip trailing blank lines
				blockText = blockText.replace(/\n+$/g,"");
				
				// Replace the element text with a marker ("~KxK" where x is its key)
				blockText = "\n\n~K" + (g_html_blocks.push(blockText)-1) + "K\n\n";
				
				return blockText;
			};

			var _RunBlockGamut = function(text) {
			//
			// These are all the transformations that form block-level
			// tags like paragraphs, headers, and list items.
			//
				text = _DoHeaders(text);

				// Do Horizontal Rules:
				var key = hashBlock("<hr />");
				text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key);
				text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,key);
				text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,key);

				text = _DoLists(text);
				text = _DoCodeBlocks(text);
				text = _DoBlockQuotes(text);

				// We already ran _HashHTMLBlocks() before, in Markdown(), but that
				// was to escape raw HTML in the original Markdown source. This time,
				// we're escaping the markup we've just created, so that we don't wrap
				// <p> tags around block-level tags.
				text = _HashHTMLBlocks(text);
				text = _FormParagraphs(text);

				return text;
			}


			var _RunSpanGamut = function(text) {
			//
			// These are all the transformations that occur *within* block-level
			// tags like paragraphs, headers, and list items.
			//

				text = _DoCodeSpans(text);
				text = _EscapeSpecialCharsWithinTagAttributes(text);
				text = _EncodeBackslashEscapes(text);

				// Process anchor and image tags. Images must come first,
				// because ![foo][f] looks like an anchor.
				text = _DoImages(text);
				text = _DoAnchors(text);

				// Make links out of things like `<http://example.com/>`
				// Must come after _DoAnchors(), because you can use < and >
				// delimiters in inline links like [this](<url>).
				text = _DoAutoLinks(text);
				text = _EncodeAmpsAndAngles(text);
				text = _DoItalicsAndBoldAndStrike(text);
				text = _DoSuperscript(text);

				// Do hard breaks:
				text = text.replace(/  +\n/g," <br />\n");

				return text;
			}

			var _EscapeSpecialCharsWithinTagAttributes = function(text) {
			//
			// Within tags -- meaning between < and > -- encode [\ ` * _] so they
			// don't conflict with their use in Markdown for code, italics and strong.
			//

				// Build a regex to find HTML tags and comments.  See Friedl's 
				// "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
				var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

				text = text.replace(regex, function(wholeMatch) {
					var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");
					tag = escapeCharacters(tag,"\\`*_");
					return tag;
				});

				return text;
			}

			var _DoAnchors = function(text) {
			//
			// Turn Markdown link shortcuts into XHTML <a> tags.
			//
				//
				// First, handle reference-style links: [link text] [id]
				//

				/*
					text = text.replace(/
					(							// wrap whole match in $1
						\[
						(
							(?:
								\[[^\]]*\]		// allow brackets nested one level
								|
								[^\[]			// or anything else
							)*
						)
						\]

						[ ]?					// one optional space
						(?:\n[ ]*)?				// one optional newline followed by spaces

						\[
						(.*?)					// id = $3
						\]
					)()()()()					// pad remaining backreferences
					/g,_DoAnchors_callback);
				*/
				text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag);

				//
				// Next, inline-style links: [link text](url "optional title")
				//

				/*
					text = text.replace(/
						(						// wrap whole match in $1
							\[
							(
								(?:
									\[[^\]]*\]	// allow brackets nested one level
								|
								[^\[\]]			// or anything else
							)
						)
						\]
						\(						// literal paren
						[ \t]*
						()						// no id, so leave $3 empty
						<?(.*?)>?				// href = $4
						[ \t]*
						(						// $5
							(['"])				// quote char = $6
							(.*?)				// Title = $7
							\6					// matching quote
							[ \t]*				// ignore any spaces/tabs between closing quote and )
						)?						// title is optional
						\)
					)
					/g,writeAnchorTag);
				*/
				text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag);
				// the code below was to fix links that don't start with / or http ... but it doesn't work right and I'm stuck for now. undoing this change.
				// text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*(\/|https?:\/\/)<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/ig,writeAnchorTag);

				//
				// Last, handle reference-style shortcuts: [link text]
				// These must come last in case you've also got [link test][1]
				// or [link test](/foo)
				//

				/*
					text = text.replace(/
					(		 					// wrap whole match in $1
						\[
						([^\[\]]+)				// link text = $2; can't contain '[' or ']'
						\]
					)()()()()()					// pad rest of backreferences
					/g, writeAnchorTag);
				*/
				text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

				return text;
			}

			var writeAnchorTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
				if (m7 == undefined) m7 = "";
				var whole_match = m1;
				var link_text   = m2;
				var link_id	 = m3.toLowerCase();
				var url		= m4;
				var title	= m7;
				
				if (url == "") {
					if (link_id == "") {
						// lower-case and turn embedded newlines into spaces
						link_id = link_text.toLowerCase().replace(/ ?\n/g," ");
					}
					url = "#"+link_id;
					
					if (g_urls[link_id] != undefined) {
						url = g_urls[link_id];
						if (g_titles[link_id] != undefined) {
							title = g_titles[link_id];
						}
					}
					else {
						if (whole_match.search(/\(\s*\)$/m)>-1) {
							// Special case for explicit empty url
							url = "";
						} else {
							return whole_match;
						}
					}
				}	
				url = escapeCharacters(url,"*_");
				var result = "<a href=\"" + url + "\"";
				
				if (title != "") {
					title = title.replace(/"/g,"&quot;");
					title = escapeCharacters(title,"*_");
					result +=  " title=\"" + title + "\"";
				}
				
				result += ">" + link_text + "</a>";
				
				return result;
			}


			var _DoImages = function(text) {
			//
			// Turn Markdown image shortcuts into <img> tags.
			//

				//
				// First, handle reference-style labeled images: ![alt text][id]
				//

				/*
					text = text.replace(/
					(						// wrap whole match in $1
						!\[
						(.*?)				// alt text = $2
						\]

						[ ]?				// one optional space
						(?:\n[ ]*)?			// one optional newline followed by spaces

						\[
						(.*?)				// id = $3
						\]
					)()()()()				// pad rest of backreferences
					/g,writeImageTag);
				*/
				text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag);

				//
				// Next, handle inline images:  ![alt text](url "optional title")
				// Don't forget: encode * and _

				/*
					text = text.replace(/
					(						// wrap whole match in $1
						!\[
						(.*?)				// alt text = $2
						\]
						\s?					// One optional whitespace character
						\(					// literal paren
						[ \t]*
						()					// no id, so leave $3 empty
						<?(\S+?)>?			// src url = $4
						[ \t]*
						(					// $5
							(['"])			// quote char = $6
							(.*?)			// title = $7
							\6				// matching quote
							[ \t]*
						)?					// title is optional
					\)
					)
					/g,writeImageTag);
				*/
				text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag);

				return text;
			}

			var writeImageTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
				var whole_match = m1;
				var alt_text   = m2;
				var link_id	 = m3.toLowerCase();
				var url		= m4;
				var title	= m7;

				if (!title) title = "";
				
				if (url == "") {
					if (link_id == "") {
						// lower-case and turn embedded newlines into spaces
						link_id = alt_text.toLowerCase().replace(/ ?\n/g," ");
					}
					url = "#"+link_id;
					
					if (g_urls[link_id] != undefined) {
						url = g_urls[link_id];
						if (g_titles[link_id] != undefined) {
							title = g_titles[link_id];
						}
					}
					else {
						return whole_match;
					}
				}	
				
				alt_text = alt_text.replace(/"/g,"&quot;");
				url = escapeCharacters(url,"*_");
				var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

				// attacklab: Markdown.pl adds empty title attributes to images.
				// Replicate this bug.

				//if (title != "") {
					title = title.replace(/"/g,"&quot;");
					title = escapeCharacters(title,"*_");
					result +=  " title=\"" + title + "\"";
				//}
				
				result += " />";
				
				return result;
			}


			var _DoHeaders = function(text) {

				// Setext-style headers:
				//	Header 1
				//	========
				//  
				//	Header 2
				//	--------
				//
				text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
					function(wholeMatch,m1){return hashBlock("<h1>" + _RunSpanGamut(m1) + "</h1>");});

				text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
					function(matchFound,m1){return hashBlock("<h2>" + _RunSpanGamut(m1) + "</h2>");});

				// atx-style headers:
				//  # Header 1
				//  ## Header 2
				//  ## Header 2 with closing hashes ##
				//  ...
				//  ###### Header 6
				//

				/*
					text = text.replace(/
						^(\#{1,6})				// $1 = string of #'s
						[ \t]*
						(.+?)					// $2 = Header text
						[ \t]*
						\#*						// optional closing #'s (not counted)
						\n+
					/gm, function() {...});
				*/

				text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
					function(wholeMatch,m1,m2) {
						var h_level = m1.length;
						return hashBlock("<h" + h_level + ">" + _RunSpanGamut(m2) + "</h" + h_level + ">");
					});

				return text;
			}

			// This declaration keeps Dojo compressor from outputting garbage:
			var _ProcessListItems;

			var _DoLists = function(text) {
			//
			// Form HTML ordered (numbered) and unordered (bulleted) lists.
			//

				// attacklab: add sentinel to hack around khtml/safari bug:
				// http://bugs.webkit.org/show_bug.cgi?id=11231
				text += "~0";

				// Re-usable pattern to match any entirel ul or ol list:

				/*
					var whole_list = /
					(									// $1 = whole list
						(								// $2
							[ ]{0,3}					// attacklab: g_tab_width - 1
							([*+-]|\d+[.])				// $3 = first list item marker
							[ \t]+
						)
						[^\r]+?
						(								// $4
							~0							// sentinel for workaround; should be $
						|
							\n{2,}
							(?=\S)
							(?!							// Negative lookahead for another list item marker
								[ \t]*
								(?:[*+-]|\d+[.])[ \t]+
							)
						)
					)/g
				*/
				var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

				if (g_list_level) {
					text = text.replace(whole_list,function(wholeMatch,m1,m2) {
						var list = m1;
						var list_type = (m2.search(/[*+-]/g)>-1) ? "ul" : "ol";

						// Turn double returns into triple returns, so that we can make a
						// paragraph for the last item in a list, if necessary:
						list = list.replace(/\n{2,}/g,"\n\n\n");;
						var result = _ProcessListItems(list);
				
						// Trim any trailing whitespace, to put the closing `</$list_type>`
						// up on the preceding line, to get it past the current stupid
						// HTML block parser. This is a hack to work around the terrible
						// hack that is the HTML block parser.
						result = result.replace(/\s+$/,"");
						result = "<"+list_type+">" + result + "</"+list_type+">\n";
						return result;
					});
				} else {
					whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
					text = text.replace(whole_list,function(wholeMatch,m1,m2,m3) {
						var runup = m1;
						var list = m2;

						var list_type = (m3.search(/[*+-]/g)>-1) ? "ul" : "ol";
						// Turn double returns into triple returns, so that we can make a
						// paragraph for the last item in a list, if necessary:
						var list = list.replace(/\n{2,}/g,"\n\n\n");;
						var result = _ProcessListItems(list);
						result = runup + "<"+list_type+">\n" + result + "</"+list_type+">\n";	
						return result;
					});
				}

				// attacklab: strip sentinel
				text = text.replace(/~0/,"");

				return text;
			}

			_ProcessListItems = function(list_str) {
			//
			//  Process the contents of a single ordered or unordered list, splitting it
			//  into individual list items.
			//
				// The $g_list_level global keeps track of when we're inside a list.
				// Each time we enter a list, we increment it; when we leave a list,
				// we decrement. If it's zero, we're not in a list anymore.
				//
				// We do this because when we're not inside a list, we want to treat
				// something like this:
				//
				//    I recommend upgrading to version
				//    8. Oops, now this line is treated
				//    as a sub-list.
				//
				// As a single paragraph, despite the fact that the second line starts
				// with a digit-period-space sequence.
				//
				// Whereas when we're inside a list (or sub-list), that line will be
				// treated as the start of a sub-list. What a kludge, huh? This is
				// an aspect of Markdown's syntax that's hard to parse perfectly
				// without resorting to mind-reading. Perhaps the solution is to
				// change the syntax rules such that sub-lists must start with a
				// starting cardinal number; e.g. "1." or "a.".

				g_list_level++;

				// trim trailing blank lines:
				list_str = list_str.replace(/\n{2,}$/,"\n");

				// attacklab: add sentinel to emulate \z
				list_str += "~0";

				/*
					list_str = list_str.replace(/
						(\n)?							// leading line = $1
						(^[ \t]*)						// leading whitespace = $2
						([*+-]|\d+[.]) [ \t]+			// list marker = $3
						([^\r]+?						// list item text   = $4
						(\n{1,2}))
						(?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))
					/gm, function(){...});
				*/
				list_str = list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
					function(wholeMatch,m1,m2,m3,m4){
						var item = m4;
						var leading_line = m1;
						var leading_space = m2;

						if (leading_line || (item.search(/\n{2,}/)>-1)) {
							item = _RunBlockGamut(_Outdent(item));
						}
						else {
							// Recursion for sub-lists:
							item = _DoLists(_Outdent(item));
							item = item.replace(/\n$/,""); // chomp(item)
							item = _RunSpanGamut(item);
						}

						return  "<li>" + item + "</li>\n";
					}
				);

				// attacklab: strip sentinel
				list_str = list_str.replace(/~0/g,"");

				g_list_level--;
				return list_str;
			}


			var _DoCodeBlocks = function(text) {
			//
			//  Process Markdown `<pre><code>` blocks.
			//  

				/*
					text = text.replace(text,
						/(?:\n\n|^)
						(								// $1 = the code block -- one or more lines, starting with a space/tab
							(?:
								(?:[ ]{4}|\t)			// Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
								.*\n+
							)+
						)
						(\n*[ ]{0,3}[^ \t\n]|(?=~0))	// attacklab: g_tab_width
					/g,function(){...});
				*/

				// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
				text += "~0";
				
				// text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
				text = text.replace(/(?:\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
					function(wholeMatch,m1,m2) {
						var codeblock = m1;
						var nextChar = m2;
					
						codeblock = _EncodeCode( _Outdent(codeblock));
						codeblock = _Detab(codeblock);
						codeblock = codeblock.replace(/^\n+/g,""); // trim leading newlines
						codeblock = codeblock.replace(/\n+$/g,""); // trim trailing whitespace

						codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

						return hashBlock(codeblock) + nextChar;
					}
				);

				// attacklab: strip sentinel
				text = text.replace(/~0/,"");

				return text;
			}

			var hashBlock = function(text) {
				text = text.replace(/(^\n+|\n+$)/g,"");
				return "\n\n~K" + (g_html_blocks.push(text)-1) + "K\n\n";
			}


			var _DoCodeSpans = function(text) {
			//
			//   *  Backtick quotes are used for <code></code> spans.
			// 
			//   *  You can use multiple backticks as the delimiters if you want to
			//	 include literal backticks in the code span. So, this input:
			//	 
			//		 Just type ``foo `bar` baz`` at the prompt.
			//	 
			//	   Will translate to:
			//	 
			//		 <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
			//	 
			//	There's no arbitrary limit to the number of backticks you
			//	can use as delimters. If you need three consecutive backticks
			//	in your code, use four for delimiters, etc.
			//
			//  *  You can use spaces to get literal backticks at the edges:
			//	 
			//		 ... type `` `bar` `` ...
			//	 
			//	   Turns to:
			//	 
			//		 ... type <code>`bar`</code> ...
			//

				/*
					text = text.replace(/
						(^|[^\\])					// Character before opening ` can't be a backslash
						(`+)						// $2 = Opening run of `
						(							// $3 = The code block
							[^\r]*?
							[^`]					// attacklab: work around lack of lookbehind
						)
						\2							// Matching closer
						(?!`)
					/gm, function(){...});
				*/

				text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
					function(wholeMatch,m1,m2,m3,m4) {
						var c = m3;
						c = c.replace(/^([ \t]*)/g,"");	// leading whitespace
						c = c.replace(/[ \t]*$/g,"");	// trailing whitespace
						c = _EncodeCode(c);
						return m1+"<code>"+c+"</code>";
					});

				return text;
			}


			var _EncodeCode = function(text) {
			//
			// Encode/escape certain characters inside Markdown code runs.
			// The point is that in code, these characters are literals,
			// and lose their special Markdown meanings.
			//
				// Encode all ampersands; HTML entities are not
				// entities within a Markdown code span.
				// COMMENTING TO TEST PATCH FROM: 
				// https://pay.reddit.com/r/Enhancement/comments/fo55a/bug_live_comment_preview_and_reddit_interpret/c1jgpi0?context=3
				// text = text.replace(/&/g,"&amp;");

				// Do the angle bracket song and dance:
				// COMMENTING TO TEST PATCH FROM: 
				// https://pay.reddit.com/r/Enhancement/comments/fo55a/bug_live_comment_preview_and_reddit_interpret/c1jgpi0?context=3
				// text = text.replace(/</g,"&lt;");
				// text = text.replace(/>/g,"&gt;");

				// Now, escape characters that are magic in Markdown:
				text = escapeCharacters(text,"\*_{}[]\\",false);

			// jj the line above breaks this:
			//---

			//* Item

			//   1. Subitem

			//            special char: *
			//---

				return text;
			}


			var _DoItalicsAndBoldAndStrike = function(text) {
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
					
				return text;
			}

			var _DoSuperscript = function(text) {
				// do the bigger grab first (to capture things like its^super^duper
				var lastText = '';
				while (text != lastText) {
					lastText = text;
					text = text.replace(/([\S]+)\^([\S]+)/g,
						"$1<sup>$2</sup>");
				}
				return text;
			}

			var _DoTables = function(text) {
				// eventually...
				// (([\w]+)(?:\|([\w]+))+)\n((--+)(?:\|(--+))+)\n(([\w]+)(?:\|([\w]+))+\n)+ grabs a table!
				if (text) {
					// var match = text.match(/[^\n\r]+(?:\|[^\n\r]+)+\n--(?:\|--)+\n(?:[^\n\r]+(\|[^\n\r]+)+\n)+/g);
					var match = text.match(/[^\n\r]+(?:\|[^\n\r]+)+\n(:?[-]{2,}:?)(\|:?[-]{2,}:?)+\n(?:[^\n\r]+(\|[^\n\r]+)+\n)+/g);
					if (match != null) {
						for (var i=0, len=match.length; i<len; i++) {
							if (typeof(match[i]) != 'undefined') {
								var thisTable = match[i].split('\n');
								var thisRow = thisTable[0];
								var thisRowCells = thisRow.split('|');
								var thisTableHTML = '<table><thead>';
								for (cell in thisRowCells) {
									thisCell = _RunSpanGamut(thisRowCells[cell]);
									thisTableHTML += '<th>'+thisCell+'</th>';
								}
								thisTableHTML += '</thead><tbody>';
								// row 0 is headers. row 1 is dividers which we parse for alignment, then we'll start at row 2.
								for (var j=1, len=thisTable.length; j<len; j++) {
									var cellCount = 0;
									thisRow = thisTable[j];
									thisRowCells = thisRow.split('|');
									if (j == 1) {
										var thisAlign = new Array();
										for (cell in thisRowCells) {
											if (thisRowCells[cell].substr(0,1) == ':') {
												thisAlign[cellCount] = 'left';
												if (thisRowCells[cell].substr(thisRowCells[cell].length-1) == ':') {
													thisAlign[cellCount] = 'center';
												}
											} else if (thisRowCells[cell].substr(thisRowCells[cell].length-1) == ':') {
												thisAlign[cellCount] = 'right';
											}
											cellCount++;
										}
									} else {
										thisTableHTML += '<tr>';
										cellCount = 0;
										for (cell in thisRowCells) {
											thisCell = _RunSpanGamut(thisRowCells[cell]);
											thisTableHTML += '<td align="'+thisAlign[cellCount]+'">'+thisCell+'</td>';
											cellCount++;
										}
										thisTableHTML += '</tr>';
										console.log(thisTableHTML);
									}
								}
								thisTableHTML += '</tbody></table>';
								
								// text = text.replace(/[^\n\r]+(?:\|[^\n\r]+)+\n--(?:\|--)+\n(?:[^\n\r]+(\|[^\n\r]+)+\n)+/,
								text = text.replace(/[^\n\r]+(?:\|[^\n\r]+)+\n(:?[-]{2,}:?)(\|:?[-]{2,}:?)+\n(?:[^\n\r]+(\|[^\n\r]+)+\n)+/,
									thisTableHTML);
							}
						}
					}
				}
				return text;
			}


			var _DoBlockQuotes = function(text) {

				/*
					text = text.replace(/
					(								// Wrap whole match in $1
						(
							^[ \t]*>[ \t]?			// '>' at the start of a line
							.+\n					// rest of the first line
							(.+\n)*					// subsequent consecutive lines
							\n*						// blanks
						)+
					)
					/gm, function(){...});
				*/

				text = text.replace(/((^[ \t]*&gt;[ \t]?.+\n(.+\n)*\n*)+)/gm,
					function(wholeMatch,m1) {
						var bq = m1;

						// attacklab: hack around Konqueror 3.5.4 bug:
						// "----------bug".replace(/^-/g,"") == "bug"

						bq = bq.replace(/^[ \t]*&gt;[ \t]?/gm,"~0");	// trim one level of quoting

						// attacklab: clean up hack
						bq = bq.replace(/~0/g,"");

						bq = bq.replace(/^[ \t]+$/gm,"");		// trim whitespace-only lines
						bq = _RunBlockGamut(bq);				// recurse
						
						bq = bq.replace(/(^|\n)/g,"$1  ");
						// These leading spaces screw with <pre> content, so we need to fix that:
						bq = bq.replace(
								/(\s*<pre>[^\r]+?<\/pre>)/gm,
							function(wholeMatch,m1) {
								var pre = m1;
								// attacklab: hack around Konqueror 3.5.4 bug:
								pre = pre.replace(/^  /mg,"~0");
								pre = pre.replace(/~0/g,"");
								return pre;
							});
						
						return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
					});
				return text;
			}


			var _FormParagraphs = function(text) {
			//
			//  Params:
			//    $text - string to process with html <p> tags
			//

				// Strip leading and trailing lines:
				text = text.replace(/^\n+/g,"");
				text = text.replace(/\n+$/g,"");

				var grafs = text.split(/\n{2,}/g);
				var grafsOut = new Array();

				//
				// Wrap <p> tags.
				//
				var end = grafs.length;
				for (var i=0; i<end; i++) {
					var str = grafs[i];

					// if this is an HTML marker, copy it
					if (str.search(/~K(\d+)K/g) >= 0) {
						grafsOut.push(str);
					}
					else if (str.search(/\S/) >= 0) {
						str = _RunSpanGamut(str);
						str = str.replace(/^([ \t]*)/g,"<p>");
						str += "</p>"
						grafsOut.push(str);
					}

				}

				//
				// Unhashify HTML blocks
				//
				end = grafsOut.length;
				for (var i=0; i<end; i++) {
					// if this is a marker for an html block...
					while (grafsOut[i].search(/~K(\d+)K/) >= 0) {
						var blockText = g_html_blocks[RegExp.$1];
						blockText = blockText.replace(/\$/g,"$$$$"); // Escape any dollar signs
						grafsOut[i] = grafsOut[i].replace(/~K\d+K/,blockText);
					}
				}

				return grafsOut.join("\n\n");
			}


			var _EncodeAmpsAndAngles = function(text) {
			// Smart processing for ampersands and angle brackets that need to be encoded.
				
				// Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
				//   http://bumppo.net/projects/amputator/
				text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");
				
				// Encode naked <'s
				text = text.replace(/<(?![a-z\/?\$!])/gi,"&lt;");
				
				return text;
			}


			var _EncodeBackslashEscapes = function(text) {
			//
			//   Parameter:  String.
			//   Returns:	The string, with after processing the following backslash
			//			   escape sequences.
			//

				// attacklab: The polite way to do this is with the new
				// escapeCharacters() function:
				//
				// 	text = escapeCharacters(text,"\\",true);
				// 	text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
				//
				// ...but we're sidestepping its use of the (slow) RegExp constructor
				// as an optimization for Firefox.  This function gets called a LOT.

				text = text.replace(/\\(\\)/g,escapeCharacters_callback);
				text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback);
				return text;
			}


			var _DoAutoLinks = function(text) {

				text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,"<a href=\"$1\">$1</a>");

				// Email addresses: <address@domain.foo>

				/*
					text = text.replace(/
						<
						(?:mailto:)?
						(
							[-.\w]+
							\@
							[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
						)
						>
					/gi, _DoAutoLinks_callback());
				*/
				
				text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,
					function(wholeMatch,m1) {
						return _EncodeEmailAddress( _UnescapeSpecialChars(m1) );
					}
				);

				return text;
			}


			var _EncodeEmailAddress = function(addr) {
			//
			//  Input: an email address, e.g. "foo@example.com"
			//
			//  Output: the email address as a mailto link, with each character
			//	of the address encoded as either a decimal or hex entity, in
			//	the hopes of foiling most address harvesting spam bots. E.g.:
			//
			//	<a href="&#x6D;&#97;&#105;&#108;&#x74;&#111;:&#102;&#111;&#111;&#64;&#101;
			//	   x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;">&#102;&#111;&#111;
			//	   &#64;&#101;x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;</a>
			//
			//  Based on a filter by Matthew Wickline, posted to the BBEdit-Talk
			//  mailing list: <http://tinyurl.com/yu7ue>
			//

				// attacklab: why can't javascript speak hex?
				function char2hex(ch) {
					var hexDigits = '0123456789ABCDEF';
					var dec = ch.charCodeAt(0);
					return(hexDigits.charAt(dec>>4) + hexDigits.charAt(dec&15));
				}

				var encode = [
					function(ch){return "&#"+ch.charCodeAt(0)+";";},
					function(ch){return "&#x"+char2hex(ch)+";";},
					function(ch){return ch;}
				];

				addr = "mailto:" + addr;

				addr = addr.replace(/./g, function(ch) {
					if (ch == "@") {
						// this *must* be encoded. I insist.
						ch = encode[Math.floor(Math.random()*2)](ch);
					} else if (ch !=":") {
						// leave ':' alone (to spot mailto: later)
						var r = Math.random();
						// roughly 10% raw, 45% hex, 45% dec
						ch =  (
								r > .9  ?	encode[2](ch)   :
								r > .45 ?	encode[1](ch)   :
											encode[0](ch)
							);
					}
					return ch;
				});

				addr = "<a href=\"" + addr + "\">" + addr + "</a>";
				addr = addr.replace(/">.+:/g,"\">"); // strip the mailto: from the visible part"

				return addr;
			}


			var _UnescapeSpecialChars = function(text) {
			//
			// Swap back in all the special characters we've hidden.
			//
				text = text.replace(/~E(\d+)E/g,
					function(wholeMatch,m1) {
						var charCodeToReplace = parseInt(m1);
						return String.fromCharCode(charCodeToReplace);
					}
				);
				return text;
			}


			var _Outdent = function(text) {
			//
			// Remove one level of line-leading tabs or spaces
			//

				// attacklab: hack around Konqueror 3.5.4 bug:
				// "----------bug".replace(/^-/g,"") == "bug"

				text = text.replace(/^(\t|[ ]{1,4})/gm,"~0"); // attacklab: g_tab_width

				// attacklab: clean up hack
				text = text.replace(/~0/g,"")

				return text;
			}

			var _Detab = function(text) {
			// attacklab: Detab's completely rewritten for speed.
			// In perl we could fix it by anchoring the regexp with \G.
			// In javascript we're less fortunate.

				// expand first n-1 tabs
				text = text.replace(/\t(?=\t)/g,"    "); // attacklab: g_tab_width

				// replace the nth with two sentinels
				text = text.replace(/\t/g,"~A~B");

				// use the sentinel to anchor our regex so it doesn't explode
				text = text.replace(/~B(.+?)~A/g,
					function(wholeMatch,m1,m2) {
						var leadingText = m1;
						var numSpaces = 4 - leadingText.length % 4;  // attacklab: g_tab_width

						// there *must* be a better way to do this:
						for (var i=0; i<numSpaces; i++) leadingText+=" ";

						return leadingText;
					}
				);

				// clean up sentinels
				// text = text.replace(/~A/g,"    ");  // attacklab: g_tab_width
				// text = text.replace(/~B/g,"");
				text = text.replace(/~A~B/g,"    ");

				return text;
			}


			//
			//  attacklab: Utility functions
			//


			var escapeCharacters = function(text, charsToEscape, afterBackslash) {
				// First we have to escape the escape characters so that
				// we can build a character class out of them
				var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g,"\\$1") + "])";

				if (afterBackslash) {
					regexString = "\\\\" + regexString;
				}

				var regex = new RegExp(regexString,"g");
				text = text.replace(regex,escapeCharacters_callback);

				return text;
			}


			var escapeCharacters_callback = function(wholeMatch,m1) {
				var charCodeToEscape = m1.charCodeAt(0);
				return "~E"+charCodeToEscape+"E";
			}

			} // end of Showdown.converter




			// ###########################################################################
			// Start user script 
			// ###########################################################################



			var converter = new Showdown.converter();

			function wireupNewCommentEditors( parent )
			{	
				if (!parent.getElementsByTagName) return;
				
				if ( parent.tagName == 'FORM' )
				{		
					/*HACK: I don't get it! When I click Reply to a comment, a live 
					preview already exists! Even before our handler for DOMNodeInserted 
					fires. (I tested this with a timeout.) Plus, the existing live preview 
					will already contain whatever preview is in the main comment preview 
					at the time, but it is not linked to the main comment text area, so it 
					never updates. The crazy thig is, the form for the comment reply 
					doesn't even exist in the DOM before we click the Reply link. So where 
					the hell is this preview coming from? I'm just brute-forcing it away 
					for now. Same issue with the editor*/
					removeExistingPreview( parent );		
					removeExistingEditor( parent );
					
					var preview = addPreviewToParent( parent );	
					addMarkdownEditorToForm( parent, preview );
				}
				else
				{		
					var forms = parent.getElementsByTagName('form');
					
					for ( var i=0, form=null; form=forms[i]; i++ ) {
						
						if ( form.getAttribute('id') && (form.getAttribute('id').match(/^commentreply_./)))	{				
							var preview = addPreviewToParent(form);
							addMarkdownEditorToForm( form, preview );
						} else if (form && form.getAttribute('id') && form.getAttribute('id').match(/^form-./)) {
							// this is a just-added comment, so we need to add the elements to the usertext-edit div as its structure is a bit different from an existing comment...
							var usertext = form.querySelector('.usertext-edit');
							if (usertext) {
								var preview = addPreviewToParent(usertext);
								addMarkdownEditorToForm( usertext, preview );
							}
						}

					}
				}
			}

			function wireupExistingCommentEditors()
			{
				// opera doesn't like xpath for some reason - changing to querySelectorAll.
				/*
				var editDivs = document.evaluate(
					"//div[@class='usertext-edit']",
					document,
					null,
					XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
					null
				);
				//First one is not an edit form.
				for ( var i = 0; i < editDivs.snapshotLength; i++)
				{
					var editDiv = editDivs.snapshotItem(i);
					
					var preview = addPreviewToParent( editDiv );
					addMarkdownEditorToForm( editDiv, preview );
					
					refreshPreview( preview, preview.textArea )
				}
				*/
				var editDivs = document.body.querySelectorAll('div.usertext-edit');
				//First one is not an edit form.
				for ( var i = 0, len=editDivs.length; i < len; i++)
				{
					var editDiv = editDivs[i];
					
					var preview = addPreviewToParent( editDiv );
					addMarkdownEditorToForm( editDiv, preview );
					
					refreshPreview( preview, preview.textArea )
				}
				
			}
			
			function wireupViewSourceButtons(ele) {
				if (ele == null) ele = document;
				if (RESUtils.pageType() == 'comments') {
					modules['commentPreview'].commentMenus = ele.querySelectorAll('.entry .flat-list.buttons .first');
					modules['commentPreview'].commentMenusCount = modules['commentPreview'].commentMenus.length;
					modules['commentPreview'].commentMenusi = 0;
					(function(){
						// scan 15 links at a time...
						var chunkLength = Math.min((modules['commentPreview'].commentMenusCount - modules['commentPreview'].commentMenusi), 15);
						for (var i=0;i<chunkLength;i++) {
							viewSource = document.createElement('li');
							viewSource.innerHTML = '<a href="javascript:void(0)">source</a>';
							viewSource.addEventListener('click',function(e) {
								e.preventDefault();
								modules['commentPreview'].viewSource(e.target);
							}, false);
							// if (modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi].nextSibling) {
							//	insertAfter(modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi].nextSibling, viewSource);
							//} else {
								if (modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi].nextSibling != null) {
									insertAfter(modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi].nextSibling, viewSource);
								} else {
									insertAfter(modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi], viewSource);
								}
							//}
							modules['commentPreview'].commentMenusi++;
						}
						if (modules['commentPreview'].commentMenusi < modules['commentPreview'].commentMenusCount) {
							setTimeout(arguments.callee, 1000);
						} 
					})();		
				}
			}

			function addPreviewToParent( parent ) {	
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
				previewContainer.innerHTML = '<h3>Live Preview</h3>';
				
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
				
					var timer=null;
					
					targetTextArea.addEventListener(
						'keyup',
						function(e)
						{
							if (timer) clearTimeout(timer);
							
							timer = setTimeout(
								function()
								{
									refreshPreview( preview, targetTextArea );			
								},
								100
							);
						},
						false
					);	

					targetTextArea.addEventListener(
						'keydown',
						function(e)
						{
							if (e.ctrlKey || e.metaKey) {
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
								var toReplace = $(e.target).getSelection().text;
								switch (String.fromCharCode(e.keyCode)) {
									case 'I':
										e.preventDefault();
										if (((toReplace.substr(0,1) == '*') && (toReplace.substr(0,2) != '**')) && ((toReplace.substr(-1) == '*') && (toReplace.substr(-2) != '**'))) {
											toReplace = toReplace.substr(1,toReplace.length-2);
										} else {
											toReplace = '*'+toReplace+'*';
										}
										$(e.target).replaceSelection(toReplace,true);
										break;
									case 'B':
										e.preventDefault();
										if ((toReplace.substr(0,2) == '**') && (toReplace.substr(-2) == '**')) {
											toReplace = toReplace.substr(2,toReplace.length-4);
										} else {
											toReplace = '**'+toReplace+'**';
										}
										$(e.target).replaceSelection(toReplace,true);
										break;
									case 'S':
										e.preventDefault();
										if ((toReplace.substr(0,2) == '~~') && (toReplace.substr(-2) == '~~')) {
											toReplace = toReplace.substr(2,toReplace.length-4);
										} else {
											toReplace = '~~'+toReplace+'~~';
										}
										$(e.target).replaceSelection(toReplace,true);
										break;
								}
							}
						},
						false
					);	

					
					preview.textArea = targetTextArea;
				
					addPreviewClearOnCommentSubmit( parent, preview );
				}
				
				return preview;
			}

			//Find any fieldsets with a class of liveComment as children of this element and remove them.
			function removeExistingPreview( parent )
			{
				var previews = parent.querySelectorAll('div.livePreview');
				
				for (var i = 0, preview = null; preview = previews[i]; i++)
				{		
					preview.parentNode.removeChild( preview );
					break;
				}
			}

			function removeExistingEditor( parent )
			{
				// var divs = parent.getElementsByTagName('div');
				var divs = parent.querySelectorAll('.markdownEditor, .commentingAs');
				
				for (var i = 0, div = null; div = divs[i]; i++)
				{
					div.parentNode.removeChild( div );
				}
			}

			function addPreviewClearOnCommentSubmit( parent, preview )
			{
				var buttons = parent.getElementsByTagName('button');
				
				for (var i = 0, button = null; button = buttons[i]; i++)
				{
					if ( button.getAttribute('class') == "save" )
					{
						button.addEventListener(
							'click', 
							function()
							{
								preview.innerHTML='';
							}, 
							false
						);
					}
				}	
			}

			function refreshPreview( preview, targetTextArea )
			{
				// modification: hide this thing if it's empty...
				if (targetTextArea.value == '') {
					preview.parentNode.style.display = 'none';
				} else {
					preview.parentNode.style.display = 'block';
				}
				preview.innerHTML = converter.makeHtml( targetTextArea.value );
			}

			function addMarkdownEditorToForm( parent, preview ) 
			{	
				var textAreas = parent.getElementsByTagName('textarea');
				
				if ( !textAreas[0] ) return;
				
				var targetTextArea = textAreas[0];
				
				
				var controlBox = document.createElement( 'div' );
				controlBox.setAttribute('class', 'markdownEditor');
				parent.insertBefore( controlBox, parent.firstChild );

				if ((modules['commentPreview'].options.commentingAs.value) && (!(modules['usernameHider'].isEnabled()))) {
					// show who we're commenting as...
					var commentingAs = document.createElement('div');
					commentingAs.setAttribute('class', 'commentingAs');
					commentingAs.innerHTML = 'Commenting as: ' + RESUtils.loggedInUser();
					parent.insertBefore( commentingAs, parent.firstChild );
				}
				
				var bold = new EditControl(
					'<b>Bold</b>',
					function()
					{
						tagSelection( targetTextArea, '**', '**' );
						refreshPreview( preview, targetTextArea );
					},
					'ctrl-b'
				);
				
				var italics = new EditControl(
					'<i>Italic</i>',
					function()
					{
						tagSelection( targetTextArea, '*', '*' );
						refreshPreview( preview, targetTextArea );
					},
					'ctrl-i'
				);
				
				var strikethrough = new EditControl(
					'<del>strike</del>',
					function()
					{
						tagSelection( targetTextArea, '~~', '~~' );
						refreshPreview( preview, targetTextArea );
					},
					'ctrl-s'
				);
				
				var superscript = new EditControl(
					'<sup>sup</sup>',
					function()
					{
						tagSelection( targetTextArea, '^', '' );
						refreshPreview( preview, targetTextArea );
					}
				);

				var link = new EditControl(
					'Link',
					function()
					{
						linkSelection( targetTextArea );
						refreshPreview( preview, targetTextArea );
					}
				);
				
				var quote = new EditControl(
					'|Quote',
					function()
					{
						prefixSelectionLines( targetTextArea, '>' );
						refreshPreview( preview, targetTextArea );
					}
				);
				
				var code = new EditControl(
					'<span style="font-family: Courier New;">Code</span>',
					function()
					{
						prefixSelectionLines( targetTextArea, '    ' );
						refreshPreview( preview, targetTextArea );
					}
				);
				
				var bullets = new EditControl(
					'&bull;Bullets',
					function()
					{
						prefixSelectionLines( targetTextArea, '* ' );
						refreshPreview( preview, targetTextArea );
					}
				);
				
				var numbers = new EditControl(
					'1.Numbers',
					function()
					{
						prefixSelectionLines( targetTextArea, '1. ' );
						refreshPreview( preview, targetTextArea );
					}
				);
				
				var disapproval = new EditControl(
					'&#3232;\_&#3232;',
					function() {
						prefixSelectionLines( targetTextArea, '&#3232;\\\_&#3232;' );
						refreshPreview( preview, targetTextArea );
					}
				);
				
				var promoteRES = new EditControl(
					'[Promote]',
					function() {
						prefixSelectionLines( targetTextArea, '[Reddit Enhancement Suite](http://redditenhancementsuite.com)' );
						refreshPreview( preview, targetTextArea );
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
				controlBox.appendChild( disapproval.create() );
				controlBox.appendChild( promoteRES.create() );
					
			}

			function EditControl( label, editFunction, shortcutKey )
			{
				this.create = function() 
				{
					var link = document.createElement('a');
					if (shortcutKey) link.title = shortcutKey;
					link.innerHTML = label;
					link.href = 'javascript:;';
					// link.setAttribute('style','Margin-Right: 15px; text-decoration: none;');
					
					link.execute = editFunction;
					
					addEvent( link, 'click', 'execute' );
					
					return link;	
				}
			}

			function tagSelection( targetTextArea, tagOpen, tagClose, textEscapeFunction )
			{	
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
			}

			function linkSelection( targetTextArea )
			{
				var url = prompt( "Enter the URL:", "" );

				if ( url != null )
				{
					tagSelection(
						targetTextArea,
						'[',
						'](' + url.replace( /\(/, '\\(' ).replace( /\)/, '\\)' ) + ')', //escape parens in url
						function( text )
						{
							return text.replace( /\[/, '\\[' ).replace( /\]/, '\\]' ).replace( /\(/, '\\(' ).replace( /\)/, '\\)' ); //escape brackets and parens in text
						}
					);
				}
			}

			function prefixSelectionLines( targetTextArea, prefix )
			{
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
			}

			//Delegated event wire-up utitlity. Using this allows you to use the "this" keyword in a delegated function.
			function addEvent( target, eventName, handlerName )
			{
				target.addEventListener(eventName, function(e){target[handlerName](e);}, false);
			}

			// Bootstrap with the top-level comment always in the page, and editors for your existing comments.
			wireupExistingCommentEditors();
			
			// Add "view source" buttons
			wireupViewSourceButtons(document);
			

			// Watch for any future 'reply' forms, or stuff loaded in via "load more comments"...
			document.body.addEventListener(
				'DOMNodeInserted',
				function( event ) {
					if (event.target.tagName == 'FORM') {
						wireupNewCommentEditors( event.target );
					}
					if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
						wireupNewCommentEditors( event.target );
						wireupViewSourceButtons( event.target );
					}
				},
				false
			);
		}
	},
	viewSource: function(ele) {
		if (ele) {
			var permalink = ele.parentNode.parentNode.firstChild.firstChild;
			if (permalink) {
				// check if we've already viewed the source.. if so just reveal it instead of loading...
				var sourceDiv = ele.parentNode.parentNode.previousSibling.querySelector('.viewSource');
				if (sourceDiv) {
					sourceDiv.style.display = 'block';
				} else {
					var jsonURL = permalink.getAttribute('href');
					var sourceLink = 'comment';
					if (hasClass(permalink, 'comments')) {
						sourceLink = 'selftext';
					}
					jsonURL += '/.json';
					this.viewSourceEle = ele;
					this.viewSourceLink = sourceLink;
					
					GM_xmlhttpRequest({
						method:	"GET",
						url:	jsonURL,
						onload:	function(response) {
							var thisResponse = JSON.parse(response.responseText);
							var userTextForm = document.createElement('div');
							addClass(userTextForm,'usertext-edit');
							addClass(userTextForm,'viewSource');
							if (modules['commentPreview'].viewSourceLink == 'comment') {
								sourceText = thisResponse[1].data.children[0].data.body;
								userTextForm.innerHTML = '<div><textarea rows="1" cols="1" name="text">' + sourceText + '</textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div>';
							} else {
								sourceText = thisResponse[0].data.children[0].data.selftext;
								userTextForm.innerHTML = '<div><textarea rows="1" cols="1" name="text">' + sourceText + '</textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div>';
							}
							var cancelButton = userTextForm.querySelector('.cancel');
							cancelButton.addEventListener('click', modules['commentPreview'].hideSource, false);
							modules['commentPreview'].viewSourceEle.parentNode.parentNode.previousSibling.appendChild(userTextForm);
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
				$.post('/api/search_reddit_names.json', {query:query},
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

		var srLink = '[/r/'+subreddit+'](/r/'+subreddit+') ';
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
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			var userNameEle = document.querySelector('#header-bottom-right > span > a');
			var thisUserName = userNameEle.textContent;
			userNameEle.textContent = this.options.displayText.value;
			var authors = document.querySelectorAll('.author');
			for (var i=0, len=authors.length; i<len;i++) {
				if (authors[i].textContent == thisUserName) {
					authors[i].textContent = this.options.displayText.value;
				}
			}
		}
	}
};

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
			
			
			this.imageList = Array();
			this.imagesRevealed = Array();
			this.flickrImages = Array();
			this.dupeAnchors = 0;
			if (this.options.markVisited.value) {
				this.imageTrackFrame = document.createElement('iframe');
				this.imageTrackFrame.addEventListener('load', function() {
					setTimeout(modules['showImages'].imageTrackPop, 300);
				}, false);
				this.imageTrackFrame.style.display = 'none';
				this.imageTrackFrame.style.width = '0px';
				this.imageTrackFrame.style.height = '0px';
				this.imageTrackStack = Array();
				document.body.appendChild(this.imageTrackFrame);
			}

			document.body.addEventListener('DOMNodeInserted', function(event) {
				if (
					((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) ||
					((event.target.tagName == 'DIV') && (hasClass(event.target, 'comment'))) ||
					((event.target.tagName == 'FORM') && (event.target.getAttribute('class') == 'usertext'))
				)
				{
					var isSelfText = false;
					if (event.target.tagName == 'FORM') {
						isSelfText = true;
					}
					modules['showImages'].findAllImages(event.target, isSelfText);
					if ((modules['showImages'].allImagesVisible) && (!isSelfText)) {
						modules['showImages'].waitForScan = setInterval(function() {
							if (!(modules['showImages'].scanningForImages)) {
								modules['showImages'].showImages(modules['showImages'].gw, true);
								clearInterval(modules['showImages'].waitForScan);
							}
						}, 100);
					}
				}
			}, true);
			
			// create a div for the thumbnail tooltip...
			RESUtils.addCSS('#RESThumbnailToolTip { display: none; position: absolute; border: 2px solid gray; z-index: 9999; }');
			modules['showImages'].toolTip = createElementWithID('div','RESThumbnailToolTip');
			document.body.appendChild(modules['showImages'].toolTip);
			
			
			// this.imguReddit();
			this.createImageButtons();
			this.findAllImages();
			document.addEventListener('dragstart',function(){return false}, false);
		}
	},
	getDragSize: function(e){
		return (p=Math.pow)(p(e.clientX-(rc=e.target.getBoundingClientRect()).left,2)+p(e.clientY-rc.top,2),.5)
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
				if (!(modules['showImages'].scanningForImages)) {
					modules['showImages'].showImages();
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
					modules['showImages'].gw = 'm';
					modules['showImages'].showImages('m');
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
					modules['showImages'].gw = 'f';
					modules['showImages'].showImages('f');
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
			var isFlickr = ((checkhref.indexOf('flickr.com')>=0) && (checkhref.indexOf('/sets/') == -1));
			var isMinus = ((checkhref.indexOf('min.us')>=0) && (checkhref.indexOf('blog.') == -1));
			var isQkme = (checkhref.indexOf('qkme.me')>=0) || (checkhref.indexOf('quickmeme.com')>=0);
			var isGifSound = (checkhref.indexOf('gifsound.com')>=0);
			// if (href && (gonewild == '' || titleMatch) && (!isGifSound) && (!NSFW) && (href.indexOf('wikipedia.org/wiki') < 0) && (!isPhotobucket) && (isImgur || isEhost || isSnaggy || isFlickr || isMinus || isQkme || href.indexOf('imgur.')>=0 || href.indexOf('.jpeg')>=0 || href.indexOf('.jpg')>=0 || href.indexOf('.gif')>=0 || href.indexOf('.png')>=0)) {
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
		this.imgurCalls = new Array();
		this.minusCalls = new Array();
		// this.allElements contains all link elements on the page - now let's filter it for images...
		// this.imgurHashRe = /^http:\/\/([i.]|[edge.]|[www.])*imgur.com\/([\w]+)(\..+)?$/i;
		this.imgurHashRe = /^http:\/\/(?:[i.]|[edge.]|[www.])*imgur.com\/(?:r\/[\w]+\/)?([\w]+)(\..+)?$/i;
		// this.imgurAlbumRe = /^http:\/\/[i.]*imgur.com\/a\/([\w]+)(\..+)?$/i;
		this.minusHashRe = /^http:\/\/min.us\/([\w]+)(?:#[\d+])?$/i;
		this.qkmeHashRe = /^http:\/\/(?:www.quickmeme.com\/meme|qkme.me)\/([\w]+)\/?/i;
		this.ehostHashRe = /^http:\/\/(?:i\.)?(?:\d+\.)?eho.st\/(\w+)\/?/i;
		var groups = Array();
		this.allElementsCount=this.allElements.length;
		this.allElementsi = 0;
		if (RESUtils.pageType() == 'comments') {
			(function(){
				// we're on a comments page which is more intense, so just scan 15 links at a time...
				var chunkLength = Math.min((modules['showImages'].allElementsCount - modules['showImages'].allElementsi), 15);
				for (var i=0;i<chunkLength;i++) {
					modules['showImages'].checkElementForImage(modules['showImages'].allElementsi);
					modules['showImages'].allElementsi++;
				}
				if (modules['showImages'].allElementsi < modules['showImages'].allElementsCount) {
					setTimeout(arguments.callee, 1000);
				} else {
					modules['showImages'].scanningSelfText = false;
					modules['showImages'].scanningForImages = false;
					modules['showImages'].updateImageButtons(modules['showImages'].imageList.length);
				}
			})();		
		} else {
			var chunkLength = modules['showImages'].allElementsCount;
			for (var i=0;i<chunkLength;i++) {
				modules['showImages'].checkElementForImage(modules['showImages'].allElementsi);
				modules['showImages'].allElementsi++;
			}
			modules['showImages'].scanningSelfText = false;
			modules['showImages'].scanningForImages = false;
			modules['showImages'].updateImageButtons(modules['showImages'].imageList.length);
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
		if (((!(hasClass(ele,'imgScanned'))) && (typeof(this.imagesRevealed[href]) == 'undefined') && (href != null)) || this.scanningSelfText) {
			addClass(ele,'imgScanned');
			this.dupeAnchors++;
			var isImgur = (checkhref.indexOf('imgur.com')>=0);
			var isEhost = (checkhref.indexOf('eho.st')>=0);
			var isSnaggy = (checkhref.indexOf('snag.gy')>=0);
			var isPhotobucket = (checkhref.indexOf('photobucket.com')>=0);
			var isFlickr = ((href.indexOf('flickr.com')>=0) && (href.indexOf('/sets/') == -1));
			var isMinus = ((checkhref.indexOf('min.us')>=0) && (checkhref.indexOf('blog.') == -1));
			var isQkme = (checkhref.indexOf('qkme.me')>=0) || (checkhref.indexOf('quickmeme.com')>=0);
			var isGifSound = (checkhref.indexOf('gifsound.com')>=0);
			if (!(ele.getAttribute('scanned') == 'true') && (checkhref.indexOf('wikipedia.org/wiki') < 0) && (!isGifSound) && (!NSFW) && (!isPhotobucket) && (isImgur || isEhost || isSnaggy || isFlickr || isMinus || isQkme || checkhref.indexOf('.jpeg')>=0 || checkhref.indexOf('.jpg')>=0 || checkhref.indexOf('.gif')>=0 || checkhref.indexOf('.png')>=0)) {
				if (isImgur) {
					// if it's not a full (direct) imgur link, get the relevant data and append it... otherwise, go now!
					// first, kill any URL parameters that screw with the parser, like ?full.
					var splithref = href.split('?');
					href = splithref[0];
					var orighref = href;
					/*
					if ((this.options.imageSize.value != null) && (this.options.imageSize.value != '')) { 
						splithref = href.split('.');
						if ((splithref[splithref.length-1] == 'jpg') || (splithref[splithref.length-1] == 'jpeg') || (splithref[splithref.length-1] == 'png') || (splithref[splithref.length-1] == 'gif'))  {
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
						if (typeof(this.imgurCalls[apiURL]) == 'undefined') {
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
										if (typeof(modules['showImages'].imgurCalls[apiURL]) != 'undefined') {
											modules['showImages'].imgurCalls[apiURL].setAttribute('href',json.image.links.original);
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
					var extensions = new Array('.jpg','.png','.gif');
					if (href.indexOf('i.snag') == -1) href = href.replace('snag.gy','i.snag.gy');
					if (extensions.indexOf(href.substr(-4)) == -1) href = href+'.jpg';
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
							if (imgHash.substr(0,1) == 'm') {
								var apiURL = 'http://min.us/api/GetItems/' + imgHash;
								if (typeof(this.minusCalls[apiURL]) == 'undefined') {
									this.minusCalls[apiURL] = ele;
									GM_xmlhttpRequest({ 
										method: 'GET', 
										url: apiURL,
										onload: function(response) {
											// console.log(response.responseText);
											var json = safeJSON.parse(response.responseText, null, true);
											if (typeof(json.ITEMS_GALLERY) == 'undefined') {
												// return; // api failure
											} else {
												var firstImg = json.ITEMS_GALLERY[0];
												var imageString = json.ITEMS_GALLERY.join(' ');
												modules['showImages'].minusCalls[apiURL].setAttribute('minusgallery',imageString);
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
			if (!(RESUtils.currentSubreddit('dashboard')) && !(ele.getAttribute('scanned') == 'true') && (checkhref.indexOf('wikipedia.org/wiki') < 0) && (checkhref.indexOf('imgur.')>=0 || checkhref.indexOf('.jpeg')>=0 || checkhref.indexOf('.jpg')>=0 || checkhref.indexOf('.gif')>=0)) {
				var textFrag = document.createElement('span');
				textFrag.setAttribute('class','RESdupeimg');
				textFrag.innerHTML = ' <a class="noKeyNav" href="#img'+this.imagesRevealed[href]+'" title="click to scroll to original">[RES ignored duplicate image]</a>';
				insertAfter(ele, textFrag);
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
			modules['showImages'].revealImage(e.target, isCollapsed);
		}, true);
		if (hasClass(obj.parentNode,'title')) {
			var nodeToInsertAfter = obj.parentNode;
			addClass(thisExpandLink, 'linkImg');
			/* reddit broke this :(
			if (this.options.hoverPreview.value) {
				thisExpandLink.addEventListener('mouseover', function(e) {
					e.preventDefault();
					modules['showImages'].thumbnailTarget = e.target;
					modules['showImages'].toolTipTimer = setTimeout(modules['showImages'].showThumbnail, 1000);
				}, false);
				thisExpandLink.addEventListener('mouseout', function(e) {
					e.preventDefault();
					clearTimeout(modules['showImages'].toolTipTimer);
					modules['showImages'].hideThumbnail();
				}, false);
			}
			*/
		} else {
			var nodeToInsertAfter = obj;
			addClass(thisExpandLink, 'commentImg');
		}
		insertAfter(nodeToInsertAfter, thisExpandLink);
		if (this.scanningSelfText && this.options.autoExpandSelfText.value) {
			this.revealImage(thisExpandLink, true);
		}
	},
	showThumbnail: function() {
		var gpClass = modules['showImages'].thumbnailTarget.parentNode.parentNode.getAttribute('class');
		console.log(gpClass);
		var idRe = /id-([\w]+)/;
		var match = idRe.exec(gpClass);
		if (match && (typeof(match[1]) != 'undefined')) {
			thisXY=RESUtils.getXYpos(modules['showImages'].thumbnailTarget);
			// console.log(thisXY.x);
			thisXY.x += 30;
			// console.log(thisXY.x);
			modules['showImages'].toolTip.innerHTML = '<img src="http://thumbs.reddit.com/'+match[1]+'.png">';
			// console.log('top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
			modules['showImages'].toolTip.setAttribute('style', 'top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
			RESUtils.fadeElementIn(modules['showImages'].toolTip, 0.3);
		}
	},
	hideThumbnail: function(e) {
		if (modules['showImages'].toolTip.getAttribute('isfading') != 'in') {
			RESUtils.fadeElementOut(modules['showImages'].toolTip, 0.3);
		} else {
			// image is in the middle of fading in... try again in 200ms and fade it out after it's done fading in.
			setTimeout(modules['showImages'].hideThumbnail, 200);
		}
	},
	revealImage: function(showLink, showhide) {
		clearTimeout(modules['showImages'].toolTipTimer);
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
		if ((typeof(imageCheck) != 'undefined') && (imageCheck != null) && (typeof(imageCheck.tagName) != 'undefined') && (hasClass(imageCheck, 'madeVisible'))) {
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
			var href = thisImageLink.getAttribute('href');
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
				if (href == '') href = 'http://i.min.us/ibmYy2.jpg';
				imgA.innerHTML = '<img class="RESImage" style="max-width:'+this.options.maxWidth.value+'px; max-height:'+this.options.maxHeight.value+'px;" src="' + href + ext + '" /><div class="isGallery">[this is the first image in a gallery - click for more]</div>';
				var imgTag = img.querySelector('IMG');
				this.trackImageLoad(imgTag);
				this.makeImageZoomable(imgTag);
			} else if (href.indexOf('www.flickr.com') >= 0) {
				this.flickrImages[href] = img;
				GM_xmlhttpRequest({
					method:	"GET",
					url:	href,
					onload:	function(response) {
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
						var flickrStyle = 'display:block;max-width:'+modules['showImages'].options.maxWidth.value+'px;max-height:'+modules['showImages'].options.maxHeight.value+'px;';
						flickrImg.setAttribute('width','');
						flickrImg.setAttribute('height','');
						flickrImg.setAttribute('style',flickrStyle);
						modules['showImages'].flickrImages[href].querySelector('a').appendChild(flickrImg);
						var imgTag = img.querySelector('IMG');
						imgTag.setAttribute('flickrsrc',href);
						modules['showImages'].trackImageLoad(imgTag);
						modules['showImages'].makeImageZoomable(imgTag);
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
				insertAfter(showLink, img);
			} else {
				showLink.parentNode.appendChild(img);
			}
			// insertAfter(showLink, img);
			// insertAfter(img, clear);
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
				modules['showImages'].imageTrackStack.push(thisURL);
				if (modules['showImages'].imageTrackStack.length == 1) setTimeout(modules['showImages'].imageTrackPop, 300);
			}, false);
		}
	},
	imageTrackPop: function() {
		var thisURL = modules['showImages'].imageTrackStack.pop();
		if (typeof(thisURL) != 'undefined') {
			if (typeof(modules['showImages'].imageTrackFrame.contentWindow) != 'undefined') {
				modules['showImages'].imageTrackFrame.contentWindow.location.replace(thisURL);
			} else if (typeof(chrome) != 'undefined') {
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
				modules['showImages'].imageTrackFrame.location.replace(thisURL);
			}
		}
	},
	makeImageZoomable: function(imgTag) {
		if (this.options.imageZoom.value) {
			// Add listeners for drag to resize functionality...
			imgTag.addEventListener('mousedown', function(e) {
				if (e.button == 0) {
					$(imgTag).data('containerWidth',$(imgTag).closest('.entry').width());
					modules['showImages'].dragTargetData.iw=e.target.width;
					modules['showImages'].dragTargetData.d=modules['showImages'].getDragSize(e);
					modules['showImages'].dragTargetData.dr=false;
					e.preventDefault();
				}
			}, true);
			imgTag.addEventListener('mousemove', function(e) {
				if (modules['showImages'].dragTargetData.d){
					e.target.style.maxWidth=e.target.style.width=((modules['showImages'].getDragSize(e))*modules['showImages'].dragTargetData.iw/modules['showImages'].dragTargetData.d)+"px";
					if (parseInt(e.target.style.maxWidth) > $(e.target).data('containerWidth')) {
						$('div.side').fadeOut();
					} else {
						$('div.side').fadeIn();
					}
					e.target.style.maxHeight='';
					e.target.style.height='auto';
					modules['showImages'].dragTargetData.dr=true;
				}
			}, false);
			imgTag.addEventListener('mouseout', function(e) {
				modules['showImages'].dragTargetData.d=false;
				if (modules['showImages'].dragTargetData.dr) return false;
			}, false);
			imgTag.addEventListener('mouseup', function(e) {
				e.target.style.maxWidth=e.target.style.width=((modules['showImages'].getDragSize(e))*modules['showImages'].dragTargetData.iw/modules['showImages'].dragTargetData.d)+"px";
				if (parseInt(e.target.style.maxWidth) > $(e.target).data('containerWidth')) {
					$('div.side').fadeOut();
				} else {
					$('div.side').fadeIn();
				}
				modules['showImages'].dragTargetData.d=false;
				if (modules['showImages'].dragTargetData.dr) return false;
			}, false);
			imgTag.addEventListener('click', function(e) {
				modules['showImages'].dragTargetData.d=false;
				if (modules['showImages'].dragTargetData.dr) {
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
}; // end showImages

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
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/.*/i
	),
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
		var karmaDiv = document.querySelector("#header-bottom-right > .user b");
		if ((typeof(karmaDiv) != 'undefined') && (karmaDiv != null)) {
			var linkKarma = karmaDiv.innerHTML;
			var commentKarma = userInfo.data.comment_karma;
			if (modules['showKarma'].options.useCommas.value) {
				linkKarma = RESUtils.addCommas(linkKarma);
				commentKarma = RESUtils.addCommas(commentKarma);
			}
			karmaDiv.innerHTML = linkKarma + " " + modules['showKarma'].options.separator.value + " " + commentKarma;
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
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
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
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
	),
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
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\_\?=]*/i
	),
	exclude: Array(
		/https?:\/\/([a-z]+).reddit.com\/saved\//i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			
			// modified from a contribution by Peter Siewert, thanks Peter!
			if (typeof(modules['neverEndingReddit'].dupeHash) == 'undefined') modules['neverEndingReddit'].dupeHash = {};
			var entries = document.body.querySelectorAll('a.comments');
			for(var i = entries.length - 1; i > -1; i--) {
				modules['neverEndingReddit'].dupeHash[entries[i].href] = 1;
			}
			
			RESUtils.addCSS('#NERModal { display: none; z-index: 999; position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: #333333; opacity: 0.6; }');
			RESUtils.addCSS('#NERContent { display: none; position: fixed; top: 40px; z-index: 1000; width: 720px; background-color: #FFFFFF; color: #000000; padding: 10px; font-size: 12px; }');
			RESUtils.addCSS('#NERFail { width: 95%; height: 30px; font-size: 14px; border: 1px solid #999999; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; padding: 5px; text-align: center; bgcolor: #f0f3fc; cursor: pointer; }');
			RESUtils.addCSS('.NERdupe p.title:after { color: #000000; font-size: 10px; content: \' (duplicate from previous page)\'; }');
			RESUtils.addCSS('.NERPageMarker { text-align: center; color: #7f7f7f; font-size: 14px; margin-top: 6px; margin-bottom: 6px; font-weight: normal; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; padding: 3px 0px 3px 0px; }');
			
			this.allLinks = document.body.querySelectorAll('#siteTable div.thing');
			switch (this.options.hideDupes.value) {
				case 'fade':
					RESUtils.addCSS('.NERdupe { opacity: 0.3; }');
					break;
				case 'hide':
					RESUtils.addCSS('.NERdupe { display: none; }');
					break;
			}
			
			// code inspired by River of Reddit, but rewritten from scratch to work across multiple browsers...
			// Original River of Reddit author: reddy kapil
			// Original link to Chrome extension: https://chrome.google.com/extensions/detail/bjiggjllfebckflfdjbimogjieeghcpp
			
			// set the style for our little loader widget
			RESUtils.addCSS('#progressIndicator { width: 95%; height: 30px; font-size: 14px; border: 1px solid #999999; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; padding: 5px; text-align: center; bgcolor: #f0f3fc; cursor: pointer; } ');
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
					// remove NERpage parameter, no sense sending it to reddit.
					this.nextPageURL = this.nextPageURL.replace(/\&NERpage=([\d]+)/,'');
					var nextXY=RESUtils.getXYpos(nextLink);
					this.nextPageScrollY = nextXY.y;
				}
				this.attachLoaderWidget();
				
				if (this.options.returnToPrevPage.value) {
					this.attachModalWidget();
					// Set the current page to page 1...
					this.currPage = 1;
					// If there's a page=# value in location.hash, then update the currPage...
					var currPageRe = /NERpage=([0-9]+)/i;
					var backButtonPageNumber = currPageRe.exec(location.href);
					if ((backButtonPageNumber) && (backButtonPageNumber[1] > 1)) {
						this.currPage = backButtonPageNumber[1];
						this.loadNewPage(true);
					}
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
			RESUtils.addCSS('#NREPause { margin-left: 2px; width: 16px; height: 16px; float: left; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); cursor: pointer; background-position: 0px -192px; }');
			RESUtils.addCSS('#NREPause.paused { width: 16px; height: 16px; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); cursor: pointer; background-position: -16px -192px; }');
			if ((modules['betteReddit'].options.pinHeader.value != 'userbar') && (modules['betteReddit'].options.pinHeader.value != 'header')) {
				this.NREMail = createElementWithID('a','NREMail');
				if (modules['betteReddit'].options.pinHeader.value == 'sub') {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 23px; right: 8px; display: none; }');
				} else {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 10px; right: 10px; display: none; }');
				}
				RESUtils.addCSS('#NREMail { width: 16px; height: 12px; float: left; margin-top: 4px; }');
				RESUtils.addCSS('#NREMail.nohavemail { background-image: url(/static/sprite-main.png?v=816b8dcd1f863d0343bb5e0d9e094215); background-position: 0px -22px; }');
				RESUtils.addCSS('#NREMail.havemail { background-image: url(/static/sprite-main.png?v=816b8dcd1f863d0343bb5e0d9e094215); background-position: 0px -4px; }');
				this.NREFloat.appendChild(this.NREMail);
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
	pageMarkers: new Array(),
	pageURLs: new Array(),
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
	handleScroll: function(e) {
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
		// this needed to be replaced to avoid a chrome bug where hash changes screw up searching and middle-click scrolling..
		//		if ((thisPageNum > 1) || (location.hash != '')) location.hash = 'page='+thisPageNum;
		var urlParams = RESUtils.getUrlParams();
		if (thisPageNum != urlParams.NERpage) {
			if (thisPageNum > 1) {
				urlParams.NERpage = thisPageNum;
				modules['neverEndingReddit'].pastFirstPage = true;
			} else {
				urlParams.NERpage = null;
			}
			if (modules['neverEndingReddit'].pastFirstPage) {
				var qs = '?';
				var count = 0;
				var and = '';
				for (i in urlParams) {
					count++;
					if (urlParams[i] != null) {
						if (count == 2) and = '&';
						qs += and+i+'='+urlParams[i];
					}
				}
				// delete query parameters if there are none to display so we don't just show a ?
				if (qs == '?') {
					qs = location.pathname;
				}
				window.history.replaceState(thisPageNum, "thepage="+thisPageNum, qs);
			}
		}
		if (modules['neverEndingReddit'].fromBackButton != true) {
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
		if ((typeof(modules['neverEndingReddit'].navMail) != 'undefined') && (modules['neverEndingReddit'].navMail != null) && (!(RESUtils.elementInViewport(modules['neverEndingReddit'].navMail)))) {
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
		this.modalContent.innerHTML = 'Never Ending Reddit has detected that you are returning from a page that it loaded. Please give us a moment while we reload that content and return you to where you left off.<br><img src="'+RESConsole.loader+'">';
		document.body.appendChild(this.modalWidget);
		document.body.appendChild(this.modalContent);
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
			if (this.nextPageURL == 'undefined') {
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
						if (modules['uppersAndDowners'].isEnabled()) {
							modules['uppersAndDowners'].applyUppersAndDownersToComments(modules['neverEndingReddit'].nextPageURL);
						}
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
								thisXY=RESUtils.getXYpos(lastTopScrolledEle);
								RESUtils.scrollTo(0, thisXY.y);
								modules['neverEndingReddit'].fromBackButton = false;
							}
						} else {
							modules['neverEndingReddit'].NERFail();
						}
					} else {
						var noresults = tempDiv.querySelector('#noresults');
						var noresultsfound = (noresults) ? true : false;
						modules['neverEndingReddit'].NERFail(noresultsfound);
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
			newHTML.innerHTML = 'Reddit has responded "there doesn\'t seem to be anything here." - this sometimes happens after several pages as votes shuffle posts up and down. You\'ll have to <a href="'+location.href.split('#')[0]+'">start from the beginning.</a>';
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
		/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.\/]*\/?/i,
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
			var savedRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/saved\/?/i);
			if (commentsRegex.test(currURL)) {
				// load already-saved comments into memory...
				this.loadSavedComments();
				this.addSaveLinks();
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
			document.body.addEventListener(
				'DOMNodeInserted',
				function( event ) {
					if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
						modules['saveComments'].addSaveLinks(event.target);
					}
				},
				false
			);
		}
	},
	addSaveLinks: function(ele) {
		if (!ele) var ele = document.body;
		this.allComments = ele.querySelectorAll('div.commentarea > div.sitetable > div.thing div.entry div.noncollapsed');
		this.allCommentsCount = this.allComments.length;
		this.allCommentsi = 0;
		(function(){
			// add 15 save links at a time...
			var chunkLength = Math.min((modules['saveComments'].allCommentsCount - modules['saveComments'].allCommentsi), 15);
			for (var i=0;i<chunkLength;i++) {
				var thisi = modules['saveComments'].allCommentsi;
				var thisComment = modules['saveComments'].allComments[thisi];
				modules['saveComments'].addSaveLinkToComment(thisComment);
				modules['saveComments'].allCommentsi++;
			}
			if (modules['saveComments'].allCommentsi < modules['saveComments'].allCommentsCount) {
				setTimeout(arguments.callee, 1000);
			}
		})();		
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
			if (userLink != null) {
				var saveUser = userLink.text;
				var saveHREF = permaLink.getAttribute('href');
				var splitHref = saveHREF.split('/');
				var saveID = splitHref[splitHref.length-1];
				var saveLink = document.createElement('li');
				if ((typeof(this.storedComments) != 'undefined') && (typeof(this.storedComments[saveID]) != 'undefined')) {
					saveLink.innerHTML = '<a href="/saved#comments">saved</a>';
				} else {
					saveLink.innerHTML = '<a href="javascript:void(0);" class="saveComments">save</a>';
					saveLink.setAttribute('saveID',saveID);
					saveLink.setAttribute('saveLink',saveHREF);
					saveLink.setAttribute('saveUser',saveUser);
					saveLink.addEventListener('click', function(e) {
						e.preventDefault();
						modules['saveComments'].saveComment(this, this.getAttribute('saveID'), this.getAttribute('saveLink'), this.getAttribute('saveUser'));
					}, true);
				}
				var whereToInsert = commentsUL.lastChild;
				if (isTopLevel) whereToInsert = whereToInsert.previousSibling;
				commentsUL.insertBefore(saveLink, whereToInsert);
			}
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
				unsaveObj.innerHTML = '<a href="javascript:void(0);">unsave</a>';
				unsaveObj.setAttribute('unsaveID',id);
				unsaveObj.setAttribute('unsaveLink',href);
				unsaveObj.setAttribute('class','saveComments');
				unsaveObj.addEventListener('click', function(e) {
					// e.preventDefault();
					var id = this.getAttribute('unsaveID');
					modules['saveComments'].unsaveComment(id, this);
				}, false);
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
			var menuItems = mainmenuUL.querySelectorAll('li');
			for (var i=0, len=menuItems.length;i<len;i++) {
				var savedLink = menuItems[i].querySelector('a');
				if ((hasClass(menuItems[i], 'selected')) && (savedLink.href == 'http://www.reddit.com/saved/')) {
					menuItems[i].addEventListener('click', function(e) {
						e.preventDefault();
						modules['saveComments'].showSavedTab('links');
					}, true);
				}
				if (savedLink.href == 'http://www.reddit.com/saved/') {
					this.savedLinksTab = menuItems[i];
					savedLink.innerHTML = 'saved links';
				}
			}
			this.savedCommentsTab = document.createElement('li');
			this.savedCommentsTab.innerHTML = '<a href="javascript:void(0);">saved comments</a>';
			var savedRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/saved\/?/i);
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
				thisComment.innerHTML = '<div class="savedCommentHeader">Comment by user: ' + this.storedComments[i].username + ' saved on ' + this.storedComments[i].timeSaved + '</div><div class="savedCommentBody">' + this.storedComments[i].comment + '</div>';
				thisComment.innerHTML += '<div class="savedCommentFooter"><ul class="flat-list buttons"><li><a class="unsaveComment" href="javascript:void(0);">unsave</a></li><li><a href="' + this.storedComments[i].href + '">view original</a></li></ul></div>';
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
			this.savedCommentsContent.innerHTML = '<li>You have not yet saved any comments.</li>';
		}
		insertAfter(this.savedLinksContent, this.savedCommentsContent);
	},
	unsaveComment: function(id, unsaveLink) {
		/*
		var newStoredComments = Array();
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
			description: 'Color for highlighted text.',
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
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
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
			if (this.options.highlightOP.value) {
				var name = 'submitter';
				var color = this.options.OPColor.value;
				var hoverColor = this.options.OPColorHover.value;
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
		showExpandos: {
			type: 'boolean',
			value: true,
			description: 'Bring back video and text expando buttons for users with compressed link display'
		},
		colorBlindFriendly: {
			type: 'boolean',
			value: false,
			description: 'Use colorblind friendly styles when possible'
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
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			
			// wow, Reddit doesn't define a visited class for links in comments.. we need to do that.
			RESUtils.addCSS(".comment a:visited { color:#551a8b }");

			// get rid of antequated option we've removed (err, renamed) due to performance issues.
			if (typeof(this.options.commentBoxHover) != 'undefined') {
				delete this.options.commentBoxHover;
				RESStorage.setItem('RESoptions.styleTweaks', JSON.stringify(modules['styleTweaks'].options));
			}
			if (this.options.navTop.value) {
				this.navTop();
			}
			var commentsRegex = new RegExp(/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i);
			if ((this.options.commentBoxes.value) && (commentsRegex.test(location.href))) {
				this.commentBoxes();
			}
			if (this.options.lightSwitch.value) {
				this.lightSwitch();
			}
			this.isDark = false;
			if (this.options.lightOrDark.value == 'dark') {
				this.isDark = true;
				this.redditDark();
			}
			if (this.options.colorBlindFriendly.value) {
				var orangered = document.body.querySelector('#mail');
				if ((orangered) && (hasClass(orangered, 'havemail'))) {
					orangered.setAttribute('style','background-image: url(http://thumbs.reddit.com/t5_2s10b_5.png); background-position: 0px 0px;');
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
						thisExpandoButton.setAttribute('class','expando-button collapsed selftext');
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
			removeClass(e.target,'collapsed');
			addClass(e.target,'expanded');
			var twitterLink = e.target.previousSibling.firstChild.getAttribute('href');
			twitterLink = twitterLink.replace('/#!','');
			var match = twitterLink.match(/twitter.com\/[^\/]+\/(?:status|statuses)\/([\d]+)/i);
			if (match != null) {
				var jsonURL = 'http://api.twitter.com/1/statuses/show/'+match[1]+'.json';
				if (typeof(chrome) != 'undefined') {
					// we've got chrome, so we need to hit up the background page to do cross domain XHR
					thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					}
					chrome.extension.sendRequest(thisJSON, function(response) {
						// send message to background.html 
						var tweet = response;
						thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
						thisExpando.style.display = 'block';
					});
				} else if (typeof(safari) != 'undefined') {
					// we've got safari, so we need to hit up the background page to do cross domain XHR
					modules['styleTweaks'].tweetExpando = thisExpando;
					thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					}
					safari.self.tab.dispatchMessage("loadTweet", thisJSON);
				} else if (typeof(opera) != 'undefined') {
					// we've got opera, so we need to hit up the background page to do cross domain XHR
					modules['styleTweaks'].tweetExpando = thisExpando;
					thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					}
					opera.extension.postMessage(JSON.stringify(thisJSON));
				} else if (typeof(self.on) == 'function') {
					// we've got a jetpack extension, hit up the background page...
					modules['styleTweaks'].tweetExpando = thisExpando;
					thisJSON = {
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
							thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
							thisExpando.style.display = 'block';
						}
					});
				}
			}
		} else {
			addClass(e.target,'collapsed');
			removeClass(e.target,'expanded');
			thisExpando.style.display = 'none';
		}
		
	},
	navTop: function() {
		RESUtils.addCSS('#header-bottom-right { top: 19px; border-radius: 0px 0px 0px 3px; -moz-border-radius: 0px 0px 0px 3px; -webkit-border-radius: 0px 0px 0px 3px; bottom: auto;  }');
	},
	userbarHider: function() {
		RESUtils.addCSS("#userbarToggle { position: absolute; top: 0px; left: -5px; width: 16px; padding-right: 3px; height: 21px; font-size: 15px; border-radius: 4px 0px 0px 4px; color: #a1bcd6; display: inline-block; background-color: #dfecf9; border-right: 1px solid #cee3f8; cursor: pointer; text-align: right; line-height: 20px; }");
		RESUtils.addCSS("#header-bottom-right .user { margin-left: 16px; }");
		// RESUtils.addCSS(".userbarHide { background-position: 0px -137px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { left: -12px; }");
		var userbar = document.getElementById('header-bottom-right');
		if (userbar) {
			this.userbarToggle = createElementWithID('div','userbarToggle');
			this.userbarToggle.innerHTML = '&raquo;';
			this.userbarToggle.setAttribute('title','Toggle Userbar');
			addClass(this.userbarToggle, 'userbarHide');
			this.userbarToggle.addEventListener('click', function(e) {
				modules['styleTweaks'].toggleUserBar();
			}, false);
			userbar.insertBefore(this.userbarToggle, userbar.firstChild);
			if (RESStorage.getItem('RESmodules.styleTweaks.userbarState') == 'hidden') {
				this.toggleUserBar();
			}
		}
	},
	toggleUserBar: function() {
		var nextEle = this.userbarToggle.nextSibling;
		if (hasClass(this.userbarToggle,'userbarHide')) {
			removeClass(this.userbarToggle,'userbarHide');
			addClass(this.userbarToggle,'userbarShow');
			this.userbarToggle.innerHTML = '&laquo;';
			RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'hidden');
			modules['accountSwitcher'].closeAccountMenu();
			while ((typeof(nextEle) != 'undefined') && (nextEle != null)) {
				nextEle.style.display = 'none';
				nextEle = nextEle.nextSibling;
			}
		} else {
			removeClass(this.userbarToggle,'userbarShow');
			addClass(this.userbarToggle,'userbarHide');
			this.userbarToggle.innerHTML = '&raquo;';
			RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'visible');
			while ((typeof(nextEle) != 'undefined') && (nextEle != null)) {
			if(nextEle.className.match(/mail/)){
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
		// RESUtils.addCSS("#lightSwitch { width: 24px; height: 11px; display: inline-block; background-image: url('http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png'); cursor: pointer; }");
		RESUtils.addCSS(".lightOn { background-position: 0px -96px; } ");
		RESUtils.addCSS(".lightOff { background-position: 0px -108px; } ");
		RESUtils.addCSS('#lightSwitchToggle { float: right; margin-right: 10px; margin-top: 10px; line-height: 10px; }');
		var thisFrag = document.createDocumentFragment();
		/*
		var separator = document.createElement('span');
		addClass(separator,'separator');
		separator.innerHTML = '|';
		*/
		this.lightSwitch = document.createElement('li');
		this.lightSwitch.setAttribute('title',"Toggle night and day");
		this.lightSwitch.addEventListener('click',function(e) {
			e.preventDefault();
			if (modules['styleTweaks'].isDark == true) {
				RESUtils.setOption('styleTweaks','lightOrDark','light');
				removeClass(modules['styleTweaks'].lightSwitchToggle, 'enabled');
				modules['styleTweaks'].redditDark(true);
			} else {
				RESUtils.setOption('styleTweaks','lightOrDark','dark');
				addClass(modules['styleTweaks'].lightSwitchToggle, 'enabled');
				modules['styleTweaks'].redditDark();
			}
		}, true);
		// this.lightSwitch.setAttribute('id','lightSwitch');
		this.lightSwitch.innerHTML = 'night mode';
		this.lightSwitchToggle = createElementWithID('div','lightSwitchToggle','toggleButton');
		this.lightSwitchToggle.innerHTML = '<span class="toggleOn">on</span><span class="toggleOff">off</span>';
		this.lightSwitch.appendChild(this.lightSwitchToggle);
		(this.options.lightOrDark.value == 'dark') ? addClass(this.lightSwitchToggle, 'enabled') : removeClass(this.lightSwitchToggle, 'enabled');
		// thisFrag.appendChild(separator);
		thisFrag.appendChild(this.lightSwitch);
		// if (RESConsole.RESPrefsLink) insertAfter(RESConsole.RESPrefsLink, thisFrag);
		$('#RESDropdownOptions').append(this.lightSwitch);
	},
	subredditStyles: function() {
		this.ignoredSubReddits = Array();
		var getIgnored = RESStorage.getItem('RESmodules.styleTweaks.ignoredSubredditStyles');
		if (getIgnored) {
			this.ignoredSubReddits = safeJSON.parse(getIgnored, 'RESmodules.styleTweaks.ignoredSubredditStyles');
		}
		this.head = document.getElementsByTagName("head")[0];
		var subredditTitle = document.querySelector('.titlebox h1');
		var styleToggle = document.createElement('div');
		styleToggle.setAttribute('style','display: block !important;');
		var thisLabel = document.createElement('label');
		addClass(styleToggle,'styleToggle');
		thisLabel.setAttribute('for','subRedditStyleCheckbox');
		thisLabel.innerHTML = 'Use subreddit style ';
		styleToggle.appendChild(thisLabel);
		this.styleToggleCheckbox = document.createElement('input');
		this.styleToggleCheckbox.setAttribute('type','checkbox');
		this.styleToggleCheckbox.setAttribute('name','subRedditStyleCheckbox');
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
	},
	toggleSubredditStyle: function(toggle) {
		if (toggle) {
			var idx = this.ignoredSubReddits.indexOf(this.curSubReddit);
			if (idx != -1) this.ignoredSubReddits.splice(idx, 1); // Remove it if found...
			var subredditStyleSheet = document.createElement('link');
			subredditStyleSheet.setAttribute('title','applied_subreddit_stylesheet');
			subredditStyleSheet.setAttribute('rel','stylesheet');
			subredditStyleSheet.setAttribute('href','http://www.reddit.com/r/'+this.curSubReddit+'/stylesheet.css');
			this.head.appendChild(subredditStyleSheet);
		} else {
			var idx = this.ignoredSubReddits.indexOf(this.curSubReddit); // Find the index
			if (idx==-1) this.ignoredSubReddits[this.ignoredSubReddits.length] = this.curSubReddit;
			var subredditStyleSheet = this.head.querySelector('link[title=applied_subreddit_stylesheet]');
			if (!subredditStyleSheet) subredditStyleSheet = this.head.querySelector('style[title=applied_subreddit_stylesheet]');
			if (subredditStyleSheet) {
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
			addClass(document.body,'res-nightmode');
			var css = "div[class=\"organic-listing\"] ul[class=\"tabmenu \"], div[id=\"header-bottom-left\"]] {background-color: #666 !important; } ::-moz-selection {	background:orangered; }";
			css += "html {background-color:#222 !important;}";
			css += ".res-nightmode {background-color:#222 !important;}";
			css += ".res-nightmode body > .content {background-color:#222 !important;}";
			css += ".res-nightmode .flair {background-color:#bbb!important;color:black!important;}";
			css += ".res-nightmode .RESUserTagImage, .res-nightmode button.arrow.prev, .res-nightmode button.arrow.next {opacity:0.5;}";
			css += ".res-nightmode #RESConsole {background-color:#ddd;}";
			css += ".res-nightmode #RESConsoleTopBar #RESLogo, .res-nightmode #progressIndicator {opacity:0.4;}";
			css += ".res-nightmode .tabmenu li a, .res-nightmode .login-form, .res-nightmode .login-form input[name*='passwd'], .res-nightmode .login-form-side .submit {background-color:#bbb;}";
			css += ".res-nightmode .login-form-side input {width:auto!important;}";
			css += ".res-nightmode form.login-form.login-form-side {background-color: #888;color: #eee;}";
			css += ".res-nightmode #RESConsoleTopBar, .res-nightmode .moduleHeader, .res-nightmode .allOptionsContainer, .res-nightmode .optionContainer {background-color: #ccc;color:black !important;}"; 
			css += ".res-nightmode #siteTable sitetable{background-color:#222 !important;}";
			css += ".res-nightmode #commentNavButtons * {color:white !important;}";
			css += ".res-nightmode .usertable .btn {border-color:#aa9 !important;color:#aa9 !important;}";
			css += ".res-nightmode .usertable tr .user b {color:#aa9 !important;}";
			css += ".res-nightmode .thinig.spam {background-color:salmon !important;}";
			css += ".res-nightmode .wikipage h1 {color:#ddd !important;}";
			css += ".res-nightmode .titlebox .usertext-body .md h3 {color:black !important;}";
			css += ".res-nightmode .new-comment .usertext-body .md {border:0.1em #aaa dashed;}";
			css += ".res-nightmode .sitetable .moderator {background-color:#282 !omportant;color:white !important;}";
			css += ".res-nightmode .sitetable .admin {background-color:#F01 !omportant;color:white !important;}";
			css += ".res-nightmode .message ul {color:#abcabc !important;}";
			css += ".res-nightmode .side .spacer > #search input {background-color:#444 !important;}";
			css += ".res-nightmode input[type=\"text\"] {background-color:#aaa !important;}";
			css += ".res-nightmode .share-button .option {color: #8AD !important;}";
			css += "body.res-nightmode > .content > .spacer > .sitetable:before, body > .content > .sharelink ~ .sitetable:before, .res-nightmode .side .age, .res-nightmode .trophy-info * {color: #ddd !important;}";
			css += ".res-nightmode .livePreview blockquote {border-left: 2px solid white !important};";
			css += ".res-nightmode #RESDashboardComponent, .res-nightmode RESDashboardComponentHeader {background-color: #ddd !important;}";
			css += ".res-nightmode #RESDashboardAddComponent, .res-nightmode .RESDashboardComponentHeader {background-color: #bbb !important;}";
			css += ".res-nightmode .addNewWidget, .res-nightmode .widgetPath, .res-nightmode #authorInfoToolTip a.option {color: white !important;}";
			css += ".res-nightmode .entry .score {color:#dde !important;}";
			css += ".res-nightmode .entry p.tagline:first-of-type, .res-nightmode .entry time {color:#dd8;}"
			css += ".res-nightmode  code {color:#6c0 !important;}"
			css += ".res-nightmode .entry .domain a {color:cyan !important;}"
			css += ".res-nightmode .traffic-table tr.odd {color: #222 !important;}"
			css += ".res-nightmode .side, .res-nightmode .flairselector, .res-nightmode .linefield {background-color: #222;}"
			css += ".res-nightmode .big-mod-buttons .pretty-button {color:black !important;}"
			css += ".res-nightmode .voteWeight { background-color: #222 !important; color: white !important;}"
			css += ".res-nightmode form.flairtoggle, .res-nightmode .trophy-area .content, .res-nightmode .side .spacer h1, .res-nightmode .NERPageMarker, .res-nightmode .side .spacer {background-color:#222 !important;color:#ddd !important;}";
			css += ".res-nightmode .sitetable .thing {border-color:transparent !important;}"
			css += ".res-nightmode .message.message-reply.recipient > .entry .head, .message.message-parent.recipient > .entry .head {color:inherit !important;}"
			css += ".res-nightmode #header {background-color:#666660 !important;}";
			css += "body { background-color: #222 !important; } .infobar { background-color:#222 !important; color:black !important; }";
			css += ".side { background:none !important; } h2, .tagline a, .content a, .footer a, .wired a, .side a, .subredditbox li a { color:#8AD !important; }";
			css += ".rank .star { color:orangered !important; } .content { color:#CCC !important; } .thing .title.loggedin, .link .title { color:#DFDFDF !important; }";
			// css += ".link .midcol, .linkcompressed .midcol, .comment .midcol { background:none !important; margin-right:6px !important; margin-top:4px !important; margin-left: 0px !important; }";
			// css += ".link .midcol { width:24px !important; } .link .midcol .arrow { margin-left:7px !important; margin-right:7px !important; }";
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
			css += ".side h3:after { content:\" (#reddit on freenode)\" !important; font-size:85% !important; font-weight:normal !important; }";
			css += "#subscribe a { color:#8AD !important; } .dropdown.lightdrop .drop-choices { background-color:#333 !important; }";
			css += ".dropdown.lightdrop a.choice:hover { background-color:#111 !important; } .midcol {margin-right:7px !important;} .side { background:none !important; color:#fff; margin-left:10px !important; }";
			css += ".dropdown.lightdrop a.choice:hover { background-color:#111 !important; } .side { background:none !important; color:#fff !important; margin-left:10px !important; }";
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
			css += "a.author.moderator, a.moderator {color:#3F4 !important; } a.author.friend, a.friend {color:rgb(255, 139, 36) !important; } a.submitter {color: #36F !important; }";
			css += "a.author.admin, a.admin{color: #611 !important; } a.author.submitter { }   table[class=\"markhelp md\"] tr td { background-color: #555 !important; }";
			css += "div.infobar { color: #ccc !important; }  table[class=\"markhelp md\"] tr[style=\"background-color: rgb(255, 255, 153); text-align: center;\"] td { background-color: #36c !important; }";
			css += "form[class=\"usertext border\"] div.usertext-body { background-color: transparent !important;  border-width: 2px !important; border-style: solid !important; border-color: #999 !important; }";
			// css += "div[class=\"midcol likes\"], div[class=\"midcol dislikes\"], div[class=\"midcol unvoted\"] {padding: 0px 7px 0px 0px !important;}";
			css += "form[class=\"usertext border\"] div.usertext-body div.md { background-color: transparent !important; } form#form-t1_c0b71p54yc div {color: black !important;}";
			css += "a[rel=\"tag\"], a.dsq-help {color: #8AD !important; }  div[class=\"post-body entry-content\"], div.dsq-auth-header { color: #ccc !important; }";
			css += "div#siteTable div[onclick=\"click_thing(this)\"] {background-color: #222 !important;} .md p {color: #ddd !important; } .mail .havemail img, .mail .nohavemail img {   visibility: hidden; }";
			css += ".havemail {   background: url('http://i.imgur.com/2Anoz.gif') bottom left no-repeat; }  .mail .nohavemail {   background: url('http://imgur.com/6WV6Il.gif') bottom left no-repeat; }";
			css += "#header-bottom-right { background-color: #BBBBBB !important; }";
			css += '.expando-button.image {background: none !important; background-image: url(http://thumbs.reddit.com/t5_2s10b_2.png) !important;}';
			css += '.expando-button.image.collapsed {background-position: 0px 0px !important;}';
			css += '.expando-button.image.collapsed:hover {background-position: 0px -24px !important;}';
			css += '.expando-button.image.expanded, .eb-se { margin-bottom:5px; background-position: 0px -48px !important;}';
			css += '.expando-button.image.expanded:hover, .eb-seh {background-position: 0px -72px !important;}';
			css += '.expando-button.selftext {background: none !important; background-image: url(http://thumbs.reddit.com/t5_2s10b_2.png) !important;}';
			css += '.expando-button.selftext.collapsed {background-position: 0px -96px !important;}';
			css += '.expando-button.selftext.collapsed:hover {background-position: 0px -120px !important;}';
			css += '.expando-button.selftext.expanded, .eb-se { margin-bottom:5px; background-position: 0px -144px !important;}';
			css += '.expando-button.selftext.expanded:hover, .eb-seh {background-position: 0px -168px !important;}';
			css += '.expando-button.video {background: none !important; background-image: url(http://thumbs.reddit.com/t5_2s10b_2.png) !important;}';
			css += '.expando-button.video.collapsed {background-position: 0px -192px !important;}';
			css += '.expando-button.video.collapsed:hover {background-position: 0px -216px !important;}';
			css += '.expando-button.video.expanded, .eb-se { margin-bottom:5px; background-position: 0px -240px !important;}';
			css += '.expando-button.video.expanded:hover, .eb-seh {background-position: 0px -264px !important;}';
			css += '.expando-button {  background-color:transparent!important; }';
			css += '.RESdupeimg { color: #eeeeee; font-size: 10px;  }';
			css += '.keyHighlight, .keyHighlight div.md { background-color: #666666 !important; } .keyHighlight .title.loggedin:visited, .keyHighlight .title:visited { color: #dfdfdf !important; } .nub {background: none !important;}';
			css += '.side .titlebox { padding-left:5px!important;}';
			css += '.user b { color:#444!important; }';
			css += '.drop-choices { background-color:#C2D2E2!important; }';
			css += '.drop-choices a { color:black!important; }';
			css += '.subreddit .usertext .md { background-color:#222!important; color:#CCC!important; }';
			css += '.toggle .option { color:#FFF!important; }';
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
			css += '.organic-listing .link { background-color: #333333 !important; } .sidecontentbox { background-color: #111111; } .side { background: none !important; }';
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
			// css += 'body, .sidecontentbox .content, .linkinfo, .titlebox  { background-image: none !important }';
			// css += '.titlebox .md {background-color: transparent !important}';
			this.darkStyle = createElementWithID('style', 'darkStyle');
			this.darkStyle.innerHTML = css;
			document.body.appendChild(this.darkStyle);
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
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			// do stuff now!
			// this is where your code goes...
			this.userLink = document.querySelector('#header-bottom-right > span.user > a');
			if (this.userLink) {
				// this.loggedInUser = userLink.innerHTML;
				this.loggedInUser = RESUtils.loggedInUser();
				var downArrowIMG = 'data:image/gif;base64,R0lGODlhBwAEALMAAAcHBwgICAoKChERETs7Ozo6OkJCQg0NDRoaGhAQEAwMDDIyMv///wAAAAAAAAAAACH5BAEAAAwALAAAAAAHAAQAAAQQ0BSykADsDAUwY4kQfOT4RQA7';
				var downArrow = document.createElement('img');
				downArrow.setAttribute('src', downArrowIMG);
				downArrow.style.cursor = 'pointer';
				downArrow.style.marginLeft = '3px';
				downArrow.addEventListener('click',function(e) {
					e.preventDefault();
					modules['accountSwitcher'].toggleAccountMenu();
				}, true);
				insertAfter(this.userLink, downArrow);

				this.accountMenu = createElementWithID('UL','accountSwitcherMenu');
				this.accountMenu.style.display = 'none';
				RESUtils.addCSS('#accountSwitcherMenu { position: absolute; z-index: 999; display: none; padding: 3px; background-color: #ffffff; }');
				RESUtils.addCSS('.accountName { color: #000; padding: 2px; border-bottom: 1px solid #AAAAAA; border-left: 1px solid #AAAAAA; border-right: 1px solid #AAAAAA; }');
				RESUtils.addCSS('.accountName:first-child { padding: 2px; border-top: 1px solid #AAAAAA; }');
				RESUtils.addCSS('.accountName:hover { background-color: #F3FAFF; }');
				// GM_addStyle(css);
				var accounts = this.options.accounts.value;
				if (accounts != null) {
					var accountCount = 0;
					for (var i=0, len=accounts.length; i<len; i++) {
						thisPair = accounts[i];
						if (thisPair[0] != this.loggedInUser) {
							accountCount++;
							var thisLI = document.createElement('LI');
							addClass(thisLI, 'accountName');
							thisLI.innerHTML = thisPair[0];
							thisLI.style.cursor = 'pointer';
							thisLI.addEventListener('click', function(e) {
								e.preventDefault();
								modules['accountSwitcher'].toggleAccountMenu();
								modules['accountSwitcher'].switchTo(e.target.innerHTML);
							}, true);
							this.accountMenu.appendChild(thisLI);
						}
					}
					var thisLI = document.createElement('LI');
					addClass(thisLI, 'accountName');
					thisLI.innerHTML = '+ add account';
					thisLI.style.cursor = 'pointer';
					thisLI.addEventListener('click', function(e) {
						e.preventDefault();
						modules['accountSwitcher'].toggleAccountMenu();
						modules['accountSwitcher'].manageAccounts();
					}, true);
					this.accountMenu.appendChild(thisLI);
				}
				document.body.appendChild(this.accountMenu);
			}
		}
	},
	toggleAccountMenu: function() {
		if (this.accountMenu.style.display == 'none') {
			thisXY=RESUtils.getXYpos(this.userLink);
			this.accountMenu.style.top = (thisXY.y + 12) + 'px';
			this.accountMenu.style.left = (thisXY.x - 10) + 'px';
			this.accountMenu.style.display = 'block';
		} else {
			this.accountMenu.style.display = 'none';
		}
	},
	closeAccountMenu: function() {
		// this function basically just exists for other modules to call.
		if (this.accountMenu) this.accountMenu.style.display = 'none';
	},
	switchTo: function(username) {
		var accounts = this.options.accounts.value;
		var password = '';
		var rem = '';
		if (this.options.keepLoggedIn.value) {
			rem = '&rem=on';
		}
		for (var i=0, len=accounts.length; i<len; i++) {
			thisPair = accounts[i];
			if (thisPair[0] == username) {
				password = thisPair[1];
			}
		}
		// console.log('request with user: ' +username+ ' -- passwd: ' + password);
		var loginUrl = 'https://ssl.reddit.com/api/login';
		if (typeof(opera) != 'undefined') loginUrl = 'http://'+location.hostname+'/api/login';
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
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			// do stuff now!
			// this is where your code goes...
			this.menuItem = createElementWithID('li','RESTipsMenuItem');
			this.menuItem.innerHTML = 'RES Tips and Tricks';
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
				//var thisTip = 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, bug reports, etc - head over to <a href="http://reddit.com/r/Enhancement">/r/Enhancement</a>.<br>Do you keep seeing this message? <a target=\"_blank\" href=\"http://reddit.honestbleeps.com/faq\">see the FAQ</a> about BetterPrivacy and similar addons.';
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
		if (idx<0) guiders.hideAll();
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
			message: 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, bug reports, or just help getting a question answered, be sure to subscribe to <a href="http://reddit.com/r/Enhancement">/r/Enhancement</a>.'
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
		{ message: "Don't forget to subscribe to <a href=\"http://reddit.com/r/Enhancement\">/r/Enhancement</a> to keep up to date on the latest versions of RES, report bugs, or suggest features!" },
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
		{ message: "Check out the RES Dashboard to keep up on smaller subreddits with easy to configure widgets." },
		{ message: "Sick of seeing these tips?  They only show up once every 24 hours, but you can disable that in the RES Tips and Tricks preferences." },
		{ message: "Did you know that there is now a 'keep me logged in' option in the Account Switcher? Turn it on if you want to stay logged in to Reddit when using the switcher!" },
		{ message: "See that little [vw] next to users you've voted on?  That's their vote weight - it moves up and down as you vote the same user up / down." }
	),
	tour: [
		// array of guiders will go here... and we will add a "tour" button somewhere to start the tour...
	],
	initTips: function() {
		for (var i=0, len=this.tips.length; i<len; i++) {
			var thisID = "tip"+i;
			var nextidx = ((parseInt(i+1)) >= len) ? 0 : (parseInt(i+1));
			var nextID = "tip"+nextidx;
			guiders.createGuider({
				  attachTo: this.tips[i].attachTo,
				  buttons: [{
								name: "Prev",
								onclick: modules['RESTips'].prevTip
							},
							{
								name: "Next"
							}],
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
				if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
					modules['filteReddit'].scanEntries(event.target);
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
				if (applyList.indexOf(reddit) == -1) {
					return false;
				}
				break;
		}
		// if fullmatch is defined, don't do a substring match... this is used for subreddit matching on /r/all for example
		if ((fullmatch) && (obj[i] != null) && (stringToSearch.toLowerCase() == searchString.toLowerCase())) return true;
		if ((!fullmatch) && (obj[i] != null) && (stringToSearch.indexOf(searchString.toString().toLowerCase()) != -1)) {
		  return true;
		}
	  }
	  return false;
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
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			// go!
			var counts = RESStorage.getItem('RESmodules.newCommentCount.counts');
			if (counts == null) {
				counts = '{}';
			}
			this.commentCounts = safeJSON.parse(counts, 'RESmodules.newCommentCount.counts');
			if (RESUtils.pageType() == 'comments') {
				this.updateCommentCount();
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
						modules['newCommentCount'].updateCommentCount();
					}
				}, true);
				this.addSubscribeLink();
				// this just doesn't really work that well since often times new comments are under the "load more comments" threshhold
				// or if you are visiting the thread often, Reddit Gold doesn't even mark the comments new...
				/* 
				if (typeof(this.commentCounts[this.currentCommentID].subscriptionDate) != 'undefined') {
					// we are subscribed to this thread already, so scroll to first new post if possible...
					var firstNew = document.querySelector('.new-comment');
					if (firstNew) {
						thisXY=RESUtils.getXYpos(firstNew);
						RESUtils.scrollTo(0,firstNew);
					}
				}
				*/
			} else {
				this.processCommentCounts();
			}
			RESUtils.addCSS('.newComments { display: inline; color: orangered; }');
			RESUtils.addCSS('#REScommentSubToggle { display: inline-block; margin-left: 15px; padding: 1px 0px 1px 0px; text-align: center; width: 78px; font-weight: bold; cursor: pointer; color: #336699; border: 1px solid #b6b6b6; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('#REScommentSubToggle.unsubscribe { color: orangered; }');
			RESUtils.addCSS('#REScommentSubToggle:hover { background-color: #f0f3fc; }');
			this.checkSubscriptions();
		}
	},
	processCommentCounts: function() {
		var lastClean = RESStorage.getItem('RESmodules.newCommentCount.lastClean');
		var now = new Date();
		if (lastClean == null) {
			lastClean = now.getTime();
			RESStorage.setItem('RESmodules.newCommentCount.lastClean', now.getTime());
		}
		// Clean cache once a day
		if ((now.getTime() - lastClean) > 86400000) {
			this.cleanCache();
		}
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var commentsLinks = document.querySelectorAll('#siteTable div.thing.link a.comments');
		for (var i=0, len=commentsLinks.length; i<len;i++) {
			var href = commentsLinks[i].getAttribute('href');
			var thisCount = commentsLinks[i].innerHTML;
			var split = thisCount.split(' ');
			thisCount = split[0];
			var matches = IDre.exec(href);
			if (matches) {
				var thisID = matches[1];
				if ((typeof(this.commentCounts[thisID]) != 'undefined') && (this.commentCounts[thisID] != null)) {
					var diff = thisCount - this.commentCounts[thisID].count;
					if (diff > 0) {
						commentsLinks[i].innerHTML += ' <span class="newComments">('+diff+' new)</span>';
					}
				}
			}
		}
	},
	updateCommentCount: function() {
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var matches = IDre.exec(location.href);
		if (matches) {
			if (!this.currentCommentCount) {
				this.currentCommentID = matches[1];
				var thisCount = document.querySelector('#siteTable a.comments');
				if (thisCount) {
					thisCountText = thisCount.innerHTML
					var split = thisCountText.split(' ');
					this.currentCommentCount = split[0];
					if ((typeof(this.commentCounts[this.currentCommentID]) != 'undefined') && (this.commentCounts[this.currentCommentID] != null)) {
						var prevCommentCount = this.commentCounts[this.currentCommentID].count;
						var diff = this.currentCommentCount - prevCommentCount;
						if (diff>0) thisCount.innerHTML = this.currentCommentCount + ' comments ('+diff+' new)';
					}
					if (isNaN(this.currentCommentCount)) this.currentCommentCount = 0;
				}
			} else {
				this.currentCommentCount++;
			}
		}
		var now = new Date();
		if (typeof(this.commentCounts) == 'undefined') {
			this.commentCounts = {};
		}
		if (typeof(this.commentCounts[this.currentCommentID]) == 'undefined') {
			this.commentCounts[this.currentCommentID] = {};
		}
		this.commentCounts[this.currentCommentID].count = this.currentCommentCount;
		this.commentCounts[this.currentCommentID].url = location.href;
		this.commentCounts[this.currentCommentID].title = document.title;
		this.commentCounts[this.currentCommentID].updateTime = now.getTime();
		if (this.currentCommentCount) {
			// dumb, but because of Greasemonkey security restrictions we need a window.setTimeout here...
			window.setTimeout( function() {
				RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
			}, 100);
		}
	},
	cleanCache: function() {
		var now = new Date();
		for(i in this.commentCounts) {
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
			this.commentSubToggle = createElementWithID('span','REScommentSubToggle');
			this.commentSubToggle.addEventListener('click', modules['newCommentCount'].toggleSubscription, false);
			commentCount.appendChild(this.commentSubToggle);
			if (typeof(this.commentCounts[this.currentCommentID].subscriptionDate) != 'undefined') {
				this.commentSubToggle.innerHTML = 'unsubscribe';
				this.commentSubToggle.setAttribute('title','unsubscribe from thread');
				addClass(this.commentSubToggle,'unsubscribe');
			} else {
				this.commentSubToggle.innerHTML = 'subscribe';
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
	subscribeToThread: function(commentID) {
		modules['newCommentCount'].commentSubToggle.innerHTML = 'unsubscribe';
		modules['newCommentCount'].commentSubToggle.setAttribute('title','unsubscribe from thread');
		addClass(modules['newCommentCount'].commentSubToggle,'unsubscribe');
		commentID = commentID || modules['newCommentCount'].currentCommentID;
		var now = new Date();
		modules['newCommentCount'].commentCounts[commentID].subscriptionDate = now.getTime();
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		RESUtils.notification({ 
			header: 'Subscription Notification', 
			message: 'You are now subscribed to this thread for 48 hours. You will be notified if new comments are posted since your last visit.' 
		}, 3000);
	},
	unsubscribeFromThread: function(commentID) {
		modules['newCommentCount'].commentSubToggle.innerHTML = 'subscribe';
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
			for (i in this.commentCounts) {
				var thisSubscription = this.commentCounts[i];
				if ((thisSubscription) && (typeof(thisSubscription.subscriptionDate) != 'undefined')) {
					var lastCheck = parseInt(thisSubscription.lastCheck) || 0;
					var subscriptionDate = parseInt(thisSubscription.subscriptionDate);
					// If it's been 2 days since we've subscribed, we're going to delete this subscription...
					var now = new Date();
					if ((now.getTime() - subscriptionDate) > 172800000) {
						delete this.commentCounts[i].subscriptionDate;
					}
					// if we haven't checked this subscription in 5 minutes, try it again...
					if ((now.getTime() - lastCheck) > 300000) {
						thisSubscription.lastCheck = now.getTime();
						this.commentCounts[i] = thisSubscription;
						this.checkThread(i);
					}
					RESStorage.setItem('RESmodules.newCommentCount.count', JSON.stringify(this.commentCounts));
				}
			}
		}
	},
	checkThread: function(commentID) {
		var subObj = this.commentCounts[commentID];
		GM_xmlhttpRequest({
			method:	"GET",
			url:	subObj.url + '.json?limit=1',
			onload:	function(response) {
				var now = new Date();
				var commentInfo = JSON.parse(response.responseText);
				if (typeof(commentInfo[0].data) != 'undefined') {
					if (subObj.count < commentInfo[0].data.children[0].data.num_comments) {
						modules['newCommentCount'].commentCounts[commentID].count = commentInfo[0].data.children[0].data.num_comments;
						RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
						RESUtils.notification({ 
							header: 'Subscription Notification', 
							message: '<p>New comments posted to thread:</p> <a href="'+subObj.url+'">' + subObj.title + '</a> <p><a class="RESNotificationButtonBlue" href="'+subObj.url+'">view the submission</a></p><div class="clear"></div>'
						}, 10000);
					}
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
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
			// do stuff now!
			// this is where your code goes...
			// credit to tico24 for the idea, here: http://userscripts.org/scripts/review/84454
			// code adapted for efficiency...
			if (RESUtils.loggedInUser() != RESUtils.currentUserProfile()) {
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
						modules['spamButton'].addSpamButtons(event.target);
					}
				}, true);
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
				a.innerHTML= 'spam';
				spam.appendChild(a);
			}
		}
	},
	reportPost: function(e) {
		var a = e.target;
		if (RESUtils.pageType() == 'comments') {
			var authorProfileContainer = a.parentNode.parentNode.parentNode;
		} else {
			var authorProfileContainer = a.parentNode.parentNode.previousSibling;
		}
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
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// draw the commentNav box
			RESUtils.addCSS('#REScommentNavBox { position: fixed; z-index: 999; right: 10px; top: 46px; width: 265px; border: 1px solid gray; background-color: #ffffff; opacity: 0.3; padding: 3px; user-select: none; -webkit-user-select: none; -moz-user-select: none; -webkit-transition:opacity 0.5s ease-in; -moz-transition:opacity 0.5s ease-in; -o-transition:opacity 0.5s ease-in; -ms-transition:opacity 0.5s ease-in; -transition:opacity 0.5s ease-in; }');
			RESUtils.addCSS('#REScommentNavBox:hover { opacity: 1 }');
			RESUtils.addCSS('#REScommentNavToggle { float: left; display: inline; margin-left: 0px; }');
			RESUtils.addCSS('.commentarea .menuarea { margin-right: 0px; }');
			RESUtils.addCSS('.menuarea > .spacer { margin-right: 0px; }');
			RESUtils.addCSS('#commentNavButtons { margin: auto; }');
			RESUtils.addCSS('#commentNavUp { margin: auto; cursor: pointer; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); width: 32px; height: 20px; background-position: 0px -224px; }');
			RESUtils.addCSS('#commentNavDown { margin: auto; cursor: pointer; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); width: 32px; height: 20px; background-position: 0px -244px; }');
			RESUtils.addCSS('#commentNavUp.noNav { background-position: 0px -264px; }');
			RESUtils.addCSS('#commentNavDown.noNav { background-position: 0px -284px; }');
			RESUtils.addCSS('#commentNavButtons { display: none; margin-left: 12px; text-align: center; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			// RESUtils.addCSS('#commentNavCloseButton { background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); background-position: 0px -120px; width: 16px; height: 16px; float: right; cursor: pointer; }');
			RESUtils.addCSS('.commentNavSortType { cursor: pointer; font-weight: bold; float: left; margin-left: 6px; }');
			RESUtils.addCSS('#commentNavPostCount { color: #1278d3; }');
			RESUtils.addCSS('.noNav #commentNavPostCount { color: #dddddd; }');
			RESUtils.addCSS('.commentNavSortTypeDisabled { color: #dddddd; }');
			RESUtils.addCSS('.commentNavSortType:hover { text-decoration: underline; }');
			RESUtils.addCSS('#REScommentNavToggle span { float: left; margin-left: 6px; }');
			RESUtils.addCSS('.menuarea > .spacer { float: left; }');
			
			this.commentNavBox = createElementWithID('div','REScommentNavBox');
			addClass(this.commentNavBox, 'RESDialogSmall');
			// var commentArea = document.body.querySelector('div.sitetable.nestedlisting');
			var commentArea = document.body.querySelector('.commentarea .menuarea');
			if (commentArea) {
				this.commentNavToggle = createElementWithID('div','REScommentNavToggle');
				this.commentNavToggle.innerHTML = '<span>navigate by:</span>';
				var sortTypes = Array('submitter', 'moderator', 'friend', 'admin', 'IAmA', 'images', 'popular', 'new');
				for (i=0, len=sortTypes.length; i<len; i++) {
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
					thisEle.innerHTML = thisCategory;
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
						thisDivider.innerHTML = '|';
						this.commentNavToggle.appendChild(thisDivider);
					}
				}

				// commentArea.insertBefore(this.commentNavToggle,commentArea.firstChild);
				commentArea.appendChild(this.commentNavToggle,commentArea.firstChild);
				if (!(this.options.showByDefault.value)) {
					this.commentNavBox.style.display = 'none';
					// this.commentNavToggle.innerHTML = 'Show Comment Navigator';
				} else {
					// this.commentNavToggle.innerHTML = 'Hide Comment Navigator';
				}
				this.commentNavBox.innerHTML = ' \
					\
					<h3>Navigate by: \
						<select id="commentNavBy"> \
							<option name=""></option> \
							<option name="submitter">submitter</option> \
							<option name="moderator">moderator</option> \
							<option name="friend">friend</option> \
							<option name="admin">admin</option> \
							<option name="IAmA">IAmA</option> \
							<option name="images">images</option> \
							<option name="popular">popular</option> \
							<option name="new">new</option> \
						</select> \
					</h3>\
					<div id="commentNavCloseButton" class="RESCloseButton">X</div> \
					<div class="RESDialogContents"> \
						<div id="commentNavButtons"> \
							<div id="commentNavUp"></div> <div id="commentNavPostCount"></div> <div id="commentNavDown"></div> \
						</div> \
					</div> \
				';
				this.posts = new Array();
				this.nav = new Array();
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
						break;
					case 'IAmA':
						var submitterPosts = document.querySelectorAll('.noncollapsed a.author.submitter');
						this.posts[category] = new Array();
						for (var i=0, len=submitterPosts.length; i<len; i++) {
							// go seven parents up to get the proper parent post...
							var sevenUp = submitterPosts[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
							if (sevenUp.parentNode.nodeName == 'BODY') {
								this.posts[category].push(submitterPosts[i].parentNode.parentNode);
							} else {
								this.posts[category].push(sevenUp);
							}
						}
						break;
					case 'images':
						var imagePosts = document.querySelectorAll('.toggleImage');
						this.posts[category] = imagePosts;
						break;
					case 'popular':
						var allComments = document.querySelectorAll('.noncollapsed');
						var commentsObj = new Array();
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
						this.posts[category] = new Array();
						for (var i=0, len=commentsObj.length; i<len; i++) {
							this.posts[category][i] = commentsObj[i].comment;
						}
						break;
					case 'new':
						this.posts[category] = document.querySelectorAll('.new-comment');
						break;
				}
				this.nav[category] = 0;
			}
			if (this.posts[category].length) {
				modules['commentNavigator'].scrollToNavElement();
				removeClass(modules['commentNavigator'].commentNavUp, 'noNav');
				removeClass(modules['commentNavigator'].commentNavDown, 'noNav');
				removeClass(modules['commentNavigator'].commentNavButtons, 'noNav');
			} else {
				modules['commentNavigator'].commentNavPostCount.innerHTML = 'none';
				addClass(modules['commentNavigator'].commentNavUp, 'noNav');
				addClass(modules['commentNavigator'].commentNavDown, 'noNav');
				addClass(modules['commentNavigator'].commentNavButtons, 'noNav');
			}
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
		modules['commentNavigator'].commentNavPostCount.innerHTML = modules['commentNavigator'].nav[category]+1 + '/' + modules['commentNavigator'].posts[category].length;
		thisXY=RESUtils.getXYpos(modules['commentNavigator'].posts[category][modules['commentNavigator'].nav[category]]);
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
			newSpacer.innerHTML = profileHTML;
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
		linkAll: {
			type: 'boolean',
			value: true,
			description: 'Show "ALL" link in subreddit manager'
		},
		linkRandom: {
			type: 'boolean',
			value: true,
			description: 'Show "RANDOM" link in subreddit manager'
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
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.manageSubreddits();
			if (RESUtils.currentSubreddit() != null) {
				this.setLastViewtime();
			}
		}
	},
	manageSubreddits: function() {
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
		RESUtils.addCSS('#srLeftContainer { z-index: 4; margin-left: -4px; padding-left: 4px; }');
		
		// RESUtils.addCSS('#RESShortcuts { position: absolute; left: '+ this.srLeftContainerWidth+'px;  z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; margin-top: -2px; padding-top: 2px; }');
		RESUtils.addCSS('#RESShortcutsViewport { width: auto; max-height: 20px; overflow: hidden; } ');
		RESUtils.addCSS('#RESShortcuts { z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; }');
		RESUtils.addCSS('#RESSubredditGroupDropdown { display: none; position: absolute; z-index: 99999; padding: 3px; background-color: #F0F0F0; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; }');
		RESUtils.addCSS('#RESSubredditGroupDropdown li { padding-left: 3px; padding-right: 3px; margin-bottom: 2px; }');
		RESUtils.addCSS('#RESSubredditGroupDropdown li:hover { background-color: #F0F0FC; }');

		RESUtils.addCSS('#RESShortcutsEditContainer { width: 52px; position: absolute; right: 0px; top: 0px; z-index: 999; background-color: #f0f0f0; height: 16px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
		RESUtils.addCSS('#RESShortcutsRight { width: 16px; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); background-position: -16px -176px; cursor: pointer; right: 0px; position: absolute; top: 0px; z-index: 999; background-color: #f0f0f0; height: 16px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
		RESUtils.addCSS('#RESShortcutsAdd { width: 16px; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); background-position: 0px -160px; background-repeat: no-repeat; cursor: pointer; right: 15px; height: 16px; position: absolute; top: 0px; z-index: 999; background-color: #f0f0f0; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
		RESUtils.addCSS('#RESShortcutsTrash { display: none; width: 16px; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); background-position: -16px -160px; background-repeat: no-repeat; cursor: pointer; right: 15px; height: 16px; position: absolute; top: 0px; z-index: 1000; background-color: #DDD; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
		RESUtils.addCSS('#RESShortcutsLeft { width: 16px; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); background-position: 0px -176px; cursor: pointer; right: 31px; position: absolute; top: 0px; z-index: 999; background-color: #f0f0f0; height: 16px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
		RESUtils.addCSS('.srSep { margin-left: 6px; }');
		RESUtils.addCSS('.RESshortcutside { margin-right: 5px; color: white; background-image: url(/static/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444444; padding: 1px 6px; border-radius: 3px 3px 3px 3px; }');
		RESUtils.addCSS('.RESshortcutside.remove { background-image: url(/static/bg-button-remove.png) }');
		RESUtils.addCSS('.RESshortcutside:hover { background-color: #f0f0ff; }');
		RESUtils.addCSS('h1.redditname > a { float: left; }');
		RESUtils.addCSS('h1.redditname { overflow: auto; }');
		RESUtils.addCSS('.sortAsc, .sortDesc { float: right; background-image: url("http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png"); width: 12px; height: 12px; background-repeat: no-repeat; }');
		RESUtils.addCSS('.sortAsc { background-position: 0px -148px; }');
		RESUtils.addCSS('.sortDesc { background-position: -12px -148px; }');
		RESUtils.addCSS('#RESShortcutsAddFormContainer { display: none; position: absolute; width: 290px; padding: 2px; right: 0px; top: 21px; z-index: 10000; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; font-size: 12px; color: #000000; }');
		RESUtils.addCSS('#RESShortcutsAddFormContainer  a { font-weight: bold; }');
		RESUtils.addCSS('#newShortcut { width: 130px; }');
		RESUtils.addCSS('#displayName { width: 130px; }');
		RESUtils.addCSS('#shortCutsAddForm { padding: 5px; }');
		RESUtils.addCSS('#shortCutsAddForm div { font-size: 10px; margin-bottom: 10px; }');
		RESUtils.addCSS('#shortCutsAddForm label { display: inline-block; width: 100px; }');
		RESUtils.addCSS('#shortCutsAddForm input[type=text] { width: 170px; margin-bottom: 6px; }');
		RESUtils.addCSS('#addSubreddit { float: right; cursor: pointer; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; }');
		
		
		// this shows the sr-header-area that we hid while rendering it (to curb opera's glitchy "jumping")...
		if (typeof(opera) != 'undefined') {
			RESUtils.addCSS('#sr-header-area { display: block !important; }');
		}
		// This is the init function for Manage Subreddits - it'll get your preferences and redraw the top bar.
		this.redrawSubredditBar();
		// Listen for subscriptions / unsubscriptions from reddits so we know to reload the JSON string...
		// also, add a +/- shortcut button...
		if (RESUtils.currentSubreddit()) {
			var subButton = document.querySelector('.fancy-toggle-button');
			if (! ($('#subButtons').length>0)) {
				this.subButtons = $('<div id="subButtons"></div>');
				$(subButton).wrap(this.subButtons);
			}
			if (subButton) {
				subButton.addEventListener('click',function() {
					// reset the last checked time for the subreddit list so that we refresh it anew no matter what.
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.'+RESUtils.loggedInUser(),0);
				},false);
				var theSubredditLink = document.querySelector('h1.redditname');
				if (theSubredditLink) {
					var theSC = document.createElement('span');
					theSC.setAttribute('class','RESshortcut RESshortcutside');
					theSC.setAttribute('subreddit',RESUtils.currentSubreddit());
					var idx = -1;
					for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
						if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == RESUtils.currentSubreddit()) {
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
					$('#subButtons').append(theSC);
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
						theSC.innerHTML = '-shortcut';
						theSC.setAttribute('title','Remove this subreddit from your shortcut bar');
					} else {
						theSC.innerHTML = '+shortcut';
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
		this.shortCutsContainer.innerHTML = '';
		var shortCuts = RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.'+RESUtils.loggedInUser());
		if (shortCuts == null) {
			shortCuts = RESStorage.getItem('RESmodules.betteReddit.subredditShortcuts.'+RESUtils.loggedInUser());
			// if we used to have these settings in betteReddit, clean them up.
			if (shortCuts != null) {
				var betteRedditOptions = JSON.parse(RESStorage.getItem('RESoptions.betteReddit'));
				delete betteRedditOptions.manageSubreddits;
				delete betteRedditOptions.linkAll;
				delete betteRedditOptions.linkFriends;
				delete betteRedditOptions.linkMod;
				delete betteRedditOptions.linkRandom;
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
				thisShortCut.setAttribute('href','/r/'+this.mySubredditShortcuts[i].subreddit);
				thisShortCut.innerHTML = this.mySubredditShortcuts[i].displayName;
				thisShortCut.addEventListener('click', function(e) {
					if (e.button != 1) {
						e.preventDefault();
						// use to open links in new tabs... work on this later...
						modules['subredditManager'].clickedShortcutShift = e.shiftKey;
						modules['subredditManager'].clickedShortcutCtrl = e.ctrlKey;
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
					sep.innerHTML = '-';
					this.shortCutsContainer.appendChild(sep);
				} 
			}
			if (this.mySubredditShortcuts.length == 0) {
				this.shortCutsContainer.style.textTransform = 'none';
				this.shortCutsContainer.innerHTML = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			} else {
				this.shortCutsContainer.style.textTransform = '';
			}
		} else {
			this.shortCutsContainer.style.textTransform = 'none';
			this.shortCutsContainer.innerHTML = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			this.mySubredditShortcuts = new Array();
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
			this.subredditGroupDropdownUL.innerHTML = '';
			for (var i=0, len=subreddits.length; i<len; i++) {
				this.subredditGroupDropdownUL.innerHTML += '<li><a href="/r/'+subreddits[i]+'">'+subreddits[i]+'</a></li>';
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
		this.editShortcutDialog.innerHTML = '<form name="editSubredditShortcut"><h3>Edit Shortcut</h3><div id="editShortcutClose" class="RESCloseButton">X</div><label for="subreddit">Subreddit:</label> <input type="text" name="subreddit" value="'+subreddit+'" id="shortcut-subreddit"><br>';
		this.editShortcutDialog.innerHTML += '<label for="displayName">Display Name:</label><input type="text" name="displayName" value="'+ele.innerHTML+'" id="shortcut-displayname">';
		this.editShortcutDialog.innerHTML += '<input type="hidden" name="idx" value="'+idx+'"><input type="button" name="shortcut-save" value="save" id="shortcut-save"></form>';
		
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
				subreddit = modules['subredditManager'].mySubredditShortcuts[idx].displayName;
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
		if (modules['subredditManager'].clickedShortcutCtrl) {
			RESUtils.openLinkInNewTab(modules['subredditManager'].clickedShortcut);
		} else {
			if (typeof(self.on) == 'function') {
				// stupid firefox... sigh...
				location.href = location.protocol + '//' + location.hostname + modules['subredditManager'].clickedShortcut;
			} else {
				location.href = modules['subredditManager'].clickedShortcut;
			}
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
		modules['subredditManager'].srDataTransfer = this.getAttribute('orderIndex') + ',' + this.innerHTML;
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
				var rearranged = new Array();
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
			if (typeof(opera) != 'undefined') this.headerContents.style.display = 'none';
			// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
			this.headerContents.innerHTML = '';
			this.srLeftContainer = createElementWithID('div','srLeftContainer');
			this.srLeftContainer.setAttribute('class','sr-bar');
			this.srDropdown = createElementWithID('div','srDropdown');
			this.srDropdownContainer = createElementWithID('div','srDropdownContainer');
			this.srDropdownContainer.innerHTML = '<a href="javascript:void(0)">My Subreddits</a>';
			this.srDropdownContainer.addEventListener('click',modules['subredditManager'].toggleSubredditDropdown, false);
			this.srDropdown.appendChild(this.srDropdownContainer);
			this.srList = createElementWithID('table','srList');
			// this.srDropdownContainer.appendChild(this.srList);
			document.body.appendChild(this.srList);
			this.srLeftContainer.appendChild(this.srDropdown);
			var sep = document.createElement('span');
			sep.setAttribute('class','srSep');
			sep.innerHTML = '|';
			this.srLeftContainer.appendChild(sep);
			// now put in the shortcuts...
			this.staticShortCutsContainer = document.createElement('div');
			this.staticShortCutsContainer.setAttribute('id','RESStaticShortcuts');
			/* this probably isn't the best way to give the option, since the mechanic is drag/drop for other stuff..  but it's much easier for now... */
			this.staticShortCutsContainer.innerHTML = '';
			if (this.options.linkAll.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a href="/r/all/">ALL</a>';
			if (this.options.linkRandom.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a href="/r/random/">RANDOM</a>';
			if (RESUtils.loggedInUser() != null) {
				if (this.options.linkFriends.value) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a href="/r/friends/">FRIENDS</a>';
				var modmail = document.getElementById('modmail');
				if ((modmail) && (this.options.linkMod.value)) this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a href="/r/mod/">MOD</a>';
			}
			
			/*
			this.staticShortCutsContainer.innerHTML = ' <span class="separator">|</span><a href="/r/all/">ALL</a><span class="separator">-</span><a href="/r/random/">RANDOM</a>';
			if (RESUtils.loggedInUser() != null) {
				this.staticShortCutsContainer.innerHTML += '<span class="separator">-</span><a href="/r/friends/">FRIENDS</a><span class="separator">-</span><a href="/r/mod/">MOD</a>';
			}
			*/
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
			this.shortCutsRight.innerHTML = '';
			// this.containerWidth = this.shortCutsContainer.scrollWidth;
			this.shortCutsRight.addEventListener('click', function(e) {
				modules['subredditManager'].containerWidth = modules['subredditManager'].shortCutsContainer.offsetWidth;
				// var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				// width of browser minus width of left container plus a bit extra for padding...
				// var containerWidth = window.innerWidth + 20 - modules['subredditManager'].srLeftContainer.scrollWidth;
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px',''));
				if (isNaN(marginLeft)) marginLeft = 0;
				if (modules['subredditManager'].containerWidth > (window.innerWidth-380)) {
					marginLeft -= (window.innerWidth - 380);
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				} else {
					// console.log('already all the way over.');
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsRight);

			// add an "add shortcut" button...
			this.shortCutsAdd = document.createElement('div');
			this.shortCutsAdd.setAttribute('id','RESShortcutsAdd');
			this.shortCutsAdd.innerHTML = '';
			this.shortCutsAdd.title = 'add shortcut';
			this.shortCutsAddFormContainer = document.createElement('div');
			this.shortCutsAddFormContainer.setAttribute('id','RESShortcutsAddFormContainer');
			this.shortCutsAddFormContainer.style.display = 'none';
			this.shortCutsAddFormContainer.innerHTML = ' \
				<form id="shortCutsAddForm"> \
					<div>Add shortcut or multi-reddit (i.e. foo+bar+baz):</div> \
					<label for="newShortcut">Subreddit:</label> <input type="text" id="newShortcut"><br> \
					<label for="displayName">Display Name:</label> <input type="text" id="displayName"><br> \
					<input type="submit" name="submit" value="add" id="addSubreddit"> \
					<div style="clear: both; float: right; margin-top: 5px;"><a style="font-size: 9px;" href="/reddits">Edit frontpage subscriptions</a></div> \
				</form> \
			';			
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
			this.shortCutsLeft.innerHTML = '';
			this.shortCutsLeft.addEventListener('click', function(e) {
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px',''));
				if (isNaN(marginLeft)) marginLeft = 0;
				marginLeft += (window.innerWidth - 380);
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
				modules['subredditManager'].srList.innerHTML = '<tr><td width="360">Loading subreddits (may take a moment)...<div id="subredditPagesLoaded"></div></td></tr>';
				modules['subredditManager'].subredditPagesLoaded = modules['subredditManager'].srList.querySelector('#subredditPagesLoaded');
				modules['subredditManager'].srList.style.display = 'block';
				modules['subredditManager'].getSubreddits();
			} else {
				modules['subredditManager'].srList.innerHTML = '<tr><td width="360">You must be logged in to load your own list of subreddits. <a style="display: inline; float: left;" href="/reddits">browse them all</a></td></tr>';
				modules['subredditManager'].srList.style.display = 'block';
			}
		}
	},
	mySubreddits: [
	],
	mySubredditShortcuts: [
	],
	getSubredditJSON: function(after) {
		// console.log('getsubredditjson called');
		var jsonURL = 'http://' + location.hostname + '/reddits/mine/.json';
		if (after) jsonURL += '?after='+after;
		// console.log('jsonURL: ' + jsonURL);
		GM_xmlhttpRequest({
			method:	"GET",
			url:	jsonURL,
			onload:	function(response) {
				// console.log('json loaded...');
				var thisResponse = JSON.parse(response.responseText);
				// console.log(typeof(thisResponse.data));
				// if (typeof(thisResponse.data) != 'undefined') console.log(typeof(thisResponse.data.children));;
				if ((typeof(thisResponse.data) != 'undefined') && (typeof(thisResponse.data.children) != 'undefined')) {
					// console.log('starting to process json...');
					if (modules['subredditManager'].subredditPagesLoaded.innerHTML == '') {
						modules['subredditManager'].subredditPagesLoaded.innerHTML = 'Pages loaded: 1';
					} else {
						var pages = modules['subredditManager'].subredditPagesLoaded.innerHTML.match(/:\ ([\d]+)/);
						modules['subredditManager'].subredditPagesLoaded.innerHTML = 'Pages loaded: ' + (parseInt(pages[1])+1);
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
							description: subreddits[i].data.description,
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
		modules['subredditManager'].mySubreddits = new Array();
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
		modules['subredditManager'].srList.innerHTML = '';
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
		modules['subredditManager'].srHeader.innerHTML = 'subreddit';
		modules['subredditManager'].srHeader.setAttribute('width','200');
		modules['subredditManager'].lvHeader = document.createElement('td');
		modules['subredditManager'].lvHeader.addEventListener('click', function() {
			if (modules['subredditManager'].sortBy == 'lastVisited') {
				modules['subredditManager'].populateSubredditDropdown('lastVisitedAsc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('lastVisited');
			}
		}, false);
		modules['subredditManager'].lvHeader.innerHTML = 'Last Visited';
		modules['subredditManager'].lvHeader.setAttribute('width','120');
		var scHeader = document.createElement('td');
		// scHeader.innerHTML = '&nbsp;';
		scHeader.innerHTML = '<a style="float: right;" href="/reddits">View all &raquo;</a>';
		theRow.appendChild(modules['subredditManager'].srHeader);
		theRow.appendChild(modules['subredditManager'].lvHeader);
		theRow.appendChild(scHeader);
		theHead.appendChild(theRow);
		// theRow.innerHTML = '<td width="120">subreddit</td><td width="100">Last Visited</td><td></td>';
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
				modules['subredditManager'].lvHeader.innerHTML = 'Last Visited <div class="sortAsc"></div>';
				modules['subredditManager'].srHeader.innerHTML = 'subreddit';
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
				modules['subredditManager'].lvHeader.innerHTML = 'Last Visited <div class="sortDesc"></div>';
				modules['subredditManager'].srHeader.innerHTML = 'subreddit';
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
				modules['subredditManager'].lvHeader.innerHTML = 'Last Visited';
				modules['subredditManager'].srHeader.innerHTML = 'subreddit <div class="sortDesc"></div>';
				sortableSubreddits.sort(function(a,b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					if (adisp < bdisp) return 1;
					if (adisp == bdisp) return 0;
					return -1;
				});		
			} else {
				modules['subredditManager'].lvHeader.innerHTML = 'Last Visited';
				modules['subredditManager'].srHeader.innerHTML = 'subreddit <div class="sortAsc"></div>';
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
				theSR.innerHTML = '<a href="'+modules['subredditManager'].mySubreddits[i].url+'">'+modules['subredditManager'].mySubreddits[i].display_name+'</a>';
				theRow.appendChild(theSR);
				var theLV = document.createElement('td');
				theLV.innerHTML = dateString;
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
					theSC.innerHTML = '-shortcut';
				} else {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}
						var subreddit = e.target.getAttribute('subreddit');
						modules['subredditManager'].addSubredditShortcut(subreddit);
					}, false);
					theSC.innerHTML = '+shortcut';
				}
				theRow.appendChild(theSC);
				theBody.appendChild(theRow);
			}
		} else {
			var theRow = document.createElement('tr');
			var theTD = document.createElement('td');
			theTD.innerHTML = 'There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com<';
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
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == e.target.getAttribute('subreddit')) {
				idx=i;
				break;
			}
		}
		if (idx != -1) {
			// modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
			modules['subredditManager'].removeSubredditShortcut(e.target.getAttribute('subreddit'));
			e.target.setAttribute('title','Add this subreddit to your shortcut bar');
			e.target.innerHTML = '+shortcut';
			removeClass(e.target,'remove');
		} else {
			// modules['subredditManager'].mySubredditShortcuts.push(e.target.getAttribute('subreddit'));
			modules['subredditManager'].addSubredditShortcut(e.target.getAttribute('subreddit'));
			e.target.setAttribute('title','Remove this subreddit from your shortcut bar');
			e.target.innerHTML = '-shortcut';
			addClass(e.target,'remove');
		}
		modules['subredditManager'].redrawShortcuts();
	},
	addSubredditShortcut: function(subreddit, displayname) {
		var idx = -1;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == subreddit) {
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
		var idx = -1;
		for (var i=0, len=modules['subredditManager'].mySubredditShortcuts.length; i<len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].displayName == subreddit) {
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
			// get this module's options...
			// RESUtils.getOptions(this.moduleID);
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
							if (RESConsole.proUserTaggerSaveButton) RESConsole.proUserTaggerSaveButton.innerHTML = 'Saved!';
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
							if (RESConsole.proSaveCommentsSaveButton) RESConsole.proSaveCommentsSaveButton.innerHTML = 'Saved!';
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

				for (key in RESStorage) {
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
							if (RESConsole.proSubredditManagerSaveButton) RESConsole.proSubredditManagerSaveButton.innerHTML = 'Saved!';
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
				if (RESConsole.proSaveCommentsGetButton) RESConsole.proSaveCommentsGetButton.innerHTML = 'Loading...';
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
							for (attrname in serverData) {
								if (typeof(currentData[attrname]) == 'undefined') {
									currentData[attrname] = serverData[attrname];
								} 
							}
							// console.log(JSON.stringify(prefsData));
							RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(currentData));
							if (RESConsole.proSaveCommentsGetButton) RESConsole.proSaveCommentsGetButton.innerHTML = 'Saved Comments Loaded!';
						} else {
							alert(response.responseText);
						}
					}
				});
				break;
			case 'subredditManager':
				if (RESConsole.proSubredditManagerGetButton) RESConsole.proSubredditManagerGetButton.innerHTML = 'Loading...';
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
								if (oldSubredditData == null) oldSubredditData = new Array();
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
		if (RESConsole.proSaveButton) RESConsole.proSaveButton.innerHTML = 'Saving...';
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
					if (RESConsole.proSaveButton) RESConsole.proSaveButton.innerHTML = 'Saved.';
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
		if (RESConsole.proGetButton) RESConsole.proGetButton.innerHTML = 'Loading...';
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
					for (thisModule in prefsData){
						if (thisModule == 'modulePrefs') {
							var thisOptions = prefsData[thisModule];
							RESStorage.setItem('RES.modulePrefs',JSON.stringify(thisOptions));
						} else {
							var thisOptions = prefsData[thisModule];
							RESStorage.setItem('RESoptions.'+thisModule,JSON.stringify(thisOptions));
						}
					}
					if (RESConsole.proGetButton) RESConsole.proGetButton.innerHTML = 'Preferences Loaded!';
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
							// RESConsole.proAuthButton.innerHTML = 'Authenticated!';
							RESStorage.removeItem('RESmodules.RESPro.lastAuthFailed');
							if (callback) {
								callback();
							}
						} else {
							// RESConsole.proAuthButton.innerHTML = 'Authentication failed.';
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
		}
	},
	description: 'RES Dashboard',
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
		if ((this.isEnabled()) && (this.isMatchURL())) {
			$('#RESDropdownOptions').prepend('<li id="DashboardLink"><a href="/r/Dashboard">my dashboard</a></li>');
			if (RESUtils.currentSubreddit()) {
				RESUtils.addCSS('.RESDashboardToggle {}');
				try {
					this.widgets = JSON.parse(RESStorage.getItem('RESmodules.dashboard.' + RESUtils.loggedInUser())) || [];
				} catch (e) {
					this.widgets = [];
				}
				// one more safety check... not sure how people's widgets[] arrays are breaking.
				if (!(this.widgets instanceof Array)) {
					this.widgets = [];
				}
				if (RESUtils.currentSubreddit('dashboard')) {
					$('#noresults, #header-bottom-left .tabmenu').hide();
					$('#header-bottom-left .redditname a').html('My Dashboard');
					this.drawDashboard();
				}
				this.addDashboardShortcuts();
			}
		}
	},
	loader: 'data:image/gif;base64,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',
	drawDashboard: function() {
		RESUtils.addCSS('.RESDashboardComponent { position: relative; border: 1px solid #cccccc; border-radius: 3px 3px 3px 3px; overflow: hidden; margin-bottom: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader { box-sizing: border-box; padding: 5px 0px 5px 0px; background-color: #f0f3fc; height: 38px; }');
		RESUtils.addCSS('.RESDashboardComponentScrim { position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px; z-index: 5; display: none; }');
		RESUtils.addCSS('.RESDashboardComponentLoader { box-sizing: border-box; position: absolute; background-color: #f2f9ff; border: 1px solid #b9d7f4; border-radius: 3px 3px 3px 3px; width: 314px; height: 40px; left: 50%; top: 50%; margin-left: -167px; margin-top: -20px; text-align: center; padding-top: 11px; }');
		RESUtils.addCSS('.RESDashboardComponentLoader span { position: relative; top: -6px; left: 5px; } ');
		RESUtils.addCSS('.RESDashboardComponentContainer { padding: 10px 15px 0px 15px; min-height: 100px; }');
		RESUtils.addCSS('.RESDashboardComponentContainer.minimized { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath, .addNewWidget { display: inline-block; margin-left: 0px; margin-top: 7px; color: #000000; font-weight: bold; }');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath { margin-left: 15px; vertical-align: top; width: 120px; overflow: hidden; text-overflow: ellipsis; }');
		RESUtils.addCSS('#RESDashboardAddComponent { box-sizing: border-box; padding: 5px 8px 5px 8px; vertical-align: middle; background-color: #cee3f8; border: 1px solid #336699;}');
		// RESUtils.addCSS('#RESDashboardComponentScrim, #RESDashboardComponentLoader { background-color: #cccccc; opacity: 0.3; border: 1px solid red; display: none; }');
		RESUtils.addCSS('#addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer { display: none; }');
		RESUtils.addCSS('#addWidgetButtons, #addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer { width: 550px; height: 28px; float: right; text-align: right; }');
		RESUtils.addCSS('#addUserForm, #addRedditForm { display: inline-block }');
		RESUtils.addCSS('#addUser { width: 200px; height: 24px; }');
		RESUtils.addCSS('#addRedditFormContainer ul.token-input-list-facebook { float: left; }');
		RESUtils.addCSS('#addReddit { width: 115px; background-color: #ffffff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('.addButton { cursor: pointer; display: inline-block; width: auto; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 11px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.backToWidgetTypes { display: inline-block; vertical-align: top; margin-top: 8px; font-weight: bold; color: #000000; cursor: pointer; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul { font-family: Verdana; font-size: 13px; box-sizing: border-box; height: 14px; line-height: 22px; display: inline-block; margin-top: 2px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li { box-sizing: border-box; vertical-align: middle; height: 24px; display: inline-block; cursor: pointer; padding: 0px 6px 0px 6px; border: 1px solid #c7c7c7; background-color: #ffffff; color: #6c6c6c; border-radius: 3px 3px 3px 3px; }');
		RESUtils.addCSS('.RESDashboardComponent.minimized ul li { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent.minimized li.RESClose, .RESDashboardComponent.minimized li.minimize { display: inline-block; }');
		RESUtils.addCSS('ul.widgetSortButtons li { margin-right: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li.active, .RESDashboardComponentHeader ul li:hover { background-color: #a6ccf1; color: #ffffff; border-color: #699dcf; }');
		RESUtils.addCSS('ul.widgetStateButtons li { margin-left: 10px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled { background-color: #dddddd; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled:hover { cursor: auto; background-color: #dddddd; color: #6c6c6c; border: 1px solid #c7c7c7; }');
		RESUtils.addCSS('ul.widgetSortButtons { margin-left: 10px; }');
		RESUtils.addCSS('ul.widgetStateButtons { float: right; margin-right: 8px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.updateTime { cursor: auto; background: none; border: none; color: #afafaf; font-size: 9px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.minimize, ul.widgetStateButtons li.close { font-size: 24px; }');
		RESUtils.addCSS('.minimized ul.widgetStateButtons li.minimize { font-size: 14px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh { margin-left: 3px; width: 24px; position:relative; padding: 0px 0px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh div { height: 16px; width: 16px; position: absolute; left: 4px; top: 4px; background-image: url(\'http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png\'); background-repeat: no-repeat; background-position: -16px -209px; }');

		// add each subreddit widget...
		// add the "add widget" form...
		this.attachAddComponent();
		this.initUpdateQueue();
	},
	initUpdateQueue: function() {
		modules['dashboard'].updateQueue = [];
		for (i in this.widgets) if (this.widgets[i]) this.addWidget(this.widgets[i]);
		setTimeout(function () {
			$('#RESDashboard').dragsort({ dragSelector: "div.RESDashboardComponentHeader", dragSelectorExclude: 'a, li, li.refresh > div', dragEnd: modules['dashboard'].saveOrder, placeHolderTemplate: "<div class='placeHolder'><div></div></div>" });
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
	attachAddComponent: function() {
		this.siteTable = $('#siteTable.linklisting');
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
				<form id="addRedditForm"><input type="text" id="addReddit"><input type="submit" class="addButton" value="+add"></form> \
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
				$('#addRedditFormContainer').fadeIn();
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
		$(thisEle).tokenInput('/api/search_reddit_names.json', {
			method: "POST",
			queryParam: "query",
			theme: "facebook",
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
				var thisDesc = item[this.propertyToSearch];
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
					modules['dashboard'].addWidget({
						basePath: thisBasePath
					}, true);
					// $('#addReddit').val('').blur();
					$('#addReddit').tokenInput('clear');
					$('#addRedditFormContainer').fadeOut(function() {
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
		$(this.siteTable).append(this.dashboardAddComponent);
		this.dashboardUL = $('<ul id="RESDashboard"></ul>');
		$(this.siteTable).append(this.dashboardUL);
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
	widgetObject: function(widgetOptions) {
		var thisWidget = this; // keep a reference because the this keyword can mean different things in different scopes...
		thisWidget.basePath = widgetOptions.basePath;
		thisWidget.numPosts = widgetOptions.numPosts || modules['dashboard'].options.defaultPosts.value;
		thisWidget.sortBy = widgetOptions.sortBy || modules['dashboard'].options.defaultSort.value;
		thisWidget.minimized = widgetOptions.minimized || false;
		thisWidget.widgetEle = $('<li class="RESDashboardComponent" id="'+thisWidget.basePath.replace(/\/|\+/g,'_')+'"><div class="RESDashboardComponentScrim"><div class="RESDashboardComponentLoader"><img id="dashboardLoader" src="'+modules['dashboard'].loader+'"><span>querying the server. one moment please.</span></div></div></li>');
		thisWidget.header = $('<div class="RESDashboardComponentHeader"><a class="widgetPath" title="'+thisWidget.basePath+'" href="'+thisWidget.basePath+'">'+thisWidget.basePath+'</a></div>');
		thisWidget.sortControls = $('<ul class="widgetSortButtons"><li sort="hot">hot</li><li sort="new">new</li><li sort="controversial">controversial</li><li sort="top">top</li></ul>');
		// return an optionsObject, which is what we'll store in the modules['dashboard'].widgets array.
		thisWidget.optionsObject = function() {
			return {
				basePath: thisWidget.basePath,
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
		thisWidget.stateControls = $('<ul class="widgetStateButtons"><li class="updateTime"></li><li action="refresh" class="refresh"><div action="refresh"></div></li><li action="addRow">+row</li><li action="subRow">-row</li><li action="minimize" class="minimize">-</li><li action="delete" class="RESClose">X</li></ul>');
		$(thisWidget.stateControls).find('li').click(function (e) {
			switch ($(e.target).attr('action')) {
				case 'refresh':
					thisWidget.update();
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
						$(e.target).html('+');
						thisWidget.minimized = true;
					} else {
						$(e.target).html('-');
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
			$(thisWidget.stateControls).find('li.minimize').addClass('minimized').html('+');
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
				$(thisWidget.contents).html(widgetContent);
				$(thisWidget.contents).fadeTo('fast',1);
				$(thisWidget.scrim).fadeOut();
				$(thisWidget.stateControls).find('.updateTime').html('updated: '+RESUtils.niceDateTime());
			} else {
				if (thisWidget.url.indexOf('/message/') != -1) {
					$(thisWidget.contents).html('<div class="widgetNoMail">No messages were found.</div>');
				} else {
					$(thisWidget.contents).html('<div class="error">There were no results returned for this widget. If you made a typo, simply close the widget to delete it. If reddit is just under heavy load, try clicking refresh in a few moments.</div>');
				}
				$(thisWidget.contents).fadeTo('fast',1);
				$(thisWidget.scrim).fadeOut();
				$(thisWidget.stateControls).find('.updateTime').html('updated: '+RESUtils.niceDateTime());
			}
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
		RESUtils.addCSS('.RESDashboardToggle { margin-right: 5px; color: white; background-image: url(/static/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
		RESUtils.addCSS('.RESDashboardToggle.remove { background-image: url(/static/bg-button-remove.png) }');
		var subButton = document.querySelector('.fancy-toggle-button');
		if (! ($('#subButtons').length>0)) {
			this.subButtons = $('<div id="subButtons"></div>');
			$(subButton).wrap(this.subButtons);
		}
		var dashboardToggle = document.createElement('span');
		dashboardToggle.setAttribute('class','RESDashboardToggle');
		dashboardToggle.setAttribute('subreddit',RESUtils.currentSubreddit());
		var exists=false;
		for (var i=0, len=this.widgets.length; i<len; i++) {
			if ((this.widgets[i]) && (this.widgets[i].basePath.toLowerCase() == '/r/'+RESUtils.currentSubreddit().toLowerCase())) {
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
		$('#subButtons').append(dashboardToggle);
	},
	toggleDashboard: function(e) {
		var thisBasePath = '/r/'+e.target.getAttribute('subreddit');
		if (hasClass(e.target,'remove')) {
			modules['dashboard'].removeWidget({
				basePath: thisBasePath
			}, true);
			e.target.innerHTML = '+dashboard';
			removeClass(e.target,'remove');
		} else {
			modules['dashboard'].addWidget({
				basePath: thisBasePath
			}, true);
			e.target.innerHTML = '-dashboard';
			RESUtils.notification({ 
				header: 'Dashboard Notification', 
				message: 'Dashboard widget added for '+thisBasePath+' <p><a class="RESNotificationButtonBlue" href="/r/Dashboard">view the dashboard</a></p><div class="clear"></div>'
			});
			addClass(e.target,'remove');
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
										orig_keys = this.keys;
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

function RESInit() {
	if (typeof(self.on) == 'function') {
		// firefox addon sdk... we've included jQuery... 
		if (typeof($) != 'function') {
			console.log('Uh oh, something has gone wrong loading jQuery...');
		}
	} else if ((typeof(unsafeWindow) != 'undefined') && (unsafeWindow.jQuery)) {
		// greasemonkey
		$ = unsafeWindow.jQuery;
		jQuery = $;
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

// tokeninput jquery plugin
(function ($) {
// Default settings
var DEFAULT_SETTINGS = {
	// Search settings
    method: "GET",
    contentType: "json",
    queryParam: "q",
    searchDelay: 300,
    minChars: 1,
    propertyToSearch: "name",
    jsonContainer: null,

	// Display settings
    hintText: "Type in a search term",
    noResultsText: "No results",
    searchingText: "Searching...",
    deleteText: "&times;",
    animateDropdown: true,

	// Tokenization settings
    tokenLimit: null,
    tokenDelimiter: ",",
    preventDuplicates: false,

	// Output settings
    tokenValue: "id",

	// Prepopulation settings
    prePopulate: null,
    processPrePopulate: false,

	// Manipulation settings
    idPrefix: "token-input-",

	// Formatters
    resultsFormatter: function(item){ return "<li>" + item[this.propertyToSearch]+ "</li>" },
    tokenFormatter: function(item) { return "<li><p>" + item[this.propertyToSearch] + "</p></li>" },

	// Callbacks
    onResult: null,
    onAdd: null,
    onDelete: null,
    onReady: null
};

// Default classes to use when theming
var DEFAULT_CLASSES = {
    tokenList: "token-input-list",
    token: "token-input-token",
    tokenDelete: "token-input-delete-token",
    selectedToken: "token-input-selected-token",
    highlightedToken: "token-input-highlighted-token",
    dropdown: "token-input-dropdown",
    dropdownItem: "token-input-dropdown-item",
    dropdownItem2: "token-input-dropdown-item2",
    selectedDropdownItem: "token-input-selected-dropdown-item",
    inputToken: "token-input-input-token"
};

// Input box position "enum"
var POSITION = {
    BEFORE: 0,
    AFTER: 1,
    END: 2
};

// Keys "enum"
var KEY = {
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

// Additional public (exposed) methods
var methods = {
    init: function(url_or_data_or_function, options) {
        var settings = $.extend({}, DEFAULT_SETTINGS, options || {});

        return this.each(function () {
            $(this).data("tokenInputObject", new $.TokenList(this, url_or_data_or_function, settings));
        });
    },
    clear: function() {
        this.data("tokenInputObject").clear();
        return this;
    },
    add: function(item) {
        this.data("tokenInputObject").add(item);
        return this;
    },
    remove: function(item) {
        this.data("tokenInputObject").remove(item);
        return this;
    },
    get: function() {
    	return this.data("tokenInputObject").getTokens();
   	}
}

// Expose the .tokenInput function to jQuery as a plugin
$.fn.tokenInput = function (method) {
    // Method calling and initialization logic
    if(methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
        return methods.init.apply(this, arguments);
    }
};

// TokenList class for each input
$.TokenList = function (input, url_or_data, settings) {
    //
    // Initialization
    //

    // Configure the data source
    if($.type(url_or_data) === "string" || $.type(url_or_data) === "function") {
        // Set the url to query against
        settings.url = url_or_data;

        // If the URL is a function, evaluate it here to do our initalization work
        var url = computeURL();

        // Make a smart guess about cross-domain if it wasn't explicitly specified
        if(settings.crossDomain === undefined) {
            if(url.indexOf("://") === -1) {
                settings.crossDomain = false;
            } else {
                settings.crossDomain = (location.href.split(/\/+/g)[1] !== url.split(/\/+/g)[1]);
            }
        }
    } else if(typeof(url_or_data) === "object") {
        // Set the local data to search through
        settings.local_data = url_or_data;
    }

    // Build class names
    if(settings.classes) {
        // Use custom class names
        settings.classes = $.extend({}, DEFAULT_CLASSES, settings.classes);
    } else if(settings.theme) {
        // Use theme-suffixed default class names
        settings.classes = {};
        $.each(DEFAULT_CLASSES, function(key, value) {
            settings.classes[key] = value + "-" + settings.theme;
        });
    } else {
        settings.classes = DEFAULT_CLASSES;
    }


    // Save the tokens
    var saved_tokens = [];

    // Keep track of the number of tokens in the list
    var token_count = 0;

    // Basic cache to save on db hits
    var cache = new $.TokenList.Cache();

    // Keep track of the timeout, old vals
    var timeout;
    var input_val;

    // Create a new text input an attach keyup events
    var input_box = $("<input type=\"text\"  autocomplete=\"off\">")
        .css({
            outline: "none"
        })
        .attr("id", settings.idPrefix + input.id)
        .focus(function () {
            if (settings.tokenLimit === null || settings.tokenLimit !== token_count) {
                show_dropdown_hint();
            }
        })
        .blur(function () {
            hide_dropdown();
            $(this).val("");
        })
        .bind("keyup keydown blur update", resize_input)
        .keydown(function (event) {
            var previous_token;
            var next_token;

            switch(event.keyCode) {
                case KEY.LEFT:
                case KEY.RIGHT:
                case KEY.UP:
                case KEY.DOWN:
                    if(!$(this).val()) {
                        previous_token = input_token.prev();
                        next_token = input_token.next();

                        if((previous_token.length && previous_token.get(0) === selected_token) || (next_token.length && next_token.get(0) === selected_token)) {
                            // Check if there is a previous/next token and it is selected
                            if(event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) {
                                deselect_token($(selected_token), POSITION.BEFORE);
                            } else {
                                deselect_token($(selected_token), POSITION.AFTER);
                            }
                        } else if((event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) && previous_token.length) {
                            // We are moving left, select the previous token if it exists
                            select_token($(previous_token.get(0)));
                        } else if((event.keyCode === KEY.RIGHT || event.keyCode === KEY.DOWN) && next_token.length) {
                            // We are moving right, select the next token if it exists
                            select_token($(next_token.get(0)));
                        }
                    } else {
                        var dropdown_item = null;

                        if(event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) {
                            dropdown_item = $(selected_dropdown_item).next();
                        } else {
                            dropdown_item = $(selected_dropdown_item).prev();
                        }

                        if(dropdown_item.length) {
                            select_dropdown_item(dropdown_item);
                        }
                        return false;
                    }
                    break;

                case KEY.BACKSPACE:
                    previous_token = input_token.prev();

                    if(!$(this).val().length) {
                        if(selected_token) {
                            delete_token($(selected_token));
                            hidden_input.change();
                        } else if(previous_token.length) {
                            select_token($(previous_token.get(0)));
                        }

                        return false;
                    } else if($(this).val().length === 1) {
                        hide_dropdown();
                    } else {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;

                case KEY.TAB:
                case KEY.ENTER:
                case KEY.NUMPAD_ENTER:
                case KEY.COMMA:
                  if(selected_dropdown_item) {
                    add_token($(selected_dropdown_item).data("tokeninput"));
                    hidden_input.change();
                    return false;
                  }
                  break;

                case KEY.ESCAPE:
                  hide_dropdown();
                  return true;

                default:
                    if(String.fromCharCode(event.which)) {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;
            }
        });

    // Keep a reference to the original input box
    var hidden_input = $(input)
                           .hide()
                           .val("")
                           .focus(function () {
                               input_box.focus();
                           })
                           .blur(function () {
                               input_box.blur();
                           });

    // Keep a reference to the selected token and dropdown item
    var selected_token = null;
    var selected_token_index = 0;
    var selected_dropdown_item = null;

    // The list to store the token items in
    var token_list = $("<ul />")
        .addClass(settings.classes.tokenList)
        .click(function (event) {
            var li = $(event.target).closest("li");
            if(li && li.get(0) && $.data(li.get(0), "tokeninput")) {
                toggle_select_token(li);
            } else {
                // Deselect selected token
                if(selected_token) {
                    deselect_token($(selected_token), POSITION.END);
                }

                // Focus input box
                input_box.focus();
            }
        })
        .mouseover(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.addClass(settings.classes.highlightedToken);
            }
        })
        .mouseout(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.removeClass(settings.classes.highlightedToken);
            }
        })
        .insertBefore(hidden_input);

    // The token holding the input box
    var input_token = $("<li />")
        .addClass(settings.classes.inputToken)
        .appendTo(token_list)
        .append(input_box);

    // The list to store the dropdown items in
    var dropdown = $("<div>")
        .addClass(settings.classes.dropdown)
        .appendTo("body")
        .hide();

    // Magic element to help us resize the text input
    var input_resizer = $("<tester/>")
        .insertAfter(input_box)
        .css({
            position: "absolute",
            top: -9999,
            left: -9999,
            width: "auto",
            fontSize: input_box.css("fontSize"),
            fontFamily: input_box.css("fontFamily"),
            fontWeight: input_box.css("fontWeight"),
            letterSpacing: input_box.css("letterSpacing"),
            whiteSpace: "nowrap"
        });

    // Pre-populate list if items exist
    hidden_input.val("");
    var li_data = settings.prePopulate || hidden_input.data("pre");
    if(settings.processPrePopulate && $.isFunction(settings.onResult)) {
        li_data = settings.onResult.call(hidden_input, li_data);
    }
    if(li_data && li_data.length) {
        $.each(li_data, function (index, value) {
            insert_token(value);
            checkTokenLimit();
        });
    }

    // Initialization is done
    if($.isFunction(settings.onReady)) {
        settings.onReady.call();
    }

    //
    // Public functions
    //

    this.clear = function() {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                delete_token($(this));
            }
        });
    }

    this.add = function(item) {
        add_token(item);
    }

    this.remove = function(item) {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                var currToken = $(this).data("tokeninput");
                var match = true;
                for (var prop in item) {
                    if (item[prop] !== currToken[prop]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    delete_token($(this));
                }
            }
        });
    }
    
    this.getTokens = function() {
   		return saved_tokens;
   	}

    //
    // Private functions
    //

    function checkTokenLimit() {
        if(settings.tokenLimit !== null && token_count >= settings.tokenLimit) {
            input_box.hide();
            hide_dropdown();
            return;
        }
    }

    function resize_input() {
        if(input_val === (input_val = input_box.val())) {return;}

        // Enter new content into resizer and resize input accordingly
        var escaped = input_val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        input_resizer.html(escaped);
        input_box.width(input_resizer.width() + 30);
    }

    function is_printable_character(keycode) {
        return ((keycode >= 48 && keycode <= 90) ||     // 0-1a-z
                (keycode >= 96 && keycode <= 111) ||    // numpad 0-9 + - / * .
                (keycode >= 186 && keycode <= 192) ||   // ; = , - . / ^
                (keycode >= 219 && keycode <= 222));    // ( \ ) '
    }

    // Inner function to a token to the list
    function insert_token(item) {
        var this_token = settings.tokenFormatter(item);
        this_token = $(this_token)
          .addClass(settings.classes.token)
          .insertBefore(input_token);

        // The 'delete token' button
        $("<span>" + settings.deleteText + "</span>")
            .addClass(settings.classes.tokenDelete)
            .appendTo(this_token)
            .click(function () {
                delete_token($(this).parent());
                hidden_input.change();
                return false;
            });

        // Store data on the token
        var token_data = {"id": item.id};
        token_data[settings.propertyToSearch] = item[settings.propertyToSearch];
        $.data(this_token.get(0), "tokeninput", item);

        // Save this token for duplicate checking
        saved_tokens = saved_tokens.slice(0,selected_token_index).concat([token_data]).concat(saved_tokens.slice(selected_token_index));
        selected_token_index++;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count += 1;

        // Check the token limit
        if(settings.tokenLimit !== null && token_count >= settings.tokenLimit) {
            input_box.hide();
            hide_dropdown();
        }

        return this_token;
    }

    // Add a token to the token list based on user input
    function add_token (item) {
        var callback = settings.onAdd;

        // See if the token already exists and select it if we don't want duplicates
        if(token_count > 0 && settings.preventDuplicates) {
            var found_existing_token = null;
            token_list.children().each(function () {
                var existing_token = $(this);
                var existing_data = $.data(existing_token.get(0), "tokeninput");
                if(existing_data && existing_data.id === item.id) {
                    found_existing_token = existing_token;
                    return false;
                }
            });

            if(found_existing_token) {
                select_token(found_existing_token);
                input_token.insertAfter(found_existing_token);
                input_box.focus();
                return;
            }
        }

        // Insert the new tokens
        if(settings.tokenLimit == null || token_count < settings.tokenLimit) {
            insert_token(item);
            checkTokenLimit();
        }

        // Clear input box
        input_box.val("");

        // Don't show the help dropdown, they've got the idea
        hide_dropdown();

        // Execute the onAdd callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,item);
        }
    }

    // Select a token in the token list
    function select_token (token) {
        token.addClass(settings.classes.selectedToken);
        selected_token = token.get(0);

        // Hide input box
        input_box.val("");

        // Hide dropdown if it is visible (eg if we clicked to select token)
        hide_dropdown();
    }

    // Deselect a token in the token list
    function deselect_token (token, position) {
        token.removeClass(settings.classes.selectedToken);
        selected_token = null;

        if(position === POSITION.BEFORE) {
            input_token.insertBefore(token);
            selected_token_index--;
        } else if(position === POSITION.AFTER) {
            input_token.insertAfter(token);
            selected_token_index++;
        } else {
            input_token.appendTo(token_list);
            selected_token_index = token_count;
        }

        // Show the input box and give it focus again
        input_box.focus();
    }

    // Toggle selection of a token in the token list
    function toggle_select_token(token) {
        var previous_selected_token = selected_token;

        if(selected_token) {
            deselect_token($(selected_token), POSITION.END);
        }

        if(previous_selected_token === token.get(0)) {
            deselect_token(token, POSITION.END);
        } else {
            select_token(token);
        }
    }

    // Delete a token from the token list
    function delete_token (token) {
        // Remove the id from the saved list
        var token_data = $.data(token.get(0), "tokeninput");
        var callback = settings.onDelete;

        var index = token.prevAll().length;
        if(index > selected_token_index) index--;

        // Delete the token
        token.remove();
        selected_token = null;

        // Show the input box and give it focus again
        input_box.focus();

        // Remove this token from the saved list
        saved_tokens = saved_tokens.slice(0,index).concat(saved_tokens.slice(index+1));
        if(index < selected_token_index) selected_token_index--;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count -= 1;

        if(settings.tokenLimit !== null) {
            input_box
                .show()
                .val("")
                .focus();
        }

        // Execute the onDelete callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,token_data);
        }
    }

    // Update the hidden input box value
    function update_hidden_input(saved_tokens, hidden_input) {
        var token_values = $.map(saved_tokens, function (el) {
            return el[settings.tokenValue];
        });
        hidden_input.val(token_values.join(settings.tokenDelimiter));

    }

    // Hide and clear the results dropdown
    function hide_dropdown () {
        dropdown.hide().empty();
        selected_dropdown_item = null;
    }

    function show_dropdown() {
        dropdown
            .css({
                position: "absolute",
                top: $(token_list).offset().top + $(token_list).outerHeight(),
                left: $(token_list).offset().left,
                zindex: 999
            })
            .show();
    }

    function show_dropdown_searching () {
        if(settings.searchingText) {
            dropdown.html("<p>"+settings.searchingText+"</p>");
            show_dropdown();
        }
    }

    function show_dropdown_hint () {
        if(settings.hintText) {
            dropdown.html("<p>"+settings.hintText+"</p>");
            show_dropdown();
        }
    }

    // Highlight the query part of the search term
    function highlight_term(value, term) {
        return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
    }
    
    function find_value_and_highlight_term(template, value, term) {
        return template.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + value + ")(?![^<>]*>)(?![^&;]+;)", "g"), highlight_term(value, term));
    }

    // Populate the results dropdown with some results
    function populate_dropdown (query, results) {
        if(results && results.length) {
            dropdown.empty();
            var dropdown_ul = $("<ul>")
                .appendTo(dropdown)
                .mouseover(function (event) {
                    select_dropdown_item($(event.target).closest("li"));
                })
                .mousedown(function (event) {
                    add_token($(event.target).closest("li").data("tokeninput"));
                    hidden_input.change();
                    return false;
                })
                .hide();

            $.each(results, function(index, value) {
                var this_li = settings.resultsFormatter(value);
                
                this_li = find_value_and_highlight_term(this_li ,value[settings.propertyToSearch], query);            
                
                this_li = $(this_li).appendTo(dropdown_ul);
                
                if(index % 2) {
                    this_li.addClass(settings.classes.dropdownItem);
                } else {
                    this_li.addClass(settings.classes.dropdownItem2);
                }

                if(index === 0) {
                    select_dropdown_item(this_li);
                }

                $.data(this_li.get(0), "tokeninput", value);
            });

            show_dropdown();

            if(settings.animateDropdown) {
                dropdown_ul.slideDown("fast");
            } else {
                dropdown_ul.show();
            }
        } else {
            if(settings.noResultsText) {
                dropdown.html("<p>"+settings.noResultsText+"</p>");
                show_dropdown();
            }
        }
    }

    // Highlight an item in the results dropdown
    function select_dropdown_item (item) {
        if(item) {
            if(selected_dropdown_item) {
                deselect_dropdown_item($(selected_dropdown_item));
            }

            item.addClass(settings.classes.selectedDropdownItem);
            selected_dropdown_item = item.get(0);
        }
    }

    // Remove highlighting from an item in the results dropdown
    function deselect_dropdown_item (item) {
        item.removeClass(settings.classes.selectedDropdownItem);
        selected_dropdown_item = null;
    }

    // Do a search and show the "searching" dropdown if the input is longer
    // than settings.minChars
    function do_search() {
        var query = input_box.val().toLowerCase();

        if(query && query.length) {
            if(selected_token) {
                deselect_token($(selected_token), POSITION.AFTER);
            }

            if(query.length >= settings.minChars) {
                show_dropdown_searching();
                clearTimeout(timeout);

                timeout = setTimeout(function(){
                    run_search(query);
                }, settings.searchDelay);
            } else {
                hide_dropdown();
            }
        }
    }

    // Do the actual search
    function run_search(query) {
        var cache_key = query + computeURL();
        var cached_results = cache.get(cache_key);
        if(cached_results) {
            populate_dropdown(query, cached_results);
        } else {
            // Are we doing an ajax search or local data search?
            if(settings.url) {
                var url = computeURL();
                // Extract exisiting get params
                var ajax_params = {};
                ajax_params.data = {};
                if(url.indexOf("?") > -1) {
                    var parts = url.split("?");
                    ajax_params.url = parts[0];

                    var param_array = parts[1].split("&");
                    $.each(param_array, function (index, value) {
                        var kv = value.split("=");
                        ajax_params.data[kv[0]] = kv[1];
                    });
                } else {
                    ajax_params.url = url;
                }

                // Prepare the request
                ajax_params.data[settings.queryParam] = query;
                ajax_params.type = settings.method;
                ajax_params.dataType = settings.contentType;
                if(settings.crossDomain) {
                    ajax_params.dataType = "jsonp";
                }

                // Attach the success callback
                ajax_params.success = function(results) {
                  if($.isFunction(settings.onResult)) {
                      results = settings.onResult.call(hidden_input, results);
                  }
                  cache.add(cache_key, settings.jsonContainer ? results[settings.jsonContainer] : results);

                  // only populate the dropdown if the results are associated with the active search query
                  if(input_box.val().toLowerCase() === query) {
                      populate_dropdown(query, settings.jsonContainer ? results[settings.jsonContainer] : results);
                  }
                };

                // Make the request
                $.ajax(ajax_params);
            } else if(settings.local_data) {
                // Do the search through local data
                var results = $.grep(settings.local_data, function (row) {
                    return row[settings.propertyToSearch].toLowerCase().indexOf(query.toLowerCase()) > -1;
                });

                if($.isFunction(settings.onResult)) {
                    results = settings.onResult.call(hidden_input, results);
                }
                cache.add(cache_key, results);
                populate_dropdown(query, results);
            }
        }
    }

    // compute the dynamic URL
    function computeURL() {
        var url = settings.url;
        if(typeof settings.url == 'function') {
            url = settings.url.call();
        }
        return url;
    }
};

// Really basic cache for the results
$.TokenList.Cache = function (options) {
    var settings = $.extend({
        max_size: 500
    }, options);

    var data = {};
    var size = 0;

    var flush = function () {
        data = {};
        size = 0;
    };

    this.add = function (query, results) {
        if(size > settings.max_size) {
            flush();
        }

        if(!data[query]) {
            size += 1;
        }

        data[query] = results;
    };

    this.get = function (query) {
        return data[query];
    };
};
}($));
// END tokeniput jquery plugin

// fieldSelection jquery plugin
/*
 * jQuery plugin: fieldSelection - v0.1.0 - last change: 2006-12-16
 * (c) 2006 Alex Brem <alex@0xab.cd> - http://blog.0xab.cd
 */

(function(){var a={getSelection:function(){var b=this.jquery?this[0]:this;return(("selectionStart" in b&&function(){var c=b.selectionEnd-b.selectionStart;return{start:b.selectionStart,end:b.selectionEnd,length:c,text:b.value.substr(b.selectionStart,c)}})||(document.selection&&function(){b.focus();var d=document.selection.createRange();if(d==null){return{start:0,end:b.value.length,length:0}}var c=b.createTextRange();var e=c.duplicate();c.moveToBookmark(d.getBookmark());e.setEndPoint("EndToStart",c);return{start:e.text.length,end:e.text.length+d.text.length,length:d.text.length,text:d.text}})||function(){return{start:0,end:b.value.length,length:0}})()},replaceSelection:function(){var b=this.jquery?this[0]:this;var c=arguments[0]||"";return(("selectionStart" in b&&function(){b.value=b.value.substr(0,b.selectionStart)+c+b.value.substr(b.selectionEnd,b.value.length);return this})||(document.selection&&function(){b.focus();document.selection.createRange().text=c;return this})||function(){b.value+=c;return this})()}};jQuery.each(a,function(b){jQuery.fn[b]=this})})();
 
// END fieldSelection jquery plugin

// guiders jquery plugin
/**
 * guiders.js
 *
 * version 1.1.4
 *
 * Developed at Optimizely. (www.optimizely.com)
 * We make A/B testing you'll actually use.
 *
 * Released under the Apache License 2.0.
 * www.apache.org/licenses/LICENSE-2.0.html
 *
 * Questions about Guiders or Optimizely?
 * Email us at jeff+pickhardt@optimizely.com or hello@optimizely.com.
 *
 * Enjoy!
 */

guiders = (function($){
  var guiders = {
    version: "1.1.3",

    _defaultSettings: {
      attachTo: null,
      buttons: [{name: "Close"}],
      buttonCustomHTML: "",
      classString: null,
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      isHashable: true,
      offset: {
          top: null,
          left: null
      },
      onShow: null,
      overlay: false,
      position: 0, // 1-12 follows an analog clock, 0 means centered
      title: "Sample title goes here",
      width: 400,
      xButton: false // this places a closer "x" button in the top right of the guider
    },

    _htmlSkeleton: [
      "<div class='guider'>",
      "  <div class='guider_content'>",
      "    <h1 class='guider_title'></h1>",
      "    <div class='guider_close'></div>",
      "    <p class='guider_description'></p>",
      "    <div class='guider_buttons'>",
      "    </div>",
      "  </div>",
      "  <div class='guider_arrow'>",
      "  </div>",
      "</div>"
    ].join(""),

    _arrowSize: 42, // = arrow's width and height
    _closeButtonTitle: "Close",
    _currentGuiderID: null,
    _guiders: {},
    _lastCreatedGuiderID: null,
    _nextButtonTitle: "Next",
    _zIndexForHilight: 101,

    _addButtons: function(myGuider) {
      // Add buttons
      var guiderButtonsContainer = myGuider.elem.find(".guider_buttons");

      if (myGuider.buttons === null || myGuider.buttons.length === 0) {
        guiderButtonsContainer.remove();
        return;
      }

      for (var i = myGuider.buttons.length-1; i >= 0; i--) {
        var thisButton = myGuider.buttons[i];
        var thisButtonElem = $("<a></a>", {
                                "class" : "guider_button",
                                "text" : thisButton.name });
        if (typeof thisButton.classString !== "undefined" && thisButton.classString !== null) {
          thisButtonElem.addClass(thisButton.classString);
        }

        guiderButtonsContainer.append(thisButtonElem);

        if (thisButton.onclick) {
          thisButtonElem.bind("click", thisButton.onclick);
        } else if (!thisButton.onclick &&
                   thisButton.name.toLowerCase() === guiders._closeButtonTitle.toLowerCase()) { 
          thisButtonElem.bind("click", function() { guiders.hideAll(); });
        } else if (!thisButton.onclick &&
                   thisButton.name.toLowerCase() === guiders._nextButtonTitle.toLowerCase()) { 
          thisButtonElem.bind("click", function() { guiders.next(); });
        }
      }

      if (myGuider.buttonCustomHTML !== "") {
        var myCustomHTML = $(myGuider.buttonCustomHTML);
        myGuider.elem.find(".guider_buttons").append(myCustomHTML);
      }

			if (myGuider.buttons.length == 0) {
				guiderButtonsContainer.remove();
			}
    },

    _addXButton: function(myGuider) {
        var xButtonContainer = myGuider.elem.find(".guider_close");
        var xButton = $("<div></div>", {
                        "class" : "x_button",
                        "role" : "button" });
        xButtonContainer.append(xButton);
        xButton.click(function() { guiders.hideAll(); });
    },

    _attach: function(myGuider) {
      if (myGuider === null) {
        return;
      }

      var myHeight = myGuider.elem.innerHeight();
      var myWidth = myGuider.elem.innerWidth();

      if (myGuider.position === 0 || myGuider.attachTo === null) {
        myGuider.elem.css("position", "absolute");
        myGuider.elem.css("top", ($(window).height() - myHeight) / 3 + $(window).scrollTop() + "px");
        myGuider.elem.css("left", ($(window).width() - myWidth) / 2 + $(window).scrollLeft() + "px");
        return;
      }

      myGuider.attachTo = $(myGuider.attachTo);
      var base = myGuider.attachTo.offset();
      var attachToHeight = myGuider.attachTo.innerHeight();
      var attachToWidth = myGuider.attachTo.innerWidth();

      var top = base.top;
      var left = base.left;

      var bufferOffset = 0.9 * guiders._arrowSize;

      var offsetMap = { // Follows the form: [height, width]
        1: [-bufferOffset - myHeight, attachToWidth - myWidth],
        2: [0, bufferOffset + attachToWidth],
        3: [attachToHeight/2 - myHeight/2, bufferOffset + attachToWidth],
        4: [attachToHeight - myHeight, bufferOffset + attachToWidth],
        5: [bufferOffset + attachToHeight, attachToWidth - myWidth],
        6: [bufferOffset + attachToHeight, attachToWidth/2 - myWidth/2],
        7: [bufferOffset + attachToHeight, 0],
        8: [attachToHeight - myHeight, -myWidth - bufferOffset],
        9: [attachToHeight/2 - myHeight/2, -myWidth - bufferOffset],
        10: [0, -myWidth - bufferOffset],
        11: [-bufferOffset - myHeight, 0],
        12: [-bufferOffset - myHeight, attachToWidth/2 - myWidth/2]
      };

      offset = offsetMap[myGuider.position];
      top   += offset[0];
      left  += offset[1];

      if (myGuider.offset.top !== null) {
        top += myGuider.offset.top;
      }

      if (myGuider.offset.left !== null) {
        left += myGuider.offset.left;
      }

      myGuider.elem.css({
        "position": "absolute",
        "top": top,
        "left": left
      });
    },

    _guiderById: function(id) {
      if (typeof guiders._guiders[id] === "undefined") {
        throw "Cannot find guider with id " + id;
      }
      return guiders._guiders[id];
    },

    _showOverlay: function() {
      $("#guider_overlay").fadeIn("fast", function(){
        if (this.style.removeAttribute) {
          this.style.removeAttribute("filter");
        }
      });
      // This callback is needed to fix an IE opacity bug.
      // See also:
      // http://www.kevinleary.net/jquery-fadein-fadeout-problems-in-internet-explorer/
    },

    _highlightElement: function(selector) {
      $(selector).css({'z-index': guiders._zIndexForHilight});
    },

    _dehighlightElement: function(selector) {
      $(selector).css({'z-index': 1});
    },

    _hideOverlay: function() {
      $("#guider_overlay").fadeOut("fast");
    },

    _initializeOverlay: function() {
      if ($("#guider_overlay").length === 0) {
        $("<div id=\"guider_overlay\"></div>").hide().appendTo("body");
      }
    },

    _styleArrow: function(myGuider) {
      var position = myGuider.position || 0;
      if (!position) {
        return;
      }
      var myGuiderArrow = $(myGuider.elem.find(".guider_arrow"));
      var newClass = {
        1: "guider_arrow_down",
        2: "guider_arrow_left",
        3: "guider_arrow_left",
        4: "guider_arrow_left",
        5: "guider_arrow_up",
        6: "guider_arrow_up",
        7: "guider_arrow_up",
        8: "guider_arrow_right",
        9: "guider_arrow_right",
        10: "guider_arrow_right",
        11: "guider_arrow_down",
        12: "guider_arrow_down"
      };
      myGuiderArrow.addClass(newClass[position]);

      var myHeight = myGuider.elem.innerHeight();
      var myWidth = myGuider.elem.innerWidth();
      var arrowOffset = guiders._arrowSize / 2;
      var positionMap = {
        1: ["right", arrowOffset],
        2: ["top", arrowOffset],
        3: ["top", myHeight/2 - arrowOffset],
        4: ["bottom", arrowOffset],
        5: ["right", arrowOffset],
        6: ["left", myWidth/2 - arrowOffset],
        7: ["left", arrowOffset],
        8: ["bottom", arrowOffset],
        9: ["top", myHeight/2 - arrowOffset],
        10: ["top", arrowOffset],
        11: ["left", arrowOffset],
        12: ["left", myWidth/2 - arrowOffset]
      };
      var position = positionMap[myGuider.position];
      myGuiderArrow.css(position[0], position[1] + "px");
    },

    /**
     * One way to show a guider to new users is to direct new users to a URL such as
     * http://www.mysite.com/myapp#guider=welcome
     *
     * This can also be used to run guiders on multiple pages, by redirecting from
     * one page to another, with the guider id in the hash tag.
     *
     * Alternatively, if you use a session variable or flash messages after sign up,
     * you can add selectively add JavaScript to the page: "guiders.show('first');"
     */
    _showIfHashed: function(myGuider) {
      var GUIDER_HASH_TAG = "guider=";
      var hashIndex = window.location.hash.indexOf(GUIDER_HASH_TAG);
      if (hashIndex !== -1) {
        var hashGuiderId = window.location.hash.substr(hashIndex + GUIDER_HASH_TAG.length);
        if (myGuider.id.toLowerCase() === hashGuiderId.toLowerCase()) {
          // Success!
          guiders.show(myGuider.id);
        }
      }
    },

    next: function() {
      var currentGuider = guiders._guiders[guiders._currentGuiderID];
      if (typeof currentGuider === "undefined") {
        return;
      }
      var nextGuiderId = currentGuider.next || null;
      if (nextGuiderId !== null && nextGuiderId !== "") {
        var myGuider = guiders._guiderById(nextGuiderId);
        var omitHidingOverlay = myGuider.overlay ? true : false;
        guiders.hideAll(omitHidingOverlay);
        if (currentGuider.highlight) {
            guiders._dehighlightElement(currentGuider.highlight);
        }
        guiders.show(nextGuiderId);
      }
    },

    createGuider: function(passedSettings) {
      if (passedSettings === null || passedSettings === undefined) {
        passedSettings = {};
      }

      // Extend those settings with passedSettings
      myGuider = $.extend({}, guiders._defaultSettings, passedSettings);
      myGuider.id = myGuider.id || String(Math.floor(Math.random() * 1000));

      var guiderElement = $(guiders._htmlSkeleton);
      myGuider.elem = guiderElement;
      if (typeof myGuider.classString !== "undefined" && myGuider.classString !== null) {
        myGuider.elem.addClass(myGuider.classString);
      }
      myGuider.elem.css("width", myGuider.width + "px");

      var guiderTitleContainer = guiderElement.find(".guider_title");
      guiderTitleContainer.html(myGuider.title);

      guiderElement.find(".guider_description").html(myGuider.description);

      guiders._addButtons(myGuider);

      if (myGuider.xButton) {
          guiders._addXButton(myGuider);
      }

      guiderElement.hide();
      guiderElement.appendTo("body");
      guiderElement.attr("id", myGuider.id);

      // Ensure myGuider.attachTo is a jQuery element.
      if (typeof myGuider.attachTo !== "undefined" && myGuider !== null) {
        guiders._attach(myGuider);
        guiders._styleArrow(myGuider);
      }

      guiders._initializeOverlay();

      guiders._guiders[myGuider.id] = myGuider;
      guiders._lastCreatedGuiderID = myGuider.id;

      /**
       * If the URL of the current window is of the form
       * http://www.myurl.com/mypage.html#guider=id
       * then show this guider.
       */
      if (myGuider.isHashable) {
        guiders._showIfHashed(myGuider);
      }

      return guiders;
    },

    hideAll: function(omitHidingOverlay) {
      $(".guider").fadeOut("fast");
      if (typeof omitHidingOverlay !== "undefined" && omitHidingOverlay === true) {
        // do nothing for now
      } else {
        guiders._hideOverlay();
      }
      return guiders;
    },

    show: function(id) {
      if (!id && guiders._lastCreatedGuiderID) {
        id = guiders._lastCreatedGuiderID;
      }

      var myGuider = guiders._guiderById(id);
      if (myGuider.overlay) {
        guiders._showOverlay();
        // if guider is attached to an element, make sure it's visible
        if (myGuider.highlight) {
          guiders._highlightElement(myGuider.highlight);
        }
      }

      guiders._attach(myGuider);

      // You can use an onShow function to take some action before the guider is shown.
      if (myGuider.onShow) {
        myGuider.onShow(myGuider);
      }

      myGuider.elem.fadeIn("fast");

      var windowHeight = $(window).height();
      var scrollHeight = $(window).scrollTop();
      var guiderOffset = myGuider.elem.offset();
      var guiderElemHeight = myGuider.elem.height();

      if (guiderOffset.top - scrollHeight < 0 ||
          guiderOffset.top + guiderElemHeight + 40 > scrollHeight + windowHeight) {
        window.scrollTo(0, Math.max(guiderOffset.top + (guiderElemHeight / 2) - (windowHeight / 2), 0));
      }

      guiders._currentGuiderID = id;
      return guiders;
    }
  };

  return guiders;
}).call(this, jQuery);


// END guiders jquery plugin

// dragsort jquery plugin
// jQuery List DragSort v0.4.3
// License: http://dragsort.codeplex.com/license
(function(b){b.fn.dragsort=function(k){var d=b.extend({},b.fn.dragsort.defaults,k),g=[],a=null,j=null;this.selector&&b("head").append("<style type='text/css'>"+(this.selector.split(",").join(" "+d.dragSelector+",")+" "+d.dragSelector)+" { cursor: pointer; }</style>");this.each(function(k,i){b(i).is("table")&&b(i).children().size()==1&&b(i).children().is("tbody")&&(i=b(i).children().get(0));var m={draggedItem:null,placeHolderItem:null,pos:null,offset:null,offsetLimit:null,scroll:null,container:i,init:function(){b(this.container).attr("data-listIdx", k).mousedown(this.grabItem).find(d.dragSelector).css("cursor","pointer");b(this.container).children(d.itemSelector).each(function(a){b(this).attr("data-itemIdx",a)})},grabItem:function(e){if(!(e.which!=1||b(e.target).is(d.dragSelectorExclude))){for(var c=e.target;!b(c).is("[data-listIdx='"+b(this).attr("data-listIdx")+"'] "+d.dragSelector);){if(c==this)return;c=c.parentNode}a!=null&&a.draggedItem!=null&&a.dropItem();b(e.target).css("cursor","move");a=g[b(this).attr("data-listIdx")];a.draggedItem= b(c).closest(d.itemSelector);var c=parseInt(a.draggedItem.css("marginTop")),f=parseInt(a.draggedItem.css("marginLeft"));a.offset=a.draggedItem.offset();a.offset.top=e.pageY-a.offset.top+(isNaN(c)?0:c)-1;a.offset.left=e.pageX-a.offset.left+(isNaN(f)?0:f)-1;if(!d.dragBetween)c=b(a.container).outerHeight()==0?Math.max(1,Math.round(0.5+b(a.container).children(d.itemSelector).size()*a.draggedItem.outerWidth()/b(a.container).outerWidth()))*a.draggedItem.outerHeight():b(a.container).outerHeight(),a.offsetLimit= b(a.container).offset(),a.offsetLimit.right=a.offsetLimit.left+b(a.container).outerWidth()-a.draggedItem.outerWidth(),a.offsetLimit.bottom=a.offsetLimit.top+c-a.draggedItem.outerHeight();var c=a.draggedItem.height(),f=a.draggedItem.width(),h=a.draggedItem.attr("style");a.draggedItem.attr("data-origStyle",h?h:"");d.itemSelector=="tr"?(a.draggedItem.children().each(function(){b(this).width(b(this).width())}),a.placeHolderItem=a.draggedItem.clone().attr("data-placeHolder",!0),a.draggedItem.after(a.placeHolderItem), a.placeHolderItem.children().each(function(){b(this).css({borderWidth:0,width:b(this).width()+1,height:b(this).height()+1}).html("&nbsp;")})):(a.draggedItem.after(d.placeHolderTemplate),a.placeHolderItem=a.draggedItem.next().css({height:c,width:f}).attr("data-placeHolder",!0));a.draggedItem.css({position:"absolute",opacity:0.8,"z-index":999,height:c,width:f});b(g).each(function(a,b){b.createDropTargets();b.buildPositionTable()});a.scroll={moveX:0,moveY:0,maxX:b(document).width()-b(window).width(), maxY:b(document).height()-b(window).height()};a.scroll.scrollY=window.setInterval(function(){if(d.scrollContainer!=window)b(d.scrollContainer).scrollTop(b(d.scrollContainer).scrollTop()+a.scroll.moveY);else{var c=b(d.scrollContainer).scrollTop();if(a.scroll.moveY>0&&c<a.scroll.maxY||a.scroll.moveY<0&&c>0)b(d.scrollContainer).scrollTop(c+a.scroll.moveY),a.draggedItem.css("top",a.draggedItem.offset().top+a.scroll.moveY+1)}},10);a.scroll.scrollX=window.setInterval(function(){if(d.scrollContainer!=window)b(d.scrollContainer).scrollLeft(b(d.scrollContainer).scrollLeft()+ a.scroll.moveX);else{var c=b(d.scrollContainer).scrollLeft();if(a.scroll.moveX>0&&c<a.scroll.maxX||a.scroll.moveX<0&&c>0)b(d.scrollContainer).scrollLeft(c+a.scroll.moveX),a.draggedItem.css("left",a.draggedItem.offset().left+a.scroll.moveX+1)}},10);a.setPos(e.pageX,e.pageY);b(document).bind("selectstart",a.stopBubble);b(document).bind("mousemove",a.swapItems);b(document).bind("mouseup",a.dropItem);d.scrollContainer!=window&&b(window).bind("DOMMouseScroll mousewheel",a.wheel);return!1}},setPos:function(e, c){var f=c-this.offset.top,h=e-this.offset.left;d.dragBetween||(f=Math.min(this.offsetLimit.bottom,Math.max(f,this.offsetLimit.top)),h=Math.min(this.offsetLimit.right,Math.max(h,this.offsetLimit.left)));this.draggedItem.parents().each(function(){if(b(this).css("position")!="static"&&(!b.browser.mozilla||b(this).css("display")!="table")){var a=b(this).offset();f-=a.top;h-=a.left;return!1}});if(d.scrollContainer==window)c-=b(window).scrollTop(),e-=b(window).scrollLeft(),c=Math.max(0,c-b(window).height()+ 5)+Math.min(0,c-5),e=Math.max(0,e-b(window).width()+5)+Math.min(0,e-5);else var l=b(d.scrollContainer),g=l.offset(),c=Math.max(0,c-l.height()-g.top)+Math.min(0,c-g.top),e=Math.max(0,e-l.width()-g.left)+Math.min(0,e-g.left);a.scroll.moveX=e==0?0:e*d.scrollSpeed/Math.abs(e);a.scroll.moveY=c==0?0:c*d.scrollSpeed/Math.abs(c);this.draggedItem.css({top:f,left:h})},wheel:function(e){if((b.browser.safari||b.browser.mozilla)&&a&&d.scrollContainer!=window){var c=b(d.scrollContainer),f=c.offset();e.pageX>f.left&& e.pageX<f.left+c.width()&&e.pageY>f.top&&e.pageY<f.top+c.height()&&(f=e.detail?e.detail*5:e.wheelDelta/-2,c.scrollTop(c.scrollTop()+f),e.preventDefault())}},buildPositionTable:function(){var a=this.draggedItem==null?null:this.draggedItem.get(0),c=[];b(this.container).children(d.itemSelector).each(function(d,h){if(h!=a){var g=b(h).offset();g.right=g.left+b(h).width();g.bottom=g.top+b(h).height();g.elm=h;c.push(g)}});this.pos=c},dropItem:function(){if(a.draggedItem!=null){b(a.container).find(d.dragSelector).css("cursor", "pointer");a.placeHolderItem.before(a.draggedItem);var e=a.draggedItem.attr("data-origStyle");a.draggedItem.attr("style",e);e==""&&a.draggedItem.removeAttr("style");a.draggedItem.removeAttr("data-origStyle");a.placeHolderItem.remove();b("[data-dropTarget]").remove();window.clearInterval(a.scroll.scrollY);window.clearInterval(a.scroll.scrollX);var c=!1;b(g).each(function(){b(this.container).children(d.itemSelector).each(function(a){parseInt(b(this).attr("data-itemIdx"))!=a&&(c=!0,b(this).attr("data-itemIdx", a))})});c&&d.dragEnd.apply(a.draggedItem);a.draggedItem=null;b(document).unbind("selectstart",a.stopBubble);b(document).unbind("mousemove",a.swapItems);b(document).unbind("mouseup",a.dropItem);d.scrollContainer!=window&&b(window).unbind("DOMMouseScroll mousewheel",a.wheel);return!1}},stopBubble:function(){return!1},swapItems:function(e){if(a.draggedItem==null)return!1;a.setPos(e.pageX,e.pageY);for(var c=a.findPos(e.pageX,e.pageY),f=a,h=0;c==-1&&d.dragBetween&&h<g.length;h++)c=g[h].findPos(e.pageX, e.pageY),f=g[h];if(c==-1||b(f.pos[c].elm).attr("data-placeHolder"))return!1;j==null||j.top>a.draggedItem.offset().top||j.left>a.draggedItem.offset().left?b(f.pos[c].elm).before(a.placeHolderItem):b(f.pos[c].elm).after(a.placeHolderItem);b(g).each(function(a,b){b.createDropTargets();b.buildPositionTable()});j=a.draggedItem.offset();return!1},findPos:function(a,b){for(var d=0;d<this.pos.length;d++)if(this.pos[d].left<a&&this.pos[d].right>a&&this.pos[d].top<b&&this.pos[d].bottom>b)return d;return-1}, createDropTargets:function(){d.dragBetween&&b(g).each(function(){var d=b(this.container).find("[data-placeHolder]"),c=b(this.container).find("[data-dropTarget]");d.size()>0&&c.size()>0?c.remove():d.size()==0&&c.size()==0&&(b(this.container).append(a.placeHolderItem.removeAttr("data-placeHolder").clone().attr("data-dropTarget",!0)),a.placeHolderItem.attr("data-placeHolder",!0))})}};m.init();g.push(m)});return this};b.fn.dragsort.defaults={itemSelector:"li",dragSelector:"li",dragSelectorExclude:"input, textarea, a[href]", dragEnd:function(){},dragBetween:!1,placeHolderTemplate:"<li>&nbsp;</li>",scrollContainer:window,scrollSpeed:5}})(jQuery);



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
			separator.innerHTML = '|';
			RESPrefsLink = document.createElement('a');
			RESPrefsLink.setAttribute('href','javascript:void(0)');
			RESPrefsLink.addEventListener('click', function(e) {
				e.preventDefault();
				alert(RESFail);
			}, true);
			RESPrefsLink.innerHTML = '[RES - ERROR]';
			RESPrefsLink.setAttribute('style','color: red; font-weight: bold;');
			insertAfter(preferencesUL, RESPrefsLink);
			insertAfter(preferencesUL, separator);
		}
	} else {
		// Don't fire the script on the iframe. This annoyingly fires this whole thing twice. Yuck.
		// Also don't fire it on static.reddit or thumbs.reddit, as those are just images.
		if ((typeof(RESRunOnce) != 'undefined') || (location.href.match(/\/toolbar\/toolbar\?id/i)) || (location.href.match(/comscore-iframe/i)) || (location.href.match(/static\.reddit/i)) || (location.href.match(/thumbs\.reddit/i)) || (location.href.match(/blog\.reddit/i))) {
			// do nothing.
			return false;
		}
		RESRunOnce = true;
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
			// first, go through each module and set all of the options so that if a module needs to check another module's options, they're ready...
			// console.log('get options start: ' + Date());
			for (i in modules) {
				thisModuleID = i;
				if (typeof(modules[thisModuleID]) == 'object') {
					RESUtils.getOptions(thisModuleID);
				}
			}
			// console.log('get options end: ' + Date());
			// go through each module and run it
			for (i in modules) {
				thisModuleID = i;
				if (typeof(modules[thisModuleID]) == 'object') {
					  //console.log(thisModuleID + ' start: ' + Date());
					  //perfTest(thisModuleID+' start');
					modules[thisModuleID].go();
					  //perfTest(thisModuleID+' end');
					  //console.log(thisModuleID + ' end: ' + Date());
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
				chrome.extension.sendRequest(thisJSON, function(response) {
					// this is an asynchronous response, we don't really need to do anything here...
				});
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
			chrome.extension.sendRequest(thisJSON, function(response) {
				// this is an asynchronous response, we don't really need to do anything here...
			});
		}
		window.localStorage = RESStorage;
		RESInit();
	} else if (typeof(safari) != 'undefined') {
		RESStorage = response;
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		RESStorage.setItem = function(key, value, fromBG) {
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
				RESStorage[key] = value;
				// because we may want to use jQuery events to call GM_setValue and GM_getValue, we must use this ugly setTimeout hack.
				setTimeout(function() {
					GM_setValue(key, value);
				}, 0);
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
}

if (typeof(opera) != 'undefined') {
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
	(function(u) {
		if (typeof(chrome) != 'undefined') {
			// we've got chrome, get a copy of the background page's localStorage first, so don't init until after.
			var thisJSON = {
				requestType: 'getLocalStorage'
			}
			chrome.extension.sendRequest(thisJSON, function(response) {
				// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
				// old schol localStorage from the foreground page to the background page to keep their settings...
				if (typeof(response.importedFromForeground) == 'undefined') {
					// it doesn't exist.. copy it over...
					var thisJSON = {
						requestType: 'saveLocalStorage',
						data: localStorage
					}
					chrome.extension.sendRequest(thisJSON, function(response) {
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
			RESInit();
			// console.log(GM_listValues());
		}
	})();
}



var lastPerf = 0;
function perfTest(name) {
	var d = new Date();
	var diff = d.getTime() - lastPerf;
	console.log(name+' executed. Diff since last: ' + diff +'ms');
	lastPerf=d.getTime();
}


