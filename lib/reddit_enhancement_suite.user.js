/*jshint undef: true, unused: true, strict: false, laxbreak: true, multistr: true, smarttabs: true, sub: true, browser: true */

var RESVersion = "4.3.1.2";

var jQuery, $, guiders, Tinycon, SnuOwnd;

/*
	Reddit Enhancement Suite - a suite of tools to enhance Reddit
	Copyright (C) 2010-2014 - honestbleeps (steve@honestbleeps.com)

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


// DOM utility functions
var escapeLookups = {
	"&": "&amp;",
	'"': "&quot;",
	"<": "&lt;",
	">": "&gt;"
};

function escapeHTML(str) {
	return (typeof str === 'undefined' || str === null) ?
		null :
		str.toString().replace(/[&"<>]/g, function(m) {
			return escapeLookups[m];
		});
}

// this alias is to account for opera having different behavior...
if (typeof navigator === 'undefined') {
	navigator = window.navigator;
}

//Because Safari 5.1 doesn't have Function.bind
if (typeof Function.prototype.bind === 'undefined') {
	Function.prototype.bind = function(context) {
		var oldRef = this;
		return function() {
			return oldRef.apply(context || null, Array.prototype.slice.call(arguments));
		};
	};
}

var safeJSON = {
	// safely parses JSON and won't kill the whole script if JSON.parse fails
	// if localStorageSource is specified, will offer the user the ability to delete that localStorageSource to stop further errors.
	// if silent is specified, it will fail silently...
	parse: function(data, localStorageSource, silent) {
		try {
			if (BrowserDetect.isSafari()) {
				if (data.substring(0, 2) === 's{') {
					data = data.substring(1, data.length);
				}
			}
			return JSON.parse(data);
		} catch (error) {
			if (silent) {
				return {};
			}
			if (localStorageSource) {
				var msg = 'Error caught: JSON parse failure on the following data from "' + localStorageSource + '": <textarea rows="5" cols="50">' + data + '</textarea><br>RES can delete this data to stop errors from happening, but you might want to copy/paste it to a text file so you can more easily re-enter any lost information.';
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
};

var modules = {};
function addModule(moduleID, defineModule) {
	var base = {
		moduleID: moduleID,
		moduleName: moduleID,
		category: 'General',
		options: {},
		description: '',
		isEnabled: function() {
			return RESConsole.getModulePrefs(this.moduleID);
		},
		isMatchURL: function() {
			return RESUtils.isMatchURL(this.moduleID);
		},
		include: [
			/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
		],
		exclude: [],
		beforeLoad: function() { },
		go: function() { }
	};

	var module = defineModule.call(base, base, moduleID) || base;
	modules[moduleID] = module;
}



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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/message\/comments\/[-\w\.]+/i
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

addModule('hover', function (hover, moduleID) {
	$.extend(hover, {
		options: {
			openDelay: {
				type: 'text',
				value: 500
			},
			fadeDelay: {
				type: 'text',
				value: 500
			},
			fadeSpeed: {
				type: 'text',
				value: 0.3
			},
			width:  {
				type: 'text',
				value: 512
			},
			closeOnMouseOut: {
				type: 'boolean',
				value: true
			}
		},
		beforeLoad: function() {
			for (var option in hover.options) {
				if (!hover.options.hasOwnProperty(option)) {
					continue;
				}

				var value = hover.options[option].value;
				var defaultValue = hover.options[option].default;
				if (typeof defaultValue === "number") {
					value = RESUtils.firstValid(parseFloat(value), defaultValue);
				}

				hover.defaults[option] = value;
			}
		},
		defaults: {}, // populated in beforeLoad
		container: null,
		/*
		The contents of state are as follows:
		state: {
			//The DOM element that triggered the hover popup.
			element: null,
			//Resolved values for timing, etc.
			options: null,
			//Usecase specific object
			context: null,
			callback: null,
		}*/
		state: null,
		showTimer: null,
		hideTimer: null,
		begin: function(onElement, conf, callback, context) {
			if (hover.container === null) {
				hover.create();
			}
			if (hover.state !== null) {
				hover.close(false);
			}
			var state = hover.state = {
				element: onElement,
				options: $.extend({}, hover.defaults, conf),
				context: context,
				callback: callback,
			};
			hover.showTimer = setTimeout(function() {
				hover.cancelShowTimer();
				hover.clearShowListeners();
				hover.open();

				$(hover.state.element).on('mouseleave', hover.startHideTimer);
			}, state.options.openDelay);

			$(state.element).on('click', hover.cancelShow);
			$(state.element).on('mouseleave', hover.cancelShow);
		},

		create: function() {
			var $container = $('<div id="RESHoverContainer" class="RESDialogSmall"> \
				<h3 id="RESHoverTitle"></h3> \
				<div class="RESCloseButton">x</div> \
				<div id="RESHoverBody" class="RESDialogContents"> \
				</div>'),
				container = $container[0];

			$container
				.appendTo(document.body)
				.on('mouseenter', function() {
					if (hover.state !== null) {
						hover.cancelHideTimer();
					}
				})
				.on('mouseleave', function() {
					if (hover.state !== null) {
						hover.cancelHideTimer();
						if (hover.state.options.closeOnMouseOut === true) {
							hover.startHideTimer();
						}
					}
				})
				.on('click', '.RESCloseButton', function() {
					hover.close(true);
				});

			hover.container = container;

			var css = '';

			css += '#RESHoverContainer { display: none; position: absolute; z-index: 10001; }';
			css += '#RESHoverContainer:before { content: ""; position: absolute; top: 10px; left: -26px; border-style: solid; border-width: 10px 29px 10px 0; border-color: transparent #c7c7c7; display: block; width: 0; z-index: 1; }';
			css += '#RESHoverContainer:after { content: ""; position: absolute; top: 10px; left: -24px; border-style: solid; border-width: 10px 29px 10px 0; border-color: transparent #f0f3fc; display: block; width: 0; z-index: 1; }';
			css += '#RESHoverContainer.right:before { content: ""; position: absolute; top: 10px; right: -26px; left: auto; border-style: solid; border-width: 10px 0 10px 29px; border-color: transparent #c7c7c7; display: block; width: 0; z-index: 1; }';
			css += '#RESHoverContainer.right:after { content: ""; position: absolute; top: 10px; right: -24px; left: auto; border-style: solid; border-width: 10px 0 10px 29px; border-color: transparent #f0f3fc; display: block; width: 0; z-index: 1; }';

			RESUtils.addCSS(css);
		},
		open: function() {
			var def = $.Deferred();
			def.promise()
				.progress(hover.set)
				.done(hover.set)
				.fail(hover.close);
			hover.state.callback(def, hover.state.element, hover.state.context);
		},
		set: function(header, body) {
			var container = hover.container;
			if (header != null) {
				$('#RESHoverTitle').empty().append(header);
			}
			if (body != null) {
				$('#RESHoverBody').empty().append(body);
			}

			var XY = RESUtils.getXYpos(hover.state.element);

			var width = $(hover.state.element).width();
			var tooltipWidth = $(container).width();
			tooltipWidth = hover.state.options.width;

			RESUtils.fadeElementIn(hover.container, hover.state.options.fadeSpeed);
			if ((window.innerWidth - XY.x - width) <= tooltipWidth) {
				// tooltip would go off right edge - reverse it.
				container.classList.add('right');
				$(container).css({
					top: XY.y - 14,
					left: XY.x - tooltipWidth - 30,
					width: tooltipWidth
				});
			} else {
				container.classList.remove('right');
				$(container).css({
					top: XY.y - 14,
					left: XY.x + width + 25,
					width: tooltipWidth
				});
			}
		},
		cancelShow: function() {
			hover.close(true);
		},
		clearShowListeners: function() {
			if (hover.state === null) {
				return;
			}
			var element = hover.state.element;
			var func = hover.cancelShow;

			$(element).off('click', func).off('mouseleave', func);
		},
		cancelShowTimer: function() {
			if (hover.showTimer === null) {
				return;
			}
			clearTimeout(hover.showTimer);
			hover.showTimer = null;
		},
		startHideTimer: function() {
			if (hover.state !== null) {
				hover.hideTimer = setTimeout(function() {
					hover.cancelHideTimer();
					hover.close(true);
				}, hover.state.options.fadeDelay);
			}
		},
		cancelHideTimer: function() {
			if (hover.state !== null) {
				$(hover.state.element).off('mouseleave', hover.startHideTimer);
			}
			if (hover.hideTimer === null) {
				return;
			}
			clearTimeout(hover.hideTimer);
			hover.hideTimer = null;
		},
		close: function(fade) {
			function afterHide() {
				$('#RESHoverTitle, #RESHoverBody').empty();
				hover.clearShowListeners();
				hover.cancelShowTimer();
				hover.cancelHideTimer();
				hover.state = null;
			}
			if (fade && hover.state !== null) {
				RESUtils.fadeElementOut(hover.container, hover.state.options.fadeSpeed, afterHide);
			} else {
				$(hover.container).hide(afterHide);
			}
		}
	});
});


modules['subRedditTagger'] = {
	moduleID: 'subRedditTagger',
	moduleName: 'Subreddit Tagger',
	category: 'Filters',
	options: {
		subReddits: {
			type: 'table',
			addRowText: '+add tag',
			fields: [{
				name: 'subreddit',
				type: 'text'
			}, {
				name: 'doesntContain',
				type: 'text'
			}, {
				name: 'tag',
				type: 'text'
			}],
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
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.checkForOldSettings();
			this.SRTDoesntContain = [];
			this.SRTTagWith = [];
			this.loadSRTRules();

			RESUtils.watchForElement('siteTable', modules['subRedditTagger'].scanTitles);
			this.scanTitles();

		}
	},
	loadSRTRules: function() {
		var subReddits = this.options.subReddits.value;
		for (var i = 0, len = subReddits.length; i < len; i++) {
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
		for (var i = 0, len = entries.length; i < len; i++) {
			var thisSubRedditEle = entries[i].querySelector('A.subreddit');
			if ((typeof thisSubRedditEle !== 'undefined') && (thisSubRedditEle !== null)) {
				var thisSubReddit = thisSubRedditEle.innerHTML.toLowerCase();
				if (typeof modules['subRedditTagger'].SRTTagWith[thisSubReddit] !== 'undefined') {
					if (thisSubReddit && !modules['subRedditTagger'].SRTDoesntContain[thisSubReddit]) {
						modules['subRedditTagger'].SRTDoesntContain[thisSubReddit] = '[' + thisSubReddit + ']';
					}
					var thisTitle = entries[i].querySelector('a.title');
					if (!thisTitle.classList.contains('srTagged')) {
						thisTitle.classList.add('srTagged');
						var thisString = modules['subRedditTagger'].SRTDoesntContain[thisSubReddit];
						var thisTagWith = modules['subRedditTagger'].SRTTagWith[thisSubReddit];
						if (thisTitle.text.indexOf(thisString) === -1) {
							$(thisTitle).text(escapeHTML(thisTagWith) + ' ' + $(thisTitle).text());
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
			var thisGet = RESStorage.getItem('subreddit_' + subRedditCount).replace(/\"/g, "");
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
	include: [
		'linklist',
		'profile',
		'comments'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// added code to force inline-block and opacity: 1 to prevent CSS from hiding .res_* classes...
			var forceVisible = (this.options.forceVisible.value) ? '; visibility: visible !important; opacity: 1 !important; display: inline-block !important;' : '';
			var css = '.res_comment_ups { ' + this.options.commentUpvoteStyle.value + forceVisible + ' } .res_comment_downs { ' + this.options.commentDownvoteStyle.value + forceVisible + ' }';
			css += '.res_post_ups { ' + this.options.postUpvoteStyle.value + forceVisible + ' } .res_post_downs { ' + this.options.postDownvoteStyle.value + forceVisible + ' }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get rid of the showTimeStamp options since Reddit now has this feature natively.
			if (typeof this.options.showTimestamp !== 'undefined') {
				delete this.options.showTimestamp;
				RESStorage.setItem('RESoptions.uppersAndDowners', JSON.stringify(modules['uppersAndDowners'].options));
			}
			if (RESUtils.pageType() === 'comments') {
				this.commentsWithMoos = [];
				this.moreCommentsIDs = [];
				this.applyUppersAndDownersToComments();
				RESUtils.watchForElement('newComments', modules['uppersAndDowners'].applyUppersAndDownersToComments);
			} else if (RESUtils.pageType() === 'profile') {
				this.commentsWithMoos = [];
				this.moreCommentsIDs = [];
				this.applyUppersAndDownersToMixed();
				RESUtils.watchForElement('siteTable', modules['uppersAndDowners'].applyUppersAndDownersToMixed);

			} else if ((RESUtils.pageType() === 'linklist') && (this.options.applyToLinks.value)) {
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
		if (ele.classList.contains('comment')) {
			modules['uppersAndDowners'].showUppersAndDownersOnComment(ele);
		} else if (ele.classList.contains('entry')) {
			modules['uppersAndDowners'].showUppersAndDownersOnComment(ele.parentNode);
		} else {
			var allComments = ele.querySelectorAll('div.comment');
			RESUtils.forEachChunked(allComments, 15, 1000, function(comment, i, array) {
				modules['uppersAndDowners'].showUppersAndDownersOnComment(comment);
			});
		}
	},
	applyUppersAndDownersToMixed: function(ele) {
		ele = ele || document.body;
		var linkList = ele.querySelectorAll('div.thing.link, div.thing.comment'),
			displayType = 'regular',
			thisPlus, thisMinus;
		if (modules['uppersAndDowners'].options.showSigns.value) {
			thisPlus = '+';
			thisMinus = '-';
		} else {
			thisPlus = '';
			thisMinus = '';
		}
		for (var i = 0, len = linkList.length; i < len; i++) {
			if (linkList[i].classList.contains('link')) {
				var thisups = linkList[i].getAttribute('data-ups');
				var thisdowns = linkList[i].getAttribute('data-downs');

				var thisTagline = linkList[i].querySelector('p.tagline');
				// Check if compressed link display or regular...
				if ((typeof thisTagline !== 'undefined') && (thisTagline !== null)) {
					var upsAndDownsEle = $("<span> (<span class='res_post_ups'>" + thisPlus + thisups + "</span>|<span class='res_post_downs'>" + thisMinus + thisdowns + "</span>) </span>");
					if (displayType === 'regular') {
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
		// if this is not a valid comment (e.g. a load more comments div, which has the same classes for some reason)
		if ((commentEle.getAttribute('data-votesvisible') === 'true') || (commentEle.classList.contains('morechildren')) || (commentEle.classList.contains('morerecursion')) || (commentEle.classList.contains('score-hidden'))) {
			return;
		}
		commentEle.setAttribute('data-votesvisible', 'true');
		var tagline = commentEle.querySelector('p.tagline');
		var ups = commentEle.getAttribute('data-ups');
		var downs = commentEle.getAttribute('data-downs');
		var openparen, closeparen, mooups, moodowns, voteUps, voteDowns, pipe;
		var frag = document.createDocumentFragment(); //using a fragment speeds this up by a factor of about 2


		if (modules['uppersAndDowners'].options.showSigns.value) {
			ups = '+' + ups;
			downs = '-' + downs;
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
		var linkList = ele.querySelectorAll('div.thing.link'),
			displayType = 'regular',
			thisPlus, thisMinus;
		if (modules['uppersAndDowners'].options.showSigns.value) {
			thisPlus = '+';
			thisMinus = '-';
		} else {
			thisPlus = '';
			thisMinus = '';
		}
		for (var i = 0, len = linkList.length; i < len; i++) {
			var thisups = linkList[i].getAttribute('data-ups');
			var thisdowns = linkList[i].getAttribute('data-downs');

			var thisTagline = linkList[i].querySelector('p.tagline');
			// Check if compressed link display or regular...
			if ((typeof thisTagline !== 'undefined') && (thisTagline !== null)) {
				var upsAndDownsEle = $("<span> (<span class='res_post_ups'>" + thisPlus + thisups + "</span>|<span class='res_post_downs'>" + thisMinus + thisdowns + "</span>) </span>");
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

modules['keyboardNav'] = {
	moduleID: 'keyboardNav',
	moduleName: 'Keyboard Navigation',
	category: 'UI',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		focusBGColor: {
			type: 'text',
			value: '#F0F3FC',
			description: 'Background color of focused element'
		},
		focusBorder: {
			type: 'text',
			value: '',
			description: 'border style (e.g. 1px dashed gray) for focused element'
		},
		focusBGColorNight: {
			type: 'text',
			value: 'rgba(66,66,66,0.5)',
			description: 'Background color of focused element in Night Mode'
		},
		focusFGColorNight: {
			type: 'text',
			value: '#DDD',
			description: 'Foreground color of focused element in Night Mode'
		},
		focusBorderNight: {
			type: 'text',
			value: '',
			description: 'border style (e.g. 1px dashed gray) for focused element'
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
			values: [{
				name: 'directional',
				value: 'directional'
			}, {
				name: 'page up/down',
				value: 'page'
			}, {
				name: 'lock to top',
				value: 'top'
			}],
			value: 'directional',
			description: 'When moving up/down with keynav, when and how should RES scroll the window?'
		},
		commentsLinkNumbers: {
			type: 'boolean',
			value: true,
			description: 'Assign number keys (e.g. [1]) to links within selected comment'
		},
		commentsLinkNumberPosition: {
			type: 'enum',
			values: [{
				name: 'Place on right',
				value: 'right'
			}, {
				name: 'Place on left',
				value: 'left'
			}],
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
			value: [191, false, false, true], // ? (note the true in the shift slot)
			description: 'Show help for keyboard shortcuts'
		},
		useGoMode: {
			type: 'boolean',
			value: true,
			description: 'Use go mode (require go mode before "go to" shortcuts are used, e.g. frontpage)'
		},
		goMode: {
			type: 'keycode',
			value: [71, false, false, false], // g
			description: 'Enter "go mode" (next keypress goes to a location, e.g. frontpage)'
		},
		toggleCmdLine: {
			type: 'keycode',
			value: [190, false, false, false], // .
			description: 'Show/hide commandline box'
		},
		hide: {
			type: 'keycode',
			value: [72, false, false, false], // h
			description: 'Hide link'
		},
		moveUp: {
			type: 'keycode',
			value: [75, false, false, false], // k
			description: 'Move up (previous link or comment)'
		},
		moveDown: {
			type: 'keycode',
			value: [74, false, false, false], // j
			description: 'Move down (next link or comment)'
		},
		moveTop: {
			type: 'keycode',
			value: [75, false, false, true], // shift-k
			description: 'Move to top of list (on link pages)'
		},
		moveBottom: {
			type: 'keycode',
			value: [74, false, false, true], // shift-j
			description: 'Move to bottom of list (on link pages)'
		},
		moveUpSibling: {
			type: 'keycode',
			value: [75, false, false, true], // shift-k
			description: 'Move to previous sibling (in comments) - skips to previous sibling at the same depth.'
		},
		moveDownSibling: {
			type: 'keycode',
			value: [74, false, false, true], // shift-j
			description: 'Move to next sibling (in comments) - skips to next sibling at the same depth.'
		},
		moveUpThread: {
			type: 'keycode',
			value: [75, true, false, true], // shift-alt-k
			description: 'Move to the topmost comment of the previous thread (in comments).'
		},
		moveDownThread: {
			type: 'keycode',
			value: [74, true, false, true], // shift-alt-j
			description: 'Move to the topmost comment of the next thread (in comments).'
		},
		moveToTopComment: {
			type: 'keycode',
			value: [84, false, false, false], // t
			description: 'Move to the topmost comment of the current thread (in comments).'
		},
		moveToParent: {
			type: 'keycode',
			value: [80, false, false, false], // p
			description: 'Move to parent (in comments).'
		},
		showParents: {
			type: 'keycode',
			value: [80, false, false, true], // p
			description: 'Display parent comments.'
		},
		followLink: {
			type: 'keycode',
			value: [13, false, false, false], // enter
			description: 'Follow link (hold shift to open it in a new tab) (link pages only)'
		},
		followLinkNewTab: {
			type: 'keycode',
			value: [13, false, false, true], // shift-enter
			description: 'Follow link in new tab (link pages only)'
		},
		followLinkNewTabFocus: {
			type: 'boolean',
			value: true,
			description: 'When following a link in new tab - focus the tab?'
		},
		toggleExpando: {
			type: 'keycode',
			value: [88, false, false, false], // x
			description: 'Toggle expando (image/text/video) (link pages only)'
		},
		imageSizeUp: {
			type: 'keycode',
			value: [187, false, false, false], // =
			description: 'Increase the size of image(s) in the highlighted post area'
		},
		imageSizeDown: {
			type: 'keycode',
			value: [189, false, false, false], // -
			description: 'Increase the size of image(s) in the highlighted post area'
		},
		imageSizeUpFine: {
			type: 'keycode',
			value: [187, false, false, true], // shift-=
			description: 'Increase the size of image(s) in the highlighted post area (finer control)'
		},
		imageSizeDownFine: {
			type: 'keycode',
			value: [189, false, false, true], // shift--
			description: 'Increase the size of image(s) in the highlighted post area (finer control)'
		},
		previousGalleryImage: {
			type: 'keycode',
			value: [219, false, false, false], // [
			description: 'View the previous image of an inline gallery.'
		},
		nextGalleryImage: {
			type: 'keycode',
			value: [221, false, false, false], // ]
			description: 'View the next image of an inline gallery.'
		},
		toggleViewImages: {
			type: 'keycode',
			value: [88, false, false, true], // shift-x
			description: 'Toggle "view images" button'
		},
		toggleChildren: {
			type: 'keycode',
			value: [13, false, false, false], // enter
			description: 'Expand/collapse comments (comments pages only)'
		},
		followComments: {
			type: 'keycode',
			value: [67, false, false, false], // c
			description: 'View comments for link (shift opens them in a new tab)'
		},
		followCommentsNewTab: {
			type: 'keycode',
			value: [67, false, false, true], // shift-c
			description: 'View comments for link in a new tab'
		},
		followLinkAndCommentsNewTab: {
			type: 'keycode',
			value: [76, false, false, false], // l
			description: 'View link and comments in new tabs'
		},
		followLinkAndCommentsNewTabBG: {
			type: 'keycode',
			value: [76, false, false, true], // shift-l
			description: 'View link and comments in new background tabs'
		},
		upVote: {
			type: 'keycode',
			value: [65, false, false, false], // a
			description: 'Upvote selected link or comment'
		},
		downVote: {
			type: 'keycode',
			value: [90, false, false, false], // z
			description: 'Downvote selected link or comment'
		},
		save: {
			type: 'keycode',
			value: [83, false, false, false], // s
			description: 'Save the current link'
		},
		reply: {
			type: 'keycode',
			value: [82, false, false, false], // r
			description: 'Reply to current comment (comment pages only)'
		},
		openBigEditor: {
			type: 'keycode',
			value: [69, false, true, false], // control-e
			description: 'Open the current markdown field in the big editor. (Only when a markdown form is focused)'
		},
		followSubreddit: {
			type: 'keycode',
			value: [82, false, false, false], // r
			description: 'Go to subreddit of selected link (link pages only)'
		},
		followSubredditNewTab: {
			type: 'keycode',
			value: [82, false, false, true], // shift-r
			description: 'Go to subreddit of selected link in a new tab (link pages only)'
		},
		inbox: {
			type: 'keycode',
			value: [73, false, false, false], // i
			description: 'Go to inbox',
			isGoTo: true
		},
		inboxNewTab: {
			type: 'keycode',
			value: [73, false, false, true], // shift+i
			description: 'Go to inbox in a new tab',
			isGoTo: true
		},
		profile: {
			type: 'keycode',
			value: [85, false, false, false], // u
			description: 'Go to profile',
			isGoTo: true
		},
		profileNewTab: {
			type: 'keycode',
			value: [85, false, false, true], // shift+u
			description: 'Go to profile in a new tab',
			isGoTo: true
		},
		frontPage: {
			type: 'keycode',
			value: [70, false, false, false], // f
			description: 'Go to front page',
			isGoTo: true
		},
		subredditFrontPage: {
			type: 'keycode',
			value: [70, false, false, true], // shift-f
			description: 'Go to subreddit front page',
			isGoTo: true
		},
		nextPage: {
			type: 'keycode',
			value: [78, false, false, false], // n
			description: 'Go to next page (link list pages only)',
			isGoTo: true
		},
		prevPage: {
			type: 'keycode',
			value: [80, false, false, false], // p
			description: 'Go to prev page (link list pages only)',
			isGoTo: true
		},
		link1: {
			type: 'keycode',
			value: [49, false, false, false], // 1
			description: 'Open first link within comment.',
			noconfig: true
		},
		link2: {
			type: 'keycode',
			value: [50, false, false, false], // 2
			description: 'Open link #2 within comment.',
			noconfig: true
		},
		link3: {
			type: 'keycode',
			value: [51, false, false, false], // 3
			description: 'Open link #3 within comment.',
			noconfig: true
		},
		link4: {
			type: 'keycode',
			value: [52, false, false, false], // 4
			description: 'Open link #4 within comment.',
			noconfig: true
		},
		link5: {
			type: 'keycode',
			value: [53, false, false, false], // 5
			description: 'Open link #5 within comment.',
			noconfig: true
		},
		link6: {
			type: 'keycode',
			value: [54, false, false, false], // 6
			description: 'Open link #6 within comment.',
			noconfig: true
		},
		link7: {
			type: 'keycode',
			value: [55, false, false, false], // 7
			description: 'Open link #7 within comment.',
			noconfig: true
		},
		link8: {
			type: 'keycode',
			value: [56, false, false, false], // 8
			description: 'Open link #8 within comment.',
			noconfig: true
		},
		link9: {
			type: 'keycode',
			value: [57, false, false, false], // 9
			description: 'Open link #9 within comment.',
			noconfig: true
		},
		link10: {
			type: 'keycode',
			value: [48, false, false, false], // 0
			description: 'Open link #10 within comment.',
			noconfig: true
		}
	},
	description: 'Keyboard navigation for reddit!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var focusFGColorNight, focusBGColor, focusBGColorNight;
			if (typeof this.options.focusBGColor === 'undefined') {
				focusBGColor = '#F0F3FC';
			} else {
				focusBGColor = this.options.focusBGColor.value;
			}
			var borderType = 'outline';
			if (BrowserDetect.isOpera()) {
				borderType = 'border';
			}
			if (typeof this.options.focusBorder === 'undefined') {
				focusBorder = '';
			} else {
				focusBorder = borderType + ': ' + this.options.focusBorder.value + ';';
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
			if (typeof this.options.focusBorderNight === 'undefined') {
				focusBorderNight = '';
			} else {
				focusBorderNight = borderType + ': ' + this.options.focusBorderNight.value + ';';
			}
			// old style: .RES-keyNav-activeElement { '+borderType+': '+focusBorder+'; background-color: '+focusBGColor+'; } \
			// this new pure CSS arrow will not work because to position it we must have .RES-keyNav-activeElement position relative, but that screws up image viewer's absolute positioning to
			// overlay over the sidebar... yikes.
			// .RES-keyNav-activeElement:after { content: ""; float: right; margin-right: -5px; border-color: transparent '+focusBorderColor+' transparent transparent; border-style: solid; border-width: 3px 4px 3px 0; } \

			// why !important on .RES-keyNav-activeElement?  Because some subreddits are unfortunately using !important for no good reason on .entry divs... 
			RESUtils.addCSS(' \
				.entry { padding-right: 5px; } \
				.RES-keyNav-activeElement, .commentarea .RES-keyNav-activeElement .md, .commentarea .RES-keyNav-activeElement.entry .noncollapsed { background-color: ' + focusBGColor + ' !important; } \
				.RES-keyNav-activeElement { ' + focusBorder + ' } \
				.res-nightmode .RES-keyNav-activeElement { ' + focusBorderNight + ' } \
				.res-nightmode .RES-keyNav-activeElement, .res-nightmode .RES-keyNav-activeElement .usertext-body, .res-nightmode .RES-keyNav-activeElement .usertext-body .md, .res-nightmode .RES-keyNav-activeElement .usertext-body .md p, .res-nightmode .commentarea .RES-keyNav-activeElement .noncollapsed, .res-nightmode .RES-keyNav-activeElement .noncollapsed .md, .res-nightmode .RES-keyNav-activeElement .noncollapsed .md p { background-color: ' + focusBGColorNight + ' !important; color: ' + focusFGColorNight + ' !important;} \
				.res-nightmode .RES-keyNav-activeElement a.title:first-of-type {color: ' + focusFGColorNight + ' !important; } \
				#keyHelp { display: none; position: fixed; height: 90%; overflow-y: auto; right: 20px; top: 20px; z-index: 1000; border: 2px solid #aaa; border-radius: 5px; width: 300px; padding: 5px; background-color: #fff; } \
				#keyHelp th { font-weight: bold; padding: 2px; border-bottom: 1px dashed #ddd; } \
				#keyHelp td { padding: 2px; border-bottom: 1px dashed #ddd; } \
				#keyHelp td:first-child { width: 70px; } \
				#keyCommandLineWidget { font-size: 14px; display: none; position: fixed; top: 200px; left: 50%; margin-left: -275px; z-index: 100000110; width: 550px; border: 3px solid #555; border-radius: 10px; padding: 10px; background-color: #333; color: #CCC; opacity: 0.95; } \
				#keyCommandInput { width: 240px; background-color: #999; margin-right: 10px; } \
				#keyCommandInputTip { margin-top: 5px; color: #9F9; } \
				#keyCommandInputTip ul { font-size: 11px; list-style-type: disc; }  \
				#keyCommandInputTip li { margin-left: 15px; }  \
				#keyCommandInputError { margin-top: 5px; color: red; font-weight: bold; } \
				.keyNavAnnotation { font-size: 9px; position: relative; top: -6px; } \
			');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get rid of antequated option we've removed
			this.keyboardNavLastIndexCache = safeJSON.parse(RESStorage.getItem('RESmodules.keyboardNavLastIndex'), false, true);
			var idx, now = Date.now();
			if (!this.keyboardNavLastIndexCache) {
				// this is a one time function to delete old keyboardNavLastIndex junk.
				this.keyboardNavLastIndexCache = {};
				for (idx in RESStorage) {
					if (/keyboardNavLastIndex/.test(idx)) {
						var url = idx.replace('RESmodules.keyboardNavLastIndex.', '');
						this.keyboardNavLastIndexCache[url] = {
							index: RESStorage[idx],
							updated: now
						};
						RESStorage.removeItem(idx);
					}
				}
				this.keyboardNavLastIndexCache.lastScan = now;
				RESStorage.setItem('RESmodules.keyboardNavLastIndex', JSON.stringify(this.keyboardNavLastIndexCache));
			} else {
				// clean cache every 6 hours - delete any urls that haven't been visited in an hour.
				if ((typeof this.keyboardNavLastIndexCache.lastScan === 'undefined') || (now - this.keyboardNavLastIndexCache.lastScan > 21600000)) {
					for (idx in this.keyboardNavLastIndexCache) {
						if ((typeof this.keyboardNavLastIndexCache[idx] === 'object') && (now - this.keyboardNavLastIndexCache[idx].updated > 3600000)) {
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
			if (typeof this.options.scrollTop !== 'undefined') {
				if (this.options.scrollTop.value) {
					this.options.scrollStyle.value = 'top';
				}
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
			if (RESUtils.pageType() === 'comments') {
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
		if (trimLoc.substr(-1) === '/') {
			trimLoc = trimLoc.substr(0, trimLoc.length - 1);
		}
		if (typeof this.keyboardNavLastIndexCache[trimLoc] === 'undefined') {
			this.keyboardNavLastIndexCache[trimLoc] = {};
		}
		var now = Date.now();
		this.keyboardNavLastIndexCache[trimLoc] = {
			index: this.activeIndex,
			updated: now
		};
		RESStorage.setItem('RESmodules.keyboardNavLastIndex', JSON.stringify(this.keyboardNavLastIndexCache));
	},
	handleScroll: function(e) {
		if (modules['keyboardNav'].scrollTimer) {
			clearTimeout(modules['keyboardNav'].scrollTimer);
		}
		modules['keyboardNav'].scrollTimer = setTimeout(modules['keyboardNav'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function() {
		if ((!modules['keyboardNav'].recentKeyPress) && (!RESUtils.elementInViewport(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]))) {
			for (var i = 0, len = modules['keyboardNav'].keyboardLinks.length; i < len; i++) {
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
		this.commandLineWidget = RESUtils.createElementWithID('div', 'keyCommandLineWidget');
		this.commandLineInput = RESUtils.createElementWithID('input', 'keyCommandInput');
		this.commandLineInput.setAttribute('type', 'text');
		this.commandLineInput.addEventListener('blur', function(e) {
			modules['keyboardNav'].toggleCmdLine(false);
		}, false);
		this.commandLineInput.addEventListener('keyup', function(e) {
			if (e.keyCode === 27) {
				// close prompt.
				modules['keyboardNav'].toggleCmdLine(false);
			} else {
				// auto suggest?
				modules['keyboardNav'].cmdLineHelper(e.target.value);
			}
		}, false);
		this.commandLineInputTip = RESUtils.createElementWithID('div', 'keyCommandInputTip');
		this.commandLineInputError = RESUtils.createElementWithID('div', 'keyCommandInputError');

		/*
		this.commandLineSubmit = RESUtils.createElementWithID('input','keyCommandInput');
		this.commandLineSubmit.setAttribute('type','submit');
		this.commandLineSubmit.setAttribute('value','go');
		*/
		this.commandLineForm = RESUtils.createElementWithID('form', 'keyCommandForm');
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
	cmdLineHelper: function(val) {
		var splitWords = val.split(' '),
			command = splitWords[0],
			str, srString;
		splitWords.splice(0, 1);
		val = splitWords.join(' ');
		if (command.slice(0, 2) === 'r/') {
			// get the subreddit name they've typed so far (anything after r/)...
			srString = command.slice(2);
			this.cmdLineShowTip('navigate to subreddit: ' + srString);
		} else if (/\/?u\/\w+\/m\//.test(command)) {
			str = 'navigate to multi-reddit: ';
			str += (command.indexOf('/') > 0 ? '/' : '') + command;
			this.cmdLineShowTip(str);
		} else if (command.slice(0, 2) === 'm/') {
			str = 'navigate to multi-reddit: /me/' + command;
			this.cmdLineShowTip(str);
		} else if (command.slice(0, 2) === 'u/') {
			// get the user name they've typed so far (anything after u/)...
			var userString = command.slice(2);
			this.cmdLineShowTip('navigate to user profile: ' + userString);
		} else if (command.slice(0, 1) === '/') {
			srString = command.slice(1);
			this.cmdLineShowTip('sort by ([n]ew, [t]op, [h]ot, [c]ontroversial): ' + srString);
		} else if (command === 'tag') {
			if ((typeof this.cmdLineTagUsername === 'undefined') || (this.cmdLineTagUsername === '')) {
				var searchArea = modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex];
				var authorLink = searchArea.querySelector('a.author');
				this.cmdLineTagUsername = authorLink.innerHTML;
			}
			str = 'tag user ' + this.cmdLineTagUsername;
			if (val) {
				str += ' as: ' + val;
			}
			this.cmdLineShowTip(str);
		} else if (command === 'user') {
			str = 'go to profile';
			if (val) {
				str += ' for: ' + val;
			}
			this.cmdLineShowTip(str);
		} else if (command === 'sw') {
			this.cmdLineShowTip('Switch users to: ' + val);
		} else if (command === 'm') {
			this.cmdLineShowTip('View messages.');
		} else if (command === 'mm') {
			this.cmdLineShowTip('View moderator mail.');
		} else if (command === 'ls') {
			this.cmdLineShowTip('Toggle lightSwitch.');
		} else if (command === 'nsfw') {
			this.cmdLineShowTip('Toggle nsfw filter on or off');
		} else if (command === 'srstyle') {
			str = 'toggle subreddit style';
			if (val) {
				str += ' for: ' + val;
			} else {
				if (RESUtils.currentSubreddit()) {
					str += ' for: ' + RESUtils.currentSubreddit();
				}
			}
			this.cmdLineShowTip(str);
		} else if (command === 'search') {
			this.cmdLineShowTip('Search RES settings for: ' + val);
		} else if (command === 'XHRCache') {
			this.cmdLineShowTip('clear - clear the cache (use if inline images aren\'t loading properly)');
		} else if (command.slice(0, 1) === '?') {
			str = 'Currently supported commands:';
			str += '<ul>';
			str += '<li>r/[subreddit] - navigates to subreddit</li>';
			str += '<li>/n, /t, /h or /c - goes to new, top, hot or controversial sort of current subreddit</li>';
			str += '<li>[number] - navigates to the link with that number (comments pages) or rank (link pages)</li>';
			str += '<li>tag [text] - tags author of currently selected link/comment as text</li>';
			str += '<li>sw [username] - switch users to [username]</li>';
			str += '<li>user [username] or u/[username] - view profile for [username]</li>';
			str += '<li>u/[username]/m/[multi] - view the multireddit [multi] curated by [username]</li>';
			str += '<li>m/[multi] - view your multireddit [multi]';
			str += '<li>m - go to inbox</li>';
			str += '<li>mm - go to moderator mail</li>';
			str += '<li>ls - toggle lightSwitch</li>';
			str += '<li>nsfw [on|off] - toggle nsfw filter on/off</li>';
			str += '<li>srstyle [subreddit] [on|off] - toggle subreddit style on/off (if no subreddit is specified, uses current subreddit)</li>';
			str += '<li>search [words to search for]- search RES settings</li>';
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
		var open = ((force == null || force) && (this.commandLineWidget.style.display !== 'block'));
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
		modules['styleTweaks'].setSRStyleToggleVisibility(!open, 'cmdline');
	},
	cmdLineSubmit: function(e) {
		e.preventDefault();
		$(modules['keyboardNav'].commandLineInputError).html('');
		var theInput = modules['keyboardNav'].commandLineInput.value;
		// see what kind of input it is:
		if (/^\/?r\//.test(theInput)) {
			// subreddit? (r/subreddit or /r/subreddit)
			theInput = theInput.replace(/^\/?r\//, '');
			location.href = '/r/' + theInput;
		} else if (/^\/?m\//.test(theInput)) {
			theInput = theInput.replace(/^\/?m\//, '');
			location.href = '/me/m/' + theInput;
		} else if (/^\/?u\//.test(theInput)) {
			// subreddit? (r/subreddit or /r/subreddit)
			theInput = theInput.replace(/^\/?u\//, '');
			location.href = '/u/' + theInput;
		} else if (theInput.indexOf('/') === 0) {
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
			validSorts = ['new', 'top', 'hot', 'controversial'];
			if (validSorts.indexOf(theInput) !== -1) {
				if (RESUtils.currentUserProfile()) {
					location.href = '/user/' + RESUtils.currentUserProfile() + '?sort=' + theInput;
				} else if (RESUtils.currentSubreddit()) {
					location.href = '/r/' + RESUtils.currentSubreddit() + '/' + theInput;
				} else {
					location.href = '/' + theInput;
				}
			} else {
				modules['keyboardNav'].cmdLineShowError('invalid sort command - must be [n]ew, [t]op, [h]ot or [c]ontroversial');
				return false;
			}
		} else if (!(isNaN(parseInt(theInput, 10)))) {
			if (RESUtils.pageType() === 'comments') {
				// comment link number? (integer)
				modules['keyboardNav'].commentLink(parseInt(theInput, 10) - 1);
			} else if (RESUtils.pageType() === 'linklist') {
				modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
				modules['keyboardNav'].activeIndex = parseInt(theInput, 10) - 1;
				modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
				modules['keyboardNav'].followLink();
			}
		} else {
			var splitWords = theInput.split(' ');
			var command = splitWords[0];
			splitWords.splice(0, 1);
			var val = splitWords.join(' ');
			switch (command) {
				case 'tag':
					var searchArea = modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex];
					var tagLink = searchArea.querySelector('a.userTagLink');
					if (tagLink) {
						RESUtils.click(tagLink);
						setTimeout(function() {
							if (val !== '') {
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
						for (var i = 0, len = accounts.length; i < len; i++) {
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
							method: "GET",
							url: location.protocol + "//" + location.hostname + "/user/" + val + "/about.json?app=res",
							onload: function(response) {
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
							method: "GET",
							url: location.protocol + "//" + location.hostname + "/user/" + val + "/about.json?app=res",
							onload: function(response) {
								var thisResponse = JSON.parse(response.responseText);
								var css = ', .id-t2_' + thisResponse.data.id + ':before';
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
				case 'nsfw':
					var toggle;
					switch (val && val.toLowerCase()) {
						case 'on':
							toggle = true;
							break;
						case 'off':
							toggle = false;
							break;
					}
					modules['filteReddit'].toggleNsfwFilter(toggle, true);
					break;
				case 'srstyle':
					// toggle subreddit style
					var sr;
					var toggleText;
					splitWords = val.split(' ');
					if (splitWords.length === 2) {
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
					if (toggleText === 'on') {
						toggle = true;
					} else if (toggleText === 'off') {
						toggle = false;
					} else {
						modules['keyboardNav'].cmdLineShowError('You must specify "on" or "off".');
						return false;
					}
					var action = (toggle) ? 'enabled' : 'disabled';
					modules['styleTweaks'].toggleSubredditStyle(toggle, sr);
					modules['notifications'].showNotification({
						header: 'Subreddit Style',
						moduleID: 'styleTweaks',
						message: 'Subreddit style ' + action + ' for subreddit: ' + sr
					}, 4000);
					break;
				case 'notification':
					// test notification
					modules['notifications'].showNotification(val, 4000);
					break;
				case 'search':
					modules['settingsNavigation'].search(val);
					break;
				case 'RESStorage':
					// get or set RESStorage data
					splitWords = val.split(' ');
					if (splitWords.length < 2) {
						modules['keyboardNav'].cmdLineShowError('You must specify "get [key]", "update [key]" or "set [key] [value]"');
					} else {
						var command = splitWords[0],
							key = splitWords[1],
							value;
						if (splitWords.length > 2) {
							splitWords.splice(0, 2);
							value = splitWords.join(' ');
						}
						// console.log(command);
						if (command === 'get') {
							alert('Value of RESStorage[' + key + ']: <br><br><textarea rows="5" cols="50">' + RESStorage.getItem(key) + '</textarea>');
						} else if (command === 'update') {
							var now = Date.now();
							alert('Value of RESStorage[' + key + ']: <br><br><textarea id="RESStorageUpdate' + now + '" rows="5" cols="50">' + RESStorage.getItem(key) + '</textarea>', function() {
								var textArea = document.getElementById('RESStorageUpdate' + now);
								if (textArea) {
									var value = textArea.value;
									RESStorage.setItem(key, value);
								}
							});
						} else if (command === 'remove') {
							RESStorage.removeItem(key);
							alert('RESStorage[' + key + '] deleted');
						} else if (command === 'set') {
							RESStorage.setItem(key, value);
							alert('RESStorage[' + key + '] set to:<br><br><textarea rows="5" cols="50">' + value + '</textarea>');
						} else {
							modules['keyboardNav'].cmdLineShowError('You must specify either "get [key]" or "set [key] [value]"');
						}
					}
					break;
				case 'XHRCache':
					splitWords = val.split(' ');
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
				default:
					modules['keyboardNav'].cmdLineShowError('unknown command - type ? for help');
					return false;
			}
		}
		// hide the commandline tool...
		modules['keyboardNav'].toggleCmdLine(false);
	},
	scanPageForKeyboardLinks: function(isNew) {
		if (typeof isNew === 'undefined') {
			isNew = false;
		}
		// check if we're on a link listing (regular page, subreddit page, etc) or comments listing...
		this.pageType = RESUtils.pageType();
		switch (this.pageType) {
			case 'linklist':
			case 'profile':
				// get all links into an array...
				var siteTable = document.querySelector('#siteTable');
				var stMultiCheck = document.querySelectorAll('#siteTable');
				// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
				if (stMultiCheck.length === 2) {
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
				if (!isNew) {
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
		if ((typeof this.keyboardLinks !== 'undefined') && (this.options.clickFocus.value)) {
			for (var i = 0, len = this.keyboardLinks.length; i < len; i++) {
				$(this.keyboardLinks[i]).parent().data('keyIndex', i)
					.on('click', modules['keyboardNav'].updateKeyFocus);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
		}
	},
	updateKeyFocus: function(event) {
		// we can't stop propagation because it breaks other buttons, so instead
		// we will throttle this to only run once every 100ms. This prevents the
		// issue where clicking a key highlight element also triggers click events
		// on the parents, grandparents, etc due to event bubbling.
		if (!modules['keyboardNav'].updateKeyFocusThrottle) {
			modules['keyboardNav'].updateKeyFocusThrottle = setTimeout(function() {
				delete modules['keyboardNav'].updateKeyFocusThrottle;
			},100);
			modules['keyboardNav'].doUpdateKeyFocus(event);
		}
	},
	doUpdateKeyFocus: function(event) {
		var thisIndex = parseInt($(event.currentTarget).data('keyIndex'), 10);
		if (isNaN(thisIndex)) {
			return;
		}

		if (modules['keyboardNav'].activeIndex !== thisIndex) {
			modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
			modules['keyboardNav'].activeIndex = thisIndex;
			modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
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
		if ((typeof obj !== 'undefined') && (obj.classList.contains('RES-keyNav-activeElement'))) {
			return false;
		} else if (typeof obj !== 'undefined') {
			obj.classList.add('RES-keyNav-activeElement');
			this.activeElement = obj;
			if ((this.pageType === 'linklist') || (this.pageType === 'profile')) {
				this.setKeyIndex();
			}
			if ((this.pageType === 'comments') && (this.options.commentsLinkNumbers.value)) {
				var links = this.getCommentLinks(obj);
				var annotationCount = 0;
				for (var i = 0, len = links.length; i < len; i++) {
					if (!(links[i].classList.contains('madeVisible') ||
						links[i].classList.contains('toggleImage') ||
						links[i].classList.contains('noKeyNav') ||
						RESUtils.isCommentCode(links[i]))) {
						var annotation = document.createElement('span');
						annotationCount++;
						$(annotation).text('[' + annotationCount + '] ');
						annotation.title = 'press ' + annotationCount + ' to open link';
						annotation.classList.add('keyNavAnnotation');
						/*
						if (!(hasClass(links[i],'hasListener'))) {
							addClass(links[i],'hasListener');
							links[i].addEventListener('click', modules['keyboardNav'].handleKeyLink, true);
						}
						*/
						if (modules['keyboardNav'].options.commentsLinkNumberPosition.value === 'right') {
							RESUtils.insertAfter(links[i], annotation);
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
		if (link.classList.contains('toggleImage')) {
			RESUtils.click(link);
			return false;
		}
		var thisURL = link.getAttribute('href'),
			isLocalToPage = (thisURL.indexOf('reddit') !== -1) && (thisURL.indexOf('comments') !== -1) && (thisURL.indexOf('#') !== -1);
		if ((!isLocalToPage) && (button === 1)) {
			var thisJSON = {
				requestType: 'keyboardNav',
				linkURL: thisURL,
				button: button
			};

			RESUtils.sendMessage(thisJSON);
		} else {
			location.href = this.getAttribute('href');
		}
	},
	keyUnfocus: function(obj) {
		obj.classList.remove('RES-keyNav-activeElement');
		if (this.pageType === 'comments') {
			var annotations = obj.querySelectorAll('div.md .keyNavAnnotation');
			for (var i = 0, len = annotations.length; i < len; i++) {
				annotations[i].parentNode.removeChild(annotations[i]);
			}
		}
		modules['hover'].close(false);
	},
	drawHelp: function() {
		var thisHelp = RESUtils.createElementWithID('div', 'keyHelp');
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
		var isLink = /^link[\d]+$/i;
		for (var i in this.options) {
			if ((this.options[i].type === 'keycode') && (!isLink.test(i))) {
				var thisRow = document.createElement('tr');
				var thisRowKey = document.createElement('td');
				var thisKeyCode = this.getNiceKeyCode(i);
				$(thisRowKey).html(thisKeyCode);
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
	getNiceKeyCode: function(optionKey) {
		var keyCodeArray = this.options[optionKey].value;
		if (!keyCodeArray) {
			return;
		}

		if (typeof keyCodeArray === 'string') {
			keyCodeArray = parseInt(keyCodeArray, 10);
		}
		if (typeof keyCodeArray === 'number') {
			keyCodeArray = [keyCodeArray, false, false, false, false];
		}
		var niceKeyCode = RESUtils.niceKeyCode(keyCodeArray);
		return niceKeyCode;
	},
	handleKeyPress: function(e) {
		var konamitest = (typeof konami === 'undefined') || (!konami.almostThere);
		if ((document.activeElement.tagName === 'BODY') && (konamitest)) {
			// comments page, or link list?
			var keyArray = [e.keyCode, e.altKey, e.ctrlKey, e.shiftKey, e.metaKey];
			switch (this.pageType) {
				case 'linklist':
				case 'profile':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveTop.value):
							this.moveTop();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveBottom.value):
							this.moveBottom();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLink.value):
							this.followLink();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkNewTab.value):
							e.preventDefault();
							this.followLink(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followComments.value):
							this.followComments();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followCommentsNewTab.value):
							e.preventDefault();
							this.followComments(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleExpando.value):
							this.toggleExpando();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUp.value):
							this.imageSizeUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDown.value):
							this.imageSizeDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUpFine.value):
							this.imageSizeUp(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDownFine.value):
							this.imageSizeDown(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleViewImages.value):
							this.toggleViewImages();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkAndCommentsNewTab.value):
							e.preventDefault();
							this.followLinkAndComments();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkAndCommentsNewTabBG.value):
							e.preventDefault();
							this.followLinkAndComments(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.save.value):
							this.saveLink();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							e.preventDefault();
							this.goMode();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							e.preventDefault();
							this.inbox(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							e.preventDefault();
							this.profile();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							e.preventDefault();
							this.profile(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							e.preventDefault();
							this.frontPage(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextPage.value):
							e.preventDefault();
							this.nextPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.prevPage.value):
							e.preventDefault();
							this.prevPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							this.toggleCmdLine();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.hide.value):
							this.hide();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followSubreddit.value):
							this.followSubreddit();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followSubredditNewTab.value):
							this.followSubreddit(true);
							break;
						default:
							// do nothing. unrecognized key.
							break;
					}
					break;
				case 'comments':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							this.toggleCmdLine();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveUpSibling.value):
							this.moveUpSibling();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDownSibling.value):
							this.moveDownSibling();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveUpThread.value):
							this.moveUpThread();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDownThread.value):
							this.moveDownThread();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveToTopComment.value):
							this.moveToTopComment();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveToParent.value):
							this.moveToParent();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.showParents.value):
							this.showParents();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleChildren.value):
							this.toggleChildren();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.followLinkNewTab.value):
							// only execute if the link is selected on a comments page...
							if (this.activeIndex === 0) {
								e.preventDefault();
								this.followLink(true);
							}
							break;
						case RESUtils.checkKeysForEvent(e, this.options.save.value):
							if (this.activeIndex === 0) {
								this.saveLink();
							} else {
								this.saveComment();
							}
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleExpando.value):
							this.toggleAllExpandos();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.previousGalleryImage.value):
							this.previousGalleryImage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUp.value):
							this.imageSizeUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDown.value):
							this.imageSizeDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeUpFine.value):
							this.imageSizeUp(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.imageSizeDownFine.value):
							this.imageSizeDown(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextGalleryImage.value):
							this.nextGalleryImage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleViewImages.value):
							this.toggleViewImages();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.reply.value):
							e.preventDefault();
							this.reply();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							e.preventDefault();
							this.goMode();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							e.preventDefault();
							this.inbox(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							e.preventDefault();
							this.profile();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							e.preventDefault();
							this.profile(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							e.preventDefault();
							this.frontPage(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextPage.value):
							e.preventDefault();
							this.nextPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.prevPage.value):
							e.preventDefault();
							this.prevPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link1.value):
							e.preventDefault();
							this.commentLink(0);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link2.value):
							e.preventDefault();
							this.commentLink(1);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link3.value):
							e.preventDefault();
							this.commentLink(2);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link4.value):
							e.preventDefault();
							this.commentLink(3);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link5.value):
							e.preventDefault();
							this.commentLink(4);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link6.value):
							e.preventDefault();
							this.commentLink(5);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link7.value):
							e.preventDefault();
							this.commentLink(6);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link8.value):
							e.preventDefault();
							this.commentLink(7);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link9.value):
							e.preventDefault();
							this.commentLink(8);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.link10.value):
							e.preventDefault();
							this.commentLink(9);
							break;
						default:
							// do nothing. unrecognized key.
							break;
					}
					break;
				case 'inbox':
					switch (true) {
						case RESUtils.checkKeysForEvent(e, this.options.toggleHelp.value):
							this.toggleHelp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleCmdLine.value):
							this.toggleCmdLine();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveUp.value):
							this.moveUp();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.moveDown.value):
							this.moveDown();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.toggleChildren.value):
							this.toggleChildren();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.upVote.value):
							this.upVote();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.downVote.value):
							this.downVote();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.reply.value):
							e.preventDefault();
							this.reply();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.goMode.value):
							e.preventDefault();
							this.goMode();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inbox.value):
							e.preventDefault();
							this.inbox();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.inboxNewTab.value):
							e.preventDefault();
							this.inbox(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profile.value):
							e.preventDefault();
							this.profile();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.profileNewTab.value):
							e.preventDefault();
							this.profile(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.frontPage.value):
							e.preventDefault();
							this.frontPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.subredditFrontPage.value):
							e.preventDefault();
							this.frontPage(true);
							break;
						case RESUtils.checkKeysForEvent(e, this.options.nextPage.value):
							e.preventDefault();
							this.nextPage();
							break;
						case RESUtils.checkKeysForEvent(e, this.options.prevPage.value):
							e.preventDefault();
							this.prevPage();
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
		if (document.getElementById('keyHelp').style.display === 'block') {
			this.hideHelp();
		} else {
			this.showHelp();
		}
	},
	showHelp: function() {
		// show help!
		RESUtils.fadeElementIn(document.getElementById('keyHelp'), 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'keyboardnavhelp');
	},
	hideHelp: function() {
		// hide help!
		RESUtils.fadeElementOut(document.getElementById('keyHelp'), 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'keyboardnavhelp');
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
				var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1,
					thisJSON = {
						requestType: 'keyboardNav',
						linkURL: thisHREF,
						button: button
					};

				RESUtils.sendMessage(thisJSON);
			} else {
				location.href = thisHREF;
			}
		}
	},
	moveUp: function() {
		if (this.activeIndex > 0) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex--;
			var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			// skip over hidden elements...
			while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex > 0)) {
				this.activeIndex--;
				thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) || (this.options.scrollStyle.value === 'top')) {
				RESUtils.scrollTo(0, thisXY.y);
			}

			modules['keyboardNav'].recentKey();
		}
	},
	moveDown: function() {
		if (this.activeIndex < this.keyboardLinks.length - 1) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			this.activeIndex++;
			var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			// skip over hidden elements...
			while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length - 1)) {
				this.activeIndex++;
				thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			// console.log('xy: ' + RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]).toSource());
			/*
			if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) || (this.options.scrollTop.value)) {
				RESUtils.scrollTo(0,thisXY.y);
			}
			*/
			if (this.options.scrollStyle.value === 'top') {
				RESUtils.scrollTo(0, thisXY.y);
			} else if ((!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex])))) {
				var thisHeight = this.keyboardLinks[this.activeIndex].offsetHeight;
				if (this.options.scrollStyle.value === 'page') {
					RESUtils.scrollTo(0, thisXY.y);
				} else {
					RESUtils.scrollTo(0, thisXY.y - window.innerHeight + thisHeight + 5);
				}
			}
			// note: we don't want to go to the next page if we're on the dashboard...
			if ((!RESUtils.currentSubreddit('dashboard')) && (RESUtils.pageType() === 'linklist') && (this.activeIndex == (this.keyboardLinks.length - 1) && (modules['neverEndingReddit'].isEnabled() && modules['neverEndingReddit'].options.autoLoad.value))) {
				this.nextPage();
			}
			modules['keyboardNav'].recentKey();
		}
	},
	moveTop: function() {
		this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
		this.activeIndex = 0;
		this.keyFocus(this.keyboardLinks[this.activeIndex]);
		var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
		if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
			RESUtils.scrollTo(0, thisXY.y);
		}
		modules['keyboardNav'].recentKey();
	},
	moveBottom: function() {
		this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
		this.activeIndex = this.keyboardLinks.length - 1;
		this.keyFocus(this.keyboardLinks[this.activeIndex]);
		var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
		if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
			RESUtils.scrollTo(0, thisXY.y);
		}
		modules['keyboardNav'].recentKey();
	},
	moveDownSibling: function() {
		if (this.activeIndex < this.keyboardLinks.length - 1) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			var thisParent = this.keyboardLinks[this.activeIndex].parentNode;
			var childCount = thisParent.querySelectorAll('.entry').length;
			this.activeIndex += childCount;
			// skip over hidden elements...
			var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length - 1)) {
				this.activeIndex++;
				thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			if ((this.pageType === 'linklist') || (this.pageType === 'profile')) {
				this.setKeyIndex();
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0, thisXY.y);
			}
		}
		modules['keyboardNav'].recentKey();
	},
	moveUpSibling: function() {
		if (this.activeIndex < this.keyboardLinks.length - 1) {
			this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
			var thisParent = this.keyboardLinks[this.activeIndex].parentNode,
				childCount;
			if (thisParent.previousSibling !== null) {
				childCount = thisParent.previousSibling.previousSibling.querySelectorAll('.entry').length;
			} else {
				childCount = 1;
			}
			this.activeIndex -= childCount;
			// skip over hidden elements...
			var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			while ((thisXY.x === 0) && (thisXY.y === 0) && (this.activeIndex < this.keyboardLinks.length - 1)) {
				this.activeIndex++;
				thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
			}
			if ((this.pageType === 'linklist') || (this.pageType === 'profile')) {
				this.setKeyIndex();
			}
			this.keyFocus(this.keyboardLinks[this.activeIndex]);
			if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
				RESUtils.scrollTo(0, thisXY.y);
			}
		}
		modules['keyboardNav'].recentKey();
	},
	moveUpThread: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			this.moveToTopComment();
		}
		this.moveUpSibling();
	},
	moveDownThread: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			this.moveToTopComment();
		}
		this.moveDownSibling();
	},
	moveToTopComment: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			//goes up to the root of the current thread
			while (!firstParent.parentNode.parentNode.parentNode.classList.contains('content') && (firstParent !== null)) {
				this.moveToParent();
				firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			}
		}
	},
	moveToParent: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			// check if we're at the top parent, first... if the great grandparent has a class of content, do nothing.
			if (!firstParent.parentNode.parentNode.parentNode.classList.contains('content')) {
				if (firstParent !== null) {
					this.keyUnfocus(this.keyboardLinks[this.activeIndex]);
					var $thisParent = $(firstParent).parent().parent().prev().parent();
					var newKeyIndex = parseInt($thisParent.data('keyIndex'), 10);
					this.activeIndex = newKeyIndex;
					this.keyFocus(this.keyboardLinks[this.activeIndex]);
					var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
					if (!(RESUtils.elementInViewport(this.keyboardLinks[this.activeIndex]))) {
						RESUtils.scrollTo(0, thisXY.y);
					}
				}
			}
		}
		modules['keyboardNav'].recentKey();
	},
	showParents: function() {
		if ((this.activeIndex < this.keyboardLinks.length - 1) && (this.activeIndex > 1)) {
			var firstParent = this.keyboardLinks[this.activeIndex].parentNode;
			if (firstParent != null) {
				var button = $(this.keyboardLinks[this.activeIndex]).find('.buttons :not(:first-child) .bylink:first').get(0);
				modules['hover'].begin(button, {}, modules['showParent'].showCommentHover, {});
			}
		}
	},
	toggleChildren: function() {
		if (this.activeIndex === 0) {
			// Ahh, we're not in a comment, but in the main story... that key should follow the link.
			this.followLink();
		} else {
			// find out if this is a collapsed or uncollapsed view...
			var thisCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.collapsed');
			var thisNonCollapsed = this.keyboardLinks[this.activeIndex].querySelector('div.noncollapsed');
			if (thisCollapsed.style.display !== 'none') {
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
				if (contThread) {
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
				var thisXY = RESUtils.getXYpos(this.keyboardLinks[this.activeIndex]);
				RESUtils.scrollTo(0, thisXY.y);
			}
		}
	},
	imageResize: function(factor) {
		var images = $(this.activeElement).find('.RESImage.loaded, .madeVisible video'),
			thisWidth;

		for (var i = 0, len = images.length; i < len; i++) {
			thisWidth = $(images[i]).width();
			modules['showImages'].resizeImage(images[i], thisWidth + factor);
		}
	},
	imageSizeUp: function(fineControl) {
		var factor = (fineControl) ? 50 : 150;
		this.imageResize(factor);
	},
	imageSizeDown: function(fineControl) {
		var factor = (fineControl) ? -50 : -150;
		this.imageResize(factor);
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
			for (var i = 0, len = thisExpandos.length; i < len; i++) {
				RESUtils.click(thisExpandos[i]);
			}
		}
	},
	followLink: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.title');
		var thisHREF = thisA.getAttribute('href');
		// console.log(thisA);
		if (newWindow) {
			var button = (this.options.followLinkNewTabFocus.value) ? 0 : 1,
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF,
					button: button
				};

			RESUtils.sendMessage(thisJSON);
		} else {
			location.href = thisHREF;
		}
	},
	followComments: function(newWindow) {
		var thisA = this.keyboardLinks[this.activeIndex].querySelector('a.comments'),
			thisHREF = thisA.getAttribute('href');
		if (newWindow) {
			var thisJSON = {
				requestType: 'keyboardNav',
				linkURL: thisHREF
			};

			RESUtils.sendMessage(thisJSON);
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
		if (typeof this.keyboardLinks[this.activeIndex] === 'undefined') {
			return false;
		}

		var upVoteButton;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName === 'A') {
			upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.upmod');
		} else {
			upVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.up') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.upmod');
		}

		RESUtils.click(upVoteButton);

		if (link && this.options.onVoteMoveDown.value) {
			this.moveDown();
		}
	},
	downVote: function(link) {
		if (typeof this.keyboardLinks[this.activeIndex] === 'undefined') {
			return false;
		}

		var downVoteButton;
		if (this.keyboardLinks[this.activeIndex].previousSibling.tagName === 'A') {
			downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.previousSibling.querySelector('div.downmod');
		} else {
			downVoteButton = this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.down') || this.keyboardLinks[this.activeIndex].previousSibling.querySelector('div.downmod');
		}

		RESUtils.click(downVoteButton);

		if (link && this.options.onVoteMoveDown.value) {
			this.moveDown();
		}
	},
	saveLink: function() {
		var saveLink = this.keyboardLinks[this.activeIndex].querySelector('form.save-button a') || this.keyboardLinks[this.activeIndex].querySelector('form.unsave-button a');
		if (saveLink) {
			RESUtils.click(saveLink);
		}
	},
	saveComment: function() {
		var saveComment = this.keyboardLinks[this.activeIndex].querySelector('.saveComments');
		if (saveComment) {
			RESUtils.click(saveComment);
		}
	},
	reply: function() {
		// activeIndex = 0 means we're at the original post, not a comment
		if ((this.activeIndex > 0) || (RESUtils.pageType() !== 'comments')) {
			if ((RESUtils.pageType() === 'comments') && (this.activeIndex === 0) && (location.href.indexOf('/message/') === -1)) {
				$('.usertext-edit textarea:first').focus();
			} else {
				var commentButtons = this.keyboardLinks[this.activeIndex].querySelectorAll('ul.buttons > li > a');
				for (var i = 0, len = commentButtons.length; i < len; i++) {
					if (commentButtons[i].innerHTML === 'reply') {
						RESUtils.click(commentButtons[i]);
					}
				}
			}
		} else {
			var firstCommentBox = document.querySelector('.commentarea textarea[name=text]');
			if (firstCommentBox && $(firstCommentBox).is(':visible')) {
				firstCommentBox.focus();
			} else {
				// uh oh, we must be in a subpage, there is no first comment box. The user probably wants to reply to the OP. Let's take them to the comments page.
				var commentButton = this.keyboardLinks[this.activeIndex].querySelector('ul.buttons > li > a.comments');
				location.href = commentButton.getAttribute('href');
			}
		}
	},
	navigateTo: function(newWindow, thisHREF) {
		if (newWindow) {
			var thisJSON;
			if (BrowserDetect.isChrome()) {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				};
				chrome.runtime.sendMessage(thisJSON);
			} else if (BrowserDetect.isSafari()) {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				};
				safari.self.tab.dispatchMessage("keyboardNav", thisJSON);
			} else if (BrowserDetect.isOpera()) {
				thisJSON = {
					requestType: 'keyboardNav',
					linkURL: thisHREF
				};
				opera.extension.postMessage(JSON.stringify(thisJSON));
			} else {
				window.open(thisHREF);
			}
		} else {
			location.href = thisHREF;
		}
	},
	goMode: function() {
		if (!modules['keyboardNav'].options.useGoMode.value) {
			return;
		}
		modules['keyboardNav'].goModeActive = !modules['keyboardNav'].goModeActive;
		if (modules['keyboardNav'].goModeActive) {
			if (!modules['keyboardNav'].goModePanel) {
				var $shortCutList, $contents, niceKeyCode;

				modules['keyboardNav'].goModePanel = $('<div id="goModePanel" class="RESDialogSmall">')
					.append('<h3>Press a key to go:</h3><div id="goModeCloseButton" class="RESCloseButton">&times;</div>');

				// add the keyboard shortcuts...
				$contents = $('<div class="RESDialogContents"></div>');
				$shortCutList = $('<table>');
				for (var key in modules['keyboardNav'].options) {
					if (modules['keyboardNav'].options[key].isGoTo) {
						niceKeyCode = modules['keyboardNav'].getNiceKeyCode(key);
						$shortCutList.append('<tr><td>'+niceKeyCode+'</td><td class="arrow">&rarr;</td><td>'+key+'</td></tr>');
					}
				}
				$contents.append($shortCutList);
				modules['keyboardNav'].goModePanel.append($contents);
				modules['keyboardNav'].goModePanel.on('click', '.RESCloseButton', modules['keyboardNav'].goMode);
			}
			$('body').on('keyup', modules['keyboardNav'].handleGoModeEscapeKey);
			$(document.body).append(modules['keyboardNav'].goModePanel);
			modules['keyboardNav'].goModePanel.fadeIn();
		} else {
			modules['keyboardNav'].hideGoModePanel();
		}
	},
	hideGoModePanel: function() {
		modules['keyboardNav'].goModeActive = false;
		modules['keyboardNav'].goModePanel.fadeOut();
		$('body').off('keyup', modules['keyboardNav'].handleGoModeEscapeKey);
	},
	handleGoModeEscapeKey: function(event) {
		if (event.which === 27) {
			modules['keyboardNav'].hideGoModePanel();
		}
	},
	inbox: function(newWindow) {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		var thisHREF = location.protocol + '//' + location.hostname + '/message/inbox/';
		modules['keyboardNav'].navigateTo(newWindow, thisHREF);
	},
	profile: function(newWindow) {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		var thisHREF = location.protocol + '//' + location.hostname + '/user/' + RESUtils.loggedInUser();
		modules['keyboardNav'].navigateTo(newWindow, thisHREF);
	},
	frontPage: function(subreddit) {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();

		if (subreddit && !RESUtils.currentSubreddit()) {
			return;
		}
		
		var newhref = location.protocol + '//' + location.hostname + '/';
		if (subreddit) {
			newhref += 'r/' + RESUtils.currentSubreddit();
		}
		location.href = newhref;
	},
	nextPage: function() {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		// if Never Ending Reddit is enabled, just scroll to the bottom.  Otherwise, click the 'next' link.
		if ((modules['neverEndingReddit'].isEnabled()) && (modules['neverEndingReddit'].progressIndicator)) {
			RESUtils.click(modules['neverEndingReddit'].progressIndicator);
			this.moveBottom();
		} else {
			// get the first link to the next page of reddit...
			var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks();
			var link = nextPrevLinks.next;
			if (link) {
				// RESUtils.click(nextLink);
				location.href = link.getAttribute('href');
			}
		}
	},
	prevPage: function() {
		if ((this.options.useGoMode.value) && (!this.goModeActive)) {
			return;
		}
		this.hideGoModePanel();
		// if Never Ending Reddit is enabled, do nothing.  Otherwise, click the 'prev' link.
		if (modules['neverEndingReddit'].isEnabled()) {
			return false;
		} else {
			var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks();
			var link = nextPrevLinks.prev;
			if (link) {
				// RESUtils.click(prevLink);
				location.href = link.getAttribute('href');
			}
		}
	},
	getCommentLinks: function(obj) {
		if (!obj) {
			obj = this.keyboardLinks[this.activeIndex];
		}
		return obj.querySelectorAll('div.md a:not(.expando-button):not(.madeVisible):not([href^="javascript:"])');
	},
	commentLink: function(num) {
		if (this.options.commentsLinkNumbers.value) {
			var links = this.getCommentLinks();
			if (typeof links[num] !== 'undefined') {
				var thisLink = links[num];
				if ((thisLink.nextSibling) && (typeof thisLink.nextSibling.tagName !== 'undefined') && (thisLink.nextSibling.classList.contains('expando-button'))) {
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
		gildComments: {
			type: 'boolean',
			value: true,
			description: 'When clicking the "give gold" button on the user hover info on a comment, give gold to the comment.'
		},
		highlightButton: {
			type: 'boolean',
			value: true,
			description: 'Show "highlight" button in user hover info, for distinguishing posts/comments from particular users.'
		},
		highlightColor: {
			type: 'text',
			value: '#5544CC',
			description: 'Color used to highlight a selected user, when "highlighted" from hover info.'
		},
		highlightColorHover: {
			type: 'text',
			value: '#6677AA',
			description: 'Color used to highlight a selected user on hover.'
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
	include: [
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.]*/i
	],
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var css = '.comment .tagline { display: inline; }';
			css += '#userTaggerToolTip { display: none; position: absolute; width: 334px; height: 248px; }';
			css += '#userTaggerToolTip label { margin-top: 5px; clear: both; float: left; width: 110px; }';
			css += '#userTaggerToolTip input[type=text], #userTaggerToolTip select { margin-top: 5px; float: left; width: 195px; border: 1px solid #c7c7c7; border-radius: 3px; margin-bottom: 6px; }';
			css += '#userTaggerToolTip input[type=checkbox] { margin-top: 5px; float: left; }';
			css += '#userTaggerToolTip input[type=submit] { cursor: pointer; position: absolute; right: 16px; bottom: 16px; padding: 3px 5px; font-size: 12px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; } ';
			css += '#userTaggerToolTip .toggleButton { margin-top: 5px; margin-bottom: 5px; }';
			css += '#userTaggerClose { position: absolute; right: 7px; top: 7px; z-index: 11; }';

			css += '.ignoredUserComment { color: #CACACA; padding: 3px; font-size: 10px; }';
			css += '.ignoredUserPost { color: #CACACA; padding: 3px; font-size: 10px; }';
			css += 'a.voteWeight { text-decoration: none; color: #369; }';
			css += 'a.voteWeight:hover { text-decoration: none; }';
			css += '#authorInfoToolTip { display: none; position: absolute; min-width: 450px; z-index: 10001; }';
			css += '#authorInfoToolTip:before { content: ""; position: absolute; top: 10px; left: -26px; border-style: solid; border-width: 10px 29px 10px 0; border-color: transparent #c7c7c7; display: block; width: 0; z-index: 1; }';
			css += '#authorInfoToolTip:after { content: ""; position: absolute; top: 10px; left: -24px; border-style: solid; border-width: 10px 29px 10px 0; border-color: transparent #f0f3fc; display: block; width: 0; z-index: 1; }';
			css += '#authorInfoToolTip.right:before { content: ""; position: absolute; top: 10px; right: -26px; left: auto; border-style: solid; border-width: 10px 0 10px 29px; border-color: transparent #c7c7c7; display: block; width: 0; z-index: 1; }';
			css += '#authorInfoToolTip.right:after { content: ""; position: absolute; top: 10px; right: -24px; left: auto; border-style: solid; border-width: 10px 0 10px 29px; border-color: transparent #f0f3fc; display: block; width: 0; z-index: 1; }';
			css += '#authorInfoToolTip .authorFieldPair { clear: both; overflow: auto; margin-bottom: 12px; }';
			css += '#authorInfoToolTip .authorLabel { float: left; width: 140px; }';
			css += '#authorInfoToolTip .authorDetail { float: left; min-width: 240px; }';
			css += '#authorInfoToolTip .blueButton { float: right; margin-left: 8px; margin-top: 12px; }';
			css += '#authorInfoToolTip .redButton { float: right; margin-left: 8px; }';

			css += '#benefits { width: 200px; margin-left: 0; }';
			css += '#userTaggerToolTip #userTaggerVoteWeight { width: 30px; }';
			css += '.RESUserTagImage { display: inline-block; width: 16px; height: 8px; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-repeat: no-repeat; background-position: -16px -137px; }';
			css += '.userTagLink { display: inline-block; }';
			css += '.hoverHelp { margin-left: 3px; cursor: pointer; color: #369; text-decoration: underline; }';
			css += '.userTagLink.hasTag, #userTaggerPreview { display: inline-block; padding: 0 4px; border: 1px solid #c7c7c7; border-radius: 3px; }';
			css += '#userTaggerPreview { float: left; height: 16px; margin-bottom: 10px; }';
			css += '#userTaggerToolTip .toggleButton .toggleOn { background-color: #107ac4; color: #fff;  }';
			css += '#userTaggerToolTip .toggleButton.enabled .toggleOn { background-color: #ddd ; color: #636363; }';
			css += '#userTaggerToolTip .toggleButton.enabled .toggleOff { background-color: #d02020; color: #fff; }';
			css += '#userTaggerToolTip .toggleButton .toggleOff { background-color: #ddd; color: #636363; } ';
			css += '#userTaggerTable th { -moz-user-select: none; -webkit-user-select: none; -o-user-select: none; user-select: none; }';
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
			if (typeof tags !== 'undefined') {
				this.tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true);
			}
			// check if we're using the old method of storing user tags... yuck!
			if (this.tags === null) {
				this.updateTagStorage();
			}
			// If we're on the dashboard, add a tab to it...
			if (RESUtils.currentSubreddit('dashboard')) {
				// add tab to dashboard
				modules['dashboard'].addTab('userTaggerContents', 'My User Tags');
				// populate the contents of the tab
				var showDiv = $('<div class="show">Show:</div>');
				var tagFilter = $('<select id="tagFilter"><option>tagged users</option><option>all users</option></select>');
				$(showDiv).append(tagFilter);
				$('#userTaggerContents').append(showDiv);
				$('#tagFilter').change(function() {
					modules['userTagger'].drawUserTagTable();
				});

				var tagsPerPage = parseInt(modules['dashboard'].options['tagsPerPage'].value, 10);
				if (tagsPerPage) {
					var controlWrapper = document.createElement('div');
					controlWrapper.id = 'tagPageControls';
					controlWrapper.className = 'RESGalleryControls';
					controlWrapper.page = 1;
					controlWrapper.pageCount = 1;

					var leftButton = document.createElement("a");
					leftButton.className = 'previous noKeyNav';
					leftButton.addEventListener('click', function(e) {
						if (controlWrapper.page === 1) {
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
					rightButton.addEventListener('click', function(e) {
						if (controlWrapper.page === controlWrapper.pageCount) {
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
					var $this = $(this);

					if ($this.hasClass('delete')) {
						return false;
					}
					if ($this.hasClass('active')) {
						$this.toggleClass('descending');
					}
					$this.addClass('active');
					$this.siblings().removeClass('active').find('SPAN').remove();
					$this.find('.sortAsc, .sortDesc').remove();
					$this.append($(e.target).hasClass('descending')
						? '<span class="sortDesc" />'
						: '<span class="sortAsc" />');
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
			this.userTaggerToolTip = RESUtils.createElementWithID('div', 'userTaggerToolTip', 'RESDialogSmall');
			var thisHTML = '<h3>Tag User</h3><div id="userTaggerToolTipContents" class="RESDialogContents clear">';
			thisHTML += '<form name="userTaggerForm" action=""><input type="hidden" id="userTaggerName" value="">';
			thisHTML += '<label for="userTaggerTag">Tag</label> <input type="text" id="userTaggerTag" value="">';
			thisHTML += '<div id="userTaggerClose" class="RESCloseButton">&times;</div>';
			thisHTML += '<label for="userTaggerColor">Color</label> <select id="userTaggerColor">';
			for (var color in this.bgToTextColorMap) {
				var bgColor = (color === 'none') ? 'transparent' : color;
				thisHTML += '<option style="background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[color] + ' !important;" value="' + color + '">' + color + '</option>';
			}
			thisHTML += '</select>';
			thisHTML += '<label for="userTaggerPreview">Preview</label> <span id="userTaggerPreview"></span>';
			thisHTML += '<label for="userTaggerIgnore">Ignore</label>'; // <input type="checkbox" id="userTaggerIgnore" value="true">';
			thisHTML += '<label for="userTaggerLink">Link<span class="hoverHelp" title="add a link for this user (shows up in hover pane)">?</span></label> <input type="text" id="userTaggerLink" value="">';
			thisHTML += '<label for="userTaggerVoteWeight">Vote Weight<span class="hoverHelp" title="manually edit vote weight for this user">?</span></label> <input type="text" size="2" id="userTaggerVoteWeight" value="">';
			thisHTML += '<div class="clear"></div><input type="submit" id="userTaggerSave" value="Save"></form></div>';
			$(this.userTaggerToolTip).html(thisHTML);
			var ignoreLabel = this.userTaggerToolTip.querySelector('label[for=userTaggerIgnore]');
			RESUtils.insertAfter(ignoreLabel, RESUtils.toggleButton('userTaggerIgnore', false, 'no', 'yes'));
			this.userTaggerTag = this.userTaggerToolTip.querySelector('#userTaggerTag');
			this.userTaggerTag.addEventListener('keyup', modules['userTagger'].updateTagPreview, false);
			this.userTaggerColor = this.userTaggerToolTip.querySelector('#userTaggerColor');
			this.userTaggerColor.addEventListener('change', modules['userTagger'].updateTagPreview, false);
			this.userTaggerPreview = this.userTaggerToolTip.querySelector('#userTaggerPreview');
			var userTaggerSave = this.userTaggerToolTip.querySelector('#userTaggerSave');
			userTaggerSave.setAttribute('type', 'submit');
			userTaggerSave.setAttribute('value', '✓ save tag');
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
			this.userTaggerForm.addEventListener('submit', function(e) {
				e.preventDefault();
				modules['userTagger'].saveTagForm();
			}, true);
			document.body.appendChild(this.userTaggerToolTip);
			if (this.options.hoverInfo.value) {
				this.authorInfoToolTip = RESUtils.createElementWithID('div', 'authorInfoToolTip', 'RESDialogSmall');
				this.authorInfoToolTipHeader = document.createElement('h3');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipHeader);
				this.authorInfoToolTipCloseButton = RESUtils.createElementWithID('div', 'authorInfoToolTipClose', 'RESCloseButton');
				$(this.authorInfoToolTipCloseButton).text('×');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipCloseButton);
				this.authorInfoToolTipCloseButton.addEventListener('click', function(e) {
					if (typeof modules['userTagger'].hideTimer !== 'undefined') {
						clearTimeout(modules['userTagger'].hideTimer);
					}
					modules['userTagger'].hideAuthorInfo();
				}, false);
				this.authorInfoToolTipContents = RESUtils.createElementWithID('div', 'authorInfoToolTipContents', 'RESDialogContents');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipContents);
				this.authorInfoToolTip.addEventListener('mouseover', function(e) {
					if (typeof modules['userTagger'].hideTimer !== 'undefined') {
						clearTimeout(modules['userTagger'].hideTimer);
					}
				}, false);
				this.authorInfoToolTip.addEventListener('mouseout', function(e) {
					if (e.target.getAttribute('class') !== 'hoverAuthor') {
						modules['userTagger'].hideTimer = setTimeout(function() {
							modules['userTagger'].hideAuthorInfo();
						}, modules['userTagger'].options.fadeDelay.value);
					}
				}, false);
				document.body.appendChild(this.authorInfoToolTip);
			}
			document.getElementById('userTaggerTag').addEventListener('keydown', function(e) {
				if (e.keyCode === 27) {
					// close prompt.
					modules['userTagger'].closeUserTagPrompt();
				}
			}, true);
			//console.log('before applytags: ' + Date());
			this.applyTags();
			//console.log('after applytags: ' + Date());
			if (RESUtils.pageType() === 'comments') {
				RESUtils.watchForElement('newComments', modules['userTagger'].attachVoteHandlers);
				RESUtils.watchForElement('newComments', modules['userTagger'].applyTags);
			} else {
				RESUtils.watchForElement('siteTable', modules['userTagger'].attachVoteHandlers);
				RESUtils.watchForElement('siteTable', modules['userTagger'].applyTags);
			}

			var userpagere = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w\.]+\/?/i;
			if (userpagere.test(location.href)) {
				var friendButton = document.querySelector('.titlebox .fancy-toggle-button');
				if ((typeof friendButton !== 'undefined') && (friendButton !== null)) {
					var firstAuthor = document.querySelector('a.author'),
						thisFriendComment;
					if ((typeof firstAuthor !== 'undefined') && (firstAuthor !== null)) {
						thisFriendComment = firstAuthor.getAttribute('title');
						thisFriendComment = (thisFriendComment !== null) ? thisFriendComment.substring(8, thisFriendComment.length - 1) : '';
					} else {
						thisFriendComment = '';
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
		for (var i = 0, len = voteButtons.length; i < len; i++) {
			// get current vote states so that when we listen, we check the delta...
			// pairNum is just the index of the "pair" of vote arrows... it's i/2 with no remainder...
			var pairNum = Math.floor(i / 2);
			if (typeof this.voteStates[pairNum] === 'undefined') {
				this.voteStates[pairNum] = 0;
			}
			if (voteButtons[i].classList.contains('upmod')) {
				this.voteStates[pairNum] = 1;
			} else if (voteButtons[i].classList.contains('downmod')) {
				this.voteStates[pairNum] = -1;
			}
			// add an event listener to vote buttons to track votes, but only if we're logged in....
			voteButtons[i].setAttribute('pairNum', pairNum);
			if (RESUtils.loggedInUser()) {
				voteButtons[i].addEventListener('click', modules['userTagger'].handleVoteClick, true);
			}
		}
	},
	handleVoteClick: function(e) {
		var tags = RESStorage.getItem('RESmodules.userTagger.tags');
		if (typeof tags !== 'undefined') {
			modules['userTagger'].tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true);
		}
		if (e.target.getAttribute('onclick').indexOf('unvotable') === -1) {
			var pairNum = e.target.getAttribute('pairNum');
			if (pairNum) {
				pairNum = parseInt(pairNum, 10);
			}
			var thisAuthorA = this.parentNode.nextSibling.querySelector('p.tagline a.author');
			// if this is a post with a thumbnail, we need to adjust the query a bit...
			if (thisAuthorA === null && this.parentNode.nextSibling.classList.contains('thumbnail')) {
				thisAuthorA = this.parentNode.nextSibling.nextSibling.querySelector('p.tagline a.author');
			}
			if (thisAuthorA) {
				var thisVWobj = this.parentNode.nextSibling.querySelector('.voteWeight');
				if (!thisVWobj) {
					thisVWobj = this.parentNode.parentNode.querySelector('.voteWeight');
				}
				// but what if no obj exists
				var thisAuthor = thisAuthorA.textContent;
				var votes = 0;
				if (typeof modules['userTagger'].tags[thisAuthor] !== 'undefined') {
					if (typeof modules['userTagger'].tags[thisAuthor].votes !== 'undefined') {
						votes = parseInt(modules['userTagger'].tags[thisAuthor].votes, 10);
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
				var upOrDown = ((this.classList.contains('up')) || (this.classList.contains('upmod'))) ? 'up' : 'down';
				// did they click the up arrow, or down arrow?
				switch (upOrDown) {
					case 'up':
						// the class changes BEFORE the click event is triggered, so we have to look at them backwards.
						// if the arrow now has class "up" instead of "upmod", then it was "upmod" before, which means
						// we are undoing an upvote...
						if (this.classList.contains('up')) {
							// this is an undo of an upvote. subtract one from votes. We end on no vote.
							votes--;
							modules['userTagger'].voteStates[pairNum] = 0;
						} else {
							// They've upvoted... the question is, is it an upvote alone, or an an undo of a downvote?
							// add one vote either way...
							votes++;
							// if it was previously downvoted, add another!
							if (modules['userTagger'].voteStates[pairNum] === -1) {
								votes++;
							}
							modules['userTagger'].voteStates[pairNum] = 1;
						}
						break;
					case 'down':
						// the class changes BEFORE the click event is triggered, so we have to look at them backwards.
						// if the arrow now has class "up" instead of "upmod", then it was "upmod" before, which means
						// we are undoing an downvote...
						if (this.classList.contains('down')) {
							// this is an undo of an downvote. subtract one from votes. We end on no vote.
							votes++;
							modules['userTagger'].voteStates[pairNum] = 0;
						} else {
							// They've downvoted... the question is, is it an downvote alone, or an an undo of an upvote?
							// subtract one vote either way...
							votes--;
							// if it was previously upvoted, subtract another!
							if (modules['userTagger'].voteStates[pairNum] === 1) {
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
			if (filterType === 'tagged users') {
				if (typeof this.tags[i].tag !== 'undefined') {
					taggedUsers.push(i);
				}
			} else {
				taggedUsers.push(i);
			}
		}
		switch (this.currentSortMethod) {
			case 'tag':
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof modules['userTagger'].tags[a].tag === 'undefined') ? 'zzzzz' : modules['userTagger'].tags[a].tag.toLowerCase();
					var tagB = (typeof modules['userTagger'].tags[b].tag === 'undefined') ? 'zzzzz' : modules['userTagger'].tags[b].tag.toLowerCase();
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (this.descending) {
					taggedUsers.reverse();
				}
				break;
			case 'ignore':
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof modules['userTagger'].tags[a].ignore === 'undefined') ? 'z' : 'a';
					var tagB = (typeof modules['userTagger'].tags[b].ignore === 'undefined') ? 'z' : 'a';
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (this.descending) {
					taggedUsers.reverse();
				}
				break;
			case 'color':
				taggedUsers.sort(function(a, b) {
					var colorA = (typeof modules['userTagger'].tags[a].color === 'undefined') ? 'zzzzz' : modules['userTagger'].tags[a].color.toLowerCase();
					var colorB = (typeof modules['userTagger'].tags[b].color === 'undefined') ? 'zzzzz' : modules['userTagger'].tags[b].color.toLowerCase();
					return (colorA > colorB) ? 1 : (colorB > colorA) ? -1 : 0;
				});
				if (this.descending) {
					taggedUsers.reverse();
				}
				break;
			case 'votes':
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof modules['userTagger'].tags[a].votes === 'undefined') ? 0 : modules['userTagger'].tags[a].votes;
					var tagB = (typeof modules['userTagger'].tags[b].votes === 'undefined') ? 0 : modules['userTagger'].tags[b].votes;
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : (a.toLowerCase() > b.toLowerCase());
				});
				if (this.descending) {
					taggedUsers.reverse();
				}
				break;
			default:
				// sort users, ignoring case
				taggedUsers.sort(function(a, b) {
					return (a.toLowerCase() > b.toLowerCase()) ? 1 : (b.toLowerCase() > a.toLowerCase()) ? -1 : 0;
				});
				if (this.descending) {
					taggedUsers.reverse();
				}
				break;
		}
		$('#userTaggerTable tbody').html('');
		var tagsPerPage = parseInt(modules['dashboard'].options['tagsPerPage'].value, 10);
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
			start = tagsPerPage * (page - 1);
			end = Math.min(count, tagsPerPage * page);
		}

		for (var i = start; i < end; i++) {
			var thisUser = taggedUsers[i];
			var thisTag = (typeof this.tags[thisUser].tag === 'undefined') ? '' : this.tags[thisUser].tag;
			var thisVotes = (typeof this.tags[thisUser].votes === 'undefined') ? 0 : this.tags[thisUser].votes;
			var thisColor = (typeof this.tags[thisUser].color === 'undefined') ? '' : this.tags[thisUser].color;
			var thisIgnore = (typeof this.tags[thisUser].ignore === 'undefined') ? 'no' : 'yes';

			var userTagLink = document.createElement('a');
			if (thisTag === '') {
				// thisTag = '<div class="RESUserTagImage"></div>';
				userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
			} else {
				userTagLink.setAttribute('class', 'userTagLink hasTag');
			}
			$(userTagLink).html(escapeHTML(thisTag));
			if (thisColor) {
				var bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
				userTagLink.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[thisColor] + ' !important;');
			}
			userTagLink.setAttribute('username', thisUser);
			userTagLink.setAttribute('title', 'set a tag');
			userTagLink.setAttribute('href', 'javascript:void(0)');
			userTagLink.addEventListener('click', function(e) {
				modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
			}, true);

			$('#userTaggerTable tbody').append('<tr><td><a class="author" href="/user/' + thisUser + '">' + thisUser + '</a> <span class="deleteButton" user="' + thisUser + '"></span></td><td id="tag_' + i + '"></td><td id="ignore_' + i + '">' + thisIgnore + '</td><td><span style="color: ' + thisColor + '">' + thisColor + '</span></td><td>' + thisVotes + '</td></tr>');
			$('#tag_' + i).append(userTagLink);
		}
		$('#userTaggerTable tbody .deleteButton').click(function(e) {
			var thisUser = $(this).attr('user');
			var answer = confirm("Are you sure you want to delete the tag for user: " + thisUser + "?");
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
		var thisVotes = parseInt(document.getElementById('userTaggerVoteWeight').value, 10);
		if (isNaN(thisVotes)) {
			thisVotes = 0;
		}
		modules['userTagger'].setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes);
	},
	bgToTextColorMap: {
		'none': 'black',
		'aqua': 'black',
		'black': 'white',
		'blue': 'white',
		'fuchsia': 'white',
		'pink': 'black',
		'gray': 'white',
		'green': 'white',
		'lime': 'black',
		'maroon': 'white',
		'navy': 'white',
		'olive': 'black',
		'orange': 'black',
		'purple': 'white',
		'red': ' black',
		'silver': 'black',
		'teal': 'white',
		'white': 'black',
		'yellow': 'black'
	},
	openUserTagPrompt: function(obj, username) {
		var thisXY = RESUtils.getXYpos(obj);
		this.clickedTag = obj;
		var thisH3 = document.querySelector('#userTaggerToolTip h3');
		thisH3.textContent = 'Tag ' + username;
		document.getElementById('userTaggerName').value = username;
		var thisTag = null;
		var thisIgnore = null;
		if (typeof this.tags[username] !== 'undefined') {
			if (typeof this.tags[username].link !== 'undefined') {
				document.getElementById('userTaggerLink').value = this.tags[username].link;
			} else {
				document.getElementById('userTaggerLink').value = '';
			}
			if (typeof this.tags[username].tag !== 'undefined') {
				document.getElementById('userTaggerTag').value = this.tags[username].tag;
			} else {
				document.getElementById('userTaggerTag').value = '';
				if (typeof this.tags[username].link === 'undefined') {
					// since we haven't yet set a tag or a link for this user, auto populate a link for the
					// user based on where we are tagging from.
					this.setLinkBasedOnTagLocation(obj);
				}
			}
			if (typeof this.tags[username].ignore !== 'undefined') {
				document.getElementById('userTaggerIgnore').checked = this.tags[username].ignore;
				var thisToggle = document.getElementById('userTaggerIgnoreContainer');
				if (this.tags[username].ignore) {
					thisToggle.classList.add('enabled');
				}
			} else {
				document.getElementById('userTaggerIgnore').checked = false;
			}
			if (typeof this.tags[username].votes !== 'undefined') {
				document.getElementById('userTaggerVoteWeight').value = this.tags[username].votes;
			} else {
				document.getElementById('userTaggerVoteWeight').value = '';
			}
			if (typeof this.tags[username].color !== 'undefined') {
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
				this.setLinkBasedOnTagLocation(obj);
			}
			document.getElementById('userTaggerColor').selectedIndex = 0;
		}
		this.userTaggerToolTip.setAttribute('style', 'display: block; top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
		document.getElementById('userTaggerTag').focus();
		modules['userTagger'].updateTagPreview();
		return false;
	},
	setLinkBasedOnTagLocation: function(obj) {
		var closestEntry = $(obj).closest('.entry');
		var linkTitle = $(closestEntry).find('a.title');
		// if we didn't find anything, try a new search (works on inbox)
		if (!linkTitle.length) {
			linkTitle = $(closestEntry).find('a.bylink');
		}
		if (linkTitle.length) {
			document.getElementById('userTaggerLink').value = $(linkTitle).attr('href');
		} else {
			var permaLink = $(closestEntry).find('.flat-list.buttons li.first a');
			if (permaLink.length) {
				document.getElementById('userTaggerLink').value = $(permaLink).attr('href');
			}
		}
	},
	updateTagPreview: function() {
		$(modules['userTagger'].userTaggerPreview).text(modules['userTagger'].userTaggerTag.value);
		var bgcolor = modules['userTagger'].userTaggerColor[modules['userTagger'].userTaggerColor.selectedIndex].value;
		modules['userTagger'].userTaggerPreview.style.backgroundColor = bgcolor;
		modules['userTagger'].userTaggerPreview.style.color = modules['userTagger'].bgToTextColorMap[bgcolor];
	},
	closeUserTagPrompt: function() {
		this.userTaggerToolTip.setAttribute('style', 'display: none');
		if (modules['keyboardNav'].isEnabled()) {
			var inputs = this.userTaggerToolTip.querySelectorAll('INPUT, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			for (var i = 0, len = inputs.length; i < len; i++) {
				inputs[i].blur();
			}
		}
	},
	setUserTag: function(username, tag, color, ignore, link, votes, noclick) {
		if (((tag !== null) && (tag !== '')) || (ignore)) {
			if (tag === '') {
				tag = 'ignored';
			}
			if (typeof this.tags[username] === 'undefined') {
				this.tags[username] = {};
			}
			this.tags[username].tag = tag;
			this.tags[username].link = link;
			this.tags[username].color = color;
			var bgColor = (color === "none") ? "transparent" : color;
			if (ignore) {
				this.tags[username].ignore = true;
			} else {
				delete this.tags[username].ignore;
			}
			if (!noclick) {
				this.clickedTag.setAttribute('class', 'userTagLink hasTag');
				this.clickedTag.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[color] + ' !important;');
				$(this.clickedTag).html(escapeHTML(tag));
			}
		} else {
			if (typeof this.tags[username] !== 'undefined') {
				delete this.tags[username].tag;
				delete this.tags[username].color;
				delete this.tags[username].link;
				if (this.tags[username].tag === 'ignored') {
					delete this.tags[username].tag;
				}
				delete this.tags[username].ignore;
			}
			if (!noclick) {
				this.clickedTag.setAttribute('style', 'background-color: transparent');
				this.clickedTag.setAttribute('class', 'userTagLink RESUserTagImage');
				$(this.clickedTag).html('');
			}
		}

		if (typeof this.tags[username] !== 'undefined') {
			this.tags[username].votes = (isNaN(votes)) ? 0 : votes;
		}
		if (!noclick) {
			var thisVW = this.clickedTag.parentNode.parentNode.querySelector('a.voteWeight');
			if (thisVW) {
				this.colorUser(thisVW, username, votes);
			}
		}
		if (RESUtils.isEmpty(this.tags[username])) {
			delete this.tags[username];
		}
		RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(this.tags));
		this.closeUserTagPrompt();
	},
	applyTags: function(ele) {
		if (ele == null) {
			ele = document;
		}
		var authors = ele.querySelectorAll('.noncollapsed a.author, p.tagline a.author, #friend-table span.user a, .sidecontentbox .author, div.md a[href^="/u/"]:not([href*="/m/"]), div.md a[href*="reddit.com/u/"]:not([href*="/m/"]), .usertable a.author, .usertable span.user a');
		RESUtils.forEachChunked(authors, 15, 1000, function(arrayElement, index, array) {
			modules['userTagger'].applyTagToAuthor(arrayElement);
		});
	},
	applyTagToAuthor: function(thisAuthorObj) {
		var userObject = [],
			thisVotes = 0,
			thisTag = null,
			thisColor = null,
			thisIgnore = null,
			thisAuthor, thisPost, thisComment, test, noTag;

		// var thisAuthorObj = this.authors[authorNum];
		if ((thisAuthorObj) && (!(thisAuthorObj.classList.contains('userTagged'))) && (typeof thisAuthorObj !== 'undefined') && (thisAuthorObj !== null)) {
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
				thisAuthorObj.addEventListener('click', function(e) {
					clearTimeout(modules['userTagger'].showTimer);
				}, false);
			}
			test = thisAuthorObj.href.match(this.usernameRE);
			if (test) {
				thisAuthor = test[1];
			}
			// var thisAuthor = thisAuthorObj.text;
			noTag = false;
			if ((thisAuthor) && (thisAuthor.substr(0, 3) === '/u/')) {
				noTag = true;
				thisAuthor = thisAuthor.substr(3);
			}
			if (!noTag) {
				thisAuthorObj.classList.add('userTagged');
				if (typeof userObject[thisAuthor] === 'undefined') {
					if ((this.tags !== null) && (typeof this.tags[thisAuthor] !== 'undefined')) {
						if (typeof this.tags[thisAuthor].votes !== 'undefined') {
							thisVotes = parseInt(this.tags[thisAuthor].votes, 10);
						}
						if (typeof this.tags[thisAuthor].tag !== 'undefined') {
							thisTag = this.tags[thisAuthor].tag;
						}
						if (typeof this.tags[thisAuthor].color !== 'undefined') {
							thisColor = this.tags[thisAuthor].color;
						}
						if (typeof this.tags[thisAuthor].ignore !== 'undefined') {
							thisIgnore = this.tags[thisAuthor].ignore;
						}
					}
					userObject[thisAuthor] = {
						tag: thisTag,
						color: thisColor,
						ignore: thisIgnore,
						votes: thisVotes
					};
				}

				var userTagFrag = document.createDocumentFragment();

				var userTagLink = document.createElement('a');
				if (!thisTag) {
					// thisTag = '<div class="RESUserTagImage"></div>';
					userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
				} else {
					userTagLink.setAttribute('class', 'userTagLink hasTag');
				}
				$(userTagLink).html(escapeHTML(thisTag));
				if (thisColor) {
					var bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
					userTagLink.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[thisColor] + ' !important;');
				}
				userTagLink.setAttribute('username', thisAuthor);
				userTagLink.setAttribute('title', 'set a tag');
				userTagLink.setAttribute('href', 'javascript:void(0)');
				userTagLink.addEventListener('click', function(e) {
					modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
				}, true);
				var userTag = document.createElement('span');
				userTag.classList.add('RESUserTag');
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
					userVoteWeight.setAttribute('href', 'javascript:void(0)');
					userVoteWeight.setAttribute('class', 'voteWeight');
					$(userVoteWeight).text('[vw]');
					userVoteWeight.addEventListener('click', function(e) {
						var theTag = this.parentNode.querySelector('.userTagLink');
						modules['userTagger'].openUserTagPrompt(theTag, theTag.getAttribute('username'));
					}, true);
					this.colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
					userVoteFrag.appendChild(userVoteWeight);
					userTagFrag.appendChild(userVoteFrag);
				}
				RESUtils.insertAfter(thisAuthorObj, userTagFrag);
				thisIgnore = userObject[thisAuthor].ignore;
				if (thisIgnore && (RESUtils.pageType() !== 'profile')) {
					if (this.options.hardIgnore.value) {
						if (RESUtils.pageType() === 'comments') {
							var thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
							if (thisComment) {
								$(thisComment).textContent = thisAuthor + ' is an ignored user';
								thisComment.classList.add('ignoredUserComment');

								var toggle = thisComment.parentNode.querySelector('a.expand');
								RESUtils.click(toggle);
							}
							// firefox fails when we use this jquery call, so we're ditching it
							// in favor of the above lines (grabbing toggle, using RESUtils.click...)
							// $(thisComment).parent().find('a.expand').click();
						} else {
							if(RESUtils.pageType() === 'inbox'){
								thisPost = thisAuthorObj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
							}else{
								thisPost = thisAuthorObj.parentNode.parentNode.parentNode;
							}
							// hide post block first...
							thisPost.style.display = 'none';
							// hide associated voting block...
							if (thisPost.previousSibling) {
								thisPost.previousSibling.style.display = 'none';
							}
						}
					} else {
						if (RESUtils.pageType() === 'comments') {
							thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
							if (thisComment) {
								thisComment.textContent = thisAuthor + ' is an ignored user';
								thisComment.classList.add('ignoredUserComment');
							}
						} else {
							if(RESUtils.pageType() === 'inbox'){
								var thisPost = thisAuthorObj.parentNode.parentNode.parentNode.parentNode.querySelector('.md');
								var thisMessage = thisAuthorObj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
								// If message, ignore message title also
								if(!$(thisMessage).hasClass("was-comment")){
									thisMessage.querySelector('.subject').textContent = 'Ignored message';
								}
							}else{
								var thisPost = thisAuthorObj.parentNode.parentNode.parentNode.querySelector('p.title');
							}

							if (thisPost) {
								// need this setTimeout, potentially because destroying the innerHTML causes conflict with other modules?
								setTimeout(function() {
									thisPost.textContent = thisAuthor + ' is an ignored user';
								}, 100);
								thisPost.setAttribute('class', 'ignoredUserPost');
							}
						}
					}
				}
			}
		}
	},
	colorUser: function(obj, author, votes) {
		if (this.options.colorUser.value) {
			votes = parseInt(votes, 10);
			var red = 255;
			var green = 255;
			var blue = 255;
			var voteString = '+';
			if (votes > 0) {
				red = Math.max(0, (255 - (8 * votes)));
				green = 255;
				blue = Math.max(0, (255 - (8 * votes)));
			} else if (votes < 0) {
				red = 255;
				green = Math.max(0, (255 - Math.abs(8 * votes)));
				blue = Math.max(0, (255 - Math.abs(8 * votes)));
				voteString = '';
			}
			voteString = voteString + votes;
			var rgb = 'rgb(' + red + ',' + green + ',' + blue + ')';
			if (obj !== null) {
				if (votes === 0) {
					obj.style.display = 'none';
				} else {
					obj.style.display = 'inline';
					if (modules['styleTweaks'].isDark()) {
						obj.style.color = rgb;
					} else {
						obj.style.backgroundColor = rgb;
					}
					if (this.options.vwNumber.value) {
						obj.textContent = '[' + voteString + ']';
					}
					if (this.options.vwTooltip.value) {
						obj.setAttribute('title', 'your votes for ' + escapeHTML(author) + ': ' + escapeHTML(voteString));
					}
				}
			}
		}
	},
	showAuthorInfo: function(obj) {
		var isFriend = obj.classList.contains('friend'),
			thisXY = RESUtils.getXYpos(obj),
			thisWidth = $(obj).width(),
			test = obj.href.match(this.usernameRE),
			myID, friendButton, friendButtonEle;

		if (test) {
			thisUserName = test[1];
		}
		// if (thisUserName.substr(0,3) === '/u/') thisUserName = thisUserName.substr(3);
		$(this.authorInfoToolTipHeader).html('<a href="/user/' + escapeHTML(thisUserName) + '">' + escapeHTML(thisUserName) + '</a> (<a href="/user/' + escapeHTML(thisUserName) + '/submitted/">Links</a>) (<a href="/user/' + escapeHTML(thisUserName) + '/comments/">Comments</a>)');
		RESUtils.getUserInfo(function(userInfo) {
			myID = 't2_' + userInfo.data.id;
			if (isFriend) {
				friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active remove" href="#" tabindex="100" onclick="return toggle(this, unfriend(\'' + obj.textContent + '\', \'' + myID + '\', \'friend\'), friend(\'' + obj.textContent + '\', \'' + myID + '\', \'friend\'))">- friends</a><a class="option add" href="#">+ friends</a></span>';
			} else {
				friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active add" href="#" tabindex="100" onclick="return toggle(this, friend(\'' + obj.textContent + '\', \'' + myID + '\', \'friend\'), unfriend(\'' + obj.textContent + '\', \'' + myID + '\', \'friend\'))">+ friends</a><a class="option remove" href="#">- friends</a></span>';
			}
			friendButtonEle = $(friendButton);
			$(modules['userTagger'].authorInfoToolTipHeader).append(friendButtonEle);
		});
		$(this.authorInfoToolTipContents).html('<a class="hoverAuthor" href="/user/' + escapeHTML(thisUserName) + '">' + escapeHTML(thisUserName) + '</a>:<br><span class="RESThrobber"></span> loading...');
		if (window.innerWidth - thisXY.x - thisWidth <= 450) {
			// tooltip would go off right edge - reverse it.
			this.authorInfoToolTip.classList.add('right');
			var tooltipWidth = $(this.authorInfoToolTip).width();
			this.authorInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 14) + 'px; left: ' + (thisXY.x - tooltipWidth - 30) + 'px;');
		} else {
			this.authorInfoToolTip.classList.remove('right');
			this.authorInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 14) + 'px; left: ' + (thisXY.x + thisWidth + 25) + 'px;');
		}
		if (this.options.fadeSpeed.value < 0 || this.options.fadeSpeed.value > 1 || isNaN(this.options.fadeSpeed.value)) {
			this.options.fadeSpeed.value = 0.3;
		}
		RESUtils.fadeElementIn(this.authorInfoToolTip, this.options.fadeSpeed.value);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'authorInfo');
		setTimeout(function() {
			if (!RESUtils.elementUnderMouse(modules['userTagger'].authorInfoToolTip) && (!RESUtils.elementUnderMouse(obj))) {
				modules['userTagger'].hideAuthorInfo();
			}
		}, 1000);
		obj.addEventListener('mouseout', modules['userTagger'].delayedHideAuthorInfo);
		if (typeof this.authorInfoCache[thisUserName] !== 'undefined') {
			this.writeAuthorInfo(this.authorInfoCache[thisUserName], obj);
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + "//" + location.hostname + "/user/" + thisUserName + "/about.json?app=res",
				onload: function(response) {
					var thisResponse = JSON.parse(response.responseText);
					modules['userTagger'].authorInfoCache[thisUserName] = thisResponse;
					modules['userTagger'].writeAuthorInfo(thisResponse, obj);
				}
			});
		}
	},
	delayedHideAuthorInfo: function(e) {
		modules['userTagger'].hideTimer = setTimeout(function() {
			e.target.removeEventListener('mouseout', modules['userTagger'].delayedHideAuthorInfo);
			modules['userTagger'].hideAuthorInfo();
		}, modules['userTagger'].options.fadeDelay.value);
	},
	writeAuthorInfo: function(jsonData, authorLink) {
		if (!jsonData.data) {
			$(this.authorInfoToolTipContents).text("User not found");
			return false;
		}
		var utctime = jsonData.data.created_utc;
		var d = new Date(utctime * 1000);
		// var userHTML = '<a class="hoverAuthor" href="/user/'+jsonData.data.name+'">'+jsonData.data.name+'</a>:';
		var userHTML = '<div class="authorFieldPair"><div class="authorLabel">Redditor since:</div> <div class="authorDetail">' + RESUtils.niceDate(d, this.options.USDateFormat.value) + ' (' + RESUtils.niceDateDiff(d) + ')</div></div>';
		userHTML += '<div class="authorFieldPair"><div class="authorLabel">Link Karma:</div> <div class="authorDetail">' + escapeHTML(jsonData.data.link_karma) + '</div></div>';
		userHTML += '<div class="authorFieldPair"><div class="authorLabel">Comment Karma:</div> <div class="authorDetail">' + escapeHTML(jsonData.data.comment_karma) + '</div></div>';
		if ((typeof modules['userTagger'].tags[jsonData.data.name] !== 'undefined') && (modules['userTagger'].tags[jsonData.data.name].link)) {
			userHTML += '<div class="authorFieldPair"><div class="authorLabel">Link:</div> <div class="authorDetail"><a target="_blank" href="' + escapeHTML(modules['userTagger'].tags[jsonData.data.name].link) + '">website link</a></div></div>';
		}
		userHTML += '<div class="clear"></div><div class="bottomButtons">';
		userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/message/compose/?to=' + escapeHTML(jsonData.data.name) + '"><img src="https://redditstatic.s3.amazonaws.com/mailgray.png"> send message</a>';
		if (jsonData.data.is_gold) {
			userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/gold/about">User has Reddit Gold</a>';
		} else {
			userHTML += '<a target="_blank" id="gildUser" class="blueButton" href="http://www.reddit.com/gold?goldtype=gift&recipient=' + escapeHTML(jsonData.data.name) + '">Gift Reddit Gold</a>';
		}

		if (this.options.highlightButton.value) {
			if (!this.highlightedUsers || !this.highlightedUsers[jsonData.data.name]) {
				userHTML += '<div class="blueButton" id="highlightUser" user="' + escapeHTML(jsonData.data.name) + '">Highlight</div>';
			} else {
				userHTML += '<div class="redButton" id="highlightUser" user="' + escapeHTML(jsonData.data.name) + '">Unhighlight</div>';
			}
		}

		if ((modules['userTagger'].tags[jsonData.data.name]) && (modules['userTagger'].tags[jsonData.data.name].ignore)) {
			userHTML += '<div class="redButton" id="ignoreUser" user="' + escapeHTML(jsonData.data.name) + '">&empty; Unignore</div>';
		} else {
			userHTML += '<div class="blueButton" id="ignoreUser" user="' + escapeHTML(jsonData.data.name) + '">&empty; Ignore</div>';
		}
		userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		$(this.authorInfoToolTipContents).html(userHTML);
		this.authorInfoToolTipIgnore = this.authorInfoToolTipContents.querySelector('#ignoreUser');
		this.authorInfoToolTipIgnore.addEventListener('click', modules['userTagger'].ignoreUser, false);
		if (modules['userTagger'].options.highlightButton.value) {
			this.authorInfoToolTipHighlight = this.authorInfoToolTipContents.querySelector('#highlightUser');
			if (this.authorInfoToolTipHighlight) {
				this.authorInfoToolTipHighlight.addEventListener('click', function(e) {
					var username = e.target.getAttribute('user');
					modules['userTagger'].toggleUserHighlight(username);
				}, false);
			}
		}
		if (modules['userTagger'].options.gildComments.value && RESUtils.pageType() === 'comments') {
			var giveGold = this.authorInfoToolTipContents.querySelector('#gildUser');
			if (giveGold) {
				giveGold.addEventListener('click', function(e) {
					if (e.ctrlKey || e.cmdKey || e.shiftKey) {
						return;
					}

					var comment = $(authorLink).closest('.comment');
					if (!comment) {
						return;
					}

					modules['userTagger'].hideAuthorInfo();
					var giveGold = comment.find('.give-gold')[0];
					RESUtils.click(giveGold);
					e.preventDefault();
				});
			}
		}
	},
	toggleUserHighlight: function(username) {
		if (!this.highlightedUsers) {
			this.highlightedUsers = {};
		}

		if (this.highlightedUsers[username]) {
			this.highlightedUsers[username].remove();
			delete this.highlightedUsers[username];
			this.toggleUserHighlightButton(true);
		} else {

			this.highlightedUsers[username] =
				modules['userHighlight'].highlightUser(username);
			this.toggleUserHighlightButton(false);
		}
	},
	toggleUserHighlightButton: function(canHighlight) {
		$(this.authorInfoToolTipHighlight)
			.toggleClass('blueButton', canHighlight)
			.toggleClass('redButton', !canHighlight)
			.text(canHighlight ? 'Highlight' : 'Unhighlight');
	},
	ignoreUser: function(e) {
		var thisIgnore, thisName,
			thisColor, thisLink, thisVotes, thisTag;
		
		if (e.target.classList.contains('blueButton')) {
			e.target.classList.remove('blueButton');
			e.target.classList.add('redButton');
			$(e.target).html('&empty; Unignore');
			var thisIgnore = true;
		} else {
			e.target.classList.remove('redButton');
			e.target.classList.add('blueButton');
			$(e.target).html('&empty; Ignore');
			var thisIgnore = false;
		}
		thisName = e.target.getAttribute('user');
		if (modules['userTagger'].tags[thisName]) {
			thisColor = modules['userTagger'].tags[thisName].color || '';
			thisLink = modules['userTagger'].tags[thisName].link || '';
			thisVotes = modules['userTagger'].tags[thisName].votes || 0;
			thisTag = modules['userTagger'].tags[thisName].tag || '';
		}
		if ((thisIgnore) && (thisTag === '')) {
			thisTag = 'ignored';
		} else if ((!thisIgnore) && (thisTag === 'ignored')) {
			thisTag = '';
		}
		modules['userTagger'].setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes, true); // last true is for noclick param
	},
	hideAuthorInfo: function(obj) {
		// this.authorInfoToolTip.setAttribute('style', 'display: none');
		if (this.options.fadeSpeed.value < 0 || this.options.fadeSpeed.value > 1 || isNaN(this.options.fadeSpeed.value)) {
			this.options.fadeSpeed.value = 0.3;
		}
		RESUtils.fadeElementOut(this.authorInfoToolTip, this.options.fadeSpeed.value);
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'authorInfo');
	},
	updateTagStorage: function() {
		// update tag storage format from the old individual bits to a big JSON blob
		// It's OK that we're directly accessing localStorage here because if they have old school tag storage, it IS in localStorage.
		ls = (typeof unsafeWindow !== 'undefined') ? unsafeWindow.localStorage : localStorage;
		var tags = {};
		var toRemove = [];
		for (var i = 0, len = ls.length; i < len; i++) {
			var keySplit = null;
			if (ls.key(i)) {
				keySplit = ls.key(i).split('.');
			}
			if (keySplit) {
				var keyRoot = keySplit[0];
				switch (keyRoot) {
					case 'reddituser':
						var thisNode = keySplit[1];
						if (typeof tags[keySplit[2]] === 'undefined') {
							tags[keySplit[2]] = {};
						}
						if (thisNode === 'votes') {
							tags[keySplit[2]].votes = ls.getItem(ls.key(i));
						} else if (thisNode === 'tag') {
							tags[keySplit[2]].tag = ls.getItem(ls.key(i));
						} else if (thisNode === 'color') {
							tags[keySplit[2]].color = ls.getItem(ls.key(i));
						} else if (thisNode === 'ignore') {
							tags[keySplit[2]].ignore = ls.getItem(ls.key(i));
						}
						// now delete the old stored garbage...
						var keyString = 'reddituser.' + thisNode + '.' + keySplit[2];
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
		for (var i = 0, len = toRemove.length; i < len; i++) {
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
			values: [{
				name: 'None',
				value: 'none'
			}, {
				name: 'Subreddit Bar only',
				value: 'sub'
			}, {
				name: 'User Bar',
				value: 'userbar'
			}, {
				name: 'Subreddit Bar and User bar',
				value: 'subanduser'
			}, {
				name: 'Full Header',
				value: 'header'
			}],
			value: 'none',
			description: 'Pin the subreddit bar or header to the top, even when you scroll.'
		},
		turboSelfText: {
			type: 'boolean',
			value: true,
			description: 'Preload selftext data to make selftext expandos faster (preloads after first expando)'
		},
		showLastEditedTimestamp: {
			type: 'boolean',
			value: true,
			description: 'Show the time that a text post/comment was edited, without having to hover the timestamp.'
		},
		restoreSavedTab: {
			type: 'boolean',
			value: false,
			description: 'The saved tab on pages with the multireddit side bar is now located in that collapsible bar. This will restore it to the header. If you have the \'Save Comments\' module enabled then you\'ll see both the links <em>and</em> comments tabs.'
		}
	},
	description: 'Adds a number of interface enhancements to Reddit, such as "full comments" links, the ability to unhide accidentally hidden posts, and more',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/.*/i
	],
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if ((this.options.toolbarFix.value) && ((RESUtils.pageType() === 'linklist') || RESUtils.pageType() === 'comments')) {
				this.toolbarFix();
			}
			if ((RESUtils.pageType() === 'comments') && (this.options.commentsLinksNewTabs.value)) {
				this.commentsLinksNewTabs();
			}
			// if (((RESUtils.pageType() === 'inbox') || (RESUtils.pageType() === 'profile') || ((RESUtils.pageType() === 'comments') && (RESUtils.currentSubreddit('friends')))) && (this.options.fullCommentsLink.value)) {
			// removed profile pages since Reddit does this natively now for those...
			if (((RESUtils.pageType() === 'inbox') || ((RESUtils.pageType() === 'comments') && (RESUtils.currentSubreddit('friends') === false))) && (this.options.fullCommentsLink.value)) {
				// RESUtils.addCSS('a.redditFullCommentsSub { font-size: 9px !important; color: #BBB !important; }');
				this.fullComments();
			}
			if ((RESUtils.pageType() === 'profile') && (location.href.split('/').indexOf(RESUtils.loggedInUser()) !== -1)) {
				this.editMyComments();
			}
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixSaveLinks.value)) {
				this.fixSaveLinks();
			}
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (this.options.fixHideLinks.value)) {
				this.fixHideLinks();
			}
			if ((this.options.turboSelfText.value) && (RESUtils.pageType() === 'linklist')) {
				this.setUpTurboSelfText();
			}
			if (this.options.showUnreadCountInFavicon.value) {
				var faviconDataurl = 'data:image/x-icon;base64,AAABAAIAEBAAAAAAAABoBQAAJgAAACAgAAAAAAAAqAgAAI4FAAAoAAAAEAAAACAAAAABAAgAAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wBBRP4Aq5qHAFNOSgCkpv4A4Mu0AA8Q/gCAc2cAzM7+ADYvKQCys7QA/urQAGVo/gCGh4kA1NbYAMWvmgBjZWYA5efoAJucngD//+MAwcPFACIk/gCbinkAycGtADo8PgDz2sIAal5RADAy/gBvcHEA9PbzALijkACMfm8AqqmoALCy/gCAgHsAc2piAMnMzwDBw/4AXVxcAJGUlwDOuKMAR0dHANfDrABLTv4Aubu+ADIzNQBbVlEA++HJAP/23ACho6UAa2RdAJOEdQD3+P4A2tzeAO7UvACEeW4AjY2KALCfjgBsa2oArq6uAM/R0wB2cGwA//DWAKOYiACCg4MAemxfAPDw8ABOSkYA4+PjAMm7pgBeWlYAgHt3AGZhWwBtamQA+t7EAGVbUgB7b2QAoaGgAP7kzADdyLEA9Pf6AP774ACwnIoAZ15VAJiHdwBbXWAAy8vLAIh8cAC0oY0AZ2VkALy+vwD+7dMA9t3FAHJwbgB/f38Aqq2vAP//5wB4bWMA7ta/AHVqXwCCfXsAmYp8AIJ1aQDS0tIApKSkAP7jyQDOuaYA/vjeAH1xZQCBgYEArp2MAJ2enwD5+v4A//LYAH5zaQD13MMAd2xhAJWFdgD+69IA/ujPAGxsbABycXAAtqOPAN/IsQDLu6YA/v7+AP/84QD/+t8A/vfbAP7v1QD64MgA1dfZAH5+fgD//uIA/v7jAP/43QD+990AZVxTAP/x1wD+8tcA/u7UAOTk4wCYiHgA///kAP/+4wD++t8A/vneAP743QD/79UA/u3SAP7s0gD+69EA/unQAPXcxACrra8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AD8/Pz8/Pz8/Pz8/Pz8/Pz8/XV1dKY8IYgiPKV1dXV0/P11QVDubPYQ9mztUUF1dP4krRC1+V26Fbld+LUQrXT+UiiV+fiFoQ2ghfn4lil0/P15+fn5+fn5+fn5+fl5dPx8qfn4iHAl+CRwifn4qHz9IHTx+BQcmfiYHBX48HUg/PjYZDh5+fn5+fh4OGTY+P0YzOCBKOTILcCNJIDgzRj8/XV1dfFkXClUQGl1qXV0/P11dXTB4XWdrXV1YRzpdPz9dXV1dXV1vZBhCVlEEXT8/XV1dXV2DY0xtQCRaZl0/P11dXV1dXV1dXV1dXV1dPz8/Pz8/Pz8/Pz8/Pz8/Pz8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAACAAAABAAAAAAQAIAAAAAACABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AJSr/AJmJegCIjf4AREZIANzFsADGy/4AUFb/ACgjHwBpamsAAAD/AP/mzQCmp6cA2dnaAL29vgDl6P4AYllPAMWzoAAQEhQAMjQ2AHp7fQCxtv4AlZaWAP784AASFv4A7NfAALGgjwCCdGYAy8vLAPPz9ACJiosARz83AFZNRAB1aV0A1Nj+AFJTVQCzs7MAjX9yAFtdXwDi4uIAqJaGALyplgDRvagAMiwnABkbHQB9g/4ACgoKAOLPuQD+8dcA6+vrAGphVwCdnp4A9t3GAD43LwB0dHQAgYOEADw8PAAdIf8A0tLSAPf5/wC5vv4AxcXGAJ+QgAAbFxMA3eH/AGJjZACtra0A9+rSAE9HQADs7/4AIyQmAHl1aQAsLzEATE5QAEpP/wAhHRoAXFJIAI+PjwAeICIAAwUHAD9BQgBWWFoAwa6bAMm8qAATEA0A///nAOnSuwAVFxgA3d3dAHltYACJe20AlIV2APj4+AA4My4A/vfcAP7s0gDUwa0AuaSSAPviyQA4ODgAt7e3AKGiogAODg8AKyssAMvP/gCBh/4ALiklAIR3awDOzs8A38u2AH9wYwAIBgQAb2NYADYwKgD7+/sA8PDwAPPbxABJS00AwcLCABke/gDY2/8ADgwJAAUDAgAjIB0A+eXMAF9gYgCbm5sAkpOUABQSEQBEPDUAUVFRAIWFhQAZGRkAIyMjAPP1/gDp7P4AtaORAAYHBwAfGxgA39/gAC8xMwDv2cIASUE4AK+vsADmz7kAAQMFABAQEAD+6dAAMSokAEE4MQBVS0EAyLWhAGVlZQCai30AjIyMAP7+4wAUFBQA/vneAP7z2gD+7tUALy8vADs1LgComYgA/f39APb29gAbHR8A/ePLAPngyADb29sAQkRGAEZISgDWw68A07+qAFpQRgBkW1EAvquYAHZ2dgCWh3gADw0MACAiJAD8584ANTc5ADc5OwDZxrEAV1dXAAMCAgDiy7UAjI2PAAwLCwDb3/4Aw7CcAJ+foACDdmgAoZGCABIUFgAjHxoAJSUlAPbcxADIzf4A79fAAOzZwgC3vP4A59G7AOLNtwBdXV0Av62aAAQEBAAGBQQACQgHABYWFgD09PUAFxocADAzNQDDw8MAWE5FAMOynwBaXF0AbmJWAGBiYwC3opAAAgEBABISEgD+6M8A/OXNADAqJgAyLSkANi8oADQ1NgDTvakAtba3AMGwnQBkWk8Aq6ytAG1jWQBjZWYAnY+AAP//5QD+9dsA+N7GAODNtwDRv6oAw66bAAcICQD+/v4A+vr6ABQRDgD5+fkAFhgZAP/43QAaGhoA8fHxAP/w1gD/7dMA6urqAP///wAAVvz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8VgD8NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTX8AKA1NTU1NTU1NagM/fz8oKCg/KDfqDU1NTU1NTU1NaAAoDU1NTU1NQz8p63CWq4gIJciA5g1oJQ1NTU1NTU1oACgNTU1Naf8uCKLz8NJq9knStX4z/ZNEmDfNTU1NTWgAPw1NTX9Gq/dRzhtXQEBAQEBAaQOF7cAgmH8NTU1NfwAoDU1oNhVtJD09PT09PSlHqT09PT09B1RAOwx7zU1oACgNaDOAEL19PT09CWDhtKd+mSbXfT09PROACb8NTWgAKDgy3sK9PT09PTNALl/D9ZDsdLF+/T09PRmAM5gNaAA/PyuRwEBAQEBAU4dAQEBAQEBdIR0AQEBAQFSxLWo/ADuV93p9PT09PT09PT09PT09PT09PT09PT09IwA8pSgABgqijL09PT09PT09PT09PT09PT09PT09PT09EccoKAAnLBn0/T09PT09COH9PT09PT09GlG9PT09PT0jRxfoADtcQBZAQEBATwICwJBAQEBATxLCzp5AQEBAQFY48n5AIlQkzf09PT0BwsLC2r09PT0xwsLCy709PT0Zc9HLJ8AlhVlADv09PQQGQsLyvT09PSIeAsLPfT09PfSmR5Q3ACVvPSDZ6n09PQjLhb09PT09PS+BD309PTTOYX79NXBAG/UdAG53g0BAQEBAQEBAQEBAQEBAQEBPmihdAH+kmIARGsT23YAALaQXfT09PT09PT09PT0PiTdAKrmNC1y7gD5dVuC186sIdDDJIAPWf4yjB3Afk/doufxIHpV6I5fAKBjoKCglN+gzLKPQNGK82cv0FU2wa1glN+UyHWgY6AA/DU1NTU1NTWnoKBjkSspAD8wdf2gDDU1DJQMqDU1/ACgNTU1NTU1NTU1NainlPx8bPmoNTU1Y5Tlv3XfxjWgAKA1NTU1NTU1NTU1NTU1MeprlDU1NajgEbqKTGHfNaAAoDU1NTU1NTU1NTU1NTWUsLq7pzVjnlySdygFCX2ooAD8NTU1NTU1NTU1NTU1NWN1vcLt/Y5UxOsBAQ4ABgz8AKA1NTU1NTU1NTU1NTU1NfxF4kheky+z5HP0H3DIY6AAoDU1NTU1NTU1NTU1NTU1YBuB4TOj8G6LphQAmmA1oACgNTU1NTU1NTU1NTU1NTU1qMiU/GCnlMvB2lNgNTWgAPw1NTU1NTU1NTU1NTU1NTXvY+81NTU1p6D8lDU1NfwAVvz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8VgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAP////8K';
				// remove current favicons and replace accordingly, or tinycon has a cross domain issue since the real favicon is on redditstatic.com.
				$('head link[rel="shortcut icon"], head link[rel="icon"]').attr('href', faviconDataurl);
			}
			if ((modules['betteReddit'].options.showLastEditedTimestamp.value) && ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments'))) {
				RESUtils.addCSS('.edited-timestamp[title]:after{content:" (" attr(title) ")";font-size: 90%;}');
			}
			if ((modules['betteReddit'].options.restoreSavedTab.value) && (RESUtils.loggedInUser() !== null) && document.querySelector('.with-listing-chooser:not(.profile-page)')) {
				this.restoreSavedTab();
			}
			if ((modules['betteReddit'].options.toolbarFix.value) && (RESUtils.pageType() === 'linklist')) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].toolbarFix);
			}
			if ((RESUtils.pageType() === 'inbox') && (modules['betteReddit'].options.fullCommentsLink.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fullComments);
			}
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (modules['betteReddit'].options.fixSaveLinks.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fixSaveLinks);
			}
			if (((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments')) && (modules['betteReddit'].options.fixHideLinks.value)) {
				RESUtils.watchForElement('siteTable', modules['betteReddit'].fixHideLinks);
			}
			if ((RESUtils.pageType() === 'comments') && (modules['betteReddit'].options.commentsLinksNewTabs.value)) {
				RESUtils.watchForElement('newComments', modules['betteReddit'].commentsLinksNewTabs);
			}

			if (this.options.searchSubredditByDefault.value) {
				// make sure we're not on a search results page...
				if (!/\/[r|m]\/[\w+\-]+\/search/.test(location.href.match)) {
					this.searchSubredditByDefault();
				}
			}
			if ((this.options.videoTimes.value) && ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments'))) {
				this.getVideoTimes();
				// listen for new DOM nodes so that modules like autopager, river of reddit, etc still get l+c links...

				RESUtils.watchForElement('siteTable', modules['betteReddit'].getVideoTimes);
			}
			if ((RESUtils.loggedInUser() !== null) && ((this.options.showUnreadCount.value) || (this.options.showUnreadCountInTitle.value) || (this.options.showUnreadCountInFavicon.value))) {
				// Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
				// RESUtils.addCSS('#mail { min-width: 16px !important; width: auto !important; text-indent: 18px !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				// removing text indent - on 11/14/11 reddit changed the mail sprites, so I have to change how this is handled..
				RESUtils.addCSS('#mail { top: 2px; min-width: 16px !important; width: auto !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				// RESUtils.addCSS('#mail.havemail { top: 2px !important; margin-right: 1px; }');
				RESUtils.addCSS('#mail.havemail { top: 2px !important; }');
				if ((BrowserDetect.isChrome()) || (BrowserDetect.isSafari())) {
					// I hate that I have this conditional CSS in here but I can't figure out why it's needed for webkit and screws up firefox.
					RESUtils.addCSS('#mail.havemail { top: 0; }');
				}
				this.showUnreadCount();
			}
			switch (this.options.pinHeader.value) {
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
		}
	},
	commentsLinksNewTabs: function(ele) {
		ele = ele || document.body;
		var links = ele.querySelectorAll('div.md a');
		for (var i = 0, len = links.length; i < len; i++) {
			links[i].target = '_blank';
		}
	},
	setUpTurboSelfText: function() {
		// TODO: Turbo selftext seems a little wonky on NER pages
		modules['betteReddit'].selfTextHash = {};
		$('body').on('click', '.expando-button.selftext:not(".twitter"):not(.toggleImage)', modules['betteReddit'].showSelfText);
		$('#siteTable').data('jsonURL', location.href + '.json');

		RESUtils.watchForElement('siteTable', modules['betteReddit'].setNextSelftextURL);
	},
	setNextSelftextURL: function(ele) {
		if (modules['neverEndingReddit'].nextPageURL) {
			var jsonURL = modules['neverEndingReddit'].nextPageURL.replace('/?', '/.json?');
			$(ele).data('jsonURL', jsonURL);
		}
	},
	showSelfText: function(event) {
		var thisID = $(event.target).parent().parent().data('fullname');
		if (typeof modules['betteReddit'].selfTextHash[thisID] === 'undefined') {
			// we haven't gotten JSON data for this set of links yet... get it, then replace the click listeners with our own...
			var jsonURL = $(event.target).closest('.sitetable.linklisting').data('jsonURL');
			modules['betteReddit'].getSelfTextData(jsonURL);
		} else {
			if ($(event.target).hasClass('collapsed') || $(event.target).hasClass('collapsedExpando')) {
				// the duplicate classes here unfortunately have to exist due to Reddit clobbering things with .collapsed
				// and no real elegant way that I've thought of to fix the fact that selfText expandos still have that class.
				$(event.target).removeClass('collapsed collapsedExpando');
				$(event.target).addClass('expanded');
				$(event.target).parent().find('.expando').html(
					'<form class="usertext"><div class="usertext-body">' +
					$('<div/>').html(modules['betteReddit'].selfTextHash[thisID]).text() +
					'</div></form>'
				).show();
			} else {
				$(event.target).removeClass('expanded');
				$(event.target).addClass('collapsedExpando');
				$(event.target).addClass('collapsed');
				$(event.target).parent().find('.expando').hide();
			}

		}
	},
	getSelfTextData: function(href) {
		if (!modules['betteReddit'].gettingSelfTextData) {
			modules['betteReddit'].gettingSelfTextData = true;
			$.getJSON(href, modules['betteReddit'].applyTurboSelfText);
		}
	},
	applyTurboSelfText: function(data) {
		var linkList = data.data.children;

		delete modules['betteReddit'].gettingSelfTextData;
		for (var i = 0, len = linkList.length; i < len; i++) {
			var thisID = linkList[i].data.name;
			if (i === 0) {
				var thisSiteTable = $('.id-' + thisID).closest('.sitetable.linklisting');
				$(thisSiteTable).find('.expando-button.selftext').removeAttr('onclick');
			}
			modules['betteReddit'].selfTextHash[thisID] = linkList[i].data.selftext_html;
		}
	},
	getInboxLink: function(havemail) {
		if (havemail && !modules['betteReddit'].options.unreadLinksToInbox.value) {
			return '/message/unread/';
		}

		return '/message/inbox/';
	},
	showUnreadCount: function() {
		if (typeof this.mail === 'undefined') {
			this.mail = document.querySelector('#mail');
			if (this.mail) {
				this.mailCount = RESUtils.createElementWithID('a', 'mailCount');
				this.mailCount.display = 'none';
				this.mailCount.setAttribute('href', this.getInboxLink(true));
				RESUtils.insertAfter(this.mail, this.mailCount);
			}
		}
		if (this.mail) {
			$(modules['betteReddit'].mail).html('');
			if (this.mail.classList.contains('havemail')) {
				this.mail.setAttribute('href', this.getInboxLink(true));
				var lastCheck = parseInt(RESStorage.getItem('RESmodules.betteReddit.msgCount.lastCheck.' + RESUtils.loggedInUser()), 10) || 0;
				var now = Date.now();
				// 300000 = 5 minutes... we don't want to annoy Reddit's servers too much with this query...
				if ((now - lastCheck) > 300000) {
					GM_xmlhttpRequest({
						method: "GET",
						url: location.protocol + '//' + location.hostname + "/message/unread/.json?mark=false&app=res",
						onload: function(response) {
							// save that we've checked in the last 5 minutes
							var now = Date.now();
							RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.' + RESUtils.loggedInUser(), now);
							var data = JSON.parse(response.responseText);
							var count = data.data.children.length;
							RESStorage.setItem('RESmodules.betteReddit.msgCount.' + RESUtils.loggedInUser(), count);
							modules['betteReddit'].setUnreadCount(count);
						}
					});
				} else {
					var count = RESStorage.getItem('RESmodules.betteReddit.msgCount.' + RESUtils.loggedInUser());
					modules['betteReddit'].setUnreadCount(count);
				}
			} else {
				// console.log('no need to get count - no new mail. resetting lastCheck');
				modules['betteReddit'].setUnreadCount(0);
				RESStorage.setItem('RESmodules.betteReddit.msgCount.lastCheck.' + RESUtils.loggedInUser(), 0);
			}
		}
	},
	setUnreadCount: function(count) {
		if (this.options.showUnreadCountInFavicon.value) {
			window.Tinycon.setOptions({
				fallback: false
			});
		}
		if (count > 0) {
			if (this.options.showUnreadCountInTitle.value) {
				var newTitle = '[' + count + '] ' + document.title.replace(/^\[[\d]+\]\s/, '');
				document.title = newTitle;
			}
			if (this.options.showUnreadCountInFavicon.value) {
				window.Tinycon.setBubble(count);
			}
			if (this.options.showUnreadCount.value) {
				modules['betteReddit'].mailCount.display = 'inline-block';
				modules['betteReddit'].mailCount.textContent = '[' + count + ']';
				if (modules['neverEndingReddit'].NREMailCount) {
					modules['neverEndingReddit'].NREMailCount.display = 'inline-block';
					modules['neverEndingReddit'].NREMailCount.textContent = '[' + count + ']';
				}
			}
		} else {
			var newTitle = document.title.replace(/^\[[\d]+\]\s/, '');
			document.title = newTitle;
			if (modules['betteReddit'].mailCount) {
				modules['betteReddit'].mailCount.display = 'none';
				$(modules['betteReddit'].mailCount).html('');
				if (modules['neverEndingReddit'].NREMailCount) {
					modules['neverEndingReddit'].NREMailCount.display = 'none';
					$(modules['neverEndingReddit'].NREMailCount).html('');
				}
			}
			if (this.options.showUnreadCountInFavicon.value) {
				window.Tinycon.setBubble(0);
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
		'plus.google.com',
		'soundcloud.com',
		'instagram.com'
	],
	checkToolbarLink: function(url) {
		for (var i = 0, len = this.toolbarFixLinks.length; i < len; i++) {
			if (url.indexOf(this.toolbarFixLinks[i]) !== -1) {
				return true;
			}
		}
		return false;
	},
	toolbarFix: function(ele) {
		var root = ele || document;
		var links = root.querySelectorAll('div.entry a.title');
		for (var i = 0, len = links.length; i < len; i++) {
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

		for (var i = 0, len = entries.length; i < len; i++) {
			var linkEle = entries[i].querySelector('A.bylink');
			var thisCommentsLink = '';
			if ((typeof linkEle !== 'undefined') && (linkEle !== null)) {
				thisCommentsLink = linkEle.getAttribute('href');
			}
			if (thisCommentsLink !== '') {
				thisCommentsSplit = thisCommentsLink.split("/");
				thisCommentsSplit.pop();
				thisCommentsLink = thisCommentsSplit.join("/");
				linkList = entries[i].querySelector('.flat-list');
				var fullCommentsLink = document.createElement('li');
				$(fullCommentsLink).html('<a class="redditFullComments" href="' + escapeHTML(thisCommentsLink) + '">' + escapeHTML(modules['betteReddit'].options.fullCommentsText.value) + '</a>');
				linkList.appendChild(fullCommentsLink);
			}
		}
	},
	editMyComments: function(ele) {
		var root = ele || document;
		var entries = root.querySelectorAll('#siteTable .entry');
		for (var i = 0, len = entries.length; i < len; i++) {
			var linkEle = entries[i].querySelector('A.bylink');
			var thisCommentsLink = '';
			if ((typeof linkEle !== 'undefined') && (linkEle !== null)) {
				thisCommentsLink = linkEle.getAttribute('href');
			}
			if (thisCommentsLink !== '') {
				permalink = entries[i].querySelector('.flat-list li.first');
				var editLink = document.createElement('li');
				$(editLink).html('<a onclick="return edit_usertext(this)" href="javascript:void(0);">edit</a>');
				RESUtils.insertAfter(permalink, editLink);
			}
		}
	},
	fixSaveLinks: function(ele) {
		var root = ele || document;
		var saveLinks = root.querySelectorAll('li:not(.comment-save-button) > FORM.save-button > SPAN > A');
		for (var i = 0, len = saveLinks.length; i < len; i++) {
			saveLinks[i].removeAttribute('onclick');
			saveLinks[i].setAttribute('action', 'save');
			saveLinks[i].addEventListener('click', modules['betteReddit'].saveLink, false);
		}
		var unsaveLinks = document.querySelectorAll('FORM.unsave-button > SPAN > A');
		for (var i = 0, len = saveLinks.length; i < len; i++) {
			if (typeof unsaveLinks[i] !== 'undefined') {
				unsaveLinks[i].removeAttribute('onclick');
				unsaveLinks[i].setAttribute('action', 'unsave');
				unsaveLinks[i].addEventListener('click', modules['betteReddit'].saveLink, false);
			}
		}
	},
	fixHideLinks: function(ele) {
		var root = ele || document;
		var hideLinks = root.querySelectorAll('FORM.hide-button > SPAN > A');
		for (var i = 0, len = hideLinks.length; i < len; i++) {
			hideLinks[i].removeAttribute('onclick');
			hideLinks[i].setAttribute('action', 'hide');
			hideLinks[i].addEventListener('click', modules['betteReddit'].hideLinkEventHandler, false);
		}
		var unhideLinks = document.querySelectorAll('FORM.unhide-button > SPAN > A');
		for (var i = 0, len = hideLinks.length; i < len; i++) {
			if (typeof unhideLinks[i] !== 'undefined') {
				unhideLinks[i].removeAttribute('onclick');
				unhideLinks[i].setAttribute('action', 'unhide');
				unhideLinks[i].addEventListener('click', modules['betteReddit'].hideLinkEventHandler, false);
			}
		}
	},
	saveLink: function(e) {
		if (e) {
			modules['betteReddit'].saveLinkClicked = e.target;
		}
		if (modules['betteReddit'].saveLinkClicked.getAttribute('action') === 'unsave') {
			$(modules['betteReddit'].saveLinkClicked).text('unsaving...');
		} else {
			$(modules['betteReddit'].saveLinkClicked).text('saving...');
		}
		if (modules['betteReddit'].modhash) {
			var action = modules['betteReddit'].saveLinkClicked.getAttribute('action'),
				parentThing = modules['betteReddit'].saveLinkClicked.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode,
				idRe = /id-([\w]+)/i,
				getLinkid = idRe.exec(parentThing.getAttribute('class')),
				linkid = getLinkid[1],
				executed, apiURL, params;

			if (action === 'unsave') {
				executed = 'unsaved';
				apiURL = location.protocol + '//' + location.hostname + '/api/unsave';
			} else {
				executed = 'saved';
				apiURL = location.protocol + '//' + location.hostname + '/api/save';
			}
			params = 'id=' + linkid + '&executed=' + executed + '&uh=' + modules['betteReddit'].modhash + '&renderstyle=html';
			GM_xmlhttpRequest({
				method: "POST",
				url: apiURL,
				data: params,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				onload: function(response) {
					if (response.status === 200) {
						if (modules['betteReddit'].saveLinkClicked.getAttribute('action') === 'unsave') {
							$(modules['betteReddit'].saveLinkClicked).text('save');
							modules['betteReddit'].saveLinkClicked.setAttribute('action', 'save');
						} else {
							$(modules['betteReddit'].saveLinkClicked).text('unsave');
							modules['betteReddit'].saveLinkClicked.setAttribute('action', 'unsave');
						}
					} else {
						delete modules['betteReddit'].modhash;
						alert('Sorry, there was an error trying to ' + modules['betteReddit'].saveLinkClicked.getAttribute('action') + ' your submission. Try clicking again.');
					}
				}
			});
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + '//' + location.hostname + '/api/me.json?app=res',
				onload: function(response) {
					var data = safeJSON.parse(response.responseText);
					if (typeof data.data === 'undefined') {
						alert('Sorry, there was an error trying to ' + modules['betteReddit'].saveLinkClicked.getAttribute('action') + ' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
					} else if ((typeof data.data.modhash !== 'undefined') && (data.data.modhash)) {
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
		if (clickedLink.getAttribute('action') === 'unhide') {
			$(clickedLink).text('unhiding...');
		} else {
			$(clickedLink).text('hiding...');
		}
		if (modules['betteReddit'].modhash) {
			var action = clickedLink.getAttribute('action'),
				parentThing = clickedLink.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode,
				idRe = /id-([\w]+)/i,
				getLinkid = idRe.exec(parentThing.getAttribute('class')),
				linkid = getLinkid[1],
				executed, apiURL, params;

			if (action === 'unhide') {
				executed = 'unhidden';
				apiURL = location.protocol + '//' + location.hostname + '/api/unhide';
			} else {
				executed = 'hidden';
				apiURL = location.protocol + '//' + location.hostname + '/api/hide';
			}
			params = 'id=' + linkid + '&executed=' + executed + '&uh=' + modules['betteReddit'].modhash + '&renderstyle=html';

			GM_xmlhttpRequest({
				method: "POST",
				url: apiURL,
				data: params,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				onload: function(response) {
					if (response.status === 200) {
						if (clickedLink.getAttribute('action') === 'unhide') {
							$(clickedLink).text('hide');
							clickedLink.setAttribute('action', 'hide');
							if (typeof modules['betteReddit'].hideTimer !== 'undefined') {
								clearTimeout(modules['betteReddit'].hideTimer);
							}
						} else {
							$(clickedLink).text('unhide');
							clickedLink.setAttribute('action', 'unhide');
							modules['betteReddit'].hideTimer = setTimeout(function() {
								modules['betteReddit'].hideFader(clickedLink);
							}, 5000);
						}
					} else {
						delete modules['betteReddit'].modhash;
						alert('Sorry, there was an error trying to ' + clickedLink.getAttribute('action') + ' your submission. Try clicking again.');
					}
				}
			});
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + '//' + location.hostname + '/api/me.json?app=res',
				onload: function(response) {
					var data = safeJSON.parse(response.responseText);
					if (typeof data.data === 'undefined') {
						alert('Sorry, there was an error trying to ' + clickedLink.getAttribute('action') + ' your submission. You may have third party cookies disabled. You will need to either enable third party cookies, or add an exception for *.reddit.com');
					} else if ((typeof data.data.modhash !== 'undefined') && (data.data.modhash)) {
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
		var youtubeLinks = obj.querySelectorAll('a.title[href*="youtube.com"], a.title[href*="youtu.be"]');
		var shortenedYoutubeLinks = obj.querySelectorAll('a.title[href*="youtube.com"]');
		var titleHasTimeRegex = /[\[|\(][0-9]*:[0-9]*[\]|\)]/;
		if (youtubeLinks) {
			var ytLinks = [];
			for (var i = 0, len = youtubeLinks.length; i < len; i += 1) {
				if (!titleHasTimeRegex.test(youtubeLinks[i].innerHTML)) {
					ytLinks.push(youtubeLinks[i]);
				}
			}
			youtubeLinks = ytLinks;
			var getYoutubeIDRegex = /\/?[\&|\?]?v\/?=?([\w\-]{11})&?/i;
			var getShortenedYoutubeIDRegex = /([\w\-]{11})&?/i;
			var getYoutubeStartTimeRegex = /\[[\d]+:[\d]+\]/i;
			var tempIDs = [];
			modules['betteReddit'].youtubeLinkIDs = {};
			modules['betteReddit'].youtubeLinkRefs = [];
			for (var i = 0, len = youtubeLinks.length; i < len; i++) {
				var match = getYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href'));
				var shortened = /youtu\.be/i;
				var isShortened = shortened.exec(youtubeLinks[i].getAttribute('href'));
				if (isShortened) {
					var smatch = getShortenedYoutubeIDRegex.exec(youtubeLinks[i].getAttribute('href'));
					if (smatch) {
						var thisYTID = '"' + smatch[1] + '"';
						modules['betteReddit'].youtubeLinkIDs[thisYTID] = youtubeLinks[i];
						modules['betteReddit'].youtubeLinkRefs.push([thisYTID, youtubeLinks[i]]);
					}
				} else if (match) {
					// add quotes so URL creation is doable with just a join...
					var thisYTID = '"' + match[1] + '"';
					modules['betteReddit'].youtubeLinkIDs[thisYTID] = youtubeLinks[i];
					modules['betteReddit'].youtubeLinkRefs.push([thisYTID, youtubeLinks[i]]);
				}
				var timeMatch = getYoutubeStartTimeRegex.exec(youtubeLinks[i].getAttribute('href'));
				var titleMatch = titleHasTimeRegex.test(youtubeLinks[i].innerHTML);
				if (timeMatch && !titleMatch) {
					youtubeLinks[i].textContent += ' (@' + timeMatch[1] + ')';
				}
			}
			for (var id in modules['betteReddit'].youtubeLinkIDs) {
				tempIDs.push(id);
			}
			modules['betteReddit'].youtubeLinkIDs = tempIDs;
			modules['betteReddit'].getVideoJSON();
		}
	},
	getVideoJSON: function() {
		var thisBatch = modules['betteReddit'].youtubeLinkIDs.splice(0, 8);
		if (thisBatch.length) {
			var thisIDString = thisBatch.join('%7C');
			// var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q='+thisIDString+'&fields=entry(id,media:group(yt:duration))&alt=json';
			var jsonURL = 'http://gdata.youtube.com/feeds/api/videos?q=' + thisIDString + '&v=2&fields=entry(id,title,media:group(yt:duration,yt:videoid,yt:uploaded))&alt=json';
			GM_xmlhttpRequest({
				method: "GET",
				url: jsonURL,
				onload: function(response) {
					var data = safeJSON.parse(response.responseText, null, true);
					if ((typeof data.feed !== 'undefined') && (typeof data.feed.entry !== 'undefined')) {
						for (var i = 0, len = data.feed.entry.length; i < len; i++) {
							var thisYTID = '"' + data.feed.entry[i]['media$group']['yt$videoid']['$t'] + '"',
								thisTotalSecs = data.feed.entry[i]['media$group']['yt$duration']['seconds'],
								thisTitle = data.feed.entry[i]['title']['$t'],
								thisMins = Math.floor(thisTotalSecs / 60),
								thisSecs = (thisTotalSecs % 60),
								thisUploaded, thisTime;

							if (thisSecs < 10) {
								thisSecs = '0' + thisSecs;
							}
							thisTime = ' - [' + thisMins + ':' + thisSecs + ']';
							if (modules['betteReddit'].options.videoUploaded.value) {
								thisUploaded = data.feed.entry[i]['media$group']['yt$uploaded']['$t'];
								thisUploaded = thisUploaded.match(/[^T]*/);
								thisTime += '[' + thisUploaded + ']';
							}
							for (var j = 0, lenj = modules['betteReddit'].youtubeLinkRefs.length; j < lenj; j += 1) {
								if (modules['betteReddit'].youtubeLinkRefs[j][0] === thisYTID) {
									modules['betteReddit'].youtubeLinkRefs[j][1].textContent += ' ' + thisTime;
									modules['betteReddit'].youtubeLinkRefs[j][1].setAttribute('title', 'YouTube title: ' + thisTitle);
								}
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
		if (sb == null) {
			return; // reddit is under heavy load
		}
		var header = document.getElementById('header');

		// add a dummy <div> inside the header to replace the subreddit bar (for spacing)
		var spacer = document.createElement('div');
		// null parameter is necessary for FF3.6 compatibility.
		spacer.style.paddingTop = window.getComputedStyle(sb, null).paddingTop;
		spacer.style.paddingBottom = window.getComputedStyle(sb, null).paddingBottom;

		// HACK: for some reason, if the SM is enabled, the SB gets squeezed horizontally,
		//       and takes up three rows of vertical space (even at low horizontal resolution).
		if (sm) {
			spacer.style.height = (parseInt(window.getComputedStyle(sb, null).height, 10) / 3 - 3) + 'px';
		} else {
			spacer.style.height = window.getComputedStyle(sb, null).height;
		}

		//window.setTimeout(function(){
		// add the spacer; take the subreddit bar out of the header and put it above
		header.insertBefore(spacer, sb);
		document.body.insertBefore(sb, header);

		// make it fixed
		// RESUtils.addCSS('div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; box-shadow: 0 2px 2px #AAA;}');
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
		RESUtils.addCSS('#header-bottom-right { height: ' + parseInt(thisHeight + 1, 10) + 'px; }');
		// make the account switcher menu fixed
		window.addEventListener('scroll', modules['betteReddit'].handleScroll, false);
		this.pinCommonElements();
	},
	handleScroll: function(e) {
		if (modules['betteReddit'].scrollTimer) {
			clearTimeout(modules['betteReddit'].scrollTimer);
		}
		modules['betteReddit'].scrollTimer = setTimeout(modules['betteReddit'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function(e) {
		if (RESUtils.elementInViewport(modules['betteReddit'].userBarElement)) {
			modules['betteReddit'].userBarElement.setAttribute('style', '');
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: absolute;');
			}
		} else if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: fixed;');
			}
			modules['betteReddit'].userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 19px; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		} else {
			if (typeof modules['accountSwitcher'].accountMenu !== 'undefined') {
				$(modules['accountSwitcher'].accountMenu).attr('style', 'position: fixed;');
			}
			modules['betteReddit'].userBarElement.setAttribute('style', 'position: fixed; z-index: 10000 !important; top: 0; right: 0; opacity: 0.6; -webkit-transition:opacity 0.3s ease-in; -moz-transition:opacity 0.3s ease-in; -o-transition:opacity 0.3s ease-in; -ms-transition:opacity 0.3s ease-in; -transition:opacity 0.3s ease-in;');
		}
	},
	pinHeader: function() {
		// Makes the Full header a fixed element

		// the subreddit manager code changes the document's structure
		var sm = modules['subredditManager'].isEnabled();

		var header = document.getElementById('header');
		if (header == null) {
			return; // reddit is under heavy load
		}

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
		// RESUtils.addCSS('#header {left: 0; right: 0; box-shadow: 0 2px 2px #AAA;}');
		RESUtils.addCSS('#header {left: 0; right: 0; }');
		var headerHeight = $('#header').height() + 15;
		RESUtils.addCSS('#RESNotifications { top: ' + headerHeight + 'px } ');
		this.pinCommonElements(sm);

		// TODO Needs testing
		// Sometimes this gets executed before the subreddit logo has finished loading. When that
		// happens, the spacer gets created too short, so when the SR logo finally loads, the header
		// grows and overlaps the top of the page, potentially obscuring the first link. This checks
		// to see if the image is finished loading. If it is, then the spacer's height is set. Otherwise,
		// it pauses, then loops.
		// added a check that this element exists, so it doesn't error out RES.
		if (document.getElementById('header-img') && (!document.getElementById('header-img').complete)) {
			setTimeout(function() {
				if (document.getElementById('header-img').complete) {
					// null parameter is necessary for FF3.6 compatibility.
					document.getElementById('RESPinnedHeaderSpacer').style.height = window.getComputedStyle(document.getElementById('header'), null).height;
				} else {
					setTimeout(arguments.callee, 10);
				}
			}, 10);
		}
	},
	pinCommonElements: function(sm) {
		// pin the elements common to both pinHeader() and pinSubredditBar()
		if (sm) {
			// RES's subreddit menu
			RESUtils.addCSS('#RESSubredditGroupDropdown, #srList, #RESShortcutsAddFormContainer, #editShortcutDialog {position: fixed !important;}');
		} else {
			RESUtils.addCSS('#sr-more-link: {position: fixed;}');
		}
	},
	restoreSavedTab: function() {
		var tabmenu = document.querySelector('#header .tabmenu'),
			li = document.createElement('li'),
			a = document.createElement('a'),
			user = RESUtils.loggedInUser();
		a.textContent = 'saved';
		a.href = '/user/' + user + '/saved/';
		li.appendChild(a);
		tabmenu.appendChild(li);
	}
};

modules['singleClick'] = {
	moduleID: 'singleClick',
	moduleName: 'Single Click Opener',
	category: 'UI',
	options: {
		openOrder: {
			type: 'enum',
			values: [{
				name: 'open comments then link',
				value: 'commentsfirst'
			}, {
				name: 'open link then comments',
				value: 'linkfirst'
			}],
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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[-\w\._]*\//i
	],
	exclude: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[-\w\._\/\?]*\/comments[-\w\._\/\?=]*/i
	],
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.redditSingleClick { color: #888; font-weight: bold; cursor: pointer; padding: 0 1px; }');
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
		for (var i = 0, len = entries.length; i < len; i++) {
			if ((typeof entries[i] !== 'undefined') && (!entries[i].classList.contains('lcTagged'))) {
				entries[i].classList.add('lcTagged');
				var thisLA = entries[i].querySelector('A.title');
				if (thisLA !== null) {
					var thisLink = thisLA.getAttribute('href');
					var thisComments = entries[i].querySelector('.comments');
					if (!/^https?/i.test(thisLink)) {
						thisLink = location.protocol + '//' + document.domain + thisLink;
					}
					var thisUL = entries[i].querySelector('ul.flat-list');
					var singleClickLI = document.createElement('li');
					// changed from a link to a span because you can't cancel a new window on middle click of a link during the mousedown event, and a click event isn't triggered.
					var singleClickLink = document.createElement('span');
					// singleClickLink.setAttribute('href','javascript:void(0);');
					singleClickLink.setAttribute('class', 'redditSingleClick');
					singleClickLink.setAttribute('thisLink', thisLink);
					singleClickLink.setAttribute('thisComments', thisComments);
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
						if (e.button !== 2) {
							// check if it's a relative link (no http://domain) because chrome barfs on these when creating a new tab...
							var thisLink = $(this).parent().parent().parent().find('a.title').attr('href');
							if (!/^http/i.test(thisLink)) {
								thisLink = 'http://' + document.domain + thisLink;
							}

							var thisJSON = {
								requestType: 'singleClick',
								linkURL: thisLink,
								openOrder: modules['singleClick'].options.openOrder.value,
								commentsURL: this.getAttribute('thisComments'),
								button: lcMouseBtn,
								ctrl: e.ctrlKey
							};

							RESUtils.sendMessage(thisJSON);
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
		enableBigEditor: {
			type: 'boolean',
			value: true,
			description: 'Enable the 2 column editor.'
		},
		draftStyle: {
			type: 'boolean',
			value: true,
			description: 'Apply a \'draft\' style  background to the preview to differentiate it from the comment textarea.'
		}
	},
	description: 'Provides a live preview of comments, as well as a two column editor for writing walls of text.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/?[-\w\.]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/message\/[-\w\.]*\/?[-\w\.]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[-\w\.]*\/submit\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w\.\/]*\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/about\/edit/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/wiki\/create(\/\w+)?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/wiki\/edit(\/\w+)?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/submit\/?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.RESDialogSmall.livePreview { position: relative; width: auto; margin-bottom: 15px; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview .RESDialogContents h3 { font-weight: bold; }');
			if (modules['commentPreview'].options.draftStyle.value) {
				RESUtils.addCSS('.livePreview, .livePreview .md { background: repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(166,166,166,.07) 40px, rgba(166,166,166,.07) 80px); }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.isWiki = $(document.body).is(".wiki-page");
			if (!this.isWiki) {
				this.converter = window.SnuOwnd.getParser();
			} else {
				//We need to configure non-default renderers here
				var SnuOwnd = window.SnuOwnd;
				var redditCallbacks = SnuOwnd.getRedditCallbacks();
				var rendererConfig = SnuOwnd.defaultRenderState();
				rendererConfig.flags = SnuOwnd.DEFAULT_WIKI_FLAGS;
				rendererConfig.html_element_whitelist = SnuOwnd.DEFAULT_HTML_ELEMENT_WHITELIST;
				rendererConfig.html_attr_whitelist = SnuOwnd.DEFAULT_HTML_ATTR_WHITELIST;
				this.converter = SnuOwnd.getParser({
					callbacks: redditCallbacks,
					context: rendererConfig
				});

				this.tocConverter = SnuOwnd.getParser(SnuOwnd.getTocRenderer());
			}

			this.bigTextTarget = null;
			if (this.options.enableBigEditor.value) {
				// Install the 2 column editor
				modules['commentPreview'].addBigEditor();

				if (modules['keyboardNav'].isEnabled()) {
					$("body").on("keydown", ".usertext-edit textarea, #wiki_page_content", function(e) {
						if (RESUtils.checkKeysForEvent(e, modules["keyboardNav"].options.openBigEditor.value)) {
							modules["commentPreview"].showBigEditor.call(this, e);
						}
					});
				}
			}

			//Close the preview on submit
			$("body").on("submit", "form", function() {
				$(this).find(".livePreview").hide();
			});

			if (!this.isWiki) {
				//Perform initial setup of tools over the whole page}
				this.attachPreview();
				// Wireup reply editors
				RESUtils.watchForElement("newCommentsForms", modules["commentPreview"].attachPreview);
				// Wireup edit editors (usertext-edit already exists in the page)
				RESUtils.watchForElement("newComments", modules["commentPreview"].attachPreview);
			} else {
				this.attachWikiPreview();
			}
		}
	},
	markdownToHTML: function(md) {
		var body = this.converter.render(md);
		if (this.isWiki) {
			/*
			<s>Snudown, and therefore SnuOwnd, is a bit funny about how it generates its table of contents entries.
			To when it encounters a header it tries to perform some of the usual inline formatting such as emphasis, strikethoughs, or superscript in headers. The text containing generated HTML then gets passed into cb_toc_header which escapes all of the passed HTML. When reddit gets it escaped tags are stripped.

			It would be nicer if they just used different functions for rendering the emphasis when making headers.</s>

			It seems that my understanding was wrong, for some reason reddit doesn't even use snudown's TOC renderer.
			*/
			var doc = $('<body>').html(body);
			var header_ids = {};
			var headers = doc.find('h1, h2, h3, h4, h5, h6');
			var tocDiv = $('<div>').addClass('toc');
			var parent = $('<ul>');
			parent.data('level', 0);
			tocDiv.append(parent);
			var level = 0,
				previous = 0;
			var prefix = 'wiki';
			headers.each(function(i, e) {
				var contents = $(this).text();
				var aid = $('<div>').html(contents).text();
				aid = prefix + '_' + aid.replace(/ /g, '_').toLowerCase();
				aid = aid.replace(/[^\w.-]/g, function(s) {
					return '.' + s.charCodeAt(0).toString(16).toUpperCase();
				});
				if (!(aid in header_ids)) {
					header_ids[aid] = 0;
				}
				var id_num = header_ids[aid] + 1;
				header_ids[aid] += 1;

				if (id_num > 1) {
					aid = aid + id_num;
				}

				$(this).attr('id', aid);

				var li = $('<li>').addClass(aid);
				var a = $('<a>').attr('href', '#' + aid).text(contents);
				li.append(a);

				var thisLevel = +this.tagName.slice(-1);
				if (previous && thisLevel > previous) {
					var newUL = $('<ul>');
					newUL.data('level', thisLevel);
					parent.append(newUL);
					parent = newUL;
					level++;
				} else if (level && thisLevel < previous) {
					while (level && parent.data('level') > thisLevel) {
						parent = parent.closest('ul');
						level -= 1;
					}
				}
				previous = thisLevel;
				parent.append(li);
			});
			doc.prepend(tocDiv);
			return doc.html();
		} else {
			return body;
		}
	},
	makeBigEditorButton: function() {
		return $('<button class="RESBigEditorPop" tabIndex="3">big editor</button>');
	},
	attachPreview: function(usertext) {
		if (usertext == null) {
			usertext = document.body;
		}
		if (modules['commentPreview'].options.enableBigEditor.value) {
			modules['commentPreview'].makeBigEditorButton().prependTo($('.bottom-area:not(:has(.RESBigEditorPop))', usertext));
		}
		$(usertext).find(".usertext-edit").each(function() {
			var preview = $(this).find(".livePreview");
			if (preview.length === 0) {
				preview = modules["commentPreview"].makePreviewBox();
				$(this).append(preview);
			}
			var contents = preview.find(".RESDialogContents");
			$(this).find("textarea[name=text], textarea[name=description], textarea[name=public_description]").on("input", function() {
				var textarea = $(this);
				RESUtils.debounce('refreshPreview', 250, function() {
					var markdownText = textarea.val();
					if (markdownText.length > 0) {
						var html = modules["commentPreview"].markdownToHTML(markdownText);
						preview.show();
						contents.html(html);
					} else {
						preview.hide();
						contents.html("");
					}
				});
			});
		});
	},
	attachWikiPreview: function() {
		if (modules['commentPreview'].options.enableBigEditor.value) {
			modules['commentPreview'].makeBigEditorButton().insertAfter($('.pageactions'));
		}
		var preview = modules["commentPreview"].makePreviewBox();
		preview.find(".md").addClass("wiki");
		preview.insertAfter($("#editform > br").first());

		var contents = preview.find(".RESDialogContents");
		$("#wiki_page_content").on("input", function() {

			var textarea = $(this);
			RESUtils.debounce('refreshPreview', 250, function() {
				var markdownText = textarea.val();
				if (markdownText.length > 0) {
					var html = modules["commentPreview"].markdownToHTML(markdownText);
					preview.show();
					contents.html(html);
				} else {
					preview.hide();
					contents.html("");
				}
			});
		});
	},
	makePreviewBox: function() {
		return $("<div style=\"display: none\" class=\"RESDialogSmall livePreview\"><h3>Live Preview</h3><div class=\"md RESDialogContents\"></div></div>");
	},
	addBigEditor: function() {
		var editor = $('<div id="BigEditor">').hide();
		var left = $('<div class="BELeft RESDialogSmall"><h3>Editor</h3></div>');
		var contents = $('<div class="RESDialogContents"><textarea id="BigText" name="text" class=""></textarea></div>');
		var foot = $('<div class="BEFoot">');
		foot.append($('<button style="float:left;">save</button>').on('click', function() {
			var len = $('#BigText').val().length;
			var max = $('#BigText').data("max-length");
			if (len > max) {
				$('#BigEditor .errorList .error').hide().filter('.TOO_LONG').text('this is too long (max: ' + max + ')').show();
			} else if (len === 0) {
				$('#BigEditor .errorList .error').hide().filter('.NO_TEXT').show();
			} else if (modules['commentPreview'].bigTextTarget) {
				modules['commentPreview'].bigTextTarget.submit();
				modules['commentPreview'].bigTextTarget.parents('.usertext-edit:first').find('.livePreview .md').html('');
				modules.commentPreview.hideBigEditor(false, true);
			} else {
				$('#BigEditor .errorList .error').hide().filter('.NO_TARGET').show();
			}

		}));
		foot.append($('<button style="float:left;">close</button>').on('click', modules.commentPreview.hideBigEditor));

		foot.append($('<span class="errorList">\
			<span style="display: none;" class="error NO_TEXT">we need something here</span>\
			<span style="display: none;" class="error TOO_LONG">this is too long (max: 10000)</span>\
			<span style="display: none;" class="error NO_TARGET">there is no associated textarea</span>\
			</span>'));

		contents.append(foot);
		left.append(contents);

		var right = $('<div class="BERight RESDialogSmall"><h3>Preview</h3><div class="RESCloseButton RESFadeButton">&#xf04e;</div><div class="RESCloseButton close">X</div>\
			<div class="RESDialogContents"><div id="BigPreview" class=" md"></div></div></div>');
		editor.append(left).append(right);

		$(document.body).append(editor);

		$('.BERight .RESCloseButton.close').on("click", modules.commentPreview.hideBigEditor);
		$('.BERight .RESFadeButton').on({
			click: function(e) {
				$("#BigEditor").fadeTo(300, 0.3);
				$(document.body).removeClass("RESScrollLock");
				this.isFaded = true;
			},
			mouseout: function(e) {
				if (this.isFaded) {
					$("#BigEditor").fadeTo(300, 1.0);
				}
				$(document.body).addClass("RESScrollLock");
				this.isFaded = false;
			}
		});
		$('body').on('click', '.RESBigEditorPop', modules.commentPreview.showBigEditor);

		$('#BigText').on('input', function() {
			RESUtils.debounce('refreshBigPreview', 250, function() {
				var text = $('#BigText').val();
				var html = modules['commentPreview'].markdownToHTML(text);
				$('#BigPreview').html(html);
				if (modules['commentPreview'].bigTextTarget) {
					modules['commentPreview'].bigTextTarget.val(text);
				}
			});
		}).on("keydown", function(e) {
			//Close big editor on escape
			if (e.keyCode === modules["commentTools"].KEYS.ESCAPE) {
				modules["commentPreview"].hideBigEditor();
				e.preventDefault();
				return false;
			}
		});
		if (modules['commentTools'].isEnabled()) {
			contents.prepend(modules['commentTools'].makeEditBar());
		}
	},
	showBigEditor: function(e) {
		e.preventDefault();
		// modules.commentPreview.bigTextTarget = null;
		modules.commentPreview.hideBigEditor(true);
		$('.side').addClass('BESideHide');
		$('body').addClass('RESScrollLock');
		RESUtils.fadeElementIn(document.getElementById('BigEditor'), 0.3);
		var baseText;
		if (!modules['commentPreview'].isWiki) {
			baseText = $(this).parents('.usertext-edit:first').find('textarea');
			$("#BigPreview").removeClass("wiki");
			$(".BERight .RESDialogContents").removeClass("wiki-page-content");
		} else {
			baseText = $('#wiki_page_content');
			$("#BigPreview").addClass("wiki");
			$(".BERight .RESDialogContents").addClass("wiki-page-content");
		}

		var markdown = baseText.val();
		var maxLength = baseText.data("max-length");
		$("#BigText").data("max-length", maxLength).val(markdown).focus();
		modules['commentTools'].updateCounter($("#BigText")[0]);
		$('#BigPreview').html(modules['commentPreview'].markdownToHTML(markdown));
		modules.commentPreview.bigTextTarget = baseText;
	},
	hideBigEditor: function(quick, submitted) {
		if (quick === true) {
			$('#BigEditor').hide();
		} else {
			RESUtils.fadeElementOut(document.getElementById('BigEditor'), 0.3);
		}
		$('.side').removeClass('BESideHide');
		$('body').removeClass('RESScrollLock');
		var target = modules['commentPreview'].bigTextTarget;

		if (target != null) {
			target.val($('#BigText').val());
			target.focus();
			if (submitted !== true) {
				var inputEvent = document.createEvent("HTMLEvents");
				inputEvent.initEvent("input", true, true);
				target[0].dispatchEvent(inputEvent);
			}
			modules['commentPreview'].bigTextTarget = null;
		}
	},
};



modules['commentTools'] = {
	moduleID: 'commentTools',
	moduleName: 'Comment Tools',
	category: 'Comments',
	options: {
		commentingAs: {
			type: 'boolean',
			value: true,
			description: 'Shows your currently logged in username to avoid posting from the wrong account.'
		},
		userAutocomplete: {
			type: 'boolean',
			value: true,
			description: 'Show user autocomplete tool when typing in posts, comments and replies'
		},
		subredditAutocomplete: {
			type: 'boolean',
			value: true,
			description: 'Show subreddit autocomplete tool when typing in posts, comments and replies'
		},
		showInputLength: {
			type: 'boolean',
			value: true,
			description: 'When submitting, display the number of characters entered in the title and text fields and indicate when you go over the 300 character limit for titles.'
		},
		keyboardShortcuts: {
			type: 'boolean',
			value: true,
			description: 'Use keyboard shortcuts to apply styles to selected text'
		},
		macros: {
			type: 'table',
			addRowText: '+add shortcut',
			fields: [{
				name: 'label',
				type: 'text'
			}, {
				name: 'text',
				type: 'textarea'
			}, {
				name: 'category',
				type: 'text'
			}, {
				name: 'key',
				type: 'keycode'
			}],
			value: [],
			description: "Add buttons to insert frequently used snippets of text."
		},
		keepMacroListOpen: {
			type: 'boolean',
			value: false,
			description: 'After selecting a macro from the dropdown list, do not hide the list.'
		},
		macroPlaceholders: {
			type: 'boolean',
			value: true,
			description: "When using macro, replace placeholders in text via pop-up prompt.\
			<p>Example macro text:<br>\
			The {{adj1}} {{adj2}} {{animal}} jumped over the lazy {{dog_color}} dog. The {{animal}} is so {{adj1}}!\
			</p>\
			<br><br>Special placeholders:\
			<dl>\
			<dt>{{now}}</dt><dd>The current date and time in your locale</dd>\
			<dt>{{selection}}</dt><dd>The currently selected text in the text area</dd>\
			<dt>{{my_username}}</dt><dd>/u/your_username</dd>\
			<dt>{{subreddit}}</dt><dd>/r/current_subreddit</dd>\
			<dt>{{url}}</dt><dd>URL (web address) for the current page</dd>\
			<dt>{{escaped}}</dt><dd>Escape markdown characters in the selected text; e.g. <code>**</code> becomes <code>\\*\\*</code></dd>\
			</dl>\
			"
		}
	},
	description: 'Provides shortcuts for easier markdown.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/?[-\w\.]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/message\/[-\w\.]*\/?[-\w\.]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[-\w\.]*\/submit\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w\.\/]*\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/about\/edit/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/wiki\/create(\/\w+)?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/wiki\/edit(\/\w+)?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/submit\/?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.markdownEditor { white-space: nowrap;  }');
			RESUtils.addCSS('.RESMacroWrappingSpan { white-space: normal;  }');
			RESUtils.addCSS('.markdownEditor a { margin-right: 8px; text-decoration: none; font-size: 11px; }');
			RESUtils.addCSS('.markdownEditor .RESMacroDropdown {font-size: 10px; }');
			RESUtils.addCSS('.selectedItem { color: #fff; background-color: #5f99cf; }');
			// RESUtils.addCSS('.RESDialogSmall.livePreview { position: relative; width: auto; margin-bottom: 15px; }');
			// RESUtils.addCSS('.RESDialogSmall.livePreview .RESDialogContents h3 { font-weight: bold; }');
			RESUtils.addCSS('.RESMacroDropdownTitle, .RESMacroDropdownTitleOverlay { cursor: pointer; display: inline-block; font-size: 11px; text-decoration: underline; color: gray; padding-left: 2px; padding-right: 21px; background-image: url(//www.redditstatic.com/droparrowgray.gif); background-position: 100% 50%; background-repeat: no-repeat; }');
			RESUtils.addCSS('.RESMacroDropdownTitleOverlay { cursor: pointer; }');
			RESUtils.addCSS('.RESMacroDropdownContainer { display: none; position: absolute; }');
			RESUtils.addCSS('.RESMacroDropdown { display: none; position: absolute; z-index: 2001; }');
			RESUtils.addCSS('.RESMacroDropdownList { margin-top: 0; width: auto; max-width: 300px; }');
			RESUtils.addCSS('.RESMacroDropdownList a, .RESMacroDropdownList li { font-size: 10px; }');
			RESUtils.addCSS('.RESMacroDropdown li { padding-right: 10px; height: 25px; line-height: 24px; }');
		}
	},
	SUBMIT_LIMITS: {
		STYLESHEET: 128 * 1024,
		SIDEBAR: 5120,
		DESCRIPTION: 500,
		WIKI: 256 * 1024,
		POST: 10000,
		POST_TITLE: 300
	},
	//Moved this out of go() because the large commentPreview may need it.
	macroCallbackTable: [],
	macroKeyTable: [],
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.isWiki = $(document.body).is(".wiki-page");
			this.migrateData();

			var $body = $("body");

			$body.on("click", "li.viewSource a", function(e) {
				e.preventDefault();
				modules["commentTools"].viewSource(this);
			}).on("click", ".usertext-edit.viewSource .cancel", function() {
				$(this).parents(".usertext-edit.viewSource").hide();
			}).on("click", "div.markdownEditor a", function(e) {
				e.preventDefault();

				var index = $(this).data("macro-index");
				var box = modules["commentTools"].findTextareaForElement(this)[0];
				// var box = $(this).closest(".usertext-edit, .RESDialogContents, .wiki-page-content").find("textarea[name=text], textarea[name=description], textarea[name=public_description]")[0];
				if (box == null) {
					console.error("Failed to locate textarea.");
					return;
				}
				var handler = modules["commentTools"].macroCallbackTable[index];
				if (box == null) {
					console.error("Failed to locate find callback.");
					return;
				}
				handler.call(modules["commentTools"], this, box);

				box.focus();
				//Fire an input event to refresh the preview
				var inputEvent = document.createEvent("HTMLEvents");
				inputEvent.initEvent("input", true, true);
				box.dispatchEvent(inputEvent);
			}).on("click", ".RESMacroDropdownTitle", function(e) {
				var pos = $(this).position();
				$(this).next().css({
					top: (pos).top + "px",
					left: (pos).left + "px"
				}).show();
			}).on("mouseleave", ".RESMacroDropdown", function(e) {
				$(this).hide();
			});

			if (this.options.showInputLength.value) {
				$body.on("input", ".usertext-edit textarea, #title-field textarea, #BigEditor textarea, #wiki_page_content", function(e) {
					modules['commentTools'].updateCounter(this);
				});
			}

			if (this.options.keyboardShortcuts.value) {
				$body.on("keydown", ".usertext-edit textarea, #BigEditor textarea, #wiki_page_content", function(e) {
					if (e.keyCode === modules["commentTools"].KEYS.ESCAPE) {
						if (!modules["commentTools"].autoCompletePop.is(':visible')) {
							// Blur from the editor on escape, so we can return to using the keyboard nav.
							// NOTE: The big editor closes on ESC so this won't be reached in that case.
							$(this).blur();
							e.preventDefault();
						}

						return;
					}

					for (var i = 0; i < modules["commentTools"].macroKeyTable.length; i++) {
						var row = modules["commentTools"].macroKeyTable[i];
						var testedKeyArray = row[0],
							macroIndex = row[1];
						if (RESUtils.checkKeysForEvent(e, testedKeyArray)) {
							var handler = modules["commentTools"].macroCallbackTable[macroIndex];
							handler.call(modules["commentTools"], null, this);

							// Fire an input event to refresh the preview
							var inputEvent = document.createEvent("HTMLEvents");
							inputEvent.initEvent("input", true, true);
							this.dispatchEvent(inputEvent);

							e.preventDefault();
							return;
						}
					}
				});
			}
			if (this.options.subredditAutocomplete.value || this.options.userAutocomplete.value) {
				this.addAutoCompletePop();
			}

			//Perform initial setup of tools over the whole page
			this.attachCommentTools();
			this.attatchViewSourceButtons();
			/*
			//These are no longer necessary but I am saving them in case Reddit changes how they make their reply forms.
			// Wireup reply editors
			RESUtils.watchForElement("newCommentsForms", modules["commentTools"].attachCommentTools);
			// Wireup edit editors (usertext-edit already exists in the page)
			RESUtils.watchForElement("newComments", modules["commentTools"].attachCommentTools);
			*/
			RESUtils.watchForElement("newComments", modules["commentTools"].attatchViewSourceButtons);
		}
	},
	migrateData: function() {
		var LATEST_MACRO_DATA_VERSION = "2";
		var macroVersion = RESStorage.getItem("RESmodules.commentTools.macroDataVersion");
		if (macroVersion == null || macroVersion === "0") {
			//In this case it is unmigrated or uncreated
			var previewOptionString = RESStorage.getItem("RESoptions.commentPreview");
			var previewOptions = safeJSON.parse(previewOptionString, "commentPreview");
			if (previewOptions != null) {
				if (typeof previewOptions.commentingAs !== "undefined") {
					this.options.commentingAs.value = previewOptions.commentingAs.value;
					delete previewOptions.commentingAs;
				}
				if (typeof previewOptions.keyboardShortcuts !== "undefined") {
					this.options.keyboardShortcuts.value = previewOptions.keyboardShortcuts.value;
					delete previewOptions.keyboardShortcuts;
				}
				if (typeof previewOptions.subredditAutocomplete !== "undefined") {
					this.options.subredditAutocomplete.value = previewOptions.subredditAutocomplete.value;
					delete previewOptions.subredditAutocomplete;
				}
				if (typeof previewOptions.macros !== "undefined") {
					var macros;
					macros = this.options.macros.value = previewOptions.macros.value;
					for (var i = 0; i < macros.length; i++) {
						while (macros[i].length < 4) {
							macros[i].push("");
						}
					}
					delete previewOptions.macros;
				}
				RESStorage.setItem("RESoptions.commentTools", JSON.stringify(this.options));
				RESStorage.setItem("RESoptions.commentPreview", JSON.stringify(previewOptions));
				RESStorage.setItem("RESmodules.commentTools.macroDataVersion", LATEST_MACRO_DATA_VERSION);
			} else {
				//No migration will be performed
				RESStorage.setItem("RESmodules.commentTools.macroDataVersion", LATEST_MACRO_DATA_VERSION);
			}
		}
		if (macroVersion === "1") {
			var macros = this.options.macros.value;
			for (var i = 0; i < macros.length; i++) {
				while (macros[i].length < 4) {
					macros[i].push("");
				}
			}
			RESStorage.setItem("RESmodules.commentTools.macroDataVersion", LATEST_MACRO_DATA_VERSION);
		}
	},
	attatchViewSourceButtons: function(entry) {
		var entries = entry == null ? $(".entry", document.body) : $(entry);
		if (RESUtils.pageType() === "comments" || RESUtils.pageType() === "inbox") {
			// Disabled synchronous version
			// $(".flat-list.buttons", entries).find("li:nth-child(2), li:only-child").after('<li class="viewSource"><a href="javascript:void(0)">source</a></li>');
			var menus = $(".flat-list.buttons li.first", entries);
			RESUtils.forEachChunked(menus, 30, 500, function(item, i, array) {
				$(item).after('<li class="viewSource"><a class="noCtrlF" href="javascript:void(0)" data-text="source"></a></li>');
			});
		}
	},
	viewSource: function(button) {
		var buttonList = $(button).parent().parent();
		var sourceDiv = $(button).closest('.thing').find(".usertext-edit.viewSource:first");
		if (sourceDiv.length !== 0) {
			sourceDiv.toggle();
		} else {
			var permaLink = buttonList.find(".first a");
			var jsonURL = permaLink.attr("href");
			var urlSplit = jsonURL.split('/');
			var postID = urlSplit[urlSplit.length - 1];

			var isSelfText = permaLink.is(".comments");
			if (jsonURL.indexOf('?context') !== -1) {
				jsonURL = jsonURL.replace('?context=3', '.json?');
			} else {
				jsonURL += '/.json';
			}
			this.gettingSource = this.gettingSource || {};
			if (this.gettingSource[postID]) {
				return;
			}
			this.gettingSource[postID] = true;

			GM_xmlhttpRequest({
				method: "GET",
				url: jsonURL,
				onload: function(response) {
					var thisResponse = JSON.parse(response.responseText);
					var userTextForm = $('<div class="usertext-edit viewSource"><div><textarea rows="1" cols="1" name="text"></textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div></div>');
					if (!isSelfText) {
						var sourceText = null;
						if (typeof thisResponse[1] !== 'undefined') {
							sourceText = thisResponse[1].data.children[0].data.body;
						} else {
							var thisData = thisResponse.data.children[0].data;
							if (thisData.id == postID) {
								sourceText = thisData.body;
							} else {
								// The message we want is a reply to a PM/modmail, but reddit returns the whole thread.
								// So, we have to dig into the replies to find the message we want.
								for (var i = 0, len = thisData.replies.data.children.length; i < len; i++) {
									var replyData = thisData.replies.data.children[i].data;
									if (replyData.id == postID) {
										sourceText = replyData.body;
										break;
									}
								}
							}
						}
						// sourceText in this case is reddit markdown. escaping it would screw it up.
						userTextForm.find("textarea[name=text]").html(sourceText);
					} else {
						var sourceText = thisResponse[0].data.children[0].data.selftext;
						//						console.log(sourceText);
						// sourceText in this case is reddit markdown. escaping it would screw it up.
						userTextForm.find("textarea[name=text]").html(sourceText);
					}
					buttonList.before(userTextForm);
				}
			});
		}
	},
	attachCommentTools: function(elem) {
		if (elem == null) {
			elem = document.body;
		}
		$(elem).find("textarea[name][name!=share_to][name!=message]").each(modules["commentTools"].attachEditorToUsertext);
	},
	getFieldLimit: function(name) {
		switch (name) {
			case "title":
				return modules['commentTools'].SUBMIT_LIMITS.POST_TITLE;
				break;
			case "text":
				return modules['commentTools'].SUBMIT_LIMITS.POST;
				break;
			case "description":
				return modules['commentTools'].SUBMIT_LIMITS.SIDEBAR;
				break;
			case "public_description":
				return modules['commentTools'].SUBMIT_LIMITS.DESCRIPTION;
				break;
			case "content":
				return modules['commentTools'].SUBMIT_LIMITS.WIKI;
				break;
			case "description_conflict_old":
				return;
			case "public_description_conflict_old":
				return;
			default:
				// console.warn("unhandled form", this);
				return;
		}
	},
	attachEditorToUsertext: function() {
		if (this.hasAttribute("data-max-length")) {
			return;
		}
		var limit = modules['commentTools'].getFieldLimit(this.name);

		if (this.name === "title") {
			return;
		}

		var bar = modules['commentTools'].makeEditBar();
		if (this.id === "wiki_page_content") {
			$(this).parent().prepend(bar);
		} else {
			$(this).parent().before(bar);
		}
		modules['commentTools'].updateCounter(this);
	},
	updateCounter: function(textarea) {
		var length = $(textarea).val().length;
		var limit = modules['commentTools'].getFieldLimit(textarea.name);
		var counter = $(textarea).parent().parent().find(".RESCharCounter");
		counter.attr('title', 'character limit: ' + length + '/' + limit);
		counter.text(length + '/' + limit);
		if (length > limit) {
			counter.addClass('tooLong');
		} else {
			counter.removeClass('tooLong');
		}
	},
	makeEditBar: function() {
		if (this.cachedEditBar != null) {
			return $(this.cachedEditBar).clone();
		}

		var editBar = $('<div class="markdownEditor">');

		editBar.append(this.makeEditButton("<b>Bold</b>", "ctrl-b", [66, false, true, false, false], function(button, box) {
			this.wrapSelection(box, "**", "**");
		}));
		editBar.append(this.makeEditButton("<i>Italic</i>", "ctrl-i", [73, false, true, false, false], function(button, box) {
			this.wrapSelection(box, "*", "*");
		}));
		editBar.append(this.makeEditButton("<del>strike</del>", "ctrl-s", 83, function(button, box) {
			this.wrapSelection(box, "~~", "~~");
		}));
		editBar.append(this.makeEditButton("<sup>sup</sup>", "", null, function(button, box) {
			this.wrapSelectedWords(box, "^");
		}));
		editBar.append(this.makeEditButton("Link", "", null, function(button, box) {
			this.linkSelection(box);
		}));
		editBar.append(this.makeEditButton(">Quote", "", null, function(button, box) {
			this.wrapSelectedLines(box, "> ", "");
		}));
		editBar.append(this.makeEditButton("<span style=\"font-family: Courier New\">Code</span>", "", null, function(button, box) {
			this.wrapSelectedLines(box, "    ", "");
		}));
		editBar.append(this.makeEditButton("&bull;Bullets", "", null, function(button, box) {
			this.wrapSelectedLines(box, "* ", "");
		}));
		editBar.append(this.makeEditButton("1.Numbers", "", null, function(button, box) {
			this.wrapSelectedLines(box, "1. ", "");
		}));

		if (modules["commentTools"].options.showInputLength.value) {
			var counter = $('<span class="RESCharCounter" title="character limit: 0/?????">0/?????</span>');
			editBar.append(counter);
			$('.submit-page #title-field .title').append($('<span class="RESCharCounter" title="character limit: 0/300">0/300</span>'));
		}

		this.addButtonToMacroGroup("", this.makeEditButton("reddiquette", "", null, function(button, box) {
			this.macroSelection(box, "[reddiquette](http://www.reddit.com/wiki/reddiquette) ", "");
		}));

		this.addButtonToMacroGroup("", this.makeEditButton("[Promote]", "", null, function(button, box) {
			var $button = $(button),
				clickCount = $button.data("clickCount") || 0;
			clickCount++;
			$button.data("clickCount", clickCount);
			if (clickCount > 2) {
				$button.parent().hide();
				modules["commentTools"].lod();
			}
			this.macroSelection(box, "[Reddit Enhancement Suite](http://redditenhancementsuite.com/) ");
		}));

		this.addButtonToMacroGroup("", this.makeEditButton("&#3232;\_&#3232;", "Look of disaproval", null, function(button, box) {
			this.macroSelection(box, "&#3232;\_&#3232;");
		}));

		this.addButtonToMacroGroup("", this.makeEditButton("Current timestamp", "", null, function(button, box) {
			var currentDate = new Date();
			this.macroSelection(box, currentDate.toTimeString());
		}));

		this.buildMacroDropdowns(editBar);

		var addMacroButton = modules['commentTools'].makeEditButton(modules['commentTools'].options.macros.addRowText, null, null, function() {
			modules['settingsNavigation'].loadSettingsPage(this.moduleID, 'macros');
			$('.RESMacroDropdown').fadeOut(100);
		});
		modules['commentTools'].addButtonToMacroGroup('', addMacroButton);

		// Wrap the edit bar in a <div> of its own 
		var wrappedEditBar = $("<div>").append(editBar);
		if (this.options.commentingAs.value && (!modules['usernameHider'].isEnabled())) {
			// show who we're commenting as...
			var commentingAs = $('<div class="commentingAs">').text('Commenting as: ' + RESUtils.loggedInUser());
			wrappedEditBar.append(commentingAs);

		}
		this.cachedEditBar = wrappedEditBar;
		return this.cachedEditBar;
	},
	macroDropDownTable: {},
	getMacroGroup: function(groupName) {
		// Normalize and supply a default group name{}
		groupName = (groupName || "").toString().trim() || "macros";
		var macroGroup;
		if (groupName in this.macroDropDownTable) {
			macroGroup = this.macroDropDownTable[groupName];
		} else {
			macroGroup = this.macroDropDownTable[groupName] = {};
			macroGroup.titleButton = $('<span class="RESMacroDropdownTitle">' + groupName + '</span>');
			macroGroup.container = $('<span class="RESMacroDropdown"><span class="RESMacroDropdownTitleOverlay">' + groupName + '</span></span>').hide();
			macroGroup.dropdown = $('<ul class="RESMacroDropdownList RESDropdownList"></ul>');
			macroGroup.container.append(macroGroup.dropdown);
		}
		return macroGroup;
	},
	addButtonToMacroGroup: function(groupName, button) {
		var group = this.getMacroGroup(groupName);
		group.dropdown.append($("<li>").append(button));
	},
	buildMacroDropdowns: function(editBar) {
		var macros = this.options.macros.value;

		for (var i = 0; i < macros.length; i++) {
			var macro = macros[i];

			//Confound these scoping rules
			(function(title, text, category, key) {
				var button = this.makeEditButton(title, null, key, function(button, box) {
					this.macroSelection(box, text, "");
				});
				this.addButtonToMacroGroup(category, button);
			}).apply(this, macro);
		}

		var macroWrapper = $('<span class="RESMacroWrappingSpan">');
		if ("macros" in this.macroDropDownTable) {
			macroWrapper.append(this.macroDropDownTable["macros"].titleButton);
			macroWrapper.append(this.macroDropDownTable["macros"].container);
		}
		for (var category in this.macroDropDownTable) {
			if (category === "macros") {
				continue;
			}
			macroWrapper.append(this.macroDropDownTable[category].titleButton);
			macroWrapper.append(this.macroDropDownTable[category].container);
		}
		editBar.append(macroWrapper);
	},
	makeEditButton: function(label, title, key, handler) {
		if (label == null) {
			label = "unlabeled";
		}
		if (title == null) {
			title = "";
		}
		var macroButtonIndex = this.macroCallbackTable.length;
		var button = $("<a>").html(label).attr({
			title: title,
			href: "javascript:void(0)",
			tabindex: 1,
			"data-macro-index": macroButtonIndex
		});

		if (key != null && key[0] != null) {
			this.macroKeyTable.push([key, macroButtonIndex]);
		}
		this.macroCallbackTable[macroButtonIndex] = handler;
		return button;
	},
	linkSelection: function(box) {
		var url = prompt("Enter the URL:", "");
		if (url != null) {
			//escape parens in url
			url = url.replace(/\(/, "\\(");
			url = url.replace(/\)/, "\\)");
			this.wrapSelection(box, "[", "](" + url + ")", function(text) {
				//escape brackets and parens in text
				text = text.replace(/\[/, "\\[");
				text = text.replace(/\]/, "\\]");
				text = text.replace(/\(/, "\\(");
				text = text.replace(/\)/, "\\)");
				return text;
			});
		}
	},
	macroSelection: function(box, macroText) {
		if (!this.options.keepMacroListOpen.value) {
			$('.RESMacroDropdown').fadeOut(100);
		}
		if (modules['commentTools'].options['macroPlaceholders'].value) {
			var formatText = this.fillPlaceholders.bind(this, box, macroText);
			this.wrapSelection(box, "", "", formatText);
		} else {
			this.wrapSelection(box, macroText, "");
		}
	},
	fillPlaceholders: function(box, macroText, selectedText) {
		var placeholders = macroText.match(/\{\{\w+\}\}/g);

		if (placeholders) {
			var completedPlaceholders = {};

			for (var i = 0; i < placeholders.length; i++) {
				var placeholder = placeholders[i];
				if (completedPlaceholders.hasOwnProperty(placeholder)) { 
					continue;
				}
				completedPlaceholders[placeholder] = true;
				
				var value = this.getMagicPlaceholderValue(placeholder, macroText, selectedText, box);
				if (value === void 0) {
					value = this.promptForPlaceholderValue(placeholder, macroText);
				}

				if (value == null) {
					// user cancelled
					break;
				}

				// Replace placeholder with value
				macroText = macroText.replace(new RegExp(placeholder, "g"), value);
			}
		}


		return macroText;
	},
	getMagicPlaceholderValue: function (placeholder, macroText, selectedText, box) {
		var sanitized = placeholder.substring(2, placeholder.length - 2).toLowerCase();
		switch (sanitized) {
			case "subreddit":
				var subreddit = RESUtils.currentSubreddit();
				if (subreddit) {
					subreddit = '/r/' + subreddit;
					return subreddit;
				}
				break;
			case "my_username":
				var username = RESUtils.loggedInUser();
				if (username) {
					username = '/u/' + username;
					return username;
				}
				break;
			case "op":
			case "op_username":
				var username = null;
				if (username) {
					username = '/u/' + username;
					return username;
				}
				break;
			case "url":
				return document.location.href;
				break;
			case "recipient":
			case "reply_to_user":
				// TODO
				break;
			case "selected":
			case "selection":
				return selectedText;
				break;
			case "now":
				var date = new Date();
				return date.toTimeString();
				break;
			case "today":
				var date = new Date();
				return date.toDateString();
				break;
			case "escaped":
				var escaped = selectedText.replace(/[\[\]()\\\*^~\-_.]/g, '\\$&');
				return escaped;
				break;
		}
	},
	promptForPlaceholderValue: function (placeholder, macroText) {
		var value;
		// Get value for placeholder
		var display = macroText 
			+ "\n\n\n"
			+ "Enter replacement for " + placeholder + ":" 
			;
		var value = placeholder;
		value = prompt(display, value);

		return value;
	},
	wrapSelection: function(box, prefix, suffix, escapeFunction) {
		if (box == null) {
			return;
		}
		//record scroll top to restore it later.
		var scrollTop = box.scrollTop;

		//We will restore the selection later, so record the current selection.
		var selectionStart = box.selectionStart;
		var selectionEnd = box.selectionEnd;

		var text = box.value;
		var beforeSelection = text.substring(0, selectionStart);
		var selectedText = text.substring(selectionStart, selectionEnd);
		var afterSelection = text.substring(selectionEnd);

		//Markdown doesn't like it when you tag a word like **this **. The space messes it up. So we'll account for that because Firefox selects the word, and the followign space when you double click a word.
		var trailingSpace = "";
		var cursor = selectedText.length - 1;
		while (cursor > 0 && selectedText[cursor] === " ") {
			trailingSpace += " ";
			cursor--;
		}
		selectedText = selectedText.substring(0, cursor + 1);

		if (escapeFunction != null) {
			selectedText = escapeFunction(selectedText);
		}

		box.value = beforeSelection + prefix + selectedText + suffix + trailingSpace + afterSelection;

		box.selectionStart = selectionStart + prefix.length;
		box.selectionEnd = selectionEnd + prefix.length;

		box.scrollTop = scrollTop;
	},
	wrapSelectedLines: function(box, prefix, suffix) {
		var scrollTop = box.scrollTop;
		var selectionStart = box.selectionStart;
		var selectionEnd = box.selectionEnd;

		var text = box.value;
		var startPosition = 0;
		var lines = text.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var lineStart = startPosition;
			var lineEnd = lineStart + lines[i].length;
			//Check if either end of the line is within the selection
			if (selectionStart <= lineStart && lineStart <= selectionEnd || selectionStart <= lineEnd && lineEnd <= selectionEnd
				//Check if either end of the selection is within the line
				|| lineStart <= selectionStart && selectionStart <= lineEnd || lineStart <= selectionEnd && selectionEnd <= lineEnd) {
				lines[i] = prefix + lines[i] + suffix;
				//Move the offsets separately so we don't throw off detection for the other end
				var startMovement = 0,
					endMovement = 0;
				if (lineStart < selectionStart) {
					startMovement += prefix.length;
				}
				if (lineEnd < selectionStart) {
					startMovement += suffix.length;
				}
				if (lineStart < selectionEnd) {
					endMovement += prefix.length;
				}
				if (lineEnd < selectionEnd) {
					endMovement += suffix.length;
				}

				selectionStart += startMovement;
				selectionEnd += endMovement;
				lineStart += prefix.length;
				lineEnd += prefix.length + suffix.length;
			}
			//Remember the newline
			startPosition = lineEnd + 1;
		}

		box.value = lines.join("\n");
		box.selectionStart = selectionStart;
		box.selectionEnd = selectionEnd;
		box.scrollTop = scrollTop;
	},
	wrapSelectedWords: function(box, prefix) {
		var scrollTop = box.scrollTop;
		var selectionStart = box.selectionStart;
		var selectionEnd = box.selectionEnd;

		var text = box.value;
		var beforeSelection = text.substring(0, selectionStart);
		var selectedWords = text.substring(selectionStart, selectionEnd).split(" ");
		var afterSelection = text.substring(selectionEnd);

		var selectionModify = 0;

		for (i = 0; i < selectedWords.length; i++) {
			if (selectedWords[i] !== "") {
				if (selectedWords[i].indexOf("\n") !== -1) {
					newLinePosition = selectedWords[i].lastIndexOf("\n") + 1;
					selectedWords[i] = selectedWords[i].substring(0, newLinePosition) + prefix + selectedWords[i].substring(newLinePosition);
					selectionModify += prefix.length;
				}
				if (selectedWords[i].charAt(0) !== "\n") {
					selectedWords[i] = prefix + selectedWords[i];
				}
				selectionModify += prefix.length;
			}
			// If nothing is selected, stick the prefix in there and move the cursor to the right side.
			else if (selectedWords[i] === "" && selectedWords.length === 1) {
				selectedWords[i] = prefix + selectedWords[i];
				selectionModify += prefix.length;
				selectionStart += prefix.length;
			}
		}

		box.value = beforeSelection + selectedWords.join(" ") + afterSelection;
		box.selectionStart = selectionStart;
		box.selectionEnd = selectionEnd + selectionModify;
		box.scrollTop = scrollTop;
	},
	lod: function() {
		if (typeof this.firstlod === 'undefined') {
			this.firstlod = true;
			$('body').append('<div id="RESlod" style="display: none; position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #ddd; opacity: 0.9; z-index: 99999;"><div style="position: relative; text-align: center; width: 400px; height: 300px; margin: auto;"><div style="font-size: 100px; margin-bottom: 10px;">&#3232;\_&#3232;</div> when you do this, people direct their frustrations at <b>me</b>... could we please maybe give this a rest?</div></div>');
		}
		$('#RESlod').fadeIn('slow', function() {
			setTimeout(function() {
				$('#RESlod').fadeOut('slow');
			}, 5000);
		});
	},
	KEYS: {
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
	},
	addAutoCompletePop: function() {

		this.autoCompleteCache = {};
		this.autoCompletePop = $('<div id="autocomplete_dropdown" \
			class="drop-choices srdrop inuse" \
			style="display:none;">');
		this.autoCompletePop.on("click mousedown", ".choice", function() {
			modules["commentTools"].autoCompleteHideDropdown();
			modules["commentTools"].autoCompleteInsert(this.innerHTML);
		});
		$("body").append(this.autoCompletePop);

		$("body").on({
			keyup: this.autoCompleteTrigger,
			keydown: this.autoCompleteNavigate,
			blur: this.autoCompleteHideDropdown
		}, ".usertext .usertext-edit textarea, #BigText, #wiki_page_content");
	},
	autoCompleteLastTarget: null,
	autoCompleteTrigger: function(e) {
		var mod = modules["commentTools"];
		var KEYS = mod.KEYS;
		//\0x08 is backspace
		if (/[^A-Za-z0-9 \x08]/.test(String.fromCharCode(e.keyCode))) {
			return true;
		}
		mod.autoCompleteLastTarget = this;
		var matchRE = /\W\/?([ru])\/([\w\.]*)$/;
		var matchSkipRE = /\W\/?([ru])\/([\w\.]*)\ $/;
		var fullText = $(this).val();
		var prefixText = fullText.slice(0, this.selectionStart);
		var match = matchRE.exec(" " + prefixText);
		if (match != null) {
			if (match[1] === "r" && mod.options.subredditAutocomplete.value == false) {
				return;
			}
			if (match[1] === "u" && mod.options.userAutocomplete.value == false) {
				return;
			}
		}

		if (match == null || match[2] === "" || match[2].length > 10) {
			if (e.keyCode === KEYS.SPACE || e.keyCode === KEYS.ENTER) {
				var match = matchSkipRE.exec(" " + prefixText);
				if (match) {
					mod.autoCompleteInsert(match[2]);
				}
			}
			return mod.autoCompleteHideDropdown();
		}

		var type = match[1];
		var query = match[2].toLowerCase();
		var queryId = type + "/" + query;
		var cache = mod.autoCompleteCache;
		if (queryId in cache) {
			return mod.autoCompleteUpdateDropdown(cache[queryId]);
		}

		RESUtils.debounce("autoComplete", 300, function() {
			if (type === "r") {
				mod.getSubredditCompletions(query);
			} else if (type === "u") {
				mod.getUserCompletions(query);
			}
		});
	},
	getSubredditCompletions: function(query) {
		var mod = modules['commentTools'];
		if (this.options.subredditAutocomplete.value) {
			$.ajax({
				type: "POST",
				url: "/api/search_reddit_names.json",
				data: {
					query: query,
					app: "res"
				},
				dataType: "json",
				success: function(data) {
					mod.autoCompleteCache['r/' + query] = data.names;
					mod.autoCompleteUpdateDropdown(data.names);
					mod.autoCompleteSetNavIndex(0);
				}
			});
		}
	},
	getUserCompletions: function(query) {
		if (this.options.userAutocomplete.value) {
			var tags = JSON.parse(RESStorage.getItem("RESmodules.userTagger.tags"));
			var tagNames = Object.keys(tags);
			var pageNames = [].map.call($(".author"), function(e) {
				return e.innerHTML;
			});
			var names = tagNames.concat(pageNames);
			names = names.filter(function(e, i, a) {
				return e.toLowerCase().indexOf(query) === 0;
			}).sort().reduce(function(prev, current, i, a) {
				//Removing duplicates
				if (prev[prev.length - 1] != current) {
					prev.push(current);
				}
				return prev;
			}, []);

			this.autoCompleteCache['u/' + query] = names;
			this.autoCompleteUpdateDropdown(names);
			this.autoCompleteSetNavIndex(0);
		}
	},
	autoCompleteNavigate: function(e) {
		//Don't mess with shortcuts for fancier cursor movement
		if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) return;
		var mod = modules["commentTools"];
		var KEYS = mod.KEYS;
		var entries = mod.autoCompletePop.find("a.choice");
		var index = +mod.autoCompletePop.find(".selectedItem").data("index");
		if (mod.autoCompletePop.is(':visible')) {
			switch (e.keyCode) {
				case KEYS.DOWN:
				case KEYS.RIGHT:
					e.preventDefault();
					if (index < entries.length - 1) index++;
					mod.autoCompleteSetNavIndex(index);
					break;
				case KEYS.UP:
				case KEYS.LEFT:
					e.preventDefault();
					if (index > 0) index--;
					mod.autoCompleteSetNavIndex(index);
					break;
				case KEYS.TAB:
				case KEYS.ENTER:
					e.preventDefault();
					$(entries[index]).click();
					break;
				case KEYS.ESCAPE:
					e.preventDefault();
					mod.autoCompleteHideDropdown();
					return false;
					break;
			}
		}
	},
	autoCompleteSetNavIndex: function(index) {
		var entries = modules["commentTools"].autoCompletePop.find("a.choice");
		entries.removeClass("selectedItem");
		entries.eq(index).addClass("selectedItem");
	},
	autoCompleteHideDropdown: function() {
		modules["commentTools"].autoCompletePop.hide();
	},
	autoCompleteUpdateDropdown: function(names) {
		var mod = modules["commentTools"];

		if (!names.length) return mod.autoCompleteHideDropdown();
		mod.autoCompletePop.empty();
		$.each(names.slice(0, 20), function(i, e) {
			mod.autoCompletePop.append('<a class="choice" data-index="' + i + '">' + e + '</a>');
		});

		var textareaOffset = $(mod.autoCompleteLastTarget).offset();
		textareaOffset.left += $(mod.autoCompleteLastTarget).width();
		mod.autoCompletePop.css(textareaOffset).show();

		mod.autoCompleteSetNavIndex(0);

	},
	autoCompleteInsert: function(inputValue) {
		var textarea = modules["commentTools"].autoCompleteLastTarget,
			caretPos = textarea.selectionStart,
			left = textarea.value.substr(0, caretPos),
			right = textarea.value.substr(caretPos);
		left = left.replace(/\/?([ru])\/(\w*)\ ?$/, '/$1/' + inputValue + ' ');
		textarea.value = left + right;
		textarea.selectionStart = textarea.selectionEnd = left.length;
		textarea.focus()
	},
	findTextareaForElement: function(elem) {
		return $(elem)
			.closest(".usertext-edit, .RESDialogContents, .wiki-page-content")
			.find("textarea")
			.filter("#BigText, [name=text], [name=description], [name=public_description], #wiki_page_content")
			.first();
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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*/i,
		/^https?:\/\/reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (!RESUtils.loggedInUser(true)) {
				this.tryAgain = true;
				return false;
			}
			this.hideUsername();
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.tryAgain && RESUtils.loggedInUser()) {
				this.hideUsername();
				RESUtils.addStyle(RESUtils.css);
			}
		}
	},
	hideUsername: function() {
		var user = RESUtils.loggedInUser(),
			curatedBy = document.querySelector('.multi-details > h2 a');
		RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\'], #header .user > a, .titlebox .tagline a.author, .commentingAs, .bottom a[href*=\'/' + user + '\'] {line-height:0;font-size:0;content:none;}');
		RESUtils.addCSS('p.tagline > a[href*=\'/' + user + '\']:after, #header .user > a:after, .titlebox .tagline a.author:after, .bottom a[href*=\'/' + user + '\']:after {content: "' + this.options.displayText.value + '";letter-spacing:normal;font-size:10px;}');
		RESUtils.addCSS('.commentingAs:after {content: "Commenting as: ' + this.options.displayText.value + '";letter-spacing:normal;font-size:12px;}');
		if (modules['userHighlight'].isEnabled()) {
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:after, p.tagline > .moderator[href*=\'/' + user + '\']:after{background-color:inherit;padding:0 2px;font-weight:bold;border-radius:3px;color:#fff;}');
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:after{ background-color:' + modules['userHighlight'].options.OPColor.value + ';}');
			RESUtils.addCSS('p.tagline > .moderator[href*=\'/' + user + '\']:after{ background-color:' + modules['userHighlight'].options.modColor.value + ';}');
			RESUtils.addCSS('p.tagline > .submitter[href*=\'/' + user + '\']:hover:after{ background-color:' + modules['userHighlight'].options.OPColorHover.value + ';}');
			RESUtils.addCSS('p.tagline > .moderator[href*=\'/' + user + '\']:hover:after{ background-color:' + modules['userHighlight'].options.modColorHover.value + ';}');
		}
		if (curatedBy && curatedBy.href.slice(-(user.length + 1)) === '/' + user) {
			curatedBy.textContent = 'curated by /u/' + this.options.displayText.value;
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
//returns true or false
	detect: function(element) {return true/false;},

//This is where links are parsed, cache checks are made, and XHR is performed.
//the only parameter is the anchor element
//The method is in a jQuery Deferred chain and will be followed by handleInfo. 
//A new $.Deferred object should be created and resolved/rejected as necessary and then reterned.
//If resolving, the element should be passed along with whatever data is required.
	handleLink: function(element) {},

//This is were the embedding information is added to the link
//handleInfo sits in the Deferred chain after handLink
//and should recieve both the element and a data object from handleLink
//the first parameter should the same anchor element passed to handleLink
//the second parameter should module specific data
//A new $.Deferred object should be created and resolved/rejected as necessary and then reterned
//If resolving, the element should be passed
	handleInfo: function(elem, info) {}
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
			values: [{
				name: 'Add links to history',
				value: 'add'
			}, {
				name: 'Color links, but do not add to history',
				value: 'color'
			}, {
				name: 'Do not add or color links.',
				value: 'none'
			}],
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
		},
		loadAllInAlbum: {
			type: 'boolean',
			value: false,
			description: 'Display all images at once in a \'filmstrip\' layout, rather than the default navigable \'slideshow\' style.'
		},
		showViewImagesTab: {
			type: 'boolean',
			value: true,
			description: 'Show a \'view images\' tab at the top of each subreddit, to easily toggle showing all images at once.'
		}
	},
	description: 'Opens images inline in your browser with the click of a button. Also has configuration options, check it out!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\_\?=]*/i
	],
	exclude: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/ads\/[-\w\.\_\?=]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*\/submit\/?$/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadDynamicOptions: function() {
		// Augment the options with available image modules
		for (var site in this.siteModules) {
			if (this.siteModules.hasOwnProperty(site) && this.siteModules[site].hasOwnProperty('options') && !this.options.hasOwnProperty('display ' + site)) {
				for (var optionKey in this.siteModules[site].options) {

				}
				this.options[optionKey] = this.siteModules[site].options[optionKey];
			}
		}
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
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
			/*
			true: show all images
			false: hide all images
			'any string': display images match the tab
			*/
			this.currentImageTab = false;
			this.customImageTabs = {};

			if (this.options.markVisited.value) {
				// we only need this iFrame hack if we're unable to add to history directly, which Firefox addons and Chrome can do.
				if (!BrowserDetect.isChrome() && !BrowserDetect.isFirefox()) {
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
			RESUtils.watchForElement('newComments', modules['showImages'].findAllImagesInSelfText);

			this.createImageButtons();
			this.findAllImages();
			document.addEventListener('dragstart', function() {
				return false;
			}, false);
		}
	},
	findAllImagesInSelfText: function(ele) {
		modules['showImages'].findAllImages(ele, true);
	},
	createImageButtons: function() {
		if ((/search\?\/?q\=/.test(location.href))
				|| (/\/about\/(?:reports|spam|unmoderated)/.test(location.href))
				|| (location.href.indexOf('/modqueue') !== -1)
				|| (location.href.toLowerCase().indexOf('/dashboard') !== -1)) {
			var hbl = document.getElementById('header-bottom-left');
			if (hbl) {
				var mainMenuUL = document.createElement('ul');
				mainMenuUL.setAttribute('class', 'tabmenu viewimages');
				mainMenuUL.setAttribute('style', 'display: inline-block');
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
					modules['showImages'].setShowImages(null, 'image');
				}
			}, true);
			a.appendChild(text);
			li.appendChild(a);
			if (!this.options.showViewImagesTab.value) {
				li.style.display = 'none';
			}
			mainMenuUL.appendChild(li);
			this.viewImageButton = a;
			/*
				To enable custom image tabs for a subreddit start by adding `[](#/RES_SR_Config/ImageTabs?)` to the markdown code of the sidebar.
				This should not have any visible effect on the HTML.
				Right now no options have been configured, so there won't be any new tabs.
				You can add up to 8 tabs in the following manner:
				A tab is defined by a label and a tag list separated by an equals sign like this: `LABEL=TAGLIST` 
				The label can be up to 32 characters long and may contain english letters, numbers, hyphens, spaces, and underscores. The labels must be URI encoded.
				The tag list can contain up to tag values separated by commas. Individual tags have the same content restrictions a labels. (do not URI encode the commmas)

				The the tab definitions are joined by ampersands (`&`).
				Labels appear to the right of the "view images" button and are surrounded by `[]` brackets.
				Post titles are searched for any place that an entry in the tag list appears surrounded by any kind of bracket <>, [], (), {}.
				Tags are not case sensitive and whitespace is permitted between the brackets and the tag.

				To allow the tabs to be styled, the tabs will have a class that is the tab label with the spaces and hyphens replaced by underscores and then prefixed with `'RESTab-'` so the label 'Feature Request' becomes `'RESTab-feature_request'`.
				
				We realize that the format is highly restrictive, but you must understand that that is for everyone's protection. If there is demand, the filter can be expanded.

				Examples:
				A hypothetical setup for /r/minecraft that creates tabs for builds, mods, and texture packs:

					[](#/RES_SR_Config/ImageTabs?build=build,project&mod=mod&texture%20pack=texture,textures,pack,texture%20pack)

				To duplicate the behavior originally used for /r/gonewild you would use:

					[](#/RES_SR_Config/ImageTabs?m=m,man,male&f=f,fem,female)

			 */
			var tabConfig = document.querySelector('.side .md a[href^="#/RES_SR_Config/ImageTabs"]');

			if (tabConfig) {
				var switches = {};
				var switchCount = 0;

				var whitelist = /^[A-Za-z0-9_ \-]{1,32}$/;
				var configString = tabConfig.hash.match(/\?(.*)/);
				if (configString !== null) {
					var pairs = configString[1].split('&');
					for (var i = 0; i < pairs.length && switchCount < 8; i++) {
						var pair = pairs[i].split('=');
						if (pair.length !== 2) continue;
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
						this.customImageTabs[key] = new RegExp('[\\[\\{\\<\\(]\s*(' + switches[key].join('|') + ')\s*[\\]\\}\\>\\)]', 'i');
					}
				}
			}

			if (!/comments\/[-\w\.\/]/i.test(location.href)) {
				for (var mode in this.customImageTabs) {
					var li = document.createElement('li');
					var a = document.createElement('a');
					var text = document.createTextNode('[' + mode + ']');
					a.href = 'javascript:void(0);';
					a.className = 'RESTab-' + mode.toLowerCase().replace(/- /g, '_');
					a.addEventListener('click', (function(mode) {
						return function(e) {
							e.preventDefault();
							modules['showImages'].setShowImages(mode);
						};
					})(mode), true);

					a.appendChild(text);
					li.appendChild(a);
					mainMenuUL.appendChild(li);
				}
			}
		}
	},
	setShowImages: function(newImageTab, type) {
		type = type || 'image';
		if (newImageTab == null) {
			//This is for the all images button
			//If we stored `true` then toggle to false, in all other cases turn it to true
			if (this.currentImageTab == true) {
				this.currentImageTab = false;
			} else {
				this.currentImageTab = true;
			}
		} else if (this.currentImageTab == newImageTab) {
			//If they are the same, turn it off
			this.currentImageTab = false;
		} else if (newImageTab in this.customImageTabs) {
			//If the tab is defined, switch to it
			this.currentImageTab = newImageTab;
		} else {
			//Otherwise ignore it
			return;
		}
		this.updateImageButtons();
		this.updateRevealedImages(type);
	},
	updateImageButtons: function() {
		var imgCount = this.imageList.length;
		var showHideText = 'view';
		if (this.currentImageTab == true) {
			showHideText = 'hide';
		}
		if (typeof this.viewImageButton !== 'undefined') {
			var buttonText = showHideText + ' images ';
			if (!RESUtils.currentSubreddit('dashboard')) buttonText += '(' + imgCount + ')';
			$(this.viewImageButton).text(buttonText);
		}
	},
	updateRevealedImages: function(type) {
		for (var i = 0, len = this.imageList.length; i < len; i++) {
			var image = this.imageList[i];
			if ($(image).hasClass(type)) {
				this.revealImage(image, this.findImageFilter(image.imageLink));
			}
		}
	},
	findImageFilter: function(image) {
		var isMatched = false;
		if (typeof this.currentImageTab === 'boolean') {
			//booleans indicate show all or nothing
			isMatched = this.currentImageTab;
		} else if (this.currentImageTab in this.customImageTabs) {
			var re = this.customImageTabs[this.currentImageTab];
			isMatched = re.test(image.text);
		}
		//If false then there is no need to go through the NSFW filter
		if (!isMatched) return false;

		image.NSFW = false;
		if (this.options.hideNSFW.value) {
			image.NSFW = /nsfw/i.test(image.text);
		}

		return !image.NSFW;
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
		} else if(RESUtils.pageType() === 'wiki'){
			allElements = elem.querySelectorAll('.wiki-page-content a');
		} else {
			allElements = elem.querySelectorAll('#siteTable A.title');
		}

		if (RESUtils.pageType() === 'comments') {
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
			if (elem.classList.contains('title')) {
				elem.NSFW = elem.parentNode.parentNode.parentNode.classList.contains('over18');
			}
		} else {
			elem.NSFW = false;
		}
		var href = elem.href;
		if ((!elem.classList.contains('imgScanned') && (typeof this.imagesRevealed[href] === 'undefined' || !this.options.ignoreDuplicates.value || (RESUtils.currentSubreddit('dashboard'))) && href !== null) || this.scanningSelfText) {
			elem.classList.add('imgScanned');
			this.dupeAnchors++;
			var siteFound = false;
			if (siteFound = this.siteModules['default'].detect(elem)) {
				elem.site = 'default';
			}
			if (!siteFound) {
				for (var site in this.siteModules) {
					if (site === 'default') continue;
					if (this.siteModuleEnabled(site) && this.siteModules[site].detect(elem)) {
						elem.site = site;
						siteFound = true;
						break;
					}
				}
			}
			if (siteFound && !elem.NSFW) {
				this.imagesRevealed[href] = this.dupeAnchors;
				var siteMod = this.siteModules[elem.site];
				$.Deferred().resolve(elem).then(siteMod.handleLink).then(siteMod.handleInfo).
				then(this.createImageExpando, function() {
					console.error.apply(console, arguments);
				});
			}
		} else if (!elem.classList.contains('imgScanned')) {
			var textFrag = document.createElement('span');
			textFrag.setAttribute('class', 'RESdupeimg');
			$(textFrag).html(' <a class="noKeyNav" href="#img' + escapeHTML(this.imagesRevealed[href]) + '" title="click to scroll to original">[RES ignored duplicate image]</a>');
			RESUtils.insertAfter(elem, textFrag);
		}
	},

	siteModuleEnabled: function(site) {
		var retVal = true;
		if (this.options.hasOwnProperty('Display ' + site)) {
			retVal = this.options['Display ' + site].value;
		}
		return retVal;
	},

	createImageExpando: function(elem) {
		var mod = modules['showImages'];
		if (!elem) return false;
		var href = elem.href;
		if (!href) return false;
		
		// isSelfText indicates if this expando is being created within a
		// selftext expando.
		var isSelfTextExpando = false;
		if (! $(elem).hasClass('title') && RESUtils.pageType() === 'linklist') {
			if ($(elem).closest('.expando').length > 0) {
				isSelfTextExpando = true;
			}
		};
		//This should not be reached in the case of duplicates
		elem.name = 'img' + mod.imagesRevealed[href];

		//expandLink aka the expando button
		var expandLink = document.createElement('a');
		expandLink.className = 'toggleImage expando-button collapsedExpando';
		if (elem.type === 'IMAGE') expandLink.className += ' image';
		if (elem.type === 'GALLERY') expandLink.className += ' image gallery';
		if (elem.type === 'TEXT') expandLink.className += ' selftext collapsed';
		if (elem.type === 'VIDEO') expandLink.className += ' video collapsed';
		if (elem.type === 'MEDIACRUSH') expandLink.className += ' video collapsed'; // odds are it's interactive anyway
		if (elem.type === 'AUDIO') expandLink.className += ' video collapsed'; // yes, still class "video", that's what reddit uses.
		if (elem.type === 'NOEMBED') expandLink.className += ' ' + elem.expandoClass;

		if (elem.type === 'GALLERY' && elem.src && elem.src.length) expandLink.setAttribute('title', elem.src.length + ' items in gallery');
		$(expandLink).html('&nbsp;');
		expandLink.addEventListener('click', function(e) {
			e.preventDefault();
			modules['showImages'].revealImage(e.target, (e.target.classList.contains('collapsedExpando')));
		}, true);
		var preNode = null;
		if (elem.parentNode.classList.contains('title')) {
			preNode = elem.parentNode;
			expandLink.classList.add('linkImg');
		} else {
			preNode = elem;
			expandLink.classList.add('commentImg');
		}
		RESUtils.insertAfter(preNode, expandLink);
		/*
		 * save the link element for later use since some extensions
		 * like web of trust can place other elements in places that
		 * confuse the old method
		 */
		expandLink.imageLink = elem;
		mod.imageList.push(expandLink);

		if ((mod.scanningSelfText || isSelfTextExpando) && mod.options.autoExpandSelfText.value) {
			mod.revealImage(expandLink, true);
		} else {
			// this may have come from an asynchronous call, in which case it'd get missed by findAllImages, so
			// if all images are supposed to be visible, expand this link now.
			mod.revealImage(expandLink, mod.findImageFilter(expandLink.imageLink));
		}
		if (mod.scanningForImages == false) {
			// also since this may have come from an asynchronous call, we need to update the view images count.
			mod.updateImageButtons(mod.imageList.length);
		}
	},
	revealImage: function(expandoButton, showHide) {
		if ((!expandoButton) || (!$(expandoButton).is(':visible'))) return false;
		// showhide = false means hide, true means show!

		var imageLink = expandoButton.imageLink;
		if (typeof this.siteModules[imageLink.site] === 'undefined') {
			console.log('something went wrong scanning image from site: ' + imageLink.site);
			return;
		}
		if (expandoButton.expandoBox && expandoButton.expandoBox.classList.contains('madeVisible')) {
			if (!showHide) {
				$(expandoButton).removeClass('expanded').addClass('collapsed collapsedExpando');
				expandoButton.expandoBox.style.display = 'none';
				if (imageLink.type === 'AUDIO' || imageLink.type === 'VIDEO') {
					var mediaTag = expandoButton.expandoBox.querySelector(imageLink.type);
					mediaTag.wasPaused = mediaTag.paused;
					mediaTag.pause();
				}
			} else {
				$(expandoButton).addClass('expanded').removeClass('collapsed collapsedExpando');
				expandoButton.expandoBox.style.display = 'block';
				var associatedImage = $(expandoButton).data('associatedImage');
				if (associatedImage) {
					modules['showImages'].syncPlaceholder(associatedImage);
				}
				if (imageLink.type === 'AUDIO' || imageLink.type === 'VIDEO') {
					var mediaTag = expandoButton.expandoBox.querySelector(imageLink.type);
					if (!mediaTag.wasPaused) {
						mediaTag.play();
					}
				}
			}
			this.handleSRStyleToggleVisibility();
		} else if (showHide) {
			//TODO: flash
			switch (imageLink.type) {
				case 'IMAGE':
				case 'GALLERY':
					this.generateImageExpando(expandoButton);
					break;
				case 'TEXT':
					this.generateTextExpando(expandoButton);
					break;
				case 'VIDEO':
					this.generateVideoExpando(expandoButton, imageLink.mediaOptions);
					break;
				case 'AUDIO':
					this.generateAudioExpando(expandoButton);
					break;
				case 'NOEMBED':
					this.generateNoEmbedExpando(expandoButton);
					break;
				case 'MEDIACRUSH':
					this.generateMediacrushExpando(expandoButton, imageLink.expandoOptions);
					break;
			}
		}
	},
	generateImageExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var which = imageLink.galleryStart || 0;

		var imgDiv = document.createElement('div');
		imgDiv.classList.add('madeVisible');
		imgDiv.currentImage = which;
		imgDiv.sources = [];

		// Test for a single image or an album/array of image
		if (Array.isArray(imageLink.src)) {
			imgDiv.sources = imageLink.src;

			// Also preload images for an album
			this.preloadImages(imageLink.src, 0);
		} else {
			// Only the image is left to display, pack it like a single-image album with no caption or title
			var singleImage = {
				src: imageLink.src,
				href: imageLink.href
			};
			imgDiv.sources[0] = singleImage;
		}

		if ('imageTitle' in imageLink) {
			var header = document.createElement('h3');
			header.classList.add('imgTitle');
			$(header).safeHtml(imageLink.imageTitle);
			imgDiv.appendChild(header);
		}

		if ('imgCaptions' in imageLink) {
			var captions = document.createElement('div');
			captions.className = 'imgCaptions';
			$(captions).safeHtml(imageLink.caption);
			imgDiv.appendChild(captions);
		}

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			$(credits).safeHtml(imageLink.credits);
			imgDiv.appendChild(credits);
		}

		switch (imageLink.type) {
			case 'GALLERY':
				if (this.options.loadAllInAlbum.value) {
					if (imgDiv.sources.length > 1) {
						var albumLength = " (" + imgDiv.sources.length + " images)";
						$(header).append(albumLength);
					}

					for (var imgNum = 0; imgNum < imgDiv.sources.length; imgNum++) {
						addImage(imgDiv, imgNum, this);
					}
					break;
				} else {
					// If we're using the traditional album view, add the controls then fall through to add the IMAGE
					var controlWrapper = document.createElement('div');
					controlWrapper.className = 'RESGalleryControls';

					var leftButton = document.createElement("a");
					leftButton.className = 'previous noKeyNav';
					leftButton.addEventListener('click', function(e) {
						var topWrapper = e.target.parentElement.parentElement;
						if (topWrapper.currentImage === 0) {
							topWrapper.currentImage = topWrapper.sources.length - 1;
						} else {
							topWrapper.currentImage -= 1;
						}
						adjustGalleryDisplay(topWrapper);
					});
					controlWrapper.appendChild(leftButton);

					var posLabel = document.createElement('span');
					posLabel.className = 'RESGalleryLabel';
					var niceWhich = ((which + 1 < 10) && (imgDiv.sources.length >= 10)) ? '0' + (which + 1) : (which + 1);
					if (imgDiv.sources.length) {
						posLabel.textContent = niceWhich + " of " + imgDiv.sources.length;
					} else {
						posLabel.textContent = "Whoops, this gallery seems to be empty.";
					}
					controlWrapper.appendChild(posLabel);

					var rightButton = document.createElement("a");
					rightButton.className = 'next noKeyNav';
					rightButton.addEventListener('click', function(e) {
						var topWrapper = e.target.parentElement.parentElement;
						if (topWrapper.currentImage == topWrapper.sources.length - 1) {
							topWrapper.currentImage = 0;
						} else {
							topWrapper.currentImage += 1;
						}
						adjustGalleryDisplay(topWrapper);
					});
					controlWrapper.appendChild(rightButton);

					if (!imgDiv.sources.length) {
						$(leftButton).css('visibility', 'hidden');
						$(rightButton).css('visibility', 'hidden');
					}

					imgDiv.appendChild(controlWrapper);
				}

			case 'IMAGE':
				addImage(imgDiv, which, this);
		}

		function addImage(container, sourceNumber, thisHandle) {
			var sourceImage = container.sources[sourceNumber];

			var paragraph = document.createElement('p');

			if (!sourceImage) {
				return;
			}
			if ('title' in sourceImage) {
				var imageTitle = document.createElement('h4');
				imageTitle.className = 'imgCaptions';
				$(imageTitle).safeHtml(sourceImage.title);
				paragraph.appendChild(imageTitle);
			}

			if ('caption' in sourceImage) {
				var imageCaptions = document.createElement('div');
				imageCaptions.className = 'imgCaptions';
				$(imageCaptions).safeHtml(sourceImage.caption);
				paragraph.appendChild(imageCaptions);
			}

			var imageAnchor = document.createElement('a');
			imageAnchor.classList.add('madeVisible');
			imageAnchor.href = sourceImage.href;
			if (thisHandle.options.openInNewWindow.value) {
				imageAnchor.target = '_blank';
			}

			var image = document.createElement('img');
			$(expandoButton).data('associatedImage', image);
			//Unfortunately it is impossible to use a global event handler for these.
			image.onerror = function() {
				image.classList.add("RESImageError");
			};
			image.onload = function() {
				image.classList.remove("RESImageError");
			};
			image.classList.add('RESImage');
			image.id = 'RESImage-' + RESUtils.randomHash();
			image.src = sourceImage.src;
			image.title = 'drag to resize';
			image.style.maxWidth = thisHandle.options.maxWidth.value + 'px';
			image.style.maxHeight = thisHandle.options.maxHeight.value + 'px';
			imageAnchor.appendChild(image);
			modules['showImages'].setPlaceholder(image);
			thisHandle.makeImageZoomable(image);
			thisHandle.trackImageLoad(imageLink, image);
			paragraph.appendChild(imageAnchor);

			container.appendChild(paragraph);
		}

		//Adjusts the images for the gallery navigation buttons as well as the "n of m" display.

		function adjustGalleryDisplay(topLevel) {
			var source = topLevel.sources[topLevel.currentImage];
			var image = topLevel.querySelector('img.RESImage');
			var imageAnchor = image.parentElement;
			var paragraph = imageAnchor.parentElement;
			image.src = source.src;
			imageAnchor.href = source.href || imageLink.href;
			var paddedImageNumber = ((topLevel.currentImage + 1 < 10) && (imgDiv.sources.length >= 10)) ? '0' + (topLevel.currentImage + 1) : topLevel.currentImage + 1;
			if (imgDiv.sources.length) {
				topLevel.querySelector('.RESGalleryLabel').textContent = (paddedImageNumber + " of " + imgDiv.sources.length);
			} else {
				topLevel.querySelector('.RESGalleryLabel').textContent = "Whoops, this gallery seems to be empty.";
			}
			if (topLevel.currentImage === 0) {
				leftButton.classList.add('end');
				rightButton.classList.remove('end');
			} else if (topLevel.currentImage === topLevel.sources.length - 1) {
				leftButton.classList.remove('end');
				rightButton.classList.add('end');
			} else {
				leftButton.classList.remove('end');
				rightButton.classList.remove('end');
			}

			$(paragraph).find('.imgCaptions').empty();
			var imageTitle = paragraph.querySelector('h4.imgCaptions');
			if (imageTitle) $(imageTitle).safeHtml(source.title);
			var imageCaptions = paragraph.querySelector('div.imgCaptions');
			if (imageCaptions) $(imageCaptions).safeHtml(source.caption);
		}

		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, imgDiv);
		} else {
			expandoButton.parentNode.appendChild(imgDiv);
		}
		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.add('expanded');
	},
	/**
	 * Recursively loads the images synchronously.
	 */
	preloadImages: function(srcs, i) {
		var _this = this,
			_i = i,
			img = new Image();
		img.onload = img.onerror = function() {
			_i++;
			if (typeof srcs[_i] === 'undefined') {
				return;
			}
			_this.preloadImages(srcs, _i);

			delete img; // Delete the image element from the DOM to stop the RAM usage getting to high.
		}
		img.src = srcs[i].src;
	},
	generateTextExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		var text = document.createElement('div');
		text.className = 'md';
		$(text).safeHtml(imageLink.src);
		imgDiv.appendChild(text);

		var captions = document.createElement('div');
		captions.className = 'imgCaptions';
		$(captions).safeHtml(imageLink.caption);
		imgDiv.appendChild(captions);

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			$(credits).safeHtml(imageLink.credits);
			imgDiv.appendChild(credits);
		}

		wrapperDiv.appendChild(imgDiv);
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}
		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		//TODO: Decide how to handle history for this.
		//Selfposts already don't mark it, so either don't bother or add marking for selfposts.
	},
	generateVideoExpando: function(expandoButton, options) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		var video = document.createElement('video');
		video.addEventListener('click', modules['showImages'].handleVideoClick);
		modules['showImages'].makeImageZoomable(video);
		video.setAttribute('controls', '');
		video.setAttribute('preload', '');
		if (options) {
			if (options.autoplay) {
				video.setAttribute('autoplay', '');
			}
			if (options.muted) {
				video.setAttribute('muted', '');
			}
			if (options.loop) {
				video.setAttribute('loop', '');
			}
		}
		var sourcesHTML = "",
			sources = $(imageLink).data('sources'),
			source, sourceEle;

		for (var i = 0, len = sources.length; i < len; i++) {
			source = sources[i];
			sourceEle = document.createElement('source');
			sourceEle.src = source.file;
			sourceEle.type = source.type;
			$(video).append(sourceEle);
		}

		imgDiv.appendChild(video);

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			$(credits).safeHtml(imageLink.credits);
			imgDiv.appendChild(credits);
		}

		wrapperDiv.appendChild(imgDiv);
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}
		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		modules['showImages'].trackImageLoad(imageLink, video);

	},
	generateAudioExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		var header = document.createElement('h3');
		header.className = 'imgTitle';
		$(header).safeHtml(imageLink.imageTitle);
		imgDiv.appendChild(header);

		var audio = document.createElement('audio');
		audio.addEventListener('click', modules['showImages'].handleaudioClick);
		audio.setAttribute('controls', '');
		// TODO: add mute/unmute control, play/pause control.

		var sourcesHTML = "",
			sources = $(imageLink).data('sources'),
			source, sourceEle;

		for (var i = 0, len = sources.length; i < len; i++) {
			source = sources[i];
			sourceEle = document.createElement('source');
			sourceEle.src = source.file;
			sourceEle.type = source.type;
			$(audio).append(sourceEle);
		}

		imgDiv.appendChild(audio);

		if ('credits' in imageLink) {
			var credits = document.createElement('div');
			credits.className = 'imgCredits';
			$(credits).safeHtml(imageLink.credits);
			imgDiv.appendChild(credits);
		}

		wrapperDiv.appendChild(imgDiv);
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}
		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		modules['showImages'].trackImageLoad(imageLink, audio);
	},
	generateMediacrushExpando: function(expandoButton, options) {
		var imageLink = expandoButton.imageLink;
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var imgDiv = document.createElement('div');
		imgDiv.className = 'madeVisible usertext-body';

		if (options.media.type != 'application/album') {
			var brand = document.createElement('a');
			brand.href = MediaCrush.domain + '/' + options.media.hash;
			brand.target = '_blank';
			brand.className = 'mediacrush-brand';
			var image = document.createElement('img');
			image.src = MediaCrush.logo;
			image.width = 16; image.height = 16;
			brand.appendChild(image);
			var span = document.createElement('span');
			span.textContent = 'MediaCrush';
			brand.appendChild(span);
		}

		var element = options.generate(options);

		expandoButton.addEventListener('click', function(e) {
			if (options.media.blob_type === 'video' || options.media.blob_type === 'audio') {
				var media = wrapperDiv.querySelector('video, audio');
				if (expandoButton.classList.contains('expanded')) {
					if (!media.wasPaused) {
						media.play();
					}
				}
				else {
					media.wasPaused = media.paused;
					media.pause();
				}
			}
		}, false);

		if (options.media.type != 'application/album')
			imgDiv.appendChild(brand);
		imgDiv.appendChild(element);

		wrapperDiv.appendChild(imgDiv);
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}
		expandoButton.expandoBox = imgDiv;

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		modules['showImages'].trackImageLoad(imageLink, element);

	},
	handleVideoClick: function(e) {
		// for now, this does nothing, because apparently HTML5 video
		// doesn't have a way to detect clicks of native controls via
		// javascript, which means that even if you're muting/unmuting,
		// changing volume etc this event fires and will play/pause the
		// video, but e.target and e.currentTarget still point to the video
		// and not the controls... yuck.
		// 
		// if (e.target.paused) {
		//     e.target.play();
		// }
		// else {
		//     e.target.pause();
		// }
	},
	generateNoEmbedExpando: function(expandoButton) {
		var imageLink = expandoButton.imageLink,
			siteMod = imageLink.siteMod,
			apiURL = 'http://noembed.com/embed?url=' + imageLink.src,
			def = $.Deferred();

		GM_xmlhttpRequest({
			method: 'GET',
			url: apiURL,
			// aggressiveCache: true,
			onload: function(response) {
				try {
					var json = JSON.parse(response.responseText);
					siteMod.calls[apiURL] = json;
					modules['showImages'].handleNoEmbedQuery(expandoButton, json);
					def.resolve(elem, json);
				} catch (error) {
					siteMod.calls[apiURL] = null;
					def.reject();
				}
			},
			onerror: function(response) {
				def.reject();
			}
		});
	},
	handleNoEmbedQuery: function(expandoButton, response) {
		var imageLink = expandoButton.imageLink;

		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'usertext';

		var noEmbedFrame = document.createElement('iframe');
		// not all noEmbed responses have a height and width, so if
		// this siteMod has a width and/or height set, use them.
		if (imageLink.siteMod.width) {
			noEmbedFrame.setAttribute('width', imageLink.siteMod.width);
		}
		if (imageLink.siteMod.height) {
			noEmbedFrame.setAttribute('height', imageLink.siteMod.height);
		}
		if (imageLink.siteMod.urlMod) {
			noEmbedFrame.setAttribute('src', imageLink.siteMod.urlMod(response.url));
		}
		for (key in response) {
			switch (key) {
				case 'url':
					if (!noEmbedFrame.hasAttribute('src')) {
						noEmbedFrame.setAttribute('src', response[key]);
					}
					break;
				case 'width':
					noEmbedFrame.setAttribute('width', response[key]);
					break;
				case 'height':
					noEmbedFrame.setAttribute('height', response[key]);
					break;
			}
		}
		noEmbedFrame.className = 'madeVisible usertext-body';

		wrapperDiv.appendChild(noEmbedFrame);
		if (expandoButton.classList.contains('commentImg')) {
			RESUtils.insertAfter(expandoButton, wrapperDiv);
		} else {
			expandoButton.parentNode.appendChild(wrapperDiv);
		}

		expandoButton.expandoBox = noEmbedFrame;

		expandoButton.classList.remove('collapsedExpando');
		expandoButton.classList.remove('collapsed');
		expandoButton.classList.add('expanded');

		modules['showImages'].trackImageLoad(imageLink, video);
	},
	visits: [],
	trackVisit: function(link) {
		var $link = $(link).closest('.thing'),
			fullname;

		if (BrowserDetect.isChrome()) {
			if (!chrome.extension.inIncognitoContext) {
				return;
			}
		}


		if ($link.hasClass('visited')) {
			return;
		}

		fullname = $link.data('fullname');

		if (this.sendVisitsThrottle) {
			clearTimeout(this.sendVisitsThrottle);
		}
		this.visits.push(fullname);
		this.sendVisitsThrottle = setTimeout(this.sendVisits, 1000);
	},
	sendVisits: function() {
		var modhash = RESUtils.loggedInUserHash(),
			data = modules['showImages'].visits.join(',');

		$.ajax({
			type: 'POST',
			url: '/api/store_visits',
			headers: {
				'X-Modhash': modhash
			},
			data: {
				'links': data
			},
			success: function() {
				// clear the queue.
				modules['showImages'].visits = [];
			}
		});
	},
	trackImageLoad: function(link, image) {
		if (modules['showImages'].options.markVisited.value) {
			// also use reddit's mechanism for storing visited links if user has gold.
			if ($('body').hasClass('gold')) {
				this.trackVisit(link);
			}
			var isNSFW = $(link).closest('.thing').is('.over18');
			var sfwMode = modules['showImages'].options['sfwHistory'].value;

			if ((BrowserDetect.isChrome()) || (BrowserDetect.isFirefox())) {
				var url = link.historyURL || link.href;
				if (!isNSFW || sfwMode !== 'none') link.classList.add('visited');
				if (!isNSFW || sfwMode === 'add') {
					modules['showImages'].imageTrackStack.push(url);
					if (modules['showImages'].imageTrackStack.length === 1) setTimeout(modules['showImages'].imageTrackShift, 300);
				}
			} else {
				image.addEventListener('load', function(e) {
					var url = link.historyURL || link.href;
					if (!isNSFW || sfwMode !== 'none') link.classList.add('visited');
					if (!isNSFW || sfwMode === 'add') {
						modules['showImages'].imageTrackStack.push(url);
						if (modules['showImages'].imageTrackStack.length === 1) setTimeout(modules['showImages'].imageTrackShift, 300);
					}
				}, false);
			}
		}

		image.addEventListener('load', function(e) {
			modules['showImages'].handleSRStyleToggleVisibility(e.target);
		}, false);
	},
	imageTrackShift: function() {
		var url = modules['showImages'].imageTrackStack.shift();
		if (typeof url === 'undefined') {
			modules['showImages'].handleSRStyleToggleVisibility();
			return;
		}

		var thisJSON = {
			requestType: 'addURLToHistory',
			url: url
		};

		if (!BrowserDetect.isChrome() || !chrome.extension.inIncognitoContext) {
			RESUtils.sendMessage(thisJSON);
		}

		if (BrowserDetect.isChrome() || BrowserDetect.isFirefox()) {
			modules['showImages'].imageTrackShift();
		}
	},
	dragTargetData: {
		//numbers just picked as sane initialization values
		imageWidth: 100,
		diagonal: 0, //zero to represent the state where no the mouse button is not down
		dragging: false
	},
	getDragSize: function(e) {
		var rc = e.target.getBoundingClientRect(),
			p = Math.pow,
			dragSize = p(p(e.clientX - rc.left, 2) + p(e.clientY - rc.top, 2), .5);

		return Math.round(dragSize);
	},
	handleSRStyleToggleVisibility: function(image) {
		RESUtils.debounce('handleSRStyleToggleVisibility', 50, function() {
			var toggleEle = modules['styleTweaks'].styleToggleContainer;
			if (!toggleEle) return;
			var imageElems = image ? [image] : document.querySelectorAll('.RESImage');

			for (var i = 0; i < imageElems.length; i++) {
				var imageEle = imageElems[i];
				var imageID = imageEle.getAttribute('id');

				if (RESUtils.doElementsCollide(toggleEle, imageEle, 15)) {
					modules['styleTweaks'].setSRStyleToggleVisibility(false, 'imageZoom-' + imageID);
				} else {
					modules['styleTweaks'].setSRStyleToggleVisibility(true, 'imageZoom-' + imageID);
				}
			}
		});
	},
	setPlaceholder: function(imageTag) {
		if (!$(imageTag).data('imagePlaceholder')) {
			var thisPH = RESUtils.createElementWithID('div', 'RESImagePlaceholder');
			$(thisPH).addClass('RESImagePlaceholder');
			$(imageTag).data('imagePlaceholder', thisPH);
			// Add listeners for drag to resize functionality...
			$(imageTag).parent().append($(imageTag).data('imagePlaceholder'));
		}
		$(imageTag).load(modules['showImages'].syncPlaceholder);
	},
	syncPlaceholder: function(e) {
		var ele = e.target || e;
		var thisPH = $(ele).data('imagePlaceholder');
		$(thisPH).width($(ele).width() + 'px');
		$(thisPH).height($(ele).height() + 'px');
		$(ele).addClass('loaded');
	},
	makeImageZoomable: function(imageTag) {
		if (this.options.imageZoom.value) {
			imageTag.addEventListener('mousedown', modules['showImages'].mousedownImage, false);
			imageTag.addEventListener('mouseup', modules['showImages'].dragImage, false);
			imageTag.addEventListener('mousemove', modules['showImages'].dragImage, false);
			imageTag.addEventListener('mouseout', modules['showImages'].mouseoutImage, false);

			// click event is unneeded for HTML5 video
			if (imageTag.tagName !== 'VIDEO') {
				imageTag.addEventListener('click', modules['showImages'].clickImage, false);
			}
		}
	},
	mousedownImage: function(e) {
		if (e.button === 0) {
			if (e.target.tagName === 'VIDEO') {
				var rc = e.target.getBoundingClientRect();
				// ignore drag if click is in control area (40 px from bottom of video)
				if ((rc.height - 40) < (e.clientY - rc.top)) {
					return true;
				}
			}

			if (!e.target.minWidth) e.target.minWidth = Math.max(1, Math.min($(e.target).width(), 100));
			modules['showImages'].dragTargetData.imageWidth = $(e.target).width();
			modules['showImages'].dragTargetData.diagonal = modules['showImages'].getDragSize(e);
			modules['showImages'].dragTargetData.dragging = false;
			modules['showImages'].dragTargetData.hasChangedWidth = false;
			e.preventDefault();
		}
	},
	mouseoutImage: function(e) {
		modules['showImages'].dragTargetData.diagonal = 0;
	},
	dragImage: function(e) {
		if (modules['showImages'].dragTargetData.diagonal) {
			var newDiagonal = modules['showImages'].getDragSize(e),
				oldDiagonal = modules['showImages'].dragTargetData.diagonal,
				imageWidth = modules['showImages'].dragTargetData.imageWidth,
				maxWidth = Math.max(e.target.minWidth, newDiagonal / oldDiagonal * imageWidth);

			modules['showImages'].resizeImage(e.target, maxWidth);
			modules['showImages'].dragTargetData.dragging = true;
		}
		modules['showImages'].handleSRStyleToggleVisibility(e.target);
		if (e.type === 'mouseup') {
			modules['showImages'].dragTargetData.diagonal = 0;
		}
	},
	clickImage: function(e) {
		modules['showImages'].dragTargetData.diagonal = 0;
		if (modules['showImages'].dragTargetData.hasChangedWidth) {
			modules['showImages'].dragTargetData.dragging = false;
			e.preventDefault();
			return false;
		}
		modules['showImages'].dragTargetData.hasChangedWidth = false;
	},
	resizeImage: function(image, newWidth) {
		var currWidth = $(image).width();
		if (newWidth !== currWidth) {
			modules['showImages'].dragTargetData.hasChangedWidth = true;

			image.style.width = newWidth + 'px';
			image.style.maxWidth = newWidth + 'px';
			image.style.maxHeight = '';
			image.style.height = 'auto';

			var thisPH = $(image).data('imagePlaceholder');
			$(thisPH).width($(image).width() + 'px');
			$(thisPH).height($(image).height() + 'px');
		}
	},
	siteModules: {
		'default': {
			acceptRegex: /^[^#]+?\.(gif|jpe?g|png)(?:[?&#_].*|$)/i,
			rejectRegex: /(wikipedia\.org\/wiki|photobucket\.com|gifsound\.com|\/wiki\/File:.*)/i,
			go: function() {},
			detect: function(elem) {
				var siteMod = modules['showImages'].siteModules['default'];
				var href = elem.href;
				return (siteMod.acceptRegex.test(href) && !siteMod.rejectRegex.test(href));
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var href = elem.href;

				def.resolve(elem, {
					type: 'IMAGE',
					src: elem.href
				});
				return def.promise()
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();

				elem.type = info.type;
				elem.src = info.src;
				elem.href = info.src;

				if (RESUtils.pageType() === 'linklist' && elem.classList.contains('title')) {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				def.resolve(elem);
				return def.promise();
			}
		},
		imgur: {
			options: {
				'display imgur': {
					description: 'Display expander for imgur images and albums',
					value: true,
					type: 'boolean'
				},
				'prefer RES albums': {
					description: 'Prefer RES support for imgur albums rather than reddit\'s built in support',
					value: true,
					type: 'boolean'
				}
			},
			APIKey: 'fe266bc9466fe69aa1cf0904e7298eda',
			// hashRe: /^https?:\/\/(?:i\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)?([\w]{5,}(?:[&,][\w]{5,})?)(\..+)?(?:#(\d*))?$/i,
			// the modified regex below fixes detection of "edited" imgur images, but imgur's edited images are broken right now actually, falling into
			// a redirect loop.  preserving the old one just in case.  however it also fixes detection of the extension (.jpg, for example) which
			// was too greedy a search...
			// the hashRe below was provided directly by MrGrim (well, everything after the domain was), using that now.
			hashRe: /^https?:\/\/(?:i\.|m\.|edge\.|www\.)*imgur\.com\/(?!gallery)(?!removalrequest)(?!random)(?!memegen)([A-Za-z0-9]{5}|[A-Za-z0-9]{7})[sbtmlh]?(\.(?:jpe?g|gif|png))?(\?.*)?$/i,
			albumHashRe: /^https?:\/\/(?:i\.|m\.)?imgur\.com\/(?:a|gallery)\/([\w]+)(\..+)?(?:\/)?(?:#\w*)?$/i,
			apiPrefix: 'http://api.imgur.com/2/',
			calls: {},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('imgur.com/') !== -1;
			},
			handleLink: function(elem) {
				var siteMod = modules['showImages'].siteModules['imgur'];
				var def = $.Deferred();
				var href = elem.href.split('?')[0];
				var groups = siteMod.hashRe.exec(href);
				if (!groups) var albumGroups = siteMod.albumHashRe.exec(href);
				if (groups && !groups[2]) {
					if (groups[1].search(/[&,]/) > -1) {
						var hashes = groups[1].split(/[&,]/);
						def.resolve(elem, {
							album: {
								images: hashes.map(function(hash) {
									return {
										image: {
											title: '',
											caption: '',
											hash: hash
										},
										links: {
											original: 'http://i.imgur.com/' + hash + '.jpg'
										}
									};
								})
							}
						});
					} else {
						// removed caption API calls as they don't seem to exist/matter for single images, only albums...
						//If we don't show captions, then we can skip the API call.
						def.resolve(elem, {
							image: {
								links: {
									//Imgur doesn't really care about the extension and the browsers don't seem to either.
									original: 'http://i.imgur.com/' + groups[1] + '.jpg'
								},
								image: {}
							}
						});
					}
				} else if (albumGroups && !albumGroups[2]) {
					// on detection, if "prefer RES albums" is checked, hide any existing expando...
					// we actually remove it from the DOM for a number of reasons, including the
					// fact that many subreddits style them with display: block !important;, which
					// overrides a "hide" call here.
					if (modules['showImages'].options['prefer RES albums'].value === true) {
						$(elem).closest('.entry').find('.expando-button.video').remove();
						var apiURL = siteMod.apiPrefix + 'album/' + albumGroups[1] + '.json';
						elem.imgHash = albumGroups[1];
						if (apiURL in siteMod.calls) {
							if (siteMod.calls[apiURL] != null) {
								def.resolve(elem, siteMod.calls[apiURL]);
							} else {
								def.reject();
							}
						} else {
							GM_xmlhttpRequest({
								method: 'GET',
								url: apiURL,
								// aggressiveCache: true,
								onload: function(response) {
									try {
										var json = JSON.parse(response.responseText);
										siteMod.calls[apiURL] = json;
										def.resolve(elem, json);
									} catch (error) {
										siteMod.calls[apiURL] = null;
										def.reject();
									}
								},
								onerror: function(response) {
									def.reject();
								}
							});
						}
					} else {
						// do not use RES's album support...
						return def.reject();
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				if ('image' in info) {
					return modules['showImages'].siteModules['imgur'].handleSingleImage(elem, info);
				} else if ('album' in info) {
					return modules['showImages'].siteModules['imgur'].handleGallery(elem, info);
				} else if (info.error && info.error.message === 'Album not found') {
					// This case comes up when there is an imgur.com/gallery/HASH link that
					// links to an image, not an album (not to be confused with the word "gallery", ugh)
					info = {
						image: {
							links: {
								original: 'http://i.imgur.com/' + elem.imgHash + '.jpg'
							},
							image: {}
						}
					};
					return modules['showImages'].siteModules['imgur'].handleSingleImage(elem, info);
				} else {
					return $.Deferred().reject().promise();
					// console.log("ERROR", info);
					// console.log(arguments.callee.caller);
				}
			},
			handleSingleImage: function(elem, info) {
				elem.src = info.image.links.original;
				elem.href = info.image.links.original;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				elem.type = 'IMAGE';
				if (info.image.image.caption) elem.caption = info.image.image.caption;
				return $.Deferred().resolve(elem).promise();
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
						elem.galleryStart = parseInt(hash, 10);
					}
				}
				elem.imageTitle = info.album.title;
				elem.caption = info.album.description;
				elem.type = 'GALLERY';
				return $.Deferred().resolve(elem).promise();
			}
		},
		gfycat: {
			options: {
				'display gfycat': {
					description: 'Display expander for gfycat',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('gfycat.com') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/[a-zA-Z0-9\-\.]*gfycat\.com\/(\w+)\.?/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);

				if (!groups) return def.reject();
				var href = elem.href.toLowerCase();
				var hotLink = false;
				if (href.indexOf('giant.gfycat') !== -1 ||
					href.indexOf('fat.gfycat') !== -1 ||
					href.indexOf('zippy.gfycat') !== -1)
					hotLink = true;

				var siteMod = modules['showImages'].siteModules['gfycat'];
				var apiURL = 'http://gfycat.com/cajax/get/' + groups[1];

				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						siteMod.calls[apiURL] = null;
						def.reject();
					}
				} else {
					GM_xmlhttpRequest({
						method: 'GET',
						url: apiURL,
						aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
								json.gfyItem.src = elem.href;
								json.gfyItem.hotLink = hotLink
								siteMod.calls[apiURL] = json;
								def.resolve(elem, json.gfyItem);
							} catch (error) {
								siteMod.calls[apiURL] = null;
								def.reject()
							}
						},
						onerror: function(response) {
							def.reject();
						}
					});
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				function humanSize(bytes) {
					var byteUnits = [' kB', ' MB'];
					for (var i = -1; bytes > 1024; i++) {
						bytes = bytes / 1024;
					}
					return Math.max(bytes, 0.1).toFixed(1) + byteUnits[i];
				}
				if (info.hotLink) {
					elem.type = "IMAGE";
					elem.src = info.src;
					elem.imageTitle = humanSize(info.gifSize);
					if (((info.gifSize > 524288 && (info.gifSize / info.mp4Size) > 5) || (info.gifSize > 1048576 && (info.gifSize / info.mp4Size) > 2)) && document.createElement('video').canPlayType)
						elem.imageTitle += ' (' + humanSize(info.mp4Size) + " for <a href='http://gfycat.com/" + info.gfyName + "'>HTML5 version.</a>)";

					if (RESUtils.pageType() === 'linklist') {
						$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
					}
					return $.Deferred().resolve(elem).promise();
				}

				elem.mediaOptions = {
					autoplay: true,
					loop: true
				}

				sources = [];
				sources[0] = {
					'file': info.mp4Url,
					'type': 'video/mp4'
				};
				sources[1] = {
					'file': info.webmUrl,
					'type': 'video/webm'
				};
				elem.type = 'VIDEO';
				$(elem).data('sources', sources);

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				return $.Deferred().resolve(elem).promise();
			}
		},
		giflike: {
			options: {
				'display giflike': {
					description: 'Inline Giflike player',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('giflike.com') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/www\.giflike\.com\/a\/(\w+)/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);

				if (!groups) return def.reject();
				var href = elem.href.toLowerCase();

				var siteMod = modules['showImages'].siteModules['giflike'];
				var apiURL = 'http://www.giflike.com/a/' + groups[1] + '.json';

				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						siteMod.calls[apiURL] = null;
						def.reject();
					}
				} else {
					GM_xmlhttpRequest({
						method: 'GET',
						url: apiURL,
						aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
								siteMod.calls[apiURL] = json;
								var mp4Sizes = json['sizes'] ? json['sizes']['mp4'] : {};
								var size = mp4Sizes['d'] || mp4Sizes['p'] || mp4Sizes['o'];
								if (!size) {
									def.reject();
								} else {
									json['token'] = size.name;
									def.resolve(elem, json);
								}
							} catch (error) {
								siteMod.calls[apiURL] = null;
								def.reject()
							}
						},
						onerror: function(response) {
							def.reject();
						}
					});
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.mediaOptions = {
					autoplay: true,
					loop: true
				}
				sources = [];
				var token = info['token'];
				sources[0] = {
					'file': 'http://i.giflike.com/' + info['animation_id'] + '_' + token + '.mp4',
					'type': 'video/mp4'
				};
				sources[1] = {
					'file': 'http://i.giflike.com/' + info['animation_id'] + '_' + token + '.webm',
					'type': 'video/webm'
				};
				elem.type = 'VIDEO';
				$(elem).data('sources', sources);
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		ctrlv: {
			options: {
				'display ctrlv': {
					description: 'Display expander for CtrlV.in',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return elem.href.toLowerCase().indexOf('ctrlv.in/') !== -1;
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/((m|www)\.)?ctrlv\.in\/([0-9]+)/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, {
						type: 'IMAGE',
						src: 'http://img.ctrlv.in/id/' + groups[3],
						href:elem.href
					});
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();

				elem.type = info.type;
				elem.src = info.src;
				elem.href = info.href;

				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}

				def.resolve(elem);
				return def.promise();
			}
		},
		ehost: {
			options: {
				'display ehost': {
					description: 'Display expander for ehost',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('eho.st') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^http:\/\/(?:i\.)?(?:\d+\.)?eho\.st\/(\w+)\/?/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, {
						src: 'http://i.eho.st/' + groups[1] + '.jpg'
					});
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				elem.onerror = function() {
					if (this.src.indexOf('.jpg') !== -1) {
						this.src = this.src.slice(0, elem.src.length - 3) + 'png';
					} else if (this.src.indexOf('.png') !== -1) {
						this.src = this.src.slice(0, elem.src.length - 3) + 'gif';
					}
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		picsarus: {
			options: {
				'display picsarus': {
					description: 'Display expander for picsarus',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('picsarus.com') !== -1 && href.substring(-1) !== '+';
			},
			handleLink: function(elem) {
				var hashRe = /^https?:\/\/(?:i\.|edge\.|www\.)*picsarus\.com\/(?:r\/[\w]+\/)?([\w]{6,})(\..+)?$/i;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, {
						src: 'http://www.picsarus.com/' + groups[1] + '.jpg'
					});
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		snaggy: {
			options: {
				'display snag.gy': {
					description: 'Display expander for snag.gy',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('snag.gy/') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var href = elem.href;
				var extensions = ['.jpg', '.png', '.gif'];
				if (href.indexOf('i.snag') === -1) href = href.replace('snag.gy', 'i.snag.gy');
				if (extensions.indexOf(href.substr(-4)) === -1) href = href + '.jpg';
				def.resolve(elem, {
					src: href
				});
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info.src;
				elem.href = info.src;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		picshd: {
			options: {
				'display picshd': {
					description: 'Display expander for picshd',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('picshd.com/') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^https?:\/\/(?:i\.|edge\.|www\.)*picshd\.com\/([\w]{5,})(\..+)?$/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, 'http://i.picshd.com/' + groups[1] + '.jpg');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		minus: {
			options: {
				'display min.us': {
					description: 'Display expander for min.us',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				var href = elem.href.toLowerCase();
				return href.indexOf('min.us') !== -1 && href.indexOf('blog.') === -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred(),
					imgRe = /\.(jpg|jpeg|gif|png)/i,
					hashRe = /^http:\/\/min\.us\/([\w]+)(?:#[\d+])?$/i,
					href = elem.href.split('?')[0],
					//TODO: just make default run first and remove this
					getExt = href.split('.'),
					ext = (getExt.length > 1 ? getExt[getExt.length - 1].toLowerCase() : '');
				if (imgRe.test(ext)) {
					var groups = hashRe.exec(href);
					if (groups && !groups[2]) {
						var hash = groups[1];
						if (hash.substr(0, 1) === 'm') {
							var apiURL = 'http://min.us/api/GetItems/' + hash;
							var calls = modules['showImages'].siteModules['minus'].calls;
							if (apiURL in calls) {
								if (calls[apiURL] != null) {
									def.resolve(elem, calls[apiURL]);
								} else {
									def.reject();
								}
							} else {
								GM_xmlhttpRequest({
									method: 'GET',
									url: apiURL,
									onload: function(response) {
										try {
											var json = JSON.parse(response.responseText);
											modules['showImages'].siteModules['minus'].calls[apiURL] = json;
											def.resolve(elem, json);
										} catch (e) {
											modules['showImages'].siteModules['minus'].calls[apiURL] = null;
											def.reject();
										}
									},
									onerror: function(response) {
										def.reject();
									}
								});
							}
						} else { // if not 'm', not a gallery, we can't do anything with the API.
							def.reject();
						}
					} else {
						def.reject();
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();
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
						if (RESUtils.pageType() === 'linklist') {
							$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
						}
						elem.src = info.ITEMS_GALLERY[0];
					}
					def.resolve(elem);
				} else {
					def.reject();
				}
				return def.promise()
			}
		},
		flickr: {
			options: {
				'display flickr': {
					description: 'Display expander for flickr',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				var hashRe = /^http:\/\/(?:\w+)\.?flickr\.com\/(?:.*)\/([\d]{10})\/?(?:.*)?$/i;
				var href = elem.href;
				return hashRe.test(href);
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				// modules['showImages'].createImageExpando(elem);
				// var selector = '#allsizes-photo > IMG';
				var href = elem.href;
				if (href.indexOf('/sizes') === -1) {
					var inPosition = href.indexOf('/in/');
					var inFragment = '';
					if (inPosition !== -1) {
						inFragment = href.substring(inPosition);
						href = href.substring(0, inPosition);
					}

					href += '/sizes/c' + inFragment;
				}
				href = href.replace('/lightbox', '');
				href = 'http://www.flickr.com/services/oembed/?format=json&url=' + href;
				GM_xmlhttpRequest({
					method: 'GET',
					url: href,
					onload: function(response) {
						try {
							var json = JSON.parse(response.responseText);
							def.resolve(elem, json);
						} catch (e) {
							def.reject();
						}
					},
					onerror: function(response) {
						def.reject();
					}
				})
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();
				var imgRe = /\.(jpg|jpeg|gif|png)/i;
				if ('url' in info) {
					elem.imageTitle = info.title;
					var original_url = elem.href;
					if (imgRe.test(info.url)) {
						elem.src = info.url;
						// elem.href = info.url;
					} else {
						elem.src = info.thumbnail_url;
						// elem.href = info.thumbnail_url;
					}
					if (RESUtils.pageType() === 'linklist') {
						$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
					}
					elem.credits = 'Picture by: <a href="' + info.author_url + '">' + info.author_name + '</a> @ Flickr';
					elem.type = 'IMAGE';
					def.resolve(elem);
				} else {
					def.reject()
				}
				return def.promise();
			}
		},
		steam: {
			options: {
				'display steam': {
					description: 'Display expander for steam',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return /^cloud(?:-\d)?.steampowered.com$/i.test(elem.host);
			},
			handleLink: function(elem) {
				return $.Deferred().resolve(elem, elem.href).promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		deviantart: {
			options: {
				'display deviantART': {
					description: 'Display expander for deviantART',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			matchRe: /^http:\/\/(?:fav\.me\/.*|(?:.+\.)?deviantart\.com\/(?:art\/.*|[^#]*#\/d.*))$/i,
			go: function() {},
			detect: function(elem) {
				return modules['showImages'].siteModules['deviantart'].matchRe.test(elem.href);
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var siteMod = modules['showImages'].siteModules['deviantart'];
				var apiURL = 'http://backend.deviantart.com/oembed?url=' + encodeURIComponent(elem.href);
				if (apiURL in siteMod.calls) {
					if (siteMod.calls[apiURL] != null) {
						def.resolve(elem, siteMod.calls[apiURL]);
					} else {
						def.reject();
					}
				} else {
					GM_xmlhttpRequest({
						method: 'GET',
						url: apiURL,
						// aggressiveCache: true,
						onload: function(response) {
							try {
								var json = JSON.parse(response.responseText);
								siteMod.calls[apiURL] = json;
								def.resolve(elem, json);
							} catch (error) {
								siteMod.calls[apiURL] = null;
								def.reject()
							}
						},
						onerror: function(response) {
							def.reject();
						}
					});
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred(),
					imgRe = /\.(jpg|jpeg|gif|png)/i;
				if ('url' in info) {
					elem.imageTitle = info.title;
					var original_url = elem.href;
					if (imgRe.test(info.url)) {
						elem.src = info.url;
						// elem.href = info.url;
					} else {
						elem.src = info.thumbnail_url;
						// elem.href = info.thumbnail_url;
					}
					if (RESUtils.pageType() === 'linklist') {
						$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
					}
					// elem.credits = 'Original link: <a href="'+original_url+'">'+original_url+'</a><br>Art by: <a href="'+info.author_url+'">'+info.author_name+'</a> @ deviantART';
					elem.credits = 'Art by: <a href="' + info.author_url + '">' + info.author_name + '</a> @ deviantART';
					elem.type = 'IMAGE';
					def.resolve(elem);
				} else {
					def.reject()
				}
				return def.promise();
			}
		},
		tumblr: {
			options: {
				'display tumblr': {
					description: 'Display expander for tumblr',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			APIKey: 'WeJQquHCAasi5EzaN9jMtIZkYzGfESUtEvcYDeSMLICveo3XDq',
			matchRE: /^https?:\/\/([a-z0-9\-]+\.tumblr\.com)\/post\/(\d+)(?:\/.*)?$/i,
			go: function() {},
			detect: function(elem) {
				return modules['showImages'].siteModules['tumblr'].matchRE.test(elem.href);
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var siteMod = modules['showImages'].siteModules['tumblr'];
				var groups = siteMod.matchRE.exec(elem.href);
				if (groups) {
					var apiURL = 'http://api.tumblr.com/v2/blog/' + groups[1] + '/posts?api_key=' + siteMod.APIKey + '&id=' + groups[2] + '&filter=raw';
					if (apiURL in siteMod.calls) {
						if (siteMod.calls[apiURL] != null) {
							def.resolve(elem, siteMod.calls[apiURL]);
						} else {
							def.reject();
						}
					} else {
						GM_xmlhttpRequest({
							method: 'GET',
							url: apiURL,
							// aggressiveCache: true,
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
									if ('meta' in json && json.meta.status === 200) {
										siteMod.calls[apiURL] = json;
										def.resolve(elem, json);
									} else {
										siteMod.calls[apiURL] = null;
										def.reject();
									}
								} catch (error) {
									siteMod.calls[apiURL] = null;
									def.reject();
								}
							},
							onerror: function(response) {
								def.reject();
							}
						});
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();
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
						if (post.format === 'markdown') {
							elem.src = modules['commentPreview'].converter.render(post.body)
						} else if (post.format === 'html') {
							elem.src = post.body;
						}
						break;
					default:
						return def.reject().promise();
						break;
				}
				elem.caption = post.caption;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				elem.credits = 'Posted by: <a href="' + info.response.blog.url + '">' + info.response.blog.name + '</a> @ Tumblr';
				def.resolve(elem);
				return def.promise()
			}
		},
		memecrunch: {
			options: {
				'display memecrunch': {
					description: 'Display expander for memecrunch',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('memecrunch.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/memecrunch\.com\/meme\/([0-9A-Z]+)\/([\w\-]+)(\/image\.(png|jpg))?/i;
				var groups = hashRe.exec(elem.href);
				if (groups && typeof groups[1] !== 'undefined') {
					def.resolve(elem, 'http://memecrunch.com/meme/' + groups[1] + '/' + (groups[2] || 'null') + '/image.png');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				modules['showImages'].createImageExpando(elem);
			}
		},
		mediacrush: {
			options: {
				'display mediacrush': {
					description: 'Display expander for mediacrush',
					value: true,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				return /^https?:\/\/(?:www\.)?mediacru\.sh\/([a-zA-Z0-9_-]{12})(?:\.(?:jpe|jpeg|jpg|png|mp3|flac|ogg|oga|ogv|mp4|webm|pdf|svg))?(?:\/?|\/direct\/?)(#.*)?$/.test(elem.href)
			},
			handleLink: function(elem) {
				var hashRe = /^https?:\/\/(?:www\.)?mediacru\.sh\/([a-zA-Z0-9_-]{12})(?:\.(?:jpe|jpeg|jpg|png|mp3|flac|ogg|oga|ogv|mp4|webm|pdf|svg))?(?:\/?|\/direct\/?)(#.*)?$/;
				var def = $.Deferred();
				var groups = hashRe.exec(elem.href);
				if (!groups) return def.reject();
				var siteMod = modules['showImages'].siteModules['mediacrush'];
				var mediaId = groups[1];
				var mediaSettings = groups[2];
				if (!mediaSettings) mediaSettings = '';
				MediaCrush.get(mediaId, function(media) {
					siteMod.calls['mediacrush-' + mediaId] = media;
					media.settings = mediaSettings;
					def.resolve(elem, media);
				});
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var generate = function(options) {
					var div = document.createElement('div');
					div.setAttribute('data-media', options.hash + options.settings);
					div.classList.add('mediacrush');
					MediaCrush.render(div);
					return div;
				};
				var def = $.Deferred();
				if (info.type === 'application/album') {
					elem.type = 'MEDIACRUSH';
					elem.expandoOptions = {
						generate: generate,
						hash: info.hash,
						settings: info.settings,
						media: info
					};
				} else if (info.blob_type === "video") {
					elem.type = 'MEDIACRUSH';
					elem.expandoOptions = {
						generate: generate,
						hash: info.hash,
						settings: info.settings,
						media: info
					};
				} else if (info.blob_type === "audio") {
					elem.type = 'MEDIACRUSH';
					elem.expandoOptions = {
						generate: generate,
						hash: info.hash,
						settings: info.settings,
						media: info
					};
				} else if (info.blob_type === "image") {
					elem.type = 'IMAGE';
					elem.src = MediaCrush.domain + info.original;
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		livememe: {
			options: {
				'display livememe': {
					description: 'Display expander for livememe',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('livememe.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/(?:www\.livememe\.com|lvme\.me)\/(?!edit)([\w]+)\/?/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, 'http://www.livememe.com/' + groups[1] + '.jpg');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		makeameme: {
			options: {
				'display makeameme': {
					description: 'Display expander for makeameme',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('makeameme.org') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred()
				var hashRe = /^http:\/\/makeameme\.org\/meme\/([\w-]+)\/?/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					def.resolve(elem, 'http://makeameme.org/media/created/' + groups[1] + '.jpg');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		memefive: {
			options: {
				'display memefive': {
					description: 'Display expander for memefive',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('memefive.com') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred()
				var hashRe = /^http:\/\/(?:www\.)?(?:memefive\.com)\/meme\/([\w]+)\/?/i;
				var altHashRe = /^http:\/\/(?:www\.)?(?:memefive\.com)\/([\w]+)\/?/i;
				var groups = hashRe.exec(elem.href);
				if (!groups) {
					groups = altHashRe.exec(elem.href);
				}
				if (groups) {
					def.resolve(elem, 'http://memefive.com/memes/' + groups[1] + '.jpg');
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		memegen: {
			options: {
				'display memegen': {
					description: 'Display expander for memegen',
					value: true,
					type: 'boolean'
				}
			},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('.memegen.') !== -1;
			},
			handleLink: function(elem) {
				var def = $.Deferred();
				var hashRe = /^http:\/\/((?:www|ar|ru|id|el|pt|tr)\.memegen\.(?:com|de|nl|fr|it|es|se|pl))(\/a)?\/(?:meme|mem|mim)\/([A-Za-z0-9]+)\/?/i;
				var groups = hashRe.exec(elem.href);
				if (groups) {
					// Animated vs static meme images.
					if (groups[2]) {
						def.resolve(elem, 'http://a.memegen.com/' + groups[3] + '.gif');
					} else {
						def.resolve(elem, 'http://m.memegen.com/' + groups[3] + '.jpg');
					}
				} else {
					def.reject();
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				elem.type = 'IMAGE';
				elem.src = info;
				elem.href = info;
				if (RESUtils.pageType() === 'linklist') {
					$(elem).closest('.thing').find('.thumbnail').attr('href', elem.href);
				}
				return $.Deferred().resolve(elem).promise();
			}
		},
		redditbooru: {
			options: {
				'display redditbooru': {
					description: 'Display expander for redditbooru',
					value: false,
					type: 'boolean'
				}
			},
			calls: {},
			go: function() {},
			detect: function(elem) {
				return elem.href.toLowerCase().indexOf('redditbooru.com/gallery/') >= 0;
			},
			handleLink: function(elem) {
				var urlRegEx = /^http:\/\/([\w]+\.)?redditbooru.com\/gallery\/([\d]+)\/?$/i,
					href = elem.href.split('?')[0],
					groups = urlRegEx.exec(href),
					def = $.Deferred(),
					self = modules['showImages'].siteModules['redditbooru'];

				if (groups && !groups[3]) {
					var apiURL = 'http://redditbooru.com/images/?ignoreSource&ignoreUser&ignoreVisible&postId=' + groups[2];
					if (apiURL in self.calls) {
						def.resolve(elem, self.calls[apiURL]);
					} else {
						GM_xmlhttpRequest({
							method: 'GET',
							url: apiURL,
							onload: function(response) {
								var json = {};
								try {
									json = JSON.parse(response.responseText);
									def.resolve(elem, json);
								} catch (error) {
									def.reject(elem);
								}
								self.calls[apiURL] = json;
							}
						});
					}
				}
				return def.promise();
			},
			handleInfo: function(elem, info) {
				var def = $.Deferred();
				if (typeof info === 'object' && info.length > 0) {
					elem.src = info.map(function(e, i, a) {
						return {
							title: '',
							src: e.cdnUrl,
							href: e.cdnUrl,
							caption: ''
						};
					});
					elem.imageTitle = info[0].title;
					elem.type = 'GALLERY';
				}
				return $.Deferred().resolve(elem).promise();
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
		/^https?:\/\/([a-z]+)\.reddit\.com\/.*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (RESUtils.loggedInUser()) {
				RESUtils.getUserInfo(modules['showKarma'].updateKarmaDiv);
			}
		}
	},
	updateKarmaDiv: function(userInfo) {
		var karmaDiv = document.querySelector("#header-bottom-right .userkarma");
		if ((typeof karmaDiv !== 'undefined') && (karmaDiv !== null)) {
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
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var toggleButton = document.createElement('li');
			this.toggleAllLink = document.createElement('a');
			this.toggleAllLink.textContent = 'hide all child comments';
			this.toggleAllLink.setAttribute('action', 'hide');
			this.toggleAllLink.setAttribute('href', 'javascript:void(0);');
			this.toggleAllLink.setAttribute('title', 'Show only replies to original poster.');
			this.toggleAllLink.addEventListener('click', function() {
				modules['hideChildComments'].toggleComments(this.getAttribute('action'));
				if (this.getAttribute('action') === 'hide') {
					this.setAttribute('action', 'show');
					this.setAttribute('title', 'Show all comments.');
					this.textContent = 'show all child comments';
				} else {
					this.setAttribute('action', 'hide');
					this.setAttribute('title', 'Show only replies to original poster.');
					this.textContent = 'hide all child comments';
				}
			}, true);
			toggleButton.appendChild(this.toggleAllLink);
			var commentMenu = document.querySelector('ul.buttons');
			if (commentMenu) {
				commentMenu.appendChild(toggleButton);
				var rootComments = document.querySelectorAll('div.commentarea > div.sitetable > div.thing > div.child > div.listing');
				for (var i = 0, len = rootComments.length; i < len; i++) {
					var toggleButton = document.createElement('li');
					var toggleLink = document.createElement('a');
					toggleLink.setAttribute('data-text','hide child comments');
					toggleLink.setAttribute('action', 'hide');
					toggleLink.setAttribute('href', 'javascript:void(0);');
					toggleLink.setAttribute('class', 'toggleChildren noCtrlF');
					// toggleLink.setAttribute('title','Hide child comments.');
					toggleLink.addEventListener('click', function(e) {
						modules['hideChildComments'].toggleComments(this.getAttribute('action'), this);
						if (this.getAttribute('action') === 'hide') {
							this.setAttribute('action', 'show');
							// this.setAttribute('title','show child comments.');
							this.setAttribute('data-text', 'show child comments');
						} else {
							this.setAttribute('action', 'hide');
							// this.setAttribute('title','hide child comments.');
							this.setAttribute('data-text','hide child comments');
						}
					}, true);
					toggleButton.appendChild(toggleLink);
					var sib = rootComments[i].parentNode.previousSibling;
					if (typeof sib !== 'undefined') {
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
			var thisChildren = $(obj).closest('.thing').children('.child').children('.sitetable')[0];
			thisChildren.style.display = (action === 'hide') ? 'none' : 'block';
		} else {
			// toggle all comments
			var commentContainers = document.querySelectorAll('div.commentarea > div.sitetable > div.thing');
			for (var i = 0, len = commentContainers.length; i < len; i++) {
				var thisChildren = commentContainers[i].querySelector('div.child > div.sitetable');
				var thisToggleLink = commentContainers[i].querySelector('a.toggleChildren');
				if (thisToggleLink !== null) {
					if (action === 'hide') {
						if (thisChildren !== null) {
							thisChildren.style.display = 'none';
						}
						thisToggleLink.setAttribute('data-text','show child comments');
						thisToggleLink.setAttribute('action', 'show');
					} else {
						if (thisChildren !== null) {
							thisChildren.style.display = 'block';
						}
						thisToggleLink.setAttribute('data-text','hide child comments');
						thisToggleLink.setAttribute('action', 'hide');
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
		hoverDelay: {
			type: 'text',
			value: 500,
			description: 'Delay, in milliseconds, before parent hover loads. Default is 500.'
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before parent hover fades away after the mouse leaves. Default is 200.'
		},
		fadeSpeed: {
			type: 'text',
			value: 0.3,
			description: 'Fade animation\'s speed. Default is 0.3, the range is 0-1. Setting the speed to 1 will disable the animation.'
		},
		direction: {
			type: 'enum',
			value: 'down',
			values: [{
				name: 'Up',
				value: 'up'
			}, {
				name: 'Down',
				value: 'down'
			}],
			description: 'Order the parent comments to place the closest parent at the top (down) or at the bottom (up).'
		},
	},
	description: 'Shows the parent comments when hovering over the "parent" link of a comment.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (modules['showParent'].options.direction.value === 'up') {
				document.html.classList.add('res-parents-up');
			} else {
				document.html.classList.add('res-parents-down');
			}
			$('body').on('mouseenter', '.comment .buttons :not(:first-child) .bylink', function(e) {
				modules['hover'].begin(this, {
					openDelay: modules['showParent'].options.hoverDelay.value,
					fadeDelay: modules['showParent'].options.fadeDelay.value,
					fadeSpeed: modules['showParent'].options.fadeSpeed.value
				}, modules['showParent'].showCommentHover, {});
			});
		}
	},
	handleVoteClick: function(evt) {
		var $this = $(this),
			voteClasses = {
				'-1': 'dislikes',
				0: 'unvoted',
				1: 'likes'
			},
			id = $this.parent().parent().data('fullname'),
			direction = /(up|down)(?:mod)?/.exec(this.className);

		if (!direction) return;

		direction = direction[1];

		var $targetButton = $('.content .thing.id-' + id).children('.midcol')
			.find('.arrow.' + direction + ', .arrow.' + direction + 'mod');

		if ($targetButton.length !== 1) {
			console.error("When attempting to find %s arrow for comment %s %d elements were returned",
				direction, id, $targetButton.length);
			return;
		}

		// Prevent other click handlers from running
		// Note that $targetButton's other click handlers run before this one,
		// by a "first come, first serve" basis
		var removeClickHandlers = function(event) {
			event.stopPropagation();
		};

		$targetButton.on('click', removeClickHandlers);
		$targetButton.click();
		$targetButton.off('click', removeClickHandlers);

		var clickedDir = (direction === 'up' ? 1 : -1),
			$midcol = $this.parent(),
			startDir;

		$.each(voteClasses, function(key, value) {
			if ($midcol.hasClass(value)) {
				startDir = parseInt(key, 10);
				return;
			}
		});

		var newDir = clickedDir === startDir ? 0 : clickedDir;

		$midcol.parent().children('.' + voteClasses[startDir])
			.removeClass(voteClasses[startDir])
			.addClass(voteClasses[newDir]);
		$midcol.find('.up, .upmod')
			.toggleClass('upmod', newDir === 1)
			.toggleClass('up', newDir !== 1);
		$midcol.find('.down, .downmod')
			.toggleClass('downmod', newDir === -1)
			.toggleClass('down', newDir !== -1);
	},
	showCommentHover: function(def, base, context) {
		var direction = modules['showParent'].options.direction.value,
			$thing = $(base);

		// If the passed element is not a `.thing` move up to the nearest `.thing`
		if (!$thing.is('.thing')) $thing = $thing.parents('.thing:first');
		var $parents = $thing.parents('.thing').clone();

		if (direction === 'up') {
			$parents = $($parents.get().reverse());
		}

		$parents.addClass('comment parentComment').removeClass('thing even odd');
		$parents.children('.child').remove(); // replies and reply edit form
		$parents.each(function() {
			var $this = $(this);

			// Remove the keyboardNav functionality
			$this.off('click');

			// A link to go to the actual comment
			var id = $this.data('fullname');
			if (typeof id !== 'undefined') {
				id = id.slice(3);
				$this.find('> .entry .tagline').append('<a class="bylink parentlink" href="#' + id + '">goto comment</a>');
			}
		});
		$parents.find('.parent').remove();
		$parents.find('.usertext-body').show(); // contents
		$parents.find('.flat-list.buttons').remove(); // buttons
		$parents.find('.usertext-edit').remove(); // edit form
		$parents.find('.RESUserTag').remove(); // tags
		$parents.find('.voteWeight').remove(); // tags
		$parents.find('.entry').removeClass('RES-keyNav-activeElement');
		$parents.find('.author.userTagged').removeClass('userTagged'); // tags again
		$parents.find('.collapsed').remove(); // unused collapse view
		$parents.find('.expand').remove(); // expand button
		$parents.find('form').attr('id', ''); // IDs should be unique
		$parents.find('.arrow').prop('onclick', null) // clear the vote handlers
		.on('click', modules['showParent'].handleVoteClick); // bind handlers to vote buttons
		/*
		I am stripping out the image viewer stuff for now.
		Making the image viewer work here requires some changes that are for another time.
		*/
		$parents.find('.madeVisible, .toggleImage').remove(); // image viewer
		$parents.find('.keyNavAnnotation').remove();

		var $container = $('<div class="parentCommentWrapper">');
		$container.append($parents);
		$parents.slice(0, -1).after('<div class="parentArrow">reply to</div>');
		def.resolve("Parents", $container);
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
		notifyWhenPaused: {
			type: 'boolean',
			value: true,
			description: 'Show a reminder to unpause Never-Ending Reddit after pausing'
		},
		reversePauseIcon: {
			type: 'boolean',
			value: false,
			description: 'Show "paused" bars icon when auto-load is paused and "play" wedge icon when active'
		},
		showServerInfo: {
			type: 'boolean',
			value: false,
			description: 'Show the π server / debug details next to the floating Never-Ending Reddit tools'
		},
		pauseAfterEvery: {
			type: 'text',
			value: 0,
			description: 'After auto-loading a certain number of pages, pause the auto-loader' + '<br><br>0 or a negative number means Never-Ending Reddit will only pause when you click' + ' the play/pause button in the top right corner.'
		},
		hideDupes: {
			type: 'enum',
			value: 'fade',
			values: [{
				name: 'Fade',
				value: 'fade'
			}, {
				name: 'Hide',
				value: 'hide'
			}, {
				name: 'Do not hide',
				value: 'none'
			}],
			description: 'Fade or completely hide duplicate posts from previous pages.'
		}
	},
	description: 'Inspired by modules like River of Reddit and Auto Pager - gives you a never ending stream of reddit goodness.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\_\?=]*/i
	],
	exclude: [],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#NERModal { display: none; z-index: 999; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; opacity: 0.6; }');
			RESUtils.addCSS('#NERContent { display: none; position: fixed; top: 40px; z-index: 1000; width: 720px; background-color: #FFF; color: #000; padding: 10px; font-size: 12px; }');
			RESUtils.addCSS('#NERModalClose { position: absolute; top: 3px; right: 3px; }');
			RESUtils.addCSS('#NERFail { min-height: 30px; width: 95%; font-size: 14px; border: 1px solid #999; border-radius: 10px; padding: 5px; text-align: center; bgcolor: #f0f3fc; cursor: auto; }');
			RESUtils.addCSS('#NERFail .nextprev { font-size: smaller; display: block; }');
			RESUtils.addCSS('#NERFail .nextprev a + a { margin-left: 2em; }');
			RESUtils.addCSS('.NERdupe p.title:after { color: #000; font-size: 10px; content: \' (duplicate from previous page)\'; }');
			RESUtils.addCSS('.NERPageMarker { text-align: center; color: #7f7f7f; font-size: 14px; margin-top: 6px; margin-bottom: 6px; font-weight: normal; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px; padding: 3px 0; }');
			// hide next/prev page and random subreddit indicators
			RESUtils.addCSS('.content div.nav-buttons { display: none; } ');
			switch (this.options.hideDupes.value) {
				case 'fade':
					RESUtils.addCSS('.NERdupe { opacity: 0.3; }');
					break;
				case 'hide':
					RESUtils.addCSS('.NERdupe { display: none; }');
					break;
			}
			// set the style for our little loader widget
			RESUtils.addCSS('#progressIndicator { width: 95%; min-height: 20px; margin: 0 auto; font-size: 14px; border: 1px solid #999; border-radius: 10px; padding: 10px; text-align: center; background-color: #f0f3fc; cursor: pointer; } ');
			RESUtils.addCSS('#progressIndicator h2 { margin-bottom: .5em; }');
			RESUtils.addCSS('#progressIndicator .gearIcon { margin-left: 1em; }');
			RESUtils.addCSS('#NREMailCount { margin-left: 0; float: left; margin-top: 3px;}');
			RESUtils.addCSS('#NREPause { margin-left: 2px; width: 16px; height: 16px; float: left; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); cursor: pointer; }');
			RESUtils.addCSS('#NREPause, #NREPause.paused.reversePause { background-position: -16px -192px; }');
			RESUtils.addCSS('#NREPause.paused, #NREPause.reversePause {  background-position: 0 -192px; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			/*			if (RESUtils.pageType() !== 'linklist') {
				sessionStorage.NERpageURL = location.href;
			}
*/ // modified from a contribution by Peter Siewert, thanks Peter!
			if (typeof modules['neverEndingReddit'].dupeHash === 'undefined') modules['neverEndingReddit'].dupeHash = {};
			var entries = document.body.querySelectorAll('a.comments');
			for (var i = entries.length - 1; i > -1; i--) {
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
			if (stMultiCheck.length === 2) {
				// console.log('skipped first sitetable, stupid reddit.');
				this.siteTable = stMultiCheck[1];
			}
			// get the first link to the next page of reddit...
			var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks();
			if (nextPrevLinks) {
				var nextLink = nextPrevLinks.next;
				if (nextLink) {
					this.nextPageURL = nextLink.getAttribute('href');
					var nextXY = RESUtils.getXYpos(nextLink);
					this.nextPageScrollY = nextXY.y;

					this.attachLoaderWidget();
				}

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
					/*
					$('body').on('click', 'a.title[href^="http://"]', function(e) {
						// if left click and not going to open in a new tab...
						if ((this.target !== '_blank') && (e.which === 1)) sessionStorage.lastPageURL = this.href;
					});
					*/
					this.returnToPrevPageCheck(location.hash);
				}

				// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
				if (this.options.autoLoad.value && nextLink) {
					window.addEventListener('scroll', modules['neverEndingReddit'].handleScroll, false);
				}
			}
			// check if the user has new mail...
			this.navMail = document.body.querySelector('#mail');
			this.NREFloat = RESUtils.createElementWithID('div', 'NREFloat');
			this.NREPause = RESUtils.createElementWithID('div', 'NREPause');
			this.NREPause.setAttribute('title', 'Pause / Restart Never Ending Reddit');
			if (this.options.reversePauseIcon.value) this.NREPause.classList.add('reversePause');
			this.isPaused = (RESStorage.getItem('RESmodules.neverEndingReddit.isPaused') == true);
			if (this.isPaused) this.NREPause.classList.add('paused');
			this.NREPause.addEventListener('click', modules['neverEndingReddit'].togglePause, false);
			if ((modules['betteReddit'].options.pinHeader.value !== 'userbar') && (modules['betteReddit'].options.pinHeader.value !== 'header')) {
				this.NREMail = RESUtils.createElementWithID('a', 'NREMail');
				if (modules['betteReddit'].options.pinHeader.value === 'sub') {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 23px; right: 8px; display: none; }');
				} else if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 44px; right: 0; display: none; }');
					RESUtils.addCSS('#NREMail { display: none; }');
					RESUtils.addCSS('#NREMailCount { display: none; }');
				} else {
					RESUtils.addCSS('#NREFloat { position: fixed; top: 10px; right: 10px; display: none; }');
				}
				RESUtils.addCSS('#NREMail { width: 16px; height: 12px; float: left; margin-top: 4px; background: center center no-repeat; }');
				RESUtils.addCSS('#NREMail.nohavemail { background-image: url(https://redditstatic.s3.amazonaws.com/mailgray.png); }');
				RESUtils.addCSS('#NREMail.havemail { background-image: url(https://redditstatic.s3.amazonaws.com/mail.png); }');
				RESUtils.addCSS('.res-colorblind #NREMail.havemail { background-image: url(http://thumbs.reddit.com/t5_2s10b_5.png); }');
				this.NREFloat.appendChild(this.NREMail);
				this.NREMailCount = RESUtils.createElementWithID('a', 'NREMailCount');
				this.NREMailCount.display = 'none';
				this.NREMailCount.setAttribute('href', modules['betteReddit'].getInboxLink(true));
				this.NREFloat.appendChild(this.NREMailCount);
				var hasNew = false;
				if ((typeof this.navMail !== 'undefined') && (this.navMail !== null)) {
					hasNew = this.navMail.classList.contains('havemail');
				}
				this.setMailIcon(hasNew);
			} else {
				this.NREMail = this.navMail;
				RESUtils.addCSS('#NREFloat { position: fixed; top: 30px; right: 8px; display: none; }');
			}
			this.NREFloat.appendChild(this.NREPause);
			document.body.appendChild(this.NREFloat);

			if (this.options.showServerInfo.value) {
				RESUtils.addCSS('.debuginfo { position: fixed; bottom: 5px; right: 5px; }');
				RESUtils.addCSS('.debuginfo { background: rgba(255,255,255,0.3); }');
				RESUtils.addCSS('.debuginfo:hover { background: rgba(255,255,255,0.8); }');
				RESUtils.addCSS('.res-nightmode .debuginfo { background: rgba(30,30,30,0.5); color: #ccc; }');
				RESUtils.addCSS('.res-nightmode .debuginfo:hover { background: rgba(30,30,30,0.8); }');
			}
		}
	},
	pageMarkers: [],
	pageURLs: [],
	togglePause: function() {
		modules['neverEndingReddit'].isPaused = !modules['neverEndingReddit'].isPaused;
		RESStorage.setItem('RESmodules.neverEndingReddit.isPaused', modules['neverEndingReddit'].isPaused);
		if (modules['neverEndingReddit'].isPaused) {
			modules['neverEndingReddit'].NREPause.classList.add('paused');
			if (modules['neverEndingReddit'].options.notifyWhenPaused.value) {
				var notification = [];
				notification.push('Never-Ending Reddit has been paused. Click the play/pause button to unpause it.');
				notification.push('To hide this message, disable Never-Ending Reddit\'s ' + modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', 'notifyWhenPaused', 'notifyWhenPaused option <span class="gearIcon" />') + '.');
				notification = notification.join('<br><br>');
				modules['notifications'].showNotification({
					moduleID: 'neverEndingReddit',
					message: notification
				});
			}
		} else {
			modules['neverEndingReddit'].NREPause.classList.remove('paused');
			modules['neverEndingReddit'].handleScroll();
		}
		modules['neverEndingReddit'].setWidgetActionText();
	},
	returnToPrevPageCheck: function(hash) {
		var pageRE = /page=(\d+)/,
			match = pageRE.exec(hash);
		// Set the current page to page 1...
		this.currPage = 1;
		if (match) {
			var backButtonPageNumber = match[1] || 1;
			if (backButtonPageNumber > 1) {
				this.attachModalWidget();
				this.currPage = backButtonPageNumber;
				this.loadNewPage(true);
			}
		}

		/*		
		if ((sessionStorage.NERpageURL) && (sessionStorage.NERpageURL != sessionStorage.lastPageURL)) {
			var backButtonPageNumber = sessionStorage.getItem('NERpage') || 1;
			if (backButtonPageNumber > 1) {
				this.currPage = backButtonPageNumber;
				this.loadNewPage(true);
			}
		}
		sessionStorage.lastPageURL = location.href;
		*/
	},
	handleScroll: function(e) {
		if (modules['neverEndingReddit'].scrollTimer) clearTimeout(modules['neverEndingReddit'].scrollTimer);
		modules['neverEndingReddit'].scrollTimer = setTimeout(modules['neverEndingReddit'].handleScrollAfterTimer, 300);
	},
	handleScrollAfterTimer: function(e) {
		var thisPageNum = 1,
			thisMarker;

		for (var i = 0, len = modules['neverEndingReddit'].pageMarkers.length; i < len; i++) {
			var thisXY = RESUtils.getXYpos(modules['neverEndingReddit'].pageMarkers[i]);
			if (thisXY.y < window.pageYOffset) {
				thisMarker = modules['neverEndingReddit'].pageMarkers[i];
				thisPageNum = thisMarker.getAttribute('id').replace('page-', '');
				modules['neverEndingReddit'].currPage = thisPageNum;
				if (thisMarker) {
					var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
					RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.' + thisPageType, thisMarker.getAttribute('url'));
				}
			} else {
				break;
			}
		}
		var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
		// RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.'+thisPageType, modules['neverEndingReddit'].pageURLs[thisPageNum]);
		if (thisPageNum != sessionStorage.NERpage) {
			if (thisPageNum > 1) {
				// sessionStorage.NERpageURL = location.href;
				sessionStorage.NERpage = thisPageNum;
				modules['neverEndingReddit'].pastFirstPage = true;
				location.hash = 'page=' + thisPageNum;
			} else {
				if (location.hash.indexOf('page=') !== -1) {
					location.hash = 'page=' + thisPageNum;
				}
				delete sessionStorage['NERpage'];
			}
		}
		if ((modules['neverEndingReddit'].fromBackButton != true) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
			for (var i = 0, len = modules['neverEndingReddit'].allLinks.length; i < len; i++) {
				if (RESUtils.elementInViewport(modules['neverEndingReddit'].allLinks[i])) {
					var thisClassString = modules['neverEndingReddit'].allLinks[i].getAttribute('class');
					var thisClass = thisClassString.match(/id-t[\d]_[\w]+/);
					if (thisClass) {
						var thisID = thisClass[0];
						var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
						RESStorage.setItem('RESmodules.neverEndingReddit.lastVisibleIndex.' + thisPageType, thisID);
						break;
					}
				}
			}
		}
		if ((RESUtils.elementInViewport(modules['neverEndingReddit'].progressIndicator)) && (modules['neverEndingReddit'].fromBackButton != true)) {
			if (modules['neverEndingReddit'].isPaused != true) {
				modules['neverEndingReddit'].loadNewPage();
				modules['neverEndingReddit'].pauseAfter(thisPageNum);
			}
		}
		if ($(window).scrollTop() > 30) {
			modules['neverEndingReddit'].showFloat(true);
		} else {
			modules['neverEndingReddit'].showFloat(false);
		}
	},
	pauseAfterPages: null,
	pauseAfter: function(currPageNum) {
		if (this.pauseAfterPages === null) {
			this.pauseAfterPages = parseInt(modules['neverEndingReddit'].options.pauseAfterEvery.value, 10);
		}

		if ((this.pauseAfterPages > 0) && (currPageNum % this.pauseAfterPages === 0)) {
			this.togglePause(true);
			var notification = [];
			notification.push('Time for a break!');
			notification.push('Never-Ending Reddit was paused automatically. ' + modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', 'pauseAfterEvery', '', 'gearIcon'));
			notification = notification.join('<br><br>');
			setTimeout(modules['notifications'].showNotification.bind(RESUtils, notification, 5000));
		}
	},
	duplicateCheck: function(newHTML) {
		var newLinks = newHTML.querySelectorAll('div.link');
		for (var i = newLinks.length - 1; i > -1; i--) {
			var newLink = newLinks[i];
			var thisCommentLink = newLink.querySelector('a.comments').href;
			if (modules['neverEndingReddit'].dupeHash[thisCommentLink]) {
				// let's not remove it altogether, but instead dim it...
				// newLink.parentElement.removeChild(newLink);
				newLink.classList.add('NERdupe');
			} else {
				modules['neverEndingReddit'].dupeHash[thisCommentLink] = 1;
			}
		}
		return newHTML;
	},
	setMailIcon: function(newmail) {
		if (RESUtils.loggedInUser() === null) return false;
		if (newmail) {
			modules['neverEndingReddit'].hasNewMail = true;
			this.NREMail.classList.remove('nohavemail');
			this.NREMail.setAttribute('href', modules['betteReddit'].getInboxLink(true));
			this.NREMail.setAttribute('title', 'new mail!');
			this.NREMail.classList.add('havemail');
			modules['betteReddit'].showUnreadCount();
		} else {
			modules['neverEndingReddit'].hasNewMail = false;
			this.NREMail.classList.add('nohavemail');
			this.NREMail.setAttribute('href', modules['betteReddit'].getInboxLink(false));
			this.NREMail.setAttribute('title', 'no new mail');
			this.NREMail.classList.remove('havemail');
			modules['betteReddit'].setUnreadCount(0);
		}
	},
	attachModalWidget: function() {
		this.modalWidget = RESUtils.createElementWithID('div', 'NERModal');
		$(this.modalWidget).html('&nbsp;');
		this.modalContent = RESUtils.createElementWithID('div', 'NERContent');
		$(this.modalContent).html('<div id="NERModalClose" class="RESCloseButton">&times;</div>Never Ending Reddit has detected that you are returning from a page that it loaded. Please give us a moment while we reload that content and return you to where you left off.<br><span class="RESThrobber"></span>');
		document.body.appendChild(this.modalWidget);
		document.body.appendChild(this.modalContent);
		$('#NERModalClose').click(function() {
			$(modules['neverEndingReddit'].modalWidget).hide();
			$(modules['neverEndingReddit'].modalContent).hide();
		});
	},
	attachLoaderWidget: function() {
		// add a widget at the bottom that will be used to detect that we've scrolled to the bottom, and will also serve as a "loading" bar...
		this.progressIndicator = document.createElement('div');
		this.setWidgetActionText();
		this.progressIndicator.id = 'progressIndicator';
		this.progressIndicator.className = 'neverEndingReddit';

		this.progressIndicator.addEventListener('click', function(e) {
			if (e.target.id !== 'NERStaticLink' && !e.target.classList.contains('gearIcon')) {
				e.preventDefault();
				modules['neverEndingReddit'].loadNewPage();
			}
		}, false);
		RESUtils.insertAfter(this.siteTable, this.progressIndicator);
	},
	getNextPrevLinks: function(ele) {
		ele = ele || document.body;
		var links = {
			next: ele.querySelector('.content .nextprev a[rel~=next]'),
			prev: ele.querySelector('.content .nextprev a[rel~=prev]')
		}

		if (!(links.next || links.prev)) links = false;

		return links;
	},
	setWidgetActionText: function() {
		$(this.progressIndicator).empty();
		$('<h2>Never Ending Reddit</h2>')
			.appendTo(this.progressIndicator)
			.append(modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', null, ' ', 'gearIcon'));

		var text = "Click to load the next page";
		if (this.options.autoLoad.value && !this.isPaused) {
			text = "scroll or click to load the next page";
		} else if (this.options.autoLoad.value && this.isPaused) {
			text = "click to load the next page; or click the 'pause' button in the top right corner"
		}

		$('<p class="NERWidgetText" />')
			.text(text)
			.appendTo(this.progressIndicator);

		var nextpage = $('<a id="NERStaticLink">or open next page</a>')
			.attr('href', this.nextPageURL);
		$('<p  class="NERWidgetText" />').append(nextpage)
			.append('&nbsp;(and clear Never-Ending stream)')
			.appendTo(this.progressIndicator);
	},
	loadNewPage: function(fromBackButton, reload) {
		var me = modules['neverEndingReddit'];
		if (me.isLoading != true) {
			me.isLoading = true;
			if (fromBackButton) {
				me.fromBackButton = true;
				var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
				var savePageURL = me.nextPageURL;
				me.nextPageURL = RESStorage.getItem('RESmodules.neverEndingReddit.lastPage.' + thisPageType);
				if ((me.nextPageURL === 'undefined') || (me.nextPageURL === null)) {
					// something went wrong, probably someone hit refresh. Just revert to the first page...
					modules['neverEndingReddit'].fromBackButton = false;
					me.nextPageURL = savePageURL;
					me.currPage = 1;
					me.isLoading = false;
					return false;
				}
				var leftCentered = Math.floor((window.innerWidth - 720) / 2);
				me.modalWidget.style.display = 'block';
				me.modalContent.style.display = 'block';
				me.modalContent.style.left = leftCentered + 'px';
				// remove the progress indicator early, as we don't want the user to scroll past it on accident, loading more content.
				me.progressIndicator.parentNode.removeChild(modules['neverEndingReddit'].progressIndicator);
			} else {
				me.fromBackButton = false;
			}


			me.progressIndicator.removeEventListener('click', modules['neverEndingReddit'].loadNewPage, false);
			$(me.progressIndicator).html('<span class="RESThrobber"></span>  <span class="NERWidgetText">Loading next page...</span>');
			// as a sanity check, which should NEVER register true, we'll make sure me.nextPageURL is on the same domain we're browsing...
			if (me.nextPageURL && me.nextPageURL.indexOf(location.hostname) === -1) {
				console.log('Next page URL mismatch. Something strange may be afoot.')
				me.isLoading = false;
				return false;
			}
			GM_xmlhttpRequest({
				method: "GET",
				url: me.nextPageURL,
				onload: function(response) {
					if ((typeof modules['neverEndingReddit'].progressIndicator.parentNode !== 'undefined') && (modules['neverEndingReddit'].progressIndicator.parentNode !== null)) {
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
					if (newHTML !== null) {
						var firstLen, lastLen,
							stMultiCheck = tempDiv.querySelectorAll('#siteTable');
						// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
						if (stMultiCheck.length === 2) {
							// console.log('skipped first sitetable, stupid reddit.');
							newHTML = stMultiCheck[1];
						}
						newHTML.setAttribute('ID', 'siteTable-' + modules['neverEndingReddit'].currPage + 1);
						firstLen = $(newHTML).find('.link:first .rank').text().length;
						lastLen = $(newHTML).find('.link:last .rank').text().length;
						if (lastLen > firstLen) {
							lastLen = (lastLen * 1.1).toFixed(1);
							RESUtils.addCSS('body.res > .content .link .rank { width: ' + lastLen + 'ex; }');
						}
						modules['neverEndingReddit'].duplicateCheck(newHTML);
						// check for new mail
						var hasNewMail = tempDiv.querySelector('#mail');
						if ((typeof hasNewMail !== 'undefined') && (hasNewMail !== null) && (hasNewMail.classList.contains('havemail'))) {
							modules['neverEndingReddit'].setMailIcon(true);
						} else {
							modules['neverEndingReddit'].setMailIcon(false);
						}
						// load up uppers and downers, if enabled...
						// maybe not necessary anymore..
						/*
						if ((modules['uppersAndDowners'].isEnabled()) && (RESUtils.pageType() === 'comments')) {
							modules['uppersAndDowners'].applyUppersAndDownersToComments(modules['neverEndingReddit'].nextPageURL);
						}
						*/
						// get the new nextLink value for the next page...
						var nextPrevLinks = modules['neverEndingReddit'].getNextPrevLinks(tempDiv);
						if (nextPrevLinks) {
							if (isNaN(modules['neverEndingReddit'].currPage)) modules['neverEndingReddit'].currPage = 1;
							if (!fromBackButton) modules['neverEndingReddit'].currPage++;
							if ((!(modules['neverEndingReddit'].fromBackButton)) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
								// modules['neverEndingReddit'].pageURLs[modules['neverEndingReddit'].currPage] = modules['neverEndingReddit'].nextPageURL;
								var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
								RESStorage.setItem('RESmodules.neverEndingReddit.lastPage.' + thisPageType, modules['neverEndingReddit'].nextPageURL);
								// location.hash = 'page='+modules['neverEndingReddit'].currPage;
							}
							var nextLink = nextPrevLinks.next;
							var nextPage = modules['neverEndingReddit'].currPage;
							var pageMarker = RESUtils.createElementWithID('div', 'page-' + nextPage);
							pageMarker.classList.add('NERPageMarker');
							$(pageMarker).text('Page ' + nextPage);
							modules['neverEndingReddit'].siteTable.appendChild(pageMarker);
							modules['neverEndingReddit'].pageMarkers.push(pageMarker);
							modules['neverEndingReddit'].siteTable.appendChild(newHTML);
							modules['neverEndingReddit'].isLoading = false;
							if (nextLink) {
								// console.log(nextLink);
								pageMarker.setAttribute('url', me.nextPageURL);
								if (nextLink.getAttribute('rel').indexOf('prev') !== -1) {
									// remove the progress indicator from the DOM, it needs to go away.
									modules['neverEndingReddit'].progressIndicator.style.display = 'none';
									var endOfReddit = RESUtils.createElementWithID('div', 'endOfReddit');
									$(endOfReddit).text('You\'ve reached the last page available.  There are no more pages to load.');
									modules['neverEndingReddit'].siteTable.appendChild(endOfReddit);
									window.removeEventListener('scroll', modules['neverEndingReddit'].handleScroll, false);
								} else {
									// console.log('not over yet');
									modules['neverEndingReddit'].nextPageURL = nextLink.getAttribute('href');
									modules['neverEndingReddit'].attachLoaderWidget();
								}
							}
							modules['neverEndingReddit'].allLinks = document.body.querySelectorAll('#siteTable div.thing');
							if ((fromBackButton) && (modules['neverEndingReddit'].options.returnToPrevPage.value)) {
								// TODO: it'd be great to figure out a better way than a timeout, but this
								// has considerably helped the accuracy of RES's ability to return you to where
								// you left off.
								setTimeout(modules['neverEndingReddit'].scrollToLastElement, 4000);
							}

							// If we're on the reddit-browsing page (/reddits or /subreddits), add +shortcut and -shortcut buttons...
							if (/^https?:\/\/www\.reddit\.com\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.href)) {
								modules['subredditManager'].browsingReddits();
							}
						}

						var nextPrevLinks = newHTML && modules['neverEndingReddit'].getNextPrevLinks(newHTML);
						if (!(nextPrevLinks && nextPrevLinks.next)) {
							var noresults = tempDiv.querySelector('#noresults');
							var noresultsfound = (noresults !== null);
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
	scrollToLastElement: function() {
		modules['neverEndingReddit'].modalWidget.style.display = 'none';
		modules['neverEndingReddit'].modalContent.style.display = 'none';
		// window.scrollTo(0,0)
		// RESUtils.scrollTo(0,modules['neverEndingReddit'].nextPageScrollY);
		var thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
		var lastTopScrolledID = RESStorage.getItem('RESmodules.neverEndingReddit.lastVisibleIndex.' + thisPageType);
		var lastTopScrolledEle = document.body.querySelector('.' + lastTopScrolledID);
		if (!lastTopScrolledEle) {
			var lastTopScrolledEle = newHTML.querySelector('#siteTable div.thing');
		}
		var thisXY = RESUtils.getXYpos(lastTopScrolledEle);
		RESUtils.scrollTo(0, thisXY.y);
		modules['neverEndingReddit'].fromBackButton = false;
	},
	NERFail: function(noresults) {
		modules['neverEndingReddit'].isLoading = false;
		var newHTML = RESUtils.createElementWithID('div', 'NERFail');
		var failureMessage = noresults ? 'There doesn\'t seem to be anything here!' : 'Couldn\'t load any more posts';
		var start = location.href.split('#')[0];
		var retry = modules['neverEndingReddit'].nextPageURL;
		$(newHTML).html('	\
			<h3>	\
				' + failureMessage + '	\
				<a target="_blank" href="http://www.reddit.com/r/Enhancement/comments/s72xt/never_ending_reddit_and_reddit_barfing_explained/">(Why not?)</a>	\
			</h3>	\
			<p class="nextprev">	\
				<a href="' + start + '">start over</a>	\
				<a href="' + retry + '">try again</a>	\
				<a href="/r/random">check out a random subreddit</a>	\
			</p>	\
			');
		newHTML.setAttribute('style', 'cursor: auto !important;');


		modules['neverEndingReddit'].siteTable.appendChild(newHTML);
		if (modules['neverEndingReddit'].modalWidget) {
			modules['neverEndingReddit'].modalWidget.style.display = 'none';
			modules['neverEndingReddit'].modalContent.style.display = 'none';
		}
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
	description: 'Save Comments saves the full text of comments locally in your browser, unlike Reddit\'s "save" feature, which saves a link to the comment.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*/i
	],
	exclude: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*\/submit\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/submit\/?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.RES-save { cursor: help; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var currURL = location.href;
			var commentsRegex = /^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*comments\/[-\w\.\/]*/i;
			var savedRegex = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/([-\w]+)\/saved\/?/i;
			if (commentsRegex.test(currURL)) {
				// load already-saved comments into memory...
				this.loadSavedComments();
				this.addSaveLinks();
				$('body').on('click', 'li.saveComments', function(e) {
					e.preventDefault();
					var $this = $(this);
					modules['saveComments'].saveComment(this, $this.data('saveID'), $this.data('saveLink'), $this.data('saveUser'));
				});
				$('body').on('click', 'li.unsaveComments', function(e) {
					// e.preventDefault();
					var id = $(this).data('unsaveID');
					modules['saveComments'].unsaveComment(id, this);
				});
			} else if (savedRegex.test(currURL)) {
				// load already-saved comments into memory...
				this.loadSavedComments();
				this.addSavedCommentsTab();
				this.drawSavedComments();
				if (location.hash === '#comments') {
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
					if ((event.target.tagName === 'DIV') && (hasClass(event.target,'thing'))) {
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
		var $commentObj = $(commentObj),
			$commentsUL = $commentObj.find('ul.flat-list'),
			$permaLink = $commentsUL.find('li.first a.bylink');

		if ($permaLink.length > 0) {
			// Insert the link right after Reddit Gold's "save" comment link
			var $userLink = $commentObj.find('a.author'),
				saveUser;

			if ($userLink.length === 0) {
				saveUser = '[deleted]';
			} else {
				saveUser = $userLink.text();
			}

			var saveHref = $permaLink.attr('href'),
				splitHref = saveHref.split('/'),
				saveID = splitHref[splitHref.length - 1],
				$saveLink = $('<li>');

			if ((typeof this.storedComments !== 'undefined') && (typeof this.storedComments[saveID] !== 'undefined')) {
				$saveLink.html('<a class="RES-saved noCtrlF" href="/saved#comments" data-text="saved-RES"></a>');
			} else {
				$saveLink.html('<a class="RES-save noCtrlF" href="javascript:void(0);" title="Save using RES - which is local only, but preserves the full text in case someone edits/deletes it" data-text="save-RES"></a>')
					.addClass('saveComments')
					.data('saveID', saveID)
					.data('saveLink', saveHref)
					.data('saveUser', saveUser);
			}

			var $whereToInsert = $commentsUL.find('.comment-save-button');
			$whereToInsert.after($saveLink);
		}
	},
	loadSavedComments: function() {
		// first, check if we're storing saved comments the old way (as an array)...
		var thisComments = RESStorage.getItem('RESmodules.saveComments.savedComments');
		if (thisComments == null) {
			this.storedComments = {};
		} else {
			this.storedComments = safeJSON.parse(thisComments, 'RESmodules.saveComments.savedComments');
			// old way of storing saved comments... convert...
			if (thisComments.slice(0, 1) === '[') {
				var newFormat = {};
				for (var i in this.storedComments) {
					var urlSplit = this.storedComments[i].href.split('/');
					var thisID = urlSplit[urlSplit.length - 1];
					newFormat[thisID] = this.storedComments[i];
				}
				this.storedComments = newFormat;
				RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(newFormat));
			}
		}
	},
	saveComment: function(obj, id, href, username, comment) {
		// reload saved comments in case they've been updated in other tabs (works in all but greasemonkey)
		this.loadSavedComments();
		// loop through comments and make sure we haven't already saved this one...
		if (typeof this.storedComments[id] !== 'undefined') {
			alert('comment already saved!');
		} else {
			if (modules['keyboardNav'].isEnabled()) {
				// unfocus it before we save it so we don't save the keyboard annotations...
				modules['keyboardNav'].keyUnfocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
			}
			var comment = obj.parentNode.parentNode.querySelector('div.usertext-body > div.md');
			if (comment !== null) {
				var commentHTML = comment.innerHTML,
					savedComment = {
						href: href,
						username: username,
						comment: commentHTML,
						timeSaved: Date()
					};
				this.storedComments[id] = savedComment;

				var $unsaveObj = $('<li>');
				$unsaveObj.html('<a href="javascript:void(0);">unsave-RES</a>')
					.data('unsaveID', id)
					.data('unsaveLink', href)
					.addClass('unsaveComments');

				$(obj).replaceWith($unsaveObj);
			}
			if (modules['keyboardNav'].isEnabled()) {
				modules['keyboardNav'].keyFocus(modules['keyboardNav'].keyboardLinks[modules['keyboardNav'].activeIndex]);
			}
			if (RESUtils.proEnabled()) {
				// add sync adds/deletes for RES Pro.
				if (typeof this.storedComments.RESPro_add === 'undefined') {
					this.storedComments.RESPro_add = {}
				}
				if (typeof this.storedComments.RESPro_delete === 'undefined') {
					this.storedComments.RESPro_delete = {}
				}
				// add this ID next time we sync...
				this.storedComments.RESPro_add[id] = true;
				// make sure we don't run a delete on this ID next time we sync...
				if (typeof this.storedComments.RESPro_delete[id] !== 'undefined') delete this.storedComments.RESPro_delete[id];
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
			var savedRegex = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w]+\/saved\/?/i;
			var menuItems = mainmenuUL.querySelectorAll('li');
			var thisUser = RESUtils.loggedInUser() || '';
			for (var i = 0, len = menuItems.length; i < len; i++) {
				var savedLink = menuItems[i].querySelector('a');
				if ((menuItems[i].classList.contains('selected')) && (savedRegex.test(savedLink.href))) {
					menuItems[i].addEventListener('click', function(e) {
						e.preventDefault();
						modules['saveComments'].showSavedTab('links');
					}, true);
				}

				if (savedRegex.test(savedLink.href)) {
					$(menuItems[i]).attr('id', 'savedLinksTab');
					savedLink.textContent = 'saved links';
				}
			}

			var savedCommentsTab = $('<li id="savedCommentsTab">')
				.html('<a href="javascript:void(0);">saved comments</a>')
				.insertAfter('#savedLinksTab');
			if (savedRegex.test(location.href)) {
				$('#savedCommentsTab').click(function(e) {
					e.preventDefault();
					modules['saveComments'].showSavedTab('comments');
				});
			} else {
				$('#savedCommentsTab').click(function(e) {
					e.preventDefault();
					location.href = location.protocol + '//www.reddit.com/saved/#comments';
				});
			}
		}
	},
	showSavedTab: function(tab) {
		switch (tab) {
			case 'links':
				location.hash = 'links';
				this.savedLinksContent.style.display = 'block';
				this.savedCommentsContent.style.display = 'none';
				$('#savedLinksTab').addClass('selected');
				$('#savedCommentsTab').removeClass('selected');
				break;
			case 'comments':
				location.hash = 'comments';
				this.savedLinksContent.style.display = 'none';
				this.savedCommentsContent.style.display = 'block';
				$('#savedLinksTab').removeClass('selected');
				$('#savedCommentsTab').addClass('selected');
				break;
		}
	},
	drawSavedComments: function() {
		RESUtils.addCSS('.savedComment { padding: 5px 8px; font-size: 12px; margin-bottom: 20px; margin-left: 25px; margin-right: 10px; border: 1px solid #CCC; border-radius: 10px; width: auto; } ');
		RESUtils.addCSS('.savedCommentHeader { margin-bottom: 8px; }');
		RESUtils.addCSS('.savedCommentBody { margin-bottom: 8px; }');
		RESUtils.addCSS('#savedLinksList { margin-top: 10px; }');
		// css += '.savedCommentFooter {  }';
		this.savedLinksContent = document.body.querySelector('BODY > div.content');
		this.savedCommentsContent = RESUtils.createElementWithID('div', 'savedLinksList');
		this.savedCommentsContent.style.display = 'none';
		this.savedCommentsContent.setAttribute('class', 'sitetable linklisting');
		for (var i in this.storedComments) {
			if ((i !== 'RESPro_add') && (i !== 'RESPro_delete')) {
				var clearLeft = document.createElement('div');
				clearLeft.setAttribute('class', 'clearleft');
				var thisComment = document.createElement('div');
				thisComment.classList.add('savedComment');
				thisComment.classList.add('entry');
				// this is all saved locally, but just for safety, we'll clean out any script tags and whatnot...
				var cleanHTML = '<div class="savedCommentHeader">Comment by user: ' + escapeHTML(this.storedComments[i].username) + ' saved on ' + escapeHTML(this.storedComments[i].timeSaved) + '</div>';
				cleanHTML += '<div class="savedCommentBody md">' + this.storedComments[i].comment.replace(/<script(.|\s)*?\/script>/g, '') + '</div>';
				cleanHTML += '<div class="savedCommentFooter"><ul class="flat-list buttons"><li><a class="unsaveComment" href="javascript:void(0);">unsave-RES</a></li><li><a href="' + escapeHTML(this.storedComments[i].href) + '">view original</a></li></ul></div>'
				$(thisComment).html(cleanHTML);
				var unsaveLink = thisComment.querySelector('.unsaveComment');
				$(unsaveLink)
					.data('unsaveID', i)
					.data('unsaveLink', this.storedComments[i].href);
				unsaveLink.addEventListener('click', function(e) {
					e.preventDefault();
					modules['saveComments'].unsaveComment($(this).data('unsaveID'));
				}, true);
				this.savedCommentsContent.appendChild(thisComment);
				this.savedCommentsContent.appendChild(clearLeft);
			}
		}
		if (this.storedComments.length === 0) {
			$(this.savedCommentsContent).html('<li>You have not yet saved any comments.</li>');
		}
		RESUtils.insertAfter(this.savedLinksContent, this.savedCommentsContent);
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
			if (typeof this.storedComments.RESPro_add === 'undefined') {
				this.storedComments.RESPro_add = {}
			}
			if (typeof this.storedComments.RESPro_delete === 'undefined') {
				this.storedComments.RESPro_delete = {}
			}
			// delete this ID next time we sync...
			this.storedComments.RESPro_delete[id] = true;
			// make sure we don't run an add on this ID next time we sync...
			if (typeof this.storedComments.RESPro_add[id] !== 'undefined') delete this.storedComments.RESPro_add[id];
		}
		RESStorage.setItem('RESmodules.saveComments.savedComments', JSON.stringify(this.storedComments));
		if (RESUtils.proEnabled()) {
			modules['RESPro'].authenticate(function() {
				modules['RESPro'].saveModuleData('saveComments');
			});
		}
		if (typeof this.savedCommentsContent !== 'undefined') {
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
		highlightFirstCommenter: {
			type: 'boolean',
			value: false,
			description: 'Highlight the person who has the first comment in a tree, within that tree'
		},
		firstCommentColor: {
			type: 'text',
			value: '#46B6CC',
			description: 'Color to use to highlight the first-commenter. Defaults to original text color'
		},
		firstCommentColorHover: {
			type: 'text',
			value: '#72D2E5',
			description: 'Color used to highlight the first-commenter on hover.'
		},
		fontColor: {
			type: 'text',
			value: 'white',
			description: 'Color for highlighted text.'
		},
		autoColorUsernames: {
			type: 'boolean',
			value: false,
			description: 'Automatically set a special color for each username'
		},
		autoColorUsing: {
			description: 'Select a method for setting colors for usernames',
			type: 'enum',
			values: []
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadDynamicOptions: function() {
		var autoColorUsingStrategies = modules['userHighlight'].autoColorUsing;
		var autoColorUsingOption = modules['userHighlight'].options.autoColorUsing;
		for (var i = 0, length = autoColorUsingStrategies.length; i < length; i++) {
			var strategy = autoColorUsingStrategies[i];
			autoColorUsingOption.values.push({
				value: strategy.name,
				name: strategy.description
			});
		}

		var defaultStrategy = autoColorUsingOption.values[0];
		if (defaultStrategy) {
			autoColorUsingOption.value = defaultStrategy.value;
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.findDefaults();
			if (this.options.highlightOP.value) this.doHighlight('submitter');
			if (this.options.highlightFriend.value) this.doHighlight('friend');
			if (this.options.highlightMod.value) this.doHighlight('moderator');
			if (this.options.highlightAdmin.value) this.doHighlight('admin');

			if (this.options.autoColorUsernames.value) {
				RESUtils.watchForElement('newComments', this.scanPageForNewUsernames);
				RESUtils.watchForElement('siteTable', this.scanPageForNewUsernames);
				this.scanPageForNewUsernames();
			}

			if (this.options.highlightFirstCommenter.value) {
				RESUtils.watchForElement('newComments', this.scanPageForFirstComments);
				this.scanPageForFirstComments();
			}
		}
	},
	findDefaults: function() {
		var dummy = $('<div style="height: 0px;" id="dummy" class="tagline">\
			<a class="author submitter">submitter</a>\
			<a class="author friend">friend</a>\
			<a class="author moderator">moderator</a>\
			<a class="author admin">admin</a>\
		</div>');
		$(document.body).append(dummy);
		this.colorTable = {
			'submitter': {
				default: RESUtils.getComputedStyle('#dummy .author.submitter', 'color'),
				color: this.options.OPColor.value,
				hoverColor: this.options.OPColorHover.value
			},
			'friend': {
				default: RESUtils.getComputedStyle('#dummy .author.friend', 'color'),
				color: this.options.friendColor.value,
				hoverColor: this.options.friendColorHover.value
			},
			'moderator': {
				default: RESUtils.getComputedStyle('#dummy .author.moderator', 'color'),
				color: this.options.modColor.value,
				hoverColor: this.options.modColorHover.value
			},
			'admin': {
				default: RESUtils.getComputedStyle('#dummy .author.admin', 'color'),
				color: this.options.adminColor.value,
				hoverColor: this.options.adminColorHover.value
			},
			'user': {
				default: '#5544CC',
				color: modules['userTagger'].options['highlightColor'].value,
				hoverColor: modules['userTagger'].options['highlightColorHover'].value,
			},
			'firstComment': {
				default: '#46B6CC',
				color: this.options.firstCommentColor.value,
				hoverColor: this.options.firstCommentColorHover.value
			}
		};
		$('#dummy').detach();
	},
	scanPageForFirstComments: function(ele) {
		var comments = ele ? $(ele).closest('.commentarea > .sitetable > .comment') : document.body.querySelectorAll('.commentarea > .sitetable > .comment');

		RESUtils.forEachChunked(comments, 15, 1000, function(element, i, array) {
			// Get identifiers
			var idClass;
			for (var i = 0, length = element.classList.length; i < length; i++) {
				idClass = element.classList[i];
				if (idClass.substring(0, 6) === 'id-t1_') break;
			}

			if (modules['userHighlight'].firstComments[idClass]) return;
			modules['userHighlight'].firstComments[idClass] = true;

			var entry = element.querySelector('.entry'),
				author = entry.querySelector('.author');
			if (!author) return;

			var authorClass;
			for (var i = 0, length = author.classList.length; i < length; i++) {
				authorClass = author.classList[i];
				if (authorClass.substring(0, 6) === 'id-t2_') break;
			}

			if (authorClass.substring(0, 6) !== 'id-t2_') return;

			var authorDidReply = element.querySelector('.child .' + authorClass);
			if (!authorDidReply) return;

			modules['userHighlight'].doHighlight('firstComment', authorClass, '.' + idClass);
		});
	},
	firstComments: {},
	scanPageForNewUsernames: function(ele) {
		var autoColorUsing = modules['userHighlight'].getAutoColorUsingFunction(modules['userHighlight'].options.autoColorUsing.value);
		if (!autoColorUsing) {
			console.error('Could not find a usable userHighlight.autoColorUsing method');
			return;
		}

		ele = ele || document.body;
		var authors = ele.querySelectorAll('.author');
		RESUtils.forEachChunked(authors, 15, 1000, function(element, i, array) {
			// Get identifiers
			var idClass;
			for (var i = 0, length = element.classList.length; i < length; i++) {
				idClass = element.classList[i];
				if (idClass.substring(0, 6) === 'id-t2_') break;
			}
			var username = element.textContent;

			if (modules['userHighlight'].coloredUsernames[idClass]) return;
			modules['userHighlight'].coloredUsernames[idClass] = true;

			var color = autoColorUsing(idClass, element, username);

			// Apply color
			modules['userHighlight'].doTextColor('.' + idClass, color);
		});
	},
	autoColorTemplate: '	\
						{{selector}} {	\
							color: {{color}} !important;	\
						}	\
						.res-nightmode {{selector}} {	\
							color: {{nightmodecolor}} !important;	\
						}	\
					',
	autoColorUsing: [
	 	{
			name: 'hash-userid-notbright',
			description: 'Random color, not too bright, consistent for each user; night mode-friendly',
			function: function(idClass, username, element) {
				var hash = RESUtils.hashCode(idClass);

				// With help from /u/Rangi42

				var r = (hash & 0xFF0000) >> 16;
				var g = (hash & 0x00FF00) >> 8;
				var b = hash & 0x0000FF;
				// Luminance formula: http://stackoverflow.com/a/596243/70175
				var lum = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
				var minLum = 0x66; // Night mode background is #191919 or #222222
				var maxLum = 0xAA; // Regular background is #FFFFFF or #F7F7F8
				
				var color = [ r, g, b ];
				var nightmodeColor = [ r, g, b ];
				if (lum < minLum) {
				    var scale = minLum / lum;
				    nightmodeColor = [
				    	Math.round(r * scale),
				    	Math.round(g * scale),
				    	Math.round(b * scale)
				    ];
				} else if (lum > maxLum) {
				    var scale = maxLum / lum;
				    color = [
				    	Math.round(r * scale),
				    	Math.round(g * scale),
				    	Math.round(b * scale)
				    ];
				}
				color = "rgb(" + color.join(',') + ")";
				nightmodeColor = "rgb(" + nightmodeColor.join(',') + ")";

				return {
					template: modules['userHighlight'].autoColorTemplate,
					color:  color,
					nightmodecolor: nightmodeColor
				};
			}
		},
		{
			name: 'hash-userid',
			description: 'Simple random color, consistent for each user. (original)',
			function: function(idClass, username, element) {
				// Choose color
				var hash = 5381,
					str = idClass;
				for (var i = 0; i < str.length; i++) {
					hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
				}

				var r = (hash & 0xFF0000) >> 16;
				var g = (hash & 0x00FF00) >> 8;
				var b = hash & 0x0000FF;
				var color = "rgb(" + [r, g, b].join(',') + ")";

				return {
					color: color
				};
			}
		}, {
			name: 'monochrome',
			description: 'All black or, in night mode, all light gray',
			function: function(idClass, username, element) {
				return {
					template: modules['userHighlighter'].autoColorTemplate,
					color: 'black',
					nightmodecolor: '#ccc'
				};
			}
		}
	],
	getAutoColorUsingFunction: function(name) {
		var strategies = modules['userHighlight'].autoColorUsing;
		for (var i = 0, length = strategies.length; i < length; i++) {
			var strategy = strategies[i];
			if (strategy.name == name) {
				return strategy.function;
			}
		}
	},
	coloredUsernames: {},
	highlightUser: function(username) {
		var name = 'author[href$="/' + username + '"]'; // yucky, but it'll do
		return this.doHighlight('user', name);
	},
	doHighlight: function(name, selector, container) {
		if (selector == undefined) {
			selector = name;
		}
		if (container == undefined) {
			container = '.thing .tagline';
		}
		var color, hoverColor;
		var color = this.colorTable[name].color;
		if (color === 'default') this.colorTable[name].
		default;

		var hoverColor = this.colorTable[name].hoverColor;
		if (hoverColor === 'default') hoverColor = '#aaa';
		var css = '\
			' + container + ' .author.' + selector + ' { \
				color: ' + this.options.fontColor.value + ' !important; \
				font-weight: bold; \
				padding: 0 2px 0 2px; \
				border-radius: 3px; \
				background-color:' + color + ' !important; \
			} \
			' + container + ' .collapsed .author.' + selector + ' { \
				color: white !important; \
				background-color: #AAA !important; \
			} \
			' + container + ' .author.' + selector + ':hover {\
				background-color: ' + hoverColor + ' !important; \
				text-decoration: none !important; \
			}';
		return RESUtils.addCSS(css);
	},
	doTextColor: function(selector, colorData) {
		var template = colorData.template || '	\
				{{selector}} {	\
					color: {{color}} !important;	\
				}	\
				';

		var placeholderValues = $.extend({}, colorData, {
			template: null,
			selector: '.tagline .author' + selector
		});
		
		var css = template;

		for (var key in placeholderValues) {
			if (!placeholderValues.hasOwnProperty(key)) continue;
			
			var search = new RegExp('{{' + key + '}}', "g");
			var value = placeholderValues[key];

			if (value !== null && value !== undefined) {
				css = css.replace(search, value);
			}
		}

		return RESUtils.addCSS(css);
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
			values: [{
				name: 'Light',
				value: 'light'
			}, {
				name: 'Dark',
				value: 'dark'
			}],
			value: 'light',
			description: 'Light, or dark?'
		},
		useSubredditStyleInDarkMode: {
			type: 'boolean',
			value: false,
			description: "Don't disable subreddit styles by default when using dark mode (night mode).\
				<br><br>When using dark mode, subreddit styles are automatically disabled unless <a href='http://www.reddit.com/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit'>the subreddit indicates it is dark mode-friendly</a>. you must tick the 'Use subreddit stylesheet' in a subreddit's sidebar to enable subreddit styles in that subreddit. This is because most subreddits are not dark mode-friendly.\
				<br><br>If you choose to show subreddit styles, you will see flair images and spoiler tags, but be warned: <em>you may see bright images, comment highlighting, etc.</em>  If you do, please message the mods for that subreddit."		},
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
		hideUnvotable: {
			type: 'boolean',
			value: false,
			description: 'Hide vote arrows on threads where you cannot vote (e.g. archived due to age)'
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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (RESUtils.currentSubreddit()) {
				this.curSubReddit = RESUtils.currentSubreddit().toLowerCase();
			}

			this.styleCBName = RESUtils.randomHash();
			RESUtils.addCSS('body.res .side .spacer .titlebox div #' + this.styleCBName + ':before { display: none !important;  }');
			RESUtils.addCSS('body.res .side .spacer .titlebox div #label-' + this.styleCBName + ':before { display: none !important; }');
			RESUtils.addCSS('body.res .side .spacer .titlebox div #' + this.styleCBName + ':after { display: none !important;  }');
			RESUtils.addCSS('body.res .side .spacer .titlebox div #label-' + this.styleCBName + ':after { display: none !important; }');

			// In firefox, we need to style tweet expandos because they can't take advantage of twitter.com's widget.js
			if (BrowserDetect.isFirefox()) {
				RESUtils.addCSS('.res blockquote.twitter-tweet { padding: 15px; border-left: 5px solid #ccc; font-size: 14px; line-height: 20px; }');
				RESUtils.addCSS('.res blockquote.twitter-tweet p { margin-bottom: 15px; }');
			}

			if (this.options.colorBlindFriendly.value) {
				document.html.classList.add('res-colorblind');
			}

			// if night mode is enabled, set a localstorage token so that in the future,
			// we can add the res-nightmode class to the page prior to page load.
			if (this.isDark()) {
				this.enableNightMode();
			} else {
				this.disableNightMode();
			}

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
			if ((this.options.commentBoxes.value) && (RESUtils.pageType() === 'comments')) {
				this.commentBoxes();
			}
			if (this.options.hideUnvotable.value) {
				RESUtils.addCSS('.unvoted .arrow[onclick*=unvotable] { visibility: hidden }');
				RESUtils.addCSS('.voted .arrow[onclick*=unvotable] { cursor: normal; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			// get the head ASAP!
			this.head = document.getElementsByTagName("head")[0];

			// handle night mode scenarios (check if subreddit is compatible, etc)
			this.handleNightModeAtStart();

			// get rid of antequated option we've removed (err, renamed) due to performance issues.
			if (typeof this.options.commentBoxHover !== 'undefined') {
				delete this.options.commentBoxHover;
				RESStorage.setItem('RESoptions.styleTweaks', JSON.stringify(modules['styleTweaks'].options));
			}
			if (this.isDark()) {
				// still add .res-nightmode to body just in case subreddit stylesheets specified body.res-nightmode instead of just .res-nightmode
				document.body.classList.add('res-nightmode');
			}
			if (this.options.navTop.value) {
				this.navTop();
			}
			if (this.options.lightSwitch.value) {
				this.lightSwitch();
			}
			if (this.options.colorBlindFriendly.value) {
				var orangered = document.getElementById('mail');
				if ((orangered) && (orangered.classList.contains('havemail'))) {
					orangered.setAttribute('style', 'background-image: url(http://thumbs.reddit.com/t5_2s10b_5.png); background-position: 0 0;');
				}
			}
			if (this.options.scrollSubredditDropdown.value) {
				var calcedHeight = Math.floor(window.innerHeight * 0.95);
				if ($('.drop-choices.srdrop').height() > calcedHeight) {
					RESUtils.addCSS('.drop-choices.srdrop { \
						overflow-y: scroll; \
						max-height: ' + calcedHeight + 'px; \
					}');
				}
			}
			if (this.options.showExpandos.value) {
				RESUtils.addCSS('.compressed .expando-button { display: block !important; }');
				var twitterLinks = document.body.querySelectorAll('.entry > p.title > a.title');
				var isTwitterLink = /twitter.com\/(?:#!\/)?([\w]+)\/(status|statuses)\/([\d]+)/i;
				for (var i = 0, len = twitterLinks.length; i < len; i++) {
					var thisHref = twitterLinks[i].getAttribute('href');
					thisHref = thisHref.replace('/#!', '');
					if (isTwitterLink.test(thisHref)) {
						var thisExpandoButton = document.createElement('div');
						thisExpandoButton.setAttribute('class', 'expando-button collapsed collapsedExpando selftext twitter');
						thisExpandoButton.addEventListener('click', modules['styleTweaks'].toggleTweetExpando, false);
						RESUtils.insertAfter(twitterLinks[i].parentNode, thisExpandoButton);
					}
				}
			}
			this.userbarHider();
			this.subredditStyles();
		}
	},
	isDark: function() {
		return this.options.lightOrDark.value === 'dark';
	},
	handleNightModeAtStart: function() {
		this.nightModeWhitelist = [];
		var getWhitelist = RESStorage.getItem('RESmodules.styleTweaks.nightModeWhitelist');
		if (getWhitelist) {
			this.nightModeWhitelist = safeJSON.parse(getWhitelist, 'RESmodules.styleTweaks.nightModeWhitelist');
		}
		var idx = this.nightModeWhitelist.indexOf(this.curSubReddit);
		if (idx !== -1) {
			// go no further. this subreddit is whitelisted.
			return;
		}

		// check the sidebar for a link [](#/RES_SR_Config/NightModeCompatible) that indicates the sub is night mode compatible.
		this.isNightmodeCompatible = (document.querySelector('.side a[href="#/RES_SR_Config/NightModeCompatible"]') !== null);
		this.isNightmodeCompatible = this.isNightmodeCompatible || this.options.useSubredditStyleInDarkMode.value;

		// if night mode is on and the sub isn't compatible, disable its stylesheet.
		if (this.isDark() && !this.isNightmodeCompatible) {
			this.disableSubredditStyle();
		}
	},
	toggleTweetExpando: function(e) {
		var thisExpando = e.target.nextSibling.nextSibling.nextSibling;
		if (e.target.classList.contains('collapsedExpando')) {
			$(e.target).removeClass('collapsedExpando collapsed').addClass('expanded');
			if (thisExpando.classList.contains('twitterLoaded')) {
				thisExpando.style.display = 'block';
				return;
			}
			var twitterLink = e.target.previousSibling.querySelector('.title');
			if (twitterLink) twitterLink = twitterLink.getAttribute('href').replace('/#!', '');
			var match = twitterLink.match(/twitter.com\/[^\/]+\/(?:status|statuses)\/([\d]+)/i);
			if (match !== null) {
				// var jsonURL = 'http://api.twitter.com/1/statuses/show/'+match[1]+'.json';
				var jsonURL = 'http://api.twitter.com/1/statuses/oembed.json?id=' + match[1],
					thisJSON = {
						requestType: 'loadTweet',
						url: jsonURL
					};
				if (BrowserDetect.isChrome()) {
					// we've got chrome, so we need to hit up the background page to do cross domain XHR
					chrome.permissions.request({
						origins: ['https://api.twitter.com/*']
					}, function(granted) {
						// The callback argument will be true if the user granted the permissions.
						if (granted) {
							chrome.runtime.sendMessage(thisJSON, function(response) {
								// send message to background.html 
								var tweet = response;
								$(thisExpando).html(tweet.html);
								thisExpando.style.display = 'block';
								thisExpando.classList.add('twitterLoaded');
							});
						} else {
							modules['notifications'].showNotification("Without permission to access https://api.twitter.com/*, RES's twitter expandos (to show twitter posts in-line) will not work.");
						}
					});
				} else if (BrowserDetect.isSafari()) {
					// we've got safari, so we need to hit up the background page to do cross domain XHR
					modules['styleTweaks'].tweetExpando = thisExpando;
					safari.self.tab.dispatchMessage(thisJSON.requestType, thisJSON);
				} else if (BrowserDetect.isOpera()) {
					// we've got opera, so we need to hit up the background page to do cross domain XHR
					modules['styleTweaks'].tweetExpando = thisExpando;
					opera.extension.postMessage(JSON.stringify(thisJSON));
				} else if (BrowserDetect.isFirefox()) {
					// we've got a jetpack extension, hit up the background page...
					// we have to omit the script tag and all of the nice formatting it brings us in Firefox
					// because AMO does not permit externally hosted script tags being pulled in from
					// oEmbed like this...
					jsonURL += '&omit_script=true';
					modules['styleTweaks'].tweetExpando = thisExpando;
					self.postMessage(thisJSON);
				}
			}
		} else {
			$(e.target).removeClass('expanded').addClass('collapsedExpando').addClass('collapsed');
			thisExpando.style.display = 'none';
		}

	},
	navTop: function() {
		RESUtils.addCSS('#header-bottom-right { top: 19px; border-radius: 0 0 0 3px; bottom: auto;  }');
		RESUtils.addCSS('.beta-notice { top: 48px; }');
		$('body, #header-bottom-right').addClass('res-navTop');
	},
	userbarHider: function() {
		RESUtils.addCSS("#userbarToggle { min-height: 22px; position: absolute; top: auto; bottom: 0; left: -5px; width: 16px; padding-right: 3px; height: 100%; font-size: 15px; border-radius: 4px 0; color: #a1bcd6; display: inline-block; background-color: #dfecf9; border-right: 1px solid #cee3f8; cursor: pointer; text-align: right; line-height: 24px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { min-height: 26px; }");
		RESUtils.addCSS("#header-bottom-right .user { margin-left: 16px; }");
		// RESUtils.addCSS(".userbarHide { background-position: 0 -137px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { left: -12px; }");
		RESUtils.addCSS(".res-navTop #userbarToggle.userbarShow { top: 0; bottom: auto; }");
		this.userbar = document.getElementById('header-bottom-right');
		if (this.userbar) {
			this.userbarToggle = RESUtils.createElementWithID('div', 'userbarToggle');
			$(this.userbarToggle).html('&raquo;');
			this.userbarToggle.setAttribute('title', 'Toggle Userbar');
			this.userbarToggle.classList.add('userbarHide');
			this.userbarToggle.addEventListener('click', function(e) {
				modules['styleTweaks'].toggleUserBar();
			}, false);
			this.userbar.insertBefore(this.userbarToggle, this.userbar.firstChild);
			// var currHeight = $(this.userbar).height();
			// $(this.userbarToggle).css('height',currHeight+'px');
			if (RESStorage.getItem('RESmodules.styleTweaks.userbarState') === 'hidden') {
				this.toggleUserBar();
			}
		}
	},
	toggleUserBar: function() {
		var nextEle = this.userbarToggle.nextSibling;
		// hide userbar.
		if (this.userbarToggle.classList.contains('userbarHide')) {
			this.userbarToggle.classList.remove('userbarHide');
			this.userbarToggle.classList.add('userbarShow');
			$(this.userbarToggle).html('&laquo;');
			RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'hidden');
			modules['accountSwitcher'].closeAccountMenu();
			while ((typeof nextEle !== 'undefined') && (nextEle !== null)) {
				nextEle.style.display = 'none';
				nextEle = nextEle.nextSibling;
			}
			// show userbar.
		} else {
			this.userbarToggle.classList.remove('userbarShow');
			this.userbarToggle.classList.add('userbarHide');
			$(this.userbarToggle).html('&raquo;');
			RESStorage.setItem('RESmodules.styleTweaks.userbarState', 'visible');
			while ((typeof nextEle !== 'undefined') && (nextEle !== null)) {
				if ((/mail/.test(nextEle.className)) || (nextEle.id === 'openRESPrefs')) {
					nextEle.style.display = 'inline-block';
				} else {
					nextEle.style.display = 'inline';
				}
				nextEle = nextEle.nextSibling;
			}
		}
	},
	commentBoxes: function() {
		document.html.classList.add('res-commentBoxes');
		if (this.options.commentRounded.value) {
			document.html.classList.add('res-commentBoxes-rounded');
		}
		if (this.options.continuity.value) {
			document.html.classList.add('res-continuity');
		}
		if (this.options.commentHoverBorder.value) {
			document.html.classList.add('res-commentHoverBorder');
		}
		if (this.options.commentIndent.value) {
			// this should override the default of 10px in commentboxes.css because it's added later.
			RESUtils.addCSS('.res-commentBoxes .comment { margin-left:' + this.options.commentIndent.value + 'px !important; }');
		}
	},
	lightSwitch: function() {
		RESUtils.addCSS(".lightOn { background-position: 0 -96px; } ");
		RESUtils.addCSS(".lightOff { background-position: 0 -108px; } ");
		var thisFrag = document.createDocumentFragment();
		this.lightSwitch = document.createElement('li');
		this.lightSwitch.setAttribute('title', "Toggle night and day");
		this.lightSwitch.addEventListener('click', function(e) {
			e.preventDefault();
			if (modules['styleTweaks'].isDark()) {
				modules['styleTweaks'].lightSwitchToggle.classList.remove('enabled');
				modules['styleTweaks'].disableNightMode();
			} else {
				modules['styleTweaks'].lightSwitchToggle.classList.add('enabled');
				modules['styleTweaks'].enableNightMode();
			}
		}, true);
		// this.lightSwitch.setAttribute('id','lightSwitch');
		this.lightSwitch.textContent = 'night mode';
		this.lightSwitchToggle = RESUtils.createElementWithID('div', 'lightSwitchToggle', 'toggleButton');
		$(this.lightSwitchToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
		this.lightSwitch.appendChild(this.lightSwitchToggle);
		if (this.isDark()) {
			this.lightSwitchToggle.classList.add('enabled')
		} else {
			this.lightSwitchToggle.classList.remove('enabled');
		}
		// thisFrag.appendChild(separator);
		thisFrag.appendChild(this.lightSwitch);
		// if (RESConsole.RESPrefsLink) insertAfter(RESConsole.RESPrefsLink, thisFrag);
		$('#RESDropdownOptions').append(this.lightSwitch);
	},
	subredditStyles: function() {
		if (!RESUtils.currentSubreddit()) return;
		this.ignoredSubReddits = [];
		var getIgnored = RESStorage.getItem('RESmodules.styleTweaks.ignoredSubredditStyles');
		if (getIgnored) {
			this.ignoredSubReddits = safeJSON.parse(getIgnored, 'RESmodules.styleTweaks.ignoredSubredditStyles');
		}
		var subredditTitle = document.querySelector('.titlebox h1');
		this.styleToggleContainer = document.createElement('div');
		this.styleToggleLabel = document.createElement('label');
		this.styleToggleCheckbox = document.createElement('input');
		this.styleToggleCheckbox.setAttribute('type', 'checkbox');
		this.styleToggleCheckbox.setAttribute('id', this.styleCBName);
		this.styleToggleCheckbox.setAttribute('name', this.styleCBName);

		// are we blacklisting, or whitelisting subreddits?  If we're in night mode on a sub that's
		// incompatible with it, we want to check the whitelist. Otherwise, check the blacklist.

		if ((this.curSubReddit !== null) && (subredditTitle !== null)) {

			if (this.isDark() && !this.isNightmodeCompatible) {
				var idx = this.nightModeWhitelist.indexOf(this.curSubReddit);
				if (idx !== -1) {
					this.styleToggleCheckbox.checked = true;
				}
			} else {
				var idx = this.ignoredSubReddits.indexOf(this.curSubReddit);
				if (idx === -1) {
					this.styleToggleCheckbox.checked = true;
				} else {
					this.toggleSubredditStyle(false);
				}
			}
			this.styleToggleCheckbox.addEventListener('change', function(e) {
				modules['styleTweaks'].toggleSubredditStyle(this.checked);
			}, false);
			this.styleToggleContainer.appendChild(this.styleToggleCheckbox);
			RESUtils.insertAfter(subredditTitle, this.styleToggleContainer);
		}
		this.styleToggleLabel.setAttribute('for', this.styleCBName);
		this.styleToggleLabel.setAttribute('id', 'label-' + this.styleCBName);
		this.styleToggleLabel.textContent = 'Use subreddit style ';
		this.styleToggleContainer.appendChild(this.styleToggleLabel);
		this.setSRStyleToggleVisibility(true); // no source
	},
	srstyleHideLock: RESUtils.createMultiLock(),
	setSRStyleToggleVisibility: function(visible, source) {
		/// When showing/hiding popups which could overlay the "Use subreddit style" checkbox,
		/// set the checkbox's styling to "less visible" or "more visible"
		/// @param 	visible 		bool	make checkbox "more visible" (true) or less (false)
		/// @param 	source 	string 	popup ID, so checkbox stays less visible until that popup's lock is released
		var self = modules['styleTweaks'];
		if (!self.styleToggleContainer) return;

		if (typeof source !== "undefined") {
			if (visible) {
				self.srstyleHideLock.unlock(source);
			} else {
				self.srstyleHideLock.lock(source);
			}
		}

		if (visible && self.srstyleHideLock.locked()) {
			visible = false;
		}

		// great, now people are still finding ways to hide this.. these extra declarations are to try and fight that.
		// Sorry, subreddit moderators, but users can disable all subreddit stylesheets if they want - this is a convenience 
		// for them and I think taking this functionality away from them is unacceptable.

		var zIndex = 'z-index: ' + (visible ? ' 2147483647' : 'auto') + ' !important;';

		self.styleToggleContainer.setAttribute('style', 'margin: 0 !important; background-color: inherit !important; color: inherit !important; display: block !important; position: relative !important; left: 0 !important; top: 0 !important; max-height: none!important; max-width: none!important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0 !important; font-size: 12px !important; float: none !important; opacity: 1 !important;' + zIndex);
		self.styleToggleCheckbox.setAttribute('style', 'margin: 0 !important; background-color: inherit !important; color: inherit !important; display: inline-block !important; position: relative !important; left: 0 !important; top: 0 !important; max-height: none!important; max-width: none!important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0 !important; font-size: 12px !important; float: none !important; opacity: 1 !important;' + zIndex);
		self.styleToggleLabel.setAttribute('style', 'margin: 0 !important; background-color: inherit !important; color: inherit !important; display: inline-block !important; position: relative !important; left: 0 !important; top: 0 !important; max-height: none!important; max-width: none!important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0 !important; font-size: 12px !important; margin-left: 4px !important; float: none !important; opacity: 1 !important;' + zIndex);
	},
	toggleSubredditStyle: function(toggle, subreddit) {
		var togglesr = (subreddit) ? subreddit.toLowerCase() : this.curSubReddit;
		if (toggle) {
			this.enableSubredditStyle(subreddit);
		} else {
			this.disableSubredditStyle(subreddit);
		}
	},
	enableSubredditStyle: function(subreddit) {
		var togglesr = (subreddit) ? subreddit.toLowerCase() : this.curSubReddit;

		if (this.isDark() && !this.isNightmodeCompatible) {
			var idx = this.nightModeWhitelist.indexOf(togglesr);
			if (idx === -1) this.nightModeWhitelist.push(togglesr); // add if not found
			RESStorage.setItem('RESmodules.styleTweaks.nightModeWhitelist', JSON.stringify(this.nightModeWhitelist));
		} else if (this.ignoredSubReddits) {
			var idx = this.ignoredSubReddits.indexOf(togglesr);
			if (idx !== -1) this.ignoredSubReddits.splice(idx, 1); // Remove it if found...
			RESStorage.setItem('RESmodules.styleTweaks.ignoredSubredditStyles', JSON.stringify(this.ignoredSubReddits));
		}

		var subredditStyleSheet = document.createElement('link');
		subredditStyleSheet.setAttribute('title', 'applied_subreddit_stylesheet');
		subredditStyleSheet.setAttribute('rel', 'stylesheet');
		subredditStyleSheet.setAttribute('href', 'http://www.reddit.com/r/' + togglesr + '/stylesheet.css');
		if (!subreddit || (subreddit == this.curSubReddit)) this.head.appendChild(subredditStyleSheet);
	},
	disableSubredditStyle: function(subreddit) {
		var togglesr = (subreddit) ? subreddit.toLowerCase() : this.curSubReddit;

		if (this.isDark() && !this.isNightmodeCompatible) {
			var idx = this.nightModeWhitelist.indexOf(togglesr);
			if (idx !== -1) this.nightModeWhitelist.splice(idx, 1); // Remove it if found...
			RESStorage.setItem('RESmodules.styleTweaks.nightModeWhitelist', JSON.stringify(this.nightModeWhitelist));
		} else if (this.ignoredSubReddits) {
			var idx = this.ignoredSubReddits.indexOf(togglesr); // Find the index
			if (idx === -1) this.ignoredSubReddits.push(togglesr);
			RESStorage.setItem('RESmodules.styleTweaks.ignoredSubredditStyles', JSON.stringify(this.ignoredSubReddits));
		}

		var subredditStyleSheet = this.head.querySelector('link[title=applied_subreddit_stylesheet]');
		if (!subredditStyleSheet) subredditStyleSheet = this.head.querySelector('style[title=applied_subreddit_stylesheet]');
		if ((subredditStyleSheet) && (!subreddit || (subreddit == this.curSubReddit))) {
			subredditStyleSheet.parentNode.removeChild(subredditStyleSheet);
		}
	},
	enableNightMode: function() {
		// Set the user preference, if possible (which is not at page load)
		if (RESStorage.getItem) {
			RESUtils.setOption('styleTweaks', 'lightOrDark', 'dark');
		}

		localStorage.setItem('RES_nightMode', true);
		document.html.classList.add('res-nightmode');

		if (document.body) {
			document.body.classList.add('res-nightmode');
		}
	},
	disableNightMode: function() {
		// Set the user preference, if possible (which is not at page load)
		if (RESStorage.getItem) {
			RESUtils.setOption('styleTweaks', 'lightOrDark', 'light');
		}

		localStorage.removeItem('RES_nightMode');
		document.html.classList.remove('res-nightmode');

		if (document.body) {
			document.body.classList.remove('res-nightmode');
		}
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
			fields: [{
				name: 'username',
				type: 'text'
			}, {
				name: 'password',
				type: 'password'
			}],
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
			values: [{
				name: 'snoo (alien)',
				value: 'alien'
			}, {
				name: 'simple arrow',
				value: 'arrow'
			}],
			value: 'alien',
			description: 'Use the "snoo" icon, or older style dropdown?'
		}
	},
	description: 'Store username/password pairs and switch accounts instantly while browsing Reddit!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#header-bottom-right { height: auto; padding: 4px 4px 7px }')
			RESUtils.addCSS('#RESAccountSwitcherDropdown { min-width: 110px; width: auto; display: none; position: absolute; z-index: 1000; }');
			RESUtils.addCSS('#RESAccountSwitcherDropdown li { height: auto; line-height: 20px; padding: 2px 10px; }');
			if (this.options.dropDownStyle.value === 'alien') {
				RESUtils.addCSS('#RESAccountSwitcherIcon { cursor: pointer; margin-left: 3px; display: inline-block; width: 12px; vertical-align: middle; height: 16px; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC); }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay { cursor: pointer; position: absolute; display: none; width: 11px; height: 22px; background-position: 2px 3px; padding-left: 2px; padding-right: 2px; padding-top: 3px; border: 1px solid #369; border-bottom: 1px solid #5f99cf; background-color: #5f99cf; border-radius: 3px 3px 0 0; z-index: 100; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC); }');
			} else {
				RESUtils.addCSS('#RESAccountSwitcherIcon { display: inline-block; vertical-align: middle; margin-left: 3px; }');
				RESUtils.addCSS('#RESAccountSwitcherIcon .downArrow { cursor: pointer; margin-top: 2px; display: block; width: 16px; height: 10px; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-position: 0 -106px; }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay { cursor: pointer; position: absolute; display: none; width: 20px; height: 22px; z-index: 100; border: 1px solid #369; border-bottom: 1px solid #5f99cf; background-color: #5f99cf; border-radius: 3px 3px 0 0; }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay .downArrow { margin-top: 6px; margin-left: 3px; display: inline-block; width: 18px; height: 10px; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-position: 0 -96px; }');
				// this.alienIMG = '<span class="downArrow"></span>';
			}
			// RESUtils.addCSS('#RESAccountSwitcherIconOverlay { display: none; position: absolute; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.userLink = document.querySelector('#header-bottom-right > span.user > a');
			if (this.userLink) {
				this.userLink.style.marginRight = '2px';
				this.loggedInUser = RESUtils.loggedInUser();
				// var downArrowIMG = 'data:image/gif;base64,R0lGODlhBwAEALMAAAcHBwgICAoKChERETs7Ozo6OkJCQg0NDRoaGhAQEAwMDDIyMv///wAAAAAAAAAAACH5BAEAAAwALAAAAAAHAAQAAAQQ0BSykADsDAUwY4kQfOT4RQA7';
				if (this.options.dropDownStyle.value === 'alien') {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"></span>');
				} else {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"><span class="downArrow"></span></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"><span class="downArrow"></span></span>');
				}
				this.downArrowOverlay.on('click', function() {
					modules['accountSwitcher'].toggleAccountMenu(false);
					modules['accountSwitcher'].manageAccounts();
				}).appendTo(document.body);

				this.downArrow.on('click', function() {
					modules['accountSwitcher'].updateUserDetails();
					modules['accountSwitcher'].toggleAccountMenu(true);
				});
				this.downArrowOverlay.on('mouseleave', function() {
					modules['accountSwitcher'].dropdownTimer = setTimeout(function() {
						modules['accountSwitcher'].toggleAccountMenu(false);
					}, 1000);
				});

				// insertAfter(this.userLink, downArrow);
				$(this.userLink).after(this.downArrow);

				this.accountMenu = $('<ul id="RESAccountSwitcherDropdown" class="RESDropdownList"></ul>')
				this.accountMenu.on('mouseenter', function() {
					clearTimeout(modules['accountSwitcher'].dropdownTimer);
				});
				this.accountMenu.on('mouseleave', function() {
					modules['accountSwitcher'].toggleAccountMenu(false);
				});
				// RESUtils.addStyle(css);
				var accounts = this.options.accounts.value;
				if (accounts !== null) {
					var accountCount = 0;
					for (var i = 0, len = accounts.length; i < len; i++) {
						var thisPair = accounts[i],
							username = thisPair[0];
						if (!this.loggedInUser || username.toUpperCase() !== this.loggedInUser.toUpperCase() || this.options.showCurrentUserName.value) {
							accountCount++;
							var $accountLink = $('<li>', {
								'class': 'accountName'
							});
							// Check if user is logged in before comparing
							if (this.loggedInUser && username.toUpperCase() === this.loggedInUser.toUpperCase()) {
								$accountLink.addClass('active');
							}

							$accountLink
								.data('username', username)
								.html(username)
								.css('cursor', 'pointer')
								.on('click', function(e) {
									e.preventDefault();
									modules['accountSwitcher'].switchTo($(this).data('username'));
								})
								.appendTo(this.accountMenu);

							RESUtils.getUserInfo(function(userInfo) {
								var userDetails = username;

								// Display the karma of the user, if it is already pre-fetched
								if (userInfo && !userInfo.error && userInfo.data) {
									userDetails = username + ' (' + userInfo.data.link_karma + ' &middot; ' + userInfo.data.comment_karma + ')';
								}

								$accountLink.html(userDetails);
							}, username, false);
						}
					}
					$('<li>', {
						'class': 'addAccount'
					})
						.text('+ add account')
						.css('cursor', 'pointer')
						.on('click', function(e) {
							e.preventDefault();
							modules['accountSwitcher'].toggleAccountMenu(false);
							modules['accountSwitcher'].manageAccounts();
						})
						.appendTo(this.accountMenu);
				}
				$(document.body).append(this.accountMenu);
			}
		}
	},
	updateUserDetails: function() {
		this.accountMenu.find('.accountName').each(function(index) {
			var username = $(this).data('username'),
				that = this;

			// Ignore "+ add account"
			if (typeof username === 'undefined') {
				return;
			}

			// Leave a 500 ms delay between requests
			setTimeout(function() {
				RESUtils.getUserInfo(function(userInfo) {
					// Fail if retrieving the user's info results in an error (such as a 404)
					if (!userInfo || userInfo.error || !userInfo.data) {
						return;
					}

					// Display the karma of the user
					var userDetails = username + ' (' + userInfo.data.link_karma + ' &middot; ' + userInfo.data.comment_karma + ')';
					$(that).html(userDetails);
				}, username);
			}, 500 * index);
		});
	},
	toggleAccountMenu: function(open) {
		if ((open) || (!$(modules['accountSwitcher'].accountMenu).is(':visible'))) {
			var thisHeight = 18;
			if ($('#RESAccountSwitcherDropdown').css('position') !== 'fixed') {
				var thisX = $(modules['accountSwitcher'].userLink).offset().left;
				var thisY = $(modules['accountSwitcher'].userLink).offset().top;
			} else {
				var thisX = $('#header-bottom-right').position().left + $(modules['accountSwitcher'].userLink).position().left;
				var thisY = $(modules['accountSwitcher'].userLink).position().top;
				if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
					thisHeight += $('#sr-header-area').height();
				} else if (modules['betteReddit'].options.pinHeader.value === 'header') {
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
				top: (thisY - 4) + 'px',
				left: (thisX - 3) + 'px'
			});

			$(modules['accountSwitcher'].downArrowOverlay).show();
			modules['styleTweaks'].setSRStyleToggleVisibility(false, 'accountSwitcher');

		} else {
			$(modules['accountSwitcher'].accountMenu).hide();
			$(modules['accountSwitcher'].downArrowOverlay).hide();
			modules['styleTweaks'].setSRStyleToggleVisibility(true, 'accountSwitcher');
		}
	},
	closeAccountMenu: function() {
		// this function basically just exists for other modules to call.
		if (!this.accountMenu) return;
		$(this.accountMenu).hide();
	},
	switchTo: function(username) {
		var accounts = this.options.accounts.value;
		var password = '';
		var rem = '';
		if (this.options.keepLoggedIn.value) {
			rem = '&rem=on';
		}
		for (var i = 0, len = accounts.length; i < len; i++) {
			var thisPair = accounts[i];
			if (thisPair[0].toUpperCase() === username.toUpperCase()) {
				password = thisPair[1];
				break;
			}
		}
		var loginUrl = 'https://ssl.reddit.com/api/login';
		// unfortunately, due to 3rd party cookie issues, none of the below browsers work with ssl.
		if (BrowserDetect.isOpera()) {
			loginUrl = 'http://' + location.hostname + '/api/login';
		} else if ((BrowserDetect.isChrome()) && (chrome.extension.inIncognitoContext)) {
			loginUrl = 'http://' + location.hostname + '/api/login';
		} else if (BrowserDetect.isSafari()) {
			loginUrl = 'http://' + location.hostname + '/api/login';
		}

		// Remove old session cookie
		RESUtils.deleteCookie('reddit_session');

		GM_xmlhttpRequest({
			method: "POST",
			url: loginUrl,
			data: 'user=' + encodeURIComponent(username) + '&passwd=' + encodeURIComponent(password) + rem,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload: function(response) {
				var badData = false;
				try {
					var data = JSON.parse(response.responseText);
				} catch (error) {
					var data = {};
					badData = true;
					console.log(error);
				}

				var error = /WRONG_PASSWORD/;
				var rateLimit = /RATELIMIT/;
				if (badData) {
					modules['notifications'].showNotification({
						type: 'error',
						moduleID: 'accountSwitcher',
						message: 'Could not switch accounts. Reddit may be under heavy load. Please try again in a few moments.'
					});
				} else if (error.test(response.responseText)) {
					alert('Incorrect login and/or password. Please check your configuration.');
				} else if (rateLimit.test(response.responseText)) {
					alert('RATE LIMIT: The Reddit API is seeing too many hits from you too fast, perhaps you keep submitting a wrong password, etc?  Try again in a few minutes.');
				} else if (badData) {
					alert('An error of some unknown type has occurred. Please check the error console in your browser for details and report the issue in /r/RESIssues');
					console.log(response.responseText);
				} else {
					location.reload();
				}
			}
		});
	},
	manageAccounts: function() {
		modules['settingsNavigation'].loadSettingsPage('accountSwitcher', 'accounts');
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
		notification: {
			type: 'boolean',
			value: true,
			description: 'Show a notification when posts are filtered'
		},
		NSFWQuickToggle: {
			type: 'boolean',
			value: true,
			description: 'Add a quick NSFW on/off toggle to the gear menu'
		},
		keywords: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'keyword',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				}, {
					name: 'reddits',
					type: 'list',
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
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in title keywords you want to ignore if they show up in a title'
		},
		subreddits: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
				name: 'subreddit',
				type: 'text'
			}],
			value: [],
			description: 'Type in a subreddit you want to ignore (only applies to /r/all or /domain/* urls)'
		},
		domains: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'domain',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				}, {
					name: 'reddits',
					type: 'list',
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
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in domain keywords you want to ignore. Note that \"reddit\" would ignore \"reddit.com\" and \"fooredditbar.com\"'
		},
		flair: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'keyword',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				}, {
					name: 'reddits',
					type: 'list',
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
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in keywords you want to ignore if they are contained in link flair'
		},
		allowNSFW: {
			type: 'table',
			addRowText: "+add subreddits",
			description: "Whitelist subreddits from NSFW filter",
			fields: [{
				name: 'subreddits',
				type: 'list',
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
			}, {
				name: 'where',
				type: 'enum',
				values: [{
					name: 'Everywhere',
					value: 'everywhere'
				}, {
					name: 'When browsing subreddit/multi-subreddit',
					value: 'visit'
				}],
				value: 'everywhere'
			}]
		}
	},
	description: 'Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all or /domain/*).',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/?(?:\??[\w]+=[\w]+&?)*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
	],
	exclude: [
		// /^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		// /^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
		/^https?:\/\/([a-z]+)\.reddit\.com\/saved\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/over18.*/i,
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled()) {
			RESUtils.addCSS('.RESFilterToggle { margin-right: 5px; color: white; background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('.RESFilterToggle.remove { background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-remove.png) }');
			RESUtils.addCSS('.RESFiltered { display: none !important; }');
			if (this.options.NSFWfilter.value && this.isEnabled() && this.isMatchURL()) {
				this.addNSFWFilterStyle();
			}
		}
	},
	go: function() {
		// shh I'm cheating. This runs the toggle on every single page, bypassing isMatchURL.
		if ((this.isEnabled()) && (this.options.NSFWQuickToggle.value)) {
			var thisFrag = document.createDocumentFragment();
			this.nsfwSwitch = document.createElement('li');
			this.nsfwSwitch.setAttribute('title', "Toggle NSFW Filter");
			this.nsfwSwitch.addEventListener('click', function(e) {
				e.preventDefault();
				modules['filteReddit'].toggleNsfwFilter();
			}, true);
			this.nsfwSwitch.textContent = 'nsfw filter';
			this.nsfwSwitchToggle = RESUtils.createElementWithID('div', 'nsfwSwitchToggle', 'toggleButton');
			$(this.nsfwSwitchToggle).html('<span class="toggleOn">on</span><span class="toggleOff">off</span>');
			this.nsfwSwitch.appendChild(this.nsfwSwitchToggle);
			(this.options.NSFWfilter.value) ? this.nsfwSwitchToggle.classList.add('enabled') : this.nsfwSwitchToggle.classList.remove('enabled');
			thisFrag.appendChild(this.nsfwSwitch);
			$('#RESDropdownOptions').append(this.nsfwSwitch);
		}

		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.scanEntries();
			RESUtils.watchForElement('siteTable', modules['filteReddit'].scanEntries);
		}
	},
	toggleNsfwFilter: function(toggle, notify) {
		if (toggle !== true && toggle === false || modules['filteReddit'].options.NSFWfilter.value == true) {
			modules['filteReddit'].filterNSFW(false);
			RESUtils.setOption('filteReddit', 'NSFWfilter', false);
			$(modules['filteReddit'].nsfwSwitchToggle).removeClass('enabled');
		} else {
			modules['filteReddit'].filterNSFW(true);
			RESUtils.setOption('filteReddit', 'NSFWfilter', true);
			$(modules['filteReddit'].nsfwSwitchToggle).addClass('enabled');
		}

		if (notify) {
			var onOff = modules['filteReddit'].options.NSFWfilter.value ? 'on' : ' off';

			modules['notifications'].showNotification({
				header: 'NSFW Filter',
				moduleID: 'filteReddit',
				optionKey: 'NSFWfilter',
				message: 'NSFW Filter has been turned ' + onOff + '.'
			}, 4000);
		}
	},
	scanEntries: function(ele) {
		var numFiltered = 0;
		var numNsfwHidden = 0;

		var entries;
		if (ele == null) {
			entries = document.querySelectorAll('#siteTable div.thing.link');
		} else {
			entries = ele.querySelectorAll('div.thing.link');
		}
		// var RALLre = /\/r\/all\/?(([\w]+)\/)?/i;
		// var onRALL = RALLre.exec(location.href);
		var filterSubs = (RESUtils.currentSubreddit('all')) || (RESUtils.currentDomain());
		for (var i = 0, len = entries.length; i < len; i++) {
			var postTitle = entries[i].querySelector('.entry a.title').innerHTML;
			var postDomain = entries[i].querySelector('.entry span.domain > a').innerHTML.toLowerCase();
			var thisSubreddit = entries[i].querySelector('.entry a.subreddit');
			var postFlair = entries[i].querySelector('.entry span.linkflairlabel');
			if (thisSubreddit !== null) {
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
				entries[i].classList.add('RESFiltered')
				numFiltered++;
			}

			if (entries[i].classList.contains('over18')) {
				if (modules['filteReddit'].allowNSFW(postSubreddit, currSub)) {
					entries[i].classList.add('allowOver18');
				} else if (modules['filteReddit'].options.NSFWfilter.value) {
					numNsfwHidden++;
				}
			}
		}

		if ((numFiltered || numNsfwHidden) && modules['filteReddit'].options.notification.value) {
			var notification = [];
			if (numFiltered) notification.push(numFiltered + ' post(s) hidden by ' + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'keywords', 'custom filters') + '.');
			if (numNsfwHidden) notification.push(numNsfwHidden + ' post(s) hidden by the ' + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'NSFWfilter', 'NSFW filter') + '.');
			if (numNsfwHidden && modules['filteReddit'].options.NSFWQuickToggle.value) notification.push('You can toggle the nsfw filter in the <span class="gearIcon"></span> menu.');

			notification.push("To hide this message, disable the " + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'notification', 'filteReddit notification') + '.');
			var notification = notification.join('<br><br>');
			modules['notifications'].showNotification({
				header: 'Posts Filtered',
				moduleID: 'filteReddit',
				message: notification
			});
		}
	},
	addedNSFWFilterStyle: false,
	addNSFWFilterStyle: function() {
		if (this.addedNSFWFilterStyle) return;
		this.addedNSFWFilterStyle = true;

		RESUtils.addCSS('body:not(.allowOver18) .over18 { display: none !important; }');
		RESUtils.addCSS('.thing.over18.allowOver18 { display: block !important; }');
	},
	filterNSFW: function(filterOn) {
		this.addNSFWFilterStyle();
		$(document.body).toggleClass('allowOver18');
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
	allowAllNSFW: null, // lazy loaded with boolean-y value
	subredditAllowNsfwOption: null, // lazy loaded with function to get a given subreddit's row in this.options.allowNSFW
	allowNSFW: function(postSubreddit, currSubreddit) {
		if (!this.options.allowNSFW.value || !this.options.allowNSFW.value.length) return false;

		if (typeof currSubreddit === "undefined") {
			currSubreddit = RESUtils.currentSubreddit();
		}

		if (!this.subredditAllowNsfwOption) {
			this.subredditAllowNsfwOption = RESUtils.indexOptionTable('filteReddit', 'allowNSFW', 0);
		}

		if (this.allowAllNsfw == null && currSubreddit) {
			var optionValue = this.subredditAllowNsfwOption(currSubreddit);
			this.allowAllNsfw = (optionValue && optionValue[1] === 'visit') || false;
		}
		if (this.allowAllNsfw) {
			return true;
		}

		if (!postSubreddit) postSubreddit = currSubreddit;
		if (!postSubreddit) return false;
		var optionValue = this.subredditAllowNsfwOption(postSubreddit);
		if (optionValue) {
			if (optionValue[1] === 'everywhere') {
				return true;
			} else { // optionValue[1] == visit (subreddit or multisubreddit)
				if (RESUtils.inList(postSubreddit, currSubreddit, '+')) {
					return true;
				}
			}
		}
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
		if (!obj) return false;
		stringToSearch = this.unescapeHTML(stringToSearch);
		var i = obj.length;
		while (i--) {
			if ((typeof obj[i] !== 'object') || (obj[i].length < 3)) {
				if (obj[i].length === 1) obj[i] = obj[i][0];
				obj[i] = [obj[i], 'everywhere', ''];
			}
			var searchString = obj[i][0];
			var applyTo = obj[i][1];
			var applyList = obj[i][2].toLowerCase().split(',');
			var skipCheck = false;
			// we also want to know if we should be matching /r/all, because when getting
			// listings on /r/all, each post has a subreddit (that does not equal "all")
			var checkRAll = ((RESUtils.currentSubreddit() === "all") && (applyList.indexOf("all") !== -1));
			switch (applyTo) {
				case 'exclude':
					if ((applyList.indexOf(reddit) !== -1) || (checkRAll)) {
						skipCheck = true;
					}
					break;
				case 'include':
					if ((applyList.indexOf(reddit) === -1) && (!checkRAll)) {
						skipCheck = true;
					}
					break;
			}
			// if fullmatch is defined, don't do a substring match... this is used for subreddit matching on /r/all for example
			if ((!skipCheck) && (fullmatch) && (obj[i] !== null) && (stringToSearch.toLowerCase() === searchString.toLowerCase())) return true;
			if ((!skipCheck) && (!fullmatch) && (obj[i] !== null) && (stringToSearch.indexOf(searchString.toString().toLowerCase()) !== -1)) {
				return true;
			}
		}
		return false;
	},
	toggleFilter: function(e) {
		var thisSubreddit = $(e.target).data('subreddit').toLowerCase();
		var filteredReddits = modules['filteReddit'].options.subreddits.value || [];
		var exists = false;
		for (var i = 0, len = filteredReddits.length; i < len; i++) {
			if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() === thisSubreddit)) {
				exists = true;
				filteredReddits.splice(i, 1);
				e.target.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
				e.target.textContent = '+filter';
				e.target.classList.remove('remove');
				break;
			}
		}
		if (!exists) {
			var thisObj = [thisSubreddit, 'everywhere', ''];
			filteredReddits.push(thisObj);
			e.target.setAttribute('title', 'Stop filtering this subreddit from /r/all and /domain/*');
			e.target.textContent = '-filter';
			e.target.classList.add('remove');
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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/.*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.newComments { display: inline; color: orangered; }');
			RESUtils.addCSS('.RESSubscriptionButton { display: inline-block; margin-left: 15px; padding: 1px 0; text-align: center; width: 78px; font-weight: bold; cursor: pointer; color: #369; border: 1px solid #b6b6b6; border-radius: 3px; }');
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
			if (RESUtils.pageType() === 'comments') {
				this.updateCommentCount();

				RESUtils.watchForElement('newCommentsForms', modules['newCommentCount'].updateCommentCountFromMyComment);
				RESUtils.watchForElement('newComments', modules['newCommentCount'].updateCommentCountFromMyComment);
				this.addSubscribeLink();
			} else if (RESUtils.currentSubreddit('dashboard')) {
				// If we're on the dashboard, add a tab to it...
				// add tab to dashboard
				modules['dashboard'].addTab('newCommentsContents', 'My Subscriptions');
				// populate the contents of the tab
				var showDiv = $('<div class="show">Show:</div>')
				var subscriptionFilter = $('<select id="subscriptionFilter"><option>subscribed threads</option><option>all threads</option></select>')
				$(showDiv).append(subscriptionFilter);
				$('#newCommentsContents').append(showDiv);
				$('#subscriptionFilter').change(function() {
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
					if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') !== -1)) {
						modules['newCommentCount'].processCommentCounts(event.target);
					}
				}, true);
				*/
			} else {
				this.processCommentCounts();
				RESUtils.watchForElement('siteTable', modules['newCommentCount'].processCommentCounts);
				/*
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') !== -1)) {
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
				thisCounts.sort(function(a, b) {
					return (a.subscriptionDate > b.subscriptionDate) ? 1 : (b.subscriptionDate > a.subscriptionDate) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			case 'updateTime':
				thisCounts.sort(function(a, b) {
					return (a.updateTime > b.updateTime) ? 1 : (b.updateTime > a.updateTime) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			case 'subreddit':
				thisCounts.sort(function(a, b) {
					return (a.subreddit > b.subreddit) ? 1 : (b.subreddit > a.subreddit) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
			default:
				thisCounts.sort(function(a, b) {
					return (a.title > b.title) ? 1 : (b.title > a.title) ? -1 : 0;
				});
				if (this.descending) thisCounts.reverse();
				break;
		}
		var rows = 0;
		for (var i in thisCounts) {
			if ((filterType === 'all threads') || ((filterType === 'subscribed threads') && (typeof thisCounts[i].subscriptionDate !== 'undefined'))) {
				var thisTitle = thisCounts[i].title;
				var thisURL = thisCounts[i].url;
				var thisUpdateTime = new Date(thisCounts[i].updateTime);
				// expire time is this.options.subscriptionLength.value days, so: 1000ms * 60s * 60m * 24hr = 86400000
				// then multiply by this.options.subscriptionLength.value
				var thisSubscriptionExpirationDate = (typeof thisCounts[i].subscriptionDate !== 'undefined') ? new Date(thisCounts[i].subscriptionDate + (86400000 * this.options.subscriptionLength.value)) : 0;
				if (thisSubscriptionExpirationDate > 0) {
					var thisExpiresContent = RESUtils.niceDateTime(thisSubscriptionExpirationDate);
					var thisRenewButton = '<span class="RESSubscriptionButton renew" title="renew subscription to this thread" data-threadid="' + thisCounts[i].id + '">renew</span>';
					var thisUnsubButton = '<span class="RESSubscriptionButton unsubscribe" title="unsubscribe from this thread" data-threadid="' + thisCounts[i].id + '">unsubscribe</span>';
					var thisActionContent = thisRenewButton + thisUnsubButton;

				} else {
					var thisExpiresContent = 'n/a';
					var thisActionContent = '<span class="RESSubscriptionButton subscribe" title="subscribe to this thread" data-threadid="' + thisCounts[i].id + '">subscribe</span>';
				}
				var thisSubreddit = '<a href="/r/' + thisCounts[i].subreddit + '">/r/' + thisCounts[i].subreddit + '</a>';
				var thisROW = $('<tr><td><a href="' + thisURL + '">' + thisTitle + '</a></td><td>' + thisSubreddit + '</td><td>' + RESUtils.niceDateTime(thisUpdateTime) + '</td><td>' + thisExpiresContent + '</td><td>' + thisActionContent + '</td></tr>');
				$(thisROW).find('.renew').click(modules['newCommentCount'].renewSubscriptionButton);
				$(thisROW).find('.unsubscribe').click(modules['newCommentCount'].unsubscribeButton);
				$(thisROW).find('.subscribe').click(modules['newCommentCount'].subscribeButton);
				$('#newCommentsTable tbody').append(thisROW);
				rows++;
			}
		}
		if (rows === 0) {
			if (filterType === 'subscribed threads') {
				$('#newCommentsTable tbody').append('<td colspan="5">You are currently not subscribed to any threads. To subscribe to a thread, click the "subscribe" button found near the top of the comments page.</td>');
			} else {
				$('#newCommentsTable tbody').append('<td colspan="5">No threads found</td>');
			}
		}
	},
	renewSubscriptionButton: function(e) {
		var thisURL = $(e.target).data('threadid');
		modules['newCommentCount'].renewSubscription(thisURL);
		modules['notifications'].showNotification({
			header: 'Subscription Notification',
			moduleID: 'newCommentCount',
			optionKey: 'subscriptionLength',
			message: 'Your subscription has been renewed - it will expire in ' + modules['newCommentCount'].options.subscriptionLength.value + ' days.'
		})
	},
	renewSubscription: function(threadid) {
		var now = Date.now();
		modules['newCommentCount'].commentCounts[threadid].subscriptionDate = now;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	unsubscribeButton: function(e) {
		var confirmunsub = window.confirm('Are you sure you want to unsubscribe?');
		if (confirmunsub) {
			var thisURL = $(e.target).data('threadid');
			modules['newCommentCount'].unsubscribe(thisURL);
		}
	},
	unsubscribe: function(threadid) {
		delete modules['newCommentCount'].commentCounts[threadid].subscriptionDate;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	subscribeButton: function(e) {
		var thisURL = $(e.target).data('threadid');
		modules['newCommentCount'].subscribe(thisURL);
	},
	subscribe: function(threadid) {
		var now = Date.now();
		modules['newCommentCount'].commentCounts[threadid].subscriptionDate = now;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		this.drawSubscriptionsTable();
	},
	processCommentCounts: function(ele) {
		var ele = ele || document.body;
		var lastClean = RESStorage.getItem('RESmodules.newCommentCount.lastClean');
		var now = Date.now();
		if (lastClean == null) {
			lastClean = now;
			RESStorage.setItem('RESmodules.newCommentCount.lastClean', now);
		}
		// Clean cache every six hours
		if ((now - lastClean) > 21600000) {
			modules['newCommentCount'].cleanCache();
		}
		var IDre = /\/r\/[\w]+\/comments\/([\w]+)\//i;
		var commentsLinks = ele.querySelectorAll('.sitetable.linklisting div.thing.link a.comments');
		for (var i = 0, len = commentsLinks.length; i < len; i++) {
			var href = commentsLinks[i].getAttribute('href');
			var thisCount = commentsLinks[i].innerHTML;
			var split = thisCount.split(' ');
			thisCount = split[0];
			var matches = IDre.exec(href);
			if (matches) {
				var thisID = matches[1];
				if ((typeof modules['newCommentCount'].commentCounts[thisID] !== 'undefined') && (modules['newCommentCount'].commentCounts[thisID] !== null)) {
					var diff = thisCount - modules['newCommentCount'].commentCounts[thisID].count;
					if (diff > 0) {
						var newString = $('<span class="newComments">&nbsp;(' + diff + ' new)</span>');
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
					if ((typeof thisModule.commentCounts[thisModule.currentCommentID] !== 'undefined') && (thisModule.commentCounts[thisModule.currentCommentID] !== null)) {
						var prevCommentCount = thisModule.commentCounts[thisModule.currentCommentID].count;
						var diff = thisModule.currentCommentCount - prevCommentCount;
						var newString = $('<span class="newComments">&nbsp;(' + diff + ' new)</span>');
						if (diff > 0) $(thisCount).append(newString);
					}
					if (isNaN(thisModule.currentCommentCount)) thisModule.currentCommentCount = 0;
					if (mycomment) thisModule.currentCommentCount++;
				}
			} else {
				thisModule.currentCommentCount++;
			}
		}
		var now = Date.now();
		if (typeof thisModule.commentCounts === 'undefined') {
			thisModule.commentCounts = {};
		}
		if (typeof thisModule.commentCounts[thisModule.currentCommentID] === 'undefined') {
			thisModule.commentCounts[thisModule.currentCommentID] = {};
		}
		thisModule.commentCounts[thisModule.currentCommentID].count = thisModule.currentCommentCount;
		thisModule.commentCounts[thisModule.currentCommentID].url = location.href.replace(location.hash, '');
		thisModule.commentCounts[thisModule.currentCommentID].title = document.title;
		thisModule.commentCounts[thisModule.currentCommentID].updateTime = now;
		// if (this.currentCommentCount) {
		// dumb, but because of Greasemonkey security restrictions we need a window.setTimeout here...
		window.setTimeout(function() {
			RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		}, 100);
		// }
	},
	cleanCache: function() {
		var now = Date.now();
		for (var i in this.commentCounts) {
			if ((this.commentCounts[i] !== null) && ((now - this.commentCounts[i].updateTime) > (86400000 * this.options.cleanComments.value))) {
				// this.commentCounts[i] = null;
				delete this.commentCounts[i];
			} else if (this.commentCounts[i] == null) {
				delete this.commentCounts[i];
			}
		}
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(this.commentCounts));
		RESStorage.setItem('RESmodules.newCommentCount.lastClean', now);
	},
	addSubscribeLink: function() {
		var commentCount = document.body.querySelector('.commentarea .panestack-title');
		if (commentCount) {
			this.commentSubToggle = RESUtils.createElementWithID('span', 'REScommentSubToggle', 'RESSubscriptionButton');
			this.commentSubToggle.addEventListener('click', modules['newCommentCount'].toggleSubscription, false);
			commentCount.appendChild(this.commentSubToggle);
			if (typeof this.commentCounts[this.currentCommentID].subscriptionDate !== 'undefined') {
				this.commentSubToggle.textContent = 'unsubscribe';
				this.commentSubToggle.setAttribute('title', 'unsubscribe from thread');
				this.commentSubToggle.classList.add('unsubscribe');
			} else {
				this.commentSubToggle.textContent = 'subscribe';
				this.commentSubToggle.setAttribute('title', 'subscribe to this thread to be notified when new comments are posted');
				this.commentSubToggle.classList.remove('unsubscribe');
			}
		}
	},
	toggleSubscription: function() {
		var commentID = modules['newCommentCount'].currentCommentID;
		if (typeof modules['newCommentCount'].commentCounts[commentID].subscriptionDate !== 'undefined') {
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
		modules['newCommentCount'].commentSubToggle.setAttribute('title', 'unsubscribe from thread');
		modules['newCommentCount'].commentSubToggle.classList.add('unsubscribe');
		commentID = commentID || modules['newCommentCount'].currentCommentID;
		var now = Date.now();
		modules['newCommentCount'].commentCounts[commentID].subscriptionDate = now;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		modules['notifications'].showNotification({
			header: 'Subscription Notification',
			moduleID: 'newCommentCount',
			optionKey: 'subscriptionLength',
			message: 'You are now subscribed to this thread for ' + modules['newCommentCount'].options.subscriptionLength.value + ' days. You will be notified if new comments are posted since your last visit.' + '<br><br><a href="/r/Dashboard#newCommentsContents" target="_blank">Visit your Dashboard</a> to see all your thread subscriptions.'
		}, 3000);
	},
	unsubscribeFromThread: function(commentID) {
		modules['newCommentCount'].getLatestCommentCounts();
		modules['newCommentCount'].commentSubToggle.textContent = 'subscribe';
		modules['newCommentCount'].commentSubToggle.setAttribute('title', 'subscribe to this thread and be notified when new comments are posted');
		modules['newCommentCount'].commentSubToggle.classList.remove('unsubscribe');
		commentID = commentID || modules['newCommentCount'].currentCommentID;
		var now = Date.now();
		delete modules['newCommentCount'].commentCounts[commentID].subscriptionDate;
		RESStorage.setItem('RESmodules.newCommentCount.counts', JSON.stringify(modules['newCommentCount'].commentCounts));
		modules['notifications'].showNotification({
			header: 'Subscription Notification',
			moduleID: 'newCommentCount',
			message: 'You are now unsubscribed from this thread.'
		}, 3000);
	},
	checkSubscriptions: function() {
		if (this.commentCounts) {
			var threadsToCheck = [];
			for (var i in this.commentCounts) {
				var thisSubscription = this.commentCounts[i];
				if ((thisSubscription) && (typeof thisSubscription.subscriptionDate !== 'undefined')) {
					var lastCheck = parseInt(thisSubscription.lastCheck, 10) || 0;
					var subscriptionDate = parseInt(thisSubscription.subscriptionDate, 10);
					// If it's been subscriptionLength days since we've subscribed, we're going to delete this subscription...
					var now = Date.now();
					if ((now - subscriptionDate) > (this.options.subscriptionLength.value * 86400000)) {
						delete this.commentCounts[i].subscriptionDate;
					}
					// if we haven't checked this subscription in 5 minutes, try it again...
					if ((now - lastCheck) > 300000) {
						thisSubscription.lastCheck = now;
						this.commentCounts[i] = thisSubscription;
						// this.checkThread(i);
						threadsToCheck.push('t3_' + i);
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
			method: "GET",
			url: location.protocol + '//' + location.hostname + '/by_id/' + commentIDs.join(',') + '.json?app=res',
			onload: function(response) {
				var now = Date.now();
				var commentInfo = JSON.parse(response.responseText);
				if (typeof commentInfo.data !== 'undefined') {
					for (var i = 0, len = commentInfo.data.children.length; i < len; i++) {
						var commentID = commentInfo.data.children[i].data.id;
						var subObj = modules['newCommentCount'].commentCounts[commentID];
						if (subObj.count < commentInfo.data.children[i].data.num_comments) {
							modules['newCommentCount'].commentCounts[commentID].count = commentInfo.data.children[i].data.num_comments;
							modules['notifications'].showNotification({
								header: 'Subscription Notification',
								moduleID: 'newComments',
								message: '<p>New comments posted to thread:</p> <a href="' + subObj.url + '">' + subObj.title + '</a> <p><a class="RESNotificationButtonBlue" href="' + subObj.url + '">view the submission</a></p><div class="clear"></div>'
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
	options: {},
	description: 'Adds a Spam button to posts for easy reporting.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// check if the spam button was on by default from an old install of RES.  Per Reddit Admin request, this is being
			// disabled by default due to excess misuse, but people who want to purposefully re-enable it may do so.
			var reset = RESStorage.getItem('RESmodules.spamButton.reset');
			if (!reset) {
				RESStorage.setItem('RESmodules.spamButton.reset', 'true');
				RESConsole.enableModule('spamButton', false);
			}

			// credit to tico24 for the idea, here: http://userscripts.org/scripts/review/84454
			// code adapted for efficiency...
			if (RESUtils.loggedInUser() !== RESUtils.currentUserProfile()) {
				RESUtils.watchForElement('siteTable', modules['spamButton'].addSpamButtons);
				this.addSpamButtons();
			}
		}
	},
	addSpamButtons: function(ele) {
		if (ele == null) ele = document;
		if ((RESUtils.pageType() === 'linklist') || (RESUtils.pageType() === 'comments') || (RESUtils.pageType() === 'profile')) {
			var allLists = ele.querySelectorAll('.thing:not(.deleted):not(.morerecursion):not(.morechildren) > .entry .buttons');
			for (var i = 0, len = allLists.length; i < len; i++) {
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
				a.textContent = 'rts';
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
		a.setAttribute('href', 'http://www.reddit.com/r/reportthespammers/submit?url=' + href + '&title=overview for ' + authorName);
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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#REScommentNavBox { position: fixed; z-index: 999; right: 10px; top: 46px; width: 265px; border: 1px solid gray; background-color: #fff; opacity: 0.3; padding: 3px; user-select: none; -webkit-user-select: none; -moz-user-select: none; -webkit-transition:opacity 0.5s ease-in; -moz-transition:opacity 0.5s ease-in; -o-transition:opacity 0.5s ease-in; -ms-transition:opacity 0.5s ease-in; -transition:opacity 0.5s ease-in; }');
			RESUtils.addCSS('#REScommentNavBox:hover { opacity: 1 }');
			RESUtils.addCSS('#REScommentNavToggle { float: left; display: inline; margin-left: 0; width: 100%; }');
			RESUtils.addCSS('.commentarea .menuarea { margin-right: 0; }');
			RESUtils.addCSS('.menuarea > .spacer { margin-right: 0; }');
			RESUtils.addCSS('#commentNavButtons { margin: auto; }');
			RESUtils.addCSS('#commentNavUp { margin: auto; cursor: pointer; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 32px; height: 20px; background-position: 0 -224px; }');
			RESUtils.addCSS('#commentNavDown { margin: auto; cursor: pointer; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 32px; height: 20px; background-position: 0 -244px; }');
			RESUtils.addCSS('#commentNavUp.noNav { background-position: 0 -264px; }');
			RESUtils.addCSS('#commentNavDown.noNav { background-position: 0 -284px; }');
			RESUtils.addCSS('#commentNavButtons { display: none; margin-left: 12px; text-align: center; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.commentNavSortType { cursor: pointer; font-weight: bold; float: left; margin-left: 6px; }');
			RESUtils.addCSS('#commentNavPostCount { color: #1278d3; }');
			RESUtils.addCSS('.noNav #commentNavPostCount { color: #ddd; }');
			RESUtils.addCSS('.commentNavSortTypeDisabled { color: #ddd; }');
			RESUtils.addCSS('.commentNavSortType:hover { text-decoration: underline; }');
			RESUtils.addCSS('#REScommentNavToggle span { float: left; margin-left: 6px; }');
			RESUtils.addCSS('.menuarea > .spacer { float: left; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// draw the commentNav box
			this.commentNavBox = RESUtils.createElementWithID('div', 'REScommentNavBox');
			this.commentNavBox.classList.add('RESDialogSmall');
			// var commentArea = document.body.querySelector('div.sitetable.nestedlisting');
			var commentArea = document.body.querySelector('.commentarea .menuarea');
			if (commentArea) {
				this.commentNavToggle = RESUtils.createElementWithID('div', 'REScommentNavToggle');
				$(this.commentNavToggle).html('<span>navigate by:</span>');
				var sortTypes = ['submitter', 'moderator', 'friend', 'me', 'admin', 'IAmA', 'images', 'popular', 'new'];
				for (var i = 0, len = sortTypes.length; i < len; i++) {
					var thisCategory = sortTypes[i];
					// var thisEle = document.createElement('div');
					var thisEle = RESUtils.createElementWithID('div', 'navigateBy' + thisCategory);
					switch (thisCategory) {
						case 'submitter':
							thisEle.setAttribute('title', 'Navigate comments made by the post submitter');
							break;
						case 'moderator':
							thisEle.setAttribute('title', 'Navigate comments made by moderators');
							break;
						case 'friend':
							thisEle.setAttribute('title', 'Navigate comments made by users on your friends list');
							break;
						case 'me':
							thisEle.setAttribute('title', 'Navigate comments made by you');
							break;
						case 'admin':
							thisEle.setAttribute('title', 'Navigate comments made by reddit admins');
							break;
						case 'IAmA':
							thisEle.setAttribute('title', 'Navigate through questions that have been answered by the submitter (most useful in /r/IAmA)');
							break;
						case 'images':
							thisEle.setAttribute('title', 'Navigate through comments with images');
							break;
						case 'popular':
							thisEle.setAttribute('title', 'Navigate through comments in order of highest vote total');
							break;
						case 'new':
							thisEle.setAttribute('title', 'Navigate through new comments (Reddit Gold users only)');
							break;
						default:
							break;
					}
					thisEle.setAttribute('index', i + 1);
					thisEle.classList.add('commentNavSortType');
					thisEle.textContent = thisCategory;
					if (thisCategory === 'new') {
						var isGold = document.body.querySelector('.gold-accent.comment-visits-box');
						if (isGold) {
							thisEle.setAttribute('style', 'color: #9A7D2E;');
						} else {
							thisEle.classList.add('commentNavSortTypeDisabled');
						}
					}
					if ((thisCategory !== 'new') || (isGold)) {
						thisEle.addEventListener('click', function(e) {
							modules['commentNavigator'].showNavigator(e.target.getAttribute('index'));
						}, false);
					}
					this.commentNavToggle.appendChild(thisEle);
					if (i < len - 1) {
						var thisDivider = document.createElement('span');
						thisDivider.textContent = '|';
						this.commentNavToggle.appendChild(thisDivider);
					}
				}

				// commentArea.insertBefore(this.commentNavToggle,commentArea.firstChild);
				commentArea.appendChild(this.commentNavToggle, commentArea.firstChild);
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
				this.commentNavCloseButton.addEventListener('click', function(e) {
					modules['commentNavigator'].commentNavBox.style.display = 'none';
				}, false);
				this.commentNavUp = this.commentNavBox.querySelector('#commentNavUp');
				this.commentNavUp.addEventListener('click', modules['commentNavigator'].moveUp, false);
				this.commentNavDown = this.commentNavBox.querySelector('#commentNavDown');
				this.commentNavDown.addEventListener('click', modules['commentNavigator'].moveDown, false);
				this.navSelect.addEventListener('change', modules['commentNavigator'].changeCategory, false);
				document.body.appendChild(this.commentNavBox);
			}
		}
	},
	changeCategory: function() {
		var index = modules['commentNavigator'].navSelect.selectedIndex;
		modules['commentNavigator'].currentCategory = modules['commentNavigator'].navSelect.options[index].value;
		if (modules['commentNavigator'].currentCategory !== '') {
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
	getPostsByCategory: function() {
		var category = modules['commentNavigator'].currentCategory;
		if ((typeof category !== 'undefined') && (category !== '')) {
			if (typeof this.posts[category] === 'undefined') {
				switch (category) {
					case 'submitter':
					case 'moderator':
					case 'friend':
					case 'admin':
						this.posts[category] = document.querySelectorAll('.noncollapsed a.author.' + category);
						this.resetNavigator(category);
						break;
					case 'me':
						RESUtils.getUserInfo(function(userInfo) {
							var myID = 't2_' + userInfo.data.id;
							modules['commentNavigator'].posts[category] = document.querySelectorAll('.noncollapsed a.author.id-' + myID);
							modules['commentNavigator'].resetNavigator(category);
						});
						break;
					case 'IAmA':
						var submitterPosts = document.querySelectorAll('.noncollapsed a.author.submitter');
						this.posts[category] = [];
						for (var i = 0, len = submitterPosts.length; i < len; i++) {
							// go seven parents up to get the proper parent post...
							var sevenUp = submitterPosts[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
							if (sevenUp.parentNode.nodeName === 'BODY') {
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
						for (var i = 0, len = allComments.length; i < len; i++) {
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
							return parseInt(b.score, 10) - parseInt(a.score, 10);
						});
						this.posts[category] = [];
						for (var i = 0, len = commentsObj.length; i < len; i++) {
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
			modules['commentNavigator'].commentNavUp.classList.remove('noNav');
			modules['commentNavigator'].commentNavDown.classList.remove('noNav');
			modules['commentNavigator'].commentNavButtons.classList.remove('noNav');
		} else {
			modules['commentNavigator'].commentNavPostCount.textContent = 'none';
			modules['commentNavigator'].commentNavUp.classList.add('noNav');
			modules['commentNavigator'].commentNavDown.classList.add('noNav');
			modules['commentNavigator'].commentNavButtons.classList.add('noNav');
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
		$(modules['commentNavigator'].commentNavPostCount).text(modules['commentNavigator'].nav[category] + 1 + '/' + modules['commentNavigator'].posts[category].length);
		var thisXY = RESUtils.getXYpos(modules['commentNavigator'].posts[category][modules['commentNavigator'].nav[category]]);
		RESUtils.scrollTo(0, thisXY.y);
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
	include: [
		/^http:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
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
		if ((typeof this.profileCache[username] !== 'undefined') && (this.profileCache[username] !== null)) {
			lastCheck = this.profileCache[username].lastCheck;
		}
		var now = Date.now();
		if ((now - lastCheck) > 900000) {
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
					var now = Date.now();
					profileData.lastCheck = now;
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
		if (typeof profileObject !== 'undefined') {
			var firstSpacer = document.querySelector('div.side > div.spacer');
			var newSpacer = document.createElement('div');
			var profileHTML = '<div class="sidecontentbox profile-area"><a class="helplink" target="_blank" href="http://redditgifts.com">what\'s this?</a><h1>PROFILE</h1><div class="content">';
			var profileBody = '';
			if (typeof profileObject.body !== 'undefined') {
				profileBody += '<h3><a target="_blank" href="http://redditgifts.com/profiles/view/'+username+'">RedditGifts Profile:</a></h3>';
				profileBody += '<div class="redditGiftsProfileField">'+profileObject.body+'</div>';
			}
			if (typeof profileObject.description !== 'undefined') {
				profileBody += '<h3>Description:</h3>';
				profileBody += '<div class="redditGiftsProfileField">'+profileObject.description+'</div>';
			}
			if (typeof profileObject.photo !== 'undefined') {
				profileBody += '<h3>Photo:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="'+profileObject.photo.url+'"><img src="'+profileObject.photo_small.url+'" /></a></div>';
			}
			if (typeof profileObject.twitter_username !== 'undefined') {
				profileBody += '<h3>Twitter:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="http://twitter.com/'+profileObject.twitter_username+'">@'+profileObject.twitter_username+'</a></div>';
			}
			if (typeof profileObject.website !== 'undefined') {
				profileBody += '<h3>Website:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="'+profileObject.website+'">[link]</a></div>';
			}
			if (typeof profileObject.trophies !== 'undefined') {
				profileBody += '<h3>RedditGifts Trophies:</h3>';
				var count=1;
				var len=profileObject.trophies.length;
				for (var i in profileObject.trophies) {
					var rowNum = parseInt(count/2, 10);
					if (count===1) {
						profileBody += '<table class="trophy-table"><tbody>';
					}
					// console.log('count: ' + count + ' -- mod: ' + (count%2) + ' len: ' + len);
					// console.log('countmod: ' + ((count%2) === 0));
					if ((count%2) === 1) {
						profileBody += '<tr>';
					}
					if ((count===len) && ((count%2) === 1)) {
						profileBody += '<td class="trophy-info" colspan="2">';
					} else {
						profileBody += '<td class="trophy-info">';
					}
					profileBody += '<div><img src="'+profileObject.trophies[i].url+'" alt="'+profileObject.trophies[i].title+'" title="'+profileObject.trophies[i].title+'"><br><span class="trophy-name">'+profileObject.trophies[i].title+'</span></div>';
					profileBody += '</td>';
					if (((count%2) === 0) || (count===len)) {
						profileBody += '</tr>';
					}
					count++;
				}
				if (count) {
					profileBody += '</tbody></table>';
				}
			}
			if (profileBody === '') {
				profileBody = 'User has not filled out a profile on <a target="_blank" href="http://redditgifts.com">RedditGifts</a>.';
			}
			profileHTML += profileBody + '</div></div>';
			$(newSpacer).html(profileHTML);
			addClass(newSpacer,'spacer');
			RESUtils.insertAfter(firstSpacer,newSpacer);
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
		linkMyRandom: {
			type: 'boolean',
			value: true,
			description: 'Show "MYRANDOM" link in subreddit manager (reddit gold only)'
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
		/*		sortingField: {
			type: 'enum',
			values: [
				{ name: 'Subreddit Name', value: 'displayName' },
				{ name: 'Added date', value: 'addedDate' }
			],
			value : 'displayName',
			description: 'Field to sort subreddit shortcuts by'
		},
		sortingDirection: {
			type: 'enum',
			values: [
				{ name: 'Ascending', value: 'asc' },
				{ name: 'Descending', value: 'desc' }
			],
			value : 'asc',
			description: 'Field to sort subreddit shortcuts by'
		}
*/
	},
	description: 'Allows you to customize the top bar with your own subreddit shortcuts, including dropdown menus of multi-reddits and more.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/.*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.srOver { outline: 1px dashed black; }');
			RESUtils.addCSS('body { overflow-x: hidden; }');
			RESUtils.addCSS('#sr-header-area a { font-size: 100% !important; }');
			RESUtils.addCSS('#srList { position: absolute; top: 18px; left: 0; z-index: 9999; display: none; border: 1px solid black; background-color: #FAFAFA; width: auto; overflow-y: auto; }');
			RESUtils.addCSS('#srList tr { border-bottom: 1px solid gray; }');
			RESUtils.addCSS('#srList thead td { cursor: pointer; }');
			RESUtils.addCSS('#srList td { padding: 3px 8px; }');
			RESUtils.addCSS('#srList td.RESvisited, #srList td.RESshortcut { text-transform: none; }');
			RESUtils.addCSS('#srList td.RESshortcut {cursor: pointer;}');
			RESUtils.addCSS('#srList td a { width: 100%; display: block; }');
			RESUtils.addCSS('#srList tr:hover { background-color: #eef; }');
			RESUtils.addCSS('#srLeftContainer, #RESStaticShortcuts, #RESShortcuts, #srDropdown { display: inline; float: left; position: relative; z-index: 5; }');
			RESUtils.addCSS('#editShortcutDialog { display: none; z-index: 999; position: absolute; top: 25px; left: 5px; width: 230px; padding: 10px; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px; font-size: 12px; color: #000; }');
			RESUtils.addCSS('#editShortcutDialog h3 { display: inline-block; float: left; font-size: 13px; margin-top: 6px; }');
			RESUtils.addCSS('#editShortcutClose { float: right; margin-top: 2px; margin-right: 0; }');
			RESUtils.addCSS('#editShortcutDialog label { clear: both; float: left; width: 100px; margin-top: 12px; }');
			RESUtils.addCSS('#editShortcutDialog input { float: left; width: 126px; margin-top: 10px; }');
			RESUtils.addCSS('#editShortcutDialog input[type=button] { float: right; width: 45px; margin-left: 10px; cursor: pointer; padding: 3px 5px; font-size: 12px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; }');
			RESUtils.addCSS('#srLeftContainer { z-index: 4; padding-left: 4px; margin-right: 6px; }'); // RESUtils.addCSS('#RESShortcuts { position: absolute; left: '+ this.srLeftContainerWidth+'px;  z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; margin-top: -2px; padding-top: 2px; }');
			RESUtils.addCSS('#srLeftContainer { z-index: 4; padding-left: 4px; margin-right: 6px; }');
			RESUtils.addCSS('#RESShortcutsViewport { width: auto; max-height: 20px; overflow: hidden; } ');
			RESUtils.addCSS('#RESShortcuts { z-index: 6; white-space: nowrap; overflow-x: hidden; padding-left: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown { display: none; position: absolute; z-index: 99999; padding: 3px; background-color: #F0F0F0; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown li { padding-left: 3px; padding-right: 3px; margin-bottom: 2px; }');
			RESUtils.addCSS('#RESSubredditGroupDropdown li:hover { background-color: #F0F0FC; }');

			RESUtils.addCSS('#RESShortcutsEditContainer { width: 69px; position: absolute; right: 0; top: 0; z-index: 999; background-color: #f0f0f0; height: 16px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('#RESShortcutsRight { right: 0; }');
			RESUtils.addCSS('#RESShortcutsAdd { right: 15px; }');
			RESUtils.addCSS('#RESShortcutsLeft { right: 31px; }');
			RESUtils.addCSS('#RESShortcutsSort { right: 47px; }');

			RESUtils.addCSS('#RESShortcutsSort, #RESShortcutsRight, #RESShortcutsLeft, #RESShortcutsAdd, #RESShortcutsTrash {  width: 16px; cursor: pointer; background: #F0F0F0; font-size: 20px; color: #369; height: 18px; line-height: 15px; position: absolute; top: 0; z-index: 999; background-color: #f0f0f0; user-select: none; -webkit-user-select: none; -moz-user-select: none;  } ');
			RESUtils.addCSS('#RESShortcutsSort { font-size: 14px; }')
			RESUtils.addCSS('#RESShortcutsTrash { display: none; font-size: 17px; width: 16px; cursor: pointer; right: 15px; height: 16px; position: absolute; top: 0; z-index: 1000; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.srSep { margin-left: 6px; }');
			RESUtils.addCSS('.RESshortcutside { margin-right: 5px; margin-top: 2px; color: white; background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444; padding: 1px 6px; border-radius: 3px 3px 3px 3px; }');
			RESUtils.addCSS('.RESshortcutside.remove { background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-remove.png) }');
			RESUtils.addCSS('.RESshortcutside:hover { background-color: #f0f0ff; }');
			// RESUtils.addCSS('h1.redditname > a { float: left; }');
			RESUtils.addCSS('h1.redditname { overflow: auto; }');
			RESUtils.addCSS('.sortAsc, .sortDesc { float: right; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 12px; height: 12px; background-repeat: no-repeat; }');
			RESUtils.addCSS('.sortAsc { background-position: 0 -149px; }');
			RESUtils.addCSS('.sortDesc { background-position: -12px -149px; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer { display: none; position: absolute; width: 290px; padding: 2px; right: 0; top: 21px; z-index: 10000; background-color: #f0f3fc; border: 1px solid #c7c7c7; border-radius: 3px; font-size: 12px; color: #000; }');
			RESUtils.addCSS('#RESShortcutsAddFormContainer  a { font-weight: bold; }');
			RESUtils.addCSS('#newShortcut { width: 130px; }');
			RESUtils.addCSS('#displayName { width: 130px; }');
			RESUtils.addCSS('#shortCutsAddForm { padding: 5px; }');
			RESUtils.addCSS('#shortCutsAddForm div { font-size: 10px; margin-bottom: 10px; }');
			RESUtils.addCSS('#shortCutsAddForm label { display: inline-block; width: 100px; }');
			RESUtils.addCSS('#shortCutsAddForm input[type=text] { width: 170px; margin-bottom: 6px; }');
			RESUtils.addCSS('#addSubreddit { float: right; cursor: pointer; padding: 3px 5px; font-size: 12px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; }');
			RESUtils.addCSS('.RESShortcutsCurrentSub { color:orangered!important; font-weight:bold; }');
			RESUtils.addCSS('.RESShortcutsCurrentSub:visited { color:orangered!important; font-weight:bold; }');
			RESUtils.addCSS('#srLeftContainer, #RESShortcutsViewport, #RESShortcutsEditContainer{max-height:18px;}');

			// this shows the sr-header-area that we hid while rendering it (to curb opera's glitchy "jumping")...
			if (BrowserDetect.isOpera()) {
				RESUtils.addCSS('#sr-header-area { display: block !important; }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if (this.options.linkMyRandom.value) {
				var originalMyRandom = document.querySelector('#sr-header-area a[href$="/r/myrandom/"]')
				if (originalMyRandom) {
					this.myRandomEnabled = true;
					if (originalMyRandom.classList.contains('gold')) {
						this.myRandomGold = true;
					}
				}
			}

			this.manageSubreddits();
			if (RESUtils.currentSubreddit() !== null) {
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
			for (var h = 0, len = subButtons.length; h < len; h++) {
				var subButton = subButtons[h];
				if ((RESUtils.currentSubreddit().indexOf('+') === -1) && (RESUtils.currentSubreddit() !== 'mod')) {
					var thisSubredditFragment = RESUtils.currentSubreddit();
					var isMulti = false;
				} else if ($(subButton).parent().hasClass('subButtons')) {
					var isMulti = true;
					var thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
				} else {
					var isMulti = true;
					var thisSubredditFragment = $(subButton).next().text();
				}
				if ($('#subButtons-' + thisSubredditFragment).length === 0) {
					var subButtonsWrapper = $('<div id="subButtons-' + thisSubredditFragment + '" class="subButtons" style="margin: 0 !important; top: 0 !important; z-index: 1 !important;"></div>');
					$(subButton).wrap(subButtonsWrapper);
					// move this wrapper to the end (after any icons that may exist...)
					if (isMulti) {
						var theWrap = $(subButton).parent();
						$(theWrap).appendTo($(theWrap).parent());
					}
				}
				subButton.addEventListener('click', function() {
					// reset the last checked time for the subreddit list so that we refresh it anew no matter what.
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser(), 0);
				}, false);
				var theSC = document.createElement('span');
				theSC.setAttribute('style', 'display: inline-block !important;');
				theSC.setAttribute('class', 'RESshortcut RESshortcutside');
				theSC.setAttribute('data-subreddit', thisSubredditFragment);
				var idx = -1;
				for (var i = 0, sublen = modules['subredditManager'].mySubredditShortcuts.length; i < sublen; i++) {
					if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() === thisSubredditFragment.toLowerCase()) {
						idx = i;
						break;
					}
				}
				if (idx !== -1) {
					theSC.textContent = '-shortcut';
					theSC.setAttribute('title', 'Remove this subreddit from your shortcut bar');
					theSC.classList.add('remove');
				} else {
					theSC.textContent = '+shortcut';
					theSC.setAttribute('title', 'Add this subreddit to your shortcut bar');
				}
				theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);
				// subButton.parentNode.insertBefore(theSC, subButton);
				// theSubredditLink.appendChild(theSC);
				$('#subButtons-' + thisSubredditFragment).append(theSC);
				var next = $('#subButtons-' + thisSubredditFragment).next();
				if ($(next).hasClass('title') && (!$('#subButtons-' + thisSubredditFragment).hasClass('swapped'))) {
					$('#subButtons-' + thisSubredditFragment).before($(next));
					$('#subButtons-' + thisSubredditFragment).addClass('swapped');
				}
			}
		}

		// If we're on the reddit-browsing page (/reddits or /subreddits), add +shortcut and -shortcut buttons...
		if (/^https?:\/\/www\.reddit\.com\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.href)) {
			this.browsingReddits();
		}
	},
	browsingReddits: function() {
		$('.subreddit').each(function() {
			// Skip subreddit links that already have a shortcut button
			if (typeof $(this).data('hasShortcutButton') !== 'undefined' && $(this).data('hasShortcutButton')) {
				return;
			}

			// Otherwise, indicate that this link now has a shortcut button
			$(this).data('hasShortcutButton', true);

			var subreddit = $(this).find('a.title').attr('href').match(/^https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w]+).*/i)[1],
				$theSC = $('<span>')
					.css({
						display: 'inline-block',
						'margin-right': '0'
					})
					.addClass('RESshortcut RESshortcutside')
					.data('subreddit', subreddit),
				isShortcut = false;

			for (var j = 0, shortcutsLength = modules['subredditManager'].mySubredditShortcuts.length; j < shortcutsLength; j++) {
				if (modules['subredditManager'].mySubredditShortcuts[j].subreddit === subreddit) {
					isShortcut = true;
					break;
				}
			}

			if (isShortcut) {
				$theSC
					.attr('title', 'Remove this subreddit from your shortcut bar')
					.text('-shortcut')
					.addClass('remove');
			} else {
				$theSC
					.attr('title', 'Add this subreddit to your shortcut bar')
					.text('+shortcut')
					.removeClass('remove');
			}

			$theSC
				.on('click', modules['subredditManager'].toggleSubredditShortcut)
				.appendTo($(this).find('.midcol'));
		});
	},
	redrawShortcuts: function() {
		this.shortCutsContainer.textContent = '';
		// Try Refresh subreddit shortcuts
		if (this.mySubredditShortcuts.length === 0) {
			this.getLatestShortcuts();
		}
		if (this.mySubredditShortcuts.length > 0) {
			// go through the list of shortcuts and print them out...
			for (var i = 0, len = this.mySubredditShortcuts.length; i < len; i++) {
				if (typeof this.mySubredditShortcuts[i] === 'string') {
					this.mySubredditShortcuts[i] = {
						subreddit: this.mySubredditShortcuts[i],
						displayName: this.mySubredditShortcuts[i],
						addedDate: Date.now()
					}
				}

				var thisShortCut = document.createElement('a');
				thisShortCut.setAttribute('draggable', 'true');
				thisShortCut.setAttribute('orderIndex', i);
				thisShortCut.setAttribute('data-subreddit', this.mySubredditShortcuts[i].subreddit);
				thisShortCut.classList.add('subbarlink');

				if ((RESUtils.currentSubreddit() !== null) && (RESUtils.currentSubreddit().toLowerCase() === this.mySubredditShortcuts[i].subreddit.toLowerCase())) {
					thisShortCut.classList.add('RESShortcutsCurrentSub');
				}

				thisShortCut.setAttribute('href', '/r/' + this.mySubredditShortcuts[i].subreddit);
				thisShortCut.textContent = this.mySubredditShortcuts[i].displayName;
				thisShortCut.addEventListener('click', function(e) {
					if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey) {
						// open in new tab, let the browser handle it
						return true;
					} else {
						e.preventDefault();
						// use to open links in new tabs... work on this later...
						modules['subredditManager'].clickedShortcut = e.target.getAttribute('href');
						if (typeof modules['subredditManager'].clickTimer === 'undefined') {
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
					if ((typeof e.target.getAttribute !== 'undefined') && (e.target.getAttribute('href').indexOf('+') !== -1)) {
						var subreddits = e.target.getAttribute('href').replace('/r/', '').split('+');
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

				if (i < len - 1) {
					var sep = document.createElement('span');
					sep.setAttribute('class', 'separator');
					sep.textContent = '-';
					this.shortCutsContainer.appendChild(sep);
				}
			}
			if (this.mySubredditShortcuts.length === 0) {
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
	},
	showSubredditGroupDropdown: function(subreddits, obj) {
		if (typeof this.subredditGroupDropdown === 'undefined') {
			this.subredditGroupDropdown = RESUtils.createElementWithID('div', 'RESSubredditGroupDropdown');
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

			for (var i = 0, len = subreddits.length; i < len; i++) {
				var thisLI = $('<li><a href="/r/' + subreddits[i] + '">' + subreddits[i] + '</a></li>');
				$(this.subredditGroupDropdownUL).append(thisLI);
			}

			var thisXY = RESUtils.getXYpos(obj);
			this.subredditGroupDropdown.style.top = (thisXY.y + 16) + 'px';
			// if fixed, override y to just be the height of the subreddit bar...
			// this.subredditGroupDropdown.style.position = 'fixed';
			// this.subredditGroupDropdown.style.top = '20px';
			this.subredditGroupDropdown.style.left = thisXY.x + 'px';
			this.subredditGroupDropdown.style.display = 'block';

			modules['styleTweaks'].setSRStyleToggleVisibility(false, "subredditGroupDropdown");
		}
	},
	hideSubredditGroupDropdown: function() {
		delete modules['subredditManager'].hideSubredditGroupDropdownTimer;
		if (this.subredditGroupDropdown) {
			this.subredditGroupDropdown.style.display = 'none';
			modules['styleTweaks'].setSRStyleToggleVisibility(true, "subredditGroupDropdown")
		}
	},
	editSubredditShortcut: function(ele) {
		var subreddit = ele.getAttribute('href').slice(3);

		var idx;
		for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit == subreddit) {
				idx = i;
				break;
			}
		}

		if (typeof this.editShortcutDialog === 'undefined') {
			this.editShortcutDialog = RESUtils.createElementWithID('div', 'editShortcutDialog');
			document.body.appendChild(this.editShortcutDialog);
		}

		var thisForm = '<form name="editSubredditShortcut"> \
		                    <h3>Edit Shortcut</h3> \
		                    <div id="editShortcutClose" class="RESCloseButton">&times;</div> \
		                    <label for="subreddit">Subreddit:</label> \
		                    <input type="text" name="subreddit" value="' + subreddit + '" id="shortcut-subreddit"> \
		                    <br> \
		                    <label for="displayName">Display Name:</label> \
		                    <input type="text" name="displayName" value="' + ele.textContent + '" id="shortcut-displayname"> \
		                    <input type="hidden" name="idx" value="' + idx + '"> \
		                    <input type="button" name="shortcut-save" value="save" id="shortcut-save"> \
						</form>';
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

			if ((subreddit === '') || (displayName === '')) {
				// modules['subredditManager'].mySubredditShortcuts.splice(idx,1);
				subreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
				modules['subredditManager'].removeSubredditShortcut(subreddit);
			} else {
				if (RESUtils.proEnabled()) {
					// store a delete for the old subreddit, and an add for the new.
					var oldsubreddit = modules['subredditManager'].mySubredditShortcuts[idx].subreddit;
					if (typeof modules['subredditManager'].RESPro === 'undefined') {
						if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()) !== null) {
							var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
						} else {
							var temp = {
								add: {},
								del: {}
							};
						}
						modules['subredditManager'].RESPro = temp;
					}
					if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
						modules['subredditManager'].RESPro.add = {}
					}
					if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
						modules['subredditManager'].RESPro.del = {}
					}
					// add modules['subredditManager'] new subreddit next time we sync...
					modules['subredditManager'].RESPro.add[subreddit] = true;
					// delete the old one
					modules['subredditManager'].RESPro.del[oldsubreddit] = true;
					// make sure we don't run an add on the old subreddit next time we sync...
					if (typeof modules['subredditManager'].RESPro.add[oldsubreddit] !== 'undefined') delete modules['subredditManager'].RESPro.add[oldsubreddit];
					// make sure we don't run a delete on the new subreddit next time we sync...
					if (typeof modules['subredditManager'].RESPro.del[subreddit] !== 'undefined') delete modules['subredditManager'].RESPro.del[subreddit];
					RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
				}
				modules['subredditManager'].mySubredditShortcuts[idx] = {
					subreddit: subreddit,
					displayName: displayName,
					addedDate: Date.now()
				}

				modules['subredditManager'].saveLatestShortcuts();

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
			if (e.keyCode === 27) {
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
				modules['subredditManager'].editShortcutDialog.blur();
			} else if (e.keyCode === 13) {
				RESUtils.click(modules['subredditManager'].saveButton);
			}
		}, false);
		this.displayNameInput.addEventListener('keyup', function(e) {
			if (e.keyCode === 27) {
				modules['subredditManager'].editShortcutDialog.style.display = 'none';
				modules['subredditManager'].editShortcutDialog.blur();
			} else if (e.keyCode === 13) {
				RESUtils.click(modules['subredditManager'].saveButton);
			}
		}, false);

		var cancelButton = this.editShortcutDialog.querySelector('#editShortcutClose');
		cancelButton.addEventListener('click', function(e) {
			modules['subredditManager'].editShortcutDialog.style.display = 'none';
		}, false);

		this.editShortcutDialog.style.display = 'block';
		var thisLeft = Math.min(RESUtils.mouseX, window.innerWidth - 300);
		this.editShortcutDialog.style.left = thisLeft + 'px';

		setTimeout(function() {
			modules['subredditManager'].subredditInput.focus()
		}, 200);
	},
	followSubredditShortcut: function() {
		if (BrowserDetect.isFirefox()) {
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
		modules['subredditManager'].srDataTransfer = this.getAttribute('orderIndex') + ',' + $(this).data('subreddit');
	},
	subredditDragEnter: function(e) {
		this.classList.add('srOver');
		return false;
	},
	subredditDragOver: function(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}

		// See the section on the DataTransfer object.
		e.dataTransfer.dropEffect = 'move';
		return false;
	},
	subredditDragLeave: function(e) {
		this.classList.remove('srOver');
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
		if (modules['subredditManager'].dragSrcEl !== this) {
			if (e.target.getAttribute('id') !== 'RESShortcutsTrash') {
				// get the order index of the src and destination to swap...
				// var theData = e.dataTransfer.getData('text/html').split(',');
				var theData = modules['subredditManager'].srDataTransfer.split(',');
				var srcOrderIndex = parseInt(theData[0], 10);
				var srcSubreddit = modules['subredditManager'].mySubredditShortcuts[srcOrderIndex];
				var destOrderIndex = parseInt(this.getAttribute('orderIndex'), 10);
				var destSubreddit = modules['subredditManager'].mySubredditShortcuts[destOrderIndex];
				var rearranged = [];
				var rearrangedI = 0;

				for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
					if ((i !== srcOrderIndex) && (i !== destOrderIndex)) {
						rearranged[rearrangedI] = modules['subredditManager'].mySubredditShortcuts[i];
						rearrangedI++;
					} else if (i === destOrderIndex) {
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

				// save the updated order...
				modules['subredditManager'].mySubredditShortcuts = rearranged;
				modules['subredditManager'].saveLatestShortcuts();
				// redraw the shortcut bar...
				modules['subredditManager'].redrawShortcuts();
				this.classList.remove('srOver');
			} else {
				var theData = modules['subredditManager'].srDataTransfer.split(',');
				var srcOrderIndex = parseInt(theData[0], 10);
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
			// if (BrowserDetect.isOpera()) this.headerContents.style.display = 'none';
			// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
			$(this.headerContents).html('');

			this.srLeftContainer = RESUtils.createElementWithID('div', 'srLeftContainer');
			this.srLeftContainer.setAttribute('class', 'sr-bar');

			this.srDropdown = RESUtils.createElementWithID('div', 'srDropdown');
			this.srDropdownContainer = RESUtils.createElementWithID('div', 'srDropdownContainer');
			$(this.srDropdownContainer).html('<a href="javascript:void(0)">My Subreddits</a>');
			this.srDropdownContainer.addEventListener('click', modules['subredditManager'].toggleSubredditDropdown, false);
			this.srDropdown.appendChild(this.srDropdownContainer);

			this.srList = RESUtils.createElementWithID('table', 'srList');
			var maxHeight = $(window).height() - 40;
			$(this.srList).css('max-height', maxHeight + 'px');
			// this.srDropdownContainer.appendChild(this.srList);
			document.body.appendChild(this.srList);

			this.srLeftContainer.appendChild(this.srDropdown);
			var sep = document.createElement('span');
			sep.setAttribute('class', 'srSep');
			sep.textContent = '|';
			this.srLeftContainer.appendChild(sep);

			// now put in the shortcuts...
			this.staticShortCutsContainer = document.createElement('div');
			this.staticShortCutsContainer.setAttribute('id', 'RESStaticShortcuts');
			/* this probably isn't the best way to give the option, since the mechanic is drag/drop for other stuff..  but it's much easier for now... */
			$(this.staticShortCutsContainer).html('');
			var specialButtonSelected = {};
			var subLower = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : 'home';
			specialButtonSelected[subLower] = 'RESShortcutsCurrentSub';

			var shortCutsHTML = '';

			if (this.options.linkDashboard.value) shortCutsHTML += '<span class="separator">-</span><a id="RESDashboardLink" class="subbarlink ' + specialButtonSelected['dashboard'] + '" href="/r/Dashboard/">DASHBOARD</a>';
			if (this.options.linkFront.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['home'] + '" href="/">FRONT</a>';
			if (this.options.linkAll.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['all'] + '" href="/r/all/">ALL</a>';
			if (this.options.linkRandom.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/random/">RANDOM</a>';
			if (this.options.linkMyRandom.value && this.myRandomEnabled) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + (this.myRandomGold ? 'gold' : '') + '" href="/r/myrandom/">MYRANDOM</a>';
			if (this.options.linkRandNSFW.value) shortCutsHTML += '<span class="separator over18">-</span><a class="subbarlink over18" href="/r/randnsfw/">RANDNSFW</a>';

			if (RESUtils.loggedInUser()) {
				if (this.options.linkFriends.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['friends'] + '" href="/r/friends/">FRIENDS</a>';

				var modmail = document.getElementById('modmail');
				if (modmail) {
					if (this.options.linkMod.value) shortCutsHTML += '<span class="separator">-</span><a class=" ' + specialButtonSelected['mod'] + '" href="/r/mod/">MOD</a>';
					if (this.options.linkModqueue.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/mod/about/modqueue">MODQUEUE</a>';
				}
			}
			$(this.staticShortCutsContainer).append(shortCutsHTML);

			this.srLeftContainer.appendChild(this.staticShortCutsContainer);
			this.srLeftContainer.appendChild(sep);
			this.headerContents.appendChild(this.srLeftContainer);

			this.shortCutsViewport = document.createElement('div');
			this.shortCutsViewport.setAttribute('id', 'RESShortcutsViewport');
			this.headerContents.appendChild(this.shortCutsViewport);

			this.shortCutsContainer = document.createElement('div');
			this.shortCutsContainer.setAttribute('id', 'RESShortcuts');
			this.shortCutsContainer.setAttribute('class', 'sr-bar');
			this.shortCutsViewport.appendChild(this.shortCutsContainer);

			this.shortCutsEditContainer = document.createElement('div');
			this.shortCutsEditContainer.setAttribute('id', 'RESShortcutsEditContainer');
			this.headerContents.appendChild(this.shortCutsEditContainer);

			// Add shortcut sorting arrow
			this.sortShortcutsButton = document.createElement('div');
			this.sortShortcutsButton.setAttribute('id', 'RESShortcutsSort');
			this.sortShortcutsButton.setAttribute('title', 'sort subreddit shortcuts');
			this.sortShortcutsButton.innerHTML = '&uarr;&darr;';
			this.sortShortcutsButton.addEventListener('click', modules['subredditManager'].showSortMenu, false);
			this.shortCutsEditContainer.appendChild(this.sortShortcutsButton);

			// add right scroll arrow...
			this.shortCutsRight = document.createElement('div');
			this.shortCutsRight.setAttribute('id', 'RESShortcutsRight');
			this.shortCutsRight.textContent = '>';
			this.shortCutsRight.addEventListener('click', function(e) {
				modules['subredditManager'].containerWidth = modules['subredditManager'].shortCutsContainer.offsetWidth;
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px', ''), 10);

				if (isNaN(marginLeft)) marginLeft = 0;

				var shiftWidth = $('#RESShortcutsViewport').width() - 80;
				if (modules['subredditManager'].containerWidth > (shiftWidth)) {
					marginLeft -= shiftWidth;
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsRight);

			// add an "add shortcut" button...
			this.shortCutsAdd = document.createElement('div');
			this.shortCutsAdd.setAttribute('id', 'RESShortcutsAdd');
			this.shortCutsAdd.textContent = '+';
			this.shortCutsAdd.title = 'add shortcut';
			this.shortCutsAddFormContainer = document.createElement('div');
			this.shortCutsAddFormContainer.setAttribute('id', 'RESShortcutsAddFormContainer');
			this.shortCutsAddFormContainer.style.display = 'none';
			var thisForm = ' \
				<form id="shortCutsAddForm"> \
					<div>Add shortcut or multi-reddit (i.e. foo+bar+baz):</div> \
					<label for="newShortcut">Subreddit:</label> <input type="text" id="newShortcut"><br> \
					<label for="displayName">Display Name:</label> <input type="text" id="displayName"><br> \
					<input type="submit" name="submit" value="add" id="addSubreddit"> \
					<div style="clear: both; float: right; margin-top: 5px;"><a style="font-size: 9px;" href="/subreddits/">Edit frontpage subscriptions</a></div> \
				</form> \
			';
			$(this.shortCutsAddFormContainer).html(thisForm);
			this.shortCutsAddFormField = this.shortCutsAddFormContainer.querySelector('#newShortcut');
			this.shortCutsAddFormFieldDisplayName = this.shortCutsAddFormContainer.querySelector('#displayName');

			modules['subredditManager'].shortCutsAddFormField.addEventListener('keyup', function(e) {
				if (e.keyCode === 27) {
					modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';
					modules['subredditManager'].shortCutsAddFormField.blur();
				}
			}, false);

			modules['subredditManager'].shortCutsAddFormFieldDisplayName.addEventListener('keyup', function(e) {
				if (e.keyCode === 27) {
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
				if (displayname === '') displayname = subreddit;

				var r_match_regex = /^(\/r\/|r\/)(.*)/i;
				if (r_match_regex.test(subreddit)) {
					subreddit = subreddit.match(r_match_regex)[2];
				}

				modules['subredditManager'].shortCutsAddFormField.value = '';
				modules['subredditManager'].shortCutsAddFormFieldDisplayName.value = '';
				modules['subredditManager'].shortCutsAddFormContainer.style.display = 'none';

				if (subreddit) {
					modules['subredditManager'].addSubredditShortcut(subreddit, displayname);
				}
			}, false);
			this.shortCutsAdd.addEventListener('click', function(e) {
				if (modules['subredditManager'].shortCutsAddFormContainer.style.display === 'none') {
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
			this.shortCutsTrash.setAttribute('id', 'RESShortcutsTrash');
			this.shortCutsTrash.textContent = '×';
			this.shortCutsTrash.addEventListener('dragenter', modules['subredditManager'].subredditDragEnter, false)
			this.shortCutsTrash.addEventListener('dragleave', modules['subredditManager'].subredditDragLeave, false);
			this.shortCutsTrash.addEventListener('dragover', modules['subredditManager'].subredditDragOver, false);
			this.shortCutsTrash.addEventListener('drop', modules['subredditManager'].subredditDrop, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsTrash);

			// add left scroll arrow...
			this.shortCutsLeft = document.createElement('div');
			this.shortCutsLeft.setAttribute('id', 'RESShortcutsLeft');
			this.shortCutsLeft.textContent = '<';
			this.shortCutsLeft.addEventListener('click', function(e) {
				var marginLeft = modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px', ''), 10);

				if (isNaN(marginLeft)) marginLeft = 0;

				var shiftWidth = $('#RESShortcutsViewport').width() - 80;
				marginLeft += shiftWidth;
				if (marginLeft <= 0) {
					modules['subredditManager'].shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				}
			}, false);
			this.shortCutsEditContainer.appendChild(this.shortCutsLeft);

			this.redrawShortcuts();
		}
	},
	showSortMenu: function() {
		// Add shortcut sorting menu if it doesn't exist in the DOM yet...
		if (!modules['subredditManager'].sortMenu) {
			modules['subredditManager'].sortMenu =
				$('<div id="sort-menu" class="drop-choices">' +
					'<p>&nbsp;sort by:</p>' +
					'<a class="choice" data-field="displayName" href="javascript:void(0);">display name</a>' +
					'<a class="choice" data-field="addedDate" href="javascript:void(0);">added date</a>' +
					'</div>');

			$(modules['subredditManager'].sortMenu).find('a').click(modules['subredditManager'].sortShortcuts);

			$(document.body).append(modules['subredditManager'].sortMenu);
		}
		var menu = modules['subredditManager'].sortMenu;
		if ($(menu).is(':visible')) {
			$(menu).hide();
			return;
		}
		var thisXY = $(modules['subredditManager'].sortShortcutsButton).offset();
		thisXY.left = thisXY.left - $(menu).width() + $(modules['subredditManager'].sortShortcutsButton).width();
		var thisHeight = $(modules['subredditManager'].sortShortcutsButton).height();

		$(menu).css({
			top: thisXY.top + thisHeight,
			left: thisXY.left
		}).show();
	},
	hideSortMenu: function() {
		var menu = modules['subredditManager'].sortMenu;
		$(menu).hide();
	},
	sortShortcuts: function(e) {
		modules['subredditManager'].hideSortMenu();

		var sortingField = $(this).data('field');
		var asc = !modules['subredditManager'].currentSort;
		// toggle sort method...
		modules['subredditManager'].currentSort = !modules['subredditManager'].currentSort;
		// Make sure we have a valid list of shortucts
		if (!modules['subredditManager'].mySubredditShortcuts) {
			modules['subredditManager'].getLatestShortcuts();
		}

		modules['subredditManager'].mySubredditShortcuts = modules['subredditManager'].mySubredditShortcuts.sort(function(a, b) {
			// var sortingField = field; // modules['subredditManager'].options.sortingField.value;
			// var asc = order === 'asc'; // (modules['subredditManager'].options.sortingDirection.value === 'asc');
			var aField = a[sortingField];
			var bField = b[sortingField];
			if (typeof aField === 'string' && typeof bField === 'string') {
				aField = aField.toLowerCase();
				bField = bField.toLowerCase();
			}

			if (aField === bField) {
				return 0;
			} else if (aField > bField) {
				return (asc) ? 1 : -1;
			} else {
				return (asc) ? -1 : 1;
			}
		});

		// Save shortcuts sort order
		modules['subredditManager'].saveLatestShortcuts();

		// Refresh shortcuts
		modules['subredditManager'].redrawShortcuts();
	},
	toggleSubredditDropdown: function(e) {
		e.stopPropagation();
		if (modules['subredditManager'].srList.style.display === 'block') {
			modules['subredditManager'].srList.style.display = 'none';
			document.body.removeEventListener('click', modules['subredditManager'].toggleSubredditDropdown, false);
		} else {
			if (RESUtils.loggedInUser()) {
				$(modules['subredditManager'].srList).html('<tr><td width="360">Loading subreddits (may take a moment)...<div id="subredditPagesLoaded"></div></td></tr>');
				if (!modules['subredditManager'].subredditPagesLoaded) {
					modules['subredditManager'].subredditPagesLoaded = modules['subredditManager'].srList.querySelector('#subredditPagesLoaded');
				}
				modules['subredditManager'].srList.style.display = 'block';
				modules['subredditManager'].getSubreddits();
			} else {
				$(modules['subredditManager'].srList).html('<tr><td width="360">You must be logged in to load your own list of subreddits. <a style="display: inline; float: left;" href="/subreddits/">browse them all</a></td></tr>');
				modules['subredditManager'].srList.style.display = 'block';
			}
			modules['subredditManager'].srList.addEventListener('click', modules['subredditManager'].stopDropDownPropagation, false);
			document.body.addEventListener('click', modules['subredditManager'].toggleSubredditDropdown, false);
		}
	},
	stopDropDownPropagation: function(e) {
		e.stopPropagation();
	},
	mySubreddits: [],
	mySubredditShortcuts: [],
	getSubredditJSON: function(after) {
		var jsonURL = location.protocol + '//' + location.hostname + '/subreddits/mine/.json?app=res';
		if (after) jsonURL += '&after=' + after;
		GM_xmlhttpRequest({
			method: "GET",
			url: jsonURL,
			onload: function(response) {
				var thisResponse = JSON.parse(response.responseText);
				if ((typeof thisResponse.data !== 'undefined') && (typeof thisResponse.data.children !== 'undefined')) {
					if (modules['subredditManager'].subredditPagesLoaded.innerHTML === '') {
						modules['subredditManager'].subredditPagesLoaded.textContent = 'Pages loaded: 1';
					} else {
						var pages = modules['subredditManager'].subredditPagesLoaded.innerHTML.match(/:\ ([\d]+)/);
						modules['subredditManager'].subredditPagesLoaded.textContent = 'Pages loaded: ' + (parseInt(pages[1], 10) + 1);
					}

					var now = Date.now();
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser(), now);

					var subreddits = thisResponse.data.children;
					for (var i = 0, len = subreddits.length; i < len; i++) {
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

					if (thisResponse.data.after) {
						modules['subredditManager'].getSubredditJSON(thisResponse.data.after);
					} else {
						modules['subredditManager'].mySubreddits.sort(function(a, b) {
							var adisp = a.display_name.toLowerCase();
							var bdisp = b.display_name.toLowerCase();
							if (adisp > bdisp) return 1;
							if (adisp == bdisp) return 0;
							return -1;
						});

						RESStorage.setItem('RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].mySubreddits));
						this.gettingSubreddits = false;
						modules['subredditManager'].populateSubredditDropdown();
					}
				} else {
					// User is probably not logged in.. no subreddits found.
					modules['subredditManager'].populateSubredditDropdown(null, true);
				}
			}
		});

	},
	getSubreddits: function() {
		modules['subredditManager'].mySubreddits = [];
		var lastCheck = parseInt(RESStorage.getItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser()), 10) || 0;
		var now = Date.now();
		var check = RESStorage.getItem('RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser());

		// 86400000 = 1 day
		if (((now - lastCheck) > 86400000) || !check || (check.length === 0)) {
			if (!this.gettingSubreddits) {
				this.gettingSubreddits = true;
				this.getSubredditJSON();
			}
		} else {
			modules['subredditManager'].mySubreddits = safeJSON.parse(check, 'RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser());
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
			if (modules['subredditManager'].sortBy === 'subreddit') {
				modules['subredditManager'].populateSubredditDropdown('subredditDesc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('subreddit');
			}
		}, false);
		modules['subredditManager'].srHeader.textContent = 'subreddit';
		modules['subredditManager'].srHeader.setAttribute('width', '200');

		modules['subredditManager'].lvHeader = document.createElement('td');
		modules['subredditManager'].lvHeader.addEventListener('click', function() {
			if (modules['subredditManager'].sortBy === 'lastVisited') {
				modules['subredditManager'].populateSubredditDropdown('lastVisitedAsc');
			} else {
				modules['subredditManager'].populateSubredditDropdown('lastVisited');
			}
		}, false);
		modules['subredditManager'].lvHeader.textContent = 'Last Visited';
		modules['subredditManager'].lvHeader.setAttribute('width', '120');

		var scHeader = document.createElement('td');
		$(scHeader).width(50);
		$(scHeader).html('<a style="float: right;" href="/subreddits/">View all &raquo;</a>');
		theRow.appendChild(modules['subredditManager'].srHeader);
		theRow.appendChild(modules['subredditManager'].lvHeader);
		theRow.appendChild(scHeader);
		theHead.appendChild(theRow);
		modules['subredditManager'].srList.appendChild(theHead);

		var theBody = document.createElement('tbody');
		if (!badJSON) {
			var subredditCount = modules['subredditManager'].mySubreddits.length;

			if (typeof this.subredditsLastViewed === 'undefined') {
				var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
				if (check) {
					this.subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
				} else {
					this.subredditsLastViewed = {};
				}
			}

			// copy modules['subredditManager'].mySubreddits to a placeholder array so we can sort without modifying it...
			var sortableSubreddits = modules['subredditManager'].mySubreddits;
			if (sortBy === 'lastVisited') {
				$(modules['subredditManager'].lvHeader).html('Last Visited <div class="sortAsc"></div>');
				modules['subredditManager'].srHeader.textContent = 'subreddit';

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					(typeof modules['subredditManager'].subredditsLastViewed[adisp] === 'undefined') ? alv = 0 : alv = parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited, 10);
					(typeof modules['subredditManager'].subredditsLastViewed[bdisp] === 'undefined') ? blv = 0 : blv = parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited, 10);

					if (alv < blv) return 1;
					if (alv == blv) {
						if (adisp > bdisp) return 1;
						return -1;
					}
					return -1;
				});
			} else if (sortBy === 'lastVisitedAsc') {
				$(modules['subredditManager'].lvHeader).html('Last Visited <div class="sortDesc"></div>');
				modules['subredditManager'].srHeader.textContent = 'subreddit';

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					(typeof modules['subredditManager'].subredditsLastViewed[adisp] === 'undefined') ? alv = 0 : alv = parseInt(modules['subredditManager'].subredditsLastViewed[adisp].last_visited, 10);
					(typeof modules['subredditManager'].subredditsLastViewed[bdisp] === 'undefined') ? blv = 0 : blv = parseInt(modules['subredditManager'].subredditsLastViewed[bdisp].last_visited, 10);

					if (alv > blv) return 1;
					if (alv == blv) {
						if (adisp > bdisp) return 1;
						return -1;
					}
					return -1;
				});
			} else if (sortBy === 'subredditDesc') {
				modules['subredditManager'].lvHeader.textContent = 'Last Visited';
				$(modules['subredditManager'].srHeader).html('subreddit <div class="sortDesc"></div>');

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					if (adisp < bdisp) return 1;
					if (adisp == bdisp) return 0;
					return -1;
				});
			} else {
				modules['subredditManager'].lvHeader.textContent = 'Last Visited';
				$(modules['subredditManager'].srHeader).html('subreddit <div class="sortAsc"></div>');

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					if (adisp > bdisp) return 1;
					if (adisp == bdisp) return 0;
					return -1;
				});
			}
			for (var i = 0; i < subredditCount; i++) {
				var dateString = 'Never';
				var thisReddit = sortableSubreddits[i].display_name.toLowerCase();
				if (typeof this.subredditsLastViewed[thisReddit] !== 'undefined') {
					var ts = parseInt(this.subredditsLastViewed[thisReddit].last_visited, 10);
					var dateVisited = new Date(ts);
					dateString = RESUtils.niceDate(dateVisited);
				}

				var theRow = document.createElement('tr');
				var theSR = document.createElement('td');
				$(theSR).html('<a href="' + escapeHTML(modules['subredditManager'].mySubreddits[i].url) + '">' + escapeHTML(modules['subredditManager'].mySubreddits[i].display_name) + '</a>');
				theRow.appendChild(theSR);

				var theLV = document.createElement('td');
				theLV.textContent = dateString;
				theLV.setAttribute('class', 'RESvisited');
				theRow.appendChild(theLV);

				var theSC = document.createElement('td');
				theSC.setAttribute('class', 'RESshortcut');
				theSC.setAttribute('data-subreddit', modules['subredditManager'].mySubreddits[i].display_name);

				var idx = -1;
				for (var j = 0, len = modules['subredditManager'].mySubredditShortcuts.length; j < len; j++) {
					if (modules['subredditManager'].mySubredditShortcuts[j].subreddit === modules['subredditManager'].mySubreddits[i].display_name) {
						idx = j;
						break;
					}
				}

				if (idx !== -1) {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}

						var subreddit = $(e.target).data('subreddit');
						modules['subredditManager'].removeSubredditShortcut(subreddit);
					}, false);

					theSC.textContent = '-shortcut';
				} else {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}

						var subreddit = $(e.target).data('subreddit');
						modules['subredditManager'].addSubredditShortcut(subreddit);
					}, false);

					theSC.textContent = '+shortcut';
				}

				theRow.appendChild(theSC);
				theBody.appendChild(theRow);
			}
		} else {
			var theTD = document.createElement('td');
			theTD.textContent = 'There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com';
			theTD.setAttribute('colspan', '3');

			var theRow = document.createElement('tr');
			theRow.appendChild(theTD);
			theBody.appendChild(theRow);
		}

		modules['subredditManager'].srList.appendChild(theBody);
	},
	toggleSubredditShortcut: function(e) {
		e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...

		var isShortcut = false;
		for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() === $(this).data('subreddit').toLowerCase()) {
				isShortcut = true;
				break;
			}
		}

		if (isShortcut) {
			modules['subredditManager'].removeSubredditShortcut($(this).data('subreddit'));
			$(this)
				.attr('title', 'Add this subreddit to your shortcut bar')
				.text('+shortcut')
				.removeClass('remove');
		} else {
			modules['subredditManager'].addSubredditShortcut($(this).data('subreddit'));
			$(this)
				.attr('title', 'Remove this subreddit from your shortcut bar')
				.text('-shortcut')
				.addClass('remove');
		}

		modules['subredditManager'].redrawShortcuts();
	},
	getLatestShortcuts: function() {
		// re-retreive the latest data to ensure we're not losing info between tab changes...
		var shortCuts = RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.' + RESUtils.loggedInUser());
		if (!shortCuts) {
			shortCuts = '[]';
		}

		this.mySubredditShortcuts = safeJSON.parse(shortCuts, 'RESmodules.subredditManager.subredditShortcuts.' + RESUtils.loggedInUser());
		this.parseDates();
	},
	// JSON specification doesn't specify what to do with dates - so unstringify here
	parseDates: function() {
		for (var i = 0, len = this.mySubredditShortcuts.length; i < len; i++) {
			this.mySubredditShortcuts[i].addedDate = this.mySubredditShortcuts[i].addedDate ? new Date(this.mySubredditShortcuts[i].addedDate) : new Date(0);
		}
	},
	saveLatestShortcuts: function() {
		// Retreive the latest data to ensure we're not losing info
		if (!modules['subredditManager'].mySubredditShortcuts) {
			modules['subredditManager'].mySubredditShortcuts = [];
		}

		RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].mySubredditShortcuts));
	},
	addSubredditShortcut: function(subreddit, displayname) {
		modules['subredditManager'].getLatestShortcuts();

		var idx = -1;
		for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() === subreddit.toLowerCase()) {
				idx = i;
				break;
			}
		}

		if (idx !== -1) {
			alert('Whoops, you already have a shortcut for that subreddit');
		} else {
			displayname = displayname || subreddit;
			var subredditObj = {
				subreddit: subreddit,
				displayName: displayname.toLowerCase(),
				addedDate: Date.now()
			};

			modules['subredditManager'].mySubredditShortcuts.push(subredditObj);
			if (RESUtils.proEnabled()) {
				if (typeof modules['subredditManager'].RESPro === 'undefined') {
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser())) {
						var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
					} else {
						var temp = {
							add: {},
							del: {}
						};
					}

					modules['subredditManager'].RESPro = temp;
				}

				if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
					modules['subredditManager'].RESPro.add = {}
				}

				if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
					modules['subredditManager'].RESPro.del = {}
				}

				// add this subreddit next time we sync...
				modules['subredditManager'].RESPro.add[subreddit] = true;

				// make sure we don't run a delete on this subreddit next time we sync...
				if (typeof modules['subredditManager'].RESPro.del[subreddit] !== 'undefined') delete modules['subredditManager'].RESPro.del[subreddit];

				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}

			modules['subredditManager'].saveLatestShortcuts();
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();

			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}

			modules['notifications'].showNotification({
				moduleID: 'subredditManager',
				message: 'Subreddit shortcut added. You can edit by double clicking, or trash by dragging to the trash can.'
			});
		}
	},
	removeSubredditShortcut: function(subreddit) {
		this.getLatestShortcuts();

		var idx = -1;
		for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
			if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() === subreddit.toLowerCase()) {
				idx = i;
				break;
			}
		}

		if (idx !== -1) {
			modules['subredditManager'].mySubredditShortcuts.splice(idx, 1);

			if (RESUtils.proEnabled()) {
				if (typeof modules['subredditManager'].RESPro === 'undefined') {
					if (RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser())) {
						var temp = safeJSON.parse(RESStorage.getItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser()), 'RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser());
					} else {
						var temp = {
							add: {},
							del: {}
						};
					}

					modules['subredditManager'].RESPro = temp;
				}
				if (typeof modules['subredditManager'].RESPro.add === 'undefined') {
					modules['subredditManager'].RESPro.add = {}
				}
				if (typeof modules['subredditManager'].RESPro.del === 'undefined') {
					modules['subredditManager'].RESPro.del = {}
				}

				// delete this subreddit next time we sync...
				modules['subredditManager'].RESPro.del[subreddit] = true;

				// make sure we don't run an add on this subreddit
				if (typeof modules['subredditManager'].RESPro.add[subreddit] !== 'undefined') delete modules['subredditManager'].RESPro.add[subreddit];

				RESStorage.setItem('RESmodules.subredditManager.subredditShortcuts.RESPro.' + RESUtils.loggedInUser(), JSON.stringify(modules['subredditManager'].RESPro));
			}

			modules['subredditManager'].saveLatestShortcuts();
			modules['subredditManager'].redrawShortcuts();
			modules['subredditManager'].populateSubredditDropdown();

			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}
		}
	},
	setLastViewtime: function() {
		var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());

		if (!check) {
			this.subredditsLastViewed = {};
		} else {
			this.subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
		}

		var now = Date.now();
		var thisReddit = RESUtils.currentSubreddit().toLowerCase();
		this.subredditsLastViewed[thisReddit] = {
			last_visited: now
		};

		RESStorage.setItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser(), JSON.stringify(this.subredditsLastViewed));
	},
	subscribeToSubreddit: function(subredditName, subscribe) {
		// subredditName should look like t5_123asd
		subscribe = subscribe !== false; // default to true
		var userHash = RESUtils.loggedInUserHash();

		var formData = new FormData();
		formData.append('sr', subredditName);
		formData.append('action', subscribe ? 'sub' : 'unsub');
		formData.append('uh', userHash);

		GM_xmlhttpRequest({
			method: "POST",
			url: location.protocol + "//" + location.hostname + "/api/subscribe?app=res",
			data: formData
		});

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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// do stuff now!
			// if we haven't synced in more than our settings, and settings != manual, sync!
			if (this.options.syncFrequency.value > 0) {
				var lastSync = parseInt(RESStorage.getItem('RESmodules.RESPro.lastSync'), 10) || 0;
				var now = Date.now();
				if ((now - lastSync) > this.options.syncFrequency.value) {
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
							modules['notifications'].showNotification({
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
					if (key.indexOf('RESmodules.subredditManager') !== -1) {
						var keySplit = key.split('.');
						var username = keySplit[keySplit.length-1];
						if ((keySplit.indexOf('subredditsLastViewed') === -1) && (keySplit.indexOf('subreddits') === -1)) {
							// console.log(key);
							(keySplit.indexOf('RESPro') !== -1) ? subredditManagerData.RESPro[username] = JSON.parse(RESStorage[key]) : subredditManagerData[username] = JSON.parse(RESStorage[key]);
							// if (key.indexOf('RESPro') === -1) console.log(username + ' -- ' + RESStorage[key]);
							if (key.indexOf('RESPro') !== -1) RESStorage.removeItem('RESmodules.subredditManager.subredditShortcuts.RESPro.'+username);
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
							modules['notifications'].showNotification({
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
								if (typeof currentData[attrname] === 'undefined') {
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
		// (typeof unsafeWindow !== 'undefined') ? ls = unsafeWindow.localStorage : ls = localStorage;
		if (RESConsole.proSaveButton) RESConsole.proSaveButton.textContent = 'Saving...';
		var RESOptions = {};
		// for (var i = 0, len=ls.length; i < len; i++) {
		for(var i in RESStorage) {
			if ((typeof RESStorage.getItem(i) !== 'function') && (typeof RESStorage.getItem(i) !== 'undefined')) {
				var keySplit = i.split('.');
				if (keySplit) {
					var keyRoot = keySplit[0];
					switch (keyRoot) {
						case 'RES':
							var thisNode = keySplit[1];
							if (thisNode === 'modulePrefs') {
								RESOptions[thisNode] = safeJSON.parse(RESStorage.getItem(i), i);
							}
							break;
						case 'RESoptions':
							var thisModule = keySplit[1];
							if (thisModule !== 'accountSwitcher') {
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
					var now = Date.now();
					RESStorage.setItem('RESmodules.RESPro.lastSync',now);
					if (RESConsole.proSaveButton) RESConsole.proSaveButton.textContent = 'Saved.';
					modules['notifications'].showNotification({
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
						if (thisModule === 'modulePrefs') {
							var thisOptions = prefsData[thisModule];
							RESStorage.setItem('RES.modulePrefs',JSON.stringify(thisOptions));
						} else {
							var thisOptions = prefsData[thisModule];
							RESStorage.setItem('RESoptions.'+thisModule,JSON.stringify(thisOptions));
						}
					}
					if (RESConsole.proGetButton) RESConsole.proGetButton.textContent = 'Preferences Loaded!';
					modules['notifications'].showNotification({
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
		} else if ((modules['RESPro'].options.username.value === '') || (modules['RESPro'].options.password.value === '')) {
			modules['RESPro'].configure();
		} else if (RESStorage.getItem('RESmodules.RESPro.lastAuthFailed') !== 'true') {
			if (typeof modules['RESPro'].lastAuthFailed === 'undefined') {
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
							modules['notifications'].showNotification({
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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled() && this.isMatchURL()) {
			RESUtils.addCSS('.res-help { cursor: help; }');
			RESUtils.addCSS('.res-help #resHelp { cursor: default; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.menuItem = RESUtils.createElementWithID('li', 'RESTipsMenuItem');
			this.menuItem.textContent = 'tips & tricks';
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
	handleEscapeKey: function(event) {
		if (event.which === 27) {
			this.hideTip();
		}
	},
	dailyTip: function() {
		var lastCheck = parseInt(RESStorage.getItem('RESLastToolTip'), 10) || 0;
		var now = Date.now();
		// 86400000 = 1 day
		if ((now - lastCheck) > 86400000) {
			// mark off that we've displayed a new tooltip
			RESStorage.setItem('RESLastToolTip', now);
			if (lastCheck === 0) {
				this.showTip(0);
			} else {
				setTimeout(function() {
					modules['RESTips'].randomTip();
				}, 500);
			}
		}
	},
	randomTip: function() {
		this.currTip = Math.floor(Math.random() * this.tips.length);
		this.showTip(this.currTip);
	},
	disableDailyTipsCheckbox: function(e) {
		modules['RESTips'].options.dailyTip.value = e.target.checked;
		RESStorage.setItem('RESoptions.RESTips', JSON.stringify(modules['RESTips'].options));
	},
	nextTip: function() {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(1);
	},
	prevTip: function() {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		modules['RESTips'].nextPrevTip(-1);
	},
	nextPrevTip: function(idx) {
		if (typeof this.currTip === 'undefined') this.currTip = 0;
		// if (idx < 0) this.hideTip();
		this.hideTip();
		this.currTip += idx;
		if (this.currTip < 0) {
			this.currTip = this.tips.length - 1;
		} else if (this.currTip >= this.tips.length) {
			this.currTip = 0;
		}
		this.showTip(this.currTip);
	},
	generateTitle: function (help) {
		var title = help.title 
			? help.title
			: 'RES Tips and Tricks';
			
		return title;
	},
	generateContent: function(help, elem) {
		var description = [];

		if (help.message) description.push(help.message);

		if (help.keyboard) {
			// TODO: microtemplate
			var disabled = !modules['keyboardNav'].isEnabled();
			description.push('<h2 class="keyboardNav' + (disabled ? 'keyboardNavDisabled' : '') + '">');
			description.push('Keyboard Navigation' + (disabled ? ' (disabled)' : ''));
			description.push('</h2>');

			var keyboardTable = RESUtils.generateTable(help.keyboard, this.generateContentKeyboard, elem);
			if (keyboardTable) description.push(keyboardTable);
		}

		if (help.option) {
			description.push('<h2 class="settingsPointer">');
			description.push('<span class="gearIcon"></span> RES Settings');
			description.push('</h2>');

			var optionTable = RESUtils.generateTable(help.option, this.generateContentOption, elem);
			if (optionTable) description.push(optionTable);
		}

		description = description.join("\n");
		return description;
	},
	generateContentKeyboard: function(keyboardNavOption, index, array, elem) {
		var keyCode = modules['keyboardNav'].getNiceKeyCode(keyboardNavOption);
		if (!keyCode) return;

		var description = [];
		description.push('<tr>');
		description.push('<td><code>' + keyCode.toLowerCase() + '</code></td>');
		description.push('<td>' + keyboardNavOption + '</td>');
		description.push('</tr><tr>');
		description.push('<td>&nbsp;</td>'); // for styling
		description.push('<td>' + modules['keyboardNav'].options[keyboardNavOption].description + '</td>');
		description.push('</tr>');

		return description;
	},
	generateContentOption: function(option, index, array, elem) {
		var module = modules[option.moduleID];
		if (!module) return;

		var description = [];

		description.push("<tr>");
		description.push("<td>" + module.category + '</td>');

		description.push('<td>');
		description.push(modules['settingsNavigation'].makeUrlHashLink(option.moduleID, null, module.moduleName));
		description.push('</td>');

		description.push('<td>');
		description.push(option.key ? modules['settingsNavigation'].makeUrlHashLink(option.moduleID, option.key) : '&nbsp;');
		description.push('</td>');

		if (module.options[option.key]) {
			description.push('</tr><tr>');
			description.push('<td colspan="3">' + module.options[option.key].description + '</td>');
		}
		description.push("</tr>");

		return description;
	},
	consoleTip: {
		message: "Roll over the gear icon <span class='gearIcon'></span> and click 'settings console' to explore the RES settings.  You can enable, disable or change just about anything you like/dislike about RES!<br><br>Once you've opened the console once, this message will not appear again.",
		attachTo: "#openRESPrefs",
		position: 5
	},
	tips: [{
			message: 'Welcome to RES. You can turn modules on and off, and configure settings for the modules using the gear icon link at the top right. For feature requests, or just help getting a question answered, be sure to subscribe to <a href="http://reddit.com/r/Enhancement">/r/Enhancement</a>.',
			attachTo: "#openRESPrefs",
			position: 5
		}, {
			message: "Click the tag icon next to a user to tag that user with any name you like - you can also color code the tag.",
			attachTo: ".RESUserTagImage:visible",
			position: 3,
			option: { moduleID: 'userTagger' }
		},
		{ 
			message: "If your RES data gets deleted or you move to a new computer, you can restore it from backup. <br><br><b>Firefox</b> especially sometimes loses your RES settings and data. <br><br><a href=\"http://reddit.com/r/Enhancement/wiki/backing_up_res_settings\" target=\"_blank\">Learn where RES stores your data and settings</a></p>",
			title: 'Back up your RES data!'
		},
		{ 
			message: "Don't forget to subscribe to <a href=\"http://reddit.com/r/Enhancement\">/r/Enhancement</a> to keep up to date on the latest versions of RES or suggest features! For bug reports, submit to <a href=\"http://reddit.com/r/RESIssues\">/r/RESIssues</a>" 
		},
		{ 
			message: "Don't want to see posts containing certain keywords? Want to filter out certain subreddits from /r/all? Try the filteReddit module!" ,
			option: { moduleID: 'filteReddit' }
		},
		{ 
			message: "Keyboard Navigation is one of the most underutilized features in RES. You should try it!" ,
			option: { moduleID: 'keyboardNav' },
			keyboard: 'toggleHelp'
		}, {
			message: "Did you know you can configure the appearance of a number of things in RES? For example: keyboard navigation lets you configure the look of the 'selected' box, and commentBoxes lets you configure the borders / shadows.",
			option: [{
				moduleID: 'keyboardNav',
				key: 'focusBGColor'
			}, {
				moduleID: 'styleTweaks',
				key: 'commentBoxes'
			}]
		},

		{
			message: "Do you subscribe to a ton of reddits? Give the subreddit tagger a try, it can make your homepage a bit more readable.",
			option: {
				moduleID: 'subRedditTagger'
			}
		}, {
			message: "If you haven't tried it yet, Keyboard Navigation is great. Just hit ? while browsing for instructions.",
			option: {
				moduleID: 'keyboardNav'
			},
			keyboard: 'toggleHelp'
		}, {
			message: "Roll over a user's name to get information about them such as their karma, and how long they've been a reddit user.",
			option: {
				moduleID: 'userTagger',
				key: 'hoverInfo'
			}
		}, {
			message: "Hover over the 'parent' link in comments pages to see the text of the parent being referred to.",
			option: {
				moduleID: 'showParent'
			}
		}, {
			message: "You can configure the color and style of the User Highlighter module if you want to change how the highlights look.",
			option: {
				moduleID: 'userHighlight'
			}
		}, {
			message: "Not a fan of how comments pages look? You can change the appearance in the Style Tweaks module",
			option: {
				moduleID: 'styleTweaks'
			}
		}, {
			message: "Don't like the style in a certain subreddit? RES gives you a checkbox to disable styles individually - check the right sidebar!"
		}, {
			message: "Looking for posts by submitter, post with photos, or posts in IAmA form? Try out the comment navigator."
		}, {
			message: "Have you seen the <a href=\"http://www.reddit.com/r/Dashboard\">RES Dashboard</a>? It allows you to do all sorts of great stuff, like keep track of lower traffic subreddits, and manage your <a href=\"/r/Dashboard#userTaggerContents\">user tags</a> and <a href=\"/r/Dashboard#newCommentsContents\">thread subscriptions</a>!",
			options: {
				moduleID: 'dashboard'
			}
		}, {
			message: "Sick of seeing these tips?  They only show up once every 24 hours, but you can disable that in the RES Tips and Tricks preferences.",
			option: {
				moduleID: 'RESTips'
			}
		}, {
			message: "Did you know that there is now a 'keep me logged in' option in the Account Switcher? Turn it on if you want to stay logged in to Reddit when using the switcher!",
			option: {
				moduleID: 'accountSwitcher',
				key: 'keepLoggedIn'
			}
		}, {
			message: "See that little [vw] next to users you've voted on?  That's their vote weight - it moves up and down as you vote the same user up / down.",
			option: {
				moduleID: 'userTagger',
				key: 'vwTooltip'
			}
		}
	],
	tour: [
		// array of guiders will go here... and we will add a "tour" button somewhere to start the tour...
	],
	initTips: function() {
		$('body').on('click', '#disableDailyTipsCheckbox', modules['RESTips'].disableDailyTipsCheckbox);

		// create the special "you have never visited the console" guider...
		this.createGuider(0, 'console');
		for (var i = 0, len = this.tips.length; i < len; i++) {
			this.createGuider(i);
		}
	},
	createGuider: function(i, special) {
		if (special === 'console') {
			var thisID = special;
			var thisTip = this.consoleTip;
		} else {
			var thisID = "tip" + i;
			var thisTip = this.tips[i];
		}
		var title = modules['RESTips'].generateTitle(thisTip);
		var description = modules['RESTips'].generateContent(thisTip);
		var attachTo = thisTip.attachTo;
		var nextidx = ((parseInt(i + 1, 10)) >= len) ? 0 : (parseInt(i + 1, 10));
		var nextID = "tip" + nextidx;
		var thisChecked = (modules['RESTips'].options.dailyTip.value) ? 'checked="checked"' : '';
		var guiderObj = {
			attachTo: attachTo,
			buttons: [{
				name: "Prev",
				onclick: modules['RESTips'].prevTip
			}, {
				name: "Next",
				onclick: modules['RESTips'].nextTip
			}],
			description: description,
			buttonCustomHTML: "<label class='stopper'> <input type='checkbox' name='disableDailyTipsCheckbox' id='disableDailyTipsCheckbox' " + thisChecked + " />Show these tips once every 24 hours</label>",
			id: thisID,
			next: nextID,
			onShow: modules['RESTips'].onShow,
			onHide: modules['RESTips'].onHide,
			position: this.tips[i].position,
			xButton: true,
			title: title,
		};
		if (special === 'console') {
			delete guiderObj.buttonCustomHTML;
			delete guiderObj.next;
			delete guiderObj.buttons;

			guiderObj.title = "RES is extremely configurable";
		}

		guiders.createGuider(guiderObj);
	},
	showTip: function(idx, special) {
		if (typeof this.tipsInitialized === 'undefined') {
			this.initTips();
			this.tipsInitialized = true;
		}

		if (!special) {
			guiders.show('tip' + idx);
		} else {
			guiders.show('console');
		}

		$('body').on('keyup', modules['RESTips'].handleEscapeKey);
	},
	hideTip: function() {
		guiders.hideAll();
		$('body').off('keyup', modules['RESTips'].handleEscapeKey);
	},
	onShow: function() {
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'tipstricks');
	},
	onHide: function() {
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'tipstricks');
	}
};


modules['settingsNavigation'] = {
	moduleID: 'settingsNavigation',
	moduleName: 'RES Settings Navigation',
	category: 'UI',
	description: 'Helping you get around the RES Settings Console with greater ease',
	hidden: true,
	options: {},
	isEnabled: function() {
		// return RESConsole.getModulePrefs(this.moduleID);
		return true;
	},
	include: [
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		RESUtils.addCSS('#RESSearchMenuItem { \
			display: block;	\
			float: right;	\
			margin: 7px;	\
			width: 21px;height: 21px;	\
			border: 1px #c9def2 solid;	\
			border-radius: 3px;	\
			background: transparent center center no-repeat; \
			background-image: ' + this.searchButtonIcon + '; \
			} ');
		RESUtils.addCSS('li:hover > #RESSearchMenuItem { \
			border-color: #369;	\
			background-image: ' + this.searchButtonIconHover + '; \
			}');
	},
	go: function() {
		RESUtils.addCSS(modules['settingsNavigation'].css);
		this.menuItem = RESUtils.createElementWithID('i', 'RESSearchMenuItem');
		this.menuItem.setAttribute('title', 'search settings');
		this.menuItem.addEventListener('click', function(e) {
			modules['settingsNavigation'].showSearch()
		}, false);
		RESConsole.settingsButton.appendChild(this.menuItem);

		if (!(this.isEnabled() && this.isMatchURL())) return;

		window.addEventListener('hashchange', modules['settingsNavigation'].onHashChange);
		window.addEventListener('popstate', modules['settingsNavigation'].onPopState);
		setTimeout(modules['settingsNavigation'].onHashChange, 300); // for initial pageload; wait until after RES has completed loading

		this.consoleTip();
	},
	searchButtonIcon: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVuG7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohbyS1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL42K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8OokmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAONJREFUOBGlkz0KwkAQRo2ICt5IsBE9gI1dwAOk8AqCgufQPo2CYGlhIVh4Aj2ClYVg4hvdCclmI8gOPHbn78vsLgnSNK35WN2nWXq9BRoVEwyIj6ANO4ghgbLJHVjM8BM4wwGesIYm2LU1O9ClSCwCzfXZi8gkF9NcSWBB0dVRGBPbOOLOSww4qJA38d3vbanqEabEA5Mbsj4gNH42vvgFxxTIJYpd4AgvcbAVdKDQ8/lKflaz12ds4e+hBxFsIYQ7fM1W/OHPyYktIZuiagLVt9cxgRucNPGvgPZlq/e/4C3wBoAXSrzY2Qd2AAAAAElFTkSuQmCC')",
	searchButtonIconHover: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVuG7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohbyS1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL42K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8OokmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAPBJREFUOBGlkTEKAjEQRTciIth4HkvRA9jYCR7AwisICvZiZ6X9NlvYW1gIFp5AT2Eh6PpGMjLuBkUy8JmZ5P+fZOLyPE9iohIjFm20QTV0A+dch/UeqIMtSHnqg1wOmYEFjAkQ8hHswA1sQM3ytC6KWxBlqqM3IUna9GIy1DWbiwYziGdLkJpIQVZclz40REbgnKhMSB/+b+sKSZ8wpnb+9C71FQwsV+uPJ3iBDFFOO4E9uPt+TW6oUHPJwJvINy7BCvTBAohpBpoqfnFt861GOPUmc8vTd7L3O5it3OaCwUHZfxmoyObQN9r9n3W0wRPmWv0jZnGemgAAAABJRU5ErkJggg==')",
	consoleTip: function() {
		// first, ensure that we've at least run dailyTip once (so RES first-run has happened)...
		var lastToolTip = RESStorage.getItem('RESLastToolTip');
		if (lastToolTip) {
			// if yes, see if the user has ever opened the settings console.
			var hasOpenedConsole = RESStorage.getItem('RESConsole.hasOpenedConsole');
			if (!hasOpenedConsole) {
				// if no, nag them once daily that the console exists until they use it.  Once it's been opened, this check will never run again.
				var lastCheckDailyTip = parseInt(RESStorage.getItem('RESLastToolTip'), 10) || 0;
				var now = Date.now();
				// 86400000 = 1 day - remind users once a day if they've never opened the settings that they should check out the console sometime...
				var lastCheck = parseInt(RESStorage.getItem('RESConsole.hasOpenedCheck'), 10) || 0;
				if (((now - lastCheckDailyTip) > 1000) && ((now - lastCheck) > 86400000)) {
					RESStorage.setItem('RESConsole.hasOpenedCheck', now);
					modules['RESTips'].showTip(0, 'console');
				}
			}
		}
	},
	makeUrlHashLink: function(moduleID, optionKey, displayText, cssClass) {
		if (!displayText) {
			if (optionKey) {
				displayText = optionKey;
			} else if (modules[moduleID]) {
				displayText = modules[moduleID].moduleName;
			} else if (moduleID) {
				displayText = moduleID;
			} else {
				displayText = 'Settings';
			}
		}

		var hash = modules['settingsNavigation'].makeUrlHash(moduleID, optionKey);
		var link = ['<a ', 'class="', cssClass || '', '" ', 'href="', hash, '"', '>', displayText, '</a>'].join('');
		return link;
	},
	makeUrlHash: function(moduleID, optionKey) {
		var hashComponents = ['#!settings']

		if (moduleID) {
			hashComponents.push(moduleID);
		}

		if (moduleID && optionKey) {
			hashComponents.push(optionKey);
		}

		var hash = hashComponents.join('/');
		return hash;
	},
	setUrlHash: function(moduleID, optionKey) {
		var titleComponents = ['RES Settings'];

		if (moduleID) {
			var module = modules[moduleID];
			var moduleName = module && module.moduleName || moduleID;
			titleComponents.push(moduleName);

			if (optionKey) {
				titleComponents.push(optionKey);
			}
		}

		var hash = this.makeUrlHash(moduleID, optionKey);
		var title = titleComponents.join(' - ');

		if (window.location.hash != hash) {
			window.history.pushState(hash, title, hash);
		}
	},
	resetUrlHash: function() {
		window.location.hash = "";
	},
	onHashChange: function(event) {
		var hash = window.location.hash;
		if (hash.substring(0, 10) !== '#!settings') return;

		var params = hash.match(/\/[\w\s]+/g);
		if (params && params[0]) {
			var moduleID = params[0].substring(1);
		}
		if (params && params[1]) {
			var optionKey = params[1].substring(1);
		}

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	},
	onPopState: function(event) {
		var state = typeof event.state === "string" && event.state.split('/');
		if (!state || state[0] !== '#!settings') {
			if (RESConsole.isOpen) {
				RESConsole.close();
			}
			return;
		}

		var moduleID = state[1];
		var optionKey = state[2];

		modules['settingsNavigation'].loadSettingsPage(moduleID, optionKey);
	},
	loadSettingsPage: function(moduleID, optionKey, optionValue) {
		if (moduleID && modules.hasOwnProperty(moduleID)) {
			var module = modules[moduleID];
		}
		if (module) {
			var category = module.category;
		}


		RESConsole.open(module && module.moduleID);
		if (module) {
			if (optionKey && module.options.hasOwnProperty(optionKey)) {
				var optionsPanel = $(RESConsole.RESConsoleContent);
				var optionElement = optionsPanel.find('label[for="' + optionKey + '"]');
				var optionParent = optionElement.parent();
				optionParent.addClass('highlight');
				if (optionElement.length) {
					var configPanel = $(RESConsole.RESConsoleConfigPanel);
					var offset = optionElement.offset().top - configPanel.offset().top;
					optionsPanel.scrollTop(offset);
				}
			}
		} else {
			switch (moduleID) {
				case 'search':
					this.search(optionKey);
					break;
				default:
					break;
			}
		}
	},
	search: function(query) {
		RESConsole.openCategoryPanel('About RES');
		modules['settingsNavigation'].drawSearchResults(query);
		modules['settingsNavigation'].getSearchResults(query);
		modules['settingsNavigation'].setUrlHash('search', query);
	},
	showSearch: function() {
		RESConsole.hidePrefsDropdown();
		modules['settingsNavigation'].drawSearchResults();
		$('#SearchRES-input').focus();
	},
	doneSearch: function(query, results) {
		modules['settingsNavigation'].drawSearchResults(query, results);
	},
	getSearchResults: function(query) {
		if (!(query && query.toString().length)) {
			modules['settingsNavigation'].doneSearch(query, []);
		}

		var queryTerms = modules['settingsNavigation'].prepareSearchText(query, true).split(' ');
		var results = [];

		// Search options
		for (var moduleKey in modules) {
			if (!modules.hasOwnProperty(moduleKey)) continue;
			var module = modules[moduleKey];


			var searchString = module.moduleID + module.moduleName + module.category + module.description;
			searchString = modules['settingsNavigation'].prepareSearchText(searchString, false);
			var matches = modules['settingsNavigation'].searchMatches(queryTerms, searchString);
			if (matches) {
				var result = modules['settingsNavigation'].makeModuleSearchResult(moduleKey);
				result.rank = matches;
				results.push(result);
			}


			var options = module.options;

			for (var optionKey in options) {
				if (!options.hasOwnProperty(optionKey)) continue;
				var option = options[optionKey];

				var searchString = module.moduleID + module.moduleName + module.category + optionKey + option.description;
				searchString = modules['settingsNavigation'].prepareSearchText(searchString, false);
				var matches = modules['settingsNavigation'].searchMatches(queryTerms, searchString);
				if (matches) {
					var result = modules['settingsNavigation'].makeOptionSearchResult(moduleKey, optionKey);
					result.rank = matches;
					results.push(result);
				}
			}
		}

		results.sort(function(a, b) {
			var comparison = b.rank - a.rank;

			/*
			if (comparison === 0) {
				comparison = 
					a.title < b.title ? -1
				 	: a.title > b.title ? 1
				 	: 0;

			}

			if (comparison === 0) {
				comparison = 
					a.description < b.description ? -1
				 	: a.description > b.description ? 1
				 	: 0;
			}
			*/

			return comparison;
		});

		modules['settingsNavigation'].doneSearch(query, results);

	},
	searchMatches: function(needles, haystack) {
		if (!(haystack && haystack.length))
			return false;

		var numMatches = 0;
		for (var i = 0; i < needles.length; i++) {
			if (haystack.indexOf(needles[i]) !== -1)
				numMatches++;
		}

		return numMatches;
	},
	prepareSearchText: function(text, preserveSpaces) {
		if (typeof text === "undefined" || text === null) {
			return '';
		}

		var replaceSpacesWith = !! preserveSpaces ? ' ' : ''
		return text.toString().toLowerCase()
			.replace(/[,\/]/g, replaceSpacesWith).replace(/\s+/g, replaceSpacesWith);
	},
	makeOptionSearchResult: function(moduleKey, optionKey) {
		var module = modules[moduleKey];
		var option = module.options[optionKey];

		var result = {};
		result.type = 'option';
		result.breadcrumb = ['Settings',
			module.category,
			module.moduleName + ' (' + module.moduleID + ')'
		].join(' > ');
		result.title = optionKey;
		result.description = option.description;
		result.moduleID = moduleKey;
		result.optionKey = optionKey;

		return result;
	},
	makeModuleSearchResult: function(moduleKey) {
		var module = modules[moduleKey];

		var result = {};
		result.type = 'module';
		result.breadcrumb = ['Settings',
			module.category,
			'(' + module.moduleID + ')'
		].join(' > ');
		result.title = module.moduleName;
		result.description = module.description;
		result.moduleID = moduleKey;

		return result;
	},

	onSearchResultSelected: function(result) {
		if (!result) return;

		switch (result.type) {
			case 'module':
				modules['settingsNavigation'].loadSettingsPage(result.moduleID);
				break;
			case 'option':
				modules['settingsNavigation'].loadSettingsPage(result.moduleID, result.optionKey);
				break;
			default:
				alert('Could not load search result');
				break;
		}
	},
	// ---------- View ------
	css: '\
		#SearchRES #SearchRES-results-container { \
			display: none; \
		} \
		#SearchRES #SearchRES-results-container + #SearchRES-boilerplate { margin-top: 1em; border-top: 1px black solid; padding-top: 1em; }	\
		#SearchRES h4 { \
			margin-top: 1.5em; \
		} \
		#SearchRES-results { \
		} \
		#SearchRES-results li { \
			list-style-type: none; \
			border-bottom: 1px dashed #ccc; \
			cursor: pointer; \
			margin-left: 0px; \
			padding-left: 10px; \
			padding-top: 24px; \
			padding-bottom: 24px; \
		} \
		#SearchRES-results li:hover { \
			background-color: #FAFAFF; \
		} \
		.SearchRES-result-title { \
			margin-bottom: 12px; \
			font-weight: bold; \
			color: #666; \
		} \
		.SearchRES-breadcrumb { \
			font-weight: normal; \
			color: #888; \
		} \
		.SearchRES-result-copybutton {\
			float: right; \
			opacity: 0.4; \
			padding: 10px; \
			width: 26px; \
			height: 22px; \
			background: no-repeat center center; \
			background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAWCAYAAADeiIy1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjY1RTYzOTA2ODZDRjExREJBNkUyRDg4N0NFQUNCNDA3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUwRjM3M0QxMDY5NTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUwRjM3M0QwMDY5NTExRTI5OUZEQTZGODg4RDc1ODdCIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTgwMTE3NDA3MjA2ODExODA4M0ZFMkJBM0M1RUU2NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNjgwMTE3NDA3MjA2ODExODA4M0U3NkRBMDNEMDVDMSIvPiA8ZGM6dGl0bGU+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPmdseXBoaWNvbnM8L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOnRpdGxlPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pn00ay4AAAEISURBVHjavJWBDYQgDEXhcgMwwm2gIzgCIzjCjeAIjsAIN8KN4Ai6wW3AtTm4EChYkdjkm2javLa2IKy1olZgL9CD5XsShI8PSF8B8pqvAqEWUJ8FYemglQhEmfg/gA0uhvLHVo5EUtmAf3ZgCoNB74xvLkEVgnwlJtOep8vSVihM9veRAKiDFdhCK/VdECal9JBONLSkIhzVBpWUW4cT1giSDEMMmqP+GjdxA2OPiuMdgxb3bQozOr2wBMhSGTFAppQYBZoqDtWR4ZuA1MFromf60gt7AKZyp0oo6UD4ImuWEJYbB6Dbi28BYsXfQJsLMBUQH7Nx/HWDU4B3le9cfCWtHAjqK8AAypyhqqqagq4AAAAASUVORK5CYII="); \
			display: none; \
		} \
		#SearchRES-results li:hover .SearchRES-result-copybutton { display: block; } \
		#SearchRES-input-submit { \
			margin-left: 8px; \
		} \
		#SearchRES-input { \
			width: 200px; \
			height: 22px; \
			font-size: 14px; \
		} \
		#SearchRES-input-container { \
			float: left; \
			margin-left: 3em; \
			margin-top: 7px; \
		} \
 	',
	searchPanelHtml: '\
		<h3>Search RES Settings Console</h3> \
		<div id="SearchRES-results-container"> \
			<h4>Results for: <span id="SearchRES-query"></span></h4> \
			<ul id="SearchRES-results"></ul> \
			<p id="SearchRES-results-none">No results found</p> \
		</div> \
		<div id="SearchRES-boilerplate"> \
			<p>You can search for RES options by module name, option name, and description. For example, try searching for "daily trick" in one of the following ways:</p> \
			<ul> \
				<li>type <code>daily trick</code> in the search box above and click the button</li> \
				<li>press <code>.</code> to open the RES console, type in <code>search <em>daily trick</em></code>, and press Enter</li> \
			</ul> \
		</div> \
	',
	searchPanel: null,
	renderSearchPanel: function() {
		var searchPanel = $('<div />').html(modules['settingsNavigation'].searchPanelHtml);
		searchPanel.on('click', '#SearchRES-results-container .SearchRES-result-item', modules['settingsNavigation'].handleSearchResultClick);

		modules['settingsNavigation'].searchPanel = searchPanel;
		return searchPanel;
	},
	searchForm: null,
	renderSearchForm: function() {
		var RESSearchContainer = RESUtils.createElementWithID('form', 'SearchRES-input-container');

		var RESSearchBox = RESUtils.createElementWithID('input', 'SearchRES-input');
		RESSearchBox.setAttribute('type', 'text');
		RESSearchBox.setAttribute('placeholder', 'search RES settings');

		var RESSearchButton = RESUtils.createElementWithID('input', 'SearchRES-input-submit');
		RESSearchButton.classList.add('blueButton');
		RESSearchButton.setAttribute('type', 'submit');
		RESSearchButton.setAttribute('value', 'search');

		RESSearchContainer.appendChild(RESSearchBox);
		RESSearchContainer.appendChild(RESSearchButton);

		RESSearchContainer.addEventListener('submit', function(e) {
			e.preventDefault();
			modules['settingsNavigation'].search(RESSearchBox.value);

			return false;
		});

		searchForm = RESSearchContainer;
		return RESSearchContainer;
	},
	drawSearchResultsPage: function() {
		if (!RESConsole.isOpen) {
			RESConsole.open();
		}

		if (!$('#SearchRES').is(':visible')) {
			RESConsole.openCategoryPanel('About RES');

			// Open "Search RES" page
			$('#Button-SearchRES', this.RESConsoleContent).trigger('click', {
				duration: 0
			});
		}
	},
	drawSearchResults: function(query, results) {
		modules['settingsNavigation'].drawSearchResultsPage();

		var resultsContainer = $('#SearchRES-results-container', modules['settingsNavigation'].searchPanel);

		if (!(query && query.length)) {
			resultsContainer.hide();
			return;
		}

		resultsContainer.show();
		resultsContainer.find('#SearchRES-query').text(query);
		$("#SearchRES-input", modules['settingsNavigation'].searchForm).val(query);

		if (!(results && results.length)) {
			resultsContainer.find('#SearchRES-results-none').show();
			resultsContainer.find('#SearchRES-results').hide();
		} else {
			resultsContainer.find('#SearchRES-results-none').hide();
			var resultsList = $('#SearchRES-results', resultsContainer).show();

			resultsList.empty();
			for (var i = 0; i < results.length; i++) {
				var result = results[i];

				var element = modules['settingsNavigation'].drawSearchResultItem(result);
				resultsList.append(element);
			}
		}
	},
	drawSearchResultItem: function(result) {
		var element = $('<li>');
		element.addClass('SearchRES-result-item')
			.data('SearchRES-result', result);

		$('<span>', {
			class: 'SearchRES-result-copybutton'
		})
			.appendTo(element)
			.attr('title', 'copy this for a comment');

		var breadcrumb = $('<span>', {
			class: 'SearchRES-breadcrumb'
		})
			.text(result.breadcrumb + ' > ');

		$('<div>', {
			class: 'SearchRES-result-title'
		})
			.append(breadcrumb)
			.append(result.title)
			.appendTo(element);

		$('<div>', {
			class: 'SearchRES-result-description'
		})
			.appendTo(element)
			.html(result.description);

		return element;
	},
	handleSearchResultClick: function(e) {
		var element = $(this);
		var result = element.data('SearchRES-result');
		if ($(e.target).is('.SearchRES-result-copybutton')) {
			modules['settingsNavigation'].onSearchResultCopy(result, element);
		} else {
			modules['settingsNavigation'].onSearchResultSelected(result);
		}
		e.preventDefault();
	},
	onSearchResultCopy: function(result, element) {
		var markdown = modules['settingsNavigation'].makeOptionSearchResultLink(result);
		alert('<textarea rows="5" cols="50">' + markdown + '</textarea>');
	},
	makeOptionSearchResultLink: function(result) {
		var url = document.location.pathname +
			modules['settingsNavigation'].makeUrlHash(result.moduleID, result.optionKey);

		var text = [
			result.breadcrumb,
			'[' + result.title + '](' + url + ')',
			'  \n',
			result.description,
			'  \n',
			'  \n'
		].join(' ');
		return text;
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
			values: [{
				name: 'hot',
				value: 'hot'
			}, {
				name: 'new',
				value: 'new'
			}, {
				name: 'controversial',
				value: 'controversial'
			}, {
				name: 'top',
				value: 'top'
			}],
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
	include: [
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if (this.isEnabled()) {
			this.getLatestWidgets();
			RESUtils.addCSS('.RESDashboardToggle { margin-right: 5px; color: white; background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('.RESDashboardToggle.remove { background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-remove.png) }');
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
		RESUtils.addCSS('.RESDashboardComponent { position: relative; border: 1px solid #ccc; border-radius: 3px 3px 3px 3px; overflow: hidden; margin-bottom: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader { box-sizing: border-box; padding: 5px 0 8px 0; background-color: #f0f3fc; overflow: hidden; }');
		RESUtils.addCSS('.RESDashboardComponentScrim { position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 5; display: none; }');
		RESUtils.addCSS('.RESDashboardComponentLoader { box-sizing: border-box; position: absolute; background-color: #f2f9ff; border: 1px solid #b9d7f4; border-radius: 3px 3px 3px 3px; width: 314px; height: 40px; left: 50%; top: 50%; margin-left: -167px; margin-top: -20px; text-align: center; padding-top: 11px; }');
		RESUtils.addCSS('.RESDashboardComponentLoader span { position: relative; top: -6px; left: 5px; } ');
		RESUtils.addCSS('.RESDashboardComponentContainer { padding: 10px 15px 0 15px; min-height: 100px; }');
		RESUtils.addCSS('.RESDashboardComponentContainer.minimized { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath, .addNewWidget, .editWidget { display: inline-block; margin-left: 0; margin-top: 7px; color: #000; font-weight: bold; }');
		RESUtils.addCSS('.editWidget { float: left; margin-right: 10px; } ');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath { margin-left: 15px; vertical-align: top; width: 120px; overflow: hidden; text-overflow: ellipsis; }');
		RESUtils.addCSS('#RESDashboardAddComponent, #RESDashboardEditComponent { box-sizing: border-box; padding: 5px 8px 5px 8px; vertical-align: middle; background-color: #cee3f8; border: 1px solid #369;}');
		RESUtils.addCSS('#RESDashboardEditComponent { display: none; position: absolute; }');
		// RESUtils.addCSS('#RESDashboardComponentScrim, #RESDashboardComponentLoader { background-color: #ccc; opacity: 0.3; border: 1px solid red; display: none; }');
		RESUtils.addCSS('#addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer { display: none; }');
		RESUtils.addCSS('#addWidgetButtons, #addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer, #editRedditFormContainer { width: auto; min-width: 550px; height: 28px; float: right; text-align: right; }');
		RESUtils.addCSS('#editRedditFormContainer { width: auto; }');
		RESUtils.addCSS('#addUserForm, #addRedditForm { display: inline-block }');
		RESUtils.addCSS('#addUser { width: 200px; height: 24px; }');
		RESUtils.addCSS('#addRedditFormContainer ul.token-input-list-facebook, #editRedditFormContainer ul.token-input-list-facebook { float: left; }');
		RESUtils.addCSS('#addReddit { width: 115px; background-color: #fff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('#addRedditDisplayName, #editRedditDisplayName { width: 140px; height: 24px; background-color: #fff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('#editReddit { width: 5px; } ');
		RESUtils.addCSS('.addButton, .updateButton { cursor: pointer; display: inline-block; width: auto; padding: 3px 5px; font-size: 11px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.cancelButton { width: 50px; text-align: center; cursor: pointer; display: inline-block; padding: 3px 5px; font-size: 11px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #D02020; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.backToWidgetTypes { display: inline-block; vertical-align: top; margin-top: 8px; font-weight: bold; color: #000; cursor: pointer; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul { font-family: Verdana; font-size: 13px; box-sizing: border-box; line-height: 22px; display: inline-block; margin-top: 2px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li { box-sizing: border-box; vertical-align: middle; height: 24px; display: inline-block; cursor: pointer; padding: 0 6px; border: 1px solid #c7c7c7; background-color: #fff; color: #6c6c6c; border-radius: 3px 3px 3px 3px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader .editButton { display: inline-block; padding: 0; width: 24px; -moz-box-sizing: border-box; vertical-align: middle; margin-left: 10px; } ');
		RESUtils.addCSS('.RESDashboardComponent.minimized ul li { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent.minimized li.RESClose, .RESDashboardComponent.minimized li.minimize { display: inline-block; }');
		RESUtils.addCSS('ul.widgetSortButtons li { margin-right: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li.active, .RESDashboardComponentHeader ul li:hover { background-color: #a6ccf1; color: #fff; border-color: #699dcf; }');
		RESUtils.addCSS('ul.widgetStateButtons li { margin-right: 5px; }');
		RESUtils.addCSS('ul.widgetStateButtons li:last-child { margin-right: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled { background-color: #ddd; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled:hover { cursor: auto; background-color: #ddd; color: #6c6c6c; border: 1px solid #c7c7c7; }');
		RESUtils.addCSS('ul.widgetSortButtons { margin-left: 10px; }');
		RESUtils.addCSS('ul.widgetStateButtons { float: right; margin-right: 8px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.updateTime { cursor: auto; background: none; border: none; color: #afafaf; font-size: 9px; padding-right: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.minimize, ul.widgetStateButtons li.close { font-size: 24px; }');
		RESUtils.addCSS('.minimized ul.widgetStateButtons li.minimize { font-size: 14px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh { margin-left: 3px; width: 24px; position:relative; padding: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh div { height: 16px; width: 16px; position: absolute; left: 4px; top: 4px; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-repeat: no-repeat; background-position: -16px -209px; }');
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
		for (var i in this.widgets)
			if (this.widgets[i]) this.addWidget(this.widgets[i]);

		setTimeout(function() {
			$('#RESDashboard').dragsort({
				dragSelector: "div.RESDashboardComponentHeader",
				dragSelectorExclude: 'a, li.refreshAll, li.refresh > div, .editButton',
				dragEnd: modules['dashboard'].saveOrder,
				placeHolderTemplate: "<li class='placeHolder'></li>"
			});
			// dragSelectorExclude: 'a, li.refreshAll, li.refresh > div, .editButton, div.placeHolder',
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
		var data = $("#siteTable li.RESDashboardComponent").map(function() {
			return $(this).attr("id");
		}).get();
		data.reverse();
		var newOrder = [];
		for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
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
		if ((location.hash !== '') && (location.hash !== '#dashboardContents')) {
			$('span.redditname a').removeClass('active');
			var activeTabID = location.hash.replace('#', '#tab-');
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
				<form id="editRedditForm"> \
					<input type="text" id="editReddit"> \
					<input type="text" id="editRedditDisplayName" placeholder="display name (e.g. stuff)"> \
					<input type="submit" class="updateButton" value="save changes"> \
					<input type="cancel" class="cancelButton" value="cancel"> \
				</form> \
			</div> \
		');
		var thisEle = $(this.dashboardEditComponent).find('#editReddit');

		$(this.dashboardEditComponent).find('#editRedditForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = $('#editReddit').val();
				if (thisBasePath !== '') {
					if (thisBasePath.indexOf(',') !== -1) {
						thisBasePath = thisBasePath.replace(/\,/g, '+');
					}
					modules['dashboard'].widgetBeingEdited.formerBasePath = modules['dashboard'].widgetBeingEdited.basePath;
					modules['dashboard'].widgetBeingEdited.basePath = '/r/' + thisBasePath;
					modules['dashboard'].widgetBeingEdited.displayName = $('#editRedditDisplayName').val();
					modules['dashboard'].widgetBeingEdited.update();
					$('#editReddit').tokenInput('clear');
					$('#RESDashboardEditComponent').fadeOut(function() {
						$('#editReddit').blur();
					});
					modules['dashboard'].widgetBeingEdited.widgetEle.find('.widgetPath').text(modules['dashboard'].widgetBeingEdited.displayName).attr('title', '/r/' + thisBasePath);
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
		$('#RESDashboardEditComponent').css('top', eleTop + 'px').css('left', '5px').css('width', (eleWidth + 2) + 'px').fadeIn('fast');
		basePath = basePath.replace(/^\/r\//, '');
		var prepop = [];
		var reddits = basePath.split('+');
		for (var i = 0, len = reddits.length; i < len; i++) {
			prepop.push({
				id: reddits[i],
				name: reddits[i]
			});
		}
		if (typeof modules['dashboard'].firstEdit === 'undefined') {
			$('#editReddit').tokenInput('/api/search_reddit_names.json?app=res', {
				method: "POST",
				queryParam: "query",
				theme: "facebook",
				allowFreeTagging: true,
				zindex: 999999999,
				onResult: function(response) {
					var names = response.names;
					var results = [];
					for (var i = 0, len = names.length; i < len; i++) {
						results.push({
							id: names[i],
							name: names[i]
						});
					}
					if (names.length === 0) {
						var failedQueryValue = $('#token-input-editReddit').val();
						results.push({
							id: failedQueryValue,
							name: failedQueryValue,
							failedResult: true
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
					if (names.length === 0) {
						var failedQueryValue = $('#token-input-editReddit').val();
						results.push({
							id: failedQueryValue,
							name: failedQueryValue,
							failedResult: true
						});
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
			for (var i = 0, len = prepop.length; i < len; i++) {
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
				<form id="addUserForm"> \
					<input type="text" id="addUser"> \
					<input type="submit" class="addButton" value="+add"> \
				</form> \
			</div> \
			<div id="addRedditFormContainer" class="addRedditForm"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<form id="addRedditForm"> \
					<input type="text" id="addReddit"> \
					<input type="text" id="addRedditDisplayName" placeholder="display name (e.g. stuff)"> \
					<input type="submit" class="addButton" value="+add"> \
				</form> \
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
			allowFreeTagging: true,
			zindex: 999999999,
			onResult: function(response) {
				var names = response.names;
				var results = [];
				for (var i = 0, len = names.length; i < len; i++) {
					results.push({
						id: names[i],
						name: names[i]
					});
				}
				if (names.length === 0) {
					var failedQueryValue = $('#token-input-addReddit').val();
					results.push({
						id: failedQueryValue,
						name: failedQueryValue,
						failedResult: true
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
				if (names.length === 0) {
					var failedQueryValue = $('#token-input-addReddit').val();
					results.push({
						id: failedQueryValue,
						name: failedQueryValue,
						failedResult: true
					});
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
				if (thisBasePath !== '') {
					if (thisBasePath.indexOf(',') !== -1) {
						thisBasePath = thisBasePath.replace(/\,/g, '+');
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
				var thisBasePath = '/user/' + $('#addUser').val();
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
		if (optionsObject.basePath.slice(0, 1) !== '/') optionsObject.basePath = '/r/' + optionsObject.basePath;
		var exists = false;
		for (var i = 0, len = this.widgets.length; i < len; i++) {
			if (this.widgets[i].basePath == optionsObject.basePath) {
				exists = true;
				break;
			}
		}
		// hide any shortcut button for this widget, since it exists... wait a second, though, or it causes rendering stupidity.
		setTimeout(function() {
			$('.widgetShortcut[widgetPath="' + optionsObject.basePath + '"]').hide();
		}, 1000);
		if (exists && isNew) {
			alert('A widget for ' + optionsObject.basePath + ' already exists!');
		} else {
			var thisWidget = new this.widgetObject(optionsObject);
			thisWidget.init();
			modules['dashboard'].saveWidget(thisWidget.optionsObject());
		}
	},
	removeWidget: function(optionsObject) {
		this.getLatestWidgets();
		var exists = false;
		for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
			if (modules['dashboard'].widgets[i].basePath == optionsObject.basePath) {
				exists = true;
				$('#' + modules['dashboard'].widgets[i].basePath.replace(/\/|\+/g, '_')).fadeOut('slow', function(ele) {
					$(this).detach();
				});
				modules['dashboard'].widgets.splice(i, 1);
				// show any shortcut button for this widget, since we've now deleted it...
				setTimeout(function() {
					$('.widgetShortcut[widgetPath="' + optionsObject.basePath + '"]').show();
				}, 1000);
				break;
			}
		}
		if (!exists) {
			modules['notifications'].showNotification({
				moduleID: 'dashboard',
				type: 'error',
				message: 'The widget you just tried to remove does not seem to exist.'
			});
		}
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	saveWidget: function(optionsObject, init) {
		this.getLatestWidgets();
		var exists = false;
		for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
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
		for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
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
		if ((typeof widgetOptions.displayName === 'undefined') || (widgetOptions.displayName === null)) {
			widgetOptions.displayName = thisWidget.basePath;
		}
		thisWidget.displayName = widgetOptions.displayName;
		thisWidget.numPosts = widgetOptions.numPosts || modules['dashboard'].options.defaultPosts.value;
		thisWidget.sortBy = widgetOptions.sortBy || modules['dashboard'].options.defaultSort.value;
		thisWidget.minimized = widgetOptions.minimized || false;
		thisWidget.widgetEle = $('<li class="RESDashboardComponent" id="' + thisWidget.basePath.replace(/\/|\+/g, '_') + '"><div class="RESDashboardComponentScrim"><div class="RESDashboardComponentLoader"><img id="dashboardLoader" src="' + modules['dashboard'].loader + '"><span>querying the server. one moment please.</span></div></div></li>');
		var editButtonHTML = (thisWidget.basePath.indexOf('/r/') === -1) ? '' : '<div class="editButton" title="edit"></div>';
		thisWidget.header = $('<div class="RESDashboardComponentHeader"><a class="widgetPath" title="' + thisWidget.basePath + '" href="' + thisWidget.basePath + '">' + thisWidget.displayName + '</a></div>');
		thisWidget.sortControls = $('<ul class="widgetSortButtons"><li sort="hot">hot</li><li sort="new">new</li><li sort="controversial">controversial</li><li sort="top">top</li></ul>');
		// return an optionsObject, which is what we'll store in the modules['dashboard'].widgets array.
		thisWidget.optionsObject = function() {
			return {
				basePath: thisWidget.basePath,
				displayName: thisWidget.displayName,
				numPosts: thisWidget.numPosts,
				sortBy: thisWidget.sortBy,
				minimized: thisWidget.minimized
			};
		};
		// set the sort by properly...
		$(thisWidget.sortControls).find('li[sort=' + thisWidget.sortBy + ']').addClass('active');
		$(thisWidget.sortControls).find('li').click(function(e) {
			thisWidget.sortChange($(e.target).attr('sort'));
		});
		$(thisWidget.header).append(thisWidget.sortControls);
		if ((thisWidget.basePath.indexOf('/r/') !== 0) && (thisWidget.basePath.indexOf('/user/') !== 0)) {
			setTimeout(function() {
				$(thisWidget.sortControls).hide();
			}, 100);
		}
		thisWidget.stateControls = $('<ul class="widgetStateButtons"><li class="updateTime"></li><li action="refresh" class="refresh"><div action="refresh"></div></li><li action="refreshAll" class="refreshAll">Refresh All</li><li action="addRow">+row</li><li action="subRow">-row</li><li action="edit" class="editButton"></li><li action="minimize" class="minimize">-</li><li action="delete" class="RESClose">&times;</li></ul>');
		$(thisWidget.stateControls).find('li').click(function(e) {
			switch ($(e.target).attr('action')) {
				case 'refresh':
					thisWidget.update();
					break;
				case 'refreshAll':
					$('li[action="refresh"]').click();
					break;
				case 'addRow':
					if (thisWidget.numPosts === 10) break;
					thisWidget.numPosts++;
					if (thisWidget.numPosts === 10) $(thisWidget.stateControls).find('li[action=addRow]').addClass('disabled');
					$(thisWidget.stateControls).find('li[action=subRow]').removeClass('disabled');
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					thisWidget.update();
					break;
				case 'subRow':
					if (thisWidget.numPosts === 0) break;
					thisWidget.numPosts--;
					if (thisWidget.numPosts === 1) $(thisWidget.stateControls).find('li[action=subRow]').addClass('disabled');
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
			$(thisWidget.header).find('ul.widgetSortButtons li[sort=' + sortBy + ']').addClass('active');
			thisWidget.update();
			modules['dashboard'].saveWidget(thisWidget.optionsObject());
		};
		thisWidget.edit = function(e) {
			modules['dashboard'].widgetBeingEdited = thisWidget;
			modules['dashboard'].showEditForm();
		};
		$(thisWidget.header).find('.editButton').click(thisWidget.edit);
		thisWidget.update = function() {
			if (thisWidget.basePath.indexOf('/user/') !== -1) {
				thisWidget.sortPath = (thisWidget.sortBy === 'hot') ? '/' : '?sort=' + thisWidget.sortBy;
			} else if (thisWidget.basePath.indexOf('/r/') !== -1) {
				thisWidget.sortPath = (thisWidget.sortBy === 'hot') ? '/' : '/' + thisWidget.sortBy + '/';
			} else {
				thisWidget.sortPath = '';
			}
			thisWidget.url = location.protocol + '//' + location.hostname + '/' + thisWidget.basePath + thisWidget.sortPath;
			$(thisWidget.contents).fadeTo('fast', 0.25);
			$(thisWidget.scrim).fadeIn();
			$.ajax({
				url: thisWidget.url,
				data: {
					limit: thisWidget.numPosts
				},
				success: thisWidget.populate,
				error: thisWidget.error
			});
		};
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
		};
		thisWidget.draw = function() {
			$(thisWidget.widgetEle).append(thisWidget.header);
			$(thisWidget.widgetEle).append(thisWidget.container);
			if (thisWidget.minimized) $(thisWidget.widgetEle).addClass('minimized');
			modules['dashboard'].dashboardUL.prepend(thisWidget.widgetEle);
			// $(thisWidget.scrim).fadeIn();
		};
		thisWidget.populate = function(response) {
			var $widgetContent = $(response).find('#siteTable'),
				$thisWidgetContents = $(thisWidget.contents);

			$widgetContent.attr('id', 'siteTable_' + thisWidget.basePath.replace(/\/|\+/g, '_'));
			if ($widgetContent.length === 2) $widgetContent = $($widgetContent[1]);
			$widgetContent.attr('url', thisWidget.url + '?limit=' + thisWidget.numPosts);
			if (($widgetContent.length > 0) && ($widgetContent.html() !== '')) {
				$widgetContent.html($widgetContent.html().replace(/<script(.|\s)*?\/script>/g, ''));

				// $widgetContent will contain HTML from Reddit's page load. No XSS here or you'd already be hit, can't call escapeHTML on this either and wouldn't help anyhow.
				try {
					$thisWidgetContents.empty().append($widgetContent);
				} catch (e) {
					// console.log(e);
				}
				
				$thisWidgetContents.fadeTo('fast', 1);
				$(thisWidget.scrim).fadeOut(function(e) {
					$(this).hide(); // make sure it is hidden in case the element isn't visible due to being on a different dashboard tab
				});
			} else {
				if (thisWidget.url.indexOf('/message/') !== -1) {
					$thisWidgetContents.html('<div class="widgetNoMail">No messages were found.</div>');
				} else {
					$thisWidgetContents.html('<div class="error">There were no results returned for this widget. If you made a typo, simply close the widget to delete it. If reddit is just under heavy load, try clicking refresh in a few moments.</div>');
				}
				$thisWidgetContents.fadeTo('fast', 1);
				$(thisWidget.scrim).fadeOut();
			}
			$(thisWidget.stateControls).find('.updateTime').text('updated: ' + RESUtils.niceDateTime());

			// now run watcher functions from other modules on this content...
			RESUtils.watchers.siteTable.forEach(function(callback) {
				if (callback) callback($widgetContent[0]);
			});
		};
		thisWidget.error = function(xhr, err) {
			// alert('There was an error loading data for this widget. Did you type a bad path, perhaps? Removing this widget automatically.');
			// modules['dashboard'].removeWidget(thisWidget.optionsObject());
			if (xhr.status === 404) {
				$(thisWidget.contents).html('<div class="error">This widget received a 404 not found error. You may have made a typo when adding it.</div>');
			} else {
				$(thisWidget.contents).html('<div class="error">There was an error loading data for this widget. Reddit may be under heavy load, or you may have provided an invalid path.</div>');
			}
			$(thisWidget.scrim).fadeOut();
			$(thisWidget.contents).fadeTo('fast', 1);
		};
	},
	addDashboardShortcuts: function() {
		var subButtons = document.querySelectorAll('.fancy-toggle-button');
		for (var h = 0, len = subButtons.length; h < len; h++) {
			var subButton = subButtons[h];
			if ((RESUtils.currentSubreddit().indexOf('+') === -1) && (RESUtils.currentSubreddit() !== 'mod')) {
				var thisSubredditFragment = RESUtils.currentSubreddit();
				var isMulti = false;
			} else if ($(subButton).parent().hasClass('subButtons')) {
				var isMulti = true;
				var thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
			} else {
				var isMulti = true;
				var thisSubredditFragment = $(subButton).next().text();
			}
			if (!($('#subButtons-' + thisSubredditFragment).length > 0)) {
				var subButtonsWrapper = $('<div id="subButtons-' + thisSubredditFragment + '" class="subButtons" style="margin: 0 !important;"></div>');
				$(subButton).wrap(subButtonsWrapper);
				// move this wrapper to the end (after any icons that may exist...)
				if (isMulti) {
					var theWrap = $(subButton).parent();
					$(theWrap).appendTo($(theWrap).parent());
				}
			}
			var dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class', 'REStoggle RESDashboardToggle');
			dashboardToggle.setAttribute('data-subreddit', thisSubredditFragment);
			var exists = false;
			for (var i = 0, sublen = this.widgets.length; i < sublen; i++) {
				if ((this.widgets[i]) && (this.widgets[i].basePath.toLowerCase() === '/r/' + thisSubredditFragment.toLowerCase())) {
					exists = true;
					break;
				}
			}
			if (exists) {
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title', 'Remove this subreddit from your dashboard');
				dashboardToggle.classList.add('remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
				dashboardToggle.setAttribute('title', 'Add this subreddit to your dashboard');
			}
			dashboardToggle.setAttribute('data-subreddit', thisSubredditFragment)
			dashboardToggle.addEventListener('click', modules['dashboard'].toggleDashboard, false);
			$('#subButtons-' + thisSubredditFragment).append(dashboardToggle);
			var next = $('#subButtons-' + thisSubredditFragment).next();
			if ($(next).hasClass('title') && (!$('#subButtons-' + thisSubredditFragment).hasClass('swapped'))) {
				$('#subButtons-' + thisSubredditFragment).before($(next));
				$('#subButtons-' + thisSubredditFragment).addClass('swapped');
			}
		}
	},
	toggleDashboard: function(e) {
		var thisBasePath = '/r/' + $(e.target).data('subreddit');
		if (e.target.classList.contains('remove')) {
			modules['dashboard'].removeWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '+dashboard';
			e.target.classList.remove('remove');
		} else {
			modules['dashboard'].addWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '-dashboard';
			modules['notifications'].showNotification({
				header: 'Dashboard Notification',
				moduleID: 'dashboard',
				message: 'Dashboard widget added for ' + thisBasePath + ' <p><a class="RESNotificationButtonBlue" href="/r/Dashboard">view the dashboard</a></p><div class="clear"></div>'
			});
			e.target.classList.add('remove');
		}
	},
	addTab: function(tabID, tabName) {
		$('#siteTable.linklisting').append('<div id="' + tabID + '" class="dashboardPane" />');
		$('span.redditname').append('<a id="tab-' + tabID + '" class="dashboardTab" title="' + tabName + '">' + tabName + '</a>');
		$('#tab-' + tabID).click(function(e) {
			location.hash = tabID;
			$('span.redditname a').removeClass('active');
			$(this).addClass('active');
			$('.dashboardPane').hide();
			$('#' + tabID).show();
		});
	}
};


addModule('notifications', function (module, moduleID) {
	$.extend(module, {
		moduleName: 'RES Notifications',
		category: 'UI',
		description: 'Manage pop-up notifications for RES functions',
		include: [
			/.*/i
		]
	});
	module.options = {
		closeDelay: {
			type: 'text',
			value: 3000,
			description: 'Delay, in milliseconds, before notification fades away'
		},
		sticky: {
			description: 'Allow notifications to be "sticky" and stay visible until you manually close them',
			type: 'enum',
			value: 'perNotification',
			values: [{
				name: 'notificationType',
				value: 'notificationType'
			}, {
				name: 'all',
				value: 'all'
			}, {
				name: 'none',
				value: 'none'
			}]
		},
		notificationTypes: {
			description: 'Manage different types of notifications',
			type: 'table',
			addRowText: 'manually register notification type',
			fields: [
				{ 
					name: 'moduleID',
					type: 'text'
				},
				{
					name: 'notificationID',
					type: 'text'
				},
				{
					name: 'enabled',
					type: 'boolean',
					value: true
				},
				{
					name: 'sticky',
					type: 'boolean',
					value: false
				}
			]
		}
	};

	module.saveOptions =function() {
		RESStorage.setItem('RESoptions.notifications', JSON.stringify(modules['notifications'].options));
	};
	var addNotificationTypeOption = function (notificationType) {
		var option = modules['notifications'].options['notificationTypes'];
		var value = RESUtils.mapObjectToTableOptionValue(modules['notifications'].options.notificationTypes, notificationType);
		option.value = option.value || [];
		option.value.push(value);

		modules['notifications'].saveOptions();
		return option.value[option.value.length - 1];
	};
	module.getOrAddNotificationType = function(notification) {
		var option = modules['notifications'].options['notificationTypes'];
		var notificationTypeKey = {
			moduleID: RESUtils.firstValid(notification.moduleID, '--'),
			notificationID: RESUtils.firstValid(notification.notificationID, notification.optionKey, notification.header, RESUtils.hashCode(notification.message || '')),
		};
		var notificationMetadata = $.extend({}, notification, notificationTypeKey);

		var optionValue = getNotificationTypeOption(notificationTypeKey);
		if (!optionValue) {
			optionValue = addNotificationTypeOption(notificationMetadata);
		}

		var notificationType = RESUtils.mapTableOptionValueToObject(modules['notifications'].options.notificationTypes, optionValue, notificationMetadata);

		return notificationType;
	};
	var getNotificationTypeOption = function(notificationType) {
		var value;
		var values = modules['notifications'].options['notificationTypes'].value;
		for (var i = 0, length = values.length; i < length; i++) {
			value = values[i];
			if (value[0] == notificationType.moduleID && value[1] == notificationType.notificationID) {
				break; 
			}
		}
		if (i < length) {
			return value;
		}
	};
	module.enableNotificationType = function(notificationType, enabled) {
		var value = getNotificationTypeOption(notificationType);
		value[2] = !!enabled;
		modules['notifications'].saveOptions();
	};

	module.showNotification = function(contentObj, delay) {
		if (!module.isEnabled()) return;
		if (typeof contentObj.message === 'undefined') {
			if (typeof contentObj === 'string') {
				contentObj = { message: contentObj };
			} else {
				return false;
			}
		}

		var notificationType = module.getOrAddNotificationType(contentObj);
		 if (!notificationType.enabled) return;

		contentObj.renderedHeader = renderHeaderHtml(contentObj, notificationType);

		setupNotificationsContainer();

		var thisNotification = createNotificationElement(contentObj, notificationType);
		
		thisNotification.querySelector('.RESNotificationToggle input').addEventListener('change', function(e) {
			modules['notifications'].enableNotificationType(notificationType, e.target.checked);
		});
		var thisNotificationCloseButton = thisNotification.querySelector('.RESNotificationClose');
		thisNotificationCloseButton.addEventListener('click', function(e) {
			var thisNotification = e.target.parentNode.parentNode;
			modules['notifications'].closeNotification(thisNotification);
		}, false);

		var isSticky = modules['notifications'].options.sticky.value == 'all'
			|| (modules['notifications'].options.sticky.value == 'notificationType' && notificationType.sticky);
		if (!isSticky) {
			module.setCloseNotificationTimer(thisNotification, delay);
		} 
		module.RESNotifications.style.display = 'block';
		module.RESNotifications.appendChild(thisNotification);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'notification');
		RESUtils.fadeElementIn(thisNotification, 0.2, 1);
		module.notificationCount++;

		return {
			element: thisNotification,
			close: function() { module.closeNotification(thisNotification); }
		}
	};

	function renderHeaderHtml(contentObj, notificationType) {
		var header;
		if (contentObj.header) {
			header = contentObj.header;
		} else {
			header = [];

			if (contentObj.moduleID && modules[contentObj.moduleID]) {
				header.push(modules[contentObj.moduleID].moduleName);
			}

			if (contentObj.type === 'error') {
				header.push('Error');
			} else {
				header.push('Notification');
			}


			header = header.join(' ');
		}

		if (contentObj.moduleID && modules[contentObj.moduleID]) {
			header += modules['settingsNavigation'].makeUrlHashLink(contentObj.moduleID, contentObj.optionKey, ' ', 'gearIcon');
		}

		header += '<label class="RESNotificationToggle">Enabled <input type="checkbox" checked></label>';

		return header;
	}

	function setupNotificationsContainer() {
		if (typeof module.notificationCount === 'undefined') {
			module.adFrame = document.body.querySelector('#ad-frame');
			if (module.adFrame) {
				module.adFrame.style.display = 'none';
			}
			module.notificationCount = 0;
			module.notificationTimers = [];
			module.RESNotifications = RESUtils.createElementWithID('div', 'RESNotifications');
			document.body.appendChild(module.RESNotifications);
		}
	}

	function createNotificationElement(contentObj, notificationType) {
		var thisNotification = document.createElement('div');
		thisNotification.classList.add('RESNotification');
		thisNotification.setAttribute('id', 'RESNotification-' + module.notificationCount);
		$(thisNotification).html('<div class="RESNotificationHeader"><h3>' + contentObj.renderedHeader + '</h3><div class="RESNotificationClose RESCloseButton">&times;</div></div><div class="RESNotificationContent">' + contentObj.message + '</div>');
		thisNotification.querySelector('.RESNotificationToggle').setAttribute('title', 'Show notifications from ' + notificationType.moduleID + ' - ' + notificationType.notificationID);
		return thisNotification;
	}

	module.setCloseNotificationTimer = function(e, delay) {
		delay = RESUtils.firstValid(delay, parseInt(modules['notifications'].options['closeDelay'].value, 10), modules['notifications'].options['closeDelay'].default);
		var thisNotification = (typeof e.currentTarget !== 'undefined') ? e.currentTarget : e;
		var thisNotificationID = thisNotification.getAttribute('id').split('-')[1];
		thisNotification.classList.add('timerOn');
		clearTimeout(modules['notifications'].notificationTimers[thisNotificationID]);
		var thisTimer = setTimeout(function() {
			modules['notifications'].closeNotification(thisNotification);
		}, delay);
		modules['notifications'].notificationTimers[thisNotificationID] = thisTimer;
		thisNotification.addEventListener('mouseover', modules['notifications'].cancelCloseNotificationTimer, false);
		thisNotification.removeEventListener('mouseout', modules['notifications'].setCloseNotification, false);
	};
	module.cancelCloseNotificationTimer = function(e) {
		var thisNotificationID = e.currentTarget.getAttribute('id').split('-')[1];
		e.currentTarget.classList.remove('timerOn');
		clearTimeout(modules['notifications'].notificationTimers[thisNotificationID]);
		e.target.removeEventListener('mouseover', modules['notifications'].cancelCloseNotification, false);
		e.currentTarget.addEventListener('mouseout', modules['notifications'].setCloseNotificationTimer, false);
	};
	module.closeNotification = function(ele) {
		RESUtils.fadeElementOut(ele, 0.1, modules['notifications'].notificationClosed);
	};
	module.notificationClosed = function(ele) {
		var notifications = modules['notifications'].RESNotifications.querySelectorAll('.RESNotification'),
			destroyed = 0;
		for (var i = 0, len = notifications.length; i < len; i++) {
			if (notifications[i].style.opacity === '0') {
				notifications[i].parentNode.removeChild(notifications[i]);
				destroyed++;
			}
		}
		if (destroyed == notifications.length) {
			modules['notifications'].RESNotifications.style.display = 'none';
			if (RESUtils.adFrame) RESUtils.adFrame.style.display = 'block';
		}

		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'notification');
	};
});

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
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var css = '';
			css += '.subredditInfoToolTip .subredditLabel { float: left; width: 140px; margin-bottom: 12px; }';
			css += '.subredditInfoToolTip .subredditDetail { float: left; width: 240px; margin-bottom: 12px; }';
			css += '.subredditInfoToolTip .blueButton { float: right; margin-left: 8px; }';
			css += '.subredditInfoToolTip .redButton { float: right; margin-left: 8px; }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// create a cache for subreddit data so we only load it once even if the hover is triggered many times
			this.subredditInfoCache = [];
			this.srRe = /\/r\/(\w+)(?:\/(new|rising|controversial|top))?\/?$/i;

			// get subreddit links and add event listeners...
			this.addListeners();
			RESUtils.watchForElement('siteTable', modules['subredditInfo'].addListeners);
		}
	},
	addListeners: function(ele) {
		var ele = ele || document.body;
		var subredditLinks = document.body.querySelectorAll('.listing-page a.subreddit, .comment .md a[href^="/r/"]');
		if (subredditLinks) {
			var len = subredditLinks.length;
			for (var i = 0; i < len; i++) {
				var thisSRLink = subredditLinks[i];
				if (modules['subredditInfo'].srRe.test(thisSRLink.href)) {
					thisSRLink.addEventListener('mouseover', function(e) {
						modules['hover'].begin(e.target, {
							width: 450,
							openDelay: modules['subredditInfo'].options.hoverDelay.value,
							fadeDelay: modules['subredditInfo'].options.fadeDelay.value,
							fadeSpeed: modules['subredditInfo'].options.fadeSpeed.value
						}, modules['subredditInfo'].showSubredditInfo, {});
					}, false);
				}
			}
		}
	},
	showSubredditInfo: function(def, obj, context) {
		var mod = modules['subredditInfo'];
		var thisSubreddit = obj.href.replace(/.*\/r\//, '').replace(/\/$/, '');
		var header = document.createDocumentFragment();
		var link = $('<a href="/r/' + escapeHTML(thisSubreddit) + '">/r/' + escapeHTML(thisSubreddit) + '</a>');
		header.appendChild(link[0]);
		if (RESUtils.loggedInUser()) {
			var subscribeToggle = $('<span />');
			subscribeToggle
				.attr('id', 'RESHoverInfoSubscriptionButton')
				.addClass('RESFilterToggle')
				.css('margin-left', '12px')
				.hide()
				.on('click', modules['subredditInfo'].toggleSubscription);
			modules['subredditInfo'].updateToggleButton(subscribeToggle, false);

			header.appendChild(subscribeToggle[0]);
		}
		var body = '\
			<div class="subredditInfoToolTip">\
				<a class="hoverSubreddit" href="/user/' + escapeHTML(thisSubreddit) + '">' + escapeHTML(thisSubreddit) + '</a>:<br>\
				<span class="RESThrobber"></span> loading...\
			</div>';
		def.notify(header, null);
		if (typeof mod.subredditInfoCache[thisSubreddit] !== 'undefined') {
			mod.writeSubredditInfo(mod.subredditInfoCache[thisSubreddit], def);
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + "//" + location.hostname + "/r/" + thisSubreddit + "/about.json?app=res",
				onload: function(response) {
					var thisResponse = safeJSON.parse(response.responseText, null, true);
					if (thisResponse) {
						mod.updateCache(thisSubreddit, thisResponse);
						mod.writeSubredditInfo(thisResponse, def);
					} else {
						mod.writeSubredditInfo({}, def);
					}
				}
			});
		}
	},
	updateCache: function(subreddit, data) {
		subreddit = subreddit.toLowerCase();
		if (!data.data) {
			data = {
				data: data
			};
		}
		this.subredditInfoCache = this.subredditInfoCache || [];
		this.subredditInfoCache[subreddit] = $.extend(true, {}, this.subredditInfoCache[subreddit], data);
	},
	writeSubredditInfo: function(jsonData, deferred) {
		if (!jsonData.data) {
			var srHTML = '<div class="subredditInfoToolTip">Subreddit not found</div>';
			var newBody = $(srHTML);
			deferred.resolve(null, newBody)
			return;
		}
		var utctime = jsonData.data.created_utc;
		var d = new Date(utctime * 1000);
		var isOver18;
		jsonData.data.over18 === true ? isOver18 = 'Yes' : isOver18 = 'No';
		var srHTML = '<div class="subredditInfoToolTip">';
		srHTML += '<div class="subredditLabel">Subreddit created:</div> <div class="subredditDetail">' + RESUtils.niceDate(d, this.options.USDateFormat.value) + ' (' + RESUtils.niceDateDiff(d) + ')</div>';
		srHTML += '<div class="subredditLabel">Subscribers:</div> <div class="subredditDetail">' + RESUtils.addCommas(jsonData.data.subscribers) + '</div>';
		srHTML += '<div class="subredditLabel">Title:</div> <div class="subredditDetail">' + escapeHTML(jsonData.data.title) + '</div>';
		srHTML += '<div class="subredditLabel">Over 18:</div> <div class="subredditDetail">' + escapeHTML(isOver18) + '</div>';
		// srHTML += '<div class="subredditLabel">Description:</div> <div class="subredditDetail">' + jsonData.data.description + '</div>';
		srHTML += '<div class="clear"></div><div id="subTooltipButtons" class="bottomButtons">';
		srHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		srHTML += '</div>';

		var newBody = $(srHTML);
		// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
		if (modules['subredditManager'].isEnabled()) {
			var theSC = document.createElement('span');
			theSC.setAttribute('style', 'display: inline-block !important;');
			theSC.setAttribute('class', 'REStoggle RESshortcut RESshortcutside');
			theSC.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var idx = -1;
			for (var i = 0, len = modules['subredditManager'].mySubredditShortcuts.length; i < len; i++) {
				if (modules['subredditManager'].mySubredditShortcuts[i].subreddit.toLowerCase() == jsonData.data.display_name.toLowerCase()) {
					idx = i;
					break;
				}
			}
			if (idx !== -1) {
				theSC.textContent = '-shortcut';
				theSC.setAttribute('title', 'Remove this subreddit from your shortcut bar');
				theSC.classList.add('remove');
			} else {
				theSC.textContent = '+shortcut';
				theSC.setAttribute('title', 'Add this subreddit to your shortcut bar');
			}
			theSC.addEventListener('click', modules['subredditManager'].toggleSubredditShortcut, false);

			newBody.find('#subTooltipButtons').append(theSC);
		}
		if (modules['dashboard'].isEnabled()) {
			var dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class', 'RESDashboardToggle');
			dashboardToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var exists = false;
			for (var i = 0, len = modules['dashboard'].widgets.length; i < len; i++) {
				if ((modules['dashboard'].widgets[i]) && (modules['dashboard'].widgets[i].basePath.toLowerCase() === '/r/' + jsonData.data.display_name.toLowerCase())) {
					exists = true;
					break;
				}
			}
			if (exists) {
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title', 'Remove this subreddit from your dashboard');
				dashboardToggle.classList.add('remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
				dashboardToggle.setAttribute('title', 'Add this subreddit to your dashboard');
			}
			dashboardToggle.addEventListener('click', modules['dashboard'].toggleDashboard, false);
			newBody.find('#subTooltipButtons').append(dashboardToggle);
		}
		if (modules['filteReddit'].isEnabled()) {
			var filterToggle = document.createElement('span');
			filterToggle.setAttribute('class', 'RESFilterToggle');
			filterToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
			var exists = false;
			var filteredReddits = modules['filteReddit'].options.subreddits.value;
			for (var i = 0, len = filteredReddits.length; i < len; i++) {
				if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() == jsonData.data.display_name.toLowerCase())) {
					exists = true;
					break;
				}
			}
			if (exists) {
				filterToggle.textContent = '-filter';
				filterToggle.setAttribute('title', 'Stop filtering from /r/all and /domain/*');
				filterToggle.classList.add('remove');
			} else {
				filterToggle.textContent = '+filter';
				filterToggle.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
			}
			filterToggle.addEventListener('click', modules['filteReddit'].toggleFilter, false);
			newBody.find('#subTooltipButtons').append(filterToggle);
		}

		if (RESUtils.loggedInUser()) {
			var subscribed = !! jsonData.data.user_is_subscriber;

			var subscribeToggle = $('#RESHoverInfoSubscriptionButton');
			subscribeToggle.attr('data-subreddit', jsonData.data.display_name.toLowerCase());
			modules['subredditInfo'].updateToggleButton(subscribeToggle, subscribed);
			subscribeToggle.fadeIn('fast');
		}

		deferred.resolve(null, newBody)
	},
	updateToggleButton: function(toggleButton, subscribed) {
		if (toggleButton instanceof jQuery) toggleButton = toggleButton[0];
		var toggleOn = '+subscribe';
		var toggleOff = '-unsubscribe';
		if (subscribed) {
			toggleButton.textContent = toggleOff;
			toggleButton.classList.add('remove');
		} else {
			toggleButton.textContent = toggleOn;
			toggleButton.classList.remove('remove');
		}
	},
	toggleSubscription: function(e) {
		// Get info
		var subscribeToggle = e.target;
		var subreddit = subscribeToggle.getAttribute('data-subreddit').toLowerCase();
		var subredditData = modules['subredditInfo'].subredditInfoCache[subreddit].data;
		var subscribing = !subredditData.user_is_subscriber;

		modules['subredditInfo'].updateToggleButton(subscribeToggle, subscribing);

		modules['subredditManager'].subscribeToSubreddit(subredditData.name, subscribing);
		modules['subredditInfo'].updateCache(subreddit, {
			'user_is_subscriber': subscribing
		});
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
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			m_chp.bindToHideLinks();
			m_chp.hideHiddenThings();
		}
	},
	bindToHideLinks: function() {
		/**
		 * For every expand/collapse link, add a click listener that will
		 * store or remove the comment ID from our list of hidden comments.
		 **/
		$('body').on('click', 'a.expand', function() {
			var thing = $(this).parents('.thing'),
				thingId = thing.data('fullname'),
				collapsing = !$(this).parent().is('.collapsed');

			/* Add our key to pages interacted with, for potential pruning
			   later */
			if (m_chp.hiddenKeys.indexOf(m_chp.hiddenThingsKey) === -1) {
				m_chp.hiddenKeys.push(m_chp.hiddenThingsKey);
			}

			if (collapsing) {
				m_chp.addHiddenThing(thingId);
			} else {
				m_chp.removeHiddenThing(thingId);
			}
		});
	},
	loadHiddenThings: function() {
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
					for (var i = pruneStart; i < m_chp.hiddenKeys.length; i++) {
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
			} catch (e) {}
		}
	},
	addHiddenThing: function(thingId) {
		var i = m_chp.hiddenThings.indexOf(thingId);
		if (i === -1) {
			m_chp.hiddenThings.push(thingId);
		}
		m_chp.syncHiddenThings();
	},
	removeHiddenThing: function(thingId) {
		var i = m_chp.hiddenThings.indexOf(thingId);
		if (i !== -1) {
			m_chp.hiddenThings.splice(i, 1);
		}
		m_chp.syncHiddenThings();
	},
	syncHiddenThings: function() {
		var hidePersistorData;
		m_chp.allHiddenThings[m_chp.hiddenThingsKey] = m_chp.hiddenThings;
		hidePersistorData = {
			'hiddenThings': m_chp.allHiddenThings,
			'hiddenKeys': m_chp.hiddenKeys
		}
		RESStorage.setItem('RESmodules.commentHidePersistor.hidePersistor', JSON.stringify(hidePersistorData));
	},
	hideHiddenThings: function() {
		m_chp.loadHiddenThings();

		for (var i = 0, il = m_chp.hiddenThings.length; i < il; i++) {
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
				(function($hideLink) {
					window.setTimeout(function() {
						// $hideLink.click();
						RESUtils.click($hideLink);
					}, 0);
				})($hideLink);
			}
		}
	}
};



modules['bitcointip'] = {
	moduleID: 'bitcointip',
	moduleName: 'bitcointip',
	category: 'Users',
	disabledByDefault: true,
	description: 'Send <a href="http://bitcoin.org/" target="_blank">bitcoin</a> to other redditors via ' +
		'<a href="/r/bitcointip" target="_blank">bitcointip</a>. <br><br> For more information, ' +
		'visit <a href="/r/bitcointip" target="_blank">/r/bitcointip</a> or <a href="/13iykn" target="_blank">read the documentation</a>.',
	options: {
		baseTip: {
			name: 'Default Tip',
			type: 'text',
			value: '0.01 BTC',
			description: 'Default tip amount in the form of "[value] [units]", e.g. "0.01 BTC"'
		},
		attachButtons: {
			name: 'Add "tip bitcoins" Button',
			type: 'boolean',
			value: true,
			description: 'Attach "tip bitcoins" button to comments'
		},
		hide: {
			name: 'Hide Bot Verifications',
			type: 'boolean',
			value: true,
			description: 'Hide bot verifications'
		},
		status: {
			name: 'Tip Status Format',
			type: 'enum',
			values: [{
				name: 'detailed',
				value: 'detailed'
			}, {
				name: 'basic',
				value: 'basic'
			}, {
				name: 'none',
				value: 'none'
			}],
			value: 'detailed',
			description: 'Tip status - level of detail'
		},
		currency: {
			name: 'Preferred Currency',
			type: 'enum',
			values: [{
				name: 'BTC',
				value: 'BTC'
			}, {
				name: 'USD',
				value: 'USD'
			}, {
				name: 'JPY',
				value: 'JPY'
			}, {
				name: 'GBP',
				value: 'GBP'
			}, {
				name: 'EUR',
				value: 'EUR'
			}],
			value: 'USD',
			description: 'Preferred currency units'
		},
		balance: {
			name: 'Display Balance',
			type: 'boolean',
			value: true,
			description: 'Display balance'
		},
		subreddit: {
			name: 'Display Enabled Subreddits',
			type: 'boolean',
			value: false,
			description: 'Display enabled subreddits'
		},
		address: {
			name: 'Known User Addresses',
			type: 'table',
			addRowText: '+add address',
			fields: [{
				name: 'user',
				type: 'text'
			}, {
				name: 'address',
				type: 'text'
			}],
			value: [
				/* ['skeeto', '1...'] */
			],
			description: 'Mapping of usernames to bitcoin addresses'
		},
		fetchWalletAddress: {
			text: 'Search private messages',
			description: "Search private messages for bitcoin wallet associated with the current username." + "<p>You must be logged in to search.</p>" + "<p>After clicking the button, you must reload the page to see newly-found addresses.</p>",
			type: 'button',
			callback: null // populated when module loads
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	exclude: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*\/user\/bitcointip\/?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		this.options.fetchWalletAddress.callback = this.fetchAddressForCurrentUser.bind(this);
		RESUtils.addCSS('.tip-bitcoins { cursor: pointer; }');
		RESUtils.addCSS('.tips-enabled-icon { cursor: help; }');
		RESUtils.addCSS('#tip-menu { display: none; position: absolute; top: 0; left: 0; }');
		// fix weird z-indexing issue caused by reddit's default .dropdown class
		RESUtils.addCSS('.tip-wrapper .dropdown { position: static; }');
	},

	go: function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}

		if (this.options.status.value === 'basic') {
			this.icons.pending = this.icons.completed;
			this.icons.reversed = this.icons.completed;
		}

		if (this.options.subreddit.value) {
			this.attachSubredditIndicator();
		}

		if (this.options.balance.value) {
			this.attachBalance();
		}

		if (RESUtils.currentSubreddit() === 'bitcointip') {
			this.injectBotStatus();
		}

		if (RESUtils.pageType() === 'comments') {
			if (this.options.attachButtons.value) {
				this.attachTipButtons();
				RESUtils.watchForElement('newComments', modules['bitcointip'].attachTipButtons.bind(this));
				this.attachTipMenu();
			}

			if (this.options.hide.value) {
				this.hideVerifications();
				RESUtils.watchForElement('newComments', modules['bitcointip'].hideVerifications.bind(this));
			}

			if (this.options.status.value !== 'none') {
				this.scanForTips();
				RESUtils.watchForElement('newComments', this.scanForTips.bind(this));
			}
		}
	},

	save: function save() {
		var json = JSON.stringify(this.options);
		RESStorage.setItem('RESoptions.bitcoinTip', json);
	},

	load: function load() {
		var json = RESStorage.getItem('RESoptions.bitcoinTip');
		if (json) {
			this.options = JSON.parse(json);
		}
	},


	/** Specifies how to find tips. */
	tipregex: /\+((\/u\/)?bitcointip|bitcoin|tip|btctip|bittip|btc)/i,
	tipregexFun: /(\+((?!0)(\d{1,4})) (point|internet|upcoin))/i,

	/** How many milliseconds until the bot is considered down. */
	botDownThreshold: 15 * 60 * 1000,

	/** Bitcointip API endpoints. */
	api: {
		gettips: '//bitcointip.net/api/gettips.php',
		gettipped: '//bitcointip.net/api/gettipped.php',
		subreddits: '//bitcointip.net/api/subreddits.php',
		balance: '//bitcointip.net/api/balance.php'
	},

	/** Encoded tipping icons. */
	icons: {
		completed: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAMAAABFNRROAAAAt1BMVEX///8AAAAAyAAAuwAAwQcAvAcAvwAAwQYAyAUAxAUAxwQAwgQAvAMAxQYAvwYAxQYAxwU5yT060j460j871T89wUE9wkFGokdGu0hIzExJl09JmE9JxExJxE1K1U9K1k5Ll09LmVNMmVNM2FBNmlRRx1NSzlRTqlVUslZU1ldVq1hVrFdV2FhWrFhX21pZqlphrWJh3WRotGtrqm1stW91sXd2t3h5t3urz6zA2sHA28HG3sf4+PhvgZhQAAAAEXRSTlMAARweJSYoLTM0O0dMU1dYbkVIv+oAAACKSURBVHjaVc7XEoIwEIXhFRED1tBUxBaPFSyxK3n/5zIBb/yv9pudnVky2Ywxm345MHkVXByllPm4W24qrLbzdo1sLPPRepc+XlnSIAuz9DQYPtXnkLhUF/ysrndV3CYLRpbg2VtpxFMwfRfEl8IghEPUhB9t9lEQoke6FnzONfpU5kEIoKOn/z+/pREPWTic38sAAAAASUVORK5CYII=",
		cancelled: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAMAAABFNRROAAAAQlBMVEX///+qAAAAAAC/AADIABSaTU3YMDDcPj7cSEjeUFDiZGTld3fmfHzoiorqkJDqlpbupKTuqqr99fX99/f+/Pz////kWqLlAAAABXRSTlMAAwcIM6KYVMQAAABfSURBVHjaXc7JDsAgCEVRsYpIBzro//9qHyHpond3AgkklIuXPKJcqleIIEB6FwEhQEW0t4rlUtt+22ZTMQ09NqZyiK8BtBCvc9iDWegY526hBVRmdcQ9RgD9f/G+P1+JEwRF2vKhRgAAAABJRU5ErkJggg==",
		tipped: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAANCAMAAACq939wAAAA/FBMVEWqVQCqcQCZZgCLXQCdYgDMjACOXACOXwCacQCfcQCqegCwggChggCnfwCwggCthACtgQC9iACleQC+iwDMlgDJlACmfgDDiwDBjADHlQDJnQDFlQDKmAChfRGjgBOmfhKmghKnghOqhBKthxOviROvjB+vjCGvjCOwiRSwihixixWxjSGziBOzkSmzky+0kSa0kiy3jxW8kxS8mCi8n0i8oEq9lBe9mSvOoBbUrTTUrTjbukXcsTDctDrdtj/exHbexXDfwWXfwmvjrBnksRjksx7lrhnqx17qyWTqymrq377rz3nr2qftuiHtvSv67cD67sj+997/+OX///8rcy1sAAAAHXRSTlMDCQoLDRQkKystMDc5Oj0+QUlKS0tMTVFSV15/i6wTI/gAAACWSURBVHjaHcrnAoFQGADQryI7sjNKN0RKZJVNQ8io938YN+f3ASDp1B9NAhD15UzXNH26KhNQXZyDBxZcNlloKadvFIbR56owUOFV9425ai8PrGwZaITQeisXoKHs7k/MP44ZaHYl54U5El8EdmjNEWbEjesf/Ljd9v0S1ETBtD3PNgUxB8nOQIybOGknAKgMy2FsmoIflIEZdK7PshkAAAAASUVORK5CYII=",
		pending: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAABWUlEQVR4nI2Sy0sCURTGD6S2jjYFrdy0DNpEhokb8zFm5YyaO6NFYNGqF/0hPZYtR79FUbgw0BFtDKIgUCSpv8Od3XtGJzWDBj64h/l+954XdbtdGhQZkzNUd7ptifiXZygo0Wz0WsWoyHTMj4Wo6nRLQ7KdRuZz15bWSiF0GQOVXJ4hqP/COGDTjEO9SyByIcDHiUXiT+QsAaW1wabgi4KtVxVqM4lQVcFx4RS5tzy0vIgZFDVTnaYkFG6us2lbTyNws4ZAMYizwjk6nQ7KbQOJfMqCRBlERZpWruJYfvYigx02ZfUDHN2e8Pnpy8T+w6G4MIqI8HFH5Ut9SKZQ/jDYPAh4K36EGzGrkwz1avK8+/jn3n2WzaPASsNnQaJpvYG65ixwFV7Dj7iuQcul+Cwvs4Ga1fafOVUcC31Qpio1BJjO0PiNEJPn9osapeyNqLmW/lyj/+7eN1qRZT0kKLSqAAAAAElFTkSuQmCC",
		reversed: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAABOklEQVR42p2SvU4CQRSFj+9h7DQ2VmsDCy0/Cw2wsNtuRwixIiQ8CZaWGDBaaAiJyVAg2xi1AaTQ19jyOHeSIbLBxuIkM7Pn23PvnQHJPSngNAYcK9mnPWng/LpaZVoadg9CC+BSDNsg4FcU7bRpNjkslaiAYAfZhL+AuFbjQ6PBYaXCZ6AK4Mj0IMBGH4rptVjkW73Ote9zUS5z2u/zfTzmRBL1XoNniIFjgdaeZ0yjMORNocCZ1nQwYJIk3CrFSatlIGkDM+BEouNMhndRZEyjTof3vZ5Zfy+XfOp2zQ+ND3BMkoWkhE+lxLwHzPN5rjzPTtLZ9fSRzZqPj+22MaeBlesaSIZmp3dhQZXLcaQHcev7sjZnFngBwr17mgNFC+pSRRawZV0dfBFy89ogDYvEbBMav33/ens/XHaDp7U/bFsAAAAASUVORK5CYII="
	},

	/** Specifies how to display different currencies. */
	currencies: {
		USD: {
			unit: 'US$',
			precision: 2
		},
		BTC: {
			unit: '฿'
		},
		JPY: {
			unit: '¥'
		},
		GBP: {
			unit: '£',
			precision: 2
		},
		EUR: {
			unit: '€',
			precision: 2
		},
		AUD: {
			unit: 'A$',
			precision: 2
		},
		CAD: {
			unit: 'C$',
			precision: 2
		}
	},

	/** Return a DOM element to separate items in the user bar. */
	separator: function() {
		return $('<span>|</span>').addClass('separator');
	},

	/** Convert a quantity into a string. */
	quantityString: function quantityString(object) {
		var pref = this.options.currency.value.toUpperCase();
		var unit = this.currencies[pref];
		var amount = object['amount' + pref] || object['balance' + pref];
		if (amount == null) {
			amount = object['amountBTC'] || object['balanceBTC'];
			unit = this.currencies['BTC'];
		}
		if (unit.precision) {
			amount = parseFloat(amount).toFixed(unit.precision);
		}
		return unit.unit + amount;
	},

	tipPublicly: function tipPublicly($target) {
		var form = null;
		if ($target.closest('.link').length > 0) { /* Post */
			form = $('.commentarea .usertext:first');
		} else { /* Comment */
			var replyButton = $target.closest('ul').find('a[onclick*="reply"]');
			RESUtils.click(replyButton[0]);
			form = $target.closest('.thing').find('FORM.usertext.cloneable:first');
		}
		var textarea = form.find('textarea');
		if (!this.tipregex.test(textarea.val())) {
			textarea.val(textarea.val() + '\n\n+/u/bitcointip ' + this.options.baseTip.value);
			RESUtils.setCursorPosition(textarea, 0);
		}
	},

	tipPrivately: function tipPrivately($target) {
		var form = null;
		if ($target.closest('.link').length > 0) { /* Post */
			form = $('.commentarea .usertext:first');
		} else {
			form = $target.closest('.thing').find(".child .usertext:first");
		}
		if (form.length > 0 && form.find('textarea').val()) {
			/* Confirm if a comment has been entered. */
			if (!confirm('Really leave this page to tip privately?')) {
				return;
			}
		}
		var user = $target.closest('.thing').find('.author:first').text();
		var msg = encodeURIComponent('+/u/bitcointip @' + user + ' ' + this.options.baseTip.value);
		var url = '/message/compose?to=bitcointip&subject=Tip&message=' + msg;
		window.location = url;
	},

	attachTipButtons: function attachTipButtons(ele) {
		ele = ele || document.body;
		var module = this;
		if (!module.tipButton) {
			module.tipButton = $(
				'<div class="tip-wrapper">' +
				'<div class="dropdown">' +
				'<a class="tip-bitcoins login-required noCtrlF" title="Click to give a bitcoin tip" data-text="bitcointip"></a>' +
				'</div>' +
				'</div>');
			module.tipButton.on('click', function(e) {
				modules['bitcointip'].toggleTipMenu(e.target);
			});
		}

		/* Add the "tip bitcoins" button after "give gold". */
		var allGiveGoldLinks = ele.querySelectorAll('a.give-gold');
		RESUtils.forEachChunked(allGiveGoldLinks, 15, 1000, function(giveGold, i, array) {
			$(giveGold).parent().after($('<li/>')
				.append(modules['bitcointip'].tipButton.clone(true)));
		});

		if (!module.attachedPostTipButton) {
			module.attachedPostTipButton = true; // signifies either "attached button" or "decided not to attach button"

			if (!RESUtils.isCommentPermalinkPage() && $('.link').length === 1) {
				// Viewing full comments on a submission, so user can comment on post
				$('.link ul.buttons .share').after($('<li/>')
					.append(modules['bitcointip'].tipButton.clone(true)));
			}
		}
	},

	attachTipMenu: function() {
		this.tipMenu =
			$('<div id="tip-menu" class="drop-choices">' +
				'<a class="choice tip-publicly" href="javascript:void(0);">tip publicly</a>' +
				'<a class="choice tip-privately" href="javascript:void(0);">tip privately</a>' +
				'</div>');

		if (modules['settingsNavigation']) { // affordance for userscript mode
			this.tipMenu.append(
				modules['settingsNavigation'].makeUrlHashLink(this.moduleID, null,
					'<img src="' + this.icons.tipped + '"> bitcointip', 'choice')
			);
		}
		$(document.body).append(this.tipMenu);

		this.tipMenu.find('a').click(function(event) {
			modules['bitcointip'].toggleTipMenu();
		});

		this.tipMenu.find('.tip-publicly').click(function(event) {
			event.preventDefault();
			modules['bitcointip'].tipPublicly($(modules['bitcointip'].lastToggle));
		});

		this.tipMenu.find('.tip-privately').click(function(event) {
			event.preventDefault();
			modules['bitcointip'].tipPrivately($(modules['bitcointip'].lastToggle));
		});
	},


	toggleTipMenu: function(ele) {
		var tipMenu = modules['bitcointip'].tipMenu;

		if (!ele || ele.length === 0) {
			tipMenu.hide();
			return;
		}

		var thisXY = $(ele).offset();
		var thisHeight = $(ele).height();
		// if already visible and we've clicked a different trigger, hide first, then show after the move.
		if ((tipMenu.is(':visible')) && (modules['bitcointip'].lastToggle !== ele)) {
			tipMenu.hide();
		}
		tipMenu.css({
			top: (thisXY.top + thisHeight) + 'px',
			left: thisXY.left + 'px'
		});
		tipMenu.toggle();
		modules['bitcointip'].lastToggle = ele;
	},

	attachSubredditIndicator: function() {
		var subreddit = RESUtils.currentSubreddit();
		if (subreddit && this.getAddress(RESUtils.loggedInUser())) {
			$.getJSON(this.api.subreddits, function(data) {
				if (data.subreddits.indexOf(subreddit.toLowerCase()) !== -1) {
					$('#header-bottom-right form.logout')
						.before(this.separator()).prev()
						.before($('<img/>').attr({
							'src': this.icons.tipped,
							'class': 'tips-enabled-icon',
							'style': 'vertical-align: text-bottom;',
							'title': 'Tips enabled in this subreddit.'
						}));
				}
			}.bind(this));
		}
	},

	hideVerifications: function hideVerifications(ele) {
		ele = ele || document.body;

		/* t2_7vw3n is u/bitcointip. */

		var botComments = $(ele).find('a.id-t2_7vw3n').closest('.comment');
		RESUtils.forEachChunked(botComments, 15, 1000, function(botComment, i, array) {
			var $this = $(botComment);
			var isTarget = $this.find('form:first').hasClass('border');
			if (isTarget) return;

			var hasReplies = $this.find('.comment').length > 0;
			if (hasReplies) return;

			$this.find('.expand').eq(2).click();
		});
	},

	toggleCurrency: function() {
		var units = Object.keys(this.currencies);
		var i = (units.indexOf(this.options.currency.value) + 1) % units.length;
		this.options.currency.value = units[i];
		this.save();
	},

	getAddress: function getAddress(user) {
		user = user || RESUtils.loggedInUser();
		var address = null;
		this.options.address.value.forEach(function(row) {
			if (row[0] === user) address = row[1];
		});
		return address;
	},

	setAddress: function setAddress(user, address) {
		user = user || RESUtils.loggedInUser();
		var set = false;
		this.options.address.value.forEach(function(row) {
			if (row[0] === user) {
				row[1] = address;
				set = true;
			}
		});
		if (user && !set) {
			this.options.address.value.push([user, address]);
		}
		this.save();
		return address;
	},

	attachBalance: function attachBalance() {
		var user = RESUtils.loggedInUser();
		var address = this.getAddress(user);
		if (!address) return;
		var bitcointip = this;

		$.getJSON(this.api.balance, {
			username: user,
			address: address
		}, function(balance) {
			if (!('balanceBTC' in balance)) {
				return; /* Probably have the address wrong! */
			}
			$('#header-bottom-right form.logout')
				.before(bitcointip.separator()).prev()
				.before($('<a/>').attr({
					'class': 'hover',
					'href': '#'
				}).click(function() {
					bitcointip.toggleCurrency();
					$(this).text(bitcointip.quantityString(balance));
				}).text(bitcointip.quantityString(balance)));
		});
	},

	fetchAddressForCurrentUser: function() {
		var user = RESUtils.loggedInUser();
		if (!user) {
			modules['notifications'].showNotification({
				moduleID: 'bitcointip',
				optionKey: 'fetchWalletAddress',
				type: 'error',
				message: 'Log in, then try again.'
			});
			return;
		}
		this.fetchAddress(user, function(address) {
			if (address) {
				modules['bitcointip'].setAddress(user, address);
				modules['notifications'].showNotification({
					moduleID: 'bitcointip',
					optionKey: 'address',
					message: 'Found address ' + address + ' for user ' + user + '<br><br>Your adress will appear in RES settings after you refresh the page.'
				});
			} else {
				modules['notifications'].showNotification({
					moduleID: 'bitcointip',
					type: 'error',
					message: 'Could not find address for user ' + user
				});
			}

		});
		modules['notifications'].showNotification({
			moduleID: 'bitcointip',
			optionKey: 'fetchWalletAddress',
			message: 'Searching your private messages for a bitcoin wallet address. ' + '<br><br>Reload the page to see if a wallet was found.'
		});
	},

	fetchAddress: function fetchAddress(user, callback) {
		user = user || RESUtils.loggedInUser();
		callback = callback || function nop() {};
		if (!user) return;
		$.getJSON('/message/messages.json', function(messages) {
			/* Search messages for a bitcointip response. */
			var address = messages.data.children.filter(function(message) {
				return message.data.author === 'bitcointip';
			}).map(function(message) {
				var pattern = /Deposit Address: \| \[\*\*([a-zA-Z0-9]+)\*\*\]/;
				var address = message.data.body.match(pattern);
				if (address) {
					return address[1];
				} else {
					return false;
				}
			}).filter(function(x) {
				return x;
			})[0]; // Use the most recent
			if (address) {
				this.setAddress(user, address);
				callback(address);
			} else {
				callback(null);
			}
		}.bind(this));
	},

	scanForTips: function(ele) {
		ele = ele || document.body;
		var tips = this.getTips(this.tipregex, ele);
		var fun = this.getTips(this.tipregexFun, ele);
		var all = $.extend({}, tips, fun);
		if (Object.keys(all).length > 0) {
			this.attachTipStatuses(all);
			this.attachReceiverStatus(this.getTips(/(?:)/, ele));
		}
	},

	/** Return true if the comment node matches the regex. */
	commentMatches: function(regex, $e) {
		return $e.find('.md:first, .title:first').children().is(function() {
			return regex.test($(this).text());
		});
	},

	/** Find all things matching a regex. */
	getTips: function getComments(regex, ele) {
		var tips = {};
		var items = $(ele);
		if (items.is('.entry')) {
			items = items.closest('div.comment, div.self, div.link');
		} else {
			items = items.find('div.comment, div.self, div.link');
		}
		var module = this;
		items.each(function() {
			var $this = $(this);
			if (module.commentMatches(regex, $this)) {
				var id = $this.data('fullname');
				// if id is null, this may be a deleted comment...
				if (id) {
					tips[id.replace(/^t._/, '')] = $this;
				}
			}
		});
		return tips;
	},

	attachTipStatuses: function attachTipStatuses(tips) {
		var iconStyle = 'vertical-align: text-bottom; margin-left: 8px;';
		var icons = this.icons;
		var tipIDs = Object.keys(tips);
		$.getJSON(this.api.gettips, {
			tips: tipIDs.toString()
		}, function(response) {
			var lastEvaluated = new Date(response.last_evaluated * 1000);
			response.tips.forEach(function(tip) {
				var id = tip.fullname.replace(/^t._/, '');
				var tagline = tips[id].find('.tagline').first();
				var icon = $('<a/>').attr({
					href: tip.tx,
					target: '_blank'
				});
				tagline.append(icon.append($('<img/>').attr({
					src: icons[tip.status],
					style: iconStyle,
					title: this.quantityString(tip) + ' → ' + tip.receiver + ' (' + tip.status + ')'
				})));
				tips[id].attr('id', 't1_' + id); // for later linking
				delete tips[id];
			}.bind(this));

			/* Deal with unanswered tips. */
			for (var id in tips) {
				if (this.commentMatches(this.tipregexFun, tips[id])) {
					continue; // probably wasn't actually a tip
				}
				var date = tips[id].find('.tagline time:first')
					.attr('datetime');
				if (new Date(date) < lastEvaluated) {
					var tagline = tips[id].find('.tagline:first');
					tagline.append($('<img/>').attr({
						src: icons.cancelled,
						style: iconStyle,
						title: 'This tip is invalid.'
					}));
				}
			}
		}.bind(this));
	},

	attachReceiverStatus: function attachReceiverStatus(things) {
		var iconStyle = 'vertical-align: text-bottom; margin-left: 8px;';
		var icons = this.icons;
		var thingIDs = Object.keys(things);
		$.getJSON(this.api.gettipped, {
			tipped: thingIDs.toString()
		}, function(response) {
			response.forEach(function(tipped) {
				var id = tipped.fullname.replace(/^t._/, '');
				var thing = things[id];
				var tagline = thing.find('.tagline').first();
				var plural = tipped.tipQTY > 1;
				var title = this.quantityString(tipped) + ' to ' +
					thing.find('.author:first').text() + ' for this ';
				if (plural) {
					title = 'redditors have given ' + title;
				} else {
					title = 'a redditor has given ' + title;
				}
				if (thing.closest('.link').length === 0) {
					title += 'comment.';
				} else {
					title += 'submission.';
				}
				var icon = $('<img/>').attr({
					src: icons.tipped,
					style: iconStyle,
					title: title
				});
				tagline.append(icon);
				if (plural) {
					tagline.append($('<span/>').text('x' + tipped.tipQTY));
				}
			}.bind(this));
		}.bind(this));
	},

	injectBotStatus: function injectBotStatus() {
		$.getJSON(this.api.gettips, function(response) {
			var lastEvaluated = new Date(response.last_evaluated * 1000);
			var botStatus = null;
			if (Date.now() - lastEvaluated > this.botDownThreshold) {
				botStatus = '<span class="status-down">DOWN</span>';
			} else {
				botStatus = '<span class="status-up">UP</span>';
			}
			$('.side a[href="http://bitcointip.net/status.php"]').html(botStatus);
		});
	}
};

modules['troubleShooter'] = {
	moduleID: 'troubleShooter',
	moduleName: 'Troubleshooter',
	category: 'Troubleshoot',
	options: {
		clearUserInfoCache: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Reset the <code>userInfo</code> cache for the currently logged in user. Useful for when link/comment karma appears to have frozen.'
		},
		clearSubreddits: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Reset the \'My Subreddits\' dropdown contents in the event of old/duplicate/missing entries.'
		},
		clearTags: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Remove all entries for users with +1 or -1 vote tallies (only non-tagged users).'
		},
		resetToFactory: {
			type: 'button',
			text: 'Reset',
			callback: null,
			description: 'Warning: This will remove all your RES settings, including tags, saved comments, filters etc!'
		}
	},
	description: 'Resolve common problems and clean/clear unwanted settings data.' + '<br/><br/>' + 'Your first line of defence against browser crashes/updates, or potential issues' + ' with RES, is a frequent backup.' + '<br/><br/>' + 'See <a href="http://www.reddit.com/r/Enhancement/wiki/where_is_res_data_stored">here</a>' + ' for the location of the RES settings file for your browser/OS.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		var css = '';
		css += 'body:not(.loggedin) #clearUserInfoCache ~ .optionDescription:before, body:not(.loggedin) #clearSubreddits ~ .optionDescription:before';
		css += '{content: "Functionality only for logged in users - ";color:#f00;font-weight:bold}';
		RESUtils.addCSS(css);
	},
	go: function() {
		this.options['clearUserInfoCache'].callback = modules['troubleShooter'].clearUICache;
		this.options['clearSubreddits'].callback = modules['troubleShooter'].clearSubreddits;
		this.options['clearTags'].callback = modules['troubleShooter'].clearTags;
		this.options['resetToFactory'].callback = modules['troubleShooter'].resetToFactory;
	},
	clearUICache: function() {
		var user = RESUtils.loggedInUser();
		if (user) {
			RESStorage.removeItem('RESUtils.userInfoCache.' + user);
			modules['notifications'].showNotification('Cached info for ' + user + ' was reset.', 2500);
		} else {
			modules['notifications'].showNotification('You must be logged in to perform this task.', 2500);
		}
	},
	clearSubreddits: function() {
		var user = RESUtils.loggedInUser();
		if (user) {
			RESStorage.removeItem('RESmodules.subredditManager.subreddits.' + user);
			modules['notifications'].showNotification('Subreddits for ' + user + ' were reset.', 2500);
		} else {
			modules['notifications'].showNotification('You must be logged in to perform this task.', 2500);
		}
	},
	clearTags: function() {
		var confirm = window.confirm('Are you positive?');
		if (confirm) {
			var i,
				cnt = 0,
				tags = RESStorage.getItem('RESmodules.userTagger.tags');
			if (tags) {
				tags = JSON.parse(tags);
				for (i in tags) {
					if ((tags[i].votes === 1 || tags[i].votes === -1) && !tags[i].hasOwnProperty('tag')) {
						delete tags[i];
						cnt += 1;
					}
				}
				tags = JSON.stringify(tags);
				RESStorage.setItem('RESmodules.userTagger.tags', tags);
				modules['notifications'].showNotification(cnt + ' entries removed.', 2500);
			}
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	},
	resetToFactory: function() {
		var confirm = window.confirm('This will kill all your settings and saved data. Are you sure?');
		if (confirm) {
			for (var key in RESStorage) {
				if (key.indexOf('RES') !== -1) {
					RESStorage.removeItem(key);
				}
			}
			modules['notifications'].showNotification('All settings reset.', 2500);
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	}
};


/*
modules['snoonet'] = {
	moduleID: 'snoonet',
	moduleName: 'Snoonet IRC',
	category: 'UI',
	options: {
	},
	description: 'Module to simplify adding snoonet IRC support to your subreddit(s)',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		// TODO: maybe don't depend on their sprite sheet?
		var css = '.icon-menu #enableSnoonet:before {';
		css += 'background-image: url(https://redditstatic.s3.amazonaws.com/sprite-reddit.hV9obzo72Pc.png);';
		css += 'background-position: 0px -708px;';
		css += 'background-repeat: no-repeat;';
		css += 'height: 16px;';
		css += 'width: 16px;';
		css += 'display: block;';
		css += 'content: " ";';
		css += 'float: left;';
		css += 'margin-right: 5px;';
		css += '}';
		RESUtils.addCSS(css);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if ($('body').hasClass('moderator')) {
				// if there's not yet a link to chat in the sidebar, add an item to the moderation tools box.
				var chatLink = $('.side .usertext-body').find('a[href*="webchat.snoonet.org"]');
				if (chatLink.length === 0) {
					$('#moderation_tools ul.flat-vert').prepend('<li><a id="enableSnoonet" target="_blank" href="http://api.snoonet.org/reddit/">Enable Live Chat</a> <a id="enableSnoonetHelp" title="what\'s this?" target="_blank" href="/r/Enhancement/wiki/enablechat">(?)</a></li>');
				}
			}
		}
	}
};
*/

/* END MODULES */

var lastPerf = 0;

function perfTest(name) {
	var now = Date.now();
	var diff = now - lastPerf;
	console.log(name + ' executed. Diff since last: ' + diff + 'ms');
	lastPerf = now;
}
