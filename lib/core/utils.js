/* eslint-disable no-unused-vars */

import _ from 'lodash';
import { $ } from '../vendor';
import { Thing, bodyClasses, isMatchURL, isPageType, observe, range, string } from '../utils';
import { storage } from 'environment';

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

RESUtils.firstValid = (...vals) =>
	vals.find(val =>
		val !== undefined && val !== null && (typeof val !== 'number' || !isNaN(val))
	);

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

RESUtils.MINUTE = 1000 * 60;
RESUtils.HOUR = 60 * RESUtils.MINUTE;
RESUtils.DAY = 24 * RESUtils.HOUR;
