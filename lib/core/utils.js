/* eslint-disable no-unused-vars */

import _ from 'lodash';
import { $ } from '../vendor';
import { Thing, bodyClasses, isMatchURL, isPageType, observe, range, string } from '../utils';
import { ajax, storage } from '../environment';
import { isFirefox } from './browserDetect';

const modules = {};
function addModule(moduleID, extend) {
	const base = {
		moduleID,
		moduleName: moduleID,
		category: 'General',
		options: {},
		description: '',
		isEnabled() {
			return this._enabled;
		},
		isMatchURL() {
			return isMatchURL(this.moduleID);
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

				bodyClasses.add(cls);
			});
		}
	};

	let module = extend(base, moduleID);
	module = $.extend(true, base, module);
	modules[moduleID] = module;
	return module;
}

const libraries = {};
function addLibrary(libraryID, moduleID, library) {
	if (typeof moduleID !== 'string') {
		library = moduleID;
		moduleID = undefined;
	}

	if (typeof moduleID === 'string') {
		library.moduleID = moduleID;
	}

	if (typeof library.name === 'undefined') {
		library.name = moduleID;
	}

	if (libraryID && moduleID) {
		libraries[libraryID] = libraries[libraryID] || {};
		libraries[libraryID][moduleID] = library;
	} else if (libraryID) {
		libraries[libraryID] = library;
	}
}

// define common RESUtils - reddit related functions and data that may need to be accessed...
const RESUtils = {};

RESUtils.addCSS = function(css) {
	const style = RESUtils.addStyle(css);
	return {
		remove() {
			style.textContent = '';
			if (style.parentNode) {
				style.parentNode.removeChild(style);
			}
		}
	};
};

RESUtils.loggedInUser = _.once(() => {
	const userLink = document.querySelector('#header-bottom-right > span.user > a');
	return userLink && !userLink.classList.contains('login-required') && userLink.textContent || null;
});
RESUtils.isModeratorAnywhere = _.once(() => !!document.getElementById('modmail'));
RESUtils.loggedInUserHash = _.once(() => {
	const hashEle = document.querySelector('[name=uh]');
	return hashEle && hashEle.value;
});

RESUtils.getUserInfo = (username = RESUtils.loggedInUser(), live = false) => {
	if (!username) {
		throw new Error('getUserInfo: null/undefined username');
	}

	return ajax({
		url: string.encode`/user/${username}/about.json`,
		type: 'json',
		cacheFor: live ? RESUtils.MINUTE : RESUtils.HOUR
	});
};

RESUtils.addStyle = function(css) {
	const style = document.createElement('style');
	style.textContent = css;
	RESUtils.init.await.headReady.then(() => document.head.appendChild(style));

	return style;
};

RESUtils.firstValid = (...vals) =>
	vals.find(val =>
		val !== undefined && val !== null && (typeof val !== 'number' || !isNaN(val))
	);
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

RESUtils.indexOptionTable = function(moduleID, optionKey, keyFieldIndex) {
	const source = modules[moduleID].options[optionKey].value;
	const keyIsList =
		modules[moduleID].options[optionKey].fields[keyFieldIndex].type === 'list' ?
		',' :
		false;
	return RESUtils.indexArrayByProperty(source, keyFieldIndex, keyIsList);
};
RESUtils.indexArrayByProperty = function(source, keyIndex, keyValueSeparator) {
	let index;
	if (!source || !source.length) {
		index = {
			items: [],
			keys: []
		};
	} else {
		index = createIndex();
	}

	Reflect.defineProperty(getItem, 'keys', {
		value: index.keys,
		writeable: false
	});
	Reflect.defineProperty(getItem, 'all', {
		value: getAllItems,
		writeable: false
	});
	return getItem;

	function createIndex() {
		const itemsByKey = {};
		let allKeys = [];

		for (const item of source) {
			const key = item && item[keyIndex];
			if (!key) continue;

			let keys;
			if (keyValueSeparator) {
				keys = key.split(keyValueSeparator);
			} else {
				keys = [key && key];
			}
			for (const k of keys) {
				const key = k.toLowerCase();
				itemsByKey[key] = itemsByKey[key] || [];
				itemsByKey[key].push(item);
			}

			allKeys = allKeys.concat(keys);
		}

		// remove duplicates
		allKeys = allKeys.filter((value, index, array) => array.indexOf(value, index + 1) === -1);

		return {
			items: itemsByKey,
			keys: allKeys
		};
	}

	function getItem(key) {
		key = key && key.toLowerCase();
		return index.items[key];
	}

	function getAllItems() {
		return index.keys.map(getItem);
	}
};

RESUtils.rpc = function(moduleID, method, args) {
	if (args && args[args.length - 1] === 'rpc') {
		console.warn('rpc warning: loop.', moduleID, method, args);
		return 'rpc loop suspected';
	}
	const module = modules[moduleID];
	if (!module || typeof module[method] !== 'function') {
		console.warn('rpc error: could not find method.', moduleID, method, args);
		return 'could not find method';
	}

	const sanitized = args ?
		[].concat(JSON.parse(JSON.stringify(args))) :
		[];

	return module[method](...sanitized, 'rpc');
};
RESUtils.niceKeyCode = function(charCode) {
	let keyComboString = '';
	let testCode, niceString;
	if (typeof charCode === 'string') {
		const tempArray = charCode.split(',');
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

RESUtils.createElement = function(elementType, id, classname, contents) {
	const element = document.createElement(elementType);
	if (id) {
		element.setAttribute('id', id);
	}
	if ((typeof classname !== 'undefined') && classname && (classname !== '')) {
		element.setAttribute('class', classname);
	}
	if (contents) {
		if (contents.jquery) {
			contents.appendTo(element);
		} else if (contents.tagName) {
			element.appendChild(contents);
		} else if (classname && classname.split(' ').indexOf('noCtrlF') !== -1) {
			element.setAttribute('data-text', contents);
		} else {
			element.textContent = contents;
		}
	}
	return element;
};
RESUtils.createElementWithID = RESUtils.createElement; // legacy alias
RESUtils.createElement.toggleButton = function(moduleID, fieldID, enabled, onText, offText, isTable) {
	enabled = enabled || false;
	onText = onText || 'on';
	offText = offText || 'off';
	const thisToggle = document.createElement('div');
	thisToggle.setAttribute('class', 'toggleButton');
	thisToggle.setAttribute('id', `${fieldID}Container`);

	const toggleOn = RESUtils.createElement('span', null, 'toggleOn noCtrlF', onText);
	const toggleOff = RESUtils.createElement('span', null, 'toggleOff noCtrlF', offText);
	const field = RESUtils.createElement('input', fieldID);
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
		const thisCheckbox = this.querySelector('input[type=checkbox]');
		const enabled = thisCheckbox.checked;
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
RESUtils.createElement.icon = function(iconName, tagName, className, title) {
	tagName = tagName || 'span';
	className = className || '';
	iconName = iconName.match(/(\w+)/)[0];
	title = title || '';

	const icon = document.createElement(tagName);
	icon.className = className;
	icon.classList.add('res-icon');
	icon.innerHTML = `&#x${iconName};`; // sanitized above
	icon.setAttribute('title', title);
	return icon;
};
RESUtils.createElement.commaDelimitedNumber = function(nStr) {
	nStr = typeof nStr === 'string' ? nStr.replace(/[^\w]/, '') : nStr;
	const number = Number(nStr);
	// some locales incorrectly use _ as a delimiter
	const locale = (document.documentElement.getAttribute('lang') || 'en').replace('_', '-');
	try {
		return number.toLocaleString(locale);
	} catch (e) {
		return number.toLocaleString('en');
	}
};
RESUtils.createElement.table = function(items, callback) {
	if (!items) throw new Error('items is null/undef');
	if (!callback) throw new Error('callback is null/undef');
	// Sanitize single item into items array
	if (!(items.length && typeof items !== 'string')) items = [items];

	const description = [];
	description.push('<table>');

	items
		.map(callback)
		.forEach(item => {
			if (typeof item === 'string') {
				description.push(item);
			} else if (item.length) {
				description.push(...item);
			}
		});
	description.push('</table>');

	return description.join('\n');
};
RESUtils.initObservers = function() {
	if (!isPageType('comments')) {
		// initialize sitetable observer...
		const siteTable = Thing.thingsContainer();

		if (siteTable) {
			observe(siteTable, { childList: true }, mutation => {
				if ($(mutation.addedNodes[0]).is(Thing.containerSelector)) {
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
			observe(siteTable, { childList: true }, mutation => {
				// handle comment listing pages (not within a post)
				const $container = $(mutation.addedNodes[0]);
				if ($container.is('[id^="siteTable"]')) {
					// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
					$container.find('.entry div.expando').each(function() {
						RESUtils.addSelfTextObserver(this);
					});
					RESUtils.watchers.siteTable.forEach(callback => callback(mutation.addedNodes[0]));
				}

				if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains('thing')) {
					const thing = mutation.addedNodes[0];
					const newCommentEntry = thing.querySelector('.entry');
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
	const ele = $(e.currentTarget).closest('.sitetable')[0];
	// mark this as having an observer so we don't add multiples...
	if (!$(ele).hasClass('hasObserver')) {
		$(ele).addClass('hasObserver');
		RESUtils.addNewCommentObserver(ele);
	}
};
RESUtils.addNewCommentObserver = function(ele) {
	const observer = observe(ele, { childList: true }, mutation => {
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
	observe(ele, { childList: true }, mutation => {
		const form = $(mutation.target).children('form');
		if (form.length === 1) {
			RESUtils.watchers.newCommentsForms.forEach(callback => callback(form[0]));
		} else {
			const newOwnComment = $(mutation.target).find(' > div.sitetable > .thing:first-child'); // assumes new comment will be prepended to sitetable's children
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
	observe(ele, { childList: true }, mutation => {
		const form = $(mutation.target).find('form');
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
		default:
			throw new Error(`Invalid watcher type: ${type}`);
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
	const href = link.getAttribute('href');

	const emptyText = link.textContent.length === 0;
	const isCommentCode = RESUtils.COMMENT_CODE_REGEX.test(href);

	return emptyText && isCommentCode;
};
RESUtils.isEmptyLink = function(link) {
	// Note that link.href will return the full href (which includes the
	// reddit.com domain). We don't want that.
	const href = link.getAttribute('href');
	return typeof href !== 'string' || href.substring(0, 11) === 'javascript:'; // eslint-disable-line no-script-url
};

// utility function for checking events against keyCode arrays
RESUtils.checkKeysForEvent = function(event, keyArray) {
	// [keycode, alt, ctrl, shift, meta]
	// if we've passed in a number, fix that and make it an array with alt, shift and ctrl set to false.
	if (typeof keyArray === 'number') {
		keyArray = [keyArray, false, false, false, false];
	} else if (keyArray.length === 4) {
		keyArray.push(false);
	}

	const eventHash = RESUtils.hashKeyEvent(event);
	const arrayHash = RESUtils.hashKeyArray(keyArray);
	return eventHash === arrayHash;
};
RESUtils.hashKeyEvent = function(event) {
	const keyArray = [event.keyCode, event.altKey, event.ctrlKey, event.shiftKey, event.metaKey];

	// this hack is because Firefox differs from other browsers with keycodes for - and =
	if (isFirefox()) {
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
	const length = 5;
	let hash = keyArray[0] * Math.pow(2, length);
	for (const i of range(1, length)) {
		if (keyArray[i]) {
			hash += 2 ** i;
		}
	}
	return hash;
};

RESUtils.MINUTE = 1000 * 60;
RESUtils.HOUR = 60 * RESUtils.MINUTE;
RESUtils.DAY = 24 * RESUtils.HOUR;
