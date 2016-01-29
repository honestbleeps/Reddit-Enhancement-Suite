/* exported RESUtils, escapeHTML, modules, addModule, libraries, addLibrary, safeJSON, perfTest */
var modules = {};
function addModule(moduleID, extend) {
	const base = {
		moduleID: moduleID,
		moduleName: moduleID,
		category: 'General',
		options: {},
		description: '',
		isEnabled() {
			return this._enabled;
		},
		isMatchURL() {
			return RESUtils.isMatchURL(this.moduleID);
		},
		include: [
			'all'
		],
		exclude: [],
		onToggle(state) {}, // eslint-disable-line no-unused-vars
		loadLibraries() {},
		loadDynamicOptions() {},
		beforeLoad() {},
		go() {},
		afterLoad() {},
		addOptionsBodyClasses() {
			// Adds body classes for enabled options that have `bodyClass: true`
			// In the form `res-moduleId-optionKey` for boolean options
			// and `res-moduleId-optionKey-optionValue` for enum options
			// spaces in enum option values will be replaced with underscores
			if (!(this.isEnabled() && this.isMatchURL())) return;

			$.each(this.options, (optId, opt) => {
				if (!(opt.bodyClass && opt.value)) return;

				if (opt.type !== 'enum' && opt.type !== 'boolean') {
					throw new Error(`modules['${this.moduleID}'].options['${optId}'] - only enum and boolean options may generate body classes`);
				}

				let cls = typeof opt.bodyClass === 'string' ? opt.bodyClass : `res-${this.moduleID}-${optId}`;

				if (opt.type === 'enum') {
					cls += `-${opt.value.replace(/\s/g, '_')}`;
				}

				RESUtils.bodyClasses.add(cls);
			});
		}
	};

	let module = extend.call(base, base, moduleID);
	module = $.extend(true, base, module);
	modules[moduleID] = module;
	return module;
}

var libraries = {};
function addLibrary(libraryID, moduleID, library) {
	if (typeof moduleID !== 'string') {
		library = moduleID;
		moduleID = undefined;
	}

	if (libraryID && moduleID) {
		libraries[libraryID] = libraries[libraryID] || {};
		libraries[libraryID][moduleID] = library;
	} else if (libraryID) {
		libraries[libraryID] = library;
	}
}

// DOM utility functions
var escapeLookups = {
	'&': '&amp;',
	'"': '&quot;',
	'<': '&lt;',
	'>': '&gt;'
};

function escapeHTML(str) {
	return (str === undefined || str === null) ?
		null :
		str.toString().replace(/[&"<>]/g, function(m) {
			return escapeLookups[m];
		});
}

var safeJSON = {
	// Safely parses JSON and won't kill the whole script if JSON.parse fails
	// If localStorageSource is specified, will offer the user the ability to delete that localStorageSource to stop further errors.
	// If silent is specified, it will fail silently...
	parse: function(data, localStorageSource, silent) {
		try {
			data = RESEnvironment.sanitizeJSON(data);
			return JSON.parse(data);
		} catch (error) {
			if (silent) {
				return {};
			}
			console.error('Could not parse JSON data', error);
			if (localStorageSource) {
				var msg = 'Error caught: JSON parse failure on the following data from "' + localStorageSource + '": <textarea rows="5" cols="50">' + data + '</textarea><br>RES can delete this data to stop errors from happening, but you might want to copy/paste it to a text file so you can more easily re-enter any lost information.';
				alert(msg, function() {
					// Back up a copy of the corrupt data
					localStorage.setItem(localStorageSource + '.error', data);
					// Delete the corrupt data
					RESEnvironment.storage.delete(localStorageSource);
				});
			} else {
				alert('Error caught: JSON parse failure on the following data: ' + data);
			}
			return {};
		}
	}
};

var lastPerf = 0;
function perfTest(name) {
	var now = Date.now();
	var diff = now - lastPerf;
	console.log(name + ' executed. Diff since last: ' + diff + 'ms');
	lastPerf = now;
}

(function($) {
	$.fn.safeHtml = function(string) {
		if (!string) return '';
		else return $(this).html(RESUtils.sanitizeHTML(string));
	};
})(
	typeof $ !== 'undefined' && $.fn ? $ :
	typeof jQuery !== 'undefined' ? jQuery :
	{} /* silently fail if jQuery not defined */
);

// define common RESUtils - reddit related functions and data that may need to be accessed...
const RESUtils = {};
// set up arrays for html tag classes and body tag classes to be added as early
// as possible and all at once to avoid excess screen repaints
(function(exports) {
	var classes = [];

	function init() {
		if (!classes.length) {
			classes = ['res', 'res-v430'];
		}

		addVersionClasses();
	}

	var _addVersionClasses = false;
	function addVersionClasses() {
		if (!RESMetadata.version) return;
		if (_addVersionClasses) return;
		_addVersionClasses = true;
		var versionComponents = RESMetadata.version.split('.');
		for (var i = 0, length = versionComponents.length; i < length; i++) {
			classes.push('res-v' + (versionComponents.slice(0, i + 1).join('-')));
		}
	}

	function add() {
		init();

		classes = Array.prototype.slice.call(arguments).reduce(function(a, b) {
			return a.concat(b);
		}, classes);


		if (classes.length) {
			if (document.html) {
				document.html.classList.add.apply(document.html.classList, classes);
			}
			if (document.body) {
				document.body.classList.add.apply(document.body.classList, classes);
			}
		}
	}
	function remove(classes) {
		classes = Array.prototype.slice.call(arguments)
			.reduce(function(a, b) {
				return a.concat(b);
			}, []);

		if (classes.length) {
			if (document.html) {
				document.html.classList.remove.apply(document.html.classList, classes);
			}
			if (document.body) {
				document.body.classList.remove.apply(document.body.classList, classes);
			}
		}
	}

	exports.init = init;
	exports.add = add;
	exports.remove = remove;
})(RESUtils.bodyClasses = RESUtils.bodyClasses || {});

RESUtils.once = callback => {
	let defined, value;
	function run() {
		if (!defined) {
			value = callback();
			defined = true;
		}
		return value;
	}
	run.force = () => {
		value = callback();
		defined = true;
		return value;
	};
	return run;
};

RESUtils.memoize = callback => {
	const results = new Map();
	return (key, ...args) => {
		if (results.has(key)) {
			return results.get(key);
		}
		const result = callback(key, ...args);
		results.set(key, result);
		return result;
	};
};

RESUtils.async = {};

RESUtils.async.nonNull = (callback, interval = 1) =>
	new Promise(resolve => {
		(function repeat() {
			let val;
			if (!(val = callback())) {
				return setTimeout(repeat, interval);
			}
			resolve(val);
		})();
	});

RESUtils.async.seq = async (iterable, callback) => {
	let i = 0;
	for (const val of iterable) {
		await callback(val, i++, iterable); // eslint-disable-line babel/no-await-in-loop
	}
};

RESUtils.dom = {};

RESUtils.dom.observe = (ele, options, callback) => {
	if (typeof MutationObserver !== 'function') return;

	const observer = new MutationObserver(mutations => mutations.some(callback));
	observer.observe(ele, options);
	return observer;
};

RESUtils.dom.waitForChild = (ele, selector, { initialCheck = true } = {}) =>
	new Promise(resolve => {
		if (initialCheck && Array.from(ele.children).some(child => child.matches(selector))) {
			resolve();
			return;
		}

		const observer = RESUtils.dom.observe(ele, { childList: true }, mutation => {
			if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE && node.matches(selector))) {
				observer.disconnect();
				resolve();
				return true;
			}
		});
	});

RESUtils.dom.waitForEvent = (ele, event) =>
	new Promise(resolve =>
		ele.addEventListener(event, function fire() {
			ele.removeEventListener(event, fire);
			resolve();
		})
	);

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
RESUtils.addCSS = function(css) {
	var style = RESUtils.addStyle(css);
	return {
		remove: function() {
			style.textContent = '';
			if (style.parentNode) {
				style.parentNode.removeChild(style);
			}
		}
	};
};
RESUtils.insertParam = function(href, key, value) {
	var pre = '&';
	if (href.indexOf('?') === -1) pre = '?';
	return href + pre + key + '=' + value;
};
// checks if script should run on current URL using exclude / include.
RESUtils.isMatchURL = function(moduleID) {
	// stop if not on reddit
	if (!RESUtils.isReddit()) {
		return false;
	}
	var module = modules[moduleID];
	if (!module) {
		console.warn('isMatchURL could not find module', moduleID);
		return false;
	}

	var exclude = module.exclude,
		include = module.include;
	return RESUtils.matchesPageLocation(include, exclude);
};

RESUtils.matchesPageLocation = function(includes, excludes) {
	includes = typeof includes === 'undefined' ? [] : [].concat(includes);
	excludes = typeof excludes === 'undefined' ? [] : [].concat(excludes);

	var excludesPageType = excludes.length && (RESUtils.isPageType.apply(RESUtils, excludes) || RESUtils.matchesPageRegex.apply(RESUtils, excludes));
	if (!excludesPageType) {
		var includesPageType = !includes.length || RESUtils.isPageType.apply(RESUtils, includes) || RESUtils.matchesPageRegex.apply(RESUtils, includes);
		return includesPageType;
	}
};

RESUtils.getUrlParams = function(url) {
	var result = {},
		re = /([^&=]+)=([^&]*)/g,
		m, queryString;
	if (url) {
		var fullUrlRe = /\?((?:[^&=]+=[^&]*?&?)+)(?:#[^&]*)?$/;
		var groups = fullUrlRe.exec(url);
		if (groups) {
			queryString = groups[1];
		} else {
			return {};
		}
	} else {
		queryString = location.search.substr(1);
	}
	while ((m = re.exec(queryString))) {
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	return result;
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
RESUtils.loggedInUser = RESUtils.once(() => {
	const userLink = document.querySelector('#header-bottom-right > span.user > a');
	return userLink && !userLink.classList.contains('login-required') && userLink.textContent || null;
});
RESUtils.isModeratorAnywhere = RESUtils.once(() => !!document.getElementById('modmail'));
RESUtils.loggedInUserHash = RESUtils.once(() => {
	const hashEle = document.querySelector('[name=uh]');
	return hashEle && hashEle.value;
});
RESUtils.problemHashes = [991658920, 3385400];
RESUtils.getUserInfo = (username = RESUtils.loggedInUser(), live = false) => {
	if (!username) {
		throw new Error('getUserInfo: null/undefined username');
	}

	return RESEnvironment.ajax({
		url: RESUtils.string.encode`/user/${username}/about.json`,
		type: 'json',
		cacheFor: live ? RESUtils.MINUTE : RESUtils.HOUR
	});
};
RESUtils.regexes = {
	all: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\//i,
	comments: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/[\-\w\.\/]*\/comments/i,
	nosubComments: /https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/comments\/[\-\w\.\/]*/i,
	friendsComments: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/friends\/comments/i,
	inbox: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:r\/[\-\w\.\/]+?\/)?message\//i,
	profile: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/user\/([\-\w\.#=]*)\/?(?:comments)?\/?(?:\?(?:[a-z]+=[a-zA-Z0-9_%]*&?)*)?$/i,
	submit: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:[\-\w\.\/]*\/)?submit\/?(?:\?.*)?$/i,
	prefs: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/prefs/i,
	account: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/account/i,
	wiki: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:r\/[\-\w\.]+\/)?wiki/i,
	stylesheet: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:r\/[\-\w\.]+\/)?about\/stylesheet/i,
	search: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:[\-\w\.\/]*\/)?search/i,
	toolbar: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/tb\//i,
	commentPermalink: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/[\-\w\.\/]*comments\/[a-z0-9]+\/[^\/]+\/[a-z0-9]+$/i,
	subreddit: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/([\w\.\+]+)/i,
	subredditPostListing: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/([\w\.\+]+)(?:\/(new|rising|controversial|top))?\/?(?:\?.*)?$/i,
	subredditAbout: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/([\w\.\+]+)\/about/i,
	multireddit: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/((?:me|user\/[\-\w\.#=]*)\/(?:m|f)\/([\w\.\+]+))/i,
	domain: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/domain\/([\w\.\+]+)/i
};
RESUtils.verifyHash = function(hash) {
	if ($.inArray(RESUtils.hashCode(hash), RESUtils.problemHashes) !== -1) {
		throw new Error();
	}
};
RESUtils.isReddit = function() {
	var currURL = location.href;
	return RESUtils.regexes.all.test(currURL) && !RESUtils.regexes.toolbar.test(currURL);
};
RESUtils.pageType = function() {
	if (this.pageTypeSaved !== undefined) {
		return this.pageTypeSaved;
	}

	var currURL = location.href.split('#')[0];
	var defaultPageType = 'linklist';
	var pageTypes = ['wiki', 'search', 'profile', 'subredditAbout', 'comments', 'inbox', 'submit', 'account', 'prefs', 'stylesheet'];
	var pageType = pageTypes.find(function(pageType) {
		return RESUtils.regexes[pageType].test(currURL);
	}) || defaultPageType;


	this.pageTypeSaved = pageType;
	return pageType;
};
RESUtils.isPageType = function(/*type1, type2, type3, ...*/) {
	var thisPage = RESUtils.pageType();
	return Array.prototype.slice.call(arguments).some(function(type) {
		return (type === 'all') || (type === thisPage);
	});
};
RESUtils.matchesPageRegex = function(/*regex1, regex2, regex3, ...*/) {
	var href = document.location.href;
	return Array.prototype.slice.call(arguments).some(function(regex) {
		return regex.test && regex.test(href);
	});
};
RESUtils.isCommentPermalinkPage = function() {
	if (typeof this.isCommentPermalinkSaved === 'undefined') {
		var currURL = location.href.split('#')[0];
		if (RESUtils.regexes.commentPermalink.test(currURL)) {
			this.isCommentPermalinkSaved = true;
		} else {
			this.isCommentPermalinkSaved = false;
		}
	}

	return this.isCommentPermalinkSaved;
};
RESUtils.currentSubreddit = function(check) {
	if (typeof this.curSub === 'undefined') {
		var match = location.href.match(RESUtils.regexes.subreddit);
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
RESUtils.thingsContainer = function(body = document.body) {
	const container = body.querySelectorAll(RESUtils.thing.containerSelector);
	// stupid sponsored links create a second div with ID of sitetable (bad reddit! you should never have 2 IDs with the same name! naughty, naughty reddit!)
	if (container.length === 2) {
		return container[1];
	} else {
		return container[0];
	}
};
RESUtils.$things = function(container = RESUtils.thingsContainer()) {
	return $(container).find(RESUtils.thing.thingSelector);
};
RESUtils.things = function(container) {
	return RESUtils.$things(container).get()
		.map(ele => new RESUtils.thing(ele));
};
RESUtils.thing = class {
	static thingSelector = '.thing, .search-result-link';
	static entrySelector = '.entry, .search-result-link > :not(.thumbnail)';
	static containerSelector = '.sitetable, .search-result-listing';

	constructor(element) {
		if (element instanceof RESUtils.thing) {
			return element;
		}

		this.$thing = $(element).closest(RESUtils.thing.thingSelector);
		this.element = this.thing = this.$thing[0];
		this.entry = this.thing && this.thing.querySelector(RESUtils.thing.entrySelector) || this.thing;
	}

	// Proxied functions
	find(...args) {
		return this.$thing.find(...args);
	}

	querySelector(selectors) {
		return this.thing && this.thing.querySelector(selectors);
	}

	querySelectorAll(selectors) {
		return this.thing && this.thing.querySelectorAll(selectors);
	}

	// Instance methods
	is(otherThing) {
		return otherThing && otherThing.element === this.element;
	}

	isPost() {
		return this.thing.classList.contains('link') || this.thing.classList.contains('search-result-link');
	}

	isLinkPost() {
		if (!this.isPost()) {
			return false;
		}
		if (this.thing.classList.contains('search-result-link')) {
			return !this.thing.querySelector('a').classList.contains('self');
		} else {
			return !this.thing.classList.contains('self');
		}
	}

	isSelfPost() {
		if (!this.isPost()) {
			return false;
		}
		if (this.thing.classList.contains('search-result-link')) {
			return this.thing.querySelector('a').classList.contains('self');
		} else {
			return this.thing.classList.contains('self');
		}
	}

	isComment() {
		return this.entry.classList.contains('comment');
	}

	getTitle() {
		const element = this.getTitleElement();
		return element && element.textContent;
	}

	getTitleElement() {
		return this.entry.querySelector('a.title, a.search-title');
	}

	getPostLink() {
		return this.entry.querySelector('a.title, a.search-link');
	}

	getCommentsLink() {
		return this.entry.querySelector('a.comments, a.search-comments');
	}

	getCommentPermalink() {
		return this.entry.querySelector('a.bylink');
	}

	getScore() {
		const element = this.getScoreElement();
		//parseInt() strips off the ' points' from comments
		return element && parseInt(element.textContent, 10);
	}

	getScoreElement() {
		if (this.isPost()) {
			return this.entry.querySelector('.midcol.unvoted > .score.unvoted, .midcol.likes > score.likes, .midcol.dislikes > .score.dislikes, .search-score');
		} else if (this.isComment()) {
			// TODO: does this work?
			return this.entry.querySelector('tagline > .score');
		}
	}

	getAuthor() {
		const element = this.getAuthorElement();
		return element && RESUtils.regexes.profile.exec(element.href)[1];
	}

	getAuthorElement() {
		return this.entry.querySelector('.tagline > .author, .search-author .author');
	}

	getSubreddit() {
		const element = this.getSubredditLink();
		return element && RESUtils.regexes.subreddit.exec(element.href)[1];
	}

	getSubredditLink() {
		if (this.isPost()) {
			return this.entry.querySelector('.tagline a.subreddit, a.search-subreddit-link');
		} else if (this.isComment()) {
			// TODO: does this work?
			return this.entry.querySelector('.parent a.subreddit');
		}
	}

	getPostDomain() {
		const element = this.getPostDomainLink();
		if (element) {
			return element.textContent;
		}

		const subreddit = this.getSubreddit() || RESUtils.currentSubreddit();
		if (subreddit) {
			return 'self.' + subreddit;
		}

		return 'reddit.com';
	}

	getPostDomainLink() {
		return this.thing.querySelector('.domain > a');
	}

	getCommentCount() {
		const element = this.getCommentCountElement();
		return element && parseInt(/\d+/.exec(element.textContent), 10);
	}

	getCommentCountElement() {
		if (this.isPost()) {
			return this.thing.querySelector('.buttons .comments');
		} else if (this.isComment()) {
			return this.thing.querySelector('.buttons a.full-comments');
		}
	}

	getPostFlairText() {
		const element = this.getPostFlairElement();
		return element && element.textContent;
	}

	getPostFlairElement() {
		return $(this.entry).find('> .title > .linkflairlabel')[0];
	}

	getUserFlairText() {
		const element = this.getUserFlairElement();
		return element && element.textContent;
	}

	getUserFlairElement() {
		return $(this.entry).find('> .title > .linkflairlabel')[0];
	}

	getUpvoteButton() {
		return this._getVoteButton('div.up, div.upmod');
	}

	getDownvoteButton() {
		return this._getVoteButton('div.down, div.downmod');
	}

	_getVoteButton(selector) {
		if (this.entry.previousSibling.tagName === 'A') {
			return this.entry.previousSibling.previousSibling.querySelector(selector);
		} else {
			return this.entry.previousSibling.querySelector(selector);
		}
	}

	getExpandoButton() {
		return this.entry.querySelector('.expando-button, .search-expando-button');
	}

	getExpandoButtons() {
		return this.entry.querySelectorAll('.expando-button, .search-expando-button');
	}

	getTimestamp() {
		const element = this.getTimestampElement();
		return element && new Date(element.getAttribute('datetime'));
	}

	getTimestampElement() {
		return this.entry.querySelector('time');
	}

	getFullname() {
		return this.thing.getAttribute('data-fullname');
	}

	isNSFW() {
		if (this.thing.classList.contains('search-result')) {
			return this.entry.querySelector('.nsfw-stamp');
		}
		return this.thing.classList.contains('over18');
	}
};
RESUtils.subredditForElement = function(element) {
	var $thing = $(element).closest('.thing');
	if (!$thing.length) return;

	var $subredditElement = $thing.find('.subreddit');

	if (!$subredditElement.length) {
		$subredditElement = $thing.find('.tagline a').filter(function() {
			return RESUtils.regexes.subreddit.test(this.href);
		});
	}

	if (!$subredditElement.length) {
		$subredditElement = $('.sitetable .link .subreddit');
	}

	if ($subredditElement.length) {
		var subredditName = $subredditElement[0].href.match(RESUtils.regexes.subreddit)[1];
		return subredditName;
	}
};
RESUtils.currentMultireddit = function(check) {
	if (typeof this.curMulti === 'undefined') {
		var match = location.href.match(RESUtils.regexes.multireddit);
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
		var match = location.href.match(RESUtils.regexes.domain);
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
		var match = location.href.match(RESUtils.regexes.profile);
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
RESUtils.subredditForPost = function(thingEle) {
	var postSubreddit = '';
	var thisSubRedditEle = $(thingEle).find('A.subreddit')[0];
	if ((typeof thisSubRedditEle !== 'undefined') && (thisSubRedditEle !== null)) {
		postSubreddit = RESUtils.regexes.subreddit.exec(thisSubRedditEle.href)[1] || '';
	}
	return postSubreddit;
};
RESUtils.getXYpos = function(obj) {
	var topValue = 0,
		leftValue = 0;
	while (obj) {
		leftValue += obj.offsetLeft;
		topValue += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return {
		x: leftValue,
		y: topValue
	};
};

RESUtils.elementInViewport = function(obj) {
	if (!obj) {
		return false;
	}
	var element = RESUtils.getDimensions(obj);
	var viewport = RESUtils.getViewportDimensions();

	var contained = (
		viewport.top <= element.top &&
		viewport.left <= element.left &&
		element.bottom <= viewport.bottom &&
		element.right <= viewport.right
	);
	return contained;
};
RESUtils.getDimensions = function(obj) {
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
	var bottom = top + height;
	var right = left + width;

	return {
		yOffset: headerOffset,
		x: top,
		y: left,
		top: top,
		left: left,
		bottom: bottom,
		right: right,
		width: width,
		height: height
	};
};

RESUtils.getViewportDimensions = function() {
	var headerOffset = this.getHeaderOffset();

	var dimensions = {
		yOffset: headerOffset,
		x: window.pageXOffset,
		y: window.pageYOffset + headerOffset,
		width: window.innerWidth,
		height: window.innerHeight - headerOffset
	};
	dimensions.top = dimensions.y;
	dimensions.left = dimensions.x;
	dimensions.bottom = dimensions.top + dimensions.height;
	dimensions.right = dimensions.left + dimensions.width;

	return dimensions;
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
RESUtils.watchMouseMove = function() {
	document.body.addEventListener('mousemove', RESUtils.setMouseXY, false);
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
RESUtils.scrollToElement = function(element, options) {
	options = $.extend(true, {
		topOffset: 5,
		makeVisible: undefined
	}, options);

	var target = (options.makeVisible || element).getBoundingClientRect(); // top, right, bottom, left are relative to viewport
	var viewport = RESUtils.getViewportDimensions();

	target = $.extend({}, target);
	target.top -= viewport.yOffset;
	target.bottom -= viewport.yOffset;

	var top = viewport.y + target.top - options.topOffset; // for DRY

	if (options.scrollStyle === 'none') {
		return;
	} else if (options.scrollStyle === 'top') {
		// Always scroll element to top of page
		RESUtils.scrollTo(0, top);
	} else if (target.top >= 0 && target.bottom <= viewport.height) {
		// Element is already completely inside viewport
		// (remember, top and bottom are relative to viewport)
		return;
	} else if (target.top < viewport.yOffset) {
		// Element starts above viewport
		// So, align top of element to top of viewport
		RESUtils.scrollTo(0, top);
	} else if (viewport.height < target.bottom &&
			target.height < viewport.height) {
		// Visible part of element starts or extends below viewport

		if (options.scrollStyle === 'page') {
			RESUtils.scrollTo(0, viewport.y + target.top - options.topOffset);
		} else {
			// So, align bottom of target to bottom of viewport
			RESUtils.scrollTo(0, viewport.y + target.bottom - viewport.height);
		}
		return;
	} else {
		// Visible part of element below the viewport but it'll fill the viewport, or fallback
		// So, align top of element to top of viewport
		RESUtils.scrollTo(0, top);
	}
};
RESUtils.scrollTo = function(x, y) {
	var headerOffset = this.getHeaderOffset();
	window.scrollTo(x, y - headerOffset);
};
RESUtils.getHeaderOffset = function() {
	if (typeof this.headerOffset === 'undefined') {
		var header;
		var headerOffset = 0;
		if (modules['betteReddit'].isEnabled()) {
			switch (modules['betteReddit'].options.pinHeader.value) {
				case 'sub':
				case 'subanduser':
					header = document.getElementById('sr-header-area');
					break;
				case 'header':
					header = document.getElementById('header');
					break;
				// case 'none':
				default:
					break;
			}
		}
		if (header) {
			headerOffset = header.offsetHeight + 6;
		}

		this.headerOffset = headerOffset;
	}
	return this.headerOffset;
};
RESUtils.addStyle = function(css) {
	var style = document.createElement('style');
	style.textContent = css;
	RESUtils.init.await.headReady.then(() => document.head.appendChild(style));

	return style;
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
	return Array.prototype.slice.call(arguments).find(function(argument) {
		return argument !== undefined && argument !== null &&
			(typeof argument !== 'number' || !isNaN(argument));
	});
};
RESUtils.fadeElementTo = function(el, speedInSeconds, finalOpacity, callback) {
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
			el.style.display = 'block';
		}

		if (typeof finalOpacity === 'undefined') {
			finalOpacity = 1;
		}
	}

	function go() {
		$(el).fadeTo(speedInSeconds * 1000, finalOpacity, done);
	}

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
	var index;
	if (!source || !source.length) {
		index = {
			items: [],
			keys: []
		};
	} else {
		index = createIndex();
	}

	Object.defineProperty(getItem, 'keys', {
		value: index.keys,
		writeable: false
	});
	Object.defineProperty(getItem, 'all', {
		value: getAllItems,
		writeable: false
	});
	return getItem;

	function createIndex() {
		var itemsByKey = {};
		var allKeys = [];

		for (var i = 0, length = source.length; i < length; i++) {
			var item = source[i];
			var key = item && item[keyIndex];
			if (!key) continue;

			var keys;
			if (keyValueSeparator) {
				keys = key.split(keyValueSeparator);
			} else {
				keys = [key && key];
			}
			for (var ki = 0, klength = keys.length; ki < klength; ki++) {
				key = keys[ki].toLowerCase();

				itemsByKey[key] = itemsByKey[key] || [];
				itemsByKey[key].push(item);
			}

			allKeys = allKeys.concat(keys);
		}

		allKeys = allKeys.filter(function(value, index, array) {
			var unique = array.indexOf(value, index + 1) === -1;
			return unique;
		});

		return {
			items: itemsByKey,
			keys: allKeys
		};
	}

	function getItem(key) {
		key = key && key.toLowerCase();
		var item = index.items[key];
		return item;
	}

	function getAllItems() {
		return index.keys.map(getItem);
	}
};

RESUtils.inList = function(needle, haystack, separator, isCaseSensitive) {
	if (!needle || !haystack) return false;

	separator = separator || ',';

	if (haystack.indexOf(separator) !== -1) {
		var haystacks = haystack.split(separator);
		if (RESUtils.inArray(needle, haystacks, isCaseSensitive)) {
			return true;
		}
	} else {
		if (isCaseSensitive) {
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
RESUtils.rpc = function(moduleID, method, args) {
	if (args && args[args.length - 1] === 'rpc') {
		console.warn('rpc warning: loop.', moduleID, method, args);
		return 'rpc loop suspected';
	}
	var module = modules[moduleID];
	if (!module || typeof module[method] !== 'function') {
		console.warn('rpc error: could not find method.', moduleID, method, args);
		return 'could not find method';
	}

	var sanitized = args ?
		[].concat(JSON.parse(JSON.stringify(args))) :
		[];
	sanitized = sanitized.concat('rpc');

	return module[method].apply(module, sanitized);
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
	var dateString = RESUtils.niceDate(d, usformat);
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

	var tmonth = newdate.getUTCMonth() + 1;
	var tday = newdate.getUTCDate();
	var tyear = newdate.getUTCFullYear();

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
		dmonth += 12;
		dyear--;
	}

	var dday = tday - aday;
	if (dday < 0) {
		if (dmonth > 0) {
			var ma = tmonth - 1;
			// Retrive total number of days in month before tmonth
			// Can think of diff as (dmonth-1) months, and
			// (daysIn(tmonth-1) + tday - aday) days
			dday += m[((ma + 12) - 1) % 12];
			// Months are 0 indexed in array m but 1 indexed for
			// amonth and tmonth. This compensates for that
			dmonth--;
			if (dmonth < 0) {
				dyear--;
				dmonth += 12;
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
		if (obj.hasOwnProperty(prop)) return false;
	}
	return true;
};

RESUtils.createElement = function(elementType, id, classname, textContent) {
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
RESUtils.createElementWithID = RESUtils.createElement; // legacy alias
RESUtils.createElement.toggleButton = function(moduleID, fieldID, enabled, onText, offText, isTable) {
	var thisToggle, toggleOn, toggleOff, field;

	enabled = enabled || false;
	onText = onText || 'on';
	offText = offText || 'off';
	thisToggle = document.createElement('div');
	thisToggle.setAttribute('class', 'toggleButton');
	thisToggle.setAttribute('id', fieldID + 'Container');

	toggleOn = RESUtils.createElement('span', null, 'toggleOn noCtrlF', onText);
	toggleOff = RESUtils.createElement('span', null, 'toggleOff noCtrlF', offText);
	field = RESUtils.createElement('input', fieldID);
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
	thisToggle.addEventListener('click', function() {
		var thisCheckbox = this.querySelector('input[type=checkbox]'),
			enabled = thisCheckbox.checked;
		thisCheckbox.checked = !enabled;
		if (enabled) {
			this.classList.remove('enabled');
		} else {
			this.classList.add('enabled');
		}
		if (moduleID) {
			modules['settingsConsole'].onOptionChange(moduleID, fieldID, enabled, !enabled);
		}
	}, false);
	if (enabled) thisToggle.classList.add('enabled');
	return thisToggle;
};
RESUtils.createElement.commaDelimitedNumber = function(nStr) {
	nStr = typeof nStr === 'string' ? nStr.replace(/[^\w]/, '') : nStr;
	var locale = document.querySelector('html').getAttribute('lang') || 'en';
	return Number(nStr).toLocaleString(locale);
};
RESUtils.createElement.table = function(items, call, context) {
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
RESUtils.initObservers = function() {
	if (RESUtils.pageType() !== 'comments') {
		// initialize sitetable observer...
		const siteTable = RESUtils.thingsContainer();

		if (siteTable) {
			RESUtils.dom.observe(siteTable, { childList: true }, mutation => {
				if ($(mutation.addedNodes[0]).is(RESUtils.thing.containerSelector)) {
					// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
					$(mutation.addedNodes[0]).find('.entry div.expando').each(function() {
						RESUtils.addSelfTextObserver(this);
					});
					RESUtils.watchers.siteTable.forEach(callback => callback(mutation.addedNodes[0]));
				}
			});
		}
	} else {
		// initialize sitetable observer...
		const siteTable = document.querySelector('.commentarea > .sitetable') || document.querySelector('.sitetable');

		if (siteTable) {
			RESUtils.dom.observe(siteTable, { childList: true }, mutation => {
				// handle comment listing pages (not within a post)
				var $container = $(mutation.addedNodes[0]);
				if ($container.is('[id^="siteTable"]')) {
					// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
					$container.find('.entry div.expando').each(function() {
						RESUtils.addSelfTextObserver(this);
					});
					RESUtils.watchers.siteTable.forEach(callback => callback(mutation.addedNodes[0]));
				}

				if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains('thing')) {
					var thing = mutation.addedNodes[0];
					var newCommentEntry = thing.querySelector('.entry');
					if (!$(newCommentEntry).data('alreadyDetected')) {
						$(newCommentEntry).data('alreadyDetected', true);
						$(thing).find('.child').each(function() {
							RESUtils.addNewCommentFormObserver(this);
						});
						RESUtils.watchers.newComments.forEach(callback => callback(newCommentEntry));
					}
				}
			});
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

RESUtils.addNewCommentObserverToTarget = function(e) {
	var ele = $(e.currentTarget).closest('.sitetable')[0];
	// mark this as having an observer so we don't add multiples...
	if (!$(ele).hasClass('hasObserver')) {
		$(ele).addClass('hasObserver');
		RESUtils.addNewCommentObserver(ele);
	}
};
RESUtils.addNewCommentObserver = function(ele) {
	const observer = RESUtils.dom.observe(ele, { childList: true }, mutation => {
		// look at the added nodes, and find comment containers.
		Array.from(mutation.addedNodes).forEach(node => {
			if (node.classList.contains('thing')) {
				const $node = $(node);

				$node.find('.child').each(function() {
					RESUtils.addNewCommentFormObserver(this);
				});

				// check for "load new comments" links within this group as well...
				$node.find('.morecomments a').click(RESUtils.addNewCommentObserverToTarget);

				// look at the comment containers and find actual comments...
				Array.from(node.querySelectorAll('.entry')).forEach(subComment => {
					const $subComment = $(subComment);
					if (!$subComment.data('alreadyDetected')) {
						$subComment.data('alreadyDetected', true);
						RESUtils.watchers.newComments.forEach(callback => callback(subComment));
					}
				});
			}
		});

		// disconnect this observer once all callbacks have been run.
		// unless we have the nestedlisting class, in which case don't disconnect because that's a
		// bottom level load more comments where even more can be loaded after, so they all drop into this
		// same .sitetable div.
		if (!$(ele).hasClass('nestedlisting')) {
			observer.disconnect();
		}
	});
};
RESUtils.addNewCommentFormObserver = function(ele) {
	RESUtils.dom.observe(ele, { childList: true }, mutation => {
		var form = $(mutation.target).children('form');
		if (form.length === 1) {
			RESUtils.watchers.newCommentsForms.forEach(callback => callback(form[0]));
		} else {
			var newOwnComment = $(mutation.target).find(' > div.sitetable > .thing:first-child'); // assumes new comment will be prepended to sitetable's children
			if (newOwnComment.length === 1) {
				// new comment detected from the current user...
				RESUtils.watchers.newComments.forEach(callback => callback(newOwnComment[0]));
			}
		}
		// only the first mutation (legacy behavior)
		return true;
	});
};
RESUtils.addSelfTextObserver = function(ele) {
	RESUtils.dom.observe(ele, { childList: true }, mutation => {
		var form = $(mutation.target).find('form');
		if (form.length) {
			RESUtils.watchers.selfText.forEach(callback => callback(form[0]));
		}
		// only the first mutation (legacy behavior)
		return true;
	});
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

	// Note that link.href will return the full href (which includes the
	// reddit.com domain). We don't want that.
	var href = link.getAttribute('href');

	var emptyText = link.textContent.length === 0;
	var isCommentCode = RESUtils.COMMENT_CODE_REGEX.test(href);

	return emptyText && isCommentCode;
};
RESUtils.isEmptyLink = function(link) {
	// Note that link.href will return the full href (which includes the
	// reddit.com domain). We don't want that.
	var href = link.getAttribute('href');
	return typeof href !== 'string' || href.substring(0, 11) === 'javascript:'; // eslint-disable-line no-script-url
};
// Nearly identical to _.debounce()
RESUtils.debounce = (callback, delay = 300) => {
	let timeout;

	function exec(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(...args), delay);
	}

	exec.cancel = () => clearTimeout(timeout);

	exec.run = (...args) => {
		clearTimeout(timeout);
		callback(...args);
	};

	return exec;
};

/**
 * @typedef {T|Promise<T, E>} MaybePromise
 * @template T, E
 */

/**
 * @typedef {MaybePromise<T, E>|E} Result
 * @template T, E
 */

/**
 * Will accumulate values until `size` elements are accumulated or `delay` milliseconds pass.
 * @template T, V, E
 * @param {function(T[]): MaybePromise<Result<V, E>[], E>} callback
 * Accepts an array of batched values, should return an array of results **in the same order**.
 * If it throws, all promises will be rejected with the same error.
 * If one of the results is an instance of `Error`, the corresponding promise will be rejected with that error.
 * @param {number} size
 * @param {number} delay
 * @returns {function(T): Promise<V, E>} Accepts a single value; returns a promise.
 */
RESUtils.batch = (callback, { size = 100, delay = 250 } = {}) => {
	function* batchAccumulator() {
		const entries = [];
		const promises = [];

		function addPromise() {
			if (entries.length) {
				return new Promise((resolve, reject) => promises.push({ resolve, reject }));
			}
		}

		const timeout = RESUtils.debounce(async () => {
			startNewBatch();
			try {
				const results = await callback(entries) || [];
				promises.forEach(({ resolve, reject }, i) => {
					if (results[i] instanceof Error) reject(results[i]);
					else resolve(results[i]);
				});
			} catch (e) {
				promises.forEach(({ reject }) => reject(e));
			}
		}, delay);

		while (entries.length < size) {
			entries.push(yield addPromise());
			timeout();
		}

		const lastPromise = addPromise();
		timeout.run();
		yield lastPromise;
	}

	let currentBatch;

	function startNewBatch() {
		currentBatch = batchAccumulator();
		currentBatch.next(); // prime the generator, so the first `.next(value)` isn't lost
	}

	startNewBatch();

	return entry => currentBatch.next(entry).value;
};

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
	var counter = 0,
		length = array.length;

	function doChunk() {
		for (var end = Math.min(length, counter + chunkSize); counter < end; counter++) {
			var ret = call(array[counter], counter, array);
			if (ret === false) return;
		}
		if (counter < length) {
			setTimeout(doChunk, delay);
		}
	}
	setTimeout(doChunk, delay);
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
		strValue = elem.currentStyle[property];
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

	var eventHash = RESUtils.hashKeyEvent(event);
	var arrayHash = RESUtils.hashKeyArray(keyArray);
	var matches = (eventHash === arrayHash);

	return matches;
};
RESUtils.hashKeyEvent = function(event) {
	var keyArray = [event.keyCode, event.altKey, event.ctrlKey, event.shiftKey, event.metaKey];

	// this hack is because Firefox differs from other browsers with keycodes for - and =
	if (BrowserDetect.isFirefox()) {
		if (keyArray[0] === 173) {
			keyArray[0] = 189;
		}
		if (keyArray[0] === 61) {
			keyArray[0] = 187;
		}
	}

	return RESUtils.hashKeyArray(keyArray);
};
RESUtils.hashKeyArray = function(keyArray) {
	var length = 5;
	var hash = keyArray[0] * Math.pow(2, length);
	for (var i = 1; i < length; i++) {
		if (keyArray[i]) {
			hash += Math.pow(2, i);
		}
	}
	return hash;
};

RESUtils.string = RESUtils.string || {};

(() => {
	function map(transform) {
		return (strings, ...values) => {
			values = values.map(transform);
			return strings.map((s, i) => s + (values[i] || '')).join('');
		};
	}
	// Template string tag function
	// encodes each interpolated value with encodeURIComponent()
	RESUtils.string.encode = map(encodeURIComponent);

	RESUtils.string.escapeHTML = map(escapeHTML);
})();

RESUtils.insertAfter = function(referenceNode, newNode, verbose) {
	if ((typeof referenceNode === 'undefined') || (referenceNode === null)) {
		if (verbose !== false) {
			console.error('Could not insert node after undefined node', newNode);
		}
	} else if ((typeof referenceNode.parentNode !== 'undefined') && (typeof referenceNode.nextSibling !== 'undefined')) {
		if (referenceNode.parentNode === null) {
			if (verbose !== false) {
				console.error('Could not insert node after parentless node', newNode);
			}
		} else {
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}
	}
};

RESUtils.MINUTE = 1000 * 60;
RESUtils.HOUR = 60 * RESUtils.MINUTE;
RESUtils.DAY = 24 * RESUtils.HOUR;

RESUtils.cssPrefix = function(css) {
	const prefixes = ['-webkit-', '-o-', '-moz-', '-ms-', ''];
	return prefixes.map(pre => pre + css + ';').join('');
};
RESUtils.baseStyleProtection = 'margin: 0 !important; background-color: inherit !important; color: inherit !important; position: relative !important; left: 0 !important; top: 0 !important; max-height: none!important; max-width: none!important; height: auto !important; width: auto !important; visibility: visible !important; overflow: auto !important; text-indent: 0 !important; font-size: 12px !important; float: none !important; opacity: 1 !important;' + RESUtils.cssPrefix('transform: none !important;') + RESUtils.cssPrefix('filter: none !important;');

if (typeof exports === 'object') {
	exports.RESUtils = RESUtils;
	exports.escapeHTML = escapeHTML;
	exports.modules = modules;
	exports.addModule = addModule;
	exports.libraries = libraries;
	exports.addLibrary = addLibrary;
	exports.safeJSON = safeJSON;
	exports.perfTest = perfTest;
}
