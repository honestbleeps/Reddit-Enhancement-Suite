// ==UserScript==
// @name          Reddit Enhancement Suite
// @namespace       http://reddit.honestbleeps.com/
// @description      A suite of tools to enhance reddit...
// @copyright     2010-2011, Steve Sobel (http://redditenhancementsuite.com/)
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html/
// @author        honestbleeps
// @include       http://redditenhancementsuite.com/*
// @include       http://reddit.honestbleeps.com/*
// @include       http://reddit.com/*
// @include       https://reddit.com/*
// @include       http://*.reddit.com/*
// @include       https://*.reddit.com/*
// @version       4.0.2
// @updateURL     http://redditenhancementsuite.com/latest/reddit_enhamcement_suite.meta.js
// @installURL    http://redditenhancementsuite.com/test/reddit_enhancement_suite.user.js
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js
// ==/UserScript==

var RESVersion = "4.0.3";

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

/*global RESStorage:false RESUtils:true */
/*global localStorage:true location:true XMLHttpRequest:true navigator:true */ // Opera work-around work-around
/*global console:true */
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


function createElementWithID(elementType, id, classname) {
    var obj = document.createElement(elementType);
    if (id != null) {
        obj.setAttribute('id', id);
    }
    if ((typeof classname !== 'undefined') && (classname !== '')) {
        obj.setAttribute('class', classname);
    }
    return obj;
}

// sigh.. opera just has to be a pain in the ass... check for navigator object...
if (typeof navigator === 'undefined') navigator = window.navigator;

var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent) ||
            this.searchVersion(navigator.appVersion) ||
            "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)    {
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
        if (index === -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        {     string: navigator.userAgent,
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
        {        // for newer Netscapes (6+)
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
        {         // for older Netscapes (4-)
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
            if (typeof safari != 'undefined') {
                if (data.substring(0,2) === 's{') {
                    data = data.substring(1,data.length);
                }
            }
            return JSON.parse(data);
        } catch (error) {
            if (silent) return {};
            if (localStorageSource) {
                var msg = 'Error caught: JSON parse failure on the following data from "'+localStorageSource+'": <textarea rows="5" cols="50">' + data + '</textarea><br>RES can delete this data to stop errors from happening, but you might want to copy/paste it to a text file so you can more easily re-enter any lost information.';
                RESAlert(msg, function() {
                    // back up a copy of the corrupt data
                    localStorage.setItem(localStorageSource + '.error', data);
                    // delete the corrupt data
                    RESStorage.removeItem(localStorageSource);
                });
            } else {
                RESAlert('Error caught: JSON parse failure on the following data: ' + data);
            }
            return {};
        }
    }
};

// array compare utility function for keyCode arrays
function keyArrayCompare(fromArr, toArr) {
    // if we've passed in a number, fix that and make it an array with alt, shift and ctrl set to false.
    if (typeof toArr === 'number') {
        toArr = [toArr, false, false, false];
    } else if (toArr.length === 4) {
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
    if ((typeof ele === 'undefined') || (ele == null)) {
        if (typeof console != 'undefined') console.log(arguments.callee.caller);
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
if (typeof(self.on) === 'function') {
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
                var thisExpando = modules.styleTweaks.tweetExpando;
                thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
                thisExpando.style.display = 'block';
                break;
            case 'getLocalStorage':
                // TODO: this needs to be done for jetpack
                // Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
                // old schol localStorage from the foreground page to the background page to keep their settings...
                if (typeof(msgEvent.message.importedFromForeground) === 'undefined') {
                    // it doesn't exist.. copy it over...
                    var thisJSON = {
                        requestType: 'saveLocalStorage',
                        data: localStorage
                    };
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
            var thisExpando = modules.styleTweaks.tweetExpando;
            thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
            thisExpando.style.display = 'block';
            break;
        case 'getLocalStorage':
            // Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
            // old schol localStorage from the foreground page to the background page to keep their settings...
            if (typeof(msgEvent.message.importedFromForeground) === 'undefined') {
                // it doesn't exist.. copy it over...
                var thisJSON = {
                    requestType: 'saveLocalStorage',
                    data: localStorage
                };
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
            var thisExpando = modules.styleTweaks.tweetExpando;
            thisExpando.innerHTML = '<form class="usertext"><div class="usertext-body"><div class="md"><div><img style="display: block;" src="'+tweet.user.profile_image_url+'"></div>' + tweet.user.screen_name + ': ' + tweet.text + '</div></div></form>';
            thisExpando.style.display = 'block';
            break;
        case 'getLocalStorage':
            // Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
            // old schol localStorage from the foreground page to the background page to keep their settings...
            if (typeof(eventData.data.importedFromForeground) === 'undefined') {
                // it doesn't exist.. copy it over...
                var thisJSON = {
                    requestType: 'saveLocalStorage',
                    data: localStorage
                };
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
            if ((typeof RESStorage != 'undefined') && (typeof(RESStorage.setItem) === 'function')) {
                RESStorage.setItem(eventData.itemName, eventData.itemValue, true);
            } else {
                // great, opera has screwed some shit up. let's wait until RESStorage is defined, then try again...
                var waitForRESStorage = function (eData) {
                    if ((typeof RESStorage != 'undefined') && (typeof(RESStorage.setItem) === 'function')) {
                        RESStorage.setItem(eData.itemName, eData.itemValue, true);
                    } else {
                        setTimeout(function () {
                            waitForRESStorage(eData);
                        }, 200);
                    }
                };
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
if (typeof chrome != 'undefined') {
    chrome.extension.onRequest.addListener(
        function (request, sender, sendResponse) {
            if (request.requestType === 'localStorage') {
                RESStorage.setItem(request.itemName, request.itemValue, true);
            }
        }
    );
}

if (typeof safari != 'undefined') {
    safari.self.addEventListener("message", safariMessageHandler, false);
}
// we can't do this check for opera here because we need to wait until DOMContentLoaded is triggered, I think.  Putting this in RESinit();

// opera compatibility
if (typeof opera != 'undefined') {
    localStorage = window.localStorage;
    location = window.location;
    XMLHttpRequest = window.XMLHttpRequest;
}

// Firebug stopped showing console.log for some reason. Need to use unsafeWindow if available. Not sure if this was due to a Firebug version update or what.
if (typeof unsafeWindow != 'undefined') {
    if ((typeof(unsafeWindow.console) != 'undefined') && (typeof(self.on) != 'function')) {
        console = unsafeWindow.console;
    } else if (typeof console === 'undefined') {
        console = {
            log: function(str) {
                return false;
            }
        };
    }
}



// GreaseMonkey API compatibility for non-GM browsers (Chrome, Safari, Firefox)
// @copyright      2009, 2010 James Campos
// @modified        2010 Steve Sobel - added some missing gm_* functions
// @license        cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
if ((typeof GM_deleteValue === 'undefined') || (typeof GM_addStyle === 'undefined')) {
    GM_addStyle = function(css) {
        var style = $("<style>").text(css).appendTo("head");
    };

    GM_deleteValue = function(name) {
        localStorage.removeItem(name);
    };

    GM_getValue = function(name, defaultValue) {
        var value = localStorage.getItem(name);
        if (!value)
            return defaultValue;
        var type = value[0];
        value = value.substring(1);
        switch (type) {
            case 'b':
                return value === 'true';
            case 'n':
                return Number(value);
            default:
                return value;
        }
    };

    GM_log = function(message) {
        console.log(message);
    };

    GM_setValue = function(name, value) {
        value = (typeof value)[0] + value;
        localStorage.setItem(name, value);
    };
    
    var _GM_xmlhttpRequest = function (obj) {
        var respond = function (origArgs, responseType) {
            var jqXHR = origArgs[0];
            obj["on" + responseType]({
                readyState: jqXHR.readyState,
                responseHeaders: jqXHR.responseHeaders,
                responseText: jqXHR.responseText,
                status: jqXHR.status,
                statusText: jqXHR.statusText
            });
        };
        $.ajax({
            async: !(obj.synchronous),
            data: obj.data,
            error: function () {
                respond(arguments, "error");
            },
            success: function () {
                respond(arguments, "load");
            },
            headers: obj.headers,
            password: obj.password,
            type: obj.method
        });
    };
    if (typeof chrome != 'undefined') {
        GM_xmlhttpRequest = function(obj) {
            var crossDomain = (obj.url.indexOf(location.hostname) === -1);
            
            if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
                obj.requestType = 'GM_xmlhttpRequest';
                if (typeof(obj.onload) != 'undefined') {
                    chrome.extension.sendRequest(obj, function(response) {
                        obj.onload(response);
                    });
                }
            } else {
                _GM_xmlhttpRequest(obj);
            }
        };
    } else if (typeof opera != 'undefined') {
        GM_xmlhttpRequest = function(obj) {
            obj.requestType = 'GM_xmlhttpRequest';
            // Turns out, Opera works this way too, but I'll forgive them since their extensions are so young and they're awesome people...
            // Really though, we need callbacks like Chrome has!  This is such a hacky way to emulate GM_xmlhttpRequest.

            // oy vey... another problem. When Opera sends xmlhttpRequests from the background page, it loses the cookies etc that it'd have 
            // had from the foreground page... so we need to write a bit of a hack here, and call different functions based on whether or 
            // not the request is cross domain... For same-domain requests, we'll call from the foreground...
            var crossDomain = (obj.url.indexOf(location.hostname) === -1);
            
            if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
                obj.XHRID = xhrQueue.count;
                xhrQueue.onloads[xhrQueue.count] = obj.onload;
                opera.extension.postMessage(JSON.stringify(obj));
                xhrQueue.count++;
            } else {
                _GM_xmlhttpRequest(obj);
            }
        };
    } else if (typeof safari != 'undefined')  {
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
        };
    } else if (typeof(self.on) === 'function') {
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
        };
    }
} else {
    // this hack is to avoid an unsafeWindow error message if a gm_xhr is ever called as a result of a jQuery-induced ajax call.
    // yes, it's ugly, but it's necessary if we're using Greasemonkey together with jQuery this way.
    var oldgmx = GM_xmlhttpRequest;
    GM_xmlhttpRequest = function(params) {
        setTimeout(function() {
            oldgmx(params);
        }, 0);
    };
}


var RESConsoleContainer = '';
var modalOverlay = '';
var RESMenuItems = [];
var RESConsolePanels = [];
var modules = [];

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
        if (typeof excludes != 'undefined') {
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
            $.each(codeOptions, function (index, value) {
                if (typeof(storedOptions[index]) === 'undefined') {
                    newOption = true;
                    storedOptions[index] = value;
                } else {
                    value.value = storedOptions[index].value;
                }
            });
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
        if (optionValue === "") {
            saveOptionValue = '';
        } else if ((isNaN(optionValue)) || (typeof optionValue === 'boolean') || (typeof optionValue === 'object')) {
            saveOptionValue = optionValue;
        } else if (optionValue.indexOf('.')) {
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
    },
    click: function(obj, button) { 
        button = button || 0;
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, button, null);
        obj.dispatchEvent(evt); 
    },
    mousedown: function(obj, button) { 
        button = button || 0;
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('mousedown', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, button, null);
        obj.dispatchEvent(evt);
    },
    loggedInUser: function() {
        if (typeof(this.loggedInUserCached) === 'undefined') {
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
        var lastCheck = (userInfoCache != null) ? parseInt(userInfoCache.lastCheck, 10) || 0 : 0;
        var now = new Date();
        // 300000 = 5 minutes
        if ((now.getTime() - lastCheck) > 300000) {
            if (!RESUtils.loggedInUserInfoRunning) {
                RESUtils.loggedInUserInfoRunning = true;
                GM_xmlhttpRequest({
                    method:    "GET",
                    url:    location.protocol + "//"+ location.hostname+ "/user/" + RESUtils.loggedInUser() + "/about.json",
                    onload:    function(response) {
                        var thisResponse = JSON.parse(response.responseText);
                        var userInfoCache = {
                            lastCheck: now.getTime(),
                            userInfo: thisResponse
                        };
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
        if (typeof(this.pageTypeSaved) === 'undefined') {
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
                pageType = 'comments';
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
        if (typeof(this.curSub) === 'undefined') {
            var match = location.href.match(/https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w\.\+]+).*/i);
            if (match != null) {
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
    },
    currentUserProfile: function() {
        if (typeof(this.curUserProfile) === 'undefined') {
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
        if (typeof(this.headerOffset) === 'undefined') {
            this.headerOffset = 0;
            switch (modules.betteReddit.options.pinHeader.value) {
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
            if ((obj[i]) && (obj[i].value === value)) {
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
        if (obj.getAttribute('isfading') === 'in') {
            return false;
        }
        obj.setAttribute('isfading','out');
        speed = speed || 0.1;
        if (obj.style.opacity === '') obj.style.opacity = '1';
        if (obj.style.opacity <= 0) {
            obj.style.display = 'none';
            obj.setAttribute('isfading',false);
            if (callback) callback();
            return true;
        } else {
            var newOpacity = parseFloat(obj.style.opacity) - speed;
            if (newOpacity < speed) newOpacity = 0;
            obj.style.opacity = newOpacity;
            setTimeout(function() { RESUtils.fadeElementOut(obj, speed, callback); }, 100);
        }
    },
    fadeElementIn: function(obj, speed, finalOpacity) {
        finalOpacity = finalOpacity || 1;
        if (obj.getAttribute('isfading') === 'out') {
            return false;
        }
        obj.setAttribute('isfading','in');
        speed = speed || 0.1;
        if ((obj.style.display === 'none') || (obj.style.display === '')) {
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
            setTimeout(function() { RESUtils.fadeElementIn(obj, speed, finalOpacity); }, 100);
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
        var lastCheck = parseInt(RESStorage.getItem('RESLastUpdateCheck'), 10) || 0;
        // if we haven't checked for an update in 24 hours, check for one now!
        // if (((now.getTime() - lastCheck) > 86400000) || (RESVersion > RESStorage.getItem('RESlatestVersion')) || ((RESStorage.getItem('RESoutdated') === 'true') && (RESVersion === RESStorage.getItem('RESlatestVersion'))) || forceUpdate) {
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
            if (typeof chrome != 'undefined') {
                // we've got chrome, so we need to hit up the background page to do cross domain XHR
                thisJSON = {
                    requestType: 'compareVersion',
                    url: jsonURL
                }
                chrome.extension.sendRequest(thisJSON, function(response) {
                    // send message to background.html to open new tabs...
                    outdated = RESUtils.compareVersion(response, forceUpdate);
                });
            } else if (typeof safari != 'undefined') {
                // we've got safari, so we need to hit up the background page to do cross domain XHR
                thisJSON = {
                    requestType: 'compareVersion',
                    url: jsonURL,
                    forceUpdate: forceUpdate
                }
                safari.self.tab.dispatchMessage("compareVersion", thisJSON);
            } else if (typeof opera != 'undefined') {
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
                    method:    "GET",
                    url:    jsonURL,
                    onload:    function(response) {
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
        return ((typeof(modules.RESPro) != 'undefined') && (modules.RESPro.isEnabled()));
    },
    niceKeyCode: function(charCode) {
        keyComboString = '';
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
        return d.toLocaleDateString();
    },
    niceDateTime: function(d, usformat) {
        d = d || new Date();
        return d.toLocaleString();
    },
    niceDateDiff: function(origdate, newdate) {
        var amonth = origdate.getMonth()+1;
        var aday = origdate.getDate();
        var ayear = origdate.getFullYear();

        if (newdate == null) newdate = new Date();
        var dyear,
            dmonth,
            dday,
            tyear = newdate.getFullYear(),
            tmonth = newdate.getUTCMonth()+1,
            tday = newdate.getUTCDate(),
            y=1,
            mm=1,
            d=1,
            a2=0,
            a1=0,
            f=28;

        if ((tyear/4)-parseInt(tyear/4)==0) {
            f=29;
        }

        m = [31, f, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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
                if (ma>12) {ma = ma-12;}
                if (ma=0) {ma = ma+12;}
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
        
        if (dyear==0) {y=0;}
        if (dmonth==0) {mm=0;}
        if (dday==0) {d=0;}
        if ((y==1) && (mm==1)) {a1=1;}
        if ((y==1) && (d==1)) {a1=1;}
        if ((mm==1) && (d==1)) {a2=1;}
        if (y==1){
            if (dyear === 1) {
                returnString += dyear + " year";
            } else {
                returnString += dyear + " years";
            }
        }
        if ((a1==1) && (a2==0)) { returnString += " and "; }
        if ((a1==1) && (a2==1)) { returnString += ", "; }
        if (mm==1){
            if (dmonth === 1) {
                returnString += dmonth + " month";
            } else {
                returnString += dmonth + " months";
            }
        }
        if (a2==1) { returnString += " and "; }
        if (d==1){
            if (dday === 1) {
                returnString += dday + " day";
            } else {
                returnString += dday + " days";
            }
        }
        if (returnString === '') {
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
                if (typeof(this.thisSubRedditInputListener) === 'undefined') {
                    this.thisSubRedditInputListener = true;
                    thisSubRedditInput.addEventListener('change', function(e) {
                        RESUtils.checkIfSubmitting();
                    }, false);
                }
                if (thisSubReddit.toLowerCase() === 'enhancement') {
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
                    $(textDesc).after(this.submittingToEnhancement);
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
                                if (typeof(self.on) === 'function') {
                                    thisBrowser = 'Firefox';
                                } else if (typeof chrome != 'undefined') {
                                    thisBrowser = 'Chrome';
                                } else if (typeof safari != 'undefined') {
                                    thisBrowser = 'Safari';
                                } else if (typeof opera != 'undefined') {
                                    thisBrowser = 'Opera';
                                } else {
                                    thisBrowser = 'Unknown';
                                }
                                var txt = "- RES Version: " + RESVersion + "\n";
                                // turns out this is pretty useless info, commenting it out.
                                // txt += "- Browser: " + navigator.appCodeName + " " + navigator.appName + "\n";
                                // txt += "- Browser: " + thisBrowser + "\n";
                                txt += "- Browser: " + BrowserDetect.browser + "\n";
                                if (typeof navigator === 'undefined') navigator = window.navigator;
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
                    if (title.value === 'Submitting a bug? Please read the box above...') {
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
        if (typeof chrome != 'undefined') {
            thisJSON = {
                requestType: 'openLinkInNewTab',
                linkURL: url,
                button: focus
            };
            chrome.extension.sendRequest(thisJSON, function(response) {
                // send message to background.html to open new tabs...
                return true;
            });
        } else if (typeof safari != 'undefined') {
            thisJSON = {
                requestType: 'openLinkInNewTab',
                linkURL: url,
                button: focus
            };
            safari.self.tab.dispatchMessage("openLinkInNewTab", thisJSON);
        } else if (typeof opera != 'undefined') {
            thisJSON = {
                requestType: 'openLinkInNewTab',
                linkURL: url,
                button: focus
            };
            opera.extension.postMessage(JSON.stringify(thisJSON));
        } else if (typeof(self.on) === 'function') {
            thisJSON = {
                requestType: 'openLinkInNewTab',
                linkURL: url,
                button: focus
            };
            self.postMessage(thisJSON);
        } else {
            window.open(url);
        }
    },
    notification: function(contentObj, delay) {
        var content;
        if (typeof(contentObj.message) === 'undefined') {
            if (typeof contentObj === 'string') {
                content = contentObj;
            } else {
                return false;
            }
        } else {
            content = contentObj.message;
        }
        var header = (typeof(contentObj.header) === 'undefined') ? 'Notification:' : contentObj.header;
        if (typeof(this.notificationCount) === 'undefined') {
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
            if (notifications[i].style.opacity === '0') {
                notifications[i].parentNode.removeChild(notifications[i]);
                destroyed++;
            }
        }
        if (destroyed === notifications.length) {
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
};
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
            'margin-bottom: 15px;    ' +
            '}';

        GM_addStyle(alertCSS);
        
        gdAlert.populateContainer(callback);

    },
    
    populateContainer: function(callback) {
        gdAlert.container = createElementWithID('div','alert_message');
        gdAlert.container.appendChild(document.createElement('span'));
        if (typeof callback === 'function') {
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
            closeButton = document.createElement('input');
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
    
        if (self.innerHeight) {    // all except Explorer
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
};

//overwrite the alert function
function RESAlert(text, callback) {
    if (gdAlert.container === false) {
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
    if (typeof(self.on) === 'function') {
        if ((localStorage.getItem('RES.lsTest') === 'test') && (localStorage.getItem('copyComplete') != 'true')) {
            RESUtils.notification('<h2>Important Alert for Greasemonkey Users!</h2>Hey! It looks like you have upgraded to RES 4.0, but used to use the Greasemonkey version of RES. You\'re going to see double until you uninstall the Greasemonkey script. However, you should first copy your settings by clicking the blue button. <b>After installing, refresh this page!</b> <a target="_blank" class="RESNotificationButtonBlue" href="http://redditenhancementsuite.com/gmutil/reddit_enhancement_suite.user.js">GM->FF Import Tool</a>', 15000);
            localStorage.removeItem('RES.lsTest');
            document.body.addEventListener('DOMNodeInserted', function(event) {
                if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('copyToSimpleStorage') != -1)) {
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
    $.each(localStorage, RESStorage.setItem);
    localStorage.setItem('copyComplete','true');
    localStorage.removeItem('RES.lsTest');
    RESUtils.notification('Data transfer complete. You may now uninstall the Greasemonkey script.');
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
            var RESPrefsLink = $("<span id='openRESPrefs'><span id='RESSettingsButton' title='RES Settings'></span>")
                                .mouseenter(RESConsole.showPrefsDropdown);
            $(this.userMenu).find("ul").after(RESPrefsLink).after("<span class='separator'>|</span>");
            this.RESPrefsLink = RESPrefsLink[0];
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
        var thisTop = parseInt($(RESConsole.userMenu).offset().top, 10);
        var thisRight = parseInt($(window).width() - $(RESConsole.RESPrefsLink).offset().left, 10);
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
        var storedPrefs = {};
        if (RESStorage.getItem('RES.modulePrefs') != null) {
            storedPrefs = safeJSON.parse(RESStorage.getItem('RES.modulePrefs'), 'RES.modulePrefs');
        } else if (RESStorage.getItem('modulePrefs') != null) {
            // Clean up old moduleprefs.
            storedPrefs = safeJSON.parse(RESStorage.getItem('modulePrefs'), 'modulePrefs');
            RESStorage.removeItem('modulePrefs');
            this.setModulePrefs(storedPrefs);
        } else {
            // looks like this is the first time RES has been run - set prefs to defaults...
            storedPrefs = this.resetModulePrefs();
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
        if ((typeof prefs != 'undefined') && (prefs != 'undefined') && (prefs)) {
            this.getAllModulePrefsCached = prefs;
            return prefs;
        } 
    },
    getModulePrefs: function(moduleID) {
        if (moduleID) {
            var prefs = this.getAllModulePrefs();
            return prefs[moduleID];
        } else {
            RESAlert('no module name specified for getModulePrefs');
        }
    },
    setModulePrefs: function(prefs) {
        if (prefs != null) {
            RESStorage.setItem('RES.modulePrefs', JSON.stringify(prefs));
            this.drawModulesPanel();
            return prefs;
        } else {
            RESAlert('error - no prefs specified');
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
            modules.RESTips.randomTip();
        }, true);
        RESConsoleTopBar.appendChild(RESHelp);
        */
        /*
        if (RESStorage.getItem('RESoutdated') === 'true') {
            var RESOutdated = document.createElement('div');
            RESOutdated.setAttribute('class','outdated');
            RESOutdated.innerHTML = 'There is a new version of RES! <a target="_blank" href="http://redditenhancementsuite.com/download">click to grab it</a>';
            RESConsoleTopBar.appendChild(RESOutdated); 
        }
        */
        this.categories = [];
        for (i in modules) {
            if ((typeof(modules[i].category) != 'undefined') && (this.categories.indexOf(modules[i].category) === -1)) {
                this.categories.push(modules[i].category);
            }
        }
        this.categories.sort();
        // create the menu
        // var menuItems = this.categories.concat(['RES Pro','About RES'));
        var menuItems = this.categories.concat(['About RES']);
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

        var moduleList = [];
        for (i in modules) {
            if (modules[i].category === category) moduleList.push(i);
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
            if (i === 0) var firstModuleButton = thisModuleButton;
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
                if (typeof existingOptions === 'undefined') existingOptions = '';
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
                        onResult: (typeof(optionObject.onResult) === 'function') ? optionObject.onResult : null,
                        prePopulate: prepop,
                        hintText: (typeof(optionObject.hintText) === 'string') ? optionObject.hintText : null
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
                if (typeof(optionObject.values) === 'undefined') {
                    RESAlert('misconfigured enum option in module: ' + moduleID);
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
                        var nullEqualsEmpty = ((optionObject.value == null) && (optionObject.values[j].value === ''));
                        // we also need to check for null === '' - which are technically equal.
                        if ((optionObject.value === optionObject.values[j].value) || nullEqualsEmpty)  {
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
            (moduleButtons[i].getAttribute('moduleID') === moduleID) ? addClass(moduleButtons[i],'active') : removeClass(moduleButtons[i],'active');
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
                if (thisOptions[i].type === 'table') {
                    addClass(thisOptionDescription,'table');
                    // table - has a list of fields (headers of table), users can add/remove rows...
                    if (typeof(thisOptions[i].fields) === 'undefined') {
                        RESAlert('misconfigured table option in module: ' + moduleID + ' - options of type "table" must have fields defined');
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
                    if ((thisOptions[i].type === 'text') || (thisOptions[i].type === 'password') || (thisOptions[i].type === 'keycode')) addClass(thisOptionDescription,'textInput');
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
                $(keyCodeInputs[i]).after(thisKeyCodeDisplay);
            }
        }
        if (optCount === 0) {
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
            var notTokenPrefix = (inputs[i].getAttribute('id') != null) && (inputs[i].getAttribute('id').indexOf('token-input-') === -1);
            if ((notTokenPrefix) && (inputs[i].getAttribute('type') != 'button') && (inputs[i].getAttribute('displayonly') != 'true') && (inputs[i].getAttribute('tableOption') != 'true')) {
                // get the option name out of the input field id - unless it's a radio button...
                if (inputs[i].getAttribute('type') === 'radio') {
                    var optionName = inputs[i].getAttribute('name');
                } else {
                    var optionName = inputs[i].getAttribute('id');
                }
                // get the module name out of the input's moduleid attribute
                var moduleID = RESConsole.currentModule;
                if (inputs[i].getAttribute('type') === 'checkbox') {
                    (inputs[i].checked) ? optionValue = true : optionValue = false;
                } else if (inputs[i].getAttribute('type') === 'radio') {
                    if (inputs[i].checked) {
                        var optionValue = inputs[i].value;
                    }
                } else {
                    // check if it's a keycode, in which case we need to parse it into an array...
                    if ((inputs[i].getAttribute('class')) && (inputs[i].getAttribute('class').indexOf('keycode') >= 0)) {
                        var tempArray = inputs[i].value.split(',');
                        // convert the internal values of this array into their respective types (int, bool, bool, bool)
                        var optionValue = [parseInt(tempArray[0], 10), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true'), (tempArray[4] === 'true')];
                    } else {
                        var optionValue = inputs[i].value;
                    }
                }
                if (typeof optionValue != 'undefined') {
                    RESUtils.setOption(moduleID, optionName, optionValue);
                }
            }
        }
        // Check if there are any tables of options on this panel...
        var optionsTables = panelOptionsDiv.querySelectorAll('.optionsTable');
        if (typeof optionsTables != 'undefined') {
            // For each table, we need to go through each row in the tbody, and then go through each option and make a multidimensional array.
            // For example, something like: [['foo','bar','baz'],['pants','warez','cats']]
            for (i=0, len=optionsTables.length;i<len;i++) {
                var moduleID = optionsTables[i].getAttribute('moduleID');
                var optionName = optionsTables[i].getAttribute('optionName');
                var thisTBODY = optionsTables[i].querySelector('tbody');
                var thisRows = thisTBODY.querySelectorAll('tr');
                // check if there are any rows...
                if (typeof thisRows != 'undefined') {
                    // go through each row, and get all of the inputs...
                    var optionMulti = [];
                    var optionRowCount = 0;
                    for (var j=0;j<thisRows.length;j++) {
                        var optionRow = [];
                        var cells = thisRows[j].querySelectorAll('td');
                        var notAllBlank = false;
                        for (var k=0; k<cells.length; k++) {
                            var inputs = cells[k].querySelectorAll('input[tableOption=true]');
                            var optionValue = null;
                            for (var l=0;l<inputs.length;l++) {
                                // get the module name out of the input's moduleid attribute
                                var moduleID = inputs[l].getAttribute('moduleID');
                                if (inputs[l].getAttribute('type') === 'checkbox') {
                                    (inputs[l].checked) ? optionValue = true : optionValue = false;
                                } else if (inputs[l].getAttribute('type') === 'radio') {
                                    if (inputs[l].checked) {
                                        optionValue = inputs[l].value;
                                    }
                                } else {
                                    // check if it's a keycode, in which case we need to parse it into an array...
                                    if ((inputs[l].getAttribute('class')) && (inputs[l].getAttribute('class').indexOf('keycode') >= 0)) {
                                        var tempArray = inputs[l].value.split(',');
                                        // convert the internal values of this array into their respective types (int, bool, bool, bool)
                                        optionValue = [parseInt(tempArray[0]), (tempArray[1] === 'true'), (tempArray[2] === 'true'), (tempArray[3] === 'true')];
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
                    if (typeof optionValue != 'undefined') {
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
        if (moduleID === 'RESPro') RESStorage.removeItem('RESmodules.RESPro.lastAuthFailed');
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
        <div id="AboutRESTeamImage"><img src="data:image/gif;base64,R0lGODlhpgEeAfcAAP39/QICAvz8/AMDAwQEBPv7+wUFBaCgoPr6+gYGBgcHBwgICKGhoQkJCfn5+Z+fnwoKCgsLC/j4+KKiogwMDHd3d3Z2dldXVw0NDRcXF/Hx8Q4ODg8PD/f393V1dfPz8xAQEPb29np6eoGBgYCAgG1tbRERERkZGX5+fvDw8G9vbxISEhgYGBMTE3l5eYiIiCMjIxQUFHh4eBUVFR8fH3FxcSAgINnZ2X19fXJychsbG39/f+/v7xwcHPX19XR0dPLy8vT09ODg4Obm5oWFhYuLi3Nzc1ZWVuXl5SQkJNvb27y8vIyMjKSkpOvr60REROjo6IqKim5ubmpqaunp6XBwcIKCgpWVlb29vSoqKuzs7OPj43t7e3x8fCIiIh4eHqOjo8DAwGtra9XV1erq6iUlJWxsbGlpad7e3u7u7tzc3N3d3Y+PjxYWFt/f39PT06enpz09PSYmJhoaGpaWlkdHR5CQkL+/v+fn51lZWUxMTC8vL5eXl7Ozsy0tLR0dHaurqzg4OMzMzKioqISEhJycnO3t7be3t9ra2mdnZ9LS0pmZmWNjYyEhIcnJyYODg+Hh4VRUVFtbW4mJidfX1zQ0NEZGRpGRkcjIyNDQ0NbW1o2NjUhISIaGhuLi4sHBwVhYWGBgYLW1tZKSkmZmZkFBQZqamsLCwj8/P8TExLu7u2hoaNjY2F5eXmRkZEpKSk9PT+Tk5I6OjjMzM1BQUCsrK1VVVampqaysrMvLyz4+PktLSycnJ6qqqsrKytHR0UBAQCgoKDk5Oc7OzlxcXDs7O0VFRTc3N8fHx5ubm7a2tr6+vsbGxjIyMrGxsZOTky4uLq6urpiYmDU1NUlJSSwsLCkpKTw8PJ2dna2trcPDw56enjo6OlNTU11dXbS0tM3NzVJSUrCwsE5OTjExMUNDQ4eHh5SUlGVlZa+vr9TU1Li4uKampmJiYrq6umFhYV9fX6WlpTY2NsXFxU1NTVpaWrKysrm5uTAwMEJCQlFRUc/PzwEBAf7+/v///wAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTYzODYzODcwNUQ1MTFFMTkwRjBCRjFBNkM5Q0YyNjMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTYzODYzODgwNUQ1MTFFMTkwRjBCRjFBNkM5Q0YyNjMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5NjM4NjM4NTA1RDUxMUUxOTBGMEJGMUE2QzlDRjI2MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5NjM4NjM4NjA1RDUxMUUxOTBGMEJGMUE2QzlDRjI2MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8e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"></div> \
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
            modules.RESPro.configure();
        }, false);
        RESConsoleProPanel.appendChild(this.proSetupButton);
        /*
        this.proAuthButton = createElementWithID('div','RESProAuth');
        this.proAuthButton.setAttribute('class','RESButton');
        this.proAuthButton.innerHTML = 'Authenticate';
        this.proAuthButton.addEventListener('click', function(e) {
            e.preventDefault();
            modules.RESPro.authenticate();
        }, false);
        RESConsoleProPanel.appendChild(this.proAuthButton);
        */
        this.proSaveButton = createElementWithID('div','RESProSave');
        this.proSaveButton.setAttribute('class','RESButton');
        this.proSaveButton.innerHTML = 'Save Module Options';
        this.proSaveButton.addEventListener('click', function(e) {
            e.preventDefault();
            // modules.RESPro.savePrefs();
            modules.RESPro.authenticate(modules.RESPro.savePrefs());
        }, false);
        RESConsoleProPanel.appendChild(this.proSaveButton);

        /*
        this.proUserTaggerSaveButton = createElementWithID('div','RESProSave');
        this.proUserTaggerSaveButton.setAttribute('class','RESButton');
        this.proUserTaggerSaveButton.innerHTML = 'Save user tags to Server';
        this.proUserTaggerSaveButton.addEventListener('click', function(e) {
            e.preventDefault();
            modules.RESPro.saveModuleData('userTagger');
        }, false);
        RESConsoleProPanel.appendChild(this.proUserTaggerSaveButton);
        */

        this.proSaveCommentsSaveButton = createElementWithID('div','RESProSaveCommentsSave');
        this.proSaveCommentsSaveButton.setAttribute('class','RESButton');
        this.proSaveCommentsSaveButton.innerHTML = 'Save saved comments to Server';
        this.proSaveCommentsSaveButton.addEventListener('click', function(e) {
            e.preventDefault();
            // modules.RESPro.saveModuleData('saveComments');
            modules.RESPro.authenticate(modules.RESPro.saveModuleData('saveComments'));
        }, false);
        RESConsoleProPanel.appendChild(this.proSaveCommentsSaveButton);
        
        this.proSubredditManagerSaveButton = createElementWithID('div','RESProSubredditManagerSave');
        this.proSubredditManagerSaveButton.setAttribute('class','RESButton');
        this.proSubredditManagerSaveButton.innerHTML = 'Save subreddits to server';
        this.proSubredditManagerSaveButton.addEventListener('click', function(e) {
            e.preventDefault();
            // modules.RESPro.saveModuleData('SubredditManager');
            modules.RESPro.authenticate(modules.RESPro.saveModuleData('subredditManager'));
        }, false);
        RESConsoleProPanel.appendChild(this.proSubredditManagerSaveButton);
        
        this.proSaveCommentsGetButton = createElementWithID('div','RESProGetSavedComments');
        this.proSaveCommentsGetButton.setAttribute('class','RESButton');
        this.proSaveCommentsGetButton.innerHTML = 'Get saved comments from Server';
        this.proSaveCommentsGetButton.addEventListener('click', function(e) {
            e.preventDefault();
            // modules.RESPro.getModuleData('saveComments');
            modules.RESPro.authenticate(modules.RESPro.getModuleData('saveComments'));
        }, false);
        RESConsoleProPanel.appendChild(this.proSaveCommentsGetButton);

        this.proSubredditManagerGetButton = createElementWithID('div','RESProGetSubredditManager');
        this.proSubredditManagerGetButton.setAttribute('class','RESButton');
        this.proSubredditManagerGetButton.innerHTML = 'Get subreddits from Server';
        this.proSubredditManagerGetButton.addEventListener('click', function(e) {
            e.preventDefault();
            // modules.RESPro.getModuleData('SubredditManager');
            modules.RESPro.authenticate(modules.RESPro.getModuleData('subredditManager'));
        }, false);
        RESConsoleProPanel.appendChild(this.proSubredditManagerGetButton);
        
        this.proGetButton = createElementWithID('div','RESProGet');
        this.proGetButton.setAttribute('class','RESButton');
        this.proGetButton.innerHTML = 'Get options from Server';
        this.proGetButton.addEventListener('click', function(e) {
            e.preventDefault();
            // modules.RESPro.getPrefs();
            modules.RESPro.authenticate(modules.RESPro.getPrefs());
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
        if ((typeof adFrame != 'undefined') && (adFrame != null)) {
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
        if ((typeof adFrame != 'undefined') && (adFrame != null)) {
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
            if (i === 'length') break;
            removeClass(RESMenuItems[i], 'active');
        }
        // make selected menu item look selected
        addClass(obj, 'active');
        // hide all console panels
        for (i in RESConsolePanels) {
            // bug in chrome, barfs on for i in loops with queryselectorall...
            if (i === 'length') break;
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

modules.myModule = {
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
    include: [
        /http:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i,
        /http:\/\/([a-z]+).reddit.com\/message\/comments\/[-\w\.]+/i
    ],
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


modules.subRedditTagger = {
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
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[\?]*/i
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
            this.checkForOldSettings();
            this.SRTDoesntContain = [];
            this.SRTTagWith = [];
            this.loadSRTRules();
            
            document.body.addEventListener('DOMNodeInserted', function(event) {
                if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
                    modules.subRedditTagger.scanTitles(event.target);
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
            if (i === 'length') break;
            thisSubRedditEle = entries[i].querySelector('A.subreddit');
            if ((typeof thisSubRedditEle != 'undefined') && (thisSubRedditEle != null)) {
                thisSubReddit = thisSubRedditEle.innerHTML.toLowerCase();
                if (typeof(this.SRTDoesntContain[thisSubReddit]) != 'undefined') {
                    thisTitle = entries[i].querySelector('a.title');
                    if (!(hasClass(thisTitle, 'srTagged'))) {
                        addClass(thisTitle, 'srTagged');
                        thisString = this.SRTDoesntContain[thisSubReddit];
                        thisTagWith = this.SRTTagWith[thisSubReddit];
                        if (thisTitle.text.indexOf(thisString) === -1) {
                            thisTitle.innerHTML = thisTagWith + ' ' + thisTitle.innerHTML;
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


modules.uppersAndDowners = {
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
    include: [
        /https?:\/\/([a-z]+).reddit.com\/?(?:\??[\w]+=[\w]+&?)*/i,
        /https?:\/\/([a-z]+).reddit.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i,
        /https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i,
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
        /https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get rid of the showTimeStamp options since Reddit now has this feature natively.
            if (typeof(this.options.showTimestamp) != 'undefined') {
                delete this.options.showTimestamp;
                RESStorage.setItem('RESoptions.uppersAndDowners', JSON.stringify(modules.uppersAndDowners.options));
            }
            // added code to force inline-block and opacity: 1 to prevent CSS from hiding .res_* classes...
            var forceVisible = (this.options.forceVisible.value) ? '; opacity: 1 !important; display: inline-block !important;' : '';
            var css = '.res_comment_ups { '+this.options.commentUpvoteStyle.value+forceVisible+' } .res_comment_downs { '+this.options.commentDownvoteStyle.value+forceVisible+' }';
            css += '.res_post_ups { '+this.options.postUpvoteStyle.value+forceVisible+' } .res_post_downs { '+this.options.postDownvoteStyle.value+forceVisible+' }';
            RESUtils.addCSS(css);
            if ((RESUtils.pageType() === 'comments') || (RESUtils.pageType() === 'profile')) {
                this.commentsWithMoos = [];
                this.moreCommentsIDs = [];
                this.applyUppersAndDownersToComments();
                var moreComments = document.querySelectorAll('.morecomments > a');
                for (var i=0, len=moreComments.length; i<len; i++) {
                    moreComments[i].addEventListener('click', this.addParentListener, true);
                }
            } else if ((RESUtils.pageType() === 'linklist') && (this.options.applyToLinks.value)) {
                this.linksWithMoos = [];
                this.applyUppersAndDownersToLinks();
                document.body.addEventListener('DOMNodeInserted', function(event) {
                    if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
                        if (!RESUtils.currentSubreddit('dashboard')) {
                            modules.uppersAndDowners.applyUppersAndDownersToLinks(modules.neverEndingReddit.nextPageURL);
                        } else {
                            modules.uppersAndDowners.applyUppersAndDownersToLinks(event.target.getAttribute('url'));
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
                if (moreCommentsParent.className === 'commentarea') {
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
            moreCommentsParent.addEventListener('DOMNodeInserted', modules.uppersAndDowners.processMoreComments, true);
        } else {
            // There isn't a good way to handle this with a single API call right now, so it'd make a new API call for each
            // hit, and that sucks.  Skipping this for now.
            // document.body.addEventListener('DOMNodeInserted', modules.uppersAndDowners.processMoreCommentsTopLevel, true);
        }
    },
    processMoreCommentsTopLevel: function (event) {
        if (typeof trackCount === 'undefined') {
            trackCount = 0;
        } else {
            if (event.target.tagName === 'DIV') {
                trackCount++;
                if (trackCount < 30) {
                    // console.log(event.target);
                }
            }
        }
    },
    processMoreComments: function (event) {
        if ((event.target.tagName === 'DIV') && (hasClass(event.target, 'thing'))) {
            var getID = /id-([\w])+\_([\w]+)/i;
            var IDMatch = getID.exec(event.currentTarget.getAttribute('class'));
            if (IDMatch) {
                var thisID = IDMatch[2];
                if (typeof(modules.uppersAndDowners.moreCommentsIDs[thisID]) === 'undefined') {
                    modules.uppersAndDowners.moreCommentsIDs[thisID] = true;
                    var thisHREF = location.href + thisID;
                    event.currentTarget.removeEventListener('DOMNodeInserted', this.processMoreComments, true);
                    modules.uppersAndDowners.applyUppersAndDownersToComments(thisHREF);
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
            var todo = Array.prototype.concat.call(items);
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

            var uppersAndDowners = modules.uppersAndDowners;
            chunker(document.getElementsByClassName("tagline"), function (item) {
                if ((item) && (item.nextSibling)) {
                    var votes, openparen, mooups, pipe, moodowns, voteDowns, voteUps, closeparen, frag;
                    if (item.nextSibling.nodeName === "FORM") { //the first item is the title of the post
                        var commentID = item.nextSibling.firstChild.value;
                        if ((voteTable[commentID]) && (typeof(modules.uppersAndDowners.commentsWithMoos[commentID]) === 'undefined')) {
                            modules.uppersAndDowners.commentsWithMoos[commentID] = true;
                            frag = document.createDocumentFragment(); //using a fragment speeds this up by a factor of about 2

                            votes = voteTable[commentID];
                            
                            if (modules.uppersAndDowners.options.showSigns.value) {
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
                    method:    "GET",
                    url:    jsonURL,
                    onload:    onloadJSON
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
            if ((typeof data != 'undefined') && ((typeof(data.data) != 'undefined'))) {
                var linkList = data.data.children;
                var displayType = 'regular';
                if (modules.uppersAndDowners.options.showSigns.value) {
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
                    if (i === 0) {
                        var thisSelector = thisClass + ' p.tagline';
                        var thisTagline = document.body.querySelector(thisSelector);
                        if ((thisTagline) && (thisTagline.innerHTML.indexOf('span class="score likes"') != -1)) {
                            displayType = 'compressed';
                            var thisSelector = thisClass + ' p.tagline span.likes';
                            var thisTagline = document.body.querySelector(thisSelector);
                        } 
                    } else if (displayType === 'regular') {
                        var thisSelector = thisClass + ' p.tagline';
                        var thisTagline = document.body.querySelector(thisSelector);
                    } else {
                        var thisSelector = thisClass + ' p.tagline span.likes';
                        var thisTagline = document.body.querySelector(thisSelector);
                    }
                    // Check if compressed link display or regular...
                    if ((typeof thisTagline != 'undefined') && (thisTagline != null)) {
                        var upsAndDownsEle = $("<span> (<span class='res_post_ups'>"+thisPlus+thisups+"</span>|<span class='res_post_downs'>"+thisMinus+thisdowns+"</span>) </span>");
                        if (displayType === 'regular') {
                            // thisTagline.insertBefore(upsAndDownsEle, thisTagline.firstChild);
                            $(thisTagline).prepend(upsAndDownsEle);
                        } else {
                            $(thisTagline).after(upsAndDownsEle);
                        }
                    }
                }
            }
        };
        // load the JSON
        setTimeout(function() {
            GM_xmlhttpRequest({
                method:    "GET",
                url:    jsonURL,
                onload:    onloadJSONLinks
            });
        }, 200);
        
    }
};
