import { $ } from '../vendor';
import * as Modules from '../core/modules';
import {
	HOUR,
	commaDelimitedNumber,
	loggedInUser,
	niceDate,
	niceDateDiff,
	regexes,
	string,
} from '../utils';
import { ajax } from '../environment';
import * as Dashboard from './dashboard';
import * as FilteReddit from './filteReddit';
import * as Hover from './hover';
import * as SubredditManager from './subredditManager';

export const module = {};

module.moduleID = 'subredditInfo';
module.moduleName = 'Subreddit Info';
module.category = ['Subreddits'];
module.description = 'Adds a hover tooltip to subreddits';
module.options = {
	hoverDelay: {
		type: 'text',
		value: 800,
		description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.',
		advanced: true,
	},
	fadeDelay: {
		type: 'text',
		value: 200,
		description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.',
		advanced: true,
	},
	fadeSpeed: {
		type: 'text',
		value: 0.7,
		description: 'Fade animation\'s speed (in seconds). Default is 0.7.',
		advanced: true,
	},
};

module.go = function() {
	$('body').on('mouseover', 'a.subreddit, a.search-subreddit-link, .md a[href^="/r/"]', handleMouseOver);
};

function handleMouseOver(e) {
	// ensure it's a local link, in case some other website could have /r/ in its URLs.
	if (!e.target.href || !e.target.href.includes(location.hostname) || e.target.textContent.startsWith('self.')) {
		return;
	}
	Hover.infocard(module.moduleID)
		.target(e.target)
		.options({
			width: 450,
			openDelay: module.options.hoverDelay.value,
			fadeDelay: module.options.fadeDelay.value,
			fadeSpeed: module.options.fadeSpeed.value,
		})
		.populateWith(showSubredditInfo)
		.begin();
}

async function showSubredditInfo(obj, context, update) {
	const subreddit = obj.href.match(regexes.subredditPostListing)[1].toLowerCase();
	const header = document.createDocumentFragment();
	const $link = $(string.escapeHTML`<a href="/r/${subreddit}">/r/${subreddit}</a>`);
	header.appendChild($link[0]);

	if (loggedInUser()) {
		const subscribeToggle = $('<span />')
			.attr('id', 'RESHoverInfoSubscriptionButton')
			.addClass('res-fancy-toggle-button')
			.css('margin-left', '12px')
			.hide()
			.on('click', toggleSubscription);
		updateToggleButton(subscribeToggle, false);
		header.appendChild(subscribeToggle[0]);
	}

	update(header);

	let jsonData;

	try {
		jsonData = await ajax({
			url: `/r/${subreddit}/about.json`,
			type: 'json',
			cacheFor: HOUR,
		});
	} catch (e) {
		jsonData = {};
	}

	if (!jsonData || jsonData.kind !== 't5') {
		return [null, 'Subreddit not found'];
	}

	const d = new Date(jsonData.data.created_utc * 1000);

	const $newBody = $(string.escapeHTML`
		<div class="subredditInfoToolTip">
		<div class="subredditLabel">Subreddit created:</div> <div class="subredditDetail">${niceDate(d)} (${niceDateDiff(d)})</div>
		<div class="subredditLabel">Subscribers:</div> <div class="subredditDetail">${commaDelimitedNumber(jsonData.data.subscribers)}</div>
		<div class="subredditLabel">Title:</div> <div class="subredditDetail">${jsonData.data.title}</div>
		<div class="subredditLabel">Over 18:</div> <div class="subredditDetail">${jsonData.data.over18 ? 'Yes' : 'No'}</div>
		<div class="clear"></div><div id="subTooltipButtons" class="bottomButtons">
		<div class="clear"></div>
		</div></div>
	`);

	// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
	if (Modules.isRunning(SubredditManager)) {
		const theSC = document.createElement('span');
		theSC.setAttribute('class', 'res-fancy-toggle-button REStoggle RESshortcut');
		theSC.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
		const idx = SubredditManager.mySubredditShortcuts.findIndex(shortcut => shortcut.subreddit.toLowerCase() === jsonData.data.display_name.toLowerCase());
		if (idx !== -1) {
			theSC.textContent = '-shortcut';
			theSC.setAttribute('title', 'Remove this subreddit from your shortcut bar');
			theSC.classList.add('remove');
		} else {
			theSC.textContent = '+shortcut';
			theSC.setAttribute('title', 'Add this subreddit to your shortcut bar');
		}
		theSC.addEventListener('click', SubredditManager.toggleSubredditShortcut, false);

		$newBody.find('#subTooltipButtons').append(theSC);
	}

	if (Modules.isEnabled(Dashboard)) {
		const dashboardToggle = document.createElement('span');
		dashboardToggle.setAttribute('class', 'res-fancy-toggle-button RESDashboardToggle');
		dashboardToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
		const exists = Dashboard.widgets.some(widget =>
			widget && (widget.basePath.toLowerCase() === `/r/${jsonData.data.display_name.toLowerCase()}`)
		);
		if (exists) {
			dashboardToggle.textContent = '-dashboard';
			dashboardToggle.setAttribute('title', 'Remove this subreddit from your dashboard');
			dashboardToggle.classList.add('remove');
		} else {
			dashboardToggle.textContent = '+dashboard';
			dashboardToggle.setAttribute('title', 'Add this subreddit to your dashboard');
		}
		dashboardToggle.addEventListener('click', Dashboard.toggleDashboard, false);
		$newBody.find('#subTooltipButtons').append(dashboardToggle);
	}

	if (Modules.isEnabled(FilteReddit)) {
		const filterToggle = document.createElement('span');
		filterToggle.setAttribute('class', 'res-fancy-toggle-button RESFilterToggle');
		filterToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
		const filteredReddits = FilteReddit.module.options.subreddits.value;
		const exists = filteredReddits.some(reddit =>
			reddit && (reddit[0].toLowerCase() === jsonData.data.display_name.toLowerCase())
		);
		if (exists) {
			filterToggle.textContent = '-filter';
			filterToggle.setAttribute('title', 'Stop filtering from /r/all and /domain/*');
			filterToggle.classList.add('remove');
		} else {
			filterToggle.textContent = '+filter';
			filterToggle.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
		}
		filterToggle.addEventListener('click', e => {
			const added = FilteReddit.toggleFilter($(e.target).data('subreddit'));

			if (added) {
				e.target.setAttribute('title', 'Stop filtering this subreddit from /r/all and /domain/*');
				e.target.textContent = '-filter';
				e.target.classList.add('remove');
			} else {
				e.target.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
				e.target.textContent = '+filter';
				e.target.classList.remove('remove');
			}
		});
		$newBody.find('#subTooltipButtons').append(filterToggle);
	}

	if (loggedInUser()) {
		const subscribed = !!jsonData.data.user_is_subscriber;
		const $subscribeToggle = $('#RESHoverInfoSubscriptionButton');
		$subscribeToggle.attr('data-subreddit', jsonData.data.display_name.toLowerCase());
		updateToggleButton($subscribeToggle, subscribed);
		$subscribeToggle.fadeIn('fast');
	}

	return [null, $newBody];
}

function updateToggleButton(toggleButton, subscribed) {
	if (toggleButton instanceof $) toggleButton = toggleButton[0];
	const toggleOn = '+subscribe';
	const toggleOff = '-unsubscribe';
	if (subscribed) {
		toggleButton.textContent = toggleOff;
		toggleButton.classList.add('remove');
	} else {
		toggleButton.textContent = toggleOn;
		toggleButton.classList.remove('remove');
	}
}

async function toggleSubscription(e) {
	// Get info
	const subscribeToggle = e.target;
	const subreddit = subscribeToggle.getAttribute('data-subreddit').toLowerCase();
	const { data: subredditData } = await ajax({
		url: `/r/${subreddit}/about.json`,
		type: 'json',
		cacheFor: HOUR,
	});
	const subscribing = !subredditData.user_is_subscriber;

	updateToggleButton(subscribeToggle, subscribing);

	SubredditManager.subscribeToSubreddit(subredditData.name, subscribing);

	// We may have successfully subscribed, so invalidate the cache
	ajax.invalidate({ url: `/r/${subreddit}/about.json` });
}
