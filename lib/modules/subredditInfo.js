/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	HOUR,
	downcast,
	formatDate,
	formatDateDiff,
	formatNumber,
	loggedInUser,
	regexes,
	string,
} from '../utils';
import type { RedditSubreddit } from '../types/reddit';
import { ajax, i18n } from '../environment';
import * as Dashboard from './dashboard';
import * as FilteReddit from './filteReddit';
import * as Hover from './hover';
import * as SubredditManager from './subredditManager';

export const module: Module<*> = new Module('subredditInfo');

module.moduleName = 'subredditInfoName';
module.category = 'subredditsCategory';
module.description = 'subredditInfoDesc';
module.options = {
	requireDirectLink: {
		title: 'subredditInfoRequireDirectLinkTitle',
		type: 'boolean',
		value: true,
		description: 'subredditInfoRequireDirectLinkDesc',
	},
	hoverDelay: {
		title: 'subredditInfoHoverDelayTitle',
		type: 'text',
		value: '800',
		description: 'subredditInfoHoverDelayDesc',
		advanced: true,
	},
	fadeDelay: {
		title: 'subredditInfoFadeDelayTitle',
		type: 'text',
		value: '200',
		description: 'subredditInfoFadeDelayDesc',
		advanced: true,
	},
	fadeSpeed: {
		title: 'subredditInfoFadeSpeedTitle',
		type: 'text',
		value: '0.7',
		description: 'subredditInfoFadeSpeedDesc',
		advanced: true,
	},
};

module.go = () => {
	const linkSelector = [
		'a.subreddit',
		'a.search-subreddit-link',
		'.md a[href^="/r/"]',
		'.Post a[href^="/r/"]:not([href*="/comments/"])',
		'.Comment a[href^="/r/"]:not([href*="/comments/"])',
		'a[data-click-id="subreddit"]',
		!module.options.requireDirectLink.value && '.md a[href*="reddit.com/r/"]',
	].filter(x => x).join(', ');

	$(document.body).on('mouseenter', linkSelector, handleMouseEnter);
};

function handleMouseEnter(e: Event) {
	const target = downcast(e.target, HTMLAnchorElement);
	const match = regexes.subreddit.exec(target.pathname);
	if (!match) return;

	const [, subreddit] = match;

	Hover.infocard(module.moduleID)
		.target(target)
		.options({
			width: 450,
			openDelay: parseFloat(module.options.hoverDelay.value),
			fadeDelay: parseFloat(module.options.fadeDelay.value),
			fadeSpeed: parseFloat(module.options.fadeSpeed.value),
		})
		.populateWith(card => showSubredditInfo(card, subreddit))
		.begin();
}

async function showSubredditInfo(card, subreddit) {
	const header = string.html`<div><a href="/r/${subreddit}">/r/${subreddit}</a></div>`;

	if (loggedInUser()) {
		const subscribeToggle = $('<span />')
			.attr('id', 'RESHoverInfoSubscriptionButton')
			.addClass('res-fancy-toggle-button')
			.css('margin-left', '12px')
			.hide()
			.on('click', toggleSubscription);
		updateToggleButton(subscribeToggle[0], false);
		header.appendChild(subscribeToggle[0]);
	}

	card.populate([header]);

	let jsonData;
	try {
		jsonData = (await ajax({
			url: `/r/${subreddit.toLowerCase()}/about.json`,
			type: 'json',
			cacheFor: HOUR,
		}): RedditSubreddit);
	} catch (e) {
		return [null, i18n('subredditInfoErrorLoadingSubredditInfo')];
	}

	if (jsonData.kind !== 't5') {
		return [null, i18n('subredditInfoSubredditNotFound')];
	}

	const d = new Date(jsonData.data.created_utc * 1000);

	const $newBody = $(string.html`
		<div class="subredditInfoToolTip">
			<div class="subredditLabel">${i18n('subredditInfoSubredditCreated')}</div> <div class="subredditDetail">${formatDate(d)} (${formatDateDiff(d)})</div>
			<div class="subredditLabel">${i18n('subredditInfoSubscribers')}</div> <div class="subredditDetail">${formatNumber(jsonData.data.subscribers)}</div>
			<div class="subredditLabel">${i18n('subredditInfoTitle')}</div> <div class="subredditDetail">${jsonData.data.title}</div>
			<div class="subredditLabel">${i18n('subredditInfoOver18')}</div> <div class="subredditDetail">${jsonData.data.over18 ? i18n('yes') : i18n('no')}</div>
			<div class="clear"></div>
			<div id="subTooltipButtons" class="bottomButtons">
				<div class="clear"></div>
			</div>
		</div>
	`);

	// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
	if (Modules.isRunning(SubredditManager)) {
		const theSC = document.createElement('span');
		theSC.setAttribute('class', 'res-fancy-toggle-button REStoggle RESshortcut');
		theSC.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
		const idx = SubredditManager.mySubredditShortcuts.findIndex(shortcut => shortcut.subreddit.toLowerCase() === jsonData.data.display_name.toLowerCase());
		if (idx !== -1) {
			theSC.textContent = `-${i18n('subredditInfoAddRemoveShortcut')}`;
			theSC.setAttribute('title', i18n('subredditInfoRemoveThisSubredditFromShortcuts'));
			theSC.classList.add('remove');
		} else {
			theSC.textContent = `+${i18n('subredditInfoAddRemoveShortcut')}`;
			theSC.setAttribute('title', i18n('subredditInfoAddThisSubredditToShortcuts'));
		}
		theSC.addEventListener('click', SubredditManager.toggleSubredditShortcut);

		$newBody.find('#subTooltipButtons').append(theSC);
	}

	if (Modules.isEnabled(Dashboard)) {
		const dashboardToggle = document.createElement('span');
		dashboardToggle.setAttribute('class', 'res-fancy-toggle-button RESDashboardToggle');
		dashboardToggle.setAttribute('data-subreddit', jsonData.data.display_name.toLowerCase());
		const exists = Dashboard.subredditWidgetExists(jsonData.data.display_name);
		if (exists) {
			dashboardToggle.textContent = `-${i18n('subredditInfoAddRemoveDashboard')}`;
			dashboardToggle.setAttribute('title', i18n('subredditInfoRemoveThisSubredditFromDashboard'));
			dashboardToggle.classList.add('remove');
		} else {
			dashboardToggle.textContent = `+${i18n('subredditInfoAddRemoveDashboard')}`;
			dashboardToggle.setAttribute('title', i18n('subredditInfoAddThisSubredditToDashboard'));
		}
		dashboardToggle.addEventListener('click', Dashboard.toggleDashboard);
		$newBody.find('#subTooltipButtons').append(dashboardToggle);
	}

	if (Modules.isEnabled(FilteReddit)) {
		const filterToggle = document.createElement('span');
		filterToggle.setAttribute('class', 'res-fancy-toggle-button RESFilterToggle');
		const updateButton = () => {
			filterToggle.classList.remove('remove');
			if (FilteReddit.listFilters.subreddits.includesString(subreddit)) {
				filterToggle.textContent = `-${i18n('subredditInfoAddRemoveFilter')}`;
				filterToggle.setAttribute('title', i18n('subredditInfoStopFilteringFromAllAndDomain'));
				filterToggle.classList.add('remove');
			} else {
				filterToggle.textContent = `+${i18n('subredditInfoAddRemoveFilter')}`;
				filterToggle.setAttribute('title', i18n('subredditInfoFilterFromAllAndDomain'));
			}
		};
		filterToggle.addEventListener('click', () => {
			FilteReddit.listFilters.subreddits.toggleString(subreddit);
			updateButton();
		});
		updateButton();
		$newBody.find('#subTooltipButtons').append(filterToggle);
	}

	if (loggedInUser()) {
		const subscribed = !!jsonData.data.user_is_subscriber;
		const $subscribeToggle = $('#RESHoverInfoSubscriptionButton');
		$subscribeToggle.attr('data-subreddit', jsonData.data.display_name.toLowerCase());
		updateToggleButton($subscribeToggle[0], subscribed);
		if (Modules.isEnabled(SubredditManager)) {
			$subscribeToggle.after(await SubredditManager.getMultiCounts(jsonData.data.display_name));
		}
		$subscribeToggle.fadeIn('fast');
	}

	return [null, $newBody];
}

function updateToggleButton(toggleButton, subscribed) {
	if (subscribed) {
		toggleButton.textContent = `-${i18n('subredditInfoUnsubscribe')}`;
		toggleButton.classList.add('remove');
	} else {
		toggleButton.textContent = `+${i18n('subredditInfoSubscribe')}`;
		toggleButton.classList.remove('remove');
	}
}

async function toggleSubscription(e: Event) {
	// Get info
	const subscribeToggle = e.target;
	const subreddit = subscribeToggle.getAttribute('data-subreddit').toLowerCase();
	const { data: subredditData } = (await ajax({
		url: `/r/${subreddit}/about.json`,
		type: 'json',
		cacheFor: HOUR,
	}): RedditSubreddit);
	const subscribing = !subredditData.user_is_subscriber;

	updateToggleButton(subscribeToggle, subscribing);

	SubredditManager.subscribeToSubreddit(subredditData.name, subscribing);

	// We may have successfully subscribed, so invalidate the cache
	ajax.invalidate({ url: `/r/${subreddit}/about.json` });
}
