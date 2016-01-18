// suppress annoying strict warnings that cfx overrides and turns on
// comment this line out for releases.
// require('sdk/preferences/service').set('javascript.options.strict', false);

// Import the APIs we need.
import { PageMod } from 'sdk/page-mod';
import { Request } from 'sdk/request';
import self from 'sdk/self';
import tabs from 'sdk/tabs';
import ss from 'sdk/simple-storage';
import priv from 'sdk/private-browsing';
import { browserWindows as windows } from 'sdk/windows';
import { viewFor } from 'sdk/view/core';
import { ActionButton } from 'sdk/ui/button/action';

// require chrome allows us to use XPCOM objects...
import { Cc, Ci, Cu, components } from 'chrome';
const historyService = Cc['@mozilla.org/browser/history;1'].getService(Ci.mozIAsyncHistory);

// Cookie manager for new API login
const cookieManager = Cc['@mozilla.org/cookiemanager;1'].getService().QueryInterface(Ci.nsICookieManager2);
components.utils.import('resource://gre/modules/NetUtil.jsm');

// this function takes in a string (and optional charset, paseURI) and creates an nsURI object, which is required by historyService.addURI...
function makeURI(aURL, aOriginCharset, aBaseURI) {
	const ioService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
	return ioService.newURI(aURL, aOriginCharset, aBaseURI);
}

const workers = [];

function onAttach() {
	// prepend to array so the correct worker will be used when navigating forwards
	// but all bets are off for going back (see workerFor() comments)
	workers.unshift(this);
}

function onDetach() {
	const index = workers.indexOf(this);
	if (index !== -1) {
		workers.splice(index, 1);
	}
}

function workerFor(tab) {
	// important: one tab may have many workers associated with it
	// that is, all workers in the tab's history are kept, and only detached when the tab is closed
	// this means that if you visit the same url twice (independently) in one tab, there is no way to tell which worker should be used :(
	const worker = workers.find(({ url, tab: { id } }) => id === tab.id && url === tab.url);
	if (!worker) {
		throw new Error(`Worker not found for tab with id: ${tab.id}, url: ${tab.url}`);
	}
	return worker;
}

const XHRCache = {
	capacity: 250,
	entries: new Map(),
	check(key, maxAge = Infinity) {
		const entry = this.entries.get(key);
		if (entry && (Date.now() - entry.timestamp < maxAge)) {
			entry.hits++;
			return entry.data;
		}
	},
	add(key, value) {
		let hits = 1;

		if (this.entries.has(key)) {
			hits = this.entries.get(key).hits;
		}

		this.entries.set(key, {
			data: value,
			timestamp: Date.now(),
			hits
		});

		if (this.entries.size > this.capacity) {
			this.prune();
		}
	},
	delete(key) {
		this.entries.delete(key);
	},
	prune() {
		const now = Date.now();
		const top = Array.from(this.entries.entries())
			.sort(([, a], [, b]) => {
				const aWeight = a.hits / (now - a.timestamp);
				const bWeight = b.hits / (now - b.timestamp);
				return bWeight - aWeight; // in order of decreasing weight
			})
			.slice(0, (this.capacity / 2) | 0);

		this.entries = new Map(top);
	},
	clear() {
		this.entries.clear();
	}
};

const listeners = new Map();
const waiting = new Map();
let transaction = 0;

/**
 * @callback MessageListener
 * @template T
 * @param {*} data The message data.
 * @param {Worker} worker The worker object of the sender.
 * @returns {T|Promise<T, *>} The response data, optionally wrapped in a promise.
 */

/**
 * Register a listener to be invoked whenever a message of `type` is received.
 * Responses may be sent synchronously or asynchronously:
 * If `callback` returns a non-promise value, a response will be sent synchronously.
 * If `callback` returns a promise, a response will be sent asynchronously when it resolves.
 * If it rejects, an invalid response will be sent to close the message channel.
 * @param {string} type
 * @param {MessageListener} callback
 * @throws {Error} If a listener for `messageType` already exists.
 * @returns {void}
 */
function addListener(type, callback) {
	if (listeners.has(type)) {
		throw new Error(`Listener for message type: ${type} already exists.`);
	}
	listeners.set(type, { callback });
}

/**
 * Send a message to the content script via `worker`.
 * @param {string} type
 * @param {Worker} worker
 * @param {*} [data]
 * @returns {Promise<*, Error>} Rejects if an invalid response is received,
 * resolves with the response data otherwise.
 */
function sendMessage(type, worker, data) {
	++transaction;

	worker.postMessage({ type, data, transaction });

	return new Promise((resolve, reject) => waiting.set(transaction, { resolve, reject }));
}

function onMessage({ type, data, transaction, error, isResponse }) {
	if (isResponse) {
		if (!waiting.has(transaction)) {
			throw new Error(`No response handler for type: ${type}, transaction: ${transaction} - this should never happen.`);
		}

		const handler = waiting.get(transaction);
		waiting.delete(transaction);

		if (error) {
			handler.reject(new Error(`Error in foreground handler for type: ${type} - message: ${error}`));
		} else {
			handler.resolve(data);
		}

		return;
	}

	if (!listeners.has(type)) {
		throw new Error(`Unrecognised message type: ${type}`);
	}
	const listener = listeners.get(type);

	const sendResponse = ({ data, error }) => {
		this.postMessage({ type, data, transaction, error, isResponse: true });
	};

	let response;

	try {
		response = listener.callback(data, this);
	} catch (e) {
		sendResponse({ error: e.message || e });
		throw e;
	}

	if (response instanceof Promise) {
		response
			.then(data => sendResponse({ data }))
			.catch(e => {
				sendResponse({ error: e.message || e });
				throw e;
			});
		return true;
	}
	sendResponse({ data: response });
}

// Listeners

addListener('readResource', filename =>
	self.data.load(filename)
);

addListener('deleteCookies', cookies =>
	cookies.forEach(({ name }) => cookieManager.remove('.reddit.com', name, '/', false))
);

addListener('ajax', ({ method, url, headers, data, credentials }) => {
	// not using async/await here since the polyfill doesn't work with Firefox's backend
	return new Promise(resolve => {
		const request = Request({
			url,
			onComplete: resolve,
			headers: headers,
			content: data
		});
		if (method === 'POST') {
			request.post();
		} else {
			request.get();
		}
	}).then(request => ({
		status: request.status,
		responseText: request.text
	}));
});

addListener('storage', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			try {
				return key in ss.storage ? JSON.parse(ss.storage[key]) : null;
			} catch (e) {
				console.warn('Failed to parse:', key, e);
			}
			return null;
		case 'getRaw':
			return key in ss.storage ? ss.storage[key] : null;
		case 'set':
			ss.storage[key] = JSON.stringify(value);
			break;
		case 'setRaw':
			ss.storage[key] = value;
			break;
		case 'remove':
			delete ss.storage[key];
			break;
		case 'has':
			return key in ss.storage;
		case 'keys':
			return Object.keys(ss.storage);
	}
});

const session = new Map();

addListener('session', ([operation, key, value]) => {
	switch (operation) {
		case 'get':
			return session.get(key);
		case 'set':
			session.set(key, value);
			break;
		case 'delete':
			return session.delete(key);
		case 'clear':
			return session.clear();
	}
});

addListener('XHRCache', ({ operation, key, value, maxAge }) => {
	switch (operation) {
		case 'add':
			return XHRCache.add(key, value);
		case 'check':
			return XHRCache.check(key, maxAge);
		case 'delete':
			return XHRCache.delete(key);
		case 'clear':
			return XHRCache.clear();
	}
});

const pageAction = ActionButton({
	id: 'res-styletoggle',
	label: 'toggle subreddit CSS',
	icon: {
		16: self.data.url('images/css-disabled-small.png'),
		32: self.data.url('images/css-disabled.png')
	},
	disabled: true,
	onClick(state) {
		sendMessage('pageActionClick', workerFor(tabs.activeTab));
	}
});
let destroyed = false;

// since worker state is persisted, the page action state must be refreshed when navigating backwards or forwards
tabs.on('pageshow', tab => tab.url.includes('reddit.com') && sendMessage('pageActionRefresh', workerFor(tab)));

addListener('pageAction', ({ operation, state }, { tab }) => {
	if (destroyed) return;

	switch (operation) {
		case 'show':
			const onOff = state ? 'on' : 'off';
			pageAction.state(tab, {
				disabled: false,
				icon: {
					16: self.data.url(`images/css-${onOff}-small.png`),
					32: self.data.url(`images/css-${onOff}.png`)
				}
			});
			break;
		case 'hide':
			pageAction.state(tab, {
				disabled: true,
				icon: {
					16: self.data.url('images/css-disabled-small.png'),
					32: self.data.url('images/css-disabled.png')
				}
			});
			break;
		case 'destroy':
			pageAction.destroy();
			destroyed = true;
	}
});

addListener('openNewTabs', ({ urls, focusIndex }, { tab }) => {
	const isPrivate = priv.isPrivate(tab);
	const nsWindow = viewFor(tab.window);
	const nsTab = viewFor(tab);
	urls.forEach((url, i) => {
		if ('TreeStyleTabService' in nsWindow) {
			nsWindow.TreeStyleTabService.readyToOpenChildTab(nsTab);
		}
		tabs.open({
			url,
			isPrivate,
			inBackground: i !== focusIndex
		});
	});
});

addListener('isPrivateBrowsing', (request, worker) => priv.isPrivate(worker));

addListener('addURLToHistory', url => {
	historyService.updatePlaces({
		uri: makeURI(url),
		visits: [{
			transitionType: Ci.nsINavHistoryService.TRANSITION_LINK,
			visitDate: Date.now() * 1000
		}]
	});
});

addListener('multicast', (request, worker) => {
	const isPrivate = priv.isPrivate(worker);
	return Promise.all(
		workers
			.filter(w => w !== worker && priv.isPrivate(w) === isPrivate)
			.map(w => sendMessage('multicast', w, request))
	);
});

PageMod({
	include: ['*.reddit.com'],
	contentScriptWhen: 'start',
	contentScriptFile: [
		self.data.url('vendor/polyfill.min.js'),
		self.data.url('vendor/jquery-1.11.3.min.js'),
		self.data.url('vendor/guiders.js'),
		self.data.url('vendor/jquery.sortable-0.9.12.js'),
		self.data.url('vendor/jquery.edgescroll-0.1.js'),
		self.data.url('vendor/jquery-fieldselection.min.js'),
		self.data.url('vendor/favico.js'),
		self.data.url('vendor/jquery.tokeninput.js'),
		self.data.url('vendor/HTMLPasteurizer.js'),
		self.data.url('vendor/snudown.js'),
		self.data.url('core/utils.js'),
		self.data.url('browsersupport.js'),
		self.data.url('browsersupport-firefox.js'),
		self.data.url('core/options.js'),
		self.data.url('core/alert.js'),
		self.data.url('core/migrate.js'),
		self.data.url('core/template.js'),
		self.data.url('vendor/konami.js'),
		self.data.url('vendor/gfycat.js'),
		self.data.url('vendor/gifyoutube.js'),
		self.data.url('vendor/imgurgifv.js'),
		self.data.url('vendor/hogan-3.0.2.js'),
		self.data.url('reddit_enhancement_suite.user.js'),
		self.data.url('modules/spoilerTags.js'),
		self.data.url('modules/submitIssue.js'),
		self.data.url('modules/betteReddit.js'),
		self.data.url('modules/userTagger.js'),
		self.data.url('modules/keyboardNav.js'),
		self.data.url('modules/commandLine.js'),
		self.data.url('modules/messageMenu.js'),
		self.data.url('modules/easterEgg.js'),
		self.data.url('modules/pageNavigator.js'),
		self.data.url('modules/userInfo.js'),
		self.data.url('modules/presets.js'),
		self.data.url('modules/onboarding.js'),
		self.data.url('modules/customToggles.js'),
		self.data.url('modules/floater.js'),
		self.data.url('modules/orangered.js'),
		self.data.url('modules/announcements.js'),
		self.data.url('modules/selectedEntry.js'),
		self.data.url('modules/settingsConsole.js'),
		self.data.url('modules/menu.js'),
		self.data.url('modules/about.js'),
		self.data.url('modules/hover.js'),
		self.data.url('modules/subredditTagger.js'),
		self.data.url('modules/singleClick.js'),
		self.data.url('modules/commentPreview.js'),
		self.data.url('modules/commentTools.js'),
		self.data.url('modules/sourceSnudown.js'),
		self.data.url('modules/usernameHider.js'),
		self.data.url('modules/showImages.js'),
		self.data.url('modules/showKarma.js'),
		self.data.url('modules/hideChildComments.js'),
		self.data.url('modules/showParent.js'),
		self.data.url('modules/neverEndingReddit.js'),
		self.data.url('modules/saveComments.js'),
		self.data.url('modules/userHighlight.js'),
		self.data.url('modules/nightMode.js'),
		self.data.url('modules/styleTweaks.js'),
		self.data.url('modules/stylesheet.js'),
		self.data.url('modules/userbarHider.js'),
		self.data.url('modules/accountSwitcher.js'),
		self.data.url('modules/filteReddit.js'),
		self.data.url('modules/newCommentCount.js'),
		self.data.url('modules/spamButton.js'),
		self.data.url('modules/commentNavigator.js'),
		self.data.url('modules/subredditManager.js'),
		self.data.url('modules/RESTips.js'),
		self.data.url('modules/settingsNavigation.js'),
		self.data.url('modules/dashboard.js'),
		self.data.url('modules/notifications.js'),
		self.data.url('modules/subredditInfo.js'),
		self.data.url('modules/commentHidePersistor.js'),
		self.data.url('modules/troubleshooter.js'),
		self.data.url('modules/backupAndRestore.js'),
		self.data.url('modules/localDate.js'),
		self.data.url('modules/context.js'),
		self.data.url('modules/noParticipation.js'),
		self.data.url('modules/searchHelper.js'),
		self.data.url('modules/submitHelper.js'),
		self.data.url('modules/logoLink.js'),
		self.data.url('modules/voteEnhancements.js'),
		self.data.url('modules/upload.js'),
		self.data.url('modules/tableTools.js'),
		self.data.url('modules/modhelper.js'),
		self.data.url('modules/quickMessage.js'),
		self.data.url('modules/hosts/imgur.js'),
		self.data.url('modules/hosts/twitter.js'),
		self.data.url('modules/hosts/futurism.js'),
		self.data.url('modules/hosts/gfycat.js'),
		self.data.url('modules/hosts/gifyoutube.js'),
		self.data.url('modules/hosts/vidble.js'),
		self.data.url('modules/hosts/fitbamob.js'),
		self.data.url('modules/hosts/giflike.js'),
		self.data.url('modules/hosts/ctrlv.js'),
		self.data.url('modules/hosts/snag.js'),
		self.data.url('modules/hosts/picshd.js'),
		self.data.url('modules/hosts/minus.js'),
		self.data.url('modules/hosts/fiveHundredPx.js'),
		self.data.url('modules/hosts/flickr.js'),
		self.data.url('modules/hosts/steampowered.js'),
		self.data.url('modules/hosts/deviantart.js'),
		self.data.url('modules/hosts/tumblr.js'),
		self.data.url('modules/hosts/memecrunch.js'),
		self.data.url('modules/hosts/imgflip.js'),
		self.data.url('modules/hosts/livememe.js'),
		self.data.url('modules/hosts/makeameme.js'),
		self.data.url('modules/hosts/memegen.js'),
		self.data.url('modules/hosts/redditbooru.js'),
		self.data.url('modules/hosts/youtube.js'),
		self.data.url('modules/hosts/vimeo.js'),
		self.data.url('modules/hosts/soundcloud.js'),
		self.data.url('modules/hosts/clyp.js'),
		self.data.url('modules/hosts/memedad.js'),
		self.data.url('modules/hosts/ridewithgps.js'),
		self.data.url('modules/hosts/photobucket.js'),
		self.data.url('modules/hosts/giphy.js'),
		self.data.url('modules/hosts/streamable.js'),
		self.data.url('modules/hosts/raddit.js'),
		self.data.url('modules/hosts/pastebin.js'),
		self.data.url('modules/hosts/github.js'),
		self.data.url('modules/hosts/onedrive.js'),
		self.data.url('modules/hosts/oddshot.js'),
		self.data.url('core/init.js')
	],
	contentStyleFile: [
		self.data.url('css/res.css'),
		self.data.url('vendor/players.css'),
		self.data.url('vendor/guiders.css'),
		self.data.url('vendor/tokenize.css')
	],
	onAttach(worker) {
		onAttach.call(worker);
		worker.on('detach', onDetach);
		worker.on('message', onMessage);
	}
});
